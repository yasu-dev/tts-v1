import { NextResponse } from 'next/server';
import { MockFallback } from '@/lib/mock-fallback';

export async function GET() {
  try {
    const dashboardData = {
    // ダッシュボードページで使用されるデータ
    globalRevenue: 45600000,
    activeExports: 156,
    inventoryEfficiency: 92,
    marketExpansionRate: 15.8,
    
    // 注文データ（グローバル取引モニター用）
    orders: [
      {
        id: 'ORD-2024-001',
        customer: '田中商事',
        seller: 'Global Electronics',
        certification: 'PREMIUM',
        items: 3,
        value: '¥450,000',
        status: 'optimal',
        region: 'アジア太平洋'
      },
      {
        id: 'ORD-2024-002',
        customer: 'Smith Trading',
        seller: 'Tech Solutions',
        certification: 'STANDARD',
        items: 1,
        value: '¥280,000',
        status: 'monitoring',
        region: 'ヨーロッパ'
      },
      {
        id: 'ORD-2024-003',
        customer: '佐藤時計店',
        seller: 'Luxury Imports',
        certification: 'LUXURY',
        items: 1,
        value: '¥1,200,000',
        status: 'optimal',
        region: '北米'
      },
      {
        id: 'ORD-2024-004',
        customer: 'Johnson Corp',
        seller: 'Camera World',
        certification: 'CERTIFIED',
        items: 2,
        value: '¥320,000',
        status: 'monitoring',
        region: 'アフリカ'
      },
      {
        id: 'ORD-2024-005',
        customer: '鈴木貿易',
        seller: 'Digital Pro',
        certification: 'PREMIUM',
        items: 4,
        value: '¥680,000',
        status: 'optimal',
        region: 'アジア太平洋'
      }
    ],
    
    // 販売データ（レポート用）
    salesData: {
      total: 45600000,
      growth: 12.5,
      recentSales: [
        { date: '2024-12-25', amount: 450000, product: 'Canon EOS R5' },
        { date: '2024-12-24', amount: 280000, product: 'Sony FE 24-70mm' },
        { date: '2024-12-23', amount: 1200000, product: 'Rolex Submariner' }
      ]
    },
    
    // 在庫データ（レポート用）
    inventoryData: {
      totalItems: 156,
      totalValue: 45600000,
      categories: {
        camera: 45,
        lens: 32,
        watch: 28,
        jewelry: 15,
        bag: 20,
        other: 16
      }
    },
    
    // チャート用データ
    statusChartData: [
      { name: '入庫待ち', value: 12, percentage: 7.7 },
      { name: '検品中', value: 8, percentage: 5.1 },
      { name: '保管中', value: 145, percentage: 92.9 },
      { name: '出品中', value: 58, percentage: 37.2 },
      { name: '配送中', value: 6, percentage: 3.8 },
      { name: '返品', value: 5, percentage: 3.2 }
    ],
    
    categoryChartData: [
      { name: 'カメラ本体', value: 45, percentage: 28.8 },
      { name: 'レンズ', value: 32, percentage: 20.5 },
      { name: '腕時計', value: 28, percentage: 17.9 },
      { name: 'ジュエリー', value: 15, percentage: 9.6 },
      { name: 'バッグ', value: 20, percentage: 12.8 },
      { name: 'その他', value: 16, percentage: 10.3 }
    ],
    
    // 既存のデータも保持
    summary: {
      totalAssetValue: 12456789,
      inventoryCount: 234,
      todaySales: 456789,
      orderCount: 12,
    },
    statusSummary: {
      inbound: 12,
      inspection: 8,
      storage: 145,
      listing: 58,
      shipping: 6,
      returned: 5,
    },
    alerts: [
      {
        id: '1',
        type: 'error',
        title: '在庫切れ警告',
        message: 'Canon EF 70-200mm f/2.8L の在庫が残り1点です',
        timestamp: '2024-06-28T10:00:00Z',
      },
      {
        id: '2',
        type: 'warning',
        title: '検品待ち',
        message: '5点の商品が24時間以上検品待ちです',
        timestamp: '2024-06-28T09:30:00Z',
      },
    ],
    recentActivities: [
      {
        id: '1',
        time: '10分前',
        action: 'カメラ本体 Canon EOS R5 が入庫されました',
        type: 'inbound',
        user: '田中',
      },
      {
        id: '2',
        time: '25分前',
        action: 'レンズ Sony FE 24-70mm が出品されました',
        type: 'listing',
        user: '佐藤',
      },
      {
        id: '3',
        time: '1時間前',
        action: 'Rolex Submariner が売約済みになりました',
        type: 'sold',
        user: 'システム',
      },
      {
        id: '4',
        time: '2時間前',
        action: 'Hermès バッグの検品が完了しました',
        type: 'inspection',
        user: '鈴木',
      },
    ],
  };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    
    // エラーの場合はフォールバックデータを使用
    console.log('Using fallback data for dashboard due to error');
    try {
      const fallbackData = await MockFallback.getDashboardFallback();
      return NextResponse.json(fallbackData);
    } catch (fallbackError) {
      console.error('Fallback data error:', fallbackError);
    }

    return NextResponse.json(
      { error: 'ダッシュボードデータの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}