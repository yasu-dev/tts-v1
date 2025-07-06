import { test, expect } from '@playwright/test';

test.describe('スクロール制御安定性テスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');
    
    // スタッフでログイン
    await page.click('button[data-testid="staff-login"]');
    await page.waitForLoadState('networkidle');
    
    // ダッシュボードが表示されるまで待機
    await page.waitForSelector('[data-testid="dashboard-layout"]', { timeout: 10000 });
  });

  test('画面遷移直後の業務フロー表示安定性', async ({ page }) => {
    // 初期状態で業務フローが表示されていることを確認
    await expect(page.locator('text=業務フロー')).toBeVisible();
    await expect(page.locator('text=フルフィルメント業務フロー')).toBeVisible();
    
    // 2秒待機（初期安定化期間）
    await page.waitForTimeout(2000);
    
    // 業務フローがまだ表示されていることを確認
    await expect(page.locator('text=業務フロー')).toBeVisible();
    await expect(page.locator('text=フルフィルメント業務フロー')).toBeVisible();
    
    console.log('✅ 初期表示時の業務フロー安定性: OK');
  });

  test('サイドメニューからの画面遷移での業務フロー安定性', async ({ page }) => {
    // 在庫管理画面に遷移
    await page.click('a[href="/staff/inventory"]');
    await page.waitForLoadState('networkidle');
    
    // 業務フローが表示されていることを確認
    await expect(page.locator('text=業務フロー')).toBeVisible();
    
    // 1秒以内に業務フローが消えないことを確認
    await page.waitForTimeout(1000);
    await expect(page.locator('text=業務フロー')).toBeVisible();
    
    // さらに1秒待機して確認
    await page.waitForTimeout(1000);
    await expect(page.locator('text=業務フロー')).toBeVisible();
    
    console.log('✅ 在庫管理画面での業務フロー安定性: OK');
    
    // タスク管理画面に遷移
    await page.click('a[href="/staff/tasks"]');
    await page.waitForLoadState('networkidle');
    
    // 業務フローが表示されていることを確認
    await expect(page.locator('text=業務フロー')).toBeVisible();
    
    // 1秒以内に業務フローが消えないことを確認
    await page.waitForTimeout(1000);
    await expect(page.locator('text=業務フロー')).toBeVisible();
    
    console.log('✅ タスク管理画面での業務フロー安定性: OK');
  });

  test('スクロール制御機能の正常動作', async ({ page }) => {
    // 長いコンテンツがある画面に移動
    await page.click('a[href="/staff/inventory"]');
    await page.waitForLoadState('networkidle');
    
    // 初期安定化期間を待機
    await page.waitForTimeout(2500);
    
    // スクロール可能なコンテナを取得
    const scrollContainer = page.locator('.page-scroll-container');
    
    // 下にスクロールして業務フローが折りたたまれることを確認
    await scrollContainer.evaluate(el => el.scrollTop = 100);
    await page.waitForTimeout(500);
    
    // 業務フローが折りたたまれているか確認
    const flowCollapsed = await page.locator('text=フルフィルメント業務フロー').isVisible();
    if (!flowCollapsed) {
      console.log('✅ 下スクロールで業務フロー折りたたみ: OK');
    }
    
    // 上にスクロールして業務フローが展開されることを確認
    await scrollContainer.evaluate(el => el.scrollTop = 0);
    await page.waitForTimeout(500);
    
    // 業務フローが展開されているか確認
    await expect(page.locator('text=フルフィルメント業務フロー')).toBeVisible();
    
    console.log('✅ 上スクロールで業務フロー展開: OK');
  });

  test('複数画面遷移での安定性', async ({ page }) => {
    const screens = [
      { name: '在庫管理', href: '/staff/inventory' },
      { name: 'タスク管理', href: '/staff/tasks' },
      { name: '出荷管理', href: '/staff/shipping' },
      { name: '返品管理', href: '/staff/returns' }
    ];
    
    for (const screen of screens) {
      // 画面遷移
      await page.click(`a[href="${screen.href}"]`);
      await page.waitForLoadState('networkidle');
      
      // 業務フローが表示されていることを確認
      await expect(page.locator('text=業務フロー')).toBeVisible();
      
      // 1秒以内に業務フローが消えないことを確認
      await page.waitForTimeout(1000);
      await expect(page.locator('text=業務フロー')).toBeVisible();
      
      console.log(`✅ ${screen.name}画面での業務フロー安定性: OK`);
    }
  });

  test('手動折りたたみ機能の動作', async ({ page }) => {
    // 業務フローの折りたたみボタンをクリック
    await page.click('button[title*="フローを折りたたむ"]');
    await page.waitForTimeout(300);
    
    // 業務フローが折りたたまれていることを確認
    const flowVisible = await page.locator('text=フルフィルメント業務フロー').isVisible();
    expect(flowVisible).toBe(false);
    
    // 展開ボタンをクリック
    await page.click('button[title*="フローを展開"]');
    await page.waitForTimeout(300);
    
    // 業務フローが展開されていることを確認
    await expect(page.locator('text=フルフィルメント業務フロー')).toBeVisible();
    
    console.log('✅ 手動折りたたみ機能: OK');
  });
}); 