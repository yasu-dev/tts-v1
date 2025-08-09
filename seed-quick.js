const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 初期データ作成開始...');

    // デモユーザーを作成
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const seller = await prisma.user.upsert({
      where: { email: 'seller@example.com' },
      update: {},
      create: {
        id: 'seller-1',
        email: 'seller@example.com',
        username: 'seller',
        password: hashedPassword,
        role: 'seller',
        fullName: 'テストセラー',
        phoneNumber: '090-1234-5678',
        address: '東京都渋谷区1-1-1',
      },
    });

    // デモ倉庫を作成
    await prisma.warehouse.upsert({
      where: { id: 'warehouse-1' },
      update: {},
      create: {
        id: 'warehouse-1',
        name: 'メイン倉庫',
        address: '東京都江戸川区臨海町3-6-4 ヒューリック葛西臨海ビル5階',
        contactPerson: '倉庫管理者',
        phoneNumber: '03-1234-5678',
      },
    });

    console.log('✅ 初期データ作成完了');
    console.log(`✅ セラー: ${seller.email} (パスワード: password123)`);
    
  } catch (error) {
    console.error('❌ エラー:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('📞 データベース接続を閉じました');
  })
  .catch(async (e) => {
    console.error('💥 失敗:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
