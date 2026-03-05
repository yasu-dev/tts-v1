import React from 'react';
import { Line } from 'react-konva';

interface GridLayerProps {
  width: number;
  height: number;
  gridSize?: number;
  stageScale: number;
  stageX: number;
  stageY: number;
}

export default function GridLayer({
  width,
  height,
  gridSize = 30,
  stageScale,
  stageX,
  stageY,
}: GridLayerProps) {
  const lines: React.ReactNode[] = [];

  // ステージ座標系でのキャンバス可視範囲を計算
  const startX = Math.floor(-stageX / stageScale / gridSize) * gridSize - gridSize;
  const endX = Math.ceil((width - stageX) / stageScale / gridSize) * gridSize + gridSize;
  const startY = Math.floor(-stageY / stageScale / gridSize) * gridSize - gridSize;
  const endY = Math.ceil((height - stageY) / stageScale / gridSize) * gridSize + gridSize;

  for (let x = startX; x <= endX; x += gridSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke="#e5e7eb"
        strokeWidth={0.5 / stageScale}
      />
    );
  }
  for (let y = startY; y <= endY; y += gridSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke="#e5e7eb"
        strokeWidth={0.5 / stageScale}
      />
    );
  }

  return <>{lines}</>;
}
