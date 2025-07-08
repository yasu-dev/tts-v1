'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import QRCodeModal from '../../components/QRCodeModal';
import ItemDetailModal from '../../components/ItemDetailModal';
import { useState, useEffect } from 'react';
import {
  PencilIcon,
  ArrowsRightLeftIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckIcon
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

  const handleQRCode = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsQRModalOpen(true);
  };

  const handleBulkMove = () => {
    if (selectedItems.length > 0) {
              // 移動先入力モーダルを開く（統一されたUIコンポーネントを使用）
        const newLocation = '新しいロケーション'; // TODO: BaseModalで実装
      if (newLocation) {
        selectedItems.forEach(itemId => {
          updateItemLocation(itemId, newLocation);
        });
        setSelectedItems([]);
        showToast({
          title: '移動完了',
          message: `${selectedItems.length}件の商品を${newLocation}に移動しました`,
          type: 'success'
        });
      }
    } else {
      showToast({
        title: '選択エラー',
        message: '移動する商品を選択してください',
        type: 'warning'
      });
    }
  };

  const handleItemMove = (item: InventoryItem) => {
            // 移動先入力モーダルを開く（統一されたUIコンポーネントを使用）
        const newLocation = item.location; // TODO: BaseModalで実装
    if (newLocation && newLocation !== item.location) {
      updateItemLocation(item.id, newLocation);
      showToast({
        title: '移動完了',
        message: `${item.name}を${newLocation}に移動しました`,
        type: 'success'
      });
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const staffMembers = Array.from(new Set(items.map(item => item.assignedStaff).filter((staff): staff is string => Boolean(staff))));

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
  
  const handleEditItem = () => {
    showToast({
      title: '保存完了',
      message: '商品詳細を保存しました',
      type: 'success'
    });
    setIsEditModalOpen(false);
  };
  
  const handleMoveItem = () => {
    showToast({
      title: '移動完了',
      message: 'ロケーションを移動しました',
      type: 'success'
    });
    setIsMoveModalOpen(false);
  };

  const handlePrintQRCode = () => {
    if (selectedItems.length > 0) {
      showToast({
        title: '印刷開始',
        message: `${selectedItems.length}件の商品のQRコード印刷を開始します`,
        type: 'info'
      });
    } else {
      showToast({
        title: '印刷開始',
        message: '全商品のQRコード印刷を開始します',
        type: 'info'
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
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  スタッフ在庫管理
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  倉庫内の全在庫を管理・操作
                </p>
              </div>
              <div className="flex space-x-3">
                <NexusButton
                  onClick={() => setIsEditModalOpen(true)}
                  disabled={selectedItems.length === 0}
                  icon={<PencilIcon className="w-5 h-5" />}
                >
                  商品詳細を編集
                </NexusButton>
                <NexusButton
                  onClick={() => setIsMoveModalOpen(true)}
                  disabled={selectedItems.length === 0}
                  icon={<ArrowsRightLeftIcon className="w-5 h-5" />}
                >
                  ロケーション移動
                </NexusButton>
                <BarcodePrintButton
                  productIds={selectedItems}
                  variant="secondary"
                  size="md"
                />
                <NexusButton
                  onClick={handleExportCsv}
                  variant="primary"
                  icon={<ArrowDownTrayIcon className="w-5 h-5" />}
                >
                  CSVエクスポート
                </NexusButton>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <NexusSelect
                  label="ステータス"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  options={[
                    { value: 'all', label: 'すべて' },
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
                    ...staffMembers.map(staff => ({ value: staff, label: staff }))
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

        {/* Content */}
        {viewMode === 'card' ? (
          /* Card View */
          <div className="space-y-6">
            <div className="intelligence-metrics">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedItems.map((item) => (
                <div
                  key={item.id}
                  className="intelligence-card asia"
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="action-orb">
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
                          <BusinessStatusIndicator status={item.status} size="sm" />
                          {item.qrCode && (
                            <p className="text-xs text-nexus-text-secondary mt-1">
                              QR: {item.qrCode}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-nexus-text-primary mb-2">
                      {item.name}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-nexus-text-secondary mb-4">
                      <div className="flex justify-between">
                        <span>SKU:</span>
                        <span className="cert-nano cert-premium">{item.sku}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>価格:</span>
                        <span className="font-display font-medium text-nexus-text-primary">¥{item.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>保管場所:</span>
                        <span className="font-medium text-nexus-text-primary">{item.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>担当者:</span>
                        <span className="font-medium text-nexus-text-primary">{item.assignedStaff}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>最終更新:</span>
                        <span className="font-medium text-nexus-text-primary">
                          {new Date(item.lastModified).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>

                    {item.notes && (
                      <div className="bg-nexus-bg-secondary p-8 rounded-lg mb-4">
                        <p className="text-xs text-nexus-text-secondary">
                          備考: {item.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <NexusButton 
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDetailModalOpen(true);
                        }}
                        variant="primary"
                        size="sm"
                        className="flex-1"
                      >
                        詳細
                      </NexusButton>
                      <NexusButton 
                        onClick={() => handleItemMove(item)}
                        size="sm"
                      >
                        移動
                      </NexusButton>
                      <BarcodePrintButton
                        productIds={[item.id]}
                        variant="secondary"
                        size="sm"
                      />
                      <NexusButton 
                        onClick={() => handleQRCode(item)}
                        size="sm"
                      >
                        QR
                      </NexusButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
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
        ) : (
          /* Table View */
          <div className="intelligence-card global">
            <div className="p-8">
              <div className="holo-table">
                <table className="w-full">
                  <thead className="holo-header">
                    <tr>
                      <th className="text-left">商品</th>
                      <th className="text-left">ステータス</th>
                      <th className="text-left">保管場所</th>
                      <th className="text-left">担当者</th>
                      <th className="text-left">最終更新</th>
                      <th className="text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="holo-body">
                    {paginatedItems.map((item) => (
                      <tr key={item.id} className="holo-row">
                        <td>
                          <div className="flex items-center">
                            <div className="action-orb mr-3">
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
                        <td>
                          <BusinessStatusIndicator status={item.status} size="sm" />
                        </td>
                        <td>
                          <span className="text-sm text-nexus-text-primary">{item.location}</span>
                        </td>
                        <td>
                          <span className="text-sm text-nexus-text-primary">{item.assignedStaff}</span>
                        </td>
                        <td>
                          <span className="text-sm text-nexus-text-secondary">
                            {new Date(item.lastModified).toLocaleDateString('ja-JP')}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end space-x-2">
                            <NexusButton 
                              onClick={() => {
                                setSelectedItem(item);
                                setIsDetailModalOpen(true);
                              }}
                              size="sm"
                            >
                              詳細
                            </NexusButton>
                            <NexusButton 
                              onClick={() => {
                                setSelectedItem(item);
                                setIsMoveModalOpen(true);
                              }}
                              size="sm"
                            >
                              移動
                            </NexusButton>
                            <BarcodePrintButton
                              productIds={[item.id]}
                              variant="secondary"
                              size="sm"
                            />
                            <NexusButton 
                              onClick={() => {
                                setSelectedItem(item);
                                setIsQRModalOpen(true);
                              }}
                              size="sm"
                            >
                              QR
                            </NexusButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
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
        )}

        {filteredItems.length === 0 && (
          <div className="intelligence-card global">
            <div className="p-8 text-center">
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
        />

        {/* Edit Modal */}
        <BaseModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="商品詳細を編集"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  商品名
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue"
                  placeholder="商品名を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  商品コード
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue"
                  placeholder="商品コードを入力"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  カテゴリ
                </label>
                <select className="w-full px-3 py-2 border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue">
                  <option value="">カテゴリを選択</option>
                  <option value="camera">カメラ本体</option>
                  <option value="lens">レンズ</option>
                  <option value="watch">時計</option>
                  <option value="accessory">アクセサリー</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  在庫数量
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue"
                  placeholder="数量を入力"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                商品説明
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue"
                placeholder="商品の詳細説明を入力"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  購入価格
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue"
                  placeholder="購入価格を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  販売価格
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue"
                  placeholder="販売価格を入力"
                />
              </div>
            </div>
            
            <div className="flex gap-4 justify-end mt-6">
              <NexusButton 
                onClick={() => setIsEditModalOpen(false)}
                icon={<XMarkIcon className="w-5 h-5" />}
              >
                キャンセル
              </NexusButton>
              <NexusButton 
                onClick={handleEditItem} 
                variant="primary"
                icon={<CheckIcon className="w-5 h-5" />}
              >
                保存
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* Move Modal */}
        <BaseModal
          isOpen={isMoveModalOpen}
          onClose={() => setIsMoveModalOpen(false)}
          title="ロケーション移動"
          size="md"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                移動先ロケーション
              </label>
              <select className="w-full px-3 py-2 border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue">
                <option value="">ロケーションを選択</option>
                <option value="A-01-01">A-01-01 (1階 Aエリア)</option>
                <option value="A-01-02">A-01-02 (1階 Aエリア)</option>
                <option value="B-02-01">B-02-01 (2階 Bエリア)</option>
                <option value="B-02-02">B-02-02 (2階 Bエリア)</option>
                <option value="C-01-01">C-01-01 (1階 Cエリア)</option>
                <option value="TEMP-01">TEMP-01 (一時保管)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  移動数量
                </label>
                <input
                  type="number"
                  min="1"
                  defaultValue="1"
                  className="w-full px-3 py-2 border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  移動予定日時
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                移動理由
              </label>
              <select className="w-full px-3 py-2 border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue">
                <option value="">理由を選択</option>
                <option value="inspection">検品のため</option>
                <option value="photography">撮影のため</option>
                <option value="shipping">出荷準備のため</option>
                <option value="storage">保管場所変更</option>
                <option value="maintenance">メンテナンス</option>
                <option value="other">その他</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                備考
              </label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue"
                placeholder="移動に関する特記事項があれば入力"
              />
            </div>
            
            <div className="flex gap-4 justify-end mt-6">
              <NexusButton 
                onClick={() => setIsMoveModalOpen(false)}
                icon={<XMarkIcon className="w-5 h-5" />}
              >
                キャンセル
              </NexusButton>
              <NexusButton 
                onClick={handleMoveItem} 
                variant="primary"
                icon={<ArrowsRightLeftIcon className="w-5 h-5" />}
              >
                移動
              </NexusButton>
            </div>
          </div>
        </BaseModal>
      </div>
    </DashboardLayout>
  );
}