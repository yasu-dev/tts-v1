'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import { NexusButton, NexusCard, NexusLoadingSpinner } from '../components/ui';
import BaseModal from '../components/ui/BaseModal';
import InventorySummary from '../components/features/InventorySummary';
import SellerAnalyticsDashboard from '../components/features/analytics/SellerAnalyticsDashboard';
import ProductDetailModal from '../components/ProductDetailModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { AreaChart, Card, Title } from '@tremor/react';
import {
  ClockIcon,
  ArchiveBoxIcon,
  BanknotesIcon,
  ScaleIcon,
  TruckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function DashboardPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('ダッシュボードデータの取得に失敗しました:', error);
        // フォールバック用のデモデータを設定
        setDashboardData({
          globalRevenue: 45600000,
          activeExports: 156,
          inventoryEfficiency: 92,
          marketExpansionRate: 15.8,
          orders: [
            {
              id: 'ORD-DEMO-001',
              customer: 'デモ顧客',
              seller: 'デモ販売者',
              certification: 'PREMIUM',
              items: 3,
              value: '¥450,000',
              status: 'optimal',
              region: 'アジア太平洋'
            }
          ],
          salesData: {
            total: 45600000,
            growth: 12.5,
            recentSales: []
          },
          inventoryData: {
            totalItems: 156,
            totalValue: 45600000
          }
        });
        setLoading(false);
      });
  }, []);

  const handleDownloadReport = () => {
    try {
    // レポートデータを生成
    const reportData = {
      period: {
        start: dateRange[0].startDate.toISOString(),
        end: dateRange[0].endDate.toISOString()
      },
      sales: {
          total: dashboardData?.salesData?.total || 0,
          growth: dashboardData?.salesData?.growth || 0,
          items: dashboardData?.salesData?.recentSales || []
      },
      inventory: dashboardData?.inventoryData || {},
        orders: dashboardData?.orders || [],
      generated: new Date().toISOString()
    };

    // JSONファイルとしてダウンロード
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `report_${dateRange[0].startDate.toISOString().split('T')[0]}_${dateRange[0].endDate.toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
      
      // レポートダウンロードログを記録
      const downloadLog = {
        action: 'report_download',
        timestamp: new Date().toISOString(),
        user: 'current_user',
        filename: exportFileDefaultName
      };
      const logs = JSON.parse(localStorage.getItem('downloadLogs') || '[]');
      logs.push(downloadLog);
      localStorage.setItem('downloadLogs', JSON.stringify(logs));
    } catch (error) {
      console.error('レポートダウンロード中にエラーが発生しました:', error);
      showToast({
        type: 'error',
        title: 'レポート生成エラー',
        message: 'レポートの生成に失敗しました。もう一度お試しください。'
      });
    }
  };

  const handleOrderDetail = (order: any) => {
    // 注文データを商品データ形式に変換
    const productData = {
      id: order.id,
      name: `注文 ${order.id}`,
      sku: order.id,
      category: '注文',
      status: order.status === 'optimal' ? '在庫あり' : '処理中',
      price: parseInt(order.value.replace(/[¥,]/g, '')),
      stock: order.items,
      location: order.region,
      description: `顧客: ${order.customer}\n販売者: ${order.seller}\n認証: ${order.certification}`
    };
    setSelectedProduct(productData);
    setIsProductDetailOpen(true);
  };

  const headerActions = (
    <>
      <NexusButton
        onClick={() => setIsDatePickerOpen(true)}
        variant="default"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      >
        レポート期間を選択
      </NexusButton>
      <NexusButton
        onClick={handleDownloadReport}
        variant="primary"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        }
      >
        レポートをダウンロード
      </NexusButton>
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  セラーダッシュボード
                </h1>
                <p className="mt-2 text-nexus-text-secondary">
                  売上管理と在庫状況の統合画面
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                {headerActions}
              </div>
            </div>

            {/* タブナビゲーション */}
            <div className="mt-8 border-b border-nexus-border">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-primary-blue text-primary-blue'
                      : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    基本ダッシュボード
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'analytics'
                      ? 'border-primary-blue text-primary-blue'
                      : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    詳細分析
                  </div>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Date Picker Modal */}
        <BaseModal
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          title="期間選択"
          size="lg"
        >
          <div>
            <DateRangePicker
              onChange={(item: any) => setDateRange([item.selection])}
              ranges={dateRange}
              months={2}
              direction="horizontal"
            />
            <div className="text-right mt-4">
              <NexusButton
                onClick={() => setIsDatePickerOpen(false)}
                variant="primary"
              >
                適用
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* タブコンテンツ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Real-time Inventory Summary */}
            <InventorySummary />

            {/* Stats Overview - Intelligence Metrics Style */}
            <div className="intelligence-metrics">
              <div className="unified-grid-4">
                <div className="intelligence-card americas">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="action-orb blue w-7 h-7">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="status-badge success text-[10px] px-1.5 py-0.5">+12.5%</span>
                    </div>
                    <div className="metric-value font-display text-xl font-bold text-nexus-text-primary">
                      ¥{dashboardData?.globalRevenue?.toLocaleString() || '0'}
                    </div>
                    <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                      グローバル収益
                    </div>
                  </div>
                </div>

                <div className="intelligence-card europe">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="action-orb green w-7 h-7">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                        </svg>
                      </div>
                      <span className="status-badge info text-[10px] px-1.5 py-0.5">アクティブ</span>
                    </div>
                    <div className="metric-value font-display text-xl font-bold text-nexus-text-primary">
                      {dashboardData?.activeExports?.toLocaleString() || '0'}
                    </div>
                    <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                      アクティブ輸出
                    </div>
                  </div>
                </div>

                <div className="intelligence-card asia">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="action-orb w-7 h-7">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                        </svg>
                      </div>
                      <span className="status-badge success text-[10px] px-1.5 py-0.5">最適</span>
                    </div>
                    <div className="metric-value font-display text-xl font-bold text-nexus-text-primary">
                      {dashboardData?.inventoryEfficiency || '0'}%
                    </div>
                    <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                      在庫効率
                    </div>
                  </div>
                </div>

                <div className="intelligence-card africa">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="action-orb red w-7 h-7">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                      </div>
                      <span className="status-badge warning text-[10px] px-1.5 py-0.5">急成長</span>
                    </div>
                    <div className="metric-value font-display text-xl font-bold text-nexus-text-primary">
                      {dashboardData?.marketExpansionRate || '0'}%
                    </div>
                    <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                      市場拡大率
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Trade Monitor */}
            <div className="intelligence-card global">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold text-nexus-text-primary">
                    グローバル取引モニター
                  </h2>
                  <span className="status-badge success">
                    リアルタイム
                  </span>
                </div>
                
                <div className="holo-table">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-nexus-border">
                        <th className="text-left p-4 font-medium text-nexus-text-secondary">地域</th>
                        <th className="text-left p-4 font-medium text-nexus-text-secondary">取引数</th>
                        <th className="text-left p-4 font-medium text-nexus-text-secondary">売上</th>
                        <th className="text-left p-4 font-medium text-nexus-text-secondary">成長率</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-nexus-border hover:bg-nexus-bg-tertiary">
                        <td className="p-4 text-nexus-text-primary">北米</td>
                        <td className="p-4 text-nexus-text-primary">1,247</td>
                        <td className="p-4 text-nexus-text-primary">¥8,934,000</td>
                        <td className="p-4">
                          <span className="status-badge success">+12.5%</span>
                        </td>
                      </tr>
                      <tr className="border-b border-nexus-border hover:bg-nexus-bg-tertiary">
                        <td className="p-4 text-nexus-text-primary">ヨーロッパ</td>
                        <td className="p-4 text-nexus-text-primary">892</td>
                        <td className="p-4 text-nexus-text-primary">¥6,123,000</td>
                        <td className="p-4">
                          <span className="status-badge success">+8.3%</span>
                        </td>
                      </tr>
                      <tr className="border-b border-nexus-border hover:bg-nexus-bg-tertiary">
                        <td className="p-4 text-nexus-text-primary">アジア</td>
                        <td className="p-4 text-nexus-text-primary">2,156</td>
                        <td className="p-4 text-nexus-text-primary">¥15,678,000</td>
                        <td className="p-4">
                          <span className="status-badge success">+18.7%</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="intelligence-card global">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold text-nexus-text-primary">
                    注文管理
                  </h2>
                  <span className="status-badge info">
                    リアルタイム
                  </span>
                </div>
                
                <div className="holo-table">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-nexus-border">
                        <th className="text-left p-4 font-medium text-nexus-text-secondary">注文ID</th>
                        <th className="text-left p-4 font-medium text-nexus-text-secondary">顧客</th>
                        <th className="text-left p-4 font-medium text-nexus-text-secondary">販売者</th>
                        <th className="text-center p-4 font-medium text-nexus-text-secondary">認証</th>
                        <th className="text-right p-4 font-medium text-nexus-text-secondary">商品数</th>
                        <th className="text-right p-4 font-medium text-nexus-text-secondary">金額</th>
                        <th className="text-center p-4 font-medium text-nexus-text-secondary">ステータス</th>
                        <th className="text-left p-4 font-medium text-nexus-text-secondary">地域</th>
                        <th className="text-center p-4 font-medium text-nexus-text-secondary">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData?.orders?.map((order: any) => (
                        <tr key={order.id} className="border-b border-nexus-border hover:bg-nexus-bg-tertiary">
                          <td className="p-4">
                            <span className="font-mono text-nexus-text-primary text-xs">{order.id}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-xs">{order.customer}</span>
                          </td>
                          <td className="p-4 text-xs">{order.seller}</td>
                          <td className="p-4 text-center">
                            <span className={`cert-nano cert-${order.certification.toLowerCase()} text-[10px] px-1.5 py-0.5`}>
                              {order.certification}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="font-display text-xs">{order.items}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="font-display font-bold text-xs">{order.value}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1">
                              <div className={`status-orb status-${order.status} w-2 h-2`} />
                              <span className={`status-badge ${order.status} text-[10px] px-1.5 py-0.5`}>
                                {order.status === 'optimal' ? '最適' : order.status === 'monitoring' ? '監視中' : order.status}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-xs">{order.region}</td>
                          <td className="p-4 text-center">
                            <NexusButton
                              onClick={() => handleOrderDetail(order)}
                              variant="default"
                              size="sm"
                              data-testid="order-detail-button"
                            >
                              詳細
                            </NexusButton>
                          </td>
                        </tr>
                      ))}
                      {(!dashboardData?.orders || dashboardData.orders.length === 0) && (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-nexus-text-secondary">
                            取引データがありません
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 詳細分析タブ */}
        {activeTab === 'analytics' && (
          <SellerAnalyticsDashboard />
        )}

        {/* Product Detail Modal */}
        <ProductDetailModal
          isOpen={isProductDetailOpen}
          onClose={() => setIsProductDetailOpen(false)}
          product={selectedProduct}
        />
      </div>
    </DashboardLayout>
  );
} 