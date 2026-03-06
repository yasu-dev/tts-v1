'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SceneMapRow } from './types';

interface SceneMapListViewProps {
  maps: SceneMapRow[];
  loading: boolean;
  onSelect: (map: SceneMapRow) => void;
  onCreateNew: () => void;
  onClose: () => void;
  onRename: (id: string, name: string) => void;
  canEdit: boolean;
}

export default function SceneMapListView({
  maps,
  loading,
  onSelect,
  onCreateNew,
  onClose,
  onRename,
  canEdit,
}: SceneMapListViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const startRename = (map: SceneMapRow) => {
    setEditingId(map.id);
    setEditingName(map.name);
  };

  const commitRename = () => {
    if (editingId && editingName.trim()) {
      onRename(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${mm}/${dd} ${hh}:${min}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
        <h2 className="text-lg font-bold text-gray-900">災害現場図</h2>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-200"
          aria-label="閉じる"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
              <p>読み込み中...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* New map card */}
            {canEdit && (
              <button
                onClick={onCreateNew}
                className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-blue-400 hover:bg-blue-50"
              >
                <svg
                  className="mb-2 h-10 w-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-500">新規作成</span>
              </button>
            )}

            {/* Map cards */}
            {maps.map((map) => (
              <div
                key={map.id}
                className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                onClick={() => onSelect(map)}
              >
                {/* Thumbnail (4:3 aspect ratio) */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  {map.thumbnail ? (
                    <Image
                      src={map.thumbnail}
                      alt={map.name}
                      width={360}
                      height={270}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <svg
                        className="h-12 w-12 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-3 py-2">
                  {editingId === map.id ? (
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full rounded border border-blue-400 px-1 py-0.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <p
                      className="truncate text-sm font-medium text-gray-900"
                      onDoubleClick={(e) => {
                        if (canEdit) {
                          e.stopPropagation();
                          startRename(map);
                        }
                      }}
                    >
                      {map.name}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-gray-500">{formatTime(map.updated_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
