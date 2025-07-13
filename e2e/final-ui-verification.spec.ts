import { test, expect } from '@playwright/test';

test.describe('🎯 最終UI動作確認', () => {
  test('ステータス変更メニューの完全動作テスト', async ({ page }) => {
    console.log('=== 最終UI動作確認開始 ===');

    // ページに移動
    await page.goto('/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // 1. ステータス変更ボタンの存在確認
    const statusButtons = page.locator('[role="button"]').filter({ hasText: 'ステータス変更' });
    const buttonCount = await statusButtons.count();
    console.log(`✅ ステータス変更ボタン数: ${buttonCount}`);
    expect(buttonCount).toBeGreaterThan(0);

    // 2. ボタンクリックでドロップダウン表示
    const firstButton = statusButtons.first();
    await firstButton.click();
    
    const dropdown = page.locator('[data-testid="unified-status-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    console.log('✅ ドロップダウンが正常に表示');

    // 3. z-indexが正しく設定されている
    const zIndex = await dropdown.evaluate((el) => window.getComputedStyle(el).zIndex);
    expect(parseInt(zIndex)).toBe(10000);
    console.log(`✅ z-index: ${zIndex}`);

    // 4. ステータスオプションの表示確認
    const statusOptions = dropdown.locator('.unified-status-option');
    const optionCount = await statusOptions.count();
    console.log(`✅ ステータスオプション数: ${optionCount}`);
    expect(optionCount).toBeGreaterThan(0);

    // 5. ステータス変更の実行
    if (optionCount > 0) {
      const firstOption = statusOptions.first();
      const optionText = await firstOption.locator('.unified-status-option-label').textContent();
      console.log(`🔄 ステータス変更実行: ${optionText}`);
      
      await firstOption.click();
      
      // ドロップダウンが閉じることを確認
      await expect(dropdown).not.toBeVisible({ timeout: 3000 });
      console.log('✅ ステータス変更後にドロップダウンが閉じた');
      
      // トーストメッセージの確認
      const toast = page.locator('.toast, [role="alert"]').first();
      if (await toast.isVisible({ timeout: 2000 })) {
        const toastText = await toast.textContent();
        console.log(`✅ トーストメッセージ: ${toastText}`);
      }
    }

    // 6. 外側クリックでドロップダウンが閉じる
    await firstButton.click(); // 再度開く
    await expect(dropdown).toBeVisible({ timeout: 3000 });
    
    await page.click('body', { position: { x: 50, y: 50 } });
    await expect(dropdown).not.toBeVisible({ timeout: 3000 });
    console.log('✅ 外側クリックでドロップダウンが閉じた');

    // 7. 複数のボタンの動作確認
    if (buttonCount > 1) {
      await statusButtons.nth(0).click();
      await expect(dropdown).toBeVisible({ timeout: 3000 });
      
      await statusButtons.nth(1).click();
      await page.waitForTimeout(500);
      
      const visibleDropdowns = page.locator('[data-testid="unified-status-dropdown"]:visible');
      const visibleCount = await visibleDropdowns.count();
      console.log(`✅ 同時に開いているドロップダウン数: ${visibleCount}`);
      expect(visibleCount).toBeLessThanOrEqual(1);
    }

    console.log('🎉 すべてのテストが成功しました！');
  });

  test('UI一貫性の最終確認', async ({ page }) => {
    console.log('=== UI一貫性の最終確認 ===');

    await page.goto('/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // ステータス変更ボタンのスタイル確認
    const statusButton = page.locator('[role="button"]').filter({ hasText: 'ステータス変更' }).first();
    await statusButton.click();

    const dropdown = page.locator('[data-testid="unified-status-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // 統一されたCSSクラスの確認
    const hasUnifiedClass = await dropdown.evaluate((el) => el.classList.contains('unified-status-menu'));
    console.log(`✅ 統一CSSクラス適用: ${hasUnifiedClass}`);
    expect(hasUnifiedClass).toBe(true);

    // ステータスオプションのスタイル確認
    const statusOptions = dropdown.locator('.unified-status-option');
    const firstOption = statusOptions.first();
    
    if (await firstOption.isVisible()) {
      const optionClasses = await firstOption.getAttribute('class');
      console.log(`✅ オプションCSSクラス: ${optionClasses}`);
      expect(optionClasses).toContain('unified-status-option');
    }

    console.log('🎨 UI一貫性確認完了');
  });
}); 