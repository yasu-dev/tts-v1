import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode; // Optional leading icon
  actions?: ReactNode; // Optional action buttons placed right side
  /**
   * Region colour scheme to match NexusCard/IntelligenceCard variants
   * default: 'global'
   */
  region?: 'global' | 'americas' | 'europe' | 'asia' | 'africa' | 'oceania';
  /**
   * Control padding size (default = compact "p-4", large = "p-8")
   */
  size?: 'compact' | 'large';
  /**
   * Whether to show top gradient bar like NexusCard (default true)
   */
  gradient?: boolean;
}

/**
 * PageHeader — 統一されたタイトルカード
 *
 * すべてのページヘッダーに共通スタイルを提供し、
 *   - アイコンの有無
 *   - タイトル / サブタイトル
 *   - アクションボタン領域
 * を柔軟にカスタマイズ出来る。
 */
export default function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  region = 'global',
  size = 'compact',
  gradient = true,
}: PageHeaderProps) {
  // IntelligenceCard ベースクラスを流用
  const regionClasses: Record<typeof region, string> = {
    global: 'global',
    americas: 'americas',
    europe: 'europe',
    asia: 'asia',
    africa: 'africa',
    oceania: 'oceania',
  } as const;

  const padding = size === 'large' ? 'p-8' : 'p-4';

  return (
    <div className={`intelligence-card ${regionClasses[region]}`}>
      {/* 可変パディング */}
      <div className={`${padding}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title セクション */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* アイコン */}
            {icon ? (
              <div className="module-icon w-8 h-8 text-nexus-yellow flex-shrink-0">
                {icon}
              </div>
            ) : (
              // アイコンがない場合でもスペースを確保し配置を揃える
              <div className="w-8 h-8 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <h1 className="module-title text-3xl font-display font-bold text-nexus-text-primary truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="module-subtitle text-nexus-text-secondary truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
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