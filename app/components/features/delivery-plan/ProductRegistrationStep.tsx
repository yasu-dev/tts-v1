'use client';

import { useState, useEffect } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import NexusSelect from '@/app/components/ui/NexusSelect';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import InspectionChecklistInput, { InspectionChecklistData } from '@/app/components/features/inspection/InspectionChecklistInput';
import EnhancedImageUploader from '@/app/components/features/EnhancedImageUploader';
import { PlusIcon, TrashIcon, PhotoIcon, CameraIcon } from '@heroicons/react/24/outline';

interface ProductImage {
  id: string;
  url: string;
  filename: string;
  category: string; // 'product', 'package', 'accessory', 'document'
  description?: string;
}

interface PhotographyRequest {
  specialPhotography: boolean; // 特別撮影要望の有無
  specialPhotographyItems: string[]; // 選択された特別撮影項目
  customRequests: string; // 任意の撮影要望（テキスト）
}

interface Product {
  name: string;
  condition: string;
  purchasePrice: number;
  purchaseDate: string;
  supplier: string;
  supplierDetails: string;
  category?: string;
  images?: ProductImage[]; // 商品画像
  inspectionChecklist?: InspectionChecklistData;
  photographyRequest?: PhotographyRequest; // 撮影要望
}

interface ProductRegistrationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const categoryOptions = [
  { value: 'camera', label: 'カメラ' },
  { value: 'watch', label: '腕時計' },
  { value: 'other', label: 'その他' }
];

const conditionOptions = [
  { value: 'excellent', label: '優良' },
  { value: 'very_good', label: '美品' },
  { value: 'good', label: '良好' },
  { value: 'fair', label: '普通' },
  { value: 'poor', label: '要修理' }
];

const imageCategoryOptions = [
  { value: 'product', label: '商品本体' },
  { value: 'package', label: '内箱・パッケージ' },
  { value: 'accessory', label: '付属品' },
  { value: 'document', label: '書類・保証書' },
  { value: 'other', label: 'その他' }
];

const specialPhotographyOptions = [
  { value: 'diagonal_45', label: '45度斜め撮影' },
  { value: 'closeup', label: 'クローズアップ撮影' },
  { value: 'functional_details', label: '機能部分詳細撮影' },
  { value: 'internal_structure', label: '内部構造撮影' },
  { value: 'accessories_individual', label: '付属品個別撮影' }
];

