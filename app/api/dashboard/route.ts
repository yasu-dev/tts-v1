import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MockFallback } from '@/lib/mock-fallback';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // データベースから実際のデータを取得
    const [
      totalOrders,
      totalProducts,
      totalRevenue,
      recentOrders,
      productsByStatus,
      ordersByStatus,
      recentActivities
    ] = await Promise.all([
      // 注文総数
      prisma.order.count(),
      
      // 商品総数
      prisma.product.count(),
      
      // 総売上（delivered状態の注文のみ）
      prisma.order.aggregate({
        where: { status: { in: ['delivered', 'shipped'] } },
        _sum: { totalAmount: true }
      }),
      
      // 最新の注文（注文詳細とユーザー情報を含む）
      prisma.order.findMany({
        take: 10,
        orderBy: { orderDate: 'desc' },
        include: {
          customer: {
            select: { username: true, email: true }
          },
          items: {
            include: {
              product: {
                select: { name: true, sku: true }
              }
            }
          }
        }
      }),
      
      // ステータス別商品数
      prisma.product.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      
      // ステータス別注文数
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      
      // 最近のアクティビティ
      prisma.activity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true } },
          product: { select: { name: true, sku: true } },
          order: { select: { orderNumber: true } }
        }
      })
    ]);

    // ステータス別データを整理
    const statusSummary = {
      inbound: productsByStatus.find(p => p.status === 'inbound')?._count.id || 0,
      inspection: productsByStatus.find(p => p.status === 'inspection')?._count.id || 0,
      storage: productsByStatus.find(p => p.status === 'storage')?._count.id || 0,
      listing: productsByStatus.find(p => p.status === 'listing')?._count.id || 0,
      shipping: productsByStatus.find(p => p.status === 'shipping')?._count.id || 0,
      returned: productsByStatus.find(p => p.status === 'returned')?._count.id || 0,
    };

    // 注文を画面表示用の形式に変換
    const formattedOrders = recentOrders.map(order => ({
      id: order.orderNumber,
      customer: order.customer.username,
      seller: 'テストセラー', // シード時のセラー名
      certification: 'PREMIUM',
      items: order.items.length,
      value: `¥${order.totalAmount.toLocaleString()}`,
      status: order.status === 'delivered' ? 'optimal' : 
              order.status === 'shipped' ? 'monitoring' : 
              order.status === 'processing' ? 'monitoring' : order.status,
      region: getRegionFromStatus(order.status)
    }));

    // アクティビティを画面表示用の形式に変換
    const formattedActivities = recentActivities.map(activity => ({
      id: activity.id,
      type: activity.type,
      title: getActivityTitle(activity.type),
      description: activity.description || `${activity.product?.name || activity.order?.orderNumber || ''}`,
      timestamp: activity.createdAt.toISOString(),
      color: getActivityColor(activity.type)
    }));

    // アラートの生成
    const alerts = generateAlerts(productsByStatus, ordersByStatus);

    const dashboardData = {
      summary: {
        totalAssetValue: totalRevenue._sum.totalAmount || 0,
        inventoryCount: totalProducts,
        todaySales: getTodaySales(recentOrders),
        orderCount: totalOrders,
        changeFromLastMonth: 12.5, // 仮の値
        changeFromYesterday: 0 // 仮の値
      },
      statusSummary,
      alerts,
      recentActivities: formattedActivities,
      globalRevenue: totalRevenue._sum.totalAmount || 0,
      activeExports: totalProducts,
      inventoryEfficiency: Math.round((totalProducts / (totalProducts + statusSummary.returned)) * 100) || 92,
      marketExpansionRate: 15.8, // 仮の値
      orders: formattedOrders,
      salesData: {
        total: totalRevenue._sum.totalAmount || 0,
        growth: 12.5,
        recentSales: recentOrders.slice(0, 5).map(order => ({
          id: order.id,
          amount: order.totalAmount,
          date: order.orderDate
        }))
      },
      inventoryData: {
        totalItems: totalProducts,
        totalValue: totalRevenue._sum.totalAmount || 0
      }
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Dashboard fetch error:', error);
    
    // エラー時はフォールバックデータを使用
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
          recentActivities: [],
          globalRevenue: 0,
          activeExports: 0,
          inventoryEfficiency: 0,
          marketExpansionRate: 0,
          orders: [],
          salesData: {
            total: 0,
            growth: 0,
            recentSales: []
          },
          inventoryData: {
            totalItems: 0,
            totalValue: 0
          }
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

// ヘルパー関数
function getRegionFromStatus(status: string): string {
  const regionMap: { [key: string]: string } = {
    'delivered': 'アジア太平洋',
    'shipped': '北米',
    'processing': 'ヨーロッパ',
    'pending': '中東',
    'confirmed': 'アジア太平洋',
    'cancelled': 'その他'
  };
  return regionMap[status] || 'その他';
}

function getActivityTitle(type: string): string {
  const titleMap: { [key: string]: string } = {
    'inbound': '入庫完了',
    'inspection': '検品開始',
    'listing': '出品開始',
    'sold': '売約済み',
    'shipping': '発送完了',
    'delivered': '配送完了',
    'returned': '返品処理'
  };
  return titleMap[type] || type;
}

function getActivityColor(type: string): string {
  const colorMap: { [key: string]: string } = {
    'inbound': '#4CAF50',
    'inspection': '#9C27B0',
    'listing': '#FF9800',
    'sold': '#2196F3',
    'shipping': '#FF5722',
    'delivered': '#4CAF50',
    'returned': '#F44336'
  };
  return colorMap[type] || '#757575';
}

function getTodaySales(orders: any[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return orders
    .filter(order => {
      const orderDate = new Date(order.orderDate);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    })
    .reduce((sum, order) => sum + order.totalAmount, 0);
}

function generateAlerts(productsByStatus: any[], ordersByStatus: any[]): any[] {
  const alerts = [];
  
  // 検品待ちアラート
  const inspectionCount = productsByStatus.find(p => p.status === 'inspection')?._count.id || 0;
  if (inspectionCount > 0) {
    alerts.push({
      id: 'alert-inspection',
      type: 'warning',
      icon: '🟡',
      title: '検品中商品',
      description: `${inspectionCount}件の商品が検品中です`,
      priority: 'medium',
      createdAt: new Date().toISOString()
    });
  }
  
  // 入庫待ちアラート
  const inboundCount = productsByStatus.find(p => p.status === 'inbound')?._count.id || 0;
  if (inboundCount > 0) {
    alerts.push({
      id: 'alert-inbound',
      type: 'info',
      icon: '🔵',
      title: '入庫待ち商品',
      description: `${inboundCount}件の商品が入庫待ちです`,
      priority: 'low',
      createdAt: new Date().toISOString()
    });
  }
  
  // 処理中注文アラート
  const processingCount = ordersByStatus.find(o => o.status === 'processing')?._count.id || 0;
  if (processingCount > 0) {
    alerts.push({
      id: 'alert-processing',
      type: 'urgent',
      icon: '🔴',
      title: '処理中注文',
      description: `${processingCount}件の注文が処理中です`,
      priority: 'high',
      createdAt: new Date().toISOString()
    });
  }
  
  return alerts;
}