import { test, expect } from '@playwright/test';

test.describe('カメラ・時計専門ダッシュボード - 返品理由分析機能検証', () => {
  
  test.beforeEach(async ({ page }) => {
    // ログインページに移動
    await page.goto('http://localhost:3002/login');
    
    // ログインフォームが表示されるまで待機
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // セラーアカウントでログイン
    await page.fill('input[type="email"]', 'seller@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ダッシュボードページが表示されるまで待機
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  // 基本機能確認テスト
  test('カメラ・時計専門ダッシュボード基本機能確認', async ({ page }) => {
    // 1. ページタイトルがカメラ・時計専門に変更されていることを確認
    await expect(page.locator('h1')).toContainText('カメラ・時計専門ダッシュボード');
    console.log('✅ ページタイトル確認完了');

    // 2. サブタイトル確認
    await expect(page.locator('text=緊急タスク・収益・運営効率・返品分析の統合管理')).toBeVisible();
    console.log('✅ サブタイトル確認完了');

    // 3. 4つのタブが存在することを確認
    await expect(page.locator('button:has-text("緊急タスク")')).toBeVisible();
    await expect(page.locator('button:has-text("収益管理")')).toBeVisible();
    await expect(page.locator('button:has-text("運営効率")')).toBeVisible();
    await expect(page.locator('button:has-text("返品理由分析")')).toBeVisible();
    console.log('✅ 4つのタブ存在確認完了');

    // 4. 返品理由分析タブに返品数バッジが表示されていることを確認
    const returnsTab = page.locator('button:has-text("返品理由分析")');
    await expect(returnsTab).toBeVisible();
    await expect(returnsTab.locator('.bg-purple-500')).toContainText('47');
    console.log('✅ 返品数バッジ確認完了');

    // 5. 返品理由分析タブをクリック
    await returnsTab.click();
    await page.waitForTimeout(2000);
    console.log('✅ 返品理由分析タブクリック完了');

    // 6. 返品サマリーカードが表示されることを確認
    await expect(page.locator('text=総返品数')).toBeVisible();
    await expect(page.locator('text=返品総額')).toBeVisible();
    await expect(page.locator('text=カメラ返品数')).toBeVisible();
    await expect(page.locator('text=時計返品数')).toBeVisible();
    console.log('✅ 返品サマリーカード確認完了');

    // 7. 基本的な数値が表示されることを確認
    await expect(page.locator('text=47').first()).toBeVisible(); // 総返品数
    await expect(page.locator('text=¥8,940,000')).toBeVisible(); // 返品総額
    await expect(page.locator('text=28').first()).toBeVisible(); // カメラ返品数
    await expect(page.locator('text=19').first()).toBeVisible(); // 時計返品数
    console.log('✅ 基本数値確認完了');

    // 8. 返品理由別分析セクションが表示されることを確認
    await expect(page.locator('h2:has-text("返品理由別分析")')).toBeVisible();
    await expect(page.locator('text=要改善')).toBeVisible();
    console.log('✅ 返品理由別分析セクション確認完了');

    // 9. 改善アクションプランが表示されることを確認
    await expect(page.locator('h3:has-text("改善アクションプラン")')).toBeVisible();
    console.log('✅ 改善アクションプラン確認完了');

    console.log('🎯 カメラ・時計専門ダッシュボードの基本機能が正常に動作しています！');
  });

  // 詳細データ確認テスト
  test('返品理由分析詳細データ確認', async ({ page }) => {
    // 返品理由分析タブをクリック
    await page.locator('button:has-text("返品理由分析")').click();
    await page.waitForTimeout(2000);

    // 5つの返品理由の見出しが表示されることを確認
    await expect(page.locator('h3:has-text("商品不良・故障")')).toBeVisible();
    await expect(page.locator('h3:has-text("商品説明との相違")')).toBeVisible();
    await expect(page.locator('h3:has-text("配送時破損")')).toBeVisible();
    await expect(page.locator('h3:has-text("期待値との相違")')).toBeVisible();
    await expect(page.locator('h3:has-text("顧客都合")')).toBeVisible();
    console.log('✅ 5つの返品理由見出し確認完了');

    // 具体的な商品例が表示されることを確認
    await expect(page.locator('text=Canon EOS R5')).toBeVisible();
    await expect(page.locator('text=Nikon Z9')).toBeVisible();
    await expect(page.locator('text=Rolex Submariner')).toBeVisible();
    console.log('✅ 具体的な商品例確認完了');

    // 改善アクションプランの担当チームが表示されることを確認
    await expect(page.locator('text=品質管理チーム')).toBeVisible();
    await expect(page.locator('text=商品説明チーム')).toBeVisible();
    await expect(page.locator('text=物流チーム')).toBeVisible();
    console.log('✅ 改善アクションプラン担当チーム確認完了');

    console.log('🎯 返品理由分析の詳細データが正常に表示されています！');
  });

  // 最終統合確認テスト
  test('最終確認: カメラ・時計専門ダッシュボードの完全性検証', async ({ page }) => {
    // ページタイトル確認
    await expect(page.locator('h1')).toContainText('カメラ・時計専門ダッシュボード');
    
    // 4つのタブ存在確認
    const tabs = ['緊急タスク', '収益管理', '運営効率', '返品理由分析'];
    for (const tabName of tabs) {
      await expect(page.locator(`button:has-text("${tabName}")`)).toBeVisible();
    }
    
    // 返品理由分析タブクリック
    await page.locator('button:has-text("返品理由分析")').click();
    await page.waitForTimeout(2000);
    
    // 返品データ総合確認
    await expect(page.locator('text=47').first()).toBeVisible(); // 総返品47件
    await expect(page.locator('text=¥8,940,000')).toBeVisible();
    await expect(page.locator('text=28').first()).toBeVisible(); // カメラ28件
    await expect(page.locator('text=19').first()).toBeVisible(); // 時計19件
    
    console.log('🎯 最終確認完了: カメラ・時計専門ダッシュボードが完全に実装されています');
    console.log('✅ 返品理由分析機能が正常に動作しています');
    console.log('✅ カメラ・時計特化データが正確に表示されています');
    console.log('✅ 改善アクションプランが実装されています');
    console.log('🚀 成功: E2Eテスト完了 - 機能は完全に動作しています！');
  });
}); 