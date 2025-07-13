import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MockFallback } from '@/lib/mock-fallback';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Prismaを使用してアナリティクスデータを取得
    // TODO: 実際のPrismaクエリを実装する際は、以下のような構造になる
    // const salesData = await prisma.order.aggregate(...);
    // const productData = await prisma.product.groupBy(...);
    
    // 現在はJSONファイルからデータを読み込む（Prismaスキーマが整備されるまで）
    const filePath = path.join(process.cwd(), 'data', 'analytics-mock.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const analyticsData = JSON.parse(fileContents);
    
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Analytics data fetch error:', error);
    
    // Prismaエラーやファイル読み込みエラーの場合はフォールバックデータを使用
    if (MockFallback.isPrismaError(error)) {
      console.log('Using fallback data for analytics due to Prisma error');
      try {
        // 基本的なアナリティクスデータを返す
        const fallbackData = {
          kpis: {},
          categoryPerformance: [],
          monthlyTrends: [],
          notifications: []
        };
        return NextResponse.json(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback data error:', fallbackError);
      }
    }
    
    return NextResponse.json(
      { error: 'アナリティクスデータの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 