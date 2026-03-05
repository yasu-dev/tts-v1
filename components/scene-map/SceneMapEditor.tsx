'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Group, Circle, Text, Rect } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';
import {
  SceneMapData,
  PlacedIcon,
  PlacedLabel,
  PlacedAnnotation,
  createEmptySceneMapData,
} from './types';
import { getIconDefinition } from './icons';
import IconRenderer from './iconRenderer';
import GridLayer from './GridLayer';
import IconPalette from './IconPalette';
import CanvasToolbar from './CanvasToolbar';

interface SceneMapEditorProps {
  initialData: SceneMapData | null;
  mapName: string;
  onSave: (data: SceneMapData, name: string) => Promise<void>;
  onCreateNew: () => void;
  onClose: () => void;
}

export default function SceneMapEditor({
  initialData,
  mapName,
  onSave,
  onCreateNew,
  onClose,
}: SceneMapEditorProps) {
  const [data, setData] = useState<SceneMapData>(initialData || createEmptySceneMapData());
  const [name, setName] = useState(mapName);
  const [paletteSelection, setPaletteSelection] = useState<string | null>(null);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelInputText, setLabelInputText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // データ変更を追跡
  const setDataDirty = useCallback((updater: (prev: SceneMapData) => SceneMapData) => {
    setData(updater);
    setIsDirty(true);
  }, []);

  // 閉じる（未保存警告付き）
  const handleClose = useCallback(() => {
    if (isDirty && !confirm('未保存の変更があります。閉じますか？')) return;
    onClose();
  }, [isDirty, onClose]);

  // ステージサイズをコンテナに合わせる
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

  // ユニークID生成
  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // キャンバスタップでアイコン配置（スタンプ方式）
  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      // Stageの背景タップ（アイコン上でないタップ）のみ処理
      if (e.target !== e.target.getStage()) {
        return;
      }

      // 選択解除
      setSelectedIconId(null);

      if (!paletteSelection) return;

      const stage = e.target.getStage();
      if (!stage) return;
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      // ステージ変換を考慮した座標
      const transform = stage.getAbsoluteTransform().copy().invert();
      const pos = transform.point(pointerPos);

      if (paletteSelection === 'text_label') {
        // テキストラベル配置
        const newLabel: PlacedLabel = {
          id: genId(),
          text: 'テキスト',
          x: pos.x,
          y: pos.y,
          fontSize: 14,
          color: '#374151',
          rotation: 0,
        };
        setDataDirty((prev) => ({ ...prev, labels: [...prev.labels, newLabel] }));
        setEditingLabel(newLabel.id);
        setLabelInputText('テキスト');
        setPaletteSelection(null);
        return;
      }

      if (paletteSelection === 'annotation_stamp') {
        // アノテーション配置（自動採番）
        const nextNum = data.annotationCounter + 1;
        const newAnnotation: PlacedAnnotation = {
          id: genId(),
          number: nextNum,
          x: pos.x,
          y: pos.y,
          text: '',
          showBubble: true,
        };
        setDataDirty((prev) => ({
          ...prev,
          annotations: [...prev.annotations, newAnnotation],
          annotationCounter: nextNum,
        }));
        // 連続配置のため paletteSelection は維持
        return;
      }

      // 通常アイコン配置
      const newIcon: PlacedIcon = {
        id: genId(),
        type: paletteSelection,
        x: pos.x,
        y: pos.y,
        rotation: 0,
        scale: 1,
      };
      setDataDirty((prev) => ({ ...prev, icons: [...prev.icons, newIcon] }));
      setPaletteSelection(null);
    },
    [paletteSelection, data.annotationCounter, setDataDirty]
  );

  // ズーム（ホイール / ピンチ）
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

    setData((prev) => ({
      ...prev,
      stage: {
        scale: clampedScale,
        position: {
          x: pointer.x - mousePointTo.x * clampedScale,
          y: pointer.y - mousePointTo.y * clampedScale,
        },
      },
    }));
  }, []);

  // ステージドラッグ終了
  const handleStageDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
    if (e.target !== e.target.getStage()) return;
    setData((prev) => ({
      ...prev,
      stage: {
        ...prev.stage,
        position: { x: e.target.x(), y: e.target.y() },
      },
    }));
  }, []);

  // アイコン移動
  const handleIconDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      setDataDirty((prev) => ({
        ...prev,
        icons: prev.icons.map((icon) => (icon.id === id ? { ...icon, x, y } : icon)),
      }));
    },
    [setDataDirty]
  );

  // アノテーション移動
  const handleAnnotationDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      setDataDirty((prev) => ({
        ...prev,
        annotations: prev.annotations.map((a) => (a.id === id ? { ...a, x, y } : a)),
      }));
    },
    [setDataDirty]
  );

  // ラベル移動
  const handleLabelDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      setDataDirty((prev) => ({
        ...prev,
        labels: prev.labels.map((l) => (l.id === id ? { ...l, x, y } : l)),
      }));
    },
    [setDataDirty]
  );

  // 回転（15度刻み）
  const handleRotate = useCallback(() => {
    if (!selectedIconId) return;
    setDataDirty((prev) => ({
      ...prev,
      icons: prev.icons.map((icon) =>
        icon.id === selectedIconId ? { ...icon, rotation: (icon.rotation + 15) % 360 } : icon
      ),
      labels: prev.labels.map((l) =>
        l.id === selectedIconId ? { ...l, rotation: (l.rotation + 15) % 360 } : l
      ),
    }));
  }, [selectedIconId, setDataDirty]);

  // 前面へ移動
  const handleBringToFront = useCallback(() => {
    if (!selectedIconId) return;
    setDataDirty((prev) => {
      const idx = prev.icons.findIndex((i) => i.id === selectedIconId);
      if (idx >= 0 && idx < prev.icons.length - 1) {
        const newIcons = [...prev.icons];
        const [item] = newIcons.splice(idx, 1);
        newIcons.push(item);
        return { ...prev, icons: newIcons };
      }
      return prev;
    });
  }, [selectedIconId, setDataDirty]);

  // 背面へ移動
  const handleSendToBack = useCallback(() => {
    if (!selectedIconId) return;
    setDataDirty((prev) => {
      const idx = prev.icons.findIndex((i) => i.id === selectedIconId);
      if (idx > 0) {
        const newIcons = [...prev.icons];
        const [item] = newIcons.splice(idx, 1);
        newIcons.unshift(item);
        return { ...prev, icons: newIcons };
      }
      return prev;
    });
  }, [selectedIconId, setDataDirty]);

  // 削除（注釈は番号を詰め直す）
  const handleDelete = useCallback(() => {
    if (!selectedIconId) return;
    setDataDirty((prev) => {
      const newAnnotations = prev.annotations
        .filter((a) => a.id !== selectedIconId)
        .map((a, i) => ({ ...a, number: i + 1 }));
      return {
        ...prev,
        icons: prev.icons.filter((i) => i.id !== selectedIconId),
        labels: prev.labels.filter((l) => l.id !== selectedIconId),
        annotations: newAnnotations,
        annotationCounter: newAnnotations.length,
      };
    });
    setSelectedIconId(null);
  }, [selectedIconId, setDataDirty]);

  // グリッドトグル
  const handleToggleGrid = useCallback(() => {
    setDataDirty((prev) => ({ ...prev, showGrid: !prev.showGrid }));
  }, [setDataDirty]);

  // 保存
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(data, name);
      setIsDirty(false);
    } finally {
      setSaving(false);
    }
  };

  // 注釈テキスト更新
  const updateAnnotationText = useCallback(
    (id: string, text: string) => {
      setDataDirty((prev) => ({
        ...prev,
        annotations: prev.annotations.map((a) => (a.id === id ? { ...a, text } : a)),
      }));
    },
    [setDataDirty]
  );

  // 注釈吹き出し一括表示/非表示
  const toggleAllBubbles = useCallback(
    (show: boolean) => {
      setDataDirty((prev) => ({
        ...prev,
        annotations: prev.annotations.map((a) => ({ ...a, showBubble: show })),
      }));
    },
    [setDataDirty]
  );

  // テキストラベル編集確定
  const commitLabelEdit = useCallback(
    (id: string) => {
      setDataDirty((prev) => ({
        ...prev,
        labels: prev.labels.map((l) =>
          l.id === id ? { ...l, text: labelInputText || 'テキスト' } : l
        ),
      }));
      setEditingLabel(null);
      setLabelInputText('');
    },
    [labelInputText, setDataDirty]
  );

  // テキストラベル編集開始（ツールバーから呼び出し用）
  const handleEditLabel = useCallback(() => {
    if (!selectedIconId) return;
    const label = data.labels.find((l) => l.id === selectedIconId);
    if (label) {
      setEditingLabel(label.id);
      setLabelInputText(label.text);
    }
  }, [selectedIconId, data.labels]);

  // 選択中アイコンのtype取得
  const selectedIconType =
    data.icons.find((i) => i.id === selectedIconId)?.type ||
    (data.labels.find((l) => l.id === selectedIconId) ? 'text_label' : null) ||
    (data.annotations.find((a) => a.id === selectedIconId) ? 'annotation_stamp' : null);

  const anyBubbleShown = data.annotations.some((a) => a.showBubble);

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b bg-gray-50 p-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900">災害現場図:</h2>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setIsDirty(true);
            }}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400"
            placeholder="図名を入力"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
          <button
            onClick={onCreateNew}
            className="rounded-lg bg-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            新規
          </button>
          <button
            onClick={handleClose}
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
      </div>

      {/* 本体（パレット + キャンバス） */}
      <div className="flex flex-1 overflow-hidden">
        {/* デスクトップ: サイドバーパレット */}
        <div className="hidden sm:block">
          <IconPalette selectedType={paletteSelection} onSelect={setPaletteSelection} />
        </div>

        {/* キャンバス + 注釈パネル */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* キャンバス */}
          <div ref={containerRef} className="relative flex-1 overflow-hidden bg-white">
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              scaleX={data.stage.scale}
              scaleY={data.stage.scale}
              x={data.stage.position.x}
              y={data.stage.position.y}
              draggable
              onClick={handleStageClick}
              onTap={handleStageClick}
              onWheel={handleWheel}
              onDragEnd={handleStageDragEnd}
            >
              <Layer>
                {/* グリッド */}
                {data.showGrid && (
                  <GridLayer
                    width={stageSize.width}
                    height={stageSize.height}
                    stageScale={data.stage.scale}
                    stageX={data.stage.position.x}
                    stageY={data.stage.position.y}
                  />
                )}

                {/* 配置済みアイコン */}
                {data.icons.map((icon) => (
                  <IconRenderer
                    key={icon.id}
                    type={icon.type}
                    x={icon.x}
                    y={icon.y}
                    rotation={icon.rotation}
                    scale={icon.scale}
                    draggable={true}
                    isSelected={selectedIconId === icon.id}
                    onSelect={() => setSelectedIconId(icon.id)}
                    onDragEnd={(x, y) => handleIconDragEnd(icon.id, x, y)}
                  />
                ))}

                {/* テキストラベル */}
                {data.labels.map((label) => (
                  <Group
                    key={label.id}
                    x={label.x}
                    y={label.y}
                    rotation={label.rotation}
                    draggable
                    onClick={() => {
                      setSelectedIconId(label.id);
                    }}
                    onTap={() => {
                      setSelectedIconId(label.id);
                    }}
                    onDblClick={() => {
                      setEditingLabel(label.id);
                      setLabelInputText(label.text);
                    }}
                    onDblTap={() => {
                      setEditingLabel(label.id);
                      setLabelInputText(label.text);
                    }}
                    onDragEnd={(e) => handleLabelDragEnd(label.id, e.target.x(), e.target.y())}
                  >
                    {selectedIconId === label.id && (
                      <Rect
                        x={-4}
                        y={-4}
                        width={label.text.length * label.fontSize * 0.6 + 8}
                        height={label.fontSize + 8}
                        stroke="#3b82f6"
                        strokeWidth={1.5}
                        dash={[4, 2]}
                        cornerRadius={2}
                      />
                    )}
                    <Text text={label.text} fontSize={label.fontSize} fill={label.color} />
                  </Group>
                ))}

                {/* アノテーション */}
                {data.annotations.map((ann) => (
                  <Group
                    key={ann.id}
                    x={ann.x}
                    y={ann.y}
                    draggable
                    onClick={() => setSelectedIconId(ann.id)}
                    onTap={() => setSelectedIconId(ann.id)}
                    onDragEnd={(e) => handleAnnotationDragEnd(ann.id, e.target.x(), e.target.y())}
                  >
                    {/* マーカー */}
                    <Circle
                      x={0}
                      y={0}
                      radius={14}
                      fill="#fed7aa"
                      stroke="#f97316"
                      strokeWidth={2}
                    />
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
                    {/* 吹き出し */}
                    {ann.showBubble && ann.text && (
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
                    {/* 選択ハイライト */}
                    {selectedIconId === ann.id && (
                      <Circle
                        x={0}
                        y={0}
                        radius={18}
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dash={[4, 2]}
                      />
                    )}
                  </Group>
                ))}
              </Layer>
            </Stage>

            {/* テキスト編集用HTML overlay */}
            {editingLabel &&
              (() => {
                const label = data.labels.find((l) => l.id === editingLabel);
                if (!label) return null;
                const stageX = data.stage.position.x + label.x * data.stage.scale;
                const stageY = data.stage.position.y + label.y * data.stage.scale;
                return (
                  <div className="absolute z-10" style={{ left: stageX, top: stageY }}>
                    <input
                      autoFocus
                      value={labelInputText}
                      onChange={(e) => setLabelInputText(e.target.value)}
                      onBlur={() => commitLabelEdit(editingLabel)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitLabelEdit(editingLabel);
                      }}
                      className="rounded border border-blue-400 bg-white px-1 py-0.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                );
              })()}
          </div>

          {/* 注釈パネル */}
          {data.annotations.length > 0 && (
            <div className="max-h-32 overflow-y-auto border-t bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-600">注釈一覧</h4>
                <label className="flex items-center gap-1 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={anyBubbleShown}
                    onChange={(e) => toggleAllBubbles(e.target.checked)}
                    className="h-3 w-3 rounded"
                  />
                  吹き出し表示
                </label>
              </div>
              <div className="space-y-1.5">
                {data.annotations.map((ann) => (
                  <div key={ann.id} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-orange-400 bg-orange-100 text-[10px] font-bold text-orange-700">
                      {ann.number}
                    </span>
                    <input
                      type="text"
                      value={ann.text}
                      onChange={(e) => updateAnnotationText(ann.id, e.target.value)}
                      placeholder="注釈を入力..."
                      className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* モバイル: 下部パレット */}
      <div className="block sm:hidden">
        <div className="overflow-x-auto border-t bg-gray-50 px-2 py-1">
          <div className="flex gap-1">
            {/* モバイル用の横スクロールパレット - 主要アイコンのみ */}
            {[
              'vehicle_pump',
              'vehicle_ladder',
              'vehicle_ambulance',
              'vehicle_rescue',
              'facility_cp',
              'facility_aid',
              'facility_triage',
              'water_hydrant_above',
              'hazard_fire_origin',
              'hazard_danger',
              'hazard_victim',
              'structure_building_small',
              'structure_road',
              'direction_arrow',
              'direction_north',
              'annotation_stamp',
              'text_label',
            ].map((type) => {
              const def = getIconDefinition(type);
              if (!def) return null;
              const isActive = paletteSelection === type;
              return (
                <button
                  key={type}
                  onClick={() => setPaletteSelection(type)}
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border text-xs font-bold ${
                    isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                  }`}
                  title={def.label}
                >
                  {def.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ツールバー */}
      <CanvasToolbar
        selectedIconId={selectedIconId}
        selectedIconType={selectedIconType}
        showGrid={data.showGrid}
        onToggleGrid={handleToggleGrid}
        onRotate={handleRotate}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onEditLabel={handleEditLabel}
        onDelete={handleDelete}
      />
    </div>
  );
}
