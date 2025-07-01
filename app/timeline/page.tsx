'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import { ProductTimeline } from '../components/ProductTimeline';
import { useState } from 'react';
import { Package, Calendar, Activity, Filter, Download } from 'lucide-react';

// Mock products data
const mockProducts = [
  { id: 'PRD-001', name: 'Sony α7 IV ボディ', category: 'カメラ本体', status: 'listing', price: '¥320,000' },
  { id: 'PRD-002', name: 'Sony FE 24-70mm F2.8 GM II', category: 'レンズ', status: 'sold', price: '¥280,000' },
  { id: 'PRD-003', name: 'Rolex Submariner', category: '腕時計', status: 'listing', price: '¥1,200,000' },
  { id: 'PRD-004', name: 'Canon EOS R5', category: 'カメラ本体', status: 'shipping', price: '¥450,000' },
  { id: 'PRD-005', name: 'Leica Q3', category: 'カメラ本体', status: 'listing', price: '¥820,000' }
];

const statusColors = {
  listing: { bg: 'bg-green-100', text: 'text-green-800', label: '出品中' },
  sold: { bg: 'bg-purple-100', text: 'text-purple-800', label: '売却済' },
  shipping: { bg: 'bg-blue-100', text: 'text-blue-800', label: '発送中' }
};

export default function TimelinePage() {
  const [selectedProduct, setSelectedProduct] = useState<string>(mockProducts[0].id);
  const selectedProductData = mockProducts.find(p => p.id === selectedProduct);

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-4">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  商品履歴タイムライン
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  商品の入庫から出荷までの履歴を確認します
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="nexus-button">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  フィルター
                </button>
                <button className="nexus-button">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  エクスポート
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツをグリッドレイアウトに */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左側：商品リストと統計 */}
          <div className="space-y-4">
            {/* 商品選択 - リスト形式でコンパクトに */}
            <div className="intelligence-card global">
              <div className="p-4">
                <h2 className="text-sm font-semibold text-nexus-text-primary mb-3">商品を選択</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
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
                        <span className={`
                          px-2 py-0.5 text-xs rounded-full
                          ${statusColors[product.status as keyof typeof statusColors].bg}
                          ${statusColors[product.status as keyof typeof statusColors].text}
                        `}>
                          {statusColors[product.status as keyof typeof statusColors].label}
                        </span>
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
                      <p className="text-2xl font-bold text-nexus-text-primary">10日</p>
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
                      <p className="text-2xl font-bold text-nexus-text-primary">9件</p>
                    </div>
                    <div className="action-orb purple w-10 h-10">
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
                    <span className={`
                      px-2 py-0.5 text-xs rounded-full
                      ${statusColors[selectedProductData?.status as keyof typeof statusColors]?.bg}
                      ${statusColors[selectedProductData?.status as keyof typeof statusColors]?.text}
                    `}>
                      {statusColors[selectedProductData?.status as keyof typeof statusColors]?.label}
                    </span>
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