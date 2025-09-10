const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugImageIssue() {
  try {
    // 商品ABCを詳しく確認
    const product = await prisma.product.findFirst({
      where: { name: { contains: 'ABC' } }
    });
    
    if (!product) {
      console.log('商品ABCが見つかりません');
      return;
    }
    
    console.log('=== 商品ABC画像調査 ===');
    console.log(`商品名: ${product.name}`);
    console.log(`商品ID: ${product.id}`);
    console.log(`ステータス: ${product.status}`);
    
    if (product.metadata) {
      try {
        const metadata = JSON.parse(product.metadata);
        console.log('\n=== メタデータ解析 ===');
        console.log(`メタデータキー:`, Object.keys(metadata));
        
        if (metadata.photos) {
          console.log(`\n=== 画像データ ===`);
          console.log(`画像数: ${metadata.photos.length}`);
          
          metadata.photos.forEach((photo, index) => {
            console.log(`\n画像 ${index + 1}:`);
            if (typeof photo === 'string') {
              const isBase64 = photo.startsWith('data:image/');
              const isApiPath = photo.startsWith('/api/images/');
              const length = photo.length;
              
              console.log(`  タイプ: ${isBase64 ? 'Base64' : isApiPath ? 'API Path' : '不明'}`);
              console.log(`  データ長: ${length}`);
              console.log(`  プレビュー: ${photo.substring(0, 100)}...`);
              
              if (isBase64) {
                // Base64の形式を詳しく調べる
                const parts = photo.split(',');
                if (parts.length === 2) {
                  console.log(`  MIMEタイプ: ${parts[0]}`);
                  console.log(`  Base64データ長: ${parts[1].length}`);
                  console.log(`  Base64先頭: ${parts[1].substring(0, 50)}...`);
                }
              }
            } else {
              console.log(`  タイプ: オブジェクト`);
              console.log(`  キー: ${Object.keys(photo)}`);
            }
          });
        } else {
          console.log('メタデータに photos がありません');
        }
        
        if (metadata.photoSlots) {
          console.log(`\n=== PhotoSlots ===`);
          console.log(`PhotoSlots数: ${metadata.photoSlots.length}`);
          metadata.photoSlots.forEach((slot, index) => {
            console.log(`  スロット ${index + 1}: ${slot.id} (${slot.label})`);
            if (slot.photos) {
              console.log(`    画像数: ${slot.photos.length}`);
              slot.photos.forEach((photo, photoIndex) => {
                console.log(`      画像${photoIndex + 1}: ${photo.substring(0, 50)}...`);
              });
            }
          });
        }
        
      } catch (e) {
        console.log('メタデータ解析エラー:', e.message);
        console.log('生メタデータ:', product.metadata.substring(0, 500));
      }
    } else {
      console.log('メタデータが存在しません');
    }
    
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugImageIssue();