'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import { useState } from 'react';

export default function ReturnsPage() {
  const [returns] = useState([
    { id: 1, orderId: 'ORD-000123', product: 'Canon EOS R5', reason: '商品不良', status: '申請', date: '2024-01-15' },
    { id: 2, orderId: 'ORD-000124', product: 'Sony FE 24-70mm', reason: 'イメージ違い', status: '受領', date: '2024-01-14' },
    { id: 3, orderId: 'ORD-000125', product: 'Rolex Submariner', reason: '破損', status: '再検品', date: '2024-01-13' },
  ]);

  const [returnStats] = useState({
    totalReturns: 15,
    pending: 5,
    completed: 10,
    returnRate: 3.2,
  });

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-8">
        {/* Page Header - Intelligence Card Style */}
        <div className="intelligence-card africa">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary mb-2">返品管理</h1>
                <h2 className="text-xl font-bold text-nexus-text-primary flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  返品管理
                </h2>
                <p className="text-nexus-text-secondary mt-1">
                  返品リクエストの処理と履歴を管理します
                </p>
              </div>
              <div className="flex gap-4">
                <button className="nexus-button primary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  返品申請
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

        {/* Return Statistics - Intelligence Metrics Style */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="intelligence-card africa">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb red">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="status-badge error">{returnStats.totalReturns}</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {returnStats.totalReturns}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">件</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  総返品数
                </div>
              </div>
            </div>

            <div className="intelligence-card africa">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge warning">処理中</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {returnStats.pending}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">件</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  処理待ち
                </div>
              </div>
            </div>

            <div className="intelligence-card africa">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb green">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge success">完了</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {returnStats.completed}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">件</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  完了済み
                </div>
              </div>
            </div>

            <div className="intelligence-card africa">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb blue">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-nexus-blue">割合</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {returnStats.returnRate}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">%</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  返品率
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Return Request Form - Intelligence Card Style */}
        <div className="intelligence-card africa">
          <div className="p-8">
            <h3 className="text-2xl font-display font-bold text-nexus-text-primary mb-6">返品リクエスト作成</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">注文番号</label>
                <input
                  type="text"
                  className="nexus-input w-full"
                  placeholder="ORD-000123"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">商品名</label>
                <input
                  type="text"
                  className="nexus-input w-full"
                  placeholder="商品名を入力"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-nexus-text-secondary mb-3">返品理由</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['商品不良', 'イメージ違い', '破損', 'サイズ違い', '遅延配送', '重複注文', '間違い注文', 'その他'].map((reason) => (
                    <label key={reason} className="flex items-center cursor-pointer">
                      <input type="radio" name="reason" value={reason} className="mr-2 w-4 h-4 text-primary-blue" />
                      <span className="text-sm text-nexus-text-primary">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">詳細説明</label>
                <textarea
                  rows={4}
                  className="nexus-input w-full"
                  placeholder="返品理由の詳細を記載してください"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-nexus-text-secondary mb-2">写真アップロード</label>
                <div className="border-3 border-dashed border-nexus-border rounded-xl p-8 text-center hover:border-primary-blue transition-all duration-300 hover:bg-primary-blue/5">
                  <svg className="mx-auto h-12 w-12 text-nexus-text-muted" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-3 text-sm text-nexus-text-secondary font-medium">写真をドラッグ&ドロップまたはクリックして選択</p>
                  <p className="text-xs text-nexus-text-muted mt-1">PNG, JPG, GIF (最大10MB)</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button className="nexus-button primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                返品申請提出
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

        {/* Return History - Holo Table Style */}
        <div className="intelligence-card africa">
          <div className="p-8">
            <h3 className="text-2xl font-display font-bold text-nexus-text-primary mb-6">返品履歴</h3>
            
            <div className="holo-table">
              <table className="w-full">
                <thead className="holo-header">
                  <tr>
                    <th className="text-left">返品ID</th>
                    <th className="text-left">注文番号</th>
                    <th className="text-left">商品名</th>
                    <th className="text-left">返品理由</th>
                    <th className="text-center">ステータス</th>
                    <th className="text-left">申請日</th>
                    <th className="text-center">アクション</th>
                  </tr>
                </thead>
                <tbody className="holo-body">
                  {returns.map((returnItem) => (
                    <tr key={returnItem.id} className="holo-row">
                      <td className="font-mono text-nexus-text-primary">RET-{String(returnItem.id).padStart(6, '0')}</td>
                      <td className="font-mono">{returnItem.orderId}</td>
                      <td className="font-medium text-nexus-text-primary">{returnItem.product}</td>
                      <td>{returnItem.reason}</td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`status-orb status-${
                            returnItem.status === '申請' ? 'monitoring' :
                            returnItem.status === '受領' ? 'optimal' :
                            returnItem.status === '再検品' ? 'monitoring' :
                            'optimal'
                          }`} />
                          <span className={`status-badge ${
                            returnItem.status === '申請' ? 'warning' :
                            returnItem.status === '受領' ? 'info' :
                            returnItem.status === '再検品' ? 'warning' :
                            'success'
                          }`}>
                            {returnItem.status}
                          </span>
                        </div>
                      </td>
                      <td className="font-mono text-sm">{returnItem.date}</td>
                      <td className="text-center">
                        <div className="flex gap-3 justify-center">
                          <button className="action-orb blue">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </button>
                          <button className="action-orb green">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
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

        {/* Return Process Flow - Intelligence Card Style */}
        <div className="intelligence-card africa">
          <div className="p-8">
            <h3 className="text-2xl font-display font-bold text-nexus-text-primary mb-8">返品処理フロー</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-nexus-yellow/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-3 border-nexus-yellow/50">
                  <svg className="w-10 h-10 text-nexus-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-display font-bold text-nexus-text-primary mb-2">1. 申請</h4>
                <p className="text-sm text-nexus-text-secondary">返品リクエスト提出</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-nexus-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-3 border-nexus-blue/50">
                  <svg className="w-10 h-10 text-nexus-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h4 className="font-display font-bold text-nexus-text-primary mb-2">2. 受領</h4>
                <p className="text-sm text-nexus-text-secondary">商品の受け取り確認</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-nexus-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-3 border-nexus-purple/50">
                  <svg className="w-10 h-10 text-nexus-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h4 className="font-display font-bold text-nexus-text-primary mb-2">3. 再検品</h4>
                <p className="text-sm text-nexus-text-secondary">状態確認・評価</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-nexus-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-3 border-nexus-green/50">
                  <svg className="w-10 h-10 text-nexus-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-display font-bold text-nexus-text-primary mb-2">4. 完了</h4>
                <p className="text-sm text-nexus-text-secondary">返金・交換処理</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 