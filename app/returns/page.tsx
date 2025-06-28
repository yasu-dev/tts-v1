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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">返品管理</h1>
                <h2 className="card-title flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  返品管理
                </h2>
                <p className="card-description">
                  返品リクエストの処理と履歴を管理します
                </p>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-primary">
                  返品申請
                </button>
                <button className="btn btn-secondary">
                  レポート出力
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Return Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value">{returnStats.totalReturns}件</div>
                <div className="stat-label">総返品数</div>
              </div>
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value">{returnStats.pending}件</div>
                <div className="stat-label">処理待ち</div>
              </div>
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value">{returnStats.completed}件</div>
                <div className="stat-label">完了済み</div>
              </div>
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value">{returnStats.returnRate}%</div>
                <div className="stat-label">返品率</div>
              </div>
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Return Request Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">返品リクエスト作成</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">注文番号</label>
              <input
                type="text"
                className="form-input"
                placeholder="ORD-000123"
              />
            </div>
            
            <div>
              <label className="form-label">商品名</label>
              <input
                type="text"
                className="form-input"
                placeholder="商品名を入力"
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">返品理由</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['商品不良', 'イメージ違い', '破損', 'サイズ違い', '遅延配送', '重複注文', '間違い注文', 'その他'].map((reason) => (
                  <label key={reason} className="flex items-center">
                    <input type="radio" name="reason" value={reason} className="mr-2" />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="form-label">詳細説明</label>
              <textarea
                rows={4}
                className="form-input"
                placeholder="返品理由の詳細を記載してください"
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">写真アップロード</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">写真をドラッグ&ドロップまたはクリックして選択</p>
                <p className="text-xs text-gray-400">PNG, JPG, GIF (最大10MB)</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="btn btn-primary">
              返品申請提出
            </button>
            <button className="btn btn-secondary">
              下書き保存
            </button>
          </div>
        </div>

        {/* Return History */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">返品履歴</h3>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>返品ID</th>
                  <th>注文番号</th>
                  <th>商品名</th>
                  <th>返品理由</th>
                  <th>ステータス</th>
                  <th>申請日</th>
                  <th>アクション</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((returnItem) => (
                  <tr key={returnItem.id}>
                    <td>RET-{String(returnItem.id).padStart(6, '0')}</td>
                    <td>{returnItem.orderId}</td>
                    <td className="font-medium">{returnItem.product}</td>
                    <td>{returnItem.reason}</td>
                    <td>
                      <span className={`status-badge ${
                        returnItem.status === '申請' ? 'warning' :
                        returnItem.status === '受領' ? 'info' :
                        returnItem.status === '再検品' ? 'warning' :
                        'success'
                      }`}>
                        {returnItem.status}
                      </span>
                    </td>
                    <td>{returnItem.date}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">詳細</button>
                        <button className="text-green-600 hover:text-green-800 text-sm font-medium">追跡</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Return Process Flow */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">返品処理フロー</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">1. 申請</h4>
              <p className="text-sm text-gray-600">返品リクエスト提出</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">2. 受領</h4>
              <p className="text-sm text-gray-600">商品の受け取り確認</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">3. 再検品</h4>
              <p className="text-sm text-gray-600">状態確認・評価</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">4. 完了</h4>
              <p className="text-sm text-gray-600">返金・交換処理</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 