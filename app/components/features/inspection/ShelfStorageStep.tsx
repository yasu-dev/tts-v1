'use client';

import { useState, useRef, useEffect } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface ShelfStorageStepProps {
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    brand: string;
    model: string;
  };
  onComplete: (locationId: string) => void;
  onPrev: () => void;
  onSaveAndReturn: () => void;
  loading: boolean;
}

interface StorageLocation {
  id: string;
  code: string;
  name: string;
  zone: string;
  capacity: number;
  currentCount: number;
}

export default function ShelfStorageStep({
  productId,
  product,
  onComplete,
  onPrev,
  onSaveAndReturn,
  loading
}: ShelfStorageStepProps) {
  const { showToast } = useToast();
  const [scannedLocation, setScannedLocation] = useState<string>('');
  const [locationData, setLocationData] = useState<StorageLocation | null>(null);
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // ステップ表示時に棚番号入力へ自動フォーカス
  useEffect(() => {
    if (locationInputRef.current) {
      locationInputRef.current.focus();
      // 既存値があれば選択して上書きしやすくする
      try {
        const inputEl = locationInputRef.current as HTMLInputElement;
        if (inputEl.value) {
          inputEl.select();
        }
      } catch (_) {
        // no-op
      }
    }
  }, []);

  // バーコードスキャナは入力欄に直接入力する前提のため、
  // 専用UIやフローは持たず、入力欄に集約する

  // 棚番号の手動入力
  const handleLocationInput = (locationCode: string) => {
    setScannedLocation(locationCode);
    if (!locationCode.trim()) {
      setLocationData(null);
    }
  };

  // Enterキーでの保管完了
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && scannedLocation.trim().length > 0 && !loading) {
      handleStorageComplete();
    }
  };

  // 棚番号の検証
  const validateLocation = async (locationCode: string): Promise<StorageLocation | null> => {
    try {
      setIsValidatingLocation(true);
      
      const response = await fetch(`/api/locations/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationCode })
      });

      if (!response.ok) {
        throw new Error('棚番号の検証に失敗しました');
      }

      const location = await response.json();
      console.log('✅ ロケーション検証成功:', location);
      setLocationData(location);
      
      // 容量チェック
      if (location.capacity && location.currentCount >= location.capacity) {
        showToast({
          type: 'warning',
          title: '棚容量不足',
          message: `棚 ${location.name} は満杯です。別の棚を選択してください。`,
          duration: 4000
        });
        return null;
      }

      showToast({
        type: 'success',
        title: '棚番号確認',
        message: `棚 ${location.name} (${location.zone}ゾーン) を確認しました。保管完了ボタンを押してください。`,
        duration: 3000
      });
      return location;
    } catch (error) {
      console.error('Location validation error:', error);
      setLocationData(null);
      showToast({
        type: 'error',
        title: '棚番号エラー',
        message: error instanceof Error ? error.message : '棚番号の検証中にエラーが発生しました',
        duration: 4000
      });
      return null;
    } finally {
      setIsValidatingLocation(false);
    }
  };

  // 保管完了処理 - ワンクリックで完了
  const handleStorageComplete = async () => {
    const code = scannedLocation.trim();
    
    if (!code) {
      showToast({
        type: 'warning',
        title: '保管場所未入力',
        message: '棚番号をスキャンまたは入力してください。',
        duration: 3000
      });
      return;
    }

    // 常に最新の検証を実施
    const validatedLocation = await validateLocation(code);
    if (!validatedLocation) {
      return; // 検証失敗時は処理を中断
    }

    try {
      // 保管処理を実行
      console.log('🚀 保管完了リクエスト送信:', {
        productId: productId,
        locationId: validatedLocation.id,
        locationCode: validatedLocation.code
      });

      const response = await fetch('/api/products/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId,
          locationId: validatedLocation.id,
          locationCode: validatedLocation.code
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '不明なエラー' }));
        console.error('❌ 保管完了APIエラー:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          sentData: {
            productId: productId,
            locationId: validatedLocation.id,
            locationCode: validatedLocation.code
          }
        });
        
        // 詳細なエラー情報があれば表示
        if (errorData.details) {
          console.error('📋 エラー詳細:', errorData.details);
        }
        if (errorData.code) {
          console.error('🔧 エラーコード:', errorData.code);
        }
        if (errorData.stack) {
          console.error('📚 スタックトレース:', errorData.stack);
        }
        
        throw new Error(errorData.error || `保管処理に失敗しました (${response.status})`);
      }

      // 成功時の即座フィードバック
      showToast({
        type: 'success',
        title: '保管完了',
        message: `${product.name} を ${validatedLocation.name} に保管しました。検品一覧に戻ります...`,
        duration: 1500
      });

      // 完了処理を呼び出し
      onComplete(validatedLocation.id);
      
    } catch (error) {
      console.error('Storage completion error:', error);
      showToast({
        type: 'error',
        title: '保管エラー',
        message: error instanceof Error ? error.message : '保管処理中にエラーが発生しました',
        duration: 4000
      });
    }
  };

  // 入力フィールドにフォーカス（モーダル/画面表示時）
  // スキャナはフォーカスされた入力欄へ自動で文字列を入力する前提

  return (
    <div className="space-y-6">
      <NexusCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">棚保管</h3>
        <p className="text-sm text-gray-600 mb-6">
          梱包・ラベル貼り付けが完了した商品を棚に保管します。棚のバーコードをスキャンして保管場所を登録してください。
        </p>

        {/* 商品情報表示 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">保管対象商品</h4>
          <div className="text-sm space-y-1">
            <div><strong>SKU:</strong> {product.sku}</div>
            <div><strong>商品名:</strong> {product.name}</div>
            <div><strong>ブランド:</strong> {product.brand} {product.model}</div>
          </div>
        </div>

        {/* 単一の入力欄（スキャン／直接入力の双方に対応） */}
        <div className="space-y-4">
          <div>
            <NexusInput
              ref={locationInputRef}
              value={scannedLocation}
              onChange={(e) => handleLocationInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="棚番号をスキャンまたは入力してください（例: A-01-001）"
              autoFocus
              disabled={isValidatingLocation || loading}
            />
            {isValidatingLocation && (
              <p className="text-sm text-blue-600 mt-2">棚番号を確認中...</p>
            )}
          </div>

          {/* 棚情報表示 */}
          {locationData && (
            <NexusCard className="p-4 bg-green-50 border-green-200">
              <h5 className="text-sm font-medium text-green-900 mb-2">✓ 保管先確認済み</h5>
              <div className="text-sm space-y-1 text-green-800">
                <div><strong>棚番号:</strong> {locationData.code}</div>
                <div><strong>棚名:</strong> {locationData.name}</div>
                <div><strong>ゾーン:</strong> {locationData.zone}</div>
                <div><strong>容量:</strong> {locationData.currentCount + 1}/{locationData.capacity}</div>
              </div>
              <div className="mt-3 text-sm text-green-700 bg-green-100 p-2 rounded">
                <strong>準備完了:</strong> 「保管完了」ボタンで即座に保管処理が実行されます
              </div>
            </NexusCard>
          )}
        </div>
      </NexusCard>

      {/* 作業完了の注意事項 */}
      <NexusCard className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-yellow-900 mb-1">重要</h4>
            <p className="text-sm text-yellow-800">
              「保管完了」ボタンを押すと即座に保管処理が実行され、検品作業が完了します。
              複数商品を同時に進行している場合は、「保存して一覧に戻る」で他の商品の作業を続けることができます。
            </p>
          </div>
        </div>
      </NexusCard>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between">
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
          onClick={handleStorageComplete}
          variant="primary"
          size="lg"
          disabled={!(scannedLocation.trim().length > 0) || loading}
        >
          {loading ? '保管中...' : '保管完了'}
        </NexusButton>
      </div>
    </div>
  );
}