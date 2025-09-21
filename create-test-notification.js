const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestNotification() {
  try {
    const notification = await prisma.notification.create({
      data: {
        type: 'success',
        title: '🎉 商品が売れました！',
        message: 'DEMOカメラ35が購入されました。配送ラベルを生成してください。',
        userId: 'cmft8e3sl00008hkr9duprf1h', // test-seller ID
        read: false,
        priority: 'high',
        notificationType: 'product_sold',
        action: 'sales'
      }
    });
    
    console.log('✅ テスト通知作成完了:', notification.id);
    return notification;
  } catch (error) {
    console.error('❌ テスト通知作成エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotification();