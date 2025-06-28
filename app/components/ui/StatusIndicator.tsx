'use client';

import React from 'react';

type StatusType = 'optimal' | 'warning' | 'critical';

interface StatusIndicatorProps {
  status: StatusType;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
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
          font-bold font-primary
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