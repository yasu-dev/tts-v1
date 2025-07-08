const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createCompleteCardOverlay() {
  const testResultsDir = 'test-results';
  
  console.log('🎨 全25画面の白いカード重ね合わせ画像を作成中...\\n');

  // 全画面のスクリーンショットファイルを取得
  const screenshotFiles = fs.readdirSync(testResultsDir)
    .filter(file => file.startsWith('全画面表示-') && file.endsWith('.png'))
    .sort();

  console.log(`📱 発見された画面数: ${screenshotFiles.length}画面`);
  screenshotFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });

  if (screenshotFiles.length === 0) {
    console.log('❌ スクリーンショットが見つかりません');
    console.log('💡 先に e2e/display-all-screens-with-tabs.spec.ts を実行してください');
    return;
  }

  // 最初の画像のサイズを取得
  const firstImagePath = path.join(testResultsDir, screenshotFiles[0]);
  const { width, height } = await sharp(firstImagePath).metadata();
  console.log(`\\n📐 基準サイズ: ${width}px × ${height}px`);

  // 白いカード部分のマスクを作成（intelligence-cardの領域を想定）
  // 一般的な白いカードは画面中央部分にあることを想定
  const cardMaskBuffer = Buffer.from(
    `<svg width="${width}" height="${height}">
      <defs>
        <mask id="cardMask">
          <rect width="${width}" height="${height}" fill="black"/>
          <!-- 白いカード領域を白で塗りつぶし（表示される部分） -->
          <rect x="32" y="100" width="${width - 64}" height="${height - 200}" fill="white" rx="8"/>
        </mask>
      </defs>
      <rect width="${width}" height="${height}" fill="rgba(255,255,255,0.3)" mask="url(#cardMask)"/>
    </svg>`
  );

  // ベース画像を作成（透明背景）
  let overlayImage = sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  });

  console.log('\\n🔄 重ね合わせ処理中...');

  // 各画面の白いカード部分を重ね合わせ
  const compositeOperations = [];
  
  for (let i = 0; i < screenshotFiles.length; i++) {
    const file = screenshotFiles[i];
    const imagePath = path.join(testResultsDir, file);
    
    try {
      // 画像を読み込み、白いカード部分のみを抽出
      const maskedImage = await sharp(imagePath)
        .composite([{
          input: cardMaskBuffer,
          blend: 'dest-in'
        }])
        .png()
        .toBuffer();

      compositeOperations.push({
        input: maskedImage,
        blend: 'over'
      });

      console.log(`  ✓ ${i + 1}/${screenshotFiles.length}: ${file}`);
    } catch (error) {
      console.log(`  ❌ ${file}: ${error.message}`);
    }
  }

  // 全ての画像を重ね合わせ
  const finalOverlay = await overlayImage
    .composite(compositeOperations)
    .png()
    .toBuffer();

  // ガイドライン付きバージョンを作成
  const guidelinesSvg = `
    <svg width="${width}" height="${height}">
      <!-- 左右32pxマージンライン -->
      <line x1="32" y1="0" x2="32" y2="${height}" stroke="lime" stroke-width="2" opacity="0.8"/>
      <line x1="${width - 32}" y1="0" x2="${width - 32}" y2="${height}" stroke="lime" stroke-width="2" opacity="0.8"/>
      
      <!-- コンテンツ幅ガイドライン -->
      <rect x="32" y="100" width="${width - 64}" height="${height - 200}" fill="none" stroke="lime" stroke-width="3" opacity="0.9" rx="8"/>
      
      <!-- 中央線 -->
      <line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="cyan" stroke-width="1" opacity="0.6"/>
      
      <!-- タイトル -->
      <text x="50" y="30" font-family="Arial" font-size="20" font-weight="bold" fill="lime">
        全25画面 白いカード重ね合わせ検証
      </text>
      <text x="50" y="55" font-family="Arial" font-size="14" fill="lime">
        緑線: 統一すべき白いカード範囲 | 青線: 中央基準線
      </text>
      <text x="50" y="75" font-family="Arial" font-size="12" fill="lime">
        画面数: ${screenshotFiles.length}画面（セラー12 + スタッフ10 + 返品タブ3）
      </text>
    </svg>
  `;

  const guidelinesBuffer = Buffer.from(guidelinesSvg);

  // ガイドライン付きバージョンを作成
  const overlayWithGuidelines = await sharp(finalOverlay)
    .composite([{
      input: guidelinesBuffer,
      blend: 'over'
    }])
    .png()
    .toBuffer();

  // ファイルに保存
  const outputPath = path.join(testResultsDir, 'COMPLETE-25-SCREENS-CARD-OVERLAY.png');
  const guidelinesOutputPath = path.join(testResultsDir, 'COMPLETE-25-SCREENS-CARD-OVERLAY-WITH-GUIDELINES.png');

  await sharp(finalOverlay).png().toFile(outputPath);
  await sharp(overlayWithGuidelines).png().toFile(guidelinesOutputPath);

  const stats1 = fs.statSync(outputPath);
  const stats2 = fs.statSync(guidelinesOutputPath);

  console.log('\\n🎉 === 重ね合わせ画像作成完了 ===');
  console.log(`📸 基本版: ${outputPath} (${(stats1.size / 1024).toFixed(1)}KB)`);
  console.log(`📸 ガイドライン版: ${guidelinesOutputPath} (${(stats2.size / 1024).toFixed(1)}KB)`);
  console.log('\\n🔍 === 確認ポイント ===');
  console.log('✅ 緑色の枠内に全ての白いカードが収まっているか');
  console.log('✅ 白いカードの左右端が揃っているか');
  console.log('✅ 横幅のばらつきが見られないか');
  console.log('\\n🎯 UIを見てしか判断しない - 表示は絶対だ！');

  // 画像を表示アプリで開く
  try {
    const { exec } = require('child_process');
    
    // Windows
    if (process.platform === 'win32') {
      exec(`start "" "${guidelinesOutputPath}"`, (error) => {
        if (error) {
          console.log(`\\n💡 手動で画像を確認してください: ${guidelinesOutputPath}`);
        } else {
          console.log(`\\n🖼️ 画像を表示アプリで開きました`);
        }
      });
    }
    // macOS
    else if (process.platform === 'darwin') {
      exec(`open "${guidelinesOutputPath}"`, (error) => {
        if (error) {
          console.log(`\\n💡 手動で画像を確認してください: ${guidelinesOutputPath}`);
        } else {
          console.log(`\\n🖼️ 画像を表示アプリで開きました`);
        }
      });
    }
    // Linux
    else {
      exec(`xdg-open "${guidelinesOutputPath}"`, (error) => {
        if (error) {
          console.log(`\\n💡 手動で画像を確認してください: ${guidelinesOutputPath}`);
        } else {
          console.log(`\\n🖼️ 画像を表示アプリで開きました`);
        }
      });
    }
  } catch (error) {
    console.log(`\\n💡 手動で画像を確認してください: ${guidelinesOutputPath}`);
  }
}

createCompleteCardOverlay().catch(console.error); 