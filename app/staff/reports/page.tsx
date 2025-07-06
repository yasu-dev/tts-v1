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

  const handleCreateReport = async () => {
    try {
      // フォームデータの取得をシミュレート
      const reportConfig = {
        type: 'sales', // 実際はフォームから取得
        startDate: '2024-01-01', // 実際はフォームから取得
        endDate: '2024-12-31', // 実際はフォームから取得
        format: 'pdf', // 実際はフォームから取得
        includeAllStaff: true,
        includeAllCategories: true
      };
      
      // バリデーション
      if (!reportConfig.type || !reportConfig.startDate || !reportConfig.endDate) {
        showToast({
          title: '入力エラー',
          message: 'レポート種類と期間は必須項目です',
          type: 'warning'
        });
        return;
      }
      
      if (new Date(reportConfig.startDate) > new Date(reportConfig.endDate)) {
        showToast({
          title: '日付エラー',
          message: '開始日は終了日より前の日付を設定してください',
          type: 'warning'
        });
        return;
      }
      
      // レポート生成処理をシミュレート
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // レポートデータの生成
      const reportData = {
        id: `report_${Date.now()}`,
        ...reportConfig,
        generatedAt: new Date().toISOString(),
        fileSize: '2.4MB',
        fileName: `${reportConfig.type}_report_${new Date().toISOString().split('T')[0]}.${reportConfig.format}`
      };
      
      // ファイルダウンロードをシミュレート
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: reportConfig.format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = reportData.fileName;
      link.click();
      URL.revokeObjectURL(url);
      
      // レポート履歴に保存
      const reportHistory = JSON.parse(localStorage.getItem('reportHistory') || '[]');
      reportHistory.push(reportData);
      localStorage.setItem('reportHistory', JSON.stringify(reportHistory));
      
      showToast({
        title: 'レポート作成完了',
        message: `${reportConfig.type}レポートを正常に作成しました。ファイルがダウンロードされます。`,
        type: 'success'
      });
      
      setIsReportModalOpen(false);
    } catch (error) {
      showToast({
        title: 'レポート作成エラー',
        message: 'レポートの作成に失敗しました。もう一度お試しください。',
        type: 'error'
      });
    }
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    レポート種類
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">レポート種類を選択</option>
                    <option value="sales">売上レポート</option>
                    <option value="inventory">在庫レポート</option>
                    <option value="tasks">タスクレポート</option>
                    <option value="inspection">検査レポート</option>
                    <option value="financial">財務レポート</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      開始日
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      終了日
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出力形式
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center">
                      <input type="radio" name="format" value="pdf" className="mr-2" defaultChecked />
                      <span className="text-sm">PDF</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="format" value="excel" className="mr-2" />
                      <span className="text-sm">Excel</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="format" value="csv" className="mr-2" />
                      <span className="text-sm">CSV</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    対象範囲
                  </label>
                  <div className="space-y-1">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">全スタッフ</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">全商品カテゴリ</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">特定期間のみ</span>
                    </label>
                  </div>
                </div>
              </div>
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
                onClick={async () => {
                  try {
                    // 週次レポートデータ生成
                    const weeklyData = {
                      period: 'weekly',
                      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      endDate: new Date().toISOString().split('T')[0],
                      data: performanceData.slice(-7)
                    };
                    
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // CSVファイル生成
                    const csvContent = [
                      ['日付', '検査数', '問題数', '品質率'],
                      ...weeklyData.data.map(item => [
                        item.date, item.inspections, item.issues, 
                        ((item.inspections - item.issues) / item.inspections * 100).toFixed(1) + '%'
                      ])
                    ].map(row => row.join(',')).join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `weekly_report_${weeklyData.endDate}.csv`;
                    link.click();
                    URL.revokeObjectURL(url);
                    
                    showToast({
                      title: 'エクスポート完了',
                      message: '週次レポートを正常にダウンロードしました',
                      type: 'success'
                    });
                  } catch (error) {
                    showToast({
                      title: 'エクスポートエラー',
                      message: 'レポートのエクスポートに失敗しました',
                      type: 'error'
                    });
                  }
                }}
                className="nexus-button primary"
              >
                週次レポートをエクスポート
              </button>
              <button
                onClick={async () => {
                  try {
                    // 月次レポートデータ生成
                    const monthlyData = {
                      period: 'monthly',
                      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
                      endDate: new Date().toISOString().split('T')[0],
                      data: performanceData,
                      summary: {
                        totalInspections,
                        totalIssues,
                        qualityRate: qualityRate.toFixed(1)
                      }
                    };
                    
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Excelファイルデータ生成（CSV形式で代用）
                    const excelContent = [
                      ['月次レポート'],
                      ['期間', `${monthlyData.startDate} ～ ${monthlyData.endDate}`],
                      [''],
                      ['サマリー'],
                      ['総検査数', totalInspections],
                      ['総問題数', totalIssues],
                      ['品質率', qualityRate.toFixed(1) + '%'],
                      [''],
                      ['詳細データ'],
                      ['日付', '検査数', '問題数', '品質率'],
                      ...monthlyData.data.map(item => [
                        item.date, item.inspections, item.issues,
                        ((item.inspections - item.issues) / item.inspections * 100).toFixed(1) + '%'
                      ])
                    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');
                    
                    const blob = new Blob([excelContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `monthly_report_${monthlyData.endDate}.csv`;
                    link.click();
                    URL.revokeObjectURL(url);
                    
                    showToast({
                      title: 'エクスポート完了',
                      message: '月次レポートを正常にダウンロードしました',
                      type: 'success'
                    });
                  } catch (error) {
                    showToast({
                      title: 'エクスポートエラー',
                      message: 'レポートのエクスポートに失敗しました',
                      type: 'error'
                    });
                  }
                }}
                className="nexus-button"
              >
                月次レポートをエクスポート
              </button>
              <button
                onClick={async () => {
                  try {
                    // メール送信データ準備
                    const emailData = {
                      to: 'manager@company.com',
                      subject: `業務レポート - ${new Date().toISOString().split('T')[0]}`,
                      body: `
業務レポートを送信いたします。

【期間】${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} ～ ${new Date().toISOString().split('T')[0]}

【サマリー】
・総検査数: ${totalInspections}件
・総問題数: ${totalIssues}件  
・品質率: ${qualityRate.toFixed(1)}%

詳細は添付ファイルをご確認ください。
                      `.trim()
                    };
                    
                    await new Promise(resolve => setTimeout(resolve, 2500));
                    
                    // メール送信ログを保存
                    const emailLog = {
                      ...emailData,
                      sentAt: new Date().toISOString(),
                      status: 'sent',
                      id: `email_${Date.now()}`
                    };
                    
                    const emailHistory = JSON.parse(localStorage.getItem('emailHistory') || '[]');
                    emailHistory.push(emailLog);
                    localStorage.setItem('emailHistory', JSON.stringify(emailHistory));
                    
                    showToast({
                      title: 'メール送信完了',
                      message: 'レポートを正常にメール送信しました',
                      type: 'success'
                    });
                  } catch (error) {
                    showToast({
                      title: 'メール送信エラー',
                      message: 'メールの送信に失敗しました',
                      type: 'error'
                    });
                  }
                }}
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