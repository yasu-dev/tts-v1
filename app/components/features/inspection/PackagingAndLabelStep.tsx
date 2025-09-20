'use client';

import { useState, useEffect, useMemo } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { StarIcon } from '@heroicons/react/24/solid';

// 商品追跡番号生成関数（ラベル生成と同じロジック）
function generateTrackingNumber(sku: string): string {
  if (!sku || !sku.startsWith('DP-')) {
    return 'DP-000T0000T0000-0XXXXXXX0';
  }

  try {
    const [prefix, timestamp, serial1, serial2] = sku.split('-');
    const ts = timestamp || '0000000000000';
    const part1 = ts.substring(1, 4) || '000';
    const part2 = ts.substring(7, 11) || '0000';
    const part3 = ts.substring(11) || '0000';
    const transformedSerial = (serial1 || 'XXXXXXX')
      .replace(/^7/, '1')
      .replace(/7$/, '1');

    return `${prefix}-${part1}T${part2}T${part3}-${transformedSerial}`;
  } catch (error) {
    console.warn('Tracking number generation failed:', error);
    return 'DP-ERROR-GENERATION-FAILED';
  }
}

interface PackagingAndLabelStepProps {
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    brand: string;
    model: string;
    inspectionNotes?: string;
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
  const [packagingCompleted, setPackagingCompleted] = useState(false);
  const [labelPrinted, setLabelPrinted] = useState(false);
  const [weightEntered, setWeightEntered] = useState(false);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [isGeneratingLabel, setIsGeneratingLabel] = useState(false);
  const { showToast } = useToast();

  // 状態の初期化（ローカル状態のみ使用）
  useEffect(() => {
    // ローカルストレージから状態を復元
    try {
      const savedState = localStorage.getItem(`packaging_${productId}`);
      if (savedState) {
        const state = JSON.parse(savedState);
        setPackagingCompleted(state.packagingCompleted || false);
        setLabelPrinted(state.labelPrinted || false);
        setWeightEntered(state.weightEntered || false);
        setWeight(state.weight || '');
        setNotes(state.notes || '');
      }
    } catch (error) {
      console.log('LocalStorage loading error (using defaults):', error);
    }
  }, [productId]);

  const handlePackagingComplete = async () => {
    try {
      setPackagingCompleted(true);
      
      // ローカルストレージに保存
      const state = {
        packagingCompleted: true,
        labelPrinted,
        weightEntered,
        weight,
        notes
      };
      localStorage.setItem(`packaging_${productId}`, JSON.stringify(state));
      
      // 備考が入力されていれば即時保存
      if (notes && notes.trim()) {
        try {
          await fetch(`/api/products/${productId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inspectionNotes: notes.trim() })
          });
        } catch (e) {
          console.warn('[PackagingAndLabelStep] packagingComplete save notes failed:', e);
        }
      }

      showToast({
        type: 'success',
        title: '梱包完了',
        message: '内装梱包が完了しました',
        duration: 3000
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: '梱包エラー',
        message: '梱包状態の保存に失敗しました',
        duration: 3000
      });
    }
  };

  const handleLabelGeneration = async () => {
    setIsGeneratingLabel(true);
    try {
      // 先に備考を保存（ある場合）
      if (notes && notes.trim()) {
        try {
          await fetch(`/api/products/${productId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inspectionNotes: notes.trim() })
          });
        } catch (e) {
          console.warn('[PackagingAndLabelStep] labelGeneration save notes failed:', e);
        }
      }

