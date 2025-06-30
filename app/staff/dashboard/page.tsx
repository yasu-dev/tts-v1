'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import { useState, useEffect, useRef } from 'react';

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
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'normal' | 'high' | 'medium' | 'low'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'inspection' | 'photography' | 'shipping' | 'returns'>('all');
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load staff data from API
    fetch('/api/staff/dashboard')
      .then(res => res.json())
      .then((data: StaffData) => {
        setStaffData(data);
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

    return filtered;
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  const priorityLabels = {
    high: '🔴 緊急',
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

  const typeIcons = {
    inspection: '🔍',
    photography: '📸',
    shipping: '🚚',
    returns: '↩️',
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

  if (!staffData) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <div className="intelligence-card global">
            <div className="p-8">
              <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                スタッフダッシュボード
              </h1>
              <p className="mt-1 text-sm text-nexus-text-secondary">
                データを読み込み中...
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-nexus-text-secondary">データを読み込み中...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  スタッフダッシュボード
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  本日のタスクと進捗状況
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="nexus-button">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  レポート出力
                </button>
                <button className="nexus-button primary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  新規タスク作成
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
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
                  {stats.urgent}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  緊急タスク
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

            <div className="intelligence-card oceania">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="status-badge success">本日</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {staffData.staffStats.daily.tasksCompleted}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  本日完了
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="intelligence-card americas">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge success">売上</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {staffData.staffStats.daily.totalRevenue}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  本日の売上
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb blue">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="status-badge info">{staffData.staffStats.daily.inspectionsCompleted}件</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {staffData.staffStats.daily.inspectionsCompleted}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  検品完了
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb green">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  </div>
                  <span className="status-badge success">{staffData.staffStats.daily.shipmentsProcessed}件</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {staffData.staffStats.daily.shipmentsProcessed}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  出荷処理
                </div>
              </div>
            </div>

            <div className="intelligence-card africa">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="status-badge success">{staffData.staffStats.weekly.efficiency}%</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {staffData.staffStats.weekly.efficiency}%
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  効率スコア
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls and Task List */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex flex-col space-y-4 mb-6">
              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">優先度フィルター</label>
                <div className="flex space-x-1 bg-nexus-bg-secondary p-1 rounded-lg">
                  {[
                    { key: 'all', label: 'すべて' },
                    { key: 'urgent', label: '緊急タスク' },
                    { key: 'normal', label: '通常タスク' },
                    { key: 'high', label: '高優先度' },
                    { key: 'medium', label: '中優先度' },
                    { key: 'low', label: '低優先度' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key as any)}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
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

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">作業種別フィルター</label>
                <div className="flex space-x-1 bg-nexus-bg-secondary p-1 rounded-lg">
                  {[
                    { key: 'all', label: 'すべて', icon: '📋' },
                    { key: 'inspection', label: '検品', icon: '🔍' },
                    { key: 'photography', label: '撮影', icon: '📸' },
                    { key: 'shipping', label: '出荷', icon: '🚚' },
                    { key: 'returns', label: '返品', icon: '↩️' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setTypeFilter(tab.key as any)}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 ${
                        typeFilter === tab.key
                          ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                          : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="holo-table">
              <table className="w-full">
                <thead className="holo-header">
                  <tr>
                    <th className="text-left">タスク情報</th>
                    <th className="text-left">担当者</th>
                    <th className="text-left">期限</th>
                    <th className="text-left">ステータス</th>
                    <th className="text-right">アクション</th>
                  </tr>
                </thead>
                <tbody className="holo-body">
                  {getFilteredTasks().map((task) => (
                    <tr key={task.id} className="holo-row">
                      <td>
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{typeIcons[task.type]}</span>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-nexus-text-primary">
                                {task.title}
                              </h3>
                              {task.productId && (
                                <span className="cert-nano cert-premium">
                                  {task.productId}
                                </span>
                              )}
                              {task.value && (
                                <span className="cert-nano cert-mint">
                                  {task.value}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-nexus-text-secondary">
                              {task.description}
                            </p>
                            {task.progress !== undefined && (
                              <div className="mt-2 max-w-xs">
                                <div className="flex justify-between text-xs text-nexus-text-secondary mb-1">
                                  <span>進捗</span>
                                  <span>{task.progress}%</span>
                                </div>
                                <div className="w-full bg-nexus-bg-secondary rounded-full h-2">
                                  <div 
                                    className="bg-nexus-blue h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${task.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-nexus-text-primary">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {task.assignee}
                        </span>
                        <span className="text-xs text-nexus-text-muted">•</span>
                        <span className="text-sm text-nexus-text-primary">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {task.dueDate}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
                            {taskPrioritySettings[task.priority]}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[task.status]}`}>
                            {statusLabels[task.status]}
                          </span>
                        </div>
                      </td>
                      <td className="text-right">
                        {task.status !== 'completed' && (
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
                            <button className="nexus-button text-xs">
                              詳細
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {getFilteredTasks().length === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-nexus-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-nexus-text-primary">該当するタスクがありません</h3>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  フィルター条件を変更してください。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}