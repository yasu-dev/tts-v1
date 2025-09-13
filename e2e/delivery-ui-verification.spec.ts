import { test, expect } from '@playwright/test';

test.describe('納品管理ページ UI/UX 検証', () => {

  test('納品管理ページのフィルター部分の見た目を確認', async ({ page }) => {
    // セラーでログイン
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'seller@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-submit"]');

    // 納品管理ページに移動
    await page.goto('/delivery');
    await page.waitForLoadState('networkidle');

    console.log('=== 納品管理ページUI検証開始 ===');

    // フィルター部分の要素が存在することを確認
    await expect(page.locator('label:has-text("ステータス")')).toBeVisible();
    await expect(page.locator('label:has-text("期間")')).toBeVisible();
    await expect(page.locator('label:has-text("検索")')).toBeVisible();

    // スクリーンショットを撮影（初期状態）
    await page.screenshot({ path: 'delivery-initial-state.png', fullPage: true });
    console.log('初期状態スクリーンショット保存完了');

    // ステータス dropdown のスタイル確認
    const statusSelect = page.locator('select').first();
    await expect(statusSelect).toBeVisible();

    // 期間 dropdown のスタイル確認
    const periodSelect = page.locator('select').nth(1);
    await expect(periodSelect).toBeVisible();

    // 検索フィールドのスタイル確認
    const searchInput = page.locator('input[placeholder*="プラン番号、商品名、配送先倉庫で検索"]');
    await expect(searchInput).toBeVisible();

    console.log('基本要素の可視性確認完了');

    // CSS properties を確認
    const statusBorderColor = await statusSelect.evaluate(el => {
      return window.getComputedStyle(el).borderColor;
    });
    console.log('ステータスselect border color:', statusBorderColor);

    const periodBorderColor = await periodSelect.evaluate(el => {
      return window.getComputedStyle(el).borderColor;
    });
    console.log('期間select border color:', periodBorderColor);

    const searchBorderColor = await searchInput.evaluate(el => {
      return window.getComputedStyle(el).borderColor;
    });
    console.log('検索input border color:', searchBorderColor);

    // 期間を「期間指定」に変更してカスタム日付フィールドを表示
    await periodSelect.selectOption('custom');
    await page.waitForTimeout(500);

    // スクリーンショット撮影（カスタム期間表示状態）
    await page.screenshot({ path: 'delivery-custom-period-state.png', fullPage: true });
    console.log('カスタム期間状態スクリーンショット保存完了');

    // カスタム日付フィールドが表示されることを確認
    await expect(page.locator('label:has-text("開始日")')).toBeVisible();
    await expect(page.locator('label:has-text("終了日")')).toBeVisible();

    const startDateInput = page.locator('input[type="date"]').first();
    const endDateInput = page.locator('input[type="date"]').last();

    await expect(startDateInput).toBeVisible();
    await expect(endDateInput).toBeVisible();

    console.log('カスタム日付フィールドの表示確認完了');

    // カスタム日付フィールドのborder色も確認
    const startDateBorderColor = await startDateInput.evaluate(el => {
      return window.getComputedStyle(el).borderColor;
    });
    console.log('開始日input border color:', startDateBorderColor);

    const endDateBorderColor = await endDateInput.evaluate(el => {
      return window.getComputedStyle(el).borderColor;
    });
    console.log('終了日input border color:', endDateBorderColor);

    // テーブルヘッダーの確認
    await expect(page.locator('th:has-text("作成日")')).toBeVisible();
    await expect(page.locator('th:has-text("画像")')).toBeVisible();
    await expect(page.locator('th:has-text("商品名")')).toBeVisible();
    await expect(page.locator('th:has-text("商品数")')).toBeVisible();
    await expect(page.locator('th:has-text("配送先倉庫")')).toBeVisible();
    await expect(page.locator('th:has-text("ステータス")')).toBeVisible();
    await expect(page.locator('th:has-text("操作")')).toBeVisible();

    console.log('テーブルヘッダー確認完了');

    // 期間を「すべて」に戻してカスタム日付フィールドが非表示になることを確認
    await periodSelect.selectOption('all');
    await page.waitForTimeout(500);

    await expect(page.locator('label:has-text("開始日")')).not.toBeVisible();
    await expect(page.locator('label:has-text("終了日")')).not.toBeVisible();

    // 最終スクリーンショット（すべて期間状態）
    await page.screenshot({ path: 'delivery-final-state.png', fullPage: true });
    console.log('最終状態スクリーンショット保存完了');

    console.log('=== 納品管理ページUI検証完了 ===');
  });

  test('フィルター要素のスタイル統一性を検証', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'seller@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-submit"]');

    await page.goto('/delivery');
    await page.waitForLoadState('networkidle');

    console.log('=== スタイル統一性検証開始 ===');

    // 全ての select 要素と input 要素の border を確認
    const selects = page.locator('select');
    const inputs = page.locator('input');

    const selectCount = await selects.count();
    const inputCount = await inputs.count();

    console.log(`Select要素数: ${selectCount}, Input要素数: ${inputCount}`);

    // 各要素のborder色を収集
    const borderColors = [];

    for (let i = 0; i < selectCount; i++) {
      const element = selects.nth(i);
      const isVisible = await element.isVisible();
      if (isVisible) {
        const borderColor = await element.evaluate(el => {
          return window.getComputedStyle(el).borderColor;
        });
        borderColors.push(`select[${i}]: ${borderColor}`);
      }
    }

    for (let i = 0; i < inputCount; i++) {
      const element = inputs.nth(i);
      const isVisible = await element.isVisible();
      if (isVisible) {
        const borderColor = await element.evaluate(el => {
          return window.getComputedStyle(el).borderColor;
        });
        borderColors.push(`input[${i}]: ${borderColor}`);
      }
    }

    console.log('全要素のborder色:');
    borderColors.forEach(color => console.log(color));

    // border幅も確認
    const borderWidths = [];

    for (let i = 0; i < selectCount; i++) {
      const element = selects.nth(i);
      const isVisible = await element.isVisible();
      if (isVisible) {
        const borderWidth = await element.evaluate(el => {
          return window.getComputedStyle(el).borderWidth;
        });
        borderWidths.push(`select[${i}]: ${borderWidth}`);
      }
    }

    for (let i = 0; i < inputCount; i++) {
      const element = inputs.nth(i);
      const isVisible = await element.isVisible();
      if (isVisible) {
        const borderWidth = await element.evaluate(el => {
          return window.getComputedStyle(el).borderWidth;
        });
        borderWidths.push(`input[${i}]: ${borderWidth}`);
      }
    }

    console.log('全要素のborder幅:');
    borderWidths.forEach(width => console.log(width));

    console.log('=== スタイル統一性検証完了 ===');
  });

});