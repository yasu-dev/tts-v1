import { test, expect } from '@playwright/test';

test('docs index renders', async ({ page }) => {
  await page.goto('/docs/index.html');
  await expect(page.locator('text=プロジェクト概要')).toBeVisible();
});



