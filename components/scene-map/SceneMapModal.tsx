'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { SceneMapData, SceneMapRow, createEmptySceneMapData } from './types';

const SceneMapEditor = dynamic(() => import('./SceneMapEditor'), { ssr: false });
const SceneMapViewer = dynamic(() => import('./SceneMapViewer'), { ssr: false });

interface SceneMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
}

export default function SceneMapModal({ isOpen, onClose, canEdit }: SceneMapModalProps) {
  const [loading, setLoading] = useState(true);
  const [currentMap, setCurrentMap] = useState<SceneMapRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const supabase = createClient();

  // ESCキーで閉じる
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // データ取得
  const fetchLatestMap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('scene_maps')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        // テーブルが存在しない場合のエラーをハンドル
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setCurrentMap(null);
          setLoading(false);
          return;
        }
        throw fetchError;
      }

      setCurrentMap(data as SceneMapRow | null);
    } catch (err) {
      console.error('Failed to fetch scene map:', err);
      // テーブル未作成の場合は空状態で表示
      setCurrentMap(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (isOpen) {
      fetchLatestMap();
    }
  }, [isOpen, fetchLatestMap]);

  // 保存
  const handleSave = async (data: SceneMapData, name: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (currentMap) {
        // 更新
        const { error: updateError } = await supabase
          .from('scene_maps')
          .update({
            name,
            data: data as unknown as Record<string, unknown>,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentMap.id);

        if (updateError) throw updateError;

        setCurrentMap((prev) =>
          prev ? { ...prev, name, data, updated_at: new Date().toISOString() } : prev
        );
      } else {
        // 新規作成
        const { data: inserted, error: insertError } = await supabase
          .from('scene_maps')
          .insert({
            name,
            data: data as unknown as Record<string, unknown>,
            created_by: userId || 'unknown',
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setCurrentMap(inserted as SceneMapRow);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to save scene map:', err);
      setError('保存に失敗しました');
    }
  };

  // 新規作成（確認ダイアログ付き、エディタを完全リセット）
  const handleCreateNew = () => {
    if (!confirm('現在の図を破棄して新規作成しますか？')) return;
    setCurrentMap(null);
    setEditorKey((k) => k + 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* 背景オーバーレイ */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* モーダル本体 */}
      <div className="relative flex h-full w-full flex-col bg-white">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              <p>読み込み中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center text-red-500">
              <p className="text-lg font-bold">エラー</p>
              <p className="mt-2 text-sm">{error}</p>
              <button
                onClick={fetchLatestMap}
                className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                再試行
              </button>
            </div>
          </div>
        ) : canEdit ? (
          <SceneMapEditor
            key={editorKey}
            initialData={currentMap?.data || null}
            mapName={currentMap?.name || '無題の現場図'}
            onSave={handleSave}
            onCreateNew={handleCreateNew}
            onClose={onClose}
          />
        ) : (
          <SceneMapViewer
            data={currentMap?.data || null}
            mapName={currentMap?.name || ''}
            updatedAt={currentMap?.updated_at || null}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
