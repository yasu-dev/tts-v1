import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MockFallback } from '@/lib/mock-fallback';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Prismaを使用して売上データを取得
    const orders = await prisma.order.findMany({
      include: {
        customer: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { orderDate: 'desc' },
      take: 50, // 最新50件を取得
    });

    // 統計データを計算
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    // 受注一覧用データに変換
    const recentOrders = orders.map(order => ({
      id: order.id,
      orderId: order.orderNumber,
      product: order.items.length > 0 ? order.items[0].product.name : '商品なし',
      customer: order.customer.username,
      amount: order.totalAmount,
      status: mapOrderStatus(order.status),
      date: order.orderDate.toLocaleDateString('ja-JP')
    }));

    // トップ商品を計算（注文数の多い商品）
    const productCounts = new Map();
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.product.name;
        const current = productCounts.get(key) || { count: 0, revenue: 0 };
        productCounts.set(key, {
          count: current.count + item.quantity,
          revenue: current.revenue + item.price * item.quantity
        });
      });
    });

    const topProducts = Array.from(productCounts.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 売上データ構造
    const salesData = {
      totalSales,
      totalOrders,
      averageOrderValue,
      conversionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0.0',
      topProducts,
      recentOrders,
      salesTrend: generateSalesTrend(orders)
    };

    return NextResponse.json(salesData);
  } catch (error) {
    console.error('Sales API error:', error);
    
    // Prismaエラーやファイル読み込みエラーの場合はフォールバックデータを使用
    if (MockFallback.isPrismaError(error)) {
      console.log('Using fallback data for sales due to Prisma error');
      try {
        // JSONファイルからフォールバックデータを読み込む
        const filePath = path.join(process.cwd(), 'data', 'seller-mock.json');
        const fileContents = await fs.readFile(filePath, 'utf8');
        const sellerData = JSON.parse(fileContents);
        const salesData = sellerData.sales;
        return NextResponse.json(salesData);
      } catch (fallbackError) {
        console.error('Fallback data error:', fallbackError);
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

// 注文ステータスを日本語に変換
function mapOrderStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': '保留中',
    'confirmed': '確認済み',
    'processing': '処理中',
    'shipped': '出荷済',
    'delivered': '配送完了',
    'cancelled': 'キャンセル',
    'returned': '返品'
  };
  return statusMap[status] || status;
}

// 売上トレンドデータを生成（過去7日間）
function generateSalesTrend(orders: any[]): any[] {
  const today = new Date();
  const trend = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('ja-JP');
    
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.toDateString() === date.toDateString();
    });
    
    const dayRevenue = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    trend.push({
      date: dateStr,
      sales: dayRevenue,
      orders: dayOrders.length
    });
  }
  
  return trend;
} 