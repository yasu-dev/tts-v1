const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({ log: ['query'] });

async function quickVerify() {
  try {
    const count = await prisma.product.count();
    console.log('商品総数:', count);
    
    const sample = await prisma.product.findMany({ 
      take: 3, 
      select: { name: true, sku: true, status: true } 
    });
    console.log('サンプルデータ:', sample);
  } finally {
    await prisma.$disconnect();
  }
}

quickVerify();
