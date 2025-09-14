import { test, expect } from '@playwright/test';

test.describe('スクロールして重複確認', () => {
  test('ページ全体をスクロールして重複ロケーション表示を確認', async ({ page }) => {
    console.log('📜 スクロール重複確認開始');

    // ログイン
    await page.goto('http://localhost:3003/login');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // ロケーション管理画面に移動
    await page.goto('http://localhost:3003/staff/location');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // ピッキングリストタブをクリック
    const pickingListTab = page.locator('text=ピッキングリスト').first();
    if (await pickingListTab.count() > 0) {
      await pickingListTab.click();
      await page.waitForTimeout(3000);
    }

    // ページを下にスクロールして商品リストを確認
    console.log('📜 ページをスクロールして商品リスト確認...');

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'scrolled-duplicate-check.png',
      fullPage: true
    });

    // 具体的な重複表示を探す
    const duplicateElements = page.locator('text=/[AB]-\\d+-\\d+（[^）]+）\\([AB]-\\d+-\\d+\\)/');
    const count = await duplicateElements.count();

    console.log(`🔍 重複パターン要素数: ${count}`);

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const text = await duplicateElements.nth(i).textContent();
        console.log(`   ${i + 1}. "${text}"`);

        // 要素をハイライト
        await duplicateElements.nth(i).scrollIntoViewIfNeeded();
        await duplicateElements.nth(i).highlight();
        await page.waitForTimeout(500);
      }
    }

    // 商品リスト内でロケーション表示を確認
    const productItems = page.locator('[class*="item"], [class*="product"], [class*="row"]');
    const itemCount = await productItems.count();
    console.log(`📦 商品アイテム数: ${itemCount}`);

    if (itemCount > 0) {
      console.log('📦 最初の5つの商品アイテムのテキスト:');
      for (let i = 0; i < Math.min(itemCount, 5); i++) {
        const text = await productItems.nth(i).textContent();
        if (text && text.includes('A-') || text && text.includes('B-')) {
          console.log(`   商品 ${i + 1}: ${text?.substring(0, 100)}...`);
        }
      }
    }

    console.log('📜 スクロール重複確認完了');
  });
});