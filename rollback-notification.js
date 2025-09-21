const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function rollbackNotificationTable() {
  try {
    console.log('=== Notificationテーブル削除開始 ===');
    
    // SQLファイルを読み込み
    const rollbackSQL = fs.readFileSync('rollback-notification-table.sql', 'utf8');
    
    // Raw SQLでテーブル削除
    await prisma.$executeRawUnsafe(rollbackSQL);
    
    console.log('✅ Notificationテーブル削除完了');
    console.log('📝 元の状態に戻りました');
    
  } catch (error) {
    console.error('削除エラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

rollbackNotificationTable();