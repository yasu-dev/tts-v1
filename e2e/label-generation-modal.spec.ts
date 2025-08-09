import { test, expect } from '@playwright/test';

test.describe('配送ラベル生成モーダル', () => {
  test.beforeEach(async ({ page }) => {
    // セラーとしてログイン
    await page.goto('http://localhost:3002/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // 販売管理ページへ移動
    await page.goto('http://localhost:3002/sales');
    await page.waitForLoadState('networkidle');
  });

  test('初期状態でボタンが正しく表示される', async ({ page }) => {
    // ラベル生成ボタンをクリックしてモーダルを開く
    const labelButton = page.locator('button:has-text("ラベル生成")').first();
    await expect(labelButton).toBeVisible();
    await labelButton.click();
    
    // モーダルが表示される
    await expect(page.locator('text="配送ラベル生成"')).toBeVisible();
    
    // 初期状態でボタンが無効かつ正しいテキストが表示される
    const submitButton = page.locator('[role="dialog"]').locator('button:has-text("配送業者を選択")');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
    
    console.log('✓ 初期状態: ボタンは無効で「配送業者を選択」テキスト表示');
  });

  test('FedEx選択時のボタン動作', async ({ page }) => {
    // モーダルを開く
    await page.locator('button:has-text("ラベル生成")').first().click();
    await expect(page.locator('text="配送ラベル生成"')).toBeVisible();
    
    // FedExを選択
    await page.selectOption('select', 'fedex');
    
    // FedExサービス選択UIが表示される
    await expect(page.locator('text="FedEx サービス"')).toBeVisible();
    
    // この時点でボタンはまだ無効（サービス未選択）
    const submitButton = page.locator('[role="dialog"]').locator('button:has-text("ラベル生成")');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
    
    // FedExサービスを選択
    const serviceSelect = page.locator('select').nth(1);
    await serviceSelect.selectOption('standard');
    
    // ボタンが有効になり、テキストが「ラベル生成」になる
    await expect(submitButton).toBeEnabled();
    await expect(submitButton).toHaveText('ラベル生成');
    
    console.log('✓ FedX選択時: サービス選択後にボタンが有効化され「ラベル生成」テキスト表示');
  });

  test('外部サービス選択時のボタン動作', async ({ page }) => {
    // モーダルを開く
    await page.locator('button:has-text("ラベル生成")').first().click();
    await expect(page.locator('text="配送ラベル生成"')).toBeVisible();
    
    // ヤマト運輸を選択
    await page.selectOption('select', 'yamato');
    
    // 注意メッセージが表示される
    await expect(page.locator('text="外部サイトでラベルを生成後、アップロードしてください"')).toBeVisible();
    
    // ボタンが有効になり、テキストが「外部サービスを開く」になる
    const submitButton = page.locator('[role="dialog"]').locator('button:has-text("外部サービスを開く")');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    
    console.log('✓ 外部サービス選択時: ボタンが有効化され「外部サービスを開く」テキスト表示');
  });

  test('プルダウン選択を戻した時の動作', async ({ page }) => {
    // モーダルを開く
    await page.locator('button:has-text("ラベル生成")').first().click();
    await expect(page.locator('text="配送ラベル生成"')).toBeVisible();
    
    // FedXを選択
    await page.selectOption('select', 'fedex');
    await expect(page.locator('text="FedEx サービス"')).toBeVisible();
    
    // 配送業者を未選択に戻す
    await page.selectOption('select', '');
    
    // ボタンが無効になり、テキストが「配送業者を選択」に戻る
    const submitButton = page.locator('[role="dialog"]').locator('button:has-text("配送業者を選択")');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
    
    console.log('✓ 選択解除時: ボタンが無効化され「配送業者を選択」テキストに戻る');
  });

  test('全配送業者のボタン状態確認', async ({ page }) => {
    const carriers = [
      { value: 'fedex', expectedText: 'ラベル生成', needsService: true },
      { value: 'yamato', expectedText: '外部サービスを開く', needsService: false },
      { value: 'sagawa', expectedText: '外部サービスを開く', needsService: false },
      { value: 'japan-post', expectedText: '外部サービスを開く', needsService: false },
      { value: 'dhl', expectedText: '外部サービスを開く', needsService: false },
      { value: 'ups', expectedText: '外部サービスを開く', needsService: false }
    ];

    for (const carrier of carriers) {
      // モーダルを開く
      await page.locator('button:has-text("ラベル生成")').first().click();
      await expect(page.locator('text="配送ラベル生成"')).toBeVisible();
      
      // 配送業者を選択
      await page.selectOption('select', carrier.value);
      
      if (carrier.needsService) {
        // FedXの場合はサービス選択が必要
        const serviceSelect = page.locator('select').nth(1);
        await serviceSelect.selectOption('standard');
      }
      
      // ボタンのテキストと状態を確認
      const submitButton = page.locator('[role="dialog"]').locator(`button:has-text("${carrier.expectedText}")`);
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();
      
      console.log(`✓ ${carrier.value}: 「${carrier.expectedText}」ボタンが有効`);
      
      // モーダルを閉じる
      await page.locator('button:has-text("キャンセル")').click();
      await page.waitForTimeout(500);
    }
  });
});
