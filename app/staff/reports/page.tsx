'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import { useState, useEffect } from 'react';

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
  const [workloadData, setWorkloadData] = useState<WorkloadData[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedMetric, setSelectedMetric] = useState<'productivity' | 'quality' | 'efficiency'>('productivity');

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

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-8">
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
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-sm text-nexus-text-primary"
                >
                  <option value="week">週間</option>
                  <option value="month">月間</option>
                  <option value="quarter">四半期</option>
                </select>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as any)}
                  className="px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-sm text-nexus-text-primary"
                >
                  <option value="productivity">生産性</option>
                  <option value="quality">品質</option>
                  <option value="efficiency">効率性</option>
                </select>
                <button className="nexus-button">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  詳細レポート出力
                </button>
                <button className="nexus-button primary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  パフォーマンス分析
                </button>
              </div>
            </div>
          </div>
        </div>

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
          {/* Staff Workload */}
          <div className="intelligence-card americas">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-nexus-text-primary mb-6">
                スタッフ別作業負荷
              </h2>
              <div className="space-y-4">
                {workloadData.map((staff, index) => (
                  <div key={staff.staff} className="intelligence-card global">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-nexus-text-primary">{staff.staff}</h3>
                        <span className="cert-nano cert-premium">
                          効率性: {staff.efficiency}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-nexus-text-secondary">完了</p>
                          <p className="font-display font-bold text-nexus-green">{staff.tasksCompleted}件</p>
                        </div>
                        <div>
                          <p className="text-nexus-text-secondary">進行中</p>
                          <p className="font-display font-bold text-nexus-blue">{staff.tasksInProgress}件</p>
                        </div>
                        <div>
                          <p className="text-nexus-text-secondary">平均時間</p>
                          <p className="font-display font-bold text-nexus-purple">{staff.avgCompletionTime}h</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-nexus-bg-secondary rounded-full h-2">
                          <div
                            className="bg-nexus-blue h-2 rounded-full transition-all duration-300"
                            style={{ width: `${staff.efficiency}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Performance */}
          <div className="intelligence-card europe">
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

        {/* Analysis and Recommendations */}
        <div className="intelligence-card global">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-nexus-text-primary mb-6">
              分析結果と推奨事項
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="intelligence-card americas">
                <div className="p-4">
                  <h3 className="font-medium text-nexus-green mb-2 flex items-center">
                    <div className="action-orb green mr-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    優秀なパフォーマンス
                  </h3>
                  <ul className="text-sm text-nexus-text-primary space-y-1">
                    <li>• 佐藤さんの効率性が96%で最高</li>
                    <li>• 全体の品質スコアが{qualityRate.toFixed(1)}%で目標達成</li>
                    <li>• 検品作業の処理速度が向上</li>
                  </ul>
                </div>
              </div>
              
              <div className="intelligence-card europe">
                <div className="p-4">
                  <h3 className="font-medium text-nexus-yellow mb-2 flex items-center">
                    <div className="action-orb orange mr-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    改善が必要な領域
                  </h3>
                  <ul className="text-sm text-nexus-text-primary space-y-1">
                    <li>• 鈴木さんの進行中タスクが多い</li>
                    <li>• 26日に問題発生件数が増加</li>
                    <li>• 平均完了時間にばらつきあり</li>
                  </ul>
                </div>
              </div>
              
              <div className="intelligence-card asia">
                <div className="p-4">
                  <h3 className="font-medium text-nexus-blue mb-2 flex items-center">
                    <div className="action-orb blue mr-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    推奨アクション
                  </h3>
                  <ul className="text-sm text-nexus-text-primary space-y-1">
                    <li>• 佐藤さんの手法を他スタッフに展開</li>
                    <li>• 鈴木さんの作業負荷を調整</li>
                    <li>• 品質チェック手順の見直し</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className="intelligence-card africa">
          <div className="overflow-hidden">
            <div className="px-6 py-4 border-b border-nexus-border">
              <h2 className="text-lg font-semibold text-nexus-text-primary">
                詳細メトリクス
              </h2>
            </div>
            <div className="p-6">
              <div className="holo-table">
                <table className="w-full">
                  <thead className="holo-header">
                    <tr>
                      <th className="text-left">スタッフ</th>
                      <th className="text-left">完了タスク</th>
                      <th className="text-left">平均処理時間</th>
                      <th className="text-left">効率性</th>
                      <th className="text-left">品質スコア</th>
                    </tr>
                  </thead>
                  <tbody className="holo-body">
                    {workloadData.map((staff) => (
                      <tr key={staff.staff} className="holo-row">
                        <td>
                          <span className="font-medium text-nexus-text-primary">
                            {staff.staff}
                          </span>
                        </td>
                        <td>
                          <span className="font-display text-nexus-text-primary">
                            {staff.tasksCompleted}件
                          </span>
                        </td>
                        <td>
                          <span className="font-display text-nexus-text-primary">
                            {staff.avgCompletionTime}時間
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center">
                            <div className="w-16 bg-nexus-bg-secondary rounded-full h-2 mr-2">
                              <div
                                className="bg-nexus-green h-2 rounded-full transition-all duration-300"
                                style={{ width: `${staff.efficiency}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-display text-nexus-text-primary">
                              {staff.efficiency}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${
                            staff.efficiency >= 95 
                              ? 'success'
                              : staff.efficiency >= 90
                              ? 'warning'
                              : 'danger'
                          }`}>
                            {staff.efficiency >= 95 ? 'A' : staff.efficiency >= 90 ? 'B' : 'C'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}