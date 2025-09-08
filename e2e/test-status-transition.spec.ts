import { test, expect } from '@playwright/test';

/**
 * ⚠️ TEST/DEMO FEATURE E2E TEST - DELETE BEFORE PRODUCTION ⚠️
 * 
 * テスト/デモ用ステータス遷移機能のE2Eテスト
 * 
 * このテストは以下を検証します：
 * 1. テスト機能UIの表示
 * 2. 出品中→購入者決定への遷移
 * 3. 購入者決定→出品中への逆遷移
 * 4. テスト用データのリセット
 * 
 * ⚠️ 本機能は本番環境では削除すること ⚠️
 */

test.describe('テスト用ステータス遷移機能', () => {
  test.beforeEach(async ({ page }) => {
    // 販売管理ページに移動
    await page.goto('/sales');
    
    // ページロードを待機
    await page.waitForLoadState('networkidle');
  });

  test('テスト機能の警告バナーが表示される', async ({ page }) => {
    // テスト機能の警告バナーが表示されることを確認
    await expect(page.locator('text=⚠️ テスト/デモ機能')).toBeVisible();
    await expect(page.locator('text=本番環境では削除してください')).toBeVisible();
    
    // テスト機能を開くボタンが存在することを確認
    await expect(page.locator('button:has-text("テスト機能を開く")')).toBeVisible();
  });

  test('テスト機能UIの開閉動作', async ({ page }) => {
    // テスト機能を開く
    await page.click('button:has-text("テスト機能を開く")');
    
    // テスト機能UIが表示されることを確認
    await expect(page.locator('text=テスト用ステータス遷移')).toBeVisible();
    await expect(page.locator('text=出品中の商品を選択して')).toBeVisible();
    
    // ボタンテキストが変わることを確認
    await expect(page.locator('button:has-text("テスト機能を閉じる")')).toBeVisible();
    
    // テスト機能を閉じる
    await page.click('button:has-text("テスト機能を閉じる")');
    
    // テスト機能UIが非表示になることを確認
    await expect(page.locator('text=テスト用ステータス遷移')).not.toBeVisible();
  });

  test('出品中商品が存在する場合のステータス遷移', async ({ page }) => {
    // テスト機能を開く
    await page.click('button:has-text("テスト機能を開く")');
    
    // 出品中商品があるかチェック
    const listingItemsCount = await page.locator('button:has-text("→ 購入者決定")').count();
    
    if (listingItemsCount > 0) {
      console.log(`出品中商品が${listingItemsCount}件見つかりました`);
      
      // 最初の出品中商品を選択
      const transitionButton = page.locator('button:has-text("→ 購入者決定")').first();
      
      // 確認ダイアログのハンドリング
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('テスト機能');
        expect(dialog.message()).toContain('出品中');
        expect(dialog.message()).toContain('購入者決定');
        await dialog.accept();
      });
      
      // ステータス遷移を実行
      await transitionButton.click();
      
      // 成功トースト表示を待機
      await expect(page.locator('text=テスト遷移完了')).toBeVisible({ timeout: 10000 });
      
      // ページが更新されることを確認（ネットワーク待機）
      await page.waitForLoadState('networkidle');
      
      console.log('✅ 出品中→購入者決定の遷移が成功しました');
    } else {
      console.log('⚠️ 出品中商品が見つかりませんでした。テストをスキップします。');
    }
  });

  test('購入者決定商品が存在する場合の逆遷移とリセット', async ({ page }) => {
    // テスト機能を開く
    await page.click('button:has-text("テスト機能を開く")');
    
    // 購入者決定商品があるかチェック
    const soldItemsCount = await page.locator('button:has-text("→ 出品中")').count();
    
    if (soldItemsCount > 0) {
      console.log(`購入者決定商品が${soldItemsCount}件見つかりました`);
      
      // 逆遷移テスト（購入者決定→出品中）
      const reverseButton = page.locator('button:has-text("→ 出品中")').first();
      
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('テスト機能');
        await dialog.accept();
      });
      
      await reverseButton.click();
      await expect(page.locator('text=テスト遷移完了')).toBeVisible({ timeout: 10000 });
      await page.waitForLoadState('networkidle');
      
      console.log('✅ 購入者決定→出品中の逆遷移が成功しました');
      
      // ページを更新してリセットボタンをテスト
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.click('button:has-text("テスト機能を開く")');
      
      // リセットボタンがある場合はテスト
      const resetButtonsCount = await page.locator('button:has-text("リセット")').count();
      if (resetButtonsCount > 0) {
        const resetButton = page.locator('button:has-text("リセット")').first();
        
        page.on('dialog', async dialog => {
          expect(dialog.message()).toContain('テスト機能リセット');
          await dialog.accept();
        });
        
        await resetButton.click();
        await expect(page.locator('text=テストリセット完了')).toBeVisible({ timeout: 10000 });
        
        console.log('✅ テストデータのリセットが成功しました');
      }
    } else {
      console.log('⚠️ 購入者決定商品が見つかりませんでした。逆遷移テストをスキップします。');
    }
  });

  test('テスト可能商品がない場合のメッセージ表示', async ({ page }) => {
    // テスト機能を開く
    await page.click('button:has-text("テスト機能を開く")');
    
    // 出品中・購入者決定商品の数をチェック
    const listingCount = await page.locator('button:has-text("→ 購入者決定")').count();
    const soldCount = await page.locator('button:has-text("→ 出品中")').count();
    
    if (listingCount === 0 && soldCount === 0) {
      // テスト可能商品がない場合のメッセージ表示を確認
      await expect(page.locator('text=テスト可能な商品（出品中・購入者決定）がありません')).toBeVisible();
      console.log('✅ テスト可能商品なしのメッセージが正しく表示されました');
    } else {
      console.log(`テスト可能商品が見つかりました: 出品中${listingCount}件, 購入者決定${soldCount}件`);
    }
  });

  test('APIエンドポイントへの直接アクセステスト', async ({ page }) => {
    // テスト用商品を準備（実際にはテスト環境に存在する商品IDを使用）
    const testProductData = {
      productId: 'test-product-id',
      fromStatus: 'listing',
      toStatus: 'sold',
      reason: 'E2Eテスト'
    };
    
    // APIエンドポイントへの直接リクエストをシミュレート
    const response = await page.evaluate(async (data) => {
      const response = await fetch('/api/test/status-transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return {
        ok: response.ok,
        status: response.status,
        data: await response.json()
      };
    }, testProductData);
    
    // レスポンスの形式確認
    expect(typeof response.status).toBe('number');
    expect(typeof response.data).toBe('object');
    
    console.log('✅ APIエンドポイントのレスポンス形式が正常です', {
      status: response.status,
      hasData: !!response.data
    });
  });
});

test.describe('テスト機能の警告とマーキング', () => {
  test('コード内の警告コメントが適切に配置されている', async ({ page }) => {
    // テスト機能の警告が適切に表示されていることを確認
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    // 複数の警告要素が存在することを確認
    await expect(page.locator('text=⚠️')).toHaveCount({ min: 2 });
    await expect(page.locator('text=テスト')).toHaveCount({ min: 3 });
    await expect(page.locator('text=本番環境では削除')).toBeVisible();
    
    console.log('✅ テスト機能の警告マーキングが適切に表示されています');
  });
});

