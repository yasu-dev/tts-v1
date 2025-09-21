// 直接SQLでNotificationテーブル作成
const { PrismaClient } = require('@prisma/client');

async function createNotificationTable() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== Notificationテーブル直接作成 ===');
    
    // テーブル作成
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "priority" TEXT NOT NULL DEFAULT 'medium',
        "notificationType" TEXT,
        "action" TEXT,
        "metadata" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ Notificationテーブル作成完了');
    
    // 確認
    const result = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name='notifications'
    `;
    
    console.log('確認結果:', result);
    
    if (result && result.length > 0) {
      console.log('🎉 Notificationテーブル存在確認成功');
    } else {
      console.log('❌ Notificationテーブルが見つかりません');
    }
    
  } catch (error) {
    console.error('テーブル作成エラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createNotificationTable();