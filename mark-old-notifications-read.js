// 古い通知を既読にして、ベルバッジを②にする
const { PrismaClient } = require('@prisma/client');

async function markOldNotificationsRead() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== 古い通知を既読にしてベルバッジを②に調整 ===');
    
    const staffUserId = 'cmfdouvrq0001mku12p0r43zh'; // staff@example.com
    
    // 全通知を取得（古い順）
    const allNotifications = await prisma.$queryRaw`
      SELECT * FROM notifications 
      WHERE userId = ${staffUserId}
      ORDER BY createdAt ASC
    `;
    
    console.log('全通知数:', allNotifications.length);
    
    // 最新2件以外を既読にする
    const notificationsToMarkRead = allNotifications.slice(0, -2); // 最後の2件以外
    
    console.log('既読にする通知数:', notificationsToMarkRead.length);
    console.log('未読のまま残す通知数: 2');
    
    // 既読にする通知のIDリスト
    const idsToMarkRead = notificationsToMarkRead.map(n => n.id);
    
    if (idsToMarkRead.length > 0) {
      console.log('\n📝 既読にする通知:');
      notificationsToMarkRead.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title} (${notif.id})`);
        console.log(`   作成日: ${notif.createdAt}`);
      });
      
      // Raw SQLで一括既読更新
      for (const notificationId of idsToMarkRead) {
        await prisma.$executeRaw`
          UPDATE notifications 
          SET "read" = true, updatedAt = datetime('now')
          WHERE id = ${notificationId} AND userId = ${staffUserId}
        `;
      }
      
      console.log(`\n✅ ${idsToMarkRead.length}件の通知を既読にマークしました`);
    }
    
    // 最終確認
    const unreadCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM notifications 
      WHERE userId = ${staffUserId} AND "read" = false
    `;
    
    console.log('\n🔔 既読処理後の未読通知数:', Number(unreadCount[0].count));
    
    // 未読通知の詳細表示
    const unreadNotifications = await prisma.$queryRaw`
      SELECT * FROM notifications 
      WHERE userId = ${staffUserId} AND "read" = false
      ORDER BY createdAt DESC
    `;
    
    console.log('\n📦 未読通知詳細:');
    unreadNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title}`);
      console.log(`   ${notif.message}`);
      console.log(`   作成日: ${notif.createdAt}`);
      
      if (notif.metadata) {
        try {
          const metadata = JSON.parse(notif.metadata);
          console.log(`   プランID: ${metadata.planId}`);
        } catch (e) {
          // メタデータパースエラーは無視
        }
      }
      console.log('   ---');
    });
    
    const badgeCount = Number(unreadCount[0].count);
    console.log(`\n🎯 ベルバッジ表示: 🔔 ${badgeCount}`);
    
  } catch (error) {
    console.error('既読処理エラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

markOldNotificationsRead();