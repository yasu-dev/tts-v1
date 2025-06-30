'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import { useState } from 'react';

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'delivery' | 'inspection' | 'listing' | 'shipping' | 'return' | 'sale';
  title: string;
  description: string;
  details?: string;
  status: 'completed' | 'pending' | 'error';
  user?: string;
  productId?: string;
  productName?: string;
}

const mockTimelineData: TimelineEvent[] = [
  {
    id: '1',
    timestamp: '2024-01-15T10:30:00Z',
    type: 'delivery',
    title: '商品受入完了',
    description: 'Sony WH-1000XM5 他3点を受入',
    details: '納品ID: DLV-20240115-001',
    status: 'completed',
    user: '田中太郎',
    productId: 'PRD-001',
    productName: 'Sony WH-1000XM5'
  },
  {
    id: '2',
    timestamp: '2024-01-15T11:45:00Z',
    type: 'inspection',
    title: '検品完了',
    description: '全商品の検品・撮影が完了しました',
    details: '状態: A品質、撮影枚数: 8枚',
    status: 'completed',
    user: '佐藤花子',
    productId: 'PRD-001',
    productName: 'Sony WH-1000XM5'
  },
  {
    id: '3',
    timestamp: '2024-01-15T14:20:00Z',
    type: 'listing',
    title: 'eBay出品',
    description: 'eBayマーケットプレイスに出品しました',
    details: '出品価格: $299.99、配送方法: Express',
    status: 'completed',
    user: 'システム',
    productId: 'PRD-001',
    productName: 'Sony WH-1000XM5'
  },
  {
    id: '4',
    timestamp: '2024-01-16T09:15:00Z',
    type: 'sale',
    title: '販売成立',
    description: '商品が購入されました',
    details: '購入者: John Smith (USA)、販売価格: $299.99',
    status: 'completed',
    user: 'システム',
    productId: 'PRD-001',
    productName: 'Sony WH-1000XM5'
  },
  {
    id: '5',
    timestamp: '2024-01-16T15:30:00Z',
    type: 'shipping',
    title: '出荷処理中',
    description: '商品の梱包・出荷準備を開始しました',
    status: 'pending',
    user: '鈴木一郎',
    productId: 'PRD-001',
    productName: 'Sony WH-1000XM5'
  }
];

export default function TimelinePage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'delivery':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        );
      case 'inspection':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'listing':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'shipping':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        );
      case 'return':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
          </svg>
        );
      case 'sale':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-nexus-green bg-green-50 dark:bg-green-900/20 border-green-300';
      case 'pending': return 'text-nexus-yellow bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300';
      case 'error': return 'text-nexus-red bg-red-50 dark:bg-red-900/20 border-red-300';
      default: return 'text-nexus-text-secondary bg-nexus-bg-secondary border-nexus-border';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'delivery': return '納品';
      case 'inspection': return '検品';
      case 'listing': return '出品';
      case 'shipping': return '出荷';
      case 'return': return '返品';
      case 'sale': return '販売';
      default: return type;
    }
  };

  const filteredEvents = mockTimelineData.filter(event => {
    if (selectedFilter !== 'all' && event.type !== selectedFilter) return false;
    if (selectedProduct !== 'all' && event.productId !== selectedProduct) return false;
    return true;
  });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-8">
        {/* Page Header - Intelligence Card Style */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary mb-2">商品履歴</h1>
                <p className="text-nexus-text-secondary mt-1">
                  商品のライフサイクルとすべてのイベントを追跡します
                </p>
              </div>
              <div className="action-orb primary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* フィルターセクション */}
        <div className="intelligence-card asia">
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-nexus-text-secondary">イベントタイプ:</label>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 bg-nexus-bg-secondary border border-nexus-border text-nexus-text-primary rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="all">すべて</option>
                  <option value="delivery">納品</option>
                  <option value="inspection">検品</option>
                  <option value="listing">出品</option>
                  <option value="shipping">出荷</option>
                  <option value="return">返品</option>
                  <option value="sale">販売</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-nexus-text-secondary">商品:</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="px-4 py-2 bg-nexus-bg-secondary border border-nexus-border text-nexus-text-primary rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="all">すべての商品</option>
                  <option value="PRD-001">Sony WH-1000XM5</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* タイムライン */}
        <div className="intelligence-card global">
          <div className="p-8">
            <h3 className="text-2xl font-display font-bold text-nexus-text-primary mb-6">イベントタイムライン</h3>
            
            <div className="relative">
              {filteredEvents.length > 0 ? (
                <div className="space-y-4">
                  {filteredEvents.map((event, index) => (
                    <div key={event.id} className="relative flex gap-4">
                      {/* タイムラインライン */}
                      {index < filteredEvents.length - 1 && (
                        <div className="absolute left-7 top-14 w-0.5 h-full bg-nexus-border" />
                      )}
                      
                      {/* アイコン */}
                      <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center ${getStatusColor(event.status)} border-2`}>
                        {getEventIcon(event.type)}
                      </div>
                      
                      {/* コンテンツ */}
                      <div className="flex-1 bg-nexus-bg-secondary rounded-lg shadow-sm border border-nexus-border p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-nexus-text-primary">{event.title}</h3>
                            <p className="text-sm text-nexus-text-secondary">{event.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {getTypeLabel(event.type)}
                          </span>
                        </div>
                        
                        {event.details && (
                          <p className="text-sm text-nexus-text-secondary mb-2">{event.details}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-nexus-text-tertiary">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatDate(event.timestamp)}
                            </span>
                            {event.user && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {event.user}
                              </span>
                            )}
                          </div>
                          {event.productName && (
                            <span className="text-primary-blue font-medium">{event.productName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <svg className="w-16 h-16 mx-auto text-nexus-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xl font-semibold text-nexus-text-secondary">履歴データが見つかりません</h2>
                  <p className="text-nexus-text-tertiary mt-2">選択した条件に一致する履歴がありません。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 