import { test, expect } from '@playwright/test';

/**
 * 通知ワークフロー統合テスト
 * 購入確定→ラベル生成依頼→ピッキング依頼の完全な通知フローをテスト
 */
test.describe('通知ワークフロー統合テスト', () => {
  
  test.beforeEach(async ({ page }) => {
    // セラーとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@test.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    // ログイン後はdeliveryページまたはdashboardにリダイレクト
    await page.waitForURL(url => url.toString().includes('/delivery') || url.toString().includes('/dashboard'));
  });

  test('完全な通知フロー: 購入確定→ラベル生成依頼→ピッキング依頼', async ({ page }) => {
    console.log('🧪 [E2E] 通知ワークフロー統合テスト開始');

    // 1. 販売管理画面に移動
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    // 2. テスト機能を開く
    const testFeatureButton = page.locator('text="テスト機能を開く"');
    await expect(testFeatureButton).toBeVisible();
    await testFeatureButton.click();
    
    // 3. 出品中商品を取得
    const listingProduct = page.locator('[data-status="listing"]').first();
    await expect(listingProduct).toBeVisible();
    
    // 4. 通知ベルアイコンの初期状態を確認
    const notificationBell = page.locator('[data-testid="notification-bell"]');
    await expect(notificationBell).toBeVisible();
    
    // 初期通知数を記録
    const initialBadge = await page.locator('[data-testid="notification-badge"]').textContent();
    const initialCount = initialBadge ? parseInt(initialBadge) : 0;
    
    // 5. 購入確定ボタンをクリック
    const purchaseButton = listingProduct.locator('text="→ 購入者決定"');
    await expect(purchaseButton).toBeVisible();
    await purchaseButton.click();
    
    // 6. 確認ダイアログでOK
    await page.locator('text="この操作を実行しますか？"').waitFor();
    await page.keyboard.press('Enter'); // ダイアログのOKボタン
    
    // 7. ステータス遷移成功のトーストを確認
    await expect(page.locator('text="テスト遷移完了"')).toBeVisible();
    
    // 8. 通知が生成されたことを確認（ベルアイコンのバッジ増加）
    await page.waitForTimeout(2000); // 通知生成の待機
    const updatedBadge = await page.locator('[data-testid="notification-badge"]').textContent();
    const updatedCount = updatedBadge ? parseInt(updatedBadge) : 0;
    
    expect(updatedCount).toBeGreaterThan(initialCount);
    console.log(`🔔 通知数変化: ${initialCount} → ${updatedCount}`);
    
    // 9. 通知パネルを開いて内容確認
    await notificationBell.click();
    await page.waitForTimeout(1000);
    
    // 10. ラベル生成依頼通知の確認
    const labelNotification = page.locator('text="📦 ラベル生成依頼"');
    await expect(labelNotification).toBeVisible();
    await expect(page.locator('text="が売れました！配送ラベルを生成してください"')).toBeVisible();
    
    // 11. 通知をクリックして販売管理画面に遷移することを確認
    await labelNotification.click();
    await page.waitForTimeout(1000);
    await expect(page.url()).toContain('/sales');
    
    console.log('✅ [E2E] ラベル生成依頼通知フロー完了');
  });

  test('データベース通知レコード作成の確認', async ({ page }) => {
    console.log('🧪 [E2E] データベース通知レコード作成テスト開始');

    // API経由で通知テーブルの初期状態を取得
    const initialResponse = await page.request.get('/api/notifications?role=seller');
    const initialNotifications = await initialResponse.json();
    const initialCount = initialNotifications.length;
    
    console.log(`📊 初期通知数: ${initialCount}`);

    // 販売管理画面でステータス遷移を実行
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    // テスト機能でステータス変更
    await page.locator('text="テスト機能を開く"').click();
    const listingProduct = page.locator('[data-status="listing"]').first();
    await listingProduct.locator('text="→ 購入者決定"').click();
    await page.keyboard.press('Enter');
    
    // 成功メッセージを待機
    await expect(page.locator('text="テスト遷移完了"')).toBeVisible();
    
    // 通知テーブルに新しいレコードが作成されたことを確認
    await page.waitForTimeout(3000); // データベース更新の待機
    
    const updatedResponse = await page.request.get('/api/notifications?role=seller');
    const updatedNotifications = await updatedResponse.json();
    const updatedCount = updatedNotifications.length;
    
    console.log(`📊 更新後通知数: ${updatedCount}`);
    expect(updatedCount).toBeGreaterThan(initialCount);
    
    // 新しい通知の内容を確認
    const latestNotification = updatedNotifications[0];
    expect(latestNotification.type).toBe('order_ready_for_label');
    expect(latestNotification.title).toBe('📦 ラベル生成依頼');
    expect(latestNotification.priority).toBe('high');
    expect(latestNotification.read).toBe(false);
    
    console.log('✅ [E2E] データベース通知レコード作成確認完了');
  });

  test('通知設定による表示フィルタリング', async ({ page }) => {
    console.log('🧪 [E2E] 通知設定フィルタリングテスト開始');

    // 1. 設定画面で product_sold 通知をOFFにする
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const productSoldToggle = page.locator('input[name="product_sold"]');
    await expect(productSoldToggle).toBeVisible();
    
    // 現在の状態を確認してOFFにする
    const isChecked = await productSoldToggle.isChecked();
    if (isChecked) {
      await productSoldToggle.click();
    }
    
    // 設定を保存
    await page.locator('text="設定を保存"').click();
    await expect(page.locator('text="設定が保存されました"')).toBeVisible();
    
    // 2. 販売管理画面でステータス遷移を実行
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    const initialBadge = await page.locator('[data-testid="notification-badge"]').textContent();
    const initialCount = initialBadge ? parseInt(initialBadge) : 0;
    
    // ステータス変更
    await page.locator('text="テスト機能を開く"').click();
    const listingProduct = page.locator('[data-status="listing"]').first();
    await listingProduct.locator('text="→ 購入者決定"').click();
    await page.keyboard.press('Enter');
    await expect(page.locator('text="テスト遷移完了"')).toBeVisible();
    
    // 3. 通知が表示されないことを確認
    await page.waitForTimeout(2000);
    const updatedBadge = await page.locator('[data-testid="notification-badge"]').textContent();
    const updatedCount = updatedBadge ? parseInt(updatedBadge) : 0;
    
    expect(updatedCount).toBe(initialCount); // 通知数が増加しないことを確認
    
    // 4. 設定をONに戻す
    await page.goto('/settings');
    await productSoldToggle.click();
    await page.locator('text="設定を保存"').click();
    
    console.log('✅ [E2E] 通知設定フィルタリング確認完了');
  });

  test('複数スタッフへのピッキング依頼通知', async ({ page, context }) => {
    console.log('🧪 [E2E] 複数スタッフ通知テスト開始');

    // 1. セラーでラベルアップロードまで実行
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    // 購入者決定状態の商品を取得
    await page.locator('text="テスト機能を開く"').click();
    const soldProduct = page.locator('[data-status="sold"]').first();
    
    if (await soldProduct.count() === 0) {
      // sold状態の商品がない場合は作成
      const listingProduct = page.locator('[data-status="listing"]').first();
      await listingProduct.locator('text="→ 購入者決定"').click();
      await page.keyboard.press('Enter');
      await expect(page.locator('text="テスト遷移完了"')).toBeVisible();
      await page.waitForTimeout(2000);
    }
    
    // 2. ラベル生成ボタンをクリック
    const labelButton = page.locator('text="ラベル生成"').first();
    await expect(labelButton).toBeVisible();
    await labelButton.click();
    
    // 3. 外部配送業者を選択
    await page.selectOption('select[name="carrier"]', 'yamato');
    await page.locator('text="外部サービスを開く"').click();
    
    // 4. ラベルアップロードモーダルで実行
    await page.waitForTimeout(2000);
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // ダミーファイルアップロード
    await fileInput.setInputFiles({
      name: 'test-label.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test pdf content')
    });
    
    // 追跡番号入力
    await page.fill('input[name="trackingNumber"]', 'TEST123456789');
    
    // アップロード実行
    await page.locator('text="アップロード"').click();
    await expect(page.locator('text="アップロード完了"')).toBeVisible();
    
    // 5. 新しいタブでスタッフとしてログイン
    const staffPage = await context.newPage();
    await staffPage.goto('/login');
    await staffPage.fill('input[name="email"]', 'staff@test.com');
    await staffPage.fill('input[name="password"]', 'password');
    await staffPage.click('button[type="submit"]');
    await staffPage.waitForURL('/dashboard');
    
    // 6. スタッフの通知を確認
    await staffPage.goto('/staff/shipping');
    await staffPage.waitForLoadState('networkidle');
    
    const staffNotificationBell = staffPage.locator('[data-testid="notification-bell"]');
    await expect(staffNotificationBell).toBeVisible();
    
    // 通知パネルを開く
    await staffNotificationBell.click();
    await staffPage.waitForTimeout(1000);
    
    // ピッキング依頼通知を確認
    const pickingNotification = staffPage.locator('text="📋 ピッキング依頼"');
    await expect(pickingNotification).toBeVisible();
    await expect(staffPage.locator('text="のピッキングを開始してください"')).toBeVisible();
    
    await staffPage.close();
    
    console.log('✅ [E2E] 複数スタッフ通知確認完了');
  });

  test('通知の既読・未読状態管理', async ({ page }) => {
    console.log('🧪 [E2E] 通知既読・未読状態管理テスト開始');

    // 1. 通知を生成
    await page.goto('/sales');
    await page.locator('text="テスト機能を開く"').click();
    const listingProduct = page.locator('[data-status="listing"]').first();
    await listingProduct.locator('text="→ 購入者決定"').click();
    await page.keyboard.press('Enter');
    await expect(page.locator('text="テスト遷移完了"')).toBeVisible();
    
    // 2. 通知パネルを開いて未読状態を確認
    const notificationBell = page.locator('[data-testid="notification-bell"]');
    await notificationBell.click();
    await page.waitForTimeout(1000);
    
    // 未読通知のスタイルを確認
    const unreadNotification = page.locator('[data-read="false"]').first();
    await expect(unreadNotification).toBeVisible();
    
    // 3. 通知をクリックして既読にする
    await unreadNotification.click();
    await page.waitForTimeout(1000);
    
    // 4. 再度通知パネルを開いて既読状態を確認
    await notificationBell.click();
    await page.waitForTimeout(1000);
    
    // 既読通知のスタイルを確認
    const readNotification = page.locator('[data-read="true"]').first();
    await expect(readNotification).toBeVisible();
    
    console.log('✅ [E2E] 通知既読・未読状態管理確認完了');
  });

});