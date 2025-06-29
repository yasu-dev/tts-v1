'use client';

import { useState, useCallback } from 'react';

interface ImageUploaderProps {
  productId: string;
  onUploadComplete?: (imageUrls: string[]) => void;
  minImages?: number;
  maxImages?: number;
}

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  preview: string;
}

export default function ImageUploader({ 
  productId, 
  onUploadComplete,
  minImages = 6,
  maxImages = 20 
}: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, []);

  const handleFiles = async (files: FileList) => {
    setError(null);
    
    // Validate file count
    const totalFiles = images.length + files.length;
    if (totalFiles > maxImages) {
      setError(`最大${maxImages}枚まで登録可能です`);
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const newImages: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!validTypes.includes(file.type)) {
        setError(`${file.name} は対応していない形式です。JPG, PNG, WebP形式を使用してください。`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError(`${file.name} はファイルサイズが大きすぎます。10MB以下にしてください。`);
        continue;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      
      const uploadedImage: UploadedImage = {
        id: `${Date.now()}-${i}`,
        url: preview, // Temporary URL, will be replaced after upload
        name: file.name,
        size: file.size,
        type: file.type,
        preview
      };

      newImages.push(uploadedImage);
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      
      // Simulate upload to S3 (in real implementation, this would be an actual upload)
      setUploading(true);
      try {
        // In production, implement actual S3 upload here
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update with "uploaded" URLs
        const uploadedUrls = newImages.map(img => `/uploads/${productId}/${img.name}`);
        if (onUploadComplete) {
          onUploadComplete([...images.map(i => i.url), ...uploadedUrls]);
        }
      } catch (err) {
        setError('アップロード中にエラーが発生しました');
      } finally {
        setUploading(false);
      }
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      if (onUploadComplete) {
        onUploadComplete(updated.map(img => img.url));
      }
      return updated;
    });
  };

  const getThumbnailSize = () => {
    if (images.length <= 6) return 'w-32 h-32';
    if (images.length <= 12) return 'w-24 h-24';
    return 'w-20 h-20';
  };

  return (
    <div className="intelligence-card global">
      <div className="p-8">
        <div className="mb-6">
          <h3 className="text-xl font-display font-bold text-nexus-text-primary">商品画像アップロード</h3>
          <p className="text-nexus-text-secondary mt-1">
            最低{minImages}枚、最大{maxImages}枚の画像をアップロード（JPG, PNG, WebP形式）
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`
            relative border-3 border-dashed rounded-xl p-8 text-center transition-all duration-300
            ${dragActive ? 'border-[#0064D2] bg-[#0064D2]/5' : 'border-nexus-border hover:border-[#0064D2]/50'}
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="image-upload"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleChange}
            className="hidden"
          />
          
          <label
            htmlFor="image-upload"
            className="cursor-pointer"
          >
            <div className="action-orb blue mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <p className="text-lg font-medium text-nexus-text-primary mb-2">
              クリックまたはドラッグ＆ドロップで画像をアップロード
            </p>
            <p className="text-sm text-nexus-text-secondary">
              {images.length}/{minImages}枚以上必要 (最大{maxImages}枚)
            </p>
          </label>

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-b-4 border-[#0064D2] rounded-full mx-auto mb-4"></div>
                <p className="text-nexus-text-primary font-medium">アップロード中...</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-nexus-text-primary">
                アップロード済み画像 ({images.length}枚)
              </h4>
              {images.length < minImages && (
                <span className="text-sm text-orange-600">
                  あと{minImages - images.length}枚必要です
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((image, index) => (
                <div key={image.id} className="relative group">
                  <div className={`${getThumbnailSize()} relative overflow-hidden rounded-lg border-2 border-nexus-border`}>
                    <img
                      src={image.preview}
                      alt={`商品画像 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <button
                        onClick={() => removeImage(image.id)}
                        className="text-white hover:text-red-400 transition-colors"
                        title="削除"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-1">
                    <p className="text-xs text-nexus-text-muted truncate">
                      {image.name}
                    </p>
                    <p className="text-xs text-nexus-text-muted">
                      {(image.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                  </div>
                  {index === 0 && (
                    <div className="absolute -top-2 -left-2 bg-[#0064D2] text-white text-xs px-2 py-1 rounded-full font-medium">
                      メイン
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-nexus-text-secondary">
            * メイン画像は自動的に最初の画像が設定されます
          </p>
          <button
            className={`nexus-button ${images.length >= minImages ? 'primary' : ''}`}
            disabled={images.length < minImages || uploading}
          >
            {uploading ? '処理中...' : `画像を確定 (${images.length}枚)`}
          </button>
        </div>
      </div>
    </div>
  );
}