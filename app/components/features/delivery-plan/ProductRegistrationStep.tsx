'use client';

import { useState } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface ProductRegistrationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function ProductRegistrationStep({ 
  data, 
  onUpdate, 
  onNext, 
  onPrev,
  isFirstStep,
  isLastStep
}: ProductRegistrationStepProps) {
  const { showToast } = useToast();
  const [products, setProducts] = useState(data.products || []);

  const addProduct = () => {
    const newProduct = {
      name: '',
      category: 'camera_body' as const,
      brand: '',
      model: '',
      serialNumber: '',
      estimatedValue: 0,
      description: ''
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    onUpdate({ products: updatedProducts });
  };

  const updateProduct = (index: number, field: string, value: any) => {
    const updatedProducts = products.map((product: any, i: number) => 
      i === index ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);
    onUpdate({ products: updatedProducts });
  };

  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_: any, i: number) => i !== index);
    setProducts(updatedProducts);
    onUpdate({ products: updatedProducts });
  };

  const handleNext = () => {
    if (products.length === 0) {
      showToast({
        type: 'warning',
        title: '商品が必要',
        message: '少なくとも1つの商品を登録してください'
      });
      return;
    }
    
    const hasIncompleteProducts = products.some((product: any) => 
      !product.name || !product.brand || !product.model || product.estimatedValue <= 0
    );
    
    if (hasIncompleteProducts) {
      showToast({
        type: 'warning',
        title: '入力不完全',
        message: 'すべての商品の必須項目を入力してください'
      });
      return;
    }
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">商品登録</h2>
        <p className="text-gray-600 mb-6">納品する商品の詳細情報を入力してください</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">登録された商品がありません</p>
          <NexusButton variant="primary" onClick={addProduct}>
            最初の商品を追加
          </NexusButton>
        </div>
      ) : (
        <div className="space-y-6">
          {products.map((product: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">商品 {index + 1}</h3>
                <NexusButton 
                  variant="danger" 
                  size="sm" 
                  onClick={() => removeProduct(index)}
                >
                  削除
                </NexusButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    商品名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => updateProduct(index, 'name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="商品名を入力"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カテゴリ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={product.category}
                    onChange={(e) => updateProduct(index, 'category', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="camera_body">カメラボディ</option>
                    <option value="lens">レンズ</option>
                    <option value="watch">腕時計</option>
                    <option value="accessory">アクセサリー</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ブランド <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={product.brand}
                    onChange={(e) => updateProduct(index, 'brand', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ブランド名を入力"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    モデル <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={product.model}
                    onChange={(e) => updateProduct(index, 'model', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="モデル名を入力"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    シリアル番号
                  </label>
                  <input
                    type="text"
                    value={product.serialNumber}
                    onChange={(e) => updateProduct(index, 'serialNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="シリアル番号を入力"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    予想価格 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={product.estimatedValue}
                    onChange={(e) => updateProduct(index, 'estimatedValue', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="予想価格を入力"
                    min="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    商品説明
                  </label>
                  <textarea
                    value={product.description}
                    onChange={(e) => updateProduct(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="商品の状態や特記事項があれば入力"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="text-center">
            <NexusButton variant="secondary" onClick={addProduct}>
              商品を追加
            </NexusButton>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <NexusButton variant="default" onClick={onPrev}>
          前に戻る
        </NexusButton>
        <NexusButton variant="primary" onClick={handleNext}>
          次へ進む
        </NexusButton>
      </div>
    </div>
  );
} 