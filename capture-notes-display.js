const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // セラーログイン
    console.log('1. セラーとしてログイン...');
    await page.goto('http://localhost:3002/login');
    await page.waitForTimeout(1000);
    await page.fill('input[type="email"]', 'seller@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 在庫管理ページへ
    console.log('2. 在庫管理ページへ移動...');
    await page.goto('http://localhost:3002/inventory');
    await page.waitForTimeout(3000);

    // DEMOカメラ２７を探してクリック
    console.log('3. DEMOカメラ２７を探す...');

    // テーブル内のDEMOカメラ２７を含む行を探す
    const rows = await page.locator('tr').all();
    let found = false;

    for (const row of rows) {
      const text = await row.textContent();
      if (text && text.includes('DEMOカメラ２７')) {
        console.log('   ✓ DEMOカメラ２７を見つけました！');
        await row.click();
        found = true;
        break;
      }
    }

    if (found) {
      await page.waitForTimeout(2000);

      // モーダルが開いているか確認
      const modalVisible = await page.locator('[role="dialog"], .modal, div[class*="modal"]').first().isVisible();

      if (modalVisible) {
        console.log('4. 商品詳細モーダルが開きました');

        // 基本情報タブのスクリーンショット
        await page.screenshot({
          path: 'evidence-1-basic-tab.png'
        });
        console.log('   ✓ 基本情報タブのスクリーンショット保存');

        // 備考タブを探してクリック
        const tabs = await page.locator('button, div[role="tab"]').all();
        for (const tab of tabs) {
          const tabText = await tab.textContent();
          if (tabText && tabText.includes('備考')) {
            console.log('5. 備考タブをクリック...');
            await tab.click();
            await page.waitForTimeout(2000);

            // 備考タブのスクリーンショット（証拠画像）
            await page.screenshot({
              path: 'evidence-2-notes-tab-with-data.png'
            });
            console.log('   ✓✓✓ 備考タブの証拠画像を保存しました！');

            // 検品メモが表示されているか確認
            const hasInspectionNotes = await page.locator('text=★★★検品テスト備考★★★').isVisible();
            const hasGeneralNotes = await page.locator('text=★★★★★★').isVisible();

            console.log('\n=== 表示確認結果 ===');
            console.log('検品メモ表示:', hasInspectionNotes ? '✅ 表示されています' : '❌ 表示されていません');
            console.log('一般メモ表示:', hasGeneralNotes ? '✅ 表示されています' : '❌ 表示されていません');

            break;
          }
        }
      }
    } else {
      console.log('❌ DEMOカメラ２７が見つかりませんでした');
    }

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await browser.close();
    console.log('\n完了しました。evidence-2-notes-tab-with-data.png を確認してください。');
  }
})();