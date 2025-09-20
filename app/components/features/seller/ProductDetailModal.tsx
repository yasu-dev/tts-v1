'use client';

import { useState } from 'react';
import {
  ShoppingCartIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  CameraIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import BaseModal from '../../ui/BaseModal';
import NexusButton from '../../ui/NexusButton';
import { BusinessStatusIndicator } from '../../ui';
import ProductInspectionDetails from './ProductInspectionDetails';
import ProductPhotographyDetails from './ProductPhotographyDetails';
import ProductStorageDetails from './ProductStorageDetails';
import CarrierSelectionModal from '../../modals/CarrierSelectionModal';
import { useToast } from '../../features/notifications/ToastProvider';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onOpenListingForm: (product: any) => void;
}

// 品質ランクバッジを生成する関数（複製）
const getConditionBadge = (condition: string) => {
  const conditionConfig: Record<string, { bg: string; text: string; label: string }> = {
    excellent: { bg: 'bg-green-800', text: 'text-white', label: '最高品質' },
    good: { bg: 'bg-blue-800', text: 'text-white', label: '高品質' },
    fair: { bg: 'bg-yellow-700', text: 'text-white', label: '標準品質' },
    poor: { bg: 'bg-red-800', text: 'text-white', label: '要注意' }
  };

  const config = conditionConfig[condition] || conditionConfig.fair;
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// ステータス変換関数（複製）
const convertStatusToKey = (status: string): string => {
  const statusMapping: Record<string, string> = {
    'inbound': 'inbound',
    'pending_inspection': 'pending_inspection', 
    'inspection': 'inspection',
    'inspecting': 'inspection',
    'photography': 'photography',
    'storage': 'storage',
    'completed': 'completed',
    'listed': 'listed',
    'sold': 'sold',
    'on_hold': 'on_hold',
    'failed': 'failed'
  };
  
  return statusMapping[status] || 'unknown';
};

// カテゴリ名の日本語表示関数
const getCategoryJapaneseName = (category: string): string => {
  const categoryMapping: Record<string, string> = {
    'camera': 'カメラ',
    'watch': '腕時計',
    'other': 'その他'
  };
  
  return categoryMapping[category] || category || '未設定';
};

// 納品プラン作成時と同じコンディション表示
const getConditionJapaneseName = (condition: string): string => {
  const conditionMapping: Record<string, string> = {
    'excellent': '優良',
    'very_good': '美品',
    'good': '良好',
    'fair': '普通',
    'poor': '要修理'
  };
  
  return conditionMapping[condition] || condition || '未設定';
};

export default function ProductDetailModal({ isOpen, onClose, product, onOpenListingForm }: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isShippingRequesting, setIsShippingRequesting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { showToast } = useToast();

  if (!product) return null;

  // キャンセル確認表示
  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  // 商品キャンセル処理
  const handleCancelConfirm = async () => {
    setShowCancelConfirm(false);
    setIsCancelling(true);

    try {
      const response = await fetch(`/api/products/${product.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        showToast({
          type: 'success',
          title: 'キャンセル完了',
          message: '商品をキャンセルしました',
          duration: 3000
        });

        // モーダルを閉じる
        onClose();

        // 一覧を更新（親コンポーネントで処理される）
        window.location.reload();
      } else {
        throw new Error('キャンセル処理に失敗しました');
      }
    } catch (error) {
      console.error('キャンセルエラー:', error);
      showToast({
        type: 'error',
        title: 'キャンセル失敗',
        message: 'キャンセル処理中にエラーが発生しました',
        duration: 5000
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // セラー出荷指示処理
  const handleShippingRequest = async (carrier: any, service: string) => {
    console.log('出荷指示開始:', { carrier, service, productId: product.id });
    setIsShippingRequesting(true);
    
    try {
      showToast({
        type: 'info',
        title: '出荷指示送信中',
        message: '配送業者への出荷指示を送信しています...',
        duration: 3000
      });

      const response = await fetch('/api/seller/shipping-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fixed-auth-token-seller-1', // デモ認証トークン
        },
        body: JSON.stringify({
          productId: product.id,
          shippingInfo: {
            carrier: carrier,
            service: service,
            shippingAddress: '配送先住所（セラー出荷）'
          }
        })
      });

      const result = await response.json();
      console.log('出荷指示結果:', result);

      if (result.success) {
        showToast({
          type: 'success',
          title: '出荷指示完了',
          message: result.message || '出荷指示を正常に送信しました。スタッフがピッキング作業を開始します。',
          duration: 5000
        });
        
        // モーダルを閉じる
        setIsShippingModalOpen(false);
        
        // 商品詳細モーダルも閉じる
        onClose();
        
        // ページリロード（商品リストの更新のため）
        window.location.reload();
        
      } else {
        throw new Error(result.error || '出荷指示の送信に失敗しました');
      }
    } catch (error) {
      console.error('出荷指示エラー:', error);
      showToast({
        type: 'error',
        title: 'エラー',
        message: error instanceof Error ? error.message : '出荷指示の処理中にエラーが発生しました',
        duration: 4000
      });
    } finally {
      setIsShippingRequesting(false);
    }
  };

  // 重量データを取得
  const getWeightInfo = () => {
    try {
      const metadata = typeof product.metadata === 'string' 
        ? JSON.parse(product.metadata) 
        : product.metadata;
      
      if (metadata?.packaging?.weight) {
        const weight = parseFloat(metadata.packaging.weight);
        const unit = metadata.packaging.weightUnit || 'kg';
        // 常に小数点第一位まで表示
        return `${weight.toFixed(1)}${unit}`;
      }
    } catch (error) {
      console.warn('重量データの解析エラー:', error);
    }
    return null;
  };

  const tabs = [
    {
      id: 'basic',
      label: '基本情報',
      icon: <DocumentTextIcon className="w-5 h-5" />
    },
    {
      id: 'inspection',
      label: '検品項目',
      icon: <CheckCircleIcon className="w-5 h-5" />
    },
    {
      id: 'photography',
      label: '撮影画像',
      icon: <CameraIcon className="w-5 h-5" />
    },
    {
      id: 'storage',
      label: '保管先',
      icon: <BuildingStorefrontIcon className="w-5 h-5" />
    },
    {
      id: 'notes',
      label: '備考',
      icon: <DocumentTextIcon className="w-5 h-5" />
    },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`商品詳細 - ${product.name}`}
      size="xl"
      data-testid="product-detail-modal"
    >
      <div className="flex flex-col h-full">
        {/* タブナビゲーション */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-nexus-text-primary mb-2">基本情報</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">商品名</span>
                      <span className="font-bold text-nexus-text-primary">{product.name || '未設定'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">SKU</span>
                      <span className="font-mono text-nexus-text-primary">{product.sku || '未設定'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">カテゴリー</span>
                      <span className="text-nexus-text-primary">{getCategoryJapaneseName(product.category)}</span>
                    </div>
                    {getWeightInfo() && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-nexus-text-secondary">重量</span>
                        <span className="text-nexus-text-primary">{getWeightInfo()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-nexus-text-primary mb-2">状況・価値</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">ステータス</span>
                      <BusinessStatusIndicator 
                        status={product.status} 
                        size="sm" 
                      />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">コンディション</span>
                      <span className="text-nexus-text-primary">{getConditionJapaneseName(product.condition)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">購入価格</span>
                      <span className="font-bold text-nexus-text-primary">
                        ¥{product.price ? product.price.toLocaleString() : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">更新日</span>
                      <span className="text-nexus-text-secondary">
                        {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('ja-JP') : '未設定'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>


              {/* セラー向けアクションボタン */}
              {product.status === 'storage' && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-end gap-3">
                    <NexusButton
                      onClick={() => setIsShippingModalOpen(true)}
                      variant="secondary"
                      icon={<TruckIcon className="w-4 h-4" />}
                      disabled={isShippingRequesting}
                    >
                      出荷する
                    </NexusButton>
                    <NexusButton
                      onClick={() => onOpenListingForm(product)}
                      variant="primary"
                      icon={<ShoppingCartIcon className="w-4 h-4" />}
                    >
                      出品する
                    </NexusButton>
                  </div>
                </div>
              )}

              {/* 入庫待ち商品のキャンセルボタン */}
              {product.status === 'inbound' && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <NexusButton
                      onClick={onClose}
                      variant="default"
                    >
                      閉じる
                    </NexusButton>
                    <NexusButton
                      onClick={handleCancelClick}
                      variant="danger"
                      icon={<XMarkIcon className="w-4 h-4" />}
                      disabled={isCancelling}
                    >
                      {isCancelling ? 'キャンセル中...' : 'キャンセル'}
                    </NexusButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inspection' && (
            <ProductInspectionDetails
              productId={product.id}
              status={product.status}
            />
          )}

          {activeTab === 'photography' && (
            <ProductPhotographyDetails
              productId={product.id}
              status={product.status}
            />
          )}

          {activeTab === 'storage' && (
            <ProductStorageDetails
              productId={product.id}
              status={product.status}
            />
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h4 className="font-bold text-nexus-text-primary mb-4">商品備考</h4>

                {/* 商品説明 */}
                {product.description && (
                  <div className="mb-6">
                    <h5 className="font-medium text-nexus-text-secondary mb-2">商品説明</h5>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div
                        className="text-nexus-text-primary whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                      />
                    </div>
                  </div>
                )}

                {/* 検品メモ */}
                {product.inspectionNotes && (
                  <div className="mb-6">
                    <h5 className="font-medium text-nexus-text-secondary mb-2">検品メモ</h5>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div
                        className="text-nexus-text-primary whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: product.inspectionNotes }}
                      />
                    </div>
                  </div>
                )}

                {/* 一般メモ */}
                {product.notes && (
                  <div className="mb-6">
                    <h5 className="font-medium text-nexus-text-secondary mb-2">メモ</h5>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div
                        className="text-nexus-text-primary whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: product.notes }}
                      />
                    </div>
                  </div>
                )}

                {/* 備考が何もない場合 */}
                {!product.description && !product.inspectionNotes && !product.notes && (
                  <div className="text-center py-8 text-nexus-text-secondary">
                    <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>備考情報はありません</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 配送ラベル生成モーダル */}
      <CarrierSelectionModal
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        onCarrierSelect={handleShippingRequest}
        item={{
          productName: product.name,
          orderNumber: `SELLER-${product.id.slice(-8)}`,
          shippingAddress: '配送先住所（セラー出荷）',
          value: product.price || 0
        }}
      />

      {/* キャンセル確認モーダル */}
      <BaseModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="商品キャンセルの確認"
        size="sm"
      >
        <div className="p-6">
          <div className="mb-6">
            <p className="text-nexus-text-primary">
              この商品をキャンセルしてもよろしいですか？
            </p>
            <p className="text-sm text-nexus-text-secondary mt-2">
              商品名: {product.name}
            </p>
            <p className="text-sm text-red-600 mt-3">
              ※ キャンセル後は元に戻すことができません
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <NexusButton
              onClick={() => setShowCancelConfirm(false)}
              variant="default"
            >
              戻る
            </NexusButton>
            <NexusButton
              onClick={handleCancelConfirm}
              variant="danger"
              disabled={isCancelling}
            >
              キャンセル実行
            </NexusButton>
          </div>
        </div>
      </BaseModal>
    </BaseModal>
  );
}
