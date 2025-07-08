'use client';

import React from 'react';
import { ReactNode } from 'react';

interface NexusButtonProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  icon?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  'data-testid'?: string;
}

export default function NexusButton({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  icon,
  type = 'button',
  'data-testid': testId
}: NexusButtonProps) {
  
  // nexus-buttonクラスを使用（globals.cssで定義済み）
  const variantClasses = {
    default: '',
    primary: 'primary',
    secondary: '',  // nexus-buttonの基本スタイルを使用
    danger: 'danger'
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: '',  // nexus-buttonのデフォルトサイズ
    lg: 'text-base'
  };

  const combinedClasses = `
    nexus-button
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled}
      type={type}
      data-testid={testId}
    >
      {icon && icon}
      {children}
    </button>
  );
}