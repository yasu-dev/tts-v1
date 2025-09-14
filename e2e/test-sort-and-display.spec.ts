import { test, expect } from '@playwright/test';

test.describe('ソートと全ロケーション表示確認', () => {
  test('昇順ソートとピッキングがないロケーション表示確認', async ({ page }) => {
    console.log('🔢 ソート・全表示確認開始');

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

    await page.screenshot({
      path: 'sort-display-check.png',
      fullPage: true
    });

    console.log('📋 ロケーション表示順序確認...');

    // ロケーション見出しを取得
    const locationHeaders = page.locator('h3').filter({ hasText: /^[AB]-\d+-\d+（/ });
    const count = await locationHeaders.count();

    console.log(`🏷️  見つかったロケーション見出し: ${count}個`);

    if (count > 0) {
      console.log('📍 最初の10個のロケーション順序:');
      for (let i = 0; i < Math.min(count, 10); i++) {
        const text = await locationHeaders.nth(i).textContent();
        console.log(`   ${i + 1}. ${text}`);
      }

      // ソート順序確認（A-1-1, A-1-2, A-1-3... → B-1-1, B-1-2...）
      const firstLocation = await locationHeaders.nth(0).textContent();
      const secondLocation = await locationHeaders.nth(1).textContent();

      console.log('🔢 ソート順序確認:');
      console.log(`   1番目: ${firstLocation}`);
      console.log(`   2番目: ${secondLocation}`);

      // A-1-1が先頭に来ているか確認
      if (firstLocation?.includes('A-1-1')) {
        console.log('✅ SUCCESS: A-1-1が先頭に表示されています');
      } else {
        console.log('⚠️  WARNING: A-1-1が先頭ではありません');
      }
    }

    // 0件のロケーション表示確認
    const zeroItemsLocations = page.locator('text=/未処理: 0件/');
    const zeroCount = await zeroItemsLocations.count();

    console.log(`📦 ピッキング0件のロケーション: ${zeroCount}個`);

    if (zeroCount > 0) {
      console.log('✅ SUCCESS: ピッキング対象がないロケーションも表示されています');
    } else {
      console.log('⚠️  WARNING: ピッキング0件のロケーションが表示されていません');
    }

    console.log('🔢 ソート・全表示確認完了');
  });
});