'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import PageHeader from '@/app/components/ui/PageHeader';
import TaskCreationModal from '@/app/components/modals/TaskCreationModal';
import TaskDetailModal from '@/app/components/TaskDetailModal';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  DocumentTextIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import HoloTable from '@/app/components/ui/HoloTable';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusSelect from '@/app/components/ui/NexusSelect';
import NexusInput from '@/app/components/ui/NexusInput';
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator';

interface StaffTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  assignee: string;
  dueDate: string;
  type: 'inspection' | 'photography' | 'shipping' | 'returns';
  location?: string;
  estimatedDuration?: string;
  category?: string;
  value?: string;
  itemCount?: number;
  progress?: number;
  batchId?: string;
  productId?: string;
}

// TaskDetailModal用のTask型定義
interface Task {
  id: string;
  title: string;
  category: string;
  assignee: string;
  dueDate: string;
  status: string;
  priority: string;
  description?: string;
}

interface StaffData {
  staffTasks: {
    urgentTasks: StaffTask[];
    normalTasks: StaffTask[];
  };
  staffStats: {
    daily: {
      tasksCompleted: number;
      inspectionsCompleted: number;
      shipmentsProcessed: number;
      returnsProcessed: number;
      totalRevenue: string;
    };
    weekly: {
      efficiency: number;
      qualityScore: number;
      customerSatisfaction: number;
    };
  };
}

