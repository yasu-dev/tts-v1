'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import InventorySummary from '../components/features/InventorySummary';
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
import HoloTable from '../components/ui/HoloTable';

export default function DashboardPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
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
      
      console.log('レポートダウンロード完了:', exportFileDefaultName);
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

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  セラーダッシュボード
                </h1>
                <p className="text-nexus-text-secondary">
                  販売実績と在庫状況の概要
                </p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setIsDatePickerOpen(true)}
                  className="nexus-button"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  レポート期間を選択
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="nexus-button primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  レポートをダウンロード
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Date Picker Modal */}
        {isDatePickerOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-30 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-2xl shadow-2xl">
              <DateRangePicker
                onChange={(item: any) => setDateRange([item.selection])}
                ranges={dateRange}
                months={2}
                direction="horizontal"
              />
              <div className="text-right mt-2">
                <button
                  onClick={() => setIsDatePickerOpen(false)}
                  className="nexus-button"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Inventory Summary */}
        <InventorySummary />

        {/* Stats Overview - Intelligence Metrics Style */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="intelligence-card americas">
              <div className="p-3">
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
              <div className="p-3">
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
              <div className="p-3">
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
              <div className="p-3">
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

        {/* Orders Table - Holo Table Style */}
        <div className="intelligence-card global">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="mb-3">
              <h3 className="text-base sm:text-lg font-display font-bold text-nexus-text-primary">グローバル取引モニター</h3>
              <p className="text-nexus-text-secondary mt-0.5 text-xs">リアルタイムの注文状況</p>
            </div>
            
            <HoloTable
              columns={[
                { key: 'id', label: '注文ID', width: '12%' },
                { key: 'customer', label: '顧客', width: '12%' },
                { key: 'seller', label: '販売者', width: '12%' },
                { key: 'certification', label: '認証', width: '10%', align: 'center' },
                { key: 'items', label: '商品数', width: '8%', align: 'right' },
                { key: 'value', label: '金額', width: '10%', align: 'right' },
                { key: 'status', label: 'ステータス', width: '15%', align: 'center' },
                { key: 'region', label: '地域', width: '12%' },
                { key: 'actions', label: '操作', width: '9%', align: 'center' }
              ]}
              data={dashboardData?.orders || []}
              onRowClick={(row) => handleOrderDetail(row)}
              renderCell={(value, column, row) => {
                if (column.key === 'id') {
                  return <span className="font-mono text-nexus-text-primary text-xs">{value}</span>;
                }
                if (column.key === 'customer') {
                  return <span className="font-medium text-xs">{value}</span>;
                }
                if (column.key === 'certification') {
                  return (
                    <span className={`cert-nano cert-${value.toLowerCase()} text-[10px] px-1.5 py-0.5`}>
                      {value}
                    </span>
                  );
                }
                if (column.key === 'items') {
                  return <span className="font-display text-xs">{value}</span>;
                }
                if (column.key === 'value') {
                  return <span className="font-display font-bold text-xs">{value}</span>;
                }
                if (column.key === 'status') {
                  return (
                    <div className="flex items-center justify-center gap-1">
                      <div className={`status-orb status-${value} w-2 h-2`} />
                      <span className={`status-badge ${value} text-[10px] px-1.5 py-0.5`}>
                        {value === 'optimal' ? '最適' : value === 'monitoring' ? '監視中' : value}
                      </span>
                    </div>
                  );
                }
                if (column.key === 'actions') {
                  return (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrderDetail(row);
                      }}
                      className="text-purple-600 hover:text-purple-800 text-xs font-medium transition-colors"
                    >
                      詳細
                    </button>
                  );
                }
                return <span className="text-xs">{value}</span>;
              }}
              emptyMessage="取引データがありません"
              className="min-w-[700px]"
            />
          </div>
        </div>

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