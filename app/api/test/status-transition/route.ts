import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ⚠️ TEST/DEMO FEATURE - DELETE BEFORE PRODUCTION ⚠️
 * 
 * テスト・デモ専用の商品ステータス遷移API
 * 
 * 目的: 実際のeBay購入なしで「出品中」→「購入者決定」の遷移をテストする
 * 実装範囲: 商品ステータスの手動変更のみ
 * 使用場面: 開発・テスト・デモンストレーション
 * 
 * ⚠️ 本機能は本番環境では削除すること ⚠️
 */

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST API] ステータス遷移API呼び出し開始');
  
  try {
    // 簡単な認証チェック（開発環境用）
    const authToken = request.cookies.get('auth-token')?.value || 'fixed-auth-token-staff-1';
    console.log('🧪 [TEST API] 認証トークン確認:', authToken ? '有効' : '無効');
    
    const body = await request.json();
    console.log('🧪 [TEST API] リクエストボディ:', body);
    const { productId, fromStatus, toStatus, reason = 'テスト用手動遷移' } = body;
    
    // 必須パラメータチェック
    if (!productId || !fromStatus || !toStatus) {
      console.log('🧪 [TEST API] エラー: 必須パラメータ不足');
      return NextResponse.json(
        { error: 'productId, fromStatus, toStatusが必要です' },
        { status: 400 }
      );
    }
    
    // 許可されたステータス遷移のみ許可
    const allowedTransitions = [
      { from: 'listing', to: 'sold' }, // 出品中 → 購入者決定
      { from: 'sold', to: 'listing' }   // 購入者決定 → 出品中（テスト用リセット）
    ];
    
    const isAllowedTransition = allowedTransitions.some(
      transition => transition.from === fromStatus && transition.to === toStatus
    );
    
    if (!isAllowedTransition) {
      console.log('🧪 [TEST API] エラー: 許可されていない遷移');
      return NextResponse.json(
        { 
          error: `許可されていないステータス遷移です: ${fromStatus} → ${toStatus}`,
          allowedTransitions
        },
        { status: 400 }
      );
    }
    
    // 商品存在確認
    console.log('🧪 [TEST API] 商品検索開始:', productId);
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    console.log('🧪 [TEST API] 商品検索結果:', product ? '見つかりました' : '見つかりません');
    
    if (!product) {
      console.log('🧪 [TEST API] エラー: 商品が見つからない');
      return NextResponse.json(
        { error: '指定された商品が見つかりません' },
        { status: 404 }
      );
    }
    
    // テスト機能では現在のステータス確認をスキップ（強制変更）
    console.log('🧪 [TEST API] 現在のステータス:', product.status, '→ 強制変更先:', toStatus);
    
    // ステータス更新
    console.log('🧪 [TEST API] ステータス更新開始:', fromStatus, '→', toStatus);
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { 
        status: toStatus,
        updatedAt: new Date()
      }
    });
    console.log('🧪 [TEST API] 商品ステータス更新完了:', updatedProduct.id, updatedProduct.status);
    
    // リスティングテーブルのステータスも更新（販売管理画面で正しく表示するため）
    try {
      const listingStatusMapping: Record<string, string> = {
        'listing': 'active',  // 出品中 → active
        'sold': 'sold'        // 購入者決定 → sold
      };
      
      const listingStatus = listingStatusMapping[toStatus];
      if (listingStatus) {
        console.log('🧪 [TEST API] リスティングステータス更新開始:', toStatus, '→', listingStatus);
        const updatedListings = await prisma.listing.updateMany({
          where: { productId: productId },
          data: { 
            status: listingStatus,
            updatedAt: new Date()
          }
        });
        console.log('🧪 [TEST API] リスティングステータス更新完了:', updatedListings.count, '件');
      }
    } catch (listingError) {
      console.warn('🧪 [TEST API] リスティング更新失敗（続行）:', listingError);
    }
    
    // テスト用モック注文データ作成（sold遷移の場合）
    let mockOrder = null;
    if (toStatus === 'sold') {
      try {
        console.log('🧪 [TEST API] モック注文作成開始');
        mockOrder = await createMockOrder(productId, product);
        console.log('🧪 [TEST API] モック注文作成完了:', mockOrder.id);
      } catch (error) {
        console.warn('🧪 [TEST API] モック注文作成失敗（続行）:', error);
      }
    }
    
    // アクティビティログ作成
    try {
      await prisma.activity.create({
        data: {
          type: 'test_status_transition',
          description: `【テスト機能】商品「${product.name}」のステータスを「${fromStatus}」から「${toStatus}」に変更しました`,
          userId: 'test-user-id',
          productId: product.id,
          metadata: JSON.stringify({
            fromStatus,
            toStatus,
            reason,
            isTestFeature: true,
            mockOrderId: mockOrder?.id || null,
            timestamp: new Date().toISOString()
          })
        }
      });
      console.log('🧪 [TEST API] アクティビティログ作成完了');
    } catch (error) {
      console.warn('🧪 [TEST API] アクティビティログ作成失敗（続行）:', error);
    }

    // 購入確定時（listing→sold）の場合、ラベル生成依頼通知を送信
    if (fromStatus === 'listing' && toStatus === 'sold' && product.sellerId) {
      try {
        console.log('🧪 [TEST API] ラベル生成依頼通知作成開始');
        
        // セラーに通知
        const notification = await prisma.notification.create({
          data: {
            type: 'order_ready_for_label',
            title: '📦 ラベル生成依頼',
            message: `商品「${product.name}」が売れました！配送ラベルを生成してください。`,
            userId: product.sellerId,
            read: false,
            priority: 'high',
            notificationType: 'product_sold',
            action: 'sales'
          }
        });
        
        console.log('🧪 [TEST API] ラベル生成依頼通知作成完了:', notification.id);

        // アクティビティログに通知送信を記録
        await prisma.activity.create({
          data: {
            type: 'notification_sent',
            description: `ラベル生成依頼通知をセラーに送信しました`,
            userId: 'system',
            productId: product.id,
            metadata: JSON.stringify({
              notificationId: notification.id,
              notificationType: 'order_ready_for_label',
              sellerId: product.sellerId
            })
          }
        });
        
        console.log('🧪 [TEST API] 通知送信ログ作成完了');
      } catch (notificationError) {
        console.warn('🧪 [TEST API] 通知送信失敗（続行）:', notificationError);
      }
    }
    
    console.log('🧪 [TEST API] ステータス遷移成功完了 - レスポンス返却');
    
    const responseData = {
      success: true,
      message: `商品ステータスを「${getStatusLabel(fromStatus)}」から「${getStatusLabel(toStatus)}」に変更しました`,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        previousStatus: fromStatus,
        currentStatus: toStatus,
        updatedAt: updatedProduct.updatedAt
      },
      mockOrder: mockOrder ? {
        id: mockOrder.id,
        orderNumber: mockOrder.orderNumber,
        message: 'テスト用モック注文を作成しました'
      } : null,
      warning: '⚠️ この機能はテスト専用です。本番環境では削除してください。'
    };
    
    console.log('🧪 [TEST API] 返却データ:', responseData);
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('🧪 [TEST API] 致命的エラー:', error);
    console.error('🧪 [TEST API] エラースタック:', error instanceof Error ? error.stack : String(error));
    
    return NextResponse.json(
      { 
        error: 'ステータス遷移処理中にエラーが発生しました',
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * テスト用モック注文作成
 */
async function createMockOrder(productId: string, product: any) {
  // モック顧客情報
  const mockCustomer = {
    username: 'テストユーザー',
    email: 'test@example.com',
    firstName: 'テスト',
    lastName: 'ユーザー'
  };
  
  // 既存のテストカスタマーを検索または作成
  let customer = await prisma.user.findUnique({
    where: { email: mockCustomer.email }
  });
  
  if (!customer) {
    customer = await prisma.user.create({
      data: {
        ...mockCustomer,
        role: 'customer',
        password: 'dummy-password' // テスト用ダミーパスワード
      }
    });
  }
  
  // モック注文番号生成
  const orderNumber = `TEST-${Date.now()}-${productId.slice(-4)}`;
  
  // モック注文作成
  const mockOrder = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      customerName: mockCustomer.username,
      customerEmail: mockCustomer.email,
      status: 'confirmed', // 確認済み状態
      totalAmount: product.price || 100000,
      currency: 'JPY',
      orderDate: new Date(),
      shippingAddress: '〒150-0001 東京都渋谷区神宮前1-1-1 テストビル101',
      notes: '⚠️ テスト機能で作成されたモック注文です',
      metadata: JSON.stringify({
        isTestOrder: true,
        createdBy: 'test-status-transition-api',
        originalProductStatus: 'listing'
      })
    }
  });
  
  // 注文アイテム作成
  await prisma.orderItem.create({
    data: {
      orderId: mockOrder.id,
      productId: product.id,
      quantity: 1,
      price: product.price || 100000,
      name: product.name
    }
  });
  
  // 商品ステータスを sold に更新（ここでも確実に）
  await prisma.product.update({
    where: { id: product.id },
    data: { status: 'sold' }
  });
  
    // ⚠️ スタッフ出荷管理画面に表示するためのShipmentエントリ作成
    try {
      const testShipment = await prisma.shipment.create({
        data: {
          orderId: mockOrder.id,
          productId: product.id,
          status: 'pending', // ピッキング待ち状態（スタッフが作業できる状態）
          carrier: 'test-carrier',
          method: 'standard',
          customerName: mockOrder.customerName,
          address: mockOrder.shippingAddress,
          value: mockOrder.totalAmount,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
          priority: 'normal',
          notes: '⚠️ テスト機能で作成されたモック出荷データです',
          trackingNumber: `TEST-${Date.now()}-${product.id.slice(-6)}` // テスト用追跡番号
        }
      });
    
    console.log('🧪 [TEST API] Shipmentエントリ作成完了:', testShipment.id, 'ステータス:', testShipment.status);
    
    // ⚠️ ロケーション管理画面表示のため、商品ロケーションも設定
    try {
      // 商品に現在位置を設定（ロケーション管理で表示するため）
      await prisma.product.update({
        where: { id: product.id },
        data: { 
          currentLocationId: 'clocation1', // デフォルトロケーション
          metadata: JSON.stringify({
            ...JSON.parse(product.metadata || '{}'),
            isTestProduct: true,
            testCreatedAt: new Date().toISOString(),
            testOrderNumber: mockOrder.orderNumber
          })
        }
      });
      
      console.log('🧪 [TEST API] 商品ロケーション設定完了:', product.id, 'ロケーション: clocation1');
    } catch (locationError) {
      console.warn('🧪 [TEST API] 商品ロケーション設定失敗（続行）:', locationError);
    }
    
  } catch (shipmentError) {
    console.warn('🧪 [TEST API] Shipment/Pickingエントリ作成失敗（続行）:', shipmentError);
  }
  
  return mockOrder;
}

