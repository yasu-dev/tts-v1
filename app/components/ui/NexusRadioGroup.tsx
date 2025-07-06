'use client';

import React from 'react';
import NexusRadio from './NexusRadio';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface NexusRadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  options: RadioOption[];
  label?: string;
  description?: string;
  error?: string;
  variant?: 'default' | 'nexus' | 'enterprise';
  size?: 'sm' | 'md' | 'lg';
  direction?: 'vertical' | 'horizontal';
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function NexusRadioGroup({
  name,
  value,
  onChange,
  options,
  label,
  description,
  error,
  variant = 'nexus',
  size = 'md',
  direction = 'vertical',
  className = '',
  disabled,
  required
}: NexusRadioGroupProps) {
  
  const handleChange = (optionValue: string) => {
    if (onChange && !disabled) {
      onChange(optionValue);
    }
  };

  const groupClasses = direction === 'horizontal' 
    ? 'flex flex-wrap gap-6'
    : 'space-y-3';

  const containerClasses = `
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={containerClasses}>
      {label && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-nexus-text-primary">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && (
            <p className="mt-1 text-xs text-nexus-text-secondary">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={groupClasses}>
        {options.map((option) => (
          <NexusRadio
            key={option.value}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => handleChange(option.value)}
            label={option.label}
            description={option.description}
            variant={variant}
            size={size}
            disabled={disabled || option.disabled}
          />
        ))}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}