import { test, expect } from '@playwright/test';

test.describe('横幅統一検証 - 全画面UI確認', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('/login');
    await page.click('[data-testid="seller-login"]');
    await page.waitForTimeout(200); // 値が設定されるまで待機
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('セラー画面7つの横幅統一確認', async ({ page }) => {
    const sellerPages = [
      { path: '/dashboard', name: 'ダッシュボード' },
      { path: '/delivery', name: '納品管理' },
      { path: '/inventory', name: '在庫管理' },
      { path: '/sales', name: '販売管理' },
      { path: '/returns', name: '返品管理' },
      { path: '/billing', name: '請求・精算' },
      { path: '/timeline', name: '商品履歴' }
    ];

    for (const pageInfo of sellerPages) {
      await page.goto(pageInfo.path);
      await page.waitForSelector('.intelligence-card', { timeout: 10000 });
      
      // intelligence-cardクラスを持つ要素の直下divのパディングを確認
      const paddingValues = await page.$$eval('.intelligence-card > div', (elements) => {
        return elements.map(el => {
          const style = window.getComputedStyle(el);
          return {
            paddingTop: style.paddingTop,
            paddingRight: style.paddingRight,
            paddingBottom: style.paddingBottom,
            paddingLeft: style.paddingLeft,
            className: el.className
          };
        });
      });

      // 32px (p-8) または 24px (p-6) の統一確認
      const validPaddings = ['32px', '24px'];
      const unifiedPaddings = paddingValues.filter(p => 
        validPaddings.includes(p.paddingTop) && 
        validPaddings.includes(p.paddingLeft)
      );

      console.log(`${pageInfo.name}: ${unifiedPaddings.length}/${paddingValues.length} 統一済み`);
      
      // 最低90%の統一率を期待
      const unificationRate = (unifiedPaddings.length / paddingValues.length) * 100;
      expect(unificationRate).toBeGreaterThanOrEqual(90);
    }
  });

  test('スタッフ画面8つの横幅統一確認', async ({ page }) => {
    const staffPages = [
      { path: '/staff/dashboard', name: 'スタッフダッシュボード' },
      { path: '/staff/tasks', name: 'タスク管理' },
      { path: '/staff/inventory', name: 'スタッフ在庫管理' },
      { path: '/staff/inspection', name: '検品管理' },
      { path: '/staff/location', name: 'ロケーション管理' },
      { path: '/staff/listing', name: '出品管理' },
      { path: '/staff/returns', name: 'スタッフ返品処理' },
      { path: '/staff/reports', name: 'スタッフ業務レポート' }
    ];

    for (const pageInfo of staffPages) {
      await page.goto(pageInfo.path);
      await page.waitForSelector('.intelligence-card', { timeout: 10000 });
      
      // intelligence-cardクラスを持つ要素の直下divのパディングを確認
      const paddingValues = await page.$$eval('.intelligence-card > div', (elements) => {
        return elements.map(el => {
          const style = window.getComputedStyle(el);
          return {
            paddingTop: style.paddingTop,
            paddingRight: style.paddingRight,
            paddingBottom: style.paddingBottom,
            paddingLeft: style.paddingLeft,
            className: el.className
          };
        });
      });

      // 32px (p-8) または 24px (p-6) の統一確認
      const validPaddings = ['32px', '24px'];
      const unifiedPaddings = paddingValues.filter(p => 
        validPaddings.includes(p.paddingTop) && 
        validPaddings.includes(p.paddingLeft)
      );

      console.log(`${pageInfo.name}: ${unifiedPaddings.length}/${paddingValues.length} 統一済み`);
      
      // 最低90%の統一率を期待
      const unificationRate = (unifiedPaddings.length / paddingValues.length) * 100;
      expect(unificationRate).toBeGreaterThanOrEqual(90);
    }
  });

  test('ヘッダーメニュー画面2つの横幅統一確認', async ({ page }) => {
    const headerPages = [
      { path: '/profile', name: 'プロフィール設定' },
      { path: '/settings', name: 'アカウント設定' }
    ];

    for (const pageInfo of headerPages) {
      await page.goto(pageInfo.path);
      await page.waitForSelector('.intelligence-card', { timeout: 10000 });
      
      // intelligence-cardクラスを持つ要素の直下divのパディングを確認
      const paddingValues = await page.$$eval('.intelligence-card > div', (elements) => {
        return elements.map(el => {
          const style = window.getComputedStyle(el);
          return {
            paddingTop: style.paddingTop,
            paddingRight: style.paddingRight,
            paddingBottom: style.paddingBottom,
            paddingLeft: style.paddingLeft,
            className: el.className
          };
        });
      });

      // 32px (p-8) または 24px (p-6) の統一確認
      const validPaddings = ['32px', '24px'];
      const unifiedPaddings = paddingValues.filter(p => 
        validPaddings.includes(p.paddingTop) && 
        validPaddings.includes(p.paddingLeft)
      );

      console.log(`${pageInfo.name}: ${unifiedPaddings.length}/${paddingValues.length} 統一済み`);
      
      // 最低90%の統一率を期待
      const unificationRate = (unifiedPaddings.length / paddingValues.length) * 100;
      expect(unificationRate).toBeGreaterThanOrEqual(90);
    }
  });

  test('全17画面の総合統一率確認', async ({ page }) => {
    const allPages = [
      // セラー画面
      { path: '/dashboard', name: 'ダッシュボード' },
      { path: '/delivery', name: '納品管理' },
      { path: '/inventory', name: '在庫管理' },
      { path: '/sales', name: '販売管理' },
      { path: '/returns', name: '返品管理' },
      { path: '/billing', name: '請求・精算' },
      { path: '/timeline', name: '商品履歴' },
      // スタッフ画面
      { path: '/staff/dashboard', name: 'スタッフダッシュボード' },
      { path: '/staff/tasks', name: 'タスク管理' },
      { path: '/staff/inventory', name: 'スタッフ在庫管理' },
      { path: '/staff/inspection', name: '検品管理' },
      { path: '/staff/location', name: 'ロケーション管理' },
      { path: '/staff/listing', name: '出品管理' },
      { path: '/staff/returns', name: 'スタッフ返品処理' },
      { path: '/staff/reports', name: 'スタッフ業務レポート' },
      // ヘッダーメニュー画面
      { path: '/profile', name: 'プロフィール設定' },
      { path: '/settings', name: 'アカウント設定' }
    ];

    let totalElements = 0;
    let unifiedElements = 0;

    for (const pageInfo of allPages) {
      await page.goto(pageInfo.path);
      await page.waitForSelector('.intelligence-card', { timeout: 10000 });
      
      // intelligence-cardクラスを持つ要素の直下divのパディングを確認
      const paddingValues = await page.$$eval('.intelligence-card > div', (elements) => {
        return elements.map(el => {
          const style = window.getComputedStyle(el);
          return {
            paddingTop: style.paddingTop,
            paddingRight: style.paddingRight,
            paddingBottom: style.paddingBottom,
            paddingLeft: style.paddingLeft,
            className: el.className
          };
        });
      });

      // 32px (p-8) または 24px (p-6) の統一確認
      const validPaddings = ['32px', '24px'];
      const pageUnifiedElements = paddingValues.filter(p => 
        validPaddings.includes(p.paddingTop) && 
        validPaddings.includes(p.paddingLeft)
      ).length;

      totalElements += paddingValues.length;
      unifiedElements += pageUnifiedElements;

      console.log(`${pageInfo.name}: ${pageUnifiedElements}/${paddingValues.length} 統一済み`);
    }

    // 全体統一率を計算
    const overallUnificationRate = (unifiedElements / totalElements) * 100;
    console.log(`全体統一率: ${overallUnificationRate.toFixed(1)}% (${unifiedElements}/${totalElements})`);
    
    // 95%以上の統一率を期待
    expect(overallUnificationRate).toBeGreaterThanOrEqual(95);
  });

  test('具体的なパディング値とレスポンシブクラスの確認', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('.intelligence-card', { timeout: 10000 });
    
    // Tailwindクラスの確認
    const tailwindClasses = await page.$$eval('.intelligence-card > div', (elements) => {
      return elements.map(el => {
        const classList = Array.from(el.classList);
        return {
          hasPadding8: classList.includes('p-8'),
          hasPadding6: classList.includes('p-6'),
          hasResponsivePadding: classList.some(cls => cls.match(/^p-\d+$|^sm:p-\d+$|^md:p-\d+$|^lg:p-\d+$/)),
          allClasses: classList
        };
      });
    });

    // p-8またはp-6クラスの使用確認
    const hasValidTailwindClasses = tailwindClasses.every(el => 
      el.hasPadding8 || el.hasPadding6
    );

    console.log('Tailwindクラス分析:', tailwindClasses);
    expect(hasValidTailwindClasses).toBe(true);

    // 計算されたスタイルの確認
    const computedStyles = await page.$$eval('.intelligence-card > div', (elements) => {
      return elements.map(el => {
        const style = window.getComputedStyle(el);
        return {
          paddingTop: style.paddingTop,
          paddingLeft: style.paddingLeft,
          element: el.tagName
        };
      });
    });

    // 32pxまたは24pxの確認
    const validComputedStyles = computedStyles.every(style => 
      ['32px', '24px'].includes(style.paddingTop) && 
      ['32px', '24px'].includes(style.paddingLeft)
    );

    console.log('計算されたスタイル:', computedStyles);
    expect(validComputedStyles).toBe(true);
  });
}); 