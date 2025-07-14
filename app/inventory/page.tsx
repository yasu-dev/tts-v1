'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import UnifiedPageHeader from '../components/ui/UnifiedPageHeader';
import { useState, useEffect } from 'react';
import {
  ArchiveBoxIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import ProductRegistrationModal from '../components/modals/ProductRegistrationModal';
import { ContentCard, NexusInput, NexusButton, NexusLoadingSpinner } from '@/app/components/ui';
import BaseModal from '../components/ui/BaseModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [inventoryStats, setInventoryStats] = useState({
    totalItems: 0,
    listed: 0,
    inspection: 0,
    storage: 0,
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
        
        // APIレスポンスの形式に合わせてデータを変換
        const inventoryItems = data.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          status: item.status,
          location: item.location || '未設定',
          value: item.price || 0,
          certifications: ['AUTHENTIC'], // デフォルト認証
        }));
        
        setInventory(inventoryItems);
        setItems(data.data);
        
        // 統計データを計算
        const stats = {
          totalItems: inventoryItems.length,
          listed: inventoryItems.filter((item: any) => item.status === '出品中').length,
          inspection: inventoryItems.filter((item: any) => item.status === '検品中').length,
          storage: inventoryItems.filter((item: any) => item.status === '保管中').length,
          totalValue: inventoryItems.reduce((sum: number, item: any) => sum + (item.value || 0), 0),
        };
        setInventoryStats(stats);
        
        console.log(`✅ セラー在庫データ取得完了: ${inventoryItems.length}件`);
      } catch (error) {
        console.error('在庫データ取得エラー:', error);
        showToast({
          title: 'データ取得エラー',
          message: '在庫データの取得に失敗しました',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  const handleExportCsv = () => {
    // 在庫データをCSV形式で生成
    const csvData = [
      ['商品名', 'SKU', 'カテゴリ', 'ステータス', '保管場所', '価値', '認証'],
      ...inventory.map(item => [
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

  const getStatusColor = (status: string) => {
    switch (status) {
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
          subtitle="商品在庫の状況を確認・管理できます"
          userType="seller"
          iconType="inventory"
          actions={headerActions}
        />

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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProduct.status)}`}>
                        {selectedProduct.status}
                      </span>
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
              {inventoryStats.totalItems}
                </div>
            <div className="text-nexus-text-secondary font-medium">
              総在庫数
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
              {inventoryStats.listed}
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
                  {inventoryStats.inspection}
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
              ¥{(inventoryStats.totalValue / 10000).toLocaleString()}万
                  </div>
            <div className="text-nexus-text-secondary font-medium">
                  総評価額
            </div>
          </div>
        </div>

        {/* Inventory Table - シンプル化 */}
        <div className="bg-white rounded-xl border border-nexus-border p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-nexus-text-primary">在庫リスト</h3>
            <p className="text-nexus-text-secondary mt-1 text-sm">現在の在庫状況</p>
            </div>
            
          <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-nexus-border">
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">商品名</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">ステータス</th>
                    <th className="text-right p-4 font-medium text-nexus-text-secondary">評価額</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item: any) => (
                    <tr key={item.id} className="border-b border-nexus-border hover:bg-nexus-bg-tertiary">
                      <td className="p-4">
                      <span className="font-medium text-nexus-text-primary">{item.name}</span>
                      </td>
                      <td className="p-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
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
                  {inventory.length === 0 && (
                    <tr>
                    <td colSpan={4} className="p-8 text-center text-nexus-text-secondary">
                        在庫データがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
          </div>
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
      </div>
    </DashboardLayout>
  );
} 