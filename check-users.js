const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, username: true, role: true }
    });

    console.log('📋 システム内の全ユーザー:');
    users.forEach(user => {
      console.log(`  ${user.email} (${user.username}) - 役割: ${user.role}`);
    });

    console.log('\n🔍 デモ用ログイン情報:');
    console.log('  セラー: seller@example.com / password123');
    console.log('  スタッフ: staff@example.com / password123');
    console.log('  管理者: admin@example.com / password123');

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();