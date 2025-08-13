import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { notificationService, NotificationType } from '@/lib/services/notification.service';
import { prisma } from '@/lib/database';

/**
 * 通知システムのテスト用APIエンドポイント
 * 開発環境での動作確認用
 */
export async function POST(request: NextRequest) {
  try {
    // スタッフ認証
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    
    const body = await request.json();
    const { testType, targetUserId, customMessage } = body;
    
    console.log(`🧪 通知テスト開始: ${testType} -> ユーザー: ${targetUserId || 'auto'}`);
    
    // テスト対象ユーザーを決定
    let userId = targetUserId;
    if (!userId) {
      // セラーユーザーを自動選択
      const seller = await prisma.user.findFirst({
        where: { role: 'seller' },
        select: { id: true, email: true, fullName: true }
      });
      
      if (!seller) {
        return NextResponse.json(
          { error: 'テスト用セラーユーザーが見つかりません' },
          { status: 404 }
        );
      }
      
      userId = seller.id;
      console.log(`🎯 テスト対象セラー: ${seller.email}`);
    }
    
    // テスト通知のタイプと内容を定義
    const testNotifications: Record<string, {
      type: NotificationType;
      title: string;
      message: string;
      metadata?: any;
    }> = {
      'product_sold': {
        type: 'product_sold',
        title: '🎉 【テスト】商品が売れました！',
        message: customMessage || 'テスト商品「Rolex GMT Master II」が売れました。合計金額: ¥1,500,000',
        metadata: {
          orderNumber: `TEST-${Date.now()}`,
          totalAmount: 1500000,
          items: [{ productName: 'Rolex GMT Master II', quantity: 1, price: 1500000 }]
        }
      },
      'inventory_alert': {
        type: 'inventory_alert',
        title: '⚠️ 【テスト】在庫アラート',
        message: customMessage || 'テスト商品「Canon R5」の在庫が少なくなっています（残り2個）。',
        metadata: {
          lowStockCount: 1,
          products: [{ name: 'Canon R5', sku: 'CAM-R5-001', status: 'low_stock' }]
        }
      },
      'return_request': {
        type: 'return_request',
        title: '🔄 【テスト】返品要求通知',
        message: customMessage || 'テスト商品「Sony A7R V」の返品要求が届きました。理由: 商品の状態が説明と異なる',
        metadata: {
          returnId: `TEST-RET-${Date.now()}`,
          productName: 'Sony A7R V',
          reason: '商品の状態が説明と異なる'
        }
      },
      'payment_issue': {
        type: 'payment_issue',
        title: '💳 【テスト】支払い問題通知',
        message: customMessage || 'テスト取引でクレジットカード決済エラーが発生しました。',
        metadata: {
          orderId: `TEST-ORD-${Date.now()}`,
          errorType: 'card_declined'
        }
      },
      'inspection_complete': {
        type: 'inspection_complete',
        title: '✅ 【テスト】検品完了通知',
        message: customMessage || 'テスト商品「Leica M11」の検品が完了しました。',
        metadata: {
          productName: 'Leica M11',
          inspector: user.email,
          result: 'pass'
        }
      },
      'system_update': {
        type: 'system_update',
        title: '🔧 【テスト】システム更新通知',
        message: customMessage || 'システムメンテナンスのテスト通知です。',
        metadata: {
          updateType: 'test',
          scheduledTime: new Date().toISOString()
        }
      }
    };
    
    // テストタイプの有効性をチェック
    if (!testNotifications[testType]) {
      return NextResponse.json(
        { 
          error: '無効なテストタイプです',
          availableTypes: Object.keys(testNotifications)
        },
        { status: 400 }
      );
    }
    
    // 通知を送信
    const notificationData = testNotifications[testType];
    const result = await notificationService.sendNotification({
      ...notificationData,
      userId
    });
    
    // テスト結果をログに記録
    await prisma.activity.create({
      data: {
        type: 'notification_test',
        description: `通知テスト実行: ${testType}`,
        userId: user.id,
        metadata: JSON.stringify({
          testType,
          targetUserId: userId,
          success: result,
          testedAt: new Date().toISOString(),
          triggeredBy: user.email
        })
      }
    });
    
    console.log(`🧪 通知テスト完了: ${testType} -> ${result ? '成功' : '失敗'}`);
    
    return NextResponse.json({
      success: result,
      testType,
      targetUserId: userId,
      message: result ? 'テスト通知を送信しました' : 'テスト通知の送信に失敗しました',
      notification: notificationData
    }, { status: result ? 200 : 500 });
    
  } catch (error) {
    console.error('通知テストエラー:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '通知テストに失敗しました'
      },
      { status: 500 }
    );
  }
}

/**
 * 利用可能なテストタイプの一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    await AuthService.requireRole(request, ['staff', 'admin']);
    
    const testTypes = [
      {
        type: 'product_sold',
        name: '商品販売通知',
        description: '商品が売れた時の通知をテスト'
      },
      {
        type: 'inventory_alert',
        name: '在庫アラート',
        description: '在庫不足時の通知をテスト'
      },
      {
        type: 'return_request',
        name: '返品要求通知',
        description: '返品要求時の通知をテスト'
      },
      {
        type: 'payment_issue',
        name: '支払い問題通知',
        description: '支払いエラー時の通知をテスト'
      },
      {
        type: 'inspection_complete',
        name: '検品完了通知',
        description: '検品完了時の通知をテスト'
      },
      {
        type: 'system_update',
        name: 'システム更新通知',
        description: 'システム更新時の通知をテスト'
      }
    ];
    
    // セラーユーザーの一覧も取得
    const sellers = await prisma.user.findMany({
      where: { role: 'seller' },
      select: {
        id: true,
        email: true,
        fullName: true,
        notificationSettings: true
      },
      take: 10
    });
    
    return NextResponse.json({
      testTypes,
      availableUsers: sellers.map(seller => ({
        id: seller.id,
        email: seller.email,
        name: seller.fullName || seller.email,
        hasNotificationSettings: !!seller.notificationSettings
      })),
      usage: {
        method: 'POST',
        body: {
          testType: 'product_sold | inventory_alert | return_request | payment_issue | inspection_complete | system_update',
          targetUserId: 'string (optional - 省略時は最初のセラーユーザーを使用)',
          customMessage: 'string (optional - カスタムメッセージ)'
        }
      }
    });
    
  } catch (error) {
    console.error('通知テスト情報取得エラー:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '情報取得に失敗しました'
      },
      { status: 500 }
    );
  }
}
