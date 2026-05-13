'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { TriageTag } from '@/lib/types';

const TriageMap = dynamic(() => import('@/components/TriageMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-200">
      <p className="text-gray-600">地図を読み込み中...</p>
    </div>
  ),
});

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MapModal({ isOpen, onClose }: MapModalProps) {
  const [tags, setTags] = useState<TriageTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
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
  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('triage_tags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTags((data || []) as TriageTag[]);
      const now = new Date();
      setLastUpdated(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      );
    } catch (err) {
      console.error('Failed to fetch triage tags for map:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen, fetchTags]);

  if (!isOpen) return null;

  const patients = tags
    .filter((tag) => tag.location && tag.location.latitude && tag.location.longitude)
    .map((tag) => ({
      id: tag.id,
      position: [tag.location.latitude, tag.location.longitude] as [number, number],
      category: tag.triage_category.final,
      tagNumber: tag.tag_number,
      anonymousId: tag.anonymous_id,
    }));

  const center: [number, number] | undefined =
    tags.length > 0 && tags[0].location
      ? [tags[0].location.latitude, tags[0].location.longitude]
      : undefined;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* 背景オーバーレイ */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* モーダル本体 */}
      <div className="relative flex h-full w-full flex-col bg-white">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold">患者位置マップ</h2>
          <div className="flex items-center gap-4">
            {lastUpdated && <span className="text-sm text-gray-500">最終更新 {lastUpdated}</span>}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              aria-label="閉じる"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 地図 */}
        <div className="flex-1">
          {loading ? (
            <div className="flex h-full items-center justify-center bg-gray-200">
              <div className="text-center text-gray-500">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                <p>地図データを読み込み中...</p>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <TriageMap patients={patients} center={center} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
