'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FlowStage {
  id: string;
  name: string;
  color: string;
  count: number;
  avgDays: number;
  icon: React.ReactNode;
}

interface UnifiedProductFlowProps {
  currentStage?: string;
  userType: 'seller' | 'staff';
  compact?: boolean;
  showCounts?: boolean;
}

export default function UnifiedProductFlow({ 
  currentStage, 
  userType,
  compact = false, 
  showCounts = true 
}: UnifiedProductFlowProps) {
  const router = useRouter();
  const [flowData, setFlowData] = useState<FlowStage[]>([]);
  const [loading, setLoading] = useState(true);

  // SVGアイコンの定義
  const icons = {
    inbound: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
    ),
    inspection: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    storage: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    listing: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    ordered: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    shipping: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    delivery: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    sold: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    returned: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
  };

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
            color: '#3B82F6',
            count: data.statusStats['入庫'] || 0,
            avgDays: 1,
            icon: icons.inbound
          },
          {
            id: 'inspection',
            name: '検品',
            color: '#F59E0B',
            count: data.statusStats['検品'] || 0,
            avgDays: 2,
            icon: icons.inspection
          },
          {
            id: 'storage',
            name: '保管',
            color: '#10B981',
            count: data.statusStats['保管'] || 0,
            avgDays: 30,
            icon: icons.storage
          },
          {
            id: 'listing',
            name: '出品',
            color: '#8B5CF6',
            count: data.statusStats['出品'] || 0,
            avgDays: 7,
            icon: icons.listing
          },
          {
            id: 'ordered',
            name: '受注',
            color: '#F97316',
            count: data.statusStats['受注'] || 0,
            avgDays: 1,
            icon: icons.ordered
          },
          {
            id: 'shipping',
            name: '出荷',
            color: '#6366F1',
            count: data.statusStats['出荷'] || 0,
            avgDays: 1,
            icon: icons.shipping
          },
          {
            id: 'delivery',
            name: '配送',
            color: '#06B6D4',
            count: data.statusStats['配送'] || 0,
            avgDays: 3,
            icon: icons.delivery
          },
          {
            id: 'sold',
            name: '売約済み',
            color: '#6B7280',
            count: data.statusStats['売約済み'] || 0,
            avgDays: 0,
            icon: icons.sold
          },
          {
            id: 'returned',
            name: '返品',
            color: '#EF4444',
            count: data.statusStats['返品'] || 0,
            avgDays: 7,
            icon: icons.returned
          }
        ];
        
        setFlowData(stages);
      } catch (error) {
        console.error('Flow data loading error:', error);
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
    const baseRoute = userType === 'staff' ? '/staff' : '';
    
    switch (stageId) {
      case 'inbound':
        router.push(`${baseRoute}/inventory?filter=inbound`);
        break;
      case 'inspection':
        router.push(userType === 'staff' ? '/staff/inspection' : '/inventory?filter=inspection');
        break;
      case 'storage':
        router.push(`${baseRoute}/inventory?filter=storage`);
        break;
      case 'listing':
        router.push(`${baseRoute}/inventory?filter=listing`);
        break;
      case 'ordered':
        router.push(userType === 'staff' ? '/staff/tasks?filter=orders' : '/sales');
        break;
      case 'shipping':
        router.push(userType === 'staff' ? '/staff/shipping' : '/delivery');
        break;
      case 'delivery':
        router.push(userType === 'staff' ? '/staff/shipping?filter=delivery' : '/delivery?filter=delivery');
        break;
      case 'sold':
        router.push(`${baseRoute}/inventory?filter=sold`);
        break;
      case 'returned':
        router.push(userType === 'staff' ? '/staff/returns' : '/returns');
        break;
      default:
        router.push(userType === 'staff' ? '/staff/dashboard' : '/dashboard');
    }
  };

  if (loading) {
    return (
      <div className={`bg-white border-b border-gray-200 ${compact ? 'py-2' : 'py-4'}`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-gray-400">フロー情報を読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-b border-gray-200 shadow-sm ${compact ? 'py-2' : 'py-4'}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
                商品フロー
              </h3>
              {!compact && (
                <span className="text-xs text-gray-500">クリックで各工程にジャンプ</span>
              )}
            </div>
            <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
              <span className="text-gray-500">
                総在庫: {flowData.reduce((sum, stage) => sum + stage.count, 0)}件
              </span>
            </div>
          </div>

          {/* フローステージ - スクロールバーなし、レスポンシブ対応 */}
          <div className="w-full">
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2">
              {flowData.map((stage, index) => {
                const isActive = currentStage === stage.id;
                
                return (
                  <button
                    key={stage.id}
                    onClick={() => handleStageClick(stage.id)}
                    className={`
                      relative flex flex-col items-center p-2 rounded-lg transition-all duration-200 
                      hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${isActive ? 'bg-blue-50 ring-2 ring-blue-300' : ''}
                      w-full
                    `}
                    style={{
                      borderColor: isActive ? stage.color : 'transparent',
                      borderWidth: isActive ? '2px' : '0px'
                    }}
                  >
                    {/* アイコン */}
                    <div 
                      className={`
                        flex items-center justify-center rounded-full p-1.5
                        ${compact ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-6 h-6 sm:w-8 sm:h-8'}
                      `}
                      style={{ 
                        backgroundColor: `${stage.color}20`,
                        color: stage.color 
                      }}
                    >
                      {stage.icon}
                    </div>
                    
                    {/* ステージ名 */}
                    <span className={`
                      mt-1 font-medium text-center leading-tight
                      ${compact ? 'text-[10px] sm:text-xs' : 'text-xs'}
                      ${isActive ? 'text-gray-900' : 'text-gray-600'}
                    `}>
                      {stage.name}
                    </span>
                    
                    {/* カウントバッジ */}
                    {showCounts && stage.count > 0 && (
                      <div 
                        className={`
                          mt-1 px-1 py-0.5 rounded-full text-white font-medium
                          ${compact ? 'text-[8px] sm:text-[10px]' : 'text-[10px] sm:text-xs'}
                        `}
                        style={{ backgroundColor: stage.color }}
                      >
                        {stage.count}
                      </div>
                    )}
                    
                    {/* 平均日数 - モバイルでは非表示 */}
                    {!compact && stage.avgDays > 0 && (
                      <div className="hidden sm:block text-[10px] text-gray-400 mt-0.5">
                        平均{stage.avgDays}日
                      </div>
                    )}
                    
                    {/* アクティブインジケーター */}
                    {isActive && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div 
                          className="w-2 h-2 rotate-45"
                          style={{ backgroundColor: stage.color }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ヒント */}
          {!compact && (
            <div className="text-xs text-gray-500 text-center">
              各工程をクリックして詳細画面に移動できます
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 