/**
 * ステータスラベル変換
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'listing': '出品中',
    'sold': '購入者決定',
    'storage': '保管中',
    'inspection': '検品中',
    'shipped': '出荷済み',
    'delivered': '到着済み'
  };
  
  return labels[status] || status;
}

/**
 * テスト用ステータス遷移のリセット機能
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { error: 'productIdが必要です' },
        { status: 400 }
      );
    }
    
    // テスト用に作成されたモック注文を削除
    const testOrders = await prisma.order.findMany({
      where: {
        orderNumber: { startsWith: 'TEST-' },
        items: {
          some: { productId }
        }
      },
      include: { items: true }
    });
    
    // モック注文関連データを削除
    for (const order of testOrders) {
      await prisma.orderItem.deleteMany({
        where: { orderId: order.id }
      });
      await prisma.order.delete({
        where: { id: order.id }
      });
    }
    
    // 商品ステータスをlistingにリセット
    const product = await prisma.product.update({
      where: { id: productId },
      data: { status: 'listing' }
    });
    
    // リセットログ作成
    await prisma.activity.create({
      data: {
        type: 'test_status_reset',
        description: `【テスト機能】商品「${product.name}」をテスト前の状態にリセットしました`,
        userId: 'test-user-id',
        productId: product.id,
        metadata: JSON.stringify({
          resetToStatus: 'listing',
          deletedTestOrders: testOrders.length,
          isTestFeature: true,
          timestamp: new Date().toISOString()
        })
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'テスト用データを削除し、商品ステータスをリセットしました',
      product: {
        id: product.id,
        name: product.name,
        status: product.status
      },
      deletedTestOrders: testOrders.length
    });
    
  } catch (error) {
    console.error('[ERROR] Test status reset:', error);
    
    return NextResponse.json(
      { error: 'リセット処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}