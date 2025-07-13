import { test, expect } from '@playwright/test';

test.describe('統一ヘッダーUIベリフィケーション', () => {
  // テスト対象の全画面
  const pages = [
    { name: 'ダッシュボード', url: '/dashboard', userType: 'seller' },
    { name: '販売', url: '/sales', userType: 'seller' },
    { name: '在庫', url: '/inventory', userType: 'seller' },
    { name: '返品', url: '/returns', userType: 'seller' },
    { name: 'プロフィール', url: '/profile', userType: 'seller' },
    { name: '設定', url: '/settings', userType: 'seller' },
    { name: 'スタッフダッシュボード', url: '/staff/dashboard', userType: 'staff' },
    { name: 'スタッフタスク', url: '/staff/tasks', userType: 'staff' }
  ];

  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('http://localhost:3002/login');
    
    // ログインフォームが表示されるまで待機
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    await page.fill('input[type="email"]', 'seller@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ダッシュボードページが表示されるまで待機
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('全画面での統一ヘッダー要素検証', async ({ page }) => {
    const headerDetails = [];

    for (const pageInfo of pages) {
      await page.goto(`http://localhost:3002${pageInfo.url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // UIが安定するまで待機

      // 統一ヘッダーコンポーネントを検索
      const unifiedHeader = page.locator('[data-testid="unified-page-header"]');
      
      if (await unifiedHeader.isVisible()) {
        // 全画面スクリーンショット
        await page.screenshot({
          path: `test-results/unified-header-${pageInfo.name}.png`,
          fullPage: true
        });

        // アイコンの確認
        const icon = unifiedHeader.locator('svg').first();
        const iconExists = await icon.isVisible();
        
        // タイトルのスタイル確認
        const titleElement = unifiedHeader.locator('h1');
        const titleStyles = await titleElement.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            color: style.color,
            fontFamily: style.fontFamily
          };
        });

        // サブタイトルのスタイル確認
        const subtitleElement = unifiedHeader.locator('p');
        const subtitleStyles = await subtitleElement.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            color: style.color,
            marginTop: style.marginTop
          };
        });

        // アイコンのスタイル確認
        const iconStyles = iconExists ? await icon.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            width: style.width,
            height: style.height,
            color: style.color
          };
        }) : null;

        // 全体コンテナのスタイル確認
        const containerStyles = await unifiedHeader.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            padding: style.padding,
            backgroundColor: style.backgroundColor,
            borderRadius: style.borderRadius,
            display: style.display
          };
        });

        headerDetails.push({
          page: pageInfo.name,
          url: pageInfo.url,
          userType: pageInfo.userType,
          hasIcon: iconExists,
          titleStyles,
          subtitleStyles,
          iconStyles,
          containerStyles,
          titleText: await titleElement.textContent(),
          subtitleText: await subtitleElement.textContent()
        });

        console.log(`${pageInfo.name}画面の統一ヘッダー詳細:`, {
          hasIcon: iconExists,
          titleStyles,
          subtitleStyles,
          iconStyles,
          containerStyles
        });
      } else {
        console.log(`${pageInfo.name}画面で統一ヘッダーが見つかりませんでした`);
        
        // 従来のヘッダーが存在するかチェック
        const oldHeader = page.locator('.intelligence-card h1').first();
        if (await oldHeader.isVisible()) {
          console.log(`${pageInfo.name}画面では古いヘッダー形式が使用されています`);
        }
      }
    }

    // 統一性の検証
    if (headerDetails.length > 0) {
      const referenceHeader = headerDetails[0];
      const inconsistencies = [];

      for (let i = 1; i < headerDetails.length; i++) {
        const currentHeader = headerDetails[i];
        
        // アイコンの有無統一性
        if (currentHeader.hasIcon !== referenceHeader.hasIcon) {
          inconsistencies.push(`${currentHeader.page}: アイコンの有無が統一されていません (${currentHeader.hasIcon} vs ${referenceHeader.hasIcon})`);
        }
        
        // タイトルのフォントサイズ統一性
        if (currentHeader.titleStyles.fontSize !== referenceHeader.titleStyles.fontSize) {
          inconsistencies.push(`${currentHeader.page}: タイトルのフォントサイズが統一されていません (${currentHeader.titleStyles.fontSize} vs ${referenceHeader.titleStyles.fontSize})`);
        }
        
        // タイトルのフォントの太さ統一性
        if (currentHeader.titleStyles.fontWeight !== referenceHeader.titleStyles.fontWeight) {
          inconsistencies.push(`${currentHeader.page}: タイトルのフォントの太さが統一されていません (${currentHeader.titleStyles.fontWeight} vs ${referenceHeader.titleStyles.fontWeight})`);
        }
        
        // サブタイトルのスタイル統一性
        if (currentHeader.subtitleStyles.fontSize !== referenceHeader.subtitleStyles.fontSize) {
          inconsistencies.push(`${currentHeader.page}: サブタイトルのフォントサイズが統一されていません (${currentHeader.subtitleStyles.fontSize} vs ${referenceHeader.subtitleStyles.fontSize})`);
        }
        
        // アイコンのサイズ統一性
        if (currentHeader.iconStyles && referenceHeader.iconStyles) {
          if (currentHeader.iconStyles.width !== referenceHeader.iconStyles.width) {
            inconsistencies.push(`${currentHeader.page}: アイコンのサイズが統一されていません (${currentHeader.iconStyles.width} vs ${referenceHeader.iconStyles.width})`);
          }
        }
        
        // コンテナのパディング統一性
        if (currentHeader.containerStyles.padding !== referenceHeader.containerStyles.padding) {
          inconsistencies.push(`${currentHeader.page}: コンテナのパディングが統一されていません (${currentHeader.containerStyles.padding} vs ${referenceHeader.containerStyles.padding})`);
        }
      }

      // 結果をJSONファイルに保存
      await page.evaluate((data) => {
        // @ts-ignore
        window.unifiedHeaderAnalysis = data;
      }, { headerDetails, inconsistencies });

      console.log('=== 統一ヘッダー分析結果 ===');
      console.log('統一性確認対象画面数:', headerDetails.length);
      console.log('検出された非統一性:', inconsistencies);
      
      // UIベースでの最終判定
      if (inconsistencies.length === 0) {
        console.log('✅ 全画面で統一ヘッダーが正常に実装されています');
      } else {
        console.log('❌ 統一性に問題があります:', inconsistencies);
        throw new Error(`統一ヘッダーの非統一性が検出されました:\n${inconsistencies.join('\n')}`);
      }
    } else {
      throw new Error('統一ヘッダーが適用された画面が見つかりませんでした');
    }
  });

  test('ヘッダー個別画面詳細検証', async ({ page }) => {
    for (const pageInfo of pages) {
      await page.goto(`http://localhost:3002${pageInfo.url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // 統一ヘッダーの存在確認
      const unifiedHeader = page.locator('[data-testid="unified-page-header"]');
      
      await test.step(`${pageInfo.name}画面の詳細検証`, async () => {
        // ヘッダーコンポーネントが存在することを確認
        await expect(unifiedHeader).toBeVisible();
        
        // アイコンが存在することを確認
        const icon = unifiedHeader.locator('svg').first();
        await expect(icon).toBeVisible();
        
        // タイトルが存在することを確認
        const title = unifiedHeader.locator('h1');
        await expect(title).toBeVisible();
        await expect(title).toHaveClass(/text-3xl/);
        await expect(title).toHaveClass(/font-display/);
        await expect(title).toHaveClass(/font-bold/);
        
        // サブタイトルが存在することを確認
        const subtitle = unifiedHeader.locator('p');
        await expect(subtitle).toBeVisible();
        await expect(subtitle).toHaveClass(/text-nexus-text-secondary/);
        
        // 個別画面のスクリーンショット
        await unifiedHeader.screenshot({
          path: `test-results/header-detail-${pageInfo.name}.png`
        });
      });
    }
  });
}); 