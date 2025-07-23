'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import WorkflowProgress from '@/app/components/ui/WorkflowProgress';
import BarcodeScanner from '@/app/components/features/BarcodeScanner';
import PackingVideoModal from '@/app/components/modals/PackingVideoModal';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  TruckIcon,
  ArchiveBoxIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CubeIcon,
  PrinterIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import CarrierSettingsModal from '@/app/components/modals/CarrierSettingsModal';
import PackingMaterialsModal from '@/app/components/modals/PackingMaterialsModal';
import ShippingDetailModal from '@/app/components/modals/ShippingDetailModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import NexusSelect from '@/app/components/ui/NexusSelect';
import NexusButton from '@/app/components/ui/NexusButton';
import Pagination from '@/app/components/ui/Pagination';
import { NexusLoadingSpinner } from '@/app/components/ui';
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator';
import { getWorkflowProgress, getNextAction, ShippingStatus } from '@/lib/utils/workflow';
import React from 'react'; // Added missing import for React

interface ShippingItem {
  id: string;
  productName: string;
  productSku: string;
  orderNumber: string;
  customer: string;
  shippingAddress: string;
  status: 'pending_inspection' | 'inspected' | 'packed' | 'shipped' | 'delivered' | 'ready_for_pickup';
  priority: 'urgent' | 'normal' | 'low';
  dueDate: string;
  inspectionNotes?: string;
  trackingNumber?: string;
  shippingMethod: string;
  value: number;
  location?: string; // Added location field
  productImages?: string[]; // Added productImages field
  inspectionImages?: string[]; // Added inspectionImages field
}

