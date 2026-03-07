'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Group, Circle, Text, Rect, Line } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';
import { Pencil } from 'lucide-react';
import {
  SceneMapData,
  Stroke,
  PlacedIcon,
  PlacedLabel,
  PlacedAnnotation,
  createEmptySceneMapData,
} from './types';
import { getIconDefinition } from './icons';
import IconRenderer from './iconRenderer';
import GridLayer from './GridLayer';
import IconPalette from './IconPalette';
import DrawingToolbar from './DrawingToolbar';

interface SceneMapEditorProps {
  initialData: SceneMapData | null;
  mapName: string;
  onSave: (data: SceneMapData, name: string, thumbnail: string | null) => Promise<void>;
  onBack: () => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  targetId: string;
  targetType: 'icon' | 'label' | 'annotation';
}

export default function SceneMapEditor({
  initialData,
  mapName,
  onSave,
  onBack,
}: SceneMapEditorProps) {
  const [data, setData] = useState<SceneMapData>(initialData || createEmptySceneMapData());
  const name = mapName;
  const [paletteSelection, setPaletteSelection] = useState<string | null>(null);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelInputText, setLabelInputText] = useState('');
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);
  const [annotationInputText, setAnnotationInputText] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [paletteOpen, setPaletteOpen] = useState(true);

  // Drawing mode state
  const [drawingMode, setDrawingMode] = useState<'off' | 'pen' | 'eraser'>('off');
  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(2);
  const [currentStroke, setCurrentStroke] = useState<number[] | null>(null);
  const isDrawing = drawingMode !== 'off';

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const isDirtyRef = useRef(false);
  const dataRef = useRef(data);
  const onSaveRef = useRef(onSave);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressStartRef = useRef<{ x: number; y: number } | null>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);

  // Keep refs in sync
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Stage size
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      resizeCleanupRef.current?.();
    };
  }, []);

  // Auto-save on initial load of existing map to generate thumbnail
  useEffect(() => {
    if (initialData) {
      const timer = setTimeout(() => {
        isDirtyRef.current = true;
        performSaveRef.current();
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Thumbnail generation (content-aware cropping)
  const generateThumbnail = useCallback(async (): Promise<string | null> => {
    const stage = stageRef.current;
    if (!stage) return null;
    try {
      const d = dataRef.current;

      // Compute content bounding box
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      const expand = (x1: number, y1: number, x2: number, y2: number) => {
        if (x1 < minX) minX = x1;
        if (y1 < minY) minY = y1;
        if (x2 > maxX) maxX = x2;
        if (y2 > maxY) maxY = y2;
      };

      for (const icon of d.icons) {
        const def = getIconDefinition(icon.type);
        const w = (icon.width ?? def?.canvasWidth ?? 40) * icon.scale;
        const h = (icon.height ?? def?.canvasHeight ?? 40) * icon.scale;
        const r = Math.max(w, h) / 2;
        expand(icon.x - r, icon.y - r, icon.x + r, icon.y + r);
      }
      for (const label of d.labels) {
        const fs = label.fontSize ?? 16;
        const tw = Math.max(60, label.text.length * fs * 0.6);
        expand(label.x, label.y, label.x + tw, label.y + fs * 1.2);
      }
      for (const ann of d.annotations) {
        expand(ann.x - 14, ann.y - 14, ann.x + 14, ann.y + 14);
        if (ann.showBubble && ann.text) {
          const bw = Math.max(120, ann.text.length * 12 + 16);
          expand(ann.x + 18, ann.y - 20, ann.x + 18 + bw, ann.y + 8);
        }
      }

      // Fallback: full stage if no content
      if (!isFinite(minX)) {
        const dataUrl = stage.toDataURL({ pixelRatio: 0.5 });
        return new Promise<string | null>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 360;
            canvas.height = 270;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(null);
              return;
            }
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 360, 270);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.onerror = () => resolve(null);
          img.src = dataUrl;
        });
      }

      // Add padding and enforce 4:3 aspect ratio
      const pad = 30;
      minX -= pad;
      minY -= pad;
      maxX += pad;
      maxY += pad;
      let cw = maxX - minX;
      let ch = maxY - minY;
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const ratio = 4 / 3;
      if (cw / ch > ratio) {
        ch = cw / ratio;
      } else {
        cw = ch * ratio;
      }
      const cropX = cx - cw / 2;
      const cropY = cy - ch / 2;

      // Temporarily reset stage transform for accurate capture
      const origScaleX = stage.scaleX();
      const origScaleY = stage.scaleY();
      const origX = stage.x();
      const origY = stage.y();
      stage.scaleX(1);
      stage.scaleY(1);
      stage.x(0);
      stage.y(0);

      const pixelRatio = Math.min(2, Math.max(0.5, 360 / cw));
      const dataUrl = stage.toDataURL({
        x: cropX,
        y: cropY,
        width: cw,
        height: ch,
        pixelRatio,
      });

      // Restore stage transform
      stage.scaleX(origScaleX);
      stage.scaleY(origScaleY);
      stage.x(origX);
      stage.y(origY);

      return new Promise<string | null>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 360;
          canvas.height = 270;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 360, 270);
          const s = Math.min(360 / img.width, 270 / img.height);
          const w = img.width * s;
          const h = img.height * s;
          ctx.drawImage(img, (360 - w) / 2, (270 - h) / 2, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => resolve(null);
        img.src = dataUrl;
      });
    } catch {
      return null;
    }
  }, []);

  // Perform save
  const performSave = useCallback(async () => {
    if (!isDirtyRef.current) return;
    setSaveStatus('saving');
    try {
      const thumbnail = await generateThumbnail();
      await onSaveRef.current(dataRef.current, name, thumbnail);
      isDirtyRef.current = false;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev)), 2000);
    } catch {
      setSaveStatus('error');
    }
  }, [name, generateThumbnail]);

  // Keep performSave ref fresh for auto-save timer
  const performSaveRef = useRef(performSave);
  useEffect(() => {
    performSaveRef.current = performSave;
  }, [performSave]);

  // Data change tracker + auto-save trigger
  const setDataDirty = useCallback((updater: (prev: SceneMapData) => SceneMapData) => {
    setData(updater);
    isDirtyRef.current = true;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      performSaveRef.current();
    }, 2000);
  }, []);

  // Handle back (flush save)
  const handleBack = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (isDirtyRef.current) {
      performSaveRef.current();
    }
    onBack();
  }, [onBack]);

  // Hit test for context menu
  const findElementAtPosition = useCallback((canvasX: number, canvasY: number) => {
    const d = dataRef.current;
    // Check annotations (circles radius 14, use 20px tolerance)
    for (const ann of d.annotations) {
      const dx = canvasX - ann.x;
      const dy = canvasY - ann.y;
      if (Math.sqrt(dx * dx + dy * dy) < 24) {
        return { id: ann.id, type: 'annotation' as const };
      }
    }
    // Check labels
    for (const label of d.labels) {
      const w = label.text.length * label.fontSize * 0.6 + 16;
      const h = label.fontSize + 16;
      if (
        canvasX >= label.x - 8 &&
        canvasX <= label.x + w &&
        canvasY >= label.y - 8 &&
        canvasY <= label.y + h
      ) {
        return { id: label.id, type: 'label' as const };
      }
    }
    // Check icons (reverse for z-order)
    for (const icon of [...d.icons].reverse()) {
      const def = getIconDefinition(icon.type);
      if (!def) continue;
      const halfW = ((icon.width ?? def.canvasWidth) * icon.scale) / 2 + 8;
      const halfH = ((icon.height ?? def.canvasHeight) * icon.scale) / 2 + 8;
      if (
        canvasX >= icon.x - halfW &&
        canvasX <= icon.x + halfW &&
        canvasY >= icon.y - halfH &&
        canvasY <= icon.y + halfH
      ) {
        return { id: icon.id, type: 'icon' as const };
      }
    }
    return null;
  }, []);

  // Cancel long press
  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressStartRef.current = null;
  }, []);

  // Stage pointer handlers for long press
  const handleStagePointerDown = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      // Only handle long press on elements, not on background
      if (e.target === e.target.getStage()) return;

      const stage = stageRef.current;
      if (!stage) return;
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      const transform = stage.getAbsoluteTransform().copy().invert();
      const canvasPos = transform.point(pointerPos);
      const hit = findElementAtPosition(canvasPos.x, canvasPos.y);
      if (!hit) return;

      longPressStartRef.current = { x: pointerPos.x, y: pointerPos.y };
      longPressTimerRef.current = setTimeout(() => {
        setContextMenu({
          x: pointerPos.x,
          y: pointerPos.y,
          targetId: hit.id,
          targetType: hit.type,
        });
        setSelectedIconId(hit.id);
        if (navigator.vibrate) navigator.vibrate(50);
        longPressTimerRef.current = null;
        longPressStartRef.current = null;
      }, 500);
    },
    [findElementAtPosition]
  );

  const handleStagePointerMove = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!longPressStartRef.current || !longPressTimerRef.current) return;
      const stage = stageRef.current;
      if (!stage) return;
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;
      const dx = pointerPos.x - longPressStartRef.current.x;
      const dy = pointerPos.y - longPressStartRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        cancelLongPress();
      }
    },
    [cancelLongPress]
  );

  // Cancel long press on drag start (bubbled from children)
  const handleDragStartBubble = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      cancelLongPress();
    },
    [cancelLongPress]
  );

  // Native right-click context menu
  const handleNativeContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const stage = stageRef.current;
      if (!stage || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const transform = stage.getAbsoluteTransform().copy().invert();
      const canvasPos = transform.point({ x, y });
      const hit = findElementAtPosition(canvasPos.x, canvasPos.y);
      if (hit) {
        setContextMenu({ x, y, targetId: hit.id, targetType: hit.type });
        setSelectedIconId(hit.id);
      }
    },
    [findElementAtPosition]
  );

  // Canvas tap for icon placement (stamp mode)
  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (e.target !== e.target.getStage()) return;
      setSelectedIconId(null);
      setContextMenu(null);

      if (!paletteSelection) return;

      const stage = e.target.getStage();
      if (!stage) return;
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;
      const transform = stage.getAbsoluteTransform().copy().invert();
      const pos = transform.point(pointerPos);

      if (paletteSelection === 'text_label') {
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
        const nextNum = dataRef.current.annotationCounter + 1;
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
        return;
      }

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
    [paletteSelection, setDataDirty]
  );

  // Zoom
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

  // Stage drag
  const handleStageDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
    if (e.target !== e.target.getStage()) return;
    setData((prev) => ({
      ...prev,
      stage: { ...prev.stage, position: { x: e.target.x(), y: e.target.y() } },
    }));
  }, []);

  // Element drags
  const handleIconDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      setDataDirty((prev) => ({
        ...prev,
        icons: prev.icons.map((icon) => (icon.id === id ? { ...icon, x, y } : icon)),
      }));
    },
    [setDataDirty]
  );

  // Excel式リサイズ: ドラッグした辺だけが動き、反対側は固定
  const handleResizeStart = useCallback(
    (iconId: string, edge: 'right' | 'left' | 'top' | 'bottom') => {
      const icon = dataRef.current.icons.find((i) => i.id === iconId);
      if (!icon) return;
      const def = getIconDefinition(icon.type);
      if (!def) return;

      const stage = stageRef.current;
      if (!stage) return;
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;
      const transform = stage.getAbsoluteTransform().copy().invert();
      const startCanvas = transform.point(pointerPos);

      const startW = icon.width ?? def.canvasWidth;
      const startH = icon.height ?? def.canvasHeight;
      const startX = icon.x;
      const startY = icon.y;
      const θ = (icon.rotation * Math.PI) / 180;
      const cosθ = Math.cos(θ);
      const sinθ = Math.sin(θ);
      const s = icon.scale;

      const MIN_W = 30;
      const MIN_H = 20;

      const moveHandler = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

        const stageInst = stageRef.current;
        if (!stageInst) return;
        const container = stageInst.container();
        const rect = container.getBoundingClientRect();
        const xform = stageInst.getAbsoluteTransform().copy().invert();
        const cur = xform.point({ x: clientX - rect.left, y: clientY - rect.top });

        const dx = cur.x - startCanvas.x;
        const dy = cur.y - startCanvas.y;

        // キャンバス空間のデルタをアイコンのローカル軸に射影
        const deltaLocalX = (dx * cosθ + dy * sinθ) / s;
        const deltaLocalY = (-dx * sinθ + dy * cosθ) / s;

        let newW = startW;
        let newH = startH;
        let newX = startX;
        let newY = startY;

        if (edge === 'right') {
          newW = Math.max(MIN_W, startW + deltaLocalX);
          const dw = newW - startW;
          newX = startX + (dw / 2) * s * cosθ;
          newY = startY + (dw / 2) * s * sinθ;
        } else if (edge === 'left') {
          newW = Math.max(MIN_W, startW - deltaLocalX);
          const dw = newW - startW;
          newX = startX - (dw / 2) * s * cosθ;
          newY = startY - (dw / 2) * s * sinθ;
        } else if (edge === 'bottom') {
          newH = Math.max(MIN_H, startH + deltaLocalY);
          const dh = newH - startH;
          newX = startX + (dh / 2) * s * -sinθ;
          newY = startY + (dh / 2) * s * cosθ;
        } else if (edge === 'top') {
          newH = Math.max(MIN_H, startH - deltaLocalY);
          const dh = newH - startH;
          newX = startX - (dh / 2) * s * -sinθ;
          newY = startY - (dh / 2) * s * cosθ;
        }

        setDataDirty((prev) => ({
          ...prev,
          icons: prev.icons.map((ic) =>
            ic.id === iconId ? { ...ic, x: newX, y: newY, width: newW, height: newH } : ic
          ),
        }));
      };

      const endHandler = () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', endHandler);
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('touchend', endHandler);
        resizeCleanupRef.current = null;
      };

      resizeCleanupRef.current = endHandler;

      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', endHandler);
      document.addEventListener('touchmove', moveHandler, { passive: false });
      document.addEventListener('touchend', endHandler);
    },
    [setDataDirty]
  );

  const handleAnnotationDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      setDataDirty((prev) => ({
        ...prev,
        annotations: prev.annotations.map((a) => (a.id === id ? { ...a, x, y } : a)),
      }));
    },
    [setDataDirty]
  );

  const handleLabelDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      setDataDirty((prev) => ({
        ...prev,
        labels: prev.labels.map((l) => (l.id === id ? { ...l, x, y } : l)),
      }));
    },
    [setDataDirty]
  );

  // Context menu actions
  const handleRotate = useCallback(
    (targetId: string) => {
      setDataDirty((prev) => ({
        ...prev,
        icons: prev.icons.map((i) =>
          i.id === targetId ? { ...i, rotation: (i.rotation + 15) % 360 } : i
        ),
        labels: prev.labels.map((l) =>
          l.id === targetId ? { ...l, rotation: (l.rotation + 15) % 360 } : l
        ),
      }));
      setContextMenu(null);
    },
    [setDataDirty]
  );

  const handleBringToFront = useCallback(
    (targetId: string) => {
      setDataDirty((prev) => {
        const idx = prev.icons.findIndex((i) => i.id === targetId);
        if (idx >= 0 && idx < prev.icons.length - 1) {
          const newIcons = [...prev.icons];
          const [item] = newIcons.splice(idx, 1);
          newIcons.push(item);
          return { ...prev, icons: newIcons };
        }
        return prev;
      });
      setContextMenu(null);
    },
    [setDataDirty]
  );

  const handleSendToBack = useCallback(
    (targetId: string) => {
      setDataDirty((prev) => {
        const idx = prev.icons.findIndex((i) => i.id === targetId);
        if (idx > 0) {
          const newIcons = [...prev.icons];
          const [item] = newIcons.splice(idx, 1);
          newIcons.unshift(item);
          return { ...prev, icons: newIcons };
        }
        return prev;
      });
      setContextMenu(null);
    },
    [setDataDirty]
  );

  const handleDelete = useCallback(
    (targetId: string) => {
      setDataDirty((prev) => {
        const newAnnotations = prev.annotations
          .filter((a) => a.id !== targetId)
          .map((a, i) => ({ ...a, number: i + 1 }));
        return {
          ...prev,
          icons: prev.icons.filter((i) => i.id !== targetId),
          labels: prev.labels.filter((l) => l.id !== targetId),
          annotations: newAnnotations,
          annotationCounter: newAnnotations.length,
        };
      });
      setSelectedIconId(null);
      setContextMenu(null);
    },
    [setDataDirty]
  );

  const handleToggleGrid = useCallback(() => {
    setDataDirty((prev) => ({ ...prev, showGrid: !prev.showGrid }));
  }, [setDataDirty]);

  // Drawing mode toggle
  const toggleDrawingMode = useCallback(() => {
    if (drawingMode === 'off') {
      setDrawingMode('pen');
      setPaletteSelection(null);
      setPaletteOpen(false);
      setSelectedIconId(null);
      setContextMenu(null);
    } else {
      setDrawingMode('off');
      setCurrentStroke(null);
    }
  }, [drawingMode]);

  // Drawing pointer handlers
  const handleDrawPointerDown = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;
      const transform = stage.getAbsoluteTransform().copy().invert();
      const pos = transform.point(pointerPos);

      if (drawingMode === 'pen') {
        setCurrentStroke([pos.x, pos.y]);
      } else if (drawingMode === 'eraser') {
        // Erase strokes at this point
        const threshold = 15;
        setDataDirty((prev) => {
          const remaining = (prev.strokes ?? []).filter((s) => {
            for (let i = 0; i < s.points.length; i += 2) {
              const dx = pos.x - s.points[i];
              const dy = pos.y - s.points[i + 1];
              if (Math.sqrt(dx * dx + dy * dy) < s.strokeWidth + threshold) {
                return false;
              }
            }
            return true;
          });
          if (remaining.length === (prev.strokes ?? []).length) return prev;
          return { ...prev, strokes: remaining };
        });
      }
    },
    [drawingMode, setDataDirty]
  );

  const handleDrawPointerMove = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;
      const transform = stage.getAbsoluteTransform().copy().invert();
      const pos = transform.point(pointerPos);

      if (drawingMode === 'pen' && currentStroke) {
        setCurrentStroke((prev) => (prev ? [...prev, pos.x, pos.y] : null));
      } else if (drawingMode === 'eraser') {
        const threshold = 15;
        setDataDirty((prev) => {
          const remaining = (prev.strokes ?? []).filter((s) => {
            for (let i = 0; i < s.points.length; i += 2) {
              const dx = pos.x - s.points[i];
              const dy = pos.y - s.points[i + 1];
              if (Math.sqrt(dx * dx + dy * dy) < s.strokeWidth + threshold) {
                return false;
              }
            }
            return true;
          });
          if (remaining.length === (prev.strokes ?? []).length) return prev;
          return { ...prev, strokes: remaining };
        });
      }
    },
    [drawingMode, currentStroke, setDataDirty]
  );

  const handleDrawPointerUp = useCallback(() => {
    if (drawingMode === 'pen' && currentStroke && currentStroke.length >= 4) {
      const newStroke: Stroke = {
        id: genId(),
        points: currentStroke,
        color: penColor,
        strokeWidth: penWidth,
      };
      setDataDirty((prev) => ({
        ...prev,
        strokes: [...(prev.strokes ?? []), newStroke],
      }));
    }
    setCurrentStroke(null);
  }, [drawingMode, currentStroke, penColor, penWidth, setDataDirty]);

  // Annotation bubble toggle
  const toggleAnnotationBubble = useCallback(
    (id: string) => {
      setDataDirty((prev) => ({
        ...prev,
        annotations: prev.annotations.map((a) =>
          a.id === id ? { ...a, showBubble: !a.showBubble } : a
        ),
      }));
    },
    [setDataDirty]
  );

  // Annotation text update
  const updateAnnotationText = useCallback(
    (id: string, text: string) => {
      setDataDirty((prev) => ({
        ...prev,
        annotations: prev.annotations.map((a) => (a.id === id ? { ...a, text } : a)),
      }));
    },
    [setDataDirty]
  );

  // Label editing
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

  // Annotation inline editing
  const startAnnotationEdit = useCallback((id: string) => {
    const ann = dataRef.current.annotations.find((a) => a.id === id);
    if (ann) {
      setEditingAnnotationId(id);
      setAnnotationInputText(ann.text);
    }
  }, []);

  const commitAnnotationEdit = useCallback(
    (id: string) => {
      updateAnnotationText(id, annotationInputText);
      setEditingAnnotationId(null);
      setAnnotationInputText('');
    },
    [annotationInputText, updateAnnotationText]
  );

  // Context menu edit action
  const handleEditFromContextMenu = useCallback(
    (targetId: string, targetType: string) => {
      if (targetType === 'label') {
        const label = dataRef.current.labels.find((l) => l.id === targetId);
        if (label) {
          setEditingLabel(label.id);
          setLabelInputText(label.text);
        }
      } else if (targetType === 'annotation') {
        startAnnotationEdit(targetId);
      }
      setContextMenu(null);
    },
    [startAnnotationEdit]
  );

  // Save status text
  const saveStatusText =
    saveStatus === 'saving'
      ? '保存中...'
      : saveStatus === 'saved'
        ? '保存済み'
        : saveStatus === 'error'
          ? '保存失敗'
          : '';

  return (
    <div className="relative h-full w-full bg-white">
      {/* Fullscreen Canvas */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          touchAction: isDrawing ? 'none' : 'auto',
          cursor:
            drawingMode === 'pen' ? 'crosshair' : drawingMode === 'eraser' ? 'pointer' : 'default',
        }}
        onContextMenu={handleNativeContextMenu}
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={data.stage.scale}
          scaleY={data.stage.scale}
          x={data.stage.position.x}
          y={data.stage.position.y}
          draggable={!isDrawing}
          onClick={isDrawing ? undefined : handleStageClick}
          onTap={isDrawing ? undefined : handleStageClick}
          onWheel={handleWheel}
          onDragEnd={handleStageDragEnd}
          onMouseDown={isDrawing ? handleDrawPointerDown : handleStagePointerDown}
          onTouchStart={isDrawing ? handleDrawPointerDown : handleStagePointerDown}
          onMouseMove={isDrawing ? handleDrawPointerMove : handleStagePointerMove}
          onTouchMove={isDrawing ? handleDrawPointerMove : handleStagePointerMove}
          onMouseUp={isDrawing ? handleDrawPointerUp : cancelLongPress}
          onTouchEnd={isDrawing ? handleDrawPointerUp : cancelLongPress}
          onDragStart={handleDragStartBubble}
        >
          <Layer>
            {data.showGrid && (
              <GridLayer
                width={stageSize.width}
                height={stageSize.height}
                stageScale={data.stage.scale}
                stageX={data.stage.position.x}
                stageY={data.stage.position.y}
              />
            )}

            {/* Strokes (behind icons) */}
            {(data.strokes ?? []).map((stroke) => (
              <Line
                key={stroke.id}
                points={stroke.points}
                stroke={stroke.color}
                strokeWidth={stroke.strokeWidth}
                lineCap="round"
                lineJoin="round"
                tension={0.5}
                listening={false}
              />
            ))}

            {/* Current stroke being drawn */}
            {currentStroke && drawingMode === 'pen' && (
              <Line
                points={currentStroke}
                stroke={penColor}
                strokeWidth={penWidth}
                lineCap="round"
                lineJoin="round"
                tension={0.5}
                listening={false}
              />
            )}

            {/* Icons */}
            {data.icons.map((icon) => (
              <IconRenderer
                key={icon.id}
                type={icon.type}
                x={icon.x}
                y={icon.y}
                rotation={icon.rotation}
                scale={icon.scale}
                width={icon.width}
                height={icon.height}
                draggable={!isDrawing}
                isSelected={!isDrawing && selectedIconId === icon.id}
                onSelect={isDrawing ? undefined : () => setSelectedIconId(icon.id)}
                onDragEnd={(x, y) => handleIconDragEnd(icon.id, x, y)}
                onResizeStart={isDrawing ? undefined : (edge) => handleResizeStart(icon.id, edge)}
              />
            ))}

            {/* Labels */}
            {data.labels.map((label) => (
              <Group
                key={label.id}
                x={label.x}
                y={label.y}
                rotation={label.rotation}
                draggable={!isDrawing}
                listening={!isDrawing}
                onClick={() => setSelectedIconId(label.id)}
                onTap={() => setSelectedIconId(label.id)}
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

            {/* Annotations */}
            {data.annotations.map((ann) => (
              <Group
                key={ann.id}
                x={ann.x}
                y={ann.y}
                draggable={!isDrawing}
                listening={!isDrawing}
                onClick={(e) => {
                  e.cancelBubble = true;
                  toggleAnnotationBubble(ann.id);
                  setSelectedIconId(ann.id);
                }}
                onTap={(e) => {
                  e.cancelBubble = true;
                  toggleAnnotationBubble(ann.id);
                  setSelectedIconId(ann.id);
                }}
                onDragEnd={(e) => handleAnnotationDragEnd(ann.id, e.target.x(), e.target.y())}
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
                {/* Bubble */}
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
                {/* Selection highlight */}
                {selectedIconId === ann.id && (
                  <Circle x={0} y={0} radius={18} stroke="#3b82f6" strokeWidth={2} dash={[4, 2]} />
                )}
              </Group>
            ))}
          </Layer>
        </Stage>

        {/* Label editing overlay */}
        {editingLabel &&
          (() => {
            const label = data.labels.find((l) => l.id === editingLabel);
            if (!label) return null;
            const stageX = data.stage.position.x + label.x * data.stage.scale;
            const stageY = data.stage.position.y + label.y * data.stage.scale;
            return (
              <div className="absolute z-30" style={{ left: stageX, top: stageY }}>
                <input
                  autoFocus
                  value={labelInputText}
                  onChange={(e) => setLabelInputText(e.target.value)}
                  onBlur={() => commitLabelEdit(editingLabel)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitLabelEdit(editingLabel);
                  }}
                  className="rounded border border-blue-400 bg-white px-2 py-1 text-sm text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            );
          })()}

        {/* Annotation editing overlay */}
        {editingAnnotationId &&
          (() => {
            const ann = data.annotations.find((a) => a.id === editingAnnotationId);
            if (!ann) return null;
            const stageX = data.stage.position.x + (ann.x + 18) * data.stage.scale;
            const stageY = data.stage.position.y + (ann.y - 20) * data.stage.scale;
            return (
              <div className="absolute z-30" style={{ left: stageX, top: stageY }}>
                <input
                  autoFocus
                  value={annotationInputText}
                  onChange={(e) => setAnnotationInputText(e.target.value)}
                  onBlur={() => commitAnnotationEdit(editingAnnotationId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitAnnotationEdit(editingAnnotationId);
                  }}
                  placeholder="注釈を入力..."
                  className="w-48 rounded border border-orange-400 bg-white px-2 py-1 text-sm text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            );
          })()}
      </div>

      {/* Context menu transparent overlay (blocks canvas interaction) */}
      {contextMenu && (
        <div
          className="absolute inset-0 z-20"
          onClick={() => setContextMenu(null)}
          onTouchStart={() => setContextMenu(null)}
        />
      )}

      {/* Floating top bar */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-center justify-between p-3">
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md"
            aria-label="戻る"
          >
            <svg
              className="h-5 w-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="rounded-lg bg-white/90 px-3 py-1.5 text-sm text-gray-400 shadow-md">
            {name}
          </span>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          {saveStatusText && (
            <span
              className={`rounded-lg px-3 py-1.5 text-sm shadow-md ${
                saveStatus === 'error'
                  ? 'bg-red-100/90 text-red-700'
                  : saveStatus === 'saved'
                    ? 'bg-green-100/90 text-green-700'
                    : 'bg-white/90 text-gray-500'
              }`}
            >
              {saveStatusText}
            </span>
          )}
          <button
            onClick={handleToggleGrid}
            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md ${
              data.showGrid ? 'bg-blue-100/90 text-blue-700' : 'bg-white/90 text-gray-500'
            }`}
            aria-label="グリッド表示"
            title="グリッド表示"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h18v18H3V3zm6 0v18M15 3v18M3 9h18M3 15h18"
              />
            </svg>
          </button>
          <button
            onClick={toggleDrawingMode}
            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md ${
              isDrawing ? 'bg-blue-100/90 text-blue-700' : 'bg-white/90 text-gray-500'
            }`}
            aria-label="手書き入力"
            title="手書き入力"
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Floating palette */}
      <div className="pointer-events-none absolute bottom-16 left-3 top-16 z-30 flex items-start">
        {paletteOpen ? (
          <div className="pointer-events-auto flex max-h-full flex-col rounded-xl bg-white/95 shadow-lg">
            <div className="flex-1 overflow-y-auto p-1.5">
              <IconPalette
                selectedType={paletteSelection}
                onSelect={(type) => {
                  if (isDrawing) return;
                  setPaletteSelection(type || null);
                }}
              />
            </div>
            <button
              onClick={() => setPaletteOpen(false)}
              className="border-t px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
            >
              閉じる
            </button>
          </div>
        ) : (
          <button
            onClick={() => setPaletteOpen(true)}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-md"
            aria-label="パレットを開く"
          >
            <svg
              className="h-6 w-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Stamp mode indicator (hidden when drawing) */}
      {paletteSelection && !isDrawing && (
        <div className="pointer-events-auto absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm text-white shadow-lg">
            <span>
              配置モード: {getIconDefinition(paletteSelection)?.label || paletteSelection}
            </span>
            <button
              onClick={() => setPaletteSelection(null)}
              className="ml-1 rounded-full bg-blue-800 p-0.5 hover:bg-blue-900"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      )}

      {/* Drawing toolbar */}
      {isDrawing && (
        <DrawingToolbar
          mode={drawingMode as 'pen' | 'eraser'}
          onModeChange={setDrawingMode}
          color={penColor}
          onColorChange={setPenColor}
          width={penWidth}
          onWidthChange={setPenWidth}
        />
      )}

      {/* Context menu */}
      {contextMenu && (
        <div
          className="absolute z-40 min-w-[140px] rounded-lg bg-white py-1 shadow-xl ring-1 ring-black/10"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {contextMenu.targetType !== 'annotation' && (
            <button
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
              onClick={() => handleRotate(contextMenu.targetId)}
            >
              回転 15°
            </button>
          )}
          {contextMenu.targetType === 'icon' && (
            <>
              <button
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                onClick={() => handleBringToFront(contextMenu.targetId)}
              >
                前面へ
              </button>
              <button
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                onClick={() => handleSendToBack(contextMenu.targetId)}
              >
                背面へ
              </button>
            </>
          )}
          {(contextMenu.targetType === 'label' || contextMenu.targetType === 'annotation') && (
            <button
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
              onClick={() =>
                handleEditFromContextMenu(contextMenu.targetId, contextMenu.targetType)
              }
            >
              編集
            </button>
          )}
          <div className="my-1 border-t" />
          <button
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 active:bg-red-100"
            onClick={() => handleDelete(contextMenu.targetId)}
          >
            削除
          </button>
        </div>
      )}
    </div>
  );
}
