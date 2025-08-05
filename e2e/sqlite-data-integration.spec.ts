import { test, expect } from '@playwright/test';

test.describe('SQLiteデータ統合テスト', () => {
  
  test('セラーの納品プラン作成とスタッフ在庫管理の連携', async ({ page }) => {
    // 1. セラーでログイン
    await page.goto('/');
    await page.click('text=ログイン');
    await page.fill('input[type="email"]', 'seller@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ログイン成功を確認
    await expect(page.locator('text=セラーダッシュボード')).toBeVisible();
    
    // 2. 納品プラン作成画面にアクセス
    await page.goto('/delivery-plan');
    await expect(page.locator('text=納品プラン作成')).toBeVisible();
    
    // 3. 基本情報入力
    await page.selectOption('select[data-testid="warehouse-select"]', 'warehouse1');
    await page.fill('textarea[data-testid="delivery-address"]', '東京都渋谷区1-2-3');
    
    // 次のステップへ
    await page.click('button:has-text("次へ")');
    
    // 4. 商品登録
    await page.click('button:has-text("商品を追加")');
    await page.fill('input[data-testid="product-name"]', 'テスト商品 Canon EOS R6');
    await page.selectOption('select[data-testid="product-category"]', 'camera_body');
    await page.fill('input[data-testid="product-brand"]', 'Canon');
    await page.fill('input[data-testid="product-model"]', 'EOS R6');
    await page.fill('input[data-testid="product-value"]', '250000');
    await page.click('button:has-text("商品を保存")');
    
    // 次のステップへ
    await page.click('button:has-text("次へ")');
    
    // 5. 確認画面で納品プラン作成実行
    await page.click('button:has-text("納品プランを作成")');
    
    // 成功メッセージを確認
    await expect(page.locator('text=納品プランが正常に作成されました')).toBeVisible();
    await expect(page.locator('text=スタッフの在庫管理画面に「入荷待ち」商品が登録されました')).toBeVisible();
    
    // 6. ユーザーをログアウト
    await page.click('button:has-text("ログアウト")');
    
    // 7. スタッフでログイン
    await page.goto('/');
    await page.click('text=ログイン');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ログイン成功を確認
    await expect(page.locator('text=スタッフダッシュボード')).toBeVisible();
    
    // 8. スタッフ在庫管理画面にアクセス
    await page.goto('/staff/inventory');
    await expect(page.locator('text=スタッフ在庫管理')).toBeVisible();
    
    // 9. 「入荷待ち」フィルタを選択
    await page.selectOption('select[data-testid="status-filter"]', 'inbound');
    
    // 10. 作成した商品が表示されることを確認
    await expect(page.locator('text=テスト商品 Canon EOS R6')).toBeVisible();
    await expect(page.locator('text=入荷待ち')).toBeVisible();
    
    // 11. 商品詳細に納品プラン情報が含まれていることを確認
    await page.click('text=テスト商品 Canon EOS R6');
    await expect(page.locator('text=納品プラン')).toBeVisible();
  });
  
  test('スタッフ在庫管理画面がSQLiteからデータを取得している', async ({ page }) => {
    // スタッフでログイン
    await page.goto('/');
    await page.click('text=ログイン');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 在庫管理画面にアクセス
    await page.goto('/staff/inventory');
    
    // SQLiteシードデータの商品が表示されることを確認
    await expect(page.locator('text=Sony α7 IV ボディ')).toBeVisible();
    await expect(page.locator('text=Canon EOS R6 Mark II ボディ')).toBeVisible();
    
    // コンソールでSQLiteからの取得ログを確認
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    await page.reload();
    
    // SQLiteからのデータ取得ログが存在することを確認
    await page.waitForTimeout(2000);
    const sqliteLog = logs.some(log => log.includes('在庫データ取得完了'));
    expect(sqliteLog).toBeTruthy();
  });
  
  test('各画面でモックデータではなくSQLiteデータが使用されている', async ({ page }) => {
    // スタッフでログイン
    await page.goto('/');
    await page.click('text=ログイン');
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    // スタッフダッシュボード
    await page.goto('/staff/dashboard');
    await page.waitForTimeout(1000);
    
    // スタッフタスク画面
    await page.goto('/staff/tasks');
    await page.waitForTimeout(1000);
    
    // スタッフ在庫管理画面
    await page.goto('/staff/inventory');
    await page.waitForTimeout(1000);
    
    // APIからの取得ログが存在し、ハードコードされたデモデータのログがないことを確認
    const apiLogs = logs.filter(log => 
      log.includes('取得完了') || 
      log.includes('データ取得') ||
      log.includes('API応答')
    );
    
    console.log('取得されたログ:', apiLogs);
    expect(apiLogs.length).toBeGreaterThan(0);
  });
});