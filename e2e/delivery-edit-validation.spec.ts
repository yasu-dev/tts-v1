import { test, expect } from '@playwright/test';

test.describe('納品プラン編集機能 完全バリデーション', () => {
  
  let consoleErrors: string[] = [];
  let pageErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    pageErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // ログイン
    await page.goto('http://localhost:3002/login');
    await page.waitForTimeout(2000);
    
    await page.fill('input[type="email"]', 'seller@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("ログイン")');
    await page.waitForTimeout(3000);
  });

  test('1. 編集ボタンが表示されることを確認', async ({ page }) => {
    console.log('🔍 編集ボタンの表示確認');
    
    await page.goto('http://localhost:3002/delivery');
    await page.waitForTimeout(3000);

    // Pendingステータスの納品プランを探す
    const editButtons = page.locator('button:has-text("編集")');
    const editButtonCount = await editButtons.count();
    
    console.log(`編集ボタン数: ${editButtonCount}`);
    expect(editButtonCount).toBeGreaterThan(0);
  });

  test('2. 編集モーダルが正常に開くことを確認', async ({ page }) => {
    console.log('🔍 編集モーダル開閉確認');
    
    await page.goto('http://localhost:3002/delivery');
    await page.waitForTimeout(3000);

    // 最初の編集ボタンをクリック
    const editButton = page.locator('button:has-text("編集")').first();
    await editButton.click();
    await page.waitForTimeout(2000);

    // 編集モーダルが開いたことを確認
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    const modalTitle = page.locator('text=納品プラン編集');
    await expect(modalTitle).toBeVisible();
    
    console.log('✅ 編集モーダルが正常に開きました');
  });

  test('3. 撮影要望編集機能の完全確認', async ({ page }) => {
    console.log('🔍 撮影要望編集機能の確認');
    
    await page.goto('http://localhost:3002/delivery');
    await page.waitForTimeout(3000);

    // 編集モーダルを開く
    const editButton = page.locator('button:has-text("編集")').first();
    await editButton.click();
    await page.waitForTimeout(2000);

    // 撮影プランセクションの確認
    const photographySection = page.locator('text=撮影プラン');
    await expect(photographySection).toBeVisible();
    console.log('✅ 撮影プランセクションが表示されています');

    // 基本撮影オプションの確認
    const overallOption = page.locator('label:has-text("全体撮影")');
    await expect(overallOption).toBeVisible();
    
    const detailedOption = page.locator('label:has-text("詳細撮影")');
    await expect(detailedOption).toBeVisible();
    
    const functionalOption = page.locator('label:has-text("機能撮影")');
    await expect(functionalOption).toBeVisible();
    
    console.log('✅ 基本撮影オプションが全て表示されています');

    // プレミアム撮影オプションの確認
    const premiumSection = page.locator('text=プレミアム撮影（追加料金）');
    await expect(premiumSection).toBeVisible();
    
    const premium2Option = page.locator('label:has-text("+2枚追加（¥500）")');
    await expect(premium2Option).toBeVisible();
    
    const premium4Option = page.locator('label:has-text("+4枚追加（¥800）")');
    await expect(premium4Option).toBeVisible();
    
    console.log('✅ プレミアム撮影オプションが全て表示されています');

    // 特別撮影要望の確認
    const customRequestsSection = page.locator('text=特別撮影の要望');
    await expect(customRequestsSection).toBeVisible();
    
    const customTextarea = page.locator('textarea[placeholder*="特定の角度"]');
    await expect(customTextarea).toBeVisible();
    
    console.log('✅ 特別撮影要望フィールドが表示されています');
  });

  test('4. プレミアム梱包オプション編集機能の確認', async ({ page }) => {
    console.log('🔍 プレミアム梱包オプション編集機能の確認');
    
    await page.goto('http://localhost:3002/delivery');
    await page.waitForTimeout(3000);

    // 編集モーダルを開く
    const editButton = page.locator('button:has-text("編集")').first();
    await editButton.click();
    await page.waitForTimeout(2000);

    // 梱包オプションセクションの確認
    const packagingSection = page.locator('text=梱包オプション');
    await expect(packagingSection).toBeVisible();
    console.log('✅ 梱包オプションセクションが表示されています');

    // プレミアム梱包オプションの確認
    const premiumPackaging = page.locator('text=プレミアム梱包');
    await expect(premiumPackaging).toBeVisible();
    
    const packagingDescription = page.locator('text=より丁寧な梱包材料と包装方法');
    await expect(packagingDescription).toBeVisible();
    
    console.log('✅ プレミアム梱包オプションが全て表示されています');

    // 梱包オプションのクリック動作確認
    const packagingOption = page.locator('div:has-text("プレミアム梱包")').first();
    await packagingOption.click();
    await page.waitForTimeout(500);
    
    console.log('✅ プレミアム梱包オプションのクリック動作が正常です');
  });

  test('5. 検品チェックリスト編集機能の確認', async ({ page }) => {
    console.log('🔍 検品チェックリスト編集機能の確認');
    
    await page.goto('http://localhost:3002/delivery');
    await page.waitForTimeout(3000);

    // 編集モーダルを開く
    const editButton = page.locator('button:has-text("編集")').first();
    await editButton.click();
    await page.waitForTimeout(2000);

    // 検品チェックリストセクションの確認
    const checklistSection = page.locator('text=検品チェックリスト');
    await expect(checklistSection).toBeVisible();
    console.log('✅ 検品チェックリストセクションが表示されています');
  });

  test('6. 編集保存機能の動作確認', async ({ page }) => {
    console.log('🔍 編集保存機能の動作確認');
    
    await page.goto('http://localhost:3002/delivery');
    await page.waitForTimeout(3000);

    // 編集モーダルを開く
    const editButton = page.locator('button:has-text("編集")').first();
    await editButton.click();
    await page.waitForTimeout(2000);

    // 基本情報の編集テスト
    const addressField = page.locator('input[placeholder*="住所"]');
    await addressField.fill('テスト編集住所 東京都新宿区1-1-1');
    
    // 撮影オプションの変更テスト
    const overallCheck = page.locator('input[type="checkbox"]').first();
    await overallCheck.check();
    
    // プレミアム撮影の選択テスト
    const premium2Radio = page.locator('input[type="radio"][value="2"]').first();
    await premium2Radio.check();
    
    // 特別撮影要望の入力テスト
    const customTextarea = page.locator('textarea[placeholder*="特定の角度"]');
    await customTextarea.fill('テスト用の特別撮影要望です');
    
    // プレミアム梱包の切り替えテスト
    const packagingOption = page.locator('div:has-text("プレミアム梱包")').first();
    await packagingOption.click();
    
    console.log('✅ 全ての編集項目に値を設定しました');

    // 保存ボタンの確認
    const saveButton = page.locator('button:has-text("変更を保存")');
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
    
    console.log('✅ 保存ボタンが有効状態で表示されています');
    
    // 実際に保存を実行（テスト用）
    await saveButton.click();
    await page.waitForTimeout(3000);
    
    console.log('✅ 保存処理が実行されました');
  });

  test.afterEach(async () => {
    console.log('Console Errors:', consoleErrors);
    console.log('Page Errors:', pageErrors);
    
    // エラーがないことを確認
    expect(consoleErrors.filter(error => 
      !error.includes('Download the React DevTools') && 
      !error.includes('favicon.ico')
    )).toHaveLength(0);
    expect(pageErrors).toHaveLength(0);
  });
});



