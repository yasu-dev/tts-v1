'use client';

import { useState } from 'react';
import LocationScanner from '../LocationScanner';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';

interface LocationRegistrationProps {
  onRegisterComplete?: (productId: string, location: string) => void;
}

interface RegistrationResult {
  productId: string;
  productName: string;
  location: string;
  timestamp: string;
  status: 'success' | 'error';
  message?: string;
}

export default function LocationRegistration({ onRegisterComplete }: LocationRegistrationProps) {
  const [registrationHistory, setRegistrationHistory] = useState<RegistrationResult[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleProductScanned = (productId: string) => {
    console.log('Product scanned:', productId);
  };

  const handleLocationScanned = (locationCode: string) => {
    console.log('Location scanned:', locationCode);
  };

  const handleComplete = async (productId: string, locationCode: string) => {
    setIsRegistering(true);
    
    try {
      // APIコール（実装時にはactual API endpointを使用）
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          location: locationCode,
          action: 'register',
        }),
      });

      if (!response.ok) {
        throw new Error('登録に失敗しました');
      }

      const result: RegistrationResult = {
        productId,
        productName: `商品 ${productId}`, // 実際にはAPIから取得
        location: locationCode,
        timestamp: new Date().toISOString(),
        status: 'success',
      };

      setRegistrationHistory(prev => [result, ...prev].slice(0, 10)); // 最新10件を保持
      
      if (onRegisterComplete) {
        onRegisterComplete(productId, locationCode);
      }

      // 成功通知
      alert(`商品 ${productId} を ${locationCode} に登録しました`);
    } catch (error) {
      console.error('[ERROR] Location registration:', error);
      
      const errorResult: RegistrationResult = {
        productId,
        productName: `商品 ${productId}`,
        location: locationCode,
        timestamp: new Date().toISOString(),
        status: 'error',
        message: error instanceof Error ? error.message : 'エラーが発生しました',
      };

      setRegistrationHistory(prev => [errorResult, ...prev].slice(0, 10));
      alert('登録に失敗しました');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* スキャナーセクション */}
      <LocationScanner
        onProductScanned={handleProductScanned}
        onLocationScanned={handleLocationScanned}
        onComplete={handleComplete}
      />

      {/* 登録履歴セクション */}
      {registrationHistory.length > 0 && (
        <NexusCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">最近の登録履歴</h3>
          <div className="space-y-2">
            {registrationHistory.map((result, index) => (
              <div
                key={`${result.productId}-${result.timestamp}-${index}`}
                className={`p-4 rounded-lg border ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {result.productName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {result.productId} → {result.location}
                    </p>
                    {result.message && (
                      <p className="text-sm text-red-600 mt-1">{result.message}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        result.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.status === 'success' ? '成功' : 'エラー'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(result.timestamp).toLocaleString('ja-JP')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </NexusCard>
      )}

      {/* 処理中インジケーター */}
      {isRegistering && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
              <p className="text-lg">登録処理中...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 