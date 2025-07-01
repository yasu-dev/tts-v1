'use client';

import { useState } from 'react';
import BarcodeScanner from '@/app/components/BarcodeScanner';

interface LocationRegistrationProps {
  onRegisterComplete?: (productId: string, location: string) => void;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentLocation?: string;
  status: string;
}

export default function LocationRegistration({ onRegisterComplete }: LocationRegistrationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  // ロケーションのマスターデータ（実際はAPIから取得）
  const locations = {
    standard: [
      { code: 'STD-A-01', name: '標準棚A-01', capacity: 50 },
      { code: 'STD-A-02', name: '標準棚A-02', capacity: 50 },
      { code: 'STD-B-01', name: '標準棚B-01', capacity: 40 },
      { code: 'STD-B-02', name: '標準棚B-02', capacity: 40 },
    ],
    controlled: [
      { code: 'HUM-01', name: '防湿庫01', capacity: 30 },
      { code: 'HUM-02', name: '防湿庫02', capacity: 30 },
      { code: 'TEMP-01', name: '温度管理庫01', capacity: 20 },
    ],
    secure: [
      { code: 'VAULT-01', name: '金庫室01', capacity: 10 },
      { code: 'VAULT-02', name: '金庫室02', capacity: 10 },
    ],
    processing: [
      { code: 'INSP-A', name: '検品室A', capacity: 100 },
      { code: 'INSP-B', name: '検品室B', capacity: 100 },
      { code: 'PHOTO', name: '撮影室', capacity: 50 },
      { code: 'PACK', name: '梱包室', capacity: 200 },
    ],
  };

  // 商品検索（実際はAPIコール）
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // モックデータ
      const mockResults: Product[] = [
        {
          id: 'TWD-2024-001',
          name: 'Canon EOS R5 ボディ',
          sku: 'CAM-001',
          category: 'camera_body',
          currentLocation: 'INSP-A',
          status: 'inspected',
        },
        {
          id: 'TWD-2024-002',
          name: 'Sony FE 24-70mm F2.8 GM',
          sku: 'LENS-001',
          category: 'lens',
          status: 'pending_inspection',
        },
      ];

      // 検索クエリでフィルタリング
      const filtered = mockResults.filter(
        (p) =>
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults(filtered);
    } catch (error) {
      console.error('[ERROR] Product search:', error);
      alert('商品検索エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // バーコードスキャン処理
  const handleBarcodeScan = (code: string) => {
    setSearchQuery(code);
    setShowScanner(false);
    handleSearch();
  };

  // ロケーション登録
  const handleRegister = async () => {
    if (!selectedProduct || !selectedLocation) {
      alert('商品とロケーションを選択してください');
      return;
    }

    setLoading(true);
    try {
      // APIコール（実際の実装）
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          locationCode: selectedLocation,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('ロケーション登録に失敗しました');
      }

      alert(`${selectedProduct.name} を ${selectedLocation} に登録しました`);
      
      if (onRegisterComplete) {
        onRegisterComplete(selectedProduct.id, selectedLocation);
      }

      // フォームをリセット
      setSelectedProduct(null);
      setSelectedLocation('');
      setNotes('');
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('[ERROR] Location registration:', error);
      alert('ロケーション登録エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const getLocationRecommendation = (product: Product) => {
    // カテゴリに基づいてロケーションを推奨
    if (product.category === 'camera_body' || product.category === 'lens') {
      return '防湿庫を推奨';
    } else if (product.category === 'watch') {
      return '金庫室を推奨';
    }
    return '標準棚を推奨';
  };

  return (
    <div className="space-y-6">
      <div className="intelligence-card europe">
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-nexus-text-primary">
              ロケーション登録
            </h2>
            <p className="text-sm text-nexus-text-secondary mt-1">
              商品を適切なロケーションに配置します
            </p>
          </div>

          {/* 商品検索 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                商品検索
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="商品ID、SKU、商品名で検索"
                  className="flex-1 px-4 py-3 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 text-nexus-text-primary transition-all duration-200"
                />
                <button
                  onClick={() => setShowScanner(!showScanner)}
                  className="nexus-button flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  スキャン
                </button>
                <button
                  onClick={handleSearch}
                  className="nexus-button primary"
                  disabled={loading}
                >
                  検索
                </button>
              </div>
            </div>

            {/* バーコードスキャナー */}
            <BarcodeScanner 
              isOpen={showScanner}
              onClose={() => setShowScanner(false)}
              onScan={handleBarcodeScan} 
            />

            {/* 検索結果 */}
            {searchResults.length > 0 && (
              <div className="holo-table">
                <div className="holo-body">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className={`holo-row p-4 cursor-pointer transition-all ${
                        selectedProduct?.id === product.id ? 'bg-nexus-yellow/10 border-nexus-yellow' : ''
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-nexus-text-primary">{product.name}</h4>
                          <p className="text-sm text-nexus-text-secondary">
                            ID: {product.id} | SKU: {product.sku}
                          </p>
                          {product.currentLocation && (
                            <p className="text-sm text-nexus-yellow mt-1">
                              現在地: {product.currentLocation}
                            </p>
                          )}
                        </div>
                        <span className={`status-badge ${
                          product.status === 'inspected'
                            ? 'success'
                            : 'warning'
                        }`}>
                          {product.status === 'inspected' ? '検品済' : '検品待ち'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 選択した商品の詳細とロケーション割り当て */}
      {selectedProduct && (
        <div className="intelligence-card asia">
          <div className="p-8">
            <h3 className="text-lg font-display font-bold text-nexus-text-primary mb-4">
              ロケーション割り当て
            </h3>
            
            <div className="bg-nexus-bg-secondary p-4 rounded-lg mb-6 border border-nexus-border">
              <h4 className="font-medium text-nexus-text-primary">{selectedProduct.name}</h4>
              <p className="text-sm text-nexus-text-secondary">ID: {selectedProduct.id}</p>
              <p className="text-sm text-nexus-blue mt-2 flex items-center">
                <span className="action-orb blue w-5 h-5 mr-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                {getLocationRecommendation(selectedProduct)}
              </p>
            </div>

            {/* ロケーション選択 */}
            <div className="space-y-6">
              {Object.entries(locations).map(([type, locs]) => (
                <div key={type}>
                  <h4 className="font-medium text-sm text-nexus-text-secondary mb-3">
                    {type === 'standard' && '標準保管'}
                    {type === 'controlled' && '環境管理保管'}
                    {type === 'secure' && '高セキュリティ保管'}
                    {type === 'processing' && '作業エリア'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {locs.map((loc) => (
                      <button
                        key={loc.code}
                        onClick={() => setSelectedLocation(loc.code)}
                        className={`p-4 text-left border rounded-lg transition-all ${
                          selectedLocation === loc.code
                            ? 'border-nexus-yellow bg-nexus-yellow/10'
                            : 'border-nexus-border hover:border-nexus-text-secondary bg-nexus-bg-secondary'
                        }`}
                      >
                        <div className="font-medium text-sm text-nexus-text-primary">{loc.name}</div>
                        <div className="text-xs text-nexus-text-secondary">
                          容量: {loc.capacity}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 備考 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                備考（任意）
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 text-nexus-text-primary transition-all duration-200"
                placeholder="特記事項があれば入力してください"
              />
            </div>

            {/* アクションボタン */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setSelectedLocation('');
                  setNotes('');
                }}
                className="nexus-button"
              >
                キャンセル
              </button>
              <button
                onClick={handleRegister}
                className="nexus-button primary"
                disabled={!selectedLocation || loading}
              >
                {loading ? '登録中...' : 'ロケーション登録'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 