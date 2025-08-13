'use client';

import { useState } from 'react';
import { BaseModal, NexusButton } from '../ui';
import { generateTrackingUrl } from '@/lib/utils/tracking';
import { 
  TruckIcon, 
  UserIcon, 
  MapPinIcon, 
  CalendarIcon, 
  CurrencyYenIcon,
  ShoppingBagIcon,
  ClipboardDocumentCheckIcon,
  ArrowTopRightOnSquareIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  console.log('🔍 OrderDetailModal: 受信した注文データ', {
    order,
    trackingNumber: order?.trackingNumber,
    carrier: order?.carrier,
    id: order?.id,
    orderNumber: order?.orderNumber,
    isTrackingNumberTruthy: !!order?.trackingNumber
  });

  if (!order) return null;

  const handleTrackingClick = () => {
    if (order.trackingNumber && order.carrier) {
      const url = generateTrackingUrl(order.carrier, order.trackingNumber);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };



  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '保留中',
      confirmed: '確認済み',
      processing: '処理中',
      shipped: '発送済み',
      delivered: '配達完了',
      cancelled: 'キャンセル'
    };
    return labels[status] || status;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="注文詳細"
      size="lg"
    >
      <div className="space-y-6">
        {/* 注文基本情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-nexus-text-secondary mb-2">
                <TagIcon className="w-4 h-4" />
                注文番号
              </label>
              <div className="font-mono text-lg text-nexus-text-primary">
                {order.orderNumber || order.orderId}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-nexus-text-secondary mb-2">
                <UserIcon className="w-4 h-4" />
                顧客
              </label>
              <div className="text-nexus-text-primary">
                {order.customer}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-nexus-text-secondary mb-2">
                <CalendarIcon className="w-4 h-4" />
                注文日
              </label>
              <div className="text-nexus-text-primary">
                {new Date(order.orderDate || order.date).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-nexus-text-secondary mb-2">
                <CurrencyYenIcon className="w-4 h-4" />
                合計金額
              </label>
              <div className="text-lg font-bold text-nexus-text-primary">
                ¥{Number(order.totalAmount || order.amount || 0).toLocaleString()}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-nexus-text-secondary mb-2 block">
                ステータス
              </label>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            {order.shippingAddress && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-nexus-text-secondary mb-2">
                  <MapPinIcon className="w-4 h-4" />
                  配送先
                </label>
                <div className="text-sm text-nexus-text-primary">
                  {order.shippingAddress}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 商品一覧 */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-nexus-text-secondary mb-3">
            <ShoppingBagIcon className="w-4 h-4" />
            注文商品
          </label>
          <div className="space-y-3">
            {order.items?.length > 0 ? (
              order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-nexus-bg-secondary rounded-lg border border-nexus-border">
                  <div className="w-16 h-16 rounded border border-nexus-border overflow-hidden bg-nexus-bg-tertiary">
                    {item.productImage ? (
                      <img 
                        src={item.productImage} 
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-nexus-text-tertiary">
                        <ShoppingBagIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-nexus-text-primary">
                      {item.productName}
                    </div>
                    <div className="text-sm text-nexus-text-secondary">
                      カテゴリ: {item.category || '未分類'}
                    </div>
                    <div className="text-sm text-nexus-text-secondary">
                      数量: {item.quantity} / 単価: ¥{item.price?.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-nexus-text-primary">
                      ¥{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-nexus-bg-secondary rounded-lg border border-nexus-border text-center text-nexus-text-secondary">
                <div className="font-medium">{order.product || '商品情報なし'}</div>
                {order.itemCount && (
                  <div className="text-sm">商品点数: {order.itemCount}点</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 配送情報 */}
        {order.trackingNumber && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-nexus-text-secondary mb-3">
              <TruckIcon className="w-4 h-4" />
              配送情報
            </label>
            <div className="p-4 bg-nexus-bg-secondary rounded-lg border border-nexus-border">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-nexus-text-secondary">追跡番号</div>
                    <div className="font-mono text-nexus-text-primary cursor-pointer"
                         onClick={() => navigator.clipboard.writeText(order.trackingNumber)}
                         title="クリックでコピー">
                      {order.trackingNumber}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <NexusButton
                      onClick={handleTrackingClick}
                      size="sm"
                      variant="primary"
                      icon={<ArrowTopRightOnSquareIcon className="w-4 h-4" />}
                    >
                      追跡サイト
                    </NexusButton>

                  </div>
                </div>
                {order.carrier && (
                  <div>
                    <div className="text-sm text-nexus-text-secondary">配送業者</div>
                    <div className="text-nexus-text-primary">{order.carrier}</div>
                  </div>
                )}
                <div className="text-xs bg-nexus-success text-white px-2 py-1 rounded w-fit">
                  eBay通知済み
                </div>
              </div>
            </div>
          </div>
        )}

        {/* メモ・備考 */}
        {order.notes && (
          <div>
            <label className="text-sm font-medium text-nexus-text-secondary mb-2 block">
              備考
            </label>
            <div className="p-3 bg-nexus-bg-secondary rounded border border-nexus-border text-nexus-text-primary">
              {order.notes}
            </div>
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-nexus-border">
        <NexusButton
          onClick={onClose}
          variant="secondary"
        >
          閉じる
        </NexusButton>

      </div>
    </BaseModal>
  );
}

