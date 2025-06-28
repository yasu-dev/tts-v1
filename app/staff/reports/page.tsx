'use client';

import DashboardLayout from '../../components/DashboardLayout';
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              スタッフレポート
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              業務効率と品質管理の分析レポート
            </p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="week">週間</option>
              <option value="month">月間</option>
              <option value="quarter">四半期</option>
            </select>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="productivity">生産性</option>
              <option value="quality">品質</option>
              <option value="efficiency">効率性</option>
            </select>
            <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              詳細レポート出力
            </button>
            <button className="button-primary">
              パフォーマンス分析
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  総完了タスク
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {totalTasks}
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-green-600 dark:text-green-400">
              +12% 前週比
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  平均効率性
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {avgEfficiency.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              目標 90%達成
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  品質スコア
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {qualityRate.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-purple-600 dark:text-purple-400">
              問題発生率 {((totalIssues / totalInspections) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  総検品数
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {totalInspections}
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
              日平均 {(totalInspections / 5).toFixed(1)}件
            </p>
          </div>
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Staff Workload */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              スタッフ別作業負荷
            </h2>
            <div className="space-y-4">
              {workloadData.map((staff, index) => (
                <div key={staff.staff} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{staff.staff}</h3>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      効率性: {staff.efficiency}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">完了</p>
                      <p className="font-bold text-green-600">{staff.tasksCompleted}件</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">進行中</p>
                      <p className="font-bold text-blue-600">{staff.tasksInProgress}件</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">平均時間</p>
                      <p className="font-bold text-purple-600">{staff.avgCompletionTime}h</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                        style={{ width: `${staff.efficiency}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              日別パフォーマンス
            </h2>
            <div className="space-y-4">
              {performanceData.map((day) => (
                <div key={day.date} className="border-l-4 border-purple-500 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {new Date(day.date).toLocaleDateString('ja-JP', { 
                        month: 'short', 
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </h3>
                    {day.issues > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        問題 {day.issues}件
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-blue-600 dark:text-blue-400 font-bold">{day.inspections}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">検品</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <p className="text-green-600 dark:text-green-400 font-bold">{day.listings}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">出品</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <p className="text-purple-600 dark:text-purple-400 font-bold">{day.shipments}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">出荷</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis and Recommendations */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            分析結果と推奨事項
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                優秀なパフォーマンス
              </h3>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• 佐藤さんの効率性が96%で最高</li>
                <li>• 全体の品質スコアが{qualityRate.toFixed(1)}%で目標達成</li>
                <li>• 検品作業の処理速度が向上</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                改善が必要な領域
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• 鈴木さんの進行中タスクが多い</li>
                <li>• 26日に問題発生件数が増加</li>
                <li>• 平均完了時間にばらつきあり</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                推奨アクション
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• 佐藤さんの手法を他スタッフに展開</li>
                <li>• 鈴木さんの作業負荷を調整</li>
                <li>• 品質チェック手順の見直し</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              詳細メトリクス
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    スタッフ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    完了タスク
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    平均処理時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    効率性
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    品質スコア
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {workloadData.map((staff) => (
                  <tr key={staff.staff} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {staff.staff}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {staff.tasksCompleted}件
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {staff.avgCompletionTime}時間
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${staff.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {staff.efficiency}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        staff.efficiency >= 95 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : staff.efficiency >= 90
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
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
    </DashboardLayout>
  );
}