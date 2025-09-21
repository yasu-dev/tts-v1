const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function cleanupBrokenImageUrls() {
  console.log('🔍 破損した画像URLをクリーンアップ中...');
  
  try {
    // データベースから全ての商品画像を取得
    const images = await prisma.productImage.findMany();
    
    let removedCount = 0;
    let keptCount = 0;
    
    for (const image of images) {
      if (image.url && image.url.startsWith('/api/images/')) {
        // ファイルパスを構築
        const relativePath = image.url.replace('/api/images/', '');
        const fullPath = path.join(process.cwd(), 'uploads', relativePath);
        
        try {
          // ファイルが存在するかチェック
          await fs.access(fullPath);
          console.log(`✅ 保持: ${image.filename}`);
          keptCount++;
        } catch (error) {
          console.log(`❌ 削除: ${image.filename} (ファイルが存在しない)`);
          
          // 破損した画像レコードを削除
          await prisma.productImage.delete({
            where: { id: image.id }
          });
          removedCount++;
        }
      } else if (image.url && image.url.startsWith('data:image/')) {
        console.log(`✅ 保持: ${image.filename} (Base64データ)`);
        keptCount++;
      } else {
        console.log(`⚠️ 不明なURL形式: ${image.url}`);
        keptCount++;
      }
    }
    
    console.log(`\n📊 クリーンアップ結果:`);
    console.log(`- 削除した破損画像: ${removedCount}個`);
    console.log(`- 保持した正常画像: ${keptCount}個`);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
if (require.main === module) {
  cleanupBrokenImageUrls();
}

module.exports = { cleanupBrokenImageUrls };
