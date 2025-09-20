const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkInspectionNotes() {
  try {
    console.log('🔍 検品備考データを確認中...');

    // inspectionNotesが存在する商品を検索
    const products = await prisma.product.findMany({
      where: {
        inspectionNotes: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        inspectionNotes: true
      }
    });

    console.log(`\n📊 検品備考のある商品数: ${products.length}`);

    if (products.length > 0) {
      console.log('\n=== 検品備考データ詳細 ===');
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. 商品ID: ${product.id}`);
        console.log(`   商品名: ${product.name}`);
        console.log(`   検品備考: "${product.inspectionNotes}"`);

        if (product.inspectionNotes && product.inspectionNotes.includes('★')) {
          console.log('   🌟 ★テキストが含まれています！');
        } else {
          console.log('   ❌ ★テキストが含まれていません');
        }
      });
    } else {
      console.log('\n❌ 検品備考のある商品が見つかりませんでした');

      // DEMOカメラ商品を確認
      const demoProducts = await prisma.product.findMany({
        where: {
          name: {
            contains: 'DEMO'
          }
        },
        select: {
          id: true,
          name: true,
          inspectionNotes: true
        }
      });

      console.log(`\n📊 DEMO商品数: ${demoProducts.length}`);
      if (demoProducts.length > 0) {
        console.log('\n=== DEMO商品詳細 ===');
        demoProducts.forEach((product, index) => {
          console.log(`\n${index + 1}. 商品ID: ${product.id}`);
          console.log(`   商品名: ${product.name}`);
          console.log(`   検品備考: "${product.inspectionNotes || 'null'}"`);
        });
      }
    }

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInspectionNotes();