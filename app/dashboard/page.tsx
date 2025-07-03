'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import InventorySummary from '../components/features/InventorySummary';
import { AreaChart, Card, Title } from '@tremor/react';
import {
  ClockIcon,
  ArchiveBoxIcon,
  BanknotesIcon,
  ScaleIcon,
  TruckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      });
  }, []);

  const handleDownloadReport = () => {
    // レポートデータを生成
    const reportData = {
      period: {
        start: dateRange[0].startDate.toISOString(),
        end: dateRange[0].endDate.toISOString()
      },
      sales: {
        total: dashboardData?.salesData.total || 0,
        growth: dashboardData?.salesData.growth || 0,
        items: dashboardData?.salesData.recentSales || []
      },
      inventory: dashboardData?.inventoryData || {},
      generated: new Date().toISOString()
    };

    // JSONファイルとしてダウンロード
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `report_${dateRange[0].startDate.toISOString().split('T')[0]}_${dateRange[0].endDate.toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  セラーダッシュボード
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  販売実績と在庫状況の概要
                </p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setIsDatePickerOpen(true)}
                  className="nexus-button"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  レポート期間を選択
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="nexus-button primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  レポートをダウンロード
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Date Picker Modal */}
        {isDatePickerOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg shadow-xl">
              <DateRangePicker
                onChange={(item: any) => setDateRange([item.selection])}
                ranges={dateRange}
                months={2}
                direction="horizontal"
              />
              <div className="text-right mt-2">
                <button
                  onClick={() => setIsDatePickerOpen(false)}
                  className="nexus-button"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Inventory Summary */}
        <InventorySummary />

        {/* Stats Overview - Intelligence Metrics Style */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="intelligence-card americas">
              <div className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="action-orb blue w-7 h-7">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge success text-[10px] px-1.5 py-0.5">+12.5%</span>
                </div>
                <div className="metric-value font-display text-xl font-bold text-nexus-text-primary">
                  ¥{dashboardData?.globalRevenue?.toLocaleString() || '0'}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                  グローバル収益
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="action-orb green w-7 h-7">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                  </div>
                  <span className="status-badge info text-[10px] px-1.5 py-0.5">アクティブ</span>
                </div>
                <div className="metric-value font-display text-xl font-bold text-nexus-text-primary">
                  {dashboardData?.activeExports?.toLocaleString() || '0'}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                  アクティブ輸出
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="action-orb w-7 h-7">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                  </div>
                  <span className="status-badge success text-[10px] px-1.5 py-0.5">最適</span>
                </div>
                <div className="metric-value font-display text-xl font-bold text-nexus-text-primary">
                  {dashboardData?.inventoryEfficiency || '0'}%
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                  在庫効率
                </div>
              </div>
            </div>

            <div className="intelligence-card africa">
              <div className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="action-orb red w-7 h-7">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                  </div>
                  <span className="status-badge warning text-[10px] px-1.5 py-0.5">急成長</span>
                </div>
                <div className="metric-value font-display text-xl font-bold text-nexus-text-primary">
                  {dashboardData?.marketExpansionRate || '0'}%
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                  市場拡大率
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table - Holo Table Style */}
        <div className="intelligence-card global">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="mb-3">
              <h3 className="text-base sm:text-lg font-display font-bold text-nexus-text-primary">グローバル取引モニター</h3>
              <p className="text-nexus-text-secondary mt-0.5 text-xs">リアルタイムの注文状況</p>
            </div>
            
            <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
              <div className="holo-table min-w-[700px] px-3 sm:px-4 md:px-6 lg:px-8">
                <table className="w-full text-xs">
                  <thead className="holo-header">
                    <tr>
                      <th className="text-left py-1.5 px-1 sm:px-2 md:px-2.5 text-xs">注文ID</th>
                      <th className="text-left py-1.5 px-1 sm:px-2 md:px-2.5 text-xs">顧客</th>
                      <th className="text-left py-1.5 px-1 sm:px-2 md:px-2.5 text-xs">販売者</th>
                      <th className="text-center py-1.5 px-1 sm:px-2 md:px-2.5 text-xs">認証</th>
                      <th className="text-right py-1.5 px-1 sm:px-2 md:px-2.5 text-xs">商品数</th>
                      <th className="text-right py-1.5 px-1 sm:px-2 md:px-2.5 text-xs">金額</th>
                      <th className="text-center py-1.5 px-1 sm:px-2 md:px-2.5 text-xs">ステータス</th>
                      <th className="text-left py-1.5 px-1 sm:px-2 md:px-2.5 text-xs">地域</th>
                    </tr>
                  </thead>
                  <tbody className="holo-body">
                    {dashboardData?.orders?.map((order: any) => (
                      <tr key={order.id} className="holo-row">
                        <td className="font-mono text-nexus-text-primary py-1.5 px-1 sm:px-2 md:px-2.5 text-xs">{order.id}</td>
                        <td className="font-medium py-1.5 px-1 sm:px-2 md:px-2.5 text-xs">{order.customer}</td>
                        <td className="py-1.5 px-1 sm:px-2 md:px-2.5 text-xs">{order.seller}</td>
                        <td className="text-center py-1.5 px-1 sm:px-2 md:px-2.5">
                          <span className={`cert-nano cert-${order.certification.toLowerCase()} text-[10px] px-1.5 py-0.5`}>
                            {order.certification}
                          </span>
                        </td>
                        <td className="text-right font-display py-1.5 px-1 sm:px-2 md:px-2.5 text-xs">{order.items}</td>
                        <td className="text-right font-display font-bold py-1.5 px-1 sm:px-2 md:px-2.5 text-xs">{order.value}</td>
                        <td className="text-center py-1.5 px-1 sm:px-2 md:px-2.5">
                          <div className="flex items-center justify-center gap-1">
                            <div className={`status-orb status-${order.status} w-2 h-2`} />
                            <span className={`status-badge ${order.status} text-[10px] px-1.5 py-0.5`}>
                              {order.status === 'optimal' ? '最適' : order.status === 'monitoring' ? '監視中' : order.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-1.5 px-1 sm:px-2 md:px-2.5 text-xs">{order.region}</td>
                      </tr>
                    )) || []}
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