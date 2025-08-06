'use client';

import { useState, useRef } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import BarcodeScanner from '@/app/components/features/BarcodeScanner';

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
  const [isScanning, setIsScanning] = useState(false);
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // バーコードスキャンによる棚番号読み取り
  const handleBarcodeScan = async (barcode: string) => {
    console.log('Scanned barcode:', barcode);
    setScannedLocation(barcode);
    setIsScanning(false);
    
    // 棚番号の検証
    await validateLocation(barcode);
  };

  // 棚番号の手動入力
  const handleLocationInput = async (locationCode: string) => {
    setScannedLocation(locationCode);
    if (locationCode.trim()) {
      await validateLocation(locationCode.trim());
    } else {
      setLocationData(null);
    }
  };

  // 棚番号の検証
  const validateLocation = async (locationCode: string) => {
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
      setLocationData(location);
      
      // 容量チェック
      if (location.currentCount >= location.capacity) {
        showToast({
          type: 'warning',
          title: '棚容量不足',
          message: `棚 ${location.name} は満杯です。別の棚を選択してください。`,
          duration: 4000
        });
        return;
      }

      showToast({
        type: 'success',
        title: '棚番号確認',
        message: `棚 ${location.name} (${location.zone}ゾーン) を確認しました。`,
        duration: 3000
      });

    } catch (error) {
      console.error('Location validation error:', error);
      setLocationData(null);
      showToast({
        type: 'error',
        title: '棚番号エラー',
        message: error instanceof Error ? error.message : '棚番号の検証中にエラーが発生しました',
        duration: 4000
      });
    } finally {
      setIsValidatingLocation(false);
    }
  };

  // 保管完了処理
  const handleStorageComplete = () => {
    if (!locationData) {
      showToast({
        type: 'warning',
        title: '保管場所未選択',
        message: '保管場所を選択してください。',
        duration: 3000
      });
      return;
    }

    onComplete(locationData.id);
  };

  // スキャナーを開く
  const startScanning = () => {
    setIsScanning(true);
  };

  // スキャナーを閉じる
  const stopScanning = () => {
    setIsScanning(false);
  };

  // 入力フィールドにフォーカス
  const focusInput = () => {
    if (locationInputRef.current) {
      locationInputRef.current.focus();
    }
  };

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

        {/* バーコードスキャナー */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium">棚番号スキャン</h4>
            <NexusButton
              onClick={startScanning}
              variant="primary"
              size="sm"
              disabled={isScanning}
            >
              {isScanning ? 'スキャン中...' : 'バーコードスキャン'}
            </NexusButton>
          </div>

          {isScanning && (
            <NexusCard className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-blue-900">バーコードスキャナー</h5>
                <NexusButton
                  onClick={stopScanning}
                  variant="secondary"
                  size="sm"
                >
                  キャンセル
                </NexusButton>
              </div>
              <BarcodeScanner
                onScan={handleBarcodeScan}
                onError={(error) => {
                  console.error('Barcode scan error:', error);
                  showToast({
                    type: 'error',
                    title: 'スキャンエラー',
                    message: 'バーコードの読み取りに失敗しました。',
                    duration: 3000
                  });
                }}
              />
            </NexusCard>
          )}

          {/* 手動入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              または棚番号を直接入力
            </label>
            <div className="flex gap-2">
              <NexusInput
                ref={locationInputRef}
                value={scannedLocation}
                onChange={(e) => handleLocationInput(e.target.value)}
                placeholder="棚番号を入力してください（例: A-01-001）"
                disabled={isValidatingLocation}
              />
              <NexusButton
                onClick={focusInput}
                variant="secondary"
                size="sm"
              >
                フォーカス
              </NexusButton>
            </div>
            {isValidatingLocation && (
              <p className="text-sm text-blue-600 mt-2">棚番号を確認中...</p>
            )}
          </div>

          {/* 棚情報表示 */}
          {locationData && (
            <NexusCard className="p-4 bg-green-50 border-green-200">
              <h5 className="text-sm font-medium text-green-900 mb-2">選択された棚</h5>
              <div className="text-sm space-y-1 text-green-800">
                <div><strong>棚番号:</strong> {locationData.code}</div>
                <div><strong>棚名:</strong> {locationData.name}</div>
                <div><strong>ゾーン:</strong> {locationData.zone}</div>
                <div><strong>容量:</strong> {locationData.currentCount + 1}/{locationData.capacity}</div>
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
              保管場所を入力すると検品チェックリストの作業が完了します。
              複数商品を同時に進行している場合は、保存して一覧に戻り、他の商品の作業を続けることができます。
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
          disabled={!locationData || loading}
        >
          {loading ? '保管中...' : '保管完了'}
        </NexusButton>
      </div>
    </div>
  );
}