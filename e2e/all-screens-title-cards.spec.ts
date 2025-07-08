import { test, expect } from '@playwright/test';

test.describe('全画面タイトルカード特定とプレビュー', () => {
  test('全22画面以上のタイトルカードを特定してスクリーンショット撮影', async ({ page }) => {
    
    // セラー画面
    const sellerScreens = [
      { name: 'セラーダッシュボード', url: '/dashboard' },
      { name: '納品管理', url: '/delivery' },
      { name: '在庫管理', url: '/inventory' },
      { name: '販売管理', url: '/sales' },
      { name: '返品管理', url: '/returns' },
      { name: '請求・精算', url: '/billing' },
      { name: '商品履歴', url: '/timeline' },
      { name: 'プロフィール', url: '/profile' },
      { name: '設定', url: '/settings' },
      { name: 'レポート', url: '/reports' },
      { name: '月次レポート', url: '/reports/monthly' },
      { name: '納品計画', url: '/delivery-plan' }
    ];

    // スタッフ画面
    const staffScreens = [
      { name: 'スタッフダッシュボード', url: '/staff/dashboard' },
      { name: 'タスク管理', url: '/staff/tasks' },
      { name: 'スタッフ在庫管理', url: '/staff/inventory' },
      { name: '検品・撮影', url: '/staff/inspection' },
      { name: 'ロケーション管理', url: '/staff/location' },
      { name: '出荷管理', url: '/staff/shipping' },
      { name: 'ピッキング', url: '/staff/picking' },
      { name: 'スタッフ返品処理', url: '/staff/returns' },
      { name: '業務レポート', url: '/staff/reports' },
      { name: '出品管理', url: '/staff/listing' }
    ];

    // 特殊画面（返品検品・再出品業務フロー・返品理由分析）
    const specialScreens = [
      { name: '返品検品', url: '/staff/inspection?type=return' },
      { name: '再出品業務フロー', url: '/staff/listing?flow=relist' },
      { name: '返品理由分析', url: '/returns?tab=analysis' }
    ];

    console.log('=== 全画面タイトルカード特定開始 ===');

    // まずセラーとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    console.log('\n=== セラー画面のタイトルカード特定 ===');
    for (const screen of sellerScreens) {
      try {
        await page.goto(screen.url);
        await page.waitForSelector('.intelligence-card, h1', { timeout: 10000 });
        
        // タイトルカードを特定
        const titleCards = await page.evaluate(() => {
          const cards = [];
          
          // intelligence-cardクラスを持つ要素でタイトルを含むものを検索
          const intelligenceCards = document.querySelectorAll('.intelligence-card');
          intelligenceCards.forEach((card, index) => {
            const titleElement = card.querySelector('h1, h2, .text-3xl, .font-display');
            if (titleElement) {
              const rect = card.getBoundingClientRect();
              cards.push({
                type: 'intelligence-card',
                index: index,
                title: titleElement.textContent?.trim() || '',
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                left: Math.round(rect.left),
                top: Math.round(rect.top),
                className: card.className
              });
            }
          });
          
          // ページ全体のh1タグも確認
          const h1Elements = document.querySelectorAll('h1');
          h1Elements.forEach((h1, index) => {
            if (!h1.closest('.intelligence-card')) {
              const rect = h1.getBoundingClientRect();
              cards.push({
                type: 'standalone-h1',
                index: index,
                title: h1.textContent?.trim() || '',
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                left: Math.round(rect.left),
                top: Math.round(rect.top),
                className: h1.className
              });
            }
          });
          
          return cards;
        });

        console.log(`\n${screen.name} (${screen.url}):`);
        console.log(`  タイトルカード数: ${titleCards.length}`);
        titleCards.forEach((card, i) => {
          console.log(`  Card ${i + 1}: "${card.title}" (${card.type})`);
          console.log(`    サイズ: ${card.width}x${card.height}, 位置: (${card.left}, ${card.top})`);
        });

        // スクリーンショット撮影
        await page.screenshot({ 
          path: `test-results/title-cards/${screen.name.replace(/[\/\\]/g, '_')}.png`,
          fullPage: true 
        });

        // タイトルカードのみのスクリーンショット（最初のタイトルカードがある場合）
        if (titleCards.length > 0) {
          const firstCard = titleCards[0];
          await page.screenshot({
            path: `test-results/title-cards/${screen.name.replace(/[\/\\]/g, '_')}_title_only.png`,
            clip: {
              x: firstCard.left - 10,
              y: firstCard.top - 10,
              width: firstCard.width + 20,
              height: firstCard.height + 20
            }
          });
        }

      } catch (error) {
        console.log(`${screen.name}: エラー - ${error.message}`);
      }
    }

    // スタッフとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/staff/dashboard');

    console.log('\n=== スタッフ画面のタイトルカード特定 ===');
    for (const screen of staffScreens) {
      try {
        await page.goto(screen.url);
        await page.waitForSelector('.intelligence-card, h1', { timeout: 10000 });
        
        // タイトルカードを特定
        const titleCards = await page.evaluate(() => {
          const cards = [];
          
          // intelligence-cardクラスを持つ要素でタイトルを含むものを検索
          const intelligenceCards = document.querySelectorAll('.intelligence-card');
          intelligenceCards.forEach((card, index) => {
            const titleElement = card.querySelector('h1, h2, .text-3xl, .font-display');
            if (titleElement) {
              const rect = card.getBoundingClientRect();
              cards.push({
                type: 'intelligence-card',
                index: index,
                title: titleElement.textContent?.trim() || '',
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                left: Math.round(rect.left),
                top: Math.round(rect.top),
                className: card.className
              });
            }
          });
          
          return cards;
        });

        console.log(`\n${screen.name} (${screen.url}):`);
        console.log(`  タイトルカード数: ${titleCards.length}`);
        titleCards.forEach((card, i) => {
          console.log(`  Card ${i + 1}: "${card.title}" (${card.type})`);
          console.log(`    サイズ: ${card.width}x${card.height}, 位置: (${card.left}, ${card.top})`);
        });

        // スクリーンショット撮影
        await page.screenshot({ 
          path: `test-results/title-cards/staff_${screen.name.replace(/[\/\\]/g, '_')}.png`,
          fullPage: true 
        });

        // タイトルカードのみのスクリーンショット
        if (titleCards.length > 0) {
          const firstCard = titleCards[0];
          await page.screenshot({
            path: `test-results/title-cards/staff_${screen.name.replace(/[\/\\]/g, '_')}_title_only.png`,
            clip: {
              x: firstCard.left - 10,
              y: firstCard.top - 10,
              width: firstCard.width + 20,
              height: firstCard.height + 20
            }
          });
        }

      } catch (error) {
        console.log(`${screen.name}: エラー - ${error.message}`);
      }
    }

    console.log('\n=== 特殊画面のタイトルカード特定 ===');
    for (const screen of specialScreens) {
      try {
        await page.goto(screen.url);
        await page.waitForSelector('.intelligence-card, h1', { timeout: 10000 });
        
        // タイトルカードを特定
        const titleCards = await page.evaluate(() => {
          const cards = [];
          
          const intelligenceCards = document.querySelectorAll('.intelligence-card');
          intelligenceCards.forEach((card, index) => {
            const titleElement = card.querySelector('h1, h2, .text-3xl, .font-display');
            if (titleElement) {
              const rect = card.getBoundingClientRect();
              cards.push({
                type: 'intelligence-card',
                index: index,
                title: titleElement.textContent?.trim() || '',
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                left: Math.round(rect.left),
                top: Math.round(rect.top),
                className: card.className
              });
            }
          });
          
          return cards;
        });

        console.log(`\n${screen.name} (${screen.url}):`);
        console.log(`  タイトルカード数: ${titleCards.length}`);
        titleCards.forEach((card, i) => {
          console.log(`  Card ${i + 1}: "${card.title}" (${card.type})`);
          console.log(`    サイズ: ${card.width}x${card.height}, 位置: (${card.left}, ${card.top})`);
        });

        // スクリーンショット撮影
        await page.screenshot({ 
          path: `test-results/title-cards/special_${screen.name.replace(/[\/\\]/g, '_')}.png`,
          fullPage: true 
        });

        // タイトルカードのみのスクリーンショット
        if (titleCards.length > 0) {
          const firstCard = titleCards[0];
          await page.screenshot({
            path: `test-results/title-cards/special_${screen.name.replace(/[\/\\]/g, '_')}_title_only.png`,
            clip: {
              x: firstCard.left - 10,
              y: firstCard.top - 10,
              width: firstCard.width + 20,
              height: firstCard.height + 20
            }
          });
        }

      } catch (error) {
        console.log(`${screen.name}: エラー - ${error.message}`);
      }
    }

    console.log('\n=== 全画面タイトルカード特定完了 ===');
    console.log(`総画面数: ${sellerScreens.length + staffScreens.length + specialScreens.length}画面`);
    console.log('スクリーンショット保存先: test-results/title-cards/');
  });
}); 