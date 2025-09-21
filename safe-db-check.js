const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function safeDbCheck() {
  try {
    console.log('=== 安全なDB確認 ===');
    
    // 1. テーブル存在確認（エラーでも継続）
    let notificationTableExists = false;
    try {
      await prisma.notification.count();
      notificationTableExists = true;
      console.log('✅ Notificationテーブル: 存在');
    } catch (error) {
      console.log('❌ Notificationテーブル: 存在しない');
      console.log('   エラー:', error.message);
    }

    if (notificationTableExists) {
      // 2. 通知データ確認
      const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      console.log(`📊 通知件数: ${notifications.length}件`);
      
      const staffNotifications = await prisma.notification.findMany({
        where: { notificationType: 'delivery_plan_created' }
      });
      console.log(`📦 納品プラン通知: ${staffNotifications.length}件`);
      
      if (staffNotifications.length > 0) {
        console.log('最新の納品プラン通知:');
        staffNotifications.slice(0, 3).forEach(n => {
          console.log(`  - ${n.title} → ${n.userId}`);
        });
      }
    } else {
      console.log('\n🔧 Notificationテーブルが存在しません');
      console.log('   通知システムが動作していない原因です');
    }

    // 3. スタッフユーザー確認
    const staffUsers = await prisma.user.findMany({
      where: { role: 'staff' },
      select: { id: true, email: true }
    });
    console.log(`👥 スタッフユーザー: ${staffUsers.length}人`);

  } catch (error) {
    console.error('DB確認エラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

safeDbCheck();