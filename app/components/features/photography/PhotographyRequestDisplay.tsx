'use client';

import { CameraIcon, CheckIcon } from '@heroicons/react/24/outline';

interface PhotographyRequest {
  specialPhotography: boolean;
  specialPhotographyItems: string[];
  customRequests: string;
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
    hasSpecialPhotography: photographyRequests?.specialPhotography,
    hasCustomRequests: !!photographyRequests?.customRequests,
    specialPhotographyItems: photographyRequests?.specialPhotographyItems,
    customRequests: photographyRequests?.customRequests,
    className
  });
  if (!photographyRequests || (!photographyRequests.specialPhotography && !photographyRequests.customRequests)) {
    return (
      <div className={`p-4 bg-nexus-bg-tertiary rounded-lg border border-nexus-border ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <CameraIcon className="h-5 w-5 text-nexus-text-secondary" />
          <h4 className="text-sm font-medium text-nexus-text-secondary">撮影要望</h4>
        </div>
        <p className="text-sm text-nexus-text-secondary">
          基本撮影のみ実施してください（正面・側面・背面・上面・下面等の標準アングル）
        </p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-orange-50 rounded-lg border border-orange-200 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <CameraIcon className="h-5 w-5 text-orange-600" />
        <h4 className="text-sm font-medium text-orange-800">撮影要望あり</h4>
      </div>

      {/* 基本撮影について */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <CheckIcon className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-nexus-text-primary">基本撮影</span>
        </div>
        <p className="text-xs text-nexus-text-secondary ml-6">
          正面・側面・背面等の標準アングルでの撮影を実施
        </p>
      </div>

      {/* 特別撮影項目 */}
      {photographyRequests.specialPhotography && photographyRequests.specialPhotographyItems.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <CameraIcon className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">特別撮影項目</span>
          </div>
          <div className="ml-6 space-y-1">
            {photographyRequests.specialPhotographyItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-nexus-text-primary">
                  {specialPhotographyLabels[item] || item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 任意の撮影要望 */}
      {photographyRequests.customRequests && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CameraIcon className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">任意の撮影要望</span>
          </div>
          <div className="ml-6 p-3 bg-white rounded border border-orange-200">
            <p className="text-sm text-nexus-text-primary whitespace-pre-wrap">
              {photographyRequests.customRequests}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
