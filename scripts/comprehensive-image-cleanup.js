const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function comprehensiveImageCleanup() {
  console.log('🔍 包括的な画像クリーンアップを実行中...');
  
  try {
    // 1. ProductImageテーブルのクリーンアップ
    console.log('\n1️⃣ ProductImageテーブルのクリーンアップ...');
    const images = await prisma.productImage.findMany();
    let removedImageRecords = 0;
    
    for (const image of images) {
      if (image.url && image.url.startsWith('/api/images/')) {
        const relativePath = image.url.replace('/api/images/', '');
        const fullPath = path.join(process.cwd(), 'uploads', relativePath);
        
        try {
          await fs.access(fullPath);
          console.log(`✅ 保持: ${image.filename}`);
        } catch (error) {
          console.log(`❌ 削除: ${image.filename}`);
          await prisma.productImage.delete({ where: { id: image.id } });
          removedImageRecords++;
        }
      }
    }
    
    // 2. Product.metadataの画像データクリーンアップ
    console.log('\n2️⃣ Product.metadataの画像データクリーンアップ...');
    const products = await prisma.product.findMany();
    let updatedProducts = 0;
    
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
          metadata.photos = metadata.photos.filter(photo => {
            // Base64データの画像は保持
            if (photo.dataUrl && photo.dataUrl.startsWith('data:image/')) {
              return true;
            }
            // ファイルパスの画像は削除
            if (photo.url && photo.url.startsWith('/api/images/')) {
              return false;
            }
            return true;
          });
          
          if (metadata.photos.length !== originalCount) {
            hasChanges = true;
            console.log(`📝 ${product.name}: photos配列を${originalCount}個から${metadata.photos.length}個に更新`);
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
    
    // 3. 結果表示
    console.log(`\n📊 包括的クリーンアップ結果:`);
    console.log(`- 削除したProductImageレコード: ${removedImageRecords}個`);
    console.log(`- 更新したProductメタデータ: ${updatedProducts}個`);
    
    // 4. 現在の状況確認
    console.log(`\n🔍 現在の画像状況:`);
    const remainingImages = await prisma.productImage.count();
    console.log(`- 残存ProductImageレコード: ${remainingImages}個`);
    
    const productsWithPhotos = await prisma.product.findMany({
      where: {
        metadata: {
          contains: 'photos'
        }
      }
    });
    
    let totalPhotosInMetadata = 0;
    for (const product of productsWithPhotos) {
      try {
        const metadata = typeof product.metadata === 'string' 
          ? JSON.parse(product.metadata) 
          : product.metadata;
        if (metadata.photos && Array.isArray(metadata.photos)) {
          totalPhotosInMetadata += metadata.photos.length;
        }
      } catch (e) {
        // メタデータ解析エラーは無視
      }
    }
    
    console.log(`- メタデータ内の写真: ${totalPhotosInMetadata}個`);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
if (require.main === module) {
  comprehensiveImageCleanup();
}

module.exports = { comprehensiveImageCleanup };
