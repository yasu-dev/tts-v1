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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">販売管理</h1>
                <h2 className="card-title flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                  売上・受注管理
                </h2>
                <p className="card-description">
                  受注状況と売上を管理します
                </p>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-primary">
                  価格設定
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
            <div className="stat-value">¥{salesData.todaySales.toLocaleString()}</div>
            <div className="stat-label">本日の売上</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">¥{salesData.monthSales.toLocaleString()}</div>
            <div className="stat-label">月間売上</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{salesData.totalOrders}件</div>
            <div className="stat-label">総注文数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">¥{salesData.avgOrderValue.toLocaleString()}</div>
            <div className="stat-label">平均注文額</div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">受注一覧</h3>
            <p className="card-description">最新の注文状況</p>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>注文ID</th>
                  <th>商品名</th>
                  <th>購入者</th>
                  <th>価格</th>
                  <th>ステータス</th>
                  <th>注文日</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>ORD-{String(order.id).padStart(6, '0')}</td>
                    <td>{order.product}</td>
                    <td>{order.buyer}</td>
                    <td>¥{order.price.toLocaleString()}</td>
                    <td><span className={`status-badge ${order.status === '出荷済' ? 'success' : 'warning'}`}>{order.status}</span></td>
                    <td>{order.date}</td>
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