      const response = await fetch(`/api/products/${productId}/label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          notes: notes,
          format: 'standard'
        })
      });

      if (!response.ok) {
        throw new Error('ラベル生成に失敗しました');
      }

      const result = await response.json();

      // Update state
      setLabelPrinted(true);

      // Save state to localStorage
      const state = {
        packagingCompleted,
        labelPrinted: true,
        weightEntered,
        weight,
        notes
      };
      localStorage.setItem(`packaging_${productId}`, JSON.stringify(state));

      showToast({
        type: 'success',
        title: 'ラベル生成完了',
        message: 'ラベルの生成が完了しました',
        duration: 3000
      });

      // Trigger print if supported
      if (result.printUrl) {
        window.open(result.printUrl, '_blank');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'ラベル生成エラー',
        message: 'ラベルの生成に失敗しました',
        duration: 3000
      });
    } finally {
      setIsGeneratingLabel(false);
    }
  };

  // プレミアム梱包リクエストの確認（メモ化でパフォーマンス向上とログ出力制限）
  const premiumPackagingRequest = useMemo(() => {
    // Fallback data structure for when API is unavailable
    const fallbackDeliveryPlanInfo = {
      premiumPacking: false,
      packagingNotes: '',
      specialNotes: ''
    };

    let deliveryPlanInfo;
    try {
      // Try to get delivery plan info from localStorage or context
      const savedData = localStorage.getItem(`deliveryPlan_${productId}`);
      deliveryPlanInfo = savedData ? JSON.parse(savedData) : fallbackDeliveryPlanInfo;
    } catch (error) {
      console.warn('[PackagingAndLabelStep] localStorage access error:', error);
      deliveryPlanInfo = fallbackDeliveryPlanInfo;
    }

    if (!deliveryPlanInfo) {
      return null;
    }

    try {
      // プレミアム梱包のリクエストを確認
      if (deliveryPlanInfo.premiumPacking === true) {
        return {
          requested: true,
          notes: deliveryPlanInfo.packagingNotes || deliveryPlanInfo.specialNotes || ''
        };
      }
    } catch (error) {
      console.warn('[PackagingAndLabelStep] プレミアム梱包リクエストの確認エラー:', error);
    }

    // 開発環境でのみログ出力（本番では出力しない）
    if (process.env.NODE_ENV === 'development') {
      console.log('[PackagingAndLabelStep] プレミアム梱包リクエストなし');
    }
    return null;
  }, [productId]); // productIdが変更された時のみ再計算
  const canProceedToNext = labelPrinted && weightEntered;

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
                  プレミアム梱包リクエスト
                </h4>
                <p className="mt-1 text-sm text-blue-700">
                  この商品はセラーからプレミアム梱包がリクエストされています。高品質な梱包材を使用し、丁寧に梱包してください。
                </p>
                {premiumPackagingRequest.notes && (
                  <div className="mt-2 p-2 bg-blue-100 rounded text-sm text-blue-800">
                    <strong>特記事項:</strong> {premiumPackagingRequest.notes.replace(/[★⭐]/g, '').trim()}
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

            {/* 備考入力フィールド */}
            <div className="mb-4">
              <label htmlFor="packaging-notes" className="block text-sm font-medium text-gray-700 mb-2">
                備考（任意）
              </label>
              <textarea
                id="packaging-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="梱包やラベルに関する備考を入力してください（任意）"
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                最大100文字まで入力可能です
              </p>
            </div>
          </div>

          {/* ステップ2: 重量測定 */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-medium">2. 重量測定 <span className="text-red-500">*</span></h4>
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

            {!weightEntered && (
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
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        message: `重量 ${parseFloat(weight).toFixed(1)}kg を記録しました`,
                        duration: 3000
                      });
                    } catch (error) {
                      showToast({
                        type: 'error',
                        title: '重量保存エラー',
                        message: '重量データの保存に失敗しました',
                        duration: 3000
                      });
                    }
                  }}
                  variant="primary"
                  size="sm"
                >
                  重量測定完了
                </NexusButton>
              </div>
            )}
            {weightEntered && (
              <div className="bg-green-50 p-3 rounded border text-sm">
                <strong>記録済み重量:</strong> {parseFloat(weight).toFixed(1)}kg
              </div>
            )}
          </div>

          {/* ステップ3: ラベル出力 */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-medium">3. 商品ラベル出力</h4>
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
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4 text-sm space-y-2">
              <div className="font-semibold text-yellow-800 mb-2">📋 ラベル出力情報</div>
              <div className="bg-yellow-100 p-2 rounded border">
                <strong className="text-yellow-900">商品ラベル記載番号:</strong>
                <span className="ml-2 font-mono text-lg font-bold text-yellow-800">
                  {generateTrackingNumber(product.sku)}
                </span>
              </div>
              <div><strong>SKU:</strong> <span className="font-mono">{product.sku}</span></div>
              <div><strong>商品名:</strong> {product.name}</div>
              {notes && (
                <div className="bg-red-100 border border-red-300 p-2 rounded">
                  <strong className="text-red-800">検品備考:</strong>
                  <div className="text-red-700 mt-1 whitespace-pre-wrap break-words">
                    {notes}
                  </div>
                </div>
              )}
              <div className="text-xs text-yellow-700 mt-2">
                ✅ ピッキング指示と完全一致する追跡番号が生成されます
              </div>
            </div>

            {weightEntered && !labelPrinted && (
              <NexusButton
                onClick={handleLabelGeneration}
                variant="primary"
                size="sm"
                disabled={isGeneratingLabel}
              >
                {isGeneratingLabel ? 'ラベル生成中...' : 'ラベル出力'}
              </NexusButton>
            )}
            {!weightEntered && (
              <p className="text-sm text-gray-500">重量測定を完了してからラベルを出力してください</p>
            )}
          </div>

          {/* ステップ4: ラベル貼り付け */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-medium">4. ラベル貼り付け</h4>
              {labelPrinted && (
                <div className="flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ラベル出力済み
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              出力したラベルを商品の見やすい位置に貼り付けてください。
            </p>
            {labelPrinted && (
              <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm">
                <strong>注意:</strong> ラベルを貼り付けてから「次へ」ボタンで次のステップへ進んでください
              </div>
            )}
            {!labelPrinted && (
              <p className="text-sm text-gray-500">ラベル出力を完了してからラベルを貼り付けてください</p>
            )}
          </div>
        </div>
      </NexusCard>

      {/* 保存・戻るボタン */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
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
          onClick={async () => {
            try {
              // 全ての状態をローカルストレージに保存
              const state = {
                packagingCompleted: true,
                labelPrinted: true,
                weightEntered: true,
                weight: weight,
                notes: notes
              };
              localStorage.setItem(`packaging_${productId}`, JSON.stringify(state));

              // 検品備考をデータベースに保存（notes が入力されている場合のみ）
              if (notes && notes.trim()) {
                try {
                  const response = await fetch(`/api/products/${productId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      inspectionNotes: notes.trim()
                    })
                  });

                  if (!response.ok) {
                    throw new Error('検品備考の保存に失敗しました');
                  }

                  console.log('✅ 検品備考をデータベースに保存しました:', notes.trim());

                  showToast({
                    type: 'success',
                    title: '検品備考保存完了',
                    message: '検品備考が保存されました',
                    duration: 2000
                  });
                } catch (error) {
                  console.error('❌ 検品備考の保存エラー:', error);
                  showToast({
                    type: 'error',
                    title: '検品備考保存エラー',
                    message: '検品備考の保存に失敗しました',
                    duration: 3000
                  });
                  // エラーがあっても次のステップに進む
                }
              }

              onNext();
            } catch (error) {
              console.error('Save error:', error);
              onNext();
            }
          }}
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