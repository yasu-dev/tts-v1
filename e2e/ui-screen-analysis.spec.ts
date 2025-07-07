import { test, expect } from '@playwright/test';

test.describe('UI画面分析 - 実際のメニューを抽出', () => {
  test('セラー画面のサイドメニューを抽出', async ({ page }) => {
    // セラーとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ダッシュボードに移動
    await page.goto('/dashboard');
    await page.waitForSelector('aside[role="navigation"]');
    
    // サイドメニューの項目を抽出
    const menuItems = await page.locator('aside[role="navigation"] button').allTextContents();
    console.log('セラー画面のサイドメニュー項目:');
    menuItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });
    
    // メニューリンクも確認
    const menuLinks = await page.locator('aside[role="navigation"] a').all();
    console.log('\nセラー画面のメニューリンク:');
    for (const link of menuLinks) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`- ${text}: ${href}`);
    }
  });

  test('スタッフ画面のサイドメニューを抽出', async ({ page }) => {
    // スタッフとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // スタッフダッシュボードに移動
    await page.goto('/staff/dashboard');
    await page.waitForSelector('aside[role="navigation"]');
    
    // サイドメニューの項目を抽出
    const menuItems = await page.locator('aside[role="navigation"] button').allTextContents();
    console.log('スタッフ画面のサイドメニュー項目:');
    menuItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });
    
    // メニューリンクも確認
    const menuLinks = await page.locator('aside[role="navigation"] a').all();
    console.log('\nスタッフ画面のメニューリンク:');
    for (const link of menuLinks) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`- ${text}: ${href}`);
    }
  });

  test('ヘッダーメニューを抽出', async ({ page }) => {
    // セラーとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/dashboard');
    
    // ヘッダーのプロフィールメニューをクリック
    await page.click('[data-testid="profile-menu-trigger"], .profile-menu-trigger, button:has-text("プロフィール")');
    
    // プロフィールメニューの項目を抽出
    const profileMenuItems = await page.locator('[data-testid="profile-menu"], .profile-menu').locator('button, a').allTextContents();
    console.log('ヘッダープロフィールメニュー項目:');
    profileMenuItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });
  });

  test('全画面のナビゲーション可能なページを確認', async ({ page }) => {
    // セラーとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 各ページに実際にアクセスして存在確認
    const sellerPages = [
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
    
    console.log('セラー画面のアクセス可能ページ:');
    for (const pagePath of sellerPages) {
      try {
        await page.goto(pagePath);
        await page.waitForSelector('h1, [data-testid="page-title"]', { timeout: 3000 });
        const title = await page.locator('h1, [data-testid="page-title"]').first().textContent();
        console.log(`✓ ${pagePath}: ${title}`);
      } catch (error) {
        console.log(`✗ ${pagePath}: アクセス不可`);
      }
    }
    
    // スタッフ画面も確認
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
      '/staff/reports',
      '/staff/listing',
      '/staff/picking'
    ];
    
    console.log('\nスタッフ画面のアクセス可能ページ:');
    for (const pagePath of staffPages) {
      try {
        await page.goto(pagePath);
        await page.waitForSelector('h1, [data-testid="page-title"]', { timeout: 3000 });
        const title = await page.locator('h1, [data-testid="page-title"]').first().textContent();
        console.log(`✓ ${pagePath}: ${title}`);
      } catch (error) {
        console.log(`✗ ${pagePath}: アクセス不可`);
      }
    }
  });
}); 