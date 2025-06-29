'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import QRCodeModal from '../../components/QRCodeModal';
import { useState, useEffect } from 'react';

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
}

export default function StaffInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // デモデータ（スタッフ向けに詳細情報を追加）
  useEffect(() => {
    const demoData: InventoryItem[] = [
      {
        id: '1',
        name: 'Canon EOS R5',
        sku: 'CAM-001',
        category: 'カメラ本体',
        status: 'inspection',
        location: 'A区画-01',
        price: 450000,
        condition: '極美品',
        entryDate: '2024-06-20',
        assignedStaff: '田中',
        lastModified: '2024-06-28T10:30:00Z',
        qrCode: 'QR-CAM-001',
        notes: '付属品完備、シャッター回数要確認',
      },
      {
        id: '2',
        name: 'Sony FE 24-70mm f/2.8',
        sku: 'LEN-002',
        category: 'レンズ',
        status: 'storage',
        location: 'A区画-05',
        price: 280000,
        condition: '美品',
        entryDate: '2024-06-22',
        assignedStaff: '佐藤',
        lastModified: '2024-06-27T15:20:00Z',
        qrCode: 'QR-LEN-002',
        notes: 'レンズ内クリア、外観良好',
      },
      {
        id: '3',
        name: 'Rolex Submariner',
        sku: 'WAT-001',
        category: '腕時計',
        status: 'sold',
        location: 'V区画-12',
        price: 1200000,
        condition: '中古美品',
        entryDate: '2024-06-15',
        assignedStaff: '鈴木',
        lastModified: '2024-06-26T16:45:00Z',
        qrCode: 'QR-WAT-001',
        notes: '真贋確認済み、オーバーホール済み',
      },
      {
        id: '4',
        name: 'Hermès Birkin 30',
        sku: 'ACC-003',
        category: 'アクセサリ',
        status: 'listing',
        location: 'H区画-08',
        price: 2500000,
        condition: '新品同様',
        entryDate: '2024-06-28',
        assignedStaff: '山田',
        lastModified: '2024-06-28T14:15:00Z',
        qrCode: 'QR-ACC-003',
        notes: 'プレミアム商品、特別管理',
      },
      {
        id: '5',
        name: 'Leica M11',
        sku: 'CAM-005',
        category: 'カメラ本体',
        status: 'inbound',
        location: '入庫待ち',
        price: 980000,
        condition: '美品',
        entryDate: '2024-06-28',
        assignedStaff: '田中',
        lastModified: '2024-06-28T11:00:00Z',
        qrCode: 'QR-CAM-005',
        notes: '入庫予定：明日午前',
      },
      {
        id: '6',
        name: 'Nikon Z9',
        sku: 'CAM-006',
        category: 'カメラ本体',
        status: 'maintenance',
        location: 'メンテナンス室',
        price: 520000,
        condition: '要調整',
        entryDate: '2024-06-25',
        assignedStaff: '佐藤',
        lastModified: '2024-06-28T09:30:00Z',
        qrCode: 'QR-CAM-006',
        notes: 'ファインダー調整中',
      },
    ];
    setItems(demoData);
    setFilteredItems(demoData);
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
  }, [items, selectedStatus, selectedCategory, selectedLocation, selectedStaff, searchQuery]);

  const statusColors = {
    inbound: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    inspection: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    storage: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    listing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    sold: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    maintenance: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const statusLabels = {
    inbound: '入庫待ち',
    inspection: '検品中',
    storage: '保管中',
    listing: '出品中',
    sold: '売約済み',
    maintenance: 'メンテナンス',
  };

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

  const handleBulkQRPrint = () => {
    if (selectedItems.length > 0) {
      alert(`${selectedItems.length}件の商品のQRコード印刷を開始します`);
    } else {
      alert('全商品のQRコード印刷を開始します');
    }
  };

  const handleBulkMove = () => {
    if (selectedItems.length > 0) {
      const newLocation = prompt('移動先を入力してください:');
      if (newLocation) {
        selectedItems.forEach(itemId => {
          updateItemLocation(itemId, newLocation);
        });
        setSelectedItems([]);
        alert(`${selectedItems.length}件の商品を${newLocation}に移動しました`);
      }
    } else {
      alert('移動する商品を選択してください');
    }
  };

  const handleItemMove = (item: InventoryItem) => {
    const newLocation = prompt(`${item.name}の移動先を入力してください:`, item.location);
    if (newLocation && newLocation !== item.location) {
      updateItemLocation(item.id, newLocation);
      alert(`${item.name}を${newLocation}に移動しました`);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const staffMembers = Array.from(new Set(items.map(item => item.assignedStaff).filter(Boolean)));

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card europe">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  スタッフ在庫管理
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  {filteredItems.length}件の商品が表示されています（詳細管理）
                </p>
              </div>
              <div className="flex space-x-3">
                <div className="flex rounded-lg bg-nexus-bg-secondary p-1">
                  <button
                    onClick={() => setViewMode('card')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'card'
                        ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                        : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                    }`}
                  >
                    カード
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'table'
                        ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                        : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                    }`}
                  >
                    テーブル
                  </button>
                </div>
                <button 
                  onClick={handleBulkQRPrint}
                  className="nexus-button"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                  QRコード印刷
                </button>
                <button 
                  onClick={handleBulkMove}
                  className="nexus-button"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  一括移動
                </button>
                <button 
                  onClick={() => alert('バーコードスキャン機能（デモ版では利用できません）')}
                  className="nexus-button primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                  バーコードスキャン
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="intelligence-card global">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  ステータス
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-sm text-nexus-text-primary"
                >
                  <option value="all">すべて</option>
                  <option value="inbound">入庫待ち</option>
                  <option value="inspection">検品中</option>
                  <option value="storage">保管中</option>
                  <option value="listing">出品中</option>
                  <option value="sold">売約済み</option>
                  <option value="maintenance">メンテナンス</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  カテゴリー
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-sm text-nexus-text-primary"
                >
                  <option value="all">すべて</option>
                  <option value="カメラ本体">カメラ本体</option>
                  <option value="レンズ">レンズ</option>
                  <option value="腕時計">腕時計</option>
                  <option value="アクセサリ">アクセサリ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  保管場所
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-sm text-nexus-text-primary"
                >
                  <option value="all">すべて</option>
                  <option value="A区画">A区画</option>
                  <option value="H区画">H区画</option>
                  <option value="V区画">V区画</option>
                  <option value="メンテナンス室">メンテナンス室</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  担当者
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-sm text-nexus-text-primary"
                >
                  <option value="all">すべて</option>
                  {staffMembers.map(staff => (
                    <option key={staff} value={staff}>{staff}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  検索
                </label>
                <input
                  type="text"
                  placeholder="商品名・SKU・QR検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-sm text-nexus-text-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'card' ? (
          /* Card View */
          <div className="intelligence-metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="intelligence-card asia"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="action-orb">
                          {item.category === 'カメラ本体' ? '📷' : 
                           item.category === 'レンズ' ? '🔍' :
                           item.category === '腕時計' ? '⌚' : '💎'}
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[item.status]}`}>
                            {statusLabels[item.status]}
                          </span>
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
                      <div className="bg-nexus-bg-secondary p-3 rounded-lg mb-4">
                        <p className="text-xs text-nexus-text-secondary">
                          備考: {item.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => alert(`詳細情報\n商品: ${item.name}\nSKU: ${item.sku}\n状態: ${item.condition}\n備考: ${item.notes || 'なし'}`)}
                        className="nexus-button primary flex-1 text-sm"
                      >
                        詳細
                      </button>
                      <button 
                        onClick={() => handleItemMove(item)}
                        className="nexus-button text-sm"
                      >
                        移動
                      </button>
                      <button 
                        onClick={() => handleQRCode(item)}
                        className="nexus-button text-sm"
                      >
                        QR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="intelligence-card global">
            <div className="p-6">
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
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="holo-row">
                        <td>
                          <div className="flex items-center">
                            <div className="action-orb mr-3">
                              {item.category === 'カメラ本体' ? '📷' : 
                               item.category === 'レンズ' ? '🔍' :
                               item.category === '腕時計' ? '⌚' : '💎'}
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
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[item.status]}`}>
                            {statusLabels[item.status]}
                          </span>
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
                            <button 
                              onClick={() => alert(`詳細情報\n商品: ${item.name}\nSKU: ${item.sku}\n状態: ${item.condition}\n備考: ${item.notes || 'なし'}`)}
                              className="nexus-button text-xs"
                            >
                              詳細
                            </button>
                            <button 
                              onClick={() => handleItemMove(item)}
                              className="nexus-button text-xs"
                            >
                              移動
                            </button>
                            <button 
                              onClick={() => handleQRCode(item)}
                              className="nexus-button text-xs"
                            >
                              QR
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="intelligence-card global">
            <div className="p-12 text-center">
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
      </div>
    </DashboardLayout>
  );
}