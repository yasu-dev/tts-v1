// 通知レコードを直接確認
const { PrismaClient } = require('@prisma/client');

async function checkNotifications() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== Notificationレコード直接確認 ===');
    
    // 全通知件数確認
    const allNotifications = await prisma.$queryRaw`
      SELECT * FROM notifications ORDER BY createdAt DESC
    `;
    
    console.log('全通知件数:', allNotifications.length);
    
    if (allNotifications.length > 0) {
      console.log('\n📦 最新通知:');
      allNotifications.forEach((notif, index) => {
        console.log(`${index + 1}. ID: ${notif.id}`);
        console.log(`   Title: ${notif.title}`);
        console.log(`   Message: ${notif.message}`);
        console.log(`   UserId: ${notif.userId}`);
        console.log(`   Created: ${notif.createdAt}`);
        console.log('   ---');
      });
    }
    
    // スタッフ別通知確認
    const staffNotifications = await prisma.$queryRaw`
      SELECT n.*, u.email, u.username 
      FROM notifications n 
      JOIN users u ON n.userId = u.id 
      WHERE u.role = 'staff' 
      ORDER BY n.createdAt DESC
    `;
    
    console.log('\nスタッフ通知件数:', staffNotifications.length);
    
    if (staffNotifications.length > 0) {
      staffNotifications.forEach((notif, index) => {
        console.log(`${index + 1}. Staff: ${notif.email} (${notif.username})`);
        console.log(`   Title: ${notif.title}`);
        console.log(`   Read: ${notif.read}`);
      });
    }
    
  } catch (error) {
    console.error('通知確認エラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotifications();