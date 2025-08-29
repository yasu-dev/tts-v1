'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { CameraIcon, EyeIcon } from '@heroicons/react/24/outline';
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
  photoSlots?: PhotoSlot[];
}

interface PhotoSlot {
  id: string;
  label: string;
  description?: string;
  photos: string[];
  required: boolean;
}

// 特殊撮影項目の日本語名取得関数
const getSpecialPhotographyItemName = (itemId: string): string => {
  const itemMapping: Record<string, string> = {
    'diagonal_45': '斜め45度',
    'functional_details': '機能詳細',
    'accessories_individual': '付属品個別',
    'macro_closeup': 'マクロ接写',
    'lighting_studio': 'スタジオ照明',
    'background_white': '白背景',
    'packaging_box': '梱包状態',
    'serial_numbers': 'シリアル番号',
    'damage_focus': '損傷焦点',
    'comparison_size': 'サイズ比較',
  };
  
  return itemMapping[itemId] || itemId;
};

export default function ProductPhotographyDetails({ productId, status }: ProductPhotographyDetailsProps) {
  const [photographyData, setPhotographyData] = useState<PhotographyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotographyData();
  }, [productId]);

  useEffect(() => {
    // デバッグ用: photographyDataの状態をWindowに保存
    (window as any).debugPhotographyData = photographyData;
  }, [photographyData]);

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
        
        console.log('[DEBUG] ProductPhotographyDetails - productData全体:', productData);
        console.log('[DEBUG] ProductPhotographyDetails - deliveryPlanInfo:', productData.deliveryPlanInfo);
        
        // 基本的な必須撮影箇所を設定（PhotoUploaderと同じ定義）
        const defaultPhotoSlots = [
          { id: 'front', label: '正面', description: '正面全体', photos: [], required: true },
          { id: 'back', label: '背面', description: '背面全体', photos: [], required: false },
          { id: 'left', label: '左側面', description: '左側全体', photos: [], required: false },
          { id: 'right', label: '右側面', description: '右側全体', photos: [], required: false },
          { id: 'top', label: '上面', description: '上から見た写真', photos: [], required: false },
          { id: 'detail', label: '詳細', description: '傷・特徴部分', photos: [], required: false },
        ];
        
        console.log('[DEBUG] ProductPhotographyDetails - 基本撮影箇所設定:', defaultPhotoSlots);
        photoSlots.push(...defaultPhotoSlots);

        // 納品プラン情報から追加の撮影要望を取得
        if (productData.deliveryPlanInfo?.photographyRequests) {
          const requests = productData.deliveryPlanInfo.photographyRequests;
          console.log('[DEBUG] ProductPhotographyDetails - 追加撮影要望取得:', requests);
          
          // specialPhotographyItems を追加スロットに変換
          if (requests.specialPhotographyItems && Array.isArray(requests.specialPhotographyItems)) {
            const specialItems = requests.specialPhotographyItems.map((itemId: string) => ({
              id: `special_${itemId}`,
              label: getSpecialPhotographyItemName(itemId),
              description: `特殊撮影: ${getSpecialPhotographyItemName(itemId)}`,
              photos: [], 
              required: true,
            }));
            
            photoSlots.push(...specialItems);
            console.log('[DEBUG] ProductPhotographyDetails - 特殊撮影要望追加:', specialItems);
          }
        }
        
        if (productData.metadata) {
          try {
            const metadata = typeof productData.metadata === 'string' 
              ? JSON.parse(productData.metadata)
              : productData.metadata;
            
            photographyCompleted = metadata.photographyCompleted || false;
            photographyDate = metadata.photographyDate;
            photographyBy = metadata.photographyBy;
            
            // メタデータの photoSlots から実際の撮影画像を取得して既存のスロットに配置
            if (metadata.photoSlots && Array.isArray(metadata.photoSlots)) {
              console.log('[DEBUG] ProductPhotographyDetails - metadata.photoSlots:', metadata.photoSlots);
              
              metadata.photoSlots.forEach((slot: any) => {
                // 既存のデフォルトスロットに画像を配置
                const existingSlotIndex = photoSlots.findIndex(ps => ps.id === slot.id);
                if (existingSlotIndex !== -1 && slot.photos && slot.photos.length > 0) {
                  photoSlots[existingSlotIndex].photos = slot.photos;
                  console.log('[DEBUG] ProductPhotographyDetails - スロット画像配置:', {
                    slotId: slot.id,
                    label: photoSlots[existingSlotIndex].label,
                    photosCount: slot.photos.length
                  });
                }
              });
            }
            
            console.log('[DEBUG] ProductPhotographyDetails - 最終的なphotoSlots:', photoSlots);
            
            // メタデータに写真が含まれている場合、これらを基本撮影スロットに自動配置
            if (metadata.photos && Array.isArray(metadata.photos)) {
              console.log('[DEBUG] ProductPhotographyDetails - metadata写真データ:', metadata.photos.length);
              
              // 撮影された画像を基本スロット（正面、背面等）に自動配置
              metadata.photos.forEach((photo: any, index: number) => {
                const photoUrl = typeof photo === 'string' ? photo : photo.url;
                const photoItem = {
                  id: `metadata_${index}`,
                  url: photoUrl,
                  filename: typeof photo === 'string' ? `撮影画像_${index + 1}` : (photo.filename || `撮影画像_${index + 1}`),
                  category: 'photography',
                  description: `撮影画像 ${index + 1}`,
                  sortOrder: index,
                  createdAt: photographyDate || new Date().toISOString(),
                };
                
                images.push(photoItem);
                
                // 画像を適切なスロットに配置（順番に配置）
                if (index < photoSlots.length && photoSlots[index]) {
                  photoSlots[index].photos.push(photoUrl);
                  console.log('[DEBUG] ProductPhotographyDetails - 画像をスロットに配置:', {
                    slotLabel: photoSlots[index].label,
                    photoIndex: index,
                    photoUrl: photoUrl.substring(0, 50) + '...'
                  });
                }
              });
              
              console.log('[DEBUG] ProductPhotographyDetails - 画像配置後のphotoSlots:', photoSlots.map(s => ({
                label: s.label,
                photosCount: s.photos.length
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

  const categorizeImages = (images: ProductImage[], photoSlots?: PhotoSlot[]) => {
    const categories: Record<string, ProductImage[]> = {};
    
    // 通常の画像をカテゴリ別に分類
    images.forEach(image => {
      const category = image.category || 'その他';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(image);
    });

    // 必須撮影スロットからの画像を追加
    if (photoSlots && photoSlots.length > 0) {
      console.log('[DEBUG] categorizeImages - photoSlots処理開始:', photoSlots.length);
      photoSlots.forEach(slot => {
        console.log(`[DEBUG] categorizeImages - スロット処理: ${slot.id} (${slot.label}), 写真数: ${slot.photos?.length || 0}`);
        if (slot.photos && slot.photos.length > 0) {
          const slotCategory = slot.required 
            ? `必須撮影箇所: ${slot.label}` 
            : `撮影箇所: ${slot.label}`;
          if (!categories[slotCategory]) {
            categories[slotCategory] = [];
          }
          
          slot.photos.forEach((photoUrl, index) => {
            categories[slotCategory].push({
              id: `slot_${slot.id}_${index}`,
              url: photoUrl,
              filename: `${slot.label}_${index + 1}`,
              category: slotCategory,
              description: slot.required 
                ? `【必須】 ${slot.label}${slot.description ? ` - ${slot.description}` : ''}`
                : `${slot.label}${slot.description ? ` - ${slot.description}` : ''}`,
              sortOrder: index,
              createdAt: new Date().toISOString(),
            });
          });
        } else if (slot.required && slot.id.startsWith('special_')) {
          // 特別撮影スロット（画像なし）は「撮影待ち」として表示
          const slotCategory = `必須撮影箇所: ${slot.label}`;
          if (!categories[slotCategory]) {
            categories[slotCategory] = [];
          }
        }
      });
    }

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

  const categorizedImages = categorizeImages(photographyData?.images || [], photographyData?.photoSlots);

  return (
    <>
      <div className="space-y-6">
        {Object.entries(categorizedImages).map(([category, images]) => (
          <div key={category}>
            <h4 className="font-semibold text-sm text-gray-700 mb-3 border-b pb-1 flex items-center gap-2">
              {category.includes('必須撮影箇所') && (
                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold">必須</span>
              )}
              {category} ({images.length}枚)
            </h4>
            
            {images.length > 0 && (
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
                    {category.includes('必須撮影箇所') && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                        必須
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

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
