'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import BarcodeScanner from '@/app/components/features/BarcodeScanner';
import PackingInstructions from '@/app/components/features/shipping/PackingInstructions';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TruckIcon,
  ArchiveBoxIcon,
  InformationCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import CarrierSettingsModal from '@/app/components/modals/CarrierSettingsModal';
import PackingMaterialsModal from '@/app/components/modals/PackingMaterialsModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

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
  const [selectedPackingItem, setSelectedPackingItem] = useState<ShippingItem | null>(null);
  const [shippingData, setShippingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [isCarrierModalOpen, setIsCarrierModalOpen] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/shipping')
      .then(res => res.json())
      .then(data => {
        setShippingData(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // モックデータを直接設定してロード時間を短縮
    const mockItems: ShippingItem[] = [
      {
        id: 'ship-001',
        productName: 'Canon EOS R5 ボディ',
        productSku: 'TWD-CAM-001',
        orderNumber: 'ORD-2024-0628-001',
        customer: '山田太郎',
        shippingAddress: '東京都渋谷区1-1-1',
        status: 'pending_inspection',
        priority: 'urgent',
        dueDate: '17:00',
        shippingMethod: 'ヤマト宅急便',
        value: 450000,
      },
      {
        id: 'ship-002',
        productName: 'Sony α7R V ボディ',
        productSku: 'TWD-CAM-002',
        orderNumber: 'ORD-2024-0628-002',
        customer: '鈴木花子',
        shippingAddress: '神奈川県横浜市1-1-1',
        status: 'packed',
        priority: 'normal',
        dueDate: '19:00',
        inspectionNotes: '動作確認済み、外観良好',
        shippingMethod: 'ヤマト宅急便',
        value: 398000,
      },
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

    setItems(mockItems);
  }, []);

  const filteredItems = items.filter(item => {
    const statusMatch = selectedStatus === 'all' || item.status === selectedStatus;
    const priorityMatch = selectedPriority === 'all' || item.priority === selectedPriority;
    return statusMatch && priorityMatch;
  });

  const statusColors = {
    pending_inspection: 'bg-nexus-yellow bg-opacity-20 text-nexus-yellow',
    inspected: 'bg-nexus-blue bg-opacity-20 text-nexus-blue',
    packed: 'bg-nexus-purple bg-opacity-20 text-nexus-purple',
    shipped: 'bg-nexus-blue bg-opacity-30 text-nexus-blue',
    delivered: 'bg-nexus-green bg-opacity-20 text-nexus-green',
  };

  const statusLabels: Record<string, string> = {
    'pending_pickup': 'ピックアップ待ち',
    'picking': 'ピッキング中',
    'packing': '梱包中',
    'ready': '発送準備完了',
    'shipped': '発送済み'
  };

  const priorityLabels: Record<string, string> = {
    high: '緊急',
    medium: '通常',
    low: '低'
  };

  const updateItemStatus = (itemId: string, newStatus: ShippingItem['status']) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    ));
    showToast({
      title: 'ステータス更新',
      message: `ステータスを${statusLabels[newStatus]}に更新しました`,
      type: 'success'
    });
    setOpenStatusDropdown(null);
  };

  const getAvailableStatuses = (currentStatus: ShippingItem['status']): ShippingItem['status'][] => {
    const allStatuses: ShippingItem['status'][] = ['pending_inspection', 'inspected', 'packed', 'shipped', 'delivered'];
    const currentIndex = allStatuses.indexOf(currentStatus);
    return allStatuses.filter((_, index) => index > currentIndex);
  };

  const handleBarcodeScanned = (barcode: string) => {
    setScannedItems(prev => [...prev, barcode]);
    // バーコードに対応する商品を検索して処理
    const matchedItem = items.find(item => 
      item.productSku === barcode.split('-')[0] + '-' + barcode.split('-')[1]
    );
    if (matchedItem) {
      showToast({
        title: '商品発見',
        message: `${matchedItem.productName} (SKU: ${matchedItem.productSku})`,
        type: 'success'
      });
    } else {
      showToast({
        title: '商品未発見',
        message: `バーコード ${barcode} に対応する商品が見つかりません`,
        type: 'warning'
      });
    }
  };

  const handlePrintLabel = (item?: ShippingItem) => {
    if (item) {
      showToast({
        title: '印刷開始',
        message: `${item.productName}の配送ラベルを印刷します`,
        type: 'info'
      });
    } else {
      showToast({
        title: '一括印刷開始',
        message: '一括配送ラベル印刷を開始します',
        type: 'info'
      });
    }
  };

  const handlePackingInstruction = (item: ShippingItem) => {
    setSelectedPackingItem(item);
  };

  const handlePackingComplete = () => {
    if (selectedPackingItem) {
      // 梱包完了処理
      setItems(prev => prev.map(item => 
        item.id === selectedPackingItem.id 
          ? { ...item, status: 'packed' as const }
          : item
      ));
      showToast({
        title: '梱包完了',
        message: `${selectedPackingItem.productName}の梱包が完了しました`,
        type: 'success'
      });
      setSelectedPackingItem(null);
    }
  };

  const handleCarrierSettings = () => {
    setIsCarrierModalOpen(true);
  };

  const handleMaterialsCheck = () => {
    setIsMaterialsModalOpen(true);
  };

  const handleCarrierSave = (settings: any) => {
    console.log('配送業者設定保存:', settings);
    fetch('/api/shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateCarrierSettings', data: settings })
    })
    .then(res => res.json())
    .then(data => {
      showToast({
        title: '設定保存完了',
        message: '配送業者設定を保存しました',
        type: 'success'
      });
    })
    .catch(err => {
      console.error('設定保存エラー:', err);
      showToast({
        title: 'エラー',
        message: '設定の保存に失敗しました',
        type: 'error'
      });
    });
  };

  const handleMaterialsOrder = (materials: any[]) => {
    console.log('梱包資材発注:', materials);
    fetch('/api/shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkMaterials', data: materials })
    })
    .then(res => res.json())
    .then(data => {
      const totalCost = materials.reduce((sum, item) => sum + (item.orderQuantity * item.price), 0);
      showToast({
        title: '発注完了',
        message: `梱包資材を発注しました (合計: ¥${totalCost.toLocaleString()})`,
        type: 'success'
      });
    })
    .catch(err => {
      console.error('発注エラー:', err);
      showToast({
        title: 'エラー',
        message: '発注処理に失敗しました',
        type: 'error'
      });
    });
  };

  const stats = {
    total: filteredItems.length,
    pendingInspection: filteredItems.filter(i => i.status === 'pending_inspection').length,
    readyToShip: filteredItems.filter(i => i.status === 'packed').length,
    urgent: filteredItems.filter(i => i.priority === 'urgent' && i.status !== 'delivered').length,
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <TruckIcon className="w-8 h-8 text-nexus-yellow flex-shrink-0" />
                  <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                    出荷管理
                  </h1>
                </div>
                <p className="text-nexus-text-secondary">
                  出荷待ち商品のピッキング・梱包・配送管理
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                <button
                  onClick={() => setIsBarcodeScannerOpen(true)}
                  className="nexus-button flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                  <span className="hidden sm:inline">バーコードスキャン</span>
                  <span className="sm:hidden">スキャン</span>
                </button>
                <button
                  onClick={handleCarrierSettings}
                  className="nexus-button flex items-center justify-center gap-2"
                >
                  <TruckIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">配送業者設定</span>
                  <span className="sm:hidden">配送設定</span>
                </button>
                <button
                  onClick={handleMaterialsCheck}
                  className="nexus-button primary flex items-center justify-center gap-2"
                >
                  <ArchiveBoxIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">梱包資材確認</span>
                  <span className="sm:hidden">資材確認</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Carrier Settings Modal */}
        <CarrierSettingsModal
          isOpen={isCarrierModalOpen}
          onClose={() => setIsCarrierModalOpen(false)}
          onSave={handleCarrierSave}
        />

        {/* Packing Materials Modal */}
        <PackingMaterialsModal
          isOpen={isMaterialsModalOpen}
          onClose={() => setIsMaterialsModalOpen(false)}
          onOrder={handleMaterialsOrder}
        />

        {/* Stats Cards */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="intelligence-card global">
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <span className="status-badge info text-[10px] sm:text-xs">総計</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.total}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  総件数
                </div>
              </div>
            </div>

            <div className="intelligence-card americas">
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb orange w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="status-badge warning text-[10px] sm:text-xs">待機中</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.pendingInspection}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  検品待ち
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb purple w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="status-badge success text-[10px] sm:text-xs">準備完了</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.readyToShip}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  出荷準備完了
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb red w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge danger text-[10px] sm:text-xs">緊急</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.urgent}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
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
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
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
                        <span className="cert-nano cert-premium">
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
                        {/* ステータス変更ドロップダウン */}
                        {item.status !== 'delivered' && (
                          <div className="relative">
                            <button
                              onClick={() => setOpenStatusDropdown(openStatusDropdown === item.id ? null : item.id)}
                              className="nexus-button primary text-sm flex items-center gap-2"
                            >
                              ステータス変更
                              <ChevronDownIcon className={`w-4 h-4 transition-transform ${openStatusDropdown === item.id ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {openStatusDropdown === item.id && (
                              <div className="absolute left-0 mt-2 w-48 bg-nexus-bg-primary border border-nexus-border rounded-lg shadow-lg z-10">
                                <div className="py-1">
                                  {getAvailableStatuses(item.status).map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => updateItemStatus(item.id, status)}
                                      className="w-full text-left px-4 py-2 text-sm text-nexus-text-primary hover:bg-nexus-bg-secondary transition-colors duration-200"
                                    >
                                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mr-2 ${statusColors[status]}`}>
                                        {statusLabels[status]}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <button 
                          onClick={() => showToast({
                            title: '詳細情報',
                            message: `商品: ${item.productName}, 注文: ${item.orderNumber}, 顧客: ${item.customer}`,
                            type: 'info'
                          })}
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

        {/* Barcode Scanner Section */}
        {isBarcodeScannerOpen && (
          <div className="intelligence-card global">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-nexus-text-primary">バーコードスキャナー</h3>
                <button
                  onClick={() => setIsBarcodeScannerOpen(false)}
                  className="nexus-button"
                >
                  閉じる
                </button>
              </div>
              <BarcodeScanner
                onScan={handleBarcodeScanned}
                placeholder="商品バーコードをスキャンしてください"
                scanType="product"
              />
            </div>
          </div>
        )}

        {/* Packing Instructions Modal */}
        {selectedPackingItem && (
          <PackingInstructions
            item={{
              id: selectedPackingItem.id,
              productName: selectedPackingItem.productName,
              productSku: selectedPackingItem.productSku,
              category: selectedPackingItem.productName.includes('Canon') || selectedPackingItem.productName.includes('Nikon') ? 'カメラ本体' :
                       selectedPackingItem.productName.includes('mm') ? 'レンズ' :
                       selectedPackingItem.productName.includes('Rolex') || selectedPackingItem.productName.includes('Omega') ? '腕時計' :
                       'アクセサリ',
              value: selectedPackingItem.value,
              fragile: selectedPackingItem.value > 500000
            }}
            onComplete={handlePackingComplete}
            onClose={() => setSelectedPackingItem(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}