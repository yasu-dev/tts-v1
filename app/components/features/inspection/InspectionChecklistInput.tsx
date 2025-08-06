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
    const updatedData = { ...data };
    if (category === 'exterior') {
      updatedData.exterior = { ...updatedData.exterior, [item]: value };
    } else if (category === 'functionality') {
      updatedData.functionality = { ...updatedData.functionality, [item]: value };
    } else if (category === 'optical' && updatedData.optical) {
      updatedData.optical = { ...updatedData.optical, [item]: value };
    }
    onChange(updatedData);
  };

  const handleNotesChange = (notes: string) => {
    onChange({ ...data, notes });
  };

  const checklistItems = [
    {
      category: '外観',
      key: 'exterior',
      items: [
        { key: 'scratches', label: '傷なし', checked: data.exterior.scratches },
        { key: 'dents', label: 'へこみなし', checked: data.exterior.dents },
        { key: 'discoloration', label: '変色なし', checked: data.exterior.discoloration },
        { key: 'dust', label: 'ほこりなし', checked: data.exterior.dust },
      ],
    },
    {
      category: '機能',
      key: 'functionality',
      items: [
        { key: 'powerOn', label: '電源ON確認', checked: data.functionality.powerOn },
        { key: 'allButtonsWork', label: 'ボタン動作確認', checked: data.functionality.allButtonsWork },
        { key: 'screenDisplay', label: '画面表示確認', checked: data.functionality.screenDisplay },
        { key: 'connectivity', label: '接続確認', checked: data.functionality.connectivity },
      ],
    },
  ];

  if (showOptical && data.optical) {
    console.log('[DEBUG] 光学系項目を追加:', { showOptical, optical: data.optical });
    checklistItems.push({
      category: '光学系',
      key: 'optical',
      items: [
        { key: 'lensClarity', label: 'レンズクリア', checked: data.optical.lensClarity },
        { key: 'aperture', label: '絞り動作確認', checked: data.optical.aperture },
        { key: 'focusAccuracy', label: 'フォーカス精度', checked: data.optical.focusAccuracy },
        { key: 'stabilization', label: '手ぶれ補正確認', checked: data.optical.stabilization },
      ],
    });
  } else {
    console.log('[DEBUG] 光学系項目をスキップ:', { showOptical, hasOptical: !!data.optical });
  }

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
                <div className="grid grid-cols-2 gap-3">
                  {category.items.map((item) => (
                    <NexusCheckbox
                      key={item.key}
                      label={item.label}
                      checked={item.checked}
                      onChange={(checked) => handleCheckChange(category.key, item.key, checked)}
                      disabled={readOnly}
                    />
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