'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import UnifiedPageHeader from '../components/ui/UnifiedPageHeader';
import { ProductTimeline } from '../components/ProductTimeline';
import { useState } from 'react';
import {
  FunnelIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { NexusButton } from '@/app/components/ui';
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
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

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

  const headerActions = (
    <>
                <NexusButton
                  onClick={() => setIsFilterModalOpen(true)}
                  icon={<FunnelIcon className="w-5 h-5" />}
        size="sm"
                >
                  <span className="hidden sm:inline">期間でフィルター</span>
                  <span className="sm:hidden">フィルター</span>
                </NexusButton>
                <NexusButton
                  onClick={handleExportHistory}
                  variant="primary"
                  icon={<ArrowDownTrayIcon className="w-5 h-5" />}
        size="sm"
                >
                  <span className="hidden sm:inline">履歴をエクスポート</span>
                  <span className="sm:hidden">エクスポート</span>
                </NexusButton>
    </>
  );

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="商品履歴"
          subtitle="商品のステータス変更履歴を追跡"
          userType="seller"
          iconType="timeline"
          actions={headerActions}
        />

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



        {/* メインコンテンツ - 他の画面と統一されたレイアウト */}
        <div className="space-y-6">
          {/* 商品リスト - テーブル形式で統一 */}
          <div className="bg-white rounded-xl border border-nexus-border p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-nexus-text-primary">商品一覧</h3>
              <p className="text-nexus-text-secondary mt-1 text-sm">商品を選択して履歴を表示</p>
            </div>
            
            {/* テーブル */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-nexus-border">
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">商品名</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">カテゴリ</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">ステータス</th>
                    <th className="text-right p-4 font-medium text-nexus-text-secondary">価格</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {mockProducts.map((product) => (
                    <tr 
                      key={product.id}
                      className={`border-b border-nexus-border hover:bg-nexus-bg-tertiary transition-colors ${
                        selectedProduct === product.id ? 'bg-nexus-primary/5' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-medium text-nexus-text-primary">
                            {product.name}
                          </div>
                        <div className="text-xs text-nexus-text-secondary mt-1">
                          ID: {product.id}
                          </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-sm text-nexus-text-secondary">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <BusinessStatusIndicator status={product.status} size="sm" />
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-bold text-nexus-text-primary">
                          {product.price}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <NexusButton
                            onClick={() => {
                              setSelectedProduct(product.id);
                              setIsTimelineModalOpen(true);
                            }}
                            size="sm"
                            variant="primary"
                            icon={<EyeIcon className="w-4 h-4" />}
                          >
                            詳細
                          </NexusButton>
                          <NexusButton
                            onClick={() => setSelectedProduct(product.id)}
                            size="sm"
                            variant={selectedProduct === product.id ? "primary" : "secondary"}
                          >
                            {selectedProduct === product.id ? "選択中" : "選択"}
                          </NexusButton>
                      </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                </div>
              </div>


        </div>

        {/* 詳細タイムラインモーダル */}
        <BaseModal
          isOpen={isTimelineModalOpen}
          onClose={() => setIsTimelineModalOpen(false)}
          title={`${selectedProductData?.name} - 詳細フロー`}
          subtitle="商品の入庫から発送までの完全な履歴"
          size="lg"
        >
          <div className="space-y-6">
            {/* 詳細フロー表示 */}
            <div>
              <ProductTimeline productId={selectedProduct} />
            </div>

            {/* フロー段階の説明 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h6 className="font-medium text-blue-900 mb-2">フロー段階の説明</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                  <span className="font-medium text-blue-800">入庫:</span>
                  <span className="text-blue-700 ml-2">商品の受領・登録</span>
                </div>
                    <div>
                  <span className="font-medium text-blue-800">検品:</span>
                  <span className="text-blue-700 ml-2">品質確認・撮影</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">出品:</span>
                  <span className="text-blue-700 ml-2">プラットフォーム出品</span>
              </div>
                    <div>
                  <span className="font-medium text-blue-800">売却:</span>
                  <span className="text-blue-700 ml-2">購入者決定</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">発送:</span>
                  <span className="text-blue-700 ml-2">梱包・配送</span>
          </div>
                  <div>
                  <span className="font-medium text-blue-800">完了:</span>
                  <span className="text-blue-700 ml-2">取引終了</span>
                </div>
              </div>
            </div>
          </div>
        </BaseModal>
      </div>
    </DashboardLayout>
  );
} 