'use client';

import { useState, useEffect } from 'react';
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
  const [weight, setWeight] = useState('');
  const [weightEntered, setWeightEntered] = useState(false);
  const [labelAttached, setLabelAttached] = useState(false);
  const [isGeneratingLabel, setIsGeneratingLabel] = useState(false);
  const [notes, setNotes] = useState('');
  const [productMetadata, setProductMetadata] = useState<any>(null);

  // 保存された重量データと商品メタデータを復元
  useEffect(() => {
    const loadProductData = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const productData = await response.json();
          
          console.log('[PackagingAndLabelStep] 商品データ取得:', {
            productId,
            hasDeliveryPlanInfo: !!productData.deliveryPlanInfo,
            deliveryPlanInfo: productData.deliveryPlanInfo,
            premiumPacking: productData.deliveryPlanInfo?.premiumPacking
          });
          
          // メタデータを保存
          setProductMetadata(productData);
          
          if (productData.metadata) {
            const metadata = typeof productData.metadata === 'string'
              ? JSON.parse(productData.metadata)
              : productData.metadata;
            
            const savedWeight = metadata?.packaging?.weight;
            if (savedWeight && savedWeight > 0) {
              setWeight(savedWeight.toString());
              setWeightEntered(true);
              console.log(`[PackagingAndLabelStep] 保存された重量を復元: ${savedWeight}kg`);
            }
          }
        }
      } catch (error) {
        console.log('[PackagingAndLabelStep] 商品データの復元をスキップ:', error);
      }
    };

    // InspectionFormから渡されたproductプロパティも確認
    console.log('[PackagingAndLabelStep] プロパティで受け取った商品データ:', {
      productId: product?.id,
      hasDeliveryPlanInfo: !!(product as any)?.deliveryPlanInfo,
      deliveryPlanInfo: (product as any)?.deliveryPlanInfo,
      premiumPacking: (product as any)?.deliveryPlanInfo?.premiumPacking
    });

    loadProductData();
  }, [productId, product]);

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
          model: product.model,
          notes: notes
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

  // プレミアム梱包リクエストの確認
  const getPremiumPackagingRequest = () => {
    // まずpropsから確認
    const propDeliveryPlanInfo = (product as any)?.deliveryPlanInfo;
    // 次にAPIから取得したデータを確認
    const metadataDeliveryPlanInfo = productMetadata?.deliveryPlanInfo;
    
    const deliveryPlanInfo = propDeliveryPlanInfo || metadataDeliveryPlanInfo;
    
    if (!deliveryPlanInfo) {
      console.log('[PackagingAndLabelStep] deliveryPlanInfo not found in both props and metadata');
      return null;
    }
    
    try {
      console.log('[PackagingAndLabelStep] deliveryPlanInfo:', deliveryPlanInfo);
      console.log('[PackagingAndLabelStep] premiumPacking value:', deliveryPlanInfo.premiumPacking);
      
      // プレミアム梱包のリクエストを確認
      if (deliveryPlanInfo.premiumPacking === true) {
        console.log('[PackagingAndLabelStep] プレミアム梱包リクエスト発見');
        return {
          requested: true,
          notes: deliveryPlanInfo.packagingNotes || deliveryPlanInfo.specialNotes || ''
        };
      }
    } catch (error) {
      console.warn('[PackagingAndLabelStep] プレミアム梱包リクエストの確認エラー:', error);
    }
    
    console.log('[PackagingAndLabelStep] プレミアム梱包リクエストなし');
    return null;
  };

  const premiumPackagingRequest = getPremiumPackagingRequest();
  const canProceedToNext = packagingCompleted && labelPrinted && weightEntered && labelAttached;

  return (
    <div className="space-y-6">
      <NexusCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">梱包・ラベル作業</h3>
        <p className="text-sm text-gray-600 mb-6">
          商品の内装梱包を行い、商品ラベルを出力して貼り付けてください。
        </p>

        {/* プレミアム梱包リクエスト通知 */}
        {premiumPackagingRequest && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-blue-800">
                  ⭐ プレミアム梱包リクエスト
                </h4>
                <p className="mt-1 text-sm text-blue-700">
                  この商品はセラーからプレミアム梱包がリクエストされています。高品質な梱包材を使用し、丁寧に梱包してください。
                </p>
                {premiumPackagingRequest.notes && (
                  <div className="mt-2 p-2 bg-blue-100 rounded text-sm text-blue-800">
                    <strong>特記事項:</strong> {premiumPackagingRequest.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
            </div>
            
            {/* 備考入力フィールド */}
            <div className="mb-4">
              <label htmlFor="label-notes" className="block text-sm font-medium text-gray-700 mb-2">
                備考（任意）
              </label>
              <textarea
                id="label-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ラベルに印刷する備考を入力してください（任意）"
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                最大100文字まで入力可能です
              </p>
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

          {/* ステップ3: 重量測定 */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-medium">3. 重量測定 <span className="text-red-500">*</span></h4>
              {weightEntered && (
                <div className="flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  完了
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              梱包済み商品の重量を測定してください。
            </p>
            {labelPrinted && !weightEntered && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="product-weight" className="block text-sm font-medium text-gray-700 mb-1">
                    商品重量（kg）<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="product-weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="例: 1.5"
                    step="0.1"
                    min="0"
                    max="999.9"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    小数点第一位まで入力してください（例: 1.5kg）
                  </p>
                </div>
                <NexusButton
                  onClick={async () => {
                    if (!weight || parseFloat(weight) <= 0) {
                      showToast({
                        type: 'error',
                        title: '入力エラー',
                        message: '有効な重量を入力してください',
                        duration: 3000
                      });
                      return;
                    }
                    
                    try {
                      // 重量データをmetadataに保存
                      const response = await fetch(`/api/products/${productId}/weight`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          weight: parseFloat(weight),
                          weightUnit: 'kg'
                        })
                      });

                      if (!response.ok) {
                        throw new Error('重量データの保存に失敗しました');
                      }

                      setWeightEntered(true);
                      showToast({
                        type: 'success',
                        title: '重量測定完了',
                        message: `重量 ${weight}kg を記録しました`,
                        duration: 3000
                      });
                    } catch (error) {
                      showToast({
                        type: 'error',
                        title: '重量保存エラー',
                        message: '重量データの保存に失敗しました',
                        duration: 4000
                      });
                    }
                  }}
                  variant="primary"
                  size="sm"
                >
                  重量を記録
                </NexusButton>
              </div>
            )}
            {!labelPrinted && (
              <p className="text-sm text-gray-500">ラベル出力を完了してから重量を測定してください</p>
            )}
            {weightEntered && (
              <div className="bg-green-50 p-3 rounded border text-sm">
                <strong>記録済み重量:</strong> {weight}kg
              </div>
            )}
          </div>

          {/* ステップ4: ラベル貼り付け */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-medium">4. ラベル貼り付け</h4>
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
            {weightEntered && !labelAttached && (
              <NexusButton
                onClick={handleLabelAttached}
                variant="primary"
                size="sm"
              >
                ラベル貼り付け完了
              </NexusButton>
            )}
            {!weightEntered && (
              <p className="text-sm text-gray-500">重量測定を完了してからラベル貼り付けを行ってください</p>
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
              {weightEntered ? '✓' : '○'} 重量測定　
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