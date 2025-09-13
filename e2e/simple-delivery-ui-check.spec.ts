import { test, expect } from '@playwright/test';

test.describe('納品管理ページ UI 確認', () => {

  test('納品管理ページの見た目を確認（認証なし）', async ({ page }) => {
    console.log('=== 納品管理ページ直接アクセステスト開始 ===');

    // 直接納品管理ページにアクセス
    await page.goto('http://localhost:3002/delivery');
    await page.waitForTimeout(3000);

    // スクリーンショット撮影
    await page.screenshot({ path: 'delivery-page-direct-access.png', fullPage: true });
    console.log('納品管理ページスクリーンショット保存完了');

    // ページの基本要素があることを確認（認証されていない場合はリダイレクトされる可能性がある）
    const currentUrl = page.url();
    console.log('現在のURL:', currentUrl);

    // もしログインページにリダイレクトされた場合
    if (currentUrl.includes('login')) {
      console.log('ログインページにリダイレクトされました');
      await page.screenshot({ path: 'login-page.png', fullPage: true });

      // 簡単なテストアカウントでログインを試行
      try {
        const emailField = page.locator('input[type="email"], input[name="email"], [data-testid="email"]').first();
        const passwordField = page.locator('input[type="password"], input[name="password"], [data-testid="password"]').first();
        const submitButton = page.locator('button[type="submit"], [data-testid="login-submit"]').first();

        await emailField.fill('seller@example.com');
        await passwordField.fill('password123');
        await submitButton.click();

        await page.waitForTimeout(3000);

        // ログイン後に納品ページに移動
        await page.goto('http://localhost:3002/delivery');
        await page.waitForTimeout(2000);

      } catch (error) {
        console.log('ログイン試行失敗:', error);
      }
    }

    await page.screenshot({ path: 'delivery-page-after-login.png', fullPage: true });

    // フィルター要素の存在確認
    const statusElements = await page.locator('text="ステータス"').count();
    const periodElements = await page.locator('text="期間"').count();
    const searchElements = await page.locator('text="検索"').count();

    console.log('ステータス要素数:', statusElements);
    console.log('期間要素数:', periodElements);
    console.log('検索要素数:', searchElements);

    // select要素とinput要素のスタイル確認
    const selects = page.locator('select');
    const inputs = page.locator('input');

    const selectCount = await selects.count();
    const inputCount = await inputs.count();

    console.log(`Select要素数: ${selectCount}, Input要素数: ${inputCount}`);

    // 各要素の詳細情報を取得
    if (selectCount > 0) {
      for (let i = 0; i < Math.min(selectCount, 5); i++) {
        try {
          const element = selects.nth(i);
          const isVisible = await element.isVisible();

          if (isVisible) {
            const styles = await element.evaluate(el => {
              const computedStyle = window.getComputedStyle(el);
              return {
                borderColor: computedStyle.borderColor,
                borderWidth: computedStyle.borderWidth,
                borderStyle: computedStyle.borderStyle,
                backgroundColor: computedStyle.backgroundColor,
                borderRadius: computedStyle.borderRadius
              };
            });
            console.log(`Select[${i}] スタイル:`, styles);
          } else {
            console.log(`Select[${i}]: 非表示`);
          }
        } catch (error) {
          console.log(`Select[${i}] エラー:`, error.message);
        }
      }
    }

    if (inputCount > 0) {
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        try {
          const element = inputs.nth(i);
          const isVisible = await element.isVisible();

          if (isVisible) {
            const styles = await element.evaluate(el => {
              const computedStyle = window.getComputedStyle(el);
              return {
                borderColor: computedStyle.borderColor,
                borderWidth: computedStyle.borderWidth,
                borderStyle: computedStyle.borderStyle,
                backgroundColor: computedStyle.backgroundColor,
                borderRadius: computedStyle.borderRadius
              };
            });
            console.log(`Input[${i}] スタイル:`, styles);
          } else {
            console.log(`Input[${i}]: 非表示`);
          }
        } catch (error) {
          console.log(`Input[${i}] エラー:`, error.message);
        }
      }
    }

    console.log('=== 納品管理ページ直接アクセステスト完了 ===');
  });

});