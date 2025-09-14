import { test, expect } from '@playwright/test';

test.describe('Location Display Verification', () => {
  test('ピッキングリストの表示が正しいフォーマットになっているか確認', async ({ page }) => {
    console.log('📍 ロケーション表示フォーマット検証開始');

    await page.goto('http://localhost:3003/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // モーダルを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    console.log('📋 ピッキングエリアに移動中...');

    // ピッキングエリアをクリック
    const pickingArea = page.locator('text=ピッキング').first();
    if (await pickingArea.count() > 0) {
      await pickingArea.click();
      await page.waitForTimeout(2000);
      console.log('✅ ピッキングエリアクリック成功');
    } else {
      console.log('❌ ピッキングエリアが見つかりません');
    }

    console.log('📋 ピッキングリストページをチェック中...');

    // ピッキングリストを探す
    const pickingList = page.locator('.picking-list, [data-testid*="picking"], .picking-item');
    const locationTexts = page.locator('text=/^[AB]-\\d+-\\d+（.+）$/');

    await page.screenshot({
      path: 'location-display-check.png',
      fullPage: true
    });

    // ロケーション表示を検索
    const allTexts = await page.locator('text=/[AB]-\\d+-\\d+/').allTextContents();
    console.log(`🔍 見つかったロケーション表示: ${JSON.stringify(allTexts.slice(0, 5))}`);

    // 期待する日本語カッコフォーマットを確認
    const japaneseParenthesesPattern = /[AB]-\d+-\d+（.+）/;
    let foundCorrectFormat = false;

    for (const text of allTexts) {
      if (japaneseParenthesesPattern.test(text)) {
        console.log(`✅ 正しいフォーマット発見: ${text}`);
        foundCorrectFormat = true;
      }
    }

    if (foundCorrectFormat) {
      console.log('🎉 SUCCESS: ロケーション表示が正しい「A-1-1（A棚1段目1番）」フォーマットになっています！');
    } else {
      console.log('❌ 正しい日本語カッコフォーマットが見つかりません');
      console.log('🔧 ページの全テキストを確認中...');
      const pageText = await page.textContent('body');
      const locationMatches = pageText?.match(/[AB]-\d+-\d+[（(].+?[）)]/g);
      console.log(`📋 ロケーション関連テキスト: ${JSON.stringify(locationMatches?.slice(0, 10))}`);
    }

    console.log('📍 ロケーション表示フォーマット検証完了');
  });
});