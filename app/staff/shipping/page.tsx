'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import BarcodeScanner from '../../components/BarcodeScanner';
import { useState, useEffect } from 'react';

interface ShippingItem {
  id: string;
  productName: string;
  productSku: string;
  orderNumber: string;
  customer: string;
  shippingAddress: string;
  status: 'pending_inspection' | 'inspected' | 'packed' | 'shipped' | 'delivered';
  priority: 'urgent' | 'normal' | 'low';
  dueDate: string;
  inspectionNotes?: string;
  trackingNumber?: string;
  shippingMethod: string;
  value: number;
}

export default function StaffShippingPage() {
  const [items, setItems] = useState<ShippingItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [scannedItems, setScannedItems] = useState<string[]>([]);

  useEffect(() => {
    // Load shipping data from mock file
    fetch('/api/staff/dashboard')
      .then(res => res.json())
      .then(data => {
        // Convert staff shipping data to ShippingItem format
        const convertedItems: ShippingItem[] = data.shippingData.todayShipments.map((shipment: any) => ({
          id: shipment.id,
          productName: shipment.productName,
          productSku: shipment.productId,
          orderNumber: shipment.orderId,
          customer: shipment.customer,
          shippingAddress: shipment.address,
          status: shipment.status === '梱包待ち' ? 'pending_inspection' : 
                 shipment.status === '準備完了' ? 'packed' : 'pending_inspection',
          priority: shipment.priority === '高' ? 'urgent' : 
                   shipment.priority === '中' ? 'normal' : 'low',
          dueDate: shipment.deadline,
          shippingMethod: shipment.shippingMethod,
          trackingNumber: shipment.trackingNumber || undefined,
          value: parseInt(shipment.value.replace(/[¥,]/g, '')),
        }));

        // Add additional demo items for better demonstration
        const additionalItems: ShippingItem[] = [
          {
            id: 'ship-003',
            productName: 'Sony FE 24-70mm f/2.8',
            productSku: 'TWD-LEN-005',
            orderNumber: 'ORD-2024-0628-003',
            customer: '田中一郎',
            shippingAddress: '愛知県名古屋市中区栄1-1-1',
            status: 'inspected',
            priority: 'normal',
            dueDate: '18:00',
            inspectionNotes: '動作確認済み、レンズ内クリア',
            shippingMethod: 'ヤマト宅急便',
            value: 280000,
          },
          {
            id: 'ship-004',
            productName: 'Rolex GMT Master',
            productSku: 'TWD-WAT-007',
            orderNumber: 'ORD-2024-0628-004',
            customer: '佐藤花子',
            shippingAddress: '大阪府大阪市北区梅田1-1-1',
            status: 'shipped',
            priority: 'urgent',
            dueDate: '16:00',
            inspectionNotes: '高額商品・保険付き配送',
            trackingNumber: 'YM-2024-062801',
            shippingMethod: 'ヤマト宅急便（保険付き）',
            value: 2100000,
          }
        ];

        setItems([...convertedItems, ...additionalItems]);
      })
      .catch(console.error);
  }, []);

  const filteredItems = items.filter(item => {
    const statusMatch = selectedStatus === 'all' || item.status === selectedStatus;
    const priorityMatch = selectedPriority === 'all' || item.priority === selectedPriority;
    return statusMatch && priorityMatch;
  });

  const statusColors = {
    pending_inspection: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    inspected: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    packed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  const statusLabels = {
    pending_inspection: '検品待ち',
    inspected: '検品完了',
    packed: '梱包完了',
    shipped: '出荷済み',
    delivered: '配送完了',
  };

  const priorityColors = {
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    normal: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  const priorityLabels = {
    urgent: '🔴 緊急',
    normal: '⚪ 通常',
    low: '🟢 低',
  };

  const updateItemStatus = (itemId: string, newStatus: ShippingItem['status']) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    ));
  };

  const getNextStatus = (currentStatus: ShippingItem['status']): ShippingItem['status'] | null => {
    const statusFlow: Record<ShippingItem['status'], ShippingItem['status'] | null> = {
      pending_inspection: 'inspected',
      inspected: 'packed',
      packed: 'shipped',
      shipped: 'delivered',
      delivered: null,
    };
    return statusFlow[currentStatus];
  };

  const getNextStatusLabel = (currentStatus: ShippingItem['status']): string => {
    const labels: Record<ShippingItem['status'], string> = {
      pending_inspection: '検品完了',
      inspected: '梱包完了',
      packed: '出荷',
      shipped: '配送完了',
      delivered: '',
    };
    return labels[currentStatus] || '';
  };

  const handleBarcodeScanned = (barcode: string) => {
    setScannedItems(prev => [...prev, barcode]);
    // バーコードに対応する商品を検索して処理
    const matchedItem = items.find(item => 
      item.productSku === barcode.split('-')[0] + '-' + barcode.split('-')[1]
    );
    if (matchedItem) {
      alert(`商品が見つかりました: ${matchedItem.productName}\nSKU: ${matchedItem.productSku}`);
    } else {
      alert(`バーコード ${barcode} に対応する商品が見つかりません`);
    }
  };

  const handlePrintLabel = (item?: ShippingItem) => {
    if (item) {
      alert(`配送ラベルを印刷します\n商品: ${item.productName}\n注文番号: ${item.orderNumber}`);
    } else {
      alert('一括配送ラベル印刷を開始します');
    }
  };

  const handlePackingInstruction = (item: ShippingItem) => {
    alert(`梱包指示\n商品: ${item.productName}\n価値: ¥${item.value.toLocaleString()}\n配送方法: ${item.shippingMethod}`);
  };

  const stats = {
    total: filteredItems.length,
    pendingInspection: filteredItems.filter(i => i.status === 'pending_inspection').length,
    readyToShip: filteredItems.filter(i => i.status === 'packed').length,
    urgent: filteredItems.filter(i => i.priority === 'urgent' && i.status !== 'delivered').length,
  };

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card oceania">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  検品・出荷管理
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  商品検品から出荷までの一括管理
                </p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => handlePrintLabel()}
                  className="nexus-button"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H9.5a2 2 0 01-2-2V5a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2h2.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 12-3-3-3 3" />
                  </svg>
                  配送ラベル印刷
                </button>
                <button 
                  onClick={() => alert('一括処理機能（デモ版では利用できません）')}
                  className="nexus-button"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  一括処理
                </button>
                <button 
                  onClick={() => setIsBarcodeScannerOpen(true)}
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

        {/* Stats Cards */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="intelligence-card global">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <span className="status-badge info">総計</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {stats.total}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  総件数
                </div>
              </div>
            </div>

            <div className="intelligence-card americas">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb orange">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="status-badge warning">待機中</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {stats.pendingInspection}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  検品待ち
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb purple">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="status-badge success">準備完了</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {stats.readyToShip}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  出荷準備完了
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb red">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge danger">緊急</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {stats.urgent}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  緊急案件
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Shipping Items */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                  <option value="pending_inspection">検品待ち</option>
                  <option value="inspected">検品完了</option>
                  <option value="packed">梱包完了</option>
                  <option value="shipped">出荷済み</option>
                  <option value="delivered">配送完了</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  優先度
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-sm text-nexus-text-primary"
                >
                  <option value="all">すべて</option>
                  <option value="urgent">緊急</option>
                  <option value="normal">通常</option>
                  <option value="low">低</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  期限
                </label>
                <select className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-sm text-nexus-text-primary">
                  <option value="all">すべて</option>
                  <option value="today">今日</option>
                  <option value="tomorrow">明日</option>
                  <option value="week">今週</option>
                  <option value="overdue">期限超過</option>
                </select>
              </div>
            </div>

            {/* Shipping Items List */}
            <div className="space-y-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="intelligence-card oceania hover:shadow-lg transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="action-orb">
                          📦
                        </div>
                        <div>
                          <h3 className="font-semibold text-nexus-text-primary">
                            {item.productName}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-nexus-text-secondary">
                              注文番号: {item.orderNumber}
                            </span>
                            <span className="cert-nano cert-premium">
                              {item.productSku}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-nexus-yellow mt-1">
                            お客様: {item.customer}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[item.priority]}`}>
                          {priorityLabels[item.priority]}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[item.status]}`}>
                          {statusLabels[item.status]}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-nexus-text-secondary">配送先</p>
                        <p className="text-sm font-medium text-nexus-text-primary">
                          {item.shippingAddress}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-nexus-text-secondary">配送方法</p>
                        <p className="text-sm font-medium text-nexus-text-primary">
                          {item.shippingMethod}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-nexus-text-secondary">商品価値</p>
                        <p className="text-sm font-display font-medium text-nexus-text-primary">
                          ¥{item.value.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {item.inspectionNotes && (
                      <div className="bg-nexus-bg-secondary p-3 rounded-lg mb-4">
                        <p className="text-sm text-nexus-text-primary">
                          <span className="font-medium">検品メモ:</span> {item.inspectionNotes}
                        </p>
                      </div>
                    )}

                    {item.trackingNumber && (
                      <div className="intelligence-card americas mb-4">
                        <div className="p-3">
                          <p className="text-sm text-nexus-text-primary">
                            <span className="font-medium">追跡番号:</span> 
                            <span className="cert-nano cert-mint ml-2">{item.trackingNumber}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {getNextStatus(item.status) && (
                          <button
                            onClick={() => updateItemStatus(item.id, getNextStatus(item.status)!)}
                            className="nexus-button primary text-sm"
                          >
                            {getNextStatusLabel(item.status)}
                          </button>
                        )}
                        <button 
                          onClick={() => alert(`詳細情報\n商品: ${item.productName}\n注文: ${item.orderNumber}\n顧客: ${item.customer}`)}
                          className="nexus-button text-sm"
                        >
                          詳細
                        </button>
                        {item.status === 'inspected' && (
                          <button 
                            onClick={() => handlePackingInstruction(item)}
                            className="nexus-button text-sm"
                          >
                            梱包指示
                          </button>
                        )}
                        {item.status === 'packed' && (
                          <button 
                            onClick={() => handlePrintLabel(item)}
                            className="nexus-button text-sm"
                          >
                            配送ラベル
                          </button>
                        )}
                      </div>
                      
                      <div className="text-xs text-nexus-text-secondary">
                        期限: {item.dueDate}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-nexus-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-nexus-text-primary">出荷案件がありません</h3>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  条件に一致する出荷案件が見つかりません。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Barcode Scanner Modal */}
        <BarcodeScanner
          isOpen={isBarcodeScannerOpen}
          onClose={() => setIsBarcodeScannerOpen(false)}
          onScan={handleBarcodeScanned}
        />
      </div>
    </DashboardLayout>
  );
}