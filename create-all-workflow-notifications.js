const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAllWorkflowNotifications() {
  try {
    console.log('既存のテスト通知を削除中...');
    await prisma.$executeRaw`DELETE FROM notifications WHERE id LIKE 'test-%' OR id LIKE 'safe-delivery-%'`;
    
    console.log('全ワークフロー通知を作成中...\n');
    
    const staffUserId = 'cmfdouvrq0001mku12p0r43zh'; // スタッフユーザーID
    const sellerUserId = 'cmfdouvrh0000mku1j8mgd96e'; // セラーユーザーID
    const notifications = [];
    
    // ========== スタッフ向け通知 ==========
    console.log('【スタッフ向け通知】');
    
    // 1. 納品プラン作成（スタッフ向け）
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
        sellerId: sellerUserId,
        sellerName: '田中 太郎',
        productCount: 5
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 2. 検品待ち通知（スタッフ向け）
    notifications.push({
      id: `test-inspection-pending-${Date.now()}-2`,
      type: 'info',
      title: '検品待ち商品あり',
      message: '検品待ちの商品が3件あります。検品作業をお願いします。',
      userId: staffUserId,
      read: false,
      priority: 'medium',
      notificationType: 'inspection_pending',
      action: 'inspection',
      metadata: JSON.stringify({
        pendingCount: 3,
        productIds: ['PROD-001', 'PROD-002', 'PROD-003']
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // ========== セラー向け通知 ==========
    console.log('\n【セラー向け通知】');
    
    // 3. 検品完了（セラー向け）
    notifications.push({
      id: `test-inspection-complete-${Date.now()}-3`,
      type: 'success',
      title: '検品完了',
      message: '商品「遊戯王カード ブルーアイズホワイトドラゴン」の検品が完了しました。結果: 良好',
      userId: sellerUserId,
      read: false,
      priority: 'medium',
      notificationType: 'inspection_complete',
      action: 'storage',
      metadata: JSON.stringify({
        productId: 'PROD-001',
        productName: '遊戯王カード ブルーアイズホワイトドラゴン',
        inspectionResult: '良好',
        staffId: staffUserId,
        staffName: 'スタッフ佐藤'
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 4. 保管完了（セラー向け）
    notifications.push({
      id: `test-storage-complete-${Date.now()}-4`,
      type: 'success',
      title: '保管完了',
      message: '商品「ポケモンカード 25th ANNIVERSARY COLLECTION」の保管が完了しました。出品準備が整いました。保管場所: 倉庫A-1',
      userId: sellerUserId,
      read: false,
      priority: 'medium',
      notificationType: 'storage_complete',
      action: 'listing',
      metadata: JSON.stringify({
        productId: 'PROD-002',
        productName: 'ポケモンカード 25th ANNIVERSARY COLLECTION',
        storageLocation: '倉庫A-1',
        staffId: staffUserId,
        staffName: 'スタッフ山田'
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 5. 商品購入（セラー向け）
    notifications.push({
      id: `test-product-purchase-${Date.now()}-5`,
      type: 'success',
      title: '商品が購入されました',
      message: '商品「デュエルマスターズ 切札勝太&カツキング」が¥8,500で購入されました。購入者: 山田太郎様',
      userId: sellerUserId,
      read: false,
      priority: 'high',
      notificationType: 'product_purchased',
      action: 'order',
      metadata: JSON.stringify({
        productId: 'PROD-003',
        productName: 'デュエルマスターズ 切札勝太&カツキング',
        buyerName: '山田太郎',
        buyerEmail: 'yamada@example.com',
        purchasePrice: 8500,
        orderId: 'ORD-20250921-001'
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 6. 出荷完了（セラー向け）
    notifications.push({
      id: `test-shipping-complete-${Date.now()}-6`,
      type: 'success',
      title: '出荷完了',
      message: '注文ORD-20250921-002の商品「ワンピースカード ルフィ」の出荷が完了しました。追跡番号: 1234-5678-9012',
      userId: sellerUserId,
      read: false,
      priority: 'high',
      notificationType: 'shipping_complete',
      action: 'tracking',
      metadata: JSON.stringify({
        orderId: 'ORD-20250921-002',
        productId: 'PROD-004',
        productName: 'ワンピースカード ルフィ',
        trackingNumber: '1234-5678-9012',
        shippingCarrier: 'ヤマト運輸',
        buyerName: '佐藤花子',
        staffId: staffUserId,
        staffName: 'スタッフ鈴木'
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
      console.log(`✅ 作成: ${notification.title} (${notification.userId === staffUserId ? 'スタッフ' : 'セラー'}向け)`);
    }

    console.log(`\n🎉 全ワークフロー通知${notifications.length}種類を作成しました！`);
    
    console.log('\n============================================');
    console.log('📍 テスト手順');
    console.log('============================================\n');
    
    console.log('【スタッフ画面でのテスト】');
    console.log('1. http://localhost:3002/staff/dashboard にアクセス');
    console.log('2. 右上のベルアイコンをクリック（②バッジ表示されるはず）');
    console.log('3. 確認できる通知:');
    console.log('   - 新規納品プラン作成 → クリックで検品画面へ');
    console.log('   - 検品待ち商品あり → クリックで検品画面へ');
    
    console.log('\n【セラー画面でのテスト】');
    console.log('1. http://localhost:3002/dashboard にアクセス');
    console.log('2. 右上のベルアイコンをクリック（④バッジ表示されるはず）');
    console.log('3. 確認できる通知:');
    console.log('   - 検品完了 → クリックで在庫画面へ');
    console.log('   - 保管完了 → クリックで出品画面へ');
    console.log('   - 商品が購入されました → クリックで注文画面へ');
    console.log('   - 出荷完了 → クリックで追跡画面へ');
    
    console.log('\n【各通知のテスト項目】');
    console.log('- 通知をクリック → 正しい画面に遷移するか');
    console.log('- 通知をクリック → 既読になるか');
    console.log('- 通知をクリック → バッジの数字が減るか');
    console.log('- アイコンの表示 → 適切なアイコンが表示されているか');
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAllWorkflowNotifications();