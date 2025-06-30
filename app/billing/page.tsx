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
      <div className="space-y-8">
        {/* Page Header - Intelligence Card Style */}
        <div className="intelligence-card oceania">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary mb-2">請求管理</h1>
                <h2 className="text-xl font-bold text-nexus-text-primary flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  請求・精算
                </h2>
                <p className="text-nexus-text-secondary mt-1">
                  売上金の請求と精算状況を管理します
                </p>
              </div>
              <div className="flex gap-4">
                <button className="nexus-button primary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  請求書発行
                </button>
                <button className="nexus-button">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  明細ダウンロード
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Overview - Intelligence Metrics Style */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="intelligence-card oceania">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb blue">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge info">残高</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  ¥{(billingData.currentBalance / 10000).toLocaleString()}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">万</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  現在残高
                </div>
              </div>
            </div>

            <div className="intelligence-card oceania">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge warning">予定</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  ¥{billingData.pendingPayment.toLocaleString()}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  振込予定額
                </div>
              </div>
            </div>

            <div className="intelligence-card oceania">
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
                  ¥{(billingData.lastPayment / 10000).toLocaleString()}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">万</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  前回振込額
                </div>
              </div>
            </div>

            <div className="intelligence-card oceania">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb red">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-nexus-purple">日付</span>
                </div>
                <div className="metric-value font-display text-2xl font-bold text-nexus-text-primary">
                  {billingData.nextPaymentDate}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  次回振込日
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History - Holo Table Style */}
        <div className="intelligence-card oceania">
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-display font-bold text-nexus-text-primary">取引履歴</h3>
              <p className="text-nexus-text-secondary mt-1">直近の入出金明細</p>
            </div>
            
            <div className="holo-table">
              <table className="w-full">
                <thead className="holo-header">
                  <tr>
                    <th className="text-left">日付</th>
                    <th className="text-left">種別</th>
                    <th className="text-left">詳細</th>
                    <th className="text-right">金額</th>
                    <th className="text-center">ステータス</th>
                  </tr>
                </thead>
                <tbody className="holo-body">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="holo-row">
                      <td className="font-mono text-sm">{transaction.date}</td>
                      <td>
                        <span className={`status-badge ${
                          transaction.type === '売上' ? 'success' :
                          transaction.type === '手数料' ? 'warning' :
                          'info'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="text-nexus-text-primary">{transaction.description}</td>
                      <td className={`text-right font-display font-bold ${transaction.amount > 0 ? 'text-nexus-green' : 'text-nexus-red'}`}>
                        {transaction.amount > 0 ? '+' : ''}¥{Math.abs(transaction.amount).toLocaleString()}
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`status-orb status-${transaction.status === '完了' ? 'optimal' : 'monitoring'}`} />
                          <span className={`status-badge ${
                            transaction.status === '完了' ? 'success' : 'info'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Monthly Report - Intelligence Card Style */}
        <div className="intelligence-card oceania">
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-display font-bold text-nexus-text-primary">月次レポート</h3>
              <p className="text-nexus-text-secondary mt-1">2024年1月の売上サマリー</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-nexus-blue/10 rounded-xl border-3 border-nexus-blue/30">
                <div className="text-nexus-blue text-sm font-medium mb-2">総売上高</div>
                <div className="text-3xl font-display font-bold text-nexus-text-primary">
                  ¥{(monthlyReport.totalSales / 10000).toLocaleString()}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">万</span>
                </div>
              </div>

              <div className="p-6 bg-nexus-yellow/10 rounded-xl border-3 border-nexus-yellow/30">
                <div className="text-nexus-yellow text-sm font-medium mb-2">手数料合計</div>
                <div className="text-3xl font-display font-bold text-nexus-text-primary">
                  ¥{(monthlyReport.totalFees / 10000).toLocaleString()}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">万</span>
                </div>
              </div>

              <div className="p-6 bg-nexus-green/10 rounded-xl border-3 border-nexus-green/30">
                <div className="text-nexus-green text-sm font-medium mb-2">純利益</div>
                <div className="text-3xl font-display font-bold text-nexus-text-primary">
                  ¥{(monthlyReport.netIncome / 10000).toLocaleString()}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">万</span>
                </div>
              </div>

              <div className="p-6 bg-nexus-purple/10 rounded-xl border-3 border-nexus-purple/30">
                <div className="text-nexus-purple text-sm font-medium mb-2">消費税額</div>
                <div className="text-3xl font-display font-bold text-nexus-text-primary">
                  ¥{(monthlyReport.taxAmount / 10000).toLocaleString()}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">万</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Structure - Intelligence Card Style */}
        <div className="intelligence-card oceania">
          <div className="p-8">
            <h3 className="text-2xl font-display font-bold text-nexus-text-primary mb-6">手数料体系</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-display font-bold text-lg text-nexus-text-primary mb-4">基本手数料</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-nexus-cyan/10 rounded-xl border-2 border-nexus-cyan/20">
                    <span className="text-nexus-text-primary font-medium">販売手数料</span>
                    <span className="font-display font-bold text-nexus-cyan">8.5%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-nexus-cyan/10 rounded-xl border-2 border-nexus-cyan/20">
                    <span className="text-nexus-text-primary font-medium">撮影手数料</span>
                    <span className="font-display font-bold text-nexus-cyan">¥300/商品</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-nexus-cyan/10 rounded-xl border-2 border-nexus-cyan/20">
                    <span className="text-nexus-text-primary font-medium">保管手数料</span>
                    <span className="font-display font-bold text-nexus-cyan">¥100/日</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-display font-bold text-lg text-nexus-text-primary mb-4">オプション手数料</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-nexus-purple/10 rounded-xl border-2 border-nexus-purple/20">
                    <span className="text-nexus-text-primary font-medium">優先出品</span>
                    <span className="font-display font-bold text-nexus-purple">¥500/商品</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-nexus-purple/10 rounded-xl border-2 border-nexus-purple/20">
                    <span className="text-nexus-text-primary font-medium">国際配送</span>
                    <span className="font-display font-bold text-nexus-purple">¥800/件</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-nexus-purple/10 rounded-xl border-2 border-nexus-purple/20">
                    <span className="text-nexus-text-primary font-medium">返品処理</span>
                    <span className="font-display font-bold text-nexus-purple">¥1,000/件</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 