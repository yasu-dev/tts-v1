'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import {
  Cog6ToothIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import HoloTable from '@/app/components/ui/HoloTable';
import NexusButton from '@/app/components/ui/NexusButton';
import BaseModal from '@/app/components/ui/BaseModal';
import { NexusLoadingSpinner, NexusSelect, NexusInput, NexusCheckbox, NexusTextarea } from '@/app/components/ui';
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator';
import ShippingLabelUploadModal from '@/app/components/modals/ShippingLabelUploadModal';
import FedExServiceModal from '@/app/components/modals/FedExServiceModal';
import { 
  TruckIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
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
  const [selectedFedexService, setSelectedFedexService] = useState<string>('');
  
  // ページネーションとフィルター用の状態
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(20);
  
  const router = useRouter();

  // 配送業者のリスト  
  const carriers = [
    { value: 'fedx', label: 'FedX', apiEnabled: true },
    { value: 'yamato', label: 'ヤマト運輸 (ビジネスメンバーズ)', apiEnabled: false, url: 'https://business.kuronekoyamato.co.jp/' },
    { value: 'sagawa', label: '佐川急便 (e-飛伝)', apiEnabled: false, url: 'https://www.e-service.sagawa-exp.co.jp/portal/do/login/show' },
    { value: 'japan-post', label: '日本郵便 (Webゆうパック)', apiEnabled: false, url: 'https://www.post.japanpost.jp/service/yu_pack/index.html' },
    { value: 'dhl', label: 'DHL (MyDHL+)', apiEnabled: false, url: 'https://mydhl.express.dhl/jp/ja/home.html#/createNewShipmentTab' },
    { value: 'ups', label: 'UPS (出荷作成)', apiEnabled: false, url: 'https://www.ups.com/jp/ja/Home.page' }
  ];

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

    if (carrier.apiEnabled && carrier.value === 'fedx') {
      // FedX専用モーダルを開く
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

  const handleFedxServiceSelect = async (serviceId: string) => {
    if (!selectedOrder) return;

    try {
      showToast({
        title: 'ラベル生成中',
        message: 'FedXの配送ラベルを生成しています...',
        type: 'info'
      });

      const response = await fetch('/api/shipping/fedx', {
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

      if (!response.ok) throw new Error('FedXラベル生成に失敗しました');

      const result = await response.json();
      
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${result.labelData}`;
      link.download = `fedx_label_${selectedOrder.orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        title: 'FedXラベルが正常に生成されました',
        message: `追跡番号: ${result.trackingNumber}`,
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
      console.error('FedX label generation error:', error);
      showToast({
        title: 'エラー',
        message: 'FedXラベルの生成に失敗しました',
        type: 'error'
      });
    }
  };

  const handleLabelUploadComplete = (labelUrl: string, provider: 'seller' | 'worlddoor') => {
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

        {/* メイン注文リスト */}
        <div className="bg-white dark:bg-nexus-bg-card rounded-lg border border-nexus-border shadow-sm">
          <div className="p-6 border-b border-nexus-border">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-nexus-text-primary">
                  注文管理
                </h2>
                <p className="text-sm text-nexus-text-secondary mt-1">
                  すべての受注・配送状況を管理
                </p>
              </div>
              
              {/* ページネーション情報 */}
              {salesData?.pagination && (
                <div className="text-sm text-nexus-text-secondary">
                  {salesData.pagination.totalCount}件中 {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, salesData.pagination.totalCount)}件を表示
                </div>
              )}
            </div>
            
            {/* フィルターとページサイズ選択 */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-nexus-text-primary">ステータス:</label>
                <NexusSelect
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1); // フィルター変更時は1ページ目に戻る
                  }}
                  className="w-40"
                >
                  <option value="all">すべて</option>
                  <option value="pending">未確定</option>
                  <option value="confirmed">受注確定</option>
                  <option value="processing">出荷準備中</option>
                  <option value="shipped">出荷済み</option>
                  <option value="delivered">配達完了</option>
                  <option value="cancelled">キャンセル</option>
                  <option value="returned">返品</option>
                </NexusSelect>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-nexus-text-primary">表示件数:</label>
                <NexusSelect
                  value={pageSize.toString()}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1); // ページサイズ変更時は1ページ目に戻る
                  }}
                  className="w-20"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </NexusSelect>
              </div>
            </div>
          </div>

          <div className="p-6">
            {salesData?.recentOrders && (
              <HoloTable
                data={salesData.recentOrders}
                columns={[
                  {
                    key: 'orderNumber',
                    header: '注文番号',
                    width: '120px'
                  },
                  {
                    key: 'product',
                    header: '商品名',
                    width: '200px'
                  },
                  {
                    key: 'customer',
                    header: '顧客',
                    width: '120px'
                  },
                  {
                    key: 'amount',
                    header: '金額',
                    width: '100px'
                  },
                  {
                    key: 'status',
                    header: 'ステータス',
                    width: '120px'
                  },
                  {
                    key: 'labelStatus',
                    header: 'ラベル',
                    width: '100px'
                  },
                  {
                    key: 'date',
                    header: '注文日',
                    width: '100px'
                  },
                  {
                    key: 'actions',
                    header: 'アクション',
                    width: '120px'
                  }
                ]}
                renderCell={(value, column, row) => {
                  if (column.key === 'amount') {
                    return `¥${Number(value).toLocaleString()}`;
                  }
                  
                  if (column.key === 'status') {
                    return <BusinessStatusIndicator status={row.statusKey} size="md" showLabel={true} />;
                  }

                  if (column.key === 'labelStatus') {
                    if (row.labelGenerated) {
                      return (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          生成済み
                        </span>
                      );
                    }
                    return (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        未生成
                      </span>
                    );
                  }
                  
                  if (column.key === 'actions') {
                    if (['confirmed', 'processing'].includes(row.statusKey) && !row.labelGenerated) {
                      return (
                        <NexusButton
                          size="sm"
                          variant="primary"
                          onClick={() => handleGenerateLabel(row)}
                          icon={<DocumentArrowUpIcon className="w-4 h-4" />}
                        >
                          ラベル生成
                        </NexusButton>
                      );
                    } else if (row.labelGenerated) {
                      return (
                        <span className="text-xs text-nexus-text-secondary">
                          {row.trackingNumber ? `追跡: ${row.trackingNumber.slice(-8)}` : 'アップロード済み'}
                        </span>
                      );
                    } else {
                      return <span className="text-xs text-nexus-text-secondary">-</span>;
                    }
                  }
                  
                  return value;
                }}
                emptyMessage="注文データがありません"
              />
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
              {selectedCarrier === 'fedx' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <TruckIcon className="w-5 h-5" />
                    <p className="text-sm font-medium">
                      FedXサービス詳細選択へ進みます
                    </p>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    配送サービス・料金・配送時間を詳しく確認できます
                  </p>
                </div>
              )}
              {selectedCarrier && selectedCarrier !== '' && selectedCarrier !== 'fedx' && (
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
                {selectedCarrier === 'fedx' ? '詳細選択へ進む' : selectedCarrier ? '外部サービスを開く' : '配送業者を選択'}
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

        {/* FedX専用サービス選択モーダル */}
        {selectedOrder && (
          <FedExServiceModal
            isOpen={isFedexModalOpen}
            onClose={() => {
              setIsFedexModalOpen(false);
              setSelectedOrder(null);
            }}
            onServiceSelect={handleFedxServiceSelect}
            orderDetails={{
              orderId: selectedOrder.orderId || selectedOrder.orderNumber,
              product: selectedOrder.product,
              weight: '2.5kg',
              destination: '東京都内'
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
