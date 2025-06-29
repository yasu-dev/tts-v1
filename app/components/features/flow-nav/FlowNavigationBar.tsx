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
        const response = await fetch('/api/inventory/stats');
        const data = await response.json();
        
        // Transform API data to flow stages
        const stages: FlowStage[] = [
          {
            id: 'inbound',
            name: '入庫',
            icon: '📥',
            color: '#3B82F6',
            count: data.statusStats['入庫'] || 0,
            avgDays: 1
          },
          {
            id: 'inspection',
            name: '検品',
            icon: '🔍',
            color: '#F59E0B',
            count: data.statusStats['検品'] || 0,
            avgDays: 2
          },
          {
            id: 'storage',
            name: '保管',
            icon: '📦',
            color: '#10B981',
            count: data.statusStats['保管'] || 0,
            avgDays: 30
          },
          {
            id: 'listing',
            name: '出品',
            icon: '🏷️',
            color: '#8B5CF6',
            count: data.statusStats['出品'] || 0,
            avgDays: 7
          },
          {
            id: 'ordered',
            name: '受注',
            icon: '📋',
            color: '#F97316',
            count: data.statusStats['受注'] || 0,
            avgDays: 1
          },
          {
            id: 'shipping',
            name: '出荷',
            icon: '🚛',
            color: '#6366F1',
            count: data.statusStats['出荷'] || 0,
            avgDays: 1
          },
          {
            id: 'delivery',
            name: '配送',
            icon: '📦',
            color: '#06B6D4',
            count: data.statusStats['配送'] || 0,
            avgDays: 3
          },
          {
            id: 'sold',
            name: '売約済み',
            icon: '✅',
            color: '#6B7280',
            count: data.statusStats['売約済み'] || 0,
            avgDays: 0
          },
          {
            id: 'returned',
            name: '返品',
            icon: '↩️',
            color: '#EF4444',
            count: data.statusStats['返品'] || 0,
            avgDays: 7
          }
        ];
        
        setFlowData(stages);
      } catch (error) {
        console.error('Flow data loading error:', error);
        // Fallback to empty stages if API fails
        setFlowData([]);
      } finally {
        setLoading(false);
      }
    };

    loadFlowData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadFlowData, 5 * 60 * 1000);
    return () => clearInterval(interval);
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