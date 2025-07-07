'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import { useState, useEffect } from 'react';
import {
  ArchiveBoxIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import ProductRegistrationModal from '../components/modals/ProductRegistrationModal';
import { ContentCard, NexusInput, NexusButton, NexusLoadingSpinner } from '@/app/components/ui';
import BaseModal from '../components/ui/BaseModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [inventoryStats] = useState({
    totalItems: 156,
    listed: 89,
    inspection: 45,
    storage: 22,
    totalValue: 45600000,
  });

  const [inventory] = useState([
    { id: 1, name: 'Canon EOS R5', sku: 'TWD-20240115-001', category: 'カメラ本体', status: '出品中', location: 'A-01-03', value: 450000, certifications: ['MINT', 'AUTHENTIC'] },
    { id: 2, name: 'Sony FE 24-70mm f/2.8 GM', sku: 'TWD-20240115-002', category: 'レンズ', status: '検品中', location: 'B-02-05', value: 280000, certifications: ['PREMIUM'] },
    { id: 3, name: 'Rolex Submariner', sku: 'TWD-20240115-003', category: '時計', status: '保管中', location: 'C-01-01', value: 1200000, certifications: ['CERTIFIED', 'LUXURY', 'RARE'] },
  ]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState(false);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  useEffect(() => {
    fetch('/api/inventory')
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items);
        setLoading(false);
      });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-8">
        {/* Page Header - Intelligence Card Style */}
        <div className="intelligence-card europe">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-nexus-text-primary mb-2">在庫管理</h1>
                <h2 className="text-base sm:text-xl font-bold text-nexus-text-primary flex items-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                  </svg>
                  商品在庫ビュー
                </h2>
                <p className="text-nexus-text-secondary">
                  商品在庫の状況を確認・管理できます
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
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
              </div>
            </div>
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

        {/* Stats Overview - Intelligence Metrics Style */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="intelligence-card europe">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb blue w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                  </div>
                  <span className="status-badge info text-[10px] sm:text-xs">{inventoryStats.totalItems}点</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {inventoryStats.totalItems}
                  <span className="text-sm sm:text-lg font-normal text-nexus-text-secondary ml-1">点</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  総在庫数
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb green w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="status-badge success text-[10px] sm:text-xs">出品中</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {inventoryStats.listed}
                  <span className="text-sm sm:text-lg font-normal text-nexus-text-secondary ml-1">点</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  出品中
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </div>
                  <span className="status-badge warning text-[10px] sm:text-xs">検品中</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {inventoryStats.inspection}
                  <span className="text-sm sm:text-lg font-normal text-nexus-text-secondary ml-1">点</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  検品中
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb red w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-nexus-green">総資産</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  ¥{(inventoryStats.totalValue / 10000).toLocaleString()}
                  <span className="text-sm sm:text-lg font-normal text-nexus-text-secondary ml-1">万</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  総評価額
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table - Holo Table Style */}
        <div className="intelligence-card europe">
          <div className="p-8">
            <div className="mb-3 sm:mb-6">
              <h3 className="text-lg sm:text-2xl font-display font-bold text-nexus-text-primary">在庫リスト</h3>
              <p className="text-nexus-text-secondary mt-1 text-xs sm:text-sm">現在の在庫状況</p>
            </div>
            
            <div className="holo-table">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-nexus-border">
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">商品名</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">SKU</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">カテゴリー</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">ステータス</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">保管場所</th>
                    <th className="text-right p-4 font-medium text-nexus-text-secondary">評価額</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">認証</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item: any) => (
                    <tr key={item.id} className="border-b border-nexus-border hover:bg-nexus-bg-tertiary">
                      <td className="p-4">
                        <span className="font-medium text-nexus-text-primary text-xs sm:text-sm">{item.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-nexus-text-primary text-xs sm:text-sm">{item.sku}</span>
                      </td>
                      <td className="p-4 text-xs sm:text-sm">{item.category}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <div className={`status-orb status-${item.status === '出品中' ? 'optimal' : 'monitoring'} w-2 h-2`} />
                          <span className={`status-badge ${item.status === '出品中' ? 'success' : 'warning'} text-[10px] sm:text-xs`}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs sm:text-sm">{item.location}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-display font-bold text-xs sm:text-sm">¥{item.value.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-1 flex-wrap">
                          {item.certifications.map((cert: string) => (
                            <span key={cert} className={`cert-nano cert-${cert.toLowerCase()} text-[8px] sm:text-[10px]`}>
                              {cert}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-1">
                          <NexusButton
                            onClick={() => handleEditProduct(item.id)}
                            size="sm"
                            variant="secondary"
                            className="text-xs"
                          >
                            編集
                          </NexusButton>
                          <NexusButton
                            onClick={() => handleDeleteProduct(item.id)}
                            size="sm"
                            variant="secondary"
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            削除
                          </NexusButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-nexus-text-secondary">
                        在庫データがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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