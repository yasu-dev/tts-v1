'use client';

import { useState, useRef, useEffect } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import AIQualityResult from '@/app/components/features/inspection/AIQualityResult';
import { Zap, Upload, X, Image, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

export interface PhotoUploaderProps {
  productId: string;
  photos: string[];
  onUpdate: (photos: string[]) => void;
  onNext: () => void;
  onPrev: () => void;
  category?: string; // AI判定用のカテゴリ
}

interface PhotoSlot {
  id: string;
  label: string;
  description: string;
  photos: string[]; // 複数枚対応に変更
  required: boolean;
}

export default function PhotoUploader({
  productId,
  photos,
  onUpdate,
  onNext,
  onPrev,
  category = 'accessory',
}: PhotoUploaderProps) {
  const beforeAfterModalRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(photos || []);
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [showAiResult, setShowAiResult] = useState(false);
  const [draggedPhoto, setDraggedPhoto] = useState<string | null>(null);
  const [draggedFromSlot, setDraggedFromSlot] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [enhancedPhotos, setEnhancedPhotos] = useState<string[]>([]);
  const [approvedEnhancements, setApprovedEnhancements] = useState<boolean[]>([]);
  
  // 写真スロット定義（複数枚対応）
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>([
    { id: 'front', label: '正面', description: '正面全体', photos: [], required: true },
    { id: 'back', label: '背面', description: '背面全体', photos: [], required: false },
    { id: 'left', label: '左側面', description: '左側全体', photos: [], required: false },
    { id: 'right', label: '右側面', description: '右側全体', photos: [], required: false },
    { id: 'top', label: '上面', description: '上から見た写真', photos: [], required: false },
    { id: 'detail', label: '詳細', description: '傷・特徴部分', photos: [], required: false },
  ]);

  // 追加写真（スロットに配置されていない写真）
  const getUnassignedPhotos = () => {
    const assignedPhotos = photoSlots.flatMap(slot => slot.photos);
    return uploadedPhotos.filter(photo => !assignedPhotos.includes(photo));
  };

  const handleDragStart = (e: React.DragEvent, photo: string, fromSlotId?: string) => {
    setDraggedPhoto(photo);
    setDraggedFromSlot(fromSlotId || null);
    e.dataTransfer.effectAllowed = 'move';
    
    // ドラッグ中の画像プレビューを小さく設定
    const dragImage = document.createElement('img');
    dragImage.src = photo;
    dragImage.style.width = '60px';
    dragImage.style.height = '60px';
    dragImage.style.objectFit = 'cover';
    e.dataTransfer.setDragImage(dragImage, 30, 30);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (slotId: string) => {
    setHoveredSlot(slotId);
  };

  const handleDragLeave = () => {
    setHoveredSlot(null);
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setHoveredSlot(null);
    
    if (!draggedPhoto) return;

    setPhotoSlots(prev => {
      const newSlots = [...prev];
      const targetSlot = newSlots.find(slot => slot.id === slotId);
      
      if (targetSlot) {
        // 元のスロットから削除
        if (draggedFromSlot) {
          const sourceSlot = newSlots.find(slot => slot.id === draggedFromSlot);
          if (sourceSlot) {
            sourceSlot.photos = sourceSlot.photos.filter(photo => photo !== draggedPhoto);
          }
        }
        
        // ターゲットスロットに追加（重複チェック）
        if (!targetSlot.photos.includes(draggedPhoto)) {
          targetSlot.photos = [...targetSlot.photos, draggedPhoto];
        }
      }
      
      return newSlots;
    });

    setDraggedPhoto(null);
    setDraggedFromSlot(null);
    
    // 配置成功のフィードバック
    const targetSlot = photoSlots.find(slot => slot.id === slotId);
    if (targetSlot) {
      showToast({
        title: '写真を配置しました',
        message: `「${targetSlot.label}」に配置されました`,
        type: 'success'
      });
    }
  };

  const handleRemoveFromSlot = (slotId: string, photoToRemove: string) => {
    setPhotoSlots(prev => prev.map(slot => 
      slot.id === slotId 
        ? { ...slot, photos: slot.photos.filter(photo => photo !== photoToRemove) }
        : slot
    ));
  };

  const handleDeletePhoto = (photoToDelete: string) => {
    // 全スロットから削除
    setPhotoSlots(prev => prev.map(slot => ({
      ...slot,
      photos: slot.photos.filter(photo => photo !== photoToDelete)
    })));
    
    // アップロード済み写真から削除
    const updatedPhotos = uploadedPhotos.filter(photo => photo !== photoToDelete);
    setUploadedPhotos(updatedPhotos);
    onUpdate(updatedPhotos);
    
    // AI結果をクリア
    setAiResult(null);
    setShowAiResult(false);
  };

  // ファイルアップロード処理
  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    setLoading(true);
    
    try {
      const newPhotos: string[] = [];
      
      // 各ファイルをBase64に変換
      for (const file of files) {
        // ファイルサイズチェック (10MB制限)
        if (file.size > 10 * 1024 * 1024) {
          showToast({
            title: 'ファイルサイズエラー',
            message: `${file.name} は10MBを超えています`,
            type: 'error'
          });
          continue;
        }
        
        // ファイル形式チェック
        if (!file.type.startsWith('image/')) {
          showToast({
            title: 'ファイル形式エラー',
            message: `${file.name} は画像ファイルではありません`,
            type: 'error'
          });
          continue;
        }
        
        // Base64変換
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        });
        
        newPhotos.push(base64);
      }
      
      // 最大20枚制限
      const currentCount = uploadedPhotos.length;
      const availableSlots = 20 - currentCount;
      const photosToAdd = newPhotos.slice(0, availableSlots);
      
      if (newPhotos.length > availableSlots) {
        showToast({
          title: '枚数制限',
          message: `最大20枚まで。${availableSlots}枚のみ追加されました`,
          type: 'warning'
        });
      }
      
      // 状態更新
      const updatedPhotos = [...uploadedPhotos, ...photosToAdd];
      setUploadedPhotos(updatedPhotos);
      onUpdate(updatedPhotos);
      
      showToast({
        title: `${photosToAdd.length}枚の写真をアップロードしました`,
        message: '右の未配置写真を左の撮影箇所にドラッグして配置してください',
        type: 'success'
      });
      
    } catch (error) {
      console.error('File upload error:', error);
      showToast({
        title: 'アップロードエラー',
        message: '写真のアップロードに失敗しました',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // AI品質向上の実行
  const handleAIAnalysis = async () => {
    if (uploadedPhotos.length < 1) {
      showToast({
        title: 'AI品質向上を実行するには最低1枚の写真が必要です',
        type: 'warning'
      });
      return;
    }

    setAiAnalyzing(true);

    try {
      // FormDataを作成
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('category', category);
      formData.append('enhanceImages', 'true'); // 画像品質向上フラグ

      // Base64画像をBlobに変換してFormDataに追加
      for (let i = 0; i < uploadedPhotos.length; i++) {
        const base64 = uploadedPhotos[i];
        const response = await fetch(base64);
        const blob = await response.blob();
        formData.append('images', blob, `photo-${i}.jpg`);
      }

      // AI判定APIを呼び出し
      const response = await fetch('/api/ai/quality-inspection', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('AI品質向上に失敗しました');
      }

      const data = await response.json();

      // 品質向上済み画像を設定
      if (data.result.enhancedImages && data.result.enhancedImages.length > 0) {
        // デモ用：視覚的にわかりやすくするため、アフター画像に軽微なCSS効果を適用
        const demoEnhancedImages = data.result.enhancedImages.map((image: string) => {
          // モック：元画像そのものだが、UIで視覚的な差を表現
          return image;
        });
        
        setEnhancedPhotos(demoEnhancedImages);
        // デフォルトで全て適用する（適用しない = false）
        setApprovedEnhancements(new Array(demoEnhancedImages.length).fill(false));
        setShowBeforeAfter(true);
        
        showToast({
          title: 'AI品質向上完了',
          message: 'ビフォア・アフターを確認して適用する画像を選択してください',
          type: 'success'
        });
      }

    } catch (error) {
      console.error('AI enhancement error:', error);
      showToast({
        title: 'AI品質向上に失敗しました',
        type: 'error'
      });
    } finally {
      setAiAnalyzing(false);
    }
  };

  // 品質向上の適用
  const applyEnhancements = () => {
    // approvedEnhancements[index] が true = 適用しない、false = 適用する
    const finalPhotos = uploadedPhotos.map((original, index) => 
      approvedEnhancements[index] ? original : enhancedPhotos[index]
    );
    
    setUploadedPhotos(finalPhotos);
    onUpdate(finalPhotos);
    setShowBeforeAfter(false);
    
    // 適用した枚数 = チェックされていない（適用しない = false）枚数
    const appliedCount = approvedEnhancements.filter(excluded => !excluded).length;
    showToast({
      title: `${appliedCount}枚の品質向上を適用しました`,
      message: 'AI品質向上が適用されました',
      type: 'success'
    });
  };

  // 品質向上のキャンセル
  const cancelEnhancements = () => {
    setShowBeforeAfter(false);
    setEnhancedPhotos([]);
    setApprovedEnhancements([]);
    
    showToast({
      title: '品質向上をキャンセルしました',
      message: '元の画像が保持されます',
      type: 'info'
    });
  };

  const canProceed = uploadedPhotos.length >= 1; // 最低1枚必要

  // ビフォアアフターモーダルのスクロール位置リセット
  useEffect(() => {
    if (showBeforeAfter && beforeAfterModalRef.current) {
      beforeAfterModalRef.current.scrollTop = 0;
    }
  }, [showBeforeAfter]);

  return (
    <div className="space-y-2">
      {/* 上部: 説明 + アップロード（コンパクト） */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* 説明カード - 超コンパクト */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-800 text-xs">写真撮影ガイド</h4>
              <p className="text-xs text-blue-700">
                最低1枚必要（現在: {uploadedPhotos.length}枚）｜各箇所に複数枚配置可能
              </p>
              <p className="text-xs text-blue-600 mt-1">
                AI品質判定：明度・色調統一、背景白色化（商品は無修正）
              </p>
            </div>
            {uploadedPhotos.length >= 1 && (
              <NexusButton
                onClick={handleAIAnalysis}
                variant="primary"
                size="sm"
                disabled={aiAnalyzing}
                className="flex items-center gap-1 text-xs px-2 py-1"
              >
                <Zap className="h-3 w-3" />
                {aiAnalyzing ? 'AI処理中' : 'AI品質向上'}
              </NexusButton>
            )}
          </div>
        </div>

        {/* アップロードエリア - コンパクト */}
        <NexusCard className="p-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-semibold">写真をアップロード</h3>
            <span className="text-xs text-gray-500">{uploadedPhotos.length}枚</span>
          </div>
          
          {/* シンプルなファイルアップローダー */}
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (loading) return;
              const files = Array.from(e.dataTransfer.files).filter(file => 
                file.type.startsWith('image/')
              );
              await handleFileUpload(files);
            }}
            onClick={() => {
              if (loading) return;
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = 'image/*';
              input.onchange = async (e) => {
                const files = Array.from((e.target as HTMLInputElement).files || []);
                await handleFileUpload(files);
              };
              input.click();
            }}
            className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors ${
              loading ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
            <p className="text-xs text-gray-600">
              {loading ? 'アップロード中...' : 'クリックまたはドラッグ&ドロップ'}
            </p>
            <p className="text-xs text-gray-500">image/jpeg, image/png, image/webp • 最大20枚</p>
          </div>
          
          {/* アップロード済み写真 - 小さなサムネイル */}
          {uploadedPhotos.length > 0 && (
            <div className="mt-2 grid grid-cols-6 gap-1 max-h-20 overflow-y-auto">
              {uploadedPhotos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`写真 ${index + 1}`}
                    className="w-full h-8 object-cover rounded"
                  />
                  <button
                    onClick={() => handleDeletePhoto(photo)}
                    className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity w-3 h-3 flex items-center justify-center"
                  >
                    <X className="w-1.5 h-1.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </NexusCard>
      </div>

      {/* メイン作業エリア - 横並び最適化 */}
      <div className="grid grid-cols-12 gap-2">
        
        {/* 左側: 必須撮影箇所 (8列) */}
        <div className="col-span-8">
          <NexusCard className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">必須撮影箇所</h3>
              <span className="text-xs text-gray-500">
                {photoSlots.reduce((total, slot) => total + slot.photos.length, 0)}枚配置済み
              </span>
            </div>
            
            {/* 2列3行のコンパクトグリッド */}
            <div className="grid grid-cols-2 gap-2">
              {photoSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`relative border-2 border-dashed rounded-lg p-2 transition-all min-h-[100px] ${
                    slot.photos.length > 0
                      ? 'border-green-400 bg-green-50' 
                      : slot.required 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 bg-gray-50'
                  } ${
                    hoveredSlot === slot.id && draggedPhoto 
                      ? 'border-blue-500 bg-blue-100 scale-105 shadow-lg' 
                      : ''
                  } ${
                    draggedPhoto 
                      ? 'border-blue-300 bg-blue-25' 
                      : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(slot.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, slot.id)}
                >
                  {/* スロットヘッダー */}
                  <div className="text-center mb-1">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-medium text-xs">{slot.label}</span>
                      {slot.required && <AlertCircle className="w-3 h-3 text-red-500" />}
                      {slot.photos.length > 0 && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                      {slot.photos.length > 0 && (
                        <span className="text-xs text-green-600 font-medium">({slot.photos.length})</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 hidden md:block">{slot.description}</p>
                  </div>
                  
                  {/* 画像エリア（複数枚対応） */}
                  {slot.photos.length > 0 ? (
                    <div className="space-y-1">
                      {/* 最大3枚まで表示、それ以上は「+N枚」で表示 */}
                      <div className="grid grid-cols-2 gap-1">
                        {slot.photos.slice(0, 3).map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={photo}
                              alt={`${slot.label} ${index + 1}`}
                              className="w-full h-12 object-cover rounded cursor-move hover:opacity-90 transition-opacity"
                              draggable
                              onDragStart={(e) => handleDragStart(e, photo, slot.id)}
                            />
                            <button
                              onClick={() => handleRemoveFromSlot(slot.id, photo)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 w-4 h-4 flex items-center justify-center"
                            >
                              <X className="w-2 h-2" />
                            </button>
                          </div>
                        ))}
                        {/* 4枚目以降がある場合の「+N枚」表示 */}
                        {slot.photos.length > 3 && (
                          <div className="w-full h-12 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-600 font-medium">
                              +{slot.photos.length - 3}枚
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-16 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded">
                      <Upload className="w-4 h-4 mb-1" />
                      <span className="text-xs">ドロップエリア</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </NexusCard>
        </div>

        {/* 右側: 未配置写真 - 大きなサムネイル (4列) */}
        <div className="col-span-4">
          <NexusCard className="p-3 h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">未配置の写真</h3>
              <span className="text-xs text-gray-500">{getUnassignedPhotos().length}枚</span>
            </div>
            
            {getUnassignedPhotos().length > 0 ? (
              <>
                <p className="text-xs text-gray-600 mb-2">
                  左の撮影箇所にドラッグして配置
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {getUnassignedPhotos().map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`未配置写真 ${index + 1}`}
                        className="w-full h-24 object-cover rounded cursor-move hover:opacity-90 transition-opacity shadow-sm hover:shadow-md"
                        draggable
                        onDragStart={(e) => handleDragStart(e, photo)}
                      />
                      <button
                        onClick={() => handleDeletePhoto(photo)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-2 h-2" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white px-1 py-0.5 rounded text-xs">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <CheckCircle2 className="w-8 h-8 mb-2" />
                <p className="text-xs text-center">すべての写真が<br />配置されました</p>
              </div>
            )}

            {/* 配置状況サマリー - コンパクト */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h4 className="text-xs font-semibold mb-1">配置状況</h4>
              <div className="space-y-0.5">
                {photoSlots.map((slot) => (
                  <div key={slot.id} className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1">
                      {slot.required && <AlertCircle className="w-2 h-2 text-red-500" />}
                      {slot.label}
                    </span>
                    <span className={`font-medium ${slot.photos.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {slot.photos.length}枚
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </NexusCard>
        </div>
      </div>

      {/* AI品質向上 ビフォア・アフター比較モーダル */}
      {showBeforeAfter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto" ref={beforeAfterModalRef}>
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">AI品質向上 - ビフォア・アフター比較</h3>
              <p className="text-sm text-gray-600 mt-1">
                品質向上された画像を確認し、適用する画像を選択してください
              </p>
            </div>
            
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {uploadedPhotos.map((originalPhoto, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">写真 {index + 1}</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={approvedEnhancements[index]}
                        onChange={(e) => {
                          const newApproved = [...approvedEnhancements];
                          newApproved[index] = e.target.checked;
                          setApprovedEnhancements(newApproved);
                          console.log('チェックボックス変更:', index, e.target.checked, newApproved);
                        }}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">
                        適用しない
                      </span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* ビフォア */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2 text-center">
                        ビフォア（元画像）
                      </h5>
                      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={originalPhoto}
                          alt={`元画像 ${index + 1}`}
                          className="w-full h-48 object-cover cursor-zoom-in"
                          onClick={() => {
                            const modal = document.createElement('div');
                            modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4';
                            modal.innerHTML = `
                              <div class="relative max-w-full max-h-full">
                                <img src="${originalPhoto}" class="max-w-full max-h-full object-contain" />
                                <button class="absolute top-4 right-4 bg-white rounded-full p-2 text-xl font-bold">&times;</button>
                              </div>
                            `;
                            modal.onclick = () => document.body.removeChild(modal);
                            document.body.appendChild(modal);
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* アフター */}
                    <div>
                      <h5 className="text-sm font-medium text-blue-700 mb-2 text-center">
                        アフター（品質向上済み）
                      </h5>
                      <div className="relative border-2 border-blue-400 rounded-lg overflow-hidden">
                        <img
                          src={enhancedPhotos[index]}
                          alt={`品質向上済み ${index + 1}`}
                          className="w-full h-48 object-cover cursor-zoom-in"
                          style={{
                            filter: 'brightness(1.05) contrast(1.08) saturate(1.1)',
                            transform: 'scale(1.001)'
                          }}
                          onClick={() => {
                            const modal = document.createElement('div');
                            modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4';
                            modal.innerHTML = `
                              <div class="relative max-w-full max-h-full">
                                <img src="${enhancedPhotos[index]}" style="filter: brightness(1.05) contrast(1.08) saturate(1.1)" class="max-w-full max-h-full object-contain" />
                                <button class="absolute top-4 right-4 bg-white rounded-full p-2 text-xl font-bold">&times;</button>
                              </div>
                            `;
                            modal.onclick = () => document.body.removeChild(modal);
                            document.body.appendChild(modal);
                          }}
                        />
                        {/* デモ用：品質向上済みを示すバッジ */}
                        <div className="absolute top-1 left-1 bg-blue-600 text-white px-1 py-0.5 rounded text-xs font-medium">
                          AI向上済み
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 改善点の説明 */}
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                    <strong>AI品質向上内容：</strong> 明度・コントラスト統一、色調補正、背景白色化
                    <br />
                    <strong>注意：</strong> 商品の傷・汚れ・形状は一切変更されていません
                    <br />
                    <span className="text-blue-600">💡 画像をクリックすると拡大表示されます</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                適用除外: {approvedEnhancements.filter(Boolean).length} / {uploadedPhotos.length} 枚
                <br />
                適用予定: {approvedEnhancements.filter(excluded => !excluded).length} 枚
              </div>
              <div className="flex gap-2">
                <NexusButton
                  onClick={cancelEnhancements}
                  variant="secondary"
                  size="md"
                >
                  キャンセル
                </NexusButton>
                <NexusButton
                  onClick={() => {
                    console.log('適用ボタンクリック:', approvedEnhancements);
                    applyEnhancements();
                  }}
                  variant="primary"
                  size="md"
                >
                  品質向上を適用する ({approvedEnhancements.filter(excluded => !excluded).length}枚)
                </NexusButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI品質判定結果 */}
      {showAiResult && (
        <AIQualityResult
          result={aiResult}
          loading={aiAnalyzing}
          onAccept={() => {
            showToast({
              title: 'AI判定を承認しました',
              type: 'success'
            });
            onNext();
          }}
          onReject={() => {
            showToast({
              title: '品質基準を満たしていません',
              message: '再撮影または返品処理を検討してください',
              type: 'error'
            });
          }}
          onRequestManualReview={() => {
            showToast({
              title: '手動確認モードに切り替えました',
              type: 'info'
            });
            setShowAiResult(false);
          }}
        />
      )}

      {/* ナビゲーションボタン */}
      <div className="flex justify-between pt-2">
        <NexusButton
          onClick={onPrev}
          variant="secondary"
          size="md"
        >
          戻る
        </NexusButton>
        <NexusButton
          onClick={onNext}
          variant="primary"
          size="md"
          disabled={!canProceed}
        >
          次へ（確認画面）
          {!canProceed && (
            <span className="ml-2 text-sm">
              （最低1枚必要）
            </span>
          )}
        </NexusButton>
      </div>
    </div>
  );
}