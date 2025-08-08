'use client';

import { useState, useEffect } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import NexusSelect from '@/app/components/ui/NexusSelect';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import InspectionChecklistInput, { InspectionChecklistData } from '@/app/components/features/inspection/InspectionChecklistInput';

interface Product {
  name: string;
  condition: string;
  purchasePrice: number;
  purchaseDate: string;
  supplier: string;
  supplierDetails: string;
  category?: string;
  inspectionChecklist?: InspectionChecklistData;
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

export default function ProductRegistrationStep({ 
  data, 
  onUpdate, 
  onNext, 
  onPrev,
  isFirstStep,
  isLastStep
}: ProductRegistrationStepProps) {
  const { showToast } = useToast();
  
  const defaultProducts: Product[] = [
    // デモ用のデフォルト商品データ
    {
      name: 'Canon EOS R5',
      condition: 'excellent',
      purchasePrice: 380000,
      purchaseDate: '',
      supplier: '',
      supplierDetails: '',
      category: 'camera',
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
      }
    }
  ];

  const [products, setProducts] = useState(data.products || defaultProducts);

  // 初期化時に商品データを親コンポーネントに送信
  useEffect(() => {
    if (!data.products || data.products.length === 0) {
      onUpdate({ products: defaultProducts });
    }
  }, []);

  const addProduct = () => {
    const newProduct: Product = {
      name: '',
      condition: 'excellent',
      purchasePrice: 0,
      purchaseDate: '',
      supplier: '',
      supplierDetails: '',
      category: 'camera',
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
      }
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

  const updateInspectionChecklist = (index: number, checklistData: InspectionChecklistData) => {
    const updatedProducts = products.map((product: any, i: number) => 
      i === index ? { ...product, inspectionChecklist: checklistData } : product
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

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-nexus-text-secondary mb-4">登録された商品がありません</p>
          <NexusButton variant="primary" onClick={addProduct}>
            最初の商品を追加
          </NexusButton>
        </div>
      ) : (
        <div className="space-y-6">
          {products.map((product: any, index: number) => (
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
                  value={product.purchasePrice}
                  onChange={(e) => updateProduct(index, 'purchasePrice', parseInt(e.target.value) || 0)}
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