const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function measureWhiteCardOverlay() {
  const testResultsDir = 'test-results/all-22-screens-verification';
  
  console.log('🎯 白いカードのみを抽出して重ね合わせ測定中...\n');

  // 主要6画面のスクリーンショットを取得
  const targetScreens = [
    'dashboard-fullscreen.png',
    'inventory-fullscreen.png', 
    'sales-fullscreen.png',
    'returns-fullscreen.png',
    'staff-dashboard-fullscreen.png',
    'staff-returns-fullscreen.png'
  ];

  console.log(`📱 対象画面: ${targetScreens.length}画面`);
  targetScreens.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });

  // 白いカード領域を抽出する座標（統一グリッド適用後の予想位置）
  const cardRegions = [
    // ヘッダーカード
    { left: 256, top: 140, width: 1408, height: 120, name: 'header-card' },
    // メトリクスカード（4列）
    { left: 256, top: 280, width: 342, height: 180, name: 'metric-card-1' },
    { left: 622, top: 280, width: 342, height: 180, name: 'metric-card-2' },
    { left: 988, top: 280, width: 342, height: 180, name: 'metric-card-3' },
    { left: 1354, top: 280, width: 310, height: 180, name: 'metric-card-4' },
    // メインコンテンツカード
    { left: 256, top: 480, width: 1408, height: 400, name: 'main-content-card' }
  ];

  const measurements = {};
  
  for (const screenFile of targetScreens) {
    const screenPath = path.join(testResultsDir, screenFile);
    if (!fs.existsSync(screenPath)) {
      console.log(`❌ ${screenFile} が見つかりません`);
      continue;
    }

    console.log(`\n🔍 ${screenFile} の白いカード抽出中...`);
    const screenName = screenFile.replace('-fullscreen.png', '');
    measurements[screenName] = {};

    for (const region of cardRegions) {
      try {
        // 指定領域を抽出
        const extractedCard = await sharp(screenPath)
          .extract({
            left: region.left,
            top: region.top,
            width: region.width,
            height: region.height
          })
          .png()
          .toFile(path.join(testResultsDir, `${screenName}-${region.name}.png`));

        measurements[screenName][region.name] = {
          width: extractedCard.width,
          height: extractedCard.height,
          left: region.left,
          top: region.top
        };

        console.log(`  ✅ ${region.name}: ${extractedCard.width}px × ${extractedCard.height}px`);
      } catch (error) {
        console.log(`  ❌ ${region.name}: 抽出失敗 - ${error.message}`);
      }
    }
  }

  // 白いカードの重ね合わせ画像を作成
  console.log('\n🎨 白いカードの重ね合わせ画像を作成中...');
  
  for (const region of cardRegions) {
    console.log(`\n📊 ${region.name} の重ね合わせ作成中...`);
    
    const cardFiles = targetScreens
      .map(screen => {
        const screenName = screen.replace('-fullscreen.png', '');
        const cardFile = `${screenName}-${region.name}.png`;
        const cardPath = path.join(testResultsDir, cardFile);
        return fs.existsSync(cardPath) ? cardPath : null;
      })
      .filter(Boolean);

    if (cardFiles.length === 0) {
      console.log(`  ❌ ${region.name} のカードファイルが見つかりません`);
      continue;
    }

    // 最初のカードを基準に重ね合わせ
    let composite = sharp(cardFiles[0])
      .modulate({ brightness: 0.4 });

    const compositeInputs = [];
    for (let i = 1; i < cardFiles.length; i++) {
      const processedCard = await sharp(cardFiles[i])
        .modulate({ brightness: 0.4 })
        .png({ quality: 80 })
        .toBuffer();
      
      compositeInputs.push({
        input: processedCard,
        blend: 'overlay',
        opacity: 0.3
      });
      
      console.log(`    ✅ ${path.basename(cardFiles[i])} を追加`);
    }

    // 重ね合わせ実行
    const overlayResult = await composite
      .composite(compositeInputs)
      .png({ quality: 90 })
      .toFile(path.join(testResultsDir, `WHITE-CARD-OVERLAY-${region.name}.png`));

    console.log(`  🎉 完了: WHITE-CARD-OVERLAY-${region.name}.png`);
    console.log(`     サイズ: ${overlayResult.width}px × ${overlayResult.height}px`);

    // 幅の一致度を測定
    const widths = Object.values(measurements).map(screen => screen[region.name]?.width).filter(Boolean);
    const uniqueWidths = [...new Set(widths)];
    
    console.log(`  📏 幅の測定結果:`);
    console.log(`     検出された幅: ${widths.join(', ')}px`);
    console.log(`     ユニークな幅: ${uniqueWidths.length}種類 (${uniqueWidths.join(', ')}px)`);
    
    if (uniqueWidths.length === 1) {
      console.log(`     ✅ 完全統一: 全て${uniqueWidths[0]}px`);
    } else {
      console.log(`     ❌ 未統一: ${uniqueWidths.length}種類の異なる幅`);
    }
  }

  // 測定結果をJSONで保存
  fs.writeFileSync(
    path.join(testResultsDir, 'white-card-measurements.json'),
    JSON.stringify(measurements, null, 2)
  );

  console.log('\n✅ 白いカード重ね合わせ測定完了！');
  console.log('📊 詳細結果: white-card-measurements.json');
}

measureWhiteCardOverlay().catch(console.error); 