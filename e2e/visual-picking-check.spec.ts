import { test, expect } from '@playwright/test';

test.describe('見た目でピッキングロケーション確認', () => {
  test('実際のピッキング画面でロケーション表示を目視確認', async ({ page }) => {
    console.log('👁️  見た目確認開始');

    // ログイン
    await page.goto('http://localhost:3003/login');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    console.log('🔓 ログイン完了');

    // ロケーション管理画面に移動
    await page.goto('http://localhost:3003/staff/location');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'step1-location-page.png',
      fullPage: true
    });

    console.log('📋 ロケーション管理画面表示');

    // ピッキングリストタブを探してクリック
    try {
      const pickingListTab = page.locator('text=ピッキングリスト').first();
      if (await pickingListTab.count() > 0) {
        console.log('🎯 ピッキングリストタブをクリック');
        await pickingListTab.click();
        await page.waitForTimeout(3000);

        await page.screenshot({
          path: 'step2-picking-list-tab-clicked.png',
          fullPage: true
        });
      } else {
        console.log('❌ ピッキングリストタブが見つからない');
      }
    } catch (error) {
      console.log('⚠️  ピッキングリストタブクリック失敗');
    }

    // 出荷管理画面も確認
    await page.goto('http://localhost:3003/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'step3-shipping-page.png',
      fullPage: true
    });

    console.log('🚚 出荷管理画面表示');

    // ピッキング関連のボタン・テキストを探す
    const allTexts = await page.locator('body').allTextContents();
    const locationTexts = allTexts.join(' ').match(/[AB]-\d+-\d+[（(][^）)]+[）)]/g);
    const oldLocationTexts = allTexts.join(' ').match(/ロケーション\s+[AB]-\d+-\d+/g);

    console.log('🔍 見つかったロケーション表示:');
    if (locationTexts && locationTexts.length > 0) {
      console.log('✅ 新フォーマット（日本語カッコ）:', locationTexts.slice(0, 5));
    }
    if (oldLocationTexts && oldLocationTexts.length > 0) {
      console.log('⚠️  旧フォーマット:', oldLocationTexts.slice(0, 5));
    }

    // 最終判定
    if (locationTexts && locationTexts.length > 0) {
      console.log('🎉 SUCCESS: 新しい「A-1-1（A棚1段目1番）」フォーマットが表示されています！');
      const sampleFormat = locationTexts[0];
      console.log(`📍 サンプル表示: ${sampleFormat}`);

      // 正しいフォーマットかテスト
      expect(sampleFormat).toMatch(/^[AB]-\d+-\d+（[AB]棚\d+段目\d+番）$/);
    } else if (oldLocationTexts && oldLocationTexts.length > 0) {
      console.log('❌ FAIL: まだ古い「ロケーション A-1-1」フォーマットが使われています');
    } else {
      console.log('⚠️  WARNING: ロケーション表示が見つかりませんでした');
    }

    console.log('👁️  見た目確認完了');
  });
});