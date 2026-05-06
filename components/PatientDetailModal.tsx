'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TriageTag, TriageCategories } from '@/lib/types';
import { formatDateTime, formatShortDateTime } from '@/lib/utils/date-formatter';
import { createClient } from '@/lib/supabase/client';
import VoiceInput from '@/components/VoiceInput';
import ImageUploader from '@/components/ImageUploader';

interface PatientDetailModalProps {
  tag: TriageTag | null;
  onClose: () => void;
  onUpdate?: (updatedTag: TriageTag) => void; // 更新後のコールバック
  actions?: React.ReactNode; // アクションボタンをカスタマイズ可能
}

export default function PatientDetailModal({
  tag,
  onClose,
  onUpdate,
  actions,
}: PatientDetailModalProps) {
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedTag, setEditedTag] = useState<TriageTag | null>(tag);

  const supabase = createClient();

  // tagが変更されたときにeditedTagを更新
  useEffect(() => {
    if (tag) {
      setEditedTag(tag);
      setIsEditing(false);
    }
  }, [tag]);

  if (!tag || !editedTag) return null;

  const category = editedTag.triage_category.final;
  const categoryInfo = TriageCategories[category];

  // undefinedをnullに変換するヘルパー関数
  const replaceUndefinedWithNull = (obj: unknown): unknown => {
    if (obj === undefined) return null;
    if (obj === null) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(replaceUndefinedWithNull);

    const result: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      result[key] = replaceUndefinedWithNull((obj as Record<string, unknown>)[key]);
    }
    return result;
  };

  // 保存処理
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // undefinedをnullに変換
      const updateData = {
        patient_info: replaceUndefinedWithNull(editedTag.patient_info),
        vital_signs: replaceUndefinedWithNull(editedTag.vital_signs),
        chief_complaint: editedTag.chief_complaint
          ? replaceUndefinedWithNull(editedTag.chief_complaint)
          : null,
        conveyer: editedTag.conveyer || null,
        execution_places: editedTag.execution_places || null,
        execution_place_other: editedTag.execution_place_other || null,
        rescue_place: editedTag.rescue_place || null,
        enforcement_organization: editedTag.enforcement_organization || null,
        enforcement_organization_other: editedTag.enforcement_organization_other || null,
        conditions: editedTag.conditions || null,
        condition_other: editedTag.condition_other || null,
        vital_signs_records: replaceUndefinedWithNull(editedTag.vital_signs_records),
        attachments: replaceUndefinedWithNull(editedTag.attachments),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('triage_tags')
        .update(updateData)
        .eq('id', editedTag.id);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      alert('患者情報を更新しました');
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(editedTag);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      console.error('Save error:', error);
      alert(`更新に失敗しました\n\nエラー: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    setEditedTag(tag);
    setIsEditing(false);
  };

  return (
    <>
      {/* 画像拡大表示モーダル */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-95 p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <button
            onClick={() => setEnlargedImage(null)}
            className="fixed right-4 top-4 z-[70] text-5xl font-bold text-white hover:text-gray-300"
          >
            ×
          </button>
          <div className="relative h-[95vh] w-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={enlargedImage}
              alt="拡大画像"
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}

      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        onClick={onClose}
      >
        <div
          className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">
            <div className="flex items-center gap-4">
              <span
                className={`rounded-lg px-6 py-3 text-xl font-bold ${categoryInfo.color} ${categoryInfo.textColor}`}
              >
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
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  編集
                </button>
              )}
              <button
                onClick={onClose}
                className="text-3xl font-bold text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="space-y-6 p-6">
            {/* 患者基本情報 */}
            <section>
              <h3 className="mb-3 border-b pb-2 text-lg font-bold">患者基本情報</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">氏名</label>
                      <input
                        type="text"
                        value={editedTag.patient_info?.name || ''}
                        onChange={(e) =>
                          setEditedTag({
                            ...editedTag,
                            patient_info: {
                              ...editedTag.patient_info,
                              name: e.target.value || undefined,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        placeholder="氏名"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">電話番号</label>
                      <input
                        type="tel"
                        value={editedTag.patient_info?.phone || ''}
                        onChange={(e) =>
                          setEditedTag({
                            ...editedTag,
                            patient_info: {
                              ...editedTag.patient_info,
                              phone: e.target.value || undefined,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        placeholder="電話番号"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">住所</label>
                    <input
                      type="text"
                      value={editedTag.patient_info?.address || ''}
                      onChange={(e) =>
                        setEditedTag({
                          ...editedTag,
                          patient_info: {
                            ...editedTag.patient_info,
                            address: e.target.value || undefined,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="住所"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">年齢</label>
                      <input
                        type="number"
                        value={editedTag.patient_info?.age || ''}
                        onChange={(e) =>
                          setEditedTag({
                            ...editedTag,
                            patient_info: {
                              ...editedTag.patient_info,
                              age: e.target.value ? parseInt(e.target.value) : undefined,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        placeholder="年齢"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">性別</label>
                      <select
                        value={editedTag.patient_info?.sex || 'unknown'}
                        onChange={(e) =>
                          setEditedTag({
                            ...editedTag,
                            patient_info: {
                              ...editedTag.patient_info,
                              sex: e.target.value as 'male' | 'female' | 'unknown',
                            },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      >
                        <option value="unknown">不明</option>
                        <option value="male">男性</option>
                        <option value="female">女性</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">氏名</p>
                    <p className="font-semibold">{editedTag.patient_info?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">電話番号</p>
                    <p className="font-semibold">{editedTag.patient_info?.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">住所</p>
                    <p className="font-semibold">{editedTag.patient_info?.address || '-'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">年齢</p>
                      <p className="font-semibold">
                        {editedTag.patient_info?.age ? `${editedTag.patient_info.age}歳` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">性別</p>
                      <p className="font-semibold">
                        {editedTag.patient_info?.sex === 'male'
                          ? '男性'
                          : editedTag.patient_info?.sex === 'female'
                            ? '女性'
                            : editedTag.patient_info?.sex === 'other'
                              ? 'その他'
                              : editedTag.patient_info?.sex === 'unknown'
                                ? '不明'
                                : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* バイタルサイン（紙のトリアージタッグ形式：1st/2nd/3rd横並び） */}
            <section>
              <h3 className="mb-3 border-b pb-2 text-lg font-bold">バイタルサイン</h3>
              {isEditing ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-2 text-left">項目</th>
                        <th className="border border-gray-300 px-2 py-2 text-center">1st</th>
                        <th className="border border-gray-300 px-2 py-2 text-center">2nd</th>
                        <th className="border border-gray-300 px-2 py-2 text-center">3rd</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          判定者名
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="text"
                            value={editedTag.vital_signs_records?.first?.judger_name || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  first: {
                                    ...editedTag.vital_signs_records?.first,
                                    judger_name: e.target.value || undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                            placeholder="判定者名"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="text"
                            value={editedTag.vital_signs_records?.second?.judger_name || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  second: {
                                    ...editedTag.vital_signs_records?.second,
                                    judger_name: e.target.value || undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                            placeholder="判定者名"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="text"
                            value={editedTag.vital_signs_records?.third?.judger_name || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  third: {
                                    ...editedTag.vital_signs_records?.third,
                                    judger_name: e.target.value || undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                            placeholder="判定者名"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          判定場所
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="text"
                            value={editedTag.vital_signs_records?.first?.judgment_location || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  first: {
                                    ...editedTag.vital_signs_records?.first,
                                    judgment_location: e.target.value || undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                            placeholder="判定場所"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="text"
                            value={editedTag.vital_signs_records?.second?.judgment_location || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  second: {
                                    ...editedTag.vital_signs_records?.second,
                                    judgment_location: e.target.value || undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                            placeholder="判定場所"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="text"
                            value={editedTag.vital_signs_records?.third?.judgment_location || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  third: {
                                    ...editedTag.vital_signs_records?.third,
                                    judgment_location: e.target.value || undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                            placeholder="判定場所"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          判定時間
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="time"
                            value={editedTag.vital_signs_records?.first?.judgment_time || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  first: {
                                    ...editedTag.vital_signs_records?.first,
                                    judgment_time: e.target.value || undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="time"
                            value={editedTag.vital_signs_records?.second?.judgment_time || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  second: {
                                    ...editedTag.vital_signs_records?.second,
                                    judgment_time: e.target.value || undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="time"
                            value={editedTag.vital_signs_records?.third?.judgment_time || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  third: {
                                    ...editedTag.vital_signs_records?.third,
                                    judgment_time: e.target.value || undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          意識
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <select
                            value={editedTag.vital_signs_records?.first?.consciousness || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  first: {
                                    ...editedTag.vital_signs_records?.first,
                                    consciousness:
                                      (e.target.value as 'I' | 'II' | 'III') || undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                          >
                            <option value="">-</option>
                            <option value="I">I</option>
                            <option value="II">II</option>
                            <option value="III">III</option>
                          </select>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <select
                            value={editedTag.vital_signs_records?.second?.consciousness || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  second: {
                                    ...editedTag.vital_signs_records?.second,
                                    consciousness:
                                      (e.target.value as 'I' | 'II' | 'III') || undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                          >
                            <option value="">-</option>
                            <option value="I">I</option>
                            <option value="II">II</option>
                            <option value="III">III</option>
                          </select>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <select
                            value={editedTag.vital_signs_records?.third?.consciousness || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  third: {
                                    ...editedTag.vital_signs_records?.third,
                                    consciousness:
                                      (e.target.value as 'I' | 'II' | 'III') || undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                          >
                            <option value="">-</option>
                            <option value="I">I</option>
                            <option value="II">II</option>
                            <option value="III">III</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          呼吸 (回/分)
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            value={editedTag.vital_signs_records?.first?.respiratory_rate || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  first: {
                                    ...editedTag.vital_signs_records?.first,
                                    respiratory_rate: e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                            placeholder="回/分"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            value={editedTag.vital_signs_records?.second?.respiratory_rate || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  second: {
                                    ...editedTag.vital_signs_records?.second,
                                    respiratory_rate: e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                            placeholder="回/分"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            value={editedTag.vital_signs_records?.third?.respiratory_rate || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  third: {
                                    ...editedTag.vital_signs_records?.third,
                                    respiratory_rate: e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                            placeholder="回/分"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          脈拍 (回/分)
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            value={editedTag.vital_signs_records?.first?.pulse_rate || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  first: {
                                    ...editedTag.vital_signs_records?.first,
                                    pulse_rate: e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                            placeholder="回/分"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            value={editedTag.vital_signs_records?.second?.pulse_rate || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  second: {
                                    ...editedTag.vital_signs_records?.second,
                                    pulse_rate: e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                            placeholder="回/分"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            value={editedTag.vital_signs_records?.third?.pulse_rate || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  third: {
                                    ...editedTag.vital_signs_records?.third,
                                    pulse_rate: e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                            placeholder="回/分"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          血圧 (mmHg)
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={
                                editedTag.vital_signs_records?.first?.blood_pressure?.systolic || ''
                              }
                              onChange={(e) =>
                                setEditedTag({
                                  ...editedTag,
                                  vital_signs_records: {
                                    ...editedTag.vital_signs_records,
                                    first: {
                                      ...editedTag.vital_signs_records?.first,
                                      blood_pressure: {
                                        systolic: e.target.value ? parseInt(e.target.value) : 0,
                                        diastolic:
                                          editedTag.vital_signs_records?.first?.blood_pressure
                                            ?.diastolic || 0,
                                      },
                                    },
                                  },
                                })
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1"
                              placeholder="収縮期"
                            />
                            <span className="self-center">/</span>
                            <input
                              type="number"
                              value={
                                editedTag.vital_signs_records?.first?.blood_pressure?.diastolic ||
                                ''
                              }
                              onChange={(e) =>
                                setEditedTag({
                                  ...editedTag,
                                  vital_signs_records: {
                                    ...editedTag.vital_signs_records,
                                    first: {
                                      ...editedTag.vital_signs_records?.first,
                                      blood_pressure: {
                                        systolic:
                                          editedTag.vital_signs_records?.first?.blood_pressure
                                            ?.systolic || 0,
                                        diastolic: e.target.value ? parseInt(e.target.value) : 0,
                                      },
                                    },
                                  },
                                })
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1"
                              placeholder="拡張期"
                            />
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={
                                editedTag.vital_signs_records?.second?.blood_pressure?.systolic ||
                                ''
                              }
                              onChange={(e) =>
                                setEditedTag({
                                  ...editedTag,
                                  vital_signs_records: {
                                    ...editedTag.vital_signs_records,
                                    second: {
                                      ...editedTag.vital_signs_records?.second,
                                      blood_pressure: {
                                        systolic: e.target.value ? parseInt(e.target.value) : 0,
                                        diastolic:
                                          editedTag.vital_signs_records?.second?.blood_pressure
                                            ?.diastolic || 0,
                                      },
                                    },
                                  },
                                })
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1"
                              placeholder="収縮期"
                            />
                            <span className="self-center">/</span>
                            <input
                              type="number"
                              value={
                                editedTag.vital_signs_records?.second?.blood_pressure?.diastolic ||
                                ''
                              }
                              onChange={(e) =>
                                setEditedTag({
                                  ...editedTag,
                                  vital_signs_records: {
                                    ...editedTag.vital_signs_records,
                                    second: {
                                      ...editedTag.vital_signs_records?.second,
                                      blood_pressure: {
                                        systolic:
                                          editedTag.vital_signs_records?.second?.blood_pressure
                                            ?.systolic || 0,
                                        diastolic: e.target.value ? parseInt(e.target.value) : 0,
                                      },
                                    },
                                  },
                                })
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1"
                              placeholder="拡張期"
                            />
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={
                                editedTag.vital_signs_records?.third?.blood_pressure?.systolic || ''
                              }
                              onChange={(e) =>
                                setEditedTag({
                                  ...editedTag,
                                  vital_signs_records: {
                                    ...editedTag.vital_signs_records,
                                    third: {
                                      ...editedTag.vital_signs_records?.third,
                                      blood_pressure: {
                                        systolic: e.target.value ? parseInt(e.target.value) : 0,
                                        diastolic:
                                          editedTag.vital_signs_records?.third?.blood_pressure
                                            ?.diastolic || 0,
                                      },
                                    },
                                  },
                                })
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1"
                              placeholder="収縮期"
                            />
                            <span className="self-center">/</span>
                            <input
                              type="number"
                              value={
                                editedTag.vital_signs_records?.third?.blood_pressure?.diastolic ||
                                ''
                              }
                              onChange={(e) =>
                                setEditedTag({
                                  ...editedTag,
                                  vital_signs_records: {
                                    ...editedTag.vital_signs_records,
                                    third: {
                                      ...editedTag.vital_signs_records?.third,
                                      blood_pressure: {
                                        systolic:
                                          editedTag.vital_signs_records?.third?.blood_pressure
                                            ?.systolic || 0,
                                        diastolic: e.target.value ? parseInt(e.target.value) : 0,
                                      },
                                    },
                                  },
                                })
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1"
                              placeholder="拡張期"
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          体温 (°C)
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={editedTag.vital_signs_records?.first?.temperature || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  first: {
                                    ...editedTag.vital_signs_records?.first,
                                    temperature: e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                            placeholder="体温"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={editedTag.vital_signs_records?.second?.temperature || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  second: {
                                    ...editedTag.vital_signs_records?.second,
                                    temperature: e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                            placeholder="体温"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={editedTag.vital_signs_records?.third?.temperature || ''}
                            onChange={(e) =>
                              setEditedTag({
                                ...editedTag,
                                vital_signs_records: {
                                  ...editedTag.vital_signs_records,
                                  third: {
                                    ...editedTag.vital_signs_records?.third,
                                    temperature: e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined,
                                  },
                                },
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1"
                            placeholder="体温"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-2 text-left">項目</th>
                        <th className="border border-gray-300 px-2 py-2 text-center">1st</th>
                        <th className="border border-gray-300 px-2 py-2 text-center">2nd</th>
                        <th className="border border-gray-300 px-2 py-2 text-center">3rd</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          判定者名
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.first?.judger_name || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.second?.judger_name || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.third?.judger_name || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          判定場所
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.first?.judgment_location || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.second?.judgment_location || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.third?.judgment_location || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          判定時間
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.first?.judgment_time || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.second?.judgment_time || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.third?.judgment_time || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          意識
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.first?.consciousness || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.second?.consciousness || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.third?.consciousness || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          呼吸 (回/分)
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.first?.respiratory_rate || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.second?.respiratory_rate || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.third?.respiratory_rate || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          脈拍 (回/分)
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.first?.pulse_rate || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.second?.pulse_rate || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.third?.pulse_rate || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          血圧 (mmHg)
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.first?.blood_pressure
                            ? `${editedTag.vital_signs_records.first.blood_pressure.systolic}/${editedTag.vital_signs_records.first.blood_pressure.diastolic}`
                            : '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.second?.blood_pressure
                            ? `${editedTag.vital_signs_records.second.blood_pressure.systolic}/${editedTag.vital_signs_records.second.blood_pressure.diastolic}`
                            : '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.third?.blood_pressure
                            ? `${editedTag.vital_signs_records.third.blood_pressure.systolic}/${editedTag.vital_signs_records.third.blood_pressure.diastolic}`
                            : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 px-2 py-2 font-semibold">
                          体温 (°C)
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.first?.temperature || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.second?.temperature || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {editedTag.vital_signs_records?.third?.temperature || '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* トリアージ評価 */}
            <section>
              <h3 className="mb-3 border-b pb-2 text-lg font-bold">トリアージ評価</h3>
              <div className="space-y-3">
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="mb-2 text-sm text-gray-600">START法評価ステップ</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="min-w-[120px] font-semibold">歩行可能:</span>
                      <span>
                        {editedTag.triage_category.start_steps?.can_walk ? 'はい' : 'いいえ'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="min-w-[120px] font-semibold">呼吸:</span>
                      <span>
                        {editedTag.triage_category.start_steps?.breathing
                          ? '正常'
                          : '異常または停止'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="min-w-[120px] font-semibold">循環:</span>
                      <span>
                        {editedTag.triage_category.start_steps?.circulation ? '正常' : '異常'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="min-w-[120px] font-semibold">意識:</span>
                      <span>
                        {editedTag.triage_category.start_steps?.consciousness ? '清明' : '混濁'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">判定理由</p>
                  <p className="rounded-lg bg-gray-50 p-3">
                    {editedTag.triage_category.reasoning || '記載なし'}
                  </p>
                </div>
              </div>
            </section>

            {/* トリアージ実施情報 */}
            <section>
              <h3 className="mb-3 border-b pb-2 text-lg font-bold">トリアージ実施情報</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">トリアージ実施日時</label>
                      <input
                        type="text"
                        value={
                          editedTag.audit.created_at
                            ? formatDateTime(editedTag.audit.created_at)
                            : ''
                        }
                        disabled
                        className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">
                        トリアージ実施者氏名
                      </label>
                      <input
                        type="text"
                        value={editedTag.audit.created_by || ''}
                        disabled
                        className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">搬送機関</label>
                      <input
                        type="text"
                        value={editedTag.conveyer || ''}
                        onChange={(e) =>
                          setEditedTag({
                            ...editedTag,
                            conveyer: e.target.value || undefined,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        placeholder="搬送機関"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">収容医療機関名</label>
                      <input
                        type="text"
                        value={editedTag.transport.destination?.hospital_name || ''}
                        disabled
                        className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600">トリアージ実施日時</p>
                    <p className="font-semibold">
                      {editedTag.audit.created_at
                        ? formatDateTime(editedTag.audit.created_at)
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">トリアージ実施者氏名</p>
                    <p className="font-semibold">{editedTag.audit.created_by || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">搬送機関</p>
                    <p className="font-semibold">{editedTag.conveyer || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">収容医療機関名</p>
                    <p className="font-semibold">
                      {editedTag.transport.destination?.hospital_name || '-'}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* 現場・搬送情報 */}
            <section>
              <h3 className="mb-3 border-b pb-2 text-lg font-bold">現場・搬送情報</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-gray-600">
                      トリアージ実施場所（複数選択可）
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedTag.execution_places?.includes('scene') || false}
                          onChange={(e) => {
                            const current = editedTag.execution_places || [];
                            setEditedTag({
                              ...editedTag,
                              execution_places: e.target.checked
                                ? [...current, 'scene']
                                : current.filter((p) => p !== 'scene'),
                            });
                          }}
                          className="h-4 w-4"
                        />
                        <span>現場</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedTag.execution_places?.includes('post') || false}
                          onChange={(e) => {
                            const current = editedTag.execution_places || [];
                            setEditedTag({
                              ...editedTag,
                              execution_places: e.target.checked
                                ? [...current, 'post']
                                : current.filter((p) => p !== 'post'),
                            });
                          }}
                          className="h-4 w-4"
                        />
                        <span>ポスト</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedTag.execution_places?.includes('vehicle') || false}
                          onChange={(e) => {
                            const current = editedTag.execution_places || [];
                            setEditedTag({
                              ...editedTag,
                              execution_places: e.target.checked
                                ? [...current, 'vehicle']
                                : current.filter((p) => p !== 'vehicle'),
                            });
                          }}
                          className="h-4 w-4"
                        />
                        <span>車内</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedTag.execution_places?.includes('other') || false}
                          onChange={(e) => {
                            const current = editedTag.execution_places || [];
                            setEditedTag({
                              ...editedTag,
                              execution_places: e.target.checked
                                ? [...current, 'other']
                                : current.filter((p) => p !== 'other'),
                            });
                          }}
                          className="h-4 w-4"
                        />
                        <span>その他</span>
                      </label>
                      {editedTag.execution_places?.includes('other') && (
                        <input
                          type="text"
                          value={editedTag.execution_place_other || ''}
                          onChange={(e) =>
                            setEditedTag({
                              ...editedTag,
                              execution_place_other: e.target.value || undefined,
                            })
                          }
                          className="ml-6 w-full rounded-lg border border-gray-300 px-3 py-2"
                          placeholder="その他の場所を入力"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">救出場所</label>
                    <input
                      type="text"
                      value={editedTag.rescue_place || ''}
                      onChange={(e) =>
                        setEditedTag({
                          ...editedTag,
                          rescue_place: e.target.value || undefined,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="救出場所"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-gray-600">トリアージ実施機関</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="enforcement_organization"
                          checked={editedTag.enforcement_organization === 'doctor'}
                          onChange={() =>
                            setEditedTag({
                              ...editedTag,
                              enforcement_organization: 'doctor',
                            })
                          }
                          className="h-4 w-4"
                        />
                        <span>医師</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="enforcement_organization"
                          checked={editedTag.enforcement_organization === 'paramedic'}
                          onChange={() =>
                            setEditedTag({
                              ...editedTag,
                              enforcement_organization: 'paramedic',
                            })
                          }
                          className="h-4 w-4"
                        />
                        <span>救急救命士</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="enforcement_organization"
                          checked={editedTag.enforcement_organization === 'other'}
                          onChange={() =>
                            setEditedTag({
                              ...editedTag,
                              enforcement_organization: 'other',
                            })
                          }
                          className="h-4 w-4"
                        />
                        <span>その他</span>
                      </label>
                      {editedTag.enforcement_organization === 'other' && (
                        <input
                          type="text"
                          value={editedTag.enforcement_organization_other || ''}
                          onChange={(e) =>
                            setEditedTag({
                              ...editedTag,
                              enforcement_organization_other: e.target.value || undefined,
                            })
                          }
                          className="ml-6 w-full rounded-lg border border-gray-300 px-3 py-2"
                          placeholder="その他の機関を入力"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">トリアージ実施場所</p>
                    {editedTag.execution_places && editedTag.execution_places.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {editedTag.execution_places.map((place) => (
                          <span
                            key={place}
                            className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                          >
                            {place === 'scene'
                              ? '現場'
                              : place === 'post'
                                ? 'ポスト'
                                : place === 'vehicle'
                                  ? '車内'
                                  : 'その他'}
                          </span>
                        ))}
                        {editedTag.execution_place_other && (
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                            {editedTag.execution_place_other}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="font-semibold">-</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">救出場所</p>
                    <p className="font-semibold">{editedTag.rescue_place || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">トリアージ実施機関</p>
                    <p className="font-semibold">
                      {editedTag.enforcement_organization === 'doctor'
                        ? '医師'
                        : editedTag.enforcement_organization === 'paramedic'
                          ? '救急救命士'
                          : editedTag.enforcement_organization === 'other' &&
                              editedTag.enforcement_organization_other
                            ? editedTag.enforcement_organization_other
                            : editedTag.enforcement_organization === 'other'
                              ? 'その他'
                              : '-'}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* 主訴・症状 */}
            <section>
              <h3 className="mb-3 border-b pb-2 text-lg font-bold">主訴・症状</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">主訴</label>
                    <textarea
                      value={editedTag.chief_complaint?.primary || ''}
                      onChange={(e) =>
                        setEditedTag({
                          ...editedTag,
                          chief_complaint: {
                            primary: e.target.value,
                            symptoms: editedTag.chief_complaint?.symptoms,
                            notes: editedTag.chief_complaint?.notes,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      rows={3}
                      placeholder="主訴を入力"
                    />
                    <div className="mt-2">
                      <VoiceInput
                        onTranscript={(text) =>
                          setEditedTag({
                            ...editedTag,
                            chief_complaint: {
                              primary: editedTag.chief_complaint?.primary
                                ? `${editedTag.chief_complaint.primary} ${text}`
                                : text,
                              symptoms: editedTag.chief_complaint?.symptoms,
                              notes: editedTag.chief_complaint?.notes,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-gray-600">
                      症状・傷病名（複数選択可）
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedTag.conditions?.includes('contusion') || false}
                          onChange={(e) => {
                            const current = editedTag.conditions || [];
                            setEditedTag({
                              ...editedTag,
                              conditions: e.target.checked
                                ? [...current, 'contusion']
                                : current.filter((c) => c !== 'contusion'),
                            });
                          }}
                          className="h-4 w-4"
                        />
                        <span>打撲</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedTag.conditions?.includes('fracture') || false}
                          onChange={(e) => {
                            const current = editedTag.conditions || [];
                            setEditedTag({
                              ...editedTag,
                              conditions: e.target.checked
                                ? [...current, 'fracture']
                                : current.filter((c) => c !== 'fracture'),
                            });
                          }}
                          className="h-4 w-4"
                        />
                        <span>骨折</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedTag.conditions?.includes('sprain') || false}
                          onChange={(e) => {
                            const current = editedTag.conditions || [];
                            setEditedTag({
                              ...editedTag,
                              conditions: e.target.checked
                                ? [...current, 'sprain']
                                : current.filter((c) => c !== 'sprain'),
                            });
                          }}
                          className="h-4 w-4"
                        />
                        <span>捻挫</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedTag.conditions?.includes('amputation') || false}
                          onChange={(e) => {
                            const current = editedTag.conditions || [];
                            setEditedTag({
                              ...editedTag,
                              conditions: e.target.checked
                                ? [...current, 'amputation']
                                : current.filter((c) => c !== 'amputation'),
                            });
                          }}
                          className="h-4 w-4"
                        />
                        <span>切断</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedTag.conditions?.includes('burn') || false}
                          onChange={(e) => {
                            const current = editedTag.conditions || [];
                            setEditedTag({
                              ...editedTag,
                              conditions: e.target.checked
                                ? [...current, 'burn']
                                : current.filter((c) => c !== 'burn'),
                            });
                          }}
                          className="h-4 w-4"
                        />
                        <span>熱傷</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedTag.conditions?.includes('other') || false}
                          onChange={(e) => {
                            const current = editedTag.conditions || [];
                            setEditedTag({
                              ...editedTag,
                              conditions: e.target.checked
                                ? [...current, 'other']
                                : current.filter((c) => c !== 'other'),
                            });
                          }}
                          className="h-4 w-4"
                        />
                        <span>その他</span>
                      </label>
                      {editedTag.conditions?.includes('other') && (
                        <input
                          type="text"
                          value={editedTag.condition_other || ''}
                          onChange={(e) =>
                            setEditedTag({
                              ...editedTag,
                              condition_other: e.target.value || undefined,
                            })
                          }
                          className="ml-6 w-full rounded-lg border border-gray-300 px-3 py-2"
                          placeholder="その他の症状・傷病名を入力"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">特記事項</label>
                    <textarea
                      value={editedTag.chief_complaint?.notes || ''}
                      onChange={(e) =>
                        setEditedTag({
                          ...editedTag,
                          chief_complaint: {
                            primary: editedTag.chief_complaint?.primary || '',
                            symptoms: editedTag.chief_complaint?.symptoms,
                            notes: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      rows={2}
                      placeholder="特記事項を入力"
                    />
                    <div className="mt-2">
                      <VoiceInput
                        onTranscript={(text) =>
                          setEditedTag({
                            ...editedTag,
                            chief_complaint: {
                              primary: editedTag.chief_complaint?.primary || '',
                              symptoms: editedTag.chief_complaint?.symptoms,
                              notes: editedTag.chief_complaint?.notes
                                ? `${editedTag.chief_complaint.notes} ${text}`
                                : text,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* 画像アップロード */}
                  <div>
                    <label className="mb-2 block text-sm font-bold">画像アップロード【任意】</label>
                    <ImageUploader
                      tagId={editedTag.id}
                      initialImages={editedTag.attachments?.images || []}
                      onUploadComplete={(images) =>
                        setEditedTag({
                          ...editedTag,
                          attachments: {
                            ...editedTag.attachments,
                            images: images,
                            audio_notes: editedTag.attachments?.audio_notes || [],
                            drone_images: editedTag.attachments?.drone_images || [],
                          },
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">主訴</p>
                    <p className="rounded-lg bg-gray-50 p-3">
                      {editedTag.chief_complaint?.primary || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">症状・傷病名</p>
                    {editedTag.conditions && editedTag.conditions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {editedTag.conditions.map((condition) => (
                          <span
                            key={condition}
                            className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-800"
                          >
                            {condition === 'contusion'
                              ? '打撲'
                              : condition === 'fracture'
                                ? '骨折'
                                : condition === 'sprain'
                                  ? '捻挫'
                                  : condition === 'amputation'
                                    ? '切断'
                                    : condition === 'burn'
                                      ? '熱傷'
                                      : 'その他'}
                          </span>
                        ))}
                        {editedTag.condition_other && (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-800">
                            {editedTag.condition_other}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="font-semibold">-</p>
                    )}
                  </div>
                  {editedTag.chief_complaint?.symptoms &&
                    editedTag.chief_complaint.symptoms.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">症状</p>
                        <div className="flex flex-wrap gap-2">
                          {editedTag.chief_complaint.symptoms.map((symptom, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                            >
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  <div>
                    <p className="text-sm text-gray-600">特記事項</p>
                    <p className="rounded-lg bg-gray-50 p-3">
                      {editedTag.chief_complaint?.notes || '-'}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* 処置履歴 */}
            {editedTag.treatments && editedTag.treatments.length > 0 && (
              <section>
                <h3 className="mb-3 border-b pb-2 text-lg font-bold">処置履歴</h3>
                <div className="space-y-3">
                  {editedTag.treatments.map((treatment, index) => (
                    <div key={index} className="rounded-lg bg-gray-50 p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <span className="font-semibold text-blue-600">
                          {treatment.type === 'hemostasis'
                            ? '止血'
                            : treatment.type === 'airway'
                              ? '気道確保'
                              : treatment.type === 'fixation'
                                ? '固定'
                                : treatment.type === 'oxygen'
                                  ? '酸素投与'
                                  : 'その他'}
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
                <h3 className="mb-3 border-b pb-2 text-lg font-bold">
                  添付画像（{editedTag.attachments.images.length}枚）
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {editedTag.attachments.images.map((image, index) => (
                    <div key={image.id} className="group relative h-48 w-full">
                      <Image
                        src={image.url}
                        alt={`添付画像 ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="cursor-pointer rounded-lg border border-gray-200 object-cover transition hover:opacity-90"
                        onClick={() => setEnlargedImage(image.url)}
                      />
                      <div className="pointer-events-none absolute right-2 top-2 rounded bg-black bg-opacity-70 px-2 py-1 text-xs text-white">
                        {image.type === 'wound'
                          ? '外傷'
                          : image.type === 'scene'
                            ? '現場'
                            : image.type === 'body_diagram'
                              ? '身体図'
                              : 'その他'}
                      </div>
                      <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-black bg-opacity-70 px-2 py-1 text-xs text-white">
                        {formatShortDateTime(image.taken_at)}
                      </div>
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-0 transition group-hover:bg-opacity-10">
                        <span className="font-bold text-white opacity-0 transition group-hover:opacity-100">
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
              <h3 className="mb-3 border-b pb-2 text-lg font-bold">搬送情報</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="min-w-[100px] text-sm text-gray-600">搬送状態:</span>
                  <span
                    className={`font-semibold ${
                      editedTag.transport.status === 'completed'
                        ? 'text-green-600'
                        : editedTag.transport.status === 'in_transit'
                          ? 'text-blue-600'
                          : editedTag.transport.status === 'preparing'
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                    }`}
                  >
                    {editedTag.transport.status === 'not_transported'
                      ? '現場'
                      : editedTag.transport.status === 'preparing'
                        ? '病院準備'
                        : editedTag.transport.status === 'in_transit'
                          ? '病院へ'
                          : editedTag.transport.status === 'completed'
                            ? '病院'
                            : '不明'}
                  </span>
                </div>
                {editedTag.transport.destination && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="min-w-[100px] text-sm text-gray-600">搬送先:</span>
                      <span className="font-semibold">
                        {editedTag.transport.destination.hospital_name}
                      </span>
                    </div>
                    {editedTag.transport.destination.department && (
                      <div className="flex items-center gap-2">
                        <span className="min-w-[100px] text-sm text-gray-600">診療科:</span>
                        <span>{editedTag.transport.destination.department}</span>
                      </div>
                    )}
                  </>
                )}
                {editedTag.transport.departure_time && (
                  <div className="flex items-center gap-2">
                    <span className="min-w-[100px] text-sm text-gray-600">出発時刻:</span>
                    <span>{formatDateTime(editedTag.transport.departure_time)}</span>
                  </div>
                )}
                {editedTag.transport.arrival_time && (
                  <div className="flex items-center gap-2">
                    <span className="min-w-[100px] text-sm text-gray-600">到着時刻:</span>
                    <span>{formatDateTime(editedTag.transport.arrival_time)}</span>
                  </div>
                )}
              </div>
            </section>

            {/* 位置情報 */}
            <section>
              <h3 className="mb-3 border-b pb-2 text-lg font-bold">位置情報</h3>
              <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                {editedTag.location.contact_point && (
                  <div className="mb-3 flex items-center gap-2 border-b border-gray-300 pb-3">
                    <span className="min-w-[80px] text-sm text-gray-600">接触地点:</span>
                    <span className="rounded bg-purple-100 px-3 py-1 font-bold text-purple-700">
                      {editedTag.location.contact_point}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="min-w-[80px] text-sm text-gray-600">位置:</span>
                  <a
                    href={`https://www.google.com/maps?q=${editedTag.location.latitude},${editedTag.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded px-2 py-1 font-mono text-sm text-blue-600 underline transition hover:bg-blue-50 hover:text-blue-800"
                  >
                    {editedTag.location.latitude.toFixed(6)},{' '}
                    {editedTag.location.longitude.toFixed(6)}
                  </a>
                </div>
                {editedTag.location.address && (
                  <div className="flex items-center gap-2">
                    <span className="min-w-[80px] text-sm text-gray-600">住所:</span>
                    <span>{editedTag.location.address}</span>
                  </div>
                )}
              </div>
            </section>

            {/* 監査情報 */}
            <section>
              <h3 className="mb-3 border-b pb-2 text-lg font-bold">監査情報</h3>
              <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="min-w-[100px] text-gray-600">作成者:</span>
                  <span>{editedTag.audit.created_by}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="min-w-[100px] text-gray-600">作成日時:</span>
                  <span>{formatDateTime(editedTag.audit.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="min-w-[100px] text-gray-600">最終更新:</span>
                  <span>{formatDateTime(editedTag.audit.updated_at)}</span>
                </div>
              </div>
            </section>
          </div>

          {/* フッター */}
          <div className="sticky bottom-0 flex items-center justify-between border-t bg-white p-4">
            <div className="flex gap-2">{actions}</div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="rounded-lg bg-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-400 disabled:opacity-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
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
  );
}
