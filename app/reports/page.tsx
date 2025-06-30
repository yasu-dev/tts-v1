'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import KPIDashboard from '../components/features/kpi/KPIDashboard';
import { useState, useEffect } from 'react';

interface SalesData {
  period: string;
  revenue: number;
  itemsSold: number;
  averagePrice: number;
  profit: number;
}

interface CategoryData {
  category: string;
  revenue: number;
  percentage: number;
  itemsSold: number;
}

export default function ReportsPage() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // デモデータ
  useEffect(() => {
    const demoSalesData: SalesData[] = [
      {
        period: '2024年6月',
        revenue: 2450000,
        itemsSold: 8,
        averagePrice: 306250,
        profit: 490000,
      },
      {
        period: '2024年5月',
        revenue: 3200000,
        itemsSold: 12,
        averagePrice: 266667,
        profit: 640000,
      },
      {
        period: '2024年4月',
        revenue: 1800000,
        itemsSold: 6,
        averagePrice: 300000,
        profit: 360000,
      },
      {
        period: '2024年3月',
        revenue: 4100000,
        itemsSold: 15,
        averagePrice: 273333,
        profit: 820000,
      },
    ];

    const demoCategoryData: CategoryData[] = [
      {
        category: 'カメラ本体',
        revenue: 2850000,
        percentage: 45.2,
        itemsSold: 12,
      },
      {
        category: '腕時計',
        revenue: 2200000,
        percentage: 34.9,
        itemsSold: 8,
      },
      {
        category: 'レンズ',
        revenue: 920000,
        percentage: 14.6,
        itemsSold: 15,
      },
      {
        category: 'アクセサリ',
        revenue: 330000,
        percentage: 5.3,
        itemsSold: 6,
      },
    ];

    setSalesData(demoSalesData);
    setCategoryData(demoCategoryData);
  }, []);

  const totalRevenue = salesData.reduce((sum, data) => sum + data.revenue, 0);
  const totalItemsSold = salesData.reduce((sum, data) => sum + data.itemsSold, 0);
  const averageMonthlyRevenue = totalRevenue / salesData.length;

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              売上レポート
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              売上実績と分析データを確認できます
            </p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="week">週別</option>
              <option value="month">月別</option>
              <option value="quarter">四半期別</option>
              <option value="year">年別</option>
            </select>
            <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              レポート出力
            </button>
            <button 
              onClick={() => window.location.href = '/reports/monthly'}
              className="button-primary"
            >
              月次レポート
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  総売上
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  ¥{totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-green-600 dark:text-green-400">
              +15.3% 前月比
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  販売点数
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {totalItemsSold}点
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              月平均 {(totalItemsSold / salesData.length).toFixed(1)}点
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  月平均売上
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  ¥{averageMonthlyRevenue.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              過去4ヶ月平均
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  利益率
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  20.0%
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
              業界平均 18.5%
            </p>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              売上推移
            </h2>
            <div className="space-y-4">
              {salesData.map((data, index) => (
                <div key={data.period} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{data.period}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {data.itemsSold}点 | 平均¥{data.averagePrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      ¥{data.revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      利益 ¥{data.profit.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              カテゴリー別売上
            </h2>
            <div className="space-y-4">
              {categoryData.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.category}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {category.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>¥{category.revenue.toLocaleString()}</span>
                    <span>{category.itemsSold}点</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPI Dashboard */}
        <KPIDashboard />

        {/* Detailed Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            詳細分析
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                好調なカテゴリー
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                カメラ本体の売上が好調で、前月比+25%の成長を記録
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                注意事項
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                アクセサリの在庫回転率が低下、価格見直しを推奨
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                提案
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                高級腕時計の仕入れ拡大で収益性向上が期待できます
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}