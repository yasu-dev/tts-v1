import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // 開発環境では、モックデータファイルを読み込む
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      const filePath = path.join(process.cwd(), 'data', 'analytics-mock.json');
      const fileContents = await fs.readFile(filePath, 'utf8');
      const analyticsData = JSON.parse(fileContents);
      
      return NextResponse.json(analyticsData);
    } else {
      // 本番環境用のデータ（将来的にPrismaクエリに置き換え）
      const analyticsData = {
        summary: {
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          conversionRate: 0
        },
        salesByCategory: [],
        salesTrend: [],
        topProducts: [],
        customerAnalytics: {
          newCustomers: 0,
          returningCustomers: 0,
          averageOrderValue: 0
        },
        notifications: []
      };
      
      return NextResponse.json(analyticsData);
    }
  } catch (error) {
    console.error('Analytics data fetch error:', error);
    return NextResponse.json(
      { error: 'アナリティクスデータの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 