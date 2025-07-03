'use client';

import { useState } from 'react';
import BarcodeScannerSettingsModal from './BarcodeScannerSettingsModal';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
      onClose();
    }
  };

  const handleDemoScan = () => {
    setIsScanning(true);
    // デモ用のバーコードスキャン結果
    setTimeout(() => {
      const demoBarcodes = [
        'CAM-001-123456789',
        'WAT-001-987654321',
        'ACC-003-456789123',
        'LEN-002-789123456'
      ];
      const randomBarcode = demoBarcodes[Math.floor(Math.random() * demoBarcodes.length)];
      onScan(randomBarcode);
      setIsScanning(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            バーコードスキャン
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Camera View Placeholder */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-64 mb-6 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            {isScanning ? (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">スキャン中...</p>
                <div className="mt-4 relative">
                  <div className="w-48 h-32 border-2 border-purple-600 rounded-lg relative">
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  カメラビューエリア
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  バーコードをカメラに向けてスキャンしてください
                </p>
              </div>
            )}
          </div>

          {/* Manual Input */}
          <form onSubmit={handleManualSubmit} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              手動入力
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="バーコード番号を入力"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                入力
              </button>
            </div>
          </form>

          {/* Demo Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  デモ版について
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  実際のカメラ機能は実装されていません。デモスキャンまたは手動入力をご利用ください。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <div className="flex space-x-3">
            <button
              onClick={handleDemoScan}
              disabled={isScanning}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isScanning ? 'スキャン中...' : 'デモスキャン'}
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              設定
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <BarcodeScannerSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}