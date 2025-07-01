'use client';

import { useState, useEffect } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';

interface ProductLocation {
  id: string;
  productId: string;
  productName: string;
  location: string;
  area: string;
  category: string;
  status: string;
  lastUpdated: string;
  value: string;
}

interface LocationListProps {
  searchQuery?: string;
  filterByArea?: string;
  onProductMove?: (product: ProductLocation) => void;
}

export default function LocationList({ 
  searchQuery = '', 
  filterByArea,
  onProductMove 
}: LocationListProps) {
  const [products, setProducts] = useState<ProductLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'location' | 'lastUpdated' | 'productId'>('location');

  // モックデータ（実際にはAPIから取得）
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockProducts: ProductLocation[] = [
        {
          id: '1',
          productId: 'TWD-CAM-001',
          productName: 'Canon EOS R5',
          location: 'A-01',
          area: '標準棚',
          category: 'カメラ本体',
          status: '保管中',
          lastUpdated: '2024-06-28T10:30:00',
          value: '¥450,000',
        },
        {
          id: '2',
          productId: 'TWD-LEN-005',
          productName: 'Canon RF 24-70mm F2.8',
          location: 'A-15',
          area: '標準棚',
          category: 'レンズ',
          status: '出荷準備',
          lastUpdated: '2024-06-27T14:20:00',
          value: '¥198,000',
        },
        {
          id: '3',
          productId: 'TWD-WAT-007',
          productName: 'Rolex GMT Master',
          location: 'V-03',
          area: '金庫室',
          category: '腕時計',
          status: '保管中',
          lastUpdated: '2024-06-27T09:15:00',
          value: '¥2,100,000',
        },
        {
          id: '4',
          productId: 'TWD-CAM-012',
          productName: 'Sony α7R V',
          location: 'H2-08',
          area: '防湿庫',
          category: 'カメラ本体',
          status: '保管中',
          lastUpdated: '2024-06-25T16:45:00',
          value: '¥320,000',
        },
      ];
      setProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, []);

  // フィルタリングとソート
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = 
        product.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesArea = !filterByArea || product.area === filterByArea;
      
      return matchesSearch && matchesArea;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'location':
          return a.location.localeCompare(b.location);
        case 'lastUpdated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'productId':
          return a.productId.localeCompare(b.productId);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case '検品中': return 'bg-blue-100 text-blue-800';
      case '保管中': return 'bg-green-100 text-green-800';
      case '出荷準備': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAreaIcon = (area: string) => {
    switch (area) {
      case '標準棚':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case '防湿庫':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case '金庫室':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ソートオプション */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {filteredProducts.length} 件の商品
        </p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="location">ロケーション順</option>
          <option value="lastUpdated">更新日時順</option>
          <option value="productId">商品ID順</option>
        </select>
      </div>

      {/* 商品リスト */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                商品情報
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ロケーション
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最終更新
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.productName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.productId} | {product.value}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="flex items-center text-sm">
                      {getAreaIcon(product.area)}
                      <span className="ml-2 font-medium">{product.location}</span>
                      <span className="ml-2 text-gray-500">({product.area})</span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(product.lastUpdated).toLocaleString('ja-JP', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {onProductMove && (
                    <button
                      onClick={() => onProductMove(product)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      移動
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">該当する商品が見つかりません</p>
        </div>
      )}
    </div>
  );
} 