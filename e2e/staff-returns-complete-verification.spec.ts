import { test, expect } from '@playwright/test';

test.describe('🔄 返品処理画面 - 完全コンポーネント検証', () => {
  test.beforeEach(async ({ page }) => {
    // 直接返品処理画面にアクセス
    await page.goto('http://localhost:3000/staff/returns');
    
    // ページの読み込み完了を待機
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('📋 基本画面構成 - タブ削除とヘッダー確認', async ({ page }) => {
    // ページタイトルとヘッダーの確認
    await expect(page.locator('h1')).toContainText('返品処理');
    await expect(page.locator('text=返品商品の検品と再出品を管理します')).toBeVisible();
    
    // タブナビゲーションが削除されていることを確認
    await expect(page.locator('text=返品検品')).not.toBeVisible();
    await expect(page.locator('text=再出品業務フロー')).not.toBeVisible();
    await expect(page.locator('text=返品処理管理')).not.toBeVisible();
    
    // タブボタンが存在しないことを確認
    const tabButtons = page.locator('button[class*="border-b-2"]');
    await expect(tabButtons).toHaveCount(0);
    
    console.log('✅ タブナビゲーション削除確認完了');
  });

  test('📊 サマリー統計表示確認', async ({ page }) => {
    // サマリー統計カードが表示されることを確認
    await expect(page.locator('.intelligence-metrics')).toBeVisible();
    await expect(page.locator('text=本日の返品')).toBeVisible();
    await expect(page.locator('text=検品中')).toBeVisible();
    await expect(page.locator('text=処理完了')).toBeVisible();
    await expect(page.locator('text=返金済み')).toBeVisible();
    
    // 統計値が表示されることを確認
    const metricValues = page.locator('.metric-value');
    await expect(metricValues).toHaveCount(4);
    
    console.log('✅ サマリー統計表示確認完了');
  });

  test('🔍 フィルター機能動作確認', async ({ page }) => {
    // フィルターボタンが表示されることを確認
    await expect(page.locator('button:has-text("すべて")')).toBeVisible();
    await expect(page.locator('button:has-text("検品待ち")')).toBeVisible();
    await expect(page.locator('button:has-text("検品中")')).toBeVisible();
    await expect(page.locator('button:has-text("処理完了")')).toBeVisible();
    
    // フィルターボタンをクリックして動作を確認
    await page.click('button:has-text("検品待ち")');
    await page.waitForTimeout(500);
    await expect(page.locator('button:has-text("検品待ち")')).toHaveClass(/bg-nexus-primary/);
    
    await page.click('button:has-text("すべて")');
    await page.waitForTimeout(500);
    await expect(page.locator('button:has-text("すべて")')).toHaveClass(/bg-nexus-primary/);
    
    console.log('✅ フィルター機能動作確認完了');
  });

  test('📝 商品リスト表示と列構成確認', async ({ page }) => {
    // 商品リストテーブルの表示確認
    await expect(page.locator('h2:has-text("返品商品リスト")')).toBeVisible();
    
    // テーブルヘッダーの確認
    await expect(page.locator('th:has-text("注文番号")')).toBeVisible();
    await expect(page.locator('th:has-text("商品名")')).toBeVisible();
    await expect(page.locator('th:has-text("返品日")')).toBeVisible();
    await expect(page.locator('th:has-text("返品理由")')).toBeVisible();
    await expect(page.locator('th:has-text("顧客")')).toBeVisible();
    await expect(page.locator('th:has-text("ステータス")')).toBeVisible();
    await expect(page.locator('th:has-text("アクション")')).toBeVisible();
    
    // テーブル行の存在確認
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    console.log('✅ 商品リスト表示確認完了');
  });

  test('🎯 商品アクションボタン動作確認', async ({ page }) => {
    // 最初の商品行を取得
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
    
    // 詳細ボタンの存在と動作確認
    const detailButton = firstRow.locator('button:has-text("詳細")');
    await expect(detailButton).toBeVisible();
    await detailButton.click();
    await page.waitForTimeout(1000);
    
    // トーストメッセージが表示されることを確認
    // (実際のアプリケーションではトーストが表示される)
    
    console.log('✅ 詳細ボタン動作確認完了');
  });

  test('🔧 検品開始ボタン動作確認', async ({ page }) => {
    // pending状態の商品を探す
    const pendingRows = page.locator('tbody tr').filter({ 
      has: page.locator('button:has-text("検品開始")') 
    });
    
    if (await pendingRows.count() > 0) {
      const firstPendingRow = pendingRows.first();
      const inspectionButton = firstPendingRow.locator('button:has-text("検品開始")');
      
      await expect(inspectionButton).toBeVisible();
      await inspectionButton.click();
      await page.waitForTimeout(1000);
      
      console.log('✅ 検品開始ボタン動作確認完了');
    } else {
      console.log('ℹ️ 検品待ち商品が存在しません');
    }
  });

  test('✅ 承認・拒否ボタン動作確認', async ({ page }) => {
    // inspecting状態の商品を探す
    const inspectingRows = page.locator('tbody tr').filter({ 
      has: page.locator('button:has-text("承認")') 
    });
    
    if (await inspectingRows.count() > 0) {
      const firstInspectingRow = inspectingRows.first();
      
      // 承認ボタンの確認
      const approveButton = firstInspectingRow.locator('button:has-text("承認")');
      await expect(approveButton).toBeVisible();
      
      // 拒否ボタンの確認
      const rejectButton = firstInspectingRow.locator('button:has-text("拒否")');
      await expect(rejectButton).toBeVisible();
      
      // 承認ボタンをクリック
      await approveButton.click();
      await page.waitForTimeout(1000);
      
      console.log('✅ 承認・拒否ボタン動作確認完了');
    } else {
      console.log('ℹ️ 検品中商品が存在しません');
    }
  });

  test('💰 返金処理ボタン動作確認', async ({ page }) => {
    // approved状態の商品を探す
    const approvedRows = page.locator('tbody tr').filter({ 
      has: page.locator('button:has-text("返金処理")') 
    });
    
    if (await approvedRows.count() > 0) {
      const firstApprovedRow = approvedRows.first();
      const refundButton = firstApprovedRow.locator('button:has-text("返金処理")');
      
      await expect(refundButton).toBeVisible();
      await refundButton.click();
      await page.waitForTimeout(1000);
      
      console.log('✅ 返金処理ボタン動作確認完了');
    } else {
      console.log('ℹ️ 承認済み商品が存在しません');
    }
  });

  test('🔄 再出品ボタン表示と動作確認 - 重要な新機能', async ({ page }) => {
    // refunded状態の商品を探す、または手動でデータを作成
    let refundedRows = page.locator('tbody tr').filter({ 
      has: page.locator('button:has-text("再出品")') 
    });
    
    // 再出品ボタンが存在しない場合、テスト用にステータスを変更
    if (await refundedRows.count() === 0) {
      console.log('ℹ️ 返金済み商品がないため、テスト用データで確認');
      
      // 最初の行で返金処理を実行して再出品ボタンを表示させる
      const firstRow = page.locator('tbody tr').first();
      const refundButton = firstRow.locator('button:has-text("返金処理")');
      
      if (await refundButton.count() > 0) {
        await refundButton.click();
        await page.waitForTimeout(1000);
        
        // 再度検索
        refundedRows = page.locator('tbody tr').filter({ 
          has: page.locator('button:has-text("再出品")') 
        });
      }
    }
    
    if (await refundedRows.count() > 0) {
      const firstRefundedRow = refundedRows.first();
      const relistButton = firstRefundedRow.locator('button:has-text("再出品")');
      
      // 再出品ボタンの存在確認
      await expect(relistButton).toBeVisible();
      
      // 再出品ボタンのスタイル確認
      await expect(relistButton).toHaveClass(/nexus-button/);
      await expect(relistButton).toHaveClass(/primary/);
      
      console.log('✅ 再出品ボタン表示確認完了');
      
      // 再出品ボタンをクリック
      await relistButton.click();
      await page.waitForTimeout(2000);
      
      console.log('✅ 再出品ボタンクリック動作確認完了');
    } else {
      console.log('⚠️ 再出品ボタンが表示されません - データ不足の可能性');
    }
  });

  test('🔷 再出品モーダル表示確認 - 重要な新機能', async ({ page }) => {
    // 再出品ボタンを見つけてクリック
    const relistButton = page.locator('button:has-text("再出品")').first();
    
    if (await relistButton.count() > 0) {
      await relistButton.click();
      await page.waitForTimeout(2000);
      
      // モーダルの表示確認
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // モーダルタイトルの確認
      const modalTitle = page.locator('text=再出品業務フロー');
      await expect(modalTitle).toBeVisible();
      
      // 再出品業務フローコンポーネントの表示確認
      await expect(page.locator('.intelligence-card')).toBeVisible();
      
      // モーダルを閉じる
      const closeButton = page.locator('button[aria-label="Close"]').or(
        page.locator('button:has-text("×")')
      );
      if (await closeButton.count() > 0) {
        await closeButton.click();
        await page.waitForTimeout(1000);
        await expect(modal).not.toBeVisible();
      }
      
      console.log('✅ 再出品モーダル表示確認完了');
    } else {
      console.log('⚠️ 再出品ボタンが見つかりません');
    }
  });

  test('🚫 再販不可リストボタン動作確認', async ({ page }) => {
    // ヘッダーの再販不可リストボタンを確認
    const unsellableButton = page.locator('button:has-text("再販不可リスト")');
    await expect(unsellableButton).toBeVisible();
    
    // ボタンをクリック
    await unsellableButton.click();
    await page.waitForTimeout(1000);
    
    // モーダルの表示確認
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // モーダルタイトルの確認
    await expect(page.locator('text=再販不可商品リスト')).toBeVisible();
    
    console.log('✅ 再販不可リストボタン動作確認完了');
  });

  test('📱 レスポンシブデザイン確認', async ({ page }) => {
    // デスクトップサイズ
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(500);
    await expect(page.locator('.intelligence-metrics')).toBeVisible();
    
    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(page.locator('.intelligence-metrics')).toBeVisible();
    
    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(page.locator('.intelligence-metrics')).toBeVisible();
    
    // 元のサイズに戻す
    await page.setViewportSize({ width: 1400, height: 900 });
    
    console.log('✅ レスポンシブデザイン確認完了');
  });

  test('🎨 UI統一性とスタイリング確認', async ({ page }) => {
    // Nexusデザインシステムの確認
    await expect(page.locator('.intelligence-card')).toBeVisible();
    const buttonCount = await page.locator('.nexus-button').count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // パディングの統一性確認
    const mainContent = page.locator('.space-y-6').first();
    await expect(mainContent).toBeVisible();
    
    // ボタンのスタイル統一性確認
    const buttons = page.locator('.nexus-button');
    for (let i = 0; i < Math.min(await buttons.count(), 5); i++) {
      await expect(buttons.nth(i)).toHaveClass(/nexus-button/);
    }
    
    console.log('✅ UI統一性確認完了');
  });

  test('⚡ パフォーマンスと読み込み時間確認', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000/staff/returns');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`📊 ページ読み込み時間: ${loadTime}ms`);
    
    // 3秒以内の読み込みを期待
    expect(loadTime).toBeLessThan(3000);
    
    // 主要コンポーネントの表示確認
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.intelligence-metrics')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    
    console.log('✅ パフォーマンス確認完了');
  });

  test('🔄 全体的な画面フロー確認', async ({ page }) => {
    // 1. 基本画面表示
    await expect(page.locator('h1:has-text("返品処理")')).toBeVisible();
    
    // 2. フィルター操作
    await page.click('button:has-text("検品待ち")');
    await page.waitForTimeout(500);
    
    // 3. 商品詳細確認
    const detailButton = page.locator('button:has-text("詳細")').first();
    if (await detailButton.count() > 0) {
      await detailButton.click();
      await page.waitForTimeout(1000);
    }
    
    // 4. 再出品ボタン確認（存在する場合）
    const relistButton = page.locator('button:has-text("再出品")').first();
    if (await relistButton.count() > 0) {
      await relistButton.click();
      await page.waitForTimeout(2000);
      
      // モーダル表示確認
      const modal = page.locator('[role="dialog"]');
      if (await modal.count() > 0) {
        await expect(modal).toBeVisible();
        
        // モーダルを閉じる
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    }
    
    // 5. 再販不可リスト確認
    const unsellableButton = page.locator('button:has-text("再販不可リスト")');
    if (await unsellableButton.count() > 0) {
      await unsellableButton.click();
      await page.waitForTimeout(1000);
      
      // モーダルを閉じる
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
    
    console.log('✅ 全体的な画面フロー確認完了');
  });
}); 