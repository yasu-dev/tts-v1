import { test, expect } from '@playwright/test';

test.describe('UI画面詳細分析 - 正確なメニューテキスト抽出', () => {
  test('セラー画面の実際のサイドメニューテキストを抽出', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/dashboard');
    await page.waitForSelector('aside', { timeout: 10000 });
    
    // サイドバー内の全てのクリック可能な要素を取得
    const sidebarElements = await page.locator('aside').locator('button, a').all();
    
    console.log('=== セラー画面サイドメニュー ===');
    for (let i = 0; i < sidebarElements.length; i++) {
      const element = sidebarElements[i];
      const text = await element.textContent();
      const href = await element.getAttribute('href');
      
      if (text && text.trim() && !text.includes('ログアウト') && !text.includes('システム')) {
        console.log(`${i + 1}. "${text.trim()}" ${href ? `-> ${href}` : ''}`);
      }
    }
  });

  test('スタッフ画面の実際のサイドメニューテキストを抽出', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/staff/dashboard');
    await page.waitForSelector('aside', { timeout: 10000 });
    
    // サイドバー内の全てのクリック可能な要素を取得
    const sidebarElements = await page.locator('aside').locator('button, a').all();
    
    console.log('=== スタッフ画面サイドメニュー ===');
    for (let i = 0; i < sidebarElements.length; i++) {
      const element = sidebarElements[i];
      const text = await element.textContent();
      const href = await element.getAttribute('href');
      
      if (text && text.trim() && !text.includes('ログアウト') && !text.includes('システム')) {
        console.log(`${i + 1}. "${text.trim()}" ${href ? `-> ${href}` : ''}`);
      }
    }
  });

  test('ヘッダーのプロフィールメニューテキストを抽出', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/dashboard');
    
    // ヘッダー右上のプロフィールエリアをクリック
    try {
      await page.click('button:has-text("セラー"), [data-testid="profile-button"], .profile-menu-trigger');
      await page.waitForTimeout(1000);
      
      // プロフィールメニューの項目を取得
      const menuItems = await page.locator('.profile-menu, [data-testid="profile-menu"]').locator('button, a').all();
      
      console.log('=== ヘッダープロフィールメニュー ===');
      for (let i = 0; i < menuItems.length; i++) {
        const item = menuItems[i];
        const text = await item.textContent();
        if (text && text.trim()) {
          console.log(`${i + 1}. "${text.trim()}"`);
        }
      }
    } catch (error) {
      console.log('プロフィールメニューが見つかりませんでした');
    }
  });

  test('各画面のページタイトルを正確に取得', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    const pages = [
      '/dashboard',
      '/delivery', 
      '/inventory',
      '/sales',
      '/returns',
      '/billing',
      '/timeline',
      '/reports',
      '/profile',
      '/settings'
    ];
    
    console.log('=== セラー画面のページタイトル ===');
    for (const pagePath of pages) {
      try {
        await page.goto(pagePath);
        await page.waitForSelector('h1', { timeout: 3000 });
        const title = await page.locator('h1').first().textContent();
        console.log(`${pagePath}: "${title?.trim()}"`);
      } catch (error) {
        console.log(`${pagePath}: アクセス不可またはタイトル取得失敗`);
      }
    }
    
    // スタッフ画面
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    const staffPages = [
      '/staff/dashboard',
      '/staff/tasks',
      '/staff/inventory', 
      '/staff/inspection',
      '/staff/location',
      '/staff/shipping',
      '/staff/returns',
      '/staff/reports'
    ];
    
    console.log('=== スタッフ画面のページタイトル ===');
    for (const pagePath of staffPages) {
      try {
        await page.goto(pagePath);
        await page.waitForSelector('h1', { timeout: 3000 });
        const title = await page.locator('h1').first().textContent();
        console.log(`${pagePath}: "${title?.trim()}"`);
      } catch (error) {
        console.log(`${pagePath}: アクセス不可またはタイトル取得失敗`);
      }
    }
  });
}); 