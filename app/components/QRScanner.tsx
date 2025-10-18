'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface QRScannerProps {
  onScan: (tagId: string) => void
  onError?: (error: string) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner>()
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    if (!isScanning) return

    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      },
      false
    )

    scannerRef.current.render(
      (decodedText) => {
        try {
          // QRデータ形式: "TRIAGE:EVENT_ID:TAG_ID:CHECKSUM"
          const parts = decodedText.split(':')
          if (parts[0] !== 'TRIAGE' || parts.length !== 4) {
            throw new Error('無効なQRコード形式です')
          }

          // チェックサム検証（簡易版: 文字列長の合計）
          const expectedChecksum = (parts[1].length + parts[2].length).toString()
          if (parts[3] !== expectedChecksum) {
            throw new Error('QRコードのチェックサムが一致しません')
          }

          onScan(parts[2]) // TAG_ID
          scannerRef.current?.clear()
          setIsScanning(false)
        } catch (err: any) {
          onError?.(err.message)
        }
      },
      (error) => {
        // スキャンエラーは無視（継続スキャン）
      }
    )

    return () => {
      scannerRef.current?.clear()
    }
  }, [isScanning, onScan, onError])

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <button
          onClick={() => setIsScanning(true)}
          className="w-full bg-blue-600 text-white py-6 rounded-lg text-xl font-bold hover:bg-blue-700"
        >
          📷 QRコードをスキャン
        </button>
      ) : (
        <div className="space-y-4">
          <div id="qr-reader" className="border-4 border-blue-500 rounded-lg overflow-hidden" />
          <button
            onClick={() => {
              scannerRef.current?.clear()
              setIsScanning(false)
            }}
            className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
          >
            キャンセル
          </button>
        </div>
      )}
    </div>
  )
}
