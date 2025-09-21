// 直接通知APIテスト（認証なし）
const { PrismaClient } = require('@prisma/client');

async function testDirectNotifications() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== 直接通知テスト（認証なし） ===');
    
    const staffUserId = 'cmfdouvrq0001mku12p0r43zh'; // staff@example.com
    
    // Raw SQLで通知取得
    const unreadNotifications = await prisma.$queryRaw`
      SELECT * FROM notifications 
      WHERE userId = ${staffUserId} 
        AND "read" = false 
        AND createdAt >= datetime('now', '-24 hours')
      ORDER BY createdAt DESC 
      LIMIT 10
    `;
    
    console.log('取得件数:', unreadNotifications.length);
    
    // 動的通知配列に変換
    const dynamicNotifications = [];
    
    for (const notification of unreadNotifications) {
      console.log('変換中:', notification.id, '|', notification.title);
      
      // createdAtをISO文字列に変換（日付オブジェクトの場合）
      let timestamp;
      if (notification.createdAt instanceof Date) {
        timestamp = notification.createdAt.toISOString();
      } else if (typeof notification.createdAt === 'string') {
        // SQLiteの文字列日付をDateオブジェクトに変換してからISO文字列に
        timestamp = new Date(notification.createdAt).toISOString();
      } else {
        timestamp = new Date().toISOString(); // fallback
      }
      
      dynamicNotifications.push({
        id: notification.id,
        type: notification.type || 'info',
        title: notification.title,
        message: notification.message,
        timestamp: timestamp,
        read: notification.read,
        notificationType: notification.notificationType || undefined,
        metadata: notification.metadata,
        userId: staffUserId
      });
    }
    
    console.log('変換後配列サイズ:', dynamicNotifications.length);
    
    if (dynamicNotifications.length > 0) {
      console.log('\n📦 変換された通知:');
      dynamicNotifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title} (${notif.id})`);
        console.log(`   Type: ${notif.type}`);
        console.log(`   Timestamp: ${notif.timestamp}`);
        console.log(`   Read: ${notif.read}`);
      });
      
      console.log('\n🎯 JSON結果:');
      console.log(JSON.stringify(dynamicNotifications, null, 2));
    }
    
  } catch (error) {
    console.error('直接テストエラー:', error.message);
    console.error('スタック:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectNotifications();