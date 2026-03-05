'use client';

import React from 'react';
import { getIconsByCategory, categoryLabels } from './icons';
import { IconCategory } from './types';

interface IconPaletteProps {
  selectedType: string | null;
  onSelect: (type: string) => void;
}

// カテゴリ表示順
const categoryOrder: IconCategory[] = [
  'vehicle',
  'facility',
  'water',
  'hazard',
  'structure',
  'direction',
  'annotation',
  'text',
];

export default function IconPalette({ selectedType, onSelect }: IconPaletteProps) {
  const grouped = getIconsByCategory();

  return (
    <div className="w-20 flex-shrink-0 space-y-3 overflow-y-auto border-r bg-gray-50 p-2">
      {categoryOrder.map((cat) => {
        const icons = grouped[cat];
        if (!icons || icons.length === 0) return null;
        return (
          <div key={cat}>
            <p className="mb-1 text-center text-[10px] font-bold text-gray-500">
              {categoryLabels[cat]}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {icons.map((icon) => {
                const isActive = selectedType === icon.type;
                return (
                  <button
                    key={icon.type}
                    onClick={() => onSelect(icon.type)}
                    className={`mx-auto flex items-center justify-center rounded transition-colors ${
                      icon.type === 'structure_road'
                        ? 'col-span-2 h-4 w-12 bg-gray-300 hover:bg-gray-400'
                        : `h-8 w-8 ${getPaletteStyle(icon.type, icon.category)}`
                    } ${isActive ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                    title={icon.label}
                  >
                    {icon.type !== 'structure_road' && (
                      <span className={getPaletteLabelStyle(icon.type, icon.category)}>
                        {icon.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getPaletteStyle(type: string, category: IconCategory): string {
  if (category === 'vehicle') {
    return 'border-2 border-red-500 hover:bg-red-50';
  }
  if (category === 'facility') {
    return 'border border-gray-400 hover:bg-gray-100';
  }
  if (category === 'water') {
    if (type === 'water_hydrant_above') {
      return 'rounded-full border border-blue-400 hover:bg-blue-50';
    }
    if (type === 'water_hydrant_below') {
      return 'rounded-full border-2 border-blue-400 hover:bg-blue-50';
    }
    return 'border border-blue-400 hover:bg-blue-50';
  }
  if (category === 'hazard') {
    if (type === 'hazard_fire_origin') return 'hover:bg-red-50';
    if (type === 'hazard_danger') return 'border border-red-400 hover:bg-red-50';
    return 'hover:bg-red-50';
  }
  if (category === 'structure') {
    return 'border-2 border-gray-400 hover:bg-gray-100';
  }
  if (category === 'direction') {
    if (type === 'direction_water_stream') return 'hover:bg-blue-50';
    return 'hover:bg-gray-100';
  }
  if (category === 'annotation') {
    return 'rounded-full border border-orange-400 bg-orange-100 hover:bg-orange-50';
  }
  if (category === 'text') {
    return 'border border-gray-400 hover:bg-gray-100';
  }
  return 'border border-gray-300 hover:bg-gray-100';
}

function getPaletteLabelStyle(type: string, category: IconCategory): string {
  const base = 'font-bold leading-none';
  if (category === 'vehicle') {
    const size = type === 'vehicle_command' ? 'text-[8px]' : 'text-xs';
    return `${base} ${size} text-red-700`;
  }
  if (type === 'facility_cp') return `${base} text-[8px] text-gray-700`;
  if (type === 'facility_aid' || type === 'facility_triage')
    return `${base} text-[10px] text-red-600`;
  if (type === 'facility_staging') return `${base} text-xs text-gray-700`;
  if (category === 'water') return `${base} text-xs text-blue-700`;
  if (type === 'hazard_fire_origin') return `${base} text-lg text-red-600`;
  if (type === 'hazard_danger') return `${base} text-sm text-red-600`;
  if (type === 'hazard_victim') return `${base} text-xs text-red-600`;
  if (type === 'hazard_spread') return `${base} text-[8px] text-red-500`;
  if (category === 'structure') return `${base} text-[8px] text-gray-500`;
  if (type === 'direction_arrow') return `${base} text-lg`;
  if (type === 'direction_water_stream') return `${base} text-sm text-blue-500`;
  if (type === 'direction_north') return `${base} text-xs text-gray-700`;
  if (type === 'direction_wind') return `${base} text-sm`;
  if (category === 'annotation') return `${base} text-xs text-orange-700`;
  if (category === 'text') return `${base} text-xs text-gray-600`;
  return `${base} text-xs text-gray-700`;
}
