'use client';

import { useState } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';

export interface InspectionChecklistProps {
  category: string;
  checklist: {
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
  };
  onUpdate: (category: string, item: string, value: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  onSaveAndReturn?: () => void;
  loading?: boolean;
}

interface CheckItem {
  key: string;
  label: string;
  description: string;
}

export default function InspectionChecklist({
  category,
  checklist,
  onUpdate,
  onNext,
  onPrev,
  onSaveAndReturn,
  loading = false,
}: InspectionChecklistProps) {
  // 検品項目の定義
  const checkItems: { [key: string]: CheckItem[] } = {
    exterior: [
      { key: 'scratches', label: '傷の有無', description: '本体に目立つ傷がないか確認' },
      { key: 'dents', label: 'へこみ', description: '落下痕や打痕がないか確認' },
      { key: 'discoloration', label: '変色・退色', description: '色あせや変色がないか確認' },
      { key: 'dust', label: 'ホコリ・汚れ', description: '清掃が必要な汚れがないか確認' },
    ],
    functionality: [
      { key: 'powerOn', label: '電源ON/OFF', description: '正常に起動・終了するか確認' },
      { key: 'allButtonsWork', label: 'ボタン動作', description: 'すべてのボタンが正常に動作するか' },
      { key: 'screenDisplay', label: '画面表示', description: 'LCD/EVFが正常に表示されるか' },
      { key: 'connectivity', label: '接続端子', description: 'USB/HDMI等の端子が正常か' },
    ],
    optical: [
      { key: 'lensClarity', label: 'レンズ透明度', description: 'カビ・曇り・傷がないか確認' },
      { key: 'aperture', label: '絞り動作', description: '絞り羽根が正常に動作するか' },
      { key: 'focusAccuracy', label: 'フォーカス精度', description: 'AF/MFが正確に動作するか' },
      { key: 'stabilization', label: '手ぶれ補正', description: '手ぶれ補正機能が動作するか' },
    ],
  };

  // カメラボディの場合のみ光学系チェックを表示
  const showOptical = category === 'camera_body' || category === 'lens';

  // 一括チェック機能
  const handleBulkCheck = (sectionKey: string, checked: boolean) => {
    const section = checkItems[sectionKey];
    if (!section) return;
    
    section.forEach(item => {
      onUpdate(sectionKey, item.key, checked);
    });
  };

  const renderCheckSection = (
    sectionKey: string,
    sectionTitle: string,
    sectionIcon: React.ReactNode,
    items: CheckItem[]
  ) => {
    const sectionData = checklist[sectionKey as keyof typeof checklist];
    if (!sectionData) return null;

    return (
      <NexusCard className="p-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-5 h-5 mr-2 text-blue-600">
              {sectionIcon}
            </div>
            <h3 className="text-sm font-semibold">{sectionTitle}</h3>
          </div>
          <button
            onClick={() => {
              const allChecked = items.every(item => 
                sectionData[item.key as keyof typeof sectionData]
              );
              handleBulkCheck(sectionKey, !allChecked);
            }}
            className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          >
            {items.every(item => sectionData[item.key as keyof typeof sectionData]) ? '全解除' : '一括チェック'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {items.map(item => (
            <label
              key={item.key}
              className="flex items-center p-2 rounded-md border border-gray-200 hover:border-blue-300 cursor-pointer transition-all bg-white text-xs"
            >
              <input
                type="checkbox"
                checked={sectionData[item.key as keyof typeof sectionData] || false}
                onChange={(e) => onUpdate(sectionKey, item.key, e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
              />
              <div className="ml-2 flex-1 min-w-0">
                <div className="font-medium text-gray-900">{item.label}</div>
                <div className="text-gray-600 hidden lg:block text-xs">{item.description}</div>
              </div>
            </label>
          ))}
        </div>
      </NexusCard>
    );
  };

  return (
    <div className="space-y-3">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
        <div className="flex items-start">
          <div className="w-4 h-4 mr-2 text-yellow-600 flex-shrink-0 mt-0.5">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-yellow-800 text-xs">検品時の注意事項</h4>
            <ul className="text-xs text-yellow-700 mt-1 space-y-0.5">
              <li>• 該当する項目のみチェックしてください（0個でも可）</li>
              <li>• 不明な点は管理者に確認してください</li>
              <li>• 一括チェックボタンで効率的に入力できます</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 外観チェック */}
      {renderCheckSection(
        'exterior',
        '外観チェック',
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>,
        checkItems.exterior
      )}

      {/* 機能チェック */}
      {renderCheckSection(
        'functionality',
        '機能チェック',
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>,
        checkItems.functionality
      )}

      {/* 光学系チェック（カメラ・レンズのみ） */}
      {showOptical && checklist.optical && renderCheckSection(
        'optical',
        '光学系チェック',
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>,
        checkItems.optical
      )}

      {/* 進捗表示 - コンパクトに */}
      <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-700">チェック項目</span>
          <span className="text-xs text-gray-600">
            {Object.values(checklist).flatMap(section => 
              Object.values(section || {})
            ).filter(v => v).length} / {
              Object.values(checklist).flatMap(section => 
                Object.values(section || {})
              ).length
            } 項目（任意）
          </span>
        </div>
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between gap-3 pt-2">
        {onSaveAndReturn && (
          <NexusButton
            onClick={onSaveAndReturn}
            variant="outline"
            size="md"
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading ? '保存中...' : '保存して一覧に戻る'}
          </NexusButton>
        )}
        <NexusButton
          onClick={onNext}
          variant="primary"
          size="md"
          disabled={loading}
          className="flex-1 sm:flex-none"
        >
          次へ（動画記録）
        </NexusButton>
      </div>
    </div>
  );
}