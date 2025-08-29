'use client';

import { useState } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import BaseModal from '../../ui/BaseModal';
import NexusButton from '../../ui/NexusButton';
import { BusinessStatusIndicator } from '../../ui';
import ProductInspectionDetails from './ProductInspectionDetails';
import ProductPhotographyDetails from './ProductPhotographyDetails';
import ProductStorageDetails from './ProductStorageDetails';

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

export default function ProductDetailModal({ isOpen, onClose, product, onOpenListingForm }: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState('basic');

  if (!product) return null;

  const tabs = [
    { id: 'basic', label: '基本情報', icon: '📋' },
    { id: 'inspection', label: '検品項目', icon: '✅' },
    { id: 'photography', label: '撮影画像', icon: '📷' },
    { id: 'storage', label: '保管先', icon: '🏪' },
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
                  <span>{tab.icon}</span>
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
                      <span className="text-nexus-text-primary">{product.category || '未設定'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">保管場所</span>
                      <span className="text-nexus-text-primary">{product.location || '未設定'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-nexus-text-primary mb-2">状況・価値</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">ステータス</span>
                      <BusinessStatusIndicator 
                        status={convertStatusToKey(product.status) as any} 
                        size="sm" 
                      />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">品質ランク</span>
                      {getConditionBadge(product.condition)}
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-nexus-text-secondary">評価額</span>
                      <span className="font-bold text-blue-600 text-lg">
                        ¥{product.value ? product.value.toLocaleString() : '0'}
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
              
              {/* 認証情報 */}
              <div>
                <h4 className="font-bold text-nexus-text-primary mb-2">認証情報</h4>
                <div className="flex gap-2 flex-wrap">
                  {product.certifications && product.certifications.length > 0 ? (
                    product.certifications.map((cert: string) => (
                      <span key={cert} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                        {cert}
                      </span>
                    ))
                  ) : (
                    <span className="text-nexus-text-secondary text-sm">認証情報なし</span>
                  )}
                </div>
              </div>

              {/* セラー向けアクションボタン */}
              {product.status === 'storage' && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-end">
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
        </div>
      </div>
    </BaseModal>
  );
}
