'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FlowStage {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
  avgDays: number;
}

interface FlowNavigationBarProps {
  currentStage?: string;
  compact?: boolean;
  showCounts?: boolean;
}

export default function FlowNavigationBar({ 
  currentStage, 
  compact = false, 
  showCounts = true 
}: FlowNavigationBarProps) {
  const router = useRouter();
  const [flowData, setFlowData] = useState<FlowStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlowData = async () => {
      try {
        const response = await fetch('/data/analytics-mock.json');
        const data = await response.json();
        setFlowData(data.flowStages);
      } catch (error) {
        console.error('Flow data loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFlowData();
  }, []);

  const handleStageClick = (stageId: string) => {
    switch (stageId) {
      case 'inbound':
        router.push('/inventory?filter=inbound');
        break;
      case 'inspection':
        router.push('/inventory?filter=inspection');
        break;
      case 'storage':
        router.push('/inventory?filter=storage');
        break;
      case 'listing':
        router.push('/inventory?filter=listing');
        break;
      case 'order':
        router.push('/staff/tasks?filter=orders');
        break;
      case 'shipping':
        router.push('/staff/shipping');
        break;
      case 'delivery':
        router.push('/staff/shipping?filter=delivery');
        break;
      case 'returned':
        router.push('/inventory?filter=returned');
        break;
      default:
        router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className={`bg-white border-b border-gray-200 ${compact ? 'py-2' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-gray-400">フロー情報を読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-b border-gray-200 shadow-sm ${compact ? 'py-2' : 'py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
              商品フロー
            </h3>
            {!compact && (
              <span className="text-xs text-gray-500 ml-2">クリックで各工程にジャンプ</span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 overflow-x-auto">
            {flowData.map((stage, index) => {
              const isActive = currentStage === stage.id;
              const hasNext = index < flowData.length - 1;
              
              return (
                <div key={stage.id} className="flex items-center">
                  <button
                    onClick={() => handleStageClick(stage.id)}
                    className={`
                      relative flex flex-col items-center p-2 rounded-lg transition-all duration-200 
                      hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${isActive ? 'bg-blue-50 ring-2 ring-blue-300' : ''}
                      ${compact ? 'min-w-16' : 'min-w-20'}
                    `}
                    style={{
                      borderColor: isActive ? stage.color : 'transparent',
                      borderWidth: isActive ? '2px' : '0px'
                    }}
                  >
                    <div 
                      className={`
                        flex items-center justify-center rounded-full
                        ${compact ? 'w-6 h-6 text-sm' : 'w-8 h-8 text-base'}
                      `}
                      style={{ 
                        backgroundColor: `${stage.color}20`,
                        color: stage.color 
                      }}
                    >
                      {stage.icon}
                    </div>
                    
                    <span className={`
                      mt-1 font-medium text-center leading-tight
                      ${compact ? 'text-xs' : 'text-xs'}
                      ${isActive ? 'text-gray-900' : 'text-gray-600'}
                    `}>
                      {stage.name}
                    </span>
                    
                    {showCounts && stage.count > 0 && (
                      <div 
                        className={`
                          mt-1 px-1.5 py-0.5 rounded-full text-white text-xs font-medium
                          ${compact ? 'text-xs' : 'text-xs'}
                        `}
                        style={{ backgroundColor: stage.color }}
                      >
                        {stage.count}
                      </div>
                    )}
                    
                    {!compact && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        平均{stage.avgDays}日
                      </div>
                    )}
                    
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                        <div 
                          className="w-2 h-2 rotate-45"
                          style={{ backgroundColor: stage.color }}
                        ></div>
                      </div>
                    )}
                  </button>
                  
                  {hasNext && (
                    <div className="flex items-center px-1">
                      <svg 
                        className={`text-gray-400 ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className={`flex items-center space-x-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            <div className="text-gray-500">
              総在庫: {flowData.reduce((sum, stage) => sum + stage.count, 0)}件
            </div>
          </div>
        </div>
        
        {!compact && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            各工程をクリックして詳細画面に移動できます
          </div>
        )}
      </div>
    </div>
  );
}