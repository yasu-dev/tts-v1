'use client';

import React from 'react';

type CertificationType = 'elite' | 'premium' | 'global' | 'verified' | 'compliance';

interface CertBadgeProps {
  type: CertificationType;
  label: string;
  className?: string;
}

export default function CertBadge({
  type,
  label,
  className = ''
}: CertBadgeProps) {

  const certConfig = {
    elite: {
      bg: 'bg-primary-blue/20',
      text: 'text-primary-blue',
      border: 'border-primary-blue',
      glow: 'shadow-[0_0_12px_rgba(0,100,210,0.25)]'
    },
    premium: {
      bg: 'bg-nexus-yellow/20',
      text: 'text-nexus-yellow',
      border: 'border-nexus-yellow', 
      glow: 'shadow-[0_0_12px_rgba(255,206,0,0.25)]'
    },
    global: {
      bg: 'bg-nexus-green/20',
      text: 'text-nexus-green',
      border: 'border-nexus-green',
      glow: 'shadow-[0_0_12px_rgba(134,184,23,0.25)]'
    },
    verified: {
      bg: 'bg-nexus-cyan/20',
      text: 'text-nexus-cyan',
      border: 'border-nexus-cyan',
      glow: 'shadow-[0_0_12px_rgba(0,188,212,0.25)]'
    },
    compliance: {
      bg: 'bg-nexus-purple/20',
      text: 'text-nexus-purple',
      border: 'border-nexus-purple',
      glow: 'shadow-[0_0_12px_rgba(123,31,162,0.25)]'
    }
  };

  const config = certConfig[type];

  return (
    <span className={`
      cert-nano
      inline-flex items-center
      px-3 py-1.5
      rounded-lg
      border-2
      font-black font-display
      text-xs
      uppercase
      tracking-widest
      transition-all duration-300
      hover:scale-110
      ${config.bg}
      ${config.text}
      ${config.border}
      ${config.glow}
      ${className}
    `}>
      {label}
    </span>
  );
}