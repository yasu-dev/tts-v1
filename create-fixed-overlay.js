const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createFixedOverlay() {
  const testResultsDir = 'test-results';
  
  console.log('🎨 修正後の重ね合わせ画像を作成中...\n');

  // 全画面のスクリーンショットファイルを取得
  const screenshotFiles = fs.readdirSync(testResultsDir)
    .filter(file => file.startsWith('全画面表示--') && file.endsWith('.png'))
    .sort();

  console.log(`📱 発見された画面数: ${screenshotFiles.length}画面`);
  screenshotFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });

  if (screenshotFiles.length === 0) {
    console.log('❌ スクリーンショットが見つかりません');
    return;
  }

  // 最初の画像のサイズを取得
  const firstImagePath = path.join(testResultsDir, screenshotFiles[0]);
  const { width, height } = await sharp(firstImagePath).metadata();
  console.log(`\n📐 基準サイズ: ${width}px × ${height}px`);

  // 全画像を重ね合わせ
  console.log('\n🔄 重ね合わせ処理開始...');
  
  // 最初の画像を薄く設定
  let composite = sharp(firstImagePath)
    .modulate({ brightness: 0.3 }); // 暗く

  // 残りの画像を重ね合わせ
  const compositeInputs = [];
  for (let i = 1; i < screenshotFiles.length; i++) {
    const imagePath = path.join(testResultsDir, screenshotFiles[i]);
    
    // 各画像を薄く処理
    const processedImage = await sharp(imagePath)
      .modulate({ brightness: 0.3 })
      .png({ quality: 80 })
      .toBuffer();
    
    compositeInputs.push({
      input: processedImage,
      blend: 'overlay',
      opacity: 0.15
    });
    
    console.log(`  ✅ ${screenshotFiles[i]} を追加`);
  }

  // 重ね合わせ実行
  const overlayResult = await composite
    .composite(compositeInputs)
    .png({ quality: 90 })
    .toFile(path.join(testResultsDir, 'FIXED-OVERLAY-ALL-SCREENS.png'));

  console.log(`\n🎉 重ね合わせ完了: FIXED-OVERLAY-ALL-SCREENS.png`);
  console.log(`   サイズ: ${overlayResult.width}px × ${overlayResult.height}px`);
  console.log(`   ファイルサイズ: ${(overlayResult.size / 1024 / 1024).toFixed(2)}MB`);

  // ガイドライン付きバージョンも作成
  console.log('\n🔄 ガイドライン付きバージョンを作成中...');
  
  const svgOverlay = `
    <svg width="${width}" height="${height}">
      <!-- 左右32pxマージンライン -->
      <line x1="32" y1="0" x2="32" y2="${height}" stroke="#00ff00" stroke-width="2" opacity="0.8"/>
      <line x1="${width - 32}" y1="0" x2="${width - 32}" y2="${height}" stroke="#00ff00" stroke-width="2" opacity="0.8"/>
      
      <!-- コンテンツ幅ガイドライン -->
      <line x1="256" y1="0" x2="256" y2="${height}" stroke="#ff0000" stroke-width="1" opacity="0.6"/>
      <line x1="${width - 256}" y1="0" x2="${width - 256}" y2="${height}" stroke="#ff0000" stroke-width="1" opacity="0.6"/>
      
      <!-- 中央線 -->
      <line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="#0000ff" stroke-width="1" opacity="0.4"/>
      
      <!-- ラベル -->
      <text x="40" y="30" fill="#00ff00" font-size="14" font-weight="bold">32px</text>
      <text x="${width - 80}" y="30" fill="#00ff00" font-size="14" font-weight="bold">32px</text>
      <text x="260" y="30" fill="#ff0000" font-size="12">Content Area</text>
    </svg>
  `;

  const withGuidelines = await sharp(path.join(testResultsDir, 'FIXED-OVERLAY-ALL-SCREENS.png'))
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0
      }
    ])
    .png({ quality: 90 })
    .toFile(path.join(testResultsDir, 'FIXED-OVERLAY-WITH-GUIDELINES.png'));

  console.log(`🎉 ガイドライン付き完了: FIXED-OVERLAY-WITH-GUIDELINES.png`);
  console.log(`   サイズ: ${withGuidelines.width}px × ${withGuidelines.height}px`);
  console.log(`   ファイルサイズ: ${(withGuidelines.size / 1024 / 1024).toFixed(2)}MB`);

  console.log('\n✅ 修正後の重ね合わせ画像作成完了！');
}

createFixedOverlay().catch(console.error); 