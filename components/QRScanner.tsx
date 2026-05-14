'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
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
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const requestCameraPermission = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('この端末ではカメラが利用できません');
      setHasPermission(false);
      return false;
    }
    // 制約を緩めながら段階的に試行し、最終失敗時は実エラー名/メッセージを画面に出す
    const attempts: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: 'environment' } } },
      { video: true },
    ];
    let lastError: unknown = null;
    for (const constraints of attempts) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach((t) => t.stop());
        setHasPermission(true);
        return true;
      } catch (e: unknown) {
        lastError = e;
        const name = e instanceof Error ? e.name : 'UnknownError';
        const message = e instanceof Error ? e.message : String(e);
        logger.warn('getUserMedia attempt failed', { constraints, name, message });
        if (name === 'NotAllowedError') break; // 権限拒否はリトライしても無駄
      }
    }
    const name = lastError instanceof Error ? lastError.name : 'UnknownError';
    const detail = lastError instanceof Error ? lastError.message : String(lastError);
    const msg =
      name === 'NotAllowedError'
        ? 'カメラ権限が拒否されました。端末の設定から許可してください'
        : `カメラの起動に失敗しました [${name}${detail ? `: ${detail}` : ''}]`;
    setError(msg);
    setHasPermission(false);
    if (onScanError) onScanError(msg);
    return false;
  };

  const startScanning = async () => {
    try {
      logger.debug('Initializing scanner');

      // 二重起動防止 & 再初期化
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch {}
        scannerRef.current = null;
      }

      // iOS/Safari対策: 先に権限確認
      const ok = await requestCameraPermission();
      if (!ok) {
        return;
      }

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      const startConfig = {
        fps: 15,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
        disableFlip: false,
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      } as unknown as Parameters<typeof scanner.start>[1];

      const onDecode = (decodedText: string) => {
        logger.info('QR decoded', { decodedText });
        onScanSuccess(decodedText);
        if (scannerRef.current) {
          scannerRef.current.stop().catch((e) => logger.warn('Stop after success failed', e));
          scannerRef.current.clear();
        }
        setIsScanning(false);
      };
      const onTick = (errorMessage: string) => {
        logger.debug('Scan tick error', { errorMessage });
      };

      // バックカメラ優先で起動。失敗時は制約なしで再試行
      try {
        await scanner.start({ facingMode: 'environment' }, startConfig, onDecode, onTick);
      } catch (e1) {
        logger.warn('start with environment camera failed, retry with any camera', {
          name: e1 instanceof Error ? e1.name : '?',
          message: e1 instanceof Error ? e1.message : String(e1),
        });
        await scanner.start(
          { facingMode: 'user' as unknown as 'environment' },
          startConfig,
          onDecode,
          onTick
        );
      }

      setIsScanning(true);
      setHasPermission(true);
      setError('');
    } catch (err) {
      const name = err instanceof Error ? err.name : 'UnknownError';
      const detail = err instanceof Error ? err.message : String(err);
      const errorMsg = `カメラの起動に失敗しました [${name}${detail ? `: ${detail}` : ''}]`;
      setError(errorMsg);
      setHasPermission(false);
      logger.error('Failed to start camera', { name, message: detail });
      if (onScanError) {
        onScanError(errorMsg);
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        logger.warn('Stop scanner failed', err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    logger.debug('Mount');
    return () => {
      logger.debug('Unmount -> stopScanning');
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .catch((err) => logger.warn('Stop scanner failed', err))
          .finally(() => {
            try {
              scanner.clear();
            } catch {}
          });
        scannerRef.current = null;
      }
    };
  }, []);

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
