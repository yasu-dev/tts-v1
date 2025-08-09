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
import CarrierSelectionModal from '@/app/components/modals/CarrierSelectionModal';

import PackingMaterialsModal from '@/app/components/modals/PackingMaterialsModal';
import ShippingDetailModal from '@/app/components/modals/ShippingDetailModal';
import BundlePackingConfirmModal from '@/app/components/modals/BundlePackingConfirmModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import NexusSelect from '@/app/components/ui/NexusSelect';
import NexusButton from '@/app/components/ui/NexusButton';
import Pagination from '@/app/components/ui/Pagination';
import { NexusLoadingSpinner } from '@/app/components/ui';

import { getWorkflowProgress, getNextAction, ShippingStatus } from '@/lib/utils/workflow';
import React from 'react'; // Added missing import for React

interface ShippingItem {
  id: string;
  productName: string;
  productSku: string;
  orderNumber: string;
  customer: string;
  shippingAddress: string;
  status: 'storage' | 'picked' | 'workstation' | 'packed' | 'shipped' | 'ready_for_pickup';

  dueDate: string;
  inspectionNotes?: string;
  trackingNumber?: string;
  shippingMethod: string;
  value: number;
  location?: string; // Added location field
  productImages?: string[]; // Added productImages field
  inspectionImages?: string[]; // Added inspectionImages field
  
  // 同梱関連フィールド
  isBundle?: boolean; // 同梱パッケージかどうか
  bundledItems?: ShippingItem[]; // 同梱された商品リスト
  isBundled?: boolean; // 他の商品に同梱されているか
  bundleId?: string; // 同梱パッケージID
}

