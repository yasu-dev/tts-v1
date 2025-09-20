const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCamera28() {
  try {
    console.log('🔍 DEMOカメラ２８の検品備考を確認中...');

    const camera28 = await prisma.product.findMany({
      where: {
        name: {
          contains: 'DEMOカメラ２８'
        }
      },
      select: {
        id: true,
        name: true,
        inspectionNotes: true
      }
    });

    console.log(`\n📊 DEMOカメラ２８の検索結果: ${camera28.length}件`);

    if (camera28.length > 0) {
      camera28.forEach((product, index) => {
        console.log(`\n${index + 1}. 商品ID: ${product.id}`);
        console.log(`   商品名: ${product.name}`);
        console.log(`   検品備考: "${product.inspectionNotes || 'null'}"`);

        if (product.inspectionNotes && product.inspectionNotes.includes('★')) {
          console.log('   🌟 ★テキストが含まれています！');
        } else {
          console.log('   ❌ ★テキストが含まれていません または 検品備考なし');
        }
      });
    } else {
      console.log('\n❌ DEMOカメラ２８が見つかりませんでした');
    }

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCamera28();