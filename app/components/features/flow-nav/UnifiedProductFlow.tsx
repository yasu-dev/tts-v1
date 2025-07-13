'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NexusLoadingSpinner } from '@/app/components/ui';

interface FlowStep {
  id: string;
  name: string;
  shortName: string;
  description: string;
  role: 'seller' | 'staff' | 'system' | 'customer';
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  tasks: {
    id: string;
    name: string;
    count: number;
    avgDays: number;
    status: 'active' | 'waiting' | 'completed';
    priority: 'high' | 'medium' | 'low';
  }[];
}

interface UnifiedProductFlowProps {
  currentStage?: string;
  userType: 'seller' | 'staff';
  compact?: boolean;
  showCounts?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function UnifiedProductFlow({ 
  currentStage, 
  userType,
  compact = false, 
  showCounts = true,
  isCollapsed = false,
  onToggleCollapse
}: UnifiedProductFlowProps) {
  console.log('UnifiedProductFlow render:', { isCollapsed, compact });
  const router = useRouter();
  const [flowData, setFlowData] = useState<FlowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    returns: 0,
    userActiveTasks: 0
  });

  // 洗練されたSVGアイコンセット
  const stepIcons = {
    preparation: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
      </svg>
    ),
    inbound: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
    ),
    sales: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    shipping: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    completion: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    returns: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
      </svg>
    )
  };

  // フルフィルメントサービスの6ステップ構造（心理学的・経済学的配色最適化）
  const getFlowSteps = (): FlowStep[] => [
    {
      id: 'preparation',
      name: 'STEP 1: 準備フェーズ',
      shortName: '準備',
      description: 'セラー商品仕入れ・納品プラン作成・ATW倉庫発送',
      role: 'seller',
      color: '#0064D2', // 信頼性・安定性を表すプライマリーブルー（経済学：投資・準備段階）
      bgColor: '#e3f2fd',
      icon: stepIcons.preparation,
      tasks: [
        { id: 'sourcing', name: '商品仕入れ', count: 0, avgDays: 3, status: 'active', priority: 'high' },
        { id: 'plan', name: '納品プラン作成', count: 0, avgDays: 1, status: 'waiting', priority: 'medium' },
        { id: 'shipping', name: 'ATW倉庫発送', count: 0, avgDays: 2, status: 'waiting', priority: 'medium' }
      ]
    },
    {
      id: 'inbound',
      name: 'STEP 2: 入庫フェーズ',
      shortName: '入庫',
      description: 'スタッフ商品受取・検品撮影・在庫登録',
      role: 'staff',
      color: '#7B1FA2', // 集中力・専門性を表すパープル（心理学：検品・品質管理）
      bgColor: '#f3e5f5',
      icon: stepIcons.inbound,
      tasks: [
        { id: 'receive', name: '商品受取', count: 0, avgDays: 1, status: 'active', priority: 'high' },
        { id: 'inspection', name: '検品・撮影', count: 0, avgDays: 2, status: 'waiting', priority: 'high' },
        { id: 'register', name: '在庫登録', count: 0, avgDays: 1, status: 'waiting', priority: 'medium' }
      ]
    },
    {
      id: 'sales',
      name: 'STEP 3: 販売フェーズ',
      shortName: '販売',
      description: 'システム自動出品・購入者注文・受注処理',
      role: 'system',
      color: '#86B817', // 成長・収益を表すグリーン（経済学：売上創出・収益化）
      bgColor: '#e8f5e8',
      icon: stepIcons.sales,
      tasks: [
        { id: 'listing', name: 'eBay自動出品', count: 0, avgDays: 1, status: 'active', priority: 'medium' },
        { id: 'order', name: '商品注文', count: 0, avgDays: 0, status: 'waiting', priority: 'low' },
        { id: 'process', name: '受注処理', count: 0, avgDays: 1, status: 'waiting', priority: 'high' }
      ]
    },
    {
      id: 'shipping',
      name: 'STEP 4: 出荷フェーズ',
      shortName: '出荷',
      description: 'スタッフピッキング・梱包発送・購入者受取',
      role: 'staff',
      color: '#00BCD4', // 効率性・スピードを表すシアン（心理学：迅速な配送・顧客満足）
      bgColor: '#e0f7fa',
      icon: stepIcons.shipping,
      tasks: [
        { id: 'picking', name: 'ピッキング', count: 0, avgDays: 1, status: 'active', priority: 'high' },
        { id: 'packing', name: '梱包・発送', count: 0, avgDays: 1, status: 'waiting', priority: 'high' },
        { id: 'delivery', name: '購入者受取', count: 0, avgDays: 3, status: 'waiting', priority: 'low' }
      ]
    },
    {
      id: 'completion',
      name: 'STEP 5: 完了フェーズ',
      shortName: '完了',
      description: 'システム売上計算・セラー精算確認・次回仕入れ',
      role: 'seller',
      color: '#FFCE00', // 達成感・満足感を表すゴールド（経済学：利益確定・成功）
      bgColor: '#fff8e1',
      icon: stepIcons.completion,
      tasks: [
        { id: 'calculation', name: '売上計算', count: 0, avgDays: 1, status: 'active', priority: 'medium' },
        { id: 'settlement', name: '精算確認', count: 0, avgDays: 2, status: 'waiting', priority: 'high' },
        { id: 'next', name: '次回仕入れ', count: 0, avgDays: 0, status: 'waiting', priority: 'low' }
      ]
    },
    {
      id: 'returns',
      name: 'STEP 6: 返品フェーズ',
      shortName: '返品',
      description: 'スタッフ返品受付・検品・再出品または廃棄',
      role: 'staff',
      color: '#FF6F00', // 注意喚起だが建設的なオレンジ（心理学：問題解決・改善機会）
      bgColor: '#fff3e0',
      icon: stepIcons.returns,
      tasks: [
        { id: 'return-receive', name: '返品受付', count: 0, avgDays: 1, status: 'active', priority: 'high' },
        { id: 'return-inspect', name: '返品検品', count: 0, avgDays: 2, status: 'waiting', priority: 'high' },
        { id: 'return-process', name: '再出品・廃棄', count: 0, avgDays: 1, status: 'waiting', priority: 'medium' }
      ]
    }
  ];

  useEffect(() => {
    const loadFlowData = async () => {
      try {
        const response = await fetch('/api/inventory/stats');
        const data = await response.json();
        
        const steps = getFlowSteps();
        let userActiveTasks = 0;
        
        // APIデータを各ステップのタスクにマッピング
        steps.forEach(step => {
          step.tasks.forEach(task => {
            switch (task.id) {
              case 'receive':
                task.count = data.statusStats['入庫'] || 0;
                break;
              case 'inspection':
                task.count = data.statusStats['検品'] || 0;
                break;
              case 'register':
                task.count = data.statusStats['保管'] || 0;
                break;
              case 'listing':
                task.count = data.statusStats['出品'] || 0;
                break;
              case 'order':
                task.count = data.statusStats['受注'] || 0;
                break;
              case 'picking':
                task.count = data.statusStats['出荷'] || 0;
                break;
              case 'delivery':
                task.count = data.statusStats['配送'] || 0;
                break;
              case 'calculation':
                task.count = data.statusStats['売約済み'] || 0;
                break;
              case 'return-receive':
                task.count = Math.floor((data.statusStats['返品'] || 0) * 0.4);
                break;
              case 'return-inspect':
                task.count = Math.floor((data.statusStats['返品'] || 0) * 0.4);
                break;
              case 'return-process':
                task.count = Math.floor((data.statusStats['返品'] || 0) * 0.2);
                break;
              default:
                task.count = 0;
            }

            // ユーザーの担当タスクをカウント
            if ((userType === 'seller' && step.role === 'seller') || 
                (userType === 'staff' && step.role === 'staff')) {
              userActiveTasks += task.count;
            }
          });
        });
        
        setFlowData(steps);
        
        // 統計情報を計算
        const total = Object.values(data.statusStats).reduce((sum: number, count: any) => sum + (count || 0), 0);
        const inProgress = (data.statusStats['入庫'] || 0) + (data.statusStats['検品'] || 0) + (data.statusStats['出荷'] || 0);
        const completed = data.statusStats['売約済み'] || 0;
        const returns = data.statusStats['返品'] || 0;
        
        setTotalStats({ total, inProgress, completed, returns, userActiveTasks });
        
      } catch (error) {
        console.error('Flow data loading error:', error);
        setFlowData(getFlowSteps());
      } finally {
        setLoading(false);
      }
    };

    loadFlowData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadFlowData, 30 * 1000);
    return () => clearInterval(interval);
  }, [userType]);

  const handleStepClick = (stepId: string, taskId?: string) => {
    const baseRoute = userType === 'staff' ? '/staff' : '';
    
    switch (stepId) {
      case 'preparation':
        router.push(userType === 'seller' ? '/delivery' : '/staff/dashboard');
        break;
      case 'inbound':
        if (taskId === 'inspection') {
          router.push('/staff/inspection');
        } else {
          router.push(`${baseRoute}/inventory?filter=inbound`);
        }
        break;
      case 'sales':
        router.push(userType === 'staff' ? '/staff/inventory?filter=listing' : '/sales');
        break;
      case 'shipping':
        if (taskId === 'picking') {
          router.push('/staff/picking');
        } else {
          router.push(userType === 'staff' ? '/staff/shipping' : '/delivery');
        }
        break;
      case 'completion':
        router.push(userType === 'staff' ? '/staff/reports' : '/billing');
        break;
      case 'returns':
        router.push(userType === 'staff' ? '/staff/returns' : '/returns');
        break;
      default:
        router.push(userType === 'staff' ? '/staff/dashboard' : '/dashboard');
    }
  };

  const getCurrentStep = () => {
    if (!currentStage) return null;
    
    // 現在のパスから対応するステップを特定
    if (currentStage.includes('delivery') || currentStage.includes('preparation')) return 'preparation';
    if (currentStage.includes('inbound') || currentStage.includes('inspection')) return 'inbound';
    if (currentStage.includes('listing') || currentStage.includes('sales')) return 'sales';
    if (currentStage.includes('shipping') || currentStage.includes('picking')) return 'shipping';
    if (currentStage.includes('billing') || currentStage.includes('completion')) return 'completion';
    if (currentStage.includes('returns')) return 'returns';
    
    return null;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'seller': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'staff': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'system': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'customer': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      default: 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
              case 'low': return 'bg-nexus-bg-secondary text-nexus-text-secondary';
        default: return 'bg-nexus-bg-secondary text-nexus-text-secondary';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white border-b border-gray-200 ${compact ? 'py-2' : 'py-4'}`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <NexusLoadingSpinner size="md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isCollapsed ? "bg-white border-b border-gray-200" : "intelligence-card global"}>
      <div className={isCollapsed ? "p-4" : "p-8"}>
        <div className="flex flex-col gap-4">
          {/* ヘッダー統計と作業者ステータス */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isCollapsed && (
                <>
                  {/* 作業者の現在の作業状況 */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getRoleIcon(userType === 'seller' ? 'seller' : 'staff')}
                      <span className="text-sm font-medium text-gray-700">
                        {userType === 'seller' ? 'セラー' : 'スタッフ'}
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      担当作業: {totalStats.userActiveTasks}件
                    </div>
                  </div>
                </>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">進行中: {totalStats.inProgress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">完了: {totalStats.completed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-600">総計: {totalStats.total}</span>
                </div>
              </div>
            )}
          </div>

          {/* フローステップ */}
          {!isCollapsed && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {flowData.map((step, index) => {
              const isCurrentStep = getCurrentStep() === step.id;
              const isUserRelevant = (userType === 'seller' && step.role === 'seller') || 
                                   (userType === 'staff' && step.role === 'staff') || 
                                   step.role === 'system';
              const hasUserTasks = (userType === 'seller' && step.role === 'seller') || 
                                 (userType === 'staff' && step.role === 'staff');
              const totalStepTasks = step.tasks.reduce((sum, task) => sum + task.count, 0);
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`
                    relative p-4 rounded-xl transition-all duration-300 text-left group
                    hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${isCurrentStep ? 'ring-2 ring-blue-400 shadow-lg scale-105' : ''}
                    ${hasUserTasks && totalStepTasks > 0 ? 'ring-2 ring-orange-300 bg-orange-50' : ''}
                    ${!isUserRelevant ? 'opacity-60' : 'opacity-100'}
                  `}
                  style={{
                    backgroundColor: hasUserTasks && totalStepTasks > 0 ? '#fff7ed' : step.bgColor,
                    borderLeft: `4px solid ${step.color}`
                  }}
                >
                  {/* ステップヘッダー */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ 
                          backgroundColor: `${step.color}20`,
                          color: step.color 
                        }}
                      >
                        <div className="w-5 h-5">
                          {step.icon}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {step.shortName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {step.role === 'seller' ? 'セラー作業' : 
                           step.role === 'staff' ? 'スタッフ作業' : 
                           step.role === 'system' ? '自動処理' : '顧客対応'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(step.role)}
                      {isCurrentStep && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                      {hasUserTasks && totalStepTasks > 0 && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                      )}
                    </div>
                  </div>

                  {/* タスクリスト */}
                  <div className="space-y-2">
                    {step.tasks.slice(0, compact ? 2 : 3).map((task) => (
                      <div
                        key={task.id}
                        className="w-full flex items-center justify-between text-xs group-hover:bg-white/50 p-2 rounded transition-colors hover:bg-white/70 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStepClick(step.id, task.id);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleStepClick(step.id, task.id);
                          }
                        }}
                        aria-label={`${task.name} - ${task.count}件の作業`}
                        title={`${task.name}をクリックして詳細画面に移動`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 font-medium">{task.name}</span>
                          {task.priority === 'high' && task.count > 0 && (
                            <span className={`px-1 py-0.5 rounded text-[10px] font-medium ${getPriorityColor(task.priority)}`}>
                              緊急
                            </span>
                          )}
                        </div>
                        {showCounts && task.count > 0 && (
                          <span 
                            className="px-2 py-1 rounded-full text-white font-bold text-[10px] min-w-[20px] text-center"
                            style={{ backgroundColor: step.color }}
                            aria-label={`${task.count}件`}
                          >
                            {task.count}
                          </span>
                        )}
                        {showCounts && task.count === 0 && (
                          <span className="text-gray-400 text-[10px]">
                            完了
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 進捗インジケーター */}
                  {!compact && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-[10px] text-gray-500">
                        <span>平均処理時間</span>
                        <span>{Math.max(...step.tasks.map(t => t.avgDays))}日</span>
                      </div>
                      {totalStepTasks > 0 && (
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="h-1 rounded-full transition-all duration-500"
                              style={{ 
                                backgroundColor: step.color,
                                width: `${Math.min(100, (totalStepTasks / 50) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 接続線（デスクトップのみ） */}
                  {index < flowData.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                      <div className="w-8 h-0.5 bg-gray-300 relative">
                        <div className="absolute -right-1 -top-1 w-2 h-2 bg-gray-300 rotate-45 transform origin-center"></div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          )}

          {/* クイックアクションヒント */}
          {!compact && (
            <div className="text-center border-t pt-3">
              <span className="text-xs text-gray-500">
                各ステップをクリックして対応する画面に移動 • 
                <span className="font-medium text-blue-600"> リアルタイム更新中</span>
                {totalStats.userActiveTasks > 0 && (
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px] font-medium">
                    あなたの作業: {totalStats.userActiveTasks}件待機中
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 