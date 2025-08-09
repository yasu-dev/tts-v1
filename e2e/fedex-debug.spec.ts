import { test, expect } from '@playwright/test';

test('FedX サービス選択デバッグ', async ({ page }) => {
  // セラーとしてログイン
  await page.goto('http://localhost:3002/login');
  await page.fill('input[name="email"]', 'seller@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  
  // 販売管理ページへ移動
  await page.goto('http://localhost:3002/sales');
  await page.waitForLoadState('networkidle');
  
  // ラベル生成モーダルを開く
  const labelButton = page.locator('button:has-text("ラベル生成")').first();
  await labelButton.click();
  
  // モーダルが表示される
  await expect(page.locator('text="配送ラベル生成"')).toBeVisible();
  
  console.log('1. モーダル表示成功');
  
  // 初期のselect要素数を確認
  const initialSelects = await page.locator('select').all();
  console.log(`2. 初期Select要素数: ${initialSelects.length}`);
  
  // FedXを選択する前のHTMLを取得
  const beforeHtml = await page.locator('[role="dialog"]').innerHTML();
  console.log('3. FedX選択前のHTML長:', beforeHtml.length);
  
  // FedXを選択
  console.log('4. FedXを選択中...');
  await page.selectOption('select', 'fedex');
  await page.waitForTimeout(3000); // 3秒待つ
  
  // 選択後のselect要素数を確認
  const afterSelects = await page.locator('select').all();
  console.log(`5. 選択後Select要素数: ${afterSelects.length}`);
  
  // FedXを選択した後のHTMLを取得
  const afterHtml = await page.locator('[role="dialog"]').innerHTML();
  console.log('6. FedX選択後のHTML長:', afterHtml.length);
  
  // selectedCarrier の値を確認（JavaScript評価）
  const selectedCarrier = await page.evaluate(() => {
    // モーダル内のselect要素の値を取得
    const selectElement = document.querySelector('select');
    return selectElement ? selectElement.value : 'not found';
  });
  console.log(`7. selectedCarrier値: "${selectedCarrier}"`);
  
  // 'FedX サービス' のテキストが存在するかチェック
  const fedxTexts = await page.locator('text="FedX サービス"').count();
  console.log(`8. "FedX サービス" テキスト数: ${fedxTexts}`);
  
  // 'FedX サービス' を含むlabel要素を探す
  const fedxLabels = await page.locator('label').filter({ hasText: 'FedX サービス' }).count();
  console.log(`9. FedX サービスlabel数: ${fedxLabels}`);
  
  // すべてのラベルテキストを取得
  const allLabels = await page.locator('label').allTextContents();
  console.log('10. すべてのラベル:', allLabels);
  
  // スクリーンショットを撮る
  await page.screenshot({ path: 'fedx-debug-screenshot.png', fullPage: true });
  console.log('11. スクリーンショット保存完了');
  
  // selectedCarrier === 'fedx' の条件式をチェック
  const conditionResult = await page.evaluate(() => {
    const selectElement = document.querySelector('select');
    const value = selectElement ? selectElement.value : '';
    return {
      value: value,
      isFedx: value === 'fedex',
      comparison: `"${value}" === "fedex"`
    };
  });
  console.log('12. 条件式の結果:', conditionResult);
});
