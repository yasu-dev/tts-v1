const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function completeDeleteDemoData() {
  try {
    console.log('=== デモデータ完全削除 ===\n');

    // デモユーザーの確認
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo-seller@example.com' }
    });

    if (!demoUser) {
      console.log('✅ デモユーザーは既に削除されています。');

      // 最終確認
      const users = await prisma.user.count();
      const products = await prisma.product.count();
      const plans = await prisma.deliveryPlan.count();

      console.log('\n📊 現在のデータ:');
      console.log(`   ユーザー: ${users}件`);
      console.log(`   商品: ${products}件`);
      console.log(`   納品プラン: ${plans}件`);

      return;
    }

    console.log('削除対象: demo-seller@example.com');
    console.log(`ユーザーID: ${demoUser.id}\n`);

    // トランザクションで完全削除
    await prisma.$transaction(async (tx) => {
      // 1. Activity削除
      const deletedActivities = await tx.activity.deleteMany({
        where: { userId: demoUser.id }
      });
      if (deletedActivities.count > 0) {
        console.log(`✓ Activity削除: ${deletedActivities.count}件`);
      }

      // 2. Task削除（assignedTo）
      const deletedTasks = await tx.task.deleteMany({
        where: { assignedTo: demoUser.id }
      });
      if (deletedTasks.count > 0) {
        console.log(`✓ Task削除: ${deletedTasks.count}件`);
      }

      // 3. VideoRecord削除
      const deletedVideos = await tx.videoRecord.deleteMany({
        where: { uploadedBy: demoUser.id }
      });
      if (deletedVideos.count > 0) {
        console.log(`✓ VideoRecord削除: ${deletedVideos.count}件`);
      }

      // 4. Order関連削除（customerId）
      const customerOrders = await tx.order.findMany({
        where: { customerId: demoUser.id },
        select: { id: true }
      });

      if (customerOrders.length > 0) {
        const orderIds = customerOrders.map(o => o.id);

        // Shipment削除
        await tx.shipment.deleteMany({
          where: { orderId: { in: orderIds } }
        });

        // OrderItem削除
        await tx.orderItem.deleteMany({
          where: { orderId: { in: orderIds } }
        });

        // Order削除
        const deletedOrders = await tx.order.deleteMany({
          where: { id: { in: orderIds } }
        });

        if (deletedOrders.count > 0) {
          console.log(`✓ Order削除: ${deletedOrders.count}件`);
        }
      }

      // 5. Product関連（既に削除済みの可能性）
      const products = await tx.product.findMany({
        where: { sellerId: demoUser.id },
        select: { id: true }
      });

      if (products.length > 0) {
        const productIds = products.map(p => p.id);

        // 関連テーブル削除
        await tx.orderItem.deleteMany({
          where: { productId: { in: productIds } }
        });

        await tx.shipment.deleteMany({
          where: { productId: { in: productIds } }
        });

        await tx.listing.deleteMany({
          where: { productId: { in: productIds } }
        });

        await tx.inspectionChecklist.deleteMany({
          where: { productId: { in: productIds } }
        });

        await tx.productImage.deleteMany({
          where: { productId: { in: productIds } }
        });

        // Product削除
        const deletedProducts = await tx.product.deleteMany({
          where: { id: { in: productIds } }
        });

        if (deletedProducts.count > 0) {
          console.log(`✓ Product削除: ${deletedProducts.count}件`);
        }
      }

      // 6. DeliveryPlan関連
      const plans = await tx.deliveryPlan.findMany({
        where: { sellerId: demoUser.id },
        select: { id: true }
      });

      if (plans.length > 0) {
        const planIds = plans.map(p => p.id);

        // DeliveryPlanProduct関連削除
        const planProducts = await tx.deliveryPlanProduct.findMany({
          where: { deliveryPlanId: { in: planIds } },
          select: { id: true }
        });

        if (planProducts.length > 0) {
          const ppIds = planProducts.map(pp => pp.id);

          await tx.deliveryPlanProductImage.deleteMany({
            where: { deliveryPlanProductId: { in: ppIds } }
          });

          await tx.inspectionChecklist.deleteMany({
            where: { deliveryPlanProductId: { in: ppIds } }
          });
        }

        await tx.deliveryPlanProduct.deleteMany({
          where: { deliveryPlanId: { in: planIds } }
        });

        const deletedPlans = await tx.deliveryPlan.deleteMany({
          where: { id: { in: planIds } }
        });

        if (deletedPlans.count > 0) {
          console.log(`✓ DeliveryPlan削除: ${deletedPlans.count}件`);
        }
      }

      // 7. 最後にユーザー削除
      await tx.user.delete({
        where: { id: demoUser.id }
      });
      console.log(`✓ デモユーザー削除完了`);
    });

    console.log('\n✅ すべてのデモデータが削除されました！');

    // 最終統計
    const finalStats = await prisma.$transaction([
      prisma.user.count(),
      prisma.product.count(),
      prisma.deliveryPlan.count(),
      prisma.order.count()
    ]);

    console.log('\n📊 最終データベース状態:');
    console.log(`   ユーザー: ${finalStats[0]}件`);
    console.log(`   商品: ${finalStats[1]}件`);
    console.log(`   納品プラン: ${finalStats[2]}件`);
    console.log(`   注文: ${finalStats[3]}件`);

    console.log('\n✅ 処理完了: ユーザーデータは保護されています');

  } catch (error) {
    console.error('❌ エラー:', error.message);
    console.log('データベースは変更されていません');
  } finally {
    await prisma.$disconnect();
  }
}

completeDeleteDemoData();