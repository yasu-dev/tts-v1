'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import TaskDetailModal from '../../components/TaskDetailModal';
import EditModal from '../../components/EditModal';
import { useState, useEffect } from 'react';

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
  }, []);

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filter === 'all' || task.status === filter;
    const categoryMatch = categoryFilter === 'all' || task.category === categoryFilter;
    const assigneeMatch = assigneeFilter === 'all' || task.assignedTo === assigneeFilter;
    return statusMatch && categoryMatch && assigneeMatch;
  });

  const priorityColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  const priorityLabels = {
    high: '🔴 高',
    medium: '🟡 中',
    low: '🟢 低',
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

  const categoryIcons = {
    inspection: '🔍',
    listing: '🏪',
    shipping: '🚚',
    returns: '↩️',
    photography: '📸',
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

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              タスク管理
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              作業タスクの詳細管理と進捗追跡
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              一括操作
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="button-primary"
            >
              新規タスク作成
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">総タスク数</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.pending}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">待機中</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">作業中</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">完了</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">緊急</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ステータス
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              >
                <option value="all">すべて</option>
                <option value="pending">待機中</option>
                <option value="in_progress">作業中</option>
                <option value="completed">完了</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                カテゴリー
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                担当者
              </label>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              >
                <option value="all">すべて</option>
                {assignees.map(assignee => (
                  <option key={assignee} value={assignee}>{assignee}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                期限
              </label>
              <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                <option value="all">すべて</option>
                <option value="today">今日</option>
                <option value="tomorrow">明日</option>
                <option value="week">今週</option>
                <option value="overdue">期限超過</option>
              </select>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-2xl">{categoryIcons[task.category]}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        {task.productSku && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-medium rounded">
                            {task.productSku}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {task.description}
                      </p>
                      {task.productName && (
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          📦 {task.productName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
                      {priorityLabels[task.priority]}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[task.status]}`}>
                      {statusLabels[task.status]}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <div>
                    <span className="font-medium">担当:</span> {task.assignedTo}
                  </div>
                  <div>
                    <span className="font-medium">期限:</span> {task.dueDate}
                  </div>
                  <div>
                    <span className="font-medium">予想時間:</span> {task.estimatedTime}分
                  </div>
                  <div>
                    <span className="font-medium">カテゴリ:</span> {categoryLabels[task.category]}
                  </div>
                </div>

                {task.notes && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">備考:</span> {task.notes}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        開始
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        完了
                      </button>
                    )}
                    <button 
                      onClick={() => handleTaskDetail(task)}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                    >
                      詳細
                    </button>
                    <button 
                      onClick={() => handleTaskEdit(task)}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                    >
                      編集
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {task.id}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">タスクがありません</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                条件に一致するタスクが見つかりません。
              </p>
            </div>
          )}
        </div>

        {/* New Task Modal (簡易実装) */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                新規タスク作成
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                デモ版では新規タスク作成機能は実装されていません。
              </p>
              <button
                onClick={() => setShowCreateModal(false)}
                className="button-primary w-full"
              >
                閉じる
              </button>
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
      </div>
    </DashboardLayout>
  );
}