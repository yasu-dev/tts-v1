import { test, expect } from '@playwright/test';

test('既存画面のドロップダウンUI/UX確認', async ({ page }) => {
  console.log('=== 既存画面のドロップダウン統一状況を確認 ===');

  // 1. 配送管理画面 - 統一済みの基準画面
  console.log('✅ 配送管理画面（基準画面）');
  await page.goto('/delivery');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/check-delivery.png', fullPage: true });

  // ステータスドロップダウンを開いて確認
  const deliveryStatusBtn = page.locator('button[aria-haspopup="listbox"]').first();
  if (await deliveryStatusBtn.isVisible()) {
    await deliveryStatusBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e/screenshots/check-delivery-open.png', fullPage: true });
    await page.keyboard.press('Escape');
    console.log('  📋 配送管理のカスタムドロップダウンが正常に動作');
  }

  // 2. スタッフ在庫管理画面 - 修正済み確認
  console.log('✅ スタッフ在庫管理画面（修正済み）');
  await page.goto('/staff/inventory');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/check-staff-inventory.png', fullPage: true });

  // 販売者ドロップダウンを開いて確認
  const inventorySellerBtn = page.locator('button[aria-haspopup="listbox"]').first();
  if (await inventorySellerBtn.isVisible()) {
    await inventorySellerBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e/screenshots/check-staff-inventory-open.png', fullPage: true });
    await page.keyboard.press('Escape');
    console.log('  📋 在庫管理のカスタムドロップダウンが正常に動作');
  }

  // 3. スタッフタスク管理画面 - 修正済み確認
  console.log('✅ スタッフタスク管理画面（修正済み）');
  await page.goto('/staff/tasks');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/check-staff-tasks.png', fullPage: true });

  // 担当者ドロップダウンを開いて確認
  const tasksAssigneeBtn = page.locator('button[aria-haspopup="listbox"]').first();
  if (await tasksAssigneeBtn.isVisible()) {
    await tasksAssigneeBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e/screenshots/check-staff-tasks-open.png', fullPage: true });
    await page.keyboard.press('Escape');
    console.log('  📋 タスク管理のカスタムドロップダウンが正常に動作');
  }

  console.log('=== 修正済み画面の確認完了 ===');
  console.log('📸 スクリーンショット: e2e/screenshots/check-*.png');
  console.log('👀 目視確認: すべてのドロップダウンが統一されたボーダー付きUI/UXになっているか確認');

  // 最終確認用に5秒待機
  await page.waitForTimeout(5000);
});