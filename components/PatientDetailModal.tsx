'use client'

import { TriageTag, TriageCategories } from '@/lib/types'

interface PatientDetailModalProps {
  tag: TriageTag | null
  onClose: () => void
}

export default function PatientDetailModal({ tag, onClose }: PatientDetailModalProps) {
  if (!tag) return null

  const category = tag.triage_category.final
  const categoryInfo = TriageCategories[category]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <span className={`px-6 py-3 rounded-lg font-bold text-xl ${categoryInfo.color} ${categoryInfo.textColor}`}>
              {tag.tag_number}
            </span>
            <div>
              <h2 className="text-2xl font-bold">{categoryInfo.label}</h2>
              <p className="text-sm text-gray-600">患者ID: {tag.anonymous_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl font-bold">
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* 患者基本情報 */}
          <section>
            <h3 className="text-lg font-bold mb-3 border-b pb-2">患者基本情報</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tag.patient_info?.age && (
                <div>
                  <p className="text-sm text-gray-600">年齢</p>
                  <p className="font-semibold">{tag.patient_info.age}歳</p>
                </div>
              )}
              {tag.patient_info?.sex && (
                <div>
                  <p className="text-sm text-gray-600">性別</p>
                  <p className="font-semibold">
                    {tag.patient_info.sex === 'male' ? '男性' : tag.patient_info.sex === 'female' ? '女性' : 'その他'}
                  </p>
                </div>
              )}
              {tag.patient_info?.height && (
                <div>
                  <p className="text-sm text-gray-600">身長</p>
                  <p className="font-semibold">{tag.patient_info.height}cm</p>
                </div>
              )}
              {tag.patient_info?.weight && (
                <div>
                  <p className="text-sm text-gray-600">体重</p>
                  <p className="font-semibold">{tag.patient_info.weight}kg</p>
                </div>
              )}
            </div>
          </section>

          {/* バイタルサイン */}
          <section>
            <h3 className="text-lg font-bold mb-3 border-b pb-2">バイタルサイン</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tag.vital_signs.blood_pressure && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">血圧</p>
                  <p className="font-semibold text-lg">
                    {typeof tag.vital_signs.blood_pressure === 'string'
                      ? tag.vital_signs.blood_pressure
                      : `${tag.vital_signs.blood_pressure.systolic}/${tag.vital_signs.blood_pressure.diastolic}`
                    } mmHg
                  </p>
                </div>
              )}
              {tag.vital_signs.heart_rate && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">心拍数</p>
                  <p className="font-semibold text-lg">{tag.vital_signs.heart_rate} bpm</p>
                </div>
              )}
              {tag.vital_signs.respiratory_rate && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">呼吸数</p>
                  <p className="font-semibold text-lg">{tag.vital_signs.respiratory_rate} /min</p>
                </div>
              )}
              {tag.vital_signs.spo2 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">SpO2</p>
                  <p className="font-semibold text-lg">{tag.vital_signs.spo2}%</p>
                </div>
              )}
              {tag.vital_signs.consciousness_level && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">意識レベル</p>
                  <p className="font-semibold text-lg">{tag.vital_signs.consciousness_level}</p>
                </div>
              )}
              {tag.vital_signs.temperature && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">体温</p>
                  <p className="font-semibold text-lg">{tag.vital_signs.temperature}°C</p>
                </div>
              )}
            </div>
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
                    <span>{tag.triage_category.start_steps?.can_walk ? 'はい' : 'いいえ'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold min-w-[120px]">呼吸:</span>
                    <span>{tag.triage_category.start_steps?.breathing ? '正常' : '異常または停止'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold min-w-[120px]">循環:</span>
                    <span>{tag.triage_category.start_steps?.circulation ? '正常' : '異常'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold min-w-[120px]">意識:</span>
                    <span>{tag.triage_category.start_steps?.consciousness ? '清明' : '混濁'}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">判定理由</p>
                <p className="bg-gray-50 p-3 rounded-lg">{tag.triage_category.reasoning || '記載なし'}</p>
              </div>
            </div>
          </section>

          {/* 主訴・症状 */}
          {tag.chief_complaint && (
            <section>
              <h3 className="text-lg font-bold mb-3 border-b pb-2">主訴・症状</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">主訴</p>
                  <p className="bg-gray-50 p-3 rounded-lg">{tag.chief_complaint.primary}</p>
                </div>
                {tag.chief_complaint.symptoms && tag.chief_complaint.symptoms.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">症状</p>
                    <div className="flex flex-wrap gap-2">
                      {tag.chief_complaint.symptoms.map((symptom, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {tag.chief_complaint.notes && (
                  <div>
                    <p className="text-sm text-gray-600">備考</p>
                    <p className="bg-gray-50 p-3 rounded-lg">{tag.chief_complaint.notes}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 処置履歴 */}
          {tag.treatments && tag.treatments.length > 0 && (
            <section>
              <h3 className="text-lg font-bold mb-3 border-b pb-2">処置履歴</h3>
              <div className="space-y-3">
                {tag.treatments.map((treatment, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold text-blue-600">
                        {treatment.type === 'hemostasis' ? '止血' :
                         treatment.type === 'airway' ? '気道確保' :
                         treatment.type === 'fixation' ? '固定' :
                         treatment.type === 'oxygen' ? '酸素投与' : 'その他'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(treatment.performed_at).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    <p className="text-sm mb-1">{treatment.description}</p>
                    <p className="text-xs text-gray-600">実施者: {treatment.performed_by}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 添付画像 */}
          {tag.attachments?.images && tag.attachments.images.length > 0 && (
            <section>
              <h3 className="text-lg font-bold mb-3 border-b pb-2">
                📷 添付画像（{tag.attachments.images.length}枚）
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tag.attachments.images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={`添付画像 ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition"
                      onClick={() => window.open(image.url, '_blank')}
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {image.type === 'wound' ? '外傷' :
                       image.type === 'scene' ? '現場' :
                       image.type === 'body_diagram' ? '身体図' : 'その他'}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {new Date(image.taken_at).toLocaleString('ja-JP', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition rounded-lg flex items-center justify-center">
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
                  tag.transport.status === 'completed' ? 'text-green-600' :
                  tag.transport.status === 'in_transit' ? 'text-blue-600' :
                  tag.transport.status === 'preparing' ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {tag.transport.status === 'not_transported' ? '未搬送' :
                   tag.transport.status === 'preparing' ? '搬送準備中' :
                   tag.transport.status === 'in_transit' ? '搬送中' :
                   tag.transport.status === 'completed' ? '搬送完了' : '不明'}
                </span>
              </div>
              {tag.transport.destination && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 min-w-[100px]">搬送先:</span>
                    <span className="font-semibold">{tag.transport.destination.hospital_name}</span>
                  </div>
                  {tag.transport.destination.department && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 min-w-[100px]">診療科:</span>
                      <span>{tag.transport.destination.department}</span>
                    </div>
                  )}
                </>
              )}
              {tag.transport.departure_time && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 min-w-[100px]">出発時刻:</span>
                  <span>{new Date(tag.transport.departure_time).toLocaleString('ja-JP')}</span>
                </div>
              )}
              {tag.transport.arrival_time && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 min-w-[100px]">到着時刻:</span>
                  <span>{new Date(tag.transport.arrival_time).toLocaleString('ja-JP')}</span>
                </div>
              )}
            </div>
          </section>

          {/* 位置情報 */}
          <section>
            <h3 className="text-lg font-bold mb-3 border-b pb-2">位置情報</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              {tag.location.contact_point && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-300">
                  <span className="text-sm text-gray-600 min-w-[80px]">接触地点:</span>
                  <span className="font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded">
                    📍 {tag.location.contact_point}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 min-w-[80px]">緯度:</span>
                <span className="font-mono">{tag.location.latitude.toFixed(6)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 min-w-[80px]">経度:</span>
                <span className="font-mono">{tag.location.longitude.toFixed(6)}</span>
              </div>
              {tag.location.address && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 min-w-[80px]">住所:</span>
                  <span>{tag.location.address}</span>
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
                <span>{tag.audit.created_by}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 min-w-[100px]">作成日時:</span>
                <span>{new Date(tag.audit.created_at).toLocaleString('ja-JP')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 min-w-[100px]">最終更新:</span>
                <span>{new Date(tag.audit.updated_at).toLocaleString('ja-JP')}</span>
              </div>
            </div>
          </section>
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end">
          <button onClick={onClose} className="btn-primary px-6 py-2">
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
