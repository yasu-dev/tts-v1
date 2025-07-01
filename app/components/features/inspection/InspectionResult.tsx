'use client';

import NexusButton from '@/app/components/ui/NexusButton';
import NexusCard from '@/app/components/ui/NexusCard';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model: string;
  status: string;
}

interface InspectionResultProps {
  product: Product;
  photos: string[];
  inspectionData: any;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

export default function InspectionResult({
  product,
  photos,
  inspectionData,
  onSubmit,
  onBack,
  loading,
}: InspectionResultProps) {
  const getConditionScore = () => {
    const inspection = inspectionData?.inspection || {};
    const conditions = Object.values(inspection);
    
    // 簡易的なスコア計算
    const scoreMap: Record<string, number> = {
      '新品同様': 5,
      '美品': 4,
      '良品': 3,
      '並品': 2,
      '難あり': 1,
      '正常': 5,
      '無傷': 5,
      '汚れなし': 5,
      '全て正常': 5,
      'スムーズ': 5,
      '若干重い': 3,
      '重い': 2,
      '動作不良': 1,
    };

    let totalScore = 0;
    let count = 0;

    conditions.forEach((condition: any) => {
      const score = scoreMap[condition] || 3;
      totalScore += score;
      count++;
    });

    return count > 0 ? Math.round((totalScore / count) * 20) : 0;
  };

  const conditionScore = getConditionScore();
  const conditionGrade = 
    conditionScore >= 90 ? 'S' :
    conditionScore >= 80 ? 'A' :
    conditionScore >= 70 ? 'B' :
    conditionScore >= 60 ? 'C' : 'D';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">検品結果の確認</h3>
        <p className="text-gray-600 text-sm">
          検品内容を確認し、送信してください
        </p>
      </div>

      {/* 総合評価 */}
      <NexusCard className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">総合コンディション</p>
          <div className="flex justify-center items-baseline gap-4">
            <span className="text-5xl font-bold text-blue-600">{conditionGrade}</span>
            <span className="text-2xl text-gray-600">{conditionScore}点</span>
          </div>
        </div>
      </NexusCard>

      {/* 商品情報 */}
      <NexusCard className="p-4">
        <h4 className="font-medium mb-3">商品情報</h4>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-gray-600">商品名:</dt>
            <dd className="font-medium">{product.name}</dd>
          </div>
          <div>
            <dt className="text-gray-600">SKU:</dt>
            <dd className="font-medium">{product.sku}</dd>
          </div>
          <div>
            <dt className="text-gray-600">ブランド:</dt>
            <dd className="font-medium">{product.brand}</dd>
          </div>
          <div>
            <dt className="text-gray-600">モデル:</dt>
            <dd className="font-medium">{product.model}</dd>
          </div>
        </dl>
      </NexusCard>

      {/* 撮影写真サマリー */}
      <NexusCard className="p-4">
        <h4 className="font-medium mb-3">撮影写真（{photos.length}枚）</h4>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {photos.slice(0, 6).map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`商品写真 ${index + 1}`}
              className="w-full h-16 object-cover rounded"
            />
          ))}
          {photos.length > 6 && (
            <div className="flex items-center justify-center bg-gray-100 rounded">
              <span className="text-gray-600 text-sm">+{photos.length - 6}</span>
            </div>
          )}
        </div>
      </NexusCard>

      {/* 検品項目サマリー */}
      <NexusCard className="p-4">
        <h4 className="font-medium mb-3">検品項目</h4>
        <div className="space-y-2">
          {Object.entries(inspectionData?.inspection || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
              <span className="font-medium">{value as string}</span>
            </div>
          ))}
        </div>
        {inspectionData?.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 mb-1">備考:</p>
            <p className="text-sm">{inspectionData.notes}</p>
          </div>
        )}
      </NexusCard>

      <div className="flex justify-between">
        <NexusButton onClick={onBack} variant="secondary" className="px-6">
          戻る
        </NexusButton>
        <NexusButton
          onClick={onSubmit}
          disabled={loading}
          className="px-8"
        >
          {loading ? (
            <span className="flex items-center">
              <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2"></span>
              送信中...
            </span>
          ) : (
            '検品完了'
          )}
        </NexusButton>
      </div>
    </div>
  );
} 