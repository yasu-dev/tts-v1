'use client';

import React from 'react';
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface NexusAlertProps {
  type?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const iconMap = {
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
  success: CheckCircleIcon,
  error: XCircleIcon,
};

const alertStyles = {
  info: 'bg-nexus-blue/10 border-nexus-blue/20 text-nexus-blue',
  warning: 'bg-nexus-yellow/10 border-nexus-yellow/20 text-nexus-yellow',
  success: 'bg-nexus-green/10 border-nexus-green/20 text-nexus-green',
  error: 'bg-nexus-red/10 border-nexus-red/20 text-nexus-red',
};

const titleStyles = {
  info: 'text-nexus-blue',
  warning: 'text-nexus-yellow',
  success: 'text-nexus-green',
  error: 'text-nexus-red',
};

export default function NexusAlert({
  type = 'info',
  title,
  children,
  className = '',
}: NexusAlertProps) {
  const Icon = iconMap[type];

  return (
    <div className={`rounded-lg border-2 p-4 ${alertStyles[type]} ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && (
            <h4 className={`font-medium mb-2 ${titleStyles[type]}`}>
              {title}
            </h4>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { NexusAlertProps };