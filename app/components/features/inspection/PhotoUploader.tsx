'use client';

import { useState, useRef } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import EnhancedImageUploader from '@/app/components/features/EnhancedImageUploader';
import AIQualityResult from '@/app/components/features/inspection/AIQualityResult';
import { Zap } from 'lucide-react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

export interface PhotoUploaderProps {
  productId: string;
  photos: string[];
  onUpdate: (photos: string[]) => void;
  onNext: () => void;
  onPrev: () => void;
  category?: string; // AI判定用のカテゴリ
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
  category = 'accessory',
}: PhotoUploaderProps) {
  const { showToast } = useToast();
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(photos || []);
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [showAiResult, setShowAiResult] = useState(false);
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
    // 写真が変更されたらAI結果をクリア
    setAiResult(null);
    setShowAiResult(false);
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // AI品質判定の実行
  const handleAIAnalysis = async () => {
    if (uploadedPhotos.length < 6) {
      showToast({
        title: 'AI判定を実行するには最低6枚の写真が必要です',
        type: 'warning'
      });
      return;
    }

    setAiAnalyzing(true);
    setShowAiResult(true);

    try {
      // FormDataを作成
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('category', category);

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
        throw new Error('AI判定に失敗しました');
      }

      const data = await response.json();
      setAiResult(data.result);

      // 判定結果に応じてトースト通知
      if (data.result.qualityGrade === 'S' || data.result.qualityGrade === 'A') {
        showToast({
          title: '優良品質です！',
          message: `品質グレード: ${data.result.qualityGrade}`,
          type: 'success'
        });
      } else if (data.result.requiresManualReview) {
        showToast({
          title: '手動確認を推奨します',
          message: `品質グレード: ${data.result.qualityGrade}`,
          type: 'warning'
        });
      }

    } catch (error) {
      console.error('AI analysis error:', error);
      showToast({
        title: 'AI品質判定に失敗しました',
        type: 'error'
      });
    } finally {
      setAiAnalyzing(false);
    }
  };

  const canProceed = uploadedPhotos.length >= 6;

  return (
    <div className="space-y-6">
      {/* 説明カード */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="w-8 h-8 mr-3 text-blue-600 flex-shrink-0">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800">写真撮影ガイドライン</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• 最低6枚の写真が必要です（現在: {uploadedPhotos.length}枚）</li>
              <li>• 明るい場所で撮影してください</li>
              <li>• ピントを合わせて鮮明に撮影してください</li>
              <li>• 傷や汚れがある場合は、その部分も撮影してください</li>
              <li>• AI品質判定で自動的に品質を評価できます</li>
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
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
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
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              カメラで撮影
            </NexusButton>
          </div>

          {/* または既存のアップローダーを使用 */}
          <div className="text-center text-gray-500 my-4">または</div>

          {/* EnhancedImageUploader コンポーネント */}
          <EnhancedImageUploader
            onUpload={async (files: File[]) => {
              // 画像をBase64に変換
              const newPhotos: string[] = [];
              for (const file of files) {
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
              // 新しい写真が追加されたらAI結果をクリア
              setAiResult(null);
              setShowAiResult(false);
            }}
            maxFiles={12}
          />
        </div>
      </NexusCard>

      {/* アップロード済み写真一覧 */}
      {uploadedPhotos.length > 0 && (
        <NexusCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              アップロード済み写真（{uploadedPhotos.length}枚）
            </h3>
            {uploadedPhotos.length >= 6 && (
              <NexusButton
                onClick={handleAIAnalysis}
                variant="primary"
                size="md"
                disabled={aiAnalyzing}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                {aiAnalyzing ? 'AI分析中...' : 'AI品質判定'}
              </NexusButton>
            )}
          </div>
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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