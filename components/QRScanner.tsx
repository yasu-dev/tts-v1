'use client'

import { useEffect, useRef, useState, useId } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { createLogger } from '@/lib/utils/logger'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: string) => void
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const scannerId = useId().replace(/:/g, '-') // ユニークなIDを生成（コロンを削除）
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState<string>('')
  const logger = createLogger('components/QRScanner')

  const startScanning = async () => {
    try {
      logger.debug('Initializing scanner', { scannerId })

      // 既存のスキャナーをクリーンアップ
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop()
          scannerRef.current.clear()
        } catch (e) {
          logger.warn('Failed to stop existing scanner', e)
        }
        scannerRef.current = null
      }

      const scanner = new Html5Qrcode(scannerId)
      scannerRef.current = scanner

      const config = {
        fps: 20,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0,
        disableFlip: false,
      }

      // カメラ設定を試行（環境カメラ優先、失敗時はデフォルト）
      let cameraStarted = false

      try {
        // まず環境カメラ（バックカメラ）を試行
        await scanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            logger.info('QR decoded', { decodedText })
            onScanSuccess(decodedText)

            // onScanSuccess呼び出し後にスキャンを停止
            if (scannerRef.current) {
              scannerRef.current.stop().catch((e) => logger.warn('Stop after success failed', e))
              scannerRef.current.clear()
            }
            setIsScanning(false)
          },
          (errorMessage) => {
            // スキャンエラーは無視（スキャン中は常にエラーが発生する）
            logger.debug('Scan tick error', { errorMessage })
          }
        )
        cameraStarted = true
        logger.debug('Started with environment camera')
      } catch (envError) {
        logger.warn('Failed to start with environment camera, trying default', envError)

        // 環境カメラが失敗した場合、デフォルトカメラを試行
        try {
          await scanner.start(
            { facingMode: 'user' }, // フロントカメラ
            config,
            (decodedText) => {
              logger.info('QR decoded', { decodedText })
              onScanSuccess(decodedText)

              if (scannerRef.current) {
                scannerRef.current.stop().catch((e) => logger.warn('Stop after success failed', e))
                scannerRef.current.clear()
              }
              setIsScanning(false)
            },
            (errorMessage) => {
              logger.debug('Scan tick error', { errorMessage })
            }
          )
          cameraStarted = true
          logger.debug('Started with front camera')
        } catch (userError) {
          logger.warn('Failed to start with front camera, trying any camera', userError)

          // それでも失敗した場合、カメラIDを取得して試行
          const cameras = await Html5Qrcode.getCameras()
          if (cameras && cameras.length > 0) {
            const cameraId = cameras[0].id
            await scanner.start(
              cameraId,
              config,
              (decodedText) => {
                logger.info('QR decoded', { decodedText })
                onScanSuccess(decodedText)

                if (scannerRef.current) {
                  scannerRef.current.stop().catch((e) => logger.warn('Stop after success failed', e))
                  scannerRef.current.clear()
                }
                setIsScanning(false)
              },
              (errorMessage) => {
                logger.debug('Scan tick error', { errorMessage })
              }
            )
            cameraStarted = true
            logger.debug('Started with camera ID', { cameraId })
          }
        }
      }

      if (cameraStarted) {
        setIsScanning(true)
        setHasPermission(true)
        setError('')
      } else {
        throw new Error('どのカメラも起動できませんでした')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'カメラの起動に失敗しました'
      setError(errorMsg)
      setHasPermission(false)
      logger.error('Failed to start camera', { error: errorMsg })
      if (onScanError) {
        onScanError(errorMsg)
      }
      // エラー時はscannerRefをクリア
      if (scannerRef.current) {
        try {
          scannerRef.current.clear()
        } catch (e) {
          logger.warn('Failed to clear scanner after error', e)
        }
        scannerRef.current = null
      }
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        if (isScanning) {
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
        scannerRef.current = null
      } catch (err) {
        logger.warn('Stop scanner failed', err)
      }
    }
    setIsScanning(false)
  }

  useEffect(() => {
    logger.debug('Mount')
    return () => {
      logger.debug('Unmount -> stopScanning')
      // クリーンアップ時に非同期で停止
      if (scannerRef.current) {
        scannerRef.current.stop().catch((e) => logger.warn('Cleanup stop failed', e))
        scannerRef.current.clear()
        scannerRef.current = null
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div id={scannerId} className="w-full max-w-md mx-auto mb-4" />

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
