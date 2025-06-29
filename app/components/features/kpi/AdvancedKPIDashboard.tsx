'use client';

import { useState, useEffect, useRef } from 'react';

interface KPIData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  inventory: {
    turnoverRate: number;
    averageDays: number;
    slowMoving: number;
  };
  categories: {
    name: string;
    sales: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    revenue: number;
    items: number;
  }[];
}

export default function AdvancedKPIDashboard() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const chartRefs = {
    revenue: useRef<HTMLCanvasElement>(null),
    category: useRef<HTMLCanvasElement>(null),
    trend: useRef<HTMLCanvasElement>(null)
  };

  useEffect(() => {
    fetchKPIData();
  }, [timeRange]);

  const fetchKPIData = async () => {
    setIsLoading(true);
    try {
      // Mock data - in production, fetch from API
      const mockData: KPIData = {
        revenue: {
          current: 12500000,
          previous: 10800000,
          growth: 15.7
        },
        inventory: {
          turnoverRate: 4.2,
          averageDays: 87,
          slowMoving: 23
        },
        categories: [
          { name: 'カメラ本体', sales: 5200000, percentage: 41.6 },
          { name: 'レンズ', sales: 3100000, percentage: 24.8 },
          { name: '腕時計', sales: 2800000, percentage: 22.4 },
          { name: 'アクセサリ', sales: 1400000, percentage: 11.2 }
        ],
        monthlyTrend: [
          { month: '1月', revenue: 9800000, items: 145 },
          { month: '2月', revenue: 10200000, items: 152 },
          { month: '3月', revenue: 11500000, items: 168 },
          { month: '4月', revenue: 10800000, items: 160 },
          { month: '5月', revenue: 11900000, items: 175 },
          { month: '6月', revenue: 12500000, items: 182 }
        ]
      };
      
      setKpiData(mockData);
      setTimeout(() => drawCharts(mockData), 100);
    } catch (error) {
      console.error('KPI data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const drawCharts = (data: KPIData) => {
    // Revenue Growth Chart
    if (chartRefs.revenue.current) {
      const ctx = chartRefs.revenue.current.getContext('2d');
      if (ctx) {
        const width = chartRefs.revenue.current.width;
        const height = chartRefs.revenue.current.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw arc for growth percentage
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;
        
        // Background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 20;
        ctx.stroke();
        
        // Progress arc
        const progress = (data.revenue.growth / 100) * Math.PI;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + progress);
        ctx.strokeStyle = '#0064D2';
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Text
        ctx.fillStyle = '#1A1A1A';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${data.revenue.growth}%`, centerX, centerY);
      }
    }

    // Category Distribution Chart
    if (chartRefs.category.current) {
      const ctx = chartRefs.category.current.getContext('2d');
      if (ctx) {
        const width = chartRefs.category.current.width;
        const height = chartRefs.category.current.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const colors = ['#0064D2', '#FFCE00', '#86B817', '#E53238'];
        let currentAngle = -Math.PI / 2;
        
        data.categories.forEach((category, index) => {
          const sliceAngle = (category.percentage / 100) * 2 * Math.PI;
          
          // Draw slice
          ctx.beginPath();
          ctx.moveTo(width / 2, height / 2);
          ctx.arc(width / 2, height / 2, Math.min(width, height) / 2 - 10, currentAngle, currentAngle + sliceAngle);
          ctx.closePath();
          ctx.fillStyle = colors[index];
          ctx.fill();
          
          currentAngle += sliceAngle;
        });
      }
    }

    // Monthly Trend Chart
    if (chartRefs.trend.current) {
      const ctx = chartRefs.trend.current.getContext('2d');
      if (ctx) {
        const width = chartRefs.trend.current.width;
        const height = chartRefs.trend.current.height;
        const padding = 40;
        
        ctx.clearRect(0, 0, width, height);
        
        // Find max value
        const maxRevenue = Math.max(...data.monthlyTrend.map(m => m.revenue));
        
        // Draw bars
        const barWidth = (width - padding * 2) / data.monthlyTrend.length;
        const barGap = barWidth * 0.2;
        
        data.monthlyTrend.forEach((month, index) => {
          const barHeight = (month.revenue / maxRevenue) * (height - padding * 2);
          const x = padding + index * barWidth + barGap / 2;
          const y = height - padding - barHeight;
          
          // Bar
          ctx.fillStyle = '#0064D2';
          ctx.fillRect(x, y, barWidth - barGap, barHeight);
          
          // Label
          ctx.fillStyle = '#666666';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(month.month, x + (barWidth - barGap) / 2, height - 10);
        });
      }
    }
  };

  const exportToCSV = () => {
    if (!kpiData) return;
    
    const csv = [
      ['KPIレポート', new Date().toLocaleDateString('ja-JP')],
      [],
      ['売上高', kpiData.revenue.current],
      ['前期比成長率', `${kpiData.revenue.growth}%`],
      ['在庫回転率', kpiData.inventory.turnoverRate],
      ['平均在庫日数', kpiData.inventory.averageDays],
      ['滞留在庫数', kpiData.inventory.slowMoving],
      [],
      ['カテゴリー別売上'],
      ...kpiData.categories.map(c => [c.name, c.sales, `${c.percentage}%`])
    ];
    
    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kpi-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!kpiData) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-nexus-text-primary">
                KPIダッシュボード
              </h3>
              <p className="text-nexus-text-secondary mt-1">
                主要業績評価指標の分析とレポート
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-nexus-bg-secondary rounded-lg p-1">
                {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      timeRange === range
                        ? 'bg-white text-[#0064D2] shadow-sm'
                        : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                    }`}
                  >
                    {range === 'week' ? '週' : range === 'month' ? '月' : range === 'quarter' ? '四半期' : '年'}
                  </button>
                ))}
              </div>
              <button
                onClick={exportToCSV}
                className="nexus-button"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSVエクスポート
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Revenue Growth */}
            <div className="intelligence-card americas">
              <div className="p-6 text-center">
                <h4 className="font-medium text-nexus-text-primary mb-4">売上成長率</h4>
                <canvas
                  ref={chartRefs.revenue}
                  width={200}
                  height={150}
                  className="mx-auto"
                />
                <div className="mt-4 space-y-1">
                  <p className="text-sm text-nexus-text-secondary">
                    現在: ¥{kpiData.revenue.current.toLocaleString()}
                  </p>
                  <p className="text-sm text-nexus-text-secondary">
                    前期: ¥{kpiData.revenue.previous.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Inventory Metrics */}
            <div className="intelligence-card europe">
              <div className="p-6">
                <h4 className="font-medium text-nexus-text-primary mb-4">在庫効率指標</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-nexus-text-secondary">在庫回転率</span>
                      <span className="text-2xl font-display font-bold text-nexus-text-primary">
                        {kpiData.inventory.turnoverRate}
                      </span>
                    </div>
                    <div className="w-full bg-nexus-bg-secondary rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[#86B817] to-[#FFCE00] h-2 rounded-full"
                        style={{ width: `${Math.min(kpiData.inventory.turnoverRate * 20, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-nexus-text-secondary">平均在庫日数</p>
                      <p className="font-display font-bold text-lg text-nexus-text-primary">
                        {kpiData.inventory.averageDays}日
                      </p>
                    </div>
                    <div>
                      <p className="text-nexus-text-secondary">滞留在庫</p>
                      <p className="font-display font-bold text-lg text-red-600">
                        {kpiData.inventory.slowMoving}件
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="intelligence-card asia">
              <div className="p-6">
                <h4 className="font-medium text-nexus-text-primary mb-4 text-center">カテゴリー別売上</h4>
                <canvas
                  ref={chartRefs.category}
                  width={150}
                  height={150}
                  className="mx-auto"
                />
                <div className="mt-4 space-y-2">
                  {kpiData.categories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ['#0064D2', '#FFCE00', '#86B817', '#E53238'][index] }}
                        />
                        <span className="text-nexus-text-secondary">{category.name}</span>
                      </div>
                      <span className="font-medium text-nexus-text-primary">
                        {category.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="intelligence-card global">
        <div className="p-8">
          <h4 className="text-xl font-display font-bold text-nexus-text-primary mb-6">
            月次売上推移
          </h4>
          <canvas
            ref={chartRefs.trend}
            width={800}
            height={300}
            className="w-full"
          />
        </div>
      </div>

      {/* Alert Section */}
      <div className="intelligence-card oceania">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="action-orb red">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-nexus-text-primary">滞留在庫アラート</h4>
              <p className="text-sm text-nexus-text-secondary mt-1">
                90日以上在庫されている商品が{kpiData.inventory.slowMoving}件あります。
                価格見直しまたはキャンペーン実施を検討してください。
              </p>
            </div>
            <button className="nexus-button primary">
              詳細を確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}