export default function StaffDashboard() {
  const { showToast } = useToast();
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'normal' | 'high' | 'medium' | 'low'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'inspection' | 'photography' | 'shipping' | 'returns'>('all');
  const timelineRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskEditModalOpen, setIsTaskEditModalOpen] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load staff data from API
    fetch('/api/staff/dashboard')
      .then(res => res.json())
      .then((data: StaffData) => {
        setStaffData(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const getAllTasks = (): StaffTask[] => {
    if (!staffData) return [];
    return [...staffData.staffTasks.urgentTasks, ...staffData.staffTasks.normalTasks];
  };

  const getFilteredTasks = (): StaffTask[] => {
    const allTasks = getAllTasks();
    let filtered = allTasks;

    // Apply priority/urgency filter
    if (filter === 'urgent') {
      filtered = staffData?.staffTasks.urgentTasks || [];
    } else if (filter === 'normal') {
      filtered = staffData?.staffTasks.normalTasks || [];
    } else if (filter !== 'all') {
      filtered = allTasks.filter(task => task.priority === filter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(task => task.type === typeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const priorityLabels: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  };

  // ステータス表示は BusinessStatusIndicator で統一

  const typeIcons = {
    inspection: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    photography: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    shipping: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    returns: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
      </svg>
    ),
  };

  const typeLabels = {
    inspection: '検品',
    photography: '撮影',
    shipping: '出荷',
    returns: '返品',
  };

  const updateTaskStatus = (taskId: string, newStatus: StaffTask['status']) => {
    if (!staffData) return;
    
    const newStaffData = { ...staffData };
    
    // Update in urgent tasks
    const urgentIndex = newStaffData.staffTasks.urgentTasks.findIndex(t => t.id === taskId);
    if (urgentIndex !== -1) {
      newStaffData.staffTasks.urgentTasks[urgentIndex].status = newStatus;
    }
    
    // Update in normal tasks
    const normalIndex = newStaffData.staffTasks.normalTasks.findIndex(t => t.id === taskId);
    if (normalIndex !== -1) {
      newStaffData.staffTasks.normalTasks[normalIndex].status = newStatus;
    }
    
    setStaffData(newStaffData);
  };

  const allTasks = getAllTasks();
  const stats = {
    total: allTasks.length,
    pending: allTasks.filter(t => t.status === 'pending').length,
    inProgress: allTasks.filter(t => t.status === 'in_progress').length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    urgent: staffData?.staffTasks.urgentTasks.filter(t => t.status !== 'completed').length || 0,
  };

  const taskPrioritySettings = {
    high: '緊急',
    medium: '中',
    low: '低',
  };

  const taskCategorySettings = {
    inspection: '',
    photography: '',
    shipping: '',
    returns: '',
  };

  const taskCategories = [
    { key: 'inspection', label: '検品', icon: '' },
    { key: 'photography', label: '撮影', icon: '' },
    { key: 'shipping', label: '出荷', icon: '' },
    { key: 'returns', label: '返品', icon: '' },
  ];

  const handleCreateTask = () => {
    setIsNewTaskModalOpen(true);
  };

  const handleEditTask = (task: StaffTask) => {
    // StaffTaskをTask型に変換
    const taskData: Task = {
      id: task.id,
      title: task.title,
      category: task.type || 'inspection',
      assignee: task.assignee,
      dueDate: task.dueDate,
      status: task.status,
      priority: task.priority,
      description: task.description
    };
    setSelectedTask(taskData);
    setIsTaskEditModalOpen(true);
    setIsTaskDetailModalOpen(false);
  };

  const handleSaveTaskEdit = (updatedTask: any) => {
    if (!staffData || !selectedTask) return;
    
    const newStaffData = { ...staffData };
    
    // タスクの更新処理
    const urgentIndex = newStaffData.staffTasks.urgentTasks.findIndex(t => t.id === selectedTask.id);
    if (urgentIndex !== -1) {
      newStaffData.staffTasks.urgentTasks[urgentIndex] = { ...selectedTask, ...updatedTask };
    } else {
      const normalIndex = newStaffData.staffTasks.normalTasks.findIndex(t => t.id === selectedTask.id);
      if (normalIndex !== -1) {
        newStaffData.staffTasks.normalTasks[normalIndex] = { ...selectedTask, ...updatedTask };
      }
    }
    
    setStaffData(newStaffData);
    setIsTaskEditModalOpen(false);
    setSelectedTask(null);
    
    showToast({
      title: 'タスク更新',
      message: 'タスク情報を更新しました',
      type: 'success'
    });
  };

  const handleTaskCreation = async (taskData: any) => {
    try {
      // デモ版: 実際のAPIが存在しなくても動作するモック実装
      // TaskCreationModalが既に成功メッセージを表示するので、ここでは重複を避ける
      
      // 新しいタスクを既存のタスクリストに追加
      if (staffData) {
        const newTask: StaffTask = {
          id: taskData.id,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          status: 'pending',
          assignee: taskData.assignedToName || '未割り当て',
          dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
          type: taskData.category,
          estimatedDuration: taskData.estimatedTime ? `${taskData.estimatedTime}分` : undefined,
          progress: 0
        };

        const updatedStaffData = {
          ...staffData,
          staffTasks: {
            ...staffData.staffTasks,
            normalTasks: [...staffData.staffTasks.normalTasks, newTask]
          }
        };

        setStaffData(updatedStaffData);
        setIsNewTaskModalOpen(false);
      }
    } catch (error) {
      console.error('タスク作成エラー:', error);
      showToast({
        title: 'エラー',
        message: 'タスクの作成に失敗しました',
        type: 'error'
      });
    }
  };

  const handleTaskDetail = (task: StaffTask) => {
    // StaffTaskをTaskDetailModalで使用するTask形式に変換
    const taskDetailData = {
      id: task.id,
      title: task.title,
      category: task.type || 'inspection', // typeがundefinedの場合のデフォルト値
      assignee: task.assignee,
      dueDate: task.dueDate,
      status: task.status,
      priority: task.priority,
      description: task.description,
      attachments: [],
      comments: []
    };
    setSelectedTask(taskDetailData);
    setIsTaskDetailModalOpen(true);
  };

  if (loading || !staffData) {
    return (
      <DashboardLayout userType="staff">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-b-4 border-nexus-yellow rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  const headerActions = (
    <NexusButton
      onClick={handleCreateTask}
      variant="primary"
      icon={<PlusIcon className="w-5 h-5" />}
    >
      <span className="hidden sm:inline">新規タスク作成</span>
      <span className="sm:hidden">新規作成</span>
    </NexusButton>
  );

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="intelligence-card global">
          <div className="p-8">
            <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
              スタッフダッシュボード
            </h1>
            <p className="mt-2 text-nexus-text-secondary">
              作業進捗とタスク管理の統合画面
            </p>
          </div>
        </div>

        {/* Task Creation Modal */}
        <TaskCreationModal
          isOpen={isNewTaskModalOpen}
          onClose={() => setIsNewTaskModalOpen(false)}
          onSubmit={handleTaskCreation}
        />

        {/* Stats Cards */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            <div className="intelligence-card global">
              <div className="p-2 sm:p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="status-badge info text-[10px] sm:text-xs">総計</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.total}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  総タスク数
                </div>
              </div>
            </div>

            <div className="intelligence-card americas">
              <div className="p-2 sm:p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb red w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge danger text-[10px] sm:text-xs">緊急</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.urgent}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  緊急タスク
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-2 sm:p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge text-[10px] sm:text-xs">待機</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.pending}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  待機中
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-2 sm:p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb blue w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="status-badge info text-[10px] sm:text-xs">実行中</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.inProgress}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  作業中
                </div>
              </div>
            </div>

            <div className="intelligence-card africa">
              <div className="p-2 sm:p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb green w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge success text-[10px] sm:text-xs">完了</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.completed}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  完了済み
                </div>
              </div>
            </div>

            <div className="intelligence-card oceania">
              <div className="p-2 sm:p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="status-badge success text-[10px] sm:text-xs">本日</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {staffData.staffStats.daily.tasksCompleted}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  本日完了
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="intelligence-card americas">
              <div className="p-2 sm:p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge success text-[10px] sm:text-xs">売上</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {staffData.staffStats.daily.totalRevenue}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  本日の売上
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-2 sm:p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb blue w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="status-badge info text-[10px] sm:text-xs">{staffData.staffStats.daily.inspectionsCompleted}件</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {staffData.staffStats.daily.inspectionsCompleted}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  検品完了
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-2 sm:p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb green w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  </div>
                  <span className="status-badge success text-[10px] sm:text-xs">{staffData.staffStats.daily.shipmentsProcessed}件</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {staffData.staffStats.daily.shipmentsProcessed}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  出荷処理
                </div>
              </div>
            </div>

            <div className="intelligence-card africa">
              <div className="p-2 sm:p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="status-badge success text-[10px] sm:text-xs">{staffData.staffStats.weekly.efficiency}%</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {staffData.staffStats.weekly.efficiency}%
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  効率スコア
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Priority Filter */}
              <div>
                <NexusSelect
                  label="優先度フィルター"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  options={[
                    { value: 'all', label: 'すべて' },
                    { value: 'urgent', label: '緊急タスク' },
                    { value: 'normal', label: '通常タスク' },
                    { value: 'high', label: '高優先度' },
                    { value: 'medium', label: '中優先度' },
                    { value: 'low', label: '低優先度' }
                  ]}
                />
              </div>

              {/* Type Filter */}
              <div>
                <NexusSelect
                  label="作業種別フィルター"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  options={[
                    { value: 'all', label: 'すべて' },
                    { value: 'inspection', label: '検品' },
                    { value: 'photography', label: '撮影' },
                    { value: 'shipping', label: '出荷' },
                    { value: 'returns', label: '返品' }
                  ]}
                />
              </div>

              {/* Search */}
              <div>
                <NexusInput
                  type="text"
                  label="検索"
                  placeholder="タスク名・担当者で検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="holo-table">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-nexus-border">
                    <th className="text-left p-4 font-medium text-nexus-text-secondary w-[35%]">タスク情報</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary w-[20%]">担当者/期限</th>
                    <th className="text-left p-4 font-medium text-nexus-text-secondary w-[20%]">ステータス</th>
                    <th className="text-right p-4 font-medium text-nexus-text-secondary w-[25%]">アクション</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredTasks().length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-8 text-nexus-text-secondary">
                        該当するタスクがありません。フィルター条件を変更してください。
                      </td>
                    </tr>
                  ) : (
                    getFilteredTasks().map((row) => (
                      <tr key={row.id} className="border-b border-nexus-border hover:bg-nexus-bg-tertiary">
                        <td className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 text-nexus-text-secondary">{typeIcons[row.type as keyof typeof typeIcons]}</div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-nexus-text-primary">
                                  {row.title}
                                </h3>
                                {row.productId && (
                                  <span className="cert-nano cert-premium">
                                    {row.productId}
                                  </span>
                                )}
                                {row.value && (
                                  <span className="cert-nano cert-mint">
                                    {row.value}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-nexus-text-secondary">
                                {row.description}
                              </p>
                              {row.progress !== undefined && (
                                <div className="mt-2 max-w-[1600px]">
                                  <div className="flex justify-between text-xs text-nexus-text-secondary mb-1">
                                    <span>進捗</span>
                                    <span>{row.progress}%</span>
                                  </div>
                                  <div className="w-full bg-nexus-bg-secondary rounded-full h-2">
                                    <div 
                                      className="bg-nexus-blue h-2 rounded-full transition-all duration-300" 
                                      style={{ width: `${row.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="text-sm text-nexus-text-primary">
                              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {row.assignee}
                            </div>
                            <div className="text-sm text-nexus-text-primary">
                              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {row.dueDate}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className="cert-nano cert-premium">
                              {(priorityLabels[row.priority as keyof typeof priorityLabels] as unknown) as string}
                            </span>
                            <BusinessStatusIndicator status={row.status} />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end space-x-2">
                            {row.status === 'pending' && (
                              <NexusButton
                                onClick={() => updateTaskStatus(row.id, 'in_progress')}
                                variant="primary"
                                size="sm"
                              >
                                開始
                              </NexusButton>
                            )}
                            {row.status === 'in_progress' && (
                              <NexusButton
                                onClick={() => updateTaskStatus(row.id, 'completed')}
                                variant="primary"
                                size="sm"
                              >
                                完了
                              </NexusButton>
                            )}
                            <NexusButton 
                              onClick={() => handleTaskDetail(row as StaffTask)}
                              size="sm"
                            >
                              詳細
                            </NexusButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* TaskDetailModal */}
      <TaskDetailModal
        isOpen={isTaskDetailModalOpen}
        onClose={() => {
          setIsTaskDetailModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onEdit={(task: Task) => {
          // Task型からStaffTask型への変換が必要な場合のハンドラー
          // 現在はTask型のみを扱うため、直接処理
          setSelectedTask(task);
          setIsTaskEditModalOpen(true);
          setIsTaskDetailModalOpen(false);
        }}
      />

      {/* Task Edit Modal */}
      <TaskCreationModal
        isOpen={isTaskEditModalOpen}
        onClose={() => {
          setIsTaskEditModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleSaveTaskEdit}
      />
    </DashboardLayout>
  );
}