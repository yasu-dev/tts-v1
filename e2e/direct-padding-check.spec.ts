import { test, expect } from '@playwright/test';

test.describe('直接パディング確認', () => {
  test('🌐 開発サーバー接続確認とパディング測定', async ({ page }) => {
    // 開発サーバーに直接接続
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // ページタイトルの確認
    const title = await page.title();
    console.log('ページタイトル:', title);
    
    // 初期画面のスクリーンショット
    await page.screenshot({
      path: 'test-results/direct-homepage.png',
      fullPage: true
    });
    
    // ページの基本構造を確認
    const mainContent = page.locator('main, #main-content, .main-content');
    const isMainVisible = await mainContent.isVisible();
    console.log('メインコンテンツ要素存在:', isMainVisible);
    
    if (isMainVisible) {
      // パディング要素を検索
      const paddingContainers = [
        '.page-scroll-container > div',
        '.p-8',
        '.p-6',
        '.nexus-content-card',
        '.intelligence-card'
      ];
      
      for (const selector of paddingContainers) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          const paddingInfo = await element.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            return {
              selector: selector,
              paddingLeft: parseInt(styles.paddingLeft),
              paddingRight: parseInt(styles.paddingRight),
              className: el.className
            };
          });
          console.log('要素パディング情報:', paddingInfo);
        }
      }
    }
  });

  test('📏 ログインなしでのパディング測定', async ({ page }) => {
    // ダッシュボードページに直接アクセス（リダイレクトされる場合あり）
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    
    const currentUrl = page.url();
    console.log('現在のURL:', currentUrl);
    
    // ページ全体のスクリーンショット
    await page.screenshot({
      path: 'test-results/direct-dashboard-attempt.png',
      fullPage: true
    });
    
    // DashboardLayoutがレンダリングされているか確認
    const dashboardLayout = page.locator('[data-testid="dashboard-layout"]');
    const isDashboardVisible = await dashboardLayout.isVisible();
    console.log('ダッシュボードレイアウト存在:', isDashboardVisible);
    
    if (isDashboardVisible) {
      // パディングコンテナを確認
      const contentContainer = page.locator('.page-scroll-container > div').first();
      if (await contentContainer.isVisible()) {
        const paddingInfo = await contentContainer.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            paddingLeft: parseInt(styles.paddingLeft),
            paddingRight: parseInt(styles.paddingRight),
            paddingTop: parseInt(styles.paddingTop),
            paddingBottom: parseInt(styles.paddingBottom),
            className: el.className
          };
        });
        
        console.log('ダッシュボード パディング測定結果:', paddingInfo);
        
        // 統一性確認
        const isUnified = paddingInfo.paddingLeft === paddingInfo.paddingRight;
        const is32px = paddingInfo.paddingLeft === 32 && paddingInfo.paddingRight === 32;
        
        console.log(`統一チェック: ${isUnified ? '✅' : '❌'}`);
        console.log(`32px チェック: ${is32px ? '✅' : '❌'}`);
        
        if (is32px && isUnified) {
          console.log('🎉 パディング統一修正成功！');
        } else {
          console.log('⚠️ パディング統一に問題があります');
          console.log(`実際の値: Left=${paddingInfo.paddingLeft}px, Right=${paddingInfo.paddingRight}px`);
        }
      }
    }
  });

  test('🎨 フロントエンド直接確認', async ({ page }) => {
    // フロントエンドに直接アクセス
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // ページ構造の詳細調査
    const bodyInfo = await page.evaluate(() => {
      const body = document.body;
      const allElements = Array.from(document.querySelectorAll('*'));
      
      const paddingElements = allElements.filter(el => {
        const styles = window.getComputedStyle(el);
        const paddingLeft = parseInt(styles.paddingLeft);
        return paddingLeft > 0;
      }).map(el => {
        const styles = window.getComputedStyle(el);
        return {
          tagName: el.tagName,
          className: el.className,
          paddingLeft: parseInt(styles.paddingLeft),
          paddingRight: parseInt(styles.paddingRight),
          textContent: el.textContent?.substring(0, 50) + '...'
        };
      });
      
      return {
        bodyClassName: body.className,
        paddingElementsCount: paddingElements.length,
        paddingElements: paddingElements.slice(0, 10) // 最初の10個のみ
      };
    });
    
    console.log('ページ構造分析:', bodyInfo);
    
    // 最終スクリーンショット
    await page.screenshot({
      path: 'test-results/frontend-analysis.png',
      fullPage: true
    });
  });
}); 