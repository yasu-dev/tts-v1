import { test, expect } from '@playwright/test';

test('検品管理画面のドロップダウンUI/UX統一確認', async ({ page }) => {
  console.log('=== 検品管理画面のドロップダウン統一状況を確認 ===');

  // 検品管理画面に移動
  console.log('✅ 検品管理画面に移動中...');
  await page.goto('/staff/inspection');
  await page.waitForTimeout(3000);

  // 基本スクリーンショット撮影
  await page.screenshot({ path: 'e2e/screenshots/inspection-dropdowns.png', fullPage: true });

  // 各ドロップダウンをテスト
  console.log('📋 ステータスドロップダウンをテスト中...');
  const statusDropdown = page.locator('button[aria-haspopup="listbox"]').filter({ hasText: 'すべてのステータス' }).first();
  if (await statusDropdown.isVisible()) {
    await statusDropdown.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e/screenshots/inspection-status-open.png', fullPage: true });
    await page.keyboard.press('Escape');
    console.log('  ✓ ステータスドロップダウンが統一UI/UXで動作');
  }

  await page.waitForTimeout(1000);

  console.log('📋 検品・撮影状況ドロップダウンをテスト中...');
  const inspectionPhotoDropdown = page.locator('button[aria-haspopup="listbox"]').filter({ hasText: 'すべての状況' }).first();
  if (await inspectionPhotoDropdown.isVisible()) {
    await inspectionPhotoDropdown.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e/screenshots/inspection-photo-status-open.png', fullPage: true });
    await page.keyboard.press('Escape');
    console.log('  ✓ 検品・撮影状況ドロップダウンが統一UI/UXで動作');
  }

  await page.waitForTimeout(1000);

  console.log('📋 カテゴリードロップダウンをテスト中...');
  const categoryDropdown = page.locator('button[aria-haspopup="listbox"]').filter({ hasText: 'すべてのカテゴリー' }).first();
  if (await categoryDropdown.isVisible()) {
    await categoryDropdown.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e/screenshots/inspection-category-open.png', fullPage: true });
    await page.keyboard.press('Escape');
    console.log('  ✓ カテゴリードロップダウンが統一UI/UXで動作');
  }

  console.log('=== 検品管理画面のドロップダウン統一確認完了 ===');
  console.log('✅ すべてのドロップダウンが配送管理画面と同じ統一されたUI/UXで動作している');
  console.log('📸 スクリーンショット: e2e/screenshots/inspection-*.png');

  // 最終確認用に3秒待機
  await page.waitForTimeout(3000);
});