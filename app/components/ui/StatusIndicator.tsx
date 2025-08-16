'use client';

import React from 'react';

type StatusType = 'optimal' | 'warning' | 'critical';

// 業務ステータス用の型定義
type BusinessStatusType = 
  | 'inbound' | 'inspection' | 'storage' | 'listing' | 'sold'
  | 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'confirmed'
  | 'processing' | 'delivered' | 'returned'
  | 'packed' | 'shipped' | 'ready_for_pickup'
  | 'approved' | 'rejected' | 'refunded'
  | 'ordered' | 'shipping';

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
  inbound: { 
    label: '入荷待ち', 
    bg: 'bg-blue-800 dark:bg-blue-800',
    text: 'text-white dark:text-white',
    border: 'border-blue-800 dark:border-blue-800'
  },
  inspection: { 
    label: '検品中', 
    bg: 'bg-orange-800 dark:bg-orange-800',
    text: 'text-white dark:text-white',
    border: 'border-orange-800 dark:border-orange-800'
  },
  storage: { 
    label: '保管中', 
    bg: 'bg-green-800 dark:bg-green-800',
    text: 'text-white dark:text-white',
    border: 'border-green-800 dark:border-green-800'
  },
  listing: { 
    label: '出品中', 
    bg: 'bg-blue-800 dark:bg-blue-800',
    text: 'text-white dark:text-white',
    border: 'border-blue-800 dark:border-blue-800'
  },
  sold: { 
    label: '売約済み', 
    bg: 'bg-gray-800 dark:bg-gray-800',
    text: 'text-white dark:text-white',
    border: 'border-gray-800 dark:border-gray-800'
  },

  ordered: { 
    label: '受注済み', 
    bg: 'bg-purple-800 dark:bg-purple-800',
    text: 'text-white dark:text-white',
    border: 'border-purple-800 dark:border-purple-800'
  },
  shipping: { 
    label: '出荷中', 
    bg: 'bg-purple-800 dark:bg-purple-800',
    text: 'text-white dark:text-white',
    border: 'border-purple-800 dark:border-purple-800'
  },
  returned: { 
    label: '返品', 
    bg: 'bg-orange-800 dark:bg-orange-800',
    text: 'text-white dark:text-white',
    border: 'border-orange-800 dark:border-orange-800'
  },
  
  // 注文ステータス
  pending: {
    label: '未確定',
    bg: 'bg-blue-800 dark:bg-blue-800',
    text: 'text-white dark:text-white',
    border: 'border-blue-800 dark:border-blue-800'
  },
  confirmed: { 
    label: '受注確定', 
    bg: 'bg-green-800 dark:bg-green-800',
    text: 'text-white dark:text-white',
    border: 'border-green-800 dark:border-green-800'
  },
  processing: { 
    label: '出荷準備中', 
    bg: 'bg-amber-700 dark:bg-amber-700',
    text: 'text-white dark:text-white',
    border: 'border-amber-700 dark:border-amber-700'
  },
  shipped: { 
    label: '出荷済み', 
    bg: 'bg-indigo-800 dark:bg-indigo-800',
    text: 'text-white dark:text-white',
    border: 'border-indigo-800 dark:border-indigo-800'
  },
  delivered: { 
    label: '配達完了', 
    bg: 'bg-green-800 dark:bg-green-800',
    text: 'text-white dark:text-white',
    border: 'border-green-800 dark:border-green-800'
  },
  cancelled: { 
    label: 'キャンセル', 
    bg: 'bg-red-800 dark:bg-red-800',
    text: 'text-white dark:text-white',
    border: 'border-red-800 dark:border-red-800'
  },
  
  // タスクステータス
  in_progress: { 
    label: '梱包待ち', 
    bg: 'bg-yellow-800 dark:bg-yellow-800',
    text: 'text-white dark:text-white',
    border: 'border-yellow-800 dark:border-yellow-800'
  },
  completed: { 
    label: '完了', 
    bg: 'bg-blue-500 dark:bg-blue-500',
    text: 'text-white dark:text-white',
    border: 'border-blue-500 dark:border-blue-500'
  },
  
  // 配送ステータス
  packed: { 
    label: '梱包済み', 
    bg: 'bg-cyan-800 dark:bg-cyan-800',
    text: 'text-white dark:text-white',
    border: 'border-cyan-800 dark:border-cyan-800'
  },
  ready_for_pickup: { 
    label: '集荷準備中', 
    bg: 'bg-orange-800 dark:bg-orange-800',
    text: 'text-white dark:text-white',
    border: 'border-orange-800 dark:border-orange-800'
  },
  
  // 返品ステータス
  approved: { 
    label: '承認済み', 
    bg: 'bg-emerald-800 dark:bg-emerald-800',
    text: 'text-white dark:text-white',
    border: 'border-emerald-800 dark:border-emerald-800'
  },
  rejected: { 
    label: '不合格', 
    bg: 'bg-red-800 dark:bg-red-800',
    text: 'text-white dark:text-white',
    border: 'border-red-800 dark:border-red-800'
  },
  refunded: { 
    label: '返金済み', 
    bg: 'bg-gray-800 dark:bg-gray-800',
    text: 'text-white dark:text-white',
    border: 'border-gray-800 dark:border-gray-800'
  }
};

