'use client';

import { useState } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';

interface ConfirmationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onPrev: () => void;
  onSubmit: () => void;
  isLastStep: boolean;
  loading: boolean;
}

export default function ConfirmationStep({ 
  data, 
  onUpdate, 
  onPrev, 
  onSubmit,
  isLastStep,
  loading
}: ConfirmationStepProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(data.confirmation?.agreedToTerms || false);
  const [generateBarcodes, setGenerateBarcodes] = useState(data.confirmation?.generateBarcodes ?? true);

  const handleTermsChange = (checked: boolean) => {
    setAgreedToTerms(checked);
    onUpdate({ 
      confirmation: { 
        agreedToTerms: checked, 
        generateBarcodes 
      } 
    });
  };

  const handleBarcodesChange = (checked: boolean) => {
    setGenerateBarcodes(checked);
    onUpdate({ 
      confirmation: { 
        agreedToTerms, 
        generateBarcodes: checked 
      } 
    });
  };

  const handleSubmit = () => {
    if (!agreedToTerms) {
      alert('利用規約に同意してください');
      return;
    }
    onSubmit();
  };

  const getTotalValue = () => {
    return data.products?.reduce((total: number, product: any) => total + (product.estimatedValue || 0), 0) || 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">確認・出力</h2>
        <p className="text-gray-600 mb-6">入力内容を確認して、納品プランを作成してください</p>
      </div>

      {/* 基本情報確認 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">セラー名:</span>
            <span className="ml-2 text-gray-900">{data.basicInfo?.sellerName || '未入力'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">連絡先メール:</span>
            <span className="ml-2 text-gray-900">{data.basicInfo?.contactEmail || '未入力'}</span>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-gray-700">納品先住所:</span>
            <span className="ml-2 text-gray-900">{data.basicInfo?.deliveryAddress || '未入力'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">電話番号:</span>
            <span className="ml-2 text-gray-900">{data.basicInfo?.phoneNumber || '未入力'}</span>
          </div>
          {data.basicInfo?.notes && (
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">備考:</span>
              <span className="ml-2 text-gray-900">{data.basicInfo.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* 商品一覧確認 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">登録商品一覧</h3>
        {data.products && data.products.length > 0 ? (
          <div className="space-y-4">
            {data.products.map((product: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <span className="text-lg font-bold text-blue-600">
                    ¥{product.estimatedValue?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">ブランド:</span> {product.brand}
                  </div>
                  <div>
                    <span className="font-medium">モデル:</span> {product.model}
                  </div>
                  <div>
                    <span className="font-medium">カテゴリ:</span> 
                    {product.category === 'camera_body' ? 'カメラボディ' :
                     product.category === 'lens' ? 'レンズ' :
                     product.category === 'watch' ? '腕時計' : 'アクセサリー'}
                  </div>
                  {product.serialNumber && (
                    <div>
                      <span className="font-medium">S/N:</span> {product.serialNumber}
                    </div>
                  )}
                </div>
                {product.description && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">説明:</span> {product.description}
                  </div>
                )}
              </div>
            ))}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">合計予想価格:</span>
                <span className="text-xl font-bold text-blue-600">
                  ¥{getTotalValue().toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                登録商品数: {data.products.length}点
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">商品が登録されていません</p>
        )}
      </div>

      {/* オプション設定 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">出力オプション</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={generateBarcodes}
              onChange={(e) => handleBarcodesChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              バーコードラベルを生成する（推奨）
            </span>
          </label>
          <p className="text-xs text-gray-500 ml-6">
            商品管理用のバーコードラベルPDFを自動生成します
          </p>
        </div>
      </div>

      {/* 利用規約同意 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">利用規約</h3>
        <div className="space-y-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => handleTermsChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <span className="ml-2 text-sm text-gray-700">
              <span className="text-red-500">*</span> 
              THE WORLD DOORの利用規約およびプライバシーポリシーに同意します
            </span>
          </label>
          <div className="text-xs text-gray-500 ml-6 space-y-1">
            <p>• 商品の査定価格は市場状況により変動する場合があります</p>
            <p>• 商品の状態により査定額が変更される場合があります</p>
            <p>• 納品後のキャンセルはお受けできません</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <NexusButton variant="default" onClick={onPrev} disabled={loading}>
          前に戻る
        </NexusButton>
        <NexusButton 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loading || !agreedToTerms}
        >
          {loading ? '作成中...' : '納品プランを作成'}
        </NexusButton>
      </div>
    </div>
  );
} 