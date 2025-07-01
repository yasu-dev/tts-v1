'use client';

import { useState, useEffect } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import InspectionChecklist from './InspectionChecklist';
import PhotoUploader from './PhotoUploader';
import InspectionResult from './InspectionResult';

export interface InspectionFormProps {
  productId: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model: string;
  status: string;
  imageUrl?: string;
}

interface InspectionData {
  productId: string;
  checklist: {
    exterior: {
      scratches: boolean;
      dents: boolean;
      discoloration: boolean;
      dust: boolean;
    };
    functionality: {
      powerOn: boolean;
      allButtonsWork: boolean;
      screenDisplay: boolean;
      connectivity: boolean;
    };
    optical?: {
      lensClarity: boolean;
      aperture: boolean;
      focusAccuracy: boolean;
      stabilization: boolean;
    };
  };
  photos: string[];
  notes: string;
  inspectionDate: string;
  inspectorId: string;
  result: 'passed' | 'failed' | 'conditional';
}

export default function InspectionForm({ productId }: InspectionFormProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [inspectionData, setInspectionData] = useState<InspectionData>({
    productId,
    checklist: {
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
    },
    photos: [],
    notes: '',
    inspectionDate: new Date().toISOString(),
    inspectorId: 'staff-001', // 実際はAuthから取得
    result: 'passed',
  });

  const steps = [
    { id: 0, title: '基本情報', icon: '📋' },
    { id: 1, title: '検品項目', icon: '✅' },
    { id: 2, title: '写真撮影', icon: '📸' },
    { id: 3, title: '確認・完了', icon: '📝' },
  ];

  useEffect(() => {
    // 商品情報を取得（実際はAPIから）
    setTimeout(() => {
      setProduct({
        id: productId,
        name: 'Canon EOS R5 ボディ',
        sku: `TWD-2024-${productId}`,
        category: 'camera_body',
        brand: 'Canon',
        model: 'EOS R5',
        status: 'pending_inspection',
        imageUrl: '/api/placeholder/400/300',
      });
      setLoading(false);
    }, 500);
  }, [productId]);

  const updateChecklist = (category: string, item: string, value: boolean) => {
    setInspectionData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [category]: {
          ...prev.checklist[category as keyof typeof prev.checklist],
          [item]: value,
        },
      },
    }));
  };

  const updatePhotos = (photos: string[]) => {
    setInspectionData(prev => ({
      ...prev,
      photos,
    }));
  };

  const submitInspection = async () => {
    try {
      setLoading(true);
      
      // 検品結果を判定
      const allChecks = Object.values(inspectionData.checklist).flatMap(category =>
        Object.values(category || {})
      );
      const passedChecks = allChecks.filter(check => check).length;
      const totalChecks = allChecks.length;
      
      let result: 'passed' | 'failed' | 'conditional' = 'passed';
      if (passedChecks < totalChecks * 0.6) {
        result = 'failed';
      } else if (passedChecks < totalChecks * 0.9) {
        result = 'conditional';
      }

      const finalData = {
        ...inspectionData,
        result,
      };

      // APIに送信（実際の実装）
      const response = await fetch(`/api/products/${productId}/inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        throw new Error('検品結果の保存に失敗しました');
      }

      alert('検品が完了しました');
      window.location.href = '/staff/inspection';
    } catch (error) {
      console.error('[ERROR] Inspection submission:', error);
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !product) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-b-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <NexusCard className="p-6 text-center">
        <p className="text-gray-500">商品が見つかりません</p>
      </NexusCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* 商品情報カード */}
      <NexusCard className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <img
              src={product.imageUrl || '/api/placeholder/400/300'}
              alt={product.name}
              className="w-full rounded-lg"
            />
          </div>
          <div className="md:w-2/3 space-y-2">
            <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">SKU:</span>
                <span className="ml-2 font-medium">{product.sku}</span>
              </div>
              <div>
                <span className="text-gray-600">ブランド:</span>
                <span className="ml-2 font-medium">{product.brand}</span>
              </div>
              <div>
                <span className="text-gray-600">モデル:</span>
                <span className="ml-2 font-medium">{product.model}</span>
              </div>
              <div>
                <span className="text-gray-600">カテゴリ:</span>
                <span className="ml-2 font-medium">
                  {product.category === 'camera_body' ? 'カメラボディ' : product.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      </NexusCard>

      {/* ステップインジケーター（タブレット最適化） */}
      <div className="flex justify-between items-center bg-white rounded-lg p-4 shadow-sm">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(step.id)}
            className={`flex-1 flex flex-col items-center p-3 rounded-lg transition-all ${
              currentStep === step.id
                ? 'bg-blue-50 text-blue-600'
                : index < currentStep
                ? 'text-green-600'
                : 'text-gray-400'
            }`}
          >
            <span className="text-2xl mb-1">{step.icon}</span>
            <span className="text-sm font-medium hidden md:block">{step.title}</span>
          </button>
        ))}
      </div>

      {/* ステップコンテンツ */}
      <div className="min-h-[500px]">
        {currentStep === 0 && (
          <NexusCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">検品開始前の確認</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">
                  これから商品の検品を開始します。以下の点をご確認ください：
                </p>
                <ul className="mt-3 space-y-2 text-sm text-blue-700">
                  <li>• 商品を清潔な場所に置いてください</li>
                  <li>• 十分な照明を確保してください</li>
                  <li>• カメラやタブレットの準備ができているか確認してください</li>
                  <li>• 手袋を着用することを推奨します</li>
                </ul>
              </div>
              <div className="flex justify-end">
                <NexusButton
                  onClick={() => setCurrentStep(1)}
                  variant="primary"
                  size="lg"
                >
                  検品を開始
                </NexusButton>
              </div>
            </div>
          </NexusCard>
        )}

        {currentStep === 1 && (
          <InspectionChecklist
            category={product.category}
            checklist={inspectionData.checklist}
            onUpdate={updateChecklist}
            onNext={() => setCurrentStep(2)}
            onPrev={() => setCurrentStep(0)}
          />
        )}

        {currentStep === 2 && (
          <PhotoUploader
            productId={productId}
            photos={inspectionData.photos}
            onUpdate={updatePhotos}
            onNext={() => setCurrentStep(3)}
            onPrev={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <InspectionResult
            product={product}
            inspectionData={inspectionData}
            onNotesChange={(notes) => setInspectionData(prev => ({ ...prev, notes }))}
            onSubmit={submitInspection}
            onPrev={() => setCurrentStep(2)}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
} 