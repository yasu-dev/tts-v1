'use client';

import { useState } from 'react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { BaseModal, NexusButton, NexusSelect, NexusInput, NexusCheckbox } from './ui';
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
        <NexusSelect
          label="スキャンモード"
          value={settings.scanMode}
          onChange={(e) => setSettings({...settings, scanMode: e.target.value})}
          variant="nexus"
          options={[
            { value: 'continuous', label: '連続スキャン' },
            { value: 'single', label: '単発スキャン' }
          ]}
        />

        <NexusInput
          type="number"
          label="スキャン間隔 (ミリ秒)"
          min="100"
          max="5000"
          step="100"
          value={settings.scanDelay.toString()}
          onChange={(e) => setSettings({...settings, scanDelay: parseInt(e.target.value)})}
          variant="nexus"
        />

        <NexusSelect
          label="フラッシュライト"
          value={settings.torchMode}
          onChange={(e) => setSettings({...settings, torchMode: e.target.value})}
          variant="nexus"
          options={[
            { value: 'auto', label: '自動' },
            { value: 'on', label: '常時点灯' },
            { value: 'off', label: '常時消灯' }
          ]}
        />

        <div className="space-y-3">
          <NexusCheckbox
            checked={settings.soundEnabled}
            onChange={(e) => setSettings({...settings, soundEnabled: e.target.checked})}
            label="スキャン音を有効にする"
            variant="nexus"
          />

          <NexusCheckbox
            checked={settings.vibrationEnabled}
            onChange={(e) => setSettings({...settings, vibrationEnabled: e.target.checked})}
            label="バイブレーションを有効にする"
            variant="nexus"
          />

          <NexusCheckbox
            checked={settings.autoFocus}
            onChange={(e) => setSettings({...settings, autoFocus: e.target.checked})}
            label="オートフォーカスを有効にする"
            variant="nexus"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
            対応バーコード形式
          </label>
          <div className="space-y-2">
            {['CODE128', 'QR_CODE', 'EAN13', 'EAN8', 'CODE39', 'ITF'].map((format) => (
              <NexusCheckbox
                key={format}
                checked={settings.barcodeFormats.includes(format)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSettings({...settings, barcodeFormats: [...settings.barcodeFormats, format]});
                  } else {
                    setSettings({...settings, barcodeFormats: settings.barcodeFormats.filter(f => f !== format)});
                  }
                }}
                label={format}
                variant="nexus"
              />
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