import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ⚠️ TEST/DEMO FEATURE - DELETE BEFORE PRODUCTION ⚠️ 
 * 
 * ピッキング対象の全商品を梱包待ちリストに一括追加
 */

export async function POST(request: NextRequest) {
  console.log('🧪 [BULK FIX] 全ピッキング商品の一括修正開始');
  
  try {
    // 1. ピッキング対象商品を全て取得（ordered, workstation, sold状態）
    const pickingProducts = await prisma.product.findMany({
      where: {
        status: { in: ['ordered', 'workstation', 'sold'] },
        // 既にShipmentエントリがある商品は除外
        NOT: {
          shipments: {
            some: {}
          }
        }
      },
      include: {
        listings: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    console.log(`✅ ピッキング対象商品取得: ${pickingProducts.length}件`);
    
    if (pickingProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: '処理対象の商品がありませんでした',
        processedCount: 0
      });
    }
    
    // 2. テスト用顧客を確保
    let testCustomer = await prisma.user.findUnique({
      where: { email: 'bulk-test@example.com' }
    });
    
    if (!testCustomer) {
      testCustomer = await prisma.user.create({
        data: {
          email: 'bulk-test@example.com',
          name: 'ピッキングテストユーザー',
          role: 'buyer',
          password: 'dummy-hash'
        }
      });
    }
    console.log('✅ テスト顧客確保完了');
    
    // 3. デフォルトロケーション取得
    let defaultLocation = await prisma.location.findFirst({
      where: { name: 'A1-01' }
    });
    
    if (!defaultLocation) {
      defaultLocation = await prisma.location.create({
        data: {
          name: 'A1-01',
          type: 'shelf',
          capacity: 100,
          description: 'テスト用ロケーション'
        }
      });
    }
    console.log('✅ デフォルトロケーション確保完了');
    
    const processedProducts = [];
    const errors = [];
    
    // 4. 各商品に対してShipmentエントリ作成
    for (const product of pickingProducts) {
      try {
        console.log(`📦 処理中: ${product.name} (${product.id})`);
        
        // 商品ステータスをsoldに更新
        if (product.status !== 'sold') {
          await prisma.product.update({
            where: { id: product.id },
            data: { status: 'sold' }
          });
        }
        
        // ロケーション設定
        if (!product.currentLocationId) {
          await prisma.product.update({
            where: { id: product.id },
            data: { currentLocationId: defaultLocation.id }
          });
        }
        
        // 既存注文を検索
        let existingOrder = await prisma.order.findFirst({
          where: {
            orderItems: {
              some: { productId: product.id }
            }
          }
        });
        
        // 注文が存在しない場合は作成
        if (!existingOrder) {
          const orderNumber = `BULK-${Date.now()}-${product.id.slice(-6)}`;
          existingOrder = await prisma.order.create({
            data: {
              orderNumber,
              customerId: testCustomer.id,
              customerName: testCustomer.name,
              customerEmail: testCustomer.email,
              totalAmount: product.price || 100000,
              status: 'confirmed',
              shippingAddress: `〒100-000${Math.floor(Math.random() * 9) + 1} 東京都千代田区千代田1-1-1 テストビル${Math.floor(Math.random() * 900) + 100}`,
              phone: '090-0000-0000',
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
              price: product.price || 100000,
              name: product.name
            }
          });
        }
        
        // Shipmentエントリ作成
        const newShipment = await prisma.shipment.create({
          data: {
            orderId: existingOrder.id,
            productId: product.id,
            status: 'pending', // 梱包待ち状態
            carrier: 'fedex',
            method: 'standard',
            customerName: existingOrder.customerName,
            address: existingOrder.shippingAddress,
            value: existingOrder.totalAmount,
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3日後
            priority: 'normal',
            notes: `⚠️ 一括修正で作成: ${product.name}`,
            trackingNumber: null,
            weight: Math.round((Math.random() * 5 + 0.5) * 10) / 10, // 0.5-5.5kg
            dimensions: '25x15x10',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        processedProducts.push({
          productId: product.id,
          productName: product.name,
          shipmentId: newShipment.id,
          orderId: existingOrder.id
        });
        
        console.log(`✅ 完了: ${product.name} -> Shipment: ${newShipment.id}`);
        
      } catch (error) {
        const errorMsg = `❌ エラー: ${product.name} - ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg);
        errors.push({
          productId: product.id,
          productName: product.name,
          error: errorMsg
        });
      }
    }
    
    console.log(`🎉 一括処理完了: 成功 ${processedProducts.length}件, エラー ${errors.length}件`);
    
    return NextResponse.json({
      success: true,
      message: `ピッキング対象商品の一括修正が完了しました`,
      totalProcessed: pickingProducts.length,
      successCount: processedProducts.length,
      errorCount: errors.length,
      processedProducts: processedProducts,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('🧪 [BULK FIX] 致命的エラー:', error);
    
    return NextResponse.json(
      { 
        error: '一括修正処理中に致命的エラーが発生しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
