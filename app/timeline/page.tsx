'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import { ProductTimeline } from '../components/ProductTimeline';
import { useState } from 'react';
import { Package, Calendar, Activity, Filter, Download } from 'lucide-react';
import {
  FunnelIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import NexusButton from '@/app/components/ui/NexusButton';
import BaseModal from '@/app/components/ui/BaseModal';
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator';

// Mock products data
const mockProducts = [
  { id: 'PRD-001', name: 'Sony α7 IV ボディ', category: 'カメラ本体', status: 'listing' as const, price: '¥320,000' },
  { id: 'PRD-002', name: 'Sony FE 24-70mm F2.8 GM II', category: 'レンズ', status: 'sold' as const, price: '¥280,000' },
  { id: 'PRD-003', name: 'Rolex Submariner', category: '腕時計', status: 'listing' as const, price: '¥1,200,000' },
  { id: 'PRD-004', name: 'Canon EOS R5', category: 'カメラ本体', status: 'shipped' as const, price: '¥450,000' },
  { id: 'PRD-005', name: 'Leica Q3', category: 'カメラ本体', status: 'listing' as const, price: '¥820,000' }
];

export default function TimelinePage() {
  const [selectedProduct, setSelectedProduct] = useState<string>(mockProducts[0].id);
  const selectedProductData = mockProducts.find(p => p.id === selectedProduct);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Mock activities data
  const activities = [
    { timestamp: '2024-01-01 10:00', activity: '商品登録', details: '商品情報を登録', user: '田中太郎', status: 'pending' },
    { timestamp: '2024-01-01 11:00', activity: '検品完了', details: '品質チェック完了', user: '鈴木花子', status: 'completed' },
    { timestamp: '2024-01-01 12:00', activity: '出品開始', details: 'eBayに出品', user: '佐藤一郎', status: 'listing' }
  ];

  const handleExportHistory = () => {
    // 履歴データをCSV形式に変換
    const csvContent = [
      ['日時', 'アクティビティ', '詳細', 'ユーザー', 'ステータス'],
      ...activities.map(activity => [
        activity.timestamp,
        activity.activity,
        activity.details,
        activity.user,
        activity.status
      ])
    ].map(row => row.join(',')).join('\n');

    // CSVファイルとしてダウンロード
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `timeline_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleApplyFilter = () => {
    // フィルター適用のロジック
    setIsFilterModalOpen(false);
    // 実際の実装では、フィルター条件に基づいてactivitiesを更新
  };

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-8 h-8 text-nexus-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                    商品履歴
                  </h1>
                </div>
                <p className="text-nexus-text-secondary">
                  商品のステータス変更履歴を追跡
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                <NexusButton
                  onClick={() => setIsFilterModalOpen(true)}
                  icon={<FunnelIcon className="w-5 h-5" />}
                >
                  <span className="hidden sm:inline">期間でフィルター</span>
                  <span className="sm:hidden">フィルター</span>
                </NexusButton>
                <NexusButton
                  onClick={handleExportHistory}
                  variant="primary"
                  icon={<ArrowDownTrayIcon className="w-5 h-5" />}
                >
                  <span className="hidden sm:inline">履歴をエクスポート</span>
                  <span className="sm:hidden">エクスポート</span>
                </NexusButton>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Modal */}
        <BaseModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          title="期間でフィルター"
          size="md"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  開始日
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  終了日
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                期間プリセット
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <NexusButton size="sm">
                  今日
                </NexusButton>
                <NexusButton size="sm">
                  今週
                </NexusButton>
                <NexusButton size="sm">
                  今月
                </NexusButton>
                <NexusButton size="sm">
                  先月
                </NexusButton>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                アクティビティタイプ
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 w-4 h-4 text-primary-blue rounded border-nexus-border focus:ring-primary-blue" defaultChecked />
                  <span className="text-sm">商品登録</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 w-4 h-4 text-primary-blue rounded border-nexus-border focus:ring-primary-blue" defaultChecked />
                  <span className="text-sm">検品完了</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 w-4 h-4 text-primary-blue rounded border-nexus-border focus:ring-primary-blue" defaultChecked />
                  <span className="text-sm">撮影完了</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 w-4 h-4 text-primary-blue rounded border-nexus-border focus:ring-primary-blue" defaultChecked />
                  <span className="text-sm">出品開始</span>
                </label>
              </div>
            </div>
            
            <div className="text-right mt-6 space-x-2">
              <NexusButton onClick={() => setIsFilterModalOpen(false)}>
                キャンセル
              </NexusButton>
              <NexusButton onClick={handleApplyFilter} variant="primary">
                適用
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* メインコンテンツをグリッドレイアウトに */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左側：商品リストと統計 */}
          <div className="space-y-4">
            {/* 商品選択 - リスト形式でコンパクトに */}
            <div className="intelligence-card global">
              <div className="p-4">
                <h2 className="text-sm font-semibold text-nexus-text-primary mb-3">商品を選択</h2>
                <div className="space-y-2">
                  {mockProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product.id)}
                      className={`
                        w-full p-3 rounded-lg border transition-all text-left
                        ${selectedProduct === product.id 
                          ? 'border-nexus-primary bg-nexus-primary/10' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-nexus-text-primary truncate">
                            {product.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-nexus-text-secondary">{product.category}</span>
                            <span className="text-xs text-nexus-text-secondary">•</span>
                            <span className="text-xs font-medium">{product.price}</span>
                          </div>
                        </div>
                        <BusinessStatusIndicator status={product.status} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 統計情報 - よりコンパクトに */}
            <div className="space-y-3">
              <div className="intelligence-card americas">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-nexus-text-secondary">在庫日数</p>
                      <p className="text-2xl font-display font-bold text-nexus-text-primary">10日</p>
                    </div>
                    <div className="action-orb blue w-10 h-10">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-nexus-text-secondary mt-1">平均: 15日</p>
                </div>
              </div>
              
              <div className="intelligence-card europe">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-nexus-text-secondary">ステータス</p>
                      <p className="text-lg font-medium text-green-600">出品中</p>
                    </div>
                    <div className="action-orb green w-10 h-10">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-nexus-text-secondary mt-1">更新: 1日前</p>
                </div>
              </div>
              
              <div className="intelligence-card asia">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-nexus-text-secondary">イベント数</p>
                      <p className="text-2xl font-display font-bold text-nexus-text-primary">9件</p>
                    </div>
                    <div className="action-orb blue w-10 h-10">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-nexus-text-secondary mt-1">過去30日</p>
                </div>
              </div>
            </div>
          </div>

          {/* 右側：タイムライン表示 */}
          <div className="lg:col-span-2">
            <div className="intelligence-card global">
              <div className="p-6">
                {/* 選択中の商品情報 */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-nexus-border">
                  <div>
                    <h3 className="font-semibold text-nexus-text-primary">
                      {selectedProductData?.name}
                    </h3>
                    <p className="text-sm text-nexus-text-secondary mt-1">
                      ID: {selectedProduct} • {selectedProductData?.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-nexus-text-primary">
                      {selectedProductData?.price}
                    </p>
                    {selectedProductData?.status && (
                      <BusinessStatusIndicator status={selectedProductData.status} />
                    )}
                  </div>
                </div>
                
                {/* タイムライン */}
                <ProductTimeline productId={selectedProduct} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 