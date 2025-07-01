'use client';

import { useState } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';

interface PackingInstructionsProps {
  item: {
    id: string;
    productName: string;
    productSku: string;
    category: string;
    value: number;
    fragile?: boolean;
    size?: 'small' | 'medium' | 'large';
    weight?: number;
  };
  onComplete?: () => void;
  onClose?: () => void;
}

interface PackingStep {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  completed?: boolean;
}

export default function PackingInstructions({
  item,
  onComplete,
  onClose
}: PackingInstructionsProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);

  // 商品価値に応じた梱包レベルを決定
  const getPackingLevel = (value: number) => {
    if (value >= 1000000) return 'premium'; // 100万円以上
    if (value >= 500000) return 'high'; // 50万円以上
    if (value >= 100000) return 'standard'; // 10万円以上
    return 'basic';
  };

  const packingLevel = getPackingLevel(item.value);

  // カテゴリー別の特別な梱包指示
  const getCategorySpecificInstructions = (category: string) => {
    switch (category) {
      case 'カメラ本体':
      case 'レンズ':
        return [
          { id: 100, title: '静電気対策', description: '静電気防止袋に入れる' },
          { id: 101, title: '衝撃対策', description: 'レンズキャップを確認し、ボディキャップを装着' },
          { id: 102, title: '湿度対策', description: '乾燥剤を同梱（2個）' }
        ];
      case '腕時計':
        return [
          { id: 200, title: '時計固定', description: 'ウォッチクッションで固定' },
          { id: 201, title: '巻き上げ停止', description: 'リューズを引いて時計を止める' },
          { id: 202, title: '証明書確認', description: '保証書・鑑定書を別途保護' }
        ];
      default:
        return [];
    }
  };

  // 基本的な梱包手順
  const getBasePackingSteps = (): PackingStep[] => {
    const baseSteps: PackingStep[] = [
      {
        id: 1,
        title: '商品確認',
        description: '商品の状態を最終確認し、付属品がすべて揃っているか確認'
      },
      {
        id: 2,
        title: '清掃',
        description: '柔らかいクロスで商品を丁寧に清掃'
      },
      {
        id: 3,
        title: '撮影',
        description: '梱包前の最終状態を撮影（4方向から）'
      }
    ];

    // カテゴリー別の特別指示を追加
    const categorySteps = getCategorySpecificInstructions(item.category);
    
    // 梱包レベルに応じた手順
    const packingSteps: PackingStep[] = [];
    
    if (packingLevel === 'premium') {
      packingSteps.push(
        {
          id: 4,
          title: 'プレミアム保護',
          description: '商品を専用ハードケースに収納'
        },
        {
          id: 5,
          title: '多層緩衝',
          description: 'エアキャップ（大粒）で3重に包装'
        },
        {
          id: 6,
          title: '防水対策',
          description: '防水シートで完全密封'
        }
      );
    } else if (packingLevel === 'high') {
      packingSteps.push(
        {
          id: 4,
          title: '高級保護',
          description: 'エアキャップ（大粒）で2重に包装'
        },
        {
          id: 5,
          title: '緩衝材配置',
          description: '周囲に高密度緩衝材を配置'
        }
      );
    } else {
      packingSteps.push(
        {
          id: 4,
          title: '標準保護',
          description: 'エアキャップで包装'
        },
        {
          id: 5,
          title: '緩衝材',
          description: '適切な緩衝材で周囲を保護'
        }
      );
    }

    // 最終手順
    packingSteps.push(
      {
        id: 7,
        title: '箱詰め',
        description: packingLevel === 'premium' ? '新品強化段ボール（二重構造）を使用' :
                    packingLevel === 'high' ? '新品段ボール（厚手）を使用' :
                    '適切なサイズの段ボールを使用'
      },
      {
        id: 8,
        title: 'シール貼付',
        description: '取扱注意シール（精密機器・天地無用・水濡れ注意）を貼付'
      },
      {
        id: 9,
        title: '最終確認',
        description: '梱包状態を撮影し、伝票を貼付'
      }
    );

    return [...baseSteps, ...categorySteps, ...packingSteps];
  };

  const steps = getBasePackingSteps();

  const handleStepComplete = (stepId: number) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepId);
    setCompletedSteps(newCompleted);

    // 次のステップに自動的に移動
    const currentIndex = steps.findIndex(s => s.id === stepId);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(currentIndex + 1);
    }
  };

  const handleComplete = () => {
    if (completedSteps.size === steps.length) {
      onComplete?.();
    } else {
      alert('すべての手順を完了してください');
    }
  };

  const getPackingMaterials = () => {
    const materials = [
      '柔らかいクロス',
      'エアキャップ',
      '緩衝材',
      '段ボール',
      '取扱注意シール',
      'テープ'
    ];

    if (packingLevel === 'premium') {
      materials.push('専用ハードケース', '防水シート', '強化段ボール（二重構造）');
    } else if (packingLevel === 'high') {
      materials.push('高密度緩衝材', '厚手段ボール');
    }

    if (item.category === 'カメラ本体' || item.category === 'レンズ') {
      materials.push('静電気防止袋', '乾燥剤');
    } else if (item.category === '腕時計') {
      materials.push('ウォッチクッション', '保護フィルム');
    }

    return materials;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">梱包指示書</h2>
              <p className="mt-1 opacity-90">
                {item.productName} - SKU: {item.productSku}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* 商品情報 */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">商品価値</p>
                <p className="text-lg font-bold text-gray-900">¥{item.value.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">梱包レベル</p>
                <p className="text-lg font-bold">
                  <span className={`
                    ${packingLevel === 'premium' ? 'text-purple-600' :
                      packingLevel === 'high' ? 'text-blue-600' :
                      packingLevel === 'standard' ? 'text-green-600' :
                      'text-gray-600'}
                  `}>
                    {packingLevel === 'premium' ? 'プレミアム' :
                     packingLevel === 'high' ? '高級' :
                     packingLevel === 'standard' ? '標準' : '基本'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">カテゴリー</p>
                <p className="text-lg font-bold text-gray-900">{item.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">特記事項</p>
                <p className="text-lg font-bold text-red-600">
                  {item.fragile ? '取扱注意' : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* 必要な梱包材 */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-gray-900 mb-4">必要な梱包材</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {getPackingMaterials().map((material, index) => (
                <div key={index} className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">{material}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 梱包手順 */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">梱包手順</h3>
            <div className="space-y-4">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.has(step.id);
                const isCurrent = index === currentStep;
                
                return (
                  <div
                    key={step.id}
                    className={`
                      border rounded-lg p-4 transition-all
                      ${isCompleted ? 'bg-green-50 border-green-300' :
                        isCurrent ? 'bg-blue-50 border-blue-300 shadow-md' :
                        'bg-white border-gray-200'}
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`
                        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                        ${isCompleted ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-blue-500 text-white' :
                          'bg-gray-200 text-gray-600'}
                      `}>
                        {isCompleted ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="font-bold">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">{step.title}</h4>
                        <p className="text-gray-600">{step.description}</p>
                        
                        {isCurrent && !isCompleted && (
                          <button
                            onClick={() => handleStepComplete(step.id)}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            完了
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              進捗: {completedSteps.size} / {steps.length} 完了
            </div>
            <div className="flex gap-3">
              <NexusButton
                variant="secondary"
                onClick={onClose}
              >
                キャンセル
              </NexusButton>
              <NexusButton
                variant="primary"
                onClick={handleComplete}
                disabled={completedSteps.size < steps.length}
              >
                梱包完了
              </NexusButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 