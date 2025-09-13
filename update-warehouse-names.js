const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateWarehouseNames() {
  try {
    console.log('既存納品プランの倉庫名を更新します...');

    // 既存の納品プランを取得
    const deliveryPlans = await prisma.deliveryPlan.findMany({
      where: {
        OR: [
          { warehouseName: null },
          { warehouseName: '' }
        ]
      }
    });

    console.log(`更新対象: ${deliveryPlans.length}件`);

    for (const plan of deliveryPlans) {
      let warehouseName = 'アラウンド・ザ・ワールド株式会社 営業倉庫';
      let warehouseId = 'warehouse-001';

      // 住所から倉庫を推定
      if (plan.deliveryAddress) {
        if (plan.deliveryAddress.includes('相模原') || plan.deliveryAddress.includes('THE WORLD DOOR')) {
          warehouseName = '株式会社THE WORLD DOOR 営業倉庫';
          warehouseId = 'warehouse-002';
        }
      }

      // 納品プランを更新
      await prisma.deliveryPlan.update({
        where: { id: plan.id },
        data: {
          warehouseId: warehouseId,
          warehouseName: warehouseName
        }
      });

      console.log(`更新完了: ${plan.planNumber} -> ${warehouseName}`);
    }

    console.log('すべての更新が完了しました。');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateWarehouseNames();