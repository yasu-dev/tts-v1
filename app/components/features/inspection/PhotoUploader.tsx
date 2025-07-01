'use client';

import { useState, useRef } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';

interface PhotoUploaderProps {
  onComplete: (photos: string[]) => void;
  minPhotos: number;
  productCategory: string;
}

export default function PhotoUploader({
  onComplete,
  minPhotos,
  productCategory,
}: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoRequirements = {
    camera_body: [
      '正面',
      '背面',
      '上面',
      'マウント部',
      'センサー部',
      '液晶画面',
    ],
    lens: [
      '正面',
      '側面',
      'マウント部',
      '前玉',
      '後玉',
      '絞り羽根',
    ],
    watch: [
      '文字盤正面',
      '裏蓋',
      'ケース側面',
      'バンド全体',
      'バックル部',
      '動作確認',
    ],
    accessory: [
      '全体正面',
      '全体背面',
      '詳細部分1',
      '詳細部分2',
      '付属品',
      '状態確認',
    ],
  };

  const requirements = photoRequirements[productCategory as keyof typeof photoRequirements] || photoRequirements.accessory;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPhotos((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    if (photos.length < minPhotos) {
      alert(`最低${minPhotos}枚の写真が必要です`);
      return;
    }
    onComplete(photos);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">商品写真の撮影</h3>
        <p className="text-gray-600 text-sm">
          以下の角度から商品を撮影してください（最低{minPhotos}枚必須）
        </p>
      </div>

      {/* 撮影ガイド */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">撮影ガイド</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-blue-800">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center">
              <span className="inline-block w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center mr-2">
                {index + 1}
              </span>
              {req}
            </div>
          ))}
        </div>
      </div>

      {/* アップロードエリア（タブレット最適化） */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className="mt-4 text-gray-600">
          写真をドラッグ&ドロップまたはタップして選択
        </p>
        <p className="text-sm text-gray-500 mt-1">
          JPEG, PNG, HEIC形式対応
        </p>
      </div>

      {/* アップロード済み写真（グリッド表示） */}
      {photos.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">
            アップロード済み写真（{photos.length}枚）
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`商品写真 ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <NexusButton
          onClick={handleComplete}
          disabled={photos.length < minPhotos}
          className="px-6"
        >
          次へ（検品項目へ）
        </NexusButton>
      </div>
    </div>
  );
} 