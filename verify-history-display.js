const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 DEMOカメラ４７の履歴表示を確認');

  try {
    // アプリにアクセス
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);

    // 在庫管理ページに移動
    await page.click('text=在庫管理');
    await page.waitForTimeout(1000);

    // DEMOカメラ４７を検索してクリック
    const productRow = page.locator('tr').filter({ hasText: 'DEMOカメラ４７' });
    await productRow.waitFor({ state: 'visible' });

    // 詳細ボタンをクリック
    await productRow.locator('button:has-text("詳細")').click();
    await page.waitForTimeout(1000);

    // 履歴タブをクリック
    await page.click('button:has-text("履歴")');
    await page.waitForTimeout(1000);

    // 履歴エントリを取得
    const historyEntries = await page.locator('[data-testid="history-entry"]').count();
    console.log(`✅ 履歴エントリ数: ${historyEntries}件`);

    // 各履歴エントリの詳細をチェック
    for (let i = 0; i < Math.min(historyEntries, 10); i++) {
      const entry = page.locator('[data-testid="history-entry"]').nth(i);
      const timestamp = await entry.locator('[data-testid="history-timestamp"]').textContent();
      const action = await entry.locator('[data-testid="history-action"]').textContent();
      const details = await entry.locator('[data-testid="history-details"]').textContent();

      console.log(`${i + 1}. ${timestamp?.trim()} | ${action?.trim()} | ${details?.trim() || '(空白)'}`);

      // 「詳細なし」が表示されていないかチェック
      if (details?.includes('詳細なし')) {
        console.log(`❌ エントリ${i + 1}に「詳細なし」が表示されています`);
      }
    }

    console.log('\n✅ 履歴表示確認完了');
    console.log('📋 「詳細なし」テキストが削除され、空白表示になっているか確認してください');

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }

  // ブラウザを開いたまま確認用に待機
  console.log('🔍 ブラウザで確認してください（手動で終了してください）');
  await page.waitForTimeout(30000);

  await browser.close();
})();