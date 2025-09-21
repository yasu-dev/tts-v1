import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function GET() {

  try {
    // Get status counts
    const statusCounts = await prisma.product.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Get category counts
    const categoryCounts = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    // Get total inventory value
    const totalValue = await prisma.product.aggregate({
      _sum: {
        price: true,
      },
      where: {
        status: {
          not: 'sold'
        }
      }
    });

    // Transform status data
    const statusStats = statusCounts.reduce((acc, item) => {
      const japaneseStatus = item.status.replace('inbound_pending', '入庫待ち')
                                      .replace('inbound', '入庫')
                                      .replace('inspection', '検品')
                                      .replace('storage', '保管')
                                      .replace('listing', '出品')
                                      .replace('ordered', '受注')
                                      .replace('shipping', '出荷')
                                      .replace('delivery', '配送')
                                      .replace('sold', '売約済み')
                                      .replace('workstation', '梱包待ち')
                                      .replace('returned', '返品');
      acc[japaneseStatus] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Transform category data
    const categoryStats = categoryCounts.reduce((acc, item) => {
      const japaneseCategory = item.category.replace('camera_body', 'カメラ本体')
                                          .replace('lens', 'レンズ')
                                          .replace('watch', '腕時計')
                                          .replace('accessory', 'アクセサリ');
      acc[japaneseCategory] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      statusStats,
      categoryStats,
      totalValue: totalValue._sum.price || 0,
      totalItems: statusCounts.reduce((sum, item) => sum + item._count.id, 0)
    });
  } catch (error) {
    console.error('Inventory stats error:', error);
    

    
    // エラー時はデフォルトデータを返す
    return NextResponse.json({
      statusStats: {},
      categoryStats: {},
      totalValue: 0,
      totalItems: 0
    });
  }
}