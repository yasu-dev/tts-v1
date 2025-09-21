// スタッフ通知クエリの直接テスト
const { PrismaClient } = require('@prisma/client');

async function testStaffQuery() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== スタッフ通知クエリ直接テスト ===');
    
    // 元のクエリ
    const staffNotifications = await prisma.$queryRaw`
      SELECT n.* FROM notifications n 
      JOIN users u ON n.userId = u.id 
      WHERE u.role = 'staff'
      ORDER BY n.createdAt DESC 
      LIMIT 20
    `;
    
    console.log('元のクエリ結果:', staffNotifications.length, '件');
    
    if (staffNotifications.length > 0) {
      console.log('最初の通知:', staffNotifications[0]);
      
      const mapped = staffNotifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        timestamp: n.createdAt instanceof Date ? n.createdAt.toISOString() : new Date(n.createdAt).toISOString(),
        read: n.read,
        action: n.action,
        priority: n.priority,
        notificationType: n.notificationType
      }));
      
      console.log('\nマッピング後の最初の通知:');
      console.log(JSON.stringify(mapped[0], null, 2));
    }
    
    // より簡単なクエリでテスト
    const allNotifications = await prisma.$queryRaw`
      SELECT * FROM notifications 
      ORDER BY createdAt DESC 
      LIMIT 5
    `;
    
    console.log('\n全通知（最新5件）:', allNotifications.length, '件');
    if (allNotifications.length > 0) {
      console.log('最初の通知のuserIdとタイトル:', allNotifications[0].userId, '|', allNotifications[0].title);
    }
    
    // スタッフユーザーの確認
    const staffUsers = await prisma.$queryRaw`
      SELECT id, email, role FROM users WHERE role = 'staff'
    `;
    
    console.log('\nスタッフユーザー:', staffUsers.length, '件');
    staffUsers.forEach(user => {
      console.log(`- ${user.email} (${user.id})`);
    });
    
  } catch (error) {
    console.error('クエリテストエラー:', error.message);
    console.error('スタック:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testStaffQuery();