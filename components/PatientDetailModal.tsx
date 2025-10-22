'use client'

import { useState, useEffect } from 'react'
import { TriageTag, TriageCategories } from '@/lib/types'
import { formatDateTime, formatShortDateTime } from '@/lib/utils/date-formatter'
import { createClient } from '@/lib/supabase/client'
import VoiceInput from '@/components/VoiceInput'

interface PatientDetailModalProps {
  tag: TriageTag | null
  onClose: () => void
  onUpdate?: (updatedTag: TriageTag) => void // 更新後のコールバック
  actions?: React.ReactNode // アクションボタンをカスタマイズ可能
}

export default function PatientDetailModal({ tag, onClose, onUpdate, actions }: PatientDetailModalProps) {
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedTag, setEditedTag] = useState<TriageTag | null>(tag)

  const supabase = createClient()

  // tagが変更されたときにeditedTagを更新
  useEffect(() => {
    if (tag) {
      setEditedTag(tag)
      setIsEditing(false)
    }
  }, [tag])

  if (!tag || !editedTag) return null

  const category = editedTag.triage_category.final
  const categoryInfo = TriageCategories[category]

  // undefinedをnullに変換するヘルパー関数
  const replaceUndefinedWithNull = (obj: any): any => {
    if (obj === undefined) return null
    if (obj === null) return null
    if (typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return obj.map(replaceUndefinedWithNull)

    const result: any = {}
    for (const key in obj) {
      result[key] = replaceUndefinedWithNull(obj[key])
    }
    return result
  }

  // 保存処理
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // undefinedをnullに変換
      const updateData = {
        patient_info: replaceUndefinedWithNull(editedTag.patient_info),
        vital_signs: replaceUndefinedWithNull(editedTag.vital_signs),
        chief_complaint: editedTag.chief_complaint
          ? replaceUndefinedWithNull(editedTag.chief_complaint)
          : null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('triage_tags')
        .update(updateData)
        .eq('id', editedTag.id)

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

      alert('患者情報を更新しました')
      setIsEditing(false)
      if (onUpdate) {
        onUpdate(editedTag)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー'
      console.error('Save error:', error)
      alert(`更新に失敗しました\n\nエラー: ${errorMessage}`)
    } finally {
      setIsSaving(false)
    }
  }

  // キャンセル処理
  const handleCancel = () => {
    setEditedTag(tag)
    setIsEditing(false)
  }

  return (
    <>
      {/* 画像拡大表示モーダル */}
      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <button
            onClick={() => setEnlargedImage(null)}
            className="fixed top-4 right-4 text-white hover:text-gray-300 text-5xl font-bold z-[70]"
          >
            ×
          </button>
          <img
            src={enlargedImage}
            alt="拡大画像"
            className="max-w-full max-h-[95vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <span className={`px-6 py-3 rounded-lg font-bold text-xl ${categoryInfo.color} ${categoryInfo.textColor}`}>
              {editedTag.tag_number}
            </span>
            <div>
              <h2 className="text-2xl font-bold">{categoryInfo.label}</h2>
              <p className="text-sm text-gray-600">患者ID: {editedTag.anonymous_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                編集
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl font-bold">
              ×
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* 患者基本情報 */}
          <section>
            <h3 className="text-lg font-bold mb-3 border-b pb-2">患者基本情報</h3>
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">年齢</label>
                  <input
                    type="number"
                    value={editedTag.patient_info?.age || ''}
                    onChange={(e) => setEditedTag({
                      ...editedTag,
                      patient_info: {
                        ...editedTag.patient_info,
                        age: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="年齢"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">性別</label>
                  <select
                    value={editedTag.patient_info?.sex || 'unknown'}
                    onChange={(e) => setEditedTag({
                      ...editedTag,
                      patient_info: {
                        ...editedTag.patient_info,
                        sex: e.target.value as 'male' | 'female' | 'unknown'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="unknown">不明</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">身長 (cm)</label>
                  <input
                    type="number"
                    value={editedTag.patient_info?.height || ''}
                    onChange={(e) => setEditedTag({
                      ...editedTag,
                      patient_info: {
                        ...editedTag.patient_info,
                        height: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="身長"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">体重 (kg)</label>
                  <input
                    type="number"
                    value={editedTag.patient_info?.weight || ''}
                    onChange={(e) => setEditedTag({
                      ...editedTag,
                      patient_info: {
                        ...editedTag.patient_info,
                        weight: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="体重"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {editedTag.patient_info?.age && (
                  <div>
                    <p className="text-sm text-gray-600">年齢</p>
                    <p className="font-semibold">{editedTag.patient_info.age}歳</p>
                  </div>
                )}
                {editedTag.patient_info?.sex && (
                  <div>
                    <p className="text-sm text-gray-600">性別</p>
                    <p className="font-semibold">
                      {editedTag.patient_info.sex === 'male' ? '男性' : editedTag.patient_info.sex === 'female' ? '女性' : 'その他'}
                    </p>
                  </div>
                )}
                {editedTag.patient_info?.height && (
                  <div>
                    <p className="text-sm text-gray-600">身長</p>
                    <p className="font-semibold">{editedTag.patient_info.height}cm</p>
                  </div>
                )}
                {editedTag.patient_info?.weight && (
                  <div>
                    <p className="text-sm text-gray-600">体重</p>
                    <p className="font-semibold">{editedTag.patient_info.weight}kg</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* バイタルサイン */}
          <section>
            <h3 className="text-lg font-bold mb-3 border-b pb-2">バイタルサイン</h3>
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">収縮期血圧 (mmHg)</label>
                  <input
                    type="number"
                    value={typeof editedTag.vital_signs.blood_pressure === 'object'
                      ? editedTag.vital_signs.blood_pressure?.systolic || ''
                      : ''}
                    onChange={(e) => {
                      const systolic = e.target.value ? parseInt(e.target.value) : undefined
                      const diastolic = typeof editedTag.vital_signs.blood_pressure === 'object'
                        ? editedTag.vital_signs.blood_pressure?.diastolic
                        : undefined
                      setEditedTag({
                        ...editedTag,
                        vital_signs: {
                          ...editedTag.vital_signs,
                          blood_pressure: systolic && diastolic ? { systolic, diastolic } : undefined
                        }
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="収縮期"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">拡張期血圧 (mmHg)</label>
                  <input
                    type="number"
                    value={typeof editedTag.vital_signs.blood_pressure === 'object'
                      ? editedTag.vital_signs.blood_pressure?.diastolic || ''
                      : ''}
                    onChange={(e) => {
                      const diastolic = e.target.value ? parseInt(e.target.value) : undefined
                      const systolic = typeof editedTag.vital_signs.blood_pressure === 'object'
                        ? editedTag.vital_signs.blood_pressure?.systolic
                        : undefined
                      setEditedTag({
                        ...editedTag,
                        vital_signs: {
                          ...editedTag.vital_signs,
                          blood_pressure: systolic && diastolic ? { systolic, diastolic } : undefined
                        }
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="拡張期"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">心拍数 (bpm)</label>
                  <input
                    type="number"
                    value={editedTag.vital_signs.heart_rate || ''}
                    onChange={(e) => setEditedTag({
                      ...editedTag,
                      vital_signs: {
                        ...editedTag.vital_signs,
                        heart_rate: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="心拍数"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">呼吸数 (/min)</label>
                  <input
                    type="number"
                    value={editedTag.vital_signs.respiratory_rate || ''}
                    onChange={(e) => setEditedTag({
                      ...editedTag,
                      vital_signs: {
                        ...editedTag.vital_signs,
                        respiratory_rate: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="呼吸数"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={editedTag.vital_signs.spo2 || ''}
                    onChange={(e) => setEditedTag({
                      ...editedTag,
                      vital_signs: {
                        ...editedTag.vital_signs,
                        spo2: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="SpO2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">体温 (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editedTag.vital_signs.temperature || ''}
                    onChange={(e) => setEditedTag({
                      ...editedTag,
                      vital_signs: {
                        ...editedTag.vital_signs,
                        temperature: e.target.value ? parseFloat(e.target.value) : undefined
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="体温"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">意識レベル</label>
                  <input
                    type="text"
                    value={editedTag.vital_signs.consciousness_level || ''}
                    onChange={(e) => setEditedTag({
                      ...editedTag,
                      vital_signs: {
                        ...editedTag.vital_signs,
                        consciousness_level: e.target.value || undefined
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="意識レベル"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {editedTag.vital_signs.blood_pressure && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">血圧</p>
                    <p className="font-semibold text-lg">
                      {typeof editedTag.vital_signs.blood_pressure === 'string'
                        ? editedTag.vital_signs.blood_pressure
                        : `${editedTag.vital_signs.blood_pressure.systolic}/${editedTag.vital_signs.blood_pressure.diastolic}`
                      } mmHg
                    </p>
                  </div>
                )}
                {editedTag.vital_signs.heart_rate && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">心拍数</p>
                    <p className="font-semibold text-lg">{editedTag.vital_signs.heart_rate} bpm</p>
                  </div>
                )}
                {editedTag.vital_signs.respiratory_rate && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">呼吸数</p>
                    <p className="font-semibold text-lg">{editedTag.vital_signs.respiratory_rate} /min</p>
                  </div>
                )}
                {editedTag.vital_signs.spo2 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">SpO2</p>
                    <p className="font-semibold text-lg">{editedTag.vital_signs.spo2}%</p>
                  </div>
                )}
                {editedTag.vital_signs.consciousness_level && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">意識レベル</p>
                    <p className="font-semibold text-lg">{editedTag.vital_signs.consciousness_level}</p>
                  </div>
                )}
                {editedTag.vital_signs.temperature && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">体温</p>
                    <p className="font-semibold text-lg">{editedTag.vital_signs.temperature}°C</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* トリアージ評価 */}
          <section>
            <h3 className="text-lg font-bold mb-3 border-b pb-2">トリアージ評価</h3>
            <div className="space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">START法評価ステップ</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold min-w-[120px]">歩行可能:</span>
                    <span>{editedTag.triage_category.start_steps?.can_walk ? 'はい' : 'いいえ'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold min-w-[120px]">呼吸:</span>
                    <span>{editedTag.triage_category.start_steps?.breathing ? '正常' : '異常または停止'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold min-w-[120px]">循環:</span>
                    <span>{editedTag.triage_category.start_steps?.circulation ? '正常' : '異常'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold min-w-[120px]">意識:</span>
                    <span>{editedTag.triage_category.start_steps?.consciousness ? '清明' : '混濁'}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">判定理由</p>
                <p className="bg-gray-50 p-3 rounded-lg">{editedTag.triage_category.reasoning || '記載なし'}</p>
              </div>
            </div>
          </section>

          {/* 主訴・症状 */}
          <section>
            <h3 className="text-lg font-bold mb-3 border-b pb-2">主訴・症状</h3>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">主訴</label>
                  <textarea
                    value={editedTag.chief_complaint?.primary || ''}
                    onChange={(e) => setEditedTag({
                      ...editedTag,
                      chief_complaint: {
                        primary: e.target.value,
                        symptoms: editedTag.chief_complaint?.symptoms,
                        notes: editedTag.chief_complaint?.notes
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="主訴を入力"
                  />
                  <div className="mt-2">
                    <VoiceInput
                      onTranscript={(text) => setEditedTag({
                        ...editedTag,
                        chief_complaint: {
                          primary: editedTag.chief_complaint?.primary
                            ? `${editedTag.chief_complaint.primary} ${text}`
                            : text,
                          symptoms: editedTag.chief_complaint?.symptoms,
                          notes: editedTag.chief_complaint?.notes
                        }
                      })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">備考</label>
                  <textarea
                    value={editedTag.chief_complaint?.notes || ''}
                    onChange={(e) => setEditedTag({
                      ...editedTag,
                      chief_complaint: {
                        primary: editedTag.chief_complaint?.primary || '',
                        symptoms: editedTag.chief_complaint?.symptoms,
                        notes: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="備考を入力"
                  />
                  <div className="mt-2">
                    <VoiceInput
                      onTranscript={(text) => setEditedTag({
                        ...editedTag,
                        chief_complaint: {
                          primary: editedTag.chief_complaint?.primary || '',
                          symptoms: editedTag.chief_complaint?.symptoms,
                          notes: editedTag.chief_complaint?.notes
                            ? `${editedTag.chief_complaint.notes} ${text}`
                            : text
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            ) : editedTag.chief_complaint ? (
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">主訴</p>
                  <p className="bg-gray-50 p-3 rounded-lg">{editedTag.chief_complaint.primary}</p>
                </div>
                {editedTag.chief_complaint.symptoms && editedTag.chief_complaint.symptoms.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">症状</p>
                    <div className="flex flex-wrap gap-2">
                      {editedTag.chief_complaint.symptoms.map((symptom, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {editedTag.chief_complaint.notes && (
                  <div>
                    <p className="text-sm text-gray-600">備考</p>
                    <p className="bg-gray-50 p-3 rounded-lg">{editedTag.chief_complaint.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">記載なし</p>
            )}
          </section>

          {/* 処置履歴 */}
          {editedTag.treatments && editedTag.treatments.length > 0 && (
            <section>
              <h3 className="text-lg font-bold mb-3 border-b pb-2">処置履歴</h3>
              <div className="space-y-3">
                {editedTag.treatments.map((treatment, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold text-blue-600">
                        {treatment.type === 'hemostasis' ? '止血' :
                         treatment.type === 'airway' ? '気道確保' :
                         treatment.type === 'fixation' ? '固定' :
                         treatment.type === 'oxygen' ? '酸素投与' : 'その他'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(treatment.performed_at)}
                      </span>
                    </div>
                    <p className="text-sm">{treatment.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 添付画像 */}
          {editedTag.attachments?.images && editedTag.attachments.images.length > 0 && (
            <section>
              <h3 className="text-lg font-bold mb-3 border-b pb-2">
                添付画像（{editedTag.attachments.images.length}枚）
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {editedTag.attachments.images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={`添付画像 ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition"
                      onClick={() => setEnlargedImage(image.url)}
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded pointer-events-none">
                      {image.type === 'wound' ? '外傷' :
                       image.type === 'scene' ? '現場' :
                       image.type === 'body_diagram' ? '身体図' : 'その他'}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded pointer-events-none">
                      {formatShortDateTime(image.taken_at)}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition rounded-lg flex items-center justify-center pointer-events-none">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition font-bold">
                        クリックで拡大
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 搬送情報 */}
          <section>
            <h3 className="text-lg font-bold mb-3 border-b pb-2">搬送情報</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 min-w-[100px]">搬送状態:</span>
                <span className={`font-semibold ${
                  editedTag.transport.status === 'completed' ? 'text-green-600' :
                  editedTag.transport.status === 'in_transit' ? 'text-blue-600' :
                  editedTag.transport.status === 'preparing' ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {editedTag.transport.status === 'not_transported' ? '未搬送' :
                   editedTag.transport.status === 'preparing' ? '搬送準備中' :
                   editedTag.transport.status === 'in_transit' ? '搬送中' :
                   editedTag.transport.status === 'completed' ? '搬送完了' : '不明'}
                </span>
              </div>
              {editedTag.transport.destination && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 min-w-[100px]">搬送先:</span>
                    <span className="font-semibold">{editedTag.transport.destination.hospital_name}</span>
                  </div>
                  {editedTag.transport.destination.department && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 min-w-[100px]">診療科:</span>
                      <span>{editedTag.transport.destination.department}</span>
                    </div>
                  )}
                </>
              )}
              {editedTag.transport.departure_time && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 min-w-[100px]">出発時刻:</span>
                  <span>{formatDateTime(editedTag.transport.departure_time)}</span>
                </div>
              )}
              {editedTag.transport.arrival_time && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 min-w-[100px]">到着時刻:</span>
                  <span>{formatDateTime(editedTag.transport.arrival_time)}</span>
                </div>
              )}
            </div>
          </section>

          {/* 位置情報 */}
          <section>
            <h3 className="text-lg font-bold mb-3 border-b pb-2">位置情報</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              {editedTag.location.contact_point && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-300">
                  <span className="text-sm text-gray-600 min-w-[80px]">接触地点:</span>
                  <span className="font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded">
                    {editedTag.location.contact_point}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 min-w-[80px]">位置:</span>
                <a
                  href={`https://www.google.com/maps?q=${editedTag.location.latitude},${editedTag.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline font-mono text-sm hover:bg-blue-50 px-2 py-1 rounded transition"
                >
                  {editedTag.location.latitude.toFixed(6)}, {editedTag.location.longitude.toFixed(6)}
                </a>
              </div>
              {editedTag.location.address && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 min-w-[80px]">住所:</span>
                  <span>{editedTag.location.address}</span>
                </div>
              )}
            </div>
          </section>

          {/* 監査情報 */}
          <section>
            <h3 className="text-lg font-bold mb-3 border-b pb-2">監査情報</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 min-w-[100px]">作成者:</span>
                <span>{editedTag.audit.created_by}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 min-w-[100px]">作成日時:</span>
                <span>{formatDateTime(editedTag.audit.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 min-w-[100px]">最終更新:</span>
                <span>{formatDateTime(editedTag.audit.updated_at)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-between items-center">
          <div className="flex gap-2">
            {actions}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-400 disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
              </>
            ) : (
              <button onClick={onClose} className="btn-primary px-6 py-2">
                閉じる
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
