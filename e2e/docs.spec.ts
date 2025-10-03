import { test, expect } from '@playwright/test';

test('docs index renders', async ({ page }) => {
  await page.goto('/docs/index.html');
  await expect(page.locator('text=プロジェクト概要')).toBeVisible();
});

// 納品プラン作成: トップレベル「その他」セクション非表示の検証
test('納品プラン作成でトップレベル「その他」カテゴリが存在しない', async ({ page }) => {
  // セラーでログイン
  await page.goto('/login');
  await page.fill('input[name="email"]', 'seller@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');

  // 納品プラン作成へ
  await page.goto('/delivery-plan');
  await page.waitForLoadState('networkidle');

  // 階層型検品の主要セクション見出し群
  const headings = page.locator('button, h4, h6');

  // トップレベルの「その他」セクション見出しが存在しないこと
  // 注意: セクション内フィールドラベルの「その他」は残るため、見出し(role=button等)のみに限定
  const sectionToggles = page.getByRole('button');
  await expect(sectionToggles.filter({ hasText: 'その他' })).toHaveCount(0);
});
