import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MockFallback } from '@/lib/mock-fallback';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Prismaを使用してダッシュボードデータを取得
    // TODO: 実際のPrismaクエリを実装する際は、以下のような構造になる
    // const products = await prisma.product.findMany(...);
    // const orders = await prisma.order.findMany(...);
    
    // 現在はJSONファイルからデータを読み込む（Prismaスキーマが整備されるまで）
    const filePath = path.join(process.cwd(), 'data', 'dashboard.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const dashboardData = JSON.parse(fileContents);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    
    // Prismaエラーやファイル読み込みエラーの場合はフォールバックデータを使用
    if (MockFallback.isPrismaError(error)) {
      console.log('Using fallback data for dashboard due to Prisma error');
      try {
        // 基本的なダッシュボードデータを返す
        const fallbackData = {
          summary: {
            totalAssetValue: 0,
            inventoryCount: 0,
            todaySales: 0,
            orderCount: 0
          },
          statusSummary: {
            inbound: 0,
            inspection: 0,
            storage: 0,
            listing: 0,
            shipping: 0,
            returned: 0
          },
          alerts: [],
          recentActivities: []
        };
        return NextResponse.json(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback data error:', fallbackError);
      }
    }

    return NextResponse.json(
      { error: 'ダッシュボードデータの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}