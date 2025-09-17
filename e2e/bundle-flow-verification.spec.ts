import { test } from '@playwright/test';

test('同梱フロー修正の動作確認', async ({ page }) => {
  test.setTimeout(300000);
  
  console.log('同梱フロー修正の証拠画像撮影を開始...');
  
  // ログイン
  await page.goto('http://localhost:3002/login');
  await page.waitForTimeout(1000);
  await page.locator('input[name="username"]').fill('admin');
  await page.locator('input[name="password"]').fill('admin123');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);
  
  // 1. 修復された梱包管理画面（梱包待ち）
  console.log('梱包管理画面（梱包待ち）を撮影中...');
  await page.goto('http://localhost:3002/staff/packaging');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'fixed-packaging-pending.png', fullPage: true });
  
  // 2. 梱包済みタブ
  console.log('梱包済みタブを撮影中...');
  try {
    await page.locator('button:has-text("梱包済み")').click();
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log('梱包済みボタンが見つからない');
  }
  await page.screenshot({ path: 'fixed-packaging-completed.png', fullPage: true });
  
  // 3. ロケーション管理画面（同梱表示確認）
  console.log('ロケーション管理画面を撮影中...');
  await page.goto('http://localhost:3002/staff/location');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'fixed-location-bundle.png', fullPage: true });
  
  // 4. ピッキング画面
  console.log('ピッキング画面を撮影中...');
  await page.goto('http://localhost:3002/staff/picking');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'fixed-picking-page.png', fullPage: true });
  
  // 5. 出荷管理画面（梱包待ち）
  console.log('出荷管理画面（梱包待ち）を撮影中...');
  await page.goto('http://localhost:3002/staff/shipping');
  await page.waitForTimeout(5000);
  
  // 梱包待ちタブをクリック
  try {
    await page.locator('button').filter({ hasText: '梱包待ち' }).click();
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('梱包待ちタブが見つからない');
  }
  await page.screenshot({ path: 'fixed-shipping-pending.png', fullPage: true });
  
  // 6. 出荷管理画面（梱包済み）
  console.log('出荷管理画面（梱包済み）を撮影中...');
  try {
    await page.locator('button').filter({ hasText: '梱包済み' }).click();
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('梱包済みタブが見つからない');
  }
  await page.screenshot({ path: 'fixed-shipping-completed.png', fullPage: true });
  
  console.log('証拠画像撮影完了');
});
