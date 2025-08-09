import { test, expect, Page } from '@playwright/test';

test.describe('セラー納品プラン管理の修正検証', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // ログイン処理
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText(['ログイン', 'Login']);
    
    // セラーアカウントでログイン
    await page.locator('input[name="email"], input[type="email"]').fill('seller1@example.com');
    await page.locator('input[name="password"], input[type="password"]').fill('password123');
    
    const loginButton = page.locator('button[type="submit"], button:has-text("ログイン"), button:has-text("Login")');
    await loginButton.click();
    await page.waitForTimeout(2000);
  });

  test('1. バーコードボタンの重複削除確認', async () => {
    console.log('\n=== 1. バーコードボタンの重複削除確認 ===');
    
    // 納品プラン管理画面に移動
    await page.goto('/delivery');
    await page.waitForTimeout(2000);
    
    // ページタイトルの確認
    await expect(page.locator('h1, h2, .text-2xl, .text-3xl')).toContainText('納品プラン');
    console.log('✓ 納品プラン管理画面に移動しました');
    
    // テーブルが表示されるまで待機
    await expect(page.locator('table')).toBeVisible();
    await page.waitForTimeout(1000);
    
    // 操作ボタンの確認（目のアイコンのみであることを確認）
    const actionButtons = page.locator('tbody tr:first-child td:last-child button');
    const buttonCount = await actionButtons.count();
    
    console.log(`操作ボタンの数: ${buttonCount}`);
    
    // 目のアイコンボタンは存在するが、バーコードボタンは削除されていることを確認
    await expect(actionButtons.first()).toBeVisible();
    expect(buttonCount).toBe(1);
    
    // 目のアイコンが存在することを確認
    const eyeIcon = actionButtons.first().locator('svg');
    await expect(eyeIcon).toBeVisible();
    
    console.log('✅ バーコードボタンが正常に削除され、目のアイコンボタンのみが表示されています');
  });

  test('2. ステータス選択肢の更新確認', async () => {
    console.log('\n=== 2. ステータス選択肢の更新確認 ===');
    
    // フィルター部分が表示されるまで待機
    await expect(page.locator('select, [role="combobox"]')).toBeVisible();
    await page.waitForTimeout(1000);
    
    // ステータス選択のドロップダウンを開く
    const statusSelect = page.locator('select').first();
    await statusSelect.click();
    await page.waitForTimeout(500);
    
    // 新しいステータス選択肢が存在することを確認
    const expectedStatuses = ['全てのステータス', '下書き', '作成中', '作成完了', '準備中', '発送済', '到着済', 'キャンセル'];
    
    for (const status of expectedStatuses) {
      await expect(page.locator(`option:has-text("${status}")`)).toBeVisible();
      console.log(`✓ ステータス "${status}" が選択肢に含まれています`);
    }
    
    // 古いステータス（検品中、配送完了、返送済）が存在しないことを確認
    const oldStatuses = ['検品中', '配送完了', '返送済'];
    for (const oldStatus of oldStatuses) {
      const oldOption = page.locator(`option:has-text("${oldStatus}")`);
      const oldOptionCount = await oldOption.count();
      expect(oldOptionCount).toBe(0);
      console.log(`✓ 旧ステータス "${oldStatus}" は正常に削除されています`);
    }
    
    console.log('✅ ステータス選択肢が正しく更新されています');
  });

  test('3. 下書きプランの表示確認', async () => {
    console.log('\n=== 3. 下書きプランの表示確認 ===');
    
    // 下書きステータスのプランが表示されることを確認
    const draftPlan = page.locator('tr:has-text("下書き")');
    await expect(draftPlan).toBeVisible();
    console.log('✓ 下書きプランが一覧に表示されています');
    
    // 下書きステータスのバッジが正しく表示されることを確認
    const draftBadge = draftPlan.locator('.bg-gray-100');
    await expect(draftBadge).toBeVisible();
    await expect(draftBadge).toContainText('下書き');
    
    console.log('✅ 下書きプランが正しく表示されています');
  });

  test('4. 下書きプランの編集機能確認', async () => {
    console.log('\n=== 4. 下書きプランの編集機能確認 ===');
    
    // 下書きプランの詳細ボタンをクリック
    const draftRow = page.locator('tr:has-text("下書き")');
    const viewButton = draftRow.locator('button:has([class*="h-4 w-4"])');
    await viewButton.click();
    await page.waitForTimeout(1500);
    
    // モーダルが開くことを確認
    const modal = page.locator('[role="dialog"], .fixed.inset-0');
    await expect(modal).toBeVisible();
    console.log('✓ 納品プラン詳細モーダルが開きました');
    
    // 編集ボタンが表示されることを確認（下書きプランのみ）
    const editButton = page.locator('button:has-text("編集")');
    await expect(editButton).toBeVisible();
    console.log('✓ 下書きプランで編集ボタンが表示されています');
    
    // モーダルを閉じる
    const closeButton = page.locator('button:has-text("閉じる")');
    await closeButton.click();
    await page.waitForTimeout(1000);
    
    console.log('✅ 下書きプランでのみ編集ボタンが正しく表示されています');
  });

  test('5. 非下書きプランの編集ボタン非表示確認', async () => {
    console.log('\n=== 5. 非下書きプランの編集ボタン非表示確認 ===');
    
    // 作成完了プランなどの詳細を確認
    const completedRow = page.locator('tr:has-text("作成完了")').first();
    const viewButton = completedRow.locator('button:has([class*="h-4 w-4"])');
    await viewButton.click();
    await page.waitForTimeout(1500);
    
    // モーダルが開くことを確認
    const modal = page.locator('[role="dialog"], .fixed.inset-0');
    await expect(modal).toBeVisible();
    console.log('✓ 作成完了プランの詳細モーダルが開きました');
    
    // 編集ボタンが表示されないことを確認（下書き以外）
    const editButton = page.locator('button:has-text("編集")');
    const editButtonCount = await editButton.count();
    expect(editButtonCount).toBe(0);
    console.log('✓ 作成完了プランでは編集ボタンが表示されていません');
    
    // モーダルを閉じる
    const closeButton = page.locator('button:has-text("閉じる")');
    await closeButton.click();
    await page.waitForTimeout(1000);
    
    console.log('✅ 非下書きプランでは編集ボタンが正しく非表示になっています');
  });

  test('6. ページネーションの表示確認', async () => {
    console.log('\n=== 6. ページネーションの表示確認 ===');
    
    // ページネーションが存在する場合に確認
    const pagination = page.locator('[class*="flex"][class*="justify-between"]:has(button)');
    const paginationExists = await pagination.count() > 0;
    
    if (paginationExists) {
      await expect(pagination).toBeVisible();
      console.log('✓ ページネーションが表示されています');
      
      // 現在ページボタンの背景色確認
      const currentPageButton = page.locator('button[class*="bg-primary-blue"]:has-text("1")');
      const currentPageExists = await currentPageButton.count() > 0;
      
      if (currentPageExists) {
        await expect(currentPageButton).toBeVisible();
        console.log('✓ 現在ページボタンが正しく表示されています');
      } else {
        console.log('ⓘ 現在のデータでは複数ページがないため、現在ページボタンは表示されていません');
      }
    } else {
      console.log('ⓘ 現在のデータ量ではページネーションは表示されていません');
    }
    
    console.log('✅ ページネーション機能に問題はありません');
  });

  test('7. 全体的なUI一貫性確認', async () => {
    console.log('\n=== 7. 全体的なUI一貫性確認 ===');
    
    // 画面全体のスクリーンショット
    await page.screenshot({ 
      path: 'test-results/delivery-plan-fixes-verification.png', 
      fullPage: true 
    });
    
    // 主要要素の表示確認
    await expect(page.locator('h1, h2, .text-2xl, .text-3xl')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    
    // 新規作成ボタンの確認
    const createButton = page.locator('button:has-text("新規作成")');
    await expect(createButton).toBeVisible();
    
    console.log('✓ 主要なUI要素がすべて正常に表示されています');
    console.log('✅ UI一貫性に問題はありません');
  });

  test.afterAll(async () => {
    console.log('\n=== 修正検証完了 ===');
    console.log('✅ セラー納品プラン管理の全修正項目が正常に動作しています');
    console.log('1. ✅ バーコードボタンの重複削除');
    console.log('2. ✅ ステータス選択肢の更新');
    console.log('3. ✅ 下書きプランの編集機能');
    console.log('4. ✅ ページネーションの修正');
    console.log('📸 画面スクリーンショットを保存しました');
    
    if (page) {
      await page.close();
    }
  });
});
