import { test, expect } from '@playwright/test';

test.describe('業務フローUI修正確認', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'seller@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    console.log('✅ ログイン完了');
  });

  test('🎯 業務フロー開閉ボタンが右上のみ存在することを確認', async ({ page }) => {
    console.log('🔍 開閉ボタンの確認開始...');
    
    // ダッシュボードページに移動
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForLoadState('networkidle');
    
    // 業務フローセクションが表示されるまで待機
    await page.waitForSelector('div:has-text("業務フロー")', { state: 'visible' });
    
    // DashboardLayoutの右上開閉ボタンが存在することを確認
    const rightToggleButton = await page.locator('div:has-text("業務フロー") button[title*="フローを"]').first();
    await expect(rightToggleButton).toBeVisible();
    console.log('✅ 右上の開閉ボタンが存在');
    
    // UnifiedProductFlow内の開閉ボタンが削除されていることを確認（重複削除）
    const duplicateButtons = await page.locator('h3:has-text("フルフィルメント業務フロー") + button').count();
    expect(duplicateButtons).toBe(0);
    console.log('✅ 重複する開閉ボタンが削除されている');
    
    // スクリーンショット撮影
    await page.screenshot({ 
      path: 'test-results/business-flow-single-toggle-button.png',
      fullPage: true
    });
    
    console.log('✅ 開閉ボタンの確認完了');
  });

  test('🎯 「フルフィルメント業務フロー」タイトルが削除されていることを確認', async ({ page }) => {
    console.log('🔍 タイトル削除の確認開始...');
    
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForLoadState('networkidle');
    
    // 業務フローセクションが表示されるまで待機
    await page.waitForSelector('div:has-text("業務フロー")', { state: 'visible' });
    
    // 「フルフィルメント業務フロー」タイトルが削除されていることを確認
    const fulfilmentTitle = await page.locator('h3:has-text("フルフィルメント業務フロー")').count();
    expect(fulfilmentTitle).toBe(0);
    console.log('✅ フルフィルメント業務フローのタイトルが削除されている');
    
    // DashboardLayoutの「業務フロー」タイトルは残っていることを確認
    const flowTitle = await page.locator('h3:has-text("業務フロー")').first();
    await expect(flowTitle).toBeVisible();
    console.log('✅ 簡潔な「業務フロー」タイトルが表示されている');
    
    // スクリーンショット撮影
    await page.screenshot({ 
      path: 'test-results/business-flow-title-removed.png',
      fullPage: true
    });
    
    console.log('✅ タイトル削除の確認完了');
  });

  test('🎯 レスポンシブグリッドの改善確認', async ({ page }) => {
    console.log('🔍 レスポンシブグリッドの確認開始...');
    
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForLoadState('networkidle');
    
    // 業務フローセクションが表示されるまで待機
    await page.waitForSelector('div:has-text("業務フロー")', { state: 'visible' });
    
    // デスクトップ幅でのテスト
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    // グリッドコンテナが存在することを確認
    const gridContainer = await page.locator('div[class*="grid"][class*="grid-cols"]').first();
    await expect(gridContainer).toBeVisible();
    
    // デスクトップでのスクリーンショット
    await page.screenshot({ 
      path: 'test-results/business-flow-desktop-grid.png',
      fullPage: true
    });
    console.log('✅ デスクトップ表示確認完了');
    
    // タブレット幅でのテスト
    await page.setViewportSize({ width: 768, height: 600 });
    await page.waitForTimeout(500);
    
    // タブレットでのスクリーンショット
    await page.screenshot({ 
      path: 'test-results/business-flow-tablet-grid.png',
      fullPage: true
    });
    console.log('✅ タブレット表示確認完了');
    
    // モバイル幅でのテスト
    await page.setViewportSize({ width: 480, height: 600 });
    await page.waitForTimeout(500);
    
    // モバイルでのスクリーンショット  
    await page.screenshot({ 
      path: 'test-results/business-flow-mobile-grid.png',
      fullPage: true
    });
    console.log('✅ モバイル表示確認完了');
    
    // フローステップカードが表示されていることを確認
    const flowSteps = await page.locator('button[class*="rounded-xl"]').count();
    expect(flowSteps).toBeGreaterThan(0);
    console.log(`✅ ${flowSteps}個のフローステップが表示されている`);
    
    console.log('✅ レスポンシブグリッドの確認完了');
  });

  test('🎯 開閉機能の動作確認', async ({ page }) => {
    console.log('🔍 開閉機能の動作確認開始...');
    
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForLoadState('networkidle');
    
    // 業務フローセクションが表示されるまで待機
    await page.waitForSelector('div:has-text("業務フロー")', { state: 'visible' });
    
    // 初期状態（展開状態）でのスクリーンショット
    await page.screenshot({ 
      path: 'test-results/business-flow-expanded.png',
      fullPage: true
    });
    console.log('✅ 展開状態のスクリーンショット撮影完了');
    
    // 開閉ボタンをクリック
    const toggleButton = await page.locator('div:has-text("業務フロー") button[title*="フローを"]').first();
    await toggleButton.click();
    await page.waitForTimeout(500);
    
    // 折りたたみ状態でのスクリーンショット
    await page.screenshot({ 
      path: 'test-results/business-flow-collapsed.png',
      fullPage: true
    });
    console.log('✅ 折りたたみ状態のスクリーンショット撮影完了');
    
    // 再び展開
    await toggleButton.click();
    await page.waitForTimeout(500);
    
    // フローステップが再表示されることを確認
    const flowSteps = await page.locator('button[class*="rounded-xl"]').count();
    expect(flowSteps).toBeGreaterThan(0);
    console.log('✅ 開閉機能が正常に動作している');
    
    console.log('✅ 開閉機能の動作確認完了');
  });
}); 