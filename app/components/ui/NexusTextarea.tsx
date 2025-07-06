'use client';

import React, { forwardRef } from 'react';

interface NexusTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'nexus' | 'enterprise';
  size?: 'sm' | 'md' | 'lg';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  required?: boolean;
}

const NexusTextarea = forwardRef<HTMLTextAreaElement, NexusTextareaProps>(({
  label,
  error,
  variant = 'nexus',
  size = 'md',
  resize = 'vertical',
  required,
  className = '',
  disabled,
  rows = 3,
  ...props
}, ref) => {
  
  const baseClasses = `
    w-full
    border rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const getVariantClasses = (hasError: boolean) => ({
    default: hasError ? `
      border-red-300 bg-white text-gray-900
      focus:ring-red-500 focus:border-red-500
      placeholder-gray-500
    ` : `
      border-gray-300 bg-white text-gray-900
      focus:ring-blue-500 focus:border-blue-500
      placeholder-gray-500
    `,
    nexus: hasError ? `
      bg-nexus-bg-secondary border-red-300 text-nexus-text-primary
      focus:ring-red-500 focus:border-red-500
      placeholder-nexus-text-secondary
    ` : `
      bg-nexus-bg-secondary border-nexus-border text-nexus-text-primary
      focus:ring-[#0064D2] focus:border-[#0064D2]
      placeholder-nexus-text-secondary
    `,
    enterprise: hasError ? `
      border-red-300 bg-white text-nexus-text-primary
      focus:ring-red-500 focus:border-red-500
      placeholder-nexus-text-muted
    ` : `
      border-nexus-border bg-white text-nexus-text-primary
      focus:ring-primary-blue focus:border-transparent
      placeholder-nexus-text-muted
      hover:border-primary-blue/30
    `
  });

  const sizeClasses = {
    sm: 'px-2 py-1.5 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };

  const variantClasses = getVariantClasses(!!error);
  
  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${resizeClasses[resize]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        className={combinedClasses}
        disabled={disabled}
        required={required}
        rows={rows}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

NexusTextarea.displayName = 'NexusTextarea';

export default NexusTextarea;