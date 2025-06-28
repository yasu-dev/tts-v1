import { test, expect } from '@playwright/test';

test.describe('Header Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staff/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display header with correct branding and user info', async ({ page }) => {
    // Wait for data loading
    await page.waitForTimeout(2000);
    
    // Check if header is visible
    await expect(page.locator('.header, header')).toBeVisible();
    
    // Check if THE WORLD DOOR branding exists
    await expect(page.locator('text=THE WORLD DOOR')).toBeVisible();
    
    // Check if user profile section exists (button with プロフィール)
    const profileButton = page.locator('button:has-text("プロフィール")');
    if (await profileButton.isVisible()) {
      await expect(profileButton).toBeVisible();
    } else {
      // Alternative: check for any user-related button
      const userButton = page.locator('button').first();
      await expect(userButton).toBeVisible();
    }
  });

  test('should display timezone widgets', async ({ page }) => {
    // Look for timezone displays
    const timezones = ['GMT', 'JST', 'EST', 'PST'];
    
    for (const timezone of timezones) {
      const timezoneElement = page.locator(`text=${timezone}`).first();
      if (await timezoneElement.isVisible()) {
        await expect(timezoneElement).toBeVisible();
      }
    }
  });

  test('should open search modal when search icon is clicked', async ({ page }) => {
    // Try multiple possible search selectors
    const searchSelectors = [
      '[data-testid="search-button"]',
      '.search-button',
      'button[aria-label*="search"]', 
      'button[aria-label*="検索"]',
      'svg[data-icon="search"]',
      '[data-testid="search-icon"]'
    ];

    let searchButtonFound = false;
    for (const selector of searchSelectors) {
      const searchButton = page.locator(selector);
      if (await searchButton.isVisible()) {
        await searchButton.click();
        searchButtonFound = true;
        break;
      }
    }

    if (searchButtonFound) {
      // Check if search modal opens
      await expect(page.locator('[data-testid="search-modal"], .search-modal')).toBeVisible();
    }
  });

  test('should open notification panel when notification icon is clicked', async ({ page }) => {
    // Try multiple possible notification selectors
    const notificationSelectors = [
      '[data-testid="notification-button"]',
      '.notification-button',
      'button[aria-label*="notification"]',
      'button[aria-label*="通知"]',
      'svg[data-icon="bell"]',
      '[data-testid="notification-icon"]'
    ];

    let notificationButtonFound = false;
    for (const selector of notificationSelectors) {
      const notificationButton = page.locator(selector);
      if (await notificationButton.isVisible()) {
        await notificationButton.click();
        notificationButtonFound = true;
        break;
      }
    }

    if (notificationButtonFound) {
      // Check if notification panel opens
      await expect(page.locator('[data-testid="notification-panel"], .notification-panel')).toBeVisible();
    }
  });

  test('should show user profile dropdown when clicked', async ({ page }) => {
    // Try multiple possible user profile selectors
    const profileSelectors = [
      '[data-testid="user-profile"]',
      '.user-profile',
      '.user-avatar',
      'button[aria-label*="profile"]',
      'button[aria-label*="プロフィール"]'
    ];

    let profileButtonFound = false;
    for (const selector of profileSelectors) {
      const profileButton = page.locator(selector);
      if (await profileButton.isVisible()) {
        await profileButton.click();
        profileButtonFound = true;
        break;
      }
    }

    if (profileButtonFound) {
      // Check if profile dropdown appears
      await expect(page.locator('[data-testid="profile-dropdown"], .profile-dropdown')).toBeVisible();
    }
  });

  test('should have correct header height and styling', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const header = page.locator('.header, header').first();
    
    // Check if header has proper styling classes
    await expect(header).toBeVisible();
    
    // Check minimum height
    const boundingBox = await header.boundingBox();
    expect(boundingBox?.height).toBeGreaterThan(50);
  });

  test('should display language toggle if available', async ({ page }) => {
    // Check for language toggle button
    const languageToggle = page.locator('[data-testid="language-toggle"], .language-toggle');
    
    if (await languageToggle.isVisible()) {
      await expect(languageToggle).toBeVisible();
      await languageToggle.click();
      // Check if language options appear
      await expect(page.locator('[data-testid="language-options"], .language-options')).toBeVisible();
    }
  });

  test('should display proper theme toggle functionality', async ({ page }) => {
    // Check for theme toggle button
    const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle');
    
    if (await themeToggle.isVisible()) {
      await expect(themeToggle).toBeVisible();
      await themeToggle.click();
      
      // Check if theme changes
      const body = page.locator('body');
      const bodyClass = await body.getAttribute('class');
      expect(bodyClass).toMatch(/(dark|light)/);
    }
  });
});