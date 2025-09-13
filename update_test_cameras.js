const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTestCameraStatus() {
  // TESTカメラEとGのステータスをorderedに変更
  const result = await prisma.product.updateMany({
    where: {
      id: {
        in: ['cmfhu4fwj001k5sy7u0d3wnbw', 'cmfhu4fwq001o5sy7ck76prq2']
      }
    },
    data: {
      status: 'ordered'
    }
  });

  console.log(`✅ ${result.count}個の商品ステータスをorderedに更新`);

  // 確認
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: ['cmfhu4fwj001k5sy7u0d3wnbw', 'cmfhu4fwq001o5sy7ck76prq2']
      }
    }
  });

  products.forEach(p => {
    console.log(`- ${p.name}: ${p.status}`);
  });

  await prisma.$disconnect();
}

updateTestCameraStatus().catch(console.error);