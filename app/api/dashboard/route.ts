import { NextResponse } from 'next/server';

export async function GET() {
  const dashboardData = {
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
}