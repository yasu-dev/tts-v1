'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface QRScanNavigationButtonProps {
  className?: string
}

export default function QRScanNavigationButton({ className = '' }: QRScanNavigationButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const router = useRouter()

  const handleConfirm = () => {
    router.push('/triage/scan')
  }

  return (
    <>
      <button
        onClick={() => setShowConfirmation(true)}
        className={`bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors ${className}`}
      >
        トリアージ入力
      </button>

      {/* 確認モーダル */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">画面遷移の確認</h3>
            <p className="text-gray-600 mb-6">
              トリアージ入力画面に移動します。<br />
              現在の作業内容は保存されません。<br />
              よろしいですか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                移動する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}