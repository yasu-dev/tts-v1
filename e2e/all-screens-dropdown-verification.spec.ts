import { test, expect } from '@playwright/test';

test('全画面のドロップダウンUI/UX統一確認', async ({ page }) => {
  // 各画面のドロップダウンを目視確認用にスクリーンショット撮影

  // 1. 配送管理画面 - 統一済みの基準画面
  console.log('配送管理画面のドロップダウンを確認中...');
  await page.goto('/delivery');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/screenshots/delivery-dropdowns.png', fullPage: true });

  // ステータスドロップダウンをクリックして開く
  const statusDropdown = page.locator('button').filter({ hasText: 'すべて' }).first();
  if (await statusDropdown.isVisible()) {
    await statusDropdown.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e/screenshots/delivery-status-open.png', fullPage: true });
    await page.keyboard.press('Escape');
  }

  // 2. スタッフ在庫管理画面 - 修正済み
  console.log('スタッフ在庫管理画面のドロップダウンを確認中...');
  await page.goto('/staff/inventory');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/screenshots/staff-inventory-dropdowns.png', fullPage: true });

  // 販売者ドロップダウンをテスト
  const sellerDropdown = page.locator('button').filter({ hasText: 'すべての販売者' }).first();
  if (await sellerDropdown.isVisible()) {
    await sellerDropdown.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e/screenshots/staff-inventory-seller-open.png', fullPage: true });
    await page.keyboard.press('Escape');
  }

  // 3. スタッフタスク管理画面 - 修正済み
  console.log('スタッフタスク管理画面のドロップダウンを確認中...');
  await page.goto('/staff/tasks');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/screenshots/staff-tasks-dropdowns.png', fullPage: true });

  // 担当者ドロップダウンをテスト
  const assigneeDropdown = page.locator('button').filter({ hasText: 'すべての担当者' }).first();
  if (await assigneeDropdown.isVisible()) {
    await assigneeDropdown.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e/screenshots/staff-tasks-assignee-open.png', fullPage: true });
    await page.keyboard.press('Escape');
  }

  // 4. 販売管理画面
  console.log('販売管理画面のドロップダウンを確認中...');
  await page.goto('/sales');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/screenshots/sales-dropdowns.png', fullPage: true });

  // 5. 出品管理画面
  console.log('出品管理画面のドロップダウンを確認中...');
  await page.goto('/listings');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/screenshots/listings-dropdowns.png', fullPage: true });

  // 6. 商品管理画面
  console.log('商品管理画面のドロップダウンを確認中...');
  await page.goto('/products');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/screenshots/products-dropdowns.png', fullPage: true });

  // 7. 注文管理画面
  console.log('注文管理画面のドロップダウンを確認中...');
  await page.goto('/orders');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/screenshots/orders-dropdowns.png', fullPage: true });

  // 8. 設定画面
  console.log('設定画面のドロップダウンを確認中...');
  await page.goto('/settings');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/screenshots/settings-dropdowns.png', fullPage: true });

  // 9. プロファイル設定画面
  console.log('プロファイル設定画面のドロップダウンを確認中...');
  await page.goto('/settings/profile');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/screenshots/settings-profile-dropdowns.png', fullPage: true });

  // 10. 通知設定画面
  console.log('通知設定画面のドロップダウンを確認中...');
  await page.goto('/settings/notifications');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/screenshots/settings-notifications-dropdowns.png', fullPage: true });

  console.log('全画面のスクリーンショット撮影完了 - screenshotsフォルダで確認してください');
  console.log('各画面のドロップダウンが統一されたUI/UXになっているか目視確認が必要です');

  // テスト期間中は手動確認用に10秒待機
  await page.waitForTimeout(10000);
});

test('モーダル内ドロップダウンの統一確認', async ({ page }) => {
  console.log('モーダル内のドロップダウンUI/UXを確認中...');

  // 商品追加モーダルなどのテスト
  await page.goto('/products');
  await page.waitForTimeout(2000);

  // 新規商品追加ボタンがある場合
  const addButton = page.locator('text=新規追加').or(page.locator('text=商品追加')).or(page.locator('button:has-text("追加")')).first();
  if (await addButton.isVisible()) {
    await addButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e/screenshots/product-modal-dropdowns.png', fullPage: true });

    // モーダル内のドロップダウンをテスト
    const modalDropdowns = page.locator('.modal select, .modal button[aria-haspopup="listbox"]');
    const count = await modalDropdowns.count();
    if (count > 0) {
      console.log(`モーダル内に${count}個のドロップダウンを発見`);
      await modalDropdowns.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/screenshots/product-modal-dropdown-open.png', fullPage: true });
    }

    // モーダルを閉じる
    await page.keyboard.press('Escape');
  }

  console.log('モーダル内ドロップダウンの確認完了');
});