'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QRScanNavigationButtonProps {
  className?: string;
}

export default function QRScanNavigationButton({ className = '' }: QRScanNavigationButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const handleConfirm = () => {
    router.push('/triage/scan');
  };

  return (
    <>
      <button
        onClick={() => setShowConfirmation(true)}
        className={`rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 ${className}`}
      >
        トリアージ入力
      </button>

      {/* 確認モーダル */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-bold">画面遷移の確認</h3>
            <p className="mb-6 text-gray-600">
              トリアージ入力画面に移動します。
              <br />
              現在の作業内容は保存されません。
              <br />
              よろしいですか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                移動する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
