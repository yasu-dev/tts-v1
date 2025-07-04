'use client';

import { useState, useEffect } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import EbayListingForm from '../EbayListingForm';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  condition: string;
  status: 'ready' | 'listed' | 'pending' | 'error';
  imageUrl?: string;
  location: string;
  lastUpdated: string;
}

export default function ListingManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showListingForm, setShowListingForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // モックデータ（実際にはAPIから取得）
      const mockProducts: Product[] = [
        {
          id: '1',
          sku: 'TWD-CAM-001',
          name: 'Canon EOS R5',
          category: 'カメラ本体',
          price: 450000,
          condition: 'A',
          status: 'ready',
          location: 'A-01',
          lastUpdated: '2024-06-28T10:00:00',
        },
        {
          id: '2',
          sku: 'TWD-LEN-005',
          name: 'Canon RF 24-70mm F2.8',
          category: 'レンズ',
          price: 198000,
          condition: 'A+',
          status: 'listed',
          location: 'A-15',
          lastUpdated: '2024-06-27T14:30:00',
        },
        {
          id: '3',
          sku: 'TWD-WAT-007',
          name: 'Rolex GMT Master',
          category: '腕時計',
          price: 2100000,
          condition: 'S',
          status: 'pending',
          location: 'V-03',
          lastUpdated: '2024-06-27T09:00:00',
        },
        {
          id: '4',
          sku: 'TWD-CAM-012',
          name: 'Sony α7R V',
          category: 'カメラ本体',
          price: 320000,
          condition: 'B+',
          status: 'ready',
          location: 'H2-08',
          lastUpdated: '2024-06-25T16:00:00',
        },
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error('[ERROR] Fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBatchList = async () => {
    if (selectedProducts.length === 0) {
      alert('出品する商品を選択してください');
      return;
    }

    const confirmed = confirm(`${selectedProducts.length}件の商品を一括出品しますか？`);
    if (!confirmed) return;

    // 一括出品処理（実装時にはAPIを呼び出す）
    alert(`${selectedProducts.length}件の商品を出品処理中...`);
    setSelectedProducts([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <span className="cert-nano cert-mint">出品可能</span>;
      case 'listed':
        return <span className="cert-nano cert-premium">出品中</span>;
      case 'pending':
        return <span className="cert-nano cert-gold">処理中</span>;
      case 'error':
        return <span className="cert-nano cert-ruby">エラー</span>;
      default:
        return <span className="cert-nano">{status}</span>;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    const matchesSearch = 
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-nexus-blue rounded-full"></div>
      </div>
    );
  }

  if (showListingForm && selectedProduct) {
    return (
      <EbayListingForm
        product={selectedProduct}
        onSuccess={(listing) => {
          alert('出品が完了しました');
          setShowListingForm(false);
          setSelectedProduct(null);
          fetchProducts();
        }}
        onCancel={() => {
          setShowListingForm(false);
          setSelectedProduct(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <input
            type="text"
            placeholder="商品ID、商品名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary"
          >
            <option value="all">すべて</option>
            <option value="ready">出品可能</option>
            <option value="listed">出品中</option>
            <option value="pending">処理中</option>
            <option value="error">エラー</option>
          </select>
        </div>
        <div className="flex gap-2">
          <NexusButton
            onClick={handleBatchList}
            variant="primary"
            disabled={selectedProducts.length === 0}
          >
            一括出品 ({selectedProducts.length})
          </NexusButton>
        </div>
      </div>

      {/* Product List */}
      <div className="overflow-x-auto">
        <div className="holo-table">
          <table className="w-full">
            <thead className="holo-header">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-nexus-blue rounded border-nexus-border focus:ring-nexus-blue"
                  />
                </th>
                <th className="text-left">商品情報</th>
                <th className="text-left">カテゴリー</th>
                <th className="text-left">価格</th>
                <th className="text-left">コンディション</th>
                <th className="text-left">ステータス</th>
                <th className="text-right">アクション</th>
              </tr>
            </thead>
          <tbody className="holo-body">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="holo-row">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="w-4 h-4 text-nexus-blue rounded border-nexus-border focus:ring-nexus-blue"
                  />
                </td>
                <td>
                  <div>
                    <p className="font-semibold text-nexus-text-primary">
                      {product.name}
                    </p>
                    <p className="text-sm text-nexus-text-secondary">
                      {product.sku} | {product.location}
                    </p>
                  </div>
                </td>
                <td>
                  <span className="text-sm text-nexus-text-primary">
                    {product.category}
                  </span>
                </td>
                <td>
                  <span className="font-display font-bold text-nexus-text-primary">
                    ¥{product.price.toLocaleString()}
                  </span>
                </td>
                <td>
                  <span className="cert-nano cert-premium">
                    {product.condition}
                  </span>
                </td>
                <td>{getStatusBadge(product.status)}</td>
                <td className="text-right">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowListingForm(true);
                    }}
                    disabled={product.status !== 'ready'}
                    className={`nexus-button ${product.status === 'ready' ? 'primary' : ''}`}
                  >
                    出品
                  </button>
                </td>
              </tr>
                      ))}
        </tbody>
      </table>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-nexus-text-secondary">該当する商品が見つかりません</p>
        </div>
      )}
    </div>
  );
} 