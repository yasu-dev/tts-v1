/**
 * カテゴリー別検品チェックリスト項目定義
 */

export interface ChecklistItem {
  key: string;
  label: string;
  description?: string;
  hasOtherInput?: boolean; // "その他" 項目の場合にテキスト入力フィールドを表示
}

export interface ChecklistSection {
  sectionKey: string;
  sectionName: string;
  items: ChecklistItem[];
}

export interface CategoryChecklistStructure {
  category: string;
  categoryName: string;
  sections: ChecklistSection[];
}

/**
 * カメラの検品チェックリスト項目
 */
const CAMERA_CHECKLIST: CategoryChecklistStructure = {
  category: 'camera',
  categoryName: 'カメラ',
  sections: [
    {
      sectionKey: 'camera_body_exterior',
      sectionName: 'カメラボディ外観',
      items: [
        { key: 'scratches', label: '傷', description: '目立つ傷がある場合チェック' },
        { key: 'scuffs', label: 'スレ', description: '擦り傷がある場合チェック' },
        { key: 'dents', label: '凹み', description: '凹みがある場合チェック' },
        { key: 'cracks', label: 'ひび', description: 'ひび割れがある場合チェック' },
        { key: 'breaks', label: '割れ', description: '割れがある場合チェック' },
        { key: 'paint_peeling', label: '塗装剥がれ', description: '塗装の剥がれがある場合チェック' },
        { key: 'dirt', label: '汚れ', description: '汚れがある場合チェック' },
        { key: 'stickiness', label: 'ベタつき', description: 'ベタつきがある場合チェック' },
        { key: 'other', label: 'その他', description: 'その他の問題がある場合チェック', hasOtherInput: true },
      ]
    },
    {
      sectionKey: 'viewfinder',
      sectionName: 'ファインダー',
      items: [
        { key: 'mold', label: 'カビ', description: 'カビがある場合チェック' },
        { key: 'dust', label: 'ホコリ', description: 'ホコリがある場合チェック' },
        { key: 'scratches', label: '傷', description: '傷がある場合チェック' },
        { key: 'dirt', label: '汚れ', description: '汚れがある場合チェック' },
        { key: 'clouding', label: 'クモリ', description: 'クモリがある場合チェック' },
        { key: 'corrosion', label: '腐食', description: '腐食がある場合チェック' },
        { key: 'balsam_separation', label: 'バルサム切れ', description: 'バルサム切れがある場合チェック' },
      ]
    },
    {
      sectionKey: 'film_chamber',
      sectionName: 'フィルム室',
      items: [
        { key: 'chamber_condition', label: 'フィルム室内部の状況', description: 'フィルム室内部に問題がある場合チェック' },
        { key: 'light_seal_deterioration', label: 'モルトの劣化', description: 'モルト（遮光材）に劣化がある場合チェック' },
        { key: 'shutter_curtain', label: 'シャッター幕動作', description: 'シャッター幕の動作に問題がある場合チェック' },
      ]
    },
    {
      sectionKey: 'lens',
      sectionName: 'レンズ',
      items: [
        { key: 'scratches', label: '傷', description: '目立つ傷がある場合チェック' },
        { key: 'scuffs', label: 'スレ', description: '擦り傷がある場合チェック' },
        { key: 'dents', label: '凹み', description: '凹みがある場合チェック' },
        { key: 'cracks', label: 'ひび', description: 'ひび割れがある場合チェック' },
        { key: 'breaks', label: '割れ', description: '割れがある場合チェック' },
        { key: 'paint_peeling', label: '塗装剥がれ', description: '塗装の剥がれがある場合チェック' },
        { key: 'dirt', label: '汚れ', description: '汚れがある場合チェック' },
        { key: 'stickiness', label: 'ベタつき', description: 'ベタつきがある場合チェック' },
        { key: 'other', label: 'その他', description: 'その他の問題がある場合チェック', hasOtherInput: true },
      ]
    },
    {
      sectionKey: 'optical',
      sectionName: '光学',
      items: [
        { key: 'dust_particles', label: 'チリホコリ', description: 'チリホコリがある場合チェック' },
        { key: 'clouding', label: 'クモリ', description: 'クモリがある場合チェック' },
        { key: 'mold', label: 'カビ', description: 'カビがある場合チェック' },
        { key: 'balsam_separation', label: 'バルサム切れ', description: 'バルサム切れがある場合チェック' },
        { key: 'scratches', label: 'キズ', description: '光学系の傷がある場合チェック' },
        { key: 'dirt', label: '汚れ', description: '汚れがある場合チェック' },
        { key: 'other', label: 'その他', description: 'その他の問題がある場合チェック', hasOtherInput: true },
      ]
    },
    {
      sectionKey: 'exposure_function',
      sectionName: '露出機能',
      items: [
        { key: 'working', label: '作動', description: '正常に作動する場合チェック' },
        { key: 'not_working', label: '不動', description: '動作しない場合チェック' },
        { key: 'weak', label: '弱い', description: '動作が弱い場合チェック' },
      ]
    },
    {
      sectionKey: 'accessories',
      sectionName: '付属品',
      items: [
        { key: 'battery', label: 'バッテリー', description: 'バッテリーが付属している場合チェック' },
        { key: 'manual', label: '説明書', description: '説明書が付属している場合チェック' },
        { key: 'case', label: 'ケース', description: 'ケースが付属している場合チェック' },
        { key: 'box', label: '箱', description: '箱が付属している場合チェック' },
        { key: 'strap', label: 'ストラップ', description: 'ストラップが付属している場合チェック' },
        { key: 'lens_cap', label: 'レンズキャップ', description: 'レンズキャップが付属している場合チェック' },
      ]
    },
    {
      sectionKey: 'other',
      sectionName: 'その他',
      items: [
        { key: 'other', label: 'その他', description: 'その他の特記事項がある場合チェック', hasOtherInput: true },
      ]
    }
  ]
};

