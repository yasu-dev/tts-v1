'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ContactPointManagerProps {
  eventId: string;
  contactPoints: string[];
  onUpdate: (updatedPoints: string[]) => void;
  onClose: () => void;
}

export default function ContactPointManager({
  eventId,
  contactPoints,
  onUpdate,
  onClose,
}: ContactPointManagerProps) {
  const [points, setPoints] = useState<string[]>(contactPoints);
  const [newPoint, setNewPoint] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleAdd = async () => {
    const trimmedPoint = newPoint.trim();
    if (!trimmedPoint) return;

    if (points.includes(trimmedPoint)) {
      alert('同じ接触地点が既に存在します');
      return;
    }

    setIsLoading(true);
    const updatedPoints = [...points, trimmedPoint];

    const { error } = await supabase
      .from('events')
      .update({ contact_points: updatedPoints })
      .eq('id', eventId);

    if (error) {
      alert('接触地点の追加に失敗しました');
      setIsLoading(false);
      return;
    }

    setPoints(updatedPoints);
    onUpdate(updatedPoints);
    setNewPoint('');
    setIsLoading(false);
  };

  const handleUpdate = async (index: number) => {
    const trimmedValue = editingValue.trim();
    if (!trimmedValue) return;

    if (points.includes(trimmedValue) && points[index] !== trimmedValue) {
      alert('同じ接触地点が既に存在します');
      return;
    }

    setIsLoading(true);
    const oldValue = points[index];
    const updatedPoints = [...points];
    updatedPoints[index] = trimmedValue;

    // イベントの接触地点リストを更新
    const { error: eventError } = await supabase
      .from('events')
      .update({ contact_points: updatedPoints })
      .eq('id', eventId);

    if (eventError) {
      alert('接触地点の更新に失敗しました');
      setIsLoading(false);
      return;
    }

    // 既存のトリアージタグの接触地点も一括更新
    const { error: rpcError } = await supabase.rpc('update_contact_point', {
      p_event_id: eventId,
      p_old_value: oldValue,
      p_new_value: trimmedValue,
    });

    if (rpcError) {
      // イベント更新は成功しているので、警告のみ
      alert('既存タグの更新に失敗しましたが、接触地点リストは更新されました');
    }

    setPoints(updatedPoints);
    onUpdate(updatedPoints);
    setEditingIndex(null);
    setEditingValue('');
    setIsLoading(false);
  };

  const handleDelete = async (index: number) => {
    if (!confirm('この接触地点を削除しますか？既存のタグは「不明」に変更されます。')) {
      return;
    }

    setIsLoading(true);
    const oldValue = points[index];
    const updatedPoints = points.filter((_, i) => i !== index);

    // イベントの接触地点リストを更新
    const { error: eventError } = await supabase
      .from('events')
      .update({ contact_points: updatedPoints })
      .eq('id', eventId);

    if (eventError) {
      alert('接触地点の削除に失敗しました');
      setIsLoading(false);
      return;
    }

    // 既存のトリアージタグの接触地点を「不明」に変更
    const { error: rpcError } = await supabase.rpc('update_contact_point', {
      p_event_id: eventId,
      p_old_value: oldValue,
      p_new_value: '不明',
    });

    if (rpcError) {
      alert('既存タグの更新に失敗しましたが、接触地点リストは削除されました');
    }

    setPoints(updatedPoints);
    onUpdate(updatedPoints);
    setIsLoading(false);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(points[index]);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 border-b border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">接触地点の管理</h2>
            <button
              onClick={onClose}
              className="text-2xl font-bold text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              ×
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">局所的な災害現場での位置情報を管理します。</p>
        </div>

        <div className="p-6">
          {/* 新規追加フォーム */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              新しい接触地点を追加
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPoint}
                onChange={(e) => setNewPoint(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="例: バスの右前方、対向車線、建物入口"
                className="input flex-1"
                disabled={isLoading}
              />
              <button
                onClick={handleAdd}
                disabled={!newPoint.trim() || isLoading}
                className="btn-primary whitespace-nowrap"
              >
                追加
              </button>
            </div>
          </div>

          {/* 接触地点リスト */}
          <div>
            <h3 className="mb-3 text-lg font-bold text-gray-800">
              登録済み接触地点（{points.length}件）
            </h3>
            {points.length === 0 ? (
              <p className="py-8 text-center text-gray-500">接触地点が登録されていません</p>
            ) : (
              <div className="space-y-2">
                {points.map((point, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                    {editingIndex === index ? (
                      <>
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdate(index)}
                          className="input flex-1"
                          disabled={isLoading}
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdate(index)}
                          disabled={!editingValue.trim() || isLoading}
                          className="rounded-lg bg-blue-500 px-3 py-2 font-bold text-white hover:bg-blue-600"
                        >
                          保存
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={isLoading}
                          className="rounded-lg bg-gray-300 px-3 py-2 font-bold text-gray-700 hover:bg-gray-400"
                        >
                          キャンセル
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-bold text-gray-800">{point}</span>
                        <button
                          onClick={() => startEdit(index)}
                          disabled={isLoading}
                          className="rounded-lg bg-yellow-500 px-3 py-2 font-bold text-white hover:bg-yellow-600"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          disabled={isLoading}
                          className="rounded-lg bg-red-500 px-3 py-2 font-bold text-white hover:bg-red-600"
                        >
                          削除
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>注意:</strong>
              <br />• 接触地点を変更すると、既存のタグも自動的に更新されます
              <br />• 削除した接触地点を使用しているタグは「不明」に変更されます
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 p-6">
          <button onClick={onClose} disabled={isLoading} className="btn-secondary w-full">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
