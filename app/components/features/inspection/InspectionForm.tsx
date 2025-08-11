'use client';

import { useState, useEffect, useRef } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import InspectionChecklist from './InspectionChecklist';
import InspectionChecklistInput, { InspectionChecklistData } from './InspectionChecklistInput';
import PhotoUploader from './PhotoUploader';
import InspectionResult from './InspectionResult';
import PackagingAndLabelStep from './PackagingAndLabelStep';
import ShelfStorageStep from './ShelfStorageStep';
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
  metadata?: string;
  // 納品プラン関連情報（metadataから取得）
  deliveryPlanInfo?: {
    condition: string;
    purchasePrice: number;
    purchaseDate: string;
    supplier: string;
    supplierDetails: string;
    images: Array<{url: string, filename: string, category: string}>;
  };
}

interface ExistingInspectionChecklist {
  id: string;
  productId?: string;
  deliveryPlanProductId?: string;
  hasScratches: boolean;
  hasDents: boolean;
  hasDiscoloration: boolean;
  hasDust: boolean;
  powerOn: boolean;
  allButtonsWork: boolean;
  screenDisplay: boolean;
  connectivity: boolean;
  lensClarity: boolean;
  aperture: boolean;
  focusAccuracy: boolean;
  stabilization: boolean;
  notes?: string;
  createdBy: string;
  createdAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  updatedBy?: string;
  updatedAt: string;
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
  skipPhotography?: boolean; // 撮影をスキップするかどうか
}

