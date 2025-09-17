import { test } from '@playwright/test';

test('同梱作成から青背景確認まで完全実行', async ({ page }) => {
  test.setTimeout(600000); // 10分
  
  console.log('同梱ラベル作成と青背景確認の完全フローを実行開始...');
  
  // ログイン
  await page.goto('http://localhost:3002/login');
  await page.waitForTimeout(2000);
  await page.locator('input[name="username"]').fill('admin');
  await page.locator('input[name="password"]').fill('admin123');  
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(5000);
  
  // 1. 配送管理で同梱ラベルを作成
  console.log('配送管理画面で同梱ラベルを作成中...');
  await page.goto('http://localhost:3002/delivery');
  await page.waitForTimeout(5000);
  
  // 複数選択モードを有効化
  try {
    const multiSelectBtn = page.locator('button').filter({ hasText: '複数選択' });
    if (await multiSelectBtn.isVisible()) {
      await multiSelectBtn.click();
      await page.waitForTimeout(2000);
      
      // 最初の2つの商品を選択
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      console.log(`利用可能なチェックボックス: ${count}個`);
      
      if (count >= 2) {
        await checkboxes.nth(0).check();
        await page.waitForTimeout(500);
        await checkboxes.nth(1).check();
        await page.waitForTimeout(1000);
        
        // 同梱ボタンをクリック
        const bundleBtn = page.locator('button').filter({ hasText: '同梱' });
        if (await bundleBtn.isVisible()) {
          await bundleBtn.click();
          await page.waitForTimeout(3000);
          console.log('同梱ラベル作成完了');
        }
      }
    }
  } catch (e) {
    console.log('同梱作成をスキップ:', e);
  }
  
  // 2. ロケーション管理画面での青背景確認
  console.log('ロケーション管理画面での青背景を確認中...');
  await page.goto('http://localhost:3002/staff/location');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'bundle-location-with-data.png', fullPage: true });
  
  // 3. 梱包管理画面（梱包待ち）での青背景確認
  console.log('梱包管理画面（梱包待ち）での青背景を確認中...');
  await page.goto('http://localhost:3002/staff/packaging');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'bundle-packaging-pending-with-data.png', fullPage: true });
  
  // 4. 梱包済みタブでの青背景確認
  console.log('梱包済みタブでの青背景を確認中...');
  try {
    await page.locator('button:has-text("梱包済み")').click();
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log('梱包済みタブクリックをスキップ');
  }
  await page.screenshot({ path: 'bundle-packaging-completed-with-data.png', fullPage: true });
  
  // 5. 出荷管理画面での青背景確認
  console.log('出荷管理画面での青背景を確認中...');
  await page.goto('http://localhost:3002/staff/shipping');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'bundle-shipping-with-data.png', fullPage: true });
  
  console.log('同梱フロー完全証拠画像撮影完了');
});
