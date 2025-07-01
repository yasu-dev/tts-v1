'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import InventorySummary from '../components/features/InventorySummary';
import { useState } from 'react';

export default function DashboardPage() {
  const [dashboardData] = useState({
    globalRevenue: 48470000,
    activeExports: 2386,
    inventoryEfficiency: 94.2,
    marketExpansionRate: 126,
  });

  const [orders] = useState([
    { id: 'WD-2024-0847', customer: 'NEXUS Global Trading', seller: 'APEX Industries', certification: 'ELITE', items: 156, value: '¥2,847,300', status: 'optimal', region: '北米' },
    { id: 'WD-2024-0846', customer: 'EuroTech Solutions', seller: 'Quantum Exports', certification: 'PREMIUM', items: 89, value: '¥1,234,500', status: 'monitoring', region: '欧州' },
    { id: 'WD-2024-0845', customer: 'AsiaLink Corp', seller: 'Global Dynamics', certification: 'GLOBAL', items: 234, value: '¥3,456,700', status: 'optimal', region: 'アジア' },
  ]);

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-4">
        {/* Page Header - Intelligence Card Style */}
        <div className="intelligence-card global">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-nexus-text-primary mb-1">ダッシュボード</h1>
                <h2 className="text-sm sm:text-base font-bold text-nexus-text-primary flex items-center gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.737 11l-.56-5.602A2 2 0 019.155 3h5.69a2 2 0 011.978 2.398L16.263 11m-8.526 0l-1.42 7.087A2 2 0 007.294 21h9.412a2 2 0 001.978-2.913L16.263 11"></path>
                  </svg>
                  グローバル統合ビュー
                </h2>
                <p className="text-nexus-text-secondary mt-2 text-xs sm:text-sm">
                  全体の業績と主要指標を一目で確認
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button className="nexus-button primary text-xs px-2.5 py-1">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <span className="hidden sm:inline">新規輸出</span>
                  <span className="sm:hidden">新規</span>
                </button>
                <button className="nexus-button text-xs px-2.5 py-1">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span className="hidden sm:inline">レポート出力</span>
                  <span className="sm:hidden">レポート</span>
                </button>
              </div>
            </div>
          </div>
        </div>

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
                  ¥{dashboardData.globalRevenue.toLocaleString()}
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
                  {dashboardData.activeExports.toLocaleString()}
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
                  {dashboardData.inventoryEfficiency}%
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
                  {dashboardData.marketExpansionRate}%
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
                    {orders.map((order) => (
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