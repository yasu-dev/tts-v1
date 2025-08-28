'use client';

import React from 'react';

/**
 * 階層型検品チェックリストの確認・出力画面での表示コンポーネント
 * 8大項目37+小項目の階層構造で結果を表示
 */

interface HierarchicalChecklistDisplayProps {
  data: {
    responses: Record<string, Record<string, { booleanValue?: boolean; textValue?: string }>>;
    notes: string;
  };
}

// カテゴリ定義（日本語表示用）
const CATEGORIES = {
  camera_body_exterior: 'カメラボディ外観',
  viewfinder: 'ファインダー',
  film_chamber: 'フィルム室',
  lens: 'レンズ',
  optical: '光学',
  exposure_function: '露出機能',
  accessories: '付属品',
  other: 'その他'
};

// アイテム定義（日本語表示用）
const ITEMS = {
  // カメラボディ外観
  body_scratches: '傷',
  body_abrasion: 'スレ',
  body_dents: '凹み',
  body_cracks: 'ひび',
  body_breaks: '割れ',
  body_paint_peeling: '塗装剥がれ',
  body_dirt: '汚れ',
  body_stickiness: 'ベタつき',
  body_other: 'その他',
  
  // ファインダー
  vf_mold: 'カビ',
  vf_dust: 'ホコリ',
  vf_scratches: '傷',
  vf_dirt: '汚れ',
  vf_cloudiness: 'クモリ',
  vf_corrosion: '腐食',
  vf_balsam_separation: 'バルサム切れ',
  
  // フィルム室
  fc_interior_condition: 'フィルム室内部の状況',
  fc_light_seal_deterioration: 'モルトの劣化',
  fc_shutter_curtain_operation: 'シャッター幕動作',
  
  // レンズ
  lens_scratches: '傷',
  lens_abrasion: 'スレ',
  lens_dents: '凹み',
  lens_cracks: 'ひび',
  lens_breaks: '割れ',
  lens_paint_peeling: '塗装剥がれ',
  lens_dirt: '汚れ',
  lens_stickiness: 'ベタつき',
  lens_other: 'その他',
  
  // 光学
  opt_dust_debris: 'チリホコリ',
  opt_cloudiness: 'クモリ',
  opt_mold: 'カビ',
  opt_balsam_separation: 'バルサム切れ',
  opt_scratches: 'キズ',
  opt_dirt: '汚れ',
  opt_other: 'その他',
  
  // 露出機能
  exp_working: '作動',
  exp_not_working: '不動',
  exp_weak: '弱い',
  
  // 付属品
  acc_battery: 'バッテリー',
  acc_manual: '説明書',
  acc_case: 'ケース',
  acc_box: '箱',
  acc_strap: 'ストラップ',
  acc_lens_cap: 'レンズキャップ',
  
  // その他
  other_item: 'その他'
};

