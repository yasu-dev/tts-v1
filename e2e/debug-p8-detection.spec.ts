import { test, expect } from '@playwright/test';

test.describe('p-8要素詳細検出デバッグ', () => {
  test('🔍 Seller返品管理画面 - p-8要素詳細調査', async ({ page }) => {
    // Sellerログイン
    await page.goto('http://localhost:3002/login');
    await page.waitForSelector('[data-testid="seller-login"]');
    await page.click('[data-testid="seller-login"]');
    await page.waitForTimeout(1000);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');

    // Seller返品管理画面にアクセス
    await page.goto('http://localhost:3002/returns');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // p-8要素を詳細に調査
    const p8Elements = await page.locator('.p-8');
    const p8Count = await p8Elements.count();
    
    console.log(`🔍 p-8要素総数: ${p8Count}`);
    
    if (p8Count > 0) {
      for (let i = 0; i < p8Count; i++) {
        const element = p8Elements.nth(i);
        const textContent = await element.textContent();
        const innerHTML = await element.innerHTML();
        const outerHTML = await element.evaluate(el => el.outerHTML);
        const className = await element.getAttribute('class');
        
        console.log(`\n📍 p-8要素 #${i + 1}:`);
        console.log(`  - クラス: ${className}`);
        console.log(`  - テキスト: ${textContent?.substring(0, 100)}...`);
        console.log(`  - HTML: ${outerHTML.substring(0, 200)}...`);
      }
    }

    // スクリーンショット保存
    await page.screenshot({ path: 'debug-seller-returns-p8.png', fullPage: true });
  });

  test('🔍 Staffロケーション管理画面 - p-5要素詳細調査', async ({ page }) => {
    // Staffログイン
    await page.goto('http://localhost:3002/login');
    await page.waitForSelector('[data-testid="staff-login"]');
    await page.click('[data-testid="staff-login"]');
    await page.waitForTimeout(1000);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/staff/dashboard');

    // Staffロケーション管理画面にアクセス
    await page.goto('http://localhost:3002/staff/location');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // p-5要素を詳細に調査
    const p5Elements = await page.locator('.p-5');
    const p5Count = await p5Elements.count();
    
    console.log(`🔍 p-5要素総数: ${p5Count}`);
    
    if (p5Count > 0) {
      for (let i = 0; i < Math.min(p5Count, 3); i++) {
        const element = p5Elements.nth(i);
        const textContent = await element.textContent();
        const className = await element.getAttribute('class');
        
        console.log(`\n📍 p-5要素 #${i + 1}:`);
        console.log(`  - クラス: ${className}`);
        console.log(`  - テキスト: ${textContent?.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ p-5要素が見つかりません - ページが正しくロードされていない可能性があります');
      
      // 代替として、ページの基本要素を確認
      const pageTitle = await page.textContent('h1');
      const cards = await page.locator('.intelligence-card').count();
      const divElements = await page.locator('div').count();
      
      console.log(`\n📊 ページ基本情報:`);
      console.log(`  - ページタイトル: ${pageTitle}`);
      console.log(`  - intelligence-card数: ${cards}`);
      console.log(`  - div要素総数: ${divElements}`);
    }

    // スクリーンショット保存
    await page.screenshot({ path: 'debug-staff-location-p5.png', fullPage: true });
  });
}); 