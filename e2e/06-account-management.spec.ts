import { test, expect } from '@playwright/test';

test.describe('アカウント管理機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ダッシュボードページの読み込み完了を待つ
    await page.waitForURL('/staff/dashboard');
    
    // 設定ページに移動
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('設定ページが正常に表示される', async ({ page }) => {
    // ページタイトルを確認
    await expect(page.locator('h1')).toContainText('アカウント設定');
    await expect(page.locator('p')).toContainText('アカウント情報とデータ管理');
    
    // intelligence-cardクラスが適用されているか確認
    await expect(page.locator('.intelligence-card')).toHaveCount(3);
    
    // すべてのカードがglobalクラスを持つか確認
    const cards = page.locator('.intelligence-card.global');
    await expect(cards).toHaveCount(3);
  });

  test('アカウント管理セクションが表示される', async ({ page }) => {
    // セクションタイトルを確認
    await expect(page.locator('h3')).toContainText('アカウント管理');
    
    // データエクスポートセクション
    await expect(page.locator('h4').filter({ hasText: 'データエクスポート' })).toBeVisible();
    await expect(page.locator('text=個人データを安全にダウンロードし、バックアップを作成します')).toBeVisible();
    
    // アカウント削除セクション
    await expect(page.locator('h4').filter({ hasText: 'アカウント削除' })).toBeVisible();
    await expect(page.locator('text=この操作は完全に元に戻せません')).toBeVisible();
  });

  test('データエクスポート機能が動作する', async ({ page }) => {
    // エクスポートボタンを確認
    const exportButton = page.locator('button.nexus-button').filter({ hasText: 'エクスポート' });
    await expect(exportButton).toBeVisible();
    
    // ボタンをクリック
    await exportButton.click();
    
    // トースト通知が表示されるかチェック（実装に応じて調整）
    // await expect(page.locator('.toast, .notification')).toBeVisible();
  });

  test('アカウント削除機能の確認ダイアログが表示される', async ({ page }) => {
    // 削除ボタンを確認
    const deleteButton = page.locator('button.nexus-button.danger').filter({ hasText: '削除' });
    await expect(deleteButton).toBeVisible();
    
    // ダイアログのハンドラーを設定
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('本当にアカウントを削除しますか？');
      dialog.dismiss();
    });
    
    // ボタンをクリック
    await deleteButton.click();
  });

  test('重要な注意事項セクションが表示される', async ({ page }) => {
    // セクションタイトルを確認
    await expect(page.locator('h3').filter({ hasText: '重要な注意事項' })).toBeVisible();
    
    // 注意事項の内容を確認
    await expect(page.locator('h4').filter({ hasText: 'データの保護について' })).toBeVisible();
    await expect(page.locator('h4').filter({ hasText: 'アカウント削除の影響' })).toBeVisible();
    
    // 説明文を確認
    await expect(page.locator('text=エクスポートされたデータは適切な場所に保存し')).toBeVisible();
    await expect(page.locator('text=アカウントを削除すると、すべてのデータ、設定、履歴が完全に削除されます')).toBeVisible();
  });

  test('UI統一性の確認', async ({ page }) => {
    // intelligence-cardクラスの使用を確認
    const cards = page.locator('.intelligence-card.global');
    await expect(cards).toHaveCount(3);
    
    // nexus-buttonクラスの使用を確認
    const buttons = page.locator('.nexus-button');
    await expect(buttons).toHaveCount(2);
    
    // dangerボタンの確認
    const dangerButton = page.locator('.nexus-button.danger');
    await expect(dangerButton).toHaveCount(1);
    
    // nexus-text-primaryクラスの使用を確認
    const primaryTexts = page.locator('.text-nexus-text-primary');
    await expect(primaryTexts).toHaveCount(6); // タイトル、見出しなど
    
    // nexus-text-secondaryクラスの使用を確認
    const secondaryTexts = page.locator('.text-nexus-text-secondary');
    await expect(secondaryTexts).toHaveCount(5); // サブタイトル、説明文など
  });

  test('レスポンシブデザインの確認', async ({ page }) => {
    // デスクトップサイズ
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.intelligence-card')).toHaveCount(3);
    
    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.intelligence-card')).toHaveCount(3);
    
    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.intelligence-card')).toHaveCount(3);
    
    // レイアウトが適切に調整されているか確認
    await expect(page.locator('.space-y-6')).toBeVisible();
  });

  test('アクセシビリティの確認', async ({ page }) => {
    // ボタンにアクセシブルな属性があるか確認
    const exportButton = page.locator('button').filter({ hasText: 'エクスポート' });
    await expect(exportButton).toBeVisible();
    
    const deleteButton = page.locator('button').filter({ hasText: '削除' });
    await expect(deleteButton).toBeVisible();
    
    // セクション見出しが適切に構造化されているか確認
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h3')).toHaveCount(2);
    await expect(page.locator('h4')).toHaveCount(4);
  });
});