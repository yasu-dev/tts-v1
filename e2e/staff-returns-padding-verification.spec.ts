import { test, expect } from '@playwright/test';

test.describe('🎯 返品処理画面パディング統一検証（正確測定）', () => {

  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // スタッフ返品ページに移動
    await page.goto('/staff/returns');
    await page.waitForLoadState('networkidle');
  });

  test('📏 返品検品タブ - メインコンテンツパディング測定', async ({ page }) => {
    // 返品検品タブを選択
    await page.click('button:has-text("返品検品")');
    await page.waitForTimeout(500);
    
    // 正しいメインコンテンツコンテナを取得（DashboardLayoutの p-8）
    const mainContainer = page.locator('#main-content .page-scroll-container > div').first();
    await expect(mainContainer).toBeVisible();
    
    // パディング測定
    const paddingInfo = await mainContainer.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement?.getBoundingClientRect();
      
      return {
        paddingLeft: computedStyle.paddingLeft,
        paddingRight: computedStyle.paddingRight,
        paddingTop: computedStyle.paddingTop,
        paddingBottom: computedStyle.paddingBottom,
        leftPadding: rect.left - (parentRect?.left || 0),
        rightPadding: (parentRect?.right || 0) - rect.right,
        className: el.className
      };
    });
    
    console.log('📊 返品検品タブ - メインコンテンツパディング:', paddingInfo);
    
    // p-8クラス（32px）を確認
    expect(paddingInfo.paddingLeft).toBe('32px');
    expect(paddingInfo.paddingRight).toBe('32px');
    
    // スクリーンショット
    await page.screenshot({ 
      path: 'test-results/main-content-padding-inspection.png',
      fullPage: true 
    });
  });

  test('📏 再出品フロータブ - メインコンテンツパディング測定', async ({ page }) => {
    // 再出品業務フロータブを選択
    await page.click('button:has-text("再出品業務フロー")');
    await page.waitForTimeout(500);

    // メインコンテンツコンテナを取得
    const mainContainer = page.locator('#main-content .page-scroll-container > div').first();
    await expect(mainContainer).toBeVisible();
    
    const paddingInfo = await mainContainer.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement?.getBoundingClientRect();
      
      return {
        paddingLeft: computedStyle.paddingLeft,
        paddingRight: computedStyle.paddingRight,
        leftPadding: rect.left - (parentRect?.left || 0),
        rightPadding: (parentRect?.right || 0) - rect.right,
        className: el.className
      };
    });
    
    console.log('📊 再出品フロータブ - メインコンテンツパディング:', paddingInfo);
    
    // p-8クラス（32px）を確認
    expect(paddingInfo.paddingLeft).toBe('32px');
    expect(paddingInfo.paddingRight).toBe('32px');
    
    await page.screenshot({ 
      path: 'test-results/main-content-padding-relisting.png',
      fullPage: true 
    });
  });

  test('📏 返品理由分析タブ - メインコンテンツパディング測定', async ({ page }) => {
    // 返品理由分析タブを選択
    await page.click('button:has-text("返品理由分析")');
    await page.waitForTimeout(500);

    // メインコンテンツコンテナを取得
    const mainContainer = page.locator('#main-content .page-scroll-container > div').first();
    await expect(mainContainer).toBeVisible();
    
    const paddingInfo = await mainContainer.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement?.getBoundingClientRect();
      
      return {
        paddingLeft: computedStyle.paddingLeft,
        paddingRight: computedStyle.paddingRight,
        leftPadding: rect.left - (parentRect?.left || 0),
        rightPadding: (parentRect?.right || 0) - rect.right,
        className: el.className
      };
    });
    
    console.log('📊 返品理由分析タブ - メインコンテンツパディング:', paddingInfo);
    
    // p-8クラス（32px）を確認
    expect(paddingInfo.paddingLeft).toBe('32px');
    expect(paddingInfo.paddingRight).toBe('32px');
    
    await page.screenshot({ 
      path: 'test-results/main-content-padding-analysis.png',
      fullPage: true 
    });
  });

  test('🔍 全タブメインコンテンツパディング統一検証', async ({ page }) => {
    const results = {
      inspection: null as any,
      relisting: null as any,
      analysis: null as any
    };
    
    // 1. 返品検品タブ
    await page.click('button:has-text("返品検品")');
    await page.waitForTimeout(300);
    
    results.inspection = await page.locator('#main-content .page-scroll-container > div').first().evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        paddingLeft: computedStyle.paddingLeft,
        paddingRight: computedStyle.paddingRight,
        paddingTop: computedStyle.paddingTop,
        paddingBottom: computedStyle.paddingBottom
      };
    });
    
    // 2. 再出品フロータブ
    await page.click('button:has-text("再出品業務フロー")');
    await page.waitForTimeout(300);
    
    results.relisting = await page.locator('#main-content .page-scroll-container > div').first().evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
        return {
        paddingLeft: computedStyle.paddingLeft,
        paddingRight: computedStyle.paddingRight,
        paddingTop: computedStyle.paddingTop,
        paddingBottom: computedStyle.paddingBottom
      };
    });
    
    // 3. 返品理由分析タブ
    await page.click('button:has-text("返品理由分析")');
    await page.waitForTimeout(300);
    
    results.analysis = await page.locator('#main-content .page-scroll-container > div').first().evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
            return {
        paddingLeft: computedStyle.paddingLeft,
        paddingRight: computedStyle.paddingRight,
        paddingTop: computedStyle.paddingTop,
        paddingBottom: computedStyle.paddingBottom
      };
    });
    
    console.log('🎯 全タブメインコンテンツパディング比較:', results);
    
    // パディング統一検証（すべて32px）
    expect(results.inspection.paddingLeft).toBe('32px');
    expect(results.inspection.paddingRight).toBe('32px');
    expect(results.relisting.paddingLeft).toBe('32px');
    expect(results.relisting.paddingRight).toBe('32px');
    expect(results.analysis.paddingLeft).toBe('32px');
    expect(results.analysis.paddingRight).toBe('32px');
    
    // 統一検証完了スクリーンショット
    await page.screenshot({ 
      path: 'test-results/main-content-padding-unified-verification.png',
      fullPage: true 
    });
  });

  test('🖼️ 赤色ハイライト表示テスト', async ({ page }) => {
    // デバッグ用：赤色でメインコンテンツパディングをハイライト
    await page.click('button:has-text("返品検品")');
    await page.waitForTimeout(500);
    
    // 赤色ハイライトを追加
    await page.evaluate(() => {
      const mainContainer = document.querySelector('#main-content .page-scroll-container > div') as HTMLElement;
      if (mainContainer) {
        // パディング部分を視覚化
        mainContainer.style.background = 'linear-gradient(90deg, red 32px, transparent 32px, transparent calc(100% - 32px), red calc(100% - 32px))';
        mainContainer.style.minHeight = '400px';
      }
    });
    
    // 各タブでハイライト確認
    for (const tab of ['返品検品', '再出品業務フロー', '返品理由分析']) {
      await page.click(`button:has-text("${tab}")`);
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/red-highlight-${tab.replace(/[^a-zA-Z0-9]/g, '')}.png`,
        fullPage: true 
      });
    }
  });
}); 