/**
 * 腕時計の検品チェックリスト項目
 */
const WATCH_CHECKLIST: CategoryChecklistStructure = {
  category: 'watch',
  categoryName: '腕時計',
  sections: [
    {
      sectionKey: 'watch_body_exterior',
      sectionName: '時計本体外観',
      items: [
        { key: 'scratches', label: '傷', description: '目立つ傷がある場合チェック' },
        { key: 'scuffs', label: 'スレ', description: '擦り傷がある場合チェック' },
        { key: 'dents', label: '凹み', description: '凹みがある場合チェック' },
        { key: 'cracks', label: 'ひび', description: 'ひび割れがある場合チェック' },
        { key: 'breaks', label: '割れ', description: '割れがある場合チェック' },
        { key: 'paint_peeling', label: '塗装剥がれ', description: '塗装の剥がれがある場合チェック' },
        { key: 'dirt', label: '汚れ', description: '汚れがある場合チェック' },
        { key: 'stickiness', label: 'ベタつき', description: 'ベタつきがある場合チェック' },
        { key: 'other', label: 'その他', description: 'その他の問題がある場合チェック', hasOtherInput: true },
      ]
    },
    {
      sectionKey: 'dial_hands',
      sectionName: '文字盤・針',
      items: [
        { key: 'hand_discoloration', label: '針の変色', description: '針の変色がある場合チェック' },
        { key: 'dial_dirt', label: '文字盤の汚れ', description: '文字盤に汚れがある場合チェック' },
        { key: 'index_damage', label: 'インデックスの欠け', description: 'インデックスに欠けがある場合チェック' },
        { key: 'luminous_deterioration', label: '夜光の劣化', description: '夜光部分の劣化がある場合チェック' },
        { key: 'cracks', label: 'クラック', description: 'ガラスや文字盤にクラックがある場合チェック' },
      ]
    },
    {
      sectionKey: 'movement_function',
      sectionName: 'ムーブメント機能',
      items: [
        { key: 'time_accuracy', label: '時刻精度', description: '時刻精度に問題がある場合チェック' },
        { key: 'winding_function', label: '巻き上げ機能', description: '巻き上げ機能に問題がある場合チェック' },
        { key: 'crown_operation', label: 'リューズ動作', description: 'リューズ動作に問題がある場合チェック' },
        { key: 'pusher_operation', label: 'プッシュボタン動作', description: 'プッシュボタン動作に問題がある場合チェック' },
        { key: 'date_function', label: '日付機能', description: '日付機能に問題がある場合チェック' },
      ]
    },
    {
      sectionKey: 'case_bracelet',
      sectionName: 'ケース・ブレスレット',
      items: [
        { key: 'case_corrosion', label: 'ケースの腐食', description: 'ケースに腐食がある場合チェック' },
        { key: 'bracelet_stretch', label: 'ブレスレットの伸び', description: 'ブレスレットが伸びている場合チェック' },
        { key: 'clasp_malfunction', label: 'バックルの不具合', description: 'バックルに不具合がある場合チェック' },
        { key: 'missing_links', label: 'コマの欠損', description: 'コマが欠損している場合チェック' },
        { key: 'strap_deterioration', label: 'ベルトの劣化', description: 'ベルトが劣化している場合チェック' },
      ]
    },
    {
      sectionKey: 'waterproof_functions',
      sectionName: '防水・特殊機能',
      items: [
        { key: 'waterproof_performance', label: '防水性能', description: '防水性能に問題がある場合チェック' },
        { key: 'chronograph_function', label: 'クロノグラフ機能', description: 'クロノグラフ機能に問題がある場合チェック' },
        { key: 'gmt_function', label: 'GMT機能', description: 'GMT機能に問題がある場合チェック' },
        { key: 'rotating_bezel', label: '回転ベゼル', description: '回転ベゼルに問題がある場合チェック' },
        { key: 'other_functions', label: 'その他機能', description: 'その他の機能に問題がある場合チェック', hasOtherInput: true },
      ]
    },
    {
      sectionKey: 'accessories',
      sectionName: '付属品',
      items: [
        { key: 'box', label: '箱', description: '箱が付属している場合チェック' },
        { key: 'warranty', label: '保証書', description: '保証書が付属している場合チェック' },
        { key: 'manual', label: '説明書', description: '説明書が付属している場合チェック' },
        { key: 'extra_links', label: '余りコマ', description: '余りコマが付属している場合チェック' },
        { key: 'tools', label: '工具', description: '専用工具が付属している場合チェック' },
        { key: 'original_strap', label: '純正ベルト', description: '純正ベルトが付属している場合チェック' },
      ]
    },
    {
      sectionKey: 'other',
      sectionName: 'その他',
      items: [
        { key: 'other', label: 'その他', description: 'その他の特記事項がある場合チェック', hasOtherInput: true },
      ]
    }
  ]
};

