'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import UnifiedPageHeader from '../components/ui/UnifiedPageHeader';
import { useState, useEffect, useMemo } from 'react';
import {
  ArchiveBoxIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import ProductRegistrationModal from '../components/modals/ProductRegistrationModal';
import ListingFormModal from '../components/modals/ListingFormModal';
import { ContentCard, NexusInput, NexusButton, NexusLoadingSpinner, NexusSelect, BusinessStatusIndicator } from '@/app/components/ui';
import Pagination from '@/app/components/ui/Pagination';
import BaseModal from '../components/ui/BaseModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { useRouter } from 'next/navigation';

type SortField = 'name' | 'status' | 'value' | 'sku';
type SortDirection = 'asc' | 'desc';

export default function InventoryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [inventoryStats, setInventoryStats] = useState({
    totalItems: 0,
    inbound: 0,
    inspection: 0,
    storage: 0,
    listed: 0,
    sold: 0,
    maintenance: 0,
    totalValue: 0,
  });

  const [inventory, setInventory] = useState<any[]>([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState(false);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);

  // フィルター・ソート・ページング状態
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // APIから実際のデータを取得
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/inventory');
        if (!response.ok) {
          throw new Error('Failed to fetch inventory data');
        }
        const data = await response.json();
        
        // APIレスポンスの形式に合わせてデータを変換（ステータス変換を含む）
        console.log('🔍 セラー - APIレスポンス詳細:', {
          hasData: !!data.data,
          dataLength: data.data?.length || 0,
          firstItem: data.data?.[0],
          dataKeys: data.data?.[0] ? Object.keys(data.data[0]) : []  
        });

        const inventoryItems = data.data.map((item: any, index: number) => {
          try {
            const transformedItem = {
              id: item.id,
              name: item.name,
              sku: item.sku,
              category: (item.category || '').replace('camera_body', 'カメラ本体')
                                         .replace('lens', 'レンズ') 
                                         .replace('watch', '腕時計')
                                         .replace('camera', 'カメラ')
                                         .replace('accessory', 'アクセサリ'),
              status: item.status, // 英語ステータスのまま保持
              statusDisplay: (item.status || '').replace('inbound', '入荷待ち')
                                         .replace('inspection', '検品中')
                                         .replace('storage', '保管中')
                                         .replace('listing', '出品中')
                                         .replace('ordered', '受注済み')
                                         .replace('shipping', '出荷中')
                                         .replace('sold', '売約済み')
                                         .replace('returned', '返品'),
              location: item.location || '未設定',
              value: item.price || 0,
              certifications: ['AUTHENTIC'], // デフォルト認証
            };
            
            if (index < 3) {
              console.log(`🔍 セラー - 変換後データ${index + 1}:`, transformedItem);
            }
            
            return transformedItem;
          } catch (error) {
            console.error(`❌ データ変換エラー (index: ${index}):`, error, item);
            throw error;
          }
        });
        
        setInventory(inventoryItems);
        setItems(data.data);
        
        // 統計データを計算（英語ステータスに基づく）
        const stats = {
          totalItems: inventoryItems.length,
          inbound: inventoryItems.filter((item: any) => item.status === 'inbound').length,
          inspection: inventoryItems.filter((item: any) => item.status === 'inspection').length,
          storage: inventoryItems.filter((item: any) => item.status === 'storage').length,
          listed: inventoryItems.filter((item: any) => item.status === 'listing').length,
          sold: inventoryItems.filter((item: any) => item.status === 'sold').length,
          maintenance: inventoryItems.filter((item: any) => item.status === 'maintenance').length,
          totalValue: inventoryItems.reduce((sum: number, item: any) => sum + (item.value || 0), 0),
        };
        setInventoryStats(stats);
        
        console.log(`✅ セラー在庫データ取得完了: ${inventoryItems.length}件`);
        console.log('🔍 セラー - ステータス別分布:', inventoryItems.reduce((acc: any, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {}));
        console.log('🔍 セラー - サンプルアイテム:', inventoryItems.slice(0, 3));
        
        // 🔍 デバッグ: ステータス別件数を詳しく確認
        const debugStatusCounts = {};
        inventoryItems.forEach(item => {
          debugStatusCounts[item.status] = (debugStatusCounts[item.status] || 0) + 1;
        });
        console.log('🔍 セラー画面 - 取得データのステータス別件数:', debugStatusCounts);
        
        // 🔍 デバッグ: 最初の10件のステータス確認
        console.log('🔍 セラー画面 - 最初の10件のステータス:');
        inventoryItems.slice(0, 10).forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.sku}: "${item.status}"`);
        });
      } catch (error) {
        console.error('❌ 在庫データ取得エラー:', error);
        console.error('エラーの詳細:', {
          message: error.message,
          stack: error.stack
        });
        
        showToast({
          title: 'データ取得エラー',
          message: '在庫データの取得に失敗しました',
          type: 'error'
        });
        
        // エラー時も空配列を設定してローディング状態を解除
        setInventory([]);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  // フィルタリング
  const filteredInventory = useMemo(() => {
    let filtered = inventory;

    // 🔍 デバッグ: フィルタリング開始
    console.log('🔍 セラー画面 - フィルタリング開始:', {
      totalItems: inventory.length,
      selectedStatus,
      selectedCategory,
      searchQuery
    });

    // ステータスフィルター（英語ステータスと日本語表示の両方をチェック）
    if (selectedStatus !== 'all') {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(item => {
        // データベースの英語ステータスとフィルター値を照合
        const match = item.status === selectedStatus;
        return match;
      });
      console.log(`🔍 ステータスフィルター "${selectedStatus}": ${beforeFilter}件 → ${filtered.length}件`);
      
      // デバッグ: アイテムのステータス確認
      if (filtered.length === 0 && beforeFilter > 0) {
        console.log('🔍 フィルター不一致デバッグ:', {
          selectedStatus,
          availableStatuses: [...new Set(inventory.map(item => item.status))],
          sampleItem: inventory[0]
        });
      }
    }

    // カテゴリーフィルター
    if (selectedCategory !== 'all') {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(item => item.category === selectedCategory);
      console.log(`🔍 カテゴリーフィルター "${selectedCategory}": ${beforeFilter}件 → ${filtered.length}件`);
    }

    // 検索フィルター
    if (searchQuery.trim()) {
      const beforeFilter = filtered.length;
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
      console.log(`🔍 検索フィルター "${searchQuery}": ${beforeFilter}件 → ${filtered.length}件`);
    }

    console.log('🔍 セラー画面 - フィルタリング結果:', filtered.length + '件');
    
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

  // ページネーション
  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedInventory.slice(startIndex, endIndex);
  }, [sortedInventory, currentPage, itemsPerPage]);

  // フィルター変更時はページを1に戻す
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedCategory, searchQuery]);

  // カテゴリー一覧を取得
  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(inventory.map(item => item.category)));
    return [
      { value: 'all', label: 'すべてのカテゴリー' },
      ...categories.map(category => ({ value: category, label: category }))
    ];
  }, [inventory]);

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

  const handleExportCsv = () => {
    // 在庫データをCSV形式で生成
    const csvData = [
      ['商品名', 'SKU', 'カテゴリ', 'ステータス', '保管場所', '価値', '認証'],
      ...filteredInventory.map(item => [
        item.name,
        item.sku,
        item.category,
        item.status,
        item.location,
        item.value.toLocaleString(),
        item.certifications.join('|')
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleProductRegistration = async (productData: any) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      
      if (response.ok) {
        const data = await response.json();
        showToast({
          title: '商品登録完了',
          message: `${productData.name}を登録しました`,
          type: 'success'
        });
        setIsNewItemModalOpen(false);
        // データを再取得
        const updatedResponse = await fetch('/api/inventory');
        const updatedData = await updatedResponse.json();
        setInventoryData(updatedData);
      } else {
        showToast({
          title: '登録エラー',
          message: '商品の登録に失敗しました',
          type: 'error'
        });
      }
    } catch (error) {
      showToast({
        title: 'エラー',
        message: '商品の登録中にエラーが発生しました',
        type: 'error'
      });
    }
  };

  const handleCsvImport = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/inventory/import', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        showToast({
          title: 'インポート完了',
          message: `${data.importedCount}件の商品を追加しました`,
          type: 'success'
        });
        // データを再取得
        const updatedResponse = await fetch('/api/inventory');
        const updatedData = await updatedResponse.json();
        setInventoryData(updatedData);
      } else {
        showToast({
          title: 'インポートエラー',
          message: 'CSVインポートに失敗しました',
          type: 'error'
        });
      }
    } catch (error) {
      showToast({
        title: 'エラー',
        message: 'CSVインポート中にエラーが発生しました',
        type: 'error'
      });
    }
  };

  const handleEditProduct = (productId: number) => {
    const product = inventory.find(item => item.id === productId);
    if (product) {
      setEditingProduct(product);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const product = inventory.find(item => item.id === productId);
    if (product) {
      setProductToDelete(product);
      setIsDeleteModalOpen(true);
    }
  };

  const handleViewProduct = (productId: number) => {
    const product = inventory.find(item => item.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsDetailModalOpen(true);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/inventory?id=${productToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        showToast({
          title: '商品削除完了',
          message: '商品を削除しました',
          type: 'success'
        });
        
        // データを再取得
        const updatedResponse = await fetch('/api/inventory');
        const updatedData = await updatedResponse.json();
        setInventoryData(updatedData);
        
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      } else {
        showToast({
          title: '削除エラー',
          message: '商品の削除に失敗しました',
          type: 'error'
        });
      }
    } catch (error) {
      showToast({
        title: 'エラー',
        message: '商品削除中にエラーが発生しました',
        type: 'error'
      });
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          ...productData
        }),
      });
      
      if (response.ok) {
        showToast({
          title: '商品更新完了',
          message: '商品情報を更新しました',
          type: 'success'
        });
        
        setIsEditModalOpen(false);
        setEditingProduct(null);
        
        // データを再取得
        const updatedResponse = await fetch('/api/inventory');
        const updatedData = await updatedResponse.json();
        setInventoryData(updatedData);
      } else {
        showToast({
          title: '更新エラー',
          message: '商品情報の更新に失敗しました',
          type: 'error'
        });
      }
    } catch (error) {
      showToast({
        title: 'エラー',
        message: '商品更新中にエラーが発生しました',
        type: 'error'
      });
    }
  };

  // 出品開始ハンドラー
  const handleStartListing = (product: any) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(false);
    setIsListingModalOpen(true);
  };

  // 出品成功ハンドラー
  const handleListingSuccess = async (listing: any) => {
    showToast({
      title: '出品完了',
      message: `${selectedProduct?.name}の出品が完了しました`,
      type: 'success'
    });
    setIsListingModalOpen(false);
    
    // データを再取得して最新状態を反映
    const updatedResponse = await fetch('/api/inventory');
    if (updatedResponse.ok) {
      const updatedData = await updatedResponse.json();
      const inventoryItems = updatedData.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        status: item.status,
        location: item.location || '未設定',
        value: item.price || 0,
        certifications: ['AUTHENTIC'],
      }));
      setInventory(inventoryItems);
      setItems(updatedData.data);
    }
  };

  // ステータス変換（APIは既に英語ステータスを返すので、そのまま返す）
  const convertStatusToKey = (status: string) => {
    // データベースには既に英語ステータスが保存されているので、そのまま返す
    const validStatuses = ['inbound', 'inspection', 'storage', 'listing', 'ordered', 'shipping', 'sold', 'returned', 'maintenance'];
    
    // 英語ステータスの場合はそのまま返す
    if (validStatuses.includes(status)) {
      return status;
    }
    
    // 念のため日本語ステータスの変換も残す（後方互換性）
    switch (status) {
      case '入荷待ち': return 'inbound';
      case '検品中': return 'inspection';
      case '保管中': return 'storage';
      case '出品中': return 'listing';
      case '受注済み': return 'ordered';
      case '出荷中': return 'shipping';
      case '売約済み': return 'sold';
      case '返品': return 'returned';
      case 'メンテナンス': return 'maintenance';
      default: return status; // 不明な場合はそのまま返す
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '入庫': return 'text-blue-600 bg-blue-100';
      case '検品': return 'text-orange-600 bg-orange-100';
      case '保管': return 'text-blue-600 bg-blue-100';
      case '出品': return 'text-green-600 bg-green-100';
      case '売約済み': return 'text-gray-600 bg-gray-100';
      case 'メンテナンス': return 'text-red-600 bg-red-100';
      // 旧形式との互換性
      case '出品中': return 'text-green-600 bg-green-100';
      case '検品中': return 'text-orange-600 bg-orange-100';
      case '保管中': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const headerActions = (
    <>
      <NexusButton 
        onClick={() => setIsNewItemModalOpen(true)}
        variant="primary"
        size="sm"
        icon={<PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
      >
        <span className="hidden sm:inline">新規商品登録</span>
      </NexusButton>
      <NexusButton
        onClick={() => setIsCsvImportModalOpen(true)}
        size="sm"
        icon={<ArrowUpTrayIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
      >
        <span className="hidden sm:inline">CSVインポート</span>
      </NexusButton>
      <NexusButton
        onClick={handleExportCsv}
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

        {/* フィルター */}
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
                { value: 'returned', label: '返品' },
                { value: 'maintenance', label: 'メンテナンス' }
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

        {/* Product Registration Modal */}
        <ProductRegistrationModal
          isOpen={isNewItemModalOpen}
          onClose={() => setIsNewItemModalOpen(false)}
          onSubmit={handleProductRegistration}
        />

        {/* CSV Import Modal */}
        <BaseModal
          isOpen={isCsvImportModalOpen}
          onClose={() => setIsCsvImportModalOpen(false)}
          title="CSVインポート"
          size="md"
        >
          <div>
            <div className="mb-4">
              <NexusInput
                type="file"
                accept=".csv"
                label="CSVファイルを選択"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleCsvImport(file);
                    setIsCsvImportModalOpen(false);
                  }
                }}
              />
            </div>
            <div className="text-right mt-6">
              <NexusButton onClick={() => setIsCsvImportModalOpen(false)}>
                キャンセル
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* Product Edit Modal */}
        {editingProduct && (
          <ProductRegistrationModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingProduct(null);
            }}
            onSubmit={handleUpdateProduct}
            initialData={editingProduct}
          />
        )}

        {/* Product Detail Modal */}
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
                      <span className="font-medium text-nexus-text-secondary">保管場所</span>
                      <span className="font-mono text-nexus-text-primary">{selectedProduct.location}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">評価額</span>
                      <span className="font-bold text-green-600 text-lg">¥{selectedProduct.value.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-nexus-text-primary mb-2">認証情報</h4>
                <div className="flex gap-2 flex-wrap">
                  {selectedProduct.certifications.map((cert: string) => (
                    <span key={cert} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* セラー向けアクションボタン - 保管中のみ出品ボタンを表示 */}
              {selectedProduct.status === '保管' && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-end">
                    <NexusButton
                      onClick={() => handleStartListing(selectedProduct)}
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

        {/* Stats Overview - ダッシュボードと統一 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                総計
              </span>
            </div>
            <div className="text-3xl font-bold text-nexus-text-primary mb-2">
              {filteredInventory.length}
                </div>
            <div className="text-nexus-text-secondary font-medium">
              {filteredInventory.length === inventory.length ? '総在庫数' : `絞り込み結果 (全${inventory.length}件)`}
                </div>
                </div>

          <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                活動中
              </span>
            </div>
            <div className="text-3xl font-bold text-nexus-text-primary mb-2">
              {filteredInventory.filter(item => item.status === '出品中').length}
            </div>
            <div className="text-nexus-text-secondary font-medium">
              出品中
              </div>
            </div>

          <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                処理中
              </span>
                </div>
            <div className="text-3xl font-bold text-nexus-text-primary mb-2">
                  {filteredInventory.filter(item => item.status === '検品中').length}
                </div>
            <div className="text-nexus-text-secondary font-medium">
                  検品中
                </div>
          </div>

          <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                総資産
              </span>
            </div>
            <div className="text-3xl font-bold text-nexus-text-primary mb-2">
              ¥{(filteredInventory.reduce((sum, item) => sum + item.value, 0) / 10000).toLocaleString()}万
                  </div>
            <div className="text-nexus-text-secondary font-medium">
                  総評価額
            </div>
          </div>
        </div>

        {/* Inventory Table - シンプル化 */}
        <div className="bg-white rounded-xl border border-nexus-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-nexus-text-primary">在庫リスト</h3>
              <p className="text-nexus-text-secondary mt-1 text-sm">
                {filteredInventory.length}件中 {Math.min(itemsPerPage, filteredInventory.length - (currentPage - 1) * itemsPerPage)}件を表示
              </p>
            </div>
          </div>
            
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
                      onClick={() => handleSort('value')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        評価額
                        {getSortIcon('value')}
                      </div>
                    </th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInventory.map((item: any) => (
                    <tr key={item.id} className="border-b border-nexus-border hover:bg-nexus-bg-tertiary">
                      <td className="p-4">
                        <div>
                          <span className="font-medium text-nexus-text-primary">{item.name}</span>
                          <p className="text-sm text-nexus-text-secondary">{item.category}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm text-nexus-text-primary">{item.sku}</span>
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
                      <span className="font-bold text-nexus-text-primary">¥{item.value.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <NexusButton
                          onClick={() => handleViewProduct(item.id)}
                          size="sm"
                          variant="default"
                          icon={<EyeIcon className="w-4 h-4" />}
                        >
                          詳細
                        </NexusButton>
                          <NexusButton
                            onClick={() => handleEditProduct(item.id)}
                            size="sm"
                            variant="secondary"
                          >
                            編集
                          </NexusButton>
                          <NexusButton
                            onClick={() => handleDeleteProduct(item.id)}
                            size="sm"
                            variant="secondary"
                          className="text-red-600 hover:text-red-700"
                          >
                            削除
                          </NexusButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedInventory.length === 0 && (
                    <tr>
                    <td colSpan={5} className="p-8 text-center text-nexus-text-secondary">
                        {filteredInventory.length === 0 ? 
                          (searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all'
                            ? '検索条件に一致する在庫がありません' 
                            : '在庫データがありません'
                          ) : '表示するデータがありません'
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
          </div>

          {/* ページネーション */}
          {filteredInventory.length > 0 && (
            <div className="mt-6 pt-4 border-t border-nexus-border">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredInventory.length / itemsPerPage)}
                totalItems={filteredInventory.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <BaseModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
          }}
          title="商品削除の確認"
          size="md"
        >
          <div>
            <p className="text-nexus-text-primary mb-4">
              「{productToDelete?.name}」を削除しますか？
            </p>
            <p className="text-nexus-text-secondary text-sm mb-6">
              この操作は元に戻せません。
            </p>
            <div className="flex justify-end gap-3">
              <NexusButton
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                variant="default"
              >
                キャンセル
              </NexusButton>
              <NexusButton
                onClick={confirmDeleteProduct}
                variant="danger"
              >
                削除する
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* Listing Form Modal */}
        <ListingFormModal
          isOpen={isListingModalOpen}
          onClose={() => setIsListingModalOpen(false)}
          product={selectedProduct ? {
            id: selectedProduct.id,
            name: selectedProduct.name,
            sku: selectedProduct.sku,
            category: selectedProduct.category,
            price: selectedProduct.value,
            condition: '良品',
            description: selectedProduct.notes || selectedProduct.name,
            imageUrl: selectedProduct.imageUrl
          } : null}
          onSuccess={handleListingSuccess}
        />
      </div>
    </DashboardLayout>
  );
} 