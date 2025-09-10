const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugShipment() {
  try {
    // Product "ABC" を探す
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'ABC' } },
          { name: { contains: 'ああ' } }
        ]
      }
    });
    
    console.log(`📦 ABC関連商品 (${products.length}件):`);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\n  ${i + 1}. Name: ${product.name}`);
      console.log(`     ID: ${product.id}`);
      console.log(`     Status: ${product.status}`);
      
      // このproductのShipmentレコードを確認
      const shipments = await prisma.shipment.findMany({
        where: { productId: product.id },
        orderBy: { updatedAt: 'desc' }
      });
      
      console.log(`     Shipments: ${shipments.length}件`);
      shipments.forEach((shipment, j) => {
        console.log(`       ${j + 1}. Status: ${shipment.status}`);
        console.log(`          ID: ${shipment.id}`);
        console.log(`          Updated: ${shipment.updatedAt.toISOString()}`);
        console.log(`          Notes: ${shipment.notes || 'なし'}`);
      });
      
      // PickingTaskレコードも確認
      const pickingTasks = await prisma.pickingTask.findMany({
        where: { productId: product.id },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`     PickingTasks: ${pickingTasks.length}件`);
      pickingTasks.forEach((task, j) => {
        console.log(`       ${j + 1}. Status: ${task.status}`);
        console.log(`          ID: ${task.id}`);
        console.log(`          Location: ${task.locationCode}`);
        console.log(`          Created: ${task.createdAt.toISOString()}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugShipment();