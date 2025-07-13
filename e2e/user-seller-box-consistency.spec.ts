import { test, expect } from '@playwright/test';

test.describe('ユーザーセラーボタン押下時の一番上の箱 統一性テスト', () => {
  // テスト対象の全画面
  const pages = [
    { name: 'ダッシュボード', url: '/dashboard' },
    { name: '販売', url: '/sales' },
    { name: '在庫', url: '/inventory' },
    { name: '返品', url: '/returns' },
    { name: 'レポート', url: '/reports' },
    { name: '配送計画', url: '/delivery-plan' },
    { name: '配送', url: '/delivery' },
    { name: '設定', url: '/settings' },
    { name: 'プロフィール', url: '/profile' }
  ];

  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', 'seller@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('全画面での一番上の箱の統一性確認', async ({ page }) => {
    const boxDetails = [];

    for (const pageInfo of pages) {
      await page.goto(`http://localhost:3002${pageInfo.url}`);
      await page.waitForLoadState('networkidle');

      // セラーボタンを確認（ヘッダーまたはサイドバー）
      const sellerButton = await page.locator('[data-testid="user-seller-button"], [data-role="user-seller"], button:has-text("セラー"), button:has-text("ユーザー")').first();
      
      if (await sellerButton.isVisible()) {
        await sellerButton.click();
        await page.waitForTimeout(1000); // UI更新を待つ

        // 一番上の箱を特定
        const topBox = await page.locator('body > *:first-child div:first-child, [data-testid="top-box"], .top-box, [role="banner"] + *, header + *').first();
        
        if (await topBox.isVisible()) {
          // スクリーンショットを撮影
          await page.screenshot({
            path: `test-results/seller-box-${pageInfo.name}.png`,
            fullPage: true
          });

          // 箱の詳細情報を取得
          const textContent = await topBox.textContent();
          const computedStyle = await topBox.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              textAlign: style.textAlign,
              padding: style.padding,
              margin: style.margin,
              height: style.height,
              backgroundColor: style.backgroundColor,
              borderRadius: style.borderRadius,
              display: style.display,
              alignItems: style.alignItems,
              justifyContent: style.justifyContent
            };
          });

          // アイコンの有無を確認
          const hasIcon = await topBox.locator('svg, i, img, [class*="icon"]').count() > 0;
          
          boxDetails.push({
            page: pageInfo.name,
            url: pageInfo.url,
            text: textContent?.trim(),
            styles: computedStyle,
            hasIcon: hasIcon,
            iconCount: await topBox.locator('svg, i, img, [class*="icon"]').count()
          });

          console.log(`${pageInfo.name}画面の一番上の箱:`, {
            text: textContent?.trim(),
            styles: computedStyle,
            hasIcon: hasIcon
          });
        } else {
          console.log(`${pageInfo.name}画面で一番上の箱が見つからませんでした`);
        }
      } else {
        console.log(`${pageInfo.name}画面でセラーボタンが見つからませんでした`);
      }
    }

    // 統一性チェック
    const referenceBox = boxDetails[0];
    const inconsistencies = [];

    for (let i = 1; i < boxDetails.length; i++) {
      const currentBox = boxDetails[i];
      
      // テキストの太さ
      if (currentBox.styles.fontWeight !== referenceBox.styles.fontWeight) {
        inconsistencies.push(`${currentBox.page}: フォントの太さが異なります (${currentBox.styles.fontWeight} vs ${referenceBox.styles.fontWeight})`);
      }
      
      // フォントサイズ
      if (currentBox.styles.fontSize !== referenceBox.styles.fontSize) {
        inconsistencies.push(`${currentBox.page}: フォントサイズが異なります (${currentBox.styles.fontSize} vs ${referenceBox.styles.fontSize})`);
      }
      
      // テキスト配置
      if (currentBox.styles.textAlign !== referenceBox.styles.textAlign) {
        inconsistencies.push(`${currentBox.page}: テキスト配置が異なります (${currentBox.styles.textAlign} vs ${referenceBox.styles.textAlign})`);
      }
      
      // アイコンの有無
      if (currentBox.hasIcon !== referenceBox.hasIcon) {
        inconsistencies.push(`${currentBox.page}: アイコンの有無が異なります (${currentBox.hasIcon} vs ${referenceBox.hasIcon})`);
      }
    }

    // 結果をJSONファイルに保存
    await page.evaluate((data) => {
      // @ts-ignore
      window.boxAnalysis = data;
    }, { boxDetails, inconsistencies });

    console.log('=== 統一性分析結果 ===');
    console.log('検出された非統一性:', inconsistencies);
    
    // 非統一性がある場合はテストを失敗させる
    if (inconsistencies.length > 0) {
      throw new Error(`統一性エラーが検出されました:\n${inconsistencies.join('\n')}`);
    }
  });

  test('詳細な箱要素分析', async ({ page }) => {
    // 各画面の詳細分析
    for (const pageInfo of pages) {
      await page.goto(`http://localhost:3002${pageInfo.url}`);
      await page.waitForLoadState('networkidle');

      const sellerButton = await page.locator('[data-testid="user-seller-button"], [data-role="user-seller"], button:has-text("セラー"), button:has-text("ユーザー")').first();
      
      if (await sellerButton.isVisible()) {
        await sellerButton.click();
        await page.waitForTimeout(1000);

        // 画面全体のスクリーンショット
        await page.screenshot({
          path: `test-results/full-screen-${pageInfo.name}.png`,
          fullPage: true
        });

        // 一番上の箱の詳細分析
        const possibleBoxes = await page.locator('body > * div:first-child, [class*="box"], [class*="card"], [class*="header"], [role="banner"]').all();
        
        for (let i = 0; i < Math.min(3, possibleBoxes.length); i++) {
          const box = possibleBoxes[i];
          if (await box.isVisible()) {
            await box.screenshot({
              path: `test-results/box-${pageInfo.name}-${i}.png`
            });
          }
        }
      }
    }
  });
}); 