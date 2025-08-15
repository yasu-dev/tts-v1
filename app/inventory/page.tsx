'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import UnifiedPageHeader from '../components/ui/UnifiedPageHeader';
import { useState, useEffect, useMemo } from 'react';
import {
  EyeIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { NexusInput, NexusButton, NexusLoadingSpinner, NexusSelect, BusinessStatusIndicator } from '@/app/components/ui';
import BaseModal from '../components/ui/BaseModal';
import ListingFormModal from '@/app/components/modals/ListingFormModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { useCategories, useProductStatuses, createSelectOptions, getNameByKey } from '@/lib/hooks/useMasterData';

type SortField = 'name' | 'sku' | 'status' | 'price';
type SortDirection = 'asc' | 'desc';

// 品質ランクバッジを生成する関数
const getConditionBadge = (condition: string) => {
  const conditionConfig: Record<string, { bg: string; text: string; label: string }> = {
    excellent: { bg: 'bg-green-800', text: 'text-white', label: '最高品質' },
    good: { bg: 'bg-blue-800', text: 'text-white', label: '高品質' },
    fair: { bg: 'bg-yellow-700', text: 'text-white', label: '標準品質' },
    poor: { bg: 'bg-red-800', text: 'text-white', label: '要注意' }
  };

  const config = conditionConfig[condition] || conditionConfig.fair;
  
  return (
    <span className={`
      inline-flex items-center
      px-3 py-1.5
      rounded-lg
      border-2
      font-bold
      text-xs
      uppercase
      tracking-wide
      ${config.bg}
      ${config.text}
      border-current
    `}>
      {config.label}
    </span>
  );
};

export default function InventoryPage() {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isListingFormModalOpen, setIsListingFormModalOpen] = useState(false);
  const [selectedListingProduct, setSelectedListingProduct] = useState<any>(null);
  
  // マスタデータの取得
  const { categories, loading: categoriesLoading } = useCategories();
  const { statuses: productStatuses, loading: statusesLoading } = useProductStatuses();
  
  // フィルター・ソート状態
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    // APIからデータを取得
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('📡 在庫データ取得開始...');
        const response = await fetch('/api/inventory');
        console.log('📡 APIレスポンス:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`API エラー: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 取得データ:', {
          dataKeys: Object.keys(data),
          productsCount: data.data?.length || 0,
          firstProduct: data.data?.[0]?.name || 'なし'
        });
        
        // data.products ではなく data.data を使用（APIレスポンス形式に合わせる）
        setInventory(data.data || []);
      } catch (error) {
        console.error('在庫データ取得エラー:', error);
        // Toast の表示を次のフレームまで遅延
        setTimeout(() => {
          showToast({
            title: 'エラー',
            message: '在庫データの取得に失敗しました',
            type: 'error'
          });
        }, 0);
      } finally {
        setLoading(false);
      }
    };

    // 非同期関数を適切に処理
    fetchData().catch(error => {
      console.error('Fetch data error:', error);
    });
  }, [showToast]);

  // カテゴリーオプション（APIから動的取得）
  const categoryOptions = useMemo(() => {
    if (categoriesLoading || !categories.length) {
      return [{ value: 'all', label: 'すべてのカテゴリー' }];
    }
    return [
      { value: 'all', label: 'すべてのカテゴリー' },
      ...createSelectOptions(categories)
    ];
  }, [categories, categoriesLoading]);

  // ステータスオプション（APIから動的取得）
  const statusOptions = useMemo(() => {
    if (statusesLoading || !productStatuses.length) {
      return [{ value: 'all', label: 'すべてのステータス' }];
    }
    return [
      { value: 'all', label: 'すべてのステータス' },
      ...createSelectOptions(productStatuses)
    ];
  }, [productStatuses, statusesLoading]);

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
        case 'price':
          aValue = a.price;
          bValue = b.price;
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

  const handleOpenListingForm = (product: any) => {
    if (!product) {
      console.log('❌ handleOpenListingForm: product is null or undefined');
      return;
    }

    console.log('🚀 eBayリスティングフォームを開く:', { productId: product.id, productName: product.name });
    setSelectedListingProduct(product);
    setIsListingFormModalOpen(true);
    
    // 詳細モーダルが開いている場合は閉じる
    setIsDetailModalOpen(false);
    setSelectedProduct(null);
  };

  const handleListingSuccess = () => {
    console.log('✅ eBay出品成功');
    showToast({
      title: '出品完了',
      message: 'eBayへの出品が完了しました',
      type: 'success'
    });
    
    // リスティングフォームを閉じる
    setIsListingFormModalOpen(false);
    setSelectedListingProduct(null);
    
    // インベントリを再読み込み（必要に応じて）
    // 実際の出品処理後、商品ステータスが変更される可能性があるため
  };

  const handleListingFormClose = () => {
    setIsListingFormModalOpen(false);
    setSelectedListingProduct(null);
  };



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
              options={statusOptions}
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
            <table className="w-full" data-testid="inventory-table">
              <thead>
                <tr className="border-b border-nexus-border">
                  <th className="text-center p-4 font-medium text-nexus-text-secondary">画像</th>
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
                  <th 
                    className="text-right p-4 font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      価格
                      {getSortIcon('price')}
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
                    <td className="p-4 text-center">
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={item.images[0].thumbnailUrl || item.images[0].url} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg mx-auto border border-nexus-border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto border border-nexus-border flex items-center justify-center">
                          <span className="text-xs text-gray-400">画像なし</span>
                        </div>
                      )}
                    </td>
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
                        {item.currentLocation?.name || item.currentLocation?.code || 'N/A'}
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
                    <td className="p-4 text-right">
                      <span className="font-bold text-nexus-text-primary">
                        ¥{item.price ? item.price.toLocaleString() : '0'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm text-nexus-text-secondary">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('ja-JP', { 
                          month: 'short', 
                          day: 'numeric' 
                        }) : '未設定'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <NexusButton
                          onClick={() => handleViewProduct(item)}
                          size="sm"
                          variant="secondary"
                          icon={<EyeIcon className="w-4 h-4" />}
                        >
                          詳細
                        </NexusButton>
                        {item.status === 'storage' && (
                          <NexusButton
                            onClick={() => handleOpenListingForm(item)}
                            size="sm"
                            variant="primary"
                            icon={<ShoppingCartIcon className="w-4 h-4" />}
                          >
                            出品
                          </NexusButton>
                        )}
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
          data-testid="product-detail-modal"
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
                      <span className="font-bold text-nexus-text-primary">{selectedProduct.name || '未設定'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">SKU</span>
                      <span className="font-mono text-nexus-text-primary">{selectedProduct.sku || '未設定'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">カテゴリー</span>
                      <span className="text-nexus-text-primary">{selectedProduct.category || '未設定'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">保管場所</span>
                      <span className="text-nexus-text-primary">{selectedProduct.location || '未設定'}</span>
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
                      <span className="font-bold text-blue-600 text-lg">
                        ¥{selectedProduct.value ? selectedProduct.value.toLocaleString() : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">更新日</span>
                      <span className="text-nexus-text-secondary">
                        {selectedProduct.updatedAt ? new Date(selectedProduct.updatedAt).toLocaleDateString('ja-JP') : '未設定'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 認証情報 */}
              <div>
                <h4 className="font-bold text-nexus-text-primary mb-2">認証情報</h4>
                <div className="flex gap-2 flex-wrap">
                  {selectedProduct.certifications && selectedProduct.certifications.length > 0 ? (
                    selectedProduct.certifications.map((cert: string) => (
                      <span key={cert} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                        {cert}
                      </span>
                    ))
                  ) : (
                    <span className="text-nexus-text-secondary text-sm">認証情報なし</span>
                  )}
                </div>
              </div>
              
              {/* セラー向けアクションボタン */}
              {selectedProduct.status === 'storage' && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-end">
                    <NexusButton
                      onClick={() => handleOpenListingForm(selectedProduct)}
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

        {/* eBayリスティングフォームモーダル */}
        <ListingFormModal
          isOpen={isListingFormModalOpen}
          onClose={handleListingFormClose}
          product={selectedListingProduct}
          onSuccess={handleListingSuccess}
        />
      </div>
    </DashboardLayout>
  );
}