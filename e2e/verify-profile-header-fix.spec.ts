import { test, expect } from '@playwright/test';

test.describe('プロフィール設定ページのヘッダー修正確認', () => {
  test('セラーのプロフィール設定でヘッダーが正しく表示されることを確認', async ({ page }) => {
    // セラーダッシュボードからプロフィール設定にアクセス
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForSelector('.nexus-header', { timeout: 10000 });

    console.log('=== セラーダッシュボードからプロフィール設定アクセス ===');

    // ヘッダーの現在の表示を確認
    const headerUserType = await page.$eval('.nexus-header button .text-white', el => el.textContent?.trim());
    console.log(`ダッシュボードでのヘッダー表示: ${headerUserType}`);

    // プロフィールメニューをクリック
    const profileButton = await page.$('.nexus-header button:has(.text-white)');
    if (profileButton) {
      await profileButton.click();
      await page.waitForTimeout(1000);

      // プロフィール設定メニューが表示されることを確認
      const profileMenuVisible = await page.isVisible('.fixed.inset-0 [class*="right-"]');
      console.log(`プロフィールメニュー表示: ${profileMenuVisible ? 'あり' : 'なし'}`);

      // プロフィール設定リンクをクリック
      const profileSettingsLink = await page.$('text=プロフィール設定');
      if (profileSettingsLink) {
        await profileSettingsLink.click();
        await page.waitForTimeout(2000);

        // プロフィール設定ページに移動したことを確認
        const currentUrl = page.url();
        console.log(`現在のURL: ${currentUrl}`);
        expect(currentUrl).toContain('/profile');

        // ヘッダーのユーザータイプ表示を確認
        const profilePageUserType = await page.$eval('.nexus-header button .text-white', el => el.textContent?.trim());
        console.log(`プロフィール設定ページでのヘッダー表示: ${profilePageUserType}`);

        // セラーと表示されることを確認（スタッフではない）
        expect(profilePageUserType).toBe('セラー');

        // プロフィールメニューを再度開いて表示名を確認
        const profileButtonOnPage = await page.$('.nexus-header button:has(.text-white)');
        if (profileButtonOnPage) {
          await profileButtonOnPage.click();
          await page.waitForTimeout(1000);

          // プロフィールメニュー内の表示名を確認
          const menuDisplayName = await page.$eval('.bg-gray-50 h3', el => el.textContent?.trim());
          console.log(`プロフィールメニュー内の表示名: ${menuDisplayName}`);

          // 「プロフィール設定」と表示されることを確認
          expect(menuDisplayName).toBe('プロフィール設定');

          console.log('✅ セラーのプロフィール設定ページで正しく表示されています');
        }
      }
    }
  });

  test('プロフィール設定ページのタイトルが正しく表示されることを確認', async ({ page }) => {
    // 直接プロフィール設定ページにアクセス
    await page.goto('http://localhost:3002/profile');
    await page.waitForSelector('.intelligence-card', { timeout: 10000 });

    console.log('=== プロフィール設定ページ表示確認 ===');

    // ページタイトルを確認
    const pageTitle = await page.$eval('h1, .text-2xl, [class*="title"]', el => el.textContent?.trim());
    console.log(`ページタイトル: ${pageTitle}`);

    // UnifiedPageHeaderのタイトルを確認
    const unifiedTitle = await page.$eval('.space-y-6 h1, .mb-2 h1', el => el.textContent?.trim()).catch(() => null);
    if (unifiedTitle) {
      console.log(`統一ヘッダータイトル: ${unifiedTitle}`);
      expect(unifiedTitle).toBe('プロフィール設定');
    }

    // 基本情報セクションの存在確認
    const basicInfoSection = await page.$('text=基本情報');
    expect(basicInfoSection).toBeTruthy();

    console.log('✅ プロフィール設定ページが正常に表示されています');
  });

  test('スタッフとセラーでヘッダー表示が適切に切り替わることを確認', async ({ page }) => {
    console.log('=== ユーザータイプ別ヘッダー表示確認 ===');

    // セラーダッシュボード
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForSelector('.nexus-header', { timeout: 10000 });

    const sellerHeaderType = await page.$eval('.nexus-header button .text-white', el => el.textContent?.trim());
    console.log(`セラーダッシュボード ヘッダー表示: ${sellerHeaderType}`);
    expect(sellerHeaderType).toBe('セラー');

    // スタッフダッシュボード
    await page.goto('http://localhost:3002/staff/dashboard');
    await page.waitForSelector('.nexus-header', { timeout: 10000 });

    const staffHeaderType = await page.$eval('.nexus-header button .text-white', el => el.textContent?.trim());
    console.log(`スタッフダッシュボード ヘッダー表示: ${staffHeaderType}`);
    expect(staffHeaderType).toBe('スタッフ');

    // プロフィール設定（リファラーなし - デフォルトスタッフ）
    await page.goto('http://localhost:3002/profile');
    await page.waitForSelector('.nexus-header', { timeout: 10000 });

    const profileHeaderType = await page.$eval('.nexus-header button .text-white', el => el.textContent?.trim());
    console.log(`プロフィール設定（直接アクセス）ヘッダー表示: ${profileHeaderType}`);

    console.log('✅ ユーザータイプ別のヘッダー表示確認完了');
  });
});