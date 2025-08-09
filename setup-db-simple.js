const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 データベースセットアップ開始...');
    
    // ユーザー作成
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await prisma.user.upsert({
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
        address: '東京都渋谷区1-1-1'
      }
    });
    
    console.log('✅ ユーザー作成完了:', user.email);

    // 倉庫作成
    const warehouse = await prisma.warehouse.upsert({
      where: { id: 'warehouse-1' },
      update: {},
      create: {
        id: 'warehouse-1',
        name: 'メイン倉庫',
        address: '東京都江戸川区臨海町3-6-4 ヒューリック葛西臨海ビル5階',
        contactPerson: '倉庫管理者',
        phoneNumber: '03-1234-5678'
      }
    });
    
    console.log('✅ 倉庫作成完了:', warehouse.name);
    console.log('🎉 セットアップ完了');
    
  } catch (error) {
    console.error('❌ セットアップエラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
