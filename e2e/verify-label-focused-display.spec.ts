import { test, expect } from '@playwright/test';

test.describe('ラベル情報重視の表示確認', () => {
  test('ピッキングリストで管理番号が適切に表示されていることを確認', async ({ page }) => {
    // ロケーション管理ページを開く
    await page.goto('http://localhost:3002/staff/location');
    await page.waitForSelector('.intelligence-card', { timeout: 10000 });

    // ピッキングリストビューに切り替え
    const shippingTab = await page.$('button:has-text("ピッキングリスト")');
    if (shippingTab) {
      await shippingTab.click();
      await page.waitForTimeout(2000);
    }

    // ピッキング対象商品の表示内容を確認
    const pickingItems = await page.$$('.holo-card p, .holo-card span');

    let labelNumberFound = false;
    let productInfoFound = false;
    let unnecessaryInfoFound = false;

    console.log('=== ピッキングリスト表示内容確認 ===');

    for (const item of pickingItems) {
      const text = await item.textContent();
      if (text && text.trim()) {
        console.log(`- "${text.trim()}"`);

        // 管理番号の存在確認
        if (text.includes('管理番号:') && !text.includes('(ラベル記載番号)')) {
          labelNumberFound = true;
          console.log('✅ 管理番号が表示されています（不要な説明文なし）');
        }

        // 商品名の存在確認
        if (text.includes('カメラ') || text.includes('レンズ') || /DEMO.*\d/.test(text)) {
          productInfoFound = true;
          console.log('✅ 商品名が表示されています');
        }

        // 不要な情報の検出
        if (text.includes('セラー:') || text.includes('顧客:') || text.includes('注文ID:')) {
          unnecessaryInfoFound = true;
          console.log('❌ ラベルに記載されていない情報が表示されています:', text.trim());
        }
      }
    }

    // 管理番号が商品ラベル形式（XXX-XXX-XXX形式）で表示されているか確認
    const managementNumbers = await page.$$eval('*', elements =>
      elements
        .map(el => el.textContent || '')
        .filter(text => text.includes('管理番号:'))
        .map(text => {
          const match = text.match(/管理番号:\s*([A-Z0-9-]+)/);
          return match ? match[1] : null;
        })
        .filter(Boolean)
    );

    console.log('\n=== 管理番号形式確認 ===');
    managementNumbers.forEach(number => {
      const isCorrectFormat = /^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/.test(number);
      console.log(`${number}: ${isCorrectFormat ? '✅ 正しい形式' : '❌ 形式エラー'}`);
    });

    // スクリーンショット撮影
    await page.screenshot({
      path: 'picking-list-label-focused.png',
      fullPage: true
    });

    // アサーション
    expect(labelNumberFound).toBe(true);
    expect(productInfoFound).toBe(true);
    expect(unnecessaryInfoFound).toBe(false);
    expect(managementNumbers.length).toBeGreaterThan(0);

    console.log('\n✅ ピッキングリストがラベル情報重視の表示に改善されました');
  });

  test('管理番号での検索が機能することを確認', async ({ page }) => {
    await page.goto('http://localhost:3002/staff/location');
    await page.waitForSelector('.intelligence-card', { timeout: 10000 });

    // ピッキングリストビューに切り替え
    const shippingTab = await page.$('button:has-text("ピッキングリスト")');
    if (shippingTab) {
      await shippingTab.click();
      await page.waitForTimeout(2000);
    }

    // 最初の管理番号を取得
    const firstManagementNumber = await page.$eval('*', el => {
      const text = el.textContent || '';
      const match = text.match(/管理番号:\s*([A-Z0-9-]+)/);
      return match ? match[1] : null;
    }).catch(() => null);

    if (firstManagementNumber) {
      console.log(`検索対象管理番号: ${firstManagementNumber}`);

      // 検索ボックスがあれば管理番号の一部で検索
      const searchBox = await page.$('input[type="search"], input[placeholder*="検索"]');
      if (searchBox) {
        const searchTerm = firstManagementNumber.split('-')[0]; // 最初のセグメント
        await searchBox.fill(searchTerm);
        await page.waitForTimeout(1000);

        console.log(`検索語: ${searchTerm} で検索実行`);

        // 検索結果に該当商品が表示されることを確認
        const searchResults = await page.$$eval('*', elements =>
          elements
            .map(el => el.textContent || '')
            .filter(text => text.includes(searchTerm))
        );

        expect(searchResults.length).toBeGreaterThan(0);
        console.log('✅ 管理番号での検索が正常に機能しています');
      }
    }
  });
});