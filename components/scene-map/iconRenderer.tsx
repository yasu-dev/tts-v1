import React from 'react';
import { Group, Rect, Text, Line, Circle, RegularPolygon } from 'react-konva';
import { getIconDefinition } from './icons';

interface IconRendererProps {
  type: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  draggable: boolean;
  isSelected: boolean;
  onSelect?: () => void;
  onDragEnd?: (x: number, y: number) => void;
}

export default function IconRenderer({
  type,
  x,
  y,
  rotation,
  scale,
  draggable,
  isSelected,
  onSelect,
  onDragEnd,
}: IconRendererProps) {
  const def = getIconDefinition(type);
  if (!def) return null;

  const w = def.canvasWidth;
  const h = def.canvasHeight;

  return (
    <Group
      x={x}
      y={y}
      rotation={rotation}
      scaleX={scale}
      scaleY={scale}
      draggable={draggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onDragEnd?.(e.target.x(), e.target.y());
      }}
    >
      {/* 選択ハイライト */}
      {isSelected && (
        <Rect
          x={-w / 2 - 4}
          y={-h / 2 - 4}
          width={w + 8}
          height={h + 8}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[6, 3]}
          cornerRadius={4}
        />
      )}
      {renderIconShape(type, w, h)}
    </Group>
  );
}

function renderIconShape(type: string, w: number, h: number): React.ReactNode {
  // --- 車両: 矩形+略号、赤い枠線 ---
  if (type.startsWith('vehicle_')) {
    const labelMap: Record<string, string> = {
      vehicle_pump: 'P',
      vehicle_ladder: 'L',
      vehicle_ambulance: 'A',
      vehicle_rescue: 'R',
      vehicle_command: '指揮',
      vehicle_tank: 'T',
      vehicle_chemical: 'C',
    };
    const label = labelMap[type] || '?';
    const fontSize = label.length > 1 ? 12 : 16;
    return (
      <>
        <Rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          fill="white"
          stroke="#ef4444"
          strokeWidth={2.5}
          cornerRadius={3}
        />
        <Text
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          text={label}
          fontSize={fontSize}
          fontStyle="bold"
          fill="#b91c1c"
          align="center"
          verticalAlign="middle"
        />
      </>
    );
  }

  // --- 施設 ---
  if (type === 'facility_cp') {
    return (
      <>
        <Rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          fill="white"
          stroke="#6b7280"
          strokeWidth={1.5}
          cornerRadius={3}
        />
        <Text
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          text="🚩本部"
          fontSize={11}
          fontStyle="bold"
          fill="#374151"
          align="center"
          verticalAlign="middle"
        />
      </>
    );
  }
  if (type === 'facility_aid') {
    return (
      <>
        <Rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          fill="white"
          stroke="#6b7280"
          strokeWidth={1.5}
          cornerRadius={3}
        />
        <Text
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          text="+救"
          fontSize={13}
          fontStyle="bold"
          fill="#dc2626"
          align="center"
          verticalAlign="middle"
        />
      </>
    );
  }
  if (type === 'facility_triage') {
    return (
      <>
        <Rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          fill="white"
          stroke="#6b7280"
          strokeWidth={1.5}
          cornerRadius={3}
        />
        <Text
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          text="+T"
          fontSize={13}
          fontStyle="bold"
          fill="#dc2626"
          align="center"
          verticalAlign="middle"
        />
      </>
    );
  }
  if (type === 'facility_staging') {
    return (
      <>
        <Rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          fill="white"
          stroke="#6b7280"
          strokeWidth={1.5}
          cornerRadius={3}
        />
        <Text
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          text="S"
          fontSize={16}
          fontStyle="bold"
          fill="#374151"
          align="center"
          verticalAlign="middle"
        />
      </>
    );
  }

  // --- 水利 ---
  if (type === 'water_hydrant_above') {
    return (
      <>
        <Circle x={0} y={0} radius={w / 2} fill="white" stroke="#3b82f6" strokeWidth={1.5} />
        <Text
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          text="H"
          fontSize={16}
          fontStyle="bold"
          fill="#1d4ed8"
          align="center"
          verticalAlign="middle"
        />
      </>
    );
  }
  if (type === 'water_hydrant_below') {
    return (
      <>
        <Circle x={0} y={0} radius={w / 2} fill="white" stroke="#3b82f6" strokeWidth={1.5} />
        <Circle x={0} y={0} radius={w / 2 - 4} stroke="#3b82f6" strokeWidth={1.5} fill="white" />
        <Text
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          text="H"
          fontSize={14}
          fontStyle="bold"
          fill="#1d4ed8"
          align="center"
          verticalAlign="middle"
        />
      </>
    );
  }
  if (type === 'water_cistern') {
    return (
      <>
        <Rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          fill="white"
          stroke="#3b82f6"
          strokeWidth={1.5}
          cornerRadius={2}
        />
        {/* 波線 */}
        <Line
          points={[-w / 4, 4, -w / 8, -2, 0, 4, w / 8, -2, w / 4, 4]}
          stroke="#3b82f6"
          strokeWidth={2}
          tension={0.4}
        />
      </>
    );
  }

  // --- 災害 ---
  if (type === 'hazard_fire_origin') {
    return (
      <>
        <Line points={[-12, -12, 12, 12]} stroke="#dc2626" strokeWidth={4} lineCap="round" />
        <Line points={[12, -12, -12, 12]} stroke="#dc2626" strokeWidth={4} lineCap="round" />
      </>
    );
  }
  if (type === 'hazard_spread') {
    return (
      <Rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        fill="rgba(239,68,68,0.25)"
        stroke="#ef4444"
        strokeWidth={1.5}
        cornerRadius={8}
      />
    );
  }
  if (type === 'hazard_danger') {
    return (
      <>
        <RegularPolygon
          x={0}
          y={0}
          sides={3}
          radius={w / 2}
          fill="#fef2f2"
          stroke="#dc2626"
          strokeWidth={2}
        />
        <Text
          x={-w / 2}
          y={-4}
          width={w}
          text="!"
          fontSize={18}
          fontStyle="bold"
          fill="#dc2626"
          align="center"
        />
      </>
    );
  }
  if (type === 'hazard_victim') {
    // 人型アイコン（シンプルな棒人間）
    return (
      <>
        <Circle x={0} y={-10} radius={6} fill="#dc2626" />
        <Line points={[0, -4, 0, 10]} stroke="#dc2626" strokeWidth={2.5} />
        <Line points={[-10, 2, 10, 2]} stroke="#dc2626" strokeWidth={2.5} />
        <Line points={[0, 10, -8, 20]} stroke="#dc2626" strokeWidth={2.5} />
        <Line points={[0, 10, 8, 20]} stroke="#dc2626" strokeWidth={2.5} />
      </>
    );
  }

  // --- 構造物 ---
  if (type === 'structure_building_small') {
    return (
      <Rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        fill="#f3f4f6"
        stroke="#9ca3af"
        strokeWidth={2}
        cornerRadius={2}
      />
    );
  }
  if (type === 'structure_building_large') {
    return (
      <Rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        fill="#f3f4f6"
        stroke="#9ca3af"
        strokeWidth={2}
        cornerRadius={2}
      />
    );
  }
  if (type === 'structure_road') {
    return (
      <Rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        fill="#d1d5db"
        cornerRadius={4}
        opacity={0.8}
      />
    );
  }

  // --- 方向 ---
  if (type === 'direction_arrow') {
    return (
      <>
        <Line points={[-25, 0, 20, 0]} stroke="#1f2937" strokeWidth={3} />
        <Line points={[12, -8, 25, 0, 12, 8]} stroke="#1f2937" strokeWidth={3} fill="#1f2937" />
      </>
    );
  }
  if (type === 'direction_water_stream') {
    return (
      <>
        <Line
          points={[-25, 0, -15, -4, -5, 4, 5, -4, 15, 0]}
          stroke="#3b82f6"
          strokeWidth={2.5}
          tension={0.4}
        />
        <Line points={[15, -6, 25, 0, 15, 6]} stroke="#3b82f6" strokeWidth={2.5} fill="#3b82f6" />
      </>
    );
  }
  if (type === 'direction_north') {
    return (
      <>
        <Text x={-8} y={-18} text="N" fontSize={14} fontStyle="bold" fill="#374151" />
        <Line points={[0, -4, 0, 16]} stroke="#374151" strokeWidth={2} />
        <Line points={[-5, 2, 0, -4, 5, 2]} stroke="#374151" strokeWidth={2} fill="#374151" />
      </>
    );
  }
  if (type === 'direction_wind') {
    // 吹き流し + 矢印
    return (
      <>
        <Line points={[-20, 0, 15, 0]} stroke="#6b7280" strokeWidth={2} />
        <Line points={[8, -5, 20, 0, 8, 5]} stroke="#6b7280" strokeWidth={2} fill="#6b7280" />
        {/* 吹き流し */}
        <Line points={[-20, -8, -12, -4, -20, 0]} stroke="#ef4444" strokeWidth={1.5} />
        <Line points={[-20, -8, -20, 0]} stroke="#ef4444" strokeWidth={2} />
      </>
    );
  }

  // フォールバック
  return (
    <Rect
      x={-w / 2}
      y={-h / 2}
      width={w}
      height={h}
      fill="#e5e7eb"
      stroke="#9ca3af"
      strokeWidth={1}
    />
  );
}