export default function ProductRegistrationStep({ 
  data, 
  onUpdate, 
  onNext, 
  onPrev,
  isFirstStep,
  isLastStep
}: ProductRegistrationStepProps) {
  const { showToast } = useToast();
  
  const defaultProducts: Product[] = [];

  // productsの安全な初期化
  const initialProducts = (() => {
    if (Array.isArray(data.products) && data.products.length > 0) {
      return data.products;
    }
    return defaultProducts;
  })();

  const [products, setProducts] = useState<Product[]>(initialProducts);

  // 商品が空の場合は何も自動更新しない

  const addProduct = () => {
    const newProduct: Product = {
      name: '',
      condition: 'excellent',
      purchasePrice: 0,
      purchaseDate: '',
      supplier: '',
      supplierDetails: '',
      category: 'camera',
      images: [], // 画像配列を初期化
      inspectionChecklist: {
        exterior: {
          scratches: false,
          dents: false,
          discoloration: false,
          dust: false,
        },
        functionality: {
          powerOn: false,
          allButtonsWork: false,
          screenDisplay: false,
          connectivity: false,
        },
        optical: {
          lensClarity: false,
          aperture: false,
          focusAccuracy: false,
          stabilization: false,
        },
        notes: '',
      },
      photographyRequest: {
        specialPhotography: false,
        specialPhotographyItems: [],
        customRequests: '',
      },
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    onUpdate({ ...data, products: updatedProducts });
    
    // 追加のフィードバック
    showToast('商品を追加しました', 'success');
  };

  const updateProduct = (index: number, field: string, value: any) => {
    const updatedProducts = products.map((product: any, i: number) => 
      i === index ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);
    onUpdate({ products: updatedProducts });
  };

  const updateInspectionChecklist = (index: number, checklistData: InspectionChecklistData) => {
    const updatedProducts = products.map((product: any, i: number) => 
      i === index ? { ...product, inspectionChecklist: checklistData } : product
    );
    setProducts(updatedProducts);
    onUpdate({ products: updatedProducts });
  };

  const updatePhotographyRequest = (index: number, photographyData: PhotographyRequest) => {
    const updatedProducts = products.map((product: any, i: number) => 
      i === index ? { ...product, photographyRequest: photographyData } : product
    );
    setProducts(updatedProducts);
    onUpdate({ products: updatedProducts });
  };


  // 画像アップロード関連の関数
  const handleImageUpload = async (index: number, files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      
      // productIdとcategoryを追加（一意のIDを生成）
      const productId = `product-${index}-${Date.now()}`;
      formData.append('productId', productId);
      formData.append('category', 'general');
      
      console.log('[DEBUG] 画像アップロード開始:', {
        productIndex: index,
        productId,
        fileCount: files.length,
        files: files.map(f => f.name)
      });
      
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('画像のアップロードに失敗しました');
      }

      const result = await response.json();
      
      // アップロードされた画像を商品に追加
      const newImages = result.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        filename: img.filename,
        category: 'product', // デフォルトカテゴリ
      }));

      const currentImages = products[index]?.images || [];
      updateProduct(index, 'images', [...currentImages, ...newImages]);

      showToast({
        type: 'success',
        title: '画像アップロード完了',
        message: `${files.length}枚の画像をアップロードしました`,
      });
    } catch (error) {
      console.error('[ERROR] 商品画像アップロードエラー:', error);
      
      let errorMessage = '画像のアップロードに失敗しました';
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = '画像アップロードAPIが見つかりません。管理者にお問い合わせください。';
        } else if (error.message.includes('413') || error.message.includes('size')) {
          errorMessage = 'ファイルサイズが大きすぎます。10MB以下の画像を選択してください。';
        } else if (error.message.includes('415') || error.message.includes('format')) {
          errorMessage = 'サポートされていないファイル形式です。JPEG、PNG、WebPファイルを使用してください。';
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
        } else {
          errorMessage = error.message;
        }
      }
      
      showToast({
        type: 'error',
        title: '画像アップロードエラー',
        message: errorMessage,
        duration: 6000
      });
    }
  };

  const removeImage = (productIndex: number, imageId: string) => {
    const currentImages = products[productIndex]?.images || [];
    const updatedImages = currentImages.filter((img: ProductImage) => img.id !== imageId);
    updateProduct(productIndex, 'images', updatedImages);
    
    showToast({
      type: 'success',
      title: '画像削除完了',
      message: '画像を削除しました',
    });
  };

  const updateImageCategory = (productIndex: number, imageId: string, category: string) => {
    const currentImages = products[productIndex]?.images || [];
    const updatedImages = currentImages.map((img: ProductImage) => 
      img.id === imageId ? { ...img, category } : img
    );
    updateProduct(productIndex, 'images', updatedImages);
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
      !product.name || !product.condition || product.purchasePrice <= 0
    );
    
    if (hasIncompleteProducts) {
      showToast({
        type: 'warning',
        title: '入力不完全',
        message: 'すべての商品の必須項目（商品名、コンディション、購入価格）を入力してください'
      });
      return;
    }
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-nexus-text-primary mb-4">商品登録</h2>
        <p className="text-nexus-text-secondary mb-6">納品する商品の詳細情報を入力してください</p>
      </div>

      {!Array.isArray(products) || products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-nexus-text-secondary mb-4">登録された商品がありません</p>
          <NexusButton variant="primary" onClick={addProduct}>
            最初の商品を追加
          </NexusButton>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.isArray(products) && products.map((product: any, index: number) => (
            <div key={index} className="border border-nexus-border rounded-lg p-6 bg-nexus-bg-secondary">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-nexus-text-primary">商品 {index + 1}</h3>
                <NexusButton 
                  variant="danger" 
                  size="sm" 
                  onClick={() => removeProduct(index)}
                >
                  削除
                </NexusButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 必須項目 */}
                <NexusInput
                  label="商品名"
                  value={product.name}
                  onChange={(e) => updateProduct(index, 'name', e.target.value)}
                  placeholder="商品名を入力"
                  required
                  variant="nexus"
                />

                <NexusSelect
                  label="カテゴリー"
                  value={product.category || 'camera'}
                  onChange={(e) => updateProduct(index, 'category', e.target.value)}
                  options={categoryOptions}
                  variant="nexus"
                />

                <NexusSelect
                  label="コンディション"
                  value={product.condition}
                  onChange={(e) => updateProduct(index, 'condition', e.target.value)}
                  options={conditionOptions}
                  required
                  variant="nexus"
                />

                <NexusInput
                  label="購入価格"
                  type="number"
                  value={product.purchasePrice === 0 ? '' : product.purchasePrice.toString()}
                  onChange={(e) => updateProduct(index, 'purchasePrice', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                  placeholder="購入価格を入力"
                  min="0"
                  required
                  variant="nexus"
                />



                {/* 任意項目 */}
                <NexusInput
                  label="仕入日"
                  type="date"
                  value={product.purchaseDate}
                  onChange={(e) => updateProduct(index, 'purchaseDate', e.target.value)}
                  variant="nexus"
                />

                <NexusInput
                  label="仕入先"
                  value={product.supplier}
                  onChange={(e) => updateProduct(index, 'supplier', e.target.value)}
                  placeholder="仕入先を入力"
                  variant="nexus"
                />

                <div className="md:col-span-2">
                  <NexusTextarea
                    label="仕入れ詳細"
                    value={product.supplierDetails}
                    onChange={(e) => updateProduct(index, 'supplierDetails', e.target.value)}
                    rows={3}
                    placeholder="仕入れに関する詳細情報があれば入力"
                    variant="nexus"
                  />
                </div>
              </div>

              {/* 商品画像アップロード */}
              <div className="mt-6 border-t pt-6">
                <h4 className="text-lg font-medium text-nexus-text-primary mb-4 flex items-center gap-2">
                  <PhotoIcon className="h-5 w-5" />
                  商品画像（任意）
                </h4>
                <p className="text-sm text-nexus-text-secondary mb-4">
                  商品本体、内箱、付属品、書類など、任意の数の画像をアップロードできます。
                </p>
                
                {/* アップロード済み画像の表示 */}
                {product.images && product.images.length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {product.images.map((image: ProductImage) => (
                        <div key={image.id} className="relative group border border-nexus-border rounded-lg overflow-hidden">
                          <img 
                            src={image.url} 
                            alt={image.filename}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex gap-2">
                              <NexusButton
                                size="sm"
                                variant="danger"
                                onClick={() => removeImage(index, image.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </NexusButton>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
                            <select
                              value={image.category}
                              onChange={(e) => updateImageCategory(index, image.id, e.target.value)}
                              className="w-full text-xs bg-transparent border-none text-white"
                            >
                              {imageCategoryOptions.map(option => (
                                <option key={option.value} value={option.value} className="text-black">
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 画像アップロードエリア */}
                <EnhancedImageUploader
                  maxFiles={10}
                  maxSize={10 * 1024 * 1024} // 10MB
                  acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
                  onUpload={(files: File[]) => handleImageUpload(index, files)}
                  enableEdit={false}
                  enableWatermark={false}
                  autoUpload={true}
                />
              </div>

              {/* 検品チェックリスト入力 */}
              <div className="mt-6 border-t pt-6">
                <InspectionChecklistInput
                  data={product.inspectionChecklist || {
                    exterior: {
                      scratches: false,
                      dents: false,
                      discoloration: false,
                      dust: false,
                    },
                    functionality: {
                      powerOn: false,
                      allButtonsWork: false,
                      screenDisplay: false,
                      connectivity: false,
                    },
                    optical: product.category === 'camera_body' || product.category === 'lens' ? {
                      lensClarity: false,
                      aperture: false,
                      focusAccuracy: false,
                      stabilization: false,
                    } : undefined,
                    notes: '',
                  }}
                  onChange={(checklistData) => updateInspectionChecklist(index, checklistData)}
                  showOptical={product.category === 'camera_body' || product.category === 'lens'}
                  readOnly={false}
                />
              </div>

              {/* 撮影要望セクション */}
              <div className="mt-6 border-t pt-6">
                <h4 className="text-lg font-medium text-nexus-text-primary mb-4 flex items-center gap-2">
                  <CameraIcon className="h-5 w-5" />
                  撮影要望（任意）
                </h4>
                <p className="text-sm text-nexus-text-secondary mb-4">
                  基本撮影（正面・背面・側面等）はスタッフが標準で実施いたします。特別な撮影をご希望の場合はこちらでご指定ください。
                </p>

                {(() => {
                  const currentRequest = product.photographyRequest || {
                    specialPhotography: false,
                    specialPhotographyItems: [],
                    customRequests: '',
                  };

                  return (
                    <div className="space-y-4">
                      {/* 特別撮影の有無チェック */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`special-photography-${index}`}
                          checked={currentRequest.specialPhotography}
                          onChange={(e) => {
                            const newRequest = {
                              ...currentRequest,
                              specialPhotography: e.target.checked,
                              specialPhotographyItems: e.target.checked ? currentRequest.specialPhotographyItems : [],
                            };
                            updatePhotographyRequest(index, newRequest);
                          }}
                          className="w-4 h-4 text-nexus-primary bg-white border-nexus-border rounded focus:ring-nexus-primary focus:ring-2"
                        />
                        <label 
                          htmlFor={`special-photography-${index}`}
                          className="text-sm font-medium text-nexus-text-primary cursor-pointer"
                        >
                          特別撮影を依頼する
                        </label>
                      </div>

                      {/* 特別撮影項目選択（特別撮影がチェックされている場合のみ表示） */}
                      {currentRequest.specialPhotography && (
                        <div className="ml-6 p-4 bg-nexus-bg-tertiary rounded-lg border border-nexus-border space-y-4">
                          {/* 特別撮影項目選択 */}
                          <div>
                            <h5 className="text-sm font-medium text-nexus-text-primary mb-3">特別撮影項目（複数選択可）</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {specialPhotographyOptions.map((option) => (
                                <div key={option.value} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`photo-option-${index}-${option.value}`}
                                    checked={currentRequest.specialPhotographyItems.includes(option.value)}
                                    onChange={(e) => {
                                      const newItems = e.target.checked
                                        ? [...currentRequest.specialPhotographyItems, option.value]
                                        : currentRequest.specialPhotographyItems.filter(item => item !== option.value);
                                      
                                      const newRequest = {
                                        ...currentRequest,
                                        specialPhotographyItems: newItems,
                                      };
                                      updatePhotographyRequest(index, newRequest);
                                    }}
                                    className="w-4 h-4 text-nexus-primary bg-white border-nexus-border rounded focus:ring-nexus-primary focus:ring-2"
                                  />
                                  <label 
                                    htmlFor={`photo-option-${index}-${option.value}`}
                                    className="text-sm text-nexus-text-primary cursor-pointer"
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 任意の撮影要望 */}
                          <div>
                            <label className="block text-sm font-medium text-nexus-text-primary mb-2">
                              任意の撮影要望
                            </label>
                            <NexusTextarea
                              value={currentRequest.customRequests}
                              onChange={(e) => {
                                const newRequest = {
                                  ...currentRequest,
                                  customRequests: e.target.value,
                                };
                                updatePhotographyRequest(index, newRequest);
                              }}
                              rows={3}
                              placeholder="例：レンズのカビ状態を詳細に撮影してください、シャッター動作を動画で記録希望など"
                              maxLength={500}
                              variant="nexus"
                            />
                            <p className="text-xs text-nexus-text-tertiary mt-1">
                              {currentRequest.customRequests.length}/500文字
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
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