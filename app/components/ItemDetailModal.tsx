'use client';

import { useState, useRef, useEffect } from 'react';
import { BaseModal, NexusButton, NexusCard, BusinessStatusIndicator } from './ui';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { 
  CheckIcon,
  CameraIcon,
  ShoppingCartIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { parseProductMetadata, getInspectionPhotographyStatus } from '@/lib/utils/product-status';
import { checkListingEligibility } from '@/lib/utils/listing-eligibility';

interface EbayListingInfo {
  hasEbayListing: boolean;
  ebayItemId?: string;
  listingUrl?: string;
  startingPrice?: number;
  buyItNowPrice?: number;
  listedAt?: string;
  status?: string;
  ebayTitle?: string;
  ebayCategory?: string;
  ebayCondition?: string;
  ebayShippingTime?: string;
  ebayLocation?: string;
  productInfo?: {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    condition: string;
    status: string;
    seller: string;
  };
  message?: string;
}

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    sku: string;
    category: string;
    status: string;
    location: string;
    price: number;
    condition: string;
    imageUrl?: string;
    entryDate: string;
    assignedStaff?: string;
    lastModified: string;
    qrCode?: string;
    notes?: string;
    metadata?: string; // メタデータフィールド追加
    inspectedAt?: string; // 検品日時
    photographyDate?: string; // 撮影日時
  } | null;
  onStartInspection?: (item: any) => void;
  onStartPhotography?: (item: any) => void; // 撮影開始ハンドラー追加
  onStartListing?: (item: any) => void; // 出品開始ハンドラー追加
}