export default function StaffShippingPage() {
  const [items, setItems] = useState<ShippingItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [selectedPackingItem, setSelectedPackingItem] = useState<ShippingItem | null>(null);
  const [shippingData, setShippingData] = useState<{
    items: ShippingItem[];
    stats: { totalShipments: number; pendingShipments: number; };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [isCarrierModalOpen, setIsCarrierModalOpen] = useState(false);
  const [deadlineFilter, setDeadlineFilter] = useState<string>('all');

  const [selectedDetailItem, setSelectedDetailItem] = useState<ShippingItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [isPackingVideoModalOpen, setIsPackingVideoModalOpen] = useState(false);

  // ページング状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

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
    // モックデータを拡張
    const mockItems: ShippingItem[] = [
      {
        id: 'SHIP-001',
        productName: 'Canon EOS R5 ボディ',
        productSku: 'CAM-001',
        orderNumber: 'ORD-2024-0001',
        customer: '山田太郎',
        shippingAddress: '東京都渋谷区1-2-3',
        status: 'pending_inspection',
        priority: 'urgent',
        dueDate: '2024-01-20',
        shippingMethod: 'ヤマト宅急便',
        value: 450000,
        location: 'A-01',
        productImages: [
          '/api/placeholder/400/300',
          '/api/placeholder/400/300',
          '/api/placeholder/400/300',
          '/api/placeholder/400/300'
        ],
        inspectionImages: []
      },
      {
        id: 'SHIP-002',
        productName: 'Sony α7R V ボディ',
        productSku: 'CAM-002',
        orderNumber: 'ORD-2024-0002',
        customer: '鈴木花子',
        shippingAddress: '神奈川県横浜市1-1-1',
        status: 'packed',
        priority: 'normal',
        dueDate: '19:00',
        inspectionNotes: '動作確認済み、外観良好',
        shippingMethod: 'ヤマト宅急便',
        value: 398000,
        location: 'A-02',
        productImages: [],
        inspectionImages: []
      },
      {
        id: 'SHIP-003',
        productName: 'Sony FE 24-70mm f/2.8',
        productSku: 'LEN-005',
        orderNumber: 'ORD-2024-0003',
        customer: '田中一郎',
        shippingAddress: '愛知県名古屋市中区栄1-1-1',
        status: 'inspected',
        priority: 'normal',
        dueDate: '18:00',
        inspectionNotes: '動作確認済み、レンズ内クリア',
        shippingMethod: 'ヤマト宅急便',
        value: 280000,
        location: 'A-03',
        productImages: [],
        inspectionImages: []
      },
      {
        id: 'SHIP-004',
        productName: 'Rolex GMT Master',
        productSku: 'WAT-007',
        orderNumber: 'ORD-2024-0004',
        customer: '佐藤花子',
        shippingAddress: '大阪府大阪市北区梅田1-1-1',
        status: 'shipped',
        priority: 'urgent',
        dueDate: '16:00',
        inspectionNotes: '高額商品・保険付き配送',
        trackingNumber: 'YM-2024-062801',
        shippingMethod: 'ヤマト宅急便（保険付き）',
        value: 2100000,
        location: 'B-01',
        productImages: [],
        inspectionImages: []
      },
      {
        id: 'SHIP-005',
        productName: 'Nikon NIKKOR Z 50mm f/1.2',
        productSku: 'LEN-008',
        orderNumber: 'ORD-2024-0005',
        customer: '高橋美咲',
        shippingAddress: '福岡県福岡市博多区1-1-1',
        status: 'pending_inspection',
        priority: 'normal',
        dueDate: '20:00',
        shippingMethod: 'ヤマト宅急便',
        value: 245000,
        location: 'C-01',
        productImages: [],
        inspectionImages: []
      },
      {
        id: 'SHIP-006',
        productName: 'Omega Speedmaster',
        productSku: 'WAT-015',
        orderNumber: 'ORD-2024-0006',
        customer: '山田一郎',
        shippingAddress: '北海道札幌市中央区1-1-1',
        status: 'inspected',
        priority: 'urgent',
        dueDate: '15:00',
        inspectionNotes: '動作確認済み、全体的に美品',
        shippingMethod: '佐川急便',
        value: 850000,
        location: 'V-01',
        productImages: [],
        inspectionImages: []
      },
      {
        id: 'SHIP-007',
        productName: 'Fujifilm X-T5',
        productSku: 'CAM-018',
        orderNumber: 'ORD-2024-0007',
        customer: '伊藤健太',
        shippingAddress: '愛知県名古屋市中村区1-1-1',
        status: 'packed',
        priority: 'low',
        dueDate: '21:00',
        shippingMethod: '日本郵便',
        value: 180000,
        location: 'V-02',
        productImages: [],
        inspectionImages: []
      },
      {
        id: 'SHIP-008',
        productName: 'Sony FE 85mm f/1.4 GM',
        productSku: 'LEN-021',
        orderNumber: 'ORD-2024-0008',
        customer: '渡辺真理',
        shippingAddress: '神奈川県川崎市1-1-1',
        status: 'shipped',
        priority: 'normal',
        dueDate: '18:30',
        trackingNumber: 'YM-2024-062802',
        shippingMethod: 'ヤマト宅急便',
        value: 155000,
        location: 'C-02',
        productImages: [],
        inspectionImages: []
      },
      {
        id: 'SHIP-009',
        productName: 'Seiko Prospex',
        productSku: 'WAT-025',
        orderNumber: 'ORD-2024-0009',
        customer: '中村由美',
        shippingAddress: '大阪府大阪市中央区1-1-1',
        status: 'pending_inspection',
        priority: 'normal',
        dueDate: '19:30',
        shippingMethod: '佐川急便',
        value: 65000,
        location: 'B-01',
        productImages: [],
        inspectionImages: []
      },
      {
        id: 'SHIP-010',
        productName: 'Leica Q2',
        productSku: 'CAM-030',
        orderNumber: 'ORD-2024-0010',
        customer: '小林正人',
        shippingAddress: '東京都新宿区1-1-1',
        status: 'inspected',
        priority: 'urgent',
        dueDate: '16:30',
        inspectionNotes: '高額商品・取扱い注意',
        shippingMethod: 'ヤマト宅急便（保険付き）',
        value: 750000,
        location: 'V-01',
        productImages: [],
        inspectionImages: []
      },
      {
        id: 'SHIP-011',
        productName: 'Canon EF 70-200mm f/2.8L',
        productSku: 'LEN-033',
        orderNumber: 'ORD-2024-0011',
        customer: '松本彩香',
        shippingAddress: '京都府京都市下京区1-1-1',
        status: 'packed',
        priority: 'normal',
        dueDate: '20:30',
        shippingMethod: '日本郵便',
        value: 125000,
        location: 'A-01',
        productImages: [],
        inspectionImages: []
      },
      {
        id: 'SHIP-012',
        productName: 'Casio G-Shock',
        productSku: 'WAT-038',
        orderNumber: 'ORD-2024-0012',
        customer: '岡田雄介',
        shippingAddress: '埼玉県さいたま市1-1-1',
        status: 'delivered',
        priority: 'low',
        dueDate: '22:00',
        trackingNumber: 'YM-2024-062803',
        shippingMethod: 'ヤマト宅急便',
        value: 35000,
        location: 'B-02',
        productImages: [],
        inspectionImages: []
      },
      {
        id: 'SHIP-013',
        productName: 'Panasonic GH6',
        productSku: 'CAM-042',
        orderNumber: 'ORD-2024-0013',
        customer: '森田千佳',
        shippingAddress: '広島県広島市中区1-1-1',
        status: 'pending_inspection',
        priority: 'normal',
        dueDate: '17:30',
        shippingMethod: '佐川急便',
        value: 220000,
        location: 'C-01',
        productImages: [],
        inspectionImages: []
      },
      {
        id: 'SHIP-014',
        productName: 'Sigma 24-70mm f/2.8 DG DN',
        productSku: 'LEN-046',
        orderNumber: 'ORD-2024-0014',
        customer: '松田健太',
        shippingAddress: '宮城県仙台市青葉区1-1-1',
        status: 'inspected',
        priority: 'normal',
        dueDate: '18:45',
        inspectionNotes: '動作確認済み、外観良好',
        shippingMethod: 'ヤマト宅急便',
        value: 95000,
        location: 'A-02',
        productImages: [],
        inspectionImages: []
      },
      {
        id: 'SHIP-015',
        productName: 'Citizen Eco-Drive',
        productSku: 'WAT-050',
        orderNumber: 'ORD-2024-0015',
        customer: '井上美紀',
        shippingAddress: '千葉県千葉市中央区1-1-1',
        status: 'packed',
        priority: 'low',
        dueDate: '21:30',
        shippingMethod: '日本郵便',
        value: 42000,
        location: 'B-01',
        productImages: [],
        inspectionImages: []
      },
    ];

    setItems(mockItems);
  }, []);

  // タブごとのフィルタリング
  const tabFilters: Record<string, (item: ShippingItem) => boolean> = {
    'all': () => true,
    'pending_inspection': (item) => item.status === 'pending_inspection',
    'inspected': (item) => item.status === 'inspected',
    'packed': (item) => item.status === 'packed',
    'ready_for_pickup': (item) => item.status === 'ready_for_pickup',
    'today': (item) => {
      const today = new Date();
      const itemTime = item.dueDate.split(':');
      const itemDate = new Date();
      itemDate.setHours(parseInt(itemTime[0]), parseInt(itemTime[1]));
      return itemDate.toDateString() === today.toDateString();
    }
  };

  // フィルタリング
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const tabMatch = tabFilters[activeTab] ? tabFilters[activeTab](item) : true;
      const priorityMatch = selectedPriority === 'all' || item.priority === selectedPriority;
      return tabMatch && priorityMatch;
    });
  }, [items, activeTab, selectedPriority]);

  // ページネーション
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  // フィルター変更時はページを1に戻す
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedPriority]);

  // ステータス表示は BusinessStatusIndicator で統一
  const statusLabels: Record<string, string> = {
    'pending_inspection': '検品待ち',
    'inspected': '検品済み',
    'packed': '梱包済み',
    'shipped': '発送済み',
    'delivered': '配送完了',
    'ready_for_pickup': '集荷準備中'
  };

  const priorityLabels: Record<string, string> = {
    urgent: '緊急',
    normal: '通常',
    low: '低'
  };

  const updateItemStatus = (itemId: string, newStatus: ShippingItem['status']) => {
    // ステータス更新を実行
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    ));
    
    // トーストメッセージを表示
    showToast({
      title: 'ステータス更新',
      message: `ステータスを${statusLabels[newStatus]}に更新しました`,
      type: 'success'
    });
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

  const handlePrintLabel = async (item?: ShippingItem) => {
    if (item) {
      showToast({
        title: '印刷開始',
        message: `${item.productName}の配送ラベルを印刷します`,
        type: 'info'
      });

      try {
        const labelData = {
          orderNumber: item.orderNumber,
          productName: item.productName,
          productSku: item.productSku,
          customer: item.customer,
          shippingAddress: item.shippingAddress,
          shippingMethod: item.shippingMethod,
          value: item.value,
        };

        const response = await fetch('/api/pdf/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'shipping-label',
            data: labelData,
          }),
        });

        if (!response.ok) {
          throw new Error('配送ラベルの生成に失敗しました');
        }

        const result = await response.json();
        
        // PDF Base64データをBlobに変換
        const binaryString = atob(result.base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        
        // PDFをダウンロード
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast({
          title: '印刷完了',
          message: `${item.productName}の配送ラベルを生成しました`,
          type: 'success'
        });
      } catch (error) {
        console.error('PDF生成エラー:', error);
        showToast({
          title: 'エラー',
          message: '配送ラベルの生成に失敗しました',
          type: 'error'
        });
      }
    } else {
      showToast({
        title: '一括印刷開始',
        message: '一括配送ラベル印刷を開始します',
        type: 'info'
      });

      try {
        // 梱包済みの商品のみをフィルタ
        const packedItems = items.filter(item => item.status === 'packed');
        
        if (packedItems.length === 0) {
          showToast({
            title: '印刷対象なし',
            message: '梱包済みの商品がありません',
            type: 'warning'
          });
          return;
        }

        // 各アイテムのラベルを順次生成
        for (const item of packedItems) {
          const labelData = {
            orderNumber: item.orderNumber,
            productName: item.productName,
            productSku: item.productSku,
            customer: item.customer,
            shippingAddress: item.shippingAddress,
            shippingMethod: item.shippingMethod,
            value: item.value,
          };

          const response = await fetch('/api/pdf/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'shipping-label',
              data: labelData,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            
            const binaryString = atob(result.base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/pdf' });
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = result.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }

        showToast({
          title: '一括印刷完了',
          message: `${packedItems.length}件の配送ラベルを生成しました`,
          type: 'success'
        });
      } catch (error) {
        console.error('一括PDF生成エラー:', error);
        showToast({
          title: 'エラー',
          message: '一括配送ラベルの生成に失敗しました',
          type: 'error'
        });
      }
    }
  };

  const handlePackingInstruction = (item: ShippingItem) => {
    setSelectedPackingItem(item);
    setIsPackingVideoModalOpen(true);
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
        message: `${selectedPackingItem.productName}の梱包が完了しました (倉庫保管中)`,
        type: 'success'
      });
      setSelectedPackingItem(null);
      setIsPackingVideoModalOpen(false);
    }
  };

  const handleCarrierSettings = () => {
    setIsCarrierModalOpen(true);
  };

  const handleMaterialsCheck = () => {
    setIsMaterialsModalOpen(true);
  };

  const handleCarrierSave = (settings: any) => {
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
      showToast({
        title: 'エラー',
        message: '設定の保存に失敗しました',
        type: 'error'
      });
    });
  };

  const handleMaterialsOrder = (materials: any[]) => {
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
      showToast({
        title: 'エラー',
        message: '発注処理に失敗しました',
        type: 'error'
      });
    });
  };

  // 行の展開/折りたたみ
  const toggleRowExpansion = (itemId: string) => {
    setExpandedRows(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // 一括選択
  const handleSelectAll = () => {
    if (selectedItems.length === paginatedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedItems.map(item => item.id));
    }
  };

  // 個別選択
  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // インライン作業処理
  const handleInlineAction = (item: ShippingItem, action: string) => {
    switch (action) {
      case 'inspect':
        updateItemStatus(item.id, 'inspected');
        break;
      case 'pack':
        handlePackingInstruction(item);
        break;
      case 'print':
        handlePrintLabel(item);
        break;
      case 'ship':
        updateItemStatus(item.id, 'shipped');
        break;
      default:
        break;
    }
  };

  const handleShowDetails = (item: ShippingItem) => {
    setSelectedDetailItem(item);
  };

  const stats = {
    total: items.length,
    pendingInspection: items.filter(i => i.status === 'pending_inspection').length,
    inspected: items.filter(i => i.status === 'inspected').length,
    packed: items.filter(i => i.status === 'packed').length,
    shipped: items.filter(i => i.status === 'shipped').length,
    ready_for_pickup: items.filter(i => i.status === 'ready_for_pickup').length,
    urgent: items.filter(i => i.priority === 'urgent' && i.status !== 'delivered').length,
    todayCount: items.filter(i => {
      const today = new Date();
      const itemTime = i.dueDate.split(':');
      const itemDate = new Date();
      itemDate.setHours(parseInt(itemTime[0]), parseInt(itemTime[1]));
      return itemDate.toDateString() === today.toDateString();
    }).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoadingSpinner size="lg" />
      </div>
    );
  }

  const headerActions = (
    <div className="grid grid-cols-2 gap-3 w-full max-w-md">
      <NexusButton
        onClick={() => setIsBarcodeScannerOpen(true)}
        variant="default"
        size="sm"
        className="flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
        </svg>
        <span className="hidden sm:inline">バーコード</span>
        <span className="sm:hidden">スキャン</span>
      </NexusButton>
      <NexusButton
        onClick={handleCarrierSettings}
        variant="default"
        size="sm"
        className="flex items-center justify-center gap-2"
      >
        <TruckIcon className="w-4 h-4" />
        <span className="hidden sm:inline">配送設定</span>
        <span className="sm:hidden">配送</span>
      </NexusButton>
      <NexusButton
        onClick={handleMaterialsCheck}
        variant="primary"
        size="sm"
        className="flex items-center justify-center gap-2 col-span-2"
      >
        <ArchiveBoxIcon className="w-4 h-4" />
        <span className="hidden sm:inline">梱包資材確認</span>
        <span className="sm:hidden">資材確認</span>
      </NexusButton>
    </div>
  );

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="出荷管理"
          subtitle="eBayからの出荷指示を一元管理・処理"
          userType="staff"
          iconType="shipping"
          actions={headerActions}
        />

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

        {/* Stats Cards - 統合ダッシュボード */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="intelligence-card global">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="action-orb w-6 h-6">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <span className="status-badge info text-[10px]">総計</span>
                </div>
                <div className="metric-value font-display text-2xl font-bold text-nexus-text-primary">
                  {stats.total}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                  総出荷案件
                </div>
              </div>
            </div>

            <div className="intelligence-card americas">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="action-orb orange w-6 h-6">
                    <ClipboardDocumentCheckIcon className="w-4 h-4" />
                  </div>
                  <span className="status-badge warning text-[10px]">待機</span>
                </div>
                <div className="metric-value font-display text-2xl font-bold text-nexus-text-primary">
                  {stats.pendingInspection}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                  検品待ち
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="action-orb green w-6 h-6">
                    <CheckCircleIcon className="w-4 h-4" />
                  </div>
                  <span className="status-badge success text-[10px]">検品済</span>
                </div>
                <div className="metric-value font-display text-2xl font-bold text-nexus-text-primary">
                  {stats.inspected}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                  梱包待ち
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-6 text-center">
                <TruckIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-nexus-text-primary">{stats.packed}</div>
                <div className="text-sm text-nexus-text-secondary">出荷待ち</div>
              </div>
            </div>
            
            <div className="intelligence-card global">
              <div className="p-6 text-center">
                <ArchiveBoxIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-nexus-text-primary">{stats.ready_for_pickup}</div>
                <div className="text-sm text-nexus-text-secondary">集荷準備中</div>
              </div>
            </div>

            <div className="intelligence-card global">
              <div className="p-6 text-center">
                <ExclamationCircleIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-nexus-text-primary">{stats.urgent}</div>
                <div className="text-sm text-nexus-text-secondary">緊急案件</div>
              </div>
            </div>

            <div className="intelligence-card global">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="action-orb w-6 h-6">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="status-badge warning text-[10px]">本日</span>
                </div>
                <div className="metric-value font-display text-2xl font-bold text-nexus-text-primary">
                  {stats.todayCount}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                  本日出荷
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ステータス別タブビュー */}
        <div className="intelligence-card global">
          <div className="p-8">
            {/* タブヘッダー */}
            <div className="border-b border-nexus-border mb-6">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {[
                  { id: 'all', label: '全体', count: stats.total },
                  { id: 'pending_inspection', label: '検品待ち', count: stats.pendingInspection },
                  { id: 'inspected', label: '梱包待ち', count: stats.inspected },
                  { id: 'packed', label: '出荷待ち', count: stats.packed },
                  { id: 'ready_for_pickup', label: '集荷準備中', count: stats.ready_for_pickup },
                  { id: 'today', label: '本日出荷', count: stats.todayCount },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors
                      ${activeTab === tab.id
                        ? 'border-nexus-blue text-nexus-blue'
                        : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-gray-300'
                      }
                    `}
                  >
                    {tab.label}
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === tab.id ? 'bg-nexus-blue text-white' : 'bg-nexus-bg-secondary text-nexus-text-secondary'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* フィルターとアクション */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <NexusSelect
                  label=""
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  variant="nexus"
                  className="w-32"
                  options={[
                    { value: 'all', label: '全優先度' },
                    { value: 'urgent', label: '緊急のみ' },
                    { value: 'normal', label: '通常のみ' },
                    { value: 'low', label: '低のみ' }
                  ]}
                />
              </div>

              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-nexus-text-secondary">
                    {selectedItems.length}件選択中
                  </span>
                  <NexusButton
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      // 一括処理実行
                      showToast({
                        title: '一括処理',
                        message: `${selectedItems.length}件の処理を開始します`,
                        type: 'info'
                      });
                    }}
                  >
                    一括処理
                  </NexusButton>
                </div>
              )}
            </div>

            {/* 出荷案件一覧 - インライン作業機能付き */}
            <div className="holo-table">
              <table className="w-full">
                <thead className="holo-header">
                  <tr>
                    <th className="w-10 p-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-nexus-border"
                      />
                    </th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">注文情報</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">商品情報</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">進捗状況</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">優先度</th>
                    <th className="text-right p-4 font-medium text-nexus-text-secondary">アクション</th>
                  </tr>
                </thead>
                <tbody className="holo-body">
                  {paginatedItems.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr className="holo-row">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="rounded border-nexus-border"
                          />
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-nexus-text-primary">{item.orderNumber}</p>
                            <p className="text-sm text-nexus-text-secondary mt-1">{item.customer}</p>
                            <p className="text-sm text-nexus-yellow mt-1">期限: {item.dueDate}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="action-orb">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                            <div 
                              className="cursor-pointer hover:text-nexus-blue transition-colors"
                              onClick={() => handleShowDetails(item)}
                            >
                              <div className="font-semibold text-nexus-text-primary hover:underline">
                                {item.productName}
                              </div>
                              <p className="text-sm text-nexus-text-secondary">
                                SKU: {item.productSku}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-2">
                            <BusinessStatusIndicator status={item.status} />
                            <button
                              onClick={() => toggleRowExpansion(item.id)}
                              className="text-xs text-nexus-blue hover:text-nexus-blue-dark flex items-center gap-1"
                            >
                              <span>詳細を{expandedRows.includes(item.id) ? '隠す' : '見る'}</span>
                              <svg 
                                className={`w-3 h-3 transform transition-transform ${expandedRows.includes(item.id) ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`cert-nano ${
                            item.priority === 'urgent' ? 'cert-ruby' :
                            item.priority === 'normal' ? 'cert-mint' : 'cert-gold'
                          }`}>
                            {priorityLabels[item.priority]}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            {item.status === 'pending_inspection' && (
                              <NexusButton
                                onClick={() => handleInlineAction(item, 'inspect')}
                                variant="primary"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                                検品完了
                              </NexusButton>
                            )}
                            {item.status === 'inspected' && (
                              <NexusButton
                                onClick={() => handleInlineAction(item, 'pack')}
                                variant="primary"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <CubeIcon className="w-4 h-4" />
                                梱包
                              </NexusButton>
                            )}
                            {item.status === 'packed' && (
                              <>
                                <NexusButton
                                  onClick={() => handleInlineAction(item, 'print')}
                                  variant="default"
                                  size="sm"
                                  className="flex items-center gap-1"
                                >
                                  <PrinterIcon className="w-4 h-4" />
                                  ラベル
                                </NexusButton>
                                <NexusButton
                                  onClick={() => handleInlineAction(item, 'ship')}
                                  variant="primary"
                                  size="sm"
                                  className="flex items-center gap-1"
                                >
                                  <TruckIcon className="w-4 h-4" />
                                  出荷
                                </NexusButton>
                              </>
                            )}
                            <NexusButton
                              onClick={() => setSelectedDetailItem(item)}
                              variant="default"
                              size="sm"
                            >
                              詳細
                            </NexusButton>
                          </div>
                        </td>
                      </tr>
                      
                      {/* 展開行 - ワークフロー進捗表示 */}
                      {expandedRows.includes(item.id) && (
                        <tr className="holo-row bg-nexus-bg-secondary">
                          <td colSpan={6} className="p-6">
                            <div className="space-y-4">
                              <WorkflowProgress 
                                steps={getWorkflowProgress(item.status as ShippingStatus)}
                              />
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-nexus-text-secondary">
                                  <p>配送先: {item.shippingAddress}</p>
                                  <p>配送方法: {item.shippingMethod}</p>
                                  {item.trackingNumber && (
                                    <p>追跡番号: <span className="font-medium">{item.trackingNumber}</span></p>
                                  )}
                                </div>
                                <div className="bg-nexus-bg-primary rounded-lg p-3">
                                  <p className="text-sm font-medium text-nexus-text-primary">次のアクション</p>
                                  <p className="text-sm text-nexus-text-secondary mt-1">
                                    {getNextAction(item.status as ShippingStatus)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {paginatedItems.length === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-nexus-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-nexus-text-primary">出荷案件がありません</h3>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  条件に一致する出荷案件がありません
                </p>
              </div>
            )}

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

        {/* Barcode Scanner Section */}
        {isBarcodeScannerOpen && (
          <div className="intelligence-card global">
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-nexus-text-primary">バーコードスキャナー</h3>
                <NexusButton
                  onClick={() => setIsBarcodeScannerOpen(false)}
                  variant="default"
                >
                  閉じる
                </NexusButton>
              </div>
              <BarcodeScanner
                onScan={handleBarcodeScanned}
                placeholder="商品バーコードをスキャンしてください"
                scanType="product"
              />
            </div>
          </div>
        )}

        {/* Shipping Detail Modal */}
        <ShippingDetailModal
          isOpen={selectedDetailItem !== null}
          onClose={() => setSelectedDetailItem(null)}
          item={selectedDetailItem}
          onStatusUpdate={updateItemStatus}
          onPrintLabel={handlePrintLabel}
          onPackingInstruction={handlePackingInstruction}
        />

        {/* Packing Video Modal */}
        {selectedPackingItem && (
          <PackingVideoModal
            isOpen={isPackingVideoModalOpen}
            onClose={() => {
              setIsPackingVideoModalOpen(false);
              setSelectedPackingItem(null);
            }}
            productId={selectedPackingItem.id}
            productName={selectedPackingItem.productName}
            onComplete={handlePackingComplete}
          />
        )}

      </div>
    </DashboardLayout>
  );
}