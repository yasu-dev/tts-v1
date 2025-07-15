'use client';

import React from 'react';

type StatusType = 'optimal' | 'warning' | 'critical';

// 業務ステータス用の型定義
type BusinessStatusType = 
  | 'inbound' | 'inspection' | 'storage' | 'listing' | 'sold' | 'maintenance'
  | 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'confirmed'
  | 'pending_inspection' | 'inspected' | 'packed' | 'shipped' | 'delivered'
  | 'approved' | 'rejected' | 'refunded';

interface StatusIndicatorProps {
  status: StatusType;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

interface BusinessStatusIndicatorProps {
  status: BusinessStatusType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// 業務ステータス設定
const businessStatusConfig = {
  // 在庫ステータス
  inbound: { label: '受取済み', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  inspection: { label: '検品作業中', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  storage: { label: '保管中', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  listing: { label: '出品中', color: 'bg-nexus-blue/20 text-nexus-blue dark:bg-nexus-blue/30 dark:text-nexus-blue' },
  sold: { label: '取引完了', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  maintenance: { label: 'メンテナンス', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  
  // タスクステータス
  pending: { label: '未開始', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  in_progress: { label: '進行中', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  completed: { label: '完了', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  cancelled: { label: 'キャンセル', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  confirmed: { label: '確定', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  
  // 配送ステータス
  pending_inspection: { label: '検品待ち', color: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100' },
  inspected: { label: '検品済み', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  packed: { label: '梱包済み', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  shipped: { label: '出荷済み', color: 'bg-nexus-blue/20 text-nexus-blue dark:bg-nexus-blue/30 dark:text-nexus-blue' },
  delivered: { label: '倉庫到着', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  
  // 返品ステータス
  approved: { label: '承認済み', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  rejected: { label: '拒否', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  refunded: { label: '返金済み', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
};

export default function StatusIndicator({
  status,
  label,
  size = 'md',
  showLabel = true,
  className = ''
}: StatusIndicatorProps) {

  const statusConfig = {
    optimal: {
      color: 'bg-nexus-green',
      glow: 'shadow-[0_0_20px_rgba(134,184,23,0.7)]',
      textColor: 'text-nexus-green',
      ring: 'ring-nexus-green/30'
    },
    warning: {
      color: 'bg-nexus-yellow', 
      glow: 'shadow-[0_0_20px_rgba(255,206,0,0.7)]',
      textColor: 'text-nexus-yellow',
      ring: 'ring-nexus-yellow/30'
    },
    critical: {
      color: 'bg-nexus-red',
      glow: 'shadow-[0_0_20px_rgba(229,50,56,0.7)]', 
      textColor: 'text-nexus-red',
      ring: 'ring-nexus-red/30'
    }
  };

  const sizeConfig = {
    sm: {
      indicator: 'w-3 h-3',
      text: 'text-xs',
      gap: 'gap-2'
    },
    md: {
      indicator: 'w-4 h-4',
      text: 'text-sm',
      gap: 'gap-3'
    },
    lg: {
      indicator: 'w-5 h-5', 
      text: 'text-base',
      gap: 'gap-4'
    }
  };

  const config = statusConfig[status];
  const sizing = sizeConfig[size];

  return (
    <div className={`
      status-nexus
      inline-flex items-center 
      ${sizing.gap}
      ${className}
    `}>
      {/* ステータスインジケーター */}
      <div className={`
        nexus-indicator
        ${sizing.indicator}
        ${config.color}
        ${config.glow}
        rounded-full
        relative
        ring-4 ${config.ring}
        transition-all duration-300
      `}>
        {/* 内部グロー */}
        <div className={`
          absolute inset-0.5
          ${config.color}
          rounded-full
          opacity-60
        `} />
        
        {/* 中心ポイント */}
        <div className={`
          absolute inset-1
          bg-white
          rounded-full
          opacity-80
        `} />
      </div>

      {/* ラベル */}
      {showLabel && (
        <span className={`
          font-bold
          ${sizing.text}
          ${config.textColor}
          tracking-wide
        `}>
          {label}
        </span>
      )}
    </div>
  );
}

// 業務ステータス表示コンポーネント
export function BusinessStatusIndicator({
  status,
  size = 'md',
  showLabel = true,
  className = ''
}: BusinessStatusIndicatorProps) {
  const config = businessStatusConfig[status];
  
  if (!config) {
    console.warn(`Unknown business status: ${status}`);
    return null;
  }

  const sizeConfig = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`
      inline-flex items-center
      ${sizeConfig[size]}
      font-medium rounded-full
      whitespace-nowrap
      ${config.color}
      ${className}
    `}>
      {showLabel ? config.label : ''}
    </span>
  );
}