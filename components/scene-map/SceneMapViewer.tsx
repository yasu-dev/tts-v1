'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Group, Circle, Text, Rect } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';
import { SceneMapData, createEmptySceneMapData } from './types';
import IconRenderer from './iconRenderer';
import GridLayer from './GridLayer';

interface SceneMapViewerProps {
  data: SceneMapData | null;
  mapName: string;
  updatedAt: string | null;
}

export default function SceneMapViewer({
  data: initialData,
  mapName,
  updatedAt,
}: SceneMapViewerProps) {
  const viewData = initialData || createEmptySceneMapData();
  const [scale, setScale] = useState(viewData.stage.scale);
  const [position, setPosition] = useState(viewData.stage.position);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [tappedAnnotation, setTappedAnnotation] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.08;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.2, Math.min(5, newScale));

    setScale(clampedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, []);

  const handleStageDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
    if (e.target !== e.target.getStage()) return;
    setPosition({ x: e.target.x(), y: e.target.y() });
  }, []);

  const formatUpdatedAt = (iso: string | null) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  const isEmpty =
    viewData.icons.length === 0 &&
    viewData.labels.length === 0 &&
    viewData.annotations.length === 0;

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b bg-gray-50 p-3">
        <h2 className="text-lg font-bold">災害現場図{mapName ? `: ${mapName}` : ''}</h2>
        {updatedAt && (
          <span className="text-sm text-gray-500">最終更新 {formatUpdatedAt(updatedAt)}</span>
        )}
      </div>

      {/* キャンバス */}
      <div ref={containerRef} className="relative flex-1 overflow-hidden bg-white">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-400">
              <svg
                className="mx-auto mb-4 h-16 w-16 opacity-50"
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
              <p className="text-lg font-medium">現場図はまだ作成されていません</p>
              <p className="mt-1 text-sm">指揮本部が現場図を作成すると、ここに表示されます</p>
            </div>
          </div>
        ) : (
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            draggable
            onWheel={handleWheel}
            onDragEnd={handleStageDragEnd}
            onClick={() => setTappedAnnotation(null)}
            onTap={() => setTappedAnnotation(null)}
          >
            <Layer>
              {/* グリッド */}
              {viewData.showGrid && (
                <GridLayer
                  width={stageSize.width}
                  height={stageSize.height}
                  stageScale={scale}
                  stageX={position.x}
                  stageY={position.y}
                />
              )}

              {/* アイコン（移動不可） */}
              {viewData.icons.map((icon) => (
                <IconRenderer
                  key={icon.id}
                  type={icon.type}
                  x={icon.x}
                  y={icon.y}
                  rotation={icon.rotation}
                  scale={icon.scale}
                  draggable={false}
                  isSelected={false}
                />
              ))}

              {/* テキストラベル */}
              {viewData.labels.map((label) => (
                <Text
                  key={label.id}
                  x={label.x}
                  y={label.y}
                  rotation={label.rotation}
                  text={label.text}
                  fontSize={label.fontSize}
                  fill={label.color}
                />
              ))}

              {/* アノテーション */}
              {viewData.annotations.map((ann) => (
                <Group
                  key={ann.id}
                  x={ann.x}
                  y={ann.y}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    setTappedAnnotation(tappedAnnotation === ann.id ? null : ann.id);
                  }}
                  onTap={(e) => {
                    e.cancelBubble = true;
                    setTappedAnnotation(tappedAnnotation === ann.id ? null : ann.id);
                  }}
                >
                  <Circle x={0} y={0} radius={14} fill="#fed7aa" stroke="#f97316" strokeWidth={2} />
                  <Text
                    x={-14}
                    y={-14}
                    width={28}
                    height={28}
                    text={String(ann.number)}
                    fontSize={12}
                    fontStyle="bold"
                    fill="#c2410c"
                    align="center"
                    verticalAlign="middle"
                  />
                  {/* 吹き出し（タップ時またはshowBubble時） */}
                  {(tappedAnnotation === ann.id || ann.showBubble) && ann.text && (
                    <Group x={18} y={-20}>
                      <Rect
                        x={0}
                        y={0}
                        width={Math.max(120, ann.text.length * 12 + 16)}
                        height={28}
                        fill="white"
                        stroke="#fdba74"
                        strokeWidth={1}
                        cornerRadius={6}
                        shadowBlur={4}
                        shadowColor="rgba(0,0,0,0.1)"
                        shadowOffsetY={2}
                      />
                      <Text x={8} y={6} text={ann.text} fontSize={11} fill="#374151" />
                    </Group>
                  )}
                </Group>
              ))}
            </Layer>
          </Stage>
        )}
      </div>

      {/* 注釈一覧（読み取り専用） */}
      {viewData.annotations.length > 0 && (
        <div className="max-h-28 overflow-y-auto border-t bg-gray-50 p-3">
          <h4 className="mb-1.5 text-xs font-bold text-gray-600">注釈一覧</h4>
          <div className="space-y-1">
            {viewData.annotations.map((ann) => (
              <div key={ann.id} className="flex items-center gap-2">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-orange-400 bg-orange-100 text-[10px] font-bold text-orange-700">
                  {ann.number}
                </span>
                <span className="text-xs text-gray-700">{ann.text || '（未入力）'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
