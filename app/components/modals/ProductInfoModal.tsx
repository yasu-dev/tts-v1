"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Package, MapPin, Calendar, User, FileText, Tag } from 'lucide-react';
import { useModal } from '@/app/components/ui/ModalContext';

// 商品情報表示用の型定義
interface ProductInfo {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: string;
  condition: string;
  price: number;
  description?: string;
  imageUrl?: string;
  entryDate: string;
  inspectedAt?: string;
  inspectedBy?: string;
  inspectionNotes?: string;
  currentLocation?: {
    id: string;
    code: string;
    name: string;
    zone: string;
  };
  seller?: {
    id: string;
    username: string;
  };
  images?: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string;
    description?: string;
  }>;
  updatedAt: string;
}

interface ProductInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductInfo | null;
}

export default function ProductInfoModal({ isOpen, onClose, product }: ProductInfoModalProps) {
  const { setIsAnyModalOpen } = useModal();

  // モーダル開閉時の業務フロー制御
  useEffect(() => {
    if (isOpen) {
      setIsAnyModalOpen(true);
    } else {
      setIsAnyModalOpen(false);
    }
    
    // クリーンアップ
    return () => setIsAnyModalOpen(false);
  }, [isOpen, setIsAnyModalOpen]);

  if (!isOpen || !product) return null;

  // カテゴリの日本語ラベル
  const categoryLabels: Record<string, string> = {
    camera: 'カメラ',
    watch: '腕時計',
    lens: 'レンズ',
    accessory: 'アクセサリー',
    other: 'その他',
  };

  // ステータスの日本語ラベル
  const statusLabels: Record<string, string> = {
    pending_inspection: '検品待ち',
    inspecting: '検品中',
    storage: '保管中',
    completed: '検品完了',
    failed: '検品不合格',
    listed: '出品中',
    sold: '売却済み',
  };

  // コンディションの日本語ラベル（納品プランと統一）
  const conditionLabels: Record<string, string> = {
    new: '新品',
    like_new: '新品同様',
    excellent: '優良',
    very_good: '美品',
    good: '良好',
    fair: '普通',
    poor: '要修理',
    unknown: 'コンディション不明',
  };

  // ステータスに応じたスタイル
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'storage':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 価格のフォーマット
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">商品情報</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 商品画像セクション */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {/* メイン画像 */}
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {product.imageUrl || (product.images && product.images.length > 0) ? (
                    <Image
                      src={product.imageUrl || product.images![0].url}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="h-16 w-16" />
                    </div>
                  )}
                </div>

                {/* サブ画像（もしあれば） */}
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2">
                    {product.images.slice(1, 4).map((image) => (
                      <div key={image.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={image.thumbnailUrl || image.url}
                          alt={image.description || `${product.name} 追加画像`}
                          width={120}
                          height={120}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 商品詳細情報セクション */}
            <div className="lg:col-span-2 space-y-6">
              {/* 基本情報 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">商品名</label>
                    <p className="text-gray-900 font-medium">{product.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">SKU</label>
                    <p className="text-gray-900 font-mono">{product.sku}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">カテゴリ</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{categoryLabels[product.category] || product.category}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">コンディション</label>
                    <p className="text-gray-900">{conditionLabels[product.condition] || product.condition}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">購入価格</label>
                    <p className="text-gray-900 font-semibold mt-1">{formatPrice(product.price)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">ステータス</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-1 ${getStatusStyle(product.status)}`}>
                      {statusLabels[product.status] || product.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* 検品・保管情報 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">検品・保管情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.inspectedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">検品完了日時</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-900">{formatDate(product.inspectedAt)}</span>
                      </div>
                    </div>
                  )}
                  {product.inspectedBy && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">検品者</label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-900">{product.inspectedBy}</span>
                      </div>
                    </div>
                  )}
                  {product.currentLocation && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">保管場所</label>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-900">
                          {product.currentLocation.code} - {product.currentLocation.name}
                          <span className="text-gray-500 ml-2">({product.currentLocation.zone})</span>
                        </span>
                      </div>
                    </div>
                  )}
                  {product.inspectionNotes && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">検品メモ</label>
                      <div className="flex items-start gap-2 mt-1">
                        <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                        <p className="text-gray-900 text-sm leading-relaxed">{product.inspectionNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 商品説明（もしあれば） */}
              {product.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">商品説明</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* タイムスタンプ情報 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">履歴情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">入庫日</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{formatDate(product.entryDate)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">最終更新</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{formatDate(product.updatedAt)}</span>
                    </div>
                  </div>
                  {product.seller && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">出品者</label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-900">{product.seller.username}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


