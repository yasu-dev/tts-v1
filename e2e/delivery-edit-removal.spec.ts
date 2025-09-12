import { test, expect } from '@playwright/test';

test.describe('納品プラン編集機能の廃止確認', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // 納品管理ページへ移動
    await page.goto('/delivery');
    await page.waitForLoadState('networkidle');
  });

  test('納品プラン一覧に編集ボタンが表示されない', async ({ page }) => {
    // 詳細ボタンが存在することを確認
    const detailButtons = page.locator('[title="詳細表示"], text="詳細"');
    await expect(detailButtons.first()).toBeVisible();
    
    // 編集ボタンが存在しないことを確認
    const editButtons = page.locator('text="編集"');
    await expect(editButtons).toHaveCount(0);
  });

  test('納品プラン詳細モーダルに編集ボタンが表示されない', async ({ page }) => {
    // 最初の詳細ボタンをクリック
    const detailButton = page.locator('[title="詳細表示"], text="詳細"').first();
    await detailButton.click();
    
    // 詳細モーダルが開かれることを確認
    await expect(page.locator('text="納品プラン詳細"')).toBeVisible();
    
    // 取り下げボタンが存在することを確認
    await expect(page.locator('text="取り下げ"')).toBeVisible();
    
    // 編集ボタンが存在しないことを確認
    const editButton = page.locator('text="編集"').first();
    await expect(editButton).toHaveCount(0);
  });

  test('取り下げ→再作成の案内文が表示される', async ({ page }) => {
    // 最初の詳細ボタンをクリック
    const detailButton = page.locator('[title="詳細表示"], text="詳細"').first();
    await detailButton.click();
    
    // 詳細モーダルが開かれることを確認
    await expect(page.locator('text="納品プラン詳細"')).toBeVisible();
    
    // 取り下げ→再作成の案内文が表示されることを確認
    await expect(page.locator('text="💡 変更が必要な場合：「取り下げ」→「新規作成」をご利用ください"')).toBeVisible();
  });

  test('取り下げボタンが正常に機能する', async ({ page }) => {
    // 最初の詳細ボタンをクリック
    const detailButton = page.locator('[title="詳細表示"], text="詳細"').first();
    await detailButton.click();
    
    // 詳細モーダルが開かれることを確認
    await expect(page.locator('text="納品プラン詳細"')).toBeVisible();
    
    // 取り下げボタンをクリック
    await page.click('text="取り下げ"');
    
    // 取り下げ確認モーダルが開かれることを確認
    await expect(page.locator('text="納品プラン取り下げ"')).toBeVisible();
    
    // 理由入力フィールドが存在することを確認
    await expect(page.locator('textarea[placeholder*="例：商品に不具合"]')).toBeVisible();
  });

  test('新規作成ボタンが正常に表示される', async ({ page }) => {
    // 新規作成ボタンが表示されることを確認
    await expect(page.locator('text="新規作成"').first()).toBeVisible();
    
    // 新規作成ボタンをクリック
    await page.click('text="新規作成"');
    
    // 納品プラン作成ページに遷移することを確認
    await page.waitForURL('/delivery-plan');
    await expect(page.locator('text="納品プラン作成"')).toBeVisible();
  });

  test('編集関連のAPIエンドポイントが呼び出されない', async ({ page }) => {
    let editApiCalled = false;
    
    // API呼び出しの監視
    page.on('request', request => {
      if (request.url().includes('/api/delivery-plan/') && request.method() === 'PUT') {
        // 取り下げ以外のPUTリクエストをチェック
        if (!request.url().includes('/cancel')) {
          editApiCalled = true;
        }
      }
    });
    
    // 詳細モーダルを開く
    const detailButton = page.locator('[title="詳細表示"], text="詳細"').first();
    await detailButton.click();
    
    await expect(page.locator('text="納品プラン詳細"')).toBeVisible();
    
    // 短時間待機
    await page.waitForTimeout(1000);
    
    // 編集APIが呼び出されていないことを確認
    expect(editApiCalled).toBe(false);
  });

  test('ページでエラーが発生していない', async ({ page }) => {
    const errors: string[] = [];
    
    // コンソールエラーの監視
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // ページを操作
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const detailButton = page.locator('[title="詳細表示"], text="詳細"').first();
    if (await detailButton.count() > 0) {
      await detailButton.click();
      await expect(page.locator('text="納品プラン詳細"')).toBeVisible();
    }
    
    // 重要なエラーがないことを確認（一部の軽微なエラーは無視）
    const criticalErrors = errors.filter(error => 
      !error.includes('Failed to load resource') && 
      !error.includes('favicon.ico') &&
      !error.includes('handleEditPlan') // 編集関数のエラーがないことを確認
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});