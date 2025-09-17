import { test } from '@playwright/test';

test('同梱商品の青背景証拠確認', async ({ page }) => {
  test.setTimeout(120000);

  console.log('🚀 同梱商品の青背景証拠確認開始...');

  // ログイン
  await page.goto('http://localhost:3002/login');
  await page.waitForTimeout(2000);
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('📍 ロケーション管理画面にアクセス...');
  await page.goto('http://localhost:3002/staff/location');
  await page.waitForTimeout(5000);

  // ページ内の青背景要素を検索
  const blueBackgroundElements = await page.evaluate(() => {
    // 複数の方法で青背景要素を検索
    const selectors = [
      '.bg-blue-200',
      '[style*="background-color: #dbeafe"]',
      '[style*="backgroundColor: #dbeafe"]',
      '[class*="bg-blue"]'
    ];

    const results = new Set();

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => results.add(el));
    });

    const bundleElements = [];
    results.forEach((el: any, index) => {
      const productNameEl = el.querySelector('h4');
      const productName = productNameEl ? productNameEl.textContent.trim() : 'No name found';

      // 青色関連のクラスや背景色をチェック
      const hasBlueClass = el.classList.toString().includes('blue');
      const hasBlueStyle = el.style.backgroundColor === '#dbeafe' ||
                          el.style.backgroundColor.includes('blue') ||
                          el.style.backgroundColor.includes('rgb(219, 234, 254)');

      if (hasBlueClass || hasBlueStyle) {
        bundleElements.push({
          index: bundleElements.length + 1,
          productName: productName,
          className: el.className,
          backgroundColor: el.style.backgroundColor,
          borderColor: el.style.borderColor,
          hasBlueClass: hasBlueClass,
          hasBlueStyle: hasBlueStyle
        });
      }
    });

    return bundleElements;
  });

  console.log('🔍 青背景検出結果:');
  if (blueBackgroundElements.length === 0) {
    console.log('❌ 青背景の要素が見つかりませんでした');
  } else {
    console.log(`✅ ${blueBackgroundElements.length}個の青背景要素を検出:`);
    blueBackgroundElements.forEach(el => {
      console.log(`  📦 ${el.productName}`);
      console.log(`     - クラス: ${el.className}`);
      console.log(`     - 背景色: ${el.backgroundColor}`);
      console.log(`     - 境界色: ${el.borderColor}`);
    });
  }

  // 特定の商品名で検索
  const demoProducts = await page.evaluate(() => {
    const demoElements = [];
    const allProductElements = document.querySelectorAll('h4');

    allProductElements.forEach(h4 => {
      const productName = h4.textContent?.trim();
      if (productName && (
        productName.includes('DEMOカメラ') ||
        productName.includes('XYZcamera') ||
        productName.toLowerCase().includes('demo')
      )) {
        const containerEl = h4.closest('[class*="p-6"]');
        if (containerEl) {
          demoElements.push({
            productName: productName,
            hasBlueBackground: containerEl.classList.toString().includes('bg-blue') ||
                              containerEl.style.backgroundColor.includes('#dbeafe') ||
                              containerEl.style.backgroundColor.includes('blue'),
            className: containerEl.className,
            backgroundColor: containerEl.style.backgroundColor,
            borderColor: containerEl.style.borderColor
          });
        }
      }
    });

    return demoElements;
  });

  console.log('🎯 DEMOカメラ関連商品の検出結果:');
  demoProducts.forEach(product => {
    console.log(`  🎬 ${product.productName}: ${product.hasBlueBackground ? '✅ 青背景確認' : '❌ 青背景なし'}`);
    if (product.className) {
      console.log(`     クラス: ${product.className}`);
    }
    if (product.backgroundColor) {
      console.log(`     背景色: ${product.backgroundColor}`);
    }
  });

  // 証拠スクリーンショット撮影
  console.log('📸 証拠スクリーンショット撮影...');
  await page.screenshot({
    path: 'bundle-evidence-location-verification.png',
    fullPage: true
  });

  console.log('✅ 証拠確認完了 - bundle-evidence-location-verification.png に保存');
});