/**
 * その他商品の検品チェックリスト項目（汎用）
 */
const OTHER_CHECKLIST: CategoryChecklistStructure = {
  category: 'other',
  categoryName: 'その他',
  sections: [
    {
      sectionKey: 'exterior',
      sectionName: '外観',
      items: [
        { key: 'scratches', label: '傷', description: '目立つ傷がある場合チェック' },
        { key: 'scuffs', label: 'スレ', description: '擦り傷がある場合チェック' },
        { key: 'dents', label: '凹み', description: '凹みがある場合チェック' },
        { key: 'cracks', label: 'ひび', description: 'ひび割れがある場合チェック' },
        { key: 'breaks', label: '割れ', description: '割れがある場合チェック' },
        { key: 'paint_peeling', label: '塗装剥がれ', description: '塗装の剥がれがある場合チェック' },
        { key: 'dirt', label: '汚れ', description: '汚れがある場合チェック' },
        { key: 'stickiness', label: 'ベタつき', description: 'ベタつきがある場合チェック' },
        { key: 'other', label: 'その他', description: 'その他の問題がある場合チェック', hasOtherInput: true },
      ]
    },
    {
      sectionKey: 'function_operation',
      sectionName: '機能・動作',
      items: [
        { key: 'basic_function', label: '基本機能の動作', description: '基本機能に問題がある場合チェック' },
        { key: 'power_battery', label: '電源・バッテリー', description: '電源・バッテリーに問題がある場合チェック' },
        { key: 'buttons_switches', label: 'ボタン・スイッチ類', description: 'ボタン・スイッチ類に問題がある場合チェック' },
        { key: 'connectivity', label: '接続・通信機能', description: '接続・通信機能に問題がある場合チェック' },
      ]
    },
    {
      sectionKey: 'structure_parts',
      sectionName: '構造・部品',
      items: [
        { key: 'missing_parts', label: '部品の欠損', description: '部品が欠損している場合チェック' },
        { key: 'loose_screws', label: 'ねじの緩み', description: 'ねじに緩みがある場合チェック' },
        { key: 'joint_issues', label: '接合部の不具合', description: '接合部に不具合がある場合チェック' },
        { key: 'internal_condition', label: '内部の状態', description: '内部の状態に問題がある場合チェック' },
      ]
    },
    {
      sectionKey: 'accessories',
      sectionName: '付属品・アクセサリー',
      items: [
        { key: 'manual', label: '説明書', description: '説明書が付属している場合チェック' },
        { key: 'case_cover', label: 'ケース・カバー', description: 'ケース・カバーが付属している場合チェック' },
        { key: 'tools', label: '専用工具', description: '専用工具が付属している場合チェック' },
        { key: 'charger_cable', label: '充電器・ケーブル', description: '充電器・ケーブルが付属している場合チェック' },
        { key: 'other_accessories', label: 'その他付属品', description: 'その他の付属品がある場合チェック' },
      ]
    },
    {
      sectionKey: 'other',
      sectionName: 'その他',
      items: [
        { key: 'other', label: 'その他', description: 'その他の特記事項がある場合チェック', hasOtherInput: true },
      ]
    }
  ]
};

