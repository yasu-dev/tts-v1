import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 売上データをPrismaから取得
    const [
      totalSales,
      monthlySales,
      dailySales,
      recentOrders,
      topProducts,
      salesByCategory,
      salesByStatus
    ] = await Promise.all([
      // 総売上額
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ['delivered', 'completed'] } }
      }),
      
      // 月次売上
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ['delivered', 'completed'] },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // 日次売上
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ['delivered', 'completed'] },
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // 最近の注文
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          customer: { select: { username: true } },
          items: {
            include: {
              product: { select: { name: true, category: true } }
            }
          }
        }
      }),
      
      // 人気商品（売上件数順）
      prisma.orderItem.groupBy({
        by: ['productId'],
        _count: { productId: true },
        _sum: { price: true, quantity: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 10
      }),
      
      // カテゴリ別売上（後で処理）
      Promise.resolve([]),
      
      // ステータス別注文数
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    // 人気商品の詳細情報を取得
    const productIds = topProducts.map(item => item.productId);
    const productDetails = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, category: true, imageUrl: true }
    });

    // 売上データを構築
    const salesData = {
      overview: {
        totalSales: totalSales._sum.totalAmount || 0,
        monthlySales: monthlySales._sum.totalAmount || 0,
        dailySales: dailySales._sum.totalAmount || 0,
        totalOrders: recentOrders.length,
        averageOrderValue: totalSales._sum.totalAmount && recentOrders.length 
          ? Math.round((totalSales._sum.totalAmount || 0) / recentOrders.length)
          : 0
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customer.username,
        totalAmount: order.totalAmount,
        status: order.status,
        itemCount: order.items.length,
        orderDate: order.orderDate.toISOString(),
        items: order.items.map(item => ({
          productName: item.product.name,
          category: item.product.category,
          quantity: item.quantity,
          price: item.price
        }))
      })),
      topProducts: topProducts.map(item => {
        const product = productDetails.find(p => p.id === item.productId);
        return {
          id: item.productId,
          name: product?.name || '商品名不明',
          category: product?.category || 'その他',
          imageUrl: product?.imageUrl || '/api/placeholder/150/150',
          salesCount: item._count.productId,
          totalSales: item._sum.price || 0,
          totalQuantity: item._sum.quantity || 0
        };
      }),
      salesByStatus: salesByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
        label: getStatusLabel(item.status)
      })),
      monthlyTrend: generateMonthlyTrend(), // 簡単な月次トレンド
      categoryBreakdown: await getCategoryBreakdown()
    };

    return NextResponse.json(salesData);
  } catch (error) {
    console.error('Sales API error:', error);
    
    return NextResponse.json(
      { error: '売上データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// ステータスラベルを取得
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '保留中',
    confirmed: '確認済み',
    processing: '処理中',
    shipped: '発送済み',
    delivered: '配送完了',
    completed: '完了',
    cancelled: 'キャンセル',
    returned: '返品'
  };
  return labels[status] || status;
}

// 月次トレンドを生成（過去12ヶ月）
function generateMonthlyTrend() {
  const months = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.toISOString().substring(0, 7), // YYYY-MM
      sales: Math.floor(Math.random() * 1000000) + 500000, // ダミーデータ
      orders: Math.floor(Math.random() * 100) + 50
    });
  }
  
  return months;
}

// カテゴリ別売上分析
async function getCategoryBreakdown() {
  try {
    const categoryStats = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { price: true, quantity: true }
    });

    // 商品情報を取得してカテゴリでグループ化
    const productIds = categoryStats.map(stat => stat.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: true }
    });

    const categoryMap: Record<string, { sales: number; quantity: number }> = {};
    
    categoryStats.forEach(stat => {
      const product = products.find(p => p.id === stat.productId);
      const category = product?.category || 'その他';
      
      if (!categoryMap[category]) {
        categoryMap[category] = { sales: 0, quantity: 0 };
      }
      
      categoryMap[category].sales += stat._sum.price || 0;
      categoryMap[category].quantity += stat._sum.quantity || 0;
    });

    return Object.entries(categoryMap).map(([category, data]) => ({
      category,
      sales: data.sales,
      quantity: data.quantity,
      percentage: 0 // 計算は後で追加可能
    }));
  } catch (error) {
    console.error('Category breakdown error:', error);
    return [];
  }
}