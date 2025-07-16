'use client';

import { useState, useEffect } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import InspectionChecklist from './InspectionChecklist';
import PhotoUploader from './PhotoUploader';
import InspectionResult from './InspectionResult';
import TimestampVideoRecorder from '@/app/components/features/video/TimestampVideoRecorder';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

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
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [videoId, setVideoId] = useState<string | null>(null);
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
    { 
      id: 0, 
      title: '基本情報', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
        </svg>
      )
    },
    { 
      id: 1, 
      title: '検品項目', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 2, 
      title: '動画記録', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 3, 
      title: '写真撮影', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      id: 4, 
      title: '確認・完了', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
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
      
      // バリデーション
      const validationResult = validateInspectionData(inspectionData);
      if (!validationResult.isValid) {
        showToast({
          type: 'warning',
          title: '検品データ不備',
          message: validationResult.errors.join(', '),
          duration: 4000
        });
        setLoading(false);
        return;
      }
      
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
        completedAt: new Date().toISOString(),
        videoId: videoId || undefined,
      };

      // デモ用：API呼び出しをモック処理に変更
      console.log('検品結果送信（モック）:', finalData);
      
      // 本番用APIコード（現在コメントアウト）
      /*
      const response = await fetch(`/api/products/${productId}/inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `検品結果の保存に失敗しました: ${response.status}`);
      }

      const savedData = await response.json();

      // 商品ステータスの更新
      await fetch(`/api/inventory/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: result === 'passed' ? 'ready_for_listing' : 
                  result === 'conditional' ? 'needs_review' : 'rejected',
          inspectionId: savedData.id,
          lastInspectionDate: new Date().toISOString()
        })
      });
      */
      
      // モック処理：成功レスポンスをシミュレート
      await new Promise(resolve => setTimeout(resolve, 2000));

      showToast({
        type: 'success',
        title: '検品完了',
        message: `検品結果を保存しました。商品ステータスが「${
          result === 'passed' ? '出品準備完了' : 
          result === 'conditional' ? '要確認' : '不合格'
        }」に更新されました。(倉庫保管中)`,
        duration: 4000
      });
      
      // 本番運用では適切な画面遷移を行う
      setTimeout(() => {
        window.location.href = '/staff/inspection';
      }, 2000);
      
    } catch (error) {
      console.error('[ERROR] Inspection submission:', error);
      showToast({
        type: 'error',
        title: '検品保存エラー',
        message: error instanceof Error ? error.message : '検品結果の保存中にエラーが発生しました',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // バリデーション関数
  const validateInspectionData = (data: InspectionData) => {
    const errors: string[] = [];

    // 写真の確認（最低1枚必要）
    if (data.photos.length === 0) {
      errors.push('検品写真を少なくとも1枚撮影してください');
    }

    // チェック項目は0個でも可（任意）

    return {
      isValid: errors.length === 0,
      errors
    };
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
            <div className="mb-1">{step.icon}</div>
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
          <div className="space-y-6">
            <NexusCard className="p-4">
              <div className="mb-3">
                <h3 className="text-base font-semibold mb-1">検品作業のタイムスタンプ記録</h3>
                <p className="text-sm text-gray-600">
                  作業の開始時刻を記録し、外部録画動画と紐付けます。タイムスタンプは任意で記録してください。
                </p>
              </div>
            </NexusCard>
            
            <TimestampVideoRecorder
              productId={productId}
              phase="phase2"
              type="inspection"
              onRecordingComplete={(timestamps) => {
                // タイムスタンプが記録されるたびに呼ばれる
                setVideoId(timestamps.length > 0 ? timestamps[0].id : null);
              }}
            />
            
            <div className="flex justify-between">
              <NexusButton
                onClick={() => setCurrentStep(1)}
                variant="secondary"
                size="lg"
              >
                戻る
              </NexusButton>
              <NexusButton
                onClick={() => setCurrentStep(3)}
                variant="primary"
                size="lg"
              >
                次へ（写真撮影）
              </NexusButton>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <PhotoUploader
            productId={productId}
            photos={inspectionData.photos}
            onUpdate={updatePhotos}
            onNext={() => setCurrentStep(4)}
            onPrev={() => setCurrentStep(2)}
            category={product.category}
          />
        )}

        {currentStep === 4 && (
          <InspectionResult
            product={product}
            inspectionData={inspectionData}
            onNotesChange={(notes) => setInspectionData(prev => ({ ...prev, notes }))}
            onSubmit={submitInspection}
            onPrev={() => setCurrentStep(3)}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
} 