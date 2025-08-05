'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import TaskDetailModal from '../../components/TaskDetailModal';
import EditModal from '../../components/EditModal';
import TaskCreationModal from '../../components/modals/TaskCreationModal';
import { BaseModal, BusinessStatusIndicator, Pagination, NexusCheckbox, NexusLoadingSpinner } from '@/app/components/ui';
import NexusInput from '@/app/components/ui/NexusInput';
import NexusSelect from '@/app/components/ui/NexusSelect';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import NexusButton from '@/app/components/ui/NexusButton';
import { useState, useEffect, useMemo } from 'react';
import {
  FunnelIcon,
  UsersIcon,
  PlusIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface Task {
  id: string;
  title: string;
  description: string;

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
  const [dueDateFilter, setDueDateFilter] = useState<string>('all');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paginatedTasks, setPaginatedTasks] = useState<Task[]>([]);

  // APIからタスクデータを取得
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/staff/tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        
        // APIレスポンスの形式に合わせてデータを変換
        const tasksData: Task[] = data.tasks ? data.tasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description,

          status: task.status,
          assignedTo: task.assignedTo || 'スタッフ',
          dueDate: task.dueDate,
          category: task.category,
          productSku: task.productSku,
          productName: task.productName,
          estimatedTime: task.estimatedTime || 60,
          notes: task.notes,
        })) : [];
        
        setTasks(tasksData);
        console.log(`✅ タスクデータ取得完了: ${tasksData.length}件`);
      } catch (error) {
        console.error('タスクデータ取得エラー:', error);
        showToast({
          title: 'データ取得エラー',
          message: 'タスクデータの取得に失敗しました',
          type: 'error'
        });
        // フォールバック: 空配列
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // ステータスフィルター
      if (filter !== 'all' && task.status !== filter) return false;
      
      // カテゴリーフィルター
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
      
      // 担当者フィルター
      if (assigneeFilter !== 'all' && task.assignedTo !== assigneeFilter) return false;
      

      
      // 期限フィルター
      if (dueDateFilter !== 'all') {
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        switch (dueDateFilter) {
          case 'today':
            if (taskDate.toDateString() !== today.toDateString()) return false;
            break;
          case 'tomorrow':
            if (taskDate.toDateString() !== tomorrow.toDateString()) return false;
            break;
          case 'week':
            if (taskDate < today || taskDate > weekEnd) return false;
            break;
          case 'overdue':
            if (taskDate >= today) return false;
            break;
          default:
            break;
        }
      }
      
      // 検索クエリフィルター
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDescription = task.description.toLowerCase().includes(query);
        const matchesProductName = task.productName?.toLowerCase().includes(query);
        const matchesProductSku = task.productSku?.toLowerCase().includes(query);
        const matchesAssignee = task.assignedTo.toLowerCase().includes(query);
        const matchesNotes = task.notes?.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesDescription && !matchesProductName && 
            !matchesProductSku && !matchesAssignee && !matchesNotes) {
          return false;
        }
      }
      
      return true;
    });
  }, [tasks, filter, categoryFilter, assigneeFilter, dueDateFilter, searchQuery]);

  // ページネーション
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedTasks(filteredTasks.slice(startIndex, endIndex));
  }, [filteredTasks, currentPage, itemsPerPage]);

  // フィルタ変更時はページを1に戻す
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, categoryFilter, assigneeFilter, dueDateFilter, searchQuery]);





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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
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

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      // API呼び出し
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus })
      });
      
      if (response.ok) {
        // UI状態更新
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
        
        showToast({
          type: 'success',
          title: 'ステータス更新完了',
          message: `タスクのステータスを${newStatus === 'in_progress' ? '作業中' : '完了'}に変更しました`,
          duration: 3000
        });
      } else {
        throw new Error('ステータス更新に失敗しました');
      }
    } catch (error) {
      console.error('Task status update error:', error);
      showToast({
        type: 'error',
        title: 'ステータス更新エラー',
        message: error instanceof Error ? error.message : 'ステータス更新中にエラーが発生しました',
        duration: 4000
      });
    }
  };

  const handleTaskDetail = (task: Task) => {
    const taskForModal = {
      id: task.id,
      title: task.title,
      category: task.category,
      assignee: task.assignedTo,
      dueDate: task.dueDate,
      status: task.status,
      description: task.description,
      notes: task.notes
    };
    setSelectedTask(taskForModal);
    setIsDetailModalOpen(true);
  };

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const response = await fetch(`/api/tasks?id=${taskToDelete}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // タスクをリストから削除
        setTasks(prev => prev.filter(t => t.id !== taskToDelete));
        
        showToast({
          type: 'success',
          title: 'タスク削除完了',
          message: 'タスクを削除しました',
          duration: 3000
        });
        
        setIsDeleteModalOpen(false);
        setTaskToDelete(null);
      } else {
        throw new Error('タスク削除に失敗しました');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'エラー',
        message: 'タスク削除中にエラーが発生しました',
        duration: 4000
      });
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      
      if (response.ok) {
        // タスクリストを更新
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        
        showToast({
          type: 'success',
          title: 'タスク更新完了',
          message: 'タスク情報を更新しました',
          duration: 3000
        });
        
        setIsEditModalOpen(false);
        setSelectedTask(null);
      } else {
        throw new Error('タスク更新に失敗しました');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'エラー',
        message: 'タスク更新中にエラーが発生しました',
        duration: 4000
      });
    }
  };

  const assignees = useMemo(() => {
    return Array.from(new Set(tasks.map(task => task.assignedTo)));
  }, [tasks]);

  const stats = useMemo(() => {
    return {
      total: filteredTasks.length,
      pending: filteredTasks.filter(t => t.status === 'pending').length,
      inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
      completed: filteredTasks.filter(t => t.status === 'completed').length,

    };
  }, [filteredTasks]);

  const taskCategories = [

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
  
  const handleBulkAssign = async () => {
    const selectedTasksCount = selectedTasks.length;
    if (selectedTasksCount === 0) {
      showToast({
        title: '選択エラー',
        message: 'タスクが選択されていません',
        type: 'warning'
      });
      return;
    }

    try {
      const response = await fetch('/api/tasks/bulk-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskIds: selectedTasks,
          assignee: '新しい担当者', // 実際はフォームから取得
          priority: 'medium', // 実際はフォームから取得
          dueDate: new Date().toISOString().split('T')[0] // 実際はフォームから取得
        })
      });
      
      if (response.ok) {
        // 選択されたタスクの状態を更新
        setTasks(prev => prev.map(task => 
          selectedTasks.includes(task.id) 
            ? { ...task, assignedTo: '新しい担当者' }
            : task
        ));
        
        showToast({
          title: '一括割り当て完了',
          message: `${selectedTasksCount}件のタスクを割り当てました`,
          type: 'success'
        });
        
        setSelectedTasks([]);
        setIsBulkAssignModalOpen(false);
      } else {
        throw new Error('一括割り当てに失敗しました');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'エラー',
        message: '一括割り当て中にエラーが発生しました',
        duration: 4000
      });
    }
  };

  const handleCreateTask = () => {
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoadingSpinner size="lg" />
      </div>
    );
  }

  const headerActions = (
    <>
      <NexusButton
        onClick={handleCreateTask}
        variant="primary"
        icon={<PlusIcon className="w-5 h-5" />}
      >
        <span className="hidden sm:inline">新規タスク作成</span>
        <span className="sm:hidden">新規作成</span>
      </NexusButton>
      <NexusButton
        onClick={handleBulkAssign}
        variant="secondary"
        icon={<UserGroupIcon className="w-5 h-5" />}
        disabled={selectedTasks.length === 0}
      >
        <span className="hidden sm:inline">一括割り当て</span>
        <span className="sm:hidden">一括</span>
      </NexusButton>
    </>
  );

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="タスク管理"
          subtitle="作業タスクの詳細管理と進捗追跡"
          userType="staff"
          iconType="tasks"
          actions={headerActions}
        />

        {/* タスク管理統計 - 他の画面と統一されたスタイル */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-600 text-white">待機</span>
                </div>
            <div className="text-3xl font-bold text-nexus-text-primary mb-2">
              {stats.pending}件
                </div>
            <div className="text-nexus-text-secondary font-medium">
              待機中タスク
                </div>
            <div className="text-xs text-nexus-text-secondary mt-1">今日開始予定</div>
            </div>

          <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">進行中</span>
                </div>
            <div className="text-3xl font-bold text-nexus-text-primary mb-2">
              {stats.inProgress}件
                </div>
            <div className="text-nexus-text-secondary font-medium">
              作業中タスク
                </div>
            <div className="text-xs text-nexus-text-secondary mt-1">進行中の作業</div>
            </div>

          <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">急ぎ</span>
                </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.completed}件
                </div>
            <div className="text-nexus-text-secondary font-medium">
              完了済み
                </div>
            <div className="text-xs text-nexus-text-secondary mt-1">今日の実績</div>
            </div>

          <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">今日</span>
                </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.completed}件
                </div>
            <div className="text-nexus-text-secondary font-medium">
              本日完了
                </div>
            <div className="text-xs text-nexus-text-secondary mt-1">今日の実績</div>
          </div>
        </div>

        {/* メインコンテンツ - 他の画面と統一されたレイアウト */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-nexus-border p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="タスク名、商品名、SKU、担当者、備考で検索..."
                  className="block w-full pl-10 pr-3 py-3 border border-nexus-border rounded-lg bg-nexus-bg-secondary text-nexus-text-primary placeholder-nexus-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
                <NexusSelect
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  size="sm"
                  options={[
                    { value: "all", label: "すべて" },
                    ...assignees.map(assignee => ({ value: assignee, label: assignee }))
                  ]}
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  期限
                </label>
                <select
                  value={dueDateFilter}
                  onChange={(e) => setDueDateFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-sm text-nexus-text-primary"
                >
                  <option value="all">すべて</option>
                  <option value="today">今日</option>
                  <option value="tomorrow">明日</option>
                  <option value="week">今週</option>
                  <option value="overdue">期限超過</option>
                </select>
              </div>
            </div>

            {/* タスクテーブル */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-nexus-border">
                    <th className="text-left p-4 font-medium text-nexus-text-secondary">タスク情報</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">担当者</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">期限・時間</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">ステータス</th>
                    <th className="text-center p-4 font-medium text-nexus-text-secondary">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTasks.map((task) => (
                    <tr key={task.id} className="border-b border-nexus-border hover:bg-nexus-bg-tertiary transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-nexus-text-primary mb-1">
                                {task.title}
                            </div>
                        <div className="text-sm text-nexus-text-secondary mb-2">
                              {task.description}
                        </div>
                            {task.productName && (
                          <div className="text-xs text-nexus-text-secondary">
                            商品: {task.productName}
                              </div>
                            )}
                        {task.productSku && (
                          <div className="text-xs text-nexus-text-secondary">
                            SKU: {task.productSku}
                              </div>
                            )}
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-sm text-nexus-text-primary">
                          {task.assignedTo}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="text-sm text-nexus-text-primary">
                            {task.dueDate}
                          </div>
                        <div className="text-xs text-nexus-text-secondary">
                            {task.estimatedTime}分
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-center space-y-1">

                          <BusinessStatusIndicator status={task.status} size="sm" />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <NexusButton
                            onClick={() => handleTaskDetail(task)}
                            size="sm"
                            variant="primary"
                          >
                            詳細
                          </NexusButton>
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

            {/* ページネーション */}
            {filteredTasks.length > 0 && (
              <div className="mt-6 pt-4 border-t border-nexus-border">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredTasks.length / itemsPerPage)}
                  totalItems={filteredTasks.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            )}
          </div>
        </div>

        {/* Task Creation Modal */}
        <TaskCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (newTask) => {
            try {
              // API呼び出し
              const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask)
              });
              
              if (response.ok) {
                const result = await response.json();
                // 新しいタスクをリストに追加
                setTasks(prev => [...prev, { ...newTask, id: result.task.id }]);
                
                showToast({
                  type: 'success',
                  title: 'タスク作成完了',
                  message: `新しいタスクが作成されました: ${newTask.title}`
                });
                
                setShowCreateModal(false);
              } else {
                throw new Error('タスク作成に失敗しました');
              }
            } catch (error) {
              showToast({
                type: 'error',
                title: 'エラー',
                message: 'タスク作成中にエラーが発生しました',
                duration: 4000
              });
            }
          }}
        />

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
          onStatusChange={updateTaskStatus}
          onDelete={async (taskId) => {
            setTasks(prev => prev.filter(t => t.id !== taskId));
            setIsDetailModalOpen(false);
            setSelectedTask(null);
          }}
        />

        {/* Edit Modal */}
        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTask(null);
          }}
          type="task"
          title={selectedTask?.title || ''}
          data={selectedTask || {}}
        />

        {/* Filter Modal */}
        <BaseModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          title="高度なフィルター設定"
          size="lg"
        >
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    作成日範囲
                  </label>
                  <div className="space-y-2">
                    <NexusInput
                      type="date"
                      size="sm"
                      placeholder="開始日"
                    />
                    <NexusInput
                      type="date"
                      size="sm"
                      placeholder="終了日"
                    />
                  </div>
                </div>
                
                <div>
                  <NexusSelect
                    label="推定作業時間"
                    size="sm"
                    options={[
                      { value: "", label: "すべて" },
                      { value: "short", label: "短時間（30分以下）" },
                      { value: "medium", label: "中時間（30分-2時間）" },
                      { value: "long", label: "長時間（2時間以上）" }
                    ]}
                  />
                </div>

                <div>
                  <NexusSelect
                    label="商品カテゴリー"
                    size="sm"
                    options={[
                      { value: "", label: "すべて" },
                      { value: "camera", label: "カメラ" },
                      { value: "watch", label: "時計" },
                      { value: "bag", label: "バッグ" },
                      { value: "jewelry", label: "ジュエリー" }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    タスクタグ
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['重要', '簡単', '複雑', '要確認'].map(tag => (
                      <NexusCheckbox
                        key={tag}
                        label={tag}
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <NexusButton
                  onClick={() => {
                    // フィルターリセット
                    setFilter('all');
                    setCategoryFilter('all');
                    setAssigneeFilter('all');

                    setDueDateFilter('all');
                    setSearchQuery('');
                    showToast({
                      title: 'フィルターリセット',
                      message: 'すべてのフィルターをリセットしました',
                      type: 'info'
                    });
                  }}
                >
                  リセット
                </NexusButton>
                <div className="space-x-2">
                  <NexusButton onClick={() => setIsFilterModalOpen(false)}>
                    キャンセル
                  </NexusButton>
                  <NexusButton onClick={handleApplyFilter} variant="primary">
                    適用
                  </NexusButton>
                </div>
              </div>
            </div>
        </BaseModal>

        {/* Bulk Assign Modal */}
        <BaseModal
          isOpen={isBulkAssignModalOpen}
          onClose={() => setIsBulkAssignModalOpen(false)}
          title="タスク一括割当"
          size="md"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                選択されたタスク ({selectedTasks.length}件)
              </label>
              <div className="border border-nexus-border rounded-lg p-3 bg-nexus-bg-secondary">
                {selectedTasks.length > 0 ? (
                  <div className="space-y-1">
                    {selectedTasks.map(taskId => {
                      const task = tasks.find(t => t.id === taskId);
                      return (
                        <div key={taskId} className="text-sm text-nexus-text-primary">
                          {task?.title || taskId}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-nexus-text-secondary">タスクが選択されていません</div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                担当者選択 (複数選択可)
              </label>
              <div className="space-y-2 border border-nexus-border rounded-lg p-3">
                <NexusCheckbox
                  label="田中太郎"
                  size="sm"
                />
                <NexusCheckbox
                  label="佐藤花子"
                  size="sm"
                />
                <NexusCheckbox
                  label="山田次郎"
                  size="sm"
                />
                <NexusCheckbox
                  label="鈴木美香"
                  size="sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  期限設定
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                割当理由・備考
              </label>
              <NexusTextarea
                rows={3}
                placeholder="割当理由や特記事項を入力してください"
              />
            </div>
            
            <div className="text-right mt-6 space-x-2">
                <NexusButton onClick={() => setIsBulkAssignModalOpen(false)}>キャンセル</NexusButton>
                <NexusButton onClick={handleBulkAssign} variant="primary">割当</NexusButton>
              </div>
          </div>
        </BaseModal>

        {/* Delete Confirmation Modal */}
        <BaseModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setTaskToDelete(null);
          }}
          title="タスク削除の確認"
          size="md"
        >
          <div>
            <p className="text-nexus-text-primary mb-4">
              このタスクを削除しますか？
            </p>
            <p className="text-nexus-text-secondary text-sm mb-6">
              この操作は元に戻せません。
            </p>
            <div className="flex justify-end gap-3">
              <NexusButton
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTaskToDelete(null);
                }}
                variant="default"
              >
                キャンセル
              </NexusButton>
              <NexusButton
                onClick={confirmDeleteTask}
                variant="danger"
              >
                削除する
              </NexusButton>
            </div>
          </div>
        </BaseModal>






      </div>
    </DashboardLayout>
  );
}