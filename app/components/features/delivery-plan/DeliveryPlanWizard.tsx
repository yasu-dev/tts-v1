'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const editDraftId = searchParams.get('edit');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
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

  // 下書きデータの読み込み
  useEffect(() => {
    const loadDraftData = async () => {
      if (!editDraftId) return;

      try {
        setLoadingDraft(true);
        console.log('[DEBUG] 下書きデータを読み込み中:', editDraftId);

        const response = await fetch(`/api/delivery-plan/draft/${editDraftId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || '下書きの取得に失敗しました');
        }

        if (result.success && result.draft && result.draft.draftData) {
          const restoredData = result.draft.draftData;
          console.log('[DEBUG] 下書きデータを復元:', restoredData);

          // planDataを復元
          // productsが確実に配列であることを保証
          const safeProducts = Array.isArray(restoredData.products) ? restoredData.products : [];
          
          setPlanData({
            basicInfo: restoredData.basicInfo || {
              warehouseId: '',
              warehouseName: '',
              deliveryAddress: '',
            },
            products: safeProducts,
            confirmation: restoredData.confirmation || {
              agreedToTerms: false,
              generateBarcodes: true,
            },
          });

          // 保存時のステップを復元（products配列があれば2番目のステップから開始）
          const hasProducts = restoredData.products && restoredData.products.length > 0;
          if (hasProducts) {
            setCurrentStep(1); // 商品登録ステップ
          }

          setIsEditMode(true);

          showToast({
            type: 'info',
            title: '下書きを復元しました',
            message: '保存時の状態から編集を続行できます',
            duration: 4000
          });
        }

      } catch (error) {
        console.error('Draft load error:', error);
        showToast({
          type: 'error',
          title: '下書き復元エラー',
          message: error instanceof Error ? error.message : '下書きの復元に失敗しました',
          duration: 5000
        });
      } finally {
        setLoadingDraft(false);
      }
    };

    loadDraftData().catch(error => {
      console.error('[ERROR] loadDraftData Promise rejection:', error);
    });
  }, [editDraftId, showToast]);

  const updatePlanData = (stepData: Partial<DeliveryPlanData>) => {
    setPlanData(prev => {
      const updated = { ...prev, ...stepData };
      // productsが常に配列であることを保証
      if ('products' in stepData && !Array.isArray(updated.products)) {
        updated.products = [];
      }
      return updated;
    });
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
        console.log('[DEBUG] PDF URL:', result.pdfUrl);
        try {
          // PDFを取得してBase64で表示
          const pdfResponse = await fetch(result.pdfUrl);
          if (pdfResponse.ok) {
            const pdfData = await pdfResponse.json();
            if (pdfData.success && pdfData.base64Data) {
              // Base64データをブラウザで表示
              const pdfBlob = new Blob([
                Uint8Array.from(atob(pdfData.base64Data), c => c.charCodeAt(0))
              ], { type: 'application/pdf' });
              
              const pdfUrl = URL.createObjectURL(pdfBlob);
              window.open(pdfUrl, '_blank');
              
              // メモリリークを防ぐため、少し後にURLを開放
              setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
            } else {
              console.error('[ERROR] PDF generation failed:', pdfData);
              showAlert({
                type: 'error',
                title: 'PDFダウンロードエラー',
                message: 'PDFの生成に失敗しました。',
                actions: [{ label: '確認', action: () => {}, variant: 'primary' }]
              });
            }
          } else {
            console.error('[ERROR] PDF fetch failed:', pdfResponse.status);
            showAlert({
              type: 'error',
              title: 'PDFダウンロードエラー',
              message: 'PDFの取得に失敗しました。',
              actions: [{ label: '確認', action: () => {}, variant: 'primary' }]
            });
          }
        } catch (pdfError) {
          console.error('[ERROR] PDF display error:', pdfError);
          showAlert({
            type: 'error',
            title: 'PDFダウンロードエラー',
            message: 'PDFの表示でエラーが発生しました。',
            actions: [{ label: '確認', action: () => {}, variant: 'primary' }]
          });
        }
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

  // データをJSONセーフにサニタイズする関数
  const sanitizeDataForJSON = (data: any): any => {
    if (data === null || data === undefined) {
      return data;
    }
    
    if (typeof data === 'function') {
      return undefined; // 関数は除外
    }
    
    if (data instanceof HTMLElement || data instanceof Node) {
      return undefined; // DOM要素は除外
    }
    
    if (data instanceof File || data instanceof FileList) {
      return undefined; // ファイルオブジェクトは除外
    }
    
    if (typeof data === 'object') {
      // React関連の内部プロパティを除外
      const cleaned: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          // React Fiberや内部プロパティをスキップ
          if (key.startsWith('__react') || key.startsWith('_react') || key === 'stateNode') {
            continue;
          }
          
          const value = data[key];
          const sanitizedValue = sanitizeDataForJSON(value);
          
          if (sanitizedValue !== undefined) {
            cleaned[key] = sanitizedValue;
          }
        }
      }
      return cleaned;
    }
    
    return data;
  };

  // 下書き保存機能（新規作成または更新）
  const saveDraft = async () => {
    try {
      setSavingDraft(true);

      // planDataをサニタイズして循環参照を除去
      // products配列の安全な処理
      const safeProducts = Array.isArray(planData.products) ? planData.products : [];
      
      const sanitizedPlanData = sanitizeDataForJSON({
        basicInfo: planData.basicInfo || {
          warehouseId: '',
          warehouseName: '',
          deliveryAddress: '',
        },
        products: safeProducts.map(product => {
          // 各商品の安全な処理
          const safeProduct = product || {};
          const safeImages = Array.isArray(safeProduct.images) ? safeProduct.images : [];
          
          return {
            name: safeProduct.name || '',
            condition: safeProduct.condition || '',
            purchasePrice: typeof safeProduct.purchasePrice === 'number' ? safeProduct.purchasePrice : 0,
            purchaseDate: safeProduct.purchaseDate || '',
            supplier: safeProduct.supplier || '',
            supplierDetails: safeProduct.supplierDetails || '',
            category: safeProduct.category || '',
            // 画像データは URL文字列のみ保存（Fileオブジェクトは除外）
            images: safeImages
              .filter((img: any) => img && typeof img.url === 'string')
              .map((img: any) => ({
                id: img.id || '',
                url: img.url || '',
                filename: img.filename || '',
                category: img.category || '',
                description: img.description || ''
              })),
            inspectionChecklist: safeProduct.inspectionChecklist || {}
          };
        }),
        confirmation: planData.confirmation || {
          agreedToTerms: false,
          generateBarcodes: true,
        },
        status: '下書き'
      });

      console.log('[DEBUG] サニタイズ済み下書きデータ:', sanitizedPlanData);

      // 編集モードの場合は既存下書きを更新、新規の場合は新規作成
      const apiUrl = isEditMode 
        ? '/api/delivery-plan/draft' 
        : '/api/delivery-plan/draft';
      const method = isEditMode ? 'PUT' : 'POST';
      const bodyData = isEditMode 
        ? { draftId: editDraftId, planData: sanitizedPlanData }
        : sanitizedPlanData;

      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '下書き保存に失敗しました');
      }

      showToast({
        type: 'success',
        title: isEditMode ? '下書き更新完了' : '下書き保存完了',
        message: isEditMode 
          ? '下書きプランが更新されました' 
          : '納品プランが下書きとして保存されました',
        duration: 3000
      });

      // 保存成功後、納品プラン管理画面にリダイレクト
      setTimeout(() => {
        window.location.href = '/delivery';
      }, 1000);

    } catch (error) {
      console.error('[ERROR] 下書き保存エラー:', error);
      
      let errorMessage = '下書きの保存に失敗しました';
      
      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          errorMessage = 'データの保存形式に問題があります。ページを再読み込みして再度お試しください。';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'サーバーとの通信に失敗しました。ネットワーク接続を確認してください。';
        } else {
          errorMessage = error.message;
        }
      }
      
      showToast({
        type: 'error',
        title: '下書き保存エラー',
        message: errorMessage,
        duration: 5000
      });
    } finally {
      setSavingDraft(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto">
      {/* 下書き読み込み中の表示 */}
      {loadingDraft && (
        <NexusCard className="p-6 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-blue mr-3"></div>
            <span className="text-primary-blue font-medium">下書きデータを読み込み中...</span>
          </div>
        </NexusCard>
      )}

      {/* 編集モード表示 */}
      {isEditMode && !loadingDraft && (
        <NexusCard className="p-4 mb-6 bg-green-50 border-green-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <span className="text-green-800 font-medium">下書き編集モード</span>
            <span className="text-green-600 ml-2 text-sm">保存した下書きを編集しています</span>
          </div>
        </NexusCard>
      )}

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

      {/* 下書き保存ボタン */}
      <div className="flex justify-center mb-6">
        <NexusButton
          variant="secondary"
          onClick={saveDraft}
          loading={savingDraft}
          disabled={loading || loadingDraft}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {savingDraft 
            ? (isEditMode ? '更新中...' : '保存中...')
            : (isEditMode ? '下書きを更新' : '下書きとして保存')
          }
        </NexusButton>
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