const puppeteer = require('puppeteer');

async function testBundleDisplay() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });

  try {
    const page = await browser.newPage();

    console.log('🚀 ログイン開始...');
    await page.goto('http://localhost:3002/login');
    await page.waitForTimeout(2000);

    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    console.log('📍 ロケーション管理画面にアクセス...');
    await page.goto('http://localhost:3002/staff/location');
    await page.waitForTimeout(5000);

    // 青背景要素を検索
    console.log('🔍 青背景要素を検索中...');
    const blueBackgroundElements = await page.evaluate(() => {
      // bg-blue-200クラスを持つ要素を検索
      const blueElements = document.querySelectorAll('.bg-blue-200, [style*="background-color: #dbeafe"], [style*="backgroundColor: #dbeafe"]');

      const results = [];
      blueElements.forEach((el, index) => {
        const productNameEl = el.querySelector('h4');
        const productName = productNameEl ? productNameEl.textContent.trim() : 'No product name found';

        results.push({
          index: index + 1,
          productName: productName,
          hasBlueBackground: el.classList.contains('bg-blue-200') || el.style.backgroundColor === '#dbeafe',
          className: el.className,
          styles: el.style.cssText
        });
      });

      return results;
    });

    console.log('🎯 検出結果:');
    if (blueBackgroundElements.length === 0) {
      console.log('❌ 青背景の要素が見つかりませんでした');
    } else {
      console.log(`✅ ${blueBackgroundElements.length}個の青背景要素を検出:`);
      blueBackgroundElements.forEach(el => {
        console.log(`  - ${el.productName} (${el.hasBlueBackground ? '青背景確認' : '背景色不明'})`);
      });
    }

    // スクリーンショット撮影
    console.log('📸 証拠スクリーンショット撮影...');
    await page.screenshot({
      path: 'bundle-evidence-location.png',
      fullPage: true
    });

    console.log('✅ 検証完了 - bundle-evidence-location.png に保存');

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
}

testBundleDisplay();