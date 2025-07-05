'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowDownTrayIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface WorkloadData {
  staff: string;
  tasksCompleted: number;
  tasksInProgress: number;
  avgCompletionTime: number; // 時間
  efficiency: number; // パーセント
}

interface PerformanceData {
  date: string;
  inspections: number;
  listings: number;
  shipments: number;
  issues: number;
}

export default function StaffReportsPage() {
  const { showToast } = useToast();
  const [workloadData, setWorkloadData] = useState<WorkloadData[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedMetric, setSelectedMetric] = useState<'productivity' | 'quality' | 'efficiency'>('productivity');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const performanceRef = useRef<HTMLDivElement>(null);

  // デモデータ
  useEffect(() => {
    const demoWorkloadData: WorkloadData[] = [
      {
        staff: '田中',
        tasksCompleted: 24,
        tasksInProgress: 3,
        avgCompletionTime: 2.5,
        efficiency: 92,
      },
      {
        staff: '佐藤',
        tasksCompleted: 28,
        tasksInProgress: 2,
        avgCompletionTime: 2.1,
        efficiency: 96,
      },
      {
        staff: '鈴木',
        tasksCompleted: 22,
        tasksInProgress: 4,
        avgCompletionTime: 2.8,
        efficiency: 88,
      },
      {
        staff: '山田',
        tasksCompleted: 26,
        tasksInProgress: 1,
        avgCompletionTime: 2.3,
        efficiency: 94,
      },
    ];

    const demoPerformanceData: PerformanceData[] = [
      {
        date: '2024-06-24',
        inspections: 12,
        listings: 8,
        shipments: 15,
        issues: 1,
      },
      {
        date: '2024-06-25',
        inspections: 15,
        listings: 10,
        shipments: 12,
        issues: 0,
      },
      {
        date: '2024-06-26',
        inspections: 18,
        listings: 12,
        shipments: 18,
        issues: 2,
      },
      {
        date: '2024-06-27',
        inspections: 14,
        listings: 9,
        shipments: 16,
        issues: 1,
      },
      {
        date: '2024-06-28',
        inspections: 16,
        listings: 11,
        shipments: 14,
        issues: 0,
      },
    ];

    setWorkloadData(demoWorkloadData);
    setPerformanceData(demoPerformanceData);
  }, []);

  const totalTasks = workloadData.reduce((sum, data) => sum + data.tasksCompleted, 0);
  const avgEfficiency = workloadData.reduce((sum, data) => sum + data.efficiency, 0) / workloadData.length;
  const totalInspections = performanceData.reduce((sum, data) => sum + data.inspections, 0);
  const totalIssues = performanceData.reduce((sum, data) => sum + data.issues, 0);
  const qualityRate = ((totalInspections - totalIssues) / totalInspections) * 100;

  const handleCreateReport = () => {
    showToast({
      title: 'レポート作成',
      message: 'カスタムレポートを作成しました',
      type: 'success'
    });
    setIsReportModalOpen(false);
  };

  const scrollToPerformance = () => {
    performanceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  スタッフレポート
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  業務効率と品質管理の分析レポート
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="nexus-button"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                  カスタムレポート作成
                </button>
                <button
                  onClick={scrollToPerformance}
                  className="nexus-button primary"
                >
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  パフォーマンス分析
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Modal */}
        {isReportModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-30 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
              <h2 className="text-lg font-bold mb-4">カスタムレポート作成</h2>
              {/* TODO: レポート条件フォームを実装 */}
              <div className="text-right mt-6">
                <button onClick={() => setIsReportModalOpen(false)} className="nexus-button mr-2">キャンセル</button>
                <button onClick={handleCreateReport} className="nexus-button primary">作成</button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="intelligence-card americas">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb green">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge success">タスク</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {totalTasks}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2 mb-2">
                  総完了タスク
                </div>
                <p className="text-xs text-nexus-green">
                  +12% 前週比
                </p>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb blue">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="status-badge info">効率</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {avgEfficiency.toFixed(1)}%
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2 mb-2">
                  平均効率性
                </div>
                <p className="text-xs text-nexus-blue">
                  目標 90%達成
                </p>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb purple">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="status-badge">品質</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {qualityRate.toFixed(1)}%
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2 mb-2">
                  品質スコア
                </div>
                <p className="text-xs text-nexus-purple">
                  問題発生率 {((totalIssues / totalInspections) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="intelligence-card africa">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb orange">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="status-badge warning">検品</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {totalInspections}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2 mb-2">
                  総検品数
                </div>
                <p className="text-xs text-nexus-yellow">
                  日平均 {(totalInspections / 5).toFixed(1)}件
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Performance */}
          <div className="intelligence-card europe lg:col-span-2">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-nexus-text-primary mb-6">
                日別パフォーマンス
              </h2>
              <div className="space-y-4">
                {performanceData.map((day) => (
                  <div key={day.date} className="border-l-4 border-nexus-purple pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-nexus-text-primary">
                        {new Date(day.date).toLocaleDateString('ja-JP', { 
                          month: 'short', 
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </h3>
                      {day.issues > 0 && (
                        <span className="status-badge danger">
                          問題 {day.issues}件
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="intelligence-card asia text-center">
                        <div className="p-2">
                          <p className="font-display text-nexus-blue font-bold">{day.inspections}</p>
                          <p className="text-xs text-nexus-text-secondary">検品</p>
                        </div>
                      </div>
                      <div className="intelligence-card africa text-center">
                        <div className="p-2">
                          <p className="font-display text-nexus-green font-bold">{day.listings}</p>
                          <p className="text-xs text-nexus-text-secondary">出品</p>
                        </div>
                      </div>
                      <div className="intelligence-card oceania text-center">
                        <div className="p-2">
                          <p className="font-display text-nexus-purple font-bold">{day.shipments}</p>
                          <p className="text-xs text-nexus-text-secondary">出荷</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Report Actions */}
        <div className="intelligence-card global" ref={performanceRef}>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-nexus-text-primary mb-6">
              レポートアクション
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => showToast({
                  title: 'エクスポート完了',
                  message: '週次レポートをダウンロードしました',
                  type: 'success'
                })}
                className="nexus-button primary"
              >
                週次レポートをエクスポート
              </button>
              <button
                onClick={() => showToast({
                  title: 'エクスポート完了',
                  message: '月次レポートをダウンロードしました',
                  type: 'success'
                })}
                className="nexus-button"
              >
                月次レポートをエクスポート
              </button>
              <button
                onClick={() => showToast({
                  title: 'メール送信',
                  message: 'レポートをメールで送信しました',
                  type: 'success'
                })}
                className="nexus-button"
              >
                レポートをメール送信
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}