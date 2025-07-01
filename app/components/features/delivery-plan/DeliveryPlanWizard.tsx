'use client';

import { useState } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusCard from '@/app/components/ui/NexusCard';
import BasicInfoStep from './BasicInfoStep';
import ProductRegistrationStep from './ProductRegistrationStep';
import ConfirmationStep from './ConfirmationStep';

interface WizardStep {
  id: number;
  title: string;
  component: React.ComponentType<any>;
}

interface DeliveryPlanData {
  basicInfo: {
    sellerName: string;
    deliveryAddress: string;
    contactEmail: string;
    phoneNumber: string;
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
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planData, setPlanData] = useState<DeliveryPlanData>({
    basicInfo: {
      sellerName: '',
      deliveryAddress: '',
      contactEmail: '',
      phoneNumber: '',
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

      const response = await fetch('/api/delivery-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        throw new Error('納品プランの作成に失敗しました');
      }

      const result = await response.json();
      
      // PDFダウンロード処理
      if (result.pdfUrl) {
        window.open(result.pdfUrl, '_blank');
      }
      
      // 成功メッセージ表示後、リダイレクト
      alert('納品プランが作成されました');
      window.location.href = '/inventory';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
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
            className={`flex items-center ${
              index <= currentStep ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'}
            `}>
              {step.id}
            </div>
            <span className="ml-2 font-medium hidden sm:inline">{step.title}</span>
            {index < steps.length - 1 && (
              <div className={`
                w-8 sm:w-16 h-0.5 ml-2 sm:ml-4
                ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
              `} />
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