'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import { useState } from 'react';

export default function BillingPage() {
  const [billingData] = useState({
    currentBalance: 2456789,
    pendingPayment: 456789,
    lastPayment: 1200000,
    nextPaymentDate: '2024-02-01',
  });

  const [transactions] = useState([
    { id: 1, date: '2024-01-15', type: '売上', description: 'Canon EOS R5 販売', amount: 450000, status: '確定' },
    { id: 2, date: '2024-01-14', type: '手数料', description: '販売手数料 (8.5%)', amount: -38250, status: '確定' },
    { id: 3, date: '2024-01-13', type: '売上', description: 'Sony FE 24-70mm 販売', amount: 280000, status: '確定' },
    { id: 4, date: '2024-01-12', type: '手数料', description: '撮影手数料', amount: -300, status: '確定' },
    { id: 5, date: '2024-01-10', type: '振込', description: '売上金振込', amount: -1200000, status: '完了' },
  ]);

  const [monthlyReport] = useState({
    totalSales: 12456789,
    totalFees: 1058327,
    netIncome: 11398462,
    taxAmount: 2279692,
  });

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">請求管理</h1>
                <h2 className="card-title flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  請求・精算
                </h2>
                <p className="card-description">
                  売上金の請求と精算状況を管理します
                </p>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-primary">
                  請求書発行
                </button>
                <button className="btn btn-secondary">
                  明細ダウンロード
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value">
                  ¥{billingData.currentBalance.toLocaleString()}
                </div>
                <div className="stat-label">現在残高</div>
              </div>
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value">
                  ¥{billingData.pendingPayment.toLocaleString()}
                </div>
                <div className="stat-label">振込予定額</div>
              </div>
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value">
                  ¥{billingData.lastPayment.toLocaleString()}
                </div>
                <div className="stat-label">前回振込額</div>
              </div>
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value">
                  {billingData.nextPaymentDate}
                </div>
                <div className="stat-label">次回振込日</div>
              </div>
              <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">取引履歴</h3>
            <p className="card-description">直近の入出金明細</p>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>日付</th>
                  <th>種別</th>
                  <th>詳細</th>
                  <th>金額</th>
                  <th>ステータス</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>
                      <span className={`status-badge ${
                        transaction.type === '売上' ? 'success' :
                        transaction.type === '手数料' ? 'warning' :
                        'info'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td>{transaction.description}</td>
                    <td className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                      {transaction.amount > 0 ? '+' : ''}¥{Math.abs(transaction.amount).toLocaleString()}
                    </td>
                    <td>
                      <span className={`status-badge ${
                        transaction.status === '完了' ? 'success' : 'info'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Report */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">月次レポート</h3>
            <p className="card-description">2024年1月の売上サマリー</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg">
              <div className="text-blue-600 text-sm font-medium mb-1">総売上高</div>
              <div className="text-2xl font-bold text-blue-900">
                ¥{monthlyReport.totalSales.toLocaleString()}
              </div>
            </div>

            <div className="p-6 bg-yellow-50 rounded-lg">
              <div className="text-yellow-600 text-sm font-medium mb-1">手数料合計</div>
              <div className="text-2xl font-bold text-yellow-900">
                ¥{monthlyReport.totalFees.toLocaleString()}
              </div>
            </div>

            <div className="p-6 bg-green-50 rounded-lg">
              <div className="text-green-600 text-sm font-medium mb-1">純利益</div>
              <div className="text-2xl font-bold text-green-900">
                ¥{monthlyReport.netIncome.toLocaleString()}
              </div>
            </div>

            <div className="p-6 bg-purple-50 rounded-lg">
              <div className="text-purple-600 text-sm font-medium mb-1">消費税額</div>
              <div className="text-2xl font-bold text-purple-900">
                ¥{monthlyReport.taxAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Fee Structure */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">手数料体系</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">基本手数料</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>販売手数料</span>
                  <span className="font-medium">8.5%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>撮影手数料</span>
                  <span className="font-medium">¥300/商品</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>保管手数料</span>
                  <span className="font-medium">¥100/日</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">オプション手数料</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>優先出品</span>
                  <span className="font-medium">¥500/商品</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>国際配送</span>
                  <span className="font-medium">¥800/件</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>返品処理</span>
                  <span className="font-medium">¥1,000/件</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 