'use client';

import { useState } from 'react';
import { XMarkIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

interface InventoryCountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InventoryCountModal({ isOpen, onClose }: InventoryCountModalProps) {
  const [countMode, setCountMode] = useState<'full' | 'partial'>('full');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);

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
        alert('棚卸しを開始しました');
        onClose();
        window.location.reload();
      }
    } catch (error) {
      alert('棚卸しの開始に失敗しました');
    } finally {
      setIsStarting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold">棚卸し開始</h2>
              <p className="text-sm text-gray-500">在庫数量の確認・更新を行います</p>
            </div>
          </div>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              棚卸しモード
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="countMode"
                  value="full"
                  checked={countMode === 'full'}
                  onChange={(e) => setCountMode(e.target.value as 'full' | 'partial')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">全棚卸し</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="countMode"
                  value="partial"
                  checked={countMode === 'partial'}
                  onChange={(e) => setCountMode(e.target.value as 'full' | 'partial')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">部分棚卸し</span>
              </label>
            </div>
          </div>

          {countMode === 'partial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                対象ロケーション
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {locations.map((location) => (
                  <label key={location.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(location.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLocations([...selectedLocations, location.id]);
                        } else {
                          setSelectedLocations(selectedLocations.filter(id => id !== location.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium">{location.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({location.items}件)</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">注意事項</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 棚卸し中は該当エリアの商品移動を制限します</li>
              <li>• 実際の在庫数量をシステムに正確に入力してください</li>
              <li>• 差異が発見された場合は理由を記録してください</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">棚卸し対象</h4>
            <p className="text-sm text-blue-700">
              {countMode === 'full' 
                ? `全エリア (${locations.reduce((sum, loc) => sum + loc.items, 0)}件の商品)`
                : `選択したエリア (${selectedLocations.length}エリア)`
              }
            </p>
          </div>
        </div>

        <div className="flex justify-between p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            キャンセル
          </button>
          <button
            onClick={handleStartCount}
            disabled={isStarting || (countMode === 'partial' && selectedLocations.length === 0)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {isStarting ? '開始中...' : '棚卸し開始'}
          </button>
        </div>
      </div>
    </div>
  );
} 