import { test, expect } from '@playwright/test';

test.describe('🔍 セラー分析ダッシュボード - 詳細分析機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('📊 ダッシュボードタブ切り替え機能', async ({ page }) => {
    // ダッシュボードページに移動
    await page.goto('/dashboard');
    
    // ページが正しく読み込まれることを確認
    await expect(page.locator('h1')).toContainText('セラーダッシュボード');
    
    // 基本ダッシュボードタブが選択されていることを確認
    const overviewTab = page.locator('button:has-text("基本ダッシュボード")');
    await expect(overviewTab).toHaveClass(/border-primary-blue/);
    
    // 詳細分析タブが存在することを確認
    const analyticsTab = page.locator('button:has-text("詳細分析")');
    await expect(analyticsTab).toBeVisible();
    
    // 詳細分析タブをクリック
    await analyticsTab.click();
    
    // 詳細分析タブが選択されることを確認
    await expect(analyticsTab).toHaveClass(/border-primary-blue/);
  });

  test('🎯 詳細分析コンテンツの表示', async ({ page }) => {
    await page.goto('/dashboard');
    
    // 詳細分析タブをクリック
    await page.click('button:has-text("詳細分析")');
    
    // セラー実績分析ダッシュボードのヘッダーを確認
    await expect(page.locator('h2:has-text("セラー実績分析ダッシュボード")')).toBeVisible();
    
    // キーメトリクスカードが表示されることを確認
    await expect(page.locator('.intelligence-card.americas')).toBeVisible();
    await expect(page.locator('.intelligence-card.europe')).toBeVisible();
    await expect(page.locator('.intelligence-card.asia')).toBeVisible();
    await expect(page.locator('.intelligence-card.africa')).toBeVisible();
    
    // 時間範囲選択ボタンが表示されることを確認
    await expect(page.locator('button:has-text("週")')).toBeVisible();
    await expect(page.locator('button:has-text("月")')).toBeVisible();
    await expect(page.locator('button:has-text("四半期")')).toBeVisible();
    await expect(page.locator('button:has-text("年")')).toBeVisible();
    
    // データエクスポートボタンが表示されることを確認
    await expect(page.locator('button:has-text("データエクスポート")')).toBeVisible();
  });

  test('📈 カテゴリー別パフォーマンステーブル', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('button:has-text("詳細分析")');
    
    // カテゴリー別パフォーマンステーブルが表示されることを確認
    await expect(page.locator('h3:has-text("カテゴリー別パフォーマンス分析")')).toBeVisible();
    
    // テーブルヘッダーを確認
    await expect(page.locator('th:has-text("カテゴリー")')).toBeVisible();
    await expect(page.locator('th:has-text("売上")')).toBeVisible();
    await expect(page.locator('th:has-text("商品数")')).toBeVisible();
    await expect(page.locator('th:has-text("平均価格")')).toBeVisible();
    await expect(page.locator('th:has-text("成長率")')).toBeVisible();
    await expect(page.locator('th:has-text("利益率")')).toBeVisible();
    
    // 詳細分析ボタンが存在することを確認
    const detailButton = page.locator('button:has-text("詳細分析")').first();
    await expect(detailButton).toBeVisible();
  });

  test('🌍 地域別展開分析', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('button:has-text("詳細分析")');
    
    // 地域別展開分析セクションが表示されることを確認
    await expect(page.locator('h3:has-text("地域別展開分析")')).toBeVisible();
    
    // 地域カードが表示されることを確認
    await expect(page.locator('.intelligence-card.americas')).toBeVisible();
    
    // 地域名が表示されることを確認（モックデータに基づく）
    await expect(page.locator('text=北米')).toBeVisible();
    await expect(page.locator('text=アジア')).toBeVisible();
    await expect(page.locator('text=ヨーロッパ')).toBeVisible();
  });

  test('🔍 ドリルダウンモーダル機能', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('button:has-text("詳細分析")');
    
    // KPIカードをクリックしてドリルダウンモーダルを開く
    const revenueCard = page.locator('.intelligence-card.americas').first();
    await revenueCard.click();
    
    // モーダルが開くことを確認
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // モーダルのタイトルを確認
    await expect(page.locator('text=詳細分析')).toBeVisible();
    
    // モーダルを閉じる
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('⏱️ 時間範囲切り替え機能', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('button:has-text("詳細分析")');
    
    // 初期状態で「月」が選択されていることを確認
    const monthButton = page.locator('button:has-text("月")');
    await expect(monthButton).toHaveClass(/bg-white/);
    
    // 「週」ボタンをクリック
    const weekButton = page.locator('button:has-text("週")');
    await weekButton.click();
    
    // 「週」が選択されることを確認
    await expect(weekButton).toHaveClass(/bg-white/);
  });

  test('📊 データエクスポート機能', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('button:has-text("詳細分析")');
    
    // ダウンロード開始を待機
    const downloadPromise = page.waitForEvent('download');
    
    // データエクスポートボタンをクリック
    await page.click('button:has-text("データエクスポート")');
    
    // ダウンロードが開始されることを確認
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/seller-analytics-.*\.json/);
  });

  test('🖱️ UI要素のインタラクション', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('button:has-text("詳細分析")');
    
    // ホバー効果を確認
    const categoryRow = page.locator('tbody tr').first();
    await categoryRow.hover();
    await expect(categoryRow).toHaveClass(/hover:bg-nexus-bg-tertiary/);
    
    // ステータスバッジが表示されることを確認
    await expect(page.locator('.status-badge')).toBeVisible();
    
    // アクションオーブが表示されることを確認
    await expect(page.locator('.action-orb')).toBeVisible();
  });

  test('📱 レスポンシブデザイン確認', async ({ page }) => {
    // モバイルサイズでテスト
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.click('button:has-text("詳細分析")');
    
    // モバイルでもタブが表示されることを確認
    await expect(page.locator('button:has-text("詳細分析")')).toBeVisible();
    
    // カードがモバイルレイアウトで表示されることを確認
    await expect(page.locator('.intelligence-card')).toBeVisible();
    
    // デスクトップサイズに戻す
    await page.setViewportSize({ width: 1280, height: 720 });
  });
}); 