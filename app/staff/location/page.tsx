'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';

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
      case 'standard': return '📦';
      case 'humidity_controlled': return '💧';
      case 'vault': return '🔒';
      default: return '📍';
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
                { key: 'overview', label: '保管エリア概要', icon: '📍' },
                { key: 'register', label: 'ロケーション登録', icon: '📥' },
                { key: 'move', label: '商品移動', icon: '🔄' },
                { key: 'history', label: '移動履歴', icon: '📋' },
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
                  <span>{tab.icon}</span>
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
              <div className="space-y-6">
                <div className="intelligence-card asia">
                  <div className="p-6">
                    <h3 className="font-semibold text-nexus-text-primary mb-4">
                      ロケーション登録手順
                    </h3>
                    <ol className="list-decimal list-inside text-sm text-nexus-text-secondary space-y-1">
                      <li>商品のバーコードをスキャンまたは手動入力</li>
                      <li>保管エリアとセクションを選択</li>
                      <li>保管理由を入力</li>
                      <li>登録を確定</li>
                    </ol>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-2">商品ID</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="TWD-CAM-015"
                          className="flex-1 px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-yellow text-nexus-text-primary"
                        />
                        <button className="nexus-button primary">
                          📱
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-2">保管エリア</label>
                      <select className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-yellow text-nexus-text-primary">
                        <option value="">エリアを選択</option>
                        {locationData.storageAreas.map(area => (
                          <option key={area.id} value={area.id}>
                            {getAreaTypeIcon(area.type)} {area.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-2">セクション</label>
                      <select className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-yellow text-nexus-text-primary">
                        <option value="">セクションを選択</option>
                        <option value="A-01">A-01</option>
                        <option value="A-02">A-02</option>
                        <option value="B-01">B-01</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-2">保管理由</label>
                      <select className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-yellow text-nexus-text-primary">
                        <option value="">理由を選択</option>
                        <option value="入庫">新規入庫</option>
                        <option value="検品完了">検品完了</option>
                        <option value="撮影完了">撮影完了</option>
                        <option value="返品受付">返品受付</option>
                      </select>
                    </div>

                    <button className="nexus-button primary w-full">
                      ロケーション登録
                    </button>
                  </div>

                  <div className="intelligence-card europe">
                    <div className="p-6">
                      <h4 className="font-medium mb-4 text-nexus-text-primary">最近の登録履歴</h4>
                      <div className="space-y-2 text-sm">
                        {locationData.locationHistory.slice(0, 5).map((history) => (
                          <div key={history.id} className="flex justify-between items-center p-3 bg-nexus-bg-secondary rounded">
                            <div>
                              <span className="font-medium text-nexus-text-primary">{history.productId}</span>
                              <span className="text-nexus-text-secondary ml-2">→ {history.toLocation}</span>
                            </div>
                            <span className="text-xs text-nexus-text-secondary">{history.timestamp.split('T')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

                <div className="holo-table">
                  <table className="w-full">
                    <thead className="holo-header">
                      <tr>
                        <th className="text-left">商品情報</th>
                        <th className="text-left">現在位置</th>
                        <th className="text-left">ステータス</th>
                        <th className="text-right">アクション</th>
                      </tr>
                    </thead>
                    <tbody className="holo-body">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="holo-row">
                          <td>
                            <div>
                              <h3 className="font-semibold text-nexus-text-primary">
                                {product.name}
                              </h3>
                              <p className="text-sm text-nexus-text-secondary">
                                {product.id} | {product.value}
                              </p>
                            </div>
                          </td>
                          <td>
                            <span className="font-medium text-nexus-text-primary">{product.location}</span>
                          </td>
                          <td>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(product.status)}`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="nexus-button primary"
                            >
                              移動
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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
                                🔄
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