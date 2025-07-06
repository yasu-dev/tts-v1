'use client';

import React, { forwardRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface NexusSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  variant?: 'default' | 'nexus' | 'enterprise';
  size?: 'sm' | 'md' | 'lg';
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

const NexusSelect = forwardRef<HTMLSelectElement, NexusSelectProps>(({
  label,
  error,
  variant = 'nexus',
  size = 'md',
  options,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  
  const baseClasses = `
    w-full
    border rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
    appearance-none
    cursor-pointer
  `;

  const variantClasses = {
    default: `
      border-gray-300 bg-white text-gray-900
      focus:ring-blue-500 focus:border-blue-500
    `,
    nexus: `
      bg-nexus-bg-secondary border-nexus-border text-nexus-text-primary
      focus:ring-[#0064D2] focus:border-[#0064D2]
    `,
    enterprise: `
      border-nexus-border bg-white text-nexus-text-primary
      focus:ring-primary-blue focus:border-transparent
      hover:border-primary-blue/30 font-primary
    `
  };

  const sizeClasses = {
    sm: 'px-2 py-1.5 text-sm pr-8',
    md: 'px-3 py-2 text-base pr-10',
    lg: 'px-4 py-3 text-lg pr-12'
  };

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={combinedClasses}
          disabled={disabled}
          {...props}
        >
          {options ? (
            options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
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

NexusSelect.displayName = 'NexusSelect';

export default NexusSelect;