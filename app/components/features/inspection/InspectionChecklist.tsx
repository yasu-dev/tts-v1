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
    sectionIcon: string,
    items: CheckItem[]
  ) => {
    const sectionData = checklist[sectionKey as keyof typeof checklist];
    if (!sectionData) return null;

    return (
      <NexusCard className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">{sectionIcon}</span>
          <h3 className="text-lg font-semibold">{sectionTitle}</h3>
        </div>
        <div className="space-y-4">
          {items.map(item => (
            <label
              key={item.key}
              className="flex items-start p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all"
            >
              <input
                type="checkbox"
                checked={sectionData[item.key as keyof typeof sectionData] || false}
                onChange={(e) => onUpdate(sectionKey, item.key, e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="ml-4 flex-1">
                <div className="font-medium text-gray-900">{item.label}</div>
                <div className="text-sm text-gray-600 mt-1">{item.description}</div>
              </div>
            </label>
          ))}
        </div>
      </NexusCard>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-800">検品時の注意事項</h4>
            <p className="text-sm text-yellow-700 mt-1">
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
        '👁️',
        checkItems.exterior
      )}

      {/* 機能チェック */}
      {renderCheckSection(
        'functionality',
        '機能チェック',
        '⚙️',
        checkItems.functionality
      )}

      {/* 光学系チェック（カメラ・レンズのみ） */}
      {showOptical && checklist.optical && renderCheckSection(
        'optical',
        '光学系チェック',
        '📷',
        checkItems.optical
      )}

      {/* 進捗表示 */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">検品進捗</span>
          <span className="text-sm text-gray-600">
            {Object.values(checklist).flatMap(section => 
              Object.values(section || {})
            ).filter(v => v).length} / {
              Object.values(checklist).flatMap(section => 
                Object.values(section || {})
              ).length
            } 項目
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
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
      <div className="flex justify-between pt-4">
        <NexusButton
          onClick={onPrev}
          variant="secondary"
          size="lg"
        >
          戻る
        </NexusButton>
        <NexusButton
          onClick={onNext}
          variant="primary"
          size="lg"
          disabled={!isAllChecked()}
        >
          次へ（写真撮影）
        </NexusButton>
      </div>
    </div>
  );
} 