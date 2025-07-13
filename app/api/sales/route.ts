import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MockFallback } from '@/lib/mock-fallback';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Prismaを使用して売上データを取得
    // TODO: 実際のPrismaクエリを実装する際は、以下のような構造になる
    // const orders = await prisma.order.findMany({ where: { status: 'completed' } });
    // const salesStats = await prisma.order.aggregate(...);
    
    // 現在はJSONファイルからデータを読み込む（Prismaスキーマが整備されるまで）
    const filePath = path.join(process.cwd(), 'data', 'seller-mock.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const sellerData = JSON.parse(fileContents);
    
    // 売上データを抽出
    const salesData = sellerData.sales;

    return NextResponse.json(salesData);
  } catch (error) {
    console.error('Sales API error:', error);
    
    // Prismaエラーやファイル読み込みエラーの場合はフォールバックデータを使用
    if (MockFallback.isPrismaError(error)) {
      console.log('Using fallback data for sales due to Prisma error');
      try {
        const fallbackData = {
          totalSales: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          conversionRate: 0,
          topProducts: [],
          recentOrders: [],
          salesTrend: []
        };
        return NextResponse.json(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback data error:', fallbackError);
      }
    }
    
    return NextResponse.json(
      { error: '売上データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  
  // 出品設定やプロモーション作成の処理
  if (body.type === 'listing') {
    // 出品設定の処理
    console.log('出品設定:', body);
    return NextResponse.json({ 
      success: true, 
      message: '出品設定が保存されました',
      listingId: `LST-${Date.now()}`
    });
  } else if (body.type === 'promotion') {
    // プロモーション作成の処理
    console.log('プロモーション作成:', body);
    return NextResponse.json({ 
      success: true, 
      message: 'プロモーションが作成されました',
      promotionId: `PROMO-${Date.now()}`
    });
  }

  return NextResponse.json({ success: false, message: '無効なリクエストです' }, { status: 400 });
} 