const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// eBayスタイルの商品名マッピング
const productNameMapping = {
  // カメラ関連
  'Sony α7 IV ボディ': 'Sony Alpha a7 IV Full Frame Mirrorless Camera Body - Excellent Condition',
  'Sony α7 II ボディ': 'Sony Alpha a7 II Full Frame Mirrorless Camera Body - Professional Grade',
  'Canon EOS R6 Mark II ボディ': 'Canon EOS R6 Mark II Full Frame Mirrorless Camera Body - Mint Condition',
  'Canon EOS R5 ボディ': 'Canon EOS R5 Full Frame Mirrorless Camera Body - Excellent Condition',
  'Canon EOS R ボディ': 'Canon EOS R Full Frame Mirrorless Camera Body - Very Good',
  'Nikon Z9': 'Nikon Z9 Full Frame Mirrorless Camera Body - Professional Edition',
  'Nikon Z7 II': 'Nikon Z7 II Full Frame Mirrorless Camera Body - High Resolution',
  'Nikon Z6 III': 'Nikon Z6 III Full Frame Mirrorless Camera Body - Video Specialist',
  'Fujifilm X-T5': 'Fujifilm X-T5 APS-C Mirrorless Camera Body - Latest Model',
  'Fujifilm X-H2S': 'Fujifilm X-H2S APS-C Mirrorless Camera Body - Speed Focused',
  'Sony α7R V': 'Sony Alpha a7R V Full Frame Mirrorless Camera - 61MP High Resolution',
  'Canon EOS R7': 'Canon EOS R7 APS-C Mirrorless Camera Body - Wildlife Photography',
  
  // レンズ関連
  'Canon RF 24-70mm F2.8L IS USM': 'Canon RF 24-70mm f/2.8L IS USM Lens - Professional Standard Zoom',
  'Sony FE 24-70mm F2.8 GM': 'Sony FE 24-70mm f/2.8 GM Full Frame Lens - G Master Series',
  'Nikon Z 24-70mm f/2.8 S': 'Nikon NIKKOR Z 24-70mm f/2.8 S Lens - S-Line Professional',
  'Canon RF 70-200mm F2.8L IS USM': 'Canon RF 70-200mm f/2.8L IS USM Telephoto Lens - Professional',
  'Sony FE 85mm F1.4 GM': 'Sony FE 85mm f/1.4 GM Portrait Lens - G Master Prime',
  'Canon RF 50mm F1.2L USM': 'Canon RF 50mm f/1.2L USM Standard Prime Lens - Luxury',
  
  // 時計関連  
  'Rolex Submariner': 'Rolex Submariner Date 41mm Stainless Steel - Mint Condition',
  'TAG Heuer Carrera': 'TAG Heuer Carrera Calibre 16 Chronograph - Steel & Rose Gold',
  'IWC Portugieser': 'IWC Portugieser Automatic 40mm Stainless Steel - Blue Dial',
  'Longines Master Collection': 'Longines Master Collection Automatic - Classic Elegance',
  'Omega Speedmaster': 'Omega Speedmaster Professional Moonwatch - Manual Wind',
  'Seiko Prospex': 'Seiko Prospex Solar Diver Watch - Automatic Movement',
  'Casio G-Shock': 'Casio G-Shock Solar Watch - Military Style Tactical',
  'Citizen Eco-Drive': 'Citizen Eco-Drive Chronograph - Titanium Case Sport'
};

async function updateProductNames() {
  console.log('🔄 商品名をeBayスタイルに更新開始...');
  
  try {
    // 現在の商品データを取得
    const products = await prisma.product.findMany({
      select: { id: true, name: true, sku: true }
    });
    
    console.log(`📦 取得した商品数: ${products.length}`);
    
    let updateCount = 0;
    let skipCount = 0;
    
    for (const product of products) {
      const currentName = product.name;
      const newName = productNameMapping[currentName];
      
      if (newName && newName !== currentName) {
        try {
          await prisma.product.update({
            where: { id: product.id },
            data: { name: newName }
          });
          
          console.log(`✅ 更新: ${product.sku}`);
          console.log(`   旧: ${currentName}`);
          console.log(`   新: ${newName}`);
          console.log('   ---');
          
          updateCount++;
        } catch (error) {
          console.error(`❌ 更新エラー (${product.sku}):`, error.message);
        }
      } else if (!newName) {
        console.log(`⏭️  スキップ: ${currentName} (マッピングなし)`);
        skipCount++;
      } else {
        console.log(`✓ 変更不要: ${currentName}`);
        skipCount++;
      }
    }
    
    console.log('\n🎉 商品名更新完了！');
    console.log(`✅ 更新された商品: ${updateCount}件`);
    console.log(`⏭️  スキップされた商品: ${skipCount}件`);
    console.log(`📊 総商品数: ${products.length}件`);
    
    // 更新結果を確認
    console.log('\n📋 更新後の商品名確認（先頭5件）:');
    const updatedProducts = await prisma.product.findMany({
      take: 5,
      select: { name: true, sku: true },
      orderBy: { updatedAt: 'desc' }
    });
    
    updatedProducts.forEach((product, index) => {
      console.log(`${index + 1}. [${product.sku}] ${product.name}`);
    });
    
    return { updateCount, skipCount, totalCount: products.length };
    
  } catch (error) {
    console.error('💥 商品名更新中にエラーが発生:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
updateProductNames()
  .then((result) => {
    console.log(`\n✨ すべての処理が完了しました！`);
    console.log(`Sales APIで正しいeBayスタイルの商品名が表示されるはずです。`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 処理中にエラーが発生しました:', error);
    process.exit(1);
  });