export default function StaffShippingPage() {
  const [items, setItems] = useState<ShippingItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

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
  const [isCarrierSelectionModalOpen, setIsCarrierSelectionModalOpen] = useState(false);
  const [selectedLabelItem, setSelectedLabelItem] = useState<ShippingItem | null>(null);
  const [isPackingVideoModalOpen, setIsPackingVideoModalOpen] = useState(false);
  const [isBundleConfirmModalOpen, setIsBundleConfirmModalOpen] = useState(false);
  const [bundleItems, setBundleItems] = useState<ShippingItem[]>([]);

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
    // APIから配送データを取得
    const fetchShippingItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders/shipping');
        if (!response.ok) {
          throw new Error('Failed to fetch shipping data');
        }
        const data = await response.json();
        
        // APIレスポンスの形式に合わせてデータを変換
        const shippingItems: ShippingItem[] = data.items ? data.items.map((item: any) => ({
          id: item.id,
          productName: item.productName,
          productSku: item.productSku,
          orderNumber: item.orderNumber,
          customer: item.customer,
          shippingAddress: item.shippingAddress,
          status: item.status,

          dueDate: item.dueDate,
          shippingMethod: item.shippingMethod,
          value: item.value,
          location: item.location,
          productImages: item.productImages || [],
          inspectionImages: item.inspectionImages || [],
          inspectionNotes: item.inspectionNotes,
        })) : [];
        
        setItems(shippingItems);
        console.log(`✅ 配送データ取得完了: ${shippingItems.length}件`);
      } catch (error) {
        console.error('配送データ取得エラー:', error);
        // フォールバック: 空配列
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingItems();
  }, []);

  // タブごとのフィルタリング
  const tabFilters: Record<string, (item: ShippingItem) => boolean> = {
    'all': () => true,
    'storage': (item) => item.status === 'storage',
    'workstation': (item) => item.status === 'picked' || item.status === 'workstation',
    'packed': (item) => item.status === 'packed',
    'ready_for_pickup': (item) => item.status === 'ready_for_pickup'
  };

  // フィルタリング
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 同梱された個別商品は表示しない
      if (item.isBundled && !item.isBundle) {
        return false;
      }
      
      const tabMatch = tabFilters[activeTab] ? tabFilters[activeTab](item) : true;
      return tabMatch;
    });
  }, [items, activeTab]);

  // ページネーション
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  // フィルター変更時はページを1に戻す
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // ステータス表示は BusinessStatusIndicator で統一
  const statusLabels: Record<string, string> = {
    'storage': '出荷待ち',
    'picked': 'ピッキング済み',
    'workstation': '梱包待ち',
    'packed': '梱包済み',
    'shipped': '集荷準備完了',
    'ready_for_pickup': '集荷準備完了'
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
          isBundle: item.isBundle,
          bundledItems: item.bundledItems
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
    
    // 梱包作業開始後にステータスを更新
    setTimeout(() => {
      updateItemStatus(item.id, 'packed');
      showToast({
        title: '梱包完了',
        message: `${item.productName}の梱包が完了しました`,
        type: 'success'
      });
    }, 2000); // 2秒後に自動的にpackedに更新（実際の梱包作業時間を想定）
  };

  const handlePrintLabelForItem = async (item: ShippingItem) => {
    // セラーがアップロードしたラベルを印刷
    try {
      // 実際の実装では、APIを呼び出してアップロード済みラベルを取得
      const response = await fetch(`/api/shipping/label/get?orderId=${item.id}`);
      
      if (!response.ok) {
        showToast({
          title: 'ラベル未登録',
          message: 'セラーによるラベルのアップロードが必要です',
          type: 'warning'
        });
        return;
      }

      const labelData = await response.json();
      
      // ラベルを印刷（ダウンロード）
      const link = document.createElement('a');
      link.href = labelData.url || '#';
      link.download = `shipping_label_${item.orderNumber}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        title: 'ラベル印刷完了',
        message: `配送ラベルを印刷しました（提供者: ${labelData.provider === 'seller' ? 'セラー' : 'ワールドドア'}）`,
        type: 'success'
      });

    } catch (error) {
      console.error('ラベル印刷エラー:', error);
      showToast({
        title: 'エラー',
        message: 'ラベルの印刷に失敗しました',
        type: 'error'
      });
    }
  };

  const handleCarrierSelect = async (carrier: any, service: string) => {
    // この関数は削除されました（セラーがラベル生成を行うため）
    console.warn('handleCarrierSelect is deprecated. Labels should be generated by sellers.');
    setIsCarrierSelectionModalOpen(false);
    setSelectedLabelItem(null);
    
    showToast({
        title: 'エラー',
        message: 'ラベル生成に失敗しました。もう一度お試しください。',
        type: 'error'
      });
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

  // 注意: 配送完了は配送業者トラッキングシステムから自動更新されるべき機能
  // 現在は手動操作として残すが、将来的にはAPIトラッキング連携に置き換え予定
  const handleDeliveryComplete = async (item: ShippingItem) => {
    try {
      // 確認ダイアログを表示
      const confirmed = window.confirm(
        `注意：配送完了は通常、配送業者のトラッキングシステムから自動更新されます。\n` +
        `手動で配送完了にしますか？\n\n` +
        `注文: ${item.orderNumber}\n` +
        `商品: ${item.productName}`
      );

      if (!confirmed) {
        return;
      }

      const response = await fetch('/api/orders/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: item.orderNumber, 
          status: '配送完了' 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '配送完了処理に失敗しました');
      }

      // 配送完了後はアイテムを一覧から除去（配送済みのため）
      setItems(prev => prev.filter(i => i.id !== item.id));
      
      showToast({
        type: 'success',
        title: '配送完了（手動処理）',
        message: `注文 ${item.orderNumber} の配送完了処理を行いました`,
        duration: 3000
      });
    } catch (error) {
      console.error('配送完了エラー:', error);
      showToast({
        type: 'error',
        title: '配送完了エラー',
        message: error instanceof Error ? error.message : '配送完了処理中にエラーが発生しました',
        duration: 4000
      });
    }
  };

  // 出荷処理
  const handleShipItem = async (item: ShippingItem) => {
    try {
      // TODO: 実際のAPIが実装されたら以下のコメントを解除
      // const response = await fetch('/api/orders/shipping', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     orderId: item.orderNumber,
      //     trackingNumber: `TRK-${Date.now()}`,
      //     carrier: 'ヤマト運輸',
      //     shippingMethod: 'ヤマト宅急便',
      //     notes: '出荷処理完了',
      //     isBundle: item.isBundle,
      //     bundledItems: item.bundledItems
      //   })
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || '出荷処理に失敗しました');
      // }

      // 一時的にローカルステートのみ更新
      updateItemStatus(item.id, 'ready_for_pickup');
      
      // 同梱パッケージの場合の表示メッセージを調整
      const orderDisplay = item.isBundle && item.bundledItems 
        ? `同梱パッケージ（${item.bundledItems.length}件）`
        : `注文 ${item.orderNumber}`;
      
      showToast({
        type: 'success',
        title: '作業完了',
        message: `${orderDisplay} の集荷エリアへの移動が完了しました（配送業者の集荷待ち）`,
        duration: 3000
      });
    } catch (error) {
      console.error('出荷処理エラー:', error);
      showToast({
        type: 'error',
        title: '出荷処理エラー',
        message: error instanceof Error ? error.message : '出荷処理中にエラーが発生しました',
        duration: 4000
      });
    }
  };

  // 一括アクションボタンの生成
  const getBulkActionButton = () => {
    const selectedItemData = items.filter(item => selectedItems.includes(item.id));
    
    if (selectedItemData.length === 0) return null;

    // 選択されたアイテムのステータスを分析
    const statusCounts = selectedItemData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 梱包待ち商品が複数選択されている場合は同梱梱包を提案
    const workstationCount = (statusCounts['workstation'] || 0) + (statusCounts['picked'] || 0);
    const packedCount = statusCounts['packed'] || 0;

    if (workstationCount >= 2) {
      return (
        <div className="flex items-center gap-2">
          <NexusButton
            variant="primary"
            size="sm"
            onClick={handleBundlePacking}
            className="flex items-center gap-1"
          >
            <CubeIcon className="w-4 h-4" />
            同梱梱包開始 ({workstationCount}件)
          </NexusButton>
        </div>
      );
    } else if (workstationCount === 1) {
      return (
        <NexusButton
          variant="primary"
          size="sm"
          onClick={() => {
            const workstationItem = selectedItemData.find(item => 
              item.status === 'workstation' || item.status === 'picked'
            );
            if (workstationItem) handleInlineAction(workstationItem, 'pack');
          }}
          className="flex items-center gap-1"
        >
          <CubeIcon className="w-4 h-4" />
          梱包開始
        </NexusButton>
      );
    } else if (packedCount >= 1) {
      const packedItems = selectedItemData.filter(item => item.status === 'packed');
      return (
        <div className="flex items-center gap-2">
          <NexusButton
            variant="default"
            size="sm"
            onClick={() => handleBulkPrintLabels(packedItems)}
            className="flex items-center gap-1"
          >
            <PrinterIcon className="w-4 h-4" />
            一括ラベル印刷 ({packedCount}件)
          </NexusButton>
          <NexusButton
            variant="primary"
            size="sm"
            onClick={() => handleBulkShip(packedItems)}
            className="flex items-center gap-1"
          >
            <TruckIcon className="w-4 h-4" />
            集荷エリアへ移動 ({packedCount}件)
          </NexusButton>
        </div>
      );
    }

    return (
      <NexusButton
        variant="secondary"
        size="sm"
        onClick={() => {
          showToast({
            title: '選択内容確認',
            message: `選択された商品は現在一括処理できません`,
            type: 'info'
          });
        }}
      >
        選択確認
      </NexusButton>
    );
  };

  // 同梱梱包処理
  const handleBundlePacking = async () => {
    const selectedItemData = items.filter(item => selectedItems.includes(item.id));
    const workstationItems = selectedItemData.filter(item => 
      (item.status === 'workstation' || item.status === 'picked') && !item.isBundle
    );

    if (workstationItems.length < 2) {
      showToast({
        title: '同梱不可',
        message: '同梱には個別の梱包待ち商品が2件以上必要です',
        type: 'warning'
      });
      return;
    }

    // 同梱確認モーダルを表示
    setBundleItems(workstationItems);
    setIsBundleConfirmModalOpen(true);
  };

  // 同梱確認後の処理
  const handleBundleConfirm = async () => {
    try {
      // 同梱ID生成
      const bundleId = `BUNDLE-${Date.now()}`;
      
      // 同梱された商品の合計価値を計算
      const totalValue = bundleItems.reduce((sum, item) => sum + (item.value || 0), 0);
      
      // 最も早い期限を取得
      const earliestDueDate = bundleItems
        .map(item => item.dueDate)
        .sort()[0];
      
      // 同梱パッケージの作成
      const bundlePackage: ShippingItem = {
        id: bundleId,
        productName: `同梱パッケージ (${bundleItems.length}件)`,
        productSku: bundleId,
        orderNumber: bundleItems.map(item => item.orderNumber).join(', '),
        customer: bundleItems[0].customer, // 同じ顧客と仮定
        shippingAddress: bundleItems[0].shippingAddress, // 同じ配送先と仮定
        status: 'packed',
        dueDate: earliestDueDate,
        shippingMethod: bundleItems[0].shippingMethod,
        value: totalValue,
        isBundle: true,
        bundledItems: bundleItems.map(item => ({ ...item, isBundled: true, bundleId }))
      };
      
      // アイテムリストを更新：個別商品を非表示にし、同梱パッケージを追加
      setItems(prev => {
        // 同梱された商品をフィルタリング（非表示）
        const filteredItems = prev.map(item => {
          if (bundleItems.some(bi => bi.id === item.id)) {
            return { ...item, isBundled: true, bundleId, status: 'packed' as const };
          }
          return item;
        });
        
        // 同梱パッケージを追加
        return [...filteredItems, bundlePackage];
      });

      // 選択解除
      setSelectedItems([]);
      setBundleItems([]);

      showToast({
        title: '同梱梱包完了',
        message: `${bundleItems.length}件の商品を同梱パッケージとして作成しました`,
        type: 'success'
      });

      // 梱包モーダルを表示
      setSelectedPackingItem(bundlePackage);
      setIsPackingVideoModalOpen(true);

    } catch (error) {
      console.error('同梱梱包エラー:', error);
      showToast({
        title: 'エラー',
        message: '同梱梱包処理に失敗しました',
        type: 'error'
      });
    }
  };

  // 一括ラベル印刷
  const handleBulkPrintLabels = async (packedItems: ShippingItem[]) => {
    for (const item of packedItems) {
      await handlePrintLabel(item);
    }
    setSelectedItems([]);
  };

  // 一括集荷準備
  const handleBulkShip = async (packedItems: ShippingItem[]) => {
    for (const item of packedItems) {
      updateItemStatus(item.id, 'ready_for_pickup');
    }
    setSelectedItems([]);
    showToast({
      title: '一括作業完了',
      message: `${packedItems.length}件の商品を集荷エリアへ移動しました`,
      type: 'success'
    });
  };

  // インライン作業処理
  const handleInlineAction = (item: ShippingItem, action: string) => {
    switch (action) {
      case 'inspect':
        updateItemStatus(item.id, 'packed');
        break;
      case 'pack':
        handlePackingInstruction(item);
        break;
      case 'print':
        // セラーがアップロードしたラベルを印刷
        handlePrintLabelForItem(item);
        break;
      case 'ship':
        handleShipItem(item);
        break;
      case 'deliver':
        handleDeliveryComplete(item);
        break;
      default:
        break;
    }
  };

  const handleShowDetails = (item: ShippingItem) => {
    setSelectedDetailItem(item);
  };

  const stats = {
    total: items.filter(i => !i.isBundled || i.isBundle).length,
    storage: items.filter(i => (!i.isBundled || i.isBundle) && i.status === 'storage').length,
    workstation: items.filter(i => (!i.isBundled || i.isBundle) && (i.status === 'picked' || i.status === 'workstation')).length,
    packed: items.filter(i => (!i.isBundled || i.isBundle) && i.status === 'packed').length,
    shipped: items.filter(i => (!i.isBundled || i.isBundle) && i.status === 'shipped').length,
    ready_for_pickup: items.filter(i => (!i.isBundled || i.isBundle) && i.status === 'ready_for_pickup').length
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



        {/* ステータス別タブビュー */}
        <div className="intelligence-card global">
          <div className="p-8">
            {/* タブヘッダー */}
            <div className="border-b border-nexus-border mb-6">
              <nav className="-mb-px flex items-center" aria-label="Tabs">
                {/* 作業があるタブグループ */}
                <div className="flex space-x-6 border-r border-nexus-border pr-6 mr-6">
                  <span className="text-xs text-nexus-text-tertiary font-medium uppercase tracking-wider self-center">作業中</span>
                  {[
                    { id: 'all', label: '全体', count: stats.total },
                    { id: 'storage', label: 'ピッキング待ち', count: stats.storage },
                    { id: 'workstation', label: '梱包待ち', count: stats.workstation },
                    { id: 'packed', label: '梱包済み', count: stats.packed },
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
                </div>
                
                {/* 作業がないタブグループ */}
                <div className="flex items-center space-x-6">
                  <span className="text-xs text-nexus-text-tertiary font-medium uppercase tracking-wider">作業完了</span>
                  <button
                    onClick={() => setActiveTab('ready_for_pickup')}
                    className={`
                      whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors
                      ${activeTab === 'ready_for_pickup'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-gray-300'
                      }
                    `}
                  >
                    集荷準備完了
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === 'ready_for_pickup' ? 'bg-green-100 text-green-800' : 'bg-nexus-bg-secondary text-nexus-text-secondary'
                    }`}>
                      {stats.ready_for_pickup}
                    </span>
                  </button>
                </div>
              </nav>
            </div>

            {/* フィルターとアクション */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                {/* フィルター削除 - 先入れ先出しで処理 */}
              </div>

              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-nexus-text-secondary">
                    {selectedItems.length}件選択中
                  </span>
                  {getBulkActionButton()}
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
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">商品情報</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">注文情報</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">ステータス</th>
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
                          <div className="flex items-center space-x-3">
                            <div className="action-orb">
                              {item.isBundle ? (
                                <CubeIcon className="w-5 h-5" />
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              )}
                            </div>
                            <div 
                              className="cursor-pointer hover:text-nexus-blue transition-colors"
                              onClick={() => handleShowDetails(item)}
                            >
                              <div className="font-semibold hover:underline flex items-center gap-2 text-nexus-text-primary">
                                {item.productName}
                                {item.isBundle && (
                                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-nexus-blue/20 text-nexus-blue rounded-full">
                                    同梱
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-nexus-text-secondary">
                                SKU: {item.productSku}
                              </p>
                              {item.isBundle && item.bundledItems && (
                                <div className="mt-1 text-xs text-nexus-text-secondary">
                                  含む商品: {item.bundledItems.map(bi => bi.productName).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-nexus-text-primary">{item.orderNumber}</p>
                            <p className="text-sm text-nexus-text-secondary mt-1">{item.customer}</p>
                            <p className="text-sm text-nexus-yellow mt-1">期限: {item.dueDate}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.status === 'storage' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              item.status === 'picked' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              item.status === 'workstation' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              item.status === 'packed' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              item.status === 'ready_for_pickup' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              item.status === 'shipped' ? 'bg-nexus-blue/20 text-nexus-blue dark:bg-nexus-blue/30 dark:text-nexus-blue' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {statusLabels[item.status]}
                            </span>
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
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            {item.status === 'storage' && (
                              <div className="flex items-center gap-2 text-sm text-nexus-text-secondary bg-nexus-bg-secondary px-3 py-2 rounded-lg">
                                <svg className="w-4 h-4 text-nexus-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>ピッキング待ち</span>
                                <span className="text-xs text-nexus-text-tertiary">(ロケーション管理で処理)</span>
                              </div>
                            )}
                            {(item.status === 'picked' || item.status === 'workstation') && (
                              <NexusButton
                                onClick={() => handleInlineAction(item, 'pack')}
                                variant="primary"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <CubeIcon className="w-4 h-4" />
                                梱包開始
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
                                  集荷エリアへ移動
                                </NexusButton>
                              </>
                            )}
                            {item.status === 'shipped' && (
                              <NexusButton
                                onClick={() => handleInlineAction(item, 'deliver')}
                                variant="primary"
                                size="sm"
                                className="flex items-center gap-1"
                                title="本来は配送業者トラッキングAPIから自動更新される機能"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                                配送完了（手動）
                              </NexusButton>
                            )}
                            {item.status === 'ready_for_pickup' && (
                              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                                <CheckCircleIcon className="w-4 h-4" />
                                <span className="font-medium">作業完了</span>
                                <span className="text-xs text-green-500">（配送業者の集荷待ち）</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* 展開行 - ワークフロー進捗表示 */}
                      {expandedRows.includes(item.id) && (
                        <tr className="holo-row bg-nexus-bg-secondary">
                          <td colSpan={5} className="p-6">
                            <div className="space-y-4">
                              <WorkflowProgress 
                                steps={getWorkflowProgress(item.status as ShippingStatus)}
                              />
                              
                              {/* 同梱パッケージの詳細 */}
                              {item.isBundle && item.bundledItems && (
                                <div className="bg-nexus-bg-primary rounded-lg p-4 border border-nexus-border">
                                  <h4 className="text-sm font-medium text-nexus-text-primary mb-3 flex items-center gap-2">
                                    <CubeIcon className="w-4 h-4" />
                                    同梱内容 ({item.bundledItems.length}件)
                                  </h4>
                                  <div className="space-y-2">
                                    {item.bundledItems.map((bundledItem, index) => (
                                      <div key={bundledItem.id} className="flex items-start gap-3 text-sm">
                                        <span className="inline-flex items-center justify-center w-5 h-5 bg-nexus-blue/20 text-nexus-blue text-xs font-medium rounded-full flex-shrink-0">
                                          {index + 1}
                                        </span>
                                        <div className="flex-1">
                                          <p className="font-medium text-nexus-text-primary">{bundledItem.productName}</p>
                                          <div className="flex items-center gap-4 mt-1 text-nexus-text-secondary">
                                            <span>SKU: {bundledItem.productSku}</span>
                                            <span>注文: {bundledItem.orderNumber}</span>
                                            <span>価値: ¥{bundledItem.value?.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-nexus-border">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-nexus-text-secondary">合計価値</span>
                                      <span className="font-semibold text-nexus-text-primary">
                                        ¥{item.value.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
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

        {/* Carrier Selection Modal */}
        <CarrierSelectionModal
          isOpen={isCarrierSelectionModalOpen}
          onClose={() => {
            setIsCarrierSelectionModalOpen(false);
            setSelectedLabelItem(null);
          }}
          onCarrierSelect={handleCarrierSelect}
          item={selectedLabelItem}
        />

        {/* Bundle Packing Confirm Modal */}
        <BundlePackingConfirmModal
          isOpen={isBundleConfirmModalOpen}
          onClose={() => {
            setIsBundleConfirmModalOpen(false);
            setBundleItems([]);
          }}
          onConfirm={handleBundleConfirm}
          items={bundleItems}
        />

      </div>
    </DashboardLayout>
  );
}