// インジケーター色を取得するヘルパー関数
function getIndicatorColor(status: BusinessStatusType): string {
  const colorMap: Record<BusinessStatusType, string> = {
    inbound: 'bg-blue-300',
    inspection: 'bg-orange-300',
    storage: 'bg-green-300',
    listing: 'bg-blue-300',
    sold: 'bg-gray-300',

    ordered: 'bg-purple-300',
    shipping: 'bg-purple-300',
    returned: 'bg-orange-300',
    pending: 'bg-blue-300',
    confirmed: 'bg-green-300',
    processing: 'bg-amber-300',
    shipped: 'bg-indigo-300',
    delivered: 'bg-green-300',
    cancelled: 'bg-red-300',
    in_progress: 'bg-yellow-300',
    completed: 'bg-blue-400',
    packed: 'bg-cyan-300',
    ready_for_pickup: 'bg-orange-300',
    approved: 'bg-emerald-300',
    rejected: 'bg-red-300',
    refunded: 'bg-gray-300'
  };
  
  return colorMap[status] || 'bg-gray-300';
}

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
    },
    normal: {
      color: 'bg-gray-500',
      glow: 'shadow-[0_0_20px_rgba(107,114,128,0.7)]',
      textColor: 'text-gray-500',
      ring: 'ring-gray-500/30'
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

  const config = statusConfig[status] || statusConfig.normal;
  const sizing = sizeConfig[size] || sizeConfig.md;

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
  const config = businessStatusConfig[status] || {
    label: status || '不明',
    bg: 'bg-gray-800 dark:bg-gray-800',
    text: 'text-white dark:text-white',
    border: 'border-gray-800 dark:border-gray-800'
  };
  
  if (!status) {
    console.warn(`Status is undefined in BusinessStatusIndicator`);
    return <span className="status-badge neutral">不明</span>;
  }

  const sizeConfig = {
    sm: { padding: 'px-2 py-1', text: 'text-xs', indicator: 'w-1.5 h-1.5' },
    md: { padding: 'px-3 py-1.5', text: 'text-xs', indicator: 'w-2 h-2' },
    lg: { padding: 'px-4 py-2', text: 'text-sm', indicator: 'w-2.5 h-2.5' }
  };

  const sizing = sizeConfig[size];

  return (
    <span className={`
      inline-flex items-center gap-2
      ${sizing.padding}
      ${sizing.text}
      font-black font-display
      rounded-lg
      border-2
      uppercase
      tracking-widest
      transition-all duration-300
      whitespace-nowrap
      hover:scale-105
      ${config.bg}
      ${config.text}
      ${config.border}
      ${className}
    `}>
      {/* ステータスインジケーター */}
      <div className={`
        ${sizing.indicator}
        rounded-full
        flex-shrink-0
        ${getIndicatorColor(status)}
      `} />
      
      {showLabel ? config.label : ''}
    </span>
  );
}