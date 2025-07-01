'use client';

import { useState, useRef } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import EnhancedImageUploader from '@/app/components/features/EnhancedImageUploader';

export interface PhotoUploaderProps {
  productId: string;
  photos: string[];
  onUpdate: (photos: string[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface PhotoRequirement {
  id: string;
  label: string;
  description: string;
  example?: string;
}

export default function PhotoUploader({
  productId,
  photos,
  onUpdate,
  onNext,
  onPrev,
}: PhotoUploaderProps) {
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(photos || []);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 写真要件（最低6枚）
  const photoRequirements: PhotoRequirement[] = [
    { id: 'front', label: '正面', description: '商品全体が見える正面からの写真' },
    { id: 'back', label: '背面', description: '背面全体が見える写真' },
    { id: 'left', label: '左側面', description: '左側から見た全体写真' },
    { id: 'right', label: '右側面', description: '右側から見た全体写真' },
    { id: 'top', label: '上面', description: '上から見た写真' },
    { id: 'detail', label: '詳細', description: '傷や特徴的な部分のクローズアップ' },
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      const newPhotos: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 画像をBase64に変換（実際はサーバーにアップロード）
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        newPhotos.push(base64);
      }

      const updatedPhotos = [...uploadedPhotos, ...newPhotos];
      setUploadedPhotos(updatedPhotos);
      onUpdate(updatedPhotos);
    } catch (error) {
      console.error('[ERROR] Photo upload:', error);
      alert('写真のアップロードに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = uploadedPhotos.filter((_, i) => i !== index);
    setUploadedPhotos(updatedPhotos);
    onUpdate(updatedPhotos);
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const canProceed = uploadedPhotos.length >= 6;

  return (
    <div className="space-y-6">
      {/* 説明カード */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">📸</span>
          <div>
            <h4 className="font-semibold text-blue-800">写真撮影ガイドライン</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• 最低6枚の写真が必要です（現在: {uploadedPhotos.length}枚）</li>
              <li>• 明るい場所で撮影してください</li>
              <li>• ピントを合わせて鮮明に撮影してください</li>
              <li>• 傷や汚れがある場合は、その部分も撮影してください</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 写真要件グリッド */}
      <NexusCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">必須撮影箇所</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photoRequirements.map((req, index) => (
            <div
              key={req.id}
              className={`p-4 rounded-lg border-2 ${
                index < uploadedPhotos.length
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{req.label}</span>
                {index < uploadedPhotos.length && (
                  <span className="text-green-600">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-600">{req.description}</p>
            </div>
          ))}
        </div>
      </NexusCard>

      {/* 画像アップローダー（タブレット最適化） */}
      <NexusCard className="p-6">
        <div className="space-y-4">
          {/* カメラ撮影ボタン（タブレット用） */}
          <div className="flex justify-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <NexusButton
              onClick={handleCameraCapture}
              variant="primary"
              size="lg"
              disabled={loading}
              className="px-8 py-4 text-lg"
            >
              <span className="mr-2">📷</span>
              カメラで撮影
            </NexusButton>
          </div>

          {/* または既存のアップローダーを使用 */}
          <div className="text-center text-gray-500 my-4">または</div>

          {/* EnhancedImageUploader コンポーネント */}
          <EnhancedImageUploader
            onUploadComplete={(processedImages) => {
              const urls = processedImages.map(img => img.url);
              const updatedPhotos = [...uploadedPhotos, ...urls];
              setUploadedPhotos(updatedPhotos);
              onUpdate(updatedPhotos);
            }}
            maxImages={12}
            productId={productId}
          />
        </div>
      </NexusCard>

      {/* アップロード済み写真一覧 */}
      {uploadedPhotos.length > 0 && (
        <NexusCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            アップロード済み写真（{uploadedPhotos.length}枚）
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`商品写真 ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {index < photoRequirements.length
                    ? photoRequirements[index].label
                    : `追加写真 ${index - photoRequirements.length + 1}`}
                </div>
              </div>
            ))}
          </div>
        </NexusCard>
      )}

      {/* ナビゲーションボタン */}
      <div className="flex justify-between pt-4">
        <NexusButton
          onClick={onPrev}
          variant="secondary"
          size="lg"
        >
          戻る
        </NexusButton>
        <NexusButton
          onClick={onNext}
          variant="primary"
          size="lg"
          disabled={!canProceed}
        >
          次へ（確認画面）
          {!canProceed && (
            <span className="ml-2 text-sm">
              （あと{6 - uploadedPhotos.length}枚必要）
            </span>
          )}
        </NexusButton>
      </div>
    </div>
  );
} 