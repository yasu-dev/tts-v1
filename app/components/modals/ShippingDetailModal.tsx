'use client';

import { useState } from 'react';
import { BaseModal, NexusButton, BusinessStatusIndicator } from '../ui';
import { useToast } from '../features/notifications/ToastProvider';
import { 
  TruckIcon, 
  PrinterIcon, 
  ArchiveBoxIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  DocumentTextIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface ShippingItem {
  id: string;
  productName: string;
  productSku: string;
  orderNumber: string;
  customer: string;
  shippingAddress: string;
  status: 'pending_inspection' | 'inspected' | 'packed' | 'shipped' | 'delivered';
  priority: 'urgent' | 'normal' | 'low';
  dueDate: string;
  inspectionNotes?: string;
  trackingNumber?: string;
  shippingMethod: string;
  value: number;
}

interface ShippingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShippingItem | null;
  onStatusUpdate?: (itemId: string, newStatus: ShippingItem['status']) => void;
  onPrintLabel?: (item: ShippingItem) => void;
  onPackingInstruction?: (item: ShippingItem) => void;
}

export default function ShippingDetailModal({
  isOpen,
  onClose,
  item,
  onStatusUpdate,
  onPrintLabel,
  onPackingInstruction
}: ShippingDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'notes'>('details');
  const { showToast } = useToast();

  if (!isOpen || !item) return null;

  const statusLabels: Record<string, string> = {
    'pending_inspection': '検査待ち',
    'inspected': '検査済み',
    'packed': '梱包済み',
    'shipped': '発送済み',
    'delivered': '配送完了'
  };

  const priorityLabels: Record<string, string> = {
    urgent: '緊急',
    normal: '通常',
    low: '低'
  };

  const getAvailableStatuses = (currentStatus: ShippingItem['status']): ShippingItem['status'][] => {
    const allStatuses: ShippingItem['status'][] = ['pending_inspection', 'inspected', 'packed', 'shipped', 'delivered'];
    const currentIndex = allStatuses.indexOf(currentStatus);
    const availableStatuses = allStatuses.filter((_, index) => index > currentIndex);
    console.log('getAvailableStatuses:', { currentStatus, currentIndex, availableStatuses });
    return availableStatuses;
  };

  const handleStatusUpdate = (newStatus: ShippingItem['status']) => {
    console.log('handleStatusUpdate called:', { itemId: item.id, newStatus, onStatusUpdate });
    if (onStatusUpdate) {
      onStatusUpdate(item.id, newStatus);
    }
    showToast({
      title: 'ステータス更新',
      message: `ステータスを${statusLabels[newStatus]}に更新しました`,
      type: 'success'
    });
  };

  const handlePrintLabel = () => {
    if (onPrintLabel) {
      onPrintLabel(item);
    }
    showToast({
      title: '印刷開始',
      message: `${item.productName}の配送ラベルを印刷します`,
      type: 'info'
    });
  };

  const handlePackingInstruction = () => {
    if (onPackingInstruction) {
      onPackingInstruction(item);
    }
    showToast({
      title: '梱包指示',
      message: `${item.productName}の梱包指示を開始します`,
      type: 'info'
    });
  };

  // デモ履歴データ
  const demoHistory = [
    { 
      date: '2024-12-25 14:30', 
      action: 'ステータス変更', 
      details: `${statusLabels[item.status]}に更新`, 
      user: '田中スタッフ' 
    },
    { 
      date: '2024-12-25 10:15', 
      action: '注文受付', 
      details: `注文番号: ${item.orderNumber}`, 
      user: 'システム' 
    },
    { 
      date: '2024-12-24 16:45', 
      action: '商品割当', 
      details: `SKU: ${item.productSku}`, 
      user: '佐藤スタッフ' 
    }
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="出荷詳細"
      size="xl"
      className="max-h-[90vh] overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-display font-bold text-nexus-text-primary mb-2">
                {item.productName}
              </h2>
              <div className="flex items-center space-x-4">
                <span className="cert-nano cert-premium">
                  {item.productSku}
                </span>
                <BusinessStatusIndicator status={item.status} />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.priority === 'urgent' 
                    ? 'bg-red-100 text-red-800' 
                    : item.priority === 'normal'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {priorityLabels[item.priority]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-nexus-border mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'details', label: '詳細情報', icon: DocumentTextIcon },
              { id: 'history', label: '履歴', icon: ClockIcon },
              { id: 'notes', label: '備考', icon: DocumentTextIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-nexus-blue text-nexus-blue'
                    : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-nexus-border'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[50vh] mb-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 注文情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-nexus-text-primary flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  注文情報
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                      注文番号
                    </label>
                    <p className="text-nexus-text-primary">{item.orderNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                      お客様
                    </label>
                    <p className="text-nexus-text-primary font-medium">{item.customer}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                      出荷期限
                    </label>
                    <p className="text-nexus-text-primary">{item.dueDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                      商品価値
                    </label>
                    <p className="text-nexus-text-primary font-display font-bold text-lg">
                      ¥{item.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* 配送情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-nexus-text-primary flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5" />
                  配送情報
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                      配送先住所
                    </label>
                    <p className="text-nexus-text-primary">{item.shippingAddress}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                      配送方法
                    </label>
                    <p className="text-nexus-text-primary">{item.shippingMethod}</p>
                  </div>
                  {item.trackingNumber && (
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        追跡番号
                      </label>
                      <p className="text-nexus-text-primary">
                        <span className="cert-nano cert-mint">{item.trackingNumber}</span>
                      </p>
                    </div>
                  )}
                  {item.inspectionNotes && (
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        検品メモ
                      </label>
                      <p className="text-nexus-text-primary">{item.inspectionNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-nexus-text-primary mb-4">
                処理履歴
              </h3>
              <div className="space-y-3">
                {demoHistory.map((entry, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-nexus-bg-secondary rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-nexus-blue rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-nexus-text-primary">{entry.action}</p>
                        <span className="text-sm text-nexus-text-secondary">{entry.date}</span>
                      </div>
                      <p className="text-sm text-nexus-text-secondary mt-1">{entry.details}</p>
                      <p className="text-xs text-nexus-text-secondary mt-1">担当: {entry.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-nexus-text-primary mb-4">
                備考・特記事項
              </h3>
              <div className="bg-nexus-bg-secondary rounded-lg p-4">
                <p className="text-nexus-text-secondary">
                  {item.inspectionNotes || '特記事項はありません。'}
                </p>
              </div>
              {item.value > 500000 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <BanknotesIcon className="w-5 h-5 text-yellow-600" />
                    <p className="text-yellow-800 font-medium">高額商品注意</p>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    商品価値が50万円を超えています。取り扱いには十分注意し、保険付き配送を推奨します。
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-nexus-border pt-6">
          <div className="space-y-6">
            {/* ステータス変更セクション */}
            {item.status !== 'delivered' && (
              <div>
                <h4 className="text-sm font-medium text-nexus-text-secondary mb-3">
                  ステータス変更
                </h4>
                <div className="flex flex-wrap gap-2">
                  {getAvailableStatuses(item.status).map((nextStatus) => (
                    <NexusButton
                      key={nextStatus}
                      onClick={(e) => {
                        console.log('Button clicked:', nextStatus);
                        e.preventDefault();
                        e.stopPropagation();
                        handleStatusUpdate(nextStatus);
                      }}
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      {statusLabels[nextStatus]}に進める
                    </NexusButton>
                  ))}
                  {getAvailableStatuses(item.status).length === 0 && (
                    <p className="text-sm text-nexus-text-secondary">
                      これ以上進められるステータスはありません
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* アクションボタン群 */}
            <div>
              <h4 className="text-sm font-medium text-nexus-text-secondary mb-3">
                操作
              </h4>
              <div className="flex flex-wrap gap-3">
                {item.status === 'inspected' && (
                  <NexusButton
                    onClick={handlePackingInstruction}
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <ArchiveBoxIcon className="w-4 h-4" />
                    梱包指示
                  </NexusButton>
                )}
                
                {item.status === 'packed' && (
                  <NexusButton
                    onClick={handlePrintLabel}
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <PrinterIcon className="w-4 h-4" />
                    配送ラベル印刷
                  </NexusButton>
                )}

                {item.trackingNumber && (
                  <NexusButton
                    onClick={() => {
                      navigator.clipboard.writeText(item.trackingNumber!);
                      showToast({
                        title: 'コピー完了',
                        message: '追跡番号をクリップボードにコピーしました',
                        type: 'success'
                      });
                    }}
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <TruckIcon className="w-4 h-4" />
                    追跡番号コピー
                  </NexusButton>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-nexus-border">
          <NexusButton
            onClick={onClose}
            variant="default"
          >
            閉じる
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
} 