'use client';

import { useState } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusCard from '@/app/components/ui/NexusCard';

interface Product {
  name: string;
  category: 'camera_body' | 'lens' | 'watch' | 'accessory';
  brand: string;
  model: string;
  serialNumber?: string;
  estimatedValue: number;
  description?: string;
}

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
}: ProductRegistrationStepProps) {
  const [products, setProducts] = useState<Product[]>(data.products || []);
  const [currentProduct, setCurrentProduct] = useState<Product>({
    name: '',
    category: 'camera_body',
    brand: '',
    model: '',
    serialNumber: '',
    estimatedValue: 0,
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: 'camera_body', label: 'カメラ本体' },
    { value: 'lens', label: 'レンズ' },
    { value: 'watch', label: '時計' },
    { value: 'accessory', label: 'アクセサリー' },
  ];

  const validateProduct = () => {
    const newErrors: Record<string, string> = {};

    if (!currentProduct.name.trim()) {
      newErrors.name = '商品名は必須です';
    }

    if (!currentProduct.brand.trim()) {
      newErrors.brand = 'ブランド名は必須です';
    }

    if (!currentProduct.model.trim()) {
      newErrors.model = 'モデル名は必須です';
    }

    if (currentProduct.estimatedValue <= 0) {
      newErrors.estimatedValue = '見積価格を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = () => {
    if (validateProduct()) {
      setProducts([...products, currentProduct]);
      setCurrentProduct({
        name: '',
        category: 'camera_body',
        brand: '',
        model: '',
        serialNumber: '',
        estimatedValue: 0,
        description: '',
      });
      setErrors({});
    }
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (products.length === 0) {
      alert('少なくとも1つの商品を登録してください');
      return;
    }
    onUpdate({ products });
    onNext();
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setCurrentProduct(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">商品登録</h2>
        <p className="text-gray-600 mb-6">
          納品する商品の情報を登録してください。
        </p>
      </div>

      {/* 登録済み商品リスト */}
      {products.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">登録済み商品</h3>
          <div className="space-y-2">
            {products.map((product, index) => (
              <NexusCard key={index} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      {product.brand} - {product.model}
                    </p>
                    <p className="text-sm text-gray-500">
                      カテゴリー: {categories.find(c => c.value === product.category)?.label}
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                      見積価格: ¥{product.estimatedValue.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveProduct(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    削除
                  </button>
                </div>
              </NexusCard>
            ))}
          </div>
        </div>
      )}

      {/* 商品入力フォーム */}
      <NexusCard className="p-6">
        <h3 className="text-lg font-medium mb-4">新規商品追加</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentProduct.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-md 
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.name ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder="例: Canon EOS R5"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリー <span className="text-red-500">*</span>
            </label>
            <select
              value={currentProduct.category}
              onChange={(e) => handleInputChange('category', e.target.value as Product['category'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ブランド <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentProduct.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.brand ? 'border-red-500' : 'border-gray-300'}
                `}
                placeholder="例: Canon"
              />
              {errors.brand && (
                <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                モデル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentProduct.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.model ? 'border-red-500' : 'border-gray-300'}
                `}
                placeholder="例: EOS R5"
              />
              {errors.model && (
                <p className="text-red-500 text-sm mt-1">{errors.model}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                シリアル番号
              </label>
              <input
                type="text"
                value={currentProduct.serialNumber}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                見積価格（円） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={currentProduct.estimatedValue || ''}
                onChange={(e) => handleInputChange('estimatedValue', parseInt(e.target.value) || 0)}
                className={`
                  w-full px-3 py-2 border rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.estimatedValue ? 'border-red-500' : 'border-gray-300'}
                `}
                placeholder="例: 250000"
              />
              {errors.estimatedValue && (
                <p className="text-red-500 text-sm mt-1">{errors.estimatedValue}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備考・説明
            </label>
            <textarea
              value={currentProduct.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="商品の状態や付属品などを記載してください"
            />
          </div>

          <div className="flex justify-end">
            <NexusButton
              onClick={handleAddProduct}
              variant="secondary"
              className="px-6"
            >
              商品を追加
            </NexusButton>
          </div>
        </form>
      </NexusCard>

      <div className="flex justify-between pt-6">
        <NexusButton onClick={onPrev} variant="secondary" className="px-6">
          戻る
        </NexusButton>
        <NexusButton onClick={handleNext} className="px-6">
          次へ
        </NexusButton>
      </div>
    </div>
  );
} 