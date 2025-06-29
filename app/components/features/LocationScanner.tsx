'use client';

import { useState, useCallback } from 'react';
import BarcodeScanner from '../BarcodeScanner';

interface LocationScannerProps {
  onProductScanned: (productId: string) => void;
  onLocationScanned: (locationCode: string) => void;
  onComplete?: (productId: string, locationCode: string) => void;
}

export default function LocationScanner({ 
  onProductScanned, 
  onLocationScanned,
  onComplete 
}: LocationScannerProps) {
  const [scanMode, setScanMode] = useState<'product' | 'location'>('product');
  const [scannedProduct, setScannedProduct] = useState<string | null>(null);
  const [scannedLocation, setScannedLocation] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = useCallback((code: string) => {
    if (scanMode === 'product') {
      setScannedProduct(code);
      onProductScanned(code);
      setScanMode('location');
      
      // Auto-switch to location scanning
      setTimeout(() => {
        setIsScanning(true);
      }, 500);
    } else {
      setScannedLocation(code);
      onLocationScanned(code);
      
      if (scannedProduct && onComplete) {
        onComplete(scannedProduct, code);
      }
    }
  }, [scanMode, scannedProduct, onProductScanned, onLocationScanned, onComplete]);

  const resetScanner = () => {
    setScannedProduct(null);
    setScannedLocation(null);
    setScanMode('product');
    setIsScanning(false);
  };

  return (
    <div className="intelligence-card global">
      <div className="p-8">
        <div className="mb-6">
          <h3 className="text-xl font-display font-bold text-nexus-text-primary">
            バーコードスキャン登録
          </h3>
          <p className="text-nexus-text-secondary mt-1">
            商品バーコード → 棚番バーコードの順でスキャンしてください
          </p>
        </div>

        {/* Scan Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center space-x-3 ${scanMode === 'product' ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`action-orb ${scannedProduct ? 'green' : 'blue'}`}>
                {scannedProduct ? '✓' : '1'}
              </div>
              <div>
                <p className="font-medium text-nexus-text-primary">商品バーコード</p>
                {scannedProduct && (
                  <p className="text-sm text-nexus-text-secondary">{scannedProduct}</p>
                )}
              </div>
            </div>

            <div className="w-12 h-0.5 bg-nexus-border"></div>

            <div className={`flex items-center space-x-3 ${scanMode === 'location' ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`action-orb ${scannedLocation ? 'green' : scanMode === 'location' ? 'blue' : ''}`}>
                {scannedLocation ? '✓' : '2'}
              </div>
              <div>
                <p className="font-medium text-nexus-text-primary">棚番バーコード</p>
                {scannedLocation && (
                  <p className="text-sm text-nexus-text-secondary">{scannedLocation}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="relative w-full h-2 bg-nexus-bg-secondary rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-gradient-to-r from-[#0064D2] to-[#0078FF] transition-all duration-500"
              style={{ 
                width: scannedProduct && scannedLocation ? '100%' : scannedProduct ? '50%' : '0%' 
              }}
            />
          </div>
        </div>

        {/* Scanner */}
        {isScanning ? (
          <div className="mb-6">
            <BarcodeScanner
              onScan={handleScan}
              onError={(error) => console.error('Scan error:', error)}
            />
            <button
              onClick={() => setIsScanning(false)}
              className="nexus-button mt-4 w-full"
            >
              スキャンを停止
            </button>
          </div>
        ) : (
          <div className="mb-6 text-center">
            <button
              onClick={() => setIsScanning(true)}
              className="nexus-button primary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
              </svg>
              {scanMode === 'product' ? '商品バーコードをスキャン' : '棚番バーコードをスキャン'}
            </button>
          </div>
        )}

        {/* Manual Input */}
        <div className="mb-6">
          <p className="text-sm text-nexus-text-secondary mb-2">
            または手動で入力:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="商品ID (例: TWD-CAM-001)"
                value={scannedProduct || ''}
                onChange={(e) => {
                  setScannedProduct(e.target.value);
                  if (e.target.value) onProductScanned(e.target.value);
                }}
                className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-[#0064D2] text-nexus-text-primary"
                disabled={scanMode === 'location'}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="棚番号 (例: A区画-01)"
                value={scannedLocation || ''}
                onChange={(e) => {
                  setScannedLocation(e.target.value);
                  if (e.target.value) onLocationScanned(e.target.value);
                }}
                className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-[#0064D2] text-nexus-text-primary"
                disabled={scanMode === 'product' || !scannedProduct}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={resetScanner}
            className="nexus-button"
          >
            リセット
          </button>
          
          <button
            disabled={!scannedProduct || !scannedLocation}
            className={`nexus-button ${scannedProduct && scannedLocation ? 'primary' : ''}`}
            onClick={() => {
              if (scannedProduct && scannedLocation && onComplete) {
                onComplete(scannedProduct, scannedLocation);
                resetScanner();
              }
            }}
          >
            登録実行
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-[rgba(0,100,210,0.05)] rounded-lg border border-[rgba(0,100,210,0.25)]">
          <h4 className="font-medium text-nexus-text-primary mb-2">使用方法</h4>
          <ol className="text-sm text-nexus-text-secondary space-y-1 list-decimal list-inside">
            <li>商品のバーコードをスキャンまたは入力</li>
            <li>自動的に棚番スキャンモードに切り替わります</li>
            <li>保管場所の棚番バーコードをスキャン</li>
            <li>両方のスキャンが完了したら自動登録</li>
          </ol>
        </div>
      </div>
    </div>
  );
}