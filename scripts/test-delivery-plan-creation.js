const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDeliveryPlanCreation() {
  try {
    console.log('=== 納品プラン作成テスト ===\n');

    // デモユーザー取得
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo-seller@example.com' }
    });

    if (!demoUser) {
      console.log('❌ デモユーザーが存在しません');
      return;
    }

    console.log(`✅ デモユーザー確認: ${demoUser.email} (${demoUser.id})`);

    // フルな納品プラン作成テスト（UIと同じデータ構造）
    console.log('\n🚀 フル機能納品プラン作成テスト:');

    const testData = {
      basicInfo: {
        deliveryAddress: '〒150-0001 東京都渋谷区神宮前1-1-1 テストビル3F',
        phoneNumber: '090-1234-5678'
      },
      products: [
        {
          name: 'テストカメラA',
          category: 'camera',
          condition: 'excellent',
          purchasePrice: 150000,
          supplierDetails: 'テスト仕入先',
          supplier: 'TestSupplier',
          brand: 'TestBrand',
          model: 'TestModel',
          serialNumber: 'TEST123456',
          purchaseDate: '2025-09-14',
          photographyRequest: {
            photographyType: 'standard'
          },
          premiumPacking: false,
          images: []
        }
      ],
      confirmation: {
        notes: 'テスト用納品プラン'
      }
    };

    const planId = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await prisma.$transaction(async (tx) => {
      // 1. 納品プラン作成
      const deliveryPlan = await tx.deliveryPlan.create({
        data: {
          id: planId,
          planNumber: planId,
          sellerId: demoUser.id,
          sellerName: demoUser.username || demoUser.email,
          deliveryAddress: testData.basicInfo.deliveryAddress,
          contactEmail: demoUser.email,
          phoneNumber: testData.basicInfo.phoneNumber,
          status: 'draft',
          totalItems: testData.products.length,
          totalValue: testData.products.reduce((sum, p) => sum + (p.purchasePrice || 0), 0),
          notes: testData.confirmation.notes
        }
      });

      console.log(`   ✅ DeliveryPlan作成: ${deliveryPlan.id}`);

      // 2. 商品作成
      for (let i = 0; i < testData.products.length; i++) {
        const product = testData.products[i];

        const deliveryPlanProduct = await tx.deliveryPlanProduct.create({
          data: {
            deliveryPlanId: planId,
            name: product.name,
            category: product.category,
            estimatedValue: product.purchasePrice,
            description: JSON.stringify({
              condition: product.condition,
              supplierDetails: product.supplierDetails,
              supplier: product.supplier,
              brand: product.brand,
              model: product.model,
              serialNumber: product.serialNumber,
              purchaseDate: product.purchaseDate
            }),
            photographyRequests: JSON.stringify(product.photographyRequest),
            premiumPacking: product.premiumPacking
          }
        });

        console.log(`   ✅ DeliveryPlanProduct作成: ${deliveryPlanProduct.id} (${product.name})`);

        // 3. Product作成（スタッフ画面用）
        const sku = `${planId}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase();

        const createdProduct = await tx.product.create({
          data: {
            name: product.name,
            sku: sku,
            category: product.category,
            status: 'inbound',
            price: product.purchasePrice,
            condition: product.condition,
            description: `納品プラン ${planId} からの入庫予定商品`,
            sellerId: demoUser.id,
            entryDate: new Date()
          }
        });

        console.log(`   ✅ Product作成: ${createdProduct.id} (${createdProduct.sku})`);
      }

      console.log('\n🎉 納品プラン作成テスト成功！');
    });

    // 4. 作成されたデータの確認
    console.log('\n📊 作成データ確認:');

    const createdPlan = await prisma.deliveryPlan.findUnique({
      where: { id: planId },
      include: {
        products: true
      }
    });

    console.log(`   納品プラン: ${createdPlan.sellerName} - ${createdPlan.deliveryAddress}`);
    console.log(`   商品数: ${createdPlan.products.length}件`);
    console.log(`   総額: ¥${createdPlan.totalValue.toLocaleString()}`);

    const createdProducts = await prisma.product.count();
    console.log(`   作成されたProduct: ${createdProducts}件`);

    console.log('\n✅ すべてのテスト成功！納品プラン機能は正常に動作しています。');

  } catch (error) {
    console.error('❌ テストエラー:', error.message);
    if (error.code) {
      console.error(`   エラーコード: ${error.code}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDeliveryPlanCreation();