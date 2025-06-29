'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

interface MonthlyData {
  month: string;
  sales: number;
  count: number;
  returns: number;
}

interface CategoryData {
  category: string;
  sales: number;
  count: number;
  avgPrice: number;
  turnover: number;
  storageDays: number;
}

export default function MonthlyReportsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('2024-06');
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
            const response = await fetch('/api/reports/analytics');
      const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Analytics data loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  const generatePDFReport = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const reportContent = generateReportContent();
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `月次レポート_${selectedMonth}.html`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateReportContent = () => {
    if (!analyticsData) return '';

    const selectedMonthData = analyticsData.monthlyTrends.find(
      (trend: MonthlyData) => trend.month === selectedMonth
    );

    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>月次レポート - ${selectedMonth}</title>
    <style>
        body { font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
        .metric { font-size: 2em; font-weight: bold; color: #3B82F6; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .highlight { background-color: #FEF3C7; }
        .footer { text-align: center; margin-top: 50px; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>THE WORLD DOOR</h1>
        <h2>月次業績レポート</h2>
        <p>対象期間: ${selectedMonth}</p>
        <p>生成日時: ${new Date().toLocaleString('ja-JP')}</p>
    </div>

    <div class="section">
        <h3>📊 今月のサマリー</h3>
        <div class="grid">
            <div class="card">
                <h4>売上高</h4>
                <div class="metric">¥${selectedMonthData?.sales.toLocaleString() || 'N/A'}</div>
                <p>販売件数: ${selectedMonthData?.count || 0}件</p>
            </div>
            <div class="card">
                <h4>返品数</h4>
                <div class="metric">${selectedMonthData?.returns || 0}件</div>
                <p>返品率: ${selectedMonthData ? ((selectedMonthData.returns / selectedMonthData.count) * 100).toFixed(1) : 0}%</p>
            </div>
            <div class="card">
                <h4>在庫回転率</h4>
                <div class="metric">${analyticsData.kpis.inventoryTurnover.current}</div>
                <p>前月比: ${analyticsData.kpis.inventoryTurnover.change > 0 ? '+' : ''}${analyticsData.kpis.inventoryTurnover.change.toFixed(1)}%</p>
            </div>
            <div class="card">
                <h4>平均保管日数</h4>
                <div class="metric">${analyticsData.kpis.averageStorageDays.current}日</div>
                <p>前月比: ${analyticsData.kpis.averageStorageDays.change > 0 ? '+' : ''}${analyticsData.kpis.averageStorageDays.change.toFixed(1)}%</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h3>📈 カテゴリー別分析</h3>
        <table>
            <thead>
                <tr>
                    <th>カテゴリー</th>
                    <th>売上高</th>
                    <th>販売数</th>
                    <th>平均単価</th>
                    <th>回転率</th>
                    <th>平均保管日数</th>
                </tr>
            </thead>
            <tbody>
                ${analyticsData.categoryPerformance.map((cat: CategoryData) => `
                    <tr${cat.turnover < 3 ? ' class="highlight"' : ''}>
                        <td>${cat.category}</td>
                        <td>¥${cat.sales.toLocaleString()}</td>
                        <td>${cat.count}点</td>
                        <td>¥${cat.avgPrice.toLocaleString()}</td>
                        <td>${cat.turnover}</td>
                        <td>${cat.storageDays}日</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h3>⚠️ 課題と改善提案</h3>
        <div class="card">
            <h4>滞留在庫について</h4>
            <ul>
                ${analyticsData.slowMovingInventory.map((item: any) => `
                    <li>${item.name} (${item.storageDays}日) - ${item.reason}</li>
                `).join('')}
            </ul>
        </div>
        
        <div class="card">
            <h4>工程ボトルネック</h4>
            <ul>
                ${analyticsData.stagingAnalysis.bottlenecks.map((bottleneck: any) => `
                    <li>${bottleneck.stage}工程: ${bottleneck.count}件滞留 (平均${bottleneck.avgDelay}日遅延) - ${bottleneck.reason}</li>
                `).join('')}
            </ul>
        </div>
    </div>

    <div class="footer">
        <p>本レポートは THE WORLD DOOR システムにより自動生成されました。</p>
        <p>詳細な分析や追加データが必要な場合は、システム管理者にお問い合わせください。</p>
    </div>
</body>
</html>
    `;
  };

  if (loading) {
    return (
      <DashboardLayout userType="seller">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analyticsData) {
    return (
      <DashboardLayout userType="seller">
        <div className="text-center py-8">
          <p className="text-gray-500">データの読み込みに失敗しました</p>
        </div>
      </DashboardLayout>
    );
  }

  const selectedMonthData = analyticsData.monthlyTrends.find(
    (trend: MonthlyData) => trend.month === selectedMonth
  );

  const previousMonthData = analyticsData.monthlyTrends.find(
    (trend: MonthlyData) => {
      const selectedDate = new Date(selectedMonth + '-01');
      const trendDate = new Date(trend.month + '-01');
      return trendDate.getTime() === selectedDate.getTime() - (30 * 24 * 60 * 60 * 1000);
    }
  );

  const salesChange = previousMonthData 
    ? ((selectedMonthData?.sales || 0) - previousMonthData.sales) / previousMonthData.sales * 100
    : 0;

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">月次レポート</h1>
            <p className="mt-1 text-sm text-gray-500">
              詳細な月次業績分析とトレンド確認
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {analyticsData.monthlyTrends.map((trend: MonthlyData) => (
                <option key={trend.month} value={trend.month}>
                  {new Date(trend.month + '-01').toLocaleDateString('ja-JP', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </option>
              ))}
            </select>
            <button
              onClick={generatePDFReport}
              disabled={isGeneratingPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingPDF ? '生成中...' : '📄 PDF生成'}
            </button>
          </div>
        </div>

        {/* Month Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {new Date(selectedMonth + '-01').toLocaleDateString('ja-JP', { 
              year: 'numeric', 
              month: 'long' 
            })} 概要
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                ¥{selectedMonthData?.sales.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 mt-1">総売上高</div>
              {salesChange !== 0 && (
                <div className={`text-xs mt-1 ${salesChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  前月比 {salesChange > 0 ? '+' : ''}{salesChange.toFixed(1)}%
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {selectedMonthData?.count || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">販売件数</div>
              <div className="text-xs text-gray-500 mt-1">
                平均 ¥{selectedMonthData ? Math.round(selectedMonthData.sales / selectedMonthData.count).toLocaleString() : 'N/A'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {selectedMonthData?.returns || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">返品件数</div>
              <div className="text-xs text-gray-500 mt-1">
                返品率 {selectedMonthData ? ((selectedMonthData.returns / selectedMonthData.count) * 100).toFixed(1) : 0}%
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {analyticsData.kpis.inventoryTurnover.current}
              </div>
              <div className="text-sm text-gray-600 mt-1">在庫回転率</div>
              <div className={`text-xs mt-1 ${analyticsData.kpis.inventoryTurnover.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                前月比 {analyticsData.kpis.inventoryTurnover.change > 0 ? '+' : ''}{analyticsData.kpis.inventoryTurnover.change.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Category Analysis */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">カテゴリー別分析</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">カテゴリー</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">売上高</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">販売数</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">平均単価</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">回転率</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">平均保管日数</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.categoryPerformance.map((category: CategoryData, index: number) => (
                  <tr key={category.category} className={`border-b border-gray-100 ${category.turnover < 3 ? 'bg-yellow-50' : ''}`}>
                    <td className="py-3 px-4 font-medium">{category.category}</td>
                    <td className="py-3 px-4 text-right">¥{category.sales.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{category.count}点</td>
                    <td className="py-3 px-4 text-right">¥{category.avgPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={category.turnover < 3 ? 'text-red-600 font-semibold' : ''}>
                        {category.turnover}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{category.storageDays}日</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>注意:</strong> 回転率3.0未満のカテゴリー（黄色背景）は改善が必要です
            </p>
          </div>
        </div>

        {/* Issues and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Slow Moving Inventory */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🐌 滞留在庫</h3>
            <div className="space-y-3">
              {analyticsData.slowMovingInventory.map((item: any) => (
                <div key={item.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-red-800">{item.name}</h4>
                      <p className="text-sm text-red-600">
                        {item.category} | {item.storageDays}日在庫
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-800">
                        ¥{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-red-600 mt-2">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Process Bottlenecks */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🚨 工程ボトルネック</h3>
            <div className="space-y-3">
              {analyticsData.stagingAnalysis.bottlenecks.map((bottleneck: any, index: number) => (
                <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-orange-800">{bottleneck.stage}工程</h4>
                    <span className="text-sm text-orange-600">{bottleneck.count}件滞留</span>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    平均遅延: {bottleneck.avgDelay}日
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    原因: {bottleneck.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 推奨アクション</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💡 価格戦略</h4>
              <p className="text-sm text-blue-700">
                滞留在庫の価格見直しを実施し、回転率向上を図る
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">⚡ 工程改善</h4>
              <p className="text-sm text-green-700">
                検品工程の人員増強により処理速度を向上
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">📈 売上拡大</h4>
              <p className="text-sm text-purple-700">
                好調カテゴリーの仕入れ強化で収益最大化
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}