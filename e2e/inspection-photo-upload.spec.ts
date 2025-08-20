import { test, expect } from '@playwright/test';

test.describe('検品写真撮影機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    // スタッフとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // スタッフダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/staff\/dashboard$/);
  });

  test('写真撮影タブでドロップ状態が保存される', async ({ page }) => {
    // 検品ページに移動
    await page.goto('/staff/inspection');
    await expect(page).toHaveURL(/\/staff\/inspection$/);

    // 検品対象の商品をクリック（最初の商品を選択）
    await page.click('text=検品開始', { timeout: 10000 });
    
    // ステップ2（写真撮影）に移動
    await page.click('text=写真撮影');
    
    // 写真をアップロード
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('test-data/sample-image.jpg');
    
    // アップロード完了を待機
    await page.waitForSelector('text=写真を配置しました', { timeout: 10000 });
    
    // 写真を正面スロットにドラッグ&ドロップ
    const photo = page.locator('img[alt="未配置写真 1"]').first();
    const frontSlot = page.locator('text=正面').first();
    
    await photo.dragTo(frontSlot);
    
    // ドロップ成功の確認
    await expect(page.locator('text=「正面」に配置されました')).toBeVisible();
    
    // 保存して一覧に戻るボタンをクリック
    await page.click('text=保存して一覧に戻る');
    
    // 保存成功の確認
    await expect(page.locator('text=進捗を保存しました')).toBeVisible();
    
    // 検品一覧に戻ることを確認
    await expect(page).toHaveURL(/\/staff\/inspection$/);
    
    // 再度同じ商品の検品を開始
    await page.click('text=検品開始');
    
    // ステップ2（写真撮影）に移動
    await page.click('text=写真撮影');
    
    // 配置状態が復元されていることを確認
    await expect(page.locator('text=正面').first()).toBeVisible();
    await expect(page.locator('text=1枚').first()).toBeVisible();
  });

  test('必須撮影箇所へのドロップでステータスが更新される', async ({ page }) => {
    // 検品ページに移動
    await page.goto('/staff/inspection');
    await expect(page).toHaveURL(/\/staff\/inspection$/);

    // 検品対象の商品をクリック
    await page.click('text=検品開始', { timeout: 10000 });
    
    // ステップ2（写真撮影）に移動
    await page.click('text=写真撮影');
    
    // 写真をアップロード
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('test-data/sample-image.jpg');
    
    // 写真を正面スロットにドラッグ&ドロップ
    const photo = page.locator('img[alt="未配置写真 1"]').first();
    const frontSlot = page.locator('text=正面').first();
    
    await photo.dragTo(frontSlot);
    
    // 次へボタンをクリック
    await page.click('text=次へ（梱包・ラベル）');
    
    // ステップ3（梱包・ラベル）に移動することを確認
    await expect(page.locator('text=梱包・ラベル')).toBeVisible();
    
    // 商品ステータスが「撮影完了」になっていることを確認
    await page.goto('/staff/inspection');
    await expect(page.locator('text=撮影完了')).toBeVisible();
  });
});
