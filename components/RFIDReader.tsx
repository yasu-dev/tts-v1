'use client';

import { useRFIDBridge, type BridgeState } from '@/lib/hooks/useRFIDBridge';
import { clientEnv } from '@/lib/env';

interface RFIDReaderProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

const STATE_INDICATOR: Record<BridgeState, { dot: string; label: string; color: string }> = {
  idle: { dot: '○', label: '未接続', color: 'text-gray-400' },
  connecting: { dot: '◐', label: '接続中…', color: 'text-blue-500' },
  connected: { dot: '●', label: '接続済み', color: 'text-emerald-600' },
  scanning: { dot: '◉', label: '読み取り中…', color: 'text-amber-600' },
  error: { dot: '⚠', label: 'エラー', color: 'text-red-600' },
  disconnected: { dot: '○', label: '切断・再接続中', color: 'text-gray-400' },
};

export default function RFIDReader({ onScanSuccess, onScanError }: RFIDReaderProps) {
  const { state, lastError, startScan, reconnect } = useRFIDBridge({
    url: clientEnv.NEXT_PUBLIC_RFID_BRIDGE_URL,
    enabled: true,
    onScanSuccess,
    onError: (code, message) => {
      if (onScanError) onScanError(`${code}: ${message}`);
    },
  });

  const indicator = STATE_INDICATOR[state];
  const canScan = state === 'connected';

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-white p-3">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold ${indicator.color}`}>
          {indicator.dot} RFID リーダー: {indicator.label}
        </span>
        {state === 'error' && (
          <button
            type="button"
            onClick={reconnect}
            className="rounded border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            再接続
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={startScan}
        disabled={!canScan}
        aria-label="RFID タグをスキャン"
        className={`w-full rounded-lg py-3 font-bold text-white transition-colors ${
          canScan ? 'bg-emerald-600 hover:bg-emerald-700' : 'cursor-not-allowed bg-gray-300'
        }`}
      >
        かざして読み取り
      </button>

      {lastError && state === 'error' && (
        <p className="text-xs text-red-600">
          {lastError.code}: {lastError.message}
        </p>
      )}

      {state === 'disconnected' && (
        <p className="text-xs text-gray-500">
          ローカルブリッジサービスに接続できません。デモ PC で RFID Bridge
          が起動しているかご確認ください。
        </p>
      )}
    </div>
  );
}
