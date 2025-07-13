'use client'

import React, { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { NexusCard, NexusButton, NexusInput, NexusTextarea, NexusSelect } from '@/app/components/ui'

interface RelistingStep {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed'
}

export function ReturnRelistingFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [product] = useState({
    id: '1',
    name: 'レア・ヴィンテージ時計',
    sku: 'WTH-001',
    originalPrice: 250000,
    returnInspectionStatus: 'pass',
    condition: '良好',
    images: []
  })

  const [relistingData, setRelistingData] = useState({
    price: product.originalPrice,
    description: '',
    platform: 'ebay',
    photos: [] as string[]
  })

  // ステップをstateとして管理し、動的にステータスを更新
  const [steps, setSteps] = useState<RelistingStep[]>([
    { id: '1', title: '検品結果確認', status: 'completed' },
    { id: '2', title: '写真撮影', status: 'in-progress' },
    { id: '3', title: '商品情報更新', status: 'pending' },
    { id: '4', title: '価格設定', status: 'pending' },
    { id: '5', title: '再出品', status: 'pending' }
  ])

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      
      // ステップステータスを動的に更新
      setSteps(prevSteps => 
        prevSteps.map((step, index) => ({
          ...step,
          status: index < nextStep ? 'completed' : 
                  index === nextStep ? 'in-progress' : 'pending'
        }))
      )
    }
  }
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      
      // ステップステータスを動的に更新
      setSteps(prevSteps => 
        prevSteps.map((step, index) => ({
          ...step,
          status: index < prevStep ? 'completed' : 
                  index === prevStep ? 'in-progress' : 'pending'
        }))
      )
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file))
      setRelistingData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }))
    }
  }

  // 簡潔なアイコンレンダリング
  const renderStepIcon = (step: RelistingStep, index: number) => {
    if (step.status === 'completed') {
      return (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      )
    } else if (step.status === 'in-progress') {
      // ステップ番号を表示
      return (
        <span className="text-white font-semibold">{index + 1}</span>
      )
    } else {
      // 待機状態のステップ番号
      return (
        <span className="text-nexus-text-secondary font-semibold">{index + 1}</span>
      )
    }
  }

  return (
    <div className="space-y-6">
    <div className="intelligence-card global">
      <div className="p-8">
        <h2 className="text-2xl font-bold font-display text-nexus-text-primary mb-6">返品商品再出品業務フロー</h2>

        {/* ステップインジケーター */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center text-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${step.status === 'completed' ? 'bg-nexus-primary text-white' : 
                      step.status === 'in-progress' ? 'bg-nexus-primary text-white animate-pulse' : 
                      'bg-nexus-bg-secondary text-nexus-text-secondary'}
                  `}>
                    {renderStepIcon(step, index)}
                  </div>
                  <p className={`text-sm mt-2 transition-colors duration-300 ${
                    step.status === 'completed' || step.status === 'in-progress' 
                      ? 'text-nexus-text-primary font-medium' 
                      : 'text-nexus-text-secondary'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 transition-colors duration-300 ${
                    step.status === 'completed' ? 'bg-nexus-primary' : 'bg-nexus-border'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 商品情報 */}
        <div className="intelligence-card global mb-6">
          <div className="p-8">
            <h3 className="font-semibold mb-2 text-nexus-text-primary">商品情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-nexus-text-secondary">商品名</p>
                <p className="font-medium text-nexus-text-primary">{product.name}</p>
              </div>
              <div>
                <p className="text-sm text-nexus-text-secondary">SKU</p>
                <p className="font-medium text-nexus-text-primary">{product.sku}</p>
              </div>
              <div>
                <p className="text-sm text-nexus-text-secondary">検品結果</p>
                <p className="font-medium text-green-600">合格</p>
              </div>
              <div>
                <p className="text-sm text-nexus-text-secondary">商品状態</p>
                <p className="font-medium text-nexus-text-primary">{product.condition}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ステップ別コンテンツ */}
        <div className="intelligence-card global mb-8">
          <div className="p-8 min-h-[300px]">
          {currentStep === 0 && (
            <div>
              <h3 className="font-semibold mb-4 text-nexus-text-primary">検品結果確認</h3>
              <div className="bg-green-100 p-8 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>検品合格 - 再出品可能</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-green-700 list-disc list-inside">
                  <li>外観確認: 良好</li>
                  <li>動作確認: 正常</li>
                  <li>付属品: 完備</li>
                  <li>真贋確認: 本物</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h3 className="font-semibold mb-4 text-nexus-text-primary">写真撮影</h3>
              <div className="grid grid-cols-3 gap-4">
                {relistingData.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`商品写真 ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
                <label className="w-full h-32 bg-nexus-bg-tertiary rounded-lg flex items-center justify-center cursor-pointer hover:bg-nexus-bg-secondary transition-colors border border-nexus-border">
                  <div className="text-nexus-text-muted">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-nexus-text-secondary mt-2">
                最低3枚以上の写真を撮影してください
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="font-semibold mb-4 text-nexus-text-primary">商品情報更新</h3>
              <div className="space-y-4">
                <NexusTextarea
                  label="商品説明"
                  value={relistingData.description}
                  onChange={(e) => setRelistingData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="返品理由や現在の状態を踏まえた説明を入力"
                />
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    返品理由を考慮し、より詳細な商品説明を記載することを推奨します
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="font-semibold mb-4 text-nexus-text-primary">価格設定</h3>
              <div className="space-y-4">
                <NexusInput
                  type="number"
                  label="販売価格"
                  value={String(relistingData.price)}
                  onChange={(e) => setRelistingData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  icon={<span>¥</span>}
                />
                <div className="bg-blue-100 p-8 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">価格設定の参考情報</p>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>元販売価格: ¥{product.originalPrice.toLocaleString()}</li>
                    <li>推奨価格: ¥{Math.floor(product.originalPrice * 0.9).toLocaleString()} (10%引き)</li>
                    <li>市場平均: ¥{Math.floor(product.originalPrice * 0.95).toLocaleString()}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h3 className="font-semibold mb-4 text-nexus-text-primary">再出品確認</h3>
              <div className="space-y-4">
                <NexusSelect
                  label="出品先プラットフォーム"
                  value={relistingData.platform}
                  onChange={(e) => setRelistingData(prev => ({ ...prev, platform: e.target.value }))}
                  options={[
                    { value: "ebay", label: "eBay" },
                    { value: "mercari", label: "メルカリ" },
                    { value: "yahoo", label: "ヤフオク" },
                  ]}
                />
                <div className="bg-nexus-bg-tertiary p-8 rounded-lg">
                  <h4 className="font-medium text-nexus-text-primary mb-2">出品内容確認</h4>
                  <ul className="space-y-1 text-sm text-nexus-text-secondary">
                    <li>価格: ¥{relistingData.price.toLocaleString()}</li>
                    <li>写真: {relistingData.photos.length}枚</li>
                    <li>プラットフォーム: {relistingData.platform}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-between">
          <NexusButton
            onClick={handlePrevStep}
            disabled={currentStep === 0}
          >
            戻る
          </NexusButton>
          <NexusButton
            onClick={handleNextStep}
            variant="primary"
            disabled={currentStep === steps.length - 1}
          >
            {currentStep === steps.length - 1 ? '再出品する' : '次へ'}
          </NexusButton>
        </div>
        </div>
      </div>
    </div>
  )
} 