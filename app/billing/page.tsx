'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDownTrayIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

export default function BillingPage() {
  const router = useRouter();

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

  const handleExportHistory = () => {
    // CSVエクスポート機能を実装
    const csvData = transactions.map(t => 
      `${t.date},${t.type},${t.description},${t.amount},${t.status}`
    ).join('\n');
    
    const blob = new Blob([`日付,種別,詳細,金額,ステータス\n${csvData}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `支払履歴_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                <button
                  onClick={handleExportHistory}
                  className="nexus-button"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                  支払履歴をエクスポート
                </button>
                <button
                  onClick={() => router.push('/settings/payment')}
                  className="nexus-button primary"
                >
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  支払い方法を登録
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
                          <div className={`status-orb status-${
                            transaction.status === '確定' ? 'optimal' :
                            transaction.status === '完了' ? 'success' :
                            'monitoring'
                          }`} />
                          <span className={`status-badge ${
                            transaction.status === '確定' ? 'success' :
                            transaction.status === '完了' ? 'info' :
                            'warning'
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
              <p className="text-nexus-text-secondary mt-1">今月の売上・手数料・税金の概要</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-nexus-bg-secondary rounded-lg p-6 border border-nexus-border">
                <div className="text-sm text-nexus-text-secondary mb-2">総売上</div>
                <div className="text-2xl font-display font-bold text-nexus-text-primary">
                  ¥{monthlyReport.totalSales.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-nexus-bg-secondary rounded-lg p-6 border border-nexus-border">
                <div className="text-sm text-nexus-text-secondary mb-2">手数料</div>
                <div className="text-2xl font-display font-bold text-nexus-red">
                  -¥{monthlyReport.totalFees.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-nexus-bg-secondary rounded-lg p-6 border border-nexus-border">
                <div className="text-sm text-nexus-text-secondary mb-2">純利益</div>
                <div className="text-2xl font-display font-bold text-nexus-green">
                  ¥{monthlyReport.netIncome.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-nexus-bg-secondary rounded-lg p-6 border border-nexus-border">
                <div className="text-sm text-nexus-text-secondary mb-2">予想税額</div>
                <div className="text-2xl font-display font-bold text-nexus-text-primary">
                  ¥{monthlyReport.taxAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}