export default function ItemDetailModal({ 
  isOpen, 
  onClose, 
  item, 
  onStartInspection,
  onStartPhotography,
  onStartListing
}: ItemDetailModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'notes'>('details');
  const [ebayListingInfo, setEbayListingInfo] = useState<EbayListingInfo | null>(null);
  const [loadingEbayInfo, setLoadingEbayInfo] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { showToast } = useToast();

  // 商品履歴を取得
  const fetchProductHistory = async (productId: string) => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/products/${productId}/history`);
      if (response.ok) {
        const data = await response.json();
        // タイムラインデータを履歴形式に変換（詳細をわかりやすく表示）
        const formattedHistory = data.timeline?.map((event: any, index: number) => {
          let details = '';
          if (event.metadata) {
            // メタデータを読みやすい形式に変換
            if (typeof event.metadata === 'object') {
              const metadata = event.metadata;
              const descriptions = [];

              if (metadata.location) descriptions.push(`保管場所: ${metadata.location}`);
              if (metadata.condition) descriptions.push(`状態: ${metadata.condition}`);
              if (metadata.price) descriptions.push(`価格: ¥${metadata.price.toLocaleString()}`);
              if (metadata.marketplace) descriptions.push(`マーケット: ${metadata.marketplace}`);
              if (metadata.previousPrice) descriptions.push(`旧価格: ¥${metadata.previousPrice.toLocaleString()}`);
              if (metadata.trackingNumber) descriptions.push(`追跡番号: ${metadata.trackingNumber}`);
              if (metadata.reason) descriptions.push(`理由: ${metadata.reason}`);

              details = descriptions.join(', ') || '詳細なし';
            } else {
              details = event.metadata.toString();
            }
          }

          return {
            date: new Date(event.timestamp).toLocaleString('ja-JP'),
            action: event.title,
            details: details || event.description || '操作完了',
            user: event.user || 'システム'
          };
        }) || [];
        setHistoryData(formattedHistory);
      } else {
        console.error('Failed to fetch product history');
        setHistoryData([]);
      }
    } catch (error) {
      console.error('Error fetching product history:', error);
      setHistoryData([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // eBay出品情報を取得
  const fetchEbayListingInfo = async (productId: string) => {
    setLoadingEbayInfo(true);
    try {
      const response = await fetch(`/api/products/${productId}/ebay-listing`);
      if (response.ok) {
        const data = await response.json();
        setEbayListingInfo(data);
      } else {
        console.error('Failed to fetch eBay listing info');
        setEbayListingInfo({ hasEbayListing: false, message: 'eBay出品情報の取得に失敗しました' });
      }
    } catch (error) {
      console.error('Error fetching eBay listing info:', error);
      setEbayListingInfo({ hasEbayListing: false, message: 'eBay出品情報の取得中にエラーが発生しました' });
    } finally {
      setLoadingEbayInfo(false);
    }
  };

  // スクロール位置のリセット
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  // モーダルが開いた時にeBay出品情報を取得
  useEffect(() => {
    if (isOpen && item) {
      fetchEbayListingInfo(item.id);
    }
  }, [isOpen, item]);

  // 履歴タブが選択されたときに履歴データを取得
  useEffect(() => {
    if (isOpen && item?.id && activeTab === 'history') {
      fetchProductHistory(item.id);
    }
  }, [isOpen, item?.id, activeTab]);

  if (!isOpen || !item) return null;

  // メタデータから検品・撮影状況を取得
  const metadata = parseProductMetadata(item.metadata);
  const inspectionPhotographyStatus = getInspectionPhotographyStatus(metadata);
  
  // 出品可能性を判定
  const listingEligibility = checkListingEligibility({
    status: item.status,
    inspectedAt: item.inspectedAt || (item.status === 'storage' ? new Date().toISOString() : null),
    photographyDate: item.photographyDate || null
  });


  const handleEbayLinkClick = () => {
    if (ebayListingInfo?.listingUrl) {
      window.open(ebayListingInfo.listingUrl, '_blank', 'noopener,noreferrer');
      showToast({
        type: 'info',
        title: 'eBayページを開きました',
        message: '新しいタブでeBay出品ページが開きます',
        duration: 3000
      });
    }
  };



  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="商品詳細"
      size="xl"
      className="max-h-[90vh] overflow-hidden"
    >
      <div className="p-6">
        <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {item.name} ({item.sku})
            </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-nexus-border mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'details', label: '詳細情報' },
              { id: 'history', label: '履歴' },
              { id: 'notes', label: '備考' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-nexus-blue text-nexus-blue'
                    : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-nexus-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-96" ref={scrollContainerRef}>
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-nexus-text-primary">
                    基本情報
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        商品名
                      </label>
                      <p className="text-nexus-text-primary">{item.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        SKU
                      </label>
                      <p className="text-nexus-text-primary">{item.sku}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        カテゴリ
                      </label>
                      <p className="text-nexus-text-primary">{item.category}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        作業進捗
                      </label>
                      <div className="flex items-center space-x-2">
                        <BusinessStatusIndicator
                          status={item.status as any}
                          size="sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        価格
                      </label>
                      <p className="text-nexus-text-primary">¥{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Location and Assignment */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-nexus-text-primary">
                    保管・担当情報
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        保管場所
                      </label>
                      <p className="text-nexus-text-primary">{item.location}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        担当者
                      </label>
                      <p className="text-nexus-text-primary">{item.assignedStaff || 'なし'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        登録日
                      </label>
                      <p className="text-nexus-text-primary">
                        {new Date(item.entryDate).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        最終更新
                      </label>
                      <p className="text-nexus-text-primary">
                        {new Date(item.lastModified).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-nexus-text-primary">
                操作履歴
              </h3>
              {loadingHistory ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin h-8 w-8 border-b-2 border-nexus-yellow rounded-full"></div>
                  <span className="ml-3 text-nexus-text-secondary">履歴を読み込み中...</span>
                </div>
              ) : (
                <div className="holo-table">
                  <table className="w-full">
                    <thead className="holo-header">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium">アクション</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">詳細</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">実行者</th>
                        <th className="text-right py-3 px-4 text-sm font-medium">日時</th>
                      </tr>
                    </thead>
                    <tbody className="holo-body">
                      {historyData.length > 0 ? (
                        historyData.map((entry, index) => (
                          <tr key={index} className="holo-row">
                            <td className="py-3 px-4">
                              <span className="font-medium text-nexus-text-primary">{entry.action}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-nexus-text-secondary">{entry.details}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-nexus-text-secondary">{entry.user}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="text-sm text-nexus-text-secondary">{entry.date}</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="holo-row">
                          <td colSpan={4} className="py-8 text-center">
                            <span className="text-nexus-text-secondary">履歴データがありません</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-nexus-text-primary">
                備考・詳細情報
              </h3>

              {/* 商品メモ */}
              <div className="bg-nexus-bg-secondary rounded-lg p-4">
                <h4 className="font-medium text-nexus-text-primary mb-2">
                  商品メモ
                </h4>
                <p className="text-nexus-text-secondary">
                  {item.notes || '特記事項はありません'}
                </p>
              </div>

              {/* QRコード情報 */}
              {item.qrCode && (
                <div className="bg-nexus-bg-secondary rounded-lg p-4">
                  <h4 className="font-medium text-nexus-text-primary mb-2">
                    QRコード
                  </h4>
                  <p className="text-nexus-text-secondary font-mono">
                    {item.qrCode}
                  </p>
                </div>
              )}

              {/* メタデータ情報 */}
              {item.metadata && (
                <div className="bg-nexus-bg-secondary rounded-lg p-4">
                  <h4 className="font-medium text-nexus-text-primary mb-2">
                    システム情報
                  </h4>
                  <div className="text-sm text-nexus-text-secondary">
                    {(() => {
                      try {
                        const metadata = typeof item.metadata === 'string'
                          ? JSON.parse(item.metadata)
                          : item.metadata;

                        return (
                          <div className="space-y-1">
                            {metadata.deliveryPlanInfo && (
                              <p>納品プラン: {metadata.deliveryPlanInfo.planId}</p>
                            )}
                            {metadata.inspectionCompleted && (
                              <p>検品状況: 完了済み</p>
                            )}
                            {metadata.photographyCompleted !== undefined && (
                              <p>撮影状況: {metadata.photographyCompleted ? '完了済み' : '未完了'}</p>
                            )}
                          </div>
                        );
                      } catch (e) {
                        return <p>メタデータの解析に失敗しました</p>;
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            <NexusButton
              onClick={onClose}
              variant="default"
            >
              閉じる
            </NexusButton>
            {onStartInspection && (item.status === 'inbound' || item.status === 'storage') && (
              <NexusButton
                onClick={() => onStartInspection(item)}
                variant="primary"
                icon={<CheckIcon className="w-4 h-4" />}
              >
                検品開始
              </NexusButton>
            )}
            {onStartPhotography && inspectionPhotographyStatus.canStartPhotography && (
              <NexusButton
                onClick={() => onStartPhotography(item)}
                variant="primary"
                icon={<CameraIcon className="w-4 h-4" />}
              >
                撮影する
              </NexusButton>
            )}
            {onStartListing && listingEligibility.canList && (
              <NexusButton
                onClick={() => onStartListing(item)}
                variant="primary"
                icon={<ShoppingCartIcon className="w-4 h-4" />}
              >
                出品する
              </NexusButton>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
} 