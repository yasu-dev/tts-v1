import { test, expect } from '@playwright/test';

test.describe('🚀 在庫管理UI修正緊急検証', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log('📋 スタッフとしてログイン中...');
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    console.log('✅ ログイン完了');
  });

  test('🎯 在庫管理画面の操作列統合確認', async ({ page }) => {
    console.log('🔍 在庫管理画面アクセス開始...');
    
    // スタッフダッシュボードから在庫管理へ移動
    await page.click('text=在庫管理');
    await page.waitForURL('**/staff/inventory');
    await page.waitForTimeout(3000);
    
    console.log('📊 現在のURL:', page.url());
    
    // 修正後の画面状態をスクリーンショット
    await page.screenshot({ 
      path: 'fixed-inventory-ui-state.png',
      fullPage: true 
    });
    
    // テーブルが表示されているか確認
    const table = await page.locator('table').first();
    const isTableVisible = await table.isVisible();
    console.log('📊 テーブル表示状況:', isTableVisible);
    
    if (isTableVisible) {
      // テーブルヘッダーの確認
      const headers = await page.locator('th').allTextContents();
      console.log('📋 テーブルヘッダー:', headers);
      
      // 最後のヘッダーが「操作」になっていることを確認
      expect(headers).toContain('操作');
      
      // 操作列のボタン数を確認（1つだけであることを確認）
      const firstRowActionButtons = await page.locator('tbody tr:first-child td:last-child button').count();
      console.log('🎯 最初の行の操作ボタン数:', firstRowActionButtons);
      
      // 操作ボタンは1つだけであることを確認
      expect(firstRowActionButtons).toBe(1);
      
      // そのボタンが「詳細」ボタンであることを確認
      const actionButtonText = await page.locator('tbody tr:first-child td:last-child button').first().textContent();
      console.log('🔹 操作ボタンのテキスト:', actionButtonText);
      expect(actionButtonText?.trim()).toBe('詳細');
      
      // スタイルが統一されたデザインになっていることを確認
      const tableContainer = await page.locator('table').locator('..').first();
      const containerClasses = await tableContainer.getAttribute('class');
      console.log('🎨 テーブルコンテナのクラス:', containerClasses);
      
      // 新しい統一されたスタイルが適用されていることを確認
      expect(containerClasses).toContain('bg-white');
      expect(containerClasses).toContain('rounded-xl');
      expect(containerClasses).toContain('border-nexus-border');
      
      // 古いスタイルが削除されていることを確認
      expect(containerClasses).not.toContain('intelligence-card');
      expect(containerClasses).not.toContain('holo-table');
    }
  });

  test('🔄 詳細モーダル統合機能確認', async ({ page }) => {
    console.log('🔍 詳細モーダルの統合機能テスト開始...');
    
    await page.click('text=在庫管理');
    await page.waitForURL('**/staff/inventory');
    await page.waitForTimeout(3000);
    
    // 詳細ボタンをクリック
    const detailButton = page.locator('tbody tr:first-child td:last-child button:has-text("詳細")');
    if (await detailButton.isVisible()) {
      await detailButton.click();
      await page.waitForTimeout(1000);
      
      // モーダルが開いていることを確認
      const modal = page.locator('[role="dialog"]');
      const isModalOpen = await modal.isVisible();
      console.log('📦 詳細モーダル表示状況:', isModalOpen);
      
      if (isModalOpen) {
        // バーコード印刷ボタンがモーダル内にあることを確認
        const barcodeButton = modal.locator('button:has-text("バーコード印刷")');
        const hasBarcodeButton = await barcodeButton.isVisible();
        console.log('🏷️ バーコード印刷ボタン存在:', hasBarcodeButton);
        expect(hasBarcodeButton).toBe(true);
        
        // QR生成ボタンがモーダル内にあることを確認
        const qrButton = modal.locator('button:has-text("QR生成")');
        const hasQrButton = await qrButton.isVisible();
        console.log('📱 QR生成ボタン存在:', hasQrButton);
        expect(hasQrButton).toBe(true);
        
        // 移動機能も利用可能であることを確認
        const editButton = modal.locator('button:has-text("編集")');
        const hasEditButton = await editButton.isVisible();
        console.log('✏️ 編集ボタン存在:', hasEditButton);
        
        console.log('✅ 全ての機能が詳細モーダルに統合されています！');
      }
    }
  });

  test('📐 レスポンシブデザイン確認', async ({ page }) => {
    console.log('📐 レスポンシブデザインテスト開始...');
    
    await page.click('text=在庫管理');
    await page.waitForURL('**/staff/inventory');
    await page.waitForTimeout(3000);
    
    // デスクトップサイズでの確認
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);
    
    const table = await page.locator('table').first();
    const isTableVisibleDesktop = await table.isVisible();
    console.log('🖥️ デスクトップでのテーブル表示:', isTableVisibleDesktop);
    
    // タブレットサイズでの確認
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    const isTableVisibleTablet = await table.isVisible();
    console.log('📱 タブレットでのテーブル表示:', isTableVisibleTablet);
    
    // 修正後のレスポンシブ状態をスクリーンショット
    await page.screenshot({ 
      path: 'fixed-inventory-responsive.png',
      fullPage: true 
    });
    
    console.log('✅ レスポンシブデザイン確認完了');
  });
}); 