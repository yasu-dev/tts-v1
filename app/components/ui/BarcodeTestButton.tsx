'use client';

import { useState } from 'react';
import NexusButton from './NexusButton';
import { CameraIcon, WrenchScrewdriverIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface BarcodeTestButtonProps {
  className?: string;
}

export default function BarcodeTestButton({ className = '' }: BarcodeTestButtonProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const { showToast } = useToast();

  // バーコードスキャンをシミュレートする関数
  const simulateBarcodeScanner = async (barcode: string) => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    
    try {
      console.log(`[バーコードシミュレーター] シミュレーション開始: ${barcode}`);
      
      // 高速キー入力をシミュレート
      for (let i = 0; i < barcode.length; i++) {
        const keyEvent = new KeyboardEvent('keypress', {
          key: barcode[i],
          code: `Key${barcode[i].toUpperCase()}`,
          which: barcode.charCodeAt(i),
          keyCode: barcode.charCodeAt(i),
          bubbles: true,
          cancelable: true
        });
        
        window.dispatchEvent(keyEvent);
        
        // バーコードリーダーの高速入力を再現（短い間隔）
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Enterキーを送信
      const enterEvent = new KeyboardEvent('keypress', {
        key: 'Enter',
        code: 'Enter',
        which: 13,
        keyCode: 13,
        bubbles: true,
        cancelable: true
      });
      
      window.dispatchEvent(enterEvent);
      
      console.log(`[バーコードシミュレーター] シミュレーション完了: ${barcode}`);
    } catch (error) {
      console.error('[バーコードシミュレーター] エラー:', error);
    } finally {
      setTimeout(() => setIsSimulating(false), 500);
    }
  };

  const testBarcodes = [
    { label: 'Sony A7II', code: 'CAM-SONY-A7II-002' },
    { label: 'Canon R6M2', code: 'CAM-CANON-R6M2-003' },
    { label: 'Nikon ZF', code: 'CAM-NIKON-ZF-009' },
    { label: 'Fujifilm XT5', code: 'CAM-FUJIFILM-XT5-005' },
  ];

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border-2 border-dashed border-blue-300 ${className}`}>
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <WrenchScrewdriverIcon className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-blue-800">バーコードテスター</h3>
        </div>
        <p className="text-xs text-gray-600">バーコードリーダーの代替ツール</p>
      </div>
      
      <div className="space-y-2">
        {testBarcodes.map((item, index) => (
          <NexusButton
            key={index}
            onClick={() => simulateBarcodeScanner(item.code)}
            disabled={isSimulating}
            size="sm"
            variant="outline"
            className="w-full text-left justify-start text-xs"
          >
            <CameraIcon className="w-4 h-4 mr-2 text-gray-600" />
            <span className="flex-1">{item.label}</span>
            <span className="text-gray-400 text-xs ml-2">{item.code}</span>
          </NexusButton>
        ))}
        
        <div className="border-t pt-2 mt-2">
          <NexusButton
            onClick={() => simulateBarcodeScanner('CUSTOM-TEST-001')}
            disabled={isSimulating}
            size="sm"
            variant="secondary"
            className="w-full text-xs"
          >
            <BeakerIcon className="w-4 h-4 mr-2 text-gray-600" />
            カスタムテスト
          </NexusButton>
        </div>
      </div>
      
      {isSimulating && (
        <div className="mt-2 text-xs text-blue-600 flex items-center">
          <div className="animate-spin h-3 w-3 border border-blue-600 rounded-full border-t-transparent mr-2"></div>
          スキャン中...
        </div>
      )}
    </div>
  );
}


