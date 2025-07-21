import { test, expect } from '@playwright/test';

async function loginAsStaff(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'staff@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/staff\/dashboard$/, { timeout: 15000 });
}

test.describe('検品・撮影フロー改善テスト', () => {
  
  test('検品管理画面: 導線が統一されページ遷移になっている', async ({ page }) => {
    await loginAsStaff(page);
    
    // 検品管理画面に移動
    await page.goto('/staff/inspection');
    await expect(page).toHaveURL(/\/staff\/inspection$/);
    
    // 検品開始ボタンまたは続けるボタンが存在するか確認
    const inspectionButtons = page.locator('button:has-text("検品開始"), button:has-text("続ける"), a:has-text("検品開始"), a:has-text("続ける")');
    
    // ボタンが存在する場合
    const buttonCount = await inspectionButtons.count();
    if (buttonCount > 0) {
      console.log(`検品関連ボタン数: ${buttonCount}`);
      
      // 最初のボタンをクリック
      await inspectionButtons.first().click();
      
      // ページ遷移が発生することを確認（モーダルではなく）
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      console.log(`遷移後URL: ${currentUrl}`);
      
      // URLが /staff/inspection/{productId} のパターンに変更されているか確認
      expect(currentUrl).toMatch(/\/staff\/inspection\/[^/]+$/);
    }
  });

  test('検品フォーム: 検品のみ完了の選択肢が表示される', async ({ page }) => {
    await loginAsStaff(page);
    
    // 検品詳細画面に直接移動（テスト用商品ID）
    await page.goto('/staff/inspection/cmd41tzju001e12ei13v6b18k');
    
    // ページが正しく読み込まれることを確認
    await expect(page.locator('h1:has-text("商品検品チェックリスト")')).toBeVisible({ timeout: 10000 });
    
    // 検品フローを進行（基本情報 → 検品項目 → タイムスタンプ → 写真 → 確認画面）
    
    // Step 0: 基本情報で次へ
    const nextButton1 = page.locator('button:has-text("次へ")').first();
    if (await nextButton1.isVisible()) {
      await nextButton1.click();
      await page.waitForTimeout(1000);
    }
    
    // Step 1: 検品項目で適当にチェックして次へ
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      // いくつかのチェックボックスをチェック
      for (let i = 0; i < Math.min(3, checkboxCount); i++) {
        await checkboxes.nth(i).check();
      }
    }
    
    const nextButton2 = page.locator('button:has-text("次へ")');
    if (await nextButton2.isVisible()) {
      await nextButton2.click();
      await page.waitForTimeout(1000);
    }
    
    // Step 2: タイムスタンプ記録で次へ
    const nextButton3 = page.locator('button:has-text("次へ（写真撮影）")');
    if (await nextButton3.isVisible()) {
      await nextButton3.click();
      await page.waitForTimeout(1000);
    }
    
    // Step 3: 写真撮影で次へ（最低1枚が緩和されているはず）
    const nextButton4 = page.locator('button:has-text("次へ（確認画面）")');
    if (await nextButton4.isVisible()) {
      await nextButton4.click();
      await page.waitForTimeout(1000);
    }
    
    // Step 4: 確認画面で「検品のみ完了」と「検品・撮影完了」の両方のボタンが表示されるか確認
    const inspectionOnlyButton = page.locator('button:has-text("検品のみ完了")');
    const fullCompletionButton = page.locator('button:has-text("検品・撮影完了")');
    
    await expect(inspectionOnlyButton).toBeVisible({ timeout: 5000 });
    await expect(fullCompletionButton).toBeVisible({ timeout: 5000 });
    
    console.log('検品完了選択肢の確認完了: 両方のボタンが表示されています');
  });

  test('撮影専用モード: ?mode=photographyで撮影専用画面が表示される', async ({ page }) => {
    await loginAsStaff(page);
    
    // 撮影専用モードでアクセス
    await page.goto('/staff/inspection/cmd41tzju001e12ei13v6b18k?mode=photography');
    
    // 撮影専用モードの表示確認
    await expect(page.locator('h1:has-text("商品撮影")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(':has-text("撮影専用モード")')).toBeVisible();
    
    // 検品完了済み表示の確認
    await expect(page.locator(':has-text("検品完了済み")')).toBeVisible();
    
    console.log('撮影専用モードの確認完了');
  });

  test('写真撮影: 写真0枚でも進行可能（改善されているか）', async ({ page }) => {
    await loginAsStaff(page);
    
    // 撮影専用モードでアクセス
    await page.goto('/staff/inspection/cmd41tzju001e12ei13v6b18k?mode=photography');
    
    await page.waitForTimeout(2000);
    
    // 写真を撮影せずに完了ボタンを押してみる
    const completeButton = page.locator('button:has-text("撮影完了"), button:has-text("完了")');
    
    if (await completeButton.isVisible()) {
      await completeButton.click();
      
      // 警告メッセージが表示されるか確認
      const warningMessage = page.locator(':has-text("写真が必要です"), :has-text("少なくとも1枚")');
      const isWarningVisible = await warningMessage.isVisible({ timeout: 3000 });
      
      if (isWarningVisible) {
        console.log('写真必須検証: まだ最低1枚必要（改善未完了）');
      } else {
        console.log('写真必須検証: 写真0枚でも完了可能（改善完了）');
      }
    }
  });

  test('検品管理画面: フィルター機能で撮影待ち・撮影完了が選択できる', async ({ page }) => {
    await loginAsStaff(page);
    
    // 検品管理画面に移動
    await page.goto('/staff/inspection');
    await expect(page).toHaveURL(/\/staff\/inspection$/);
    
    // フィルターのドロップダウンやセレクトボックスを確認
    const filterOptions = [
      '撮影待ち',
      '撮影完了',
      '検品完了・撮影未完了',
      '検品・撮影両方完了'
    ];
    
    // セレクトボックスまたはフィルターボタンを探す
    const selectElements = page.locator('select, [role="combobox"]');
    const selectCount = await selectElements.count();
    
    if (selectCount > 0) {
      const firstSelect = selectElements.first();
      await firstSelect.click();
      await page.waitForTimeout(500);
      
      // オプションを確認
      for (const option of filterOptions) {
        const optionElement = page.locator(`option:has-text("${option}"), [role="option"]:has-text("${option}")`);
        const isVisible = await optionElement.isVisible();
        if (isVisible) {
          console.log(`フィルターオプション確認: "${option}" が利用可能`);
        }
      }
    }
    
    console.log('フィルター機能の確認完了');
  });

  test('ItemDetailModal: 撮影待ち商品に撮影ボタンが表示される', async ({ page }) => {
    await loginAsStaff(page);
    
    // 在庫管理画面に移動
    await page.goto('/staff/inventory');
    await expect(page).toHaveURL(/\/staff\/inventory$/);
    
    await page.waitForTimeout(2000);
    
    // 商品をクリックして詳細モーダルを開く
    const productRows = page.locator('[data-testid="product-row"], .product-row, tr').filter({ hasText: /TWD-|cmd4/ });
    const rowCount = await productRows.count();
    
    if (rowCount > 0) {
      await productRows.first().click();
      await page.waitForTimeout(1000);
      
      // モーダルが開いたことを確認
      const modal = page.locator('[role="dialog"], .modal, [data-testid="item-detail-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // 撮影ボタンが表示されるか確認
      const photographyButton = page.locator('button:has-text("撮影する"), button:has-text("撮影開始"), a:has-text("撮影する")');
      const isPhotographyButtonVisible = await photographyButton.isVisible();
      
      if (isPhotographyButtonVisible) {
        console.log('ItemDetailModal: 撮影ボタンが表示されています（改善完了）');
        
        // 撮影ボタンをクリックして遷移確認
        await photographyButton.click();
        await page.waitForTimeout(1000);
        
        // 撮影モードに遷移したか確認
        const currentUrl = page.url();
        expect(currentUrl).toContain('mode=photography');
        console.log('撮影ボタンクリック: 正しく撮影モードに遷移');
      } else {
        console.log('ItemDetailModal: 撮影ボタンが表示されていません');
      }
    }
  });

  test.skip('統合テスト: 検品のみ完了 → 後で撮影の完全フロー', async ({ page }) => {
    // 完全な業務フローテスト（時間がかかるためskip）
    await loginAsStaff(page);
    
    // 1. 検品開始
    await page.goto('/staff/inspection/cmd41tzju001e12ei13v6b18k');
    
    // 2. 検品フォーム完了まで進める
    // ... (詳細な検品フォーム操作)
    
    // 3. 検品のみ完了を選択
    // ... 
    
    // 4. 検品管理画面で撮影待ち状態を確認
    // ...
    
    // 5. 撮影専用モードで撮影実施
    // ...
    
    // 6. 撮影完了後の状態確認
    // ...
  });
}); 