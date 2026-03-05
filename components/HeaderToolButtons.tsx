'use client';

import React, { useState } from 'react';
import MapModal from '@/components/MapModal';
import SceneMapModal from '@/components/scene-map/SceneMapModal';

interface HeaderToolButtonsProps {
  canEditSceneMap?: boolean;
}

export default function HeaderToolButtons({ canEditSceneMap = false }: HeaderToolButtonsProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isSceneMapOpen, setIsSceneMapOpen] = useState(false);

  return (
    <>
      {/* 地図ボタン */}
      <button
        onClick={() => setIsMapOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-white transition-colors hover:bg-white/10"
        style={{ minHeight: 44 }}
        aria-label="患者位置マップ"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="hidden text-sm font-medium sm:inline">地図</span>
      </button>

      {/* 現場図ボタン */}
      <button
        onClick={() => setIsSceneMapOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-white transition-colors hover:bg-white/10"
        style={{ minHeight: 44 }}
        aria-label="災害現場図"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <span className="hidden text-sm font-medium sm:inline">現場図</span>
      </button>

      {/* モーダル */}
      <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
      <SceneMapModal
        isOpen={isSceneMapOpen}
        onClose={() => setIsSceneMapOpen(false)}
        canEdit={canEditSceneMap}
      />
    </>
  );
}
