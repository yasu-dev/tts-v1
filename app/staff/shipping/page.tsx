'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import WorkflowProgress from '@/app/components/ui/WorkflowProgress';

import PackingVideoModal from '@/app/components/modals/PackingVideoModal';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArchiveBoxArrowDownIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CubeIcon,
  PrinterIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

import CarrierSelectionModal from '@/app/components/modals/CarrierSelectionModal';


import ShippingDetailModal from '@/app/components/modals/ShippingDetailModal';
import BundlePackingConfirmModal from '@/app/components/modals/BundlePackingConfirmModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import NexusSelect from '@/app/components/ui/NexusSelect';
import NexusButton from '@/app/components/ui/NexusButton';
import Pagination from '@/app/components/ui/Pagination';
import { NexusLoadingSpinner } from '@/app/components/ui';

import { getWorkflowProgress, getNextAction, ShippingStatus } from '@/lib/utils/workflow';
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator';
import TrackingNumberDisplay from '@/app/components/ui/TrackingNumberDisplay';
import { generateTrackingUrl } from '@/lib/utils/tracking';
import React from 'react'; // Added missing import for React

interface ShippingItem {
  id: string;
  productName: string;
  productSku: string;
  orderNumber: string;
  customer: string;
  shippingAddress: string;
  status: 'storage' | 'ordered' | 'picked' | 'workstation' | 'packed' | 'shipped' | 'ready_for_pickup';

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


  const [selectedPackingItem, setSelectedPackingItem] = useState<ShippingItem | null>(null);
  const [shippingData, setShippingData] = useState<{
    items: ShippingItem[];
    stats: { totalShipments: number; pendingShipments: number; };
  } | null>(null);
  const [loading, setLoading] = useState(true);

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
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    // APIから配送データを取得
      const fetchShippingItems = async (page: number = 1, limit: number = itemsPerPage) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/shipping?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shipping data');
      }
      const data = await response.json();
      
      console.log(`📦 出荷データAPI応答:`, data.pagination);
      
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
      
      // ページネーション情報を保存
      if (data.pagination) {
        setTotalItems(data.pagination.totalCount);
        setTotalPages(data.pagination.totalPages);
      }
      
      console.log(`✅ 配送データ取得完了: ${shippingItems.length}件 (ページ: ${page}/${data.pagination?.totalPages || 1})`);
        
        // 基本統計データも設定
        setShippingData({
          items: shippingItems,
          stats: { 
            totalShipments: shippingItems.length, 
            pendingShipments: shippingItems.filter(item => item.status !== 'shipped').length 
          }
        });
        
      } catch (error) {
        console.error('配送データ取得エラー:', error);
        // フォールバック: 空配列
        setItems([]);
        setShippingData({ items: [], stats: { totalShipments: 0, pendingShipments: 0 } });
      } finally {
        setLoading(false);
      }
    };

    fetchShippingItems(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // タブごとのフィルタリング
  const tabFilters: Record<string, (item: ShippingItem) => boolean> = {
    'all': (item) => ['picked', 'workstation', 'packed', 'shipped', 'ready_for_pickup'].includes(item.status),
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

  // サーバーサイドページネーション: itemsは既にAPIでページネーションされているためフィルタリングのみ
  const paginatedItems = useMemo(() => {
    return filteredItems; // サーバーサイドでページネーション済み
  }, [filteredItems]);

  // フィルター変更時はページを1に戻す
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // ステータス表示は BusinessStatusIndicator で統一
  const statusLabels: Record<string, string> = {
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



  const handleDownloadLabel = async (item?: ShippingItem) => {
    if (item) {
      showToast({
        title: 'ラベル取得中',
        message: `${item.productName}の配送ラベルを取得しています`,
        type: 'info'
      });

      try {
        // セラーが準備したラベルを取得
        const response = await fetch(`/api/shipping/label/get?orderId=${item.orderNumber}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('配送ラベルが見つかりません。セラーによるラベル準備をお待ちください。');
          }
          throw new Error('配送ラベルの取得に失敗しました');
        }

        const labelInfo = await response.json();
        
        // ラベルを新しいタブで表示（印刷可能）
        const newWindow = window.open(labelInfo.url, '_blank');
        if (newWindow) {
          newWindow.focus();
          showToast({
            title: 'ラベル表示',
            message: `${item.productName}の配送ラベルを新しいタブで表示しました。印刷してご利用ください。`,
            type: 'success'
          });
        } else {
          showToast({
            title: 'エラー',
            message: 'ポップアップがブロックされました。ブラウザの設定をご確認ください。',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('ラベルダウンロードエラー:', error);
        showToast({
          title: 'エラー',
          message: error instanceof Error ? error.message : '配送ラベルの取得に失敗しました',
          type: 'error'
        });
      }
    } else {
      showToast({
        title: '一括ラベル表示開始',
        message: '一括配送ラベル表示を開始します',
        type: 'info'
      });

      try {
        // 梱包済みの商品のみをフィルタ
        const packedItems = items.filter(item => item.status === 'packed');
        
        if (packedItems.length === 0) {
          showToast({
            title: 'ダウンロード対象なし',
            message: '梱包済みの商品がありません',
            type: 'warning'
          });
          return;
        }

        let successCount = 0;
        let errorCount = 0;

        // 各アイテムのラベルを順次新しいタブで表示
        for (const item of packedItems) {
          try {
            const response = await fetch(`/api/shipping/label/get?orderId=${item.orderNumber}`);
            
            if (response.ok) {
              const labelInfo = await response.json();
              // 新しいタブでラベルを表示
              const newWindow = window.open(labelInfo.url, '_blank');
              if (newWindow) {
                successCount++;
              } else {
                errorCount++;
              }
            } else {
              errorCount++;
            }
          } catch (error) {
            console.error(`ラベル表示エラー (${item.orderNumber}):`, error);
            errorCount++;
          }
          
          // タブを開く間隔を少し空ける（ブラウザ制限回避）
          if (packedItems.indexOf(item) < packedItems.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (successCount > 0) {
          showToast({
            title: '一括ラベル表示完了',
            message: `${successCount}件の配送ラベルを新しいタブで表示しました。印刷してご利用ください。${errorCount > 0 ? ` (${errorCount}件エラー)` : ''}`,
            type: successCount === packedItems.length ? 'success' : 'warning'
          });
        } else {
          showToast({
            title: 'ラベル表示失敗',
            message: 'すべての配送ラベルの表示に失敗しました',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('一括ラベルダウンロードエラー:', error);
        showToast({
          title: 'エラー',
          message: '一括配送ラベルのダウンロードに失敗しました',
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
      showToast({
        title: 'ラベル取得中',
        message: `${item.productName}の配送ラベルを取得しています...`,
        type: 'info'
      });

      // 複数のIDパターンで試行（item.id, item.orderNumber）
      const tryOrderIds = [item.orderNumber, item.id].filter(Boolean);
      let labelData = null;
      let response = null;

      for (const orderId of tryOrderIds) {
        try {
          console.log(`📦 ラベル取得試行: ${orderId}`);
          response = await fetch(`/api/shipping/label/get?orderId=${orderId}`);
          
          if (response.ok) {
            labelData = await response.json();
            console.log(`✅ ラベル取得成功: ${orderId}`, labelData);
            break;
          } else {
            console.log(`❌ ラベル取得失敗: ${orderId} - ${response.status}`);
          }
        } catch (fetchError) {
          console.log(`❌ ラベル取得エラー: ${orderId}`, fetchError);
          continue;
        }
      }
      
      if (!labelData) {
        showToast({
          title: 'ラベル未登録',
          message: 'セラーによるラベルのアップロードが必要です。この商品はまだピッキング作業を行えません。',
          type: 'warning'
        });
        return;
      }

      // ラベルを新しいタブで開く（印刷可能）
      const newWindow = window.open(labelData.url, '_blank');
      if (newWindow) {
        newWindow.focus();
        showToast({
          title: 'ラベル印刷準備完了',
          message: `配送ラベルを新しいタブで表示しました（提供者: ${labelData.provider === 'seller' ? 'セラー' : 'ワールドドア'}）。印刷してご利用ください。`,
          type: 'success'
        });
      } else {
        // ポップアップがブロックされた場合のフォールバック
        const link = document.createElement('a');
        link.href = labelData.url;
        link.download = `shipping_label_${item.orderNumber}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast({
          title: 'ラベル印刷完了',
          message: `配送ラベルをダウンロードしました（提供者: ${labelData.provider === 'seller' ? 'セラー' : 'ワールドドア'}）`,
          type: 'success'
        });
      }

    } catch (error) {
      console.error('ラベル印刷エラー:', error);
      showToast({
        title: 'エラー',
        message: 'ラベルの印刷に失敗しました。ネットワーク接続を確認してください。',
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
            <CubeIcon className="w-4 h-4" />
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
      await handleDownloadLabel(item);
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

  // ピックアップ処理は削除（ロケーション管理で実施）

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
        // セラーが生成したラベルを印刷
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
    total: items.filter(i => (!i.isBundled || i.isBundle) && ['picked', 'workstation', 'packed', 'shipped', 'ready_for_pickup'].includes(i.status)).length,
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



  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="出荷管理"
          subtitle="eBayからの出荷指示を一元管理・処理"
          userType="staff"
          iconType="shipping"
        />





        {/* ステータス別タブビュー */}
        <div className="intelligence-card global">
          <div className="p-8">
            {/* タブヘッダー */}
            <div className="border-b border-nexus-border mb-6">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {[
                  { id: 'all', label: '全体', count: stats.total },
                  { id: 'workstation', label: '梱包待ち', count: stats.workstation },
                  { id: 'packed', label: '梱包済み', count: stats.packed },
                  { id: 'ready_for_pickup', label: '集荷準備完了', count: stats.ready_for_pickup },
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
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">商品</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">注文情報</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">ステータス</th>
                    <th className="text-right p-4 font-medium text-nexus-text-secondary">操作</th>
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
                            <BusinessStatusIndicator 
                              status={
                                item.status === 'picked' ? 'processing' :
                                item.status === 'workstation' ? 'in_progress' :
                                item.status === 'packed' ? 'packed' :
                                item.status === 'ready_for_pickup' ? 'ready_for_pickup' :
                                item.status === 'shipped' ? 'shipped' :
                                'pending'
                              } 
                              size="sm" 
                              showLabel={true}
                            />
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

                            {/* ピックアップはロケーション管理で実施するため、ここでは不要 */}
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
                                  ラベル印刷
                                </NexusButton>
                                <NexusButton
                                  onClick={() => handleInlineAction(item, 'ship')}
                                  variant="primary"
                                  size="sm"
                                  className="flex items-center gap-1"
                                >
                                  <CubeIcon className="w-4 h-4" />
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
                              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                                <CheckCircleIcon className="w-4 h-4" />
                                <span className="font-medium">作業完了</span>
                                <span className="text-xs text-blue-500">（配送業者の集荷待ち）</span>
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
                                    <div className="mt-2 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">追跡番号:</span>
                                        <span 
                                          className="font-mono text-xs bg-nexus-bg-tertiary px-2 py-1 rounded border cursor-pointer hover:bg-nexus-bg-secondary transition-colors"
                                          onClick={() => navigator.clipboard.writeText(item.trackingNumber!)}
                                          title="クリックでコピー"
                                        >
                                          {item.trackingNumber}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => {
                                            const carrier = item.shippingMethod?.toLowerCase().includes('yamato') ? 'yamato' : 
                                                          item.shippingMethod?.toLowerCase().includes('sagawa') ? 'sagawa' : 
                                                          item.shippingMethod?.toLowerCase().includes('fedex') ? 'fedex' :
                                                          item.shippingMethod?.toLowerCase().includes('fedx') ? 'fedx' :
                                                          item.shippingMethod?.toLowerCase().includes('yupack') ? 'yupack' : 'other';
                                            const url = generateTrackingUrl(carrier, item.trackingNumber!);
                                            window.open(url, '_blank', 'noopener,noreferrer');
                                          }}
                                          className="px-3 py-1 bg-nexus-primary text-white text-xs rounded hover:bg-nexus-primary-dark transition-colors"
                                        >
                                          配送状況を確認
                                        </button>
                                        <span className="text-xs bg-nexus-success text-white px-2 py-1 rounded">
                                          eBay通知済み
                                        </span>
                                      </div>
                                    </div>
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
            {totalItems > 0 && (
              <div className="mt-6 pt-4 border-t border-nexus-border">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            )}
          </div>
        </div>



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