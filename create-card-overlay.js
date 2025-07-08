const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createCardOverlay() {
  const testResultsDir = 'test-results/all-22-screens-verification';
  
  console.log('🎨 白いカードの横幅統一検証用重ね合わせ画像を作成中...\n');

  // 全画面のスクリーンショットファイルを取得
  const screenshotFiles = fs.readdirSync(testResultsDir)
    .filter(file => file.endsWith('-fullscreen.png'))
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

  // 白いカード部分のマスクを作成（コンテンツエリアのみ）
  const cardMask = `
    <svg width="${width}" height="${height}">
      <defs>
        <mask id="cardMask">
          <rect width="${width}" height="${height}" fill="black"/>
          <!-- 白いカードエリア（左右マージン除く） -->
          <rect x="32" y="100" width="${width - 64}" height="${height - 200}" fill="white"/>
        </mask>
      </defs>
      <rect width="${width}" height="${height}" fill="white" mask="url(#cardMask)"/>
    </svg>
  `;

  // 全画像を重ね合わせ（白いカード部分のみ）
  console.log('\n🔄 白いカード重ね合わせ処理開始...');
  
  // 透明なベース画像を作成
  let composite = sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    }
  });

  // 各画像の白いカード部分を重ね合わせ
  const compositeInputs = [];
  for (let i = 0; i < screenshotFiles.length; i++) {
    const imagePath = path.join(testResultsDir, screenshotFiles[i]);
    
    // 各画像の白いカード部分のみを抽出
    const processedImage = await sharp(imagePath)
      .composite([
        {
          input: Buffer.from(cardMask),
          blend: 'dest-in'
        }
      ])
      .modulate({ brightness: 0.4 })
      .png({ quality: 80 })
      .toBuffer();
    
    compositeInputs.push({
      input: processedImage,
      blend: 'overlay',
      opacity: 0.2
    });
    
    console.log(`  ✅ ${screenshotFiles[i]} の白いカード部分を追加`);
  }

  // 重ね合わせ実行
  const overlayResult = await composite
    .composite(compositeInputs)
    .png({ quality: 90 })
    .toFile(path.join(testResultsDir, 'WHITE-CARD-OVERLAY.png'));

  console.log(`\n🎉 白いカード重ね合わせ完了: WHITE-CARD-OVERLAY.png`);
  console.log(`   サイズ: ${overlayResult.width}px × ${overlayResult.height}px`);
  console.log(`   ファイルサイズ: ${(overlayResult.size / 1024 / 1024).toFixed(2)}MB`);

  // 横幅統一ガイドライン付きバージョンも作成
  console.log('\n🔄 横幅統一ガイドライン付きバージョンを作成中...');
  
  const guidelineOverlay = `
    <svg width="${width}" height="${height}">
      <!-- 白いカードの理想的な横幅ガイドライン -->
      <line x1="32" y1="0" x2="32" y2="${height}" stroke="#00ff00" stroke-width="3" opacity="0.8"/>
      <line x1="${width - 32}" y1="0" x2="${width - 32}" y2="${height}" stroke="#00ff00" stroke-width="3" opacity="0.8"/>
      
      <!-- 白いカードエリアの境界 -->
      <rect x="32" y="100" width="${width - 64}" height="${height - 200}" 
            fill="none" stroke="#ff0000" stroke-width="2" opacity="0.6" stroke-dasharray="5,5"/>
      
      <!-- 中央線 -->
      <line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="#0000ff" stroke-width="1" opacity="0.4"/>
      
      <!-- ラベル -->
      <text x="40" y="30" fill="#00ff00" font-size="16" font-weight="bold">白いカード統一幅</text>
      <text x="${width - 200}" y="30" fill="#00ff00" font-size="16" font-weight="bold">統一幅</text>
      <text x="40" y="120" fill="#ff0000" font-size="14">Card Area</text>
      <text x="${width / 2 - 50}" y="30" fill="#0000ff" font-size="12">Center</text>
    </svg>
  `;

  const withGuidelines = await sharp(path.join(testResultsDir, 'WHITE-CARD-OVERLAY.png'))
    .composite([
      {
        input: Buffer.from(guidelineOverlay),
        top: 0,
        left: 0
      }
    ])
    .png({ quality: 90 })
    .toFile(path.join(testResultsDir, 'WHITE-CARD-OVERLAY-WITH-GUIDELINES.png'));

  console.log(`🎉 ガイドライン付き完了: WHITE-CARD-OVERLAY-WITH-GUIDELINES.png`);
  console.log(`   サイズ: ${withGuidelines.width}px × ${withGuidelines.height}px`);
  console.log(`   ファイルサイズ: ${(withGuidelines.size / 1024 / 1024).toFixed(2)}MB`);

  console.log('\n✅ 白いカード横幅統一検証用重ね合わせ画像作成完了！');
  console.log('🔍 この画像で白いカードの横幅統一状況を確認できます');
}

createCardOverlay().catch(console.error); 