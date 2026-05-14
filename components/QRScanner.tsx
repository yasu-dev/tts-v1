'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode, type Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('components/QRScanner');

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isHandlingScanRef = useRef(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const ensureCameraApiAvailable = () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('この端末ではカメラが利用できません');
      setHasPermission(false);
      return false;
    }
    return true;
  };

  const clearScanner = useCallback(async (scanner: Html5Qrcode | null) => {
    if (!scanner) return;

    try {
      await scanner.stop();
    } catch (err) {
      logger.warn('Stop scanner failed', err);
    }

    try {
      scanner.clear();
    } catch (err) {
      logger.warn('Clear scanner failed', err);
    }
  }, []);

  const getCameraErrorMessage = (err: unknown) => {
    const name = err instanceof Error ? err.name : 'UnknownError';
    const detail = err instanceof Error ? err.message : String(err);

    if (name === 'NotAllowedError') {
      return 'カメラ権限が拒否されました。ブラウザまたは端末の設定から許可してください';
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return '利用できるカメラが見つかりません';
    }
    if (name === 'NotReadableError' || name === 'TrackStartError') {
      return 'カメラを起動できません。ほかのアプリがカメラを使用している場合は閉じてください';
    }
    if (name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError') {
      return 'この端末のカメラ条件に合わなかったため起動できませんでした';
    }

    return `カメラの起動に失敗しました [${name}${detail ? `: ${detail}` : ''}]`;
  };

  const startScanning = async () => {
    try {
      logger.debug('Initializing scanner');
      isHandlingScanRef.current = false;

      // 二重起動防止 & 再初期化
      if (scannerRef.current) {
        const currentScanner = scannerRef.current;
        scannerRef.current = null;
        await clearScanner(currentScanner);
      }

      if (!ensureCameraApiAvailable()) {
        return;
      }

      const startConfig: Html5QrcodeCameraScanConfig = {
        fps: 15,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
        disableFlip: false,
      };

      const onDecode = (decodedText: string) => {
        if (isHandlingScanRef.current) return;
        isHandlingScanRef.current = true;
        logger.info('QR decoded', { decodedText });

        void (async () => {
          const currentScanner = scannerRef.current;
          scannerRef.current = null;
          setIsScanning(false);
          await clearScanner(currentScanner);

          try {
            onScanSuccess(decodedText);
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'QR読取後の処理に失敗しました';
            logger.error('QR success handler failed', err);
            setError(msg);
            if (onScanError) onScanError(msg);
          }
        })();
      };
      const onTick = (errorMessage: string) => {
        logger.debug('Scan tick error', { errorMessage });
      };

      // html5-qrcode は facingMode に WebRTC 標準の { ideal } を受け付けず、
      // string か { exact } のみ許容するため、string 形式で渡す。
      // 失敗時の再試行では state transition 競合を避けるため scanner を作り直す。
      const attempts: Array<{ label: string; facingMode: 'environment' | 'user' }> = [
        { label: 'environment camera', facingMode: 'environment' },
        { label: 'user camera', facingMode: 'user' },
      ];
      let lastError: unknown = null;

      for (const attempt of attempts) {
        const scanner = new Html5Qrcode('qr-reader', {
          verbose: false,
          experimentalFeatures: { useBarCodeDetectorIfSupported: false },
        });
        scannerRef.current = scanner;
        try {
          await scanner.start({ facingMode: attempt.facingMode }, startConfig, onDecode, onTick);
          lastError = null;
          break;
        } catch (err) {
          lastError = err;
          logger.warn(`start with ${attempt.label} failed`, {
            name: err instanceof Error ? err.name : '?',
            message: err instanceof Error ? err.message : String(err),
          });
          scannerRef.current = null;
          await clearScanner(scanner);
        }
      }

      if (lastError) {
        throw lastError;
      }

      setIsScanning(true);
      setHasPermission(true);
      setError('');
    } catch (err) {
      const currentScanner = scannerRef.current;
      scannerRef.current = null;
      await clearScanner(currentScanner);
      setIsScanning(false);
      const name = err instanceof Error ? err.name : 'UnknownError';
      const detail = err instanceof Error ? err.message : String(err);
      const errorMsg = getCameraErrorMessage(err);
      setError(errorMsg);
      setHasPermission(false);
      logger.error('Failed to start camera', { name, message: detail });
      if (onScanError) {
        onScanError(errorMsg);
      }
    }
  };

  const stopScanning = async () => {
    const currentScanner = scannerRef.current;
    scannerRef.current = null;
    isHandlingScanRef.current = false;
    await clearScanner(currentScanner);
    setIsScanning(false);
  };

  useEffect(() => {
    logger.debug('Mount');
    return () => {
      logger.debug('Unmount -> stopScanning');
      const scanner = scannerRef.current;
      if (scanner) {
        scannerRef.current = null;
        void clearScanner(scanner);
      }
    };
  }, [clearScanner]);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      // インスタンスがなければ仮作成
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }
      const result: unknown = await scannerRef.current.scanFile(file, true);
      if (
        result &&
        typeof result === 'object' &&
        'decodedText' in result &&
        typeof (result as { decodedText: unknown }).decodedText === 'string'
      ) {
        onScanSuccess((result as { decodedText: string }).decodedText);
      } else if (typeof result === 'string') {
        onScanSuccess(result);
      } else {
        throw new Error('画像からQRを読み取れませんでした');
      }
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '画像からの読み取りに失敗しました';
      setError(msg);
      if (onScanError) onScanError(msg);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white p-4 shadow-md">
        <div id="qr-reader" className="mx-auto mb-4 w-full max-w-md" />

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <p className="text-sm">{error}</p>
            <p className="mt-1 text-xs">カメラ権限を許可してください</p>
          </div>
        )}

        <div className="flex gap-3">
          {!isScanning ? (
            <button
              onClick={startScanning}
              data-testid="qr-start-btn"
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              スキャン開始
            </button>
          ) : (
            <button
              onClick={stopScanning}
              data-testid="qr-stop-btn"
              className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
            >
              停止
            </button>
          )}

          {/* 画像ファイルから読み取り（iOS/Safari等のfallback） */}
          <button
            onClick={handlePickImage}
            data-testid="qr-file-btn"
            className="flex-1 rounded-lg bg-gray-100 px-6 py-3 font-bold text-gray-800 transition hover:bg-gray-200"
          >
            写真から読み取る
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <p className="mt-3 text-center text-xs text-gray-500">
          トリアージタッグのQRコードをカメラに写してください
        </p>
      </div>
    </div>
  );
}
