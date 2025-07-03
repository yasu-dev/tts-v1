'use client';

import { useState } from 'react';
import { XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface BarcodeScannerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BarcodeScannerSettingsModal({ isOpen, onClose }: BarcodeScannerSettingsModalProps) {
  const [settings, setSettings] = useState({
    scanMode: 'continuous',
    soundEnabled: true,
    vibrationEnabled: true,
    autoFocus: true,
    torchMode: 'auto',
    scanDelay: 1000,
    barcodeFormats: ['CODE128', 'QR_CODE', 'EAN13', 'EAN8']
  });

  const handleSave = async () => {
    try {
      const response = await fetch('/api/barcode/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('バーコードスキャナー設定を保存しました');
        onClose();
      }
    } catch (error) {
      alert('設定の保存に失敗しました');
    }
  };

  const handleReset = () => {
    setSettings({
      scanMode: 'continuous',
      soundEnabled: true,
      vibrationEnabled: true,
      autoFocus: true,
      torchMode: 'auto',
      scanDelay: 1000,
      barcodeFormats: ['CODE128', 'QR_CODE', 'EAN13', 'EAN8']
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Cog6ToothIcon className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-bold">スキャナー設定</h2>
          </div>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              スキャンモード
            </label>
            <select
              value={settings.scanMode}
              onChange={(e) => setSettings({...settings, scanMode: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="continuous">連続スキャン</option>
              <option value="single">単発スキャン</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              スキャン間隔 (ミリ秒)
            </label>
            <input
              type="number"
              min="100"
              max="5000"
              step="100"
              value={settings.scanDelay}
              onChange={(e) => setSettings({...settings, scanDelay: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              フラッシュライト
            </label>
            <select
              value={settings.torchMode}
              onChange={(e) => setSettings({...settings, torchMode: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="auto">自動</option>
              <option value="on">常時点灯</option>
              <option value="off">常時消灯</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings({...settings, soundEnabled: e.target.checked})}
                className="h-4 w-4 text-purple-600"
              />
              <span className="ml-2 text-sm">スキャン音を有効にする</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.vibrationEnabled}
                onChange={(e) => setSettings({...settings, vibrationEnabled: e.target.checked})}
                className="h-4 w-4 text-purple-600"
              />
              <span className="ml-2 text-sm">バイブレーションを有効にする</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoFocus}
                onChange={(e) => setSettings({...settings, autoFocus: e.target.checked})}
                className="h-4 w-4 text-purple-600"
              />
              <span className="ml-2 text-sm">オートフォーカスを有効にする</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              対応バーコード形式
            </label>
            <div className="space-y-2">
              {['CODE128', 'QR_CODE', 'EAN13', 'EAN8', 'CODE39', 'ITF'].map((format) => (
                <label key={format} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.barcodeFormats.includes(format)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSettings({...settings, barcodeFormats: [...settings.barcodeFormats, format]});
                      } else {
                        setSettings({...settings, barcodeFormats: settings.barcodeFormats.filter(f => f !== format)});
                      }
                    }}
                    className="h-4 w-4 text-purple-600"
                  />
                  <span className="ml-2 text-sm">{format}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between p-6 border-t">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            リセット
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 