'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">ダッシュボード</h1>
                <h2 className="card-title flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.737 11l-.56-5.602A2 2 0 019.155 3h5.69a2 2 0 011.978 2.398L16.263 11m-8.526 0l-1.42 7.087A2 2 0 007.294 21h9.412a2 2 0 001.978-2.913L16.263 11"></path></svg>
                  グローバル統合ビュー
                </h2>
                <p className="card-description">
                  全体の業績と主要指標を一目で確認
                </p>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-primary">
                  新規輸出
                </button>
                <button className="btn btn-secondary">
                  レポート出力
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value">
                  ¥{dashboardData.globalRevenue.toLocaleString()}
                </div>
                <div className="stat-label">グローバル収益</div>
              </div>
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value">
                  {dashboardData.activeExports.toLocaleString()}
                </div>
                <div className="stat-label">アクティブ輸出</div>
              </div>
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value">
                  {dashboardData.inventoryEfficiency}%
                </div>
                <div className="stat-label">在庫効率</div>
              </div>
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value">
                  {dashboardData.marketExpansionRate}%
                </div>
                <div className="stat-label">市場拡大率</div>
              </div>
              <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">グローバル取引モニター</h3>
            <p className="card-description">リアルタイムの注文状況</p>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>注文ID</th>
                  <th>顧客</th>
                  <th>販売者</th>
                  <th>認証</th>
                  <th>商品数</th>
                  <th>金額</th>
                  <th>ステータス</th>
                  <th>地域</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.seller}</td>
                    <td><span className={`status-badge ${order.certification.toLowerCase()}`}>{order.certification}</span></td>
                    <td>{order.items}</td>
                    <td>{order.value}</td>
                    <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                    <td>{order.region}</td>
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