'use client';

import { useState } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import NexusCard from '@/app/components/ui/NexusCard';
import EnhancedImageUploader from '@/app/components/features/EnhancedImageUploader';
import ImageUploader from '@/app/components/features/ImageUploader';

export default function TestImageUploadPage() {
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [showBasic, setShowBasic] = useState(false);

  const handleUploadComplete = (images: any[]) => {
    console.log('アップロード完了:', images);
    setUploadedImages(images);
  };

  return (
    <DashboardLayout userType="staff">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">画像アップロードテスト</h1>
          <p className="text-gray-600">
            Canvas APIを使用した画像リサイズ・最適化機能のテスト
          </p>
        </div>

        {/* 機能比較カード */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <NexusCard className="p-6">
            <h3 className="text-lg font-semibold mb-3">🚀 EnhancedImageUploader</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Canvas APIによる自動画像最適化
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                リアルタイムファイルサイズ削減表示
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                画像寸法の自動リサイズ（最大1920x1080）
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                サムネイル自動生成
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                アップロード進捗表示
              </li>
            </ul>
          </NexusCard>

          <NexusCard className="p-6">
            <h3 className="text-lg font-semibold mb-3">📷 従来のImageUploader</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                シンプルなドラッグ&ドロップ
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                基本的なファイルバリデーション
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                プレビュー表示
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                複数ファイル選択
              </li>
            </ul>
          </NexusCard>
        </div>

        {/* コンポーネント切り替え */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowBasic(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showBasic 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Enhanced版（推奨）
            </button>
            <button
              onClick={() => setShowBasic(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showBasic 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              従来版
            </button>
          </div>
        </div>

        {/* アップローダーコンポーネント */}
        <div className="mb-6">
          {!showBasic ? (
            <EnhancedImageUploader
              maxFiles={10}
              maxSize={10 * 1024 * 1024}
              acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
              onUpload={async (files) => {
                console.log('Uploading files:', files);
                // Simulate upload
                await new Promise(resolve => setTimeout(resolve, 1000));
                handleUploadComplete(files.map(file => ({
                  name: file.name,
                  size: file.size,
                  type: file.type
                })));
              }}
              enableEdit={true}
              enableWatermark={false}
            />
          ) : (
            <ImageUploader
              productId="test-product-123"
              onUploadComplete={(urls) => {
                console.log('Basic uploader完了:', urls);
              }}
              minImages={3}
              maxImages={10}
            />
          )}
        </div>

        {/* アップロード結果 */}
        {uploadedImages.length > 0 && (
          <NexusCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">アップロード結果</h3>
            <div className="space-y-2">
              {uploadedImages.map((image, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{image.name}</p>
                      <p className="text-sm text-gray-600">
                        元サイズ: {(image.size / 1024 / 1024).toFixed(2)}MB
                        {image.processedSize && (
                          <span className="text-green-600 ml-2">
                            → 最適化後: {(image.processedSize / 1024 / 1024).toFixed(2)}MB
                          </span>
                        )}
                      </p>
                      {image.width && (
                        <p className="text-sm text-gray-600">
                          寸法: {image.width}x{image.height}px
                        </p>
                      )}
                    </div>
                    {image.processedSize && (
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          {Math.round((1 - image.processedSize / image.size) * 100)}%
                        </p>
                        <p className="text-xs text-gray-600">削減</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </NexusCard>
        )}

        {/* 技術仕様 */}
        <NexusCard className="mt-6 p-6">
          <h3 className="text-lg font-semibold mb-4">技術仕様</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">対応フォーマット</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• JPEG / JPG</li>
                <li>• PNG</li>
                <li>• WebP</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">制限事項</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• 最大ファイルサイズ: 10MB/枚</li>
                <li>• 最大解像度: 1920x1080px（自動リサイズ）</li>
                <li>• 画質: 85%（JPEG変換時）</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              💡 <strong>ヒント:</strong> 高解像度の画像をアップロードすると、
              自動的に最適なサイズに変換され、ファイルサイズが大幅に削減されます。
              これにより、ストレージコストの削減と読み込み速度の向上が実現できます。
            </p>
          </div>
        </NexusCard>
      </div>
    </DashboardLayout>
  );
} 