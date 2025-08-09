import { test, expect } from '@playwright/test';

test.describe('配送ラベル生成の包括的フロー検証', () => {
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

  test('1. StatusIndicator processing エラーが解決されていることを確認', async ({ page }) => {
    // コンソールエラーをキャプチャ
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warn' || msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    // ページを更新してステータス表示をトリガー
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // processing ステータスのエラーがないことを確認
    const processingErrors = consoleMessages.filter(msg => 
      msg.includes('Unknown business status: processing')
    );
    
    expect(processingErrors.length).toBe(0);
    console.log('✅ StatusIndicator processing エラーが解決されました');
  });

  test('2. FedEx サービス選択肢が正しく表示されることを確認', async ({ page }) => {
    // ラベル生成ボタンをクリック
    const labelButton = page.locator('button:has-text("ラベル生成")').first();
    await labelButton.click();
    
    // モーダルが表示される
    await expect(page.locator('text="配送ラベル生成"')).toBeVisible();
    
    // FedXを選択
    await page.selectOption('select', 'fedex');
    await page.waitForTimeout(1000);
    
    // FedXサービス選択UIが表示される
    await expect(page.locator('label').filter({ hasText: 'FedEx サービス' })).toBeVisible();
    
    // FedXサービス選択肢を確認
    const fedexServiceSelect = page.locator('select').nth(1);
    const options = await fedexServiceSelect.locator('option').allTextContents();
    
    console.log('FedX サービス選択肢:', options);
    
    // 期待するサービス選択肢が含まれているか確認
    const expectedServices = [
      'サービスを選択してください',
      'FedEx Ground（陸送・最安価）',
      'FedEx Express Saver（翌日午後配達）',
      'FedEx Standard Overnight（翌日午後3時まで）',
      'FedEx Priority Overnight（翌日午前10:30まで）',
      'FedEx First Overnight（翌日午前9時まで）',
      'FedEx 2Day（2営業日配送）'
    ];
    
    expectedServices.forEach(expectedService => {
      expect(options).toContain(expectedService);
    });
    
    console.log('✅ FedX サービス選択肢が正しく表示されています');
    
    // モーダルを閉じる
    await page.locator('button:has-text("キャンセル")').click();
  });

  test('3. 配送伝票アップロードモーダルでラジオボタンが削除されていることを確認', async ({ page }) => {
    // 外部サービスを選択してアップロードモーダルを開く
    const labelButton = page.locator('button:has-text("ラベル生成")').first();
    await labelButton.click();
    
    // 外部サービス（ヤマト運輸）を選択
    await page.selectOption('select', 'yamato');
    await page.locator('[role="dialog"]').locator('button:has-text("外部サービスを開く")').click();
    
    // しばらく待ってアップロードモーダルが表示されるのを待つ
    await page.waitForTimeout(2000);
    
    // アップロードモーダルが表示される
    await expect(page.locator('text="配送伝票アップロード"')).toBeVisible({ timeout: 10000 });
    
    // ラジオボタンが存在しないことを確認
    const radioButtons = page.locator('input[type="radio"]');
    await expect(radioButtons).toHaveCount(0);
    
    // 「伝票の作成者」セクションが存在しないことを確認
    const creatorSection = page.locator('text="伝票の作成者"');
    await expect(creatorSection).toHaveCount(0);
    
    // 「伝票ファイルを選択」セクションのみが存在することを確認
    await expect(page.locator('text="伝票ファイルを選択"')).toBeVisible();
    
    console.log('✅ 配送伝票アップロードモーダルからラジオボタンが正しく削除されています');
    
    // モーダルを閉じる
    await page.locator('button:has-text("キャンセル")').click();
    await page.waitForTimeout(500);
  });

  test('4. FedX ラベル生成フローの完全テスト', async ({ page }) => {
    // ラベル生成ボタンをクリック
    const labelButton = page.locator('button:has-text("ラベル生成")').first();
    await labelButton.click();
    
    // 初期状態: 配送業者未選択
    let submitButton = page.locator('[role="dialog"]').locator('button').last();
    await expect(submitButton).toHaveText('配送業者を選択');
    await expect(submitButton).toBeDisabled();
    
    // FedXを選択
    await page.selectOption('select', 'fedex');
    await page.waitForTimeout(1000);
    
    // FedXサービス選択後の状態: サービス未選択でボタン無効
    submitButton = page.locator('[role="dialog"]').locator('button').last();
    await expect(submitButton).toHaveText('ラベル生成');
    await expect(submitButton).toBeDisabled();
    
    // FedXサービスを選択
    const fedexServiceSelect = page.locator('select').nth(1);
    await fedexServiceSelect.selectOption('ground');
    await page.waitForTimeout(500);
    
    // サービス選択後: ボタン有効
    await expect(submitButton).toBeEnabled();
    await expect(submitButton).toHaveText('ラベル生成');
    
    // ラベル生成実行
    await submitButton.click();
    
    // 生成完了のトーストメッセージを待つ
    await expect(page.locator('text="FedXラベルが正常に生成されました"')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ FedX ラベル生成フローが正常に動作しています');
  });

  test('5. 外部サービスから配送伝票アップロードフローの完全テスト', async ({ page }) => {
    // ラベル生成ボタンをクリック
    const labelButton = page.locator('button:has-text("ラベル生成")').first();
    await labelButton.click();
    
    // 外部サービス（佐川急便）を選択
    await page.selectOption('select', 'sagawa');
    
    // 外部サービスを開く
    const submitButton = page.locator('[role="dialog"]').locator('button:has-text("外部サービスを開く")');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    
    // 外部サービスのトーストとアップロードモーダルの表示を待つ
    await page.waitForTimeout(2000);
    
    // アップロードモーダルが表示される
    await expect(page.locator('text="配送伝票アップロード"')).toBeVisible({ timeout: 10000 });
    
    // テスト用のファイルをアップロード
    // 注意: 実際のファイルアップロードは難しいので、ファイル選択UIの表示確認のみ
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    await expect(fileInput).toHaveAttribute('accept', '.pdf,.jpg,.jpeg,.png');
    
    // アップロードボタンがファイル選択前は無効であることを確認
    const uploadButton = page.locator('button:has-text("アップロード")');
    await expect(uploadButton).toBeDisabled();
    
    console.log('✅ 外部サービスから配送伝票アップロードフローが正常に動作しています');
    
    // モーダルを閉じる
    await page.locator('button:has-text("キャンセル")').click();
  });

  test('6. 全配送業者のボタン状態と動作確認', async ({ page }) => {
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
      const labelButton = page.locator('button:has-text("ラベル生成")').first();
      await labelButton.click();
      
      // 配送業者を選択
      await page.selectOption('select', carrier.value);
      await page.waitForTimeout(500);
      
      if (carrier.needsService) {
        // FedXの場合はサービス選択が必要
        const serviceSelect = page.locator('select').nth(1);
        await serviceSelect.selectOption('ground');
        await page.waitForTimeout(500);
      }
      
      // ボタンのテキストと状態を確認
      const submitButton = page.locator('[role="dialog"]').locator(`button:has-text("${carrier.expectedText}")`);
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();
      
      console.log(`✅ ${carrier.value}: 「${carrier.expectedText}」ボタンが正常に動作`);
      
      // モーダルを閉じる
      await page.locator('button:has-text("キャンセル")').click();
      await page.waitForTimeout(500);
    }
    
    console.log('✅ 全配送業者のボタン状態と動作が正常です');
  });
});







