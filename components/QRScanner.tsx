'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: string) => void
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState<string>('')

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' }, // バックカメラを使用
        {
          fps: 20,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          onScanSuccess(decodedText)
          
          // onScanSuccess呼び出し後にスキャンを停止
          if (scannerRef.current) {
            scannerRef.current.stop().catch(() => {})
            scannerRef.current.clear()
          }
          setIsScanning(false)
        },
        (errorMessage) => {
          // スキャンエラーは無視（スキャン中は常にエラーが発生する）
        }
      )

      setIsScanning(true)
      setHasPermission(true)
      setError('')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'カメラの起動に失敗しました'
      setError(errorMsg)
      setHasPermission(false)
      if (onScanError) {
        onScanError(errorMsg)
      }
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
      }
    }
    setIsScanning(false)
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div id="qr-reader" className="w-full max-w-md mx-auto mb-4" />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-1">カメラ権限を許可してください</p>
          </div>
        )}

        <div className="flex gap-3">
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              スキャン開始
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-700 transition"
            >
              停止
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-3 text-center">
          トリアージタッグのQRコードをカメラに写してください
        </p>
      </div>
    </div>
  )
}
