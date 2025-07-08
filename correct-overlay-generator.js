// 正しい重ね合わせ画像生成スクリプト
// 全画面の白いカード横幅統一を証明

const pages = [
  { name: 'dashboard', url: 'http://localhost:3000/dashboard' },
  { name: 'inventory', url: 'http://localhost:3000/inventory' },
  { name: 'sales', url: 'http://localhost:3000/sales' },
  { name: 'returns', url: 'http://localhost:3000/returns' },
  { name: 'staff-dashboard', url: 'http://localhost:3000/staff/dashboard' },
  { name: 'staff-returns', url: 'http://localhost:3000/staff/returns' }
];

async function generateOverlayImages() {
  const puppeteer = require('puppeteer');
  const fs = require('fs');
  const path = require('path');
  
  console.log('🎯 横幅統一証明用重ね合わせ画像生成開始');
  
  // ブラウザを起動
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // 全画面表示に設定
  await page.setViewport({ width: 1920, height: 1080 });
  
  const screenshots = [];
  
  // 各ページのスクリーンショットを撮影
  for (const pageInfo of pages) {
    try {
      console.log(`📸 ${pageInfo.name} スクリーンショット撮影中...`);
      
      await page.goto(pageInfo.url, { waitUntil: 'networkidle2' });
      
      // ページが完全に読み込まれるまで待機
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 白いカードが表示されるまで待機
      await page.waitForSelector('.intelligence-card, .nexus-content-card', { timeout: 10000 });
      
      // スクリーンショットを撮影
      const screenshotBuffer = await page.screenshot({ 
        fullPage: true,
        type: 'png'
      });
      
      const filename = `${pageInfo.name}-fullscreen.png`;
      fs.writeFileSync(filename, screenshotBuffer);
      
      screenshots.push({
        name: pageInfo.name,
        filename: filename,
        buffer: screenshotBuffer
      });
      
      console.log(`✅ ${pageInfo.name} スクリーンショット完了: ${filename}`);
      
    } catch (error) {
      console.error(`❌ ${pageInfo.name} スクリーンショット失敗:`, error);
    }
  }
  
  await browser.close();
  
  // 重ね合わせ画像を生成
  if (screenshots.length > 0) {
    await createOverlayImage(screenshots);
  }
  
  console.log('🎉 横幅統一証明用重ね合わせ画像生成完了');
}

async function createOverlayImage(screenshots) {
  const sharp = require('sharp');
  const fs = require('fs');
  
  console.log('🔄 重ね合わせ画像生成中...');
  
  try {
    // 最初の画像をベースとして使用
    const baseImage = screenshots[0];
    let composite = sharp(baseImage.buffer);
    
    // 他の画像を半透明で重ね合わせ
    const overlays = screenshots.slice(1).map((screenshot, index) => ({
      input: screenshot.buffer,
      blend: 'multiply',
      opacity: 0.3 + (index * 0.1) // 透明度を調整
    }));
    
    if (overlays.length > 0) {
      composite = composite.composite(overlays);
    }
    
    // 重ね合わせ画像を保存
    const overlayBuffer = await composite.png().toBuffer();
    fs.writeFileSync('width-unification-proof.png', overlayBuffer);
    
    console.log('✅ 重ね合わせ画像生成完了: width-unification-proof.png');
    
    // 個別の白いカード部分を抽出して重ね合わせ
    await createCardOverlay(screenshots);
    
  } catch (error) {
    console.error('❌ 重ね合わせ画像生成失敗:', error);
  }
}

async function createCardOverlay(screenshots) {
  const sharp = require('sharp');
  const fs = require('fs');
  
  console.log('🎴 白いカード部分の重ね合わせ画像生成中...');
  
  try {
    // 各画像から白いカード部分を抽出
    const cardImages = [];
    
    for (const screenshot of screenshots) {
      // 画像の中央部分（白いカードがある領域）を抽出
      const cardBuffer = await sharp(screenshot.buffer)
        .extract({ 
          left: 300,    // 左からの位置
          top: 200,     // 上からの位置
          width: 1320,  // 幅
          height: 600   // 高さ
        })
        .png()
        .toBuffer();
      
      cardImages.push({
        name: screenshot.name,
        buffer: cardBuffer
      });
    }
    
    // カード部分を重ね合わせ
    if (cardImages.length > 0) {
      let cardComposite = sharp(cardImages[0].buffer);
      
      const cardOverlays = cardImages.slice(1).map((card, index) => ({
        input: card.buffer,
        blend: 'difference',
        opacity: 0.5
      }));
      
      if (cardOverlays.length > 0) {
        cardComposite = cardComposite.composite(cardOverlays);
      }
      
      const cardOverlayBuffer = await cardComposite.png().toBuffer();
      fs.writeFileSync('card-width-proof.png', cardOverlayBuffer);
      
      console.log('✅ 白いカード重ね合わせ画像生成完了: card-width-proof.png');
    }
    
  } catch (error) {
    console.error('❌ 白いカード重ね合わせ画像生成失敗:', error);
  }
}

// 実行
generateOverlayImages().catch(console.error); 