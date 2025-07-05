'use client';

import { useState } from 'react';
import { BaseModal } from './ui';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: string;
  price: number;
  stock: number;
  location: string;
  description?: string;
  images?: string[];
  specifications?: Record<string, string>;
  history?: Array<{
    date: string;
    action: string;
    user: string;
    details: string;
  }>;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen || !product) return null;

  const demoHistory = [
    {
      date: '2024-12-25 14:30',
      action: '入庫',
      user: '田中スタッフ',
      details: '新規入庫 - 検品完了'
    },
    {
      date: '2024-12-20 10:15',
      action: '検品',
      user: '佐藤スタッフ',
      details: '品質検査合格'
    },
    {
      date: '2024-12-18 16:45',
      action: '受入',
      user: 'システム',
      details: '仕入先より受入'
    }
  ];

  const demoSpecs = {
    'ブランド': product.name.split(' ')[0] || 'Unknown',
    'モデル': product.name,
    '重量': '1.2kg',
    'サイズ': '150 x 100 x 80mm',
    '製造年': '2023',
    '保証期間': '1年間'
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      size="xl"
      className="max-h-[90vh] overflow-hidden"
    >
      <div className="p-6">
        <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              SKU: {product.sku}
            </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          {[
            { id: 'details', label: '詳細情報' },
            { id: 'specs', label: '仕様' },
            { id: 'history', label: '履歴' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      商品名
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">{product.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      カテゴリー
                    </label>
                    <p className="text-gray-900 dark:text-white">{product.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      価格
                    </label>
                    <p className="text-2xl font-bold text-green-600">
                      ¥{product.price.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      在庫数
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">{product.stock}点</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      保管場所
                    </label>
                    <p className="text-gray-900 dark:text-white">{product.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ステータス
                    </label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.status === '在庫あり' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Image placeholder */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  商品画像
                </label>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">画像データなし</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                商品仕様
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(demoSpecs).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{key}</span>
                    <span className="text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                商品履歴
              </h3>
              <div className="space-y-3">
                {demoHistory.map((item, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-purple-600">{item.action}</span>
                      <span className="text-sm text-gray-500">{item.date}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      担当: {item.user}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            閉じる
          </button>
          <button
            onClick={() => {
              console.log('編集機能: 詳細編集画面への遷移をシミュレート');
              // 実際の実装では編集モーダルまたは編集ページに遷移
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            編集
          </button>
        </div>
      </div>
    </BaseModal>
  );
}