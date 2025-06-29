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
    fetch('/data/staff-mock.json')
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
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600 dark:text-gray-400">データを読み込み中...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ロケーション管理
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              在庫保管場所とロケーション履歴管理
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              📱 バーコードスキャン
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-6">
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
                    ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {locationData.storageAreas.map((area) => (
                  <div
                    key={area.id}
                    onClick={() => handleAreaClick(area)}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getAreaTypeIcon(area.type)}</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {area.name}
                        </h3>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {getAreaTypeLabel(area.type)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">収容率</span>
                        <span className="font-medium">
                          {area.currentCount}/{area.capacity}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(area.currentCount / area.capacity) * 100}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">温度:</span>
                          <span className="ml-1 font-medium">{area.temperature}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">湿度:</span>
                          <span className="ml-1 font-medium">{area.humidity}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {area.sections.map((section) => (
                          <span 
                            key={section}
                            className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                          >
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedArea && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">
                    {getAreaTypeIcon(selectedArea.type)} {selectedArea.name} 詳細
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">セクション一覧</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {selectedArea.sections.map((section) => (
                          <div 
                            key={section}
                            className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-center text-sm font-medium"
                          >
                            {section}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">環境情報</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>現在温度:</span>
                          <span className="font-medium">{selectedArea.temperature}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>現在湿度:</span>
                          <span className="font-medium">{selectedArea.humidity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>収容数:</span>
                          <span className="font-medium">{selectedArea.currentCount}個</span>
                        </div>
                        <div className="flex justify-between">
                          <span>最大収容:</span>
                          <span className="font-medium">{selectedArea.capacity}個</span>
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
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  ロケーション登録手順
                </h3>
                <ol className="list-decimal list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>商品のバーコードをスキャンまたは手動入力</li>
                  <li>保管エリアとセクションを選択</li>
                  <li>保管理由を入力</li>
                  <li>登録を確定</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">商品ID</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="TWD-CAM-015"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        📱
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">保管エリア</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                      <option value="">エリアを選択</option>
                      {locationData.storageAreas.map(area => (
                        <option key={area.id} value={area.id}>
                          {getAreaTypeIcon(area.type)} {area.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">セクション</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                      <option value="">セクションを選択</option>
                      <option value="A-01">A-01</option>
                      <option value="A-02">A-02</option>
                      <option value="B-01">B-01</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">保管理由</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                      <option value="">理由を選択</option>
                      <option value="入庫">新規入庫</option>
                      <option value="検品完了">検品完了</option>
                      <option value="撮影完了">撮影完了</option>
                      <option value="返品受付">返品受付</option>
                    </select>
                  </div>

                  <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                    ロケーション登録
                  </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium mb-3">最近の登録履歴</h4>
                  <div className="space-y-2 text-sm">
                    {locationData.locationHistory.slice(0, 5).map((history) => (
                      <div key={history.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-600 rounded">
                        <div>
                          <span className="font-medium">{history.productId}</span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">→ {history.toLocation}</span>
                        </div>
                        <span className="text-xs text-gray-500">{history.timestamp.split('T')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Move View */}
          {viewMode === 'move' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">商品検索</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="商品ID、商品名、現在位置で検索..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {product.id} | {product.value}
                          </p>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">現在位置:</span>
                          <span className="ml-1 font-medium">{product.location}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        移動
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedProduct && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">
                    商品移動: {selectedProduct.name}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">移動先</label>
                      <select
                        value={moveToLocation}
                        onChange={(e) => setMoveToLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                      <label className="block text-sm font-medium mb-2">移動理由</label>
                      <select
                        value={moveReason}
                        onChange={(e) => setMoveReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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

                  <div className="flex justify-end space-x-4 mt-4">
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleProductMove}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      移動実行
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History View */}
          {viewMode === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">移動履歴</h3>
              
              <div className="space-y-2">
                {locationData.locationHistory.map((history) => (
                  <div
                    key={history.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">🔄</span>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {history.productId}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {history.fromLocation} → {history.toLocation}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm">
                        <div className="font-medium">{history.movedBy}</div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {new Date(history.timestamp).toLocaleString('ja-JP')}
                        </div>
                        <div className="text-blue-600">{history.reason}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}