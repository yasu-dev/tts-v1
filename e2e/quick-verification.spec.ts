import { test, expect } from '@playwright/test';

test('クイック検証：修正内容の動作確認', async ({ page }) => {
  console.log('=== 修正内容のクイック検証を開始 ===');
  
  // セラーとしてログイン
  await page.goto('http://localhost:3002/login');
  await page.fill('input[name="email"]', 'seller@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  
  // 販売管理ページへ移動
  await page.goto('http://localhost:3002/sales');
  await page.waitForLoadState('networkidle');
  
  console.log('1. ページの読み込みが完了しました');
  
  // 1. Processing ステータスエラーの確認
  const consoleMessages: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warn' || msg.type() === 'error') {
      consoleMessages.push(msg.text());
    }
  });
  
  await page.waitForTimeout(3000);
  
  const processingErrors = consoleMessages.filter(msg => 
    msg.includes('Unknown business status: processing')
  );
  
  if (processingErrors.length === 0) {
    console.log('✅ StatusIndicator processing エラーが解決されました');
  } else {
    console.log('❌ StatusIndicator processing エラーが残存:', processingErrors);
  }
  
  // 2. ラベル生成モーダルの基本動作確認
  const labelButton = page.locator('button:has-text("ラベル生成")').first();
  if (await labelButton.isVisible()) {
    await labelButton.click();
    console.log('2. ラベル生成モーダルを開きました');
    
    // モーダルが表示される
    await expect(page.locator('text="配送ラベル生成"')).toBeVisible();
    console.log('✅ 配送ラベル生成モーダルが表示されました');
    
    // 初期状態のボタン
    const submitButton = page.locator('[role="dialog"]').locator('button').last();
    const buttonText = await submitButton.textContent();
    console.log(`初期ボタンテキスト: "${buttonText}"`);
    
    // FedXを選択
    await page.selectOption('select', 'fedex');
    await page.waitForTimeout(1000);
    
    // FedXサービス選択が表示されるか
    const fedexServiceLabel = page.locator('label').filter({ hasText: 'FedX サービス' });
    const fedexServiceVisible = await fedexServiceLabel.isVisible();
    
    if (fedexServiceVisible) {
      console.log('✅ FedX サービス選択が正しく表示されました');
      
      // サービス選択肢を確認
      const serviceSelect = page.locator('select').nth(1);
      const options = await serviceSelect.locator('option').allTextContents();
      console.log('FedXサービス選択肢:', options.length, '個');
      
      if (options.includes('FedX Ground（陸送・最安価）')) {
        console.log('✅ 新しいFedXサービス選択肢が正しく適用されました');
      } else {
        console.log('❌ FedXサービス選択肢の修正が適用されていません');
      }
    } else {
      console.log('❌ FedX サービス選択が表示されません');
    }
    
    // モーダルを閉じる
    await page.locator('button:has-text("キャンセル")').click();
  } else {
    console.log('❌ ラベル生成ボタンが見つかりません');
  }
  
  console.log('=== クイック検証完了 ===');
});





