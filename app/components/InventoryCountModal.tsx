'use client';

import { useState } from 'react';
import { XMarkIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { BaseModal, NexusButton, NexusRadioGroup, NexusCheckbox, NexusAlert } from './ui';

interface InventoryCountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InventoryCountModal({ isOpen, onClose }: InventoryCountModalProps) {
  const [countMode, setCountMode] = useState<'full' | 'partial'>('full');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const { showToast } = useToast();

  const locations = [
    { id: 'A-1', name: 'エリアA 棚1', items: 25 },
    { id: 'A-2', name: 'エリアA 棚2', items: 18 },
    { id: 'B-1', name: 'エリアB 棚1', items: 32 },
    { id: 'B-2', name: 'エリアB 棚2', items: 14 },
    { id: 'C-1', name: 'エリアC 棚1', items: 41 },
  ];

  const handleStartCount = async () => {
    setIsStarting(true);
    
    const countData = {
      mode: countMode,
      locations: countMode === 'partial' ? selectedLocations : locations.map(l => l.id),
      startedBy: 'システム',
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/inventory/count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(countData)
      });

      if (response.ok) {
        showToast({
          type: 'success',
          title: '棚卸し開始',
          message: '棚卸しを開始しました。本番環境では在庫状態が更新されます。',
          duration: 4000
        });
        onClose();
        // 本番運用では親コンポーネントの状態を更新
        // window.location.reload()は削除し、適切な状態管理を使用
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'エラー',
        message: '棚卸しの開始に失敗しました'
      });
    } finally {
      setIsStarting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="棚卸し開始"
      size="lg"
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600 mr-3" />
          <p className="text-sm text-gray-500">在庫数量の確認・更新を行います</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              棚卸しモード
            </label>
            <NexusRadioGroup
              name="countMode"
              value={countMode}
              onChange={(value) => setCountMode(value as 'full' | 'partial')}
              options={[
                { value: 'full', label: '全棚卸し' },
                { value: 'partial', label: '部分棚卸し' }
              ]}
            />
          </div>

          {countMode === 'partial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                対象ロケーション
              </label>
              <div className="space-y-2">
                {locations.map((location) => (
                  <div key={location.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <NexusCheckbox
                      checked={selectedLocations.includes(location.id)}
                      onChange={(checked) => {
                        if (checked) {
                          setSelectedLocations([...selectedLocations, location.id]);
                        } else {
                          setSelectedLocations(selectedLocations.filter(id => id !== location.id));
                        }
                      }}
                      label={`${location.name} (${location.items}件)`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <NexusAlert type="warning" title="注意事項">
            <ul className="space-y-1">
              <li>• 棚卸し中は該当エリアの商品移動を制限します</li>
              <li>• 実際の在庫数量をシステムに正確に入力してください</li>
              <li>• 差異が発見された場合は理由を記録してください</li>
            </ul>
          </NexusAlert>

          <NexusAlert type="info" title="棚卸し対象">
            <p>
              {countMode === 'full' 
                ? `全エリア (${locations.reduce((sum, loc) => sum + loc.items, 0)}件の商品)`
                : `選択したエリア (${selectedLocations.length}エリア)`
              }
            </p>
          </NexusAlert>
        </div>

        <div className="flex justify-between pt-6 border-t">
          <NexusButton
            variant="default"
            size="md"
            onClick={onClose}
          >
            キャンセル
          </NexusButton>
          <NexusButton
            variant="primary"
            size="md"
            onClick={handleStartCount}
            disabled={isStarting || (countMode === 'partial' && selectedLocations.length === 0)}
          >
            {isStarting ? '開始中...' : '棚卸し開始'}
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
} 