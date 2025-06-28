'use client';

import DashboardLayout from '../../components/DashboardLayout';
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
    fetch('/data/staff-mock.json')
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              検品・出荷管理
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              商品検品から出荷までの一括管理
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => handlePrintLabel()}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              配送ラベル印刷
            </button>
            <button 
              onClick={() => alert('一括処理機能（デモ版では利用できません）')}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              一括処理
            </button>
            <button 
              onClick={() => setIsBarcodeScannerOpen(true)}
              className="button-primary"
            >
              バーコードスキャン
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">総件数</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.pendingInspection}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">検品待ち</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.readyToShip}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">出荷準備完了</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">緊急案件</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ステータス
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                優先度
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              >
                <option value="all">すべて</option>
                <option value="urgent">緊急</option>
                <option value="normal">通常</option>
                <option value="low">低</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                期限
              </label>
              <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                <option value="all">すべて</option>
                <option value="today">今日</option>
                <option value="tomorrow">明日</option>
                <option value="week">今週</option>
                <option value="overdue">期限超過</option>
              </select>
            </div>
          </div>

          {/* Shipping Items List */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-medium">
                      📦
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        注文番号: {item.orderNumber} | SKU: {item.productSku}
                      </p>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">配送先</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.shippingAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">配送方法</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.shippingMethod}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">商品価値</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ¥{item.value.toLocaleString()}
                    </p>
                  </div>
                </div>

                {item.inspectionNotes && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">検品メモ:</span> {item.inspectionNotes}
                    </p>
                  </div>
                )}

                {item.trackingNumber && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <span className="font-medium">追跡番号:</span> {item.trackingNumber}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {getNextStatus(item.status) && (
                      <button
                        onClick={() => updateItemStatus(item.id, getNextStatus(item.status)!)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        {getNextStatusLabel(item.status)}
                      </button>
                    )}
                    <button 
                      onClick={() => alert(`詳細情報\n商品: ${item.productName}\n注文: ${item.orderNumber}\n顧客: ${item.customer}`)}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                    >
                      詳細
                    </button>
                    {item.status === 'inspected' && (
                      <button 
                        onClick={() => handlePackingInstruction(item)}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                      >
                        梱包指示
                      </button>
                    )}
                    {item.status === 'packed' && (
                      <button 
                        onClick={() => handlePrintLabel(item)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        配送ラベル
                      </button>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    期限: {item.dueDate}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">出荷案件がありません</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                条件に一致する出荷案件が見つかりません。
              </p>
            </div>
          )}
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