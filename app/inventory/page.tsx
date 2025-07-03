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
import { ContentCard } from '@/app/components/ui';
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

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-8">
        {/* Page Header - Intelligence Card Style */}
        <div className="intelligence-card europe">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-nexus-text-primary mb-2">在庫管理</h1>
                <h2 className="text-base sm:text-xl font-bold text-nexus-text-primary flex items-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                  </svg>
                  商品在庫ビュー
                </h2>
                <p className="text-nexus-text-secondary mt-1 text-xs sm:text-sm">
                  商品在庫の状況を確認・管理できます
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => setIsNewItemModalOpen(true)}
                  className="nexus-button primary text-xs sm:text-sm"
                >
                  <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">新規商品登録</span>
                </button>
                <button
                  onClick={() => setIsCsvImportModalOpen(true)}
                  className="nexus-button text-xs sm:text-sm"
                >
                  <ArrowUpTrayIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">CSVインポート</span>
                </button>
                <button
                  onClick={handleExportCsv}
                  className="nexus-button text-xs sm:text-sm"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">CSVエクスポート</span>
                </button>
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
        {isCsvImportModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
              <h2 className="text-lg font-bold mb-4">CSVインポート</h2>
              <div className="mb-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleCsvImport(file);
                      setIsCsvImportModalOpen(false);
                    }
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="text-right mt-6">
                <button onClick={() => setIsCsvImportModalOpen(false)} className="nexus-button">キャンセル</button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview - Intelligence Metrics Style */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="intelligence-card europe">
              <div className="p-3 sm:p-4 md:p-6">
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
              <div className="p-3 sm:p-4 md:p-6">
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
              <div className="p-3 sm:p-4 md:p-6">
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
              <div className="p-3 sm:p-4 md:p-6">
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
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="mb-3 sm:mb-6">
              <h3 className="text-lg sm:text-2xl font-display font-bold text-nexus-text-primary">在庫リスト</h3>
              <p className="text-nexus-text-secondary mt-1 text-xs sm:text-sm">現在の在庫状況</p>
            </div>
            
            <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
              <div className="holo-table min-w-[700px] px-3 sm:px-4 md:px-6 lg:px-8">
                <table className="w-full">
                  <thead className="holo-header">
                    <tr>
                      <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm">商品名</th>
                      <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm">SKU</th>
                      <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm">カテゴリー</th>
                      <th className="text-center py-2 px-1 sm:px-2 text-xs sm:text-sm">ステータス</th>
                      <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm">保管場所</th>
                      <th className="text-right py-2 px-1 sm:px-2 text-xs sm:text-sm">評価額</th>
                      <th className="text-center py-2 px-1 sm:px-2 text-xs sm:text-sm">認証</th>
                    </tr>
                  </thead>
                  <tbody className="holo-body">
                    {inventory.map((item) => (
                      <tr key={item.id} className="holo-row">
                        <td className="font-medium text-nexus-text-primary py-2 px-1 sm:px-2 text-xs sm:text-sm">{item.name}</td>
                        <td className="font-mono text-nexus-text-primary py-2 px-1 sm:px-2 text-xs sm:text-sm">{item.sku}</td>
                        <td className="py-2 px-1 sm:px-2 text-xs sm:text-sm">{item.category}</td>
                        <td className="text-center py-2 px-1 sm:px-2">
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            <div className={`status-orb status-${item.status === '出品中' ? 'optimal' : 'monitoring'} w-2 h-2`} />
                            <span className={`status-badge ${item.status === '出品中' ? 'success' : 'warning'} text-[10px] sm:text-xs`}>
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td className="font-mono py-2 px-1 sm:px-2 text-xs sm:text-sm">{item.location}</td>
                        <td className="text-right font-display font-bold py-2 px-1 sm:px-2 text-xs sm:text-sm">¥{item.value.toLocaleString()}</td>
                        <td className="text-center py-2 px-1 sm:px-2">
                          <div className="flex justify-center gap-1 flex-wrap">
                            {item.certifications.map(cert => (
                              <span key={cert} className={`cert-nano cert-${cert.toLowerCase()} text-[8px] sm:text-[10px]`}>
                                {cert}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 