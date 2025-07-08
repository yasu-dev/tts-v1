const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createFixedWidthVerification() {
  const testResultsDir = 'test-results/all-22-screens-verification';
  
  // 修正後の画像ディレクトリを作成
  const fixedDir = 'test-results/fixed-width-verification';
  if (!fs.existsSync(fixedDir)) {
    fs.mkdirSync(fixedDir, { recursive: true });
  }

  console.log('🔧 修正後の横幅統一検証を開始...\n');

  // 全画面のスクリーンショットファイルを取得
  const screenshotFiles = fs.readdirSync(testResultsDir)
    .filter(file => file.endsWith('-fullscreen.png'))
    .sort();

  console.log(`📱 発見された画面数: ${screenshotFiles.length}画面`);
  screenshotFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });

  // 各画面の幅を測定
  console.log('\n📏 各画面の幅測定:');
  const measurements = [];
  
  for (const file of screenshotFiles) {
    const filePath = path.join(testResultsDir, file);
    const metadata = await sharp(filePath).metadata();
    measurements.push({
      filename: file,
      width: metadata.width,
      height: metadata.height
    });
    console.log(`  ${file}: ${metadata.width}x${metadata.height}px`);
  }

  // 幅の統一性チェック
  const widths = measurements.map(m => m.width);
  const uniqueWidths = [...new Set(widths)];
  
  console.log(`\n📊 幅の統一性分析:`);
  console.log(`  異なる幅の種類: ${uniqueWidths.length}種類`);
  console.log(`  幅のバリエーション: ${uniqueWidths.join('px, ')}px`);
  
  if (uniqueWidths.length === 1) {
    console.log('  ✅ 全画面の幅が完璧に統一されています！');
  } else {
    console.log('  ❌ 画面間で幅に違いがあります');
  }

  // 重ね合わせ画像を生成
  console.log('\n🎨 重ね合わせ画像生成中...');
  
  if (screenshotFiles.length > 0) {
    const firstImagePath = path.join(testResultsDir, screenshotFiles[0]);
    const firstImage = await sharp(firstImagePath);
    const { width, height } = await firstImage.metadata();
    
    // 背景画像を作成
    let composite = sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    });

    // 全画像を重ね合わせ
    const overlayImages = [];
    for (let i = 0; i < screenshotFiles.length; i++) {
      const imagePath = path.join(testResultsDir, screenshotFiles[i]);
      const opacity = 0.05; // 透明度を調整
      
      overlayImages.push({
        input: await sharp(imagePath)
          .png({ palette: true, quality: 50 })
          .toBuffer(),
        top: 0,
        left: 0,
        blend: 'over'
      });
    }

    // 重ね合わせ画像を保存
    const overlayOutputPath = path.join(fixedDir, 'FIXED-WIDTH-OVERLAY-ALL-SCREENS.png');
    await composite
      .composite(overlayImages)
      .png({ quality: 90 })
      .toFile(overlayOutputPath);
    
    console.log(`  ✅ 重ね合わせ画像保存: ${overlayOutputPath}`);

    // ガイドライン付き重ね合わせ画像も生成
    const guidelineOverlay = await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([
      // 左端ガイドライン
      {
        input: Buffer.from(`<svg width="${width}" height="${height}">
          <line x1="32" y1="0" x2="32" y2="${height}" stroke="red" stroke-width="2" opacity="0.8"/>
          <text x="35" y="30" fill="red" font-size="16" font-weight="bold">LEFT: 32px</text>
        </svg>`),
        top: 0,
        left: 0
      },
      // 右端ガイドライン
      {
        input: Buffer.from(`<svg width="${width}" height="${height}">
          <line x1="${width - 32}" y1="0" x2="${width - 32}" y2="${height}" stroke="red" stroke-width="2" opacity="0.8"/>
          <text x="${width - 150}" y="30" fill="red" font-size="16" font-weight="bold">RIGHT: 32px</text>
        </svg>`),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toBuffer();

    const guidelineOutputPath = path.join(fixedDir, 'FIXED-WIDTH-WITH-GUIDELINES.png');
    await sharp(overlayOutputPath)
      .composite([{
        input: guidelineOverlay,
        top: 0,
        left: 0
      }])
      .png({ quality: 90 })
      .toFile(guidelineOutputPath);
    
    console.log(`  ✅ ガイドライン付き画像保存: ${guidelineOutputPath}`);
  }

  // 個別画面を修正後ディレクトリにコピー
  console.log('\n📋 個別画面をコピー中...');
  for (const file of screenshotFiles) {
    const sourcePath = path.join(testResultsDir, file);
    const destPath = path.join(fixedDir, file);
    fs.copyFileSync(sourcePath, destPath);
    console.log(`  ✅ ${file} をコピー完了`);
  }

  // 詳細レポートを生成
  const reportPath = path.join(fixedDir, 'FIXED-WIDTH-REPORT.json');
  const report = {
    timestamp: new Date().toISOString(),
    totalScreens: screenshotFiles.length,
    widthUnification: {
      isUnified: uniqueWidths.length === 1,
      uniqueWidths: uniqueWidths,
      widthVariations: uniqueWidths.length
    },
    measurements: measurements,
    files: {
      overlay: 'FIXED-WIDTH-OVERLAY-ALL-SCREENS.png',
      guidelines: 'FIXED-WIDTH-WITH-GUIDELINES.png',
      screenshots: screenshotFiles
    }
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 詳細レポート保存: ${reportPath}`);

  console.log('\n🎉 修正後横幅統一検証完了！');
  console.log(`📁 結果ディレクトリ: ${fixedDir}`);
  
  return fixedDir;
}

createFixedWidthVerification().catch(console.error); 