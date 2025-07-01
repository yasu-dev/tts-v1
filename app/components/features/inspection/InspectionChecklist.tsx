'use client';

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

  // すべての必須項目がチェックされているか確認
  const isAllChecked = () => {
    const exteriorChecked = Object.values(checklist.exterior).every(v => v !== false);
    const functionalityChecked = Object.values(checklist.functionality).every(v => v !== false);
    const opticalChecked = !showOptical || 
      (checklist.optical && Object.values(checklist.optical).every(v => v !== false));
    
    return exteriorChecked && functionalityChecked && opticalChecked;
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
      <NexusCard className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 mr-3 text-blue-600">
            {sectionIcon}
          </div>
          <h3 className="text-lg font-semibold">{sectionTitle}</h3>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {items.map(item => (
            <label
              key={item.key}
              className="flex items-start p-2 sm:p-3 md:p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all"
            >
              <input
                type="checkbox"
                checked={sectionData[item.key as keyof typeof sectionData] || false}
                onChange={(e) => onUpdate(sectionKey, item.key, e.target.checked)}
                className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
              />
              <div className="ml-2 sm:ml-3 md:ml-4 flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-xs sm:text-sm md:text-base">{item.label}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{item.description}</div>
              </div>
            </label>
          ))}
        </div>
      </NexusCard>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 sm:p-4">
        <div className="flex items-start">
          <div className="w-6 h-6 mr-3 text-yellow-600 flex-shrink-0">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-yellow-800 text-sm sm:text-base">検品時の注意事項</h4>
            <p className="text-xs sm:text-sm text-yellow-700 mt-1">
              各項目を慎重にチェックし、問題がない場合のみチェックを入れてください。
              不明な点がある場合は、管理者に確認してください。
            </p>
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

      {/* 進捗表示 */}
      <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">検品進捗</span>
          <span className="text-xs sm:text-sm text-gray-600">
            {Object.values(checklist).flatMap(section => 
              Object.values(section || {})
            ).filter(v => v).length} / {
              Object.values(checklist).flatMap(section => 
                Object.values(section || {})
              ).length
            } 項目
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
          <div
            className="bg-blue-600 h-2 sm:h-3 rounded-full transition-all duration-300"
            style={{
              width: `${
                (Object.values(checklist).flatMap(section => 
                  Object.values(section || {})
                ).filter(v => v).length / 
                Object.values(checklist).flatMap(section => 
                  Object.values(section || {})
                ).length) * 100
              }%`
            }}
          />
        </div>
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4">
        <NexusButton
          onClick={onPrev}
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto"
        >
          戻る
        </NexusButton>
        <NexusButton
          onClick={onNext}
          variant="primary"
          size="lg"
          disabled={!isAllChecked()}
          className="w-full sm:w-auto"
        >
          次へ（写真撮影）
        </NexusButton>
      </div>
    </div>
  );
} 