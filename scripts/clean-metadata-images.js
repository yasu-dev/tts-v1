const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function cleanMetadataImages() {
  console.log('🔍 メタデータ内の破損画像をクリーンアップ中...');
  
  try {
    const products = await prisma.product.findMany();
    let updatedProducts = 0;
    let totalRemovedPhotos = 0;
    
    for (const product of products) {
      if (product.metadata) {
        let metadata;
        try {
          metadata = typeof product.metadata === 'string' 
            ? JSON.parse(product.metadata) 
            : product.metadata;
        } catch (e) {
          console.log(`⚠️ ${product.name}: メタデータ解析エラー`);
          continue;
        }
        
        let hasChanges = false;
        
        // photos配列をクリーンアップ
        if (metadata.photos && Array.isArray(metadata.photos)) {
          const originalCount = metadata.photos.length;
          const validPhotos = [];
          
          for (const photo of metadata.photos) {
            // Base64データの画像は保持
            if (photo.dataUrl && photo.dataUrl.startsWith('data:image/')) {
              validPhotos.push(photo);
              continue;
            }
            
            // ファイルパスの画像をチェック
            if (photo.url && photo.url.startsWith('/api/images/')) {
              const relativePath = photo.url.replace('/api/images/', '');
              const fullPath = path.join(process.cwd(), 'uploads', relativePath);
              
              try {
                await fs.access(fullPath);
                validPhotos.push(photo);
                console.log(`✅ 保持: ${product.name} - ${photo.filename || 'unnamed'}`);
              } catch (error) {
                console.log(`❌ 削除: ${product.name} - ${photo.filename || 'unnamed'}`);
                totalRemovedPhotos++;
              }
            } else {
              // その他のURLは保持（外部URL等）
              validPhotos.push(photo);
            }
          }
          
          if (validPhotos.length !== originalCount) {
            metadata.photos = validPhotos;
            hasChanges = true;
            console.log(`📝 ${product.name}: photos配列を${originalCount}個から${validPhotos.length}個に更新`);
          }
        }
        
        if (hasChanges) {
          await prisma.product.update({
            where: { id: product.id },
            data: { metadata: JSON.stringify(metadata) }
          });
          updatedProducts++;
        }
      }
    }
    
    console.log(`\n📊 メタデータクリーンアップ結果:`);
    console.log(`- 更新した商品: ${updatedProducts}個`);
    console.log(`- 削除した破損写真: ${totalRemovedPhotos}個`);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
if (require.main === module) {
  cleanMetadataImages();
}

module.exports = { cleanMetadataImages };
