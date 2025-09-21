const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// プリズマ接続を初期化
prisma.$connect();

async function checkDatabase() {
  try {
    console.log('=== データベース確認開始 ===');
    
    // 1. スタッフユーザーの確認
    const staffUsers = await prisma.user.findMany({
      where: { role: 'staff' },
      select: { id: true, email: true, username: true }
    });
    console.log('\n📋 スタッフユーザー:', staffUsers.length, '人');
    staffUsers.forEach(user => {
      console.log(`  - ${user.id}: ${user.email} (${user.username})`);
    });

    // 2. 通知データの確認
    let notifications = [];
    try {
      notifications = await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          message: true,
          userId: true,
          notificationType: true,
          read: true,
          createdAt: true
        }
      });
      console.log('\n🔔 最新通知:', notifications.length, '件');
      notifications.forEach(notif => {
        console.log(`  - ${notif.id}: ${notif.title} → ${notif.userId} (${notif.notificationType})`);
      });
    } catch (error) {
      console.log('\n❌ 通知テーブルエラー:', error.message);
    }

    // 3. 納品プラン作成通知の確認
    try {
      const deliveryPlanNotifications = await prisma.notification.findMany({
        where: { notificationType: 'delivery_plan_created' },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      console.log('\n📦 納品プラン通知:', deliveryPlanNotifications.length, '件');
      deliveryPlanNotifications.forEach(notif => {
        console.log(`  - ${notif.title}: ${notif.message} → ${notif.userId}`);
      });
    } catch (error) {
      console.log('\n❌ 納品プラン通知取得エラー:', error.message);
    }

    // 4. 最新の納品プラン確認
    const deliveryPlans = await prisma.deliveryPlan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, sellerName: true, totalItems: true, createdAt: true }
    });
    console.log('\n📋 最新納品プラン:', deliveryPlans.length, '件');
    deliveryPlans.forEach(plan => {
      console.log(`  - ${plan.id}: ${plan.sellerName} (${plan.totalItems}点) - ${plan.createdAt}`);
    });

    console.log('\n=== 確認完了 ===');
  } catch (error) {
    console.error('データベース確認エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();