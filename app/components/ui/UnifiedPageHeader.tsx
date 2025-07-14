'use client';

import React from 'react';

interface UnifiedPageHeaderProps {
  title: string;
  subtitle?: string;
  userType: 'seller' | 'staff';
  actions?: React.ReactNode;
}

/**
 * 統一されたページヘッダーコンポーネント
 * 全画面で同じスタイル、レイアウト、アイコンを使用
 */
export default function UnifiedPageHeader({
  title,
  subtitle,
  userType,
  actions
}: UnifiedPageHeaderProps) {
  // 統一されたアイコン（userTypeに関係なく同じ）
  const headerIcon = (
    <svg 
      className="w-8 h-8 text-nexus-yellow flex-shrink-0" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
      />
    </svg>
  );

  return (
    <div className="bg-white rounded-xl border border-nexus-border" data-testid="unified-page-header">
      {/* 統一されたパディング */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* タイトルセクション - 統一レイアウト */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* 統一されたアイコン */}
            {headerIcon}
            <div className="min-w-0">
              {/* 統一されたタイトルスタイル */}
              <h1 className="text-3xl font-display font-bold text-nexus-text-primary truncate">
                {title}
              </h1>
              {/* 統一されたサブタイトルスタイル */}
              {subtitle && (
                <p className="mt-2 text-nexus-text-secondary truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          {actions && (
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 