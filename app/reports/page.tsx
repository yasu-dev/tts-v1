'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import KPIDashboard from '../components/features/kpi/KPIDashboard';
import { useState, useEffect } from 'react';
import PageWrapper from '@/app/components/ui/PageWrapper';
import NexusCard from '@/app/components/ui/NexusCard';
import SalesForecast from '@/app/components/features/analytics/SalesForecast';
import InventoryTurnoverAnalysis from '@/app/components/features/analytics/InventoryTurnoverAnalysis';
import CategoryProfitabilityAnalysis from '@/app/components/features/analytics/CategoryProfitabilityAnalysis';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'sales-forecast' | 'inventory-turnover' | 'category-profitability'>('overview');

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
    <PageWrapper 
      title="レポート・分析"
      description="売上実績と分析データを確認できます"
      actions={
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          レポートをエクスポート
        </button>
      }
    >
      <div className="space-y-6">

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              概要
            </button>
            <button
              onClick={() => setActiveTab('sales-forecast')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sales-forecast'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              売上予測
            </button>
            <button
              onClick={() => setActiveTab('inventory-turnover')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inventory-turnover'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              在庫回転率分析
            </button>
            <button
              onClick={() => setActiveTab('category-profitability')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'category-profitability'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              カテゴリー別収益性
            </button>
          </nav>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <NexusCard className="p-6">
              <h3 className="text-sm font-medium text-gray-600">月間売上</h3>
              <p className="text-3xl font-bold mt-2">¥{totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+12.5% 前月比</p>
            </NexusCard>
            <NexusCard className="p-6">
              <h3 className="text-sm font-medium text-gray-600">在庫回転率</h3>
              <p className="text-3xl font-bold mt-2">{totalItemsSold}回</p>
              <p className="text-sm text-gray-500 mt-1">業界平均: {totalItemsSold / salesData.length}回</p>
            </NexusCard>
            <NexusCard className="p-6">
              <h3 className="text-sm font-medium text-gray-600">返品率</h3>
              <p className="text-3xl font-bold mt-2">2.3%</p>
              <p className="text-sm text-green-600 mt-1">-0.5% 前月比</p>
            </NexusCard>
            <NexusCard className="p-6">
              <h3 className="text-sm font-medium text-gray-600">利益率</h3>
              <p className="text-3xl font-bold mt-2">18.5%</p>
              <p className="text-sm text-green-600 mt-1">+1.2% 前月比</p>
            </NexusCard>
          </div>
        )}

        {activeTab === 'sales-forecast' && <SalesForecast />}

        {activeTab === 'inventory-turnover' && <InventoryTurnoverAnalysis />}

        {activeTab === 'category-profitability' && <CategoryProfitabilityAnalysis />}
      </div>
    </PageWrapper>
  );
}