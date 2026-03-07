'use client';

import React from 'react';
import { Pencil, Eraser } from 'lucide-react';

interface DrawingToolbarProps {
  mode: 'pen' | 'eraser';
  onModeChange: (mode: 'pen' | 'eraser') => void;
  color: string;
  onColorChange: (color: string) => void;
  width: number;
  onWidthChange: (width: number) => void;
}

const COLORS = [
  { value: '#000000', label: '黒', tw: 'bg-black' },
  { value: '#ef4444', label: '赤', tw: 'bg-red-500' },
  { value: '#3b82f6', label: '青', tw: 'bg-blue-500' },
];

const WIDTHS = [
  { value: 2, label: '細字' },
  { value: 5, label: '太字' },
];

export default function DrawingToolbar({
  mode,
  onModeChange,
  color,
  onColorChange,
  width,
  onWidthChange,
}: DrawingToolbarProps) {
  return (
    <div className="pointer-events-auto absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-2xl bg-white/95 px-2 py-1.5 shadow-lg ring-1 ring-black/5">
        {/* Pen / Eraser */}
        <button
          onClick={() => onModeChange('pen')}
          className={`flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-colors ${
            mode === 'pen' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
          aria-label="書込"
        >
          <Pencil className="h-[18px] w-[18px]" />
          <span className="hidden sm:inline">書込</span>
        </button>
        <button
          onClick={() => onModeChange('eraser')}
          className={`flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-colors ${
            mode === 'eraser' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
          aria-label="消込"
        >
          <Eraser className="h-[18px] w-[18px]" />
          <span className="hidden sm:inline">消込</span>
        </button>

        {/* Separator */}
        <div className="mx-1 h-7 w-px bg-gray-200" />

        {/* Width */}
        {WIDTHS.map((w) => (
          <button
            key={w.value}
            onClick={() => onWidthChange(w.value)}
            className={`flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium transition-colors ${
              width === w.value ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label={w.label}
          >
            <span className="rounded-sm bg-current" style={{ width: 18, height: w.value }} />
            <span className="hidden sm:inline">{w.label}</span>
          </button>
        ))}

        {/* Separator */}
        <div className="mx-1 h-7 w-px bg-gray-200" />

        {/* Colors */}
        {COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => onColorChange(c.value)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
            aria-label={c.label}
          >
            <span
              className={`block h-[22px] w-[22px] rounded-full ${c.tw} ${
                color === c.value ? 'ring-2 ring-current ring-offset-2' : ''
              }`}
              style={{ color: c.value }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
