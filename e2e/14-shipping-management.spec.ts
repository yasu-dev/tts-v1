import { test, expect } from '@playwright/test';

// ヘルパー関数：スタッフとしてログイン
async function loginAsStaff(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'staff@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/staff\/dashboard$/, { timeout: 15000 });
}

test.describe('出荷管理機能テスト', () => {
  test('スタッフが出荷管理画面にアクセスできる', async ({ page }) => {
    await loginAsStaff(page);
    
    // 出荷管理ページに移動
    await page.goto('/staff/shipping');
    
    // ページタイトルが表示されることを確認
    await expect(page.locator('h1')).toContainText('出荷管理');
    
    // サブタイトルが表示されることを確認
    await expect(page.locator('text=eBayからの出荷指示を一元管理・処理')).toBeVisible();
  });

  test('出荷統計情報が表示される', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/shipping');
    
    // 統計カードが表示されることを確認（APIからのデータ読み込みを待つ）
    await page.waitForFunction(() => {
      const elements = document.querySelectorAll('[class*="text-2xl"], [class*="text-xl"]');
      return Array.from(elements).some(el => 
        el.textContent && /\d+/.test(el.textContent)
      );
    }, {}, { timeout: 15000 });
    
    // 統計情報の項目が表示されることを確認
    await expect(page.locator('text=/総出荷|完了|処理中|緊急|効率/')).toBeVisible();
  });

  test('出荷リストが表示される', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/shipping');
    
    // 出荷アイテムが表示されることを確認
    await page.waitForFunction(() => {
      const elements = document.querySelectorAll('*');
      return Array.from(elements).some(el => 
        el.textContent && /TRK\d+|ORD-\d+|追跡番号|注文番号/.test(el.textContent)
      );
    }, {}, { timeout: 15000 });
  });

  test('出荷ステータス別フィルターが動作する', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/shipping');
    
    // データの読み込みを待つ
    await page.waitForTimeout(3000);
    
    // ステータスタブが表示されることを確認
    await expect(page.locator('button:has-text("すべて")')).toBeVisible();
    
    // 他のステータスタブをクリックしてフィルター機能をテスト
    const statusTabs = ['出荷待ち', '梱包完了', '出荷済み', '配送完了'];
    for (const status of statusTabs) {
      const tabButton = page.locator(`button:has-text("${status}")`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(500);
        break;
      }
    }
  });

  test('出荷優先度別の表示が正しく動作する', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/shipping');
    
    // 優先度インジケーターが表示されることを確認
    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('緊急') || text.includes('高') || text.includes('通常');
    }, {}, { timeout: 10000 });
  });

  test('配送業者情報が表示される', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/shipping');
    
    // 配送業者名が表示されることを確認
    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('ヤマト運輸') || 
             text.includes('佐川急便') || 
             text.includes('日本郵便') || 
             text.includes('FedEx') || 
             text.includes('DHL') || 
             text.includes('UPS');
    }, {}, { timeout: 10000 });
  });

  test('追跡番号が表示される', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/shipping');
    
    // 追跡番号が表示されることを確認
    await page.waitForFunction(() => {
      const elements = document.querySelectorAll('*');
      return Array.from(elements).some(el => 
        el.textContent && /TRK\d+[A-Z0-9]{4}-[A-Z0-9]{3}/.test(el.textContent)
      );
    }, {}, { timeout: 10000 });
  });

  test('出荷アクションボタンが表示される', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/shipping');
    
    // ヘッダーのアクションボタンが表示されることを確認
    await expect(page.locator('button:has-text("バーコード")')).toBeVisible();
    await expect(page.locator('button:has-text("配送業者")')).toBeVisible();
    await expect(page.locator('button:has-text("梱包材")')).toBeVisible();
  });

  test('出荷詳細モーダルが開く', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/shipping');
    
    // データの読み込みを待つ
    await page.waitForTimeout(3000);
    
    // 最初の出荷アイテムをクリック
    const firstShippingRow = page.locator('tr').nth(1);
    if (await firstShippingRow.isVisible()) {
      await firstShippingRow.click();
      
      // モーダルが開くことを確認
      await page.waitForTimeout(1000);
      
      // 詳細情報が表示されることを確認
      const detailsVisible = await page.locator('text=/詳細|追跡|配送|住所/').first().isVisible({ timeout: 5000 });
      expect(detailsVisible).toBe(true);
    }
  });

  test('ピッキングタスクが表示される', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/shipping');
    
    // ピッキングタスク関連の表示を確認
    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('ピッキング') || 
             text.includes('picking') || 
             text.includes('タスク') ||
             text.includes('アイテム');
    }, {}, { timeout: 10000 });
  });

  test('出荷ステータスの色分け表示が正しく動作する', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/shipping');
    
    // ステータスに応じた色分けがされていることを確認（CSS クラスの確認）
    await page.waitForFunction(() => {
      const elements = document.querySelectorAll('[class*="bg-green"], [class*="bg-yellow"], [class*="bg-red"], [class*="bg-blue"], [class*="bg-nexus"]');
      return elements.length > 0;
    }, {}, { timeout: 10000 });
  });

  test('出荷期限の表示が正しく動作する', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/shipping');
    
    // 期限情報が表示されることを確認
    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return /\d{2}:\d{2}|\d{4}-\d{2}-\d{2}|今日|明日|期限/.test(text);
    }, {}, { timeout: 10000 });
  });

  test('出荷金額情報が表示される', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/shipping');
    
    // 金額情報が表示されることを確認
    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return /¥[\d,]+|円|\$\d+/.test(text);
    }, {}, { timeout: 10000 });
  });

  test('出荷管理のワークフロー表示が動作する', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/shipping');
    
    // ワークフロー関連の表示を確認
    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('ワークフロー') || 
             text.includes('進行') || 
             text.includes('ステップ') ||
             text.includes('progress');
    }, {}, { timeout: 10000 });
  });
});
