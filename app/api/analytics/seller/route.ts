import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [
      totalRevenue,
      totalOrders,
      totalProducts,
      recentOrders,
      productsByCategory,
      ordersByRegion,
      monthlyRevenue
    ] = await Promise.all([
      // 総売上
      prisma.order.aggregate({
        where: { status: { in: ['delivered', 'shipped'] } },
        _sum: { totalAmount: true }
      }),
      
      // 総注文数
      prisma.order.count(),
      
      // 総商品数
      prisma.product.count(),
      
      // 最新の注文
      prisma.order.findMany({
        take: 30,
        orderBy: { orderDate: 'desc' },
        include: {
          items: {
            include: { product: true }
          },
          customer: true
        }
      }),
      
      // カテゴリー別商品
      prisma.product.groupBy({
        by: ['category'],
        _count: { id: true },
        _sum: { price: true }
      }),
      
      // 地域別注文（モック）
      prisma.order.findMany({
        include: {
          customer: {
            select: { username: true }
          }
        }
      }),
      
      // 月次売上（過去6ヶ月）
      prisma.order.findMany({
        where: {
          orderDate: {
            gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
          },
          status: { in: ['delivered', 'shipped'] }
        },
        orderBy: { orderDate: 'desc' }
      })
    ]);

    // カテゴリー別データを整理
    const categoryMapping: { [key: string]: string } = {
      'camera': 'カメラ本体',
      'lens': 'レンズ',
      'watch': '腕時計',
      'accessory': 'アクセサリ'
    };

    const categoryData = productsByCategory.map(cat => ({
      name: categoryMapping[cat.category] || cat.category,
      sales: cat._sum.price || 0,
      items: cat._count.id,
      avgPrice: Math.round((cat._sum.price || 0) / cat._count.id),
      growth: Math.random() * 20 + 5, // ランダムな成長率（実際の実装では過去データと比較）
      margin: Math.random() * 15 + 15 // ランダムな利益率
    }));

    // 地域別データの生成（日本の地域をシミュレート）
    const regions = [
      { name: '北米', sales: 15234000, growth: 22.4, orders: 423, percentage: 33.4 },
      { name: 'アジア', sales: 18456000, growth: 18.7, orders: 567, percentage: 40.4 },
      { name: 'ヨーロッパ', sales: 8967000, growth: 12.1, orders: 189, percentage: 19.6 },
      { name: 'その他', sales: 3022000, growth: 8.9, orders: 68, percentage: 6.6 }
    ];

    // 今月と先月の売上を計算
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthOrders = recentOrders.filter(order => 
      order.orderDate >= thisMonthStart &&
      (order.status === 'delivered' || order.status === 'shipped')
    );
    
    const lastMonthOrders = recentOrders.filter(order => 
      order.orderDate >= lastMonthStart && 
      order.orderDate <= lastMonthEnd &&
      (order.status === 'delivered' || order.status === 'shipped')
    );

    const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const growth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // 在庫効率の計算
    const activeProducts = await prisma.product.count({
      where: { status: { in: ['storage', 'listing'] } }
    });
    
    const soldProducts = await prisma.product.count({
      where: { status: 'sold' }
    });

    const totalProductsForTurnover = activeProducts + soldProducts;
    const turnoverRate = totalProductsForTurnover > 0 ? (soldProducts / totalProductsForTurnover) * 12 : 0; // 年間回転率

    // 平均保管日数の計算（サンプル）
    const averageDays = 87; // 固定値（実際の実装では日付計算が必要）

    // 滞留在庫の計算
    const slowMovingCount = await prisma.product.count({
      where: {
        status: { in: ['storage', 'listing'] },
        entryDate: {
          lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90日以上前
        }
      }
    });

    const response = {
      revenue: {
        total: totalRevenue._sum.totalAmount || 0,
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        growth: Number(growth.toFixed(1)),
        target: 5000000,
        targetProgress: Number(((thisMonthRevenue / 5000000) * 100).toFixed(1))
      },
      inventory: {
        totalValue: totalRevenue._sum.totalAmount || 0,
        turnoverRate: Number(turnoverRate.toFixed(1)),
        averageDays: averageDays,
        fastMoving: activeProducts,
        slowMoving: slowMovingCount
      },
      performance: {
        listingSuccess: 89.3,
        conversionRate: 12.8,
        averagePrice: totalRevenue._sum.totalAmount ? Math.round((totalRevenue._sum.totalAmount) / totalOrders) : 0,
        topCategory: categoryData[0]?.name || 'カメラ本体'
      },
      transactions: {
        count: totalOrders,
        volume: totalRevenue._sum.totalAmount || 0,
        regions: regions
      },
      categories: categoryData,
      timeSeries: generateTimeSeriesData(monthlyRevenue)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Seller analytics fetch error:', error);
    return NextResponse.json(
      { error: 'セラー分析データの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

function generateTimeSeriesData(orders: any[]) {
  // 過去7日間のデータを生成
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.toDateString() === date.toDateString();
    });
    
    const sales = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    days.push({
      date: date.toISOString().split('T')[0],
      sales: sales,
      orders: dayOrders.length,
      conversion: Math.random() * 5 + 10 // ランダムなコンバージョン率
    });
  }
  
  return days;
} 