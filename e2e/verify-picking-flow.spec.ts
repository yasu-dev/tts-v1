import { test, expect } from '@playwright/test';

test('ピッキング完了フローの動作確認', async ({ page }) => {
  console.log('1. 出荷管理画面にアクセス');
  await page.goto('http://localhost:3002/staff/shipping');
  await page.waitForLoadState('networkidle');

  console.log('2. 梱包待ちタブをクリック');
  const packingTab = page.locator('button').filter({ hasText: '梱包待ち' }).first();
  if (await packingTab.isVisible()) {
    await packingTab.click();
    await page.waitForTimeout(2000);
  }

  console.log('3. 画面のスクリーンショットを撮影');
  await page.screenshot({
    path: 'shipping-workstation-tab.png',
    fullPage: true
  });

  console.log('4. 梱包待ちリストの内容を確認');
  const tableContent = await page.locator('table, .grid').first().textContent();
  console.log('梱包待ちリストの内容:', tableContent?.substring(0, 500));

  // TESTカメラNまたは他の商品が表示されているか確認
  const hasItems = tableContent && tableContent.length > 50;
  console.log('梱包待ちリストにアイテムが存在:', hasItems);

  expect(hasItems).toBeTruthy();
});