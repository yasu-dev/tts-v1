'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { BaseModal, NexusButton } from '../ui';

interface CarrierSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
}

interface Carrier {
  id: string;
  name: string;
  active: boolean;
  defaultRate: number;
  trackingUrl: string;
  apiKey: string;
  notes: string;
}

export default function CarrierSettingsModal({ isOpen, onClose, onSave }: CarrierSettingsModalProps) {
  const [carriers, setCarriers] = useState<Carrier[]>([
    {
      id: 'yamato',
      name: 'ヤマト運輸',
      active: true,
      defaultRate: 800,
      trackingUrl: 'https://toi.kuronekoyamato.co.jp/cgi-bin/tneko',
      apiKey: '',
      notes: '通常配送'
    },
    {
      id: 'sagawa',
      name: '佐川急便',
      active: true,
      defaultRate: 750,
      trackingUrl: 'https://k2k.sagawa-exp.co.jp/p/sagawa/web/okurijoinput.jsp',
      apiKey: '',
      notes: '大型商品対応'
    },
    {
      id: 'yupack',
      name: 'ゆうパック',
      active: false,
      defaultRate: 700,
      trackingUrl: 'https://trackings.post.japanpost.jp/services/srv/search/',
      apiKey: '',
      notes: '離島配送可能'
    }
  ]);

  const handleCarrierChange = (carrierId: string, field: keyof Carrier, value: any) => {
    setCarriers(prev => prev.map(carrier => 
      carrier.id === carrierId 
        ? { ...carrier, [field]: value }
        : carrier
    ));
  };

  const handleSave = () => {
    onSave({ carriers });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="配送業者設定"
      size="lg"
      className="max-w-4xl"
    >
      <div className="max-h-[90vh] overflow-y-auto">

        
        <div className="space-y-6">
          {carriers.map((carrier) => (
            <div key={carrier.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium">{carrier.name}</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={carrier.active}
                    onChange={(e) => handleCarrierChange(carrier.id, 'active', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">有効</span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    基本配送料 (円)
                  </label>
                  <input
                    type="number"
                    value={carrier.defaultRate}
                    onChange={(e) => handleCarrierChange(carrier.id, 'defaultRate', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API キー
                  </label>
                  <input
                    type="password"
                    value={carrier.apiKey}
                    onChange={(e) => handleCarrierChange(carrier.id, 'apiKey', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="API キーを入力"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  追跡URL
                </label>
                <input
                  type="url"
                  value={carrier.trackingUrl}
                  onChange={(e) => handleCarrierChange(carrier.id, 'trackingUrl', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備考
                </label>
                <textarea
                  value={carrier.notes}
                  onChange={(e) => handleCarrierChange(carrier.id, 'notes', e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="配送業者に関する備考"
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 pt-6">
          <NexusButton
            onClick={handleSave}
            variant="primary"
            className="flex-1"
          >
            保存
          </NexusButton>
          <NexusButton
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            キャンセル
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
} 