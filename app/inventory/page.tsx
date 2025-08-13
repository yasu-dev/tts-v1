'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import UnifiedPageHeader from '../components/ui/UnifiedPageHeader';
import { useState, useEffect, useMemo } from 'react';
import {
  PlusIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { NexusInput, NexusButton, NexusLoadingSpinner, NexusSelect, BusinessStatusIndicator } from '@/app/components/ui';
import BaseModal from '../components/ui/BaseModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

type SortField = 'name' | 'sku' | 'status' | 'value';
type SortDirection = 'asc' | 'desc';

export default function InventoryPage() {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // フィルター・ソート状態
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // モックデータ（実際のAPIデータと置き換え）
  const mockInventory = [
    {
      id: 1,
      name: 'Sony α7 IV ボディ',
      sku: 'PRD-001',
      category: 'カメラ本体',
      status: 'storage',
      value: 320000,
      location: 'A-01',
      condition: 'A',
      updatedAt: '2024-01-15',
      certifications: ['AUTHENTIC']
    },
    {
      id: 2,
      name: 'Sony FE 24-70mm F2.8 GM II',
      sku: 'PRD-002',
      category: 'レンズ',
      status: 'listing',
      value: 280000,
      location: 'A-02',
      condition: 'A',
      updatedAt: '2024-01-14',
      certifications: ['AUTHENTIC']
    },
    {
      id: 3,
      name: 'Rolex Submariner',
      sku: 'PRD-003',
      category: '腕時計',
      status: 'storage',
      value: 1200000,
      location: 'B-01',
      condition: 'S',
      updatedAt: '2024-01-13',
      certifications: ['AUTHENTIC', 'PREMIUM']
    },
    {
      id: 4,
      name: 'Canon EOS R5',
      sku: 'PRD-004',
      category: 'カメラ本体',
      status: 'inspection',
      value: 450000,
      location: 'A-03',
      condition: 'B',
      updatedAt: '2024-01-12',
      certifications: ['AUTHENTIC']
    },
    {
      id: 5,
      name: 'Leica Q3',
      sku: 'PRD-005',
      category: 'カメラ本体',
      status: 'storage',
      value: 820000,
      location: 'A-04',
      condition: 'A',
      updatedAt: '2024-01-11',
      certifications: ['AUTHENTIC', 'PREMIUM']
    }
  ];

  useEffect(() => {
    // 実際の実装では、ここでAPIからデータを取得
    const fetchData = async () => {
      setLoading(true);
      try {
        // 模擬的にAPIデータを設定
        await new Promise(resolve => setTimeout(resolve, 500)); // Loading simulation
        setInventory(mockInventory);
      } catch (error) {
        showToast({
          title: 'エラー',
          message: '在庫データの取得に失敗しました',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // カテゴリーオプション
  const categoryOptions = [
    { value: 'all', label: 'すべてのカテゴリー' },
    { value: 'カメラ本体', label: 'カメラ本体' },
    { value: 'レンズ', label: 'レンズ' },
    { value: '腕時計', label: '腕時計' }
  ];

  // フィルタリング
  const filteredInventory = useMemo(() => {
    let filtered = inventory;

    // ステータスフィルター
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // カテゴリーフィルター
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // 検索フィルター
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [inventory, selectedStatus, selectedCategory, searchQuery]);

  // ソート
  const sortedInventory = useMemo(() => {
    const sorted = [...filteredInventory].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'sku':
          aValue = a.sku;
          bValue = b.sku;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredInventory, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  const getConditionBadge = (condition: string) => {
    const config = {
      'S': { color: 'bg-blue-600', text: 'S' },
      'A': { color: 'bg-blue-500', text: 'A' },
      'B': { color: 'bg-blue-400', text: 'B' },
      'C': { color: 'bg-slate-400', text: 'C' }
    };
    
    const { color, text } = config[condition as keyof typeof config] || config['C'];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${color}`}>
        {text}
      </span>
    );
  };

  const convertStatusToKey = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'inbound': 'inbound',
      'inspection': 'inspection', 
      'storage': 'storage',
      'listing': 'listing',
      'ordered': 'ordered',
      'shipping': 'shipping',
      'sold': 'sold',
      'returned': 'returned'
    };
    return statusMap[status] || status;
  };

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const headerActions = (
    <>
      <NexusButton 
        variant="primary"
        size="sm"
        icon={<PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
      >
        <span className="hidden sm:inline">新規商品登録</span>
      </NexusButton>
      <NexusButton
        size="sm"
        icon={<ArrowUpTrayIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
      >
        <span className="hidden sm:inline">CSVインポート</span>
      </NexusButton>
      <NexusButton
        size="sm"
        icon={<ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
      >
        <span className="hidden sm:inline">CSVエクスポート</span>
      </NexusButton>
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="在庫管理"
          subtitle="あなたの商品の状況を確認できます"
          userType="seller"
          iconType="inventory"
          actions={headerActions}
        />

        {/* フィルター・検索 - 他の画面と統一 */}
        <div className="bg-white rounded-xl border border-nexus-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="w-5 h-5 text-nexus-text-secondary" />
            <h3 className="text-lg font-medium text-nexus-text-primary">フィルター・検索</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NexusSelect
              label="ステータス"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'all', label: 'すべてのステータス' },
                { value: 'inbound', label: '入荷待ち' },
                { value: 'inspection', label: '検品中' },
                { value: 'storage', label: '保管中' },
                { value: 'listing', label: '出品中' },
                { value: 'ordered', label: '受注済み' },
                { value: 'shipping', label: '出荷中' },
                { value: 'sold', label: '売約済み' },
                { value: 'returned', label: '返品' }
              ]}
            />

            <NexusSelect
              label="カテゴリー"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={categoryOptions}
            />

            <NexusInput
              type="text"
              label="検索"
              placeholder="商品名・SKU・カテゴリーで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 商品一覧 - timelineページと統一されたテーブル構造 */}
        <div className="bg-white rounded-xl border border-nexus-border p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-nexus-text-primary">商品一覧</h3>
            <p className="text-nexus-text-secondary mt-1 text-sm">
              {sortedInventory.length}件の商品を表示
            </p>
          </div>
          
          {/* テーブル */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nexus-border">
                  <th 
                    className="text-left p-4 font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      商品名
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('sku')}
                  >
                    <div className="flex items-center gap-1">
                      SKU
                      {getSortIcon('sku')}
                    </div>
                  </th>
                  <th className="text-center p-4 font-medium text-nexus-text-secondary">保管場所</th>
                  <th 
                    className="text-center p-4 font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      ステータス
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="text-center p-4 font-medium text-nexus-text-secondary">品質</th>
                  <th 
                    className="text-right p-4 font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('value')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      価格
                      {getSortIcon('value')}
                    </div>
                  </th>
                  <th className="text-center p-4 font-medium text-nexus-text-secondary">更新日</th>
                  <th className="text-center p-4 font-medium text-nexus-text-secondary">操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedInventory.map((item) => (
                  <tr 
                    key={item.id}
                    className="border-b border-nexus-border hover:bg-nexus-bg-tertiary transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium text-nexus-text-primary">
                        {item.name}
                      </div>
                      <div className="text-sm text-nexus-text-secondary mt-1">
                        {item.category}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm text-nexus-text-primary">
                        {item.sku}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm text-nexus-text-secondary">
                        {item.location}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <BusinessStatusIndicator 
                          status={convertStatusToKey(item.status) as any} 
                          size="sm" 
                        />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {getConditionBadge(item.condition)}
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-nexus-text-primary">
                        ¥{item.value.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm text-nexus-text-secondary">
                        {new Date(item.updatedAt).toLocaleDateString('ja-JP', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <NexusButton
                          onClick={() => handleViewProduct(item)}
                          size="sm"
                          variant="primary"
                          icon={<EyeIcon className="w-4 h-4" />}
                        >
                          詳細
                        </NexusButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedInventory.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-nexus-text-secondary">
                      {searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all'
                        ? '検索条件に一致する商品がありません' 
                        : '商品データがありません'
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 商品詳細モーダル */}
        <BaseModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedProduct(null);
          }}
          title="商品詳細"
          size="lg"
        >
          {selectedProduct && (
            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-nexus-text-primary mb-2">基本情報</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">商品名</span>
                      <span className="font-bold text-nexus-text-primary">{selectedProduct.name}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">SKU</span>
                      <span className="font-mono text-nexus-text-primary">{selectedProduct.sku}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">カテゴリー</span>
                      <span className="text-nexus-text-primary">{selectedProduct.category}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">保管場所</span>
                      <span className="text-nexus-text-primary">{selectedProduct.location}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-nexus-text-primary mb-2">状況・価値</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">ステータス</span>
                      <BusinessStatusIndicator 
                        status={convertStatusToKey(selectedProduct.status) as any} 
                        size="sm" 
                      />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">品質ランク</span>
                      {getConditionBadge(selectedProduct.condition)}
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">評価額</span>
                      <span className="font-bold text-blue-600 text-lg">¥{selectedProduct.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">更新日</span>
                      <span className="text-nexus-text-secondary">
                        {new Date(selectedProduct.updatedAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 認証情報 */}
              <div>
                <h4 className="font-bold text-nexus-text-primary mb-2">認証情報</h4>
                <div className="flex gap-2 flex-wrap">
                  {selectedProduct.certifications.map((cert: string) => (
                    <span key={cert} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* セラー向けアクションボタン */}
              {selectedProduct.status === 'storage' && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-end">
                    <NexusButton
                      variant="primary"
                      icon={<ShoppingCartIcon className="w-4 h-4" />}
                    >
                      出品する
                    </NexusButton>
                  </div>
                </div>
              )}
            </div>
          )}
        </BaseModal>
      </div>
    </DashboardLayout>
  );
}