export default function HierarchicalChecklistDisplay({ data }: HierarchicalChecklistDisplayProps) {
  if (!data || !data.responses) {
    return (
      <div className="text-gray-500 text-sm">
        階層型検品データがありません
      </div>
    );
  }

  const { responses, notes } = data;
  const responseEntries = Object.entries(responses);

  if (responseEntries.length === 0 && !notes) {
    return (
      <div className="text-gray-500 text-sm">
        検品項目が選択されていません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responseEntries.map(([categoryId, categoryData]) => {
        // カテゴリ名を日本語に変換（確実な変換処理）
        const categoryName = (() => {
          switch (categoryId) {
            case 'camera_body_exterior': return 'カメラボディ外観';
            case 'viewfinder': return 'ファインダー';
            case 'film_chamber': return 'フィルム室';
            case 'lens': return 'レンズ';
            case 'optical': return '光学';
            case 'exposure_function': return '露出機能';
            case 'accessories': return '付属品';
            case 'other': return 'その他';
            default: return categoryId;
          }
        })();
        const itemEntries = Object.entries(categoryData);

        if (itemEntries.length === 0) return null;

        return (
          <div key={categoryId} className="border rounded-lg p-3 bg-gray-50">
            <h6 className="text-sm font-semibold text-gray-900 mb-2">
              {categoryName}
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {itemEntries.map(([itemId, itemData]) => {
                // 項目名を日本語に変換（確実な変換処理）
                const itemName = (() => {
                  switch (itemId) {
                    // カメラボディ外観
                    case 'body_scratches': return '傷';
                    case 'body_scuffs': return 'スレ';  // 実際のデータで使用
                    case 'body_abrasion': return 'スレ';
                    case 'body_dents': return '凹み';
                    case 'body_cracks': return 'ひび';
                    case 'body_breaks': return '割れ';
                    case 'body_paint_peeling': return '塗装剥がれ';
                    case 'body_dirt': return '汚れ';
                    case 'body_stickiness': return 'ベタつき';
                    case 'body_other': return 'その他';
                    
                    // ファインダー
                    case 'vf_mold': return 'カビ';
                    case 'vf_dust': return 'ホコリ';
                    case 'vf_scratches': return '傷';
                    case 'vf_fog': return 'クモリ';  // 実際のデータで使用
                    case 'vf_dirt': return '汚れ';
                    case 'vf_cloudiness': return 'クモリ';
                    case 'vf_corrosion': return '腐食';
                    case 'vf_balsam_separation': return 'バルサム切れ';
                    
                    // フィルム室
                    case 'fc_interior_condition': return 'フィルム室内部の状況';
                    case 'fc_light_seal_deterioration': return 'モルトの劣化';
                    case 'fc_shutter_curtain_operation': return 'シャッター幕動作';
                    
                    // レンズ
                    case 'lens_scratches': return '傷';
                    case 'lens_scuffs': return 'スレ';  // 実際のデータで使用
                    case 'lens_abrasion': return 'スレ';
                    case 'lens_dents': return '凹み';
                    case 'lens_cracks': return 'ひび';
                    case 'lens_breaks': return '割れ';
                    case 'lens_paint_peeling': return '塗装剥がれ';
                    case 'lens_dirt': return '汚れ';
                    case 'lens_stickiness': return 'ベタつき';
                    case 'lens_other': return 'その他';
                    
                    // 光学
                    case 'opt_dust_debris': return 'チリホコリ';
                    case 'opt_dust_particles': return 'チリホコリ';  // 実際のデータで使用
                    case 'opt_cloudiness': return 'クモリ';
                    case 'opt_fog': return 'クモリ';  // 実際のデータで使用
                    case 'opt_mold': return 'カビ';
                    case 'opt_balsam_separation': return 'バルサム切れ';
                    case 'opt_scratches': return 'キズ';
                    case 'opt_dirt': return '汚れ';
                    case 'opt_other': return 'その他';
                    
                    // 露出機能
                    case 'exp_working': return '作動';
                    case 'exp_not_working': return '不動';
                    case 'exp_weak': return '弱い';
                    
                    // 付属品
                    case 'acc_battery': return 'バッテリー';
                    case 'acc_manual': return '説明書';
                    case 'acc_case': return 'ケース';
                    case 'acc_box': return '箱';
                    case 'acc_strap': return 'ストラップ';
                    case 'acc_lens_cap': return 'レンズキャップ';
                    
                    // その他
                    case 'other_item': return 'その他';
                    case 'other_general': return 'その他';  // 実際のデータで使用
                    
                    // フォールバック: 定義にない場合はそのまま返す
                    default: return itemId;
                  }
                })();
                const hasValue = itemData.booleanValue || itemData.textValue;
                
                if (!hasValue) return null;

                return (
                  <div
                    key={itemId}
                    className={`text-xs px-2 py-1 rounded ${
                      itemData.booleanValue ? 'text-red-700 bg-red-100' : 'text-blue-700 bg-blue-100'
                    }`}
                  >
                    {itemData.booleanValue ? (
                      <span>✓ {itemName}</span>
                    ) : itemData.textValue ? (
                      <span>📝 {itemName}: {itemData.textValue}</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 全体メモ */}
      {notes && (
        <div className="border rounded-lg p-3 bg-yellow-50">
          <h6 className="text-sm font-semibold text-gray-900 mb-1">
            検品メモ
          </h6>
          <p className="text-sm text-gray-700">
            {notes}
          </p>
        </div>
      )}
    </div>
  );
}
