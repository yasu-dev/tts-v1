'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import { useState } from 'react';

export default function InventoryPage() {
  const [inventoryStats] = useState({
    totalItems: 156,
    listed: 89,
    inspection: 45,
    storage: 22,
    totalValue: 45600000,
  });

  const [inventory] = useState([
    { id: 1, name: 'Canon EOS R5', sku: 'TWD-20240115-001', category: 'カメラ本体', status: '出品中', location: 'A-01-03', value: 450000, certifications: ['MINT', 'AUTHENTIC'] },
    { id: 2, name: 'Sony FE 24-70mm f/2.8 GM', sku: 'TWD-20240115-002', category: 'レンズ', status: '検品中', location: 'B-02-05', value: 280000, certifications: ['PREMIUM'] },
    { id: 3, name: 'Rolex Submariner', sku: 'TWD-20240115-003', category: '時計', status: '保管中', location: 'C-01-01', value: 1200000, certifications: ['CERTIFIED', 'LUXURY', 'RARE'] },
  ]);

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">在庫管理</h1>
                <h2 className="card-title flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                  商品在庫ビュー
                </h2>
                <p className="card-description">
                  商品在庫の状況を確認・管理できます
                </p>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-primary">
                  一括出品
                </button>
                <button className="btn btn-secondary">
                  検品依頼
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-value">{inventoryStats.totalItems}点</div>
            <div className="stat-label">総在庫数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{inventoryStats.listed}点</div>
            <div className="stat-label">出品中</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{inventoryStats.inspection}点</div>
            <div className="stat-label">検品中</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">¥{(inventoryStats.totalValue / 10000).toLocaleString()}万</div>
            <div className="stat-label">総評価額</div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">在庫リスト</h3>
            <p className="card-description">現在の在庫状況</p>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>商品名</th>
                  <th>SKU</th>
                  <th>カテゴリー</th>
                  <th>ステータス</th>
                  <th>保管場所</th>
                  <th>評価額</th>
                  <th>認証</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.sku}</td>
                    <td>{item.category}</td>
                    <td><span className={`status-badge ${item.status === '出品中' ? 'success' : 'warning'}`}>{item.status}</span></td>
                    <td>{item.location}</td>
                    <td>¥{item.value.toLocaleString()}</td>
                    <td>
                      {item.certifications.map(cert => (
                        <span key={cert} className="status-badge info">{cert}</span>
                      ))}
                    </td>
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