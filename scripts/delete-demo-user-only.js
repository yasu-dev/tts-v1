const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteDemoUserOnly() {
  try {
    console.log('=== デモユーザーアカウント削除 ===\n');

    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo-seller@example.com' }
    });

    if (!demoUser) {
      console.log('✅ デモユーザーは既に削除されています。');

      const stats = await prisma.$transaction([
        prisma.user.count(),
        prisma.product.count(),
        prisma.deliveryPlan.count()
      ]);

      console.log('\n📊 現在のデータベース:');
      console.log(`   ユーザー: ${stats[0]}件`);
      console.log(`   商品: ${stats[1]}件`);
      console.log(`   納品プラン: ${stats[2]}件`);

      return;
    }

    console.log('削除対象: demo-seller@example.com\n');

    // 関連データの確認（削除済みか確認）
    const relatedData = await prisma.$transaction([
      prisma.product.count({ where: { sellerId: demoUser.id } }),
      prisma.deliveryPlan.count({ where: { sellerId: demoUser.id } }),
      prisma.activity.count({ where: { userId: demoUser.id } }),
      prisma.task.count({ where: { assignedTo: demoUser.id } }),
      prisma.videoRecord.count({ where: { staffId: demoUser.id } }),
      prisma.order.count({ where: { customerId: demoUser.id } })
    ]);

    console.log('関連データ確認:');
    console.log(`   Product: ${relatedData[0]}件`);
    console.log(`   DeliveryPlan: ${relatedData[1]}件`);
    console.log(`   Activity: ${relatedData[2]}件`);
    console.log(`   Task: ${relatedData[3]}件`);
    console.log(`   VideoRecord: ${relatedData[4]}件`);
    console.log(`   Order: ${relatedData[5]}件`);
    console.log('');

    // トランザクションで削除
    await prisma.$transaction(async (tx) => {
      // Activity削除
      if (relatedData[2] > 0) {
        await tx.activity.deleteMany({
          where: { userId: demoUser.id }
        });
        console.log(`✓ Activity削除: ${relatedData[2]}件`);
      }

      // Task削除
      if (relatedData[3] > 0) {
        await tx.task.deleteMany({
          where: { assignedTo: demoUser.id }
        });
        console.log(`✓ Task削除: ${relatedData[3]}件`);
      }

      // VideoRecord削除（staffId使用）
      if (relatedData[4] > 0) {
        await tx.videoRecord.deleteMany({
          where: { staffId: demoUser.id }
        });
        console.log(`✓ VideoRecord削除: ${relatedData[4]}件`);
      }

      // Order関連削除
      if (relatedData[5] > 0) {
        const orders = await tx.order.findMany({
          where: { customerId: demoUser.id },
          select: { id: true }
        });
        const orderIds = orders.map(o => o.id);

        // Shipment削除
        await tx.shipment.deleteMany({
          where: { orderId: { in: orderIds } }
        });

        // Activity削除（orderId関連）
        await tx.activity.deleteMany({
          where: { orderId: { in: orderIds } }
        });

        // VideoRecord削除（orderId関連）
        await tx.videoRecord.deleteMany({
          where: { orderId: { in: orderIds } }
        });

        // OrderItem削除
        await tx.orderItem.deleteMany({
          where: { orderId: { in: orderIds } }
        });

        // Order削除
        await tx.order.deleteMany({
          where: { id: { in: orderIds } }
        });
        console.log(`✓ Order関連削除: ${relatedData[5]}件`);
      }

      // ユーザー削除
      await tx.user.delete({
        where: { id: demoUser.id }
      });
      console.log(`✓ デモユーザー削除完了`);
    });

    console.log('\n✅ デモユーザーアカウントが正常に削除されました！');

    // 最終統計
    const finalStats = await prisma.$transaction([
      prisma.user.count(),
      prisma.product.count(),
      prisma.deliveryPlan.count()
    ]);

    console.log('\n📊 削除後のデータベース:');
    console.log(`   ユーザー: ${finalStats[0]}件`);
    console.log(`   商品: ${finalStats[1]}件（ユーザーデータ）`);
    console.log(`   納品プラン: ${finalStats[2]}件（ユーザーデータ）`);

    console.log('\n✅ デモデータの削除が完了しました。');
    console.log('   ユーザーが作成したデータはすべて保護されています。');

  } catch (error) {
    console.error('❌ エラー:', error.message);
    if (error.code) {
      console.error(`   コード: ${error.code}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

deleteDemoUserOnly();