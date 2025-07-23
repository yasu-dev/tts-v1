'use client';

import React from 'react';

interface WorkflowStep {
  id: string;
  label: string;
  icon: string;
  status: 'completed' | 'active' | 'pending';
}

interface WorkflowProgressProps {
  steps: WorkflowStep[];
  className?: string;
}

export default function WorkflowProgress({ steps, className = '' }: WorkflowProgressProps) {
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-nexus-bg-secondary rounded-full h-2">
          <div 
            className="bg-nexus-blue h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-nexus-text-secondary mt-1">
          <span>{completedSteps}/{totalSteps} 完了</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center space-y-2">
              {/* Step Circle */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                ${step.status === 'completed' 
                  ? 'bg-nexus-blue text-white' 
                  : step.status === 'active'
                  ? 'bg-nexus-yellow text-nexus-text-primary border-2 border-nexus-yellow'
                  : 'bg-nexus-bg-secondary text-nexus-text-secondary'
                }
              `}>
                {step.status === 'completed' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className={`
                text-xs font-medium text-center
                ${step.status === 'active' 
                  ? 'text-nexus-text-primary' 
                  : 'text-nexus-text-secondary'
                }
              `}>
                {step.label}
                {step.status === 'active' && (
                  <div className="text-[10px] text-nexus-yellow font-semibold mt-1">作業中</div>
                )}
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-0.5 mx-2 transition-all duration-300
                ${steps[index + 1].status === 'completed' || steps[index].status === 'completed'
                  ? 'bg-nexus-blue'
                  : 'bg-nexus-bg-secondary'
                }
              `}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}