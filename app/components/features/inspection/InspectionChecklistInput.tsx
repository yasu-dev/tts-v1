'use client';

import { useState } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusCheckbox from '@/app/components/ui/NexusCheckbox';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export interface InspectionChecklistData {
  exterior: {
    scratches: boolean;
    dents: boolean;
    discoloration: boolean;
    dust: boolean;
  };
  functionality: {
    powerOn: boolean;
    allButtonsWork: boolean;
    screenDisplay: boolean;
    connectivity: boolean;
  };
  optical?: {
    lensClarity: boolean;
    aperture: boolean;
    focusAccuracy: boolean;
    stabilization: boolean;
  };
  notes?: string;
}

interface InspectionChecklistInputProps {
  data: InspectionChecklistData;
  onChange: (data: InspectionChecklistData) => void;
  showOptical?: boolean;
  readOnly?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export default function InspectionChecklistInput({
  data,
  onChange,
  showOptical = false,
  readOnly = false,
  verifiedBy,
  verifiedAt,
}: InspectionChecklistInputProps) {
  const [expanded, setExpanded] = useState(false);

  const handleCheckChange = (category: string, item: string, value: boolean) => {
    console.log(`[DEBUG] ChecklistInput: チェック変更 - ${item}:`, { 
      category, 
      item, 
      newValue: value,
      currentData: {
        exterior: data.exterior,
        functionality: data.functionality,
        optical: data.optical,
        notes: data.notes
      }
    });
    
    const updatedData = { ...data };
    // データベーススキーマとの1対1正確マッピング（12フィールド ←→ 12項目）
    const itemMapping: { [key: string]: { category: string; field: string } } = {
      // 外装項目（exterior）4項目 → 4フィールド
      'exteriorScratches': { category: 'exterior', field: 'scratches' },        // 外装キズ → hasScratches
      'dentsImpacts': { category: 'exterior', field: 'dents' },                 // 打痕・へこみ → hasDents  
      'missingParts': { category: 'exterior', field: 'discoloration' },         // 部品欠損 → hasDiscoloration
      'dirtDust': { category: 'exterior', field: 'dust' },                      // 汚れ・ホコリ → hasDust
      
      // 機能項目（functionality）4項目 → 4フィールド
      'functionalIssues': { category: 'functionality', field: 'powerOn' },      // 動作不良 → powerOn（基本動作）
      'controlIssues': { category: 'functionality', field: 'allButtonsWork' },  // 操作系異常 → allButtonsWork
      'displayIssues': { category: 'functionality', field: 'screenDisplay' },   // 表示異常 → screenDisplay
      'waterproofIssues': { category: 'functionality', field: 'connectivity' }, // 防水性能劣化 → connectivity
      
      // 光学系・その他項目（optical）4項目 → 4フィールド  
      'coreComponentIssues': { category: 'optical', field: 'lensClarity' },     // 光学系/ムーブメント異常 → lensClarity
      'agingDeterioration': { category: 'optical', field: 'aperture' },         // 経年劣化 → aperture（流用）
      'accessoryDiscrepancy': { category: 'optical', field: 'focusAccuracy' },  // 付属品相違 → focusAccuracy
      'warrantyAuthenticity': { category: 'optical', field: 'stabilization' },  // 保証書・真贋問題 → stabilization
    };

    const mapping = itemMapping[item];
    if (mapping) {
      console.log(`[DEBUG] ChecklistInput: マッピング確認 - ${item}:`, mapping);
      
      if (mapping.category === 'exterior') {
        const oldValue = updatedData.exterior[mapping.field];
        updatedData.exterior = { ...updatedData.exterior, [mapping.field]: value };
        console.log(`[DEBUG] ChecklistInput: exterior更新 - ${mapping.field}: ${oldValue} → ${value}`);
      } else if (mapping.category === 'functionality') {
        const oldValue = updatedData.functionality[mapping.field];
        updatedData.functionality = { ...updatedData.functionality, [mapping.field]: value };
        console.log(`[DEBUG] ChecklistInput: functionality更新 - ${mapping.field}: ${oldValue} → ${value}`);
      } else if (mapping.category === 'optical') {
        if (!updatedData.optical) {
          updatedData.optical = { lensClarity: false, aperture: false, focusAccuracy: false, stabilization: false };
        }
        const oldValue = updatedData.optical[mapping.field];
        updatedData.optical = { ...updatedData.optical, [mapping.field]: value };
        console.log(`[DEBUG] ChecklistInput: optical更新 - ${mapping.field}: ${oldValue} → ${value}`);
      }
      
      console.log(`[DEBUG] ChecklistInput: onChange呼び出し前の最終データ:`, {
        exterior: updatedData.exterior,
        functionality: updatedData.functionality,
        optical: updatedData.optical,
        notes: updatedData.notes
      });
      onChange(updatedData);
      console.log(`[DEBUG] ChecklistInput: onChange呼び出し完了`);
    } else {
      console.warn(`[WARN] ChecklistInput: マッピングが見つかりません - ${item}`);
    }
  };

  const handleNotesChange = (notes: string) => {
    onChange({ ...data, notes });
  };

  interface ChecklistItem {
    key: string;
    label: string;
    description: string;
    checked: boolean;
  }

  interface ChecklistCategory {
    category: string;
    key: string;
    items: ChecklistItem[];
  }

  const checklistItems: ChecklistCategory[] = [
    {
      category: '検品チェックリスト（該当項目のみチェック）',
      key: 'issues',
      items: [
        // 外装項目（4項目）
        { key: 'exteriorScratches', label: '外装キズ', description: '目立つ傷がある場合チェック', checked: data.exterior.scratches },
        { key: 'dentsImpacts', label: '打痕・へこみ', description: '落下痕等がある場合チェック', checked: data.exterior.dents },
        { key: 'missingParts', label: '部品欠損', description: '欠品がある場合チェック', checked: data.exterior.discoloration },
        { key: 'dirtDust', label: '汚れ・ホコリ', description: '清掃が必要な場合チェック', checked: data.exterior.dust },
        
        // 機能項目（4項目） - 新しいマッピングに合わせて修正
        { key: 'functionalIssues', label: '動作不良', description: '基本機能に問題がある場合チェック', checked: data.functionality.powerOn },
        { key: 'controlIssues', label: '操作系異常', description: 'ボタン・ダイヤル不良がある場合チェック', checked: data.functionality.allButtonsWork },
        { key: 'displayIssues', label: '表示異常', description: '液晶・針に問題がある場合チェック', checked: data.functionality.screenDisplay },
        { key: 'waterproofIssues', label: '防水性能劣化', description: '密閉性に問題がある場合チェック', checked: data.functionality.connectivity },
        
        // 光学系・その他項目（4項目） - 新しいマッピングに合わせて修正
        { key: 'coreComponentIssues', label: '光学系/ムーブメント異常', description: '核心部品に問題がある場合チェック', checked: data.optical?.lensClarity || false },
        { key: 'agingDeterioration', label: '経年劣化', description: 'ラバー劣化等がある場合チェック', checked: data.optical?.aperture || false },
        { key: 'accessoryDiscrepancy', label: '付属品相違', description: '申告と異なる場合チェック', checked: data.optical?.focusAccuracy || false },
        { key: 'warrantyAuthenticity', label: '保証書・真贋問題', description: '疑義がある場合チェック', checked: data.optical?.stabilization || false },
      ],
    },
  ];

  // 全項目数とチェック済み項目数を計算
  const totalItems = checklistItems.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedItems = checklistItems.reduce(
    (sum, cat) => sum + cat.items.filter(item => item.checked).length,
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-900">検品チェックリスト</h3>
          <span className="text-xs text-gray-500">
            ({checkedItems}/{totalItems} 項目チェック済み)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          {expanded ? '閉じる' : '開く'}
          {expanded ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {expanded && (
        <NexusCard className="p-4">
          {verifiedBy && verifiedAt && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                スタッフ {verifiedBy} により {new Date(verifiedAt).toLocaleString('ja-JP')} に確認済み
              </p>
            </div>
          )}

          <div className="space-y-6">
            {checklistItems.map((category) => (
              <div key={category.key}>
                <h4 className="text-sm font-medium text-gray-700 mb-3">{category.category}</h4>
                <div className="grid grid-cols-1 gap-3">
                  {category.items.map((item) => (
                    <div key={item.key} className="p-2 rounded-md border border-gray-200 hover:border-blue-300 transition-all bg-white">
                      <NexusCheckbox
                        label={item.label}
                        checked={item.checked}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleCheckChange(category.key, item.key, event.target.checked)}
                        disabled={readOnly}
                      />
                      {item.description && (
                        <p className="text-xs text-gray-600 mt-1 ml-6">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

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
          </div>

          {readOnly && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                この検品チェックリストは閲覧専用です。編集するには編集モードに切り替えてください。
              </p>
            </div>
          )}
        </NexusCard>
      )}
    </div>
  );
}