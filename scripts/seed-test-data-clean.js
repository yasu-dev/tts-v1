const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 テストデータの作成を開始します...');

  try {
    const hashedPassword = await bcrypt.hash('password', 10);

    // 1. セラーユーザーの作成/確認
    console.log('👥 セラーユーザーを確認/作成中...');
    let sellerUser = await prisma.user.findUnique({
      where: { email: 'seller@test.com' }
    });

    if (!sellerUser) {
      sellerUser = await prisma.user.create({
        data: {
          email: 'seller@test.com',
          username: 'test-seller',
          password: hashedPassword,
          role: 'seller',
          fullName: 'テストセラー',
          phoneNumber: '090-1234-5678',
          address: '東京都港区テスト1-2-3'
        }
      });
      console.log('✅ セラーユーザー作成完了');
    } else {
      console.log('✅ セラーユーザー既存確認');
    }

    // 2. スタッフユーザーの作成/確認
    console.log('👥 スタッフユーザーを確認/作成中...');
    let staffUser = await prisma.user.findUnique({
      where: { email: 'staff@test.com' }
    });

    if (!staffUser) {
      staffUser = await prisma.user.create({
        data: {
          email: 'staff@test.com',
          username: 'test-staff',
          password: hashedPassword,
          role: 'staff',
          fullName: 'テストスタッフ',
          phoneNumber: '090-8765-4321',
          address: '東京都渋谷区テスト4-5-6'
        }
      });
      console.log('✅ スタッフユーザー作成完了');
    } else {
      console.log('✅ スタッフユーザー既存確認');
    }

    // 3. テストロケーションの作成/確認
    console.log('📍 テストロケーションを確認/作成中...');
    let testLocation = await prisma.location.findFirst({
      where: { code: 'TEST-A1' }
    });

    if (!testLocation) {
      testLocation = await prisma.location.create({
        data: {
          code: 'TEST-A1',
          name: 'テスト倉庫A棟1階',
          zone: 'A',
          capacity: 1000,
          isActive: true,
          address: '東京都江東区テスト倉庫1-1-1',
          phone: '03-1234-5678',
          email: 'warehouse@test.com'
        }
      });
      console.log('✅ テストロケーション作成完了');
    } else {
      console.log('✅ テストロケーション既存確認');
    }

    // 4. テスト商品の作成
    console.log('📦 テスト商品を作成中...');
    
    // 既存のテスト商品を削除
    const deletedProducts = await prisma.product.deleteMany({
      where: {
        sku: { startsWith: 'TEST-' }
      }
    });
    console.log(`🗑️ 既存テスト商品 ${deletedProducts.count} 件を削除`);

    const testProducts = [
      {
        sku: 'TEST-LISTING-001',
        name: 'テスト商品（出品中）Canon EOS R5',
        status: 'listing',
        category: 'camera',
        price: 450000,
        condition: 'excellent'
      },
      {
        sku: 'TEST-LISTING-002', 
        name: 'テスト商品（出品中）Sony α7R IV',
        status: 'listing',
        category: 'camera',
        price: 380000,
        condition: 'very_good'
      },
      {
        sku: 'TEST-SOLD-001',
        name: 'テスト商品（購入者決定済）Nikon Z9',
        status: 'sold',
        category: 'camera',
        price: 520000,
        condition: 'excellent'
      },
      {
        sku: 'TEST-INBOUND-001',
        name: 'テスト商品（入荷待ち）Fujifilm X-T4',
        status: 'inbound',
        category: 'camera',
        price: 180000,
        condition: 'good'
      }
    ];

    const createdProducts = [];
    for (const productData of testProducts) {
      const product = await prisma.product.create({
        data: {
          ...productData,
          description: `${productData.name}のテスト用商品データです。`,
          imageUrl: '/images/test-product.jpg',
          sellerId: sellerUser.id,
          currentLocationId: testLocation.id,
          inspectedAt: ['sold', 'listing'].includes(productData.status) ? new Date() : null,
          inspectedBy: ['sold', 'listing'].includes(productData.status) ? staffUser.id : null,
          inspectionNotes: ['sold', 'listing'].includes(productData.status) ? '検品完了：問題なし' : null
        }
      });
      createdProducts.push(product);
      console.log(`📦 商品作成: ${product.sku} (${product.status})`);
    }

    console.log('✅ テストデータの作成が完了しました！');
    console.log('\n📊 作成されたテストデータ:');
    console.log(`👥 ユーザー: セラー1件, スタッフ1件`);
    console.log(`📦 商品: ${createdProducts.length}件`);
    console.log(`📍 ロケーション: 1件`);
    console.log('\n🧪 E2Eテストの実行準備が整いました！');

  } catch (error) {
    console.error('❌ テストデータ作成中にエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log('🎉 テストデータのシーディングが完了しました');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 シーディングに失敗しました:', error);
      process.exit(1);
    });
}

module.exports = seedTestData;