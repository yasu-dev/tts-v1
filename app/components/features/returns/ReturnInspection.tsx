'use client'

import React, { useState, useEffect } from 'react'
import { Camera, CheckCircle, XCircle, AlertTriangle, Upload } from 'lucide-react'
import { ContentCard } from '@/app/components/ui'

interface InspectionItem {
  id: string
  name: string
  checked: boolean
  status: 'pass' | 'fail' | 'warning' | null
  comment?: string
}

interface ReturnProduct {
  id: string
  name: string
  sku: string
  returnReason: string
  originalCondition: string
  images: string[]
}

export function ReturnInspection() {
  const [product] = useState<ReturnProduct>({
    id: '1',
    name: 'レア・ヴィンテージ時計',
    sku: 'WTH-001',
    returnReason: '商品説明と異なる',
    originalCondition: '新品同様',
    images: []
  })

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([
    { id: '1', name: '外観確認', checked: false, status: null },
    { id: '2', name: '動作確認', checked: false, status: null },
    { id: '3', name: '付属品確認', checked: false, status: null },
    { id: '4', name: '真贋確認', checked: false, status: null },
    { id: '5', name: '清掃状態', checked: false, status: null }
  ])

  const [photos, setPhotos] = useState<string[]>([])
  const [overallStatus, setOverallStatus] = useState<'pass' | 'fail' | 'pending'>('pending')

  const handleItemCheck = (itemId: string, status: 'pass' | 'fail' | 'warning') => {
    setInspectionItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, checked: true, status } : item
      )
    )
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file))
      setPhotos(prev => [...prev, ...newPhotos])
    }
  }

  useEffect(() => {
    const allChecked = inspectionItems.every(item => item.checked)
    const hasFail = inspectionItems.some(item => item.status === 'fail')
    
    if (allChecked) {
      setOverallStatus(hasFail ? 'fail' : 'pass')
    }
  }, [inspectionItems])

  return (
    <div className="space-y-6">
      <ContentCard>
        <h2 className="text-2xl font-bold mb-6">返品検品</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-semibold mb-2">商品情報</h3>
            <p className="text-gray-600">商品名: {product.name}</p>
            <p className="text-gray-600">SKU: {product.sku}</p>
            <p className="text-gray-600">返品理由: {product.returnReason}</p>
            <p className="text-gray-600">入庫時状態: {product.originalCondition}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">検品ステータス</h3>
            <div className={`p-4 rounded-lg ${
              overallStatus === 'pass' ? 'bg-green-100 text-green-800' :
              overallStatus === 'fail' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {overallStatus === 'pass' ? '検品合格' :
               overallStatus === 'fail' ? '検品不合格' :
               '検品中'}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold mb-4">検品項目</h3>
          <div className="space-y-3">
            {inspectionItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">{item.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleItemCheck(item.id, 'pass')}
                    className={`p-2 rounded ${
                      item.status === 'pass' ? 'bg-green-500 text-white' : 'bg-gray-300'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleItemCheck(item.id, 'warning')}
                    className={`p-2 rounded ${
                      item.status === 'warning' ? 'bg-yellow-500 text-white' : 'bg-gray-300'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleItemCheck(item.id, 'fail')}
                    className={`p-2 rounded ${
                      item.status === 'fail' ? 'bg-red-500 text-white' : 'bg-gray-300'
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold mb-4">写真撮影</h3>
          <div className="grid grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`検品写真 ${index + 1}`}
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
        </div>

        <div className="flex justify-end gap-4">
          <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            キャンセル
          </button>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={overallStatus === 'pending'}
          >
            検品完了
          </button>
        </div>
      </ContentCard>
    </div>
  )
} 