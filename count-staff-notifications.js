// スタッフ通知数カウント（ベルバッジ用）
const { PrismaClient } = require('@prisma/client');

async function countStaffNotifications() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== スタッフ通知カウント（ベルバッジ表示用） ===');
    
    const staffUserId = 'cmfdouvrq0001mku12p0r43zh'; // staff@example.com
    
    // 未読通知数
    const unreadCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM notifications 
      WHERE userId = ${staffUserId} AND "read" = false
    `;
    
    console.log('🔔 未読通知数:', Number(unreadCount[0].count));
    
    // 今日の通知数
    const todayCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM notifications 
      WHERE userId = ${staffUserId} 
        AND date(createdAt) = date('now')
    `;
    
    console.log('📅 今日の通知数:', Number(todayCount[0].count));
    
    // 最新3件の通知詳細
    const latestNotifications = await prisma.$queryRaw`
      SELECT * FROM notifications 
      WHERE userId = ${staffUserId}
      ORDER BY createdAt DESC 
      LIMIT 3
    `;
    
    console.log('\n📦 最新3件の通知:');
    latestNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title}`);
      console.log(`   ${notif.message}`);
      console.log(`   時刻: ${notif.createdAt}`);
      console.log(`   未読: ${!notif.read ? '🔴' : '✅'}`);
      
      if (notif.metadata) {
        try {
          const metadata = JSON.parse(notif.metadata);
          console.log(`   プランID: ${metadata.planId}`);
          console.log(`   商品数: ${metadata.productCount}点`);
          console.log(`   配送先: ${metadata.deliveryAddress}`);
        } catch (e) {
          // メタデータパースエラーは無視
        }
      }
      console.log('   ---');
    });
    
    // ベルバッジに表示される数字
    const unreadCountNum = Number(unreadCount[0].count);
    const badgeCount = Math.min(unreadCountNum, 99); // 99+で制限
    console.log(`\n🔔 ベルバッジ表示数: ${badgeCount}${unreadCountNum > 99 ? '+' : ''}`);
    
  } catch (error) {
    console.error('通知カウントエラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

countStaffNotifications();