'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface NexusSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  variant?: 'default' | 'nexus' | 'enterprise';
  size?: 'sm' | 'md' | 'lg';
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  required?: boolean;
  useCustomDropdown?: boolean;
}

const NexusSelect = forwardRef<HTMLSelectElement, NexusSelectProps>(({
  label,
  error,
  variant = 'nexus',
  size = 'md',
  options,
  children,
  required,
  className = '',
  disabled,
  useCustomDropdown = false,
  value,
  onChange,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    if (!useCustomDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [useCustomDropdown]);

  // value propの変更を追跡
  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  const handleOptionSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    setIsOpen(false);

    // 元のonChangeイベントを呼び出す
    if (onChange) {
      const syntheticEvent = {
        target: { value: optionValue }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
  };

  const getSelectedLabel = () => {
    if (!options) return selectedValue;
    const selectedOption = options.find(opt => opt.value === selectedValue);
    return selectedOption ? selectedOption.label : selectedValue;
  };
  
  const baseClasses = `
    w-full
    border rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
    appearance-none
    cursor-pointer
  `;

  const getVariantClasses = (hasError: boolean) => ({
    default: hasError ? `
      border-red-300 bg-white text-gray-900
      focus:ring-red-500 focus:border-red-500
    ` : `
      border-gray-300 bg-white text-gray-900
      focus:ring-blue-500 focus:border-blue-500
    `,
    nexus: hasError ? `
      bg-nexus-bg-secondary border-red-300 text-nexus-text-primary
      focus:ring-red-500 focus:border-red-500
    ` : `
      bg-nexus-bg-secondary border-gray-300 text-nexus-text-primary
      focus:ring-[#0064D2] focus:border-[#0064D2]
      hover:border-gray-400
    `,
    enterprise: hasError ? `
      border-red-300 bg-white text-nexus-text-primary
      focus:ring-red-500 focus:border-red-500
    ` : `
      border-nexus-border bg-white text-nexus-text-primary
      focus:ring-primary-blue focus:border-transparent
      hover:border-primary-blue/30
    `
  });

  const sizeClasses = {
    sm: 'px-2 py-1.5 text-sm pr-8',
    md: 'px-3 py-2 text-base pr-10',
    lg: 'px-4 py-3 text-lg pr-12'
  };

  const variantClasses = getVariantClasses(!!error);
  
  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // カスタムドロップダウンを使用する場合
  if (useCustomDropdown && options) {
    return (
      <div className="w-full" ref={dropdownRef}>
        {label && (
          <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <button
            type="button"
            className={combinedClasses}
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className="block truncate text-left">{getSelectedLabel()}</span>
          </button>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>

          {/* カスタムドロップダウンメニュー */}
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`
                    px-3 py-2 cursor-pointer hover:bg-blue-50
                    ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${selectedValue === option.value ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}
                    ${option === options[0] ? 'rounded-t-lg' : ''}
                    ${option === options[options.length - 1] ? 'rounded-b-lg' : ''}
                  `}
                  onClick={() => !option.disabled && handleOptionSelect(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  // 標準のselectを使用する場合
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={combinedClasses}
          disabled={disabled}
          required={required}
          value={selectedValue}
          onChange={onChange}
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