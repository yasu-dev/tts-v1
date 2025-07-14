'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import UnifiedPageHeader from '../components/ui/UnifiedPageHeader';
import { NexusButton, NexusCard, NexusLoadingSpinner } from '../components/ui';
import BaseModal from '../components/ui/BaseModal';
import ProductDetailModal from '../components/ProductDetailModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
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
  const [activeTab, setActiveTab] = useState<'urgent' | 'revenue' | 'operations' | 'returns'>('urgent');
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
        // カメラと時計に特化した実践的なデータ構造
        const practicalData = {
          // 緊急タスク
          urgentTasks: [
            {
              id: 'inspection-overdue',
              type: 'critical',
              title: '検品期限超過',
              count: 8,
              description: '3日以上検品待ちの商品',
              value: '¥2,340,000',
              action: '即座に検品開始',
              priority: 'high',
              deadline: '今日',
              items: ['Canon EOS R5', 'Nikon Z9', 'Rolex Submariner']
            },
            {
              id: 'stock-shortage',
              type: 'warning',
              title: '在庫切れ直前',
              count: 5,
              description: '48時間以内に在庫切れ予想',
              value: '¥890,000',
              action: '緊急補充手配',
              priority: 'high',
              deadline: '2日以内',
              items: ['Sony α7R V', 'Omega Speedmaster']
            },
            {
              id: 'shipping-delay',
              type: 'urgent',
              title: '出荷遅延',
              count: 12,
              description: '予定日を過ぎた未出荷注文',
              value: '¥1,560,000',
              action: '即座に出荷処理',
              priority: 'critical',
              deadline: '今日',
              items: ['Leica M11', 'TAG Heuer Formula 1', 'Canon RF 70-200mm']
            },
            {
              id: 'high-value-returns',
              type: 'critical',
              title: '高額返品処理',
              count: 3,
              description: '50万円以上の返品商品',
              value: '¥1,890,000',
              action: '優先的に再検品・再出品',
              priority: 'high',
              deadline: '3日以内',
              items: ['Patek Philippe Nautilus', 'Leica M10-P', 'Rolex GMT-Master II']
            }
          ],
          
          // 返品理由分析データ（カメラ・時計専門）
          returnAnalysis: {
            totalReturns: 47,
            totalReturnValue: 8940000,
            categories: {
              camera: {
                returns: 28,
                value: 5640000
              },
              watch: {
                returns: 19,
                value: 3300000
              }
            },
            reasons: [
              {
                id: 'defect',
                name: '商品不良・故障',
                count: 18,
                percentage: 38.3,
                value: 3420000,
                trend: '+2.1%',
                severity: 'high',
                items: [
                  {
                    name: 'Canon EOS R5',
                    reason: 'AFセンサー不良',
                    value: 280000
                  },
                  {
                    name: 'Nikon Z9',
                    reason: 'ファインダー表示異常',
                    value: 320000
                  },
                  {
                    name: 'Rolex Submariner',
                    reason: 'リューズ不良',
                    value: 450000
                  }
                ]
              },
              {
                id: 'description',
                name: '商品説明との相違',
                count: 12,
                percentage: 25.5,
                value: 2140000,
                trend: '-1.3%',
                severity: 'medium',
                items: [
                  {
                    name: 'Sony α7R V',
                    reason: 'レンズキット内容相違',
                    value: 180000
                  },
                  {
                    name: 'Omega Speedmaster',
                    reason: 'ベルト素材相違',
                    value: 220000
                  },
                  {
                    name: 'Canon RF 70-200mm',
                    reason: 'フィルター径記載ミス',
                    value: 160000
                  }
                ]
              },
              {
                id: 'shipping',
                name: '配送時破損',
                count: 8,
                percentage: 17.0,
                value: 1520000,
                trend: '+0.8%',
                severity: 'high',
                items: [
                  {
                    name: 'Leica M11',
                    reason: '本体外装損傷',
                    value: 380000
                  },
                  {
                    name: 'TAG Heuer Carrera',
                    reason: 'ガラス面ひび',
                    value: 290000
                  },
                  {
                    name: 'Fujifilm X-T5',
                    reason: 'LCD破損',
                    value: 140000
                  }
                ]
              },
              {
                id: 'expectation',
                name: '期待値との相違',
                count: 6,
                percentage: 12.8,
                value: 960000,
                trend: '-0.5%',
                severity: 'medium',
                items: [
                  {
                    name: 'Panasonic S5 II',
                    reason: '動画性能期待値相違',
                    value: 120000
                  },
                  {
                    name: 'Citizen Eco-Drive',
                    reason: 'バッテリー持続時間相違',
                    value: 80000
                  },
                  {
                    name: 'Sigma 24-70mm',
                    reason: 'AF速度期待値相違',
                    value: 90000
                  }
                ]
              },
              {
                id: 'customer',
                name: '顧客都合',
                count: 3,
                percentage: 6.4,
                value: 900000,
                trend: '-1.2%',
                severity: 'low',
                items: [
                  {
                    name: 'Casio G-Shock',
                    reason: 'サイズ感合わず',
                    value: 45000
                  },
                  {
                    name: 'Tamron 28-75mm',
                    reason: '用途変更',
                    value: 85000
                  },
                  {
                    name: 'Seiko Prospex',
                    reason: '色味イメージ相違',
                    value: 65000
                  }
                ]
              }
            ],
            actionPlan: [
              {
                issue: '商品不良・故障',
                action: '品質管理チームによる入荷時検品強化、メーカー別品質チェック項目追加',
                responsible: '品質管理チーム',
                deadline: '2週間以内',
                expectedReduction: '30%'
              },
              {
                issue: '商品説明との相違',
                action: '商品撮影・説明文作成ガイドライン見直し、ダブルチェック体制導入',
                responsible: '商品説明チーム',
                deadline: '1週間以内',
                expectedReduction: '25%'
              },
              {
                issue: '配送時破損',
                action: '梱包材見直し、配送業者との品質改善会議、高額商品専用梱包導入',
                responsible: '物流チーム',
                deadline: '3週間以内',
                expectedReduction: '40%'
              },
              {
                issue: '期待値との相違',
                action: 'より詳細な商品仕様記載、実機レビュー動画追加',
                responsible: 'マーケティングチーム',
                deadline: '2週間以内',
                expectedReduction: '20%'
              },
              {
                issue: '顧客都合',
                action: 'サイズガイド充実、バーチャル試着機能検討',
                responsible: 'カスタマーサポート',
                deadline: '1ヶ月以内',
                expectedReduction: '15%'
              }
            ]
          },

          // 収益直結指標（カメラ・時計特化）
          revenueMetrics: {
            todayRevenue: 1240000,
            todayTarget: 1500000,
            weeklyRevenue: 8940000,
            weeklyTarget: 10000000,
            monthlyRevenue: 34560000,
            monthlyTarget: 45000000,
            cameraRevenue: 20800000,
            watchRevenue: 13760000,
            growthRate: 12.3,
            conversionRate: 3.8
          },

          // 運営効率指標
          operationalMetrics: {
            inventoryTurnover: 4.2,
            averageProcessingTime: 2.1,
            qualityScore: 96.8,
            customerSatisfaction: 4.7,
            returnRate: 2.1,
            warehouseUtilization: 78.5,
            shippingAccuracy: 99.2,
            staffProductivity: 142
          },

          // 高額商品管理
          highValueItems: [
            {
              id: 'hv-001',
              name: 'Leica M10-P ブラック',
              category: 'カメラ',
              value: 890000,
              status: '検品待ち',
              location: 'A-01',
              priority: 'high',
              daysInInventory: 3
            },
            {
              id: 'hv-002', 
              name: 'Patek Philippe Nautilus',
              category: '時計',
              value: 1200000,
              status: '出品準備',
              location: 'S-05',
              priority: 'critical',
              daysInInventory: 1
            },
            {
              id: 'hv-003',
              name: 'Canon EF 600mm F4',
              category: 'カメラレンズ',
              value: 680000,
              status: '価格調査',
              location: 'B-12',
              priority: 'medium',
              daysInInventory: 5
            }
          ]
        };

        setDashboardData(practicalData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Dashboard data fetch error:', error);
        setLoading(false);
      });
  }, []);

  const handleUrgentTaskAction = (task: any) => {
    showToast({
      type: 'info',
      title: 'タスク実行',
      message: `${task.title}の処理を開始しました`
    });
  };

  const handleHighValueItemAction = (item: any) => {
    setSelectedProduct(item);
    setIsProductDetailOpen(true);
  };

  const handleReturnItemDetail = (item: any) => {
    setSelectedProduct(item);
    setIsProductDetailOpen(true);
  };

  const getUrgencyColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'urgent': return 'border-orange-500 bg-orange-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getUrgencyIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'urgent':
        return (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const headerActions = (
    <>
      <NexusButton
        onClick={() => window.location.reload()}
        variant="default"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        }
      >
        データ更新
      </NexusButton>
      <NexusButton
        onClick={() => setIsDatePickerOpen(true)}
        variant="primary"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      >
        詳細分析
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
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="カメラ・時計専門ダッシュボード"
          subtitle="緊急タスク・収益・運営効率・返品分析の統合管理"
          userType="seller"
          actions={headerActions}
        />

        {/* タブナビゲーション */}
        <div className="mt-8 border-b border-nexus-border">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('urgent')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'urgent'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                緊急タスク
                {dashboardData?.urgentTasks?.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {dashboardData.urgentTasks.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'revenue'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                収益管理
              </div>
            </button>
            <button
              onClick={() => setActiveTab('operations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'operations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                運営効率
              </div>
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'returns'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" />
                </svg>
                返品理由分析
                {dashboardData?.returnAnalysis?.totalReturns > 0 && (
                  <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-0.5">
                    {dashboardData.returnAnalysis.totalReturns}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>

        {/* 緊急タスクタブ */}
        {activeTab === 'urgent' && (
          <div className="space-y-6">
            {/* 緊急度別タスク一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData?.urgentTasks?.map((task: any) => (
                <div key={task.id} className={`p-6 rounded-lg border-2 ${getUrgencyColor(task.type)}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getUrgencyIcon(task.type)}
                      <div>
                        <h3 className="text-lg font-bold text-nexus-text-primary">{task.title}</h3>
                        <p className="text-sm text-nexus-text-secondary">{task.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-nexus-text-secondary">期限</p>
                      <p className="text-lg font-bold text-red-600">{task.deadline}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-nexus-text-primary">{task.count}</p>
                      <p className="text-xs text-nexus-text-secondary">件数</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{task.value}</p>
                      <p className="text-xs text-nexus-text-secondary">金額</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-orange-600">{task.priority.toUpperCase()}</p>
                      <p className="text-xs text-nexus-text-secondary">優先度</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-nexus-text-secondary mb-2">対象商品例:</p>
                    <div className="flex flex-wrap gap-2">
                      {task.items?.slice(0, 3).map((item: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-white rounded border text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <NexusButton
                    onClick={() => handleUrgentTaskAction(task)}
                    variant="primary"
                    className="w-full"
                  >
                    {task.action}
                  </NexusButton>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 収益管理タブ */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <NexusCard className="p-6">
                <h3 className="text-lg font-bold text-nexus-text-primary mb-4">今日の売上</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>実績</span>
                    <span className="font-bold text-green-600">¥{dashboardData?.revenueMetrics?.todayRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>目標</span>
                    <span>¥{dashboardData?.revenueMetrics?.todayTarget?.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(dashboardData?.revenueMetrics?.todayRevenue / dashboardData?.revenueMetrics?.todayTarget) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </NexusCard>

              <NexusCard className="p-6">
                <h3 className="text-lg font-bold text-nexus-text-primary mb-4">カメラ関連売上</h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">¥{dashboardData?.revenueMetrics?.cameraRevenue?.toLocaleString()}</p>
                  <p className="text-sm text-nexus-text-secondary">月間実績</p>
                </div>
              </NexusCard>

              <NexusCard className="p-6">
                <h3 className="text-lg font-bold text-nexus-text-primary mb-4">時計関連売上</h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">¥{dashboardData?.revenueMetrics?.watchRevenue?.toLocaleString()}</p>
                  <p className="text-sm text-nexus-text-secondary">月間実績</p>
                </div>
              </NexusCard>
            </div>
          </div>
        )}

        {/* 運営効率タブ */}
        {activeTab === 'operations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NexusCard className="p-6">
                <h3 className="text-lg font-bold text-nexus-text-primary mb-4">在庫・物流効率</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-nexus-text-secondary">返品率</span>
                    <span className="font-bold text-green-600">{dashboardData?.operationalMetrics?.returnRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-nexus-text-secondary">倉庫利用率</span>
                    <span className="font-bold text-blue-600">{dashboardData?.operationalMetrics?.warehouseUtilization}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-nexus-text-secondary">出荷精度</span>
                    <span className="font-bold text-purple-600">{dashboardData?.operationalMetrics?.shippingAccuracy}%</span>
                  </div>
                </div>
              </NexusCard>

              <NexusCard className="p-6">
                <h3 className="text-lg font-bold text-nexus-text-primary mb-4">品質指標</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-nexus-text-secondary">品質スコア</span>
                    <span className="font-bold text-green-600">{dashboardData?.operationalMetrics?.qualityScore}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-nexus-text-secondary">顧客満足度</span>
                    <span className="font-bold text-blue-600">{dashboardData?.operationalMetrics?.customerSatisfaction}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-nexus-text-secondary">在庫回転率</span>
                    <span className="font-bold text-purple-600">{dashboardData?.operationalMetrics?.inventoryTurnover}</span>
                  </div>
                </div>
              </NexusCard>
            </div>
          </div>
        )}

        {/* 返品理由分析タブ */}
        {activeTab === 'returns' && (
          <div className="space-y-6">
            {/* 返品サマリー */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="intelligence-card americas">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="action-orb red w-8 h-8">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" />
                      </svg>
                    </div>
                    <span className="status-badge warning text-[10px] px-1.5 py-0.5">総計</span>
                  </div>
                  <div className="metric-value font-display text-xl font-bold text-nexus-text-primary">
                    {dashboardData?.returnAnalysis?.totalReturns || '0'}
                  </div>
                  <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                    総返品数
                  </div>
                </div>
              </div>

              <div className="intelligence-card europe">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="action-orb orange w-8 h-8">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="status-badge error text-[10px] px-1.5 py-0.5">損失</span>
                  </div>
                  <div className="metric-value font-display text-xl font-bold text-nexus-text-primary">
                    ¥{dashboardData?.returnAnalysis?.totalReturnValue?.toLocaleString() || '0'}
                  </div>
                  <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                    返品総額
                  </div>
                </div>
              </div>

              <div className="intelligence-card asia">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="action-orb blue w-8 h-8">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    </div>
                    <span className="status-badge info text-[10px] px-1.5 py-0.5">カメラ</span>
                  </div>
                  <div className="metric-value font-display text-xl font-bold text-nexus-text-primary">
                    {dashboardData?.returnAnalysis?.categories?.camera?.returns || '0'}
                  </div>
                  <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                    カメラ返品数
                  </div>
                </div>
              </div>

              <div className="intelligence-card africa">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="action-orb green w-8 h-8">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="status-badge success text-[10px] px-1.5 py-0.5">時計</span>
                  </div>
                  <div className="metric-value font-display text-xl font-bold text-nexus-text-primary">
                    {dashboardData?.returnAnalysis?.categories?.watch?.returns || '0'}
                  </div>
                  <div className="metric-label text-nexus-text-secondary font-medium mt-1 text-xs">
                    時計返品数
                  </div>
                </div>
              </div>
            </div>

            {/* 返品理由別分析 */}
            <div className="intelligence-card global">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold text-nexus-text-primary">
                    返品理由別分析
                  </h2>
                  <span className="status-badge warning">
                    要改善
                  </span>
                </div>
                
                <div className="space-y-4">
                  {dashboardData?.returnAnalysis?.reasons?.map((reason: any) => (
                    <div key={reason.id} className="p-6 border border-nexus-border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-nexus-text-primary">{reason.name}</h3>
                            <p className="text-sm text-nexus-text-secondary">{reason.count}件 • {reason.percentage}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-red-600">¥{reason.value.toLocaleString()}</p>
                            <p className="text-xs text-nexus-text-secondary">損失額</p>
                          </div>
                          <div className="text-center">
                            <p className={`text-sm font-bold ${reason.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>
                              {reason.trend}
                            </p>
                            <p className="text-xs text-nexus-text-secondary">前月比</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(reason.severity)}`}>
                            {reason.severity === 'high' ? '高' : reason.severity === 'medium' ? '中' : '低'}
                          </span>
                        </div>
                      </div>
                      
                      {/* 具体的な返品商品例 */}
                      <div className="mt-4">
                        <p className="text-sm font-medium text-nexus-text-secondary mb-3">具体的な返品商品例:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {reason.items?.slice(0, 3).map((item: any, index: number) => (
                            <div key={index} className="p-3 bg-nexus-bg-tertiary rounded border">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-nexus-text-primary text-sm">{item.name}</h4>
                                <span className="text-sm font-bold text-red-600">¥{item.value.toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-nexus-text-secondary">{item.reason}</p>
                              <NexusButton
                                onClick={() => handleReturnItemDetail(item)}
                                variant="default"
                                size="sm"
                                className="mt-2 w-full"
                              >
                                詳細確認
                              </NexusButton>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 改善アクションプラン */}
            <div className="intelligence-card global">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-display font-bold text-nexus-text-primary">
                    改善アクションプラン
                  </h3>
                  <span className="status-badge success">
                    実行中
                  </span>
                </div>
                
                <div className="space-y-4">
                  {dashboardData?.returnAnalysis?.actionPlan?.map((plan: any, index: number) => (
                    <div key={index} className="p-4 border border-nexus-border rounded-lg bg-blue-50">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <h4 className="font-bold text-nexus-text-primary text-sm mb-1">対象問題</h4>
                          <p className="text-sm text-nexus-text-secondary">{plan.issue}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-nexus-text-primary text-sm mb-1">改善策</h4>
                          <p className="text-sm text-nexus-text-secondary">{plan.action}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-nexus-text-primary text-sm mb-1">担当</h4>
                          <p className="text-sm text-nexus-text-secondary">{plan.responsible}</p>
                          <p className="text-xs text-red-600 mt-1">期限: {plan.deadline}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-nexus-text-primary text-sm mb-1">期待効果</h4>
                          <p className="text-lg font-bold text-green-600">{plan.expectedReduction}削減</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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