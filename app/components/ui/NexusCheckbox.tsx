'use client';

import React, { forwardRef } from 'react';

interface NexusCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  description?: string;
  error?: string;
  variant?: 'default' | 'nexus' | 'enterprise';
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

const NexusCheckbox = forwardRef<HTMLInputElement, NexusCheckboxProps>(({
  label,
  description,
  error,
  variant = 'nexus',
  size = 'md',
  indeterminate = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  
  const baseClasses = `
    rounded border transition-all duration-200
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
    font-primary
    ${labelSizeClasses[size]}
  `.replace(/\s+/g, ' ').trim();

  const descriptionClasses = `
    text-xs text-nexus-text-secondary mt-1 font-primary
  `;

  React.useEffect(() => {
    if (ref && typeof ref === 'object' && ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate, ref]);

  if (!label) {
    // ラベルなしの場合はチェックボックスのみ
    return (
      <div className="inline-flex items-center">
        <input
          ref={ref}
          type="checkbox"
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
          type="checkbox"
          className={combinedClasses}
          disabled={disabled}
          id={props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`}
          {...props}
        />
        <div className="ml-3 flex-1">
          <label 
            htmlFor={props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`}
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

NexusCheckbox.displayName = 'NexusCheckbox';

export default NexusCheckbox;