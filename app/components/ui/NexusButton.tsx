'use client';

import React from 'react';
import { ReactNode } from 'react';

interface NexusButtonProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export default function NexusButton({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  icon,
  type = 'button'
}: NexusButtonProps) {
  
  const baseClasses = `
    nexus-button
    inline-flex items-center justify-center gap-3
    font-bold font-primary cursor-pointer
    border-[3px] rounded-nexus
    transition-nexus duration-nexus ease-nexus
    shadow-nexus-button
    disabled:opacity-50 disabled:cursor-not-allowed
    hover:shadow-nexus-button-hover
    hover:-translate-y-1 hover:scale-105
  `;

  const variantClasses = {
    default: `
      bg-nexus-surface text-primary-blue border-nexus-border
      hover:bg-primary-blue hover:text-white hover:border-primary-blue
    `,
    primary: `
      bg-gradient-to-r from-primary-blue via-primary-blue-light to-primary-blue-lighter
      text-white border-primary-blue
      hover:from-primary-blue-light hover:via-primary-blue-lighter hover:to-primary-blue-lighter
    `,
    secondary: `
      bg-gradient-to-r from-nexus-purple via-nexus-cyan to-nexus-green
      text-white border-nexus-purple
      hover:from-nexus-cyan hover:via-nexus-green hover:to-nexus-yellow
    `,
    danger: `
      bg-gradient-to-r from-nexus-red to-red-600
      text-white border-nexus-red
      hover:from-red-600 hover:to-red-700
    `
  };

  const sizeClasses = {
    sm: 'px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm',
    md: 'px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base',
    lg: 'px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-base sm:text-lg'
  };

  const combinedClasses = `
    ${baseClasses}
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
    >
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      <span className="font-bold tracking-wide">
        {children}
      </span>
    </button>
  );
}