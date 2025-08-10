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
      taskStats
    ] = await Promise.all([
      // ピッキングタスク
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
      })
    ]);

    // レスポンスデータ構築
    const pickingData = {
      tasks: pickingTasks.map(task => ({
        id: task.id,
        orderId: task.orderId,
        customer: task.customerName,
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
      })),
      statistics: {
        total: pickingTasks.length,
        pending: taskStats.find(s => s.status === 'pending')?._count.status || 0,
        inProgress: taskStats.find(s => s.status === 'in_progress')?._count.status || 0,
        completed: taskStats.find(s => s.status === 'completed')?._count.status || 0
      }
    };

    return NextResponse.json(pickingData);
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
    // 認証チェック（スタッフのみ）
    console.log('[STEP 1] 認証チェック開始');
    let user;
    try {
      user = await AuthService.requireRole(request, ['staff', 'admin']);
      console.log('[STEP 1 OK] 認証成功:', user.id);
    } catch (authError) {
      console.error('[STEP 1 FAILED] 認証エラー:', authError);
      return NextResponse.json(
        { error: 'ログインが必要です。再度ログインしてください。' },
        { status: 401 }
      );
    }

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

    if (action === 'create_picking_list') {
      console.log('[STEP 3] ピッキングリスト作成処理開始');
      
      // 1. 対象商品を取得
      console.log('[STEP 4] 商品データ取得開始');
      const products = await prisma.product.findMany({
        where: {
          id: { in: validProductIds },
          status: { in: ['ordered', 'storage'] } // ピッキング対象ステータス
        },
        include: {
          currentLocation: true
        }
      });
      console.log('[STEP 4 OK] 商品データ取得成功:', products.length, '件');

      if (products.length === 0) {
        console.log('[STEP 4 FAILED] ピッキング対象商品なし');
        return NextResponse.json(
          { error: 'ピッキング対象の商品が見つかりません' },
          { status: 404 }
        );
      }

      // 2. ピッキングタスクを作成
      console.log('[STEP 5] ピッキングタスク作成開始');
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

      const pickingTask = await prisma.pickingTask.create({
        data: {
          id: pickingTaskId,
          orderId: uniqueOrderId, // 一意性を保証するためより複雑なIDを生成
          customerName: `ロケーション: ${locationName}`,
          status: 'pending',
          priority: 'normal',
          totalItems: products.length,
          pickedItems: 0,
          dueDate: dueDate,
          assignee: user.id,
          shippingMethod: 'standard' // 必須フィールド
        }
      });
      console.log('[STEP 5 OK] ピッキングタスク作成成功:', pickingTask.id);

      // 3. ピッキングアイテムを作成
      console.log('[STEP 6] ピッキングアイテム作成開始');
      const pickingItems = await Promise.all(
        products.map(async (product, index) => {
          // SKUが必須だが存在しない場合のフォールバック
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
          
          return await prisma.pickingItem.create({
            data: {
              pickingTaskId: pickingTaskId,
              productId: product.id,
              productName: product.name,
              sku: safeSkuValue, // 安全なSKU値を使用
              location: safeLocationCode,
              quantity: 1,
              pickedQuantity: 0,
              status: 'pending'
            }
          });
        })
      );
      console.log('[STEP 6 OK] ピッキングアイテム作成成功:', pickingItems.length, '件');

      // 4. 商品のステータスを更新（ordered → picked待ち）
      console.log('[STEP 7] 商品ステータス更新開始');
      await prisma.product.updateMany({
        where: {
          id: { in: productIds }
        },
        data: {
          status: 'ordered' // ピッキング待ちステータス
        }
      });
      console.log('[STEP 7 OK] 商品ステータス更新成功');

      // 5. アクティビティログを記録
      console.log('[STEP 8] アクティビティログ記録開始');
      await prisma.activity.create({
        data: {
          type: 'picking_list_created',
          description: `ピッキングリスト「${pickingTaskId}」が作成されました（${products.length}件）`,
          userId: user.id,
          metadata: JSON.stringify({
            taskId: pickingTaskId,
            locationCode,
            locationName,
            productCount: products.length,
            productIds: productIds
          })
        }
      });
      console.log('[STEP 8 OK] アクティビティログ記録成功');

      console.log('[STEP 9] ピッキングリスト作成完了:', {
        taskId: pickingTaskId,
        itemsCount: pickingItems.length,
        productsUpdated: products.length
      });

      return NextResponse.json({
        success: true,
        taskId: pickingTaskId,
        itemsCount: pickingItems.length,
        message: 'ピッキングリストが正常に作成されました'
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
        error: 'ピッキングリストの作成に失敗しました',
        details: error instanceof Error ? error.message : JSON.stringify(error, null, 2),
        prismaCode: error && typeof error === 'object' && 'code' in error ? (error as any).code : undefined
      },
      { status: 500 }
    );
  }
} 
