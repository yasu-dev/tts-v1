'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { NexusButton } from '@/app/components/ui';
import { CameraIcon, EyeIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Download } from 'lucide-react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
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
    'closeup': 'クローズアップ',
    'internal_structure': '内部構造',
    'accessories': '付属品',
    'other': 'その他',
  };

  return itemMapping[itemId] || itemId;
};

// 固定表示順序配列の定義
const displayOrder = ['正面', '背面', '左側面', '右側面', '上面', '詳細'];

// 画像分類関数
const categorizeImages = (images: ProductImage[], photoSlots?: PhotoSlot[]) => {
  const categories: Record<string, ProductImage[]> = {};

  if (photoSlots && photoSlots.length > 0) {
    photoSlots.forEach(slot => {
      if (slot.photos && slot.photos.length > 0) {
        const slotCategory = slot.label;
        if (!categories[slotCategory]) {
          categories[slotCategory] = [];
        }

        slot.photos.forEach((photoUrl, index) => {
          categories[slotCategory].push({
            id: `slot_${slot.id}_${index}`,
            url: photoUrl,
            filename: `${slot.label}_${index + 1}`,
            category: slotCategory,
            description: `${slot.label}${slot.description ? ` - ${slot.description}` : ''}`,
            sortOrder: slot.required ? 0 : 1,
            createdAt: new Date().toISOString(),
          });
        });
      }
    });
  }

  if (images && images.length > 0) {
    const slotPhotos = photoSlots ? photoSlots.flatMap(slot => slot.photos || []) : [];
    const unassignedImages = images.filter(img => !slotPhotos.includes(img.url));

    if (unassignedImages.length > 0) {
      unassignedImages.forEach(image => {
        const category = image.category || 'その他';
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(image);
      });
    }
  }

  return categories;
};

// 固定順序に従って画像を並び替える関数
const getOrderedImages = (categorizedImages: Record<string, ProductImage[]>) => {
  const orderedImages: ProductImage[] = [];

  displayOrder.forEach(category => {
    if (categorizedImages[category] && categorizedImages[category].length > 0) {
      orderedImages.push(...categorizedImages[category]);
    }
  });

  Object.entries(categorizedImages).forEach(([category, images]) => {
    if (!displayOrder.includes(category) && images.length > 0) {
      orderedImages.push(...images);
    }
  });

  return orderedImages;
};