export default function InspectionForm({ productId }: InspectionFormProps) {
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [existingChecklist, setExistingChecklist] = useState<ExistingInspectionChecklist | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const stepIndicatorRef = useRef<HTMLDivElement>(null);
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
      title: '写真撮影', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      id: 3, 
      title: '梱包・ラベル', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21h6" />
        </svg>
      )
    },
    { 
      id: 4, 
      title: '棚保管', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 0H4a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zM9 12h6m-6 4h6" />
        </svg>
      )
    },
  ];

  // 保存された進捗を読み込む関数
  const loadProgress = async () => {
    try {
      const response = await fetch(`/api/products/inspection/progress/${productId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const progressData = await response.json();
        
        // 保存された進捗が存在する場合は復元
        if (progressData.currentStep) {
          console.log(`[INFO] Restoring progress for product ${productId}:`, progressData);
          
          setCurrentStep(progressData.currentStep);
          setInspectionData(prev => ({
            ...prev,
            checklist: progressData.checklist || prev.checklist,
            photos: progressData.photos || prev.photos,
            notes: progressData.notes || prev.notes,
          }));
          setVideoId(progressData.videoId || null);
          
          // Toast表示は別のuseEffectで行う
          return progressData;
        }
      }
      // エラーの場合は新規開始（ログは出力するが処理は継続）
      return null;
    } catch (error) {
      console.error('[INFO] No previous progress found, starting fresh:', error);
      return null;
    }
  };

  useEffect(() => {
    // 商品情報を取得と進捗復元を並行実行
    const init = async () => {
      try {
        // 商品情報とセラーが入力した検品チェックリストを取得
        const [productResponse, checklistResponse] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch(`/api/products/${productId}/inspection-checklist`)
        ]);

        if (productResponse.ok) {
          const productData = await productResponse.json();
          
          // メタデータから納品プラン情報を抽出
          let enrichedProduct = { ...productData };
          if (productData.metadata) {
            try {
              let metadata;
              
              // metadataが既にオブジェクトの場合と文字列の場合に対応
              if (typeof productData.metadata === 'string') {
                metadata = JSON.parse(productData.metadata);
              } else if (typeof productData.metadata === 'object' && productData.metadata !== null) {
                metadata = productData.metadata;
              } else {
                throw new Error('metadata is not a valid string or object');
              }
              
              console.log('[INFO] Product metadata:', metadata);
              
              // 納品プラン関連情報を抽出して構造化（型安全処理）
              enrichedProduct.deliveryPlanInfo = {
                condition: typeof metadata.condition === 'string' ? metadata.condition : '',
                purchasePrice: typeof metadata.purchasePrice === 'number' ? metadata.purchasePrice : 0,
                purchaseDate: typeof metadata.purchaseDate === 'string' ? metadata.purchaseDate : '',
                supplier: typeof metadata.supplier === 'string' ? metadata.supplier : '',
                supplierDetails: typeof metadata.supplierDetails === 'string' ? metadata.supplierDetails : '',
                images: Array.isArray(metadata.images) ? metadata.images : []
              };
              
              console.log('[INFO] 納品プラン情報を抽出:', enrichedProduct.deliveryPlanInfo);
            } catch (error) {
              console.warn('[WARN] metadata解析エラー:', error);
              enrichedProduct.deliveryPlanInfo = {
                condition: '',
                purchasePrice: 0,
                purchaseDate: '',
                supplier: '',
                supplierDetails: '',
                images: []
              };
            }
          } else {
            enrichedProduct.deliveryPlanInfo = {
              condition: '',
              purchasePrice: 0,
              purchaseDate: '',
              supplier: '',
              supplierDetails: '',
              images: []
            };
          }
          
          setProduct(enrichedProduct);
        } else {
          // デモ用フォールバック
          setProduct({
            id: productId,
            name: 'Canon EOS R5 ボディ',
            sku: `TWD-2024-${productId}`,
            category: 'camera_body',
            brand: 'Canon',
            model: 'EOS R5',
            status: 'pending_inspection',
            imageUrl: '/api/placeholder/400/300',
            deliveryPlanInfo: {
              condition: 'excellent',
              purchasePrice: 350000,
              purchaseDate: '2024-01-15',
              supplier: 'デモ仕入先',
              supplierDetails: 'デモ用の商品データです。実際の納品プランから取得される情報が表示されます。',
              images: []
            }
          });
          console.log('[DEBUG] デモ用商品データを設定 - カテゴリー: camera_body');
        }

        // セラーが入力した検品チェックリストがある場合は読み込み
        if (checklistResponse.ok) {
          const checklistData = await checklistResponse.json();
          if (checklistData) {
            setExistingChecklist(checklistData);
            
            // 既存のチェックリストデータを検品データに反映
            setInspectionData(prev => ({
              ...prev,
              checklist: {
                exterior: {
                  scratches: checklistData.hasScratches,
                  dents: checklistData.hasDents,
                  discoloration: checklistData.hasDiscoloration,
                  dust: checklistData.hasDust,
                },
                functionality: {
                  powerOn: checklistData.powerOn,
                  allButtonsWork: checklistData.allButtonsWork,
                  screenDisplay: checklistData.screenDisplay,
                  connectivity: checklistData.connectivity,
                },
                optical: {
                  lensClarity: checklistData.lensClarity,
                  aperture: checklistData.aperture,
                  focusAccuracy: checklistData.focusAccuracy,
                  stabilization: checklistData.stabilization,
                },
              },
              notes: checklistData.notes || prev.notes,
            }));

            showToast({
              type: 'info',
              title: 'セラー入力データを読み込みました',
              message: `セラー ${checklistData.createdBy} が入力した検品チェックリストを表示しています`,
              duration: 4000
            });
          }
        }

        // 保存された進捗を読み込み
        const restoredProgress = await loadProgress();
        
        // 進捗復元のトースト表示
        if (restoredProgress && !existingChecklist) {
          setTimeout(() => {
            showToast({
              type: 'info',
              title: '前回の作業を復元しました',
              message: `ステップ${restoredProgress.currentStep}「${getStepName(restoredProgress.currentStep)}」から再開します`,
              duration: 4000
            });
          }, 500); // 少し遅延させてUIの初期化を待つ
        }
        
      } catch (error) {
        console.error('[ERROR] Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [productId]);

  // クエリパラメータ step により初期表示ステップを上書き（例: ?step=4 で棚保管を開く）
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const stepParam = url.searchParams.get('step');
      if (stepParam) {
        const stepNum = parseInt(stepParam, 10);
        if ([1,2,3,4].includes(stepNum)) {
          setCurrentStep(stepNum);
          // step指定で来た場合はUI初期化が落ち着くまで待ってからタブ部分にスクロール
          setTimeout(() => {
            scrollToTabs();
          }, 500);
        }
      }
    } catch (e) {
      // no-op
    }
  }, []);

  // ステップ名を取得するヘルパー関数
  const getStepName = (step: number): string => {
    switch (step) {
      case 1: return '検品項目';
      case 2: return '写真撮影';
      case 3: return '梱包・ラベル';
      case 4: return '棚保管';
      default: return '不明';
    }
  };

  // タブ部分にスクロールする関数
  const scrollToTabs = () => {
    if (stepIndicatorRef.current) {
      stepIndicatorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // ステップ変更時の処理
  const handleStepChange = (stepId: number) => {
    setCurrentStep(stepId);
    // 少し遅延してからスクロール（状態更新後にスクロール）
    setTimeout(() => {
      scrollToTabs();
    }, 100);
  };

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

  // 部分保存機能（各ステップで作業を中断して保存）
  const saveProgress = async (step: number) => {
    try {
      setLoading(true);
      
      const progressData = {
        productId,
        currentStep: step,
        checklist: inspectionData.checklist,
        photos: inspectionData.photos,
        notes: inspectionData.notes,
        videoId: videoId,
        lastUpdated: new Date().toISOString(),
        status: 'inspecting', // 進行中ステータス
      };

      // 進捗保存API（新規作成）
      const response = await fetch(`/api/products/inspection/progress`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ERROR] API Response Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.details || errorData.error || `進捗保存に失敗しました: ${response.status} ${response.statusText}`);
      }

      showToast({
        type: 'success',
        title: '進捗を保存しました',
        message: `ステップ${step}までの作業内容を保存しました。後で続きから再開できます。`,
        duration: 3000
      });
      
      // 適切な一覧画面に戻る（状態復元フラグ付き）
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('from') === 'inventory') {
          // 在庫画面から来た場合は状態復元フラグ付きで在庫画面に戻る
          window.location.href = '/staff/inventory?restored=1';
        } else {
          // その他の場合は検品一覧に戻る
          window.location.href = '/staff/inspection?restored=1';
        }
      }, 1500);
      
    } catch (error) {
      console.error('[ERROR] Progress save - Full error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      showToast({
        type: 'error',
        title: '進捗保存エラー',
        message: error instanceof Error ? error.message : '進捗保存中にエラーが発生しました。コンソールで詳細を確認してください。',
        duration: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  const submitInspection = async (inspectionOnly = false, locationId?: string) => {
    try {
      setLoading(true);
      
      // 検品のみの場合はskipPhotographyフラグをセット
      const dataToValidate = inspectionOnly 
        ? { ...inspectionData, skipPhotography: true }
        : inspectionData;
      
      // バリデーション
      const validationResult = validateInspectionData(dataToValidate);
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
      let result: 'passed' | 'failed' | 'conditional' = 'passed';
      
      if (inspectionData.checklist && Object.keys(inspectionData.checklist).length > 0) {
        const allChecks = Object.values(inspectionData.checklist).flatMap(category =>
          Object.values(category || {})
        );
        const passedChecks = allChecks.filter(check => check).length;
        const totalChecks = allChecks.length;
        
        if (totalChecks > 0) {
          if (passedChecks < totalChecks * 0.6) {
            result = 'failed';
          } else if (passedChecks < totalChecks * 0.9) {
            result = 'conditional';
          }
        }
      } else {
        // チェックリストがない場合はデフォルトで合格とする
        console.log('[INFO] No checklist data available, defaulting to passed');
      }

      const finalData = {
        productId,
        inspectionNotes: inspectionData.notes || '',
        condition: result === 'passed' ? 'excellent' : result === 'conditional' ? 'good' : 'poor',
        status: 'inspection',
        locationId: locationId, // 保管場所IDを追加
        skipPhotography: inspectionOnly,
        photographyDate: inspectionOnly ? null : new Date().toISOString(),
      };

      console.log('[DEBUG] Sending inspection data:', finalData);
      console.log('[DEBUG] Inspection data state:', inspectionData);

      // 本番用APIコール
      const response = await fetch(`/api/products/inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `検品結果の保存に失敗しました: ${response.status}`);
      }

      const savedData = await response.json();

      // 検品完了時は進捗データをクリア
      try {
        await fetch(`/api/products/inspection/progress/${productId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('[WARN] Failed to clear progress data:', error);
        // エラーでも処理は継続
      }

      // モックデータ用：ステータス更新イベントを発火
      const newStatus = inspectionOnly 
        ? (result === 'passed' ? 'completed' : result === 'conditional' ? 'inspecting' : 'failed')
        : (result === 'passed' ? 'completed' : result === 'conditional' ? 'inspecting' : 'failed');
      
      const inspectionCompleteEvent = new CustomEvent('inspectionComplete', {
        detail: { productId, newStatus }
      });
      window.dispatchEvent(inspectionCompleteEvent);

      showToast({
        type: 'success',
        title: inspectionOnly ? '検品完了' : '検品・撮影完了',
        message: inspectionOnly 
          ? `検品結果を保存しました。商品ステータスが「${
              result === 'passed' ? '撮影待ち' : 
              result === 'conditional' ? '要確認' : '不合格'
            }」に更新されました。後で撮影を行ってください。`
          : `検品・撮影が完了しました。商品ステータスが「${
              result === 'passed' ? '出品準備完了' : 
              result === 'conditional' ? '要確認' : '不合格'
            }」に更新されました。`,
        duration: 2000
      });
      
      // 成功時は適切な画面に戻る（即座に遷移）
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('from') === 'inventory') {
          // 在庫画面から来た場合は状態復元フラグ付きで在庫画面に戻る
          window.location.href = '/staff/inventory?restored=1';
        } else {
          // その他の場合は検品一覧に戻る（状態復元フラグ付き）
          window.location.href = '/staff/inspection?restored=1';
        }
      }, 500); // 2秒から0.5秒に短縮
      
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

    // 写真の確認（撮影をスキップしない場合のみ必要）
    if (!data.skipPhotography && data.photos.length === 0) {
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
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3">
            {/* 納品プラン画像を優先表示 */}
            {product.deliveryPlanInfo?.images && Array.isArray(product.deliveryPlanInfo.images) && product.deliveryPlanInfo.images.length > 0 ? (
              <div className="space-y-2">
                <img
                  src={product.deliveryPlanInfo.images[0]?.url || '/api/placeholder/400/300'}
                  alt={product.name}
                  className="w-full rounded-lg border shadow-sm"
                />
                {product.deliveryPlanInfo.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2">
                    {product.deliveryPlanInfo.images.slice(1, 4).map((image, idx) => (
                      <img
                        key={idx}
                        src={image?.url || '/api/placeholder/100/100'}
                        alt={`${product.name} ${idx + 2}`}
                        className="w-full h-16 object-cover rounded border"
                      />
                    ))}
                  </div>
                )}
                {product.deliveryPlanInfo.images.length > 4 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{product.deliveryPlanInfo.images.length - 4}枚の画像
                  </p>
                )}
                <p className="text-xs text-blue-600 text-center">📦 納品プラン登録画像</p>
              </div>
            ) : (
              <div className="text-center">
                <img
                  src={product.imageUrl || '/api/placeholder/400/300'}
                  alt={product.name}
                  className="w-full rounded-lg border"
                />
                <p className="text-xs text-gray-500 mt-2">プレースホルダー画像</p>
              </div>
            )}
          </div>
          <div className="lg:w-2/3 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
            
            {/* 基本商品情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
 
            {/* 納品プラン詳細情報 */}
            {product.deliveryPlanInfo && (
              <div className="border-t pt-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  📦 納品プラン情報
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">セラー入力</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {product.deliveryPlanInfo.condition && (
                    <div>
                      <span className="text-gray-600">申告コンディション:</span>
                      <span className="ml-2 font-medium">{product.deliveryPlanInfo.condition}</span>
                    </div>
                  )}
                  {product.deliveryPlanInfo.purchasePrice > 0 && (
                    <div>
                      <span className="text-gray-600">購入価格:</span>
                      <span className="ml-2 font-medium">¥{Number(product.deliveryPlanInfo.purchasePrice || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {product.deliveryPlanInfo.purchaseDate && (
                    <div>
                      <span className="text-gray-600">仕入日:</span>
                      <span className="ml-2 font-medium">
                        {(() => {
                          try {
                            const date = new Date(product.deliveryPlanInfo.purchaseDate);
                            return !isNaN(date.getTime()) ? date.toLocaleDateString('ja-JP') : product.deliveryPlanInfo.purchaseDate;
                          } catch {
                            return product.deliveryPlanInfo.purchaseDate;
                          }
                        })()}
                      </span>
                    </div>
                  )}
                  {product.deliveryPlanInfo.supplier && (
                    <div>
                      <span className="text-gray-600">仕入先:</span>
                      <span className="ml-2 font-medium">{product.deliveryPlanInfo.supplier}</span>
                    </div>
                  )}
                </div>
                {product.deliveryPlanInfo.supplierDetails && (
                  <div className="mt-2">
                    <span className="text-gray-600">仕入詳細:</span>
                    <p className="ml-2 text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">
                      {product.deliveryPlanInfo.supplierDetails}
                    </p>
                  </div>
                )}
                {product.deliveryPlanInfo.images && product.deliveryPlanInfo.images.length > 0 && (
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                    ✓ 商品画像 {product.deliveryPlanInfo.images.length}枚登録済み
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </NexusCard>

      {/* ステップインジケーター（タブレット最適化） */}
      <div ref={stepIndicatorRef} className="flex justify-between items-center bg-white rounded-lg p-4 shadow-sm">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => handleStepChange(step.id)}
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
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* セラーが入力した検品チェックリストがある場合は表示 */}
            {existingChecklist && (
              <NexusCard className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-blue-900">セラー入力済みの検品データ</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      セラー {existingChecklist.createdBy} が {new Date(existingChecklist.createdAt).toLocaleDateString('ja-JP')} に入力
                    </p>
                  </div>
                  <NexusButton
                    onClick={() => setIsEditMode(!isEditMode)}
                    variant="secondary"
                    size="sm"
                  >
                    {isEditMode ? '編集を終了' : '編集する'}
                  </NexusButton>
                </div>
                
                <InspectionChecklistInput
                  data={{
                    exterior: {
                      scratches: inspectionData.checklist.exterior.scratches,
                      dents: inspectionData.checklist.exterior.dents,
                      discoloration: inspectionData.checklist.exterior.discoloration,
                      dust: inspectionData.checklist.exterior.dust,
                    },
                    functionality: {
                      powerOn: inspectionData.checklist.functionality.powerOn,
                      allButtonsWork: inspectionData.checklist.functionality.allButtonsWork,
                      screenDisplay: inspectionData.checklist.functionality.screenDisplay,
                      connectivity: inspectionData.checklist.functionality.connectivity,
                    },
                    optical: {
                      lensClarity: inspectionData.checklist.optical?.lensClarity || false,
                      aperture: inspectionData.checklist.optical?.aperture || false,
                      focusAccuracy: inspectionData.checklist.optical?.focusAccuracy || false,
                      stabilization: inspectionData.checklist.optical?.stabilization || false,
                    },
                    notes: inspectionData.notes,
                  }}
                  onChange={(checklistData) => {
                    if (isEditMode) {
                      setInspectionData(prev => ({
                        ...prev,
                        checklist: {
                          exterior: checklistData.exterior,
                          functionality: checklistData.functionality,
                          optical: checklistData.optical || prev.checklist.optical,
                        },
                        notes: checklistData.notes || prev.notes,
                      }));
                    }
                  }}
                  showOptical={true}
                  readOnly={!isEditMode}
                  verifiedBy={existingChecklist.verifiedBy}
                  verifiedAt={existingChecklist.verifiedAt}
                />
              </NexusCard>
            )}

            {/* セラーが入力していない場合は新規検品チェックリスト */}
            {!existingChecklist && (
              <NexusCard className="p-4">
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900">検品チェックリスト</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    各項目を確認してチェックしてください
                  </p>
                </div>
                
                <InspectionChecklistInput
                  data={{
                    exterior: {
                      scratches: inspectionData.checklist.exterior.scratches,
                      dents: inspectionData.checklist.exterior.dents,
                      discoloration: inspectionData.checklist.exterior.discoloration,
                      dust: inspectionData.checklist.exterior.dust,
                    },
                    functionality: {
                      powerOn: inspectionData.checklist.functionality.powerOn,
                      allButtonsWork: inspectionData.checklist.functionality.allButtonsWork,
                      screenDisplay: inspectionData.checklist.functionality.screenDisplay,
                      connectivity: inspectionData.checklist.functionality.connectivity,
                    },
                    optical: {
                      lensClarity: inspectionData.checklist.optical?.lensClarity || false,
                      aperture: inspectionData.checklist.optical?.aperture || false,
                      focusAccuracy: inspectionData.checklist.optical?.focusAccuracy || false,
                      stabilization: inspectionData.checklist.optical?.stabilization || false,
                    },
                    notes: inspectionData.notes,
                  }}
                  onChange={(checklistData) => {
                    console.log('[DEBUG] チェックリストデータ変更:', checklistData);
                    setInspectionData(prev => ({
                      ...prev,
                      checklist: {
                        exterior: checklistData.exterior,
                        functionality: checklistData.functionality,
                        optical: checklistData.optical || prev.checklist.optical,
                      },
                      notes: checklistData.notes || prev.notes,
                    }));
                  }}
                  showOptical={true}
                  readOnly={false}
                />
              </NexusCard>
            )}

            {/* 次へボタン */}
            <div className="flex justify-between">
              <NexusButton
                onClick={() => saveProgress(1)}
                variant="secondary"
                size="lg"
              >
                保存して後で続ける
              </NexusButton>
              <div className="flex gap-3">
                <NexusButton
                  onClick={() => submitInspection(true, null)}
                  variant="outline"
                  size="lg"
                >
                  検品のみ完了
                </NexusButton>
                <NexusButton
                  onClick={() => handleStepChange(2)}
                  variant="primary"
                  size="lg"
                >
                  検品・撮影完了
                </NexusButton>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <PhotoUploader
            productId={productId}
            photos={inspectionData.photos}
            onUpdate={updatePhotos}
            onNext={() => handleStepChange(3)}
            onPrev={() => handleStepChange(1)}
            onSaveAndReturn={() => saveProgress(2)}
            category={product.category}
            loading={loading}
          />
        )}

        {currentStep === 3 && (
          <PackagingAndLabelStep
            productId={productId}
            product={product}
            onNext={() => handleStepChange(4)}
            onPrev={() => handleStepChange(2)}
            onSaveAndReturn={() => saveProgress(3)}
            loading={loading}
          />
        )}

        {currentStep === 4 && (
          <ShelfStorageStep
            productId={productId}
            product={product}
            onComplete={(locationId) => submitInspection(false, locationId)}
            onPrev={() => handleStepChange(3)}
            onSaveAndReturn={() => saveProgress(4)}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
} 