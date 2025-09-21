import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔍 データベース接続テスト開始');
    
    // 1. データベース接続テスト
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ データベース接続成功:', dbTest);

    // 2. 各テーブルのレコード数を確認
    const counts = await Promise.allSettled([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.orderItem.count(),
    ]);

    const tableCounts = {
      users: counts[0].status === 'fulfilled' ? counts[0].value : `エラー: ${counts[0].reason}`,
      orders: counts[1].status === 'fulfilled' ? counts[1].value : `エラー: ${counts[1].reason}`,
      products: counts[2].status === 'fulfilled' ? counts[2].value : `エラー: ${counts[2].reason}`,
      orderItems: counts[3].status === 'fulfilled' ? counts[3].value : `エラー: ${counts[3].reason}`,
    };

    console.log('📊 テーブル別レコード数:', tableCounts);

    // 3. 最新の注文データを取得（存在する場合）
    let recentOrders = null;
    try {
      recentOrders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: { select: { username: true } },
          items: {
            include: {
              product: { select: { name: true, category: true } }
            }
          }
        }
      });
      console.log('📦 最新の注文データ:', recentOrders.length > 0 ? '存在する' : '存在しない');
    } catch (orderError) {
      console.error('❌ 注文データ取得エラー:', orderError);
      recentOrders = `エラー: ${orderError}`;
    }

    // 4. ユーザーデータの確認
    let users = null;
    try {
      users = await prisma.user.findMany({
        take: 3,
        select: { id: true, username: true, role: true, createdAt: true }
      });
      console.log('👥 ユーザーデータ:', users.length > 0 ? '存在する' : '存在しない');
    } catch (userError) {
      console.error('❌ ユーザーデータ取得エラー:', userError);
      users = `エラー: ${userError}`;
    }

    // 5. 商品データの確認
    let products = null;
    try {
      products = await prisma.product.findMany({
        take: 3,
        select: { id: true, name: true, category: true, price: true }
      });
      console.log('🏷️ 商品データ:', products.length > 0 ? '存在する' : '存在しない');
    } catch (productError) {
      console.error('❌ 商品データ取得エラー:', productError);
      products = `エラー: ${productError}`;
    }

    // 6. Activityテーブルの詳細分析
    let activityAnalysis = null;
    try {
      const activityCount = await prisma.activity.count();
      const activityByType = await prisma.activity.groupBy({
        by: ['type'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      });
      const recentActivities = await prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: { select: { username: true } },
          product: { select: { name: true, sku: true } },
          order: { select: { orderNumber: true } }
        }
      });
      
      activityAnalysis = {
        totalCount: activityCount,
        byType: activityByType,
        recentActivities: recentActivities.map(a => ({
          id: a.id,
          type: a.type,
          description: a.description,
          productName: a.product?.name,
          userName: a.user?.username,
          createdAt: a.createdAt
        }))
      };
      console.log('📊 Activity分析完了');
    } catch (activityError) {
      console.error('❌ Activity分析エラー:', activityError);
      activityAnalysis = `エラー: ${activityError}`;
    }

    // 7. InventoryMovementテーブルの確認
    let movementAnalysis = null;
    try {
      const movementCount = await prisma.inventoryMovement.count();
      const recentMovements = await prisma.inventoryMovement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          product: { select: { name: true, sku: true } },
          fromLocation: { select: { code: true } },
          toLocation: { select: { code: true } }
        }
      });
      
      movementAnalysis = {
        totalCount: movementCount,
        recentMovements: recentMovements.map(m => ({
          id: m.id,
          productName: m.product.name,
          fromLocation: m.fromLocation?.code,
          toLocation: m.toLocation?.code,
          createdAt: m.createdAt
        }))
      };
      console.log('📍 InventoryMovement分析完了');
    } catch (movementError) {
      console.error('❌ InventoryMovement分析エラー:', movementError);
      movementAnalysis = `エラー: ${movementError}`;
    }

    const debugInfo = {
      status: 'success',
      databaseConnection: '✅ 接続成功',
      tableCounts,
      sampleData: {
        orders: recentOrders,
        users,
        products
      },
      detailedAnalysis: {
        activities: activityAnalysis,
        movements: movementAnalysis
      },
      prismaVersion: '不明',
      databaseUrl: process.env.DATABASE_URL || 'file:./dev.db'
    };

    return NextResponse.json(debugInfo);
    
  } catch (error) {
    console.error('💥 データベースデバッグエラー:', error);
    
    const errorInfo = {
      status: 'error',
      message: 'データベース接続またはクエリでエラーが発生しました',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      databaseUrl: process.env.DATABASE_URL || 'file:./dev.db'
    };

    return NextResponse.json(errorInfo, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

