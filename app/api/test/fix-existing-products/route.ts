import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ⚠️ TEST/DEMO FEATURE - DELETE BEFORE PRODUCTION ⚠️
 * 
 * 既存のテスト商品に不足しているShipmentエントリを追加
 */

export async function POST(request: NextRequest) {
  console.log('🧪 [FIX API] 既存商品のShipmentエントリ修正開始');
  
  try {
    // 特定のテスト商品ID（sss商品）
    const targetProductIds = [
      'cmfawkq4h000i12zkzwanytd0', // sss商品
      'cmf7v0jtc0002elm9gn4dxx2c', // テスト商品
      'cmeqdnrhe000tw3j7eqlbvsj2'  // Nikon Z9
    ];
    
    console.log('🧪 [FIX API] 対象商品ID:', targetProductIds);
    
    // 対象商品を取得
    const products = await prisma.product.findMany({
      where: { 
        id: { in: targetProductIds },
        status: 'sold' // sold状態の商品のみ
      }
    });
    
    console.log('🧪 [FIX API] 見つかった商品数:', products.length);
    
    for (const product of products) {
      console.log('🧪 [FIX API] 商品処理開始:', product.name, product.id);
      
      // 既存のShipmentエントリをチェック
      const existingShipment = await prisma.shipment.findFirst({
        where: { productId: product.id }
      });
      
      if (existingShipment) {
        console.log('🧪 [FIX API] 既存Shipmentあり - スキップ:', existingShipment.id);
        continue;
      }
      
      // 関連する注文を探す
      let relatedOrder = await prisma.order.findFirst({
        where: {
          items: {
            some: { productId: product.id }
          }
        },
        include: {
          items: true
        }
      });
      
      if (!relatedOrder) {
        // モック注文を作成
        console.log('🧪 [FIX API] モック注文作成:', product.name);
        
        let testCustomer = await prisma.user.findUnique({
          where: { email: 'test@example.com' }
        });
        
        if (!testCustomer) {
          testCustomer = await prisma.user.create({
            data: {
              username: 'テストユーザー',
              email: 'test@example.com',
              firstName: 'テスト',
              lastName: 'ユーザー',
              role: 'customer',
              password: 'dummy-password'
            }
          });
        }
        
        const mockOrder = await prisma.order.create({
          data: {
            orderNumber: `FIX-${Date.now()}-${product.id.slice(-4)}`,
            customerId: testCustomer.id,
            customerName: 'テストユーザー',
            customerEmail: 'test@example.com',
            status: 'confirmed',
            totalAmount: product.price || 100000,
            currency: 'JPY',
            orderDate: new Date(),
            shippingAddress: '〒150-0001 東京都渋谷区神宮前1-1-1 テストビル101',
            notes: '⚠️ 既存商品修正用モック注文です'
          }
        });
        
        await prisma.orderItem.create({
          data: {
            orderId: mockOrder.id,
            productId: product.id,
            quantity: 1,
            price: product.price || 100000,
            name: product.name
          }
        });
        
        relatedOrder = mockOrder as any;
      }
      
      // Shipmentエントリを作成
      const testShipment = await prisma.shipment.create({
        data: {
          orderId: relatedOrder.id,
          productId: product.id,
          status: 'pending', // 梱包待ち
          carrier: 'test-carrier',
          method: 'standard',
          customerName: 'テストユーザー',
          address: '〒150-0001 東京都渋谷区神宮前1-1-1 テストビル101',
          value: product.price || 100000,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          priority: 'normal',
          notes: '⚠️ 既存商品修正用Shipmentエントリです',
          trackingNumber: `FIX-${Date.now()}-${product.id.slice(-6)}`
        }
      });
      
      console.log('🧪 [FIX API] Shipmentエントリ作成完了:', testShipment.id, '商品:', product.name);
    }
    
    console.log('🧪 [FIX API] 全商品の修正完了');
    
    return NextResponse.json({
      success: true,
      message: `${products.length}件の商品にShipmentエントリを追加しました`,
      processedProducts: products.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status
      }))
    });
    
  } catch (error) {
    console.error('🧪 [FIX API] エラー:', error);
    
    return NextResponse.json(
      { 
        error: '既存商品の修正中にエラーが発生しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
