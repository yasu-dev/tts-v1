const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserDependencies() {
  try {
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo-seller@example.com' }
    });

    if (!demoUser) {
      console.log('デモユーザーは既に削除されています。');
      return;
    }

    console.log('デモユーザーID:', demoUser.id);
    console.log('\n依存関係を確認中...\n');

    // Activityテーブルをチェック
    const activities = await prisma.activity.count({
      where: { userId: demoUser.id }
    });
    console.log(`Activity: ${activities}件`);

    // Taskテーブルをチェック
    const tasksAssigned = await prisma.task.count({
      where: { assignedTo: demoUser.id }
    });
    const tasksCreated = await prisma.task.count({
      where: { createdBy: demoUser.id }
    });
    console.log(`Task (assignedTo): ${tasksAssigned}件`);
    console.log(`Task (createdBy): ${tasksCreated}件`);

    // Orderテーブルをチェック（customerIdとして）
    const orders = await prisma.order.count({
      where: { customerId: demoUser.id }
    });
    console.log(`Order (customer): ${orders}件`);

    // VideoRecordテーブルをチェック
    const videos = await prisma.videoRecord.count({
      where: { uploadedBy: demoUser.id }
    });
    console.log(`VideoRecord: ${videos}件`);

    console.log('\n削除する必要がある依存データ:');
    const total = activities + tasksAssigned + tasksCreated + orders + videos;
    console.log(`合計: ${total}件`);

  } catch (error) {
    console.error('エラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserDependencies();