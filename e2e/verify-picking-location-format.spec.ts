import { test, expect } from '@playwright/test';

test.describe('ピッキングロケーション表示確認', () => {
  test('スタッフログイン後にピッキングリストのロケーション表示を確認', async ({ page }) => {
    console.log('🔐 ログイン開始');

    // ログインページにアクセス
    await page.goto('http://localhost:3003/login');
    await page.waitForLoadState('networkidle');

    // スタッフユーザーでログイン
    await page.fill('input[type="email"], input[name="email"]', 'staff@example.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"], button:has-text("ログイン")');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('✅ ログイン完了、ピッキングAPIを直接確認');

    // ピッキングAPIを直接呼び出し
    const response = await page.request.get('http://localhost:3003/api/picking');
    const data = await response.json();

    console.log('📊 ピッキングAPIレスポンス確認:');

    if (data.tasks && data.tasks.length > 0) {
      const firstTask = data.tasks[0];
      if (firstTask.items && firstTask.items.length > 0) {
        const firstItem = firstTask.items[0];
        console.log(`📍 最初のアイテム:`);
        console.log(`   商品名: ${firstItem.productName}`);
        console.log(`   ロケーション: ${firstItem.location}`);
        console.log(`   ロケーション名: ${firstItem.locationName}`);

        // 正しいフォーマットをチェック
        if (firstItem.locationName) {
          const expectedFormat = `${firstItem.location}（${firstItem.locationName}）`;
          console.log(`✅ 期待する表示フォーマット: ${expectedFormat}`);

          // フォーマットが正しいかテスト
          expect(firstItem.locationName).toBeDefined();
          expect(firstItem.location).toMatch(/^[AB]-\d+-\d+$/);
          expect(firstItem.locationName).toMatch(/^[AB]棚\d+段目\d+番$/);

          console.log('🎉 SUCCESS: ロケーション表示フォーマットが正しく実装されています！');
        } else {
          console.log('❌ locationNameが設定されていません');
        }
      }
    }

    console.log('📋 ピッキングリスト画面にアクセス...');

    // ピッキングリストタブをクリック
    await page.goto('http://localhost:3003/staff/location');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // ピッキングリストタブをクリック
    const pickingTab = page.locator('text=ピッキングリスト');
    if (await pickingTab.count() > 0) {
      console.log('🎯 ピッキングリストタブをクリック...');
      await pickingTab.first().click();
      await page.waitForTimeout(3000);
    } else {
      console.log('❌ ピッキングリストタブが見つかりません');
    }

    await page.screenshot({
      path: 'picking-logged-in-check.png',
      fullPage: true
    });

    // ページ内のロケーション表示を探す
    const pageText = await page.textContent('body');
    const locationMatches = pageText?.match(/[AB]-\d+-\d+（[^）]+）/g);

    console.log(`📍 ページで見つかったロケーション表示:`);
    if (locationMatches && locationMatches.length > 0) {
      locationMatches.slice(0, 5).forEach((match, index) => {
        console.log(`   ${index + 1}. ${match}`);
      });
      console.log('🎉 SUCCESS: 日本語カッコフォーマットが正しく表示されています！');
    } else {
      console.log('📝 従来形式のロケーション表示を探す...');
      const oldFormatMatches = pageText?.match(/[AB]-\d+-\d+\([^)]+\)/g);
      if (oldFormatMatches) {
        console.log('⚠️  古い形式が見つかりました:', oldFormatMatches.slice(0, 3));
      }
    }

    console.log('🔍 ピッキングロケーション表示確認完了');
  });
});