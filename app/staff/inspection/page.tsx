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
  priority: 'high' | 'medium' | 'low';
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
  priority: 'high' | 'normal' | 'low';
  imageUrl?: string;
}

type SortField = 'name' | 'sku' | 'category' | 'receivedDate' | 'priority' | 'status';
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
    priority: 'high',
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
    priority: 'high',
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
    priority: 'normal',
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
    priority: 'low',
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
    priority: 'high',
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
    priority: 'normal',
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
      return 'pending_inspection';
    case 'inspecting':
      return 'inspection';
    case 'completed':
      return 'completed';
    case 'failed':
      return 'cancelled';
    default:
      return 'pending';
  }
};

export default function InspectionPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<InspectionTask | null>(null);
  const [currentChecklist, setCurrentChecklist] = useState<ChecklistTemplate | null>(null);
  const [completedItems, setCompletedItems] = useState<{[key: string]: boolean | number}>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // フィルター・ソート・ページング状態
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('receivedDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // 統計データ計算
  const inspectionStats = {
    total: products.length,
    pending: products.filter(p => p.status === 'pending_inspection').length,
    inspecting: products.filter(p => p.status === 'inspecting').length,
    completed: products.filter(p => p.status === 'completed').length,
    failed: products.filter(p => p.status === 'failed').length,
  };

  // フィルタリング
  const filteredProducts = products.filter(product => {
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || product.priority === selectedPriority;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.model.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
  });

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

  // 検品開始
  const handleStartInspection = (product: Product) => {
    setSelectedProduct(product);
    setIsInspectionModalOpen(true);
    loadChecklistTemplate(product.category);
  };

  // 検品続行
  const handleContinueInspection = (product: Product) => {
    setSelectedProduct(product);
    setIsInspectionModalOpen(true);
    loadChecklistTemplate(product.category);
  };

  // 商品詳細表示
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    // 詳細モーダルを開く処理
  };

  // チェックリストテンプレート読み込み
  const loadChecklistTemplate = (category: string) => {
    // モックチェックリストデータ
    const mockChecklist: ChecklistTemplate = {
      id: `checklist_${category}`,
      name: `${categoryLabels[category as keyof typeof categoryLabels]} 検品チェックリスト`,
      categories: [
        {
          name: '外観検査',
          items: [
            { id: 'appearance_1', label: '外観に傷がないか', type: 'boolean', required: true },
            { id: 'appearance_2', label: '汚れやしみがないか', type: 'boolean', required: true },
            { id: 'appearance_3', label: '色褪せがないか', type: 'boolean', required: true },
          ]
        },
        {
          name: '機能検査',
          items: [
            { id: 'function_1', label: '基本機能が正常に動作するか', type: 'boolean', required: true },
            { id: 'function_2', label: '付属品が揃っているか', type: 'boolean', required: true },
          ]
        }
      ]
    };
    setCurrentChecklist(mockChecklist);
  };

  // 項目完了処理
  const handleItemComplete = (categoryIndex: number, itemIndex: number, value: boolean | number) => {
    setCompletedItems(prev => ({
      ...prev,
      [`${categoryIndex}-${itemIndex}`]: value
    }));
  };

  // 写真アップロード
  const handlePhotoUpload = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files);
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  // 写真削除
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // 検品完了
  const handleCompleteInspection = () => {
    if (selectedProduct) {
      setProducts(prev => prev.map(p => 
        p.id === selectedProduct.id ? { ...p, status: 'completed' } : p
      ));
      showToast({
        title: '検品完了',
        message: `${selectedProduct.name} の検品が完了しました`,
        type: 'success'
      });
    }
  };

  // カテゴリー選択肢
  const categoryOptions = [
    { value: 'all', label: 'すべてのカテゴリー' },
    ...Object.entries(categoryLabels).map(([key, label]) => ({ value: key, label }))
  ];

  // 優先度選択肢
  const priorityOptions = [
    { value: 'all', label: 'すべての優先度' },
    { value: 'high', label: '高' },
    { value: 'normal', label: '中' },
    { value: 'low', label: '低' }
  ];

  // ステータス選択肢
  const statusOptions = [
    { value: 'all', label: 'すべてのステータス' },
    { value: 'pending_inspection', label: '検品待ち' },
    { value: 'inspecting', label: '検品中' },
    { value: 'completed', label: '完了' },
    { value: 'failed', label: '不合格' }
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <NexusSelect
              label="優先度"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              options={priorityOptions}
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

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl border border-nexus-border p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                総計
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-nexus-text-primary mb-2">
              {inspectionStats.total}
            </div>
            <div className="text-sm text-nexus-text-secondary font-medium">
              総商品数
            </div>
          </div>

          <div className="bg-white rounded-xl border border-nexus-border p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                待機中
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-nexus-text-primary mb-2">
              {inspectionStats.pending}
            </div>
            <div className="text-sm text-nexus-text-secondary font-medium">
              検品待ち
            </div>
          </div>

          <div className="bg-white rounded-xl border border-nexus-border p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                進行中
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-nexus-text-primary mb-2">
              {inspectionStats.inspecting}
            </div>
            <div className="text-sm text-nexus-text-secondary font-medium">
              検品中
            </div>
          </div>

          <div className="bg-white rounded-xl border border-nexus-border p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                完了
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-nexus-text-primary mb-2">
              {inspectionStats.completed}
            </div>
            <div className="text-sm text-nexus-text-secondary font-medium">
              完了
            </div>
          </div>

          <div className="bg-white rounded-xl border border-nexus-border p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                要対応
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-nexus-text-primary mb-2">
              {inspectionStats.failed}
            </div>
            <div className="text-sm text-nexus-text-secondary font-medium">
              不合格
            </div>
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
                  <th 
                    className="text-center py-3 px-2 sm:px-4 text-sm font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      優先度
                      {getSortIcon('priority')}
                    </div>
                  </th>
                  <th 
                    className="text-center py-3 px-2 sm:px-4 text-sm font-medium text-nexus-text-secondary cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      ステータス
                      {getSortIcon('status')}
                    </div>
                  </th>
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
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                          product.priority === 'high' ? 'bg-red-100 text-red-800' :
                          product.priority === 'normal' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {product.priority === 'high' ? '高' : product.priority === 'normal' ? '中' : '低'}
                        </span>
                      </div>
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
                        {product.status === 'pending_inspection' && (
                          <NexusButton
                            onClick={() => handleStartInspection(product)}
                            size="sm"
                            variant="primary"
                          >
                            <span className="hidden sm:inline">検品開始</span>
                            <span className="sm:hidden">開始</span>
                          </NexusButton>
                        )}
                        {product.status === 'inspecting' && (
                          <Link href={`/staff/inspection/${product.id}`}>
                            <NexusButton size="sm" variant="primary">
                              <span className="hidden sm:inline">続ける</span>
                              <span className="sm:hidden">続行</span>
                            </NexusButton>
                          </Link>
                        )}
                        {(product.status === 'completed' || product.status === 'failed') && (
                          <NexusButton
                            onClick={() => handleViewProduct(product)}
                            size="sm"
                            variant="default"
                            icon={<EyeIcon className="w-4 h-4" />}
                          >
                            <span className="hidden sm:inline">詳細</span>
                            <span className="sm:hidden sr-only">詳細</span>
                          </NexusButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 px-2 sm:px-4 text-center text-nexus-text-secondary text-sm">
                      {filteredProducts.length === 0 ? 
                        (searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all' || selectedPriority !== 'all'
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

        {/* 検品モーダル */}
        <BaseModal
          isOpen={isInspectionModalOpen && !!selectedProduct}
          onClose={() => {
            setIsInspectionModalOpen(false);
            setSelectedProduct(null);
            setActiveTask(null);
          }}
          title="商品検品"
          subtitle={selectedProduct ? `${selectedProduct.name} - ${selectedProduct.sku}` : ''}
          size="lg"
          className="max-w-[1600px]"
        >
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {currentChecklist ? (
              <div className="space-y-6">
                {currentChecklist.categories.map((category, catIndex) => (
                  <div key={catIndex} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {category.name}
                    </h3>
                    <div className="space-y-3">
                      {category.items.map((item, itemIndex) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id={`${catIndex}-${itemIndex}`}
                              checked={Boolean(completedItems[`${catIndex}-${itemIndex}`])}
                              onChange={(e) => handleItemComplete(catIndex, itemIndex, e.target.checked)}
                              className="h-5 w-5 text-blue-600 rounded"
                            />
                            <label htmlFor={`${catIndex}-${itemIndex}`} className="text-sm text-gray-700">
                              {item.label}
                              {item.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                          </div>
                          {item.type === 'rating' && (
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((rating) => {
                                const currentValue = completedItems[`${catIndex}-${itemIndex}`];
                                const isActive = typeof currentValue === 'number' && currentValue >= rating;
                                return (
                                  <button
                                    key={rating}
                                    onClick={() => handleItemComplete(catIndex, itemIndex, rating)}
                                    className={`w-8 h-8 rounded ${
                                      isActive ? 'bg-yellow-400' : 'bg-gray-200'
                                    }`}
                                  >
                                    ★
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* 写真アップロード */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    商品写真
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Photo ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e.target.files)}
                      className="hidden"
                    />
                    <NexusButton
                      onClick={() => fileInputRef.current?.click()}
                      icon={<CameraIcon className="w-5 h-5" />}
                    >
                      写真を追加
                    </NexusButton>
                  </div>
                </div>

                {/* 備考 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    備考
                  </h3>
                  <NexusTextarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="検品時の気づきや特記事項を入力してください..."
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <NexusLoadingSpinner size="md" />
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <NexusButton
              onClick={() => {
                setIsInspectionModalOpen(false);
                setSelectedProduct(null);
                setActiveTask(null);
              }}
              icon={<XMarkIcon className="w-5 h-5" />}
            >
              キャンセル
            </NexusButton>
            <div className="flex space-x-3">
              <NexusButton
                onClick={async () => {
                  try {
                    const inspectionData = {
                      id: `temp_inspection_${Date.now()}`,
                      itemId: selectedProduct?.id || 'unknown',
                      status: 'draft',
                      savedAt: new Date().toISOString(),
                      inspector: 'current_user',
                      notes: '一時保存されたデータ',
                      condition: 'pending_review',
                      images: [],
                      defects: []
                    };
                    
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    const draftData = JSON.parse(localStorage.getItem('inspectionDrafts') || '[]');
                    draftData.push(inspectionData);
                    localStorage.setItem('inspectionDrafts', JSON.stringify(draftData));
                    
                    showToast({
                      title: '一時保存完了',
                      message: '検品データを正常に一時保存しました。後で作業を再開できます。',
                      type: 'success'
                    });
                    
                  } catch (error) {
                    showToast({
                      title: '一時保存エラー',
                      message: 'データの保存に失敗しました。もう一度お試しください。',
                      type: 'error'
                    });
                  }
                }}
                variant="secondary"
              >
                一時保存
              </NexusButton>
              <NexusButton
                onClick={() => {
                  handleCompleteInspection();
                  setIsInspectionModalOpen(false);
                  setSelectedProduct(null);
                }}
                variant="primary"
                icon={<CheckIcon className="w-5 h-5" />}
              >
                検品完了
              </NexusButton>
            </div>
          </div>
        </BaseModal>
      </div>
    </DashboardLayout>
  );
}