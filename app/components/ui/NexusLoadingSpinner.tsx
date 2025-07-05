'use client';

import React from 'react';

interface NexusLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'minimal';
  text?: string;
  className?: string;
}

export default function NexusLoadingSpinner({
  size = 'md',
  variant = 'primary',
  text,
  className = ''
}: NexusLoadingSpinnerProps) {
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const variantClasses = {
    primary: 'border-primary-blue',
    secondary: 'border-nexus-purple',
    minimal: 'border-gray-400'
  };

  return (
    <div className={`nexus-loading-spinner-container ${className}`}>
      <div className="flex items-center justify-center gap-2">
        
        {/* メインスピナー */}
        <div className="nexus-mini-spinner">
          <div className={`
            nexus-spinner-ring 
            ${sizeClasses[size]} 
            ${variantClasses[variant]}
          `}></div>
          <div className="nexus-spinner-center">
            <div className="nexus-spinner-dot"></div>
          </div>
        </div>

        {/* テキスト */}
        {text && (
          <span className={`
            nexus-loading-text 
            ${textSizeClasses[size]}
            ${variant === 'primary' ? 'text-primary-blue' : ''}
            ${variant === 'secondary' ? 'text-nexus-purple' : ''}
            ${variant === 'minimal' ? 'text-gray-600' : ''}
          `}>
            {text}
          </span>
        )}
      </div>

      {/* インラインスタイル */}
      <style jsx>{`
        .nexus-loading-spinner-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .nexus-mini-spinner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nexus-spinner-ring {
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: nexus-spin 1s linear infinite;
        }

        .nexus-spinner-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .nexus-spinner-dot {
          width: 3px;
          height: 3px;
          background: currentColor;
          border-radius: 50%;
          animation: nexus-pulse 1.5s ease-in-out infinite;
        }

        .nexus-loading-text {
          font-family: 'Noto Sans JP', sans-serif;
          font-weight: 500;
          white-space: nowrap;
        }

        @keyframes nexus-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes nexus-pulse {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
} 