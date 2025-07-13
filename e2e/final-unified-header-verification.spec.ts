import { test, expect } from '@playwright/test';

test.describe('最終統一ヘッダーUI検証', () => {
  // 修正対象の全画面
  const pages = [
    { name: 'ダッシュボード', url: '/dashboard', userType: 'seller' },
    { name: '販売', url: '/sales', userType: 'seller' },
    { name: '在庫', url: '/inventory', userType: 'seller' },
    { name: '返品', url: '/returns', userType: 'seller' },
    { name: 'プロフィール', url: '/profile', userType: 'seller' },
    { name: '設定', url: '/settings', userType: 'seller' },
    { name: '納品管理', url: '/delivery', userType: 'seller' },
    { name: '請求管理', url: '/billing', userType: 'seller' },
    { name: 'スタッフダッシュボード', url: '/staff/dashboard', userType: 'staff' },
    { name: 'スタッフタスク', url: '/staff/tasks', userType: 'staff' },
    { name: 'スタッフ返品処理', url: '/staff/returns', userType: 'staff' },
    { name: '業務レポート', url: '/staff/reports', userType: 'staff' }
  ];

  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('http://localhost:3002/login');
    
    try {
      // ログインフォームが表示されるまで待機
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      await page.fill('input[type="email"]', 'seller@test.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // ダッシュボードページが表示されるまで待機
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
    } catch (error) {
      console.log('ログイン処理でエラーが発生しました:', error);
    }
  });

  test('指摘された画面での統一ヘッダー確認', async ({ page }) => {
    const headerAnalysis = [];
    const failures = [];

    for (const pageInfo of pages) {
      try {
        await page.goto(`http://localhost:3002${pageInfo.url}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000); // UIが完全に安定するまで待機

        // 統一ヘッダーコンポーネントを検索
        const unifiedHeader = page.locator('[data-testid="unified-page-header"]');
        
        if (await unifiedHeader.isVisible()) {
          // 全画面スクリーンショット
          await page.screenshot({
            path: `test-results/final-header-${pageInfo.name}.png`,
            fullPage: true
          });

          // アイコンの確認
          const icon = unifiedHeader.locator('svg').first();
          const iconExists = await icon.isVisible();
          
          // タイトルの詳細確認
          const titleElement = unifiedHeader.locator('h1');
          const titleText = await titleElement.textContent();
          const titleStyles = await titleElement.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              fontFamily: style.fontFamily,
              color: style.color
            };
          });

          // サブタイトルの確認
          const subtitleElement = unifiedHeader.locator('p');
          const subtitleExists = await subtitleElement.isVisible();
          const subtitleText = subtitleExists ? await subtitleElement.textContent() : null;

          // アイコンサイズの確認
          const iconStyles = iconExists ? await icon.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
              width: style.width,
              height: style.height,
              color: style.color
            };
          }) : null;

          headerAnalysis.push({
            page: pageInfo.name,
            url: pageInfo.url,
            userType: pageInfo.userType,
            hasUnifiedHeader: true,
            hasIcon: iconExists,
            titleText,
            titleStyles,
            subtitleText,
            iconStyles,
            status: '✅ 統一ヘッダー使用'
          });

          console.log(`✅ ${pageInfo.name}: 統一ヘッダーを使用`, {
            title: titleText,
            hasIcon: iconExists,
            iconSize: iconStyles?.width,
            fontSize: titleStyles.fontSize,
            fontWeight: titleStyles.fontWeight
          });
        } else {
          // 古いヘッダー形式を確認
          const oldHeaders = await page.locator('.intelligence-card h1, h1').all();
          let oldHeaderFound = false;
          let oldHeaderDetails = null;

          for (const oldHeader of oldHeaders) {
            if (await oldHeader.isVisible()) {
              oldHeaderFound = true;
              const text = await oldHeader.textContent();
              const styles = await oldHeader.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return {
                  fontSize: style.fontSize,
                  fontWeight: style.fontWeight
                };
              });
              oldHeaderDetails = { text, styles };
              break;
            }
          }

          headerAnalysis.push({
            page: pageInfo.name,
            url: pageInfo.url,
            userType: pageInfo.userType,
            hasUnifiedHeader: false,
            oldHeaderFound,
            oldHeaderDetails,
            status: '❌ 古いヘッダー形式'
          });

          failures.push(`${pageInfo.name}画面: 統一ヘッダーが適用されていません`);
          
          console.log(`❌ ${pageInfo.name}: 統一ヘッダーが見つかりません`, oldHeaderDetails);

          // エラー画面のスクリーンショット
          await page.screenshot({
            path: `test-results/error-header-${pageInfo.name}.png`,
            fullPage: true
          });
        }
      } catch (error) {
        failures.push(`${pageInfo.name}画面: テスト実行エラー - ${error.message}`);
        console.log(`❌ ${pageInfo.name}: テストエラー`, error.message);
      }
    }

    // 統一性の詳細分析
    const unifiedHeaders = headerAnalysis.filter(h => h.hasUnifiedHeader);
    if (unifiedHeaders.length > 1) {
      const reference = unifiedHeaders[0];
      const inconsistencies = [];

      for (let i = 1; i < unifiedHeaders.length; i++) {
        const current = unifiedHeaders[i];
        
        // アイコンの統一性
        if (current.hasIcon !== reference.hasIcon) {
          inconsistencies.push(`${current.page}: アイコンの有無が統一されていません`);
        }
        
        // フォントサイズの統一性
        if (current.titleStyles.fontSize !== reference.titleStyles.fontSize) {
          inconsistencies.push(`${current.page}: フォントサイズが統一されていません (${current.titleStyles.fontSize} vs ${reference.titleStyles.fontSize})`);
        }
        
        // フォントの太さの統一性
        if (current.titleStyles.fontWeight !== reference.titleStyles.fontWeight) {
          inconsistencies.push(`${current.page}: フォントの太さが統一されていません (${current.titleStyles.fontWeight} vs ${reference.titleStyles.fontWeight})`);
        }
        
        // アイコンサイズの統一性
        if (current.iconStyles && reference.iconStyles) {
          if (current.iconStyles.width !== reference.iconStyles.width) {
            inconsistencies.push(`${current.page}: アイコンサイズが統一されていません (${current.iconStyles.width} vs ${reference.iconStyles.width})`);
          }
        }
      }

      if (inconsistencies.length > 0) {
        failures.push(...inconsistencies);
      }
    }

    // 結果の保存と出力
    await page.evaluate((data) => {
      // @ts-ignore
      window.finalHeaderAnalysis = data;
    }, { headerAnalysis, failures });

    console.log('=== 最終統一ヘッダー検証結果 ===');
    console.log('検証対象画面数:', pages.length);
    console.log('統一ヘッダー適用済み:', unifiedHeaders.length);
    console.log('未適用画面数:', headerAnalysis.filter(h => !h.hasUnifiedHeader).length);
    
    if (failures.length === 0) {
      console.log('🎉 全画面で統一ヘッダーが正常に実装されています！');
    } else {
      console.log('⚠️ 以下の問題が見つかりました:');
      failures.forEach(failure => console.log(`  - ${failure}`));
    }

    // ユーザー指摘の画面を特に確認
    const problematicPages = ['スタッフ返品処理', '業務レポート', '納品管理', '請求管理'];
    const fixedPages = [];
    const stillBrokenPages = [];

    for (const pageName of problematicPages) {
      const analysis = headerAnalysis.find(h => h.page === pageName);
      if (analysis) {
        if (analysis.hasUnifiedHeader) {
          fixedPages.push(pageName);
        } else {
          stillBrokenPages.push(pageName);
        }
      }
    }

    console.log('=== ユーザー指摘画面の修正状況 ===');
    console.log('修正完了:', fixedPages);
    console.log('未修正:', stillBrokenPages);

    // テスト判定
    if (stillBrokenPages.length > 0) {
      throw new Error(`以下の画面でまだ統一ヘッダーが適用されていません: ${stillBrokenPages.join(', ')}`);
    }

    if (failures.length > 0) {
      throw new Error(`統一性の問題が検出されました:\n${failures.join('\n')}`);
    }
  });
}); 