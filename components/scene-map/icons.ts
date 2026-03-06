import { IconDefinition, IconCategory } from './types';

// カテゴリの日本語ラベル
export const categoryLabels: Record<IconCategory, string> = {
  vehicle: '車両',
  facility: '施設',
  water: '水利',
  hazard: '災害',
  structure: '構造',
  direction: '方向',
  annotation: '注釈',
  text: '文字',
};

// 全26種アイコン定義
export const iconDefinitions: IconDefinition[] = [
  // === 車両（7種）===
  {
    type: 'vehicle_pump',
    label: 'P',
    category: 'vehicle',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 48,
    canvasHeight: 36,
  },
  {
    type: 'vehicle_ladder',
    label: 'L',
    category: 'vehicle',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 48,
    canvasHeight: 36,
  },
  {
    type: 'vehicle_ambulance',
    label: 'A',
    category: 'vehicle',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 48,
    canvasHeight: 36,
  },
  {
    type: 'vehicle_rescue',
    label: 'R',
    category: 'vehicle',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 48,
    canvasHeight: 36,
  },
  {
    type: 'vehicle_command',
    label: '指揮',
    category: 'vehicle',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 48,
    canvasHeight: 36,
  },
  {
    type: 'vehicle_tank',
    label: 'T',
    category: 'vehicle',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 48,
    canvasHeight: 36,
  },
  {
    type: 'vehicle_chemical',
    label: 'C',
    category: 'vehicle',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 48,
    canvasHeight: 36,
  },
  // === 施設（4種）===
  {
    type: 'facility_cp',
    label: '本部',
    category: 'facility',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 56,
    canvasHeight: 36,
  },
  {
    type: 'facility_aid',
    label: '+救',
    category: 'facility',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 48,
    canvasHeight: 36,
  },
  {
    type: 'facility_triage',
    label: '+T',
    category: 'facility',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 48,
    canvasHeight: 36,
  },
  {
    type: 'facility_staging',
    label: 'S',
    category: 'facility',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 48,
    canvasHeight: 36,
  },
  // === 水利（3種）===
  {
    type: 'water_hydrant_above',
    label: 'H',
    category: 'water',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 36,
    canvasHeight: 36,
  },
  {
    type: 'water_hydrant_below',
    label: 'H二',
    category: 'water',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 36,
    canvasHeight: 36,
  },
  {
    type: 'water_cistern',
    label: '水槽',
    category: 'water',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 48,
    canvasHeight: 36,
  },
  // === 災害（4種）===
  {
    type: 'hazard_fire_origin',
    label: '×',
    category: 'hazard',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 32,
    canvasHeight: 32,
  },
  {
    type: 'hazard_spread',
    label: '延焼',
    category: 'hazard',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 80,
    canvasHeight: 60,
  },
  {
    type: 'hazard_danger',
    label: '!',
    category: 'hazard',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 36,
    canvasHeight: 36,
  },
  {
    type: 'hazard_victim',
    label: '人',
    category: 'hazard',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 28,
    canvasHeight: 36,
  },
  // === 構造物（2種）===
  {
    type: 'structure_building',
    label: '建物',
    category: 'structure',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 80,
    canvasHeight: 60,
  },
  {
    type: 'structure_road',
    label: '道路',
    category: 'structure',
    paletteWidth: 48,
    paletteHeight: 16,
    canvasWidth: 200,
    canvasHeight: 40,
  },
  // === 方向（4種）===
  {
    type: 'direction_arrow',
    label: '→',
    category: 'direction',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 60,
    canvasHeight: 20,
  },
  {
    type: 'direction_water_stream',
    label: '~→',
    category: 'direction',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 60,
    canvasHeight: 24,
  },
  {
    type: 'direction_north',
    label: 'N↑',
    category: 'direction',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 30,
    canvasHeight: 40,
  },
  {
    type: 'direction_wind',
    label: '風',
    category: 'direction',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 50,
    canvasHeight: 30,
  },
  // === 注釈（1種）===
  {
    type: 'annotation_stamp',
    label: '①',
    category: 'annotation',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 28,
    canvasHeight: 28,
  },
  // === 文字（1種）===
  {
    type: 'text_label',
    label: 'Aa',
    category: 'text',
    paletteWidth: 32,
    paletteHeight: 32,
    canvasWidth: 100,
    canvasHeight: 24,
  },
];

// レガシー型名の正規化（既存データとの後方互換性）
function normalizeIconType(type: string): string {
  if (type === 'structure_building_small' || type === 'structure_building_large') {
    return 'structure_building';
  }
  return type;
}

// リサイズ可能なアイコンタイプ
const RESIZABLE_TYPES = new Set(['structure_building', 'structure_road', 'hazard_spread']);

export function isResizableType(type: string): boolean {
  return RESIZABLE_TYPES.has(normalizeIconType(type));
}

// カテゴリ別にアイコンをグループ化
export function getIconsByCategory(): Record<IconCategory, IconDefinition[]> {
  const grouped: Record<string, IconDefinition[]> = {};
  for (const icon of iconDefinitions) {
    if (!grouped[icon.category]) {
      grouped[icon.category] = [];
    }
    grouped[icon.category].push(icon);
  }
  return grouped as Record<IconCategory, IconDefinition[]>;
}

// type名からアイコン定義を取得（レガシー型名にも対応）
export function getIconDefinition(type: string): IconDefinition | undefined {
  const normalized = normalizeIconType(type);
  return iconDefinitions.find((d) => d.type === normalized);
}
