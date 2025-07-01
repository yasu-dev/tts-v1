'use client';

import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model: string;
  status: string;
}

interface InspectionData {
  productId: string;
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
  photos: string[];
  notes: string;
  inspectionDate: string;
  inspectorId: string;
  result: 'passed' | 'failed' | 'conditional';
}

export interface InspectionResultProps {
  product: Product;
  inspectionData: InspectionData;
  onNotesChange: (notes: string) => void;
  onSubmit: () => Promise<void>;
  onPrev: () => void;
  loading: boolean;
}

export default function InspectionResult({
  product,
  inspectionData,
  onNotesChange,
  onSubmit,
  onPrev,
  loading,
}: InspectionResultProps) {
  // チェック項目の集計
  const getChecklistSummary = () => {
    const allChecks = Object.values(inspectionData.checklist).flatMap(category =>
      Object.entries(category || {})
    );
    const passedChecks = allChecks.filter(([_, value]) => value === true);
    const failedChecks = allChecks.filter(([_, value]) => value === false);
    
    return {
      total: allChecks.length,
      passed: passedChecks.length,
      failed: failedChecks.length,
      percentage: Math.round((passedChecks.length / allChecks.length) * 100),
    };
  };

  const summary = getChecklistSummary();

  // 検品結果の判定
  const getResultStatus = () => {
    if (summary.percentage >= 90) {
      return { label: 'A級品', color: 'text-green-600', bg: 'bg-green-100' };
    } else if (summary.percentage >= 70) {
      return { label: 'B級品', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    } else {
      return { label: 'C級品', color: 'text-red-600', bg: 'bg-red-100' };
    }
  };

  const resultStatus = getResultStatus();

  const checklistLabels = {
    exterior: {
      title: '外観チェック',
      items: {
        scratches: '傷の有無',
        dents: 'へこみ',
        discoloration: '変色・退色',
        dust: 'ホコリ・汚れ',
      },
    },
    functionality: {
      title: '機能チェック',
      items: {
        powerOn: '電源ON/OFF',
        allButtonsWork: 'ボタン動作',
        screenDisplay: '画面表示',
        connectivity: '接続端子',
      },
    },
    optical: {
      title: '光学系チェック',
      items: {
        lensClarity: 'レンズ透明度',
        aperture: '絞り動作',
        focusAccuracy: 'フォーカス精度',
        stabilization: '手ぶれ補正',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* 検品結果サマリー */}
      <NexusCard className="p-6 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">検品結果サマリー</h3>
          <div className={`px-6 py-2 rounded-full font-bold ${resultStatus.bg} ${resultStatus.color}`}>
            {resultStatus.label}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-900">{summary.total}</p>
            <p className="text-sm text-gray-600">検査項目数</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{summary.passed}</p>
            <p className="text-sm text-gray-600">合格項目</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{summary.failed}</p>
            <p className="text-sm text-gray-600">不合格項目</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">合格率</span>
            <span className="text-sm font-bold text-gray-900">{summary.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                summary.percentage >= 90
                  ? 'bg-green-500'
                  : summary.percentage >= 70
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${summary.percentage}%` }}
            />
          </div>
        </div>
      </NexusCard>

      {/* 商品情報 */}
      <NexusCard className="p-6">
        <h4 className="text-lg font-semibold mb-4">商品情報</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">商品名</p>
            <p className="font-medium">{product.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">SKU</p>
            <p className="font-medium">{product.sku}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ブランド</p>
            <p className="font-medium">{product.brand}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">モデル</p>
            <p className="font-medium">{product.model}</p>
          </div>
        </div>
      </NexusCard>

      {/* チェックリスト詳細 */}
      <NexusCard className="p-6">
        <h4 className="text-lg font-semibold mb-4">チェックリスト詳細</h4>
        <div className="space-y-4">
          {Object.entries(inspectionData.checklist).map(([categoryKey, categoryData]) => {
            const categoryLabel = checklistLabels[categoryKey as keyof typeof checklistLabels];
            if (!categoryLabel || !categoryData) return null;

            return (
              <div key={categoryKey} className="border rounded-lg p-4">
                <h5 className="font-medium mb-3">{categoryLabel.title}</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(categoryData).map(([itemKey, value]) => {
                    const itemLabel = categoryLabel.items[itemKey as keyof typeof categoryLabel.items];
                    return (
                      <div key={itemKey} className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${
                            value ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        >
                          {value ? (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm">{itemLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </NexusCard>

      {/* 撮影写真 */}
      <NexusCard className="p-6">
        <h4 className="text-lg font-semibold mb-4">撮影写真（{inspectionData.photos.length}枚）</h4>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {inspectionData.photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`検品写真 ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90"
              onClick={() => window.open(photo, '_blank')}
            />
          ))}
        </div>
      </NexusCard>

      {/* 備考欄 */}
      <NexusCard className="p-6">
        <h4 className="text-lg font-semibold mb-4">備考・特記事項</h4>
        <textarea
          value={inspectionData.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="傷の詳細、特記事項、注意点などを記入してください..."
        />
      </NexusCard>

      {/* 確認事項 */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="w-6 h-6 mr-3 text-yellow-600 flex-shrink-0">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-800">送信前の確認</h4>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• すべての検品項目を正確にチェックしましたか？</li>
              <li>• 必要な写真はすべて撮影しましたか？</li>
              <li>• 特記事項がある場合は備考欄に記入しましたか？</li>
            </ul>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex justify-between pt-4">
        <NexusButton
          onClick={onPrev}
          variant="secondary"
          size="lg"
          disabled={loading}
        >
          戻る
        </NexusButton>
        <NexusButton
          onClick={onSubmit}
          variant="primary"
          size="lg"
          disabled={loading}
          className="min-w-[200px]"
        >
          {loading ? (
            <span className="flex items-center">
              <span className="animate-spin h-5 w-5 mr-3 border-b-2 border-white rounded-full"></span>
              送信中...
            </span>
          ) : (
            '検品結果を送信'
          )}
        </NexusButton>
      </div>
    </div>
  );
} 