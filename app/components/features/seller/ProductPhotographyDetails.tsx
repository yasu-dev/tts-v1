'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { PhotoIcon, EyeIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

interface ProductPhotographyDetailsProps {
  productId: string;
  status: string;
}

interface ProductImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  category?: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
}

interface PhotographyData {
  images: ProductImage[];
  photographyCompleted: boolean;
  photographyDate?: string;
  photographyBy?: string;
  notes?: string;
  photoSlots?: any[];
}

export default function ProductPhotographyDetails({ productId, status }: ProductPhotographyDetailsProps) {
  const [photographyData, setPhotographyData] = useState<PhotographyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotographyData();
  }, [productId]);

  const fetchPhotographyData = async () => {
    try {
      setLoading(true);
      
      // 商品の画像データを取得
      const [productResponse, imagesResponse] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch(`/api/products/${productId}/images`)
      ]);

      let images: ProductImage[] = [];
      let photographyCompleted = false;
      let photographyDate: string | undefined;
      let photographyBy: string | undefined;
      let notes: string | undefined;
      let photoSlots: any[] = [];

      // 商品情報から撮影メタデータを取得
      if (productResponse.ok) {
        const productData = await productResponse.json();
        
        if (productData.metadata) {
          try {
            const metadata = typeof productData.metadata === 'string' 
              ? JSON.parse(productData.metadata)
              : productData.metadata;
            
            photographyCompleted = metadata.photographyCompleted || false;
            photographyDate = metadata.photographyDate;
            photographyBy = metadata.photographyBy;
            photoSlots = metadata.photoSlots || [];
            
            // メタデータに写真が含まれている場合
            if (metadata.photos && Array.isArray(metadata.photos)) {
              images.push(...metadata.photos.map((photo: any, index: number) => ({
                id: `metadata_${index}`,
                url: typeof photo === 'string' ? photo : photo.url,
                filename: typeof photo === 'string' ? `photo_${index + 1}` : (photo.filename || `photo_${index + 1}`),
                category: typeof photo === 'object' ? photo.category : 'photography',
                description: typeof photo === 'object' ? photo.description : undefined,
                sortOrder: index,
                createdAt: photographyDate || new Date().toISOString(),
              })));
            }
          } catch (metadataError) {
            console.warn('メタデータの解析に失敗:', metadataError);
          }
        }

        // 検品ノートから撮影メモを抽出
        if (productData.inspectionNotes) {
          const notesMatch = productData.inspectionNotes.match(/【撮影メモ】\n(.+?)(?=\n【|$)/s);
          if (notesMatch) {
            notes = notesMatch[1].trim();
          }
        }
      }

      // ProductImageテーブルからの画像を取得
      if (imagesResponse.ok) {
        const imageData = await imagesResponse.json();
        if (imageData.images && Array.isArray(imageData.images)) {
          images.push(...imageData.images);
        }
      }

      // 重複を除去し、ソート順で並び替え
      const uniqueImages = images.filter((image, index, self) => 
        index === self.findIndex(i => i.url === image.url)
      ).sort((a, b) => a.sortOrder - b.sortOrder);

      setPhotographyData({
        images: uniqueImages,
        photographyCompleted,
        photographyDate,
        photographyBy,
        notes,
        photoSlots,
      });

    } catch (error) {
      console.error('撮影データ取得エラー:', error);
      setError('撮影データの取得に失敗しました');
      
      // エラー時は空のデータを設定
      setPhotographyData({
        images: [],
        photographyCompleted: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBasedMessage = () => {
    if (status === 'inbound' || status === 'pending_inspection') {
      return '撮影前のため、まだ画像は登録されていません';
    }
    if (status === 'inspecting') {
      return '検品中のため、撮影が完了していない可能性があります';
    }
    if (status === 'completed' || status === 'storage') {
      return '撮影完了済み';
    }
    return '撮影状況を確認中';
  };

  const categorizeImages = (images: ProductImage[]) => {
    const categories: Record<string, ProductImage[]> = {};
    
    images.forEach(image => {
      const category = image.category || 'その他';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(image);
    });

    return categories;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>撮影画像</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>撮影画像</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categorizedImages = categorizeImages(photographyData?.images || []);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>撮影画像</CardTitle>
            <div className="flex items-center gap-2">
              {photographyData?.photographyCompleted && (
                <Badge variant="secondary" className="text-xs">撮影完了</Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {photographyData?.images.length || 0}枚
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getStatusBasedMessage()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {photographyData?.images.length === 0 ? (
            <div className="text-center py-12">
              <PhotoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">撮影画像がありません</p>
              <p className="text-xs text-gray-400 mt-2">{getStatusBasedMessage()}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(categorizedImages).map(([category, images]) => (
                <div key={category}>
                  <h4 className="font-semibold text-sm text-gray-700 mb-3 border-b pb-1">
                    {category} ({images.length}枚)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                        onClick={() => setSelectedImage(image.url)}
                      >
                        <Image
                          src={image.thumbnailUrl || image.url}
                          alt={image.description || image.filename}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                          <EyeIcon className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                        </div>
                        {image.description && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2">
                            <p className="truncate">{image.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {photographyData?.notes && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">撮影メモ</h4>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {photographyData.notes}
                </p>
              </div>
            </div>
          )}

          {photographyData?.photographyBy && (
            <div className="text-xs text-gray-500 border-t pt-3">
              撮影者: {photographyData.photographyBy}
              {photographyData.photographyDate && (
                <span> | {new Date(photographyData.photographyDate).toLocaleDateString('ja-JP')}</span>
              )}
              {photographyData.photoSlots && photographyData.photoSlots.length > 0 && (
                <span> | 配置スロット: {photographyData.photoSlots.length}個</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 画像拡大表示モーダル */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-4xl w-full h-full m-4">
            <Image
              src={selectedImage}
              alt="拡大画像"
              fill
              className="object-contain"
              sizes="100vw"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
