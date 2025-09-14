import { test, expect } from '@playwright/test';

test.describe('重複ロケーション表示確認', () => {
  test('現在の表示で重複している(A-1-5)部分を確認', async ({ page }) => {
    console.log('🔍 重複表示確認開始');

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
      path: 'duplicate-location-check.png',
      fullPage: true
    });

    // 重複表示を確認
    const allTexts = await page.locator('body').allTextContents();
    const bodyText = allTexts.join(' ');

    console.log('📋 重複パターンを検索中...');

    // A-1-5（A棚2段目5番）(A-1-5) のようなパターンを検索
    const duplicatePattern = bodyText.match(/([AB]-\d+-\d+)（[^）]+）\(\1\)/g);

    if (duplicatePattern && duplicatePattern.length > 0) {
      console.log('⚠️  重複表示発見:');
      duplicatePattern.forEach((match, index) => {
        console.log(`   ${index + 1}. ${match}`);
      });
    } else {
      console.log('✅ 重複表示は見つかりませんでした');
    }

    // より一般的な重複パターンも検索
    const allLocationMatches = bodyText.match(/[AB]-\d+-\d+[（(][^）)]+[）)][（(][AB]-\d+-\d+[）)]/g);
    if (allLocationMatches && allLocationMatches.length > 0) {
      console.log('🔍 一般的な重複パターン:');
      allLocationMatches.forEach((match, index) => {
        console.log(`   ${index + 1}. ${match}`);
      });
    }

    console.log('🔍 重複表示確認完了');
  });
});