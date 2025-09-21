const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function fixNotificationTable() {
  try {
    console.log('=== Notificationテーブル修復開始 ===');
    
    // SQLファイルを読み込み
    const createTableSQL = fs.readFileSync('create-notification-table.sql', 'utf8');
    
    // Raw SQLでテーブル作成
    await prisma.$executeRawUnsafe(createTableSQL);
    
    console.log('✅ Notificationテーブル作成完了');
    
    // 確認
    const count = await prisma.notification.count();
    console.log(`📊 通知テーブル確認: ${count}件`);
    
    console.log('\n📝 後戻り方法:');
    console.log('   node rollback-notification.js');
    console.log('   または: DROP TABLE notifications;');
    
  } catch (error) {
    console.error('修復エラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixNotificationTable();