import { test } from '@playwright/test';

test('同梱証拠画像撮影', async ({ page }) => {
  test.setTimeout(60000);

  console.log('📸 同梱証拠画像撮影開始...');

  // ログイン
  await page.goto('http://localhost:3002/login');
  await page.waitForTimeout(1000);
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // ロケーション管理画面
  console.log('📍 ロケーション管理画面証拠撮影...');
  await page.goto('http://localhost:3002/staff/location');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'location-bundle-evidence.png', fullPage: true });

  // 梱包管理画面（梱包待ち）
  console.log('📦 梱包管理画面（梱包待ち）証拠撮影...');
  await page.goto('http://localhost:3002/staff/packaging');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'packaging-pending-bundle-evidence.png', fullPage: true });

  // 梱包済みタブ
  try {
    await page.click('button:has-text("梱包済み")');
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('梱包済みタブクリックをスキップ');
  }
  console.log('📦 梱包管理画面（梱包済み）証拠撮影...');
  await page.screenshot({ path: 'packaging-completed-bundle-evidence.png', fullPage: true });

  // 出荷管理画面
  console.log('🚚 出荷管理画面証拠撮影...');
  await page.goto('http://localhost:3002/staff/shipping');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'shipping-bundle-evidence.png', fullPage: true });

  console.log('✅ 全証拠画像撮影完了');
});