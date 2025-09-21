const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createCleanNotifications() {
  try {
    console.log('既存のテスト通知を削除中...');
    await prisma.$executeRaw`DELETE FROM notifications WHERE id LIKE 'test-%'`;
    
    console.log('絵文字なしの通知を作成中...');
    
    const staffUserId = 'cmfdouvrq0001mku12p0r43zh';
    const notifications = [];
    
    // 1. 納品プラン関連
    notifications.push({
      id: `test-delivery-${Date.now()}-1`,
      type: 'info',
      title: '新規納品プラン作成',
      message: 'セラー「田中 太郎」が納品プラン（5点）を作成しました。入庫作業の準備をお願いします。',
      userId: staffUserId,
      read: false,
      priority: 'medium',
      notificationType: 'delivery_plan_created',
      action: 'inspection',
      metadata: JSON.stringify({
        planId: 'DP-TEST-001',
        sellerId: 'seller-001',
        sellerName: '田中 太郎',
        productCount: 5
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 2. 商品販売関連
    notifications.push({
      id: `test-sales-${Date.now()}-2`,
      type: 'success',
      title: '商品が売れました',
      message: '遊戯王カード「ブルーアイズホワイトドラゴン」が¥15,000で売れました。',
      userId: staffUserId,
      read: false,
      priority: 'high',
      notificationType: 'product_sold',
      action: 'sales',
      metadata: JSON.stringify({
        productId: 'PROD-001',
        productName: 'ブルーアイズホワイトドラゴン',
        salePrice: 15000
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 3. 在庫アラート
    notifications.push({
      id: `test-inventory-${Date.now()}-3`,
      type: 'warning',
      title: '在庫アラート',
      message: '在庫数が少なくなっています。補充が必要です。',
      userId: staffUserId,
      read: false,
      priority: 'medium',
      notificationType: 'inventory_alert',
      action: 'inventory',
      metadata: JSON.stringify({
        alertType: 'low_stock',
        threshold: 5
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 4. 返品リクエスト
    notifications.push({
      id: `test-return-${Date.now()}-4`,
      type: 'warning',
      title: '返品リクエスト',
      message: 'お客様から返品リクエストが届いています。確認をお願いします。',
      userId: staffUserId,
      read: false,
      priority: 'high',
      notificationType: 'return_request',
      action: 'returns',
      metadata: JSON.stringify({
        returnId: 'RET-001',
        reason: '商品不良'
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 5. 支払い関連
    notifications.push({
      id: `test-payment-${Date.now()}-5`,
      type: 'success',
      title: '入金確認',
      message: '売上金¥45,000の入金を確認しました。',
      userId: staffUserId,
      read: false,
      priority: 'medium',
      notificationType: 'payment_received',
      action: 'billing',
      metadata: JSON.stringify({
        amount: 45000,
        paymentDate: new Date().toISOString()
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 6. 配送問題
    notifications.push({
      id: `test-shipping-${Date.now()}-6`,
      type: 'error',
      title: '配送エラー',
      message: '配送中にトラブルが発生しました。至急対応が必要です。',
      userId: staffUserId,
      read: false,
      priority: 'high',
      notificationType: 'shipping_issue',
      action: 'shipping',
      metadata: JSON.stringify({
        trackingNumber: 'TR-123456789',
        issue: '配送遅延'
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 7. 検品完了
    notifications.push({
      id: `test-inspection-${Date.now()}-7`,
      type: 'success',
      title: '検品完了',
      message: 'ポケモンカード 25th ANNIVERSARY COLLECTIONの検品が完了しました。',
      userId: staffUserId,
      read: false,
      priority: 'medium',
      notificationType: 'inspection_complete',
      action: 'inspection',
      metadata: JSON.stringify({
        productId: 'PROD-002',
        productName: 'ポケモンカード 25th ANNIVERSARY COLLECTION',
        inspectionResult: '良好'
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 8. システム更新
    notifications.push({
      id: `test-system-${Date.now()}-8`,
      type: 'info',
      title: 'システム更新',
      message: 'システムのメンテナンスが完了しました。新機能が追加されています。',
      userId: staffUserId,
      read: false,
      priority: 'low',
      notificationType: 'system_update',
      action: 'system',
      metadata: JSON.stringify({
        version: '2.1.0',
        features: ['新UI', 'パフォーマンス向上']
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 9. レポート準備完了
    notifications.push({
      id: `test-report-${Date.now()}-9`,
      type: 'info',
      title: '月次レポート準備完了',
      message: '2025年9月の売上レポートが準備できました。確認をお願いします。',
      userId: staffUserId,
      read: false,
      priority: 'medium',
      notificationType: 'report_ready',
      action: 'reports',
      metadata: JSON.stringify({
        reportType: 'monthly_sales',
        period: '2025-09'
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 10. プロモーション
    notifications.push({
      id: `test-promo-${Date.now()}-10`,
      type: 'info',
      title: '特別キャンペーン',
      message: '秋の特別キャンペーンが開始されました。売上アップのチャンスです！',
      userId: staffUserId,
      read: false,
      priority: 'low',
      notificationType: 'promotion_available',
      action: 'promotion',
      metadata: JSON.stringify({
        campaignId: 'CAMP-AUTUMN-2025',
        discount: 20
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Raw SQLで挿入
    for (const notification of notifications) {
      await prisma.$executeRaw`
        INSERT INTO notifications (
          id, type, title, message, userId, "read", priority, 
          notificationType, action, metadata, createdAt, updatedAt
        ) VALUES (
          ${notification.id}, ${notification.type}, ${notification.title}, 
          ${notification.message}, ${notification.userId}, ${notification.read}, 
          ${notification.priority}, ${notification.notificationType}, 
          ${notification.action}, ${notification.metadata}, 
          datetime('now'), datetime('now')
        )
      `;
      console.log(`✅ 通知作成: ${notification.title}`);
    }

    console.log(`\n🎉 全${notifications.length}種類の通知を作成しました！`);
    console.log('\n📍 確認方法:');
    console.log('1. http://localhost:3002/staff/dashboard にアクセス');
    console.log('2. 右上のベルアイコンをクリック');
    console.log('3. 各通知をクリックして動作確認');
    console.log('\n🎨 アイコン表示:');
    console.log('- 青いアイコン: info (納品プラン、システム更新、レポート、キャンペーン)');
    console.log('- 緑のアイコン: success (商品販売、入金確認、検品完了)');
    console.log('- 黄色のアイコン: warning (在庫アラート、返品リクエスト)');
    console.log('- 赤いアイコン: error (配送エラー)');
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCleanNotifications();