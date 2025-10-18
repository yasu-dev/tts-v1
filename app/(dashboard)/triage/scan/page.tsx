'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRScanner } from '@/app/components/QRScanner'
import { StartWizard } from '@/app/components/StartWizard'

export default function TriageScanPage() {
  const [mode, setMode] = useState<'scan' | 'wizard' | 'manual'>('scan')
  const [scannedTag, setScannedTag] = useState<string | null>(null)
  const router = useRouter()

  const handleScan = (tagId: string) => {
    setScannedTag(tagId)
    setMode('wizard')
  }

  const handleWizardComplete = (result: any) => {
    alert(`トリアージ完了\nタグ: $${scannedTag}\n区分: $${result.category}\n理由: $${result.reasoning}`)
    // モック: 本来はSupabaseに保存
    setMode('scan')
    setScannedTag(null)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">トリアージ入力</h1>
          <p className="text-sm opacity-90">タッグ付け部隊</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        {mode === 'scan' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-6">QRコードスキャン</h2>
            <QRScanner onScan={handleScan} onError={(err) => alert(err)} />
            <div className="mt-6">
              <button
                onClick={() => {
                  setScannedTag('MANUAL-' + Date.now())
                  setMode('wizard')
                }}
                className="w-full btn-secondary py-6 text-lg"
              >
                手動入力（QRなし）
              </button>
            </div>
          </div>
        )}

        {mode === 'wizard' && scannedTag && (
          <div>
            <div className="card mb-4">
              <p className="text-sm text-gray-600">スキャン済みタグ</p>
              <p className="text-2xl font-bold text-blue-600">{scannedTag}</p>
            </div>
            <StartWizard onComplete={handleWizardComplete} />
          </div>
        )}
      </main>
    </div>
  )
}
