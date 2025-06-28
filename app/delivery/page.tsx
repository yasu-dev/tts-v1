'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import { useState } from 'react';

export default function DeliveryPage() {
  const [deliveryPlans] = useState([
    { id: 1, date: '2024-01-15', status: '準備中', items: 5, value: 450000 },
    { id: 2, date: '2024-01-12', status: '発送済', items: 3, value: 280000 },
    { id: 3, date: '2024-01-10', status: '到着済', items: 8, value: 620000 },
  ]);

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">納品管理</h1>
                <h2 className="card-title">📦 納品管理</h2>
                <p className="card-description">
                  商品の納品プランを作成・管理します
                </p>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-primary">
                  新規納品プラン作成
                </button>
                <button className="btn btn-secondary">
                  バーコード発行
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* New Delivery Plan Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">新規納品プラン</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">
                SKU（自動採番/手動入力）
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="TWD-20240115-00001"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                ブランド
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Canon, Sony, Rolex..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                モデル/型番
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="EOS R5, FE 24-70mm..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                シリアル番号
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="シリアル番号を入力"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                カテゴリー
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="category" value="camera" />
                  カメラ本体
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="category" value="lens" />
                  レンズ
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="category" value="watch" />
                  時計
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                保険申告価値
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="450000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              付属品
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['元箱', '保証書', '説明書', '充電器', 'レンズキャップ', 'ストラップ'].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input type="checkbox" />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button className="btn btn-primary">
              納品プラン確定
            </button>
            <button className="btn btn-secondary">
              下書き保存
            </button>
          </div>
        </div>

        {/* Delivery History */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">納品履歴</h3>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>納品ID</th>
                  <th>作成日</th>
                  <th>ステータス</th>
                  <th>商品数</th>
                  <th>総価値</th>
                  <th>アクション</th>
                </tr>
              </thead>
              <tbody>
                {deliveryPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td>TWD-{plan.date.replace(/-/g, '')}-{String(plan.id).padStart(3, '0')}</td>
                    <td>{plan.date}</td>
                    <td>
                      <span className={`status-badge ${
                        plan.status === '準備中' ? 'warning' :
                        plan.status === '発送済' ? 'info' :
                        'success'
                      }`}>
                        {plan.status}
                      </span>
                    </td>
                    <td>{plan.items}点</td>
                    <td>¥{plan.value.toLocaleString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">詳細</button>
                        <button className="text-green-600 hover:text-green-800 text-sm">バーコード</button>
                      </div>
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