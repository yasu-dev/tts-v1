'use client';

import { useState } from 'react';
import { BaseModal, NexusButton, NexusRadioGroup } from './ui';
import { useToast } from './features/notifications/ToastProvider';
import { DocumentArrowDownIcon, PrinterIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

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

  const radioOptions = [
    { value: 'small', label: '小 (128px)', description: '商品ラベル用' },
    { value: 'medium', label: '中 (256px)', description: '標準サイズ' },
    { value: 'large', label: '大 (512px)', description: '印刷・掲示用' }
  ];

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
      size="lg"
      className="max-h-[90vh] overflow-hidden"
    >
      <div className="p-6">
        {/* Header Info */}
        <div className="mb-6">
          <p className="text-sm text-nexus-text-secondary">
            {itemName} ({itemSku})
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border-2 border-nexus-border shadow-sm">
              <div 
                className="bg-black relative mx-auto"
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
          </div>

          {/* Size Selection */}
          <div className="max-w-md mx-auto">
            <NexusRadioGroup
              name="qrSize"
              value={qrSize}
              onChange={(value) => setQrSize(value as 'small' | 'medium' | 'large')}
              options={radioOptions}
              label="QRコードサイズ"
              variant="nexus"
              size="md"
            />
          </div>

          {/* QR Code Data */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-nexus-text-primary">
                QRコードデータ
              </h4>
              <NexusButton
                onClick={handleCopyData}
                variant="default"
                size="sm"
                icon={<ClipboardDocumentIcon className="w-4 h-4" />}
              >
                コピー
              </NexusButton>
            </div>
            <div className="bg-nexus-bg-secondary rounded-lg p-3 text-xs font-mono text-nexus-text-primary">
              <pre>{JSON.stringify(qrData, null, 2)}</pre>
            </div>
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

        {/* Footer */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-nexus-border">
          <NexusButton
            onClick={onClose}
            variant="default"
          >
            閉じる
          </NexusButton>
          <NexusButton
            onClick={handleDownload}
            variant="secondary"
            icon={<DocumentArrowDownIcon className="w-4 h-4" />}
          >
            ダウンロード
          </NexusButton>
          <NexusButton
            onClick={handlePrint}
            variant="primary"
            icon={<PrinterIcon className="w-4 h-4" />}
          >
            印刷
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
}