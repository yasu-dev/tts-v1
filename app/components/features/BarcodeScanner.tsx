'use client';

import { useState, useRef, useEffect } from 'react';
import { QrCode, Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  scanType?: 'product' | 'location';
}

export default function BarcodeScanner({
  onScan,
  placeholder = 'バーコードをスキャンしてください',
  className = '',
  autoFocus = true,
  scanType = 'product'
}: BarcodeScannerProps) {
  const [value, setValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // バーコードスキャナーの入力を検知
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setIsScanning(true);

    // 既存のタイムアウトをクリア
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    // 短時間で入力が完了した場合はスキャナーからの入力と判定
    scanTimeoutRef.current = setTimeout(() => {
      if (newValue.length >= 8) { // 最小バーコード長
        handleScan(newValue);
      }
      setIsScanning(false);
    }, 100); // スキャナーは高速入力するため短いタイムアウト
  };

  // Enter キーでも確定
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value) {
      e.preventDefault();
      handleScan(value);
    }
  };

  const handleScan = (barcode: string) => {
    // バーコード形式の検証
    if (validateBarcode(barcode, scanType)) {
      setLastScanned(barcode);
      onScan(barcode);
      setValue(''); // 入力をクリア
      
      // 成功フィードバック
      if (inputRef.current) {
        inputRef.current.classList.add('ring-2', 'ring-green-500');
        setTimeout(() => {
          inputRef.current?.classList.remove('ring-2', 'ring-green-500');
        }, 1000);
      }
    } else {
      // エラーフィードバック
      if (inputRef.current) {
        inputRef.current.classList.add('ring-2', 'ring-red-500');
        setTimeout(() => {
          inputRef.current?.classList.remove('ring-2', 'ring-red-500');
          setValue(''); // エラー時も入力をクリア
        }, 1000);
      }
    }
  };

  // バーコード形式の検証
  const validateBarcode = (barcode: string, type: string): boolean => {
    if (!barcode || barcode.length < 8) return false;

    if (type === 'product') {
      // 商品バーコード: JAN/EAN/UPC形式など
      return /^[0-9]{8,13}$/.test(barcode) || /^TWD-\d{8}-\d{5}$/.test(barcode);
    } else if (type === 'location') {
      // ロケーションバーコード: 独自形式
      return /^[A-Z]-\d{2}$/.test(barcode) || /^[A-Z]\d{2}$/.test(barcode);
    }
    
    return true;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <QrCode className={`h-5 w-5 ${isScanning ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${isScanning ? 'bg-blue-50' : 'bg-white'}
          `}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        {isScanning && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          </div>
        )}
      </div>
      
      {lastScanned && (
        <div className="text-sm text-gray-600">
          最後にスキャン: <span className="font-mono font-semibold">{lastScanned}</span>
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        {scanType === 'product' ? 
          'バーコードスキャナーで商品バーコードをスキャンするか、手入力してEnterキーを押してください' :
          'ロケーションバーコード（例: A-01）をスキャンしてください'
        }
      </div>
    </div>
  );
} 