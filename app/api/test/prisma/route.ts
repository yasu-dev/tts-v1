import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🧪 Prisma接続テスト開始...');
    
    // 1. 基本的な接続テスト
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ データベース接続成功');
    
    // 2. 注文データを実際に取得してみる
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        customer: { select: { username: true } },
        items: {
          include: {
            product: { select: { name: true, category: true } }
          }
        }
      }
    });
    
    console.log(`📦 取得した注文件数: ${orders.length}`);
    if (orders.length > 0) {
      console.log('最初の注文:', orders[0].orderNumber, orders[0].customer?.username);
      orders[0].items.forEach(item => {
        console.log('  商品:', item.product.name);
      });
    }

    // 3. レスポンスデータの構築（Sales APIと同じ形式）
    const testData = {
      status: 'success',
      dataSource: 'prisma',
      connectionTest,
      orderCount: orders.length,
      recentOrders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customer.username,
        totalAmount: order.totalAmount,
        status: order.status,
        itemCount: order.items.length,
        orderDate: order.orderDate.toISOString(),
        product: order.items[0]?.product.name || '商品なし',
        items: order.items.map(item => ({
          productName: item.product.name,
          category: item.product.category,
          quantity: item.quantity,
          price: item.price
        }))
      }))
    };

    console.log('✅ テストデータ構築完了');
    return NextResponse.json(testData);

  } catch (error) {
    console.error('❌ Prismaテストエラー:', error);
    
    const errorData = {
      status: 'error',
      dataSource: 'error',
      message: error.message,
      stack: error.stack
    };
    
    return NextResponse.json(errorData, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

