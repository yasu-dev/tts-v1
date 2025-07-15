'use client';

import { useState } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusCard from '@/app/components/ui/NexusCard';
import BasicInfoStep from './BasicInfoStep';
import ProductRegistrationStep from './ProductRegistrationStep';
import ConfirmationStep from './ConfirmationStep';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { useAlert } from '@/app/components/ui/AlertProvider';

interface WizardStep {
  id: number;
  title: string;
  component: React.ComponentType<any>;
}

interface DeliveryPlanData {
  basicInfo: {
    warehouseId: string;
    warehouseName: string;
    deliveryAddress: string;
    notes?: string;
  };
  products: Array<{
    name: string;
    category: 'camera_body' | 'lens' | 'watch' | 'accessory';
    brand: string;
    model: string;
    serialNumber?: string;
    estimatedValue: number;
    description?: string;
  }>;
  confirmation: {
    agreedToTerms: boolean;
    generateBarcodes: boolean;
  };
}

const steps: WizardStep[] = [
  { id: 1, title: '基本情報', component: BasicInfoStep },
  { id: 2, title: '商品登録', component: ProductRegistrationStep },
  { id: 3, title: '確認・出力', component: ConfirmationStep },
];

export default function DeliveryPlanWizard() {
  const { showToast } = useToast();
  const { showAlert } = useAlert();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planData, setPlanData] = useState<DeliveryPlanData>({
    basicInfo: {
      warehouseId: '',
      warehouseName: '',
      deliveryAddress: '',
    },
    products: [],
    confirmation: {
      agreedToTerms: false,
      generateBarcodes: true,
    },
  });

  const updatePlanData = (stepData: Partial<DeliveryPlanData>) => {
    setPlanData(prev => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const submitPlan = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[DEBUG] 送信データ:', planData);

      const response = await fetch('/api/delivery-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });

      const result = await response.json();
      console.log('[DEBUG] API応答:', result);
      
      if (!response.ok) {
        // 具体的なエラーメッセージを表示
        let errorMessage = '納品プランの作成に失敗しました。';
        
        if (result.error) {
          errorMessage = result.error;
        } else if (response.status === 400) {
          errorMessage = '入力データに問題があります。以下をご確認ください：\n' +
                       '• 配送先倉庫が選択されているか\n' +
                       '• 商品が登録されているか\n' +
                       '• 必要な情報が入力されているか';
        } else if (response.status === 401) {
          errorMessage = 'ログインが必要です。再度ログインしてください。';
        } else if (response.status === 500) {
          errorMessage = 'サーバーエラーが発生しました。しばらくしてから再度お試しください。';
        }
        
        showAlert({
          type: 'error',
          title: '納品プラン作成エラー',
          message: errorMessage,
          actions: [
            {
              label: '確認',
              action: () => {},
              variant: 'primary'
            }
          ]
        });
        return;
      }

      // 成功の場合
      // PDFダウンロード処理
      if (result.pdfUrl) {
        window.open(result.pdfUrl, '_blank');
      }
      
      // 成功メッセージ表示後、リダイレクト
      showAlert({
        type: 'success',
        title: '納品プラン作成完了',
        message: `納品プラン「${result.planId}」が正常に作成されました。`,
        actions: [
          {
            label: '在庫管理画面へ',
            action: () => {
              window.location.href = '/inventory';
            },
            variant: 'primary'
          }
        ]
      });
      
    } catch (err) {
      // ネットワークエラーなどの場合はアラートボックスで対処を促す
      showAlert({
        type: 'error',
        title: '接続エラー',
        message: 'サーバーとの通信に失敗しました。しばらく時間をおいて再度お試しください。',
        actions: [
          {
            label: '再試行',
            action: () => submitPlan(),
            variant: 'primary'
          },
          {
            label: '閉じる',
            action: () => {},
            variant: 'secondary'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto">
      {/* ステップインジケーター */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
          >
            <div className="flex items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= index + 1
                    ? 'bg-primary-blue text-white'
                    : 'bg-nexus-bg-tertiary text-nexus-text-secondary border border-nexus-border'
                  }
                `}
              >
                {currentStep > index + 1 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span 
                className={`ml-2 font-medium hidden sm:inline ${
                  currentStep >= index + 1 ? 'text-primary-blue' : 'text-nexus-text-secondary'
                }`}
                data-testid={`step-${step.id}-label`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={`h-1 rounded-full ${
                    currentStep > index + 1 ? 'bg-primary-blue' : 'bg-nexus-border'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* エラー表示 */}
      {error && (
        <NexusCard className="p-4 mb-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </NexusCard>
      )}

      {/* ステップコンテンツ */}
      <NexusCard className="p-6">
        <CurrentStepComponent
          data={planData}
          onUpdate={updatePlanData}
          onNext={nextStep}
          onPrev={prevStep}
          onSubmit={submitPlan}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === steps.length - 1}
          loading={loading}
        />
      </NexusCard>
    </div>
  );
} 