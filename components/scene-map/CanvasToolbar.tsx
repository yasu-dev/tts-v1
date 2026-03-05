'use client';

import React from 'react';
import { getIconDefinition } from './icons';

interface CanvasToolbarProps {
  selectedIconId: string | null;
  selectedIconType: string | null;
  showGrid: boolean;
  onToggleGrid: () => void;
  onRotate: () => void;
  onDelete: () => void;
}

export default function CanvasToolbar({
  selectedIconId,
  selectedIconType,
  showGrid,
  onToggleGrid,
  onRotate,
  onDelete,
}: CanvasToolbarProps) {
  const def = selectedIconType ? getIconDefinition(selectedIconType) : null;

  return (
    <div className="flex items-center gap-4 border-t bg-gray-50 px-4 py-2">
      {selectedIconId && def ? (
        <>
          <span className="text-sm text-gray-600">
            選択中: <strong>{def.label}</strong>
          </span>
          <button
            onClick={onRotate}
            className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
          >
            ↺ 回転
          </button>
          <button
            onClick={onDelete}
            className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
          >
            削除
          </button>
        </>
      ) : (
        <span className="text-sm text-gray-400">アイコンを選択してください</span>
      )}
      <label className="ml-auto flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={showGrid}
          onChange={onToggleGrid}
          className="h-4 w-4 rounded"
        />
        グリッド表示
      </label>
    </div>
  );
}
