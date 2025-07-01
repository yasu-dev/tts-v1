'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import LocationRegistration from '@/app/components/features/location/LocationRegistration';
import LocationList from '@/app/components/features/location/LocationList';

interface StorageArea {
  id: string;
  name: string;
  type: 'standard' | 'humidity_controlled' | 'vault';
  sections: string[];
  capacity: number;
  currentCount: number;
  temperature: string;
  humidity: string;
}

interface LocationHistory {
  id: string;
  productId: string;
  fromLocation: string;
  toLocation: string;
  movedBy: string;
  timestamp: string;
  reason: string;
}

interface LocationData {
  storageAreas: StorageArea[];
  locationHistory: LocationHistory[];
}

interface Product {
  id: string;
  name: string;
  location: string;
  category: string;
  value: string;
  lastMoved: string;
  status: string;
}

export default function LocationPage() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [selectedArea, setSelectedArea] = useState<StorageArea | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [moveToLocation, setMoveToLocation] = useState('');
  const [moveReason, setMoveReason] = useState('');
  const [viewMode, setViewMode] = useState<'overview' | 'register' | 'move' | 'history'>('overview');

  // Mock product data
  const products: Product[] = [
    {
      id: 'TWD-CAM-015',
      name: 'Canon EOS R5',
      location: '検品室B',
      category: 'カメラ本体',
      value: '¥450,000',
      lastMoved: '2024-06-27',
      status: '検品中'
    },
    {
      id: 'TWD-WAT-007',
      name: 'Rolex GMT Master',
      location: '金庫室V-03',
      category: '腕時計',
      value: '¥2,100,000',
      lastMoved: '2024-06-27',
      status: '保管中'
    },
    {
      id: 'TWD-LEN-005',
      name: 'Canon RF 24-70mm F2.8',
      location: '標準棚A-15',
      category: 'レンズ',
      value: '¥198,000',
      lastMoved: '2024-06-26',
      status: '出荷準備'
    },
    {
      id: 'TWD-CAM-012',
      name: 'Sony α7R V',
      location: '防湿庫H2-08',
      category: 'カメラ本体',
      value: '¥320,000',
      lastMoved: '2024-06-25',
      status: '保管中'
    }
  ];

  useEffect(() => {
    fetch('/api/staff/dashboard')
      .then(res => res.json())
      .then(data => {
        setLocationData(data.locationData);
      })
      .catch(console.error);
  }, []);

  const handleAreaClick = (area: StorageArea) => {
    setSelectedArea(area);
  };

  const handleProductMove = () => {
    if (!selectedProduct || !moveToLocation) return;

    // In real app, would call API
    alert(`${selectedProduct.name} を ${moveToLocation} に移動しました。`);
    setSelectedProduct(null);
    setMoveToLocation('');
    setMoveReason('');
    setViewMode('overview');
  };

  const getAreaTypeIcon = (type: string) => {
    switch (type) {
      case 'standard': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
      case 'humidity_controlled': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
      case 'vault': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
      default: return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    }
  };

  const getAreaTypeLabel = (type: string) => {
    switch (type) {
      case 'standard': return '標準棚';
      case 'humidity_controlled': return '防湿庫';
      case 'vault': return '金庫室';
      default: return 'その他';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '検品中': return 'bg-blue-100 text-blue-800';
      case '保管中': return 'bg-green-100 text-green-800';
      case '出荷準備': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProducts = products.filter(product =>
    product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!locationData) {
    return (
      <DashboardLayout userType="staff">
        <div className="intelligence-card global">
          <div className="p-8 text-center">
            <div className="text-lg text-nexus-text-secondary">データを読み込み中...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card africa">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  ロケーション管理
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  在庫保管場所とロケーション履歴管理
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowScanner(!showScanner)}
                  className="nexus-button primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                  バーコードスキャン
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex space-x-1 bg-nexus-bg-secondary p-1 rounded-lg mb-6">
              {[
                { key: 'overview', label: '保管エリア概要' },
                { key: 'register', label: 'ロケーション登録' },
                { key: 'move', label: '商品移動' },
                { key: 'history', label: '移動履歴' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setViewMode(tab.key as any)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 ${
                    viewMode === tab.key
                      ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                      : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Overview View */}
            {viewMode === 'overview' && (
              <div className="space-y-6">
                <div className="intelligence-metrics">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {locationData.storageAreas.map((area) => (
                      <div
                        key={area.id}
                        onClick={() => handleAreaClick(area)}
                        className="intelligence-card africa cursor-pointer hover:shadow-lg transition-all"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <div className="action-orb">
                                {getAreaTypeIcon(area.type)}
                              </div>
                              <h3 className="text-lg font-semibold text-nexus-text-primary">
                                {area.name}
                              </h3>
                            </div>
                            <span className="cert-nano cert-premium">
                              {getAreaTypeLabel(area.type)}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-sm text-nexus-text-secondary">
                              <span>収容率</span>
                              <span className="font-display font-medium text-nexus-text-primary">
                                {area.currentCount}/{area.capacity}
                              </span>
                            </div>
                            
                            <div className="w-full bg-nexus-bg-secondary rounded-full h-2">
                              <div 
                                className="bg-nexus-blue h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${(area.currentCount / area.capacity) * 100}%` }}
                              ></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-nexus-text-secondary">温度:</span>
                                <span className="ml-1 font-medium text-nexus-text-primary">{area.temperature}</span>
                              </div>
                              <div>
                                <span className="text-nexus-text-secondary">湿度:</span>
                                <span className="ml-1 font-medium text-nexus-text-primary">{area.humidity}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-3">
                              {area.sections.map((section) => (
                                <span 
                                  key={section}
                                  className="cert-nano cert-mint"
                                >
                                  {section}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedArea && (
                  <div className="intelligence-card global">
                    <div className="p-8">
                      <h3 className="text-lg font-semibold mb-6 text-nexus-text-primary">
                        {getAreaTypeIcon(selectedArea.type)} {selectedArea.name} 詳細
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-4 text-nexus-text-primary">セクション一覧</h4>
                          <div className="grid grid-cols-4 gap-2">
                            {selectedArea.sections.map((section) => (
                              <div 
                                key={section}
                                className="p-3 bg-nexus-bg-secondary rounded text-center text-sm font-medium text-nexus-text-primary"
                              >
                                {section}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-4 text-nexus-text-primary">環境情報</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-nexus-text-secondary">現在温度:</span>
                              <span className="font-medium text-nexus-text-primary">{selectedArea.temperature}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-nexus-text-secondary">現在湿度:</span>
                              <span className="font-medium text-nexus-text-primary">{selectedArea.humidity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-nexus-text-secondary">収容数:</span>
                              <span className="font-display font-medium text-nexus-text-primary">{selectedArea.currentCount}個</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-nexus-text-secondary">最大収容:</span>
                              <span className="font-display font-medium text-nexus-text-primary">{selectedArea.capacity}個</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Register View */}
            {viewMode === 'register' && (
              <LocationRegistration onRegisterComplete={(productId, location) => {
                console.log(`Product ${productId} registered at ${location}`);
                // 登録完了後の処理（履歴の更新など）
              }} />
            )}

            {/* Move View */}
            {viewMode === 'move' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">商品検索</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="商品ID、商品名、現在位置で検索..."
                    className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-yellow text-nexus-text-primary"
                  />
                </div>

                <LocationList 
                  searchQuery={searchQuery}
                  onProductMove={(product) => {
                    setSelectedProduct({
                      id: product.productId,
                      name: product.productName,
                      location: product.location,
                      category: product.category,
                      value: product.value,
                      lastMoved: product.lastUpdated,
                      status: product.status
                    });
                  }}
                />

                {selectedProduct && (
                  <div className="intelligence-card oceania">
                    <div className="p-8">
                      <h3 className="font-semibold text-nexus-text-primary mb-6">
                        商品移動: {selectedProduct.name}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-nexus-text-secondary mb-2">移動先</label>
                          <select
                            value={moveToLocation}
                            onChange={(e) => setMoveToLocation(e.target.value)}
                            className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-yellow text-nexus-text-primary"
                          >
                            <option value="">移動先を選択</option>
                            <option value="標準棚A-01">標準棚A-01</option>
                            <option value="標準棚B-05">標準棚B-05</option>
                            <option value="防湿庫H1-03">防湿庫H1-03</option>
                            <option value="金庫室V-01">金庫室V-01</option>
                            <option value="検品室A">検品室A</option>
                            <option value="撮影室">撮影室</option>
                            <option value="梱包室">梱包室</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-nexus-text-secondary mb-2">移動理由</label>
                          <select
                            value={moveReason}
                            onChange={(e) => setMoveReason(e.target.value)}
                            className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-yellow text-nexus-text-primary"
                          >
                            <option value="">理由を選択</option>
                            <option value="検品のため">検品のため</option>
                            <option value="撮影のため">撮影のため</option>
                            <option value="出荷準備">出荷準備</option>
                            <option value="保管場所変更">保管場所変更</option>
                            <option value="メンテナンス">メンテナンス</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4 mt-6">
                        <button
                          onClick={() => setSelectedProduct(null)}
                          className="nexus-button"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={handleProductMove}
                          className="nexus-button primary"
                        >
                          移動実行
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History View */}
            {viewMode === 'history' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-nexus-text-primary">移動履歴</h3>
                
                <div className="holo-table">
                  <table className="w-full">
                    <thead className="holo-header">
                      <tr>
                        <th className="text-left">商品ID</th>
                        <th className="text-left">移動内容</th>
                        <th className="text-left">実行者</th>
                        <th className="text-left">理由</th>
                        <th className="text-right">日時</th>
                      </tr>
                    </thead>
                    <tbody className="holo-body">
                      {locationData.locationHistory.map((history) => (
                        <tr key={history.id} className="holo-row">
                          <td>
                            <span className="font-medium text-nexus-text-primary">{history.productId}</span>
                          </td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <div className="action-orb">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </div>
                              <span className="text-sm text-nexus-text-primary">
                                {history.fromLocation} → {history.toLocation}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="text-nexus-text-primary">{history.movedBy}</span>
                          </td>
                          <td>
                            <span className="cert-nano cert-mint">{history.reason}</span>
                          </td>
                          <td className="text-right">
                            <span className="text-sm text-nexus-text-secondary">
                              {new Date(history.timestamp).toLocaleString('ja-JP')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}