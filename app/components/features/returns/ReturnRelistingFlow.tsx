'use client'

import React, { useState } from 'react'
import { CheckCircle, Camera, Package, DollarSign, Send, AlertCircle } from 'lucide-react'
import { ContentCard } from '@/app/components/ui'

interface RelistingStep {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed'
  icon: React.ReactNode
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

  const steps: RelistingStep[] = [
    { id: '1', title: '検品結果確認', status: 'completed', icon: <CheckCircle className="w-6 h-6" /> },
    { id: '2', title: '写真撮影', status: 'in-progress', icon: <Camera className="w-6 h-6" /> },
    { id: '3', title: '商品情報更新', status: 'pending', icon: <Package className="w-6 h-6" /> },
    { id: '4', title: '価格設定', status: 'pending', icon: <DollarSign className="w-6 h-6" /> },
    { id: '5', title: '再出品', status: 'pending', icon: <Send className="w-6 h-6" /> }
  ]

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file))
      setRelistingData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }))
    }
  }

  return (
    <div className="space-y-6">
      <ContentCard>
        <h2 className="text-2xl font-bold mb-6">返品商品再出品フロー</h2>

        {/* ステップインジケーター */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1">
                <div className="flex items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}
                  `}>
                    {step.icon}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                <p className="text-sm mt-2">{step.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 商品情報 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">商品情報</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">商品名</p>
              <p className="font-medium">{product.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">SKU</p>
              <p className="font-medium">{product.sku}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">検品結果</p>
              <p className="font-medium text-green-600">合格</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">商品状態</p>
              <p className="font-medium">{product.condition}</p>
            </div>
          </div>
        </div>

        {/* ステップ別コンテンツ */}
        <div className="mb-8">
          {currentStep === 0 && (
            <div>
              <h3 className="font-semibold mb-4">検品結果確認</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span>検品合格 - 再出品可能</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>✓ 外観確認: 良好</li>
                  <li>✓ 動作確認: 正常</li>
                  <li>✓ 付属品: 完備</li>
                  <li>✓ 真贋確認: 本物</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h3 className="font-semibold mb-4">写真撮影</h3>
              <div className="grid grid-cols-3 gap-4">
                {relistingData.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`商品写真 ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
                <label className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                  <Camera className="w-8 h-8 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                最低3枚以上の写真を撮影してください
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="font-semibold mb-4">商品情報更新</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">商品説明</label>
                  <textarea
                    value={relistingData.description}
                    onChange={(e) => setRelistingData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows={4}
                    placeholder="返品理由や現在の状態を踏まえた説明を入力"
                  />
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
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
              <h3 className="font-semibold mb-4">価格設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">販売価格</label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">¥</span>
                    <input
                      type="number"
                      value={relistingData.price}
                      onChange={(e) => setRelistingData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="flex-1 p-3 border border-gray-300 rounded-lg text-xl"
                    />
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">価格設定の参考情報</p>
                  <ul className="space-y-1 text-sm">
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
              <h3 className="font-semibold mb-4">再出品確認</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">出品先プラットフォーム</label>
                  <select
                    value={relistingData.platform}
                    onChange={(e) => setRelistingData(prev => ({ ...prev, platform: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="ebay">eBay</option>
                    <option value="mercari">メルカリ</option>
                    <option value="yahoo">ヤフオク</option>
                  </select>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">出品内容確認</h4>
                  <ul className="space-y-1 text-sm">
                    <li>価格: ¥{relistingData.price.toLocaleString()}</li>
                    <li>写真: {relistingData.photos.length}枚</li>
                    <li>プラットフォーム: {relistingData.platform}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex justify-between">
          <button
            onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={currentStep === 0}
          >
            戻る
          </button>
          <button
            onClick={handleNextStep}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {currentStep === steps.length - 1 ? '再出品する' : '次へ'}
          </button>
        </div>
      </ContentCard>
    </div>
  )
} 