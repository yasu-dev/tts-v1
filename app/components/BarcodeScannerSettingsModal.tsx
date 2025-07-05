'use client';

import { useState } from 'react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { BaseModal, NexusButton } from './ui';
import { XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface BarcodeScannerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BarcodeScannerSettingsModal({ isOpen, onClose }: BarcodeScannerSettingsModalProps) {
  const { showToast } = useToast();
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
        showToast({
          type: 'success',
          title: '設定保存',
          message: 'バーコードスキャナー設定を保存しました'
        });
        onClose();
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'エラー',
        message: '設定の保存に失敗しました'
      });
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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="スキャナー設定"
      size="sm"
      className="max-w-md"
    >
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
        <NexusButton
          onClick={handleReset}
          variant="secondary"
        >
          リセット
        </NexusButton>
        <div className="flex space-x-3">
          <NexusButton
            onClick={onClose}
            variant="secondary"
          >
            キャンセル
          </NexusButton>
          <NexusButton
            onClick={handleSave}
            variant="primary"
          >
            保存
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
} 