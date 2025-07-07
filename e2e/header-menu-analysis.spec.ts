import { test, expect } from '@playwright/test';

test.describe('ヘッダーメニュー詳細分析 - セラーとスタッフの違い', () => {
  test('セラーのヘッダーメニューを正確に抽出', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/dashboard');
    await page.waitForSelector('header', { timeout: 10000 });
    
    console.log('=== セラーのヘッダー分析 ===');
    
    // ヘッダー内の全てのクリック可能な要素を確認
    const headerElements = await page.locator('header').locator('button, a').all();
    
    console.log('ヘッダー内のクリック可能な要素:');
    for (let i = 0; i < headerElements.length; i++) {
      const element = headerElements[i];
      const text = await element.textContent();
      const href = await element.getAttribute('href');
      
      if (text && text.trim()) {
        console.log(`  ${i + 1}. "${text.trim()}" ${href ? `-> ${href}` : ''}`);
      }
    }
    
    // プロフィールメニューをクリックして展開
    try {
      // 様々なセレクターでプロフィールメニューを探す
      const profileSelectors = [
        'button:has-text("セラー")',
        '[data-testid="profile-button"]',
        '.profile-menu-trigger',
        'button:has-text("プロフィール")',
        'header button:last-of-type',
        'header .profile',
        '[aria-label*="プロフィール"]'
      ];
      
      let profileMenuFound = false;
      for (const selector of profileSelectors) {
        try {
          await page.click(selector, { timeout: 2000 });
          await page.waitForTimeout(1000);
          profileMenuFound = true;
          console.log(`プロフィールメニューが見つかりました (セレクター: ${selector})`);
          break;
        } catch (e) {
          // 次のセレクターを試す
        }
      }
      
      if (profileMenuFound) {
        // プロフィールメニューの項目を取得
        const menuSelectors = [
          '.profile-menu button, .profile-menu a',
          '[data-testid="profile-menu"] button, [data-testid="profile-menu"] a',
          '[role="menu"] button, [role="menu"] a',
          '.dropdown-menu button, .dropdown-menu a'
        ];
        
        for (const menuSelector of menuSelectors) {
          try {
            const menuItems = await page.locator(menuSelector).all();
            if (menuItems.length > 0) {
              console.log('\nセラープロフィールメニュー項目:');
              for (let i = 0; i < menuItems.length; i++) {
                const item = menuItems[i];
                const text = await item.textContent();
                const href = await item.getAttribute('href');
                if (text && text.trim()) {
                  console.log(`  ${i + 1}. "${text.trim()}" ${href ? `-> ${href}` : ''}`);
                }
              }
              break;
            }
          } catch (e) {
            // 次のセレクターを試す
          }
        }
      } else {
        console.log('プロフィールメニューが見つかりませんでした');
      }
    } catch (error) {
      console.log('プロフィールメニューの展開に失敗しました');
    }
  });

  test('スタッフのヘッダーメニューを正確に抽出', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/staff/dashboard');
    await page.waitForSelector('header', { timeout: 10000 });
    
    console.log('=== スタッフのヘッダー分析 ===');
    
    // ヘッダー内の全てのクリック可能な要素を確認
    const headerElements = await page.locator('header').locator('button, a').all();
    
    console.log('ヘッダー内のクリック可能な要素:');
    for (let i = 0; i < headerElements.length; i++) {
      const element = headerElements[i];
      const text = await element.textContent();
      const href = await element.getAttribute('href');
      
      if (text && text.trim()) {
        console.log(`  ${i + 1}. "${text.trim()}" ${href ? `-> ${href}` : ''}`);
      }
    }
    
    // プロフィールメニューをクリックして展開
    try {
      const profileSelectors = [
        'button:has-text("スタッフ")',
        '[data-testid="profile-button"]',
        '.profile-menu-trigger',
        'button:has-text("プロフィール")',
        'header button:last-of-type',
        'header .profile',
        '[aria-label*="プロフィール"]'
      ];
      
      let profileMenuFound = false;
      for (const selector of profileSelectors) {
        try {
          await page.click(selector, { timeout: 2000 });
          await page.waitForTimeout(1000);
          profileMenuFound = true;
          console.log(`プロフィールメニューが見つかりました (セレクター: ${selector})`);
          break;
        } catch (e) {
          // 次のセレクターを試す
        }
      }
      
      if (profileMenuFound) {
        // プロフィールメニューの項目を取得
        const menuSelectors = [
          '.profile-menu button, .profile-menu a',
          '[data-testid="profile-menu"] button, [data-testid="profile-menu"] a',
          '[role="menu"] button, [role="menu"] a',
          '.dropdown-menu button, .dropdown-menu a'
        ];
        
        for (const menuSelector of menuSelectors) {
          try {
            const menuItems = await page.locator(menuSelector).all();
            if (menuItems.length > 0) {
              console.log('\nスタッフプロフィールメニュー項目:');
              for (let i = 0; i < menuItems.length; i++) {
                const item = menuItems[i];
                const text = await item.textContent();
                const href = await item.getAttribute('href');
                if (text && text.trim()) {
                  console.log(`  ${i + 1}. "${text.trim()}" ${href ? `-> ${href}` : ''}`);
                }
              }
              break;
            }
          } catch (e) {
            // 次のセレクターを試す
          }
        }
      } else {
        console.log('プロフィールメニューが見つかりませんでした');
      }
    } catch (error) {
      console.log('プロフィールメニューの展開に失敗しました');
    }
  });

  test('プロフィール設定とアカウント設定の画面内容を確認', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    console.log('=== プロフィール設定とアカウント設定の内容比較 ===');
    
    // プロフィール設定画面
    try {
      await page.goto('/profile');
      await page.waitForSelector('h1', { timeout: 3000 });
      const profileTitle = await page.locator('h1').first().textContent();
      const profileContent = await page.locator('main, .content').textContent();
      
      console.log(`プロフィール設定画面:`);
      console.log(`  タイトル: "${profileTitle?.trim()}"`);
      console.log(`  主な内容: ${profileContent?.substring(0, 200)}...`);
    } catch (error) {
      console.log('プロフィール設定画面にアクセスできませんでした');
    }
    
    // アカウント設定画面
    try {
      await page.goto('/settings');
      await page.waitForSelector('h1', { timeout: 3000 });
      const settingsTitle = await page.locator('h1').first().textContent();
      const settingsContent = await page.locator('main, .content').textContent();
      
      console.log(`アカウント設定画面:`);
      console.log(`  タイトル: "${settingsTitle?.trim()}"`);
      console.log(`  主な内容: ${settingsContent?.substring(0, 200)}...`);
    } catch (error) {
      console.log('アカウント設定画面にアクセスできませんでした');
    }
  });
}); 