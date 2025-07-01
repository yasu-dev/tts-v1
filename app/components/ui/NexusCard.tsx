'use client';

import React from 'react';
import { ReactNode } from 'react';

type RegionType = 'americas' | 'europe' | 'asia' | 'africa' | 'oceania' | 'global';

interface NexusCardProps {
  children: ReactNode;
  region?: RegionType;
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  gradient?: boolean;
}

export default function NexusCard({
  children,
  region = 'global',
  title,
  subtitle,
  onClick,
  className = '',
  gradient = true
}: NexusCardProps) {
  
  const baseClasses = `
    intelligence-card
    bg-nexus-surface backdrop-blur-nexus backdrop-saturate-nexus
    border-[3px] rounded-nexus-xl
    p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden
    transition-all duration-300 ease-out
    cursor-pointer
    shadow-nexus-card
    hover:shadow-[0_25px_50px_rgba(0,0,0,0.18),0_0_40px_rgba(0,100,210,0.25)]
    hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.01] sm:hover:scale-[1.03]
  `;

  // 地域別カラーリングシステム
  const regionClasses = {
    americas: 'border-region-americas',
    europe: 'border-region-europe', 
    asia: 'border-region-asia',
    africa: 'border-region-africa',
    oceania: 'border-region-oceania',
    global: 'border-region-global'
  };

  const regionGradients = {
    americas: 'from-primary-blue via-primary-blue-light to-primary-blue-lighter',
    europe: 'from-nexus-red via-red-500 to-red-400',
    asia: 'from-nexus-yellow via-yellow-400 to-yellow-300',
    africa: 'from-nexus-green via-green-500 to-green-400',
    oceania: 'from-nexus-cyan via-cyan-400 to-cyan-300',
    global: 'from-nexus-purple via-purple-500 to-purple-400'
  };

  const combinedClasses = `
    ${baseClasses}
    ${regionClasses[region]}
    ${className}
    ${region}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={combinedClasses} onClick={onClick}>
      {/* 上部8pxアクセントバー */}
      {gradient && (
        <div className={`
          absolute top-0 left-0 right-0 h-2
          bg-gradient-to-r ${regionGradients[region]}
          rounded-t-nexus-xl
        `} />
      )}

      {/* グローバルスマートグリッド背景エフェクト */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-transparent via-primary-blue/20 to-transparent rounded-nexus-xl" />
      </div>

      {/* ヘッダー部分 */}
      {(title || subtitle) && (
        <div className="relative z-10 mb-3 sm:mb-4 md:mb-6">
          {title && (
            <h3 className="text-base sm:text-lg md:text-xl font-bold font-display text-nexus-text-primary mb-1 sm:mb-2 tracking-wide">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm font-medium text-nexus-text-secondary tracking-wide">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* メインコンテンツ */}
      <div className="relative z-10">
        {children}
      </div>

      {/* ホバー時のグローエフェクト */}
      <div className="
        absolute inset-0 
        bg-gradient-to-br from-transparent via-primary-blue/5 to-transparent
        opacity-0 transition-opacity duration-300
        group-hover:opacity-100
        rounded-nexus-xl
        pointer-events-none
      " />
    </div>
  );
}