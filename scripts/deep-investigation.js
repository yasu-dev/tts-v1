const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deepInvestigation() {
  try {
    console.log('=====================================');
    console.log('      根深いデモデータ調査開始');
    console.log('=====================================\n');

    // 1. 全ユーザーとその詳細を確認
    console.log('🔍 [1] 全ユーザー詳細調査');
    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    });

    console.log(`総ユーザー数: ${allUsers.length}件\n`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ユーザー詳細:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username || 'null'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });

    // 2. 全商品データを詳細に確認
    console.log('🔍 [2] 全商品データ詳細調査');
    const allProducts = await prisma.product.findMany({
      include: {
        seller: {
          select: { email: true, username: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`総商品数: ${allProducts.length}件\n`);
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. 商品詳細:`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Name: ${product.name}`);
      console.log(`   SellerID: ${product.sellerId}`);
      console.log(`   Seller: ${product.seller?.email} (${product.seller?.username})`);
      console.log(`   Status: ${product.status}`);
      console.log(`   Created: ${product.createdAt}`);
      console.log('');
    });

    // 3. 全DeliveryPlanを詳細に確認
    console.log('🔍 [3] 全納品プラン詳細調査');
    const allPlans = await prisma.deliveryPlan.findMany({
      orderBy: { createdAt: 'asc' }
    });

    console.log(`総納品プラン数: ${allPlans.length}件\n`);
    allPlans.slice(0, 10).forEach((plan, index) => {
      console.log(`${index + 1}. 納品プラン詳細:`);
      console.log(`   ID: ${plan.id}`);
      console.log(`   SellerID: ${plan.sellerId}`);
      console.log(`   SellerName: ${plan.sellerName}`);
      console.log(`   Status: ${plan.status}`);
      console.log(`   Created: ${plan.createdAt}`);
      console.log('');
    });

    if (allPlans.length > 10) {
      console.log(`... 他${allPlans.length - 10}件省略\n`);
    }

    // 4. マスターデータの詳細確認
    console.log('🔍 [4] マスターデータ詳細調査');

    // Carrier
    const carriers = await prisma.carrier.findMany();
    console.log(`Carrier: ${carriers.length}件`);
    carriers.forEach(c => {
      console.log(`   - ${c.key}: ${c.nameJa} (${c.name})`);
    });

    // Location
    const locations = await prisma.location.findMany();
    console.log(`\nLocation: ${locations.length}件`);
    locations.forEach(l => {
      console.log(`   - ${l.code}: ${l.name} (容量: ${l.capacity})`);
    });

    // SystemSetting
    const settings = await prisma.systemSetting.findMany();
    console.log(`\nSystemSetting: ${settings.length}件`);
    settings.forEach(s => {
      console.log(`   - ${s.key}: ${s.category}`);
      if (s.value && s.value.length < 100) {
        console.log(`     Value: ${s.value}`);
      } else if (s.value) {
        console.log(`     Value: ${s.value.substring(0, 100)}...`);
      }
    });

    // 5. 疑わしいデータパターンを検索
    console.log('\n🔍 [5] 疑わしいデータパターン検索');

    // "demo"が含まれる商品名
    const demoProducts = await prisma.product.findMany({
      where: {
        name: {
          contains: 'demo',
          mode: 'insensitive'
        }
      },
      include: {
        seller: { select: { email: true } }
      }
    });

    console.log(`"demo"を含む商品: ${demoProducts.length}件`);
    demoProducts.forEach(p => {
      console.log(`   - ${p.name} (Seller: ${p.seller?.email})`);
    });

    // "test"が含まれる商品名
    const testProducts = await prisma.product.findMany({
      where: {
        name: {
          contains: 'test',
          mode: 'insensitive'
        }
      },
      include: {
        seller: { select: { email: true } }
      }
    });

    console.log(`\n"test"を含む商品: ${testProducts.length}件`);
    testProducts.forEach(p => {
      console.log(`   - ${p.name} (Seller: ${p.seller?.email})`);
    });

    // "sample"が含まれる商品名
    const sampleProducts = await prisma.product.findMany({
      where: {
        name: {
          contains: 'sample',
          mode: 'insensitive'
        }
      },
      include: {
        seller: { select: { email: true } }
      }
    });

    console.log(`\n"sample"を含む商品: ${sampleProducts.length}件`);
    sampleProducts.forEach(p => {
      console.log(`   - ${p.name} (Seller: ${p.seller?.email})`);
    });

    // 6. 他のテーブルも確認
    console.log('\n🔍 [6] その他のテーブル確認');

    const orderCount = await prisma.order.count();
    const listingCount = await prisma.listing.count();
    const shipmentCount = await prisma.shipment.count();
    const taskCount = await prisma.task.count();
    const activityCount = await prisma.activity.count();

    console.log(`Order: ${orderCount}件`);
    console.log(`Listing: ${listingCount}件`);
    console.log(`Shipment: ${shipmentCount}件`);
    console.log(`Task: ${taskCount}件`);
    console.log(`Activity: ${activityCount}件`);

    // 7. 最近作成されたデータを確認
    console.log('\n🔍 [7] 最近作成されたデータ確認');

    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { email: true, username: true } }
      }
    });

    console.log('最新商品5件:');
    recentProducts.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name}`);
      console.log(`   Seller: ${p.seller?.email}`);
      console.log(`   Created: ${p.createdAt}`);
      console.log(`   Status: ${p.status}`);
    });

    console.log('\n=====================================');
    console.log('         調査完了');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ 調査エラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deepInvestigation();