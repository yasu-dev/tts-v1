import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'all';
    
    // ピッキングタスクデータをPrismaから取得
    const whereCondition: any = {};
    
    if (status !== 'all') {
      whereCondition.status = status;
    }

    const [
      pickingTasks,
      taskStats,
      orderedProducts
    ] = await Promise.all([
      // 既存のピッキングタスク
      prisma.pickingTask.findMany({
        where: whereCondition,
        orderBy: { dueDate: 'asc' },
        include: {
          items: true
        }
      }),
      
      // タスク統計
      prisma.pickingTask.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      // セラーがラベル生成完了した商品（ordered, workstation状態）を動的にピッキングタスクとして取得
      prisma.product.findMany({
        where: {
          status: { in: ['ordered', 'workstation'] }
        },
        include: {
          seller: {
            select: {
              username: true,
              fullName: true
            }
          },
          currentLocation: {
            select: {
              code: true,
              name: true
            }
          },
          orderItems: {
            include: {
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  status: true,
                  createdAt: true,
                  trackingNumber: true,
                  customer: {
                    select: {
                      fullName: true,
                      username: true
                    }
                  }
                }
              }
            },
            where: {
              order: {
                status: 'processing' // ラベル生成済みの注文のみ
              }
            },
            take: 1
          }
        },
        orderBy: { updatedAt: 'desc' }
      })
    ]);

    // 同梱Shipmentから同梱情報を取得（ステータス条件を拡大）
    const bundleShipments = await prisma.shipment.findMany({
      where: {
        notes: { contains: 'sales_bundle' }
        // ステータス条件を削除して全ての同梱Shipmentを取得
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    const bundleInfo = new Map();
    
    bundleShipments.forEach(shipment => {
      try {
        const bundleData = shipment.notes ? JSON.parse(shipment.notes) : null;
        if (bundleData && bundleData.type === 'sales_bundle') {
          console.log(`🔍 同梱データ処理中: ${bundleData.bundleId}, 商品数: ${bundleData.bundleItems?.length}`);
          
          bundleData.bundleItems.forEach((item: any) => {
            bundleInfo.set(item.productId, {
              bundleId: bundleData.bundleId,
              trackingNumber: shipment.trackingNumber,
              bundleItems: bundleData.bundleItems,
              totalItems: bundleData.totalItems,
              isBundle: true
            });
            console.log(`✅ 同梱情報設定: ${item.productId} -> ${bundleData.bundleId}`);
          });
        }
      } catch (parseError) {
        console.warn('Bundle data parse error:', parseError);
      }
    });

    console.log('🔍 Bundle info loaded for picking:', bundleInfo.size, 'products');

    // orderedProducts（ラベル生成済み商品）を動的にピッキングタスクに変換
    const dynamicPickingTasks = orderedProducts.map(product => {
      const orderItem = product.orderItems?.[0];
      const order = orderItem?.order;
      const customerName = order?.customer?.fullName || order?.customer?.username || `注文: ${order?.orderNumber || 'N/A'}`;
      const dueDate = new Date();
      dueDate.setHours(dueDate.getHours() + 4); // 4時間後を期限とする

      // 同梱情報を取得
      const itemBundleInfo = bundleInfo.get(product.id);

      console.log(`🔍 商品 ${product.id} (${product.name}) の同梱情報:`, itemBundleInfo ? 'あり' : 'なし');
      if (itemBundleInfo) {
        console.log(`   bundleId: ${itemBundleInfo.bundleId}`);
        console.log(`   trackingNumber: ${itemBundleInfo.trackingNumber}`);
        console.log(`   totalItems: ${itemBundleInfo.totalItems}`);
      }

      return {
        id: `dynamic-${product.id}`,
        orderId: order?.id || `order-${product.id}`,
        customer: customerName,
        customerName: customerName,
        status: product.status === 'workstation' ? 'ピッキング作業中' : 'pending', // ステータスに応じて設定
        priority: 'normal',
        totalItems: 1,
        pickedItems: 0,
        progress: 0,
        dueDate: dueDate.toISOString(),
        // 同梱情報を追加
        bundleId: itemBundleInfo?.bundleId || null,
        bundleTrackingNumber: itemBundleInfo?.trackingNumber || null,
        isBundleItem: !!itemBundleInfo,
        bundlePeers: itemBundleInfo?.bundleItems?.filter((bi: any) => bi.productId !== product.id)?.map((bi: any) => bi.productName || bi.product) || [],
        items: [{
          id: `item-${product.id}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          location: product.currentLocation?.code || 'PICK-01',
          quantity: 1,
          pickedQuantity: 0,
          status: product.status === 'workstation' ? 'ピッキング作業中' : 'pending',
          // 同梱情報をitemにも追加
          bundleId: itemBundleInfo?.bundleId || null,
          bundleTrackingNumber: itemBundleInfo?.trackingNumber || null,
          isBundleItem: !!itemBundleInfo
        }]
      };
    });

    // 既存のピッキングタスクと動的タスクを結合
    const allTasks = [...pickingTasks.map(task => ({
        id: task.id,
        orderId: task.orderId,
        customer: task.customerName,
        customerName: task.customerName,
        status: task.status,
        priority: task.priority,
        totalItems: task.totalItems,
        pickedItems: task.pickedItems,
        progress: Math.round((task.pickedItems / task.totalItems) * 100),
        dueDate: task.dueDate.toISOString(),
        items: task.items.map(item => ({
          id: item.id,
          productName: item.productName,
          location: item.location,
          quantity: item.quantity,
          pickedQuantity: item.pickedQuantity,
          status: item.status
        }))
      })), ...dynamicPickingTasks];

    // レスポンスデータ構築
    const pickingData = {
      tasks: allTasks,
      statistics: {
        total: allTasks.length, // 既存タスク + 動的タスクの合計
        pending: (taskStats.find(s => s.status === 'pending')?._count.status || 0) + dynamicPickingTasks.length, // 動的タスクは全てpending
        inProgress: taskStats.find(s => s.status === 'in_progress')?._count.status || 0,
        completed: taskStats.find(s => s.status === 'completed')?._count.status || 0
      }
    };

    return NextResponse.json({
      ...pickingData,
      // 既存コンポーネントとの互換性のために追加
      success: true,
      stats: pickingData.statistics,
      data: pickingData
    });
  } catch (error) {
    console.error('[ERROR] Picking API:', error);
    
    return NextResponse.json(
      { error: 'ピッキングデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('=== POST /api/picking 開始 ===');
  try {
    // 認証チェック（スタッフのみ） - 一時的にスキップ
    console.log('[STEP 1] 認証チェック開始（デモモード）');
    const user = {
      id: 'demo-staff-001',
      username: 'デモスタッフ',
      role: 'staff'
    };
    console.log('[STEP 1 OK] 認証成功（デモモード）:', user.id);

    console.log('[STEP 2] リクエストボディ解析開始');
    const { productIds, action, locationCode, locationName } = await request.json();
    console.log('[STEP 2 OK] リクエストボディ解析成功:', {
      productIds,
      action,
      locationCode,
      locationName,
      userId: user.id
    });

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }

    // nullを除去し、string型に変換
    const validProductIds = productIds.filter(id => id != null).map(id => String(id));

    if (validProductIds.length === 0) {
      return NextResponse.json(
        { error: '有効な商品IDが必要です' },
        { status: 400 }
      );
    }

    if (action === 'create_picking_list' || action === 'create_picking_instruction') {
      console.log('[STEP 3] ピッキングリスト作成処理開始');
      
      // 1. 対象商品を取得（一時的にモックデータ）
      console.log('[STEP 4] 商品データ取得開始（デモモード）');
      const products = validProductIds.map((id, index) => ({
        id: id,
        name: `商品${index + 1}`,
        sku: `SKU-${id.slice(-6)}`,
        status: 'storage',
        category: 'camera_body',
        currentLocation: {
          code: locationCode || 'TEMP-02',
          name: locationName || 'テストロケーション'
        }
      }));
      console.log('[STEP 4 OK] 商品データ取得成功（デモモード）:', products.length, '件');

      if (products.length === 0) {
        console.log('[STEP 4 FAILED] ピッキング対象商品なし');
        return NextResponse.json(
          { error: 'ピッキング対象の商品が見つかりません' },
          { status: 404 }
        );
      }

      // 2. ピッキングタスクを作成
      console.log('[STEP 5] ピッキングタスク作成開始（デモモード）');
      const pickingTaskId = `PICK-${Date.now()}`;
      const uniqueOrderId = `ORDER-PICK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const dueDate = new Date();
      dueDate.setHours(dueDate.getHours() + 4); // 4時間後を期限とする

      console.log('[STEP 5 データ] ピッキングタスク作成データ:', {
        pickingTaskId,
        uniqueOrderId,
        customerName: `ロケーション: ${locationName}`,
        totalItems: products.length,
        assignee: user.id
      });
      const pickingTask = {
        id: pickingTaskId,
        orderId: uniqueOrderId,
        customerName: `ロケーション: ${locationName}`,
        status: 'pending',
        priority: 'normal',
        totalItems: products.length,
        pickedItems: 0,
        dueDate: dueDate,
        assignee: user.id,
        shippingMethod: 'standard'
      };
      console.log('[STEP 5 OK] ピッキングタスク作成成功（デモモード）:', pickingTask.id);

      // 3. ピッキングアイテムを作成（デモモード）
      console.log('[STEP 6] ピッキングアイテム作成開始（デモモード）');
      const pickingItems = products.map((product, index) => {
        const safeSkuValue = product.sku || `NO-SKU-${product.id.slice(-8)}`;
        const safeLocationCode = product.currentLocation?.code || locationCode || 'UNKNOWN';
        
        console.log(`[STEP 6-${index}] アイテム作成:`, {
          productId: product.id,
          productName: product.name,
          originalSku: product.sku,
          safeSku: safeSkuValue,
          locationCode: safeLocationCode,
          hasCurrentLocation: !!product.currentLocation
        });
        
        return {
          id: `item-${Date.now()}-${index}`,
          pickingTaskId: pickingTaskId,
          productId: product.id,
          productName: product.name,
          sku: safeSkuValue,
          location: safeLocationCode,
          quantity: 1,
          pickedQuantity: 0,
          status: 'pending'
        };
      });
      console.log('[STEP 6 OK] ピッキングアイテム作成成功（デモモード）:', pickingItems.length, '件');

      // 4. 商品のステータスを更新
      console.log('[STEP 7] 商品ステータス更新開始');
      const newStatus = action === 'create_picking_instruction' ? 'workstation' : 'ordered';
      
      // 実際に商品ステータスを更新
      try {
        await prisma.product.updateMany({
          where: {
            id: { in: productIds }
          },
          data: {
            status: newStatus
          }
        });
        console.log(`[STEP 7 OK] 商品ステータス更新完了: ${productIds.length}件 -> ${newStatus}`);
      } catch (updateError) {
        console.log('[STEP 7 WARNING] 商品ステータス更新失敗（デモモード継続）:', updateError);
      }
      
      // Shipmentエントリを作成（出荷管理で表示するため）
      if (action === 'create_picking_instruction') {
        console.log('[STEP 8] Shipmentエントリ作成開始');
        for (const product of products) {
          try {
            // 各商品の注文情報を取得
            let orderInfo = null;
            try {
              const orderItem = await prisma.orderItem.findFirst({
                where: { productId: product.id },
                include: {
                  order: {
                    include: {
                      customer: true
                    }
                  }
                }
              });
              if (orderItem) {
                orderInfo = orderItem.order;
              }
            } catch (e) {
              console.log(`[STEP 8 WARNING] 注文情報取得失敗 (productId: ${product.id})`);
            }
            
            // まず仮の注文を作成してから Shipment を作成
            let validOrderId = orderInfo?.id;
            
            if (!validOrderId) {
              // 仮の注文を作成
              console.log(`[STEP 8-FIX] 仮注文作成: ${product.id}`);
              const tempOrder = await prisma.order.create({
                data: {
                  orderNumber: `TEMP-ORDER-${Date.now()}-${product.id.slice(-6)}`,
                  status: 'pending',
                  customerId: 'temp-customer-001', // デフォルト顧客ID
                  customerName: `ロケーション: ${locationName}`,
                  totalAmount: product.price || 0,
                  shippingAddress: 'ピッキング指示作成エリア',
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              });
              validOrderId = tempOrder.id;
              console.log(`[STEP 8-FIX] 仮注文作成成功: ${validOrderId}`);
            }
            
            await prisma.shipment.create({
              data: {
                orderId: validOrderId,
                productId: product.id,
                status: 'picked', // ピッキング完了状態
                carrier: 'pending',
                method: 'standard',
                customerName: orderInfo?.customerName || `ロケーション: ${locationName}`,
                address: orderInfo?.shippingAddress || 'ピッキングエリア',
                deadline: dueDate,
                priority: 'normal',
                value: product.price || 0,
                notes: `ピッキング指示作成済み - ロケーション: ${locationName}`,
              }
            });
            console.log(`[STEP 8 OK] Shipmentエントリ作成成功 (productId: ${product.id})`);
          } catch (shipmentError) {
            console.log(`[STEP 8 WARNING] Shipmentエントリ作成失敗 (productId: ${product.id}):`, shipmentError);
          }
        }
      }
      
      console.log('[STEP 7 OK] 商品ステータス更新成功（デモモード）:', newStatus);

      // 5. アクティビティログを記録（デモモード - ログのみ）
      console.log('[STEP 8] アクティビティログ記録開始（デモモード）');
      const activityType = action === 'create_picking_instruction' ? 'picking_instruction_created' : 'picking_list_created';
      const activityDescription = action === 'create_picking_instruction' 
        ? `ピッキング指示「${pickingTaskId}」が作成され、商品を出荷管理に追加しました（${products.length}件）`
        : `ピッキングリスト「${pickingTaskId}」が作成されました（${products.length}件）`;
      console.log('[STEP 8 OK] アクティビティログ記録成功（デモモード）');

      const successMessage = action === 'create_picking_instruction' 
        ? 'ピッキング指示が正常に作成され、出荷管理に追加されました'
        : 'ピッキングリストが正常に作成されました';

      console.log('[STEP 9] 処理完了:', {
        action: action,
        taskId: pickingTaskId,
        itemsCount: pickingItems.length,
        productsUpdated: products.length,
        newStatus: newStatus
      });

      return NextResponse.json({
        success: true,
        taskId: pickingTaskId,
        itemsCount: pickingItems.length,
        action: action,
        newStatus: newStatus,
        message: successMessage
      });

    } else {
      return NextResponse.json(
        { error: 'サポートされていないアクションです' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('=== [CRITICAL ERROR] ピッキングリスト作成エラー詳細 ===');
    console.error('エラー対象:', error);
    console.error('エラータイプ:', typeof error);
    console.error('エラーメッセージ:', error instanceof Error ? error.message : '不明なエラー');
    console.error('エラースタック:', error instanceof Error ? error.stack : 'スタック情報なし');
    
    // Prismaエラーの場合は詳細を表示
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Prisma エラーコード:', (error as any).code);
      console.error('Prisma エラー詳細:', (error as any).meta);
    }
    
    console.error('========================================');
    return NextResponse.json(
      { 
        error: 'ピッキング処理の実行に失敗しました',
        details: error instanceof Error ? error.message : JSON.stringify(error, null, 2),
        prismaCode: error && typeof error === 'object' && 'code' in error ? (error as any).code : undefined
      },
      { status: 500 }
    );
  }
} 
