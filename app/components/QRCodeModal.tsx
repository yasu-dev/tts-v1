'use client';

import { useState } from 'react';
import { BaseModal, NexusButton } from './ui';
import { useToast } from './features/notifications/ToastProvider';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  itemSku: string;
}

export default function QRCodeModal({ isOpen, onClose, itemId, itemName, itemSku }: QRCodeModalProps) {
  const { showToast } = useToast();
  const [qrSize, setQrSize] = useState<'small' | 'medium' | 'large'>('medium');

  if (!isOpen) return null;

  // デモ用のQRコードデータ
  const qrData = {
    id: itemId,
    name: itemName,
    sku: itemSku,
    url: `https://app.theworlddoor.com/items/${itemId}`,
    timestamp: new Date().toISOString()
  };

  const qrSizes = {
    small: { size: 128, label: '小 (128px)' },
    medium: { size: 256, label: '中 (256px)' },
    large: { size: 512, label: '大 (512px)' }
  };

  const handlePrint = () => {
    const printContent = `
      QRコード印刷
      
      商品名: ${itemName}
      SKU: ${itemSku}
      QRコード: ${JSON.stringify(qrData, null, 2)}
      印刷日時: ${new Date().toLocaleString('ja-JP')}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>QRコード - ${itemName}</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="text-align: center;">
              <h2>QRコード</h2>
              <p>${itemName} (${itemSku})</p>
              <div style="margin: 20px 0;">
                <div style="width: 256px; height: 256px; margin: 0 auto; border: 2px solid #000; display: flex; align-items: center; justify-content: center;">
                  QRコード画像
                </div>
              </div>
              <pre style="font-size: 12px; text-align: left;">${JSON.stringify(qrData, null, 2)}</pre>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      showToast({
        title: '印刷開始',
        message: 'QRコードの印刷を開始しました',
        type: 'success'
      });
    }
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = qrSizes[qrSize].size;
    
    canvas.width = size;
    canvas.height = size;
    
    if (ctx) {
      // 白い背景
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);
      
      // 黒いパターン（デモ用）
      ctx.fillStyle = 'black';
      const patternSize = size / 16;
      for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
          if ((i + j) % 2 === 0) {
            ctx.fillRect(i * patternSize, j * patternSize, patternSize, patternSize);
          }
        }
      }
      
      // ダウンロード
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `qrcode_${itemSku}_${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
          showToast({
            title: 'ダウンロード完了',
            message: 'QRコード画像をダウンロードしました',
            type: 'success'
          });
        }
      });
    }
  };

  const handleCopyData = () => {
    navigator.clipboard.writeText(JSON.stringify(qrData, null, 2));
    showToast({
      title: 'コピー完了',
      message: 'QRコードデータをクリップボードにコピーしました',
      type: 'success'
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="QRコード生成"
      size="md"
    >
      <div className="p-6">
        <div className="mb-4">
            <p className="text-sm text-nexus-text-secondary">
              {itemName} ({itemSku})
            </p>
        </div>

        {/* Content */}
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Code Display */}
            <div className="text-center">
              <div className="bg-nexus-bg-primary p-8 rounded-lg border-2 border-nexus-border inline-block mb-4">
                {/* Placeholder for QR Code - Using pattern for demo */}
                <div 
                  className="bg-black relative"
                  style={{
                    width: qrSizes[qrSize].size,
                    height: qrSizes[qrSize].size,
                    backgroundImage: `
                      repeating-linear-gradient(0deg, transparent, transparent 8px, black 8px, black 16px),
                      repeating-linear-gradient(90deg, transparent, transparent 8px, black 8px, black 16px)
                    `,
                    backgroundSize: '16px 16px'
                  }}
                >
                  {/* Corner markers */}
                  <div className="absolute top-2 left-2 w-8 h-8 bg-white border-4 border-black"></div>
                  <div className="absolute top-2 right-2 w-8 h-8 bg-white border-4 border-black"></div>
                  <div className="absolute bottom-2 left-2 w-8 h-8 bg-white border-4 border-black"></div>
                  
                  {/* Center pattern */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white border-4 border-black">
                    <div className="w-full h-full bg-black"></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-nexus-text-primary">
                  サイズ: {qrSizes[qrSize].label}
                </p>
                <p className="text-xs text-nexus-text-secondary">
                  商品ID: {itemId}
                </p>
              </div>
            </div>

            {/* Controls and Information */}
            <div className="space-y-6">
              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-nexus-text-primary mb-3">
                  QRコードサイズ
                </label>
                <div className="space-y-2">
                  {Object.entries(qrSizes).map(([key, config]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="radio"
                        name="qrSize"
                        value={key}
                        checked={qrSize === key}
                        onChange={(e) => setQrSize(e.target.value as any)}
                        className="h-4 w-4 text-purple-600 rounded"
                      />
                      <span className="ml-2 text-sm text-nexus-text-primary">
                        {config.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* QR Code Data */}
              <div>
                <label className="block text-sm font-medium text-nexus-text-primary mb-2">
                  QRコードデータ
                </label>
                <div className="bg-nexus-bg-secondary rounded-lg p-3 text-xs font-mono text-nexus-text-primary max-h-32 overflow-y-auto">
                  <pre>{JSON.stringify(qrData, null, 2)}</pre>
                </div>
                <button
                  onClick={handleCopyData}
                  className="mt-2 text-xs text-nexus-blue hover:text-nexus-blue-light transition-colors"
                >
                  データをコピー
                </button>
              </div>

              {/* Usage Information */}
              <div className="bg-nexus-blue/10 border border-nexus-blue/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-nexus-blue mb-2">
                  使用方法
                </h4>
                <ul className="text-sm text-nexus-blue space-y-1">
                  <li>• 商品ラベルに印刷して在庫管理に使用</li>
                  <li>• スマートフォンでスキャンして詳細確認</li>
                  <li>• 梱包時の商品確認に使用</li>
                  <li>• 配送ラベルと一緒に印刷可能</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between mt-6 pt-6 border-t border-nexus-border">
          <NexusButton
            onClick={onClose}
            variant="default"
          >
            閉じる
          </NexusButton>
          <div className="flex space-x-3">
            <NexusButton
              onClick={handleDownload}
              variant="secondary"
            >
              ダウンロード
            </NexusButton>
            <NexusButton
              onClick={handlePrint}
              variant="primary"
            >
              印刷
            </NexusButton>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}