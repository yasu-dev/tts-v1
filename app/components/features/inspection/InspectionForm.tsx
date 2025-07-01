'use client';

import { useState } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusCard from '@/app/components/ui/NexusCard';

interface InspectionFormProps {
  productCategory: string;
  onComplete: (data: any) => void;
  onBack: () => void;
}

interface InspectionItem {
  id: string;
  label: string;
  options: string[];
}

export default function InspectionForm({
  productCategory,
  onComplete,
  onBack,
}: InspectionFormProps) {
  const [inspectionData, setInspectionData] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  // カテゴリー別の検品項目
  const inspectionItems: Record<string, InspectionItem[]> = {
    camera_body: [
      {
        id: 'exterior',
        label: '外観状態',
        options: ['新品同様', '美品', '良品', '並品', '難あり'],
      },
      {
        id: 'sensor',
        label: 'センサー状態',
        options: ['汚れなし', '微細なゴミ', '清掃必要', '要修理'],
      },
      {
        id: 'lcd',
        label: '液晶画面',
        options: ['無傷', '保護フィルムあり', '軽微な傷', '傷あり', '割れ'],
      },
      {
        id: 'shutter',
        label: 'シャッター動作',
        options: ['正常', '違和感あり', '動作不良'],
      },
      {
        id: 'buttons',
        label: 'ボタン・ダイヤル',
        options: ['全て正常', '一部違和感', '動作不良あり'],
      },
      {
        id: 'battery',
        label: 'バッテリー',
        options: ['純正・良好', '純正・劣化', '互換品', 'なし'],
      },
    ],
    lens: [
      {
        id: 'exterior',
        label: '外観状態',
        options: ['新品同様', '美品', '良品', '並品', '難あり'],
      },
      {
        id: 'front_element',
        label: '前玉状態',
        options: ['無傷', '微細な傷', '清掃跡', '傷あり', 'カビ・曇り'],
      },
      {
        id: 'rear_element',
        label: '後玉状態',
        options: ['無傷', '微細な傷', '清掃跡', '傷あり', 'カビ・曇り'],
      },
      {
        id: 'aperture',
        label: '絞り羽根',
        options: ['正常・油なし', '正常・微油', '粘りあり', '動作不良'],
      },
      {
        id: 'focus',
        label: 'フォーカス動作',
        options: ['スムーズ', '若干重い', '重い', '動作不良'],
      },
      {
        id: 'zoom',
        label: 'ズーム動作',
        options: ['スムーズ', '若干重い', '重い', '動作不良', '単焦点'],
      },
    ],
    watch: [
      {
        id: 'exterior',
        label: '外観状態',
        options: ['新品同様', '美品', '良品', '並品', '難あり'],
      },
      {
        id: 'crystal',
        label: '風防状態',
        options: ['無傷', '微細な傷', '傷あり', '欠け・割れ'],
      },
      {
        id: 'movement',
        label: '動作精度',
        options: ['日差±5秒', '日差±15秒', '日差±30秒', '要調整'],
      },
      {
        id: 'band',
        label: 'バンド状態',
        options: ['新品同様', '使用感少', '使用感あり', '要交換'],
      },
    ],
    accessory: [
      {
        id: 'exterior',
        label: '外観状態',
        options: ['新品同様', '美品', '良品', '並品', '難あり'],
      },
      {
        id: 'function',
        label: '機能動作',
        options: ['全て正常', '一部不具合', '動作不良'],
      },
      {
        id: 'completeness',
        label: '付属品',
        options: ['完品', '一部欠品', '本体のみ'],
      },
    ],
  };

  const items = inspectionItems[productCategory] || inspectionItems.accessory;

  const handleOptionSelect = (itemId: string, value: string) => {
    setInspectionData((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleComplete = () => {
    // 全項目が選択されているかチェック
    const allSelected = items.every((item) => inspectionData[item.id]);
    
    if (!allSelected) {
      alert('すべての検品項目を選択してください');
      return;
    }

    onComplete({
      inspection: inspectionData,
      notes,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">検品項目チェック</h3>
        <p className="text-gray-600 text-sm">
          各項目について該当する状態を選択してください
        </p>
      </div>

      {/* 検品項目 */}
      <div className="space-y-4">
        {items.map((item) => (
          <NexusCard key={item.id} className="p-4">
            <h4 className="font-medium mb-3">{item.label}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {item.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(item.id, option)}
                  className={`
                    px-3 py-2 text-sm rounded-lg border transition-colors
                    ${
                      inspectionData[item.id] === option
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
          </NexusCard>
        ))}
      </div>

      {/* 備考欄 */}
      <NexusCard className="p-4">
        <h4 className="font-medium mb-3">備考・特記事項</h4>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="傷の詳細、動作の特記事項、付属品の状態など"
        />
      </NexusCard>

      <div className="flex justify-between">
        <NexusButton onClick={onBack} variant="secondary" className="px-6">
          戻る
        </NexusButton>
        <NexusButton onClick={handleComplete} className="px-6">
          次へ（確認画面へ）
        </NexusButton>
      </div>
    </div>
  );
} 