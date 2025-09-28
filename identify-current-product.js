const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🎯 現在表示中の商品を特定');

  try {
    // port 3002の在庫画面に直接アクセス（ユーザーと同じ環境）
    await page.goto('http://localhost:3002/inventory');
    await page.waitForTimeout(5000);

    // スクリーンショット1: 現在の画面
    await page.screenshot({
      path: 'current-screen-check.png',
      fullPage: true
    });
    console.log('✅ 現在の画面をキャプチャ: current-screen-check.png');

    // DEMOカメラを含む商品を探す
    const demoProducts = await page.evaluate(() => {
      const productElements = document.querySelectorAll('tr, .product-row, [data-testid*="product"], [class*="product"]');
      const found = [];

      productElements.forEach((el, index) => {
        const text = el.textContent;
        if (text && text.includes('DEMOカメラ')) {
          found.push({
            index: index,
            text: text.substring(0, 200), // 最初の200文字
            hasButton: el.querySelector('button') !== null
          });
        }
      });
      return found;
    });

    console.log('\n📋 DEMOカメラ商品の検出結果:');
    demoProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.text}`);
    });

    // 最初のDEMOカメラ商品をクリック
    if (demoProducts.length > 0) {
      try {
        await page.click('text=DEMOカメラ', { timeout: 5000 });
        await page.waitForTimeout(3000);

        // モーダルが開いた後のスクリーンショット
        await page.screenshot({
          path: 'product-modal-opened.png',
          fullPage: true
        });
        console.log('✅ 商品詳細モーダル: product-modal-opened.png');

        // モーダル内の商品名やIDを取得
        const modalInfo = await page.evaluate(() => {
          const titleElement = document.querySelector('h1, h2, h3, [class*="title"], [class*="modal"] h1, [class*="modal"] h2');
          const contentElements = document.querySelectorAll('[class*="modal"] div, [class*="detail"] div');

          let productInfo = {
            title: titleElement ? titleElement.textContent : 'タイトル未発見',
            modalContent: []
          };

          contentElements.forEach(el => {
            const text = el.textContent?.trim();
            if (text && text.length < 100 && (text.includes('ID') || text.includes('SKU') || text.includes('DEMOカメラ'))) {
              productInfo.modalContent.push(text);
            }
          });

          return productInfo;
        });

        console.log('\n📄 モーダル情報:');
        console.log('タイトル:', modalInfo.title);
        console.log('関連情報:', modalInfo.modalContent.slice(0, 5));

      } catch (clickError) {
        console.log('⚠️ DEMOカメラ商品のクリックに失敗');
      }
    }

  } catch (error) {
    console.error('❌ エラー:', error);
    await page.screenshot({ path: 'identification-error.png' });
  }

  await browser.close();
})();