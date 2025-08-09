import { test, expect } from '@playwright/test';

test('配送ラベル生成モーダルの詳細デバッグ', async ({ page }) => {
  // セラーとしてログイン
  await page.goto('http://localhost:3002/login');
  await page.fill('input[name="email"]', 'seller@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  
  // 販売管理ページへ移動
  await page.goto('http://localhost:3002/sales');
  await page.waitForLoadState('networkidle');
  
  // ラベル生成ボタンをクリック
  await page.locator('button:has-text("ラベル生成")').first().click();
  await expect(page.locator('text="配送ラベル生成"')).toBeVisible();
  
  console.log('1. モーダル表示成功');
  
  // 初期状態のボタンを確認
  const buttons = await page.locator('button').all();
  console.log(`2. ボタン数: ${buttons.length}`);
  
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    const disabled = await buttons[i].isDisabled();
    console.log(`   ボタン${i}: "${text}" (無効: ${disabled})`);
  }
  
  // selectボックスの数を確認
  const selects = await page.locator('select').all();
  console.log(`3. Select数: ${selects.length}`);
  
  // 初期のselect値を確認
  if (selects.length > 0) {
    const initialValue = await selects[0].inputValue();
    console.log(`   初期値: "${initialValue}"`);
  }
  
  // FedExを選択
  console.log('4. FedExを選択中...');
  await page.selectOption('select', 'fedex');
  await page.waitForTimeout(2000); // 2秒待つ
  
  // 選択後の状態を確認
  const newSelectCount = await page.locator('select').all();
  console.log(`5. 選択後のSelect数: ${newSelectCount.length}`);
  
  // 選択後のボタン状態を確認
  const buttonsAfter = await page.locator('button').all();
  console.log(`6. 選択後のボタン数: ${buttonsAfter.length}`);
  
  for (let i = 0; i < buttonsAfter.length; i++) {
    const text = await buttonsAfter[i].textContent();
    const disabled = await buttonsAfter[i].isDisabled();
    console.log(`   ボタン${i}: "${text}" (無効: ${disabled})`);
  }
  
  // ラベルを探す
  const labels = await page.locator('label').all();
  console.log(`7. ラベル数: ${labels.length}`);
  
  for (let i = 0; i < labels.length; i++) {
    const text = await labels[i].textContent();
    console.log(`   ラベル${i}: "${text}"`);
  }
  
  // FedXサービス関連のテキストを探す
  const fedexServiceTexts = await page.locator('*').filter({ hasText: 'FedX' }).all();
  console.log(`8. FedXテキスト数: ${fedexServiceTexts.length}`);
  
  for (let i = 0; i < fedexServiceTexts.length; i++) {
    const text = await fedexServiceTexts[i].textContent();
    console.log(`   FedXテキスト${i}: "${text}"`);
  }
  
  // スクリーンショットを保存
  await page.screenshot({ path: 'debug-fedex-selection.png', fullPage: true });
  console.log('9. スクリーンショット保存: debug-fedx-selection.png');
});