export default function ProductPhotographyDetails({ productId, status }: ProductPhotographyDetailsProps) {
  const [photographyData, setPhotographyData] = useState<PhotographyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [availableImages, setAvailableImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [downloadingImages, setDownloadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPhotographyData();
    fetchAvailableImages();
  }, [productId]);

  const fetchPhotographyData = async () => {
    try {
      setLoading(true);

      const productResponse = await fetch(`/api/products/${productId}`);

      let images: ProductImage[] = [];
      let photographyCompleted = false;
      let photographyDate: string | undefined;
      let photographyBy: string | undefined;
      let notes: string | undefined;
      let photoSlots: any[] = [];

      if (productResponse.ok) {
        const productData = await productResponse.json();

        const defaultPhotoSlots = [
          { id: 'front', label: '正面', description: '正面全体', photos: [], required: true },
          { id: 'back', label: '背面', description: '背面全体', photos: [], required: false },
          { id: 'left', label: '左側面', description: '左側全体', photos: [], required: false },
          { id: 'right', label: '右側面', description: '右側全体', photos: [], required: false },
          { id: 'top', label: '上面', description: '上から見た写真', photos: [], required: false },
          { id: 'detail', label: '詳細', description: '傷・特徴部分', photos: [], required: false },
        ];

        photoSlots.push(...defaultPhotoSlots);

        if (productData.deliveryPlanInfo?.photographyRequests) {
          const requests = productData.deliveryPlanInfo.photographyRequests;

          if (requests.specialPhotographyItems && Array.isArray(requests.specialPhotographyItems)) {
            const specialItems = requests.specialPhotographyItems.map((itemId: string) => ({
              id: `special_${itemId}`,
              label: getSpecialPhotographyItemName(itemId),
              description: `特殊撮影: ${getSpecialPhotographyItemName(itemId)}`,
              photos: [],
              required: true,
            }));

            photoSlots.push(...specialItems);
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

            if (metadata.photoSlots && Array.isArray(metadata.photoSlots)) {
              metadata.photoSlots.forEach((slot: any) => {
                const existingSlotIndex = photoSlots.findIndex(ps => ps.id === slot.id);
                if (existingSlotIndex !== -1 && slot.photos && slot.photos.length > 0) {
                  photoSlots[existingSlotIndex].photos = slot.photos;
                }
              });
            }

            if (metadata.photos && Array.isArray(metadata.photos)) {
              const photoPositionLabels = ['正面', '背面', '左側面', '右側面', '上面', '詳細'];

              metadata.photos.forEach((photo: any, index: number) => {
                const photoUrl = typeof photo === 'string' ? photo : photo.url;
                const positionLabel = index < photoPositionLabels.length ? photoPositionLabels[index] : photoPositionLabels[5];

                const photoItem = {
                  id: `metadata_${index}`,
                  url: photoUrl,
                  filename: typeof photo === 'string' ? `${positionLabel}_${index + 1}` : (photo.filename || `${positionLabel}_${index + 1}`),
                  category: positionLabel,
                  description: `${positionLabel}撮影`,
                  sortOrder: index,
                  createdAt: photographyDate || new Date().toISOString(),
                };

                images.push(photoItem);
              });
            }
          } catch (metadataError) {
            console.warn('メタデータの解析に失敗:', metadataError);
          }
        }

        if (productData.inspectionNotes) {
          const notesMatch = productData.inspectionNotes.match(/【撮影メモ】\n(.+?)(?=\n【|$)/s);
          if (notesMatch) {
            notes = notesMatch[1].trim();
          }
        }
      }

      setPhotographyData({
        images,
        photographyCompleted,
        photographyDate,
        photographyBy,
        notes,
        photoSlots,
      });

    } catch (error) {
      console.error('撮影データ取得エラー:', error);
      setError('撮影データの取得に失敗しました');

      setPhotographyData({
        images: [],
        photographyCompleted: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // 画像一覧を取得
  const fetchAvailableImages = async () => {
    setLoadingImages(true);
    try {
      const response = await fetch('/api/images/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableImages(data.images || []);
      } else {
        console.error('画像一覧の取得に失敗しました');
        setAvailableImages([]);
      }
    } catch (error) {
      console.error('画像一覧取得エラー:', error);
      setAvailableImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  // 画像選択の切り替え
  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  // 全選択/全解除
  const toggleSelectAll = () => {
    const categorizedImages = categorizeImages(photographyData?.images || [], photographyData?.photoSlots);
    const orderedImages = getOrderedImages(categorizedImages);
    const allImageIds = orderedImages.slice(0, 12).map(img => {
      const availableImage = availableImages.find(availImg =>
        availImg.filename === img.filename ||
        availImg.id === img.id ||
        (img.url && availImg.previewUrl && img.url.includes(availImg.id))
      );
      return availableImage?.id || img.id;
    });

    if (selectedImages.length === allImageIds.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(allImageIds);
    }
  };

  // 複数画像を個別にダウンロード
  const handleDownloadImages = async (imageIds?: string[]) => {
    const categorizedImages = categorizeImages(photographyData?.images || [], photographyData?.photoSlots);
    const orderedImages = getOrderedImages(categorizedImages);

    // 選択された画像、または選択がない場合は全画像を対象にする
    const targetImages = imageIds
      ? orderedImages.filter(img => {
          const availableImage = availableImages.find(availImg =>
            availImg.filename === img.filename ||
            availImg.id === img.id ||
            (img.url && availImg.previewUrl && img.url.includes(availImg.id))
          );
          const imageId = availableImage?.id || img.id;
          return imageIds.includes(imageId);
        })
      : (selectedImages.length > 0
          ? orderedImages.filter(img => {
              const availableImage = availableImages.find(availImg =>
                availImg.filename === img.filename ||
                availImg.id === img.id ||
                (img.url && availImg.previewUrl && img.url.includes(availImg.id))
              );
              const imageId = availableImage?.id || img.id;
              return selectedImages.includes(imageId);
            })
          : orderedImages);

    if (targetImages.length === 0) {
      showToast({
        type: 'warning',
        title: 'ダウンロード不可',
        message: 'ダウンロードする画像が選択されていません',
        duration: 3000
      });
      return;
    }

    setDownloadingImages(true);
    try {
      // 各画像を個別にダウンロード
      for (let i = 0; i < targetImages.length; i++) {
        const image = targetImages[i];
        if (image.url && image.url.startsWith('data:image/')) {
          // Base64データから画像をダウンロード
          const base64Data = image.url.split(',')[1];
          const mimeType = image.url.split(';')[0].split(':')[1];
          const extension = mimeType.split('/')[1] || 'jpg';

          // バイナリデータに変換
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let j = 0; j < byteCharacters.length; j++) {
            byteNumbers[j] = byteCharacters.charCodeAt(j);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${image.category || `画像${i + 1}`}.${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          // ダウンロード間隔を設ける
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      showToast({
        type: 'success',
        title: 'ダウンロード完了',
        message: `${targetImages.length}件の画像をダウンロードしました`,
        duration: 3000
      });
    } catch (error) {
      console.error('画像ダウンロードエラー:', error);
      showToast({
        type: 'error',
        title: 'ダウンロード失敗',
        message: error instanceof Error ? error.message : '画像のダウンロード中にエラーが発生しました',
        duration: 5000
      });
    } finally {
      setDownloadingImages(false);
    }
  };

  // 単一画像のダウンロード
  const handleDownloadSingleImage = async (imageId: string, filename: string) => {
    try {
      const categorizedImages = categorizeImages(photographyData?.images || [], photographyData?.photoSlots);
      const orderedImages = getOrderedImages(categorizedImages);

      // 対象の画像を見つける
      const targetImage = orderedImages.find(img => {
        const availableImage = availableImages.find(availImg =>
          availImg.filename === img.filename ||
          availImg.id === img.id ||
          (img.url && availImg.previewUrl && img.url.includes(availImg.id))
        );
        const id = availableImage?.id || img.id;
        return id === imageId;
      });

      if (!targetImage || !targetImage.url || !targetImage.url.startsWith('data:image/')) {
        throw new Error('画像データが見つかりません');
      }

      // Base64データから画像をダウンロード
      const base64Data = targetImage.url.split(',')[1];
      const mimeType = targetImage.url.split(';')[0].split(':')[1];
      const extension = mimeType.split('/')[1] || 'jpg';

      // バイナリデータに変換
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${targetImage.category || filename}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast({
        type: 'success',
        title: 'ダウンロード完了',
        message: `${targetImage.category || filename} をダウンロードしました`,
        duration: 3000
      });
    } catch (error) {
      console.error('単一画像ダウンロードエラー:', error);
      showToast({
        type: 'error',
        title: 'ダウンロード失敗',
        message: error instanceof Error ? error.message : '画像のダウンロード中にエラーが発生しました',
        duration: 5000
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>商品画像</CardTitle>
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
          <CardTitle>商品画像</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!photographyData) {
    return (
      <div className="text-center py-8 text-gray-500">商品画像がありません</div>
    );
  }

  const categorizedImages = categorizeImages(photographyData.images || [], photographyData.photoSlots);
  const orderedImages = getOrderedImages(categorizedImages);

  return (
    <div className="space-y-4">
      {orderedImages.length > 0 ? (
        <div className="space-y-4">
          {/* 全選択チェックボックス */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedImages.length === orderedImages.length && orderedImages.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-nexus-blue focus:ring-nexus-blue border-gray-300 rounded"
              />
              <span className="text-sm text-nexus-text-secondary">
                すべて選択 ({selectedImages.length}/{orderedImages.length})
              </span>
            </label>
            {selectedImages.length > 0 && (
              <NexusButton
                onClick={() => handleDownloadImages(selectedImages)}
                variant="primary"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                disabled={downloadingImages}
              >
                選択した画像をダウンロード ({selectedImages.length})
              </NexusButton>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {orderedImages.slice(0, 12).map((image) => {
              const availableImage = availableImages.find(img =>
                img.filename === image.filename ||
                img.id === image.id ||
                (image.url && img.previewUrl && image.url.includes(img.id))
              );
              const imageId = availableImage?.id || image.id;
              const hasData = availableImage?.hasData ?? true; // デフォルトでtrueに設定

              return (
                <div
                  key={image.id}
                  className={`relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedImages.includes(imageId)
                      ? 'ring-2 ring-nexus-blue bg-nexus-blue/10'
                      : 'hover:ring-2 hover:ring-nexus-blue'
                  }`}
                >
                  {/* チェックボックス */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(imageId)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleImageSelection(imageId);
                      }}
                      className="w-4 h-4 text-nexus-blue focus:ring-nexus-blue border-gray-300 rounded"
                    />
                  </div>

                  <div
                    className="w-full h-full"
                    onClick={() => setSelectedImage(image.url)}
                  >
                    {image.url?.startsWith('data:image/') ? (
                      <img
                        src={image.url}
                        alt={image.description || image.filename}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={image.thumbnailUrl || image.url}
                        alt={image.description || image.filename}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <NexusButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSingleImage(imageId, image.filename);
                        }}
                        variant="primary"
                        size="sm"
                        icon={<Download className="w-4 h-4" />}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        ダウンロード
                      </NexusButton>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 text-center">
                      <p className="truncate">{image.category}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 画像情報表示エリア */}
          <div className="bg-nexus-bg-secondary rounded-lg p-3">
            <div className="text-sm">
              <div className="space-y-1">
                <span className="block text-nexus-text-secondary">
                  利用可能な画像: {availableImages.filter(img => img.hasData).length}/{availableImages.length || orderedImages.length}件
                </span>
                <div className="flex space-x-4 text-xs">
                  <span className="text-green-600">
                    セラー: {availableImages.filter(img => img.hasData && img.source === 'seller').length}件
                  </span>
                  <span className="text-blue-600">
                    スタッフ撮影: {availableImages.filter(img => img.hasData && img.source === 'staff').length}件
                  </span>
                </div>
                {selectedImages.length > 0 && (
                  <span className="block text-nexus-blue font-medium">
                    選択中: {selectedImages.length}件
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">商品画像がありません</div>
      )}

      {/* 画像拡大表示モーダル */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-4xl w-full h-full m-4">
            {selectedImage?.startsWith('data:image/') ? (
              <img
                src={selectedImage}
                alt="拡大画像"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <Image
                src={selectedImage}
                alt="拡大画像"
                fill
                className="object-contain"
                sizes="100vw"
              />
            )}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}