/**
 * カテゴリー別検品チェックリスト定義
 */
export const CATEGORY_CHECKLISTS: { [key: string]: CategoryChecklistStructure } = {
  camera: CAMERA_CHECKLIST,
  watch: WATCH_CHECKLIST,
  other: OTHER_CHECKLIST,
  // レンズはカメラと同じ項目を使用
  lens: CAMERA_CHECKLIST,
  // 時計
  timepiece: WATCH_CHECKLIST,
  // ジュエリー、バッグなどはその他として扱う
  jewelry: OTHER_CHECKLIST,
  bag: OTHER_CHECKLIST,
};

/**
 * カテゴリー別検品チェックリスト項目を取得
 */
export function getCategoryChecklistStructure(category: string): CategoryChecklistStructure {
  // カテゴリーの正規化（既存の値の統一のため）
  let normalizedCategory = category?.toLowerCase();
  
  // 旧カテゴリー値の変換
  if (normalizedCategory === 'camera_body') normalizedCategory = 'camera';
  if (normalizedCategory === 'timepiece') normalizedCategory = 'watch';
  
  return CATEGORY_CHECKLISTS[normalizedCategory] || CATEGORY_CHECKLISTS.other;
}

/**
 * カテゴリーのディスプレイ名を取得
 */
export function getCategoryDisplayName(category: string): string {
  const structure = getCategoryChecklistStructure(category);
  return structure.categoryName;
}

/**
 * 検品チェックリストデータの初期化
 */
export function initializeCategoryChecklistData(category: string): { [key: string]: any } {
  const structure = getCategoryChecklistStructure(category);
  const data: { [key: string]: any } = {};
  
  structure.sections.forEach(section => {
    data[section.sectionKey] = {};
    section.items.forEach(item => {
      data[section.sectionKey][item.key] = false;
      // "その他"項目の場合は、テキスト入力用のフィールドも初期化
      if (item.hasOtherInput) {
        data[section.sectionKey][`${item.key}_text`] = '';
      }
    });
  });
  
  return data;
}

