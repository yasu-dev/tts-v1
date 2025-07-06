'use client';

import React, { forwardRef } from 'react';

interface NexusRadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  description?: string;
  error?: string;
  variant?: 'default' | 'nexus' | 'enterprise';
  size?: 'sm' | 'md' | 'lg';
}

const NexusRadio = forwardRef<HTMLInputElement, NexusRadioProps>(({
  label,
  description,
  error,
  variant = 'nexus',
  size = 'md',
  className = '',
  disabled,
  ...props
}, ref) => {
  
  const baseClasses = `
    rounded-full border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    cursor-pointer
  `;

  const variantClasses = {
    default: `
      border-gray-300 text-blue-600
      focus:ring-blue-500
      checked:bg-blue-600 checked:border-blue-600
    `,
    nexus: `
      border-nexus-border text-primary-blue
      focus:ring-primary-blue focus:ring-offset-0
      checked:bg-primary-blue checked:border-primary-blue
      hover:border-primary-blue/50
    `,
    enterprise: `
      border-nexus-border text-primary-blue
      focus:ring-primary-blue focus:ring-offset-0
      checked:bg-primary-blue checked:border-primary-blue
      hover:border-primary-blue/30
      hover:bg-primary-blue/5
    `
  };

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  };

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const labelClasses = `
    font-medium text-nexus-text-primary cursor-pointer select-none
    hover:text-nexus-text-primary transition-colors
    ${labelSizeClasses[size]}
  `.replace(/\s+/g, ' ').trim();

  const descriptionClasses = `
    text-xs text-nexus-text-secondary mt-1
  `;

  const radioId = props.id || `radio-${Math.random().toString(36).substr(2, 9)}`;

  if (!label) {
    // ラベルなしの場合はラジオボタンのみ
    return (
      <div className="inline-flex items-center">
        <input
          ref={ref}
          type="radio"
          className={combinedClasses}
          disabled={disabled}
          {...props}
        />
        {error && (
          <p className="ml-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-start">
        <input
          ref={ref}
          type="radio"
          className={combinedClasses}
          disabled={disabled}
          id={radioId}
          {...props}
        />
        <div className="ml-3 flex-1">
          <label 
            htmlFor={radioId}
            className={labelClasses}
          >
            {label}
          </label>
          {description && (
            <p className={descriptionClasses}>
              {description}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

NexusRadio.displayName = 'NexusRadio';

export default NexusRadio;