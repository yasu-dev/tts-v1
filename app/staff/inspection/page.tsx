'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import NexusSelect from '@/app/components/ui/NexusSelect';
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator';
import { NexusLoadingSpinner } from '@/app/components/ui';
import Pagination from '@/app/components/ui/Pagination';
import {
  BookOpenIcon,
  CameraIcon,
  XMarkIcon,
  CheckIcon,
  ClipboardDocumentListIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import BaseModal from '@/app/components/ui/BaseModal';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import { parseProductMetadata, filterProductsByInspectionPhotographyStatus, getInspectionPhotographyStatus } from '@/lib/utils/product-status';

interface ChecklistItem {
  id: string;
  label: string;
  type: 'boolean' | 'rating' | 'measurement';
  required: boolean;
  value?: any;
  notes?: string;
}

interface ChecklistCategory {
  name: string;
  items: ChecklistItem[];
}

interface ChecklistTemplate {
  id: string;
  name: string;
  categories: ChecklistCategory[];
}

interface InspectionTask {
  id: string;
  title: string;
  productId: string;
  productName: string;
  type: 'camera' | 'watch' | 'lens' | 'accessory';

  assignee: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  location: string;
  value: string;
  category: string;
}

interface InspectionData {
  checklistTemplates: {
    [key: string]: ChecklistTemplate;
  };
  inspectionHistory: any[];
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model: string;
  status: 'pending_inspection' | 'inspecting' | 'completed' | 'failed';
  receivedDate: string;

  imageUrl?: string;
  metadata?: string; // メタデータフィールド追加
}

type SortField = 'name' | 'sku' | 'category' | 'receivedDate' | 'status';
type SortDirection = 'asc' | 'desc';

// モックデータ（実際はAPIから取得）
const mockProducts: Product[] = [
  {
    id: '001',
    name: 'Canon EOS R5 ボディ',
    sku: 'TWD-2024-001',
    category: 'camera_body',
    brand: 'Canon',
    model: 'EOS R5',
    status: 'pending_inspection',
    receivedDate: '2024-01-20',

    imageUrl: '/api/placeholder/150/150',
  },
  {
    id: '002',
    name: 'Sony FE 24-70mm F2.8 GM',
    sku: 'TWD-2024-002',
    category: 'lens',
    brand: 'Sony',
    model: 'SEL2470GM',
    status: 'inspecting',
    receivedDate: '2024-01-19',

    imageUrl: '/api/placeholder/150/150',
  },
  {
    id: '003',
    name: 'Nikon D850 ボディ',
    sku: 'TWD-2024-003',
    category: 'camera_body',
    brand: 'Nikon',
    model: 'D850',
    status: 'completed',
    receivedDate: '2024-01-18',

    imageUrl: '/api/placeholder/150/150',
  },
  {
    id: '004',
    name: 'Canon EF 70-200mm F2.8L IS III',
    sku: 'TWD-2024-004',
    category: 'lens',
    brand: 'Canon',
    model: 'EF70-200mm',
    status: 'failed',
    receivedDate: '2024-01-17',

    imageUrl: '/api/placeholder/150/150',
  },
  {
    id: '005',
    name: 'Rolex Submariner Date',
    sku: 'TWD-2024-005',
    category: 'watch',
    brand: 'Rolex',
    model: 'Submariner',
    status: 'pending_inspection',
    receivedDate: '2024-01-21',

    imageUrl: '/api/placeholder/150/150',
  },
  {
    id: '006',
    name: 'Omega Seamaster Planet Ocean',
    sku: 'TWD-2024-006',
    category: 'watch',
    brand: 'Omega',
    model: 'Seamaster',
    status: 'inspecting',
    receivedDate: '2024-01-16',

    imageUrl: '/api/placeholder/150/150',
  },
];

const categoryLabels = {
  camera_body: 'カメラボディ',
  lens: 'レンズ',
  watch: '腕時計',
  accessory: 'アクセサリー',
  bag: 'バッグ',
  jewelry: 'ジュエリー',
  electronics: '電子機器',
  other: 'その他',
};

// ステータス変換関数（BusinessStatusIndicatorに合わせる）
const convertStatusToBusinessStatus = (status: string) => {
  switch (status) {
    case 'pending_inspection':
      return 'inbound';  // 検品待ち → 入荷待ち
    case 'inspecting':
      return 'inspection';  // 検品中
    case 'completed':
      return 'completed';  // 完了
    case 'failed':
      return 'rejected';  // 不合格 → 拒否
    default:
      return 'inbound';
  }
};

export default function InspectionPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [progressData, setProgressData] = useState<{[key: string]: {currentStep: number, lastUpdated: string}}>({});

  // モックデータのステータス更新機能
  const updateProductStatus = (productId: string, newStatus: string) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, status: newStatus }
          : product
      )
    );
    
    // sessionStorageにも保存（ページリロード時の状態維持用）
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, status: newStatus }
        : product
    );
    sessionStorage.setItem('mockProductsStatus', JSON.stringify(updatedProducts));
  };

  // フィルター・ソート・ページング状態
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [selectedInspectionPhotoStatus, setSelectedInspectionPhotoStatus] = useState<string>('all'); // 検品・撮影状況フィルター追加
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('receivedDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // 保存された状態を復元する関数
  const restoreSavedState = () => {
    try {
      // モックデータのステータス状態を復元
      const savedProductsStatus = sessionStorage.getItem('mockProductsStatus');
      if (savedProductsStatus) {
        const parsedProducts = JSON.parse(savedProductsStatus);
        setProducts(parsedProducts);
      }

      const savedState = sessionStorage.getItem('inspectionListState');
      if (savedState) {
        const state = JSON.parse(savedState);
        
        // 1時間以内のデータのみ復元（古いデータは無視）
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - state.timestamp < oneHour) {
          setSelectedStatus(state.selectedStatus || 'all');
          setSelectedCategory(state.selectedCategory || 'all');
    
          setSelectedInspectionPhotoStatus(state.selectedInspectionPhotoStatus || 'all');
          setSearchQuery(state.searchQuery || '');
          setSortField(state.sortField || 'receivedDate');
          setSortDirection(state.sortDirection || 'desc');
          setCurrentPage(state.currentPage || 1);
          
          // 状態復元を通知
          showToast({
            type: 'info',
            title: '前回の表示状態を復元しました',
            message: 'フィルター・検索条件が復元されています',
            duration: 3000
          });
          
          // 復元後はsessionStorageから削除
          sessionStorage.removeItem('inspectionListState');
        }
      }
    } catch (error) {
      console.error('[ERROR] Failed to restore saved state:', error);
    }
  };

  // 進捗データを読み込む関数
  const loadProgressData = async () => {
    try {
      const response = await fetch('/api/products/inspection/progress/all');
      if (response.ok) {
        const result = await response.json();
        setProgressData(result.data || {});
      }
    } catch (error) {
      console.error('[ERROR] Failed to load progress data:', error);
    }
  };

  // コンポーネント初期化時に状態復元と進捗データ読み込み
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('restored') === '1') {
      restoreSavedState();
      
      // URLからrestoredパラメーターを削除（履歴に残さない）
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
    
    // 進捗データを読み込み
    loadProgressData();

    // 検品完了イベントリスナーを追加
    const handleInspectionComplete = (event: CustomEvent) => {
      const { productId, newStatus } = event.detail;
      updateProductStatus(productId, newStatus);
      
      showToast({
        type: 'success',
        title: 'ステータス更新',
        message: `商品のステータスが更新されました`,
        duration: 3000
      });
    };

    window.addEventListener('inspectionComplete', handleInspectionComplete as EventListener);
    
    return () => {
      window.removeEventListener('inspectionComplete', handleInspectionComplete as EventListener);
    };
  }, [products, updateProductStatus]);

  // 統計データ計算
  const inspectionStats = {
    total: products.length,
    pending: products.filter(p => p.status === 'pending_inspection').length,
    inspecting: products.filter(p => p.status === 'inspecting').length,
    completed: products.filter(p => p.status === 'completed').length,
    failed: products.filter(p => p.status === 'failed').length,
  };

  // フィルタリング
  let filteredProducts = products.filter(product => {
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.model.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // 検品・撮影状況によるフィルタリング
  if (selectedInspectionPhotoStatus !== 'all') {
    filteredProducts = filterProductsByInspectionPhotographyStatus(
      filteredProducts, 
      selectedInspectionPhotoStatus as any
    );
  }

  // ソート
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let valueA: any = a[sortField];
    let valueB: any = b[sortField];
    
    if (sortField === 'receivedDate') {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // ページネーション
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // ソート処理
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // ソートアイコン
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUpIcon className="w-4 h-4 opacity-30" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4" /> : 
      <ChevronDownIcon className="w-4 h-4" />;
  };

  // 進捗ステップ表示用の関数
  const getProgressStepDisplay = (productId: string) => {
    const progress = progressData[productId];
    if (!progress) {
      return { label: '未開始', color: 'bg-gray-100 text-gray-800' };
    }
    
    switch (progress.currentStep) {
      case 1:
        return { label: '検品項目', color: 'bg-blue-100 text-blue-800' };
      case 2:
        return { label: '動画記録', color: 'bg-yellow-100 text-yellow-800' };
      case 3:
        return { label: '写真撮影', color: 'bg-purple-100 text-purple-800' };
      case 4:
        return { label: '確認完了', color: 'bg-green-100 text-green-800' };
      default:
        return { label: '未開始', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // 現在の画面状態を保存する関数
  const saveCurrentState = () => {
    const currentState = {
      selectedStatus,
      selectedCategory,

      selectedInspectionPhotoStatus,
      searchQuery,
      currentPage,
      sortField,
      sortDirection,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem('inspectionListState', JSON.stringify(currentState));
  };

  // 検品開始（ページ遷移に統一）
  const handleStartInspection = (product: Product) => {
    saveCurrentState();
    window.location.href = `/staff/inspection/${product.id}`;
  };

  // 検品続行（ページ遷移に統一）
  const handleContinueInspection = (product: Product) => {
    saveCurrentState();
    window.location.href = `/staff/inspection/${product.id}`;
  };

  // 商品詳細表示（統一化により不使用）
  const handleViewProduct = (product: Product) => {
    // 詳細表示も統一のため、検品画面に遷移
    saveCurrentState();
    window.location.href = `/staff/inspection/${product.id}`;
  };

  // カテゴリー選択肢
  const categoryOptions = [
    { value: 'all', label: 'すべてのカテゴリー' },
    ...Object.entries(categoryLabels).map(([key, label]) => ({ value: key, label }))
  ];



  // ステータス選択肢
  const statusOptions = [
    { value: 'all', label: 'すべてのステータス' },
    { value: 'pending_inspection', label: '入荷待ち' },
    { value: 'inspecting', label: '検品中' },
    { value: 'completed', label: '完了' },
    { value: 'failed', label: '拒否' }
  ];

  // 検品・撮影状況選択肢
  const inspectionPhotoStatusOptions = [
    { value: 'all', label: 'すべての状況' },
    { value: 'inspection_pending', label: '検品待ち' },
    { value: 'photography_pending', label: '撮影待ち' },
    { value: 'completed', label: '完了' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="検品管理"
          subtitle="商品の検品状況を管理できます"
          userType="staff"
          iconType="inspection"
        />

        {/* フィルター・検索セクション */}
        <div className="bg-white rounded-xl border border-nexus-border p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="w-5 h-5 text-nexus-text-secondary" />
            <h3 className="text-lg font-medium text-nexus-text-primary">フィルター・検索</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <NexusSelect
              label="ステータス"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOptions}
            />

            <NexusSelect
              label="検品・撮影状況"
              value={selectedInspectionPhotoStatus}
              onChange={(e) => setSelectedInspectionPhotoStatus(e.target.value)}
              options={inspectionPhotoStatusOptions}
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
              placeholder="商品名・SKU・ブランドで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>



        {/* 検品リスト */}
        <div className="bg-white rounded-xl border border-nexus-border p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-nexus-text-primary">検品リスト</h3>
              <p className="text-nexus-text-secondary mt-1 text-sm">
                {filteredProducts.length}件中 {Math.min(itemsPerPage, filteredProducts.length - (currentPage - 1) * itemsPerPage)}件を表示
              </p>
            </div>
          </div>
            
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nexus-border">
                  <th className="text-left py-3 px-2 sm:px-4 text-sm font-medium text-nexus-text-secondary">商品情報</th>
                  <th 
                    className="text-left py-3 px-2 sm:px-4 text-sm font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('sku')}
                  >
                    <div className="flex items-center gap-1">
                      SKU
                      {getSortIcon('sku')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-2 sm:px-4 text-sm font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      カテゴリー
                      {getSortIcon('category')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-2 sm:px-4 text-sm font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('receivedDate')}
                  >
                    <div className="flex items-center gap-1">
                      受領日
                      {getSortIcon('receivedDate')}
                    </div>
                  </th>

                  <th className="text-center py-3 px-2 sm:px-4 text-sm font-medium text-nexus-text-secondary">ステータス</th>
                  <th className="text-center py-3 px-2 sm:px-4 text-sm font-medium text-nexus-text-secondary">アクション</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="border-b border-nexus-border hover:bg-nexus-bg-tertiary">
                    <td className="py-3 px-2 sm:px-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <img
                          src={product.imageUrl || '/api/placeholder/60/60'}
                          alt={product.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-nexus-text-primary text-sm truncate">{product.name}</div>
                          <p className="text-xs sm:text-sm text-nexus-text-secondary truncate">{product.brand} | {product.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <span className="font-mono text-xs sm:text-sm text-nexus-text-primary">{product.sku}</span>
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <span className="text-xs sm:text-sm text-nexus-text-primary">
                        {categoryLabels[product.category as keyof typeof categoryLabels]}
                      </span>
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <span className="text-xs sm:text-sm text-nexus-text-primary">{product.receivedDate}</span>
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <div className="flex justify-center">
                        <BusinessStatusIndicator 
                          status={convertStatusToBusinessStatus(product.status) as any}
                          size="sm"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <div className="flex justify-center gap-1 sm:gap-2">
                        {(() => {
                          const metadata = parseProductMetadata(product.metadata);
                          const inspectionPhotoStatus = getInspectionPhotographyStatus ? getInspectionPhotographyStatus(metadata) : null;

                          if (product.status === 'pending_inspection') {
                            return (
                              <NexusButton 
                                size="sm" 
                                variant="primary"
                                onClick={() => handleStartInspection(product)}
                              >
                                <span className="hidden sm:inline">検品開始</span>
                                <span className="sm:hidden">開始</span>
                              </NexusButton>
                            );
                          }

                          if (product.status === 'inspecting') {
                            return (
                              <NexusButton 
                                size="sm" 
                                variant="primary"
                                onClick={() => handleContinueInspection(product)}
                              >
                                <span className="hidden sm:inline">続ける</span>
                                <span className="sm:hidden">続行</span>
                              </NexusButton>
                            );
                          }

                          if (inspectionPhotoStatus?.canStartPhotography) {
                            return (
                              <NexusButton 
                                size="sm" 
                                variant="primary" 
                                icon={<CameraIcon className="w-4 h-4" />}
                                onClick={() => {
                                  saveCurrentState();
                                  window.location.href = `/staff/inspection/${product.id}?mode=photography`;
                                }}
                              >
                                <span className="hidden sm:inline">撮影</span>
                                <span className="sm:hidden">撮影</span>
                              </NexusButton>
                            );
                          }

                          if (product.status === 'completed' || product.status === 'failed') {
                            return (
                              <NexusButton
                                size="sm"
                                variant="default"
                                icon={<EyeIcon className="w-4 h-4" />}
                                onClick={() => handleViewProduct(product)}
                              >
                                <span className="hidden sm:inline">詳細</span>
                                <span className="sm:hidden sr-only">詳細</span>
                              </NexusButton>
                            );
                          }

                          return null;
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 px-2 sm:px-4 text-center text-nexus-text-secondary text-sm">
                      {filteredProducts.length === 0 ? 
                        (searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all' || selectedInspectionPhotoStatus !== 'all'
                          ? '検索条件に一致する商品がありません' 
                          : '検品対象商品がありません'
                        ) : '表示するデータがありません'
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          {filteredProducts.length > 0 && (
            <div className="mt-6 pt-4 border-t border-nexus-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </div>

        {/* 検品モーダル - 使用停止（ページ遷移に統一） */}
        {false && (
          <BaseModal
            isOpen={false}
            onClose={() => {}}
            title="商品検品"
            size="lg"
          >
            <div>
              <p className="text-center text-gray-500">
                検品機能はページ遷移に統一されました
              </p>
            </div>
          </BaseModal>
        )}
      </div>
    </DashboardLayout>
  );
}