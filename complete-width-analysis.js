const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function completeWidthAnalysis() {
  const screenshotDir = 'test-results/fullscreen-width-verification';
  
  if (!fs.existsSync(screenshotDir)) {
    console.log(`❌ ディレクトリが見つかりません: ${screenshotDir}`);
    return;
  }
  
  const files = fs.readdirSync(screenshotDir).filter(f => f.endsWith('-fullscreen.png'));
  
  console.log(`\n🔍 === 全画面横幅統一完全分析 ===`);
  console.log(`📊 対象画面数: ${files.length}枚`);
  console.log(`📋 対象画面一覧:`);
  files.forEach((file, index) => {
    const screenName = file.replace('-fullscreen.png', '');
    console.log(`  ${index + 1}. ${screenName}`);
  });
  
  if (files.length === 0) {
    console.log('❌ スクリーンショットが見つかりません');
    return;
  }
  
  console.log(`\n📏 === 各画面の幅測定結果 ===`);
  
  // 各画像の幅を測定
  const widthMeasurements = [];
  for (const file of files) {
    const filePath = path.join(screenshotDir, file);
    const image = sharp(filePath);
    const metadata = await image.metadata();
    const screenName = file.replace('-fullscreen.png', '');
    
    widthMeasurements.push({
      screen: screenName,
      width: metadata.width,
      height: metadata.height,
      fileSize: fs.statSync(filePath).size
    });
    
    console.log(`📱 ${screenName}: ${metadata.width}px × ${metadata.height}px (${Math.round(fs.statSync(filePath).size / 1024)}KB)`);
  }
  
  // 幅の統一性チェック
  const uniqueWidths = [...new Set(widthMeasurements.map(m => m.width))];
  const uniqueHeights = [...new Set(widthMeasurements.map(m => m.height))];
  
  console.log(`\n📊 === 統一性分析結果 ===`);
  console.log(`🔢 異なる幅の種類: ${uniqueWidths.length}種類`);
  console.log(`📐 幅のバリエーション: ${uniqueWidths.join('px, ')}px`);
  console.log(`📏 異なる高さの種類: ${uniqueHeights.length}種類`);
  console.log(`📐 高さのバリエーション: ${uniqueHeights.join('px, ')}px`);
  
  if (uniqueWidths.length === 1 && uniqueHeights.length === 1) {
    console.log(`\n✅ 🎉 完璧！全${files.length}画面の横幅と縦幅が完全に統一されています！`);
    console.log(`📏 統一サイズ: ${uniqueWidths[0]}px × ${uniqueHeights[0]}px`);
  } else if (uniqueWidths.length === 1) {
    console.log(`\n✅ 横幅は統一されています: ${uniqueWidths[0]}px`);
    console.log(`⚠️ 高さに違いがあります`);
  } else {
    console.log(`\n❌ 画面間で幅に違いがあります`);
    
    // 異なる幅の画面を特定
    uniqueWidths.forEach(width => {
      const screensWithThisWidth = widthMeasurements.filter(m => m.width === width);
      console.log(`\n📐 幅 ${width}px の画面 (${screensWithThisWidth.length}画面):`);
      screensWithThisWidth.forEach(screen => {
        console.log(`  - ${screen.screen}`);
      });
    });
  }
  
  // 基準画像があるかチェック
  const dashboardImage = files.find(f => f.includes('dashboard'));
  if (!dashboardImage) {
    console.log('\n⚠️ 基準画像（dashboard）が見つかりません');
    return;
  }
  
  const baseImagePath = path.join(screenshotDir, dashboardImage);
  const baseImage = sharp(baseImagePath);
  const { width, height } = await baseImage.metadata();
  
  console.log(`\n🖼️ === 重ね合わせ画像生成 ===`);
  console.log(`📏 基準画像サイズ: ${width}px × ${height}px`);
  console.log(`📁 基準画像: ${dashboardImage}`);
  
  // 1. 全画像を重ね合わせた合成画像を作成
  console.log(`\n🔄 全${files.length}画面を重ね合わせ中...`);
  
  const overlayComposite = [];
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(screenshotDir, files[i]);
    overlayComposite.push({
      input: filePath,
      blend: 'multiply',
      opacity: 0.1  // 透明度を下げて重ね合わせを見やすく
    });
  }
  
  const overlayOutputPath = path.join(screenshotDir, 'FINAL-all-screens-overlay.png');
  await sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite(overlayComposite)
  .png()
  .toFile(overlayOutputPath);
  
  console.log(`✅ 全画面重ね合わせ画像生成完了: FINAL-all-screens-overlay.png`);
  
  // 2. 差分を強調した画像を作成
  console.log(`\n🔍 差分分析画像生成中...`);
  
  const differenceComposite = [];
  for (let i = 1; i < files.length; i++) {
    const filePath = path.join(screenshotDir, files[i]);
    differenceComposite.push({
      input: filePath,
      blend: 'difference',
      opacity: 0.5
    });
  }
  
  const differenceOutputPath = path.join(screenshotDir, 'FINAL-width-difference-analysis.png');
  await sharp(baseImagePath)
    .composite(differenceComposite)
    .png()
    .toFile(differenceOutputPath);
  
  console.log(`✅ 差分強調画像生成完了: FINAL-width-difference-analysis.png`);
  
  // 3. 横幅ガイドライン付きの画像を作成
  console.log(`\n📏 横幅ガイドライン画像生成中...`);
  
  const guidelineOverlay = Buffer.from(`
    <svg width="${width}" height="${height}">
      <defs>
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,0,0,0.2)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <line x1="0" y1="0" x2="0" y2="${height}" stroke="red" stroke-width="4" opacity="0.8"/>
      <line x1="${width}" y1="0" x2="${width}" y2="${height}" stroke="red" stroke-width="4" opacity="0.8"/>
      <rect x="10" y="10" width="300" height="80" fill="rgba(255,255,255,0.9)" stroke="red" stroke-width="2"/>
      <text x="25" y="35" fill="red" font-size="20" font-weight="bold">横幅: ${width}px</text>
      <text x="25" y="55" fill="red" font-size="16">画面数: ${files.length}枚</text>
      <text x="25" y="75" fill="red" font-size="16">統一性: ${uniqueWidths.length === 1 ? '✅ 統一' : '❌ 不統一'}</text>
    </svg>
  `);
  
  const guidelineOutputPath = path.join(screenshotDir, 'FINAL-width-guideline.png');
  await sharp(baseImagePath)
    .composite([{
      input: guidelineOverlay,
      blend: 'over'
    }])
    .png()
    .toFile(guidelineOutputPath);
  
  console.log(`✅ 横幅ガイドライン画像生成完了: FINAL-width-guideline.png`);
  
  // 4. 最終レポートを生成
  const finalReport = {
    timestamp: new Date().toISOString(),
    analysis: '全画面横幅統一完全検証',
    totalScreens: files.length,
    screens: widthMeasurements.map(m => m.screen),
    detailedMeasurements: widthMeasurements,
    uniqueWidths: uniqueWidths,
    uniqueHeights: uniqueHeights,
    isWidthUnified: uniqueWidths.length === 1,
    isHeightUnified: uniqueHeights.length === 1,
    isPerfectlyUnified: uniqueWidths.length === 1 && uniqueHeights.length === 1,
    standardSize: uniqueWidths.length === 1 && uniqueHeights.length === 1 ? 
      `${uniqueWidths[0]}px × ${uniqueHeights[0]}px` : 'サイズが統一されていません',
    conclusion: uniqueWidths.length === 1 && uniqueHeights.length === 1 ? 
      `✅ 全${files.length}画面が完璧に統一されています` : 
      `❌ 画面間でサイズに違いがあります`,
    generatedImages: [
      'FINAL-all-screens-overlay.png',
      'FINAL-width-difference-analysis.png', 
      'FINAL-width-guideline.png'
    ]
  };
  
  const reportPath = path.join(screenshotDir, 'FINAL-complete-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
  
  console.log(`\n📋 === 最終分析レポート ===`);
  console.log(`📊 総画面数: ${files.length}画面`);
  console.log(`📏 横幅統一性: ${uniqueWidths.length === 1 ? '✅ 統一済み' : '❌ 不統一'}`);
  console.log(`📐 縦幅統一性: ${uniqueHeights.length === 1 ? '✅ 統一済み' : '❌ 不統一'}`);
  console.log(`🎯 完全統一性: ${finalReport.isPerfectlyUnified ? '✅ 完璧' : '❌ 未達成'}`);
  
  if (finalReport.isPerfectlyUnified) {
    console.log(`\n🎉 === 検証完了 ===`);
    console.log(`✅ 全${files.length}画面の横幅が完璧に統一されています！`);
    console.log(`📏 統一サイズ: ${finalReport.standardSize}`);
    console.log(`🖼️ 重ね合わせ画像で視覚的に確認可能です`);
  } else {
    console.log(`\n⚠️ === 問題発見 ===`);
    console.log(`❌ 画面間でサイズに違いがあります`);
    console.log(`📊 詳細は生成された画像とレポートを確認してください`);
  }
  
  console.log(`\n📁 === 生成ファイル ===`);
  finalReport.generatedImages.forEach(img => {
    console.log(`📄 ${img}`);
  });
  console.log(`📄 FINAL-complete-analysis-report.json`);
  
  console.log(`\n✅ 完全分析完了！`);
}

completeWidthAnalysis().catch(console.error); 