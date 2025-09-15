import { test, expect } from '@playwright/test';

test('ピッキング完了後に出荷管理画面で梱包待ちとして表示される', async ({ page }) => {
  // 在庫管理画面にアクセス
  await page.goto('http://localhost:3002/staff/inventory');
  await page.waitForLoadState('networkidle');

  // TESTカメラMを検索
  const searchInput = page.locator('input[placeholder*="商品名"]').first();
  await searchInput.fill('TESTカメラM');
  await page.waitForTimeout(1000);

  // TESTカメラMを選択
  const testCameraRow = page.locator('tr').filter({ hasText: 'TESTカメラM' }).first();
  const checkbox = testCameraRow.locator('input[type="checkbox"]');
  await checkbox.check();

  // ピッキング完了ボタンをクリック
  const pickingCompleteButton = page.locator('button').filter({ hasText: 'ピッキング完了' });
  await pickingCompleteButton.click();

  // 確認ダイアログが表示される場合は確認
  const confirmButton = page.locator('button').filter({ hasText: /確認|OK/ });
  if (await confirmButton.isVisible({ timeout: 1000 })) {
    await confirmButton.click();
  }

  // 成功メッセージを待つ
  await page.waitForTimeout(2000);

  // 出荷管理画面に移動
  await page.goto('http://localhost:3002/staff/shipping');
  await page.waitForLoadState('networkidle');

  // 梱包待ちタブをクリック
  const packingTab = page.locator('button, div').filter({ hasText: /梱包待ち/ }).first();
  await packingTab.click();
  await page.waitForTimeout(1000);

  // TESTカメラMが梱包待ちリストに表示されているか確認
  const shippingList = page.locator('table, div.grid');
  const testCameraItem = shippingList.locator('text=/TESTカメラM/');

  // スクリーンショットを撮影
  await page.screenshot({ path: 'test-picking-result.png', fullPage: true });

  // アサーション
  await expect(testCameraItem).toBeVisible();
  console.log('✅ TESTカメラMが梱包待ちリストに正しく表示されています');
});