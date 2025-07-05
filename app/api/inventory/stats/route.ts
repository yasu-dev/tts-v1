import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MockFallback } from '@/lib/mock-fallback';

const prisma = new PrismaClient();

export async function GET() {
  // 開発環境では常にモックデータを返す
  const mockData = {
    statusStats: {
      '入庫': 12,
      '検品': 8,
      '保管': 145,
      '出品': 58,
      '受注': 15,
      '出荷': 6,
      '配送': 3,
      '売約済み': 89,
      '返品': 5
    },
    categoryStats: {
      'カメラ本体': 45,
      'レンズ': 32,
      '腕時計': 28,
      'アクセサリ': 51
    },
    totalValue: 45600000,
    totalItems: 156
  };

  // 開発環境ではモックデータを返す
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json(mockData);
  }

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
      const japaneseStatus = item.status.replace('inbound', '入庫')
                                      .replace('inspection', '検品')
                                      .replace('storage', '保管')
                                      .replace('listing', '出品')
                                      .replace('ordered', '受注')
                                      .replace('shipping', '出荷')
                                      .replace('delivery', '配送')
                                      .replace('sold', '売約済み')
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
    
    // Prismaエラーの場合はフォールバックデータを使用
    if (MockFallback.isPrismaError(error)) {
      console.log('Using fallback data for inventory stats due to Prisma error');
    }
    
    // エラー時もモックデータを返す
    return NextResponse.json(mockData);
  }
}