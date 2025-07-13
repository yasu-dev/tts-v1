'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import PickingListManager from '@/app/components/features/picking/PickingListManager';
import PickingProgress from '@/app/components/features/picking/PickingProgress';
import PickingHistory from '@/app/components/features/picking/PickingHistory';

interface PickingTask {
  id: string;
  orderId: string;
  customerName: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  items: PickingItem[];
  assignee?: string;
  createdAt: string;
  dueDate: string;
  shippingMethod: string;
  totalItems: number;
  pickedItems: number;
}

interface PickingItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  location: string;
  quantity: number;
  pickedQuantity: number;
  status: 'pending' | 'picked' | 'verified';
  imageUrl?: string;
}

interface PickingStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedToday: number;
  averageTime: string;
  accuracy: number;
}

export default function PickingPage() {
  const [viewMode, setViewMode] = useState<'active' | 'progress' | 'history'>('active');
  const [pickingTasks, setPickingTasks] = useState<PickingTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<PickingTask | null>(null);
  const [stats, setStats] = useState<PickingStats>({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedToday: 0,
    averageTime: '0分',
    accuracy: 0,
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPickingData();
  }, []);

  const fetchPickingData = async () => {
    try {
      // モックデータ
      const mockTasks: PickingTask[] = [
        {
          id: 'PICK-001',
          orderId: 'ORD-2024-0847',
          customerName: 'NEXUS Global Trading',
          priority: 'urgent',
          status: 'pending',
          items: [
            {
              id: 'ITEM-001',
              productId: 'TWD-2024-001',
              productName: 'Canon EOS R5 ボディ',
              sku: 'CAM-001',
              location: 'STD-A-01',
              quantity: 1,
              pickedQuantity: 0,
              status: 'pending',
              imageUrl: '/api/placeholder/60/60',
            },
            {
              id: 'ITEM-002',
              productId: 'TWD-2024-002',
              productName: 'Sony FE 24-70mm F2.8 GM',
              sku: 'LENS-001',
              location: 'HUM-01',
              quantity: 2,
              pickedQuantity: 0,
              status: 'pending',
              imageUrl: '/api/placeholder/60/60',
            },
          ],
          assignee: '田中太郎',
          createdAt: '2024-01-20T10:00:00',
          dueDate: '2024-01-20T15:00:00',
          shippingMethod: 'FedEx Priority',
          totalItems: 3,
          pickedItems: 0,
        },
        {
          id: 'PICK-002',
          orderId: 'ORD-2024-0846',
          customerName: 'EuroTech Solutions',
          priority: 'normal',
          status: 'in_progress',
          items: [
            {
              id: 'ITEM-003',
              productId: 'TWD-2024-003',
              productName: 'Nikon Z9 ボディ',
              sku: 'CAM-003',
              location: 'STD-A-01',
              quantity: 1,
              pickedQuantity: 1,
              status: 'picked',
              imageUrl: '/api/placeholder/60/60',
            },
          ],
          assignee: '佐藤花子',
          createdAt: '2024-01-20T09:00:00',
          dueDate: '2024-01-20T17:00:00',
          shippingMethod: 'DHL Express',
          totalItems: 1,
          pickedItems: 1,
        },
      ];

      setPickingTasks(mockTasks);
      
      // 統計情報を計算
      const stats: PickingStats = {
        totalTasks: mockTasks.length,
        pendingTasks: mockTasks.filter(t => t.status === 'pending').length,
        inProgressTasks: mockTasks.filter(t => t.status === 'in_progress').length,
        completedToday: mockTasks.filter(t => t.status === 'completed').length,
        averageTime: '25分',
        accuracy: 99.5,
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching picking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const priorityConfig = {
    urgent: { label: '緊急', badge: 'danger', color: 'text-red-600' },
    high: { label: '高', badge: 'warning', color: 'text-orange-600' },
    normal: { label: '中', badge: 'info', color: 'text-blue-600' },
    low: { label: '低', badge: 'success', color: 'text-green-600' },
  };

  const statusConfig = {
    pending: { label: '未開始', badge: 'warning' },
    in_progress: { label: '進行中', badge: 'info' },
    completed: { label: '完了', badge: 'success' },
    on_hold: { label: '保留', badge: 'danger' },
  };

  const getFilteredTasks = () => {
    if (filter === 'all') return pickingTasks;
    return pickingTasks.filter(task => task.status === filter);
  };

  const handleStartPicking = (task: PickingTask) => {
    setSelectedTask(task);
    // 実際の実装ではAPIを呼び出してステータスを更新
  };

  const handleItemPicked = (taskId: string, itemId: string) => {
    // アイテムのピッキング完了処理
    setPickingTasks(prev => prev.map(task => 
      task.id === taskId 
        ? {
            ...task,
            items: task.items.map(item =>
              item.id === itemId ? { ...item, status: 'picked' as const, pickedQuantity: item.quantity } : item
            )
          }
        : task
    ));
  };

  if (loading) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <div className="intelligence-card global">
            <div className="p-8">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-12 w-12 border-b-4 border-nexus-yellow rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const headerActions = (
    <button className="nexus-button primary">
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
      </svg>
      バーコードスキャン
    </button>
  );

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="ピッキングリスト"
          subtitle="出荷準備の効率的な商品ピッキング管理"
          userType="staff"
          actions={headerActions}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="intelligence-card global">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-text-secondary">待機中</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    {stats.pendingTasks}
                  </p>
                </div>
                <div className="action-orb yellow">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="intelligence-card global">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-text-secondary">作業中</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    {stats.inProgressTasks}
                  </p>
                </div>
                <div className="action-orb blue">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="intelligence-card global">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-text-secondary">本日完了</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    {stats.completedToday}
                  </p>
                </div>
                <div className="action-orb green">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="intelligence-card global">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-text-secondary">平均作業時間</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    {stats.averageTime}
                  </p>
                </div>
                <div className="action-orb">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex space-x-1 bg-nexus-bg-secondary p-1 rounded-lg mb-4 sm:mb-6">
              {[
                { 
                  key: 'active', 
                  label: 'アクティブリスト', 
                  icon: (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
                    </svg>
                  )
                },
                { 
                  key: 'progress', 
                  label: '進行状況', 
                  icon: (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
                { 
                  key: 'history', 
                  label: '完了履歴', 
                  icon: (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setViewMode(tab.key as any)}
                  className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 ${
                    viewMode === tab.key
                      ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                      : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                  }`}
                >
                  <div className="text-blue-600">{tab.icon}</div>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.slice(0, 2)}</span>
                </button>
              ))}
            </div>

            {/* Content based on view mode */}
            {viewMode === 'active' && <PickingListManager />}
            {viewMode === 'progress' && <PickingProgress />}
            {viewMode === 'history' && <PickingHistory />}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex gap-1 bg-nexus-bg-secondary p-1 rounded-lg">
              {[
                { key: 'all', label: 'すべて' },
                { key: 'pending', label: '未開始' },
                { key: 'in_progress', label: '進行中' },
                { key: 'completed', label: '完了' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`flex-1 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                    filter === tab.key
                      ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                      : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Picking Tasks List */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
              <div className="holo-table min-w-[800px] px-3 sm:px-4 md:px-6 lg:px-8">
                <table className="w-full">
                  <thead className="holo-header">
                    <tr>
                      <th className="text-left py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-xs sm:text-sm">注文情報</th>
                      <th className="text-left py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-xs sm:text-sm">顧客</th>
                      <th className="text-center py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-xs sm:text-sm">優先度</th>
                      <th className="text-center py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-xs sm:text-sm">商品数</th>
                      <th className="text-center py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-xs sm:text-sm">進捗</th>
                      <th className="text-left py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-xs sm:text-sm">担当者</th>
                      <th className="text-center py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-xs sm:text-sm">ステータス</th>
                      <th className="text-center py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-xs sm:text-sm">アクション</th>
                    </tr>
                  </thead>
                  <tbody className="holo-body">
                    {getFilteredTasks().map((task) => {
                      const progress = task.totalItems > 0 
                        ? Math.round((task.pickedItems / task.totalItems) * 100)
                        : 0;
                      
                      return (
                        <tr key={task.id} className="holo-row">
                          <td className="py-2 sm:py-4 px-1 sm:px-2 md:px-4">
                            <div>
                              <p className="font-medium text-nexus-text-primary text-xs sm:text-sm">{task.orderId}</p>
                              <p className="text-xs text-nexus-text-secondary font-mono">{task.id}</p>
                            </div>
                          </td>
                          <td className="py-2 sm:py-4 px-1 sm:px-2 md:px-4">
                            <p className="font-medium text-xs sm:text-sm">{task.customerName}</p>
                            <p className="text-xs text-nexus-text-secondary">{task.shippingMethod}</p>
                          </td>
                          <td className="py-2 sm:py-4 px-1 sm:px-2 md:px-4 text-center">
                            <span className={`status-badge ${priorityConfig[task.priority].badge} text-xs`}>
                              {priorityConfig[task.priority].label}
                            </span>
                          </td>
                          <td className="py-2 sm:py-4 px-1 sm:px-2 md:px-4 text-center font-display text-sm sm:text-base">
                            {task.totalItems}
                          </td>
                          <td className="py-2 sm:py-4 px-1 sm:px-2 md:px-4">
                            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                              <div className="flex-1 bg-nexus-bg-secondary rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    progress === 100 ? 'bg-nexus-green' :
                                    progress > 0 ? 'bg-nexus-blue' :
                                    'bg-gray-300'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium whitespace-nowrap">
                                {task.pickedItems}/{task.totalItems}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 sm:py-4 px-1 sm:px-2 md:px-4 text-xs sm:text-sm">
                            {task.assignee || '-'}
                          </td>
                          <td className="py-2 sm:py-4 px-1 sm:px-2 md:px-4 text-center">
                            <span className={`status-badge ${statusConfig[task.status].badge} text-xs`}>
                              {statusConfig[task.status].label}
                            </span>
                          </td>
                          <td className="py-2 sm:py-4 px-1 sm:px-2 md:px-4 text-center">
                            {task.status === 'pending' ? (
                              <button
                                onClick={() => handleStartPicking(task)}
                                className="nexus-button primary text-xs px-1.5 sm:px-2 py-1"
                              >
                                開始
                              </button>
                            ) : task.status === 'in_progress' ? (
                              <button
                                onClick={() => setSelectedTask(task)}
                                className="nexus-button text-xs px-1.5 sm:px-2 py-1"
                              >
                                詳細
                              </button>
                            ) : (
                              <button className="nexus-button text-xs px-1.5 sm:px-2 py-1" disabled>
                                完了
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Task Detail Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9000] p-4">
            <div className="intelligence-card global max-w-[1600px] w-full max-h-[90vh] overflow-hidden">
              <div className="p-8 border-b border-nexus-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-display font-bold text-nexus-text-primary">
                      ピッキングタスク詳細
                    </h3>
                    <p className="text-nexus-text-secondary">{selectedTask.orderId}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="action-orb"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="mb-6">
                  <h4 className="font-semibold mb-4 text-nexus-text-primary">ピッキングアイテム</h4>
                  <div className="space-y-3">
                    {selectedTask.items.map((item) => (
                      <div key={item.id} className="holo-card p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <img
                              src={item.imageUrl || '/api/placeholder/60/60'}
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <h5 className="font-medium text-nexus-text-primary">
                                {item.productName}
                              </h5>
                              <p className="text-sm text-nexus-text-secondary">
                                SKU: {item.sku} | ロケーション: <span className="font-mono">{item.location}</span>
                              </p>
                              <p className="text-sm mt-1">
                                数量: <span className="font-bold">{item.quantity}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {item.status === 'pending' ? (
                              <button
                                onClick={() => handleItemPicked(selectedTask.id, item.id)}
                                className="nexus-button primary"
                              >
                                ピック完了
                              </button>
                            ) : (
                              <span className="status-badge success">
                                ピック済み
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="nexus-button"
                  >
                    閉じる
                  </button>
                  <button className="nexus-button primary">
                    タスク完了
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 