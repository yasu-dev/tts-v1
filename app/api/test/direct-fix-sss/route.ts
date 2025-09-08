import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  console.log('🧪 [DIRECT FIX] sss商品の梱包待ちリスト追加 - 開始');
  
  try {
    const sssProductId = 'cmfawkq4h000i12zkzwanytd0';
    
    // 1. 商品確認
    const product = await prisma.product.findUnique({
      where: { id: sssProductId }
    });
    
    if (!product) {
      throw new Error(`商品が見つかりません: ${sssProductId}`);
    }
    
    console.log('✅ 商品確認完了:', product.name);
    
    // 2. 既存Shipmentエントリを削除（重複回避）
    await prisma.shipment.deleteMany({
      where: { productId: sssProductId }
    });
    console.log('✅ 既存Shipmentエントリ削除完了');
    
    // 3. テスト用顧客確保
    let customer = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!customer) {
      customer = await prisma.user.create({
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
    console.log('✅ テスト顧客確保完了:', customer.id);
    
    // 4. テスト用注文作成
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: `SSS-FIX-${Date.now()}`,
        customerId: customer.id,
        customerName: 'テストユーザー',
        customerEmail: 'test@example.com',
        status: 'confirmed',
        totalAmount: product.price || 100000,
        currency: 'JPY', 
        orderDate: new Date(),
        shippingAddress: '〒150-0001 東京都渋谷区神宮前1-1-1 テストビル101',
        notes: '⚠️ sss商品修正用テスト注文です'
      }
    });
    console.log('✅ テスト注文作成完了:', testOrder.orderNumber);
    
    // 5. 注文アイテム作成
    await prisma.orderItem.create({
      data: {
        orderId: testOrder.id,
        productId: product.id,
        quantity: 1,
        price: product.price || 100000,
        name: product.name
      }
    });
    console.log('✅ 注文アイテム作成完了');
    
    // 6. Shipmentエントリ作成（スタッフ梱包待ちリスト用）
    const shipment = await prisma.shipment.create({
      data: {
        orderId: testOrder.id,
        productId: product.id,
        status: 'pending', // 梱包待ち状態
        carrier: 'test-fix-carrier',
        method: 'standard',
        customerName: 'テストユーザー',
        address: '〒150-0001 東京都渋谷区神宮前1-1-1 テストビル101',
        value: product.price || 100000,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: 'normal',
        notes: '⚠️ sss商品用 - 梱包待ちリスト表示修正',
        trackingNumber: `SSS-TRACK-${Date.now()}`,
        labelFileUrl: null
      }
    });
    console.log('✅ Shipmentエントリ作成完了:', shipment.id);
    
    // 7. 商品ステータス確認・更新
    await prisma.product.update({
      where: { id: sssProductId },
      data: { 
        status: 'sold',
        currentLocationId: 'clocation1'
      }
    });
    console.log('✅ 商品ステータス確認・更新完了');
    
    console.log('🎉 sss商品の梱包待ちリスト修正 - 完全完了！');
    
    return NextResponse.json({
      success: true,
      message: 'sss商品がスタッフ梱包待ちリストに追加されました',
      productName: product.name,
      shipmentId: shipment.id,
      orderNumber: testOrder.orderNumber,
      trackingNumber: shipment.trackingNumber
    });
    
  } catch (error) {
    console.error('🧪 [DIRECT FIX] 致命的エラー:', error);
    
    return NextResponse.json(
      { 
        error: 'sss商品修正に失敗',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'sss商品修正API - POST メソッドを使用してください' });
}
