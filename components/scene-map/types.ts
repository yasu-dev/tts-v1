// 配置済みアイコン
export interface PlacedIcon {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

// テキストラベル
export interface PlacedLabel {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  rotation: number;
}

// アノテーション（番号スタンプ + 注釈テキスト）
export interface PlacedAnnotation {
  id: string;
  number: number;
  x: number;
  y: number;
  text: string;
  showBubble: boolean;
}

// キャンバス全体のデータ構造（JSONBとして保存）
export interface SceneMapData {
  stage: {
    scale: number;
    position: { x: number; y: number };
  };
  showGrid: boolean;
  icons: PlacedIcon[];
  labels: PlacedLabel[];
  annotations: PlacedAnnotation[];
  annotationCounter: number;
}

// Supabase scene_maps テーブルの行型
export interface SceneMapRow {
  id: string;
  name: string;
  data: SceneMapData;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// アイコンカテゴリ
export type IconCategory =
  | 'vehicle'
  | 'facility'
  | 'water'
  | 'hazard'
  | 'structure'
  | 'direction'
  | 'annotation'
  | 'text';

// アイコン定義
export interface IconDefinition {
  type: string;
  label: string;
  category: IconCategory;
  // パレット上のミニ表示サイズ
  paletteWidth: number;
  paletteHeight: number;
  // キャンバス上の配置サイズ
  canvasWidth: number;
  canvasHeight: number;
}

// 空のSceneMapData
export function createEmptySceneMapData(): SceneMapData {
  return {
    stage: { scale: 1, position: { x: 0, y: 0 } },
    showGrid: true,
    icons: [],
    labels: [],
    annotations: [],
    annotationCounter: 0,
  };
}
