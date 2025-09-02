'use client';

import { useState } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusCheckbox from '@/app/components/ui/NexusCheckbox';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import NexusInput from '@/app/components/ui/NexusInput';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

// 新しい階層型データ構造
export interface HierarchicalInspectionData {
  responses: {
    [categoryId: string]: {
      [itemId: string]: {
        booleanValue?: boolean;
        textValue?: string;
      };
    };
  };
  notes?: string;
}

interface HierarchicalInspectionChecklistInputProps {
  data: HierarchicalInspectionData;
  onChange: (data: HierarchicalInspectionData) => void;
  readOnly?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

// 検品項目の定義（新要件に完全対応）
const INSPECTION_CATEGORIES = [
  {
    id: 'camera_body_exterior',
    name: 'カメラボディ外観',
    items: [
      { id: 'body_scratches', name: '傷', type: 'boolean' as const },
      { id: 'body_scuffs', name: 'スレ', type: 'boolean' as const },
      { id: 'body_dents', name: '凹み', type: 'boolean' as const },
      { id: 'body_cracks', name: 'ひび', type: 'boolean' as const },
      { id: 'body_breaks', name: '割れ', type: 'boolean' as const },
      { id: 'body_paint_peeling', name: '塗装剥がれ', type: 'boolean' as const },
      { id: 'body_dirt', name: '汚れ', type: 'boolean' as const },
      { id: 'body_stickiness', name: 'ベタつき', type: 'boolean' as const },
      { id: 'body_other', name: 'その他', type: 'text_input' as const },
    ],
  },
  {
    id: 'viewfinder',
    name: 'ファインダー',
    items: [
      { id: 'vf_mold', name: 'カビ', type: 'boolean' as const },
      { id: 'vf_dust', name: 'ホコリ', type: 'boolean' as const },
      { id: 'vf_scratches', name: '傷', type: 'boolean' as const },
      { id: 'vf_dirt', name: '汚れ', type: 'boolean' as const },
      { id: 'vf_fog', name: 'クモリ', type: 'boolean' as const },
      { id: 'vf_corrosion', name: '腐食', type: 'boolean' as const },
      { id: 'vf_balsam_separation', name: 'バルサム切れ', type: 'boolean' as const },
    ],
  },
  {
    id: 'film_chamber',
    name: 'フィルム室',
    items: [
      { id: 'fc_interior_condition', name: 'フィルム室内部の状況', type: 'boolean' as const },
      { id: 'fc_light_seal_deterioration', name: 'モルトの劣化', type: 'boolean' as const },
      { id: 'fc_shutter_curtain_operation', name: 'シャッター幕動作', type: 'boolean' as const },
    ],
  },
  {
    id: 'lens',
    name: 'レンズ',
    items: [
      { id: 'lens_scratches', name: '傷', type: 'boolean' as const },
      { id: 'lens_scuffs', name: 'スレ', type: 'boolean' as const },
      { id: 'lens_dents', name: '凹み', type: 'boolean' as const },
      { id: 'lens_cracks', name: 'ひび', type: 'boolean' as const },
      { id: 'lens_breaks', name: '割れ', type: 'boolean' as const },
      { id: 'lens_paint_peeling', name: '塗装剥がれ', type: 'boolean' as const },
      { id: 'lens_dirt', name: '汚れ', type: 'boolean' as const },
      { id: 'lens_stickiness', name: 'ベタつき', type: 'boolean' as const },
      { id: 'lens_other', name: 'その他', type: 'text_input' as const },
    ],
  },
  {
    id: 'optical',
    name: '光学',
    items: [
      { id: 'opt_dust_particles', name: 'チリホコリ', type: 'boolean' as const },
      { id: 'opt_fog', name: 'クモリ', type: 'boolean' as const },
      { id: 'opt_mold', name: 'カビ', type: 'boolean' as const },
      { id: 'opt_balsam_separation', name: 'バルサム切れ', type: 'boolean' as const },
      { id: 'opt_scratches', name: 'キズ', type: 'boolean' as const },
      { id: 'opt_dirt', name: '汚れ', type: 'boolean' as const },
      { id: 'opt_other', name: 'その他', type: 'text_input' as const },
    ],
  },
  {
    id: 'exposure_function',
    name: '露出機能',
    items: [
      { id: 'exp_working', name: '作動', type: 'boolean' as const },
      { id: 'exp_not_working', name: '不動', type: 'boolean' as const },
      { id: 'exp_weak', name: '弱い', type: 'boolean' as const },
    ],
  },
  {
    id: 'accessories',
    name: '付属品',
    items: [
      { id: 'acc_battery', name: 'バッテリー', type: 'boolean' as const },
      { id: 'acc_manual', name: '説明書', type: 'boolean' as const },
      { id: 'acc_case', name: 'ケース', type: 'boolean' as const },
      { id: 'acc_box', name: '箱', type: 'boolean' as const },
      { id: 'acc_strap', name: 'ストラップ', type: 'boolean' as const },
      { id: 'acc_lens_cap', name: 'レンズキャップ', type: 'boolean' as const },
    ],
  },
  {
    id: 'other',
    name: 'その他',
    items: [
      { id: 'other_general', name: 'その他', type: 'text_input' as const },
    ],
  },
];

export default function HierarchicalInspectionChecklistInput({
  data,
  onChange,
  readOnly = false,
  verifiedBy,
  verifiedAt,
}: HierarchicalInspectionChecklistInputProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const handleItemChange = (
    categoryId: string,
    itemId: string,
    type: 'boolean' | 'text_input',
    value: boolean | string
  ) => {
    const updatedData = { ...data };
    
    // カテゴリが存在しない場合は初期化
    if (!updatedData.responses[categoryId]) {
      updatedData.responses[categoryId] = {};
    }
    
    // アイテムが存在しない場合は初期化
    if (!updatedData.responses[categoryId][itemId]) {
      updatedData.responses[categoryId][itemId] = {};
    }

    // 値を設定
    if (type === 'boolean') {
      updatedData.responses[categoryId][itemId].booleanValue = value as boolean;
    } else if (type === 'text_input') {
      updatedData.responses[categoryId][itemId].textValue = value as string;
    }

    onChange(updatedData);
  };

  const handleNotesChange = (notes: string) => {
    onChange({ ...data, notes });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // 統計計算（安全なnullチェック）
  const totalItems = INSPECTION_CATEGORIES.reduce((sum, category) => sum + category.items.length, 0);
  const checkedItems = INSPECTION_CATEGORIES.reduce((sum, category) => {
    return sum + category.items.filter(item => {
      if (!data?.responses?.[category.id]) return false;
      const response = data.responses[category.id]?.[item.id];
      return (response?.booleanValue === true) || (response?.textValue && response.textValue.trim() !== '');
    }).length;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-900">階層型検品チェックリスト</h3>
          <span className="text-xs text-gray-500">
            ({checkedItems}/{totalItems} 項目入力済み)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpandedCategories(
            expandedCategories.length === INSPECTION_CATEGORIES.length ? [] : 
            INSPECTION_CATEGORIES.map(cat => cat.id)
          )}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {expandedCategories.length === INSPECTION_CATEGORIES.length ? 'すべて閉じる' : 'すべて開く'}
        </button>
      </div>

      {verifiedBy && verifiedAt && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            スタッフ {verifiedBy} により {new Date(verifiedAt).toLocaleString('ja-JP')} に確認済み
          </p>
        </div>
      )}

      <div className="space-y-3">
        {INSPECTION_CATEGORIES.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);
          const categoryResponses = data?.responses?.[category.id] || {};
          const checkedCount = category.items.filter(item => {
            const response = categoryResponses[item.id];
            return (response?.booleanValue === true) || (response?.textValue && response.textValue.trim() !== '');
          }).length;

          return (
            <NexusCard key={category.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center gap-2 text-left flex-1"
                >
                  <h4 className="text-sm font-semibold text-gray-900">{category.name}</h4>
                  <span className="text-xs text-gray-500">
                    ({checkedCount}/{category.items.length})
                  </span>
                  {isExpanded ? (
                    <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="space-y-3 ml-4">
                  {category.items.map((item) => {
                    const response = categoryResponses[item.id] || {};
                    
                    return (
                      <div key={item.id} className="p-2 rounded-md border border-gray-200 bg-white">
                        {item.type === 'boolean' ? (
                          <NexusCheckbox
                            label={item.name}
                            checked={response.booleanValue || false}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                              handleItemChange(category.id, item.id, 'boolean', event.target.checked)
                            }
                            disabled={readOnly}
                          />
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {item.name}
                            </label>
                            <NexusInput
                              value={response.textValue || ''}
                              onChange={(e) =>
                                handleItemChange(category.id, item.id, 'text_input', e.target.value)
                              }
                              placeholder="詳細を入力してください"
                              disabled={readOnly}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </NexusCard>
          );
        })}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          検品メモ（任意）
        </label>
        <NexusTextarea
          value={data.notes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="検品時の特記事項があれば入力してください"
          rows={3}
          disabled={readOnly}
        />
      </div>

      {readOnly && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            この階層型検品チェックリストは閲覧専用です。編集するには編集モードに切り替えてください。
          </p>
        </div>
      )}
    </div>
  );
}
