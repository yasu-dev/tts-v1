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
      <div className="space-y-8">
        {/* Page Header - Intelligence Card Style */}
        <div className="intelligence-card americas">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary mb-2">納品管理</h1>
                <h2 className="text-xl font-bold text-nexus-text-primary flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  📦 納品管理
                </h2>
                <p className="text-nexus-text-secondary mt-1">
                  商品の納品プランを作成・管理します
                </p>
              </div>
              <div className="flex gap-4">
                <button className="nexus-button primary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  新規納品プラン作成
                </button>
                <button className="nexus-button">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-2 0h-2v4m0-11v3m0 0h-2m2 0h2m-8 3H3M8 8H3m4-3h2M3 4h2m0 2H3"></path>
                  </svg>
                  バーコード発行
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* New Delivery Plan Form - Intelligence Card Style */}
        <div className="intelligence-card americas">
          <div className="p-8">
            <h3 className="text-2xl font-display font-bold text-nexus-text-primary mb-6">新規納品プラン</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  SKU（自動採番/手動入力）
                </label>
                <input
                  type="text"
                  className="nexus-input w-full"
                  placeholder="TWD-20240115-00001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  ブランド
                </label>
                <input
                  type="text"
                  className="nexus-input w-full"
                  placeholder="Canon, Sony, Rolex..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  モデル/型番
                </label>
                <input
                  type="text"
                  className="nexus-input w-full"
                  placeholder="EOS R5, FE 24-70mm..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  シリアル番号
                </label>
                <input
                  type="text"
                  className="nexus-input w-full"
                  placeholder="シリアル番号を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-3">
                  カテゴリー
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" value="camera" className="w-4 h-4 text-primary-blue" />
                    <span className="text-nexus-text-primary">カメラ本体</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" value="lens" className="w-4 h-4 text-primary-blue" />
                    <span className="text-nexus-text-primary">レンズ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" value="watch" className="w-4 h-4 text-primary-blue" />
                    <span className="text-nexus-text-primary">時計</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                  保険申告価値
                </label>
                <input
                  type="number"
                  className="nexus-input w-full"
                  placeholder="450000"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-nexus-text-secondary mb-3">
                付属品
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['元箱', '保証書', '説明書', '充電器', 'レンズキャップ', 'ストラップ'].map((item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-primary-blue rounded border-nexus-border" />
                    <span className="text-nexus-text-primary">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button className="nexus-button primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                納品プラン確定
              </button>
              <button className="nexus-button">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2"></path>
                </svg>
                下書き保存
              </button>
            </div>
          </div>
        </div>

        {/* Delivery History - Holo Table Style */}
        <div className="intelligence-card americas">
          <div className="p-8">
            <h3 className="text-2xl font-display font-bold text-nexus-text-primary mb-6">納品履歴</h3>
            
            <div className="holo-table">
              <table className="w-full">
                <thead className="holo-header">
                  <tr>
                    <th className="text-left">納品ID</th>
                    <th className="text-left">作成日</th>
                    <th className="text-center">ステータス</th>
                    <th className="text-right">商品数</th>
                    <th className="text-right">総価値</th>
                    <th className="text-center">アクション</th>
                  </tr>
                </thead>
                <tbody className="holo-body">
                  {deliveryPlans.map((plan) => (
                    <tr key={plan.id} className="holo-row">
                      <td className="font-mono text-nexus-text-primary">
                        TWD-{plan.date.replace(/-/g, '')}-{String(plan.id).padStart(3, '0')}
                      </td>
                      <td>{plan.date}</td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`status-orb status-${
                            plan.status === '準備中' ? 'monitoring' :
                            plan.status === '発送済' ? 'optimal' :
                            'optimal'
                          }`} />
                          <span className={`status-badge ${
                            plan.status === '準備中' ? 'warning' :
                            plan.status === '発送済' ? 'info' :
                            'success'
                          }`}>
                            {plan.status}
                          </span>
                        </div>
                      </td>
                      <td className="text-right font-display">{plan.items}点</td>
                      <td className="text-right font-display font-bold">¥{plan.value.toLocaleString()}</td>
                      <td className="text-center">
                        <div className="flex gap-3 justify-center">
                          <button className="action-orb blue">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </button>
                          <button className="action-orb green">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-2 0h-2v4m0-11v3m0 0h-2m2 0h2m-8 3H3M8 8H3m4-3h2M3 4h2m0 2H3"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
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