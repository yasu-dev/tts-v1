'use client';

import { useState } from 'react';
import { BaseModal, NexusButton } from './ui';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { 
  XMarkIcon, 
  PencilIcon, 
  ArrowPathIcon,
  QrCodeIcon,
  PrinterIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    sku: string;
    category: string;
    status: string;
    location: string;
    price: number;
    condition: string;
    imageUrl?: string;
    entryDate: string;
    assignedStaff?: string;
    lastModified: string;
    qrCode?: string;
    notes?: string;
  } | null;
  onEdit?: (item: any) => void;
  onMove?: (item: any) => void;
  onGenerateQR?: (item: any) => void;
}

export default function ItemDetailModal({ 
  isOpen, 
  onClose, 
  item, 
  onEdit, 
  onMove, 
  onGenerateQR 
}: ItemDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'notes'>('details');
  const { showToast } = useToast();

  if (!isOpen || !item) return null;

  const statusColors = {
    'inbound': 'bg-blue-100 text-blue-800',
    'inspection': 'bg-yellow-100 text-yellow-800',
    'storage': 'bg-green-100 text-green-800',
    'listing': 'bg-purple-100 text-purple-800',
    'sold': 'bg-gray-100 text-gray-800',
    'maintenance': 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    'inbound': '入庫中',
    'inspection': '検品中',
    'storage': '保管中',
    'listing': '出品中',
    'sold': '売却済み',
    'maintenance': 'メンテナンス'
  };

  const demoHistory = [
    { date: '2024-12-24 10:00', action: 'ステータス変更', details: '検品中 → 保管中', user: '田中太郎' },
    { date: '2024-12-23 14:30', action: 'ロケーション移動', details: 'A-1-001 → A-1-002', user: '田中太郎' },
    { date: '2024-12-22 09:15', action: '商品登録', details: '初回登録完了', user: '佐藤花子' },
  ];

  const handlePrint = () => {
    const printContent = `
      商品詳細情報
      
      商品名: ${item.name}
      SKU: ${item.sku}
      カテゴリ: ${item.category}
      ステータス: ${statusLabels[item.status as keyof typeof statusLabels]}
      保管場所: ${item.location}
      価格: ¥${item.price.toLocaleString()}
      状態: ${item.condition}
      登録日: ${new Date(item.entryDate).toLocaleDateString('ja-JP')}
      担当者: ${item.assignedStaff || 'なし'}
      最終更新: ${new Date(item.lastModified).toLocaleDateString('ja-JP')}
      備考: ${item.notes || 'なし'}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>商品詳細 - ${item.name}</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <pre style="white-space: pre-wrap;">${printContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDuplicate = () => {
    const duplicateData = {
      ...item,
      id: `${item.id}-copy`,
      sku: `${item.sku}-COPY`,
      name: `${item.name} (コピー)`,
      entryDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    // APIに送信
    fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(duplicateData)
    })
    .then(res => res.json())
    .then(data => {
      showToast({
        type: 'success',
        title: '商品複製',
        message: `商品を複製しました: ${duplicateData.name}。本番環境では在庫リストが更新されます。`,
        duration: 4000
      });
      onClose();
      // 本番運用では親コンポーネントの状態を更新
      // window.location.reload()は削除し、適切な状態管理を使用
    })
    .catch(err => {
      console.error('商品複製エラー:', err);
      showToast({
        type: 'error',
        title: 'エラー',
        message: '商品の複製に失敗しました'
      });
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="商品詳細"
      size="xl"
      className="max-h-[90vh] overflow-hidden"
    >
      <div className="p-6">
        <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {item.name} ({item.sku})
            </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'details', label: '詳細情報' },
              { id: 'history', label: '履歴' },
              { id: 'notes', label: '備考' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-96">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  基本情報
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      商品名
                    </label>
                    <p className="text-gray-900 dark:text-white">{item.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SKU
                    </label>
                    <p className="text-gray-900 dark:text-white">{item.sku}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      カテゴリ
                    </label>
                    <p className="text-gray-900 dark:text-white">{item.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      状態
                    </label>
                    <p className="text-gray-900 dark:text-white">{item.condition}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      価格
                    </label>
                    <p className="text-gray-900 dark:text-white">¥{item.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ステータス
                    </label>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[item.status as keyof typeof statusColors]}`}>
                      {statusLabels[item.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location and Assignment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  保管・担当情報
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      保管場所
                    </label>
                    <p className="text-gray-900 dark:text-white">{item.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      担当者
                    </label>
                    <p className="text-gray-900 dark:text-white">{item.assignedStaff || 'なし'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      登録日
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(item.entryDate).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      最終更新
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(item.lastModified).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                操作履歴
              </h3>
              <div className="space-y-3">
                {demoHistory.map((entry, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {entry.action}
                        </span>
                        <span className="text-sm text-gray-500">
                          {entry.date}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {entry.details}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        実行者: {entry.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                備考・メモ
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white">
                  {item.notes || '備考はありません'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            <NexusButton
              onClick={handlePrint}
              variant="default"
              icon={<PrinterIcon className="w-4 h-4" />}
            >
              印刷
            </NexusButton>
            <NexusButton
              onClick={handleDuplicate}
              variant="default"
              icon={<DocumentDuplicateIcon className="w-4 h-4" />}
            >
              複製
            </NexusButton>
          </div>
          <div className="flex space-x-3">
            <NexusButton
              onClick={onClose}
              variant="default"
            >
              閉じる
            </NexusButton>
            {onGenerateQR && (
              <NexusButton
                onClick={() => onGenerateQR(item)}
                variant="secondary"
                icon={<QrCodeIcon className="w-4 h-4" />}
              >
                QR生成
              </NexusButton>
            )}
            {onMove && (
              <NexusButton
                onClick={() => onMove(item)}
                variant="secondary"
                icon={<ArrowPathIcon className="w-4 h-4" />}
              >
                移動
              </NexusButton>
            )}
            {onEdit && (
              <NexusButton
                onClick={() => onEdit(item)}
                variant="primary"
                icon={<PencilIcon className="w-4 h-4" />}
              >
                編集
              </NexusButton>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
} 