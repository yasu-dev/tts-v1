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
  icon: string;
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
    if (Math.abs(change) < 0.1) return '➖';
    return trend === 'up' ? '📈' : '📉';
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
            <span className="text-2xl">{icon}</span>
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
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
          style={{ backgroundColor: color }}
        >
          {icon}
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
        const response = await fetch('/data/analytics-mock.json');
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            📊 CSV出力
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="在庫回転率"
          data={kpiData.kpis.inventoryTurnover}
          icon="🔄"
          color="#3B82F6"
          format="number"
        />
        <KPICard
          title="平均保管日数"
          data={kpiData.kpis.averageStorageDays}
          icon="📅"
          color="#8B5CF6"
          format="days"
        />
        <KPICard
          title="返品率"
          data={kpiData.kpis.returnRate}
          icon="↩️"
          color="#EF4444"
          format="percentage"
        />
        <KPICard
          title="平均販売価格"
          data={kpiData.kpis.salePrice}
          icon="💰"
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚨 工程ボトルネック分析</h3>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🐌 滞留在庫アラート</h3>
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