'use client';

import { CameraIcon, CheckIcon } from '@heroicons/react/24/outline';

interface PhotographyRequest {
  // 新しい統一構造
  photographyType?: 'standard' | 'premium' | 'none';
  standardCount?: number;
  premiumAddCount?: 2 | 4;
  customRequests?: string;
  
  // 後方互換性のための旧構造保持
  specialPhotography?: boolean;
  specialPhotographyItems?: string[];
}



const specialPhotographyLabels: { [key: string]: string } = {
  'diagonal_45': '45度斜め撮影',
  'closeup': 'クローズアップ撮影', 
  'functional_details': '機能部分詳細撮影',
  'internal_structure': '内部構造撮影',
  'accessories_individual': '付属品個別撮影',
  // 追加項目
  'accessories': '付属品',
  'other': 'その他'
};

interface PhotographyRequestDisplayProps {
  photographyRequests: PhotographyRequest | null;
  className?: string;
}

export default function PhotographyRequestDisplay({ 
  photographyRequests, 
  className = '' 
}: PhotographyRequestDisplayProps) {
  console.log('[DEBUG] PhotographyRequestDisplay props詳細:', {
    photographyRequests: JSON.stringify(photographyRequests, null, 2),
    photographyRequestsType: typeof photographyRequests,
    isNull: photographyRequests === null,
    isUndefined: photographyRequests === undefined,
    photographyType: photographyRequests?.photographyType,
    customRequests: photographyRequests?.customRequests,
    className
  });

  if (!photographyRequests) {
    return (
      <div className={`p-4 bg-nexus-bg-tertiary rounded-lg border border-nexus-border ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <CameraIcon className="h-5 w-5 text-nexus-text-secondary" />
          <h4 className="text-sm font-medium text-nexus-text-secondary">撮影要望</h4>
        </div>
        <p className="text-sm text-nexus-text-secondary">撮影要望が未設定です</p>
      </div>
    );
  }

  // 新構造と旧構造の互換性チェック
  const photographyType = photographyRequests.photographyType || 
    (photographyRequests.specialPhotography ? 'premium' : 'standard');

  const getBgColor = () => {
    switch (photographyType) {
      case 'standard': return 'bg-green-50 border-green-200';
      case 'premium': return 'bg-orange-50 border-orange-200';
      case 'none': return 'bg-gray-50 border-gray-200';
      default: return 'bg-nexus-bg-tertiary border-nexus-border';
    }
  };

  const getIconColor = () => {
    switch (photographyType) {
      case 'standard': return 'text-green-600';
      case 'premium': return 'text-orange-600';
      case 'none': return 'text-gray-600';
      default: return 'text-nexus-text-secondary';
    }
  };

  const getTitle = () => {
    switch (photographyType) {
      case 'standard': return '通常撮影（10枚）';
      case 'premium': return '特別撮影';
      case 'none': return '撮影不要';
      default: return '撮影要望';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getBgColor()} ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <CameraIcon className={`h-5 w-5 ${getIconColor()}`} />
        <h4 className="text-sm font-medium text-nexus-text-primary">{getTitle()}</h4>
      </div>

      {/* 撮影タイプ別詳細表示 */}
      {photographyType === 'standard' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-nexus-text-primary">基本撮影（10枚）</span>
          </div>
          <p className="text-xs text-nexus-text-secondary ml-6">
            正面・背面・側面・上面・下面等の標準アングルでの撮影
          </p>
        </div>
      )}

      {photographyType === 'premium' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-nexus-text-primary">基本撮影（10枚）</span>
          </div>
          
          {/* 追加撮影枚数表示 */}
          {(photographyRequests.premiumAddCount && photographyRequests.premiumAddCount > 0) && (
            <div className="flex items-center gap-2">
              <CameraIcon className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                +{photographyRequests.premiumAddCount}枚追加
              </span>
            </div>
          )}

          {/* カスタム要望表示 */}
          {(photographyRequests.customRequests && photographyRequests.customRequests.trim() !== '') && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CameraIcon className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">撮影要望詳細</span>
              </div>
              <div className="ml-6 p-3 bg-white rounded border border-orange-200">
                <p className="text-sm text-nexus-text-primary whitespace-pre-wrap">
                  {photographyRequests.customRequests}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {photographyType === 'none' && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          </div>
          <span className="text-sm text-nexus-text-primary">商品撮影をスキップ</span>
        </div>
      )}
    </div>
  );
}
