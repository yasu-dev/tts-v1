'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';

interface ListingTemplate {
  id: string;
  name: string;
  category: string;
  platform: 'ebay' | 'amazon' | 'mercari' | 'yahoo';
  basePrice: number;
  currency: string;
  condition: string;
  shippingMethod: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  appliedCount: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: 'ready' | 'listed' | 'sold' | 'delisted';
  listingStatus?: {
    ebay?: boolean;
    amazon?: boolean;
    mercari?: boolean;
    yahoo?: boolean;
  };
  price?: number;
  images: string[];
}

export default function ListingPage() {
  const [templates, setTemplates] = useState<ListingTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'templates' | 'products'>('products');
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'ebay' | 'amazon' | 'mercari' | 'yahoo'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // モックデータ
      const mockTemplates: ListingTemplate[] = [
        {
          id: 'TPL-001',
          name: 'カメラボディ標準テンプレート',
          category: 'camera_body',
          platform: 'ebay',
          basePrice: 100000,
          currency: 'JPY',
          condition: 'Used - Excellent',
          shippingMethod: 'FedEx International',
          isActive: true,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          appliedCount: 45,
        },
        {
          id: 'TPL-002',
          name: 'レンズ出品テンプレート',
          category: 'lens',
          platform: 'amazon',
          basePrice: 50000,
          currency: 'JPY',
          condition: 'Used - Very Good',
          shippingMethod: 'DHL Express',
          isActive: true,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18',
          appliedCount: 32,
        },
      ];

      const mockProducts: Product[] = [
        {
          id: 'TWD-2024-001',
          name: 'Canon EOS R5 ボディ',
          sku: 'CAM-001',
          category: 'camera_body',
          status: 'ready',
          listingStatus: {
            ebay: false,
            amazon: false,
          },
          price: 280000,
          images: ['/api/placeholder/150/150'],
        },
        {
          id: 'TWD-2024-002',
          name: 'Sony FE 24-70mm F2.8 GM',
          sku: 'LENS-001',
          category: 'lens',
          status: 'listed',
          listingStatus: {
            ebay: true,
            amazon: true,
          },
          price: 180000,
          images: ['/api/placeholder/150/150'],
        },
      ];

      setTemplates(mockTemplates);
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const platformConfig = {
    ebay: { name: 'eBay', color: 'bg-blue-500', badge: 'info' },
    amazon: { name: 'Amazon', color: 'bg-orange-500', badge: 'warning' },
    mercari: { name: 'メルカリ', color: 'bg-red-500', badge: 'danger' },
    yahoo: { name: 'ヤフオク', color: 'bg-purple-500', badge: 'success' },
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ready':
        return { label: '出品準備完了', badge: 'success' };
      case 'listed':
        return { label: '出品中', badge: 'info' };
      case 'sold':
        return { label: '売却済', badge: 'warning' };
      case 'delisted':
        return { label: '出品停止', badge: 'danger' };
      default:
        return { label: status, badge: 'info' };
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <div className="intelligence-card global">
            <div className="p-8">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-12 w-12 border-b-4 border-nexus-yellow rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  出品管理
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  商品の出品設定とマルチチャネル管理
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="nexus-button">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  一括出品
                </button>
                <button className="nexus-button primary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  テンプレート作成
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="intelligence-card europe">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-1 bg-nexus-bg-secondary p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('products')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'products'
                      ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                      : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                  }`}
                >
                  商品一覧
                </button>
                <button
                  onClick={() => setViewMode('templates')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'templates'
                      ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                      : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                  }`}
                >
                  テンプレート管理
                </button>
              </div>

              {/* Platform Filter */}
              <div className="flex gap-2">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as any)}
                  className="px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-yellow text-nexus-text-primary"
                >
                  <option value="all">全プラットフォーム</option>
                  <option value="ebay">eBay</option>
                  <option value="amazon">Amazon</option>
                  <option value="mercari">メルカリ</option>
                  <option value="yahoo">ヤフオク</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products View */}
        {viewMode === 'products' && (
          <div className="intelligence-card global">
            <div className="p-8">
              <h2 className="text-xl font-display font-bold text-nexus-text-primary mb-6">
                出品可能商品
              </h2>
              <div className="holo-table">
                <table className="w-full">
                  <thead className="holo-header">
                    <tr>
                      <th className="text-left py-3 px-4">商品情報</th>
                      <th className="text-left py-3 px-4">SKU</th>
                      <th className="text-left py-3 px-4">カテゴリ</th>
                      <th className="text-right py-3 px-4">価格</th>
                      <th className="text-center py-3 px-4">ステータス</th>
                      <th className="text-center py-3 px-4">出品状況</th>
                      <th className="text-center py-3 px-4">アクション</th>
                    </tr>
                  </thead>
                  <tbody className="holo-body">
                    {products.map((product) => (
                      <tr key={product.id} className="holo-row">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0] || '/api/placeholder/60/60'}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                              <p className="font-medium text-nexus-text-primary">{product.name}</p>
                              <p className="text-sm text-nexus-text-secondary">{product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono text-sm">{product.sku}</td>
                        <td className="py-4 px-4 text-sm">{product.category}</td>
                        <td className="py-4 px-4 text-right font-display">
                          ¥{product.price?.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`status-badge ${getStatusConfig(product.status).badge}`}>
                            {getStatusConfig(product.status).label}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center gap-2">
                            {Object.entries(platformConfig).map(([key, config]) => (
                              <div
                                key={key}
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  product.listingStatus?.[key as keyof typeof product.listingStatus]
                                    ? config.color
                                    : 'bg-gray-200'
                                }`}
                              >
                                <span className="text-white text-xs font-bold">
                                  {config.name.charAt(0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button className="nexus-button primary">
                            出品設定
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Templates View */}
        {viewMode === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const platform = platformConfig[template.platform];
              return (
                <div key={template.id} className="intelligence-card americas">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-nexus-text-primary">
                          {template.name}
                        </h3>
                        <p className="text-sm text-nexus-text-secondary mt-1">
                          {template.category}
                        </p>
                      </div>
                      <span className={`status-badge ${platform.badge}`}>
                        {platform.name}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-nexus-text-secondary">基本価格:</span>
                        <span className="font-medium">¥{template.basePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-nexus-text-secondary">状態:</span>
                        <span className="font-medium">{template.condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-nexus-text-secondary">配送方法:</span>
                        <span className="font-medium">{template.shippingMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-nexus-text-secondary">適用回数:</span>
                        <span className="font-display">{template.appliedCount}回</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button className="nexus-button flex-1">編集</button>
                      <button className={`nexus-button ${template.isActive ? '' : 'primary'} flex-1`}>
                        {template.isActive ? '無効化' : '有効化'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 