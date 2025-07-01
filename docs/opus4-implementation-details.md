# Opus4実装詳細 - コードサンプル集

## 納品プラン作成機能 - 完全実装例

### 1. ディレクトリ構造
```
app/
├── delivery-plan/
│   └── page.tsx
└── components/
    └── features/
        └── delivery-plan/
            ├── DeliveryPlanWizard.tsx
            ├── BasicInfoStep.tsx
            ├── ProductRegistrationStep.tsx
            ├── ConfirmationStep.tsx
            └── BarcodeGenerator.tsx
lib/
├── barcode-generator.ts
└── pdf-generator.ts
```

### 2. DeliveryPlanWizard.tsx
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/NexusButton';
import { Card } from '@/app/components/ui/NexusCard';
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
        <Card className="p-4 mb-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* ステップコンテンツ */}
      <Card className="p-6">
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
      </Card>
    </div>
  );
}
```

### 3. BasicInfoStep.tsx
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/NexusButton';

interface BasicInfoStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  isFirstStep: boolean;
}

export default function BasicInfoStep({ 
  data, 
  onUpdate, 
  onNext,
}: BasicInfoStepProps) {
  const [formData, setFormData] = useState(data.basicInfo || {
    sellerName: '',
    deliveryAddress: '',
    contactEmail: '',
    phoneNumber: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.sellerName.trim()) {
      newErrors.sellerName = '納品者名は必須です';
    }

    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = '配送先住所は必須です';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'メールアドレスは必須です';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'メールアドレスの形式が正しくありません';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = '電話番号は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate({ basicInfo: formData });
      onNext();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">基本情報入力</h2>
        <p className="text-gray-600 mb-6">
          納品に必要な基本情報を入力してください。
        </p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            納品者名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.sellerName}
            onChange={(e) => handleInputChange('sellerName', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md 
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.sellerName ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="例: 田中太郎"
          />
          {errors.sellerName && (
            <p className="text-red-500 text-sm mt-1">{errors.sellerName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            配送先住所 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.deliveryAddress}
            onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
            rows={3}
            className={`
              w-full px-3 py-2 border rounded-md 
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.deliveryAddress ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="例: 〒100-0001 東京都千代田区千代田1-1-1"
          />
          {errors.deliveryAddress && (
            <p className="text-red-500 text-sm mt-1">{errors.deliveryAddress}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-md 
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder="例: example@email.com"
            />
            {errors.contactEmail && (
              <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              電話番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-md 
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder="例: 090-1234-5678"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            備考
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="
              w-full px-3 py-2 border border-gray-300 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            placeholder="特記事項があれば入力してください"
          />
        </div>
      </form>

      <div className="flex justify-end pt-6">
        <Button onClick={handleNext} className="px-6">
          次へ
        </Button>
      </div>
    </div>
  );
}
```

### 4. APIエンドポイント
```typescript
// app/api/delivery-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { generateBarcodeLabels } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { basicInfo, products, confirmation } = body;

    // バリデーション
    if (!basicInfo || !products || products.length === 0) {
      return NextResponse.json(
        { error: '必須情報が不足しています' },
        { status: 400 }
      );
    }

    // SKU生成とDB保存（実際の実装では Prisma を使用）
    const generatedProducts = products.map((product, index) => ({
      ...product,
      sku: `TWD-${Date.now()}-${index.toString().padStart(3, '0')}`,
      barcode: `${Date.now()}${index.toString().padStart(3, '0')}`,
    }));

    // PDF生成
    let pdfUrl = null;
    if (confirmation.generateBarcodes) {
      const labels = generatedProducts.map(p => ({
        sku: p.sku,
        name: p.name,
        barcode: p.barcode,
      }));
      
      // 実際の実装では、生成したPDFをS3等にアップロード
      pdfUrl = `/api/delivery-plan/pdf/${Date.now()}`;
    }

    return NextResponse.json({
      success: true,
      planId: `PLAN-${Date.now()}`,
      products: generatedProducts,
      pdfUrl,
    });
  } catch (error) {
    console.error('[ERROR] Delivery Plan:', error);
    return NextResponse.json(
      { error: '納品プランの作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
```

## 実装時の重要ポイント

### 1. 既存パターンの踏襲
- DashboardLayoutを必ず使用
- NexusButton、NexusCardなど既存UIコンポーネントを活用
- 日本語エラーメッセージ

### 2. レスポンシブ対応
- モバイル: `sm:` プレフィックスで対応
- タブレット: `md:` プレフィックス
- デスクトップ: `lg:` プレフィックス

### 3. エラーハンドリング
- try-catchを必ず使用
- ユーザーフレンドリーなエラーメッセージ
- console.errorでデバッグ情報を記録

### 4. 状態管理
- useState、useEffectの適切な使用
- ローディング状態の表示
- エラー状態の表示 