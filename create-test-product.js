const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestProduct() {
  try {
    const product = await prisma.product.create({
      data: {
        name: 'テスト商品',
        sku: 'TEST-001',
        description: 'これは備考テスト用の商品です。',
        notes: 'これは一般的なメモです。',
        inspectionNotes: 'これは検品メモです。商品の状態は良好です。',
        price: 10000,
        category: 'camera',
        condition: 'excellent',
        status: 'storage',
        sellerId: 'cmfdouqh60000kj57vkbkp34a',
        entryDate: new Date(),
        imageUrl: 'https://example.com/test.jpg'
      }
    });

    console.log('商品作成完了:', product);

    const product2 = await prisma.product.create({
      data: {
        name: 'スタッフテスト商品',
        sku: 'STAFF-TEST-001',
        description: 'スタッフ用テスト商品の説明です。',
        notes: 'スタッフが確認できる一般メモです。',
        inspectionNotes: 'スタッフが確認できる検品メモです。品質は良好。',
        price: 15000,
        category: 'watch',
        condition: 'good',
        status: 'completed',
        sellerId: 'cmfdouqh60000kj57vkbkp34a',
        entryDate: new Date(),
        imageUrl: 'https://example.com/staff-test.jpg'
      }
    });

    console.log('スタッフ商品作成完了:', product2);

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestProduct();