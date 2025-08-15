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
  const { showToast } = useToast();

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

  const demoHistory = [
    { date: '2024-12-24 10:00', action: 'ステータス変更', details: '検品中 → 保管中', user: '田中太郎' },
    { date: '2024-12-23 14:30', action: 'ロケーション移動', details: 'A-1-001 → A-1-002', user: '田中太郎' },
    { date: '2024-12-22 09:15', action: '商品登録', details: '初回登録完了', user: '佐藤花子' },
  ];

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
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        状態
                      </label>
                      <p className="text-nexus-text-primary">{item.condition}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        検品・撮影状況
                      </label>
                      <div className="flex items-center space-x-2">
                        <p className="text-nexus-text-primary">{inspectionPhotographyStatus.displayStatus}</p>
                        {inspectionPhotographyStatus.canStartPhotography && (
                          <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full">
                            撮影可能
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        出品可能性
                      </label>
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm ${listingEligibility.canList ? 'text-green-600' : 'text-orange-600'}`}>
                          {listingEligibility.overallReason}
                        </p>
                        {listingEligibility.canList && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            出品可能
                          </span>
                        )}
                      </div>
                      {!listingEligibility.canList && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(listingEligibility.requirements).map(([key, req]) => (
                            <div key={key} className="flex items-center text-xs">
                              <span className={`w-2 h-2 rounded-full mr-2 ${req.status === 'met' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                              <span className={req.status === 'met' ? 'text-green-600' : 'text-gray-600'}>{req.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        価格
                      </label>
                      <p className="text-nexus-text-primary">¥{item.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-1">
                        ステータス
                      </label>
                      <BusinessStatusIndicator 
                        status={item.status as any} 
                        size="sm" 
                      />
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

              {/* eBay出品情報セクション */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <TagIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-900">eBay出品情報</h4>
                </div>
                
                {loadingEbayInfo ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-blue-800">出品情報を取得中...</p>
                  </div>
                ) : ebayListingInfo?.hasEbayListing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">
                          アイテムID
                        </label>
                        <p className="text-sm text-blue-900 font-mono">{ebayListingInfo.ebayItemId}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">
                          ステータス
                        </label>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {ebayListingInfo.status === 'active' ? '出品中' : ebayListingInfo.status}
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">
                          出品価格
                        </label>
                        <p className="text-sm text-blue-900">¥{ebayListingInfo.buyItNowPrice?.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">
                          出品日
                        </label>
                        <p className="text-sm text-blue-900">
                          {ebayListingInfo.listedAt ? new Date(ebayListingInfo.listedAt).toLocaleDateString('ja-JP') : '-'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">
                        eBayタイトル
                      </label>
                      <p className="text-sm text-blue-900 break-words">{ebayListingInfo.ebayTitle}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">
                          商品状態
                        </label>
                        <p className="text-sm text-blue-900">{ebayListingInfo.ebayCondition}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">
                          配送日数
                        </label>
                        <p className="text-sm text-blue-900">{ebayListingInfo.ebayShippingTime}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <NexusButton
                        onClick={handleEbayLinkClick}
                        variant="primary"
                        size="sm"
                        icon={<ArrowTopRightOnSquareIcon className="w-4 h-4" />}
                        className="w-full sm:w-auto"
                      >
                        eBayページを開く
                      </NexusButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      {ebayListingInfo?.message || 'この商品はeBayに出品されていません'}
                    </p>
                  </div>
                )}
              </div>

              {/* 次のステップ案内 */}
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">次のステップ</h4>
                <p className="text-sm text-gray-800">
                  {item.status === 'inbound' ? '商品が入庫されました。検品を開始してください。' :
                   item.status === 'inspection' ? '検品作業中です。品質確認後、保管へ移行します。' :
                   item.status === 'storage' ? '保管中です。必要に応じて検品や移動を行えます。' :
                   item.status === 'listing' ? '出品中です。販売が完了するまで待機してください。' :
                   item.status === 'sold' ? '売約済みです。出荷準備を行ってください。' :
                   item.status === 'maintenance' ? 'メンテナンス中です。作業完了後、保管へ戻します。' :
                   '現在のステータスに応じた作業を実行してください。'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-nexus-text-primary">
                操作履歴
              </h3>
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
                {demoHistory.map((entry, index) => (
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
                ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-nexus-text-primary">
                備考・メモ
              </h3>
              <div className="bg-nexus-bg-secondary rounded-lg p-4">
                <p className="text-nexus-text-secondary">
                  {item.notes || '備考はありません'}
                </p>
              </div>
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