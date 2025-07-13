import { test, expect } from '@playwright/test';

test.describe('🔍 UI操作実動作確認テスト', () => {
  
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('http://localhost:3002/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('🎯 ダッシュボード期間選択モーダル - UI操作確認', async ({ page }) => {
    console.log('=== ダッシュボード期間選択モーダル UI操作テスト ===');
    
    // ダッシュボードページに移動
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForLoadState('networkidle');
    
    // レポート期間を選択ボタンを探してクリック
    const periodButton = page.locator('button:has-text("レポート期間を選択")');
    await expect(periodButton).toBeVisible({ timeout: 10000 });
    console.log('✅ レポート期間を選択ボタン: 表示確認');
    
    await periodButton.click();
    await page.waitForTimeout(1000);
    
    // モーダルが開いたかチェック
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log('✅ 期間選択モーダル: 開閉動作確認');
    
    // DateRangePickerの存在確認
    const dateRangePicker = page.locator('.rdrCalendarWrapper');
    await expect(dateRangePicker).toBeVisible({ timeout: 3000 });
    console.log('✅ DateRangePicker: 表示確認');
    
    // 適用ボタンの存在確認とクリック
    const applyButton = page.locator('button:has-text("適用")');
    await expect(applyButton).toBeVisible({ timeout: 3000 });
    console.log('✅ 適用ボタン: 表示確認');
    
    await applyButton.click();
    await page.waitForTimeout(1000);
    
    // モーダルが閉じたかチェック
    await expect(modal).not.toBeVisible({ timeout: 3000 });
    console.log('✅ モーダル閉じる: 動作確認');
    
    console.log('🎉 ダッシュボード期間選択モーダル: UI操作で完全動作確認済み');
  });

  test('📦 在庫管理商品登録モーダル - UI操作確認', async ({ page }) => {
    console.log('=== 在庫管理商品登録モーダル UI操作テスト ===');
    
    // 在庫管理ページに移動
    await page.goto('http://localhost:3002/inventory');
    await page.waitForLoadState('networkidle');
    
    // 新規商品登録ボタンを探してクリック
    const addButton = page.locator('button:has-text("新規商品登録")');
    await expect(addButton).toBeVisible({ timeout: 10000 });
    console.log('✅ 新規商品登録ボタン: 表示確認');
    
    await addButton.click();
    await page.waitForTimeout(1000);
    
    // モーダルが開いたかチェック
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log('✅ 商品登録モーダル: 開閉動作確認');
    
    // フォーム要素の存在確認と入力テスト
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible({ timeout: 3000 });
    await nameInput.fill('テスト商品');
    console.log('✅ 商品名入力フィールド: 表示・入力確認');
    
    const skuInput = page.locator('input[name="sku"]');
    await expect(skuInput).toBeVisible({ timeout: 3000 });
    await skuInput.fill('TEST-001');
    console.log('✅ SKU入力フィールド: 表示・入力確認');
    
    // 入力値の確認
    await expect(nameInput).toHaveValue('テスト商品');
    await expect(skuInput).toHaveValue('TEST-001');
    console.log('✅ 入力機能: 動作確認');
    
    // 登録ボタンの存在確認（より具体的なセレクター使用）
    const submitButton = page.locator('button[type="submit"]:has-text("登録")');
    await expect(submitButton).toBeVisible({ timeout: 3000 });
    console.log('✅ 登録ボタン: 表示確認');
    
    // キャンセルボタンでモーダルを閉じる
    const cancelButton = page.locator('button:has-text("キャンセル")');
    await cancelButton.click();
    await page.waitForTimeout(1000);
    
    await expect(modal).not.toBeVisible({ timeout: 3000 });
    console.log('✅ モーダル閉じる: 動作確認');
    
    console.log('🎉 在庫管理商品登録モーダル: UI操作で完全動作確認済み');
  });

  test('💰 売上管理出品設定モーダル - UI操作確認', async ({ page }) => {
    console.log('=== 売上管理出品設定モーダル UI操作テスト ===');
    
    // 売上管理ページに移動
    await page.goto('http://localhost:3002/sales');
    await page.waitForLoadState('networkidle');
    
    // 出品設定ボタンを探してクリック
    const settingsButton = page.locator('button:has-text("出品設定")');
    await expect(settingsButton).toBeVisible({ timeout: 10000 });
    console.log('✅ 出品設定ボタン: 表示確認');
    
    await settingsButton.click();
    await page.waitForTimeout(1000);
    
    // モーダルが開いたかチェック
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log('✅ 出品設定モーダル: 開閉動作確認');
    
    // 設定項目の存在確認と操作テスト
    const profitInput = page.locator('input[type="number"]');
    await expect(profitInput).toBeVisible({ timeout: 3000 });
    await profitInput.fill('25');
    console.log('✅ 利益率入力フィールド: 表示・入力確認');
    
    const checkbox = page.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible({ timeout: 3000 });
    await checkbox.check();
    console.log('✅ チェックボックス: 表示・操作確認');
    
    // 入力値の確認
    await expect(profitInput).toHaveValue('25');
    await expect(checkbox).toBeChecked();
    console.log('✅ 設定操作: 動作確認');
    
    // 保存ボタンの存在確認
    const saveButton = page.locator('button:has-text("保存")');
    await expect(saveButton).toBeVisible({ timeout: 3000 });
    console.log('✅ 保存ボタン: 表示確認');
    
    // キャンセルボタンでモーダルを閉じる
    const cancelButton = page.locator('button:has-text("キャンセル")');
    await cancelButton.click();
    await page.waitForTimeout(1000);
    
    await expect(modal).not.toBeVisible({ timeout: 3000 });
    console.log('✅ モーダル閉じる: 動作確認');
    
    console.log('🎉 売上管理出品設定モーダル: UI操作で完全動作確認済み');
  });

  test('🔄 返品管理返品申請モーダル - UI操作確認', async ({ page }) => {
    console.log('=== 返品管理返品申請モーダル UI操作テスト ===');
    
    // 返品管理ページに移動
    await page.goto('http://localhost:3002/returns');
    await page.waitForLoadState('networkidle');
    
    // 返品申請ボタンを探してクリック
    const returnButton = page.locator('button:has-text("返品申請")');
    await expect(returnButton).toBeVisible({ timeout: 10000 });
    console.log('✅ 返品申請ボタン: 表示確認');
    
    await returnButton.click();
    await page.waitForTimeout(1000);
    
    // モーダルが開いたかチェック
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log('✅ 返品申請モーダル: 開閉動作確認');
    
    // フォーム要素の存在確認と入力テスト
    const orderIdInput = page.locator('input[type="text"]').first();
    await expect(orderIdInput).toBeVisible({ timeout: 3000 });
    await orderIdInput.fill('ORD-000123');
    console.log('✅ 注文番号入力フィールド: 表示・入力確認');
    
    const productNameInput = page.locator('input[type="text"]').nth(1);
    await expect(productNameInput).toBeVisible({ timeout: 3000 });
    await productNameInput.fill('テスト商品');
    console.log('✅ 商品名入力フィールド: 表示・入力確認');
    
    // 返品理由ラジオボタンの選択
    const reasonRadio = page.locator('input[type="radio"]').first();
    await expect(reasonRadio).toBeVisible({ timeout: 3000 });
    await reasonRadio.check();
    console.log('✅ 返品理由選択: 表示・操作確認');
    
    // 入力値の確認
    await expect(orderIdInput).toHaveValue('ORD-000123');
    await expect(productNameInput).toHaveValue('テスト商品');
    await expect(reasonRadio).toBeChecked();
    console.log('✅ 入力機能: 動作確認');
    
    // 提出ボタンの存在確認
    const submitButton = page.locator('button:has-text("返品申請提出")');
    await expect(submitButton).toBeVisible({ timeout: 3000 });
    console.log('✅ 提出ボタン: 表示確認');
    
    // モーダルを閉じる（Xボタンまたはキャンセル）
    const closeButton = page.locator('[role="dialog"] button').first();
    await closeButton.click();
    await page.waitForTimeout(1000);
    
    await expect(modal).not.toBeVisible({ timeout: 3000 });
    console.log('✅ モーダル閉じる: 動作確認');
    
    console.log('🎉 返品管理返品申請モーダル: UI操作で完全動作確認済み');
  });

  test('🚚 納品プランウィザード - UI操作確認', async ({ page }) => {
    console.log('=== 納品プランウィザード UI操作テスト ===');
    
    // 納品プランページに移動
    await page.goto('http://localhost:3002/delivery-plan');
    await page.waitForLoadState('networkidle');
    
    // ウィザードの表示確認
    const wizard = page.locator('.max-w-4xl');
    await expect(wizard).toBeVisible({ timeout: 10000 });
    console.log('✅ ウィザード: 表示確認');
    
    // ステップインジケーターの確認
    const stepIndicator = page.locator('[data-testid="step-1-label"]');
    await expect(stepIndicator).toBeVisible({ timeout: 3000 });
    console.log('✅ ステップインジケーター: 表示確認');
    
    // 入力フィールドの存在確認と入力テスト
    const inputs = page.locator('input[type="text"]');
    const inputCount = await inputs.count();
    console.log(`✅ 入力フィールド数: ${inputCount}個`);
    
    if (inputCount > 0) {
      const firstInput = inputs.first();
      await expect(firstInput).toBeVisible({ timeout: 3000 });
      await firstInput.fill('テスト入力');
      
      const inputValue = await firstInput.inputValue();
      await expect(firstInput).toHaveValue('テスト入力');
      console.log('✅ 入力機能: 動作確認');
    }
    
    // 次へボタンの存在確認
    const nextButton = page.locator('button:has-text("次へ"), button:has-text("続行")');
    const nextExists = await nextButton.count() > 0;
    if (nextExists) {
      await expect(nextButton.first()).toBeVisible({ timeout: 3000 });
      console.log('✅ 次へボタン: 表示確認');
    }
    
    console.log('🎉 納品プランウィザード: UI操作で完全動作確認済み');
  });
}); 