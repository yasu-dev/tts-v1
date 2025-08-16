'use client';

import { useState } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface PackagingAndLabelStepProps {
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    brand: string;
    model: string;
  };
  onNext: () => void;
  onPrev: () => void;
  onSaveAndReturn: () => void;
  onCancel?: () => void;
  loading: boolean;
}

export default function PackagingAndLabelStep({
  productId,
  product,
  onNext,
  onPrev,
  onSaveAndReturn,
  onCancel,
  loading
}: PackagingAndLabelStepProps) {
  const { showToast } = useToast();
  const [packagingCompleted, setPackagingCompleted] = useState(false);
  const [labelPrinted, setLabelPrinted] = useState(false);
  const [labelAttached, setLabelAttached] = useState(false);
  const [isGeneratingLabel, setIsGeneratingLabel] = useState(false);

  const handlePackagingComplete = () => {
    setPackagingCompleted(true);
    showToast({
      type: 'success',
      title: '内装梱包完了',
      message: '商品の内装梱包が完了しました。次に商品ラベルを出力してください。',
      duration: 3000
    });
  };

  const handleLabelGeneration = async () => {
    try {
      setIsGeneratingLabel(true);
      
      // 商品ラベル生成API呼び出し
      const response = await fetch(`/api/products/${productId}/label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          sku: product.sku,
          name: product.name,
          brand: product.brand,
          model: product.model
        })
      });

      if (!response.ok) {
        throw new Error('ラベル生成に失敗しました');
      }

      const result = await response.json();
      
      if (!result.success || !result.base64Data) {
        throw new Error(result.message || 'ラベルPDFデータの取得に失敗しました');
      }

      // PDFをダウンロード
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${result.base64Data}`;
      link.download = result.fileName || `product_label_${product.sku}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setLabelPrinted(true);
      showToast({
        type: 'success',
        title: 'ラベル出力完了',
        message: '商品ラベルが出力されました。商品に貼り付けてください。',
        duration: 3000
      });
    } catch (error) {
      console.error('Label generation error:', error);
      showToast({
        type: 'error',
        title: 'ラベル出力エラー',
        message: error instanceof Error ? error.message : 'ラベル出力中にエラーが発生しました',
        duration: 4000
      });
    } finally {
      setIsGeneratingLabel(false);
    }
  };

  const handleLabelAttached = () => {
    setLabelAttached(true);
    showToast({
      type: 'success',
      title: 'ラベル貼り付け完了',
      message: '商品ラベルの貼り付けが完了しました。次の棚保管ステップに進めます。',
      duration: 3000
    });
  };

  const canProceedToNext = packagingCompleted && labelPrinted && labelAttached;

  return (
    <div className="space-y-6">
      <NexusCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">梱包・ラベル作業</h3>
        <p className="text-sm text-gray-600 mb-6">
          商品の内装梱包を行い、商品ラベルを出力して貼り付けてください。
        </p>

        <div className="space-y-6">
          {/* ステップ1: 内装梱包 */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-medium">1. 内装梱包</h4>
              {packagingCompleted && (
                <div className="flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  完了
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              商品を適切な梱包材で内装梱包してください。
            </p>
            {!packagingCompleted && (
              <NexusButton
                onClick={handlePackagingComplete}
                variant="primary"
                size="sm"
              >
                内装梱包完了
              </NexusButton>
            )}
          </div>

          {/* ステップ2: ラベル出力 */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-medium">2. 商品ラベル出力</h4>
              {labelPrinted && (
                <div className="flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  完了
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              商品情報が印刷された商品ラベルを出力します。
            </p>
            <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
              <div><strong>SKU:</strong> {product.sku}</div>
              <div><strong>商品名:</strong> {product.name}</div>
              <div><strong>ブランド:</strong> {product.brand}</div>
              <div><strong>モデル:</strong> {product.model}</div>
            </div>
            {packagingCompleted && !labelPrinted && (
              <NexusButton
                onClick={handleLabelGeneration}
                variant="primary"
                size="sm"
                disabled={isGeneratingLabel}
              >
                {isGeneratingLabel ? 'ラベル生成中...' : 'ラベル出力'}
              </NexusButton>
            )}
            {!packagingCompleted && (
              <p className="text-sm text-gray-500">内装梱包を完了してからラベルを出力してください</p>
            )}
          </div>

          {/* ステップ3: ラベル貼り付け */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-medium">3. ラベル貼り付け</h4>
              {labelAttached && (
                <div className="flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  完了
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              出力した商品ラベルを梱包した商品に貼り付けてください。
            </p>
            {labelPrinted && !labelAttached && (
              <NexusButton
                onClick={handleLabelAttached}
                variant="primary"
                size="sm"
              >
                ラベル貼り付け完了
              </NexusButton>
            )}
            {!labelPrinted && (
              <p className="text-sm text-gray-500">ラベル出力を完了してから貼り付けを行ってください</p>
            )}
          </div>
        </div>
      </NexusCard>

      {/* 進行状況表示 */}
      <NexusCard className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-blue-900">作業進捗</h4>
            <p className="text-sm text-blue-700">
              {packagingCompleted ? '✓' : '○'} 内装梱包　
              {labelPrinted ? '✓' : '○'} ラベル出力　
              {labelAttached ? '✓' : '○'} ラベル貼り付け
            </p>
          </div>
          <div className="text-sm text-blue-700">
            {canProceedToNext ? '次のステップに進めます' : '作業を完了してください'}
          </div>
        </div>
      </NexusCard>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between">
        <div className="flex gap-3">
          {onCancel && (
            <NexusButton
              onClick={onCancel}
              variant="outline"
              size="lg"
              disabled={loading}
            >
              キャンセル（一覧に戻る）
            </NexusButton>
          )}
          <NexusButton
            onClick={onPrev}
            variant="secondary"
            size="lg"
            disabled={loading}
          >
            戻る
          </NexusButton>
          <NexusButton
            onClick={onSaveAndReturn}
            variant="outline"
            size="lg"
            disabled={loading}
          >
            {loading ? '保存中...' : '保存して一覧に戻る'}
          </NexusButton>
        </div>
        <NexusButton
          onClick={onNext}
          variant="primary"
          size="lg"
          disabled={!canProceedToNext || loading}
        >
          次へ（棚保管）
        </NexusButton>
      </div>
    </div>
  );
}