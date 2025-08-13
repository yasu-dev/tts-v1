'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import {
  Cog6ToothIcon,
  TicketIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

import NexusButton from '@/app/components/ui/NexusButton';
import BaseModal from '@/app/components/ui/BaseModal';
import { NexusLoadingSpinner, NexusSelect, NexusInput, NexusCheckbox, NexusTextarea } from '@/app/components/ui';
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator';
import ShippingLabelUploadModal from '@/app/components/modals/ShippingLabelUploadModal';
import TrackingNumberDisplay from '@/app/components/ui/TrackingNumberDisplay';
import { generateTrackingUrl } from '@/lib/utils/tracking';
import FedExServiceModal from '@/app/components/modals/FedExServiceModal';
import OrderDetailModal from '@/app/components/modals/OrderDetailModal';
import { 
  TruckIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  EyeIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

export default function SalesPage() {
  const { showToast } = useToast();
  const [salesData, setSalesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
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
  
  const router = useRouter();

  // 配送業者のリスト  
  const carriers = [
    { value: 'fedex', label: 'FedEx', apiEnabled: true },
    { value: 'yamato', label: 'ヤマト運輸 (ビジネスメンバーズ)', apiEnabled: false, url: 'https://business.kuronekoyamato.co.jp/' },
    { value: 'sagawa', label: '佐川急便 (e-飛伝)', apiEnabled: false, url: 'https://www.e-service.sagawa-exp.co.jp/portal/do/login/show' },
    { value: 'japan-post', label: '日本郵便 (Webゆうパック)', apiEnabled: false, url: 'https://www.post.japanpost.jp/service/yu_pack/index.html' },
    { value: 'dhl', label: 'DHL (MyDHL+)', apiEnabled: false, url: 'https://mydhl.express.dhl/jp/ja/home.html#/createNewShipmentTab' },
    { value: 'ups', label: 'UPS (出荷作成)', apiEnabled: false, url: 'https://www.ups.com/jp/ja/Home.page' }
  ];

  // eBayデータを取得する関数
  const fetchEbayData = async (itemId: string) => {
    try {
      // 実際のeBayAPIからデータを取得する処理
      // 現在はモックデータで対応
      const response = await fetch(`/api/ebay/item/${itemId}`);
      if (response.ok) {
        const data = await response.json();
        return {
          ebayTitle: data.title,
          ebayImage: data.mainImage,
          ebayCategory: data.category
        };
      }
    } catch (error) {
      console.error('eBayデータ取得エラー:', error);
    }
    return null;
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
      
      const response = await fetch(`/api/sales?${params}`);
      const data = await response.json();
      
      // 各注文についてeBayデータを取得
      if (data.recentOrders) {
        const ordersWithEbayData = await Promise.all(
          data.recentOrders.map(async (order: any) => {
            const ebayData = await fetchEbayData(order.ebayItemId || order.id);
            return {
              ...order,
              ...ebayData
            };
          })
        );
        data.recentOrders = ordersWithEbayData;
      }
      
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

  const handleGenerateLabel = (order: any) => {
    setSelectedOrder(order);
    setIsLabelModalOpen(true);
  };

  const handleSettings = () => {
    setIsSettingsModalOpen(true);
  };

  const handlePromotion = () => {
    setIsPromotionModalOpen(true);
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
    
    setSelectedCarrier('');
    setSelectedFedexService('');
  };

  const handleFedexServiceSelect = async (serviceId: string) => {
    if (!selectedOrder) return;

    try {
      showToast({
        title: 'ラベル生成中',
        message: 'FedExの配送ラベルを生成しています...',
        type: 'info'
      });

      const response = await fetch('/api/shipping/fedex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: {
            id: selectedOrder.id,
            orderNumber: selectedOrder.orderId || selectedOrder.orderNumber,
            productName: selectedOrder.product,
            customer: selectedOrder.customer,
            shippingAddress: '東京都渋谷区神南1-1-1',
            value: selectedOrder.amount
          },
          service: serviceId
        })
      });

      if (!response.ok) throw new Error('FedExラベル生成に失敗しました');

      const result = await response.json();

      showToast({
        title: 'FedExラベルが正常に生成されました',
        message: `追跡番号: ${result.trackingNumber}。スタッフが梱包完了後にラベルを出力いたします。`,
        type: 'success'
      });

      setSalesData((prev: any) => ({
        ...prev,
        recentOrders: prev.recentOrders.map((o: any) => 
          o.id === selectedOrder.id 
            ? { ...o, labelGenerated: true, trackingNumber: result.trackingNumber }
            : o
        )
      }));

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
    setSelectedOrderForDetail(order);
    setIsOrderDetailModalOpen(true);
  };

  const handleViewStaffProgress = (order: any) => {
    // スタッフ画面をモーダルまたは新しいタブで開く
    window.open(`/staff/shipping?orderId=${order.id}`, '_blank');
  };

  const handleLabelUploadComplete = (labelUrl: string, provider: 'seller' | 'worlddoor', trackingNumber?: string) => {
    if (!selectedOrder) return;

    setSalesData((prev: any) => ({
      ...prev,
      recentOrders: prev.recentOrders.map((o: any) => 
        o.id === selectedOrder.id 
          ? { ...o, labelGenerated: true, labelUrl, provider }
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
          actions={[
            {
              label: 'キャンペーン設定',
              onClick: handlePromotion,
              icon: <TicketIcon className="w-4 h-4" />,
              variant: 'secondary'
            },
            {
              label: '設定',
              onClick: handleSettings,
              icon: <Cog6ToothIcon className="w-4 h-4" />,
              variant: 'primary'
            }
          ]}
        />

        {/* フィルター・検索セクション */}
        <div className="intelligence-card global">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FunnelIcon className="w-5 h-5 text-nexus-text-secondary" />
              <h3 className="text-lg font-medium text-nexus-text-primary">フィルター・検索</h3>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NexusSelect
              label="ステータス"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'すべて' },
                { value: 'pending', label: '未確定' },
                { value: 'confirmed', label: '受注確定' },
                { value: 'processing', label: '出荷準備中' },
                { value: 'shipped', label: '出荷済み' },
                { value: 'delivered', label: '配達完了' },
                { value: 'cancelled', label: 'キャンセル' },
                { value: 'returned', label: '返品' }
              ]}
            />
            
            <NexusSelect
              label="表示件数"
              value={pageSize.toString()}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              options={[
                { value: '10', label: '10' },
                { value: '20', label: '20' },
                { value: '50', label: '50' },
                { value: '100', label: '100' }
              ]}
            />
            
            {/* ページネーション情報 */}
            {salesData?.pagination && (
              <div className="flex items-end">
                <div className="text-sm text-nexus-text-secondary">
                  {salesData.pagination.totalCount}件中 {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, salesData.pagination.totalCount)}件を表示
                </div>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* メイン注文リスト */}
        <div className="intelligence-card oceania">
          <div className="p-6 border-b border-nexus-border">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-nexus-text-primary">
                  注文管理
                </h2>
                <p className="text-sm text-nexus-text-secondary mt-1">
                  すべての受注・配送状況を管理
                </p>
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
                        <th className="text-left p-4 font-medium text-nexus-text-secondary">注文番号</th>
                        <th className="text-left p-4 font-medium text-nexus-text-secondary">商品</th>
                        <th className="text-right p-4 font-medium text-nexus-text-secondary">金額</th>
                        <th className="text-center p-4 font-medium text-nexus-text-secondary">ステータス</th>
                        <th className="text-center p-4 font-medium text-nexus-text-secondary">ラベル</th>
                        <th className="text-left p-4 font-medium text-nexus-text-secondary">注文日</th>
                        <th className="text-center p-4 font-medium text-nexus-text-secondary">アクション</th>
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
                        salesData.recentOrders.map((row, index) => (
                          <tr key={row.id || index} className="holo-row">
                            <td className="p-4">
                              <span className="font-mono text-sm text-nexus-text-primary">{row.orderNumber || row.orderId}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded border border-nexus-border overflow-hidden bg-nexus-bg-secondary">
                                  {row.ebayImage || row.items?.[0]?.productImage ? (
                                    <img 
                                      src={row.ebayImage || row.items[0].productImage} 
                                      alt={row.ebayTitle || row.product}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-nexus-text-tertiary">
                                      <CameraIcon className="w-5 h-5" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="text-nexus-text-primary font-medium max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={row.ebayTitle || row.product}>
                                    {row.ebayTitle || row.product}
                                  </div>
                                  <div className="text-xs text-nexus-text-secondary mt-1">
                                    注文: {row.orderNumber || row.orderId}
                                  </div>
                                  {row.itemCount && (
                                    <div className="text-xs text-nexus-text-secondary">
                                      数量: {row.itemCount}点
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
                                {['confirmed', 'processing'].includes(row.status) && !row.labelGenerated ? (
                                  <NexusButton
                                    onClick={() => handleGenerateLabel(row)}
                                    size="sm"
                                    variant="primary"
                                    icon={<DocumentArrowUpIcon className="w-4 h-4" />}
                                  >
                                    ラベル生成
                                  </NexusButton>
                                ) : null}
                                <NexusButton
                                  onClick={() => handleShowDetails(row)}
                                  size="sm"
                                  variant="secondary"
                                  icon={<EyeIcon className="w-4 h-4" />}
                                >
                                  詳細
                                </NexusButton>
                                {row.trackingNumber && (
                                  <NexusButton
                                    onClick={() => handleViewStaffProgress(row)}
                                    size="sm"
                                    variant="default"
                                    icon={<ClipboardDocumentCheckIcon className="w-4 h-4" />}
                                  >
                                    進捗確認
                                  </NexusButton>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
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
            {salesData?.pagination && salesData.pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-nexus-text-secondary">
                  全{salesData.pagination.totalCount}件 ({salesData.pagination.totalPages}ページ中{currentPage}ページ目)
                </div>
                <div className="flex gap-2">
                  <NexusButton
                    onClick={() => setCurrentPage(1)}
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === 1}
                  >
                    最初
                  </NexusButton>
                  <NexusButton
                    onClick={() => setCurrentPage(currentPage - 1)}
                    variant="secondary"
                    size="sm"
                    disabled={!salesData.pagination.hasPrevPage}
                  >
                    前へ
                  </NexusButton>
                  <span className="px-3 py-2 text-sm text-nexus-text-primary">
                    {currentPage} / {salesData.pagination.totalPages}
                  </span>
                  <NexusButton
                    onClick={() => setCurrentPage(currentPage + 1)}
                    variant="secondary"
                    size="sm"
                    disabled={!salesData.pagination.hasNextPage}
                  >
                    次へ
                  </NexusButton>
                  <NexusButton
                    onClick={() => setCurrentPage(salesData.pagination.totalPages)}
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === salesData.pagination.totalPages}
                  >
                    最後
                  </NexusButton>
                </div>
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
            }}
            itemId={selectedOrder.id}
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
      </div>
    </DashboardLayout>
  );
}
