'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import TaskDetailModal from '../../components/TaskDetailModal';
import EditModal from '../../components/EditModal';
import { useState, useEffect } from 'react';
import {
  FunnelIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo: string;
  dueDate: string;
  category: 'inspection' | 'listing' | 'shipping' | 'returns' | 'photography';
  productSku?: string;
  productName?: string;
  estimatedTime: number; // 分
  notes?: string;
}

export default function StaffTasksPage() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // デモデータ
  useEffect(() => {
    const demoTasks: Task[] = [
      {
        id: '1',
        title: 'Canon EOS R5 検品作業',
        description: 'カメラ本体の動作確認、外観チェック、付属品確認、シャッター回数測定',
        priority: 'high',
        status: 'pending',
        assignedTo: '田中',
        dueDate: '2024-06-29',
        category: 'inspection',
        productSku: 'CAM-001',
        productName: 'Canon EOS R5',
        estimatedTime: 90,
        notes: 'セラーより「付属品完備」との申告あり',
      },
      {
        id: '2',
        title: 'Hermès Birkin 商品撮影',
        description: '全角度撮影、真贋確認、状態詳細記録',
        priority: 'high',
        status: 'in_progress',
        assignedTo: '佐藤',
        dueDate: '2024-06-28',
        category: 'photography',
        productSku: 'ACC-003',
        productName: 'Hermès Birkin 30',
        estimatedTime: 120,
        notes: 'プレミアム商品のため特別な撮影ライティング必要',
      },
      {
        id: '3',
        title: 'Rolex Submariner 梱包・出荷',
        description: '高級時計用梱包材使用、保険付き配送手配',
        priority: 'medium',
        status: 'pending',
        assignedTo: '鈴木',
        dueDate: '2024-06-30',
        category: 'shipping',
        productSku: 'WAT-001',
        productName: 'Rolex Submariner',
        estimatedTime: 45,
        notes: '購入者指定の配送時間：午前中',
      },
      {
        id: '4',
        title: 'Sony FE 24-70mm 返品処理',
        description: '返品商品の状態確認、再出品可否判定、写真更新',
        priority: 'medium',
        status: 'completed',
        assignedTo: '山田',
        dueDate: '2024-06-27',
        category: 'returns',
        productSku: 'LEN-002',
        productName: 'Sony FE 24-70mm f/2.8',
        estimatedTime: 60,
        notes: '顧客理由による返品、商品状態良好',
      },
      {
        id: '5',
        title: 'Leica M11 eBay出品作業',
        description: '商品説明文作成、価格設定、カテゴリー設定',
        priority: 'low',
        status: 'pending',
        assignedTo: '田中',
        dueDate: '2024-07-01',
        category: 'listing',
        productSku: 'CAM-005',
        productName: 'Leica M11',
        estimatedTime: 75,
        notes: '類似商品の売却価格を参考に価格設定',
      },
      {
        id: '6',
        title: 'Nikon Z9 検品・撮影',
        description: '動作確認後、商品撮影まで一括対応',
        priority: 'medium',
        status: 'pending',
        assignedTo: '佐藤',
        dueDate: '2024-07-02',
        category: 'inspection',
        productSku: 'CAM-006',
        productName: 'Nikon Z9',
        estimatedTime: 105,
      },
    ];
    setTasks(demoTasks);
    setLoading(false);
  }, []);

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filter === 'all' || task.status === filter;
    const categoryMatch = categoryFilter === 'all' || task.category === categoryFilter;
    const assigneeMatch = assigneeFilter === 'all' || task.assignedTo === assigneeFilter;
    return statusMatch && categoryMatch && assigneeMatch;
  });

  const priorityLabels: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  const statusLabels = {
    pending: '待機中',
    in_progress: '作業中',
    completed: '完了',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    inspection: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    listing: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    shipping: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    returns: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
    photography: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  };

  const categoryLabels = {
    inspection: '検品',
    listing: '出品',
    shipping: '出荷',
    returns: '返品',
    photography: '撮影',
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleTaskDetail = (task: Task) => {
    const taskForModal = {
      id: task.id,
      title: task.title,
      category: task.category,
      assignee: task.assignedTo,
      dueDate: task.dueDate,
      status: task.status,
      priority: task.priority,
      description: task.description
    };
    setSelectedTask(taskForModal);
    setIsDetailModalOpen(true);
  };

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const assignees = Array.from(new Set(tasks.map(task => task.assignedTo)));

  const stats = {
    total: filteredTasks.length,
    pending: filteredTasks.filter(t => t.status === 'pending').length,
    inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    highPriority: filteredTasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
  };

  const taskCategories = [
    { id: 'urgent', name: '緊急タスク', icon: '🔥', color: 'americas' },
    { id: 'today', name: '本日完了', icon: '📅', color: 'europe' },
    { id: 'pending', name: '保留中', icon: '⏸️', color: 'asia' },
    { id: 'review', name: 'レビュー待ち', icon: '👀', color: 'africa' },
    { id: 'completed', name: '完了済み', icon: '✅', color: 'americas' }
  ];

  const handleTaskComplete = (taskId: string) => {
    // Implementation
  };

  const handleApplyFilter = () => {
    showToast({
      title: 'フィルター適用',
      message: 'フィルターを適用しました',
      type: 'success'
    });
    setIsFilterModalOpen(false);
  };
  
  const handleBulkAssign = () => {
    const selectedTasksCount = tasks.filter(t => selectedTasks.includes(t.id)).length;
    if (selectedTasksCount > 0) {
      showToast({
        title: '一括割り当て完了',
        message: `${selectedTasksCount}件のタスクを割り当てました`,
        type: 'success'
      });
      setSelectedTasks([]);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card americas">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  タスク管理
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  作業タスクの詳細管理と進捗追跡
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="nexus-button">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  一括操作
                </button>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="nexus-button primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  新規タスク作成
                </button>
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="nexus-button"
                >
                  <FunnelIcon className="w-5 h-5 mr-2" />
                  フィルター設定
                </button>
                <button
                  onClick={() => setIsBulkAssignModalOpen(true)}
                  className="nexus-button primary"
                >
                  <UsersIcon className="w-5 h-5 mr-2" />
                  タスク一括割当
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="intelligence-card global">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="status-badge info">総計</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {stats.total}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  総タスク数
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge">待機</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {stats.pending}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  待機中
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb blue">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="status-badge info">実行中</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {stats.inProgress}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  作業中
                </div>
              </div>
            </div>

            <div className="intelligence-card africa">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb green">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge success">完了</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {stats.completed}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  完了済み
                </div>
              </div>
            </div>

            <div className="intelligence-card americas">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb red">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge danger">緊急</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {stats.highPriority}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  緊急タスク
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Task List */}
        <div className="intelligence-card global">
          <div className="p-8">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  ステータス
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-sm text-nexus-text-primary"
                >
                  <option value="all">すべて</option>
                  <option value="pending">待機中</option>
                  <option value="in_progress">作業中</option>
                  <option value="completed">完了</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  カテゴリー
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-sm text-nexus-text-primary"
                >
                  <option value="all">すべて</option>
                  <option value="inspection">検品</option>
                  <option value="photography">撮影</option>
                  <option value="listing">出品</option>
                  <option value="shipping">出荷</option>
                  <option value="returns">返品</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  担当者
                </label>
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-sm text-nexus-text-primary"
                >
                  <option value="all">すべて</option>
                  {assignees.map(assignee => (
                    <option key={assignee} value={assignee}>{assignee}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  期限
                </label>
                <select className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-sm text-nexus-text-primary">
                  <option value="all">すべて</option>
                  <option value="today">今日</option>
                  <option value="tomorrow">明日</option>
                  <option value="week">今週</option>
                  <option value="overdue">期限超過</option>
                </select>
              </div>
            </div>

            {/* Task List */}
            <div className="holo-table">
              <table className="w-full">
                <thead className="holo-header">
                  <tr>
                    <th className="text-left">タスク情報</th>
                    <th className="text-left">担当者</th>
                    <th className="text-left">期限・時間</th>
                    <th className="text-left">ステータス</th>
                    <th className="text-right">アクション</th>
                  </tr>
                </thead>
                <tbody className="holo-body">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="holo-row">
                      <td>
                        <div className="flex items-start space-x-3">
                          <span className="action-orb">{categoryIcons[task.category]}</span>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-nexus-text-primary">
                                {task.title}
                              </h3>
                              {task.productSku && (
                                <span className="cert-nano cert-premium">
                                  {task.productSku}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-nexus-text-secondary mb-2">
                              {task.description}
                            </p>
                            {task.productName && (
                              <div className="flex items-center gap-1 text-sm font-medium text-nexus-yellow">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                {task.productName}
                              </div>
                            )}
                            {task.notes && (
                              <div className="mt-2 p-2 bg-nexus-bg-secondary rounded text-xs text-nexus-text-secondary">
                                <span className="font-medium">備考:</span> {task.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm font-medium text-nexus-text-primary">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {task.assignedTo}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-nexus-text-primary">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {task.dueDate}
                          </div>
                          <div className="flex items-center gap-1 text-nexus-text-secondary">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {task.estimatedTime}分
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col space-y-2">
                          <span className="cert-nano cert-premium">
                            {priorityLabels[task.priority]}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[task.status]}`}>
                            {statusLabels[task.status]}
                          </span>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end space-x-2">
                          {task.status === 'pending' && (
                            <button
                              onClick={() => updateTaskStatus(task.id, 'in_progress')}
                              className="nexus-button primary text-xs"
                            >
                              開始
                            </button>
                          )}
                          {task.status === 'in_progress' && (
                            <button
                              onClick={() => updateTaskStatus(task.id, 'completed')}
                              className="nexus-button primary text-xs"
                            >
                              完了
                            </button>
                          )}
                          <button 
                            onClick={() => handleTaskDetail(task)}
                            className="nexus-button text-xs"
                          >
                            詳細
                          </button>
                          <button 
                            onClick={() => handleTaskEdit(task)}
                            className="nexus-button text-xs"
                          >
                            編集
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTasks.length === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-nexus-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-nexus-text-primary">タスクがありません</h3>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  条件に一致するタスクが見つかりません。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* New Task Modal (簡易実装) */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50">
            <div className="intelligence-card global mx-4 max-w-lg w-full">
              <div className="p-6">
                <h3 className="text-lg font-display font-medium text-nexus-text-primary mb-4">
                  新規タスク作成
                </h3>
                <p className="text-sm text-nexus-text-secondary mb-4">
                  デモ版では新規タスク作成機能は実装されていません。
                </p>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="nexus-button primary w-full"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task Detail Modal */}
        <TaskDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          task={selectedTask}
          onEdit={(task) => {
            setIsDetailModalOpen(false);
            setSelectedTask(task);
            setIsEditModalOpen(true);
          }}
        />

        {/* Edit Modal */}
        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          type="task"
          title={selectedTask?.title || ''}
          data={selectedTask || {}}
        />

        {/* Filter Modal */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-30 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
              <h2 className="text-lg font-bold mb-4">フィルター設定</h2>
              {/* TODO: フィルターフォームを実装 */}
              <div className="text-right mt-6">
                <button onClick={() => setIsFilterModalOpen(false)} className="nexus-button mr-2">キャンセル</button>
                <button onClick={handleApplyFilter} className="nexus-button primary">適用</button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Assign Modal */}
        {isBulkAssignModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-30 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
              <h2 className="text-lg font-bold mb-4">タスク一括割当</h2>
              {/* TODO: 割当フォームを実装 */}
              <div className="text-right mt-6">
                <button onClick={() => setIsBulkAssignModalOpen(false)} className="nexus-button mr-2">キャンセル</button>
                <button onClick={handleBulkAssign} className="nexus-button primary">割当</button>
              </div>
            </div>
          </div>
        )}

        {/* 追加コンテンツ - スクロールテスト用 */}
        <div className="intelligence-card global">
          <div className="p-8">
            <h3 className="text-lg font-display font-medium text-nexus-text-primary mb-4">
              タスク統計・分析
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-nexus-text-primary">作業効率分析</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-nexus-text-secondary">平均完了時間</span>
                    <span className="text-sm font-medium text-nexus-text-primary">82分</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-nexus-text-secondary">今日の完了率</span>
                    <span className="text-sm font-medium text-nexus-text-primary">75%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-nexus-text-secondary">期限内完了率</span>
                    <span className="text-sm font-medium text-nexus-text-primary">92%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-nexus-text-primary">カテゴリ別分析</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-nexus-text-secondary">検品作業</span>
                    <span className="text-sm font-medium text-nexus-text-primary">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-nexus-text-secondary">撮影作業</span>
                    <span className="text-sm font-medium text-nexus-text-primary">25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-nexus-text-secondary">出荷作業</span>
                    <span className="text-sm font-medium text-nexus-text-primary">20%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-nexus-text-secondary">その他</span>
                    <span className="text-sm font-medium text-nexus-text-primary">10%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* さらに追加コンテンツ */}
        <div className="intelligence-card europe">
          <div className="p-8">
            <h3 className="text-lg font-display font-medium text-nexus-text-primary mb-4">
              チーム別パフォーマンス
            </h3>
            <div className="space-y-4">
              {['田中', '佐藤', '鈴木', '山田'].map((member, index) => (
                <div key={member} className="flex items-center justify-between p-4 bg-nexus-bg-secondary rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {member.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-nexus-text-primary">{member}</h4>
                      <p className="text-sm text-nexus-text-secondary">完了タスク: {5 + index * 2}件</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-nexus-text-primary">{95 - index * 3}%</div>
                    <div className="text-xs text-nexus-text-secondary">効率スコア</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 最後のコンテンツ */}
        <div className="intelligence-card asia">
          <div className="p-8">
            <h3 className="text-lg font-display font-medium text-nexus-text-primary mb-4">
              今週の予定
            </h3>
            <div className="space-y-3">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-nexus-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-nexus-text-primary">
                      {new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP', { 
                        month: 'short', 
                        day: 'numeric', 
                        weekday: 'short' 
                      })}
                    </h4>
                    <p className="text-sm text-nexus-text-secondary">
                      予定タスク: {Math.floor(Math.random() * 5) + 2}件
                    </p>
                  </div>
                  <div className="text-sm text-nexus-text-secondary">
                    {Math.floor(Math.random() * 200) + 100}分
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* スクロールテスト用の追加スペース */}
        <div className="h-96 flex items-center justify-center border-2 border-dashed border-nexus-border rounded-lg mb-8">
          <div className="text-center">
            <p className="text-nexus-text-secondary mb-2">スクロールテスト用エリア</p>
            <p className="text-sm text-nexus-text-secondary">
              このエリアまでスクロールできれば修正成功です
            </p>
          </div>
        </div>

        {/* さらに追加のスペース */}
        <div className="space-y-6">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="intelligence-card global">
              <div className="p-6">
                <h4 className="font-medium text-nexus-text-primary mb-2">
                  追加セクション {i + 1}
                </h4>
                <p className="text-sm text-nexus-text-secondary">
                  スクロールテストのための追加コンテンツです。このセクションは十分な高さを確保するために追加されています。
                  ページが画面の高さを超えることで、スクロールバーが正常に表示されることを確認できます。
                </p>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-nexus-bg-secondary p-3 rounded">
                    <div className="text-xs text-nexus-text-secondary">データ {i * 3 + 1}</div>
                    <div className="text-lg font-medium text-nexus-text-primary">{Math.floor(Math.random() * 100)}</div>
                  </div>
                  <div className="bg-nexus-bg-secondary p-3 rounded">
                    <div className="text-xs text-nexus-text-secondary">データ {i * 3 + 2}</div>
                    <div className="text-lg font-medium text-nexus-text-primary">{Math.floor(Math.random() * 100)}</div>
                  </div>
                  <div className="bg-nexus-bg-secondary p-3 rounded">
                    <div className="text-xs text-nexus-text-secondary">データ {i * 3 + 3}</div>
                    <div className="text-lg font-medium text-nexus-text-primary">{Math.floor(Math.random() * 100)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 最終確認エリア */}
        <div className="h-32 flex items-center justify-center bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="text-center">
            <p className="text-green-700 font-medium">✅ スクロール修正完了</p>
            <p className="text-sm text-green-600">
              このエリアが見えていれば、スクロール機能が正常に動作しています
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}