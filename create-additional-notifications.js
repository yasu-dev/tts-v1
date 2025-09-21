const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdditionalNotifications() {
  try {
    console.log('追加通知を作成中...');
    
    const sellerUserId = 'cmfdouvrh0000mku1j8mgd96e'; // セラーユーザーID
    const notifications = [];
    
    // 検品完了通知（セラー向け）
    notifications.push({
      id: `test-inspection-complete-${Date.now()}-1`,
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
        staffId: 'cmfdouvrq0001mku12p0r43zh',
        staffName: 'スタッフ'
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 保管完了通知（セラー向け）
    notifications.push({
      id: `test-storage-complete-${Date.now()}-2`,
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
        staffId: 'cmfdouvrq0001mku12p0r43zh',
        staffName: 'スタッフ'
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 商品購入通知（セラー向け）
    notifications.push({
      id: `test-product-purchase-${Date.now()}-3`,
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

    // 出荷完了通知（セラー向け）
    notifications.push({
      id: `test-shipping-complete-${Date.now()}-4`,
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
        staffId: 'cmfdouvrq0001mku12p0r43zh',
        staffName: 'スタッフ'
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

    console.log(`\n🎉 追加通知${notifications.length}種類を作成しました！`);
    console.log('\n📍 セラー向け通知が追加されました:');
    console.log('1. ✅ 検品完了 - 保管画面に遷移');
    console.log('2. ✅ 保管完了 - 出品画面に遷移');
    console.log('3. ✅ 商品が購入されました - 注文画面に遷移');
    console.log('4. ✅ 出荷完了 - 追跡画面に遷移');
    console.log('\n📍 確認方法:');
    console.log('1. http://localhost:3002/dashboard にアクセス（セラー画面）');
    console.log('2. 右上のベルアイコンをクリック');
    console.log('3. 各通知をクリックして動作確認');
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdditionalNotifications();