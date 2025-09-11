'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import {
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { useSystemSetting, useCarriers } from '@/lib/hooks/useMasterData';

import NexusButton from '@/app/components/ui/NexusButton';
import BaseModal from '@/app/components/ui/BaseModal';
import { NexusLoadingSpinner, NexusSelect, NexusInput, NexusCheckbox, NexusTextarea } from '@/app/components/ui';
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator';
import Pagination from '@/app/components/ui/Pagination';
import ShippingLabelUploadModal from '@/app/components/modals/ShippingLabelUploadModal';
import TrackingNumberDisplay from '@/app/components/ui/TrackingNumberDisplay';
import { generateTrackingUrl } from '@/lib/utils/tracking';
import FedExServiceModal from '@/app/components/modals/FedExServiceModal';
import OrderDetailModal from '@/app/components/modals/OrderDetailModal';
import SalesBundleModal from '@/app/components/modals/SalesBundleModal';
import { 
  TruckIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  EyeIcon,
  ClipboardDocumentCheckIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

export default function SalesPage() {
  const { showToast } = useToast();
  const [salesData, setSalesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFedexModalOpen, setIsFedexModalOpen] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<string>('');
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<any>(null);
  const [selectedFedexService, setSelectedFedexService] = useState<string>('');
  
  // ページネーションとフィルター用の状態
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(20);
  
  // 同梱機能用の状態（競合回避のためsalesプレフィックス使用）
  const [salesBundleItems, setSalesBundleItems] = useState<string[]>([]);
  const [isSalesBundleModalOpen, setIsSalesBundleModalOpen] = useState(false);
  
  // マスタデータの取得
  const { setting: orderStatuses } = useSystemSetting('order_statuses');
  const { carriers: carrierData, loading: carriersLoading } = useCarriers();
  
  const router = useRouter();
  
  // 同梱グループ情報の状態管理
  const [bundleGroups, setBundleGroups] = useState<{[key: string]: any}>({});
  
  // 同梱グループ情報を読み込む関数
  const loadBundleGroupsInfo = async (orders: any[]) => {
    const bundleGroupsInfo: {[key: string]: any} = {};
    const processedBundleIds = new Set<string>();
    
    try {
      for (const order of orders) {
        if (!order.id) continue;
        
        const bundleCheck = await fetch(`/api/sales/bundle-check?itemId=${order.id}`);
        const bundleData = await bundleCheck.json();
        
        if (bundleData.isBundle && !processedBundleIds.has(bundleData.bundleId)) {
          // 同梱グループ情報を保存
          bundleGroupsInfo[bundleData.bundleId] = {
            bundleId: bundleData.bundleId,
            items: bundleData.bundleGroup,
            totalValue: bundleData.totalValue,
            totalItems: bundleData.totalItems,
            representativeItem: bundleData.bundleGroup[0], // 代表商品
            notes: bundleData.bundleNotes
          };
          
          processedBundleIds.add(bundleData.bundleId);
        }
      }
      
      setBundleGroups(bundleGroupsInfo);
      console.log('🔍 Bundle Groups Info loaded:', bundleGroupsInfo);
      
    } catch (error) {
      console.error('Bundle groups info loading error:', error);
    }
  };
  
  // 商品が同梱グループに属するかチェック
  const getBundleGroupForItem = (itemId: string) => {
    for (const bundleId in bundleGroups) {
      const group = bundleGroups[bundleId];
      if (group.items.some((item: any) => item.id === itemId)) {
        return group;
      }
    }
    return null;
  };
  
  // 同梱グループの代表商品かチェック
  const isRepresentativeItem = (itemId: string) => {
    const bundleGroup = getBundleGroupForItem(itemId);
    return bundleGroup && bundleGroup.representativeItem.id === itemId;
  };
  
  // 同梱グループの統合item作成関数
  const createBundleItem = (selectedOrder: any) => {
    if (!selectedOrder.isBundleGroup || !selectedOrder.bundleItems) {
      return null;
    }
    
    return {
      id: selectedOrder.bundleId,
      orderNumber: selectedOrder.bundleItems.map((item: any) => item.orderNumber).join(','),
      productName: selectedOrder.bundleItems.map((item: any) => item.product).join(' + '),
      customer: selectedOrder.customer,
      shippingAddress: selectedOrder.shippingAddress || '東京都渋谷区神南1-1-1',
      value: selectedOrder.totalBundleValue,
      category: 'bundle',
      customerEmail: selectedOrder.customerEmail,
      customerPhone: selectedOrder.customerPhone,
      bundleItems: selectedOrder.bundleItems.map((item: any) => ({
        ...item,
        category: item.category || 'default'
      }))
    };
  };
  
  // ⚠️ TEST/DEMO FEATURE - DELETE BEFORE PRODUCTION ⚠️
  // テスト用ステータス遷移機能
  const [isTestFeatureOpen, setIsTestFeatureOpen] = useState(false);
  const [testTransitionLoading, setTestTransitionLoading] = useState(false);
  
  const handleTestStatusTransition = async (productId: string, fromStatus: string, toStatus: string, productName: string) => {
    console.log('🧪 [CLICK] テスト遷移クリック:', { productId, fromStatus, toStatus, productName });
    
    if (!confirm(`⚠️ テスト機能\n\n商品「${productName}」のステータスを「${getStatusDisplayName(fromStatus)}」から「${getStatusDisplayName(toStatus)}」に変更します。\n\n商品ID: ${productId}\n\nこの操作を実行しますか？`)) {
      return;
    }
    
    setTestTransitionLoading(true);
    
    try {
      console.log('🧪 [API CALL] API呼び出し開始:', { productId, fromStatus, toStatus });
      const response = await fetch('/api/test/status-transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          fromStatus,
          toStatus,
          reason: 'テスト/デモ用手動遷移'
        })
      });
      
      const result = await response.json();
      console.log('🧪 [API RESPONSE] APIレスポンス:', result);
      console.log('🧪 [API RESPONSE] HTTP Status:', response.status);
      
      if (!response.ok) {
        console.error('🧪 [API ERROR] APIエラー:', result);
        throw new Error(result.error || 'ステータス遷移に失敗しました');
      }
      
      console.log('🧪 [SUCCESS] API成功 - トースト表示開始');
      showToast({
        title: 'テスト遷移完了',
        message: result.message,
        type: 'success'
      });
      console.log('🧪 [SUCCESS] トースト表示完了');
      
      // データを即座に更新（楽観的更新）
      setSalesData((prev: any) => {
        if (!prev || !prev.recentOrders) return prev;
        
        return {
          ...prev,
          recentOrders: prev.recentOrders.map((order: any) => {
            const orderProductId = order.realProductId || order.productId || order.id.replace('pseudo-', '');
            if (orderProductId === productId) {
              console.log('🧪 [UI UPDATE] 商品ステータス更新:', orderProductId, order.status, '→', toStatus);
              return { ...order, status: toStatus };
            }
            return order;
          })
        };
      });
      
      // データを再読み込み（確実性のため）
      await fetchSalesData();
      
    } catch (error) {
      console.error('Test status transition error:', error);
      showToast({
        title: 'テスト遷移エラー',
        message: error instanceof Error ? error.message : 'ステータス遷移に失敗しました',
        type: 'error'
      });
    } finally {
      setTestTransitionLoading(false);
    }
  };
  
  const handleTestStatusReset = async (productId: string, productName: string) => {
    if (!confirm(`⚠️ テスト機能リセット\n\n商品「${productName}」のテスト用データを削除し、ステータスを「出品中」にリセットします。\n\nこの操作を実行しますか？`)) {
      return;
    }
    
    setTestTransitionLoading(true);
    
    try {
      const response = await fetch(`/api/test/status-transition?productId=${productId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'リセットに失敗しました');
      }
      
      showToast({
        title: 'テストリセット完了',
        message: result.message,
        type: 'info'
      });
      
      // データを即座に更新（楽観的更新）
      setSalesData((prev: any) => {
        if (!prev || !prev.recentOrders) return prev;
        
        return {
          ...prev,
          recentOrders: prev.recentOrders.map((order: any) => {
            const orderProductId = order.realProductId || order.productId || order.id.replace('pseudo-', '');
            if (orderProductId === productId) {
              console.log('🧪 [UI RESET] 商品ステータスリセット:', orderProductId, order.status, '→ listing');
              return { ...order, status: 'listing' };
            }
            return order;
          })
        };
      });
      
      // データを再読み込み（確実性のため）
      await fetchSalesData();
      
    } catch (error) {
      console.error('Test status reset error:', error);
      showToast({
        title: 'テストリセットエラー',
        message: error instanceof Error ? error.message : 'リセットに失敗しました',
        type: 'error'
      });
    } finally {
      setTestTransitionLoading(false);
    }
  };
  
  const getStatusDisplayName = (status: string): string => {
    const statusNames: Record<string, string> = {
      'listing': '出品中',
      'sold': '購入者決定',
      'processing': '出荷準備中',
      'shipped': '出荷済み',
      'delivered': '到着済み'
    };
    return statusNames[status] || status;
  };

  // 配送業者のリスト（APIから動的取得）
  const carriers = carriersLoading ? [] : (carrierData || []).map(carrier => ({
    value: carrier.key,
    label: carrier.nameJa || carrier.name,
    apiEnabled: carrier.key === 'fedex', // FedXのみAPI連携対応
    url: carrier.trackingUrl
  }));
  
  // 注文ステータスオプション（販売管理用）
  const orderStatusOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'listing', label: '出品中' },
    { value: 'sold', label: '購入者決定' },
    { value: 'processing', label: '出荷準備中' },
    { value: 'shipped', label: '出荷済み' },
    { value: 'delivered', label: '到着済み' }
  ];

  // eBayデータを取得する関数（開発環境用デモデータ）
  const fetchEbayData = async (itemId: string, productName: string) => {
    // 開発環境用: SQLiteに保存されたデモデータを使用
    // 実際のeBay API呼び出しは無効化
    
    // デモ用のeBayタイトルと画像を生成
    const demoTitles = [
      'Canon EOS R5 Full Frame Mirrorless Camera Body - Excellent Condition',
      'Nikon D850 DSLR Camera with 24-120mm Lens Kit - Professional Grade',
      'Sony Alpha a7R IV Mirrorless Camera - 61MP Full Frame',
      'Fujifilm X-T4 Mirrorless Camera with 18-55mm Lens - Black',
      'Panasonic Lumix GH5 4K Video Camera - Content Creator Special',
      'Olympus OM-D E-M1 Mark III Camera Body - Weather Sealed',
      'Leica Q2 Full Frame Compact Camera - Luxury Edition',
      'Seiko Prospex Diver Watch - Automatic Movement',
      'Casio G-Shock Solar Watch - Military Style',
      'Citizen Eco-Drive Chronograph - Titanium Case'
    ];
    
    const demoImages = [
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1514016810987-c59c4e3d6d29?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1523170335258-f5e06fda235b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1543680947-d8618014ce9f?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=300&h=300&fit=crop'
    ];
    
    // アイテムIDやプロダクト名に基づいてデモデータを選択
    const seed = itemId || productName || Math.random().toString();
    const index = Math.abs(getHashCode(seed)) % demoTitles.length;
    
    
    return {
      ebayTitle: demoTitles[index],
      ebayImage: demoImages[index],
      ebayCategory: productName?.toLowerCase().includes('camera') ? 'Cameras & Photo' : 'Jewelry & Watches'
    };
  };

  // Helper function to generate hash code
  const getHashCode = (str: string) => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

  // データを取得する関数
  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        status: statusFilter
      });
      
      console.log('🔍 Sales画面: /api/sales呼び出し開始', `/api/sales?${params}`);
      const response = await fetch(`/api/sales?${params}`);
      const data = await response.json();
      console.log('🔍 Sales画面: /api/salesレスポンス', {
        recentOrdersCount: data.recentOrders?.length,
        firstOrder: data.recentOrders?.[0],
        firstOrderTrackingInfo: {
          trackingNumber: data.recentOrders?.[0]?.trackingNumber,
          carrier: data.recentOrders?.[0]?.carrier
        }
      });
      
      
      // 各注文について、APIのproductデータが既にeBayスタイルかチェックし、必要に応じてデモデータで補完
      if (data.recentOrders) {
        const ordersWithEbayData = await Promise.all(
          data.recentOrders.map(async (order: any) => {
            // APIから既に良いタイトルが来ている場合はそれを優先
            let ebayTitle = order.product;
            let ebayImage = order.items?.[0]?.productImage;
            
            // APIのタイトルが「注文 ORD-」形式の場合のみデモデータで補完
            if (!ebayTitle || ebayTitle.startsWith('注文 ORD-')) {
              const ebayData = await fetchEbayData(order.ebayItemId || order.id, order.product || '');
              ebayTitle = ebayData.ebayTitle;
              ebayImage = ebayData.ebayImage;
            }
            
            const enhancedOrder = {
              ...order,
              ebayTitle,
              ebayImage,
              product: ebayTitle  // productプロパティも更新
            };
            
            return enhancedOrder;
          })
        );
        data.recentOrders = ordersWithEbayData;
      }
      
      console.log('🔍 Sales画面: 最終的にsetSalesDataに渡すデータ', {
        recentOrdersCount: data.recentOrders?.length,
        firstOrderFinal: data.recentOrders?.[0],
        firstOrderTrackingFinal: {
          trackingNumber: data.recentOrders?.[0]?.trackingNumber,
          carrier: data.recentOrders?.[0]?.carrier,
          id: data.recentOrders?.[0]?.id,
          orderNumber: data.recentOrders?.[0]?.orderNumber
        }
      });
      
      // 同梱グループ情報を取得・統合
      await loadBundleGroupsInfo(data.recentOrders || []);
      
      setSalesData(data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      showToast({
        title: 'エラー',
        message: '注文データの取得に失敗しました',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [currentPage, statusFilter, pageSize]);

  const handleGenerateLabel = async (order: any) => {
    try {
      // 同梱グループ検出
      console.log('Checking bundle for order:', order.id);
      const bundleCheck = await fetch(`/api/sales/bundle-check?itemId=${order.id}`);
      const bundleData = await bundleCheck.json();
      
      if (bundleData.isBundle) {
        // 同梱グループとして処理
        console.log('Bundle group found:', bundleData.bundleId);
        setSelectedOrder({
          ...order,
          isBundleGroup: true,
          bundleItems: bundleData.bundleGroup,
          bundleId: bundleData.bundleId,
          totalBundleValue: bundleData.totalValue,
          bundleNotes: bundleData.bundleNotes
        });
      } else {
        // 個別商品として処理
        console.log('Individual order processing');
        setSelectedOrder(order);
      }
      
      setIsLabelModalOpen(true);
      
    } catch (error) {
      console.error('Bundle check error:', error);
      // エラー時は個別商品として処理
      setSelectedOrder(order);
      setIsLabelModalOpen(true);
    }
  };



  const handleCarrierSelect = async () => {
    if (!selectedOrder || !selectedCarrier) return;

    const carrier = carriers.find(c => c.value === selectedCarrier);
    if (!carrier) return;

    if (carrier.apiEnabled && carrier.value === 'fedex') {
      // FedEx専用モーダルを開く
      setIsLabelModalOpen(false);
      setTimeout(() => {
        setIsFedexModalOpen(true);
      }, 300);
    } else {
      // 外部サイトへリンク
      if (carrier.url) {
        console.log(`Opening external URL: ${carrier.url} for carrier: ${carrier.label}`);
        
        const newWindow = window.open(carrier.url, '_blank');
        console.log('Window opened:', newWindow);
        
        setIsLabelModalOpen(false);
        
        showToast({
          title: '外部サービス',
          message: `${carrier.label}を新しいタブで開きました。生成後、ラベルをアップロードしてください。`,
          type: 'info'
        });
        
        setTimeout(() => {
          setIsUploadModalOpen(true);
        }, 1000);
      }
    }
    
    // selectedCarrierはモーダル終了時にリセットされる
  };

  const handleFedexServiceSelect = async (serviceId: string) => {
    if (!selectedOrder) return;

    try {
      showToast({
        title: 'ラベル生成中',
        message: selectedOrder.isBundleGroup 
          ? `${selectedOrder.bundleItems.length}件の同梱ラベルを生成中...`
          : 'FedXの配送ラベルを生成しています...',
        type: 'info'
      });

      // FedX API呼び出し（統合item使用）
      const requestItem = selectedOrder.isBundleGroup 
        ? createBundleItem(selectedOrder)
        : {
            id: selectedOrder.id,
            orderNumber: selectedOrder.orderId || selectedOrder.orderNumber,
            productName: selectedOrder.product,
            customer: selectedOrder.customer,
            shippingAddress: selectedOrder.shippingAddress || '〒150-0001 東京都渋谷区神宮前1-1-1 テストビル101',
            value: selectedOrder.totalAmount || selectedOrder.amount,
            isTestOrder: selectedOrder.orderNumber?.startsWith('TEST-') || false // テスト注文フラグ
          };

      console.log('FedX API request:', { 
        isBundleGroup: selectedOrder.isBundleGroup,
        item: requestItem,
        service: serviceId 
      });

      const response = await fetch('/api/shipping/fedx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: requestItem,
          service: serviceId
        })
      });

      if (!response.ok) throw new Error('FedExラベル生成に失敗しました');

      const result = await response.json();

      // 状態更新分岐
      if (selectedOrder.isBundleGroup) {
        // 同梱グループ: 安全なバッチ更新
        const bundleItemIds = selectedOrder.bundleItems.map((item: any) => item.id);
        
        console.log('Bundle state update:', {
          bundleId: selectedOrder.bundleId,
          itemIds: bundleItemIds,
          trackingNumber: result.trackingNumber
        });

        setSalesData((prev: any) => {
          if (!prev || !prev.recentOrders) {
            console.warn('Invalid salesData state, skipping update');
            return prev;
          }

          const updatedOrders = prev.recentOrders.map((order: any) => {
            if (bundleItemIds.includes(order.id)) {
              return {
                ...order,
                labelGenerated: true,
                trackingNumber: result.trackingNumber,
                carrier: result.carrier || 'fedex',
                bundleId: selectedOrder.bundleId,
                bundleProcessed: true,
                updatedAt: new Date().toISOString()
              };
            }
            return order;
          });

          return {
            ...prev,
            recentOrders: updatedOrders
          };
        });
        
        showToast({
          title: '同梱ラベル生成完了',
          message: `${selectedOrder.bundleItems.length}件の商品をまとめて処理しました。追跡番号: ${result.trackingNumber}`,
          type: 'success'
        });
        
      } else {
        // 個別商品: 既存の安全な更新
        setSalesData((prev: any) => ({
          ...prev,
          recentOrders: prev.recentOrders.map((o: any) => 
            o.id === selectedOrder.id 
              ? { ...o, labelGenerated: true, trackingNumber: result.trackingNumber, carrier: result.carrier || 'fedex' }
              : o
          )
        }));
        
        showToast({
          title: 'FedExラベル生成完了',
          message: `追跡番号: ${result.trackingNumber}`,
          type: 'success'
        });
      }

      // FedXモーダルを閉じてstateをリセット
      setIsFedexModalOpen(false);
      setSelectedOrder(null);
      setSelectedCarrier('');

    } catch (error) {
      console.error('FedEx label generation error:', error);
      showToast({
        title: 'エラー',
        message: 'FedExラベルの生成に失敗しました',
        type: 'error'
      });
    }
  };

  const handleShowDetails = (order: any) => {
    console.log('🔍 Sales画面: OrderDetailModalに渡す注文データ', {
      order,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      id: order.id,
      orderNumber: order.orderNumber
    });
    setSelectedOrderForDetail(order);
    setIsOrderDetailModalOpen(true);
  };

  // セラー梱包済み商品のラベルダウンロード機能
  const handleDownloadLabel = async (order: any) => {
    showToast({
      title: 'ラベル取得中',
      message: `${order.product}の配送ラベルを取得しています`,
      type: 'info'
    });

    try {
      // セラーが生成した配送ラベルを取得
      const response = await fetch(`/api/shipping/label/get?orderId=${order.orderNumber || order.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('配送ラベルが見つかりません。ラベル生成をお待ちください。');
        }
        throw new Error('配送ラベルの取得に失敗しました');
      }

      const labelInfo = await response.json();
      
      // ラベルをダウンロード
      const link = document.createElement('a');
      link.href = labelInfo.url;
      link.download = labelInfo.fileName || `shipping_label_${order.orderNumber || order.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        title: 'ダウンロード完了',
        message: `${order.product}の配送ラベルをダウンロードしました`,
        type: 'success'
      });
    } catch (error) {
      console.error('ラベルダウンロードエラー:', error);
      showToast({
        title: 'エラー',
        message: error instanceof Error ? error.message : '配送ラベルの取得に失敗しました',
        type: 'error'
      });
    }
  };

  // 販売管理同梱処理（競合回避のためsales専用名前）
  const handleSalesBundle = () => {
    const soldItems = salesData?.recentOrders?.filter(order => 
      salesBundleItems.includes(order.id) && order.status === 'sold'
    );

    if (!soldItems || soldItems.length < 2) {
      showToast({
        title: '同梱不可',
        message: '購入者決定の商品を2件以上選択してください',
        type: 'warning'
      });
      return;
    }

    setIsSalesBundleModalOpen(true);
  };

  const handleSalesBundleConfirm = async (bundleData: any) => {
    try {
      const response = await fetch('/api/sales/bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: salesData.recentOrders.filter(order => 
            salesBundleItems.includes(order.id)
          ),
          notes: bundleData.notes || ''
        })
      });

      if (!response.ok) {
        throw new Error('同梱設定の保存に失敗しました');
      }

      showToast({
        title: '同梱設定完了',
        message: `${salesBundleItems.length}件の商品を同梱設定しました`,
        type: 'success'
      });

      setSalesBundleItems([]);
      setIsSalesBundleModalOpen(false);

    } catch (error) {
      showToast({
        title: '同梱設定エラー',
        message: error instanceof Error ? error.message : '同梱設定中にエラーが発生しました',
        type: 'error'
      });
    }
  };



  const handleLabelUploadComplete = (labelUrl: string, provider: 'seller' | 'worlddoor', trackingNumber?: string, carrier?: string) => {
    if (!selectedOrder) return;

    setSalesData((prev: any) => ({
      ...prev,
      recentOrders: prev.recentOrders.map((o: any) => 
        o.id === selectedOrder.id 
          ? { 
              ...o, 
              labelGenerated: true, 
              labelUrl, 
              provider,
              ...(trackingNumber && { trackingNumber }),
              ...(carrier && { carrier: carrier })
            }
          : o
      )
    }));

    showToast({
      title: 'アップロード完了',
      message: '配送ラベルが正常にアップロードされました',
      type: 'success'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="販売管理"
          subtitle="売上・受注・配送を一元管理"
          userType="seller"
        />

        {/* ⚠️ TEST/DEMO FEATURE - DELETE BEFORE PRODUCTION ⚠️ */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white shadow-lg">
          <div className="p-4">
            <div className="flex items-start gap-4">
              <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">⚠️ テスト/デモ機能</h3>
                    <p className="text-sm opacity-90 mt-1">
                      本機能はテスト・デモ専用です。実際のeBay購入なしで「出品中」→「購入者決定」の遷移をテストできます。
                      <strong className="block mt-1">本番環境では削除してください。</strong>
                    </p>
                  </div>
                  <NexusButton
                    onClick={() => setIsTestFeatureOpen(!isTestFeatureOpen)}
                    variant={isTestFeatureOpen ? "secondary" : "primary"}
                    size="sm"
                    className="bg-white text-orange-600 hover:bg-gray-100"
                  >
                    {isTestFeatureOpen ? 'テスト機能を閉じる' : 'テスト機能を開く'}
                  </NexusButton>
                </div>
              </div>
            </div>
            
            {/* テスト機能UI */}
            {isTestFeatureOpen && (
              <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20">
                <h4 className="font-semibold mb-3">テスト用ステータス遷移</h4>
                <p className="text-sm opacity-90 mb-4">
                  出品中の商品を選択して「購入者決定」に変更するか、購入者決定の商品を「出品中」にリセットできます。
                </p>
                
                <div className="space-y-2">
                  {salesData?.recentOrders?.filter((order: any) => 
                    order.status && ['listing', 'sold'].includes(order.status)
                  ).map((order: any, idx: number) => {
                    console.log('🧪 [TEST UI] 商品詳細:', {
                      id: order.id,
                      productId: order.productId,
                      realProductId: order.realProductId,
                      status: order.status, 
                      product: order.product,
                      allKeys: Object.keys(order)
                    });
                    return (
                    <div key={`test-${order.id}-${order.status}-${idx}`} className="flex items-center justify-between p-3 bg-white/20 rounded border border-white/30">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded border border-white/30 overflow-hidden bg-white/10">
                          {order.ebayImage ? (
                            <img 
                              src={order.ebayImage} 
                              alt={order.product}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/70">
                              <CameraIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {order.product}
                          </div>
                          <div className="text-xs opacity-80">
                            現在: {getStatusDisplayName(order.status)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status === 'listing' && (
                          <NexusButton
                            onClick={() => {
                              // 確実な商品ID取得
                              let targetProductId = order.realProductId;
                              if (!targetProductId && order.id.startsWith('pseudo-')) {
                                targetProductId = order.id.replace('pseudo-', '');
                              } else if (!targetProductId) {
                                targetProductId = order.productId || order.id;
                              }
                              
                              console.log('🧪 [BUTTON CLICK] sss商品ボタンクリック詳細:', {
                                orderObject: order,
                                targetProductId,
                                orderProduct: order.product
                              });
                              
                              handleTestStatusTransition(
                                targetProductId, 
                                'listing', 
                                'sold', 
                                order.product
                              );
                            }}
                            size="sm"
                            variant="success"
                            disabled={testTransitionLoading}
                            className="bg-green-600 hover:bg-green-700 text-white border-green-700"
                          >
                            {testTransitionLoading ? '処理中...' : '→ 購入者決定'}
                          </NexusButton>
                        )}
                        {order.status === 'sold' && (
                          <>
                            <NexusButton
                              onClick={() => {
                              // 確実な商品ID取得
                              let targetProductId = order.realProductId;
                              if (!targetProductId && order.id.startsWith('pseudo-')) {
                                targetProductId = order.id.replace('pseudo-', '');
                              } else if (!targetProductId) {
                                targetProductId = order.productId || order.id;
                              }
                              
                              handleTestStatusTransition(
                                targetProductId, 
                                'sold', 
                                'listing', 
                                order.product
                              );
                            }}
                              size="sm"
                              variant="secondary"
                              disabled={testTransitionLoading}
                              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-700"
                            >
                              {testTransitionLoading ? '処理中...' : '→ 出品中'}
                            </NexusButton>
                            <NexusButton
                            onClick={() => {
                              // 確実な商品ID取得
                              let targetProductId = order.realProductId;
                              if (!targetProductId && order.id.startsWith('pseudo-')) {
                                targetProductId = order.id.replace('pseudo-', '');
                              } else if (!targetProductId) {
                                targetProductId = order.productId || order.id;
                              }
                              
                              handleTestStatusReset(
                                targetProductId, 
                                order.product
                              );
                            }}
                              size="sm"
                              variant="danger"
                              disabled={testTransitionLoading}
                              className="bg-red-600 hover:bg-red-700 text-white border-red-700"
                            >
                              {testTransitionLoading ? '処理中...' : 'リセット'}
                            </NexusButton>
                          </>
                        )}
                      </div>
                    </div>
                    );
                  }) || []}
                  
                  {(!salesData?.recentOrders || 
                    salesData.recentOrders.filter((order: any) => ['listing', 'sold'].includes(order.status)).length === 0
                  ) && (
                    <div className="text-center py-4 text-white/70">
                      テスト可能な商品（出品中・購入者決定）がありません
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 注文管理 - 統合版 */}
        <div className="intelligence-card oceania">
          
          {/* フィルター・検索部分（タイトル削除版） */}
          <div className="p-6 border-b border-nexus-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NexusSelect
                label="ステータス"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={orderStatusOptions}
              />
              
              {/* 同梱機能ボタン */}
              <div className="flex items-end">
                {salesBundleItems.length >= 2 && (
                  <NexusButton
                    onClick={handleSalesBundle}
                    variant="primary"
                    icon={<CubeIcon className="w-4 h-4" />}
                  >
                    同梱設定 ({salesBundleItems.length}件)
                  </NexusButton>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {salesData?.recentOrders ? (
              <div className="overflow-x-auto">
                <div className="holo-table">
                  <table className="w-full">
                    <thead className="holo-header">
                      <tr>
                        <th className="text-center p-4 font-medium text-nexus-text-secondary w-12">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                const soldItems = salesData.recentOrders.filter(row => row.status === 'sold').map(row => row.id);
                                setSalesBundleItems(soldItems);
                              } else {
                                setSalesBundleItems([]);
                              }
                            }}
                            className="rounded border-nexus-border"
                          />
                        </th>
                        <th className="text-left p-4 font-medium text-nexus-text-secondary">商品</th>
                        <th className="text-right p-4 font-medium text-nexus-text-secondary">金額</th>
                        <th className="text-center p-4 font-medium text-nexus-text-secondary">ステータス</th>
                        <th className="text-center p-4 font-medium text-nexus-text-secondary">ラベル</th>
                        <th className="text-left p-4 font-medium text-nexus-text-secondary">注文日</th>
                        <th className="text-center p-4 font-medium text-nexus-text-secondary">操作</th>
                      </tr>
                    </thead>
                    <tbody className="holo-body">
                      {salesData.recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-nexus-text-secondary">
                            注文データがありません
                          </td>
                        </tr>
                      ) : (
                        salesData.recentOrders.map((row: any, index: number) => {
                          const bundleGroup = getBundleGroupForItem(row.id);
                          const isInBundle = bundleGroup !== null;
                          const isRepresentative = isRepresentativeItem(row.id);
                          
                          // ユニークなキーを生成（IDが重複する場合を考慮）
                          const uniqueKey = `${row.id || 'no-id'}-${row.orderNumber || 'no-order'}-${index}`;
                          
                          return (
                          <tr 
                            key={uniqueKey} 
                            className={`holo-row ${isInBundle ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''}`}
                          >
                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={salesBundleItems.includes(row.id)}
                                onChange={() => {
                                  setSalesBundleItems(prev => 
                                    prev.includes(row.id) 
                                      ? prev.filter(id => id !== row.id)
                                      : [...prev, row.id]
                                  );
                                }}
                                disabled={row.status !== 'sold'}
                                className="rounded border-nexus-border"
                              />
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded border border-nexus-border overflow-hidden bg-nexus-bg-secondary">
                                  {row.ebayImage || row.items?.[0]?.productImage ? (
                                    <img 
                                      src={row.ebayImage || row.items[0].productImage} 
                                      alt={row.product}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-nexus-text-tertiary">
                                      <CameraIcon className="w-5 h-5" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="text-nexus-text-primary font-medium max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={row.product}>
                                    {row.product}
                                  </div>
                                  {isInBundle && (
                                    <div className="mt-1 flex items-center gap-2">
                                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        <CubeIcon className="w-3 h-3" />
                                        同梱グループ ({bundleGroup.totalItems}件)
                                      </div>
                                      {isRepresentative && (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                          代表商品
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <span className="font-bold text-nexus-text-primary">
                                ¥{Number(row.totalAmount || row.amount || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center">
                                <BusinessStatusIndicator status={row.status} size="md" showLabel={true} />
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center">
                                {row.labelGenerated ? (
                                  <span className="status-badge success">
                                    生成済み
                                  </span>
                                ) : (
                                  <span className="status-badge info">
                                    未生成
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-nexus-text-primary">
                                {new Date(row.orderDate || row.date).toLocaleDateString('ja-JP')}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex justify-center gap-2">
                                {row.status === 'sold' && !row.labelGenerated ? (
                                  isInBundle && !isRepresentative ? (
                                    <div className="text-center">
                                      <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        同梱設定済み
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        代表商品からラベル生成
                                      </div>
                                    </div>
                                  ) : (
                                    <NexusButton
                                      onClick={() => handleGenerateLabel(row)}
                                      size="sm"
                                      variant={isInBundle ? "success" : "primary"}
                                      icon={<DocumentArrowUpIcon className="w-4 h-4" />}
                                    >
                                      {isInBundle ? `同梱ラベル生成(${bundleGroup.totalItems}件)` : 'ラベル生成'}
                                    </NexusButton>
                                  )
                                ) : null}
                                {/* 梱包済み商品のラベルダウンロード */}
                                {(row.status === 'packed' || row.status === 'completed' || row.labelGenerated) && (
                                  <NexusButton
                                    onClick={() => handleDownloadLabel(row)}
                                    size="sm"
                                    variant="success"
                                    icon={<DocumentArrowUpIcon className="w-4 h-4" />}
                                  >
                                    ラベル
                                  </NexusButton>
                                )}
                                <NexusButton
                                  onClick={() => handleShowDetails(row)}
                                  size="sm"
                                  variant="secondary"
                                  icon={<EyeIcon className="w-4 h-4" />}
                                >
                                  詳細
                                </NexusButton>

                              </div>
                            </td>
                          </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-nexus-text-secondary">
                データを読み込み中...
              </div>
            )}
            
            {/* ページネーション */}
            {salesData?.pagination && salesData.pagination.totalCount > 0 && (
              <div className="mt-6 pt-4 border-t border-nexus-border">
                <Pagination
                  currentPage={currentPage}
                  totalPages={salesData.pagination.totalPages}
                  totalItems={salesData.pagination.totalCount}
                  itemsPerPage={pageSize}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setPageSize}
                />
              </div>
            )}
          </div>
        </div>

        {/* 配送ラベル生成モーダル */}
        <BaseModal
          isOpen={isLabelModalOpen}
          onClose={() => {
            setIsLabelModalOpen(false);
            setSelectedOrder(null);
            setSelectedCarrier('');
            setSelectedFedexService('');
          }}
          title="配送ラベル生成"
          size="md"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <NexusSelect
                label="配送業者を選択"
                value={selectedCarrier}
                onChange={(e) => setSelectedCarrier(e.target.value)}
                options={[
                  { value: '', label: '配送業者を選択してください' },
                  ...carriers.map(c => ({
                    value: c.value,
                    label: c.label
                  }))
                ]}
                required
              />
              {selectedCarrier === 'fedex' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <TruckIcon className="w-5 h-5" />
                    <p className="text-sm font-medium">
                      FedExサービス詳細選択へ進みます
                    </p>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    配送サービス・料金・配送時間を詳しく確認できます
                  </p>
                </div>
              )}
              {selectedCarrier && selectedCarrier !== '' && selectedCarrier !== 'fedex' && (
                <p className="mt-2 text-sm text-yellow-600 flex items-start gap-1">
                  <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  外部サイトでラベルを生成後、アップロードしてください
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <NexusButton
                onClick={() => {
                  setIsLabelModalOpen(false);
                  setSelectedOrder(null);
                  setSelectedCarrier('');
                  setSelectedFedexService('');
                }}
                variant="secondary"
              >
                キャンセル
              </NexusButton>
              <NexusButton
                onClick={handleCarrierSelect}
                variant="primary"
                disabled={!selectedCarrier || selectedCarrier === ''}
                icon={<DocumentArrowUpIcon className="w-5 h-5" />}
              >
                {selectedCarrier === 'fedex' ? '詳細選択へ進む' : selectedCarrier ? '外部サービスを開く' : '配送業者を選択'}
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* ラベルアップロードモーダル */}
        {selectedOrder && (
          <ShippingLabelUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => {
              setIsUploadModalOpen(false);
              setSelectedOrder(null);
              setSelectedCarrier('');
            }}
            itemId={selectedOrder.id}
            carrier={selectedCarrier}
            onUploadComplete={handleLabelUploadComplete}
          />
        )}

        {/* FedEx専用サービス選択モーダル */}
        {selectedOrder && (
          <FedExServiceModal
            isOpen={isFedexModalOpen}
            onClose={() => {
              setIsFedexModalOpen(false);
              setSelectedOrder(null);
              setSelectedCarrier('');
            }}
            onServiceSelect={handleFedexServiceSelect}
            orderDetails={{
              orderId: selectedOrder.orderId || selectedOrder.orderNumber,
              product: selectedOrder.product,
              weight: '2.5kg',
              destination: '東京都内'
            }}
          />
        )}

        {/* 注文詳細モーダル */}
        <OrderDetailModal
          isOpen={isOrderDetailModalOpen}
          onClose={() => setIsOrderDetailModalOpen(false)}
          order={selectedOrderForDetail}
        />

        {/* 販売管理同梱設定モーダル */}
        <SalesBundleModal
          isOpen={isSalesBundleModalOpen}
          onClose={() => setIsSalesBundleModalOpen(false)}
          onConfirm={handleSalesBundleConfirm}
          items={salesData?.recentOrders?.filter(order => 
            salesBundleItems.includes(order.id)
          ) || []}
        />
      </div>
    </DashboardLayout>
  );
}
