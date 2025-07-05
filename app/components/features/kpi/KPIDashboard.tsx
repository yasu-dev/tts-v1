'use client';

import { useState, useEffect } from 'react';

interface KPIData {
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  label: string;
}

interface KPICardProps {
  title: string;
  data: KPIData;
  icon: React.ReactNode;
  color: string;
  format?: 'currency' | 'number' | 'percentage' | 'days';
}

function KPICard({ title, data, icon, color, format = 'number' }: KPICardProps) {
  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return `¥${value.toLocaleString()}`;
      case 'percentage':
        return `${value}%`;
      case 'days':
        return `${value}日`;
      default:
        return value.toLocaleString();
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (Math.abs(change) < 0.1) return (
      <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    );
    return trend === 'up' ? (
      <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ) : (
      <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    );
  };

  const getTrendColor = (trend: string, change: number) => {
    if (Math.abs(change) < 0.1) return 'text-gray-500';
    if (format === 'days' || title.includes('返品')) {
      return trend === 'down' ? 'text-green-600' : 'text-red-600';
    }
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 text-gray-600">{icon}</div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {formatValue(data.current)}
            </p>
            
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${getTrendColor(data.trend, data.change)}`}>
                {getTrendIcon(data.trend, data.change)} {Math.abs(data.change).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">前月比</span>
            </div>
          </div>
        </div>
        
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: color }}
        >
          <div className="w-6 h-6">{icon}</div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <span>前月: {formatValue(data.previous)}</span>
          <span>{data.label}</span>
        </div>
      </div>
    </div>
  );
}

interface SimpleChartProps {
  data: number[];
  labels: string[];
  color: string;
}

function SimpleChart({ data, labels, color }: SimpleChartProps) {
  const maxValue = Math.max(...data);
  
  return (
    <div className="space-y-3">
      {data.map((value, index) => (
        <div key={index} className="flex items-center space-x-3">
          <span className="text-xs text-gray-500 w-16 text-right">{labels[index]}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(value / maxValue) * 100}%`,
                backgroundColor: color
              }}
            ></div>
          </div>
          <span className="text-xs font-medium text-gray-700 w-16">
            {value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function KPIDashboard() {
  const [kpiData, setKpiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    const loadKPIData = async () => {
      try {
        const response = await fetch('/api/reports/analytics');
        const data = await response.json();
        setKpiData(data);
      } catch (error) {
        console.error('KPI data loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKPIData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">KPIデータの読み込みに失敗しました</p>
      </div>
    );
  }

  const exportData = () => {
    const csvContent = [
      ['指標', '現在値', '前月値', '変化率'],
      ['在庫回転率', kpiData.kpis.inventoryTurnover.current, kpiData.kpis.inventoryTurnover.previous, kpiData.kpis.inventoryTurnover.change],
      ['平均保管日数', kpiData.kpis.averageStorageDays.current, kpiData.kpis.averageStorageDays.previous, kpiData.kpis.averageStorageDays.change],
      ['返品率', kpiData.kpis.returnRate.current, kpiData.kpis.returnRate.previous, kpiData.kpis.returnRate.change],
      ['平均販売価格', kpiData.kpis.salePrice.current, kpiData.kpis.salePrice.previous, kpiData.kpis.salePrice.change],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kpi-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">KPI ダッシュボード</h2>
          <p className="text-sm text-gray-600 mt-1">主要業績指標の推移を確認</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">週別</option>
            <option value="month">月別</option>
            <option value="quarter">四半期別</option>
          </select>
          
          <button
            onClick={exportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            CSV出力
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="在庫回転率"
          data={kpiData.kpis.inventoryTurnover}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
          color="#3B82F6"
          format="number"
        />
        <KPICard
          title="平均保管日数"
          data={kpiData.kpis.averageStorageDays}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="#8B5CF6"
          format="days"
        />
        <KPICard
          title="返品率"
          data={kpiData.kpis.returnRate}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
            </svg>
          }
          color="#EF4444"
          format="percentage"
        />
        <KPICard
          title="平均販売価格"
          data={kpiData.kpis.salePrice}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="#10B981"
          format="currency"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリー別パフォーマンス</h3>
          <SimpleChart
            data={kpiData.categoryPerformance.map((cat: any) => cat.sales)}
            labels={kpiData.categoryPerformance.map((cat: any) => cat.category)}
            color="#3B82F6"
          />
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">月次売上推移</h3>
          <SimpleChart
            data={kpiData.monthlyTrends.slice(-6).map((trend: any) => trend.sales)}
            labels={kpiData.monthlyTrends.slice(-6).map((trend: any) => trend.month.split('-')[1] + '月')}
            color="#10B981"
          />
        </div>
      </div>

      {/* Bottlenecks Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          工程ボトルネック分析
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kpiData.stagingAnalysis.bottlenecks.map((bottleneck: any, index: number) => (
            <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-red-800">{bottleneck.stage}工程</span>
                <span className="text-sm text-red-600">{bottleneck.count}件滞留</span>
              </div>
              <p className="text-sm text-red-700">平均遅延: {bottleneck.avgDelay}日</p>
              <p className="text-xs text-red-600 mt-1">原因: {bottleneck.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Slow Moving Inventory */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          滞留在庫アラート
        </h3>
        <div className="space-y-3">
          {kpiData.slowMovingInventory.map((item: any) => (
            <div key={item.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-yellow-800">{item.name}</h4>
                  <p className="text-sm text-yellow-700">ID: {item.id} | カテゴリ: {item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-yellow-800">{item.storageDays}日在庫</p>
                  <p className="text-xs text-yellow-600">¥{item.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-yellow-600">
                <span>閲覧: {item.views}回 | ウォッチ: {item.watchers}件</span>
                <span>原因: {item.reason}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}