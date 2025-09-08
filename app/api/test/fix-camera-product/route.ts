import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ⚠️ TEST/DEMO FEATURE - DELETE BEFORE PRODUCTION ⚠️ 
 * 
 * 「とてもかっこいいカメラ」商品の梱包待ちリスト表示修正
 */

export async function POST(request: NextRequest) {
  console.log('🧪 [CAMERA FIX] とてもかっこいいカメラの修正開始');
  
  try {
    const cameraProductId = 'cmexltgtn0016tbu2mu2bvvk5';
    
    // 1. 商品確認
    const product = await prisma.product.findUnique({
      where: { id: cameraProductId }
    });
    
    if (!product) {
      throw new Error(`商品が見つかりません: ${cameraProductId}`);
    }
    
    console.log('✅ 商品確認完了:', product.name, 'ステータス:', product.status);
    
    // 2. 既存Shipmentエントリを削除（重複回避）
    await prisma.shipment.deleteMany({
      where: { productId: cameraProductId }
    });
    console.log('✅ 既存Shipmentエントリ削除完了');
    
    // 3. 既存注文を確認（存在する場合は使用）
    let existingOrder = await prisma.order.findFirst({
      where: { 
        orderItems: {
          some: { productId: cameraProductId }
        }
      }
    });
    
    // 4. 注文が存在しない場合は作成
    if (!existingOrder) {
      // テスト用顧客確保
      let customer = await prisma.user.findUnique({
        where: { email: 'camera-customer@test.com' }
      });
      
      if (!customer) {
        customer = await prisma.user.create({
          data: {
            email: 'camera-customer@test.com',
            name: 'カメラ購入者',
            role: 'buyer',
            password: 'dummy-hash'
          }
        });
      }
      
      // テスト注文作成
      const orderNumber = `CAMERA-${Date.now()}`;
      existingOrder = await prisma.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          customerName: customer.name,
          customerEmail: customer.email,
          totalAmount: product.price || 150000,
          status: 'confirmed',
          shippingAddress: '〒100-0001 東京都千代田区千代田1-1-1 カメラビル501',
          phone: '090-1234-5678',
          paymentStatus: 'completed',
          paymentMethod: 'credit_card'
        }
      });
      
      // 注文アイテム作成
      await prisma.orderItem.create({
        data: {
          orderId: existingOrder.id,
          productId: product.id,
          quantity: 1,
          price: product.price || 150000,
          name: product.name
        }
      });
      
      console.log('✅ テスト注文作成完了:', orderNumber);
    }
    
    // 5. 商品ステータスをsoldに更新（必要に応じて）
    if (product.status !== 'sold') {
      await prisma.product.update({
        where: { id: cameraProductId },
        data: { status: 'sold' }
      });
      console.log('✅ 商品ステータス更新: sold');
    }
    
    // 6. Shipmentエントリ作成
    const newShipment = await prisma.shipment.create({
      data: {
        orderId: existingOrder.id,
        productId: product.id,
        status: 'pending', // 梱包待ち
        carrier: 'fedex',
        method: 'standard',
        customerName: existingOrder.customerName,
        address: existingOrder.shippingAddress,
        value: existingOrder.totalAmount,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3日後
        priority: 'normal',
        notes: '⚠️ テスト機能で作成されたカメラ商品の出荷データです',
        trackingNumber: null,
        weight: 2.5,
        dimensions: '25x15x10',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Shipmentエントリ作成完了:', newShipment.id, 'ステータス:', newShipment.status);
    
    // 7. ロケーション設定（必要に応じて）
    if (!product.currentLocationId) {
      const defaultLocation = await prisma.location.findFirst({
        where: { name: 'A1-01' }
      });
      
      if (defaultLocation) {
        await prisma.product.update({
          where: { id: cameraProductId },
          data: { currentLocationId: defaultLocation.id }
        });
        console.log('✅ ロケーション設定完了:', defaultLocation.name);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: '「とてもかっこいいカメラ」を梱包待ちリストに追加しました',
      product: {
        id: product.id,
        name: product.name,
        status: 'sold'
      },
      shipment: {
        id: newShipment.id,
        status: newShipment.status,
        carrier: newShipment.carrier
      },
      order: {
        id: existingOrder.id,
        orderNumber: existingOrder.orderNumber
      }
    });
    
  } catch (error) {
    console.error('🧪 [CAMERA FIX] エラー:', error);
    
    return NextResponse.json(
      { 
        error: 'カメラ商品の修正中にエラーが発生しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
