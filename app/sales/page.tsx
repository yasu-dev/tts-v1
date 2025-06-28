'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import { useState } from 'react';

export default function SalesPage() {
  const [salesData] = useState({
    todaySales: 456789,
    monthSales: 12456789,
    totalOrders: 45,
    avgOrderValue: 276817,
  });

  const [orders] = useState([
    { id: 1, product: 'Canon EOS R5', buyer: 'user123', price: 450000, status: '受注', date: '2024-01-15' },
    { id: 2, product: 'Sony FE 24-70mm', buyer: 'camera_lover', price: 280000, status: '出荷済', date: '2024-01-14' },
    { id: 3, product: 'Rolex Submariner', buyer: 'watch_collector', price: 1200000, status: '配送中', date: '2024-01-13' },
  ]);

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-8">
        {/* Page Header - Intelligence Card Style */}
        <div className="intelligence-card asia">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary mb-2">販売管理</h1>
                <h2 className="text-xl font-bold text-nexus-text-primary flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                  📈 売上・受注管理
                </h2>
                <p className="text-nexus-text-secondary mt-1">
                  受注状況と売上を管理します
                </p>
              </div>
              <div className="flex gap-4">
                <button className="nexus-button primary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  価格設定
                </button>
                <button className="nexus-button">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  レポート出力
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview - Intelligence Metrics Style */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="intelligence-card asia">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb blue">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <span className="status-badge success">+23%</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  ¥{salesData.todaySales.toLocaleString()}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  本日の売上
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb green">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <span className="status-badge info">好調</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  ¥{(salesData.monthSales / 10000).toLocaleString()}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">万</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  月間売上
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5m-6 0l4-4m0 0l-4-4m4 4H9"></path>
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-nexus-yellow">注文</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {salesData.totalOrders}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">件</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  総注文数
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb red">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <span className="status-badge success">高単価</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  ¥{salesData.avgOrderValue.toLocaleString()}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  平均注文額
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table - Holo Table Style */}
        <div className="intelligence-card asia">
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-display font-bold text-nexus-text-primary">受注一覧</h3>
              <p className="text-nexus-text-secondary mt-1">最新の注文状況</p>
            </div>
            
            <div className="holo-table">
              <table className="w-full">
                <thead className="holo-header">
                  <tr>
                    <th className="text-left">注文ID</th>
                    <th className="text-left">商品名</th>
                    <th className="text-left">購入者</th>
                    <th className="text-right">価格</th>
                    <th className="text-center">ステータス</th>
                    <th className="text-left">注文日</th>
                  </tr>
                </thead>
                <tbody className="holo-body">
                  {orders.map((order) => (
                    <tr key={order.id} className="holo-row">
                      <td className="font-mono text-nexus-text-primary">ORD-{String(order.id).padStart(6, '0')}</td>
                      <td className="font-medium text-nexus-text-primary">{order.product}</td>
                      <td className="text-nexus-text-secondary">{order.buyer}</td>
                      <td className="text-right font-display font-bold">¥{order.price.toLocaleString()}</td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`status-orb status-${
                            order.status === '出荷済' ? 'optimal' : 
                            order.status === '配送中' ? 'optimal' : 
                            'monitoring'
                          }`} />
                          <span className={`status-badge ${
                            order.status === '出荷済' ? 'success' : 
                            order.status === '配送中' ? 'info' :
                            'warning'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="font-mono text-sm">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 