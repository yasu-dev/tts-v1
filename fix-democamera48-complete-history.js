const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDemoCamera48CompleteHistory() {
  console.log('🔧 DEMOカメラ４８の完全履歴を修正');

  try {
    // DEMOカメラ４８を検索
    const product = await prisma.product.findFirst({
      where: {
        name: { contains: 'DEMOカメラ４８' }
      }
    });

    if (!product) {
      console.log('❌ DEMOカメラ４８が見つかりません');
      return;
    }

    console.log('✅ DEMOカメラ４８発見:');
    console.log('ID:', product.id);
    console.log('名前:', product.name);
    console.log('SKU:', product.sku);

    // 現在の履歴を確認
    const existingActivities = await prisma.activity.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n現在の履歴: ${existingActivities.length}件`);
    existingActivities.forEach((a, index) => {
      console.log(`${index + 1}. ${a.type} - ${a.description}`);
    });

    // 不足している履歴を追加
    const missingActivities = [
      {
        type: 'listing_created',
        description: `商品 ${product.name} をeBayに出品しました`,
        metadata: JSON.stringify({
          platform: 'ebay',
          price: 1,
          userRole: 'seller'
        })
      },
      {
        type: 'purchase_decision',
        description: `購入者が決定しました（注文番号: ORDER-FIX-${Date.now()}、1点、¥1）`,
        metadata: JSON.stringify({
          orderId: `ORDER-FIX-${Date.now()}`,
          itemCount: 1,
          totalAmount: 1,
          userRole: 'seller'
        })
      },
      {
        type: 'packing_completed',
        description: `商品 ${product.name} の梱包が完了しました`,
        metadata: JSON.stringify({
          shipmentId: `SHIP-FIX-${Date.now()}`,
          userRole: 'staff'
        })
      },
      {
        type: 'label_attached',
        description: `商品 ${product.name} にラベル貼付が完了し、集荷準備が整いました`,
        metadata: JSON.stringify({
          shipmentId: `SHIP-FIX-${Date.now()}`,
          trackingNumber: `TRK-FIX-${Date.now()}`,
          userRole: 'staff'
        })
      },
      {
        type: 'shipping_prepared',
        description: `商品 ${product.name} の配送準備が完了しました`,
        metadata: JSON.stringify({
          shipmentId: `SHIP-FIX-${Date.now()}`,
          status: 'shipped',
          userRole: 'staff'
        })
      }
    ];

    console.log('\n履歴追加中...');

    for (const activity of missingActivities) {
      // 重複チェック
      const exists = existingActivities.some(a => a.type === activity.type);
      if (exists) {
        console.log(`⚠️ ${activity.type} は既に存在 - スキップ`);
        continue;
      }

      try {
        await prisma.activity.create({
          data: {
            type: activity.type,
            description: activity.description,
            productId: product.id,
            userId: null, // システム処理
            metadata: activity.metadata
          }
        });

        console.log(`✅ ${activity.type} 追加成功`);
      } catch (error) {
        console.log(`❌ ${activity.type} 追加失敗:`, error.message);
      }
    }

    // 最終確認
    const finalActivities = await prisma.activity.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n✅ 修正完了! 最終履歴: ${finalActivities.length}件`);
    console.log('最新の履歴:');
    finalActivities.slice(0, 12).forEach((a, index) => {
      console.log(`${index + 1}. ${a.type} - ${a.description}`);
    });

    console.log('\n🔄 ブラウザで履歴タブを再読み込みしてください');

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDemoCamera48CompleteHistory();