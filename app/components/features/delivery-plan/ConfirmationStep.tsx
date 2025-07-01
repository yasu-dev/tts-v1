'use client';

import { useState } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusCard from '@/app/components/ui/NexusCard';

interface ConfirmationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  loading: boolean;
}

export default function ConfirmationStep({
  data,
  onUpdate,
  onPrev,
  onSubmit,
  loading,
}: ConfirmationStepProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(
    data.confirmation?.agreedToTerms || false
  );
  const [generateBarcodes, setGenerateBarcodes] = useState(
    data.confirmation?.generateBarcodes ?? true
  );

  const categories = {
    camera_body: 'カメラ本体',
    lens: 'レンズ',
    watch: '時計',
    accessory: 'アクセサリー',
  };

  const handleSubmit = () => {
    if (!agreedToTerms) {
      alert('利用規約に同意してください');
      return;
    }

    onUpdate({
      confirmation: {
        agreedToTerms,
        generateBarcodes,
      },
    });
    onSubmit();
  };

  const totalValue = data.products?.reduce(
    (sum: number, product: any) => sum + (product.estimatedValue || 0),
    0
  ) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">確認・出力</h2>
        <p className="text-gray-600 mb-6">
          入力内容を確認し、納品プランを作成してください。
        </p>
      </div>

      {/* 基本情報の確認 */}
      <NexusCard className="p-6">
        <h3 className="text-lg font-medium mb-4">基本情報</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex">
            <dt className="font-medium text-gray-700 w-32">納品者名:</dt>
            <dd className="text-gray-900">{data.basicInfo?.sellerName}</dd>
          </div>
          <div className="flex">
            <dt className="font-medium text-gray-700 w-32">配送先住所:</dt>
            <dd className="text-gray-900 whitespace-pre-wrap">
              {data.basicInfo?.deliveryAddress}
            </dd>
          </div>
          <div className="flex">
            <dt className="font-medium text-gray-700 w-32">メールアドレス:</dt>
            <dd className="text-gray-900">{data.basicInfo?.contactEmail}</dd>
          </div>
          <div className="flex">
            <dt className="font-medium text-gray-700 w-32">電話番号:</dt>
            <dd className="text-gray-900">{data.basicInfo?.phoneNumber}</dd>
          </div>
          {data.basicInfo?.notes && (
            <div className="flex">
              <dt className="font-medium text-gray-700 w-32">備考:</dt>
              <dd className="text-gray-900 whitespace-pre-wrap">
                {data.basicInfo.notes}
              </dd>
            </div>
          )}
        </dl>
      </NexusCard>

      {/* 商品リストの確認 */}
      <NexusCard className="p-6">
        <h3 className="text-lg font-medium mb-4">商品リスト</h3>
        <div className="space-y-3">
          {data.products?.map((product: any, index: number) => (
            <div
              key={index}
              className="border border-gray-200 rounded-md p-4 bg-gray-50"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-gray-600">
                    {product.brand} - {product.model}
                  </p>
                  <p className="text-gray-500">
                    カテゴリー: {categories[product.category as keyof typeof categories]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-600">
                    ¥{product.estimatedValue.toLocaleString()}
                  </p>
                  {product.serialNumber && (
                    <p className="text-gray-500 text-xs">
                      S/N: {product.serialNumber}
                    </p>
                  )}
                </div>
              </div>
              {product.description && (
                <p className="text-gray-600 text-sm mt-2">{product.description}</p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">商品点数:</span>
            <span className="font-bold">{data.products?.length || 0} 点</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="font-medium text-gray-700">合計見積価格:</span>
            <span className="font-bold text-lg text-blue-600">
              ¥{totalValue.toLocaleString()}
            </span>
          </div>
        </div>
      </NexusCard>

      {/* オプション */}
      <NexusCard className="p-6">
        <h3 className="text-lg font-medium mb-4">オプション</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={generateBarcodes}
              onChange={(e) => setGenerateBarcodes(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              バーコードラベルを生成する（PDF）
            </span>
          </label>
        </div>
      </NexusCard>

      {/* 利用規約への同意 */}
      <NexusCard className="p-6 bg-blue-50 border-blue-200">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
          />
          <span className="ml-2 text-sm text-gray-700">
            納品規約および注意事項を確認し、同意します
          </span>
        </label>
      </NexusCard>

      <div className="flex justify-between pt-6">
        <NexusButton onClick={onPrev} variant="secondary" className="px-6">
          戻る
        </NexusButton>
        <NexusButton
          onClick={handleSubmit}
          disabled={loading || !agreedToTerms}
          className="px-8"
        >
          {loading ? (
            <span className="flex items-center">
              <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2"></span>
              処理中...
            </span>
          ) : (
            '納品プランを作成'
          )}
        </NexusButton>
      </div>
    </div>
  );
} 