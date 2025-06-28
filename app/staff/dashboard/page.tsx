'use client';

import DashboardLayout from '../../components/DashboardLayout';
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
    // Load staff data from mock file
    fetch('/data/staff-mock.json')
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

  if (!staffData) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              スタッフダッシュボード
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              データを読み込み中...
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">データを読み込み中...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              スタッフダッシュボード
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              本日のタスクと進捗状況
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              レポート出力
            </button>
            <button className="button-primary">
              新規タスク作成
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">総タスク数</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">緊急</p>
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
              <p className="text-2xl font-bold text-purple-600">{staffData.staffStats.daily.tasksCompleted}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">本日完了</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">本日の売上</h3>
            <p className="text-3xl font-bold">{staffData.staffStats.daily.totalRevenue}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">検品完了</h3>
            <p className="text-3xl font-bold">{staffData.staffStats.daily.inspectionsCompleted}件</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">出荷処理</h3>
            <p className="text-3xl font-bold">{staffData.staffStats.daily.shipmentsProcessed}件</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">効率スコア</h3>
            <p className="text-3xl font-bold">{staffData.staffStats.weekly.efficiency}%</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col space-y-4 mb-6">
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">優先度フィルター</label>
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
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
                        ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">作業種別フィルター</label>
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
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
                        ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
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
          <div className="space-y-4">
            {getFilteredTasks().map((task) => (
              <div
                key={task.id}
                className={`border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  task.priority === 'high' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 
                  'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{typeIcons[task.type]}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        {task.productId && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {task.productId}
                          </span>
                        )}
                        {task.value && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {task.value}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {task.description}
                      </p>
                      {task.progress !== undefined && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>進捗</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                        </div>
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

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>👤 {task.assignee}</span>
                    <span>📅 {task.dueDate}</span>
                    {task.location && <span>📍 {task.location}</span>}
                    {task.estimatedDuration && <span>⏱️ {task.estimatedDuration}</span>}
                    {task.itemCount && <span>📦 {task.itemCount}件</span>}
                    <span>🏷️ {typeLabels[task.type]}</span>
                  </div>
                  
                  {task.status !== 'completed' && (
                    <div className="flex space-x-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          開始
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          完了
                        </button>
                      )}
                      <button className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors">
                        詳細表示
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {getFilteredTasks().length === 0 && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">該当するタスクがありません</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                フィルター条件を変更してください。
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}