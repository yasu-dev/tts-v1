'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import QRCodeModal from '../../components/QRCodeModal';
import ItemDetailModal from '../../components/ItemDetailModal';
import ProductEditModal from '../../components/ProductEditModal';
import ProductMoveModal from '../../components/ProductMoveModal';
import BarcodeScanner from '../../components/features/BarcodeScanner';
import { useState, useEffect } from 'react';
import {
  PencilIcon,
  ArrowsRightLeftIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { ContentCard, BusinessStatusIndicator, Pagination, NexusLoadingSpinner } from '@/app/components/ui';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusSelect from '@/app/components/ui/NexusSelect';
import NexusInput from '@/app/components/ui/NexusInput';
import BaseModal from '@/app/components/ui/BaseModal';
import BarcodePrintButton from '@/app/components/features/BarcodePrintButton';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: 'inbound' | 'inspection' | 'storage' | 'listing' | 'sold' | 'maintenance';
  location: string;
  price: number;
  condition: string;
  imageUrl?: string;
  entryDate: string;
  assignedStaff?: string;
  lastModified: string;
  qrCode?: string;
  notes?: string;
  quantity: number;
  lastChecked: string;
  value?: number;
  images?: string[];
}

export default function StaffInventoryPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  
  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paginatedItems, setPaginatedItems] = useState<InventoryItem[]>([]);

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
        const inventoryItems: InventoryItem[] = data.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          status: item.status.replace('入庫', 'inbound')
                             .replace('検品', 'inspection')
                             .replace('保管', 'storage')
                             .replace('出品', 'listing')
                             .replace('売約済み', 'sold')
                             .replace('返品', 'returned'),
          location: item.location || '未設定',
          price: item.price || 0,
          condition: item.condition || '良品',
          entryDate: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : '2024-01-01',
          assignedStaff: '山本 達也', // 統一されたスタッフ名
          lastModified: item.updatedAt || new Date().toISOString(),
          qrCode: `QR-${item.sku}`,
          notes: item.description || '',
          quantity: 1,
          lastChecked: item.updatedAt || new Date().toISOString(),
        }));
        
        setItems(inventoryItems);
        setFilteredItems(inventoryItems);
        console.log(`✅ 在庫データ取得完了: ${inventoryItems.length}件`);
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

  // フィルタリング
  useEffect(() => {
    let filtered = items;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(item => item.location.includes(selectedLocation));
    }
    if (selectedStaff !== 'all') {
      filtered = filtered.filter(item => item.assignedStaff === selectedStaff);
    }
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.qrCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
    setCurrentPage(1); // フィルタ変更時はページを1に戻す
  }, [items, selectedStatus, selectedCategory, selectedLocation, selectedStaff, searchQuery]);

  // ページネーション
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedItems(filteredItems.slice(startIndex, endIndex));
  }, [filteredItems, currentPage, itemsPerPage]);

  const updateItemStatus = (itemId: string, newStatus: InventoryItem['status']) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, status: newStatus, lastModified: new Date().toISOString() }
        : item
    ));
  };

  const updateItemLocation = (itemId: string, newLocation: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, location: newLocation, lastModified: new Date().toISOString() }
        : item
    ));
  };

  const handleEditSave = (updatedItem: InventoryItem) => {
    setItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    showToast({
      title: '商品更新完了',
      message: `${updatedItem.name} の情報を更新しました`,
      type: 'success'
    });
  };

  const handleMove = (itemId: string, newLocation: string, reason: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, location: newLocation, lastModified: new Date().toISOString() }
        : item
    ));
    showToast({
      title: '商品移動完了',
      message: `商品を${newLocation}に移動しました`,
      type: 'success'
    });
  };

  const handleBarcodeScanned = (barcode: string, productData?: any) => {
    if (productData) {
      // APIから商品データが取得できた場合
      const foundItem = items.find(item => item.sku === productData.sku);
      if (foundItem) {
        setSelectedItem(foundItem);
        setIsDetailModalOpen(true);
        setIsBarcodeScannerOpen(false);
        showToast({
          title: '商品発見',
          message: `${foundItem.name} の詳細を表示しています`,
          type: 'success'
        });
      } else {
        // APIから取得した商品データをInventoryItem形式に変換
        const convertedItem: InventoryItem = {
          id: productData.id,
          name: productData.name,
          sku: productData.sku,
          category: productData.category,
          status: productData.status as any,
          location: productData.location,
          price: productData.price,
          condition: productData.condition,
          entryDate: productData.createdAt,
          lastModified: productData.updatedAt,
          qrCode: productData.qrCode,
          notes: productData.description,
          quantity: 1,
          lastChecked: productData.updatedAt,
          imageUrl: productData.imageUrl,
          assignedStaff: '山本 達也'
        };
        setSelectedItem(convertedItem);
        setIsDetailModalOpen(true);
        setIsBarcodeScannerOpen(false);
        showToast({
          title: '商品発見',
          message: `${convertedItem.name} の詳細を表示しています`,
          type: 'success'
        });
      }
    } else {
      // APIから商品データが取得できない場合、手動検索
      const foundItem = items.find(item => 
        item.sku === barcode || item.qrCode === barcode
      );
      if (foundItem) {
        setSelectedItem(foundItem);
        setIsDetailModalOpen(true);
        setIsBarcodeScannerOpen(false);
        showToast({
          title: '商品発見',
          message: `${foundItem.name} の詳細を表示しています`,
          type: 'success'
        });
      } else {
        showToast({
          title: '商品が見つかりません',
          message: `バーコード: ${barcode} に対応する商品が見つかりません`,
          type: 'warning'
        });
      }
    }
  };

  const handleQRCode = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsQRModalOpen(true);
  };

  const handleExportCsv = () => {
    const csvContent = [
      ['ID', '商品名', 'SKU', 'ロケーション', '数量', 'ステータス', '担当者'],
      ...items.map(item => [
        item.id,
        item.name,
        item.sku,
        item.location,
        item.quantity,
        item.status,
        item.assignedStaff || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      title: 'エクスポート完了',
      message: 'CSVファイルをダウンロードしました',
      type: 'success'
    });
  };

  const headerActions = (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-lg">
      <NexusButton
        onClick={() => setIsBarcodeScannerOpen(true)}
        variant="primary"
        icon={<QrCodeIcon className="w-5 h-5" />}
        size="sm"
      >
        バーコードスキャン
      </NexusButton>
      <NexusButton
        onClick={() => setIsEditModalOpen(true)}
        disabled={selectedItems.length === 0}
        icon={<PencilIcon className="w-5 h-5" />}
        size="sm"
      >
        商品詳細を編集
      </NexusButton>
      <NexusButton
        onClick={() => setIsMoveModalOpen(true)}
        disabled={selectedItems.length === 0}
        icon={<ArrowsRightLeftIcon className="w-5 h-5" />}
        size="sm"
      >
        ロケーション移動
      </NexusButton>
      <BarcodePrintButton
        productIds={selectedItems}
        variant="secondary"
        size="sm"
      />
      <NexusButton
        onClick={handleExportCsv}
        variant="primary"
        icon={<ArrowDownTrayIcon className="w-5 h-5" />}
        size="sm"
        className="col-span-2 lg:col-span-1"
      >
        CSVエクスポート
      </NexusButton>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="スタッフ在庫管理"
          subtitle="全セラーの商品を管理・操作"
          userType="staff"
          iconType="inventory"
          actions={headerActions}
        />

        {/* Filters */}
        <div className="intelligence-card global">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <NexusSelect
                  label="ステータス"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  options={[
                    { value: 'all', label: 'すべてのステータス' },
                    { value: 'inbound', label: '入庫待ち' },
                    { value: 'inspection', label: '検品中' },
                    { value: 'storage', label: '保管中' },
                    { value: 'listing', label: '出品中' },
                    { value: 'sold', label: '売約済み' },
                    { value: 'maintenance', label: 'メンテナンス' }
                  ]}
                />
              </div>

              <div>
                <NexusSelect
                  label="カテゴリー"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={[
                    { value: 'all', label: 'すべて' },
                    { value: 'カメラ本体', label: 'カメラ本体' },
                    { value: 'レンズ', label: 'レンズ' },
                    { value: '腕時計', label: '腕時計' },
                    { value: 'アクセサリ', label: 'アクセサリ' }
                  ]}
                />
              </div>

              <div>
                <NexusSelect
                  label="保管場所"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  options={[
                    { value: 'all', label: 'すべて' },
                    { value: 'A区画', label: 'A区画' },
                    { value: 'H区画', label: 'H区画' },
                    { value: 'V区画', label: 'V区画' },
                    { value: 'メンテナンス室', label: 'メンテナンス室' }
                  ]}
                />
              </div>

              <div>
                <NexusSelect
                  label="担当者"
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  options={[
                    { value: 'all', label: 'すべて' },
                    { value: '山本 達也', label: '山本 達也' }
                  ]}
                />
              </div>

              <div>
                <NexusInput
                  type="text"
                  label="検索"
                  placeholder="商品名・SKU・QR検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content - Table View */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="holo-table">
              <table className="w-full">
                              <thead className="holo-header">
                  <tr>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">商品</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">ステータス</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">保管場所</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">担当者</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">最終更新</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">操作</th>
                  </tr>
                </thead>
                              <tbody className="holo-body">
                  {paginatedItems.map((item) => (
                    <tr key={item.id}>
                      <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-nexus-bg-secondary flex items-center justify-center mr-3">
                          {item.category === 'カメラ本体' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          ) : item.category === 'レンズ' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12a3 3 0 106 0 3 3 0 00-6 0z" />
                            </svg>
                          ) : item.category === '腕時計' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-nexus-text-primary">
                            {item.name}
                          </div>
                          <div className="text-sm text-nexus-text-secondary">
                            {item.sku} | {item.qrCode}
                          </div>
                        </div>
                      </div>
                                          </td>
                      <td className="p-4">
                        <BusinessStatusIndicator status={item.status} size="sm" />
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-nexus-text-primary">{item.location}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-nexus-text-primary">{item.assignedStaff}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-nexus-text-secondary">
                          {new Date(item.lastModified).toLocaleDateString('ja-JP')}
                        </span>
                      </td>
                      <td className="text-center p-4">
                      <NexusButton 
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDetailModalOpen(true);
                        }}
                        size="sm"
                        variant="primary"
                      >
                        詳細
                      </NexusButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* ページネーション */}
            {filteredItems.length > 0 && (
              <div className="mt-6 pt-4 border-t border-nexus-border">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredItems.length / itemsPerPage)}
                  totalItems={filteredItems.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            )}
            </div>
          </div>
        </div>

        {filteredItems.length === 0 && (
          <div className="intelligence-card global">
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-nexus-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-nexus-text-primary">商品が見つかりません</h3>
              <p className="mt-1 text-sm text-nexus-text-secondary">
                フィルター条件を変更するか、新しい商品を登録してください。
              </p>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          itemId={selectedItem?.id || ''}
          itemName={selectedItem?.name || ''}
          itemSku={selectedItem?.sku || ''}
        />

        {/* Item Detail Modal */}
        <ItemDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          item={selectedItem}
          onEdit={(item) => {
            setIsDetailModalOpen(false);
            setIsEditModalOpen(true);
          }}
          onMove={(item) => {
            setIsDetailModalOpen(false);
            setIsMoveModalOpen(true);
          }}
          onGenerateQR={(item) => {
            setIsDetailModalOpen(false);
            setIsQRModalOpen(true);
          }}
          onStartInspection={(item) => {
            setIsDetailModalOpen(false);
            // 検品画面に遷移
            window.location.href = `/staff/inspection/${item.id}`;
          }}
        />

        {/* Product Edit Modal */}
        <ProductEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          item={selectedItem}
          onSave={handleEditSave}
        />

        {/* Product Move Modal */}
        <ProductMoveModal
          isOpen={isMoveModalOpen}
          onClose={() => setIsMoveModalOpen(false)}
          item={selectedItem}
          onMove={handleMove}
        />

        {/* Barcode Scanner Modal */}
        {isBarcodeScannerOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[9000] p-4 pt-8">
            <div className="intelligence-card global max-w-2xl w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-nexus-text-primary">バーコードスキャン</h3>
                  <NexusButton
                    onClick={() => setIsBarcodeScannerOpen(false)}
                    variant="default"
                    size="sm"
                    icon={<XMarkIcon className="w-4 h-4" />}
                  >
                    閉じる
                  </NexusButton>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-nexus-text-secondary">
                    商品のバーコードをスキャンすると、自動的に商品詳細が表示されます。
                  </p>
                </div>
                <BarcodeScanner
                  onScan={handleBarcodeScanned}
                  placeholder="商品バーコードをスキャンしてください"
                  scanType="product"
                  enableDatabaseLookup={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}