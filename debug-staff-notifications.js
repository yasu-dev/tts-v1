// スタッフ通知の詳細デバッグ
const { PrismaClient } = require('@prisma/client');

async function debugStaffNotifications() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== スタッフ通知デバッグ ===');
    
    const staffUserId = 'cmfdouvrq0001mku12p0r43zh'; // staff@example.com
    
    console.log('対象スタッフユーザーID:', staffUserId);
    
    // 該当スタッフの通知確認
    const staffNotifications = await prisma.$queryRaw`
      SELECT * FROM notifications 
      WHERE userId = ${staffUserId}
      ORDER BY createdAt DESC
    `;
    
    console.log('スタッフ通知総数:', staffNotifications.length);
    
    if (staffNotifications.length > 0) {
      console.log('\n📦 スタッフ通知詳細:');
      staffNotifications.forEach((notif, index) => {
        console.log(`${index + 1}. ID: ${notif.id}`);
        console.log(`   Title: ${notif.title}`);
        console.log(`   Message: ${notif.message}`);
        console.log(`   Read: ${notif.read}`);
        console.log(`   Created: ${notif.createdAt}`);
        console.log(`   Updated: ${notif.updatedAt}`);
        console.log('   ---');
      });
    }
    
    // 未読通知確認
    const unreadNotifications = await prisma.$queryRaw`
      SELECT * FROM notifications 
      WHERE userId = ${staffUserId} 
        AND "read" = false 
        AND createdAt >= datetime('now', '-24 hours')
      ORDER BY createdAt DESC 
      LIMIT 10
    `;
    
    console.log('\n🔔 未読通知（24時間以内）:', unreadNotifications.length, '件');
    
    if (unreadNotifications.length > 0) {
      unreadNotifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title} (${notif.id})`);
      });
    }
    
    // 24時間以内の全通知確認
    const recentNotifications = await prisma.$queryRaw`
      SELECT * FROM notifications 
      WHERE userId = ${staffUserId} 
        AND createdAt >= datetime('now', '-24 hours')
      ORDER BY createdAt DESC
    `;
    
    console.log('\n⏰ 24時間以内の全通知:', recentNotifications.length, '件');
    
  } catch (error) {
    console.error('デバッグエラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugStaffNotifications();