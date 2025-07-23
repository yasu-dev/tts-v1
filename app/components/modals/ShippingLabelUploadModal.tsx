'use client';

import { useState, useRef, useEffect } from 'react';
import { BaseModal, NexusButton, NexusRadioGroup } from '../ui';
import { useToast } from '../features/notifications/ToastProvider';
import { 
  DocumentArrowUpIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ShippingLabelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  onUploadComplete?: (labelUrl: string, provider: 'seller' | 'worlddoor') => void;
}

export default function ShippingLabelUploadModal({
  isOpen,
  onClose,
  itemId,
  onUploadComplete
}: ShippingLabelUploadModalProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [provider, setProvider] = useState<'seller' | 'worlddoor'>('seller');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const providerOptions = [
    {
      value: 'seller',
      label: 'セラーが用意',
      description: 'セラーが他の配送業者システムで作成した伝票をアップロード'
    },
    {
      value: 'worlddoor',
      label: 'ワールドドア社が用意',
      description: 'スタッフが他の配送業者システムで作成した伝票をアップロード'
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // PDFまたは画像ファイルのみ許可
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        showToast({
          title: 'ファイル形式エラー',
          message: 'PDF、JPEG、PNGファイルのみアップロード可能です',
          type: 'error'
        });
        return;
      }

      // ファイルサイズチェック（10MB以下）
      if (file.size > 10 * 1024 * 1024) {
        showToast({
          title: 'ファイルサイズエラー',
          message: 'ファイルサイズは10MB以下にしてください',
          type: 'error'
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast({
        title: 'ファイルを選択してください',
        type: 'warning'
      });
      return;
    }

    setUploading(true);

    try {
      // FormDataを作成
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('itemId', itemId);
      formData.append('provider', provider);
      formData.append('type', 'shipping_label');

      // アップロードAPI呼び出し
      const response = await fetch('/api/shipping/label/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('アップロードに失敗しました');
      }

      const data = await response.json();
      setUploadedUrl(data.fileUrl);

      showToast({
        title: '伝票アップロード完了',
        message: '配送伝票が正常にアップロードされました',
        type: 'success'
      });

      // 親コンポーネントに通知
      if (onUploadComplete) {
        onUploadComplete(data.fileUrl, provider);
      }

      // 少し待ってからモーダルを閉じる
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Upload error:', error);
      showToast({
        title: 'アップロードエラー',
        message: '伝票のアップロードに失敗しました',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  // モーダルが閉じられたときにリセット
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setUploadedUrl(null);
      setProvider('seller');
    }
  }, [isOpen]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="配送伝票アップロード"
      size="md"
    >
      <div className="space-y-6">
        {/* 作成者選択 */}
        <div>
          <h3 className="text-lg font-semibold text-nexus-text-primary mb-4">
            伝票の作成者
          </h3>
          <NexusRadioGroup
            options={providerOptions}
            value={provider}
            onChange={(value) => setProvider(value as 'seller' | 'worlddoor')}
            name="provider"
          />
        </div>

        {/* ファイル選択エリア */}
        <div>
          <h3 className="text-lg font-semibold text-nexus-text-primary mb-4">
            伝票ファイルを選択
          </h3>
          
          {!uploadedUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-nexus-border rounded-lg p-8 text-center cursor-pointer hover:border-nexus-blue hover:bg-nexus-bg-secondary transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="space-y-3">
                  <DocumentTextIcon className="w-12 h-12 text-nexus-blue mx-auto" />
                  <div>
                    <p className="font-medium text-nexus-text-primary">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-nexus-text-secondary">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <p className="text-sm text-nexus-text-secondary">
                    クリックして別のファイルを選択
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <CloudArrowUpIcon className="w-12 h-12 text-nexus-text-secondary mx-auto" />
                  <div>
                    <p className="font-medium text-nexus-text-primary">
                      クリックしてファイルを選択
                    </p>
                    <p className="text-sm text-nexus-text-secondary">
                      またはドラッグ＆ドロップ
                    </p>
                  </div>
                  <p className="text-xs text-nexus-text-secondary">
                    PDF、JPEG、PNG（最大10MB）
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="font-medium text-green-800">
                アップロード完了
              </p>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end gap-3 pt-4 border-t border-nexus-border">
          <NexusButton
            onClick={onClose}
            variant="secondary"
            disabled={uploading}
          >
            キャンセル
          </NexusButton>
          <NexusButton
            onClick={handleUpload}
            variant="primary"
            disabled={!selectedFile || uploading || !!uploadedUrl}
            loading={uploading}
            icon={<DocumentArrowUpIcon className="w-5 h-5" />}
          >
            {uploading ? 'アップロード中...' : 'アップロード'}
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
} 