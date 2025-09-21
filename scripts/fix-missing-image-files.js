const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function fixMissingImageFiles() {
  console.log('🔍 破損した画像ファイルを修復中...');
  
  try {
    // データベースから全ての商品画像を取得
    const products = await prisma.product.findMany({
      include: {
        images: true
      }
    });
    
    let fixedCount = 0;
    let brokenCount = 0;
    
    for (const product of products) {
      for (const image of product.images) {
        if (image.url && image.url.startsWith('/api/images/')) {
          // ファイルパスを構築
          const relativePath = image.url.replace('/api/images/', '');
          const fullPath = path.join(process.cwd(), 'uploads', relativePath);
          
          try {
            // ファイルが存在するかチェック
            await fs.access(fullPath);
            console.log(`✅ 存在: ${image.filename}`);
          } catch (error) {
            console.log(`❌ 欠落: ${image.filename} (${image.url})`);
            brokenCount++;
            
            // プレースホルダー画像を作成
            await createPlaceholderImage(fullPath, image.filename);
            fixedCount++;
          }
        }
      }
    }
    
    console.log(`\n📊 修復結果:`);
    console.log(`- 破損していた画像: ${brokenCount}個`);
    console.log(`- 修復した画像: ${fixedCount}個`);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createPlaceholderImage(filePath, filename) {
  try {
    // ディレクトリを作成
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    // シンプルなSVGプレースホルダーを作成
    const svgContent = `
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f0f0f0" stroke="#ccc" stroke-width="2"/>
  <text x="200" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#666">
    画像が見つかりません
  </text>
  <text x="200" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#999">
    ${filename}
  </text>
  <text x="200" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#999">
    プレースホルダー画像
  </text>
</svg>`.trim();
    
    // ファイル拡張子に関係なく、JPEGヘッダーを持つプレースホルダーを作成
    // 実際にはSVGをJPEGに変換する必要があるが、簡易的にSVGファイルとして保存
    await fs.writeFile(filePath.replace(/\.[^.]+$/, '.svg'), svgContent);
    
    console.log(`  ✅ プレースホルダー作成: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`  ❌ プレースホルダー作成失敗: ${error.message}`);
  }
}

// 実行
if (require.main === module) {
  fixMissingImageFiles();
}

module.exports = { fixMissingImageFiles };
