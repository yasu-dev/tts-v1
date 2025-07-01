'use client';

import { useState } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import PhotoUploader from './PhotoUploader';
import InspectionForm from './InspectionForm';
import InspectionResult from './InspectionResult';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model: string;
  status: string;
}

interface InspectionChecklistProps {
  product: Product;
}

export default function InspectionChecklist({ product }: InspectionChecklistProps) {
  const [currentStep, setCurrentStep] = useState<'photos' | 'checklist' | 'result'>('photos');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [inspectionData, setInspectionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePhotosComplete = (photos: string[]) => {
    setUploadedPhotos(photos);
    setCurrentStep('checklist');
  };

  const handleChecklistComplete = (data: any) => {
    setInspectionData(data);
    setCurrentStep('result');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // APIに検品結果を送信
      const response = await fetch(`/api/inspection/${product.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: uploadedPhotos,
          inspection: inspectionData,
        }),
      });

      if (response.ok) {
        alert('検品が完了しました');
        window.location.href = '/staff/inventory';
      }
    } catch (error) {
      console.error('[ERROR] Inspection submit:', error);
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 商品情報カード */}
      <NexusCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <dl className="space-y-1 text-sm">
              <div className="flex">
                <dt className="font-medium text-gray-700 w-20">SKU:</dt>
                <dd className="text-gray-900">{product.sku}</dd>
              </div>
              <div className="flex">
                <dt className="font-medium text-gray-700 w-20">ブランド:</dt>
                <dd className="text-gray-900">{product.brand}</dd>
              </div>
              <div className="flex">
                <dt className="font-medium text-gray-700 w-20">モデル:</dt>
                <dd className="text-gray-900">{product.model}</dd>
              </div>
            </dl>
          </div>
          <div className="flex items-center justify-end">
            <div className="text-right">
              <p className="text-sm text-gray-600">検品ステータス</p>
              <p className="text-lg font-medium text-yellow-600">検品中</p>
            </div>
          </div>
        </div>
      </NexusCard>

      {/* ステップインジケーター（タブレット最適化） */}
      <div className="flex justify-between items-center mb-8">
        <div className={`flex-1 text-center ${currentStep === 'photos' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
            currentStep === 'photos' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            1
          </div>
          <p className="text-sm font-medium">写真撮影</p>
        </div>
        <div className="flex-1 border-t-2 border-gray-200 mx-2"></div>
        <div className={`flex-1 text-center ${currentStep === 'checklist' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
            currentStep === 'checklist' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            2
          </div>
          <p className="text-sm font-medium">検品項目</p>
        </div>
        <div className="flex-1 border-t-2 border-gray-200 mx-2"></div>
        <div className={`flex-1 text-center ${currentStep === 'result' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
            currentStep === 'result' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            3
          </div>
          <p className="text-sm font-medium">確認・送信</p>
        </div>
      </div>

      {/* ステップコンテンツ */}
      <NexusCard className="p-6">
        {currentStep === 'photos' && (
          <PhotoUploader
            onComplete={handlePhotosComplete}
            minPhotos={6}
            productCategory={product.category}
          />
        )}

        {currentStep === 'checklist' && (
          <InspectionForm
            productCategory={product.category}
            onComplete={handleChecklistComplete}
            onBack={() => setCurrentStep('photos')}
          />
        )}

        {currentStep === 'result' && (
          <InspectionResult
            product={product}
            photos={uploadedPhotos}
            inspectionData={inspectionData}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep('checklist')}
            loading={loading}
          />
        )}
      </NexusCard>
    </div>
  );
} 