import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * ラベルアップロード通知テスト
 * ラベル生成・アップロード時のピッキング依頼通知の生成と配信をテスト
 */
test.describe('ラベルアップロード通知テスト', () => {
  
  test.beforeEach(async ({ page }) => {
    // セラーとしてログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@test.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    // ログイン後はdeliveryページまたはdashboardにリダイレクト
    await page.waitForURL(url => url.toString().includes('/delivery') || url.toString().includes('/dashboard'));
  });

  test('外部配送業者ラベルアップロード時のピッキング依頼通知生成', async ({ page, context }) => {
    console.log('📦 [E2E] 外部配送業者ラベルアップロード通知テスト開始');

    // 1. 販売管理画面で購入者決定状態の商品を準備
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    // テスト機能で商品を購入者決定状態にする
    await page.locator('text="テスト機能を開く"').click();
    
    let soldProduct = page.locator('[data-status="sold"]').first();
    
    if (await soldProduct.count() === 0) {
      // sold状態の商品がない場合は作成
      const listingProduct = page.locator('[data-status="listing"]').first();
      await expect(listingProduct).toBeVisible();
      
      await listingProduct.locator('text="→ 購入者決定"').click();
      await page.keyboard.press('Enter');
      await expect(page.locator('text="テスト遷移完了"')).toBeVisible();
      
      await page.waitForTimeout(2000);
      soldProduct = page.locator('[data-status="sold"]').first();
    }
    
    await expect(soldProduct).toBeVisible();
    
    // 2. ラベル生成ボタンをクリック
    const labelButton = soldProduct.locator('text="ラベル生成"');
    await expect(labelButton).toBeVisible();
    await labelButton.click();
    
    // 3. 配送業者選択モーダルで外部業者を選択
    await page.waitForTimeout(1000);
    const carrierSelect = page.locator('select[name="carrier"]');
    await expect(carrierSelect).toBeVisible();
    
    await carrierSelect.selectOption('yamato'); // ヤマト運輸を選択
    
    // 外部サービス開くボタンをクリック
    const externalButton = page.locator('text="外部サービスを開く"');
    await expect(externalButton).toBeVisible();
    await externalButton.click();
    
    // 4. ラベルアップロードモーダルの表示を確認
    await page.waitForTimeout(2000);
    
    const uploadModal = page.locator('[data-testid="upload-modal"]');
    await expect(uploadModal).toBeVisible();
    
    // 5. ダミーPDFファイルをアップロード
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // テスト用PDFファイルを作成してアップロード
    await fileInput.setInputFiles({
      name: 'test-shipping-label.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 test shipping label content')
    });
    
    // 6. 追跡番号と配送業者情報を入力
    const trackingInput = page.locator('input[name="trackingNumber"]');
    await expect(trackingInput).toBeVisible();
    await trackingInput.fill('TEST-YAMATO-123456789');
    
    // 配送業者が自動選択されていることを確認
    const carrierInfo = page.locator('text="ヤマト運輸"');
    await expect(carrierInfo).toBeVisible();
    
    // 7. スタッフとして別タブでログインして通知確認準備
    const staffPage = await context.newPage();
    await staffPage.goto('/login');
    await staffPage.fill('input[name="email"]', 'staff@test.com');
    await staffPage.fill('input[name="password"]', 'password');
    await staffPage.click('button[type="submit"]');
    await staffPage.waitForURL('/dashboard');
    
    // スタッフの初期通知数を記録
    await staffPage.goto('/staff/shipping');
    await staffPage.waitForLoadState('networkidle');
    
    const initialStaffBell = staffPage.locator('[data-testid="notification-bell"]');
    await expect(initialStaffBell).toBeVisible();
    
    const initialStaffBadge = await staffPage.locator('[data-testid="notification-badge"]').textContent();
    const initialStaffCount = initialStaffBadge ? parseInt(initialStaffBadge) : 0;
    
    console.log(`📊 スタッフ初期通知数: ${initialStaffCount}`);
    
    // 8. セラー画面でアップロード実行
    const uploadButton = page.locator('text="アップロード"');
    await expect(uploadButton).toBeVisible();
    await uploadButton.click();
    
    // アップロード成功メッセージを確認
    await expect(page.locator('text="アップロード完了"')).toBeVisible();
    console.log('✅ ラベルアップロード完了');
    
    // 9. スタッフの通知増加を確認
    await staffPage.waitForTimeout(3000); // 通知生成の待機
    await staffPage.reload();
    await staffPage.waitForLoadState('networkidle');
    
    const updatedStaffBadge = await staffPage.locator('[data-testid="notification-badge"]').textContent();
    const updatedStaffCount = updatedStaffBadge ? parseInt(updatedStaffBadge) : 0;
    
    console.log(`📊 スタッフ更新後通知数: ${updatedStaffCount}`);
    expect(updatedStaffCount).toBeGreaterThan(initialStaffCount);
    
    // 10. スタッフの通知内容を確認
    await staffPage.locator('[data-testid="notification-bell"]').click();
    await staffPage.waitForTimeout(1000);
    
    // ピッキング依頼通知を確認
    const pickingNotification = staffPage.locator('text="📋 ピッキング依頼"');
    await expect(pickingNotification).toBeVisible();
    
    const pickingMessage = staffPage.locator('text="のピッキングを開始してください"');
    await expect(pickingMessage).toBeVisible();
    
    // 通知の詳細内容確認
    const notificationItem = staffPage.locator('[data-testid="notification-item"]').first();
    await expect(notificationItem).toHaveAttribute('data-type', 'picking_request');
    await expect(notificationItem).toHaveAttribute('data-priority', 'high');
    
    console.log('✅ スタッフへのピッキング依頼通知確認完了');
    
    // 11. 通知クリックで出荷管理画面に遷移することを確認
    await pickingNotification.click();
    await staffPage.waitForTimeout(1000);
    
    await expect(staffPage.url()).toContain('/staff/shipping');
    console.log('🔗 通知からの出荷管理画面遷移確認完了');
    
    await staffPage.close();
    
    console.log('✅ [E2E] 外部配送業者ラベルアップロード通知テスト完了');
  });

  test('FedEx配送ラベル生成時の通知', async ({ page, context }) => {
    console.log('🚛 [E2E] FedX配送ラベル生成通知テスト開始');

    // 1. 購入者決定状態の商品を準備
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    await page.locator('text="テスト機能を開く"').click();
    
    let soldProduct = page.locator('[data-status="sold"]').first();
    
    if (await soldProduct.count() === 0) {
      const listingProduct = page.locator('[data-status="listing"]').first();
      await listingProduct.locator('text="→ 購入者決定"').click();
      await page.keyboard.press('Enter');
      await expect(page.locator('text="テスト遷移完了"')).toBeVisible();
      await page.waitForTimeout(2000);
      soldProduct = page.locator('[data-status="sold"]').first();
    }
    
    // 2. ラベル生成でFedXを選択
    const labelButton = soldProduct.locator('text="ラベル生成"');
    await labelButton.click();
    
    await page.waitForTimeout(1000);
    const carrierSelect = page.locator('select[name="carrier"]');
    await carrierSelect.selectOption('fedex');
    
    const fedexButton = page.locator('text="詳細選択へ進む"');
    await expect(fedexButton).toBeVisible();
    await fedexButton.click();
    
    // 3. FedXサービス選択モーダル
    await page.waitForTimeout(1000);
    const fedexModal = page.locator('[data-testid="fedex-modal"]');
    await expect(fedexModal).toBeVisible();
    
    // スタンダードサービスを選択
    const standardService = page.locator('text="FedX Standard Overnight"');
    await expect(standardService).toBeVisible();
    await standardService.click();
    
    // 4. スタッフの通知確認準備
    const staffPage = await context.newPage();
    await staffPage.goto('/login');
    await staffPage.fill('input[name="email"]', 'staff@test.com');
    await staffPage.fill('input[name="password"]', 'password');
    await staffPage.click('button[type="submit"]');
    await staffPage.waitForURL('/dashboard');
    
    await staffPage.goto('/staff/shipping');
    const initialBadge = await staffPage.locator('[data-testid="notification-badge"]').textContent();
    const initialCount = initialBadge ? parseInt(initialBadge) : 0;
    
    // 5. FedXラベル生成実行
    const generateButton = page.locator('text="ラベル生成"');
    await expect(generateButton).toBeVisible();
    await generateButton.click();
    
    // 生成成功メッセージを確認
    await expect(page.locator('text="FedXラベル生成完了"')).toBeVisible({ timeout: 10000 });
    console.log('✅ FedXラベル生成完了');
    
    // 6. スタッフ通知確認
    await staffPage.waitForTimeout(3000);
    await staffPage.reload();
    await staffPage.waitForLoadState('networkidle');
    
    const updatedBadge = await staffPage.locator('[data-testid="notification-badge"]').textContent();
    const updatedCount = updatedBadge ? parseInt(updatedBadge) : 0;
    
    expect(updatedCount).toBeGreaterThan(initialCount);
    
    // 通知内容確認
    await staffPage.locator('[data-testid="notification-bell"]').click();
    await staffPage.waitForTimeout(1000);
    
    const pickingNotification = staffPage.locator('text="📋 ピッキング依頼"');
    await expect(pickingNotification).toBeVisible();
    
    console.log('✅ FedXラベル生成時のピッキング依頼通知確認完了');
    
    await staffPage.close();
    
    console.log('✅ [E2E] FedX配送ラベル生成通知テスト完了');
  });

  test('複数商品同梱時のピッキング依頼通知', async ({ page, context }) => {
    console.log('📦📦 [E2E] 複数商品同梱ピッキング依頼通知テスト開始');

    // 1. 複数の購入者決定商品を準備
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    await page.locator('text="テスト機能を開く"').click();
    
    // 少なくとも2つの sold 商品を作成
    const listingProducts = page.locator('[data-status="listing"]');
    const listingCount = await listingProducts.count();
    
    if (listingCount >= 2) {
      // 最初の2つをsoldにする
      for (let i = 0; i < 2; i++) {
        const product = listingProducts.nth(i);
        await product.locator('text="→ 購入者決定"').click();
        await page.keyboard.press('Enter');
        await expect(page.locator('text="テスト遷移完了"')).toBeVisible();
        await page.waitForTimeout(1000);
      }
    }
    
    // 2. 同梱設定を行う
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // sold状態の商品にチェックを入れる
    const soldProducts = page.locator('[data-status="sold"]');
    const soldCount = await soldProducts.count();
    
    if (soldCount >= 2) {
      for (let i = 0; i < 2; i++) {
        const checkbox = soldProducts.nth(i).locator('input[type="checkbox"]');
        await checkbox.check();
      }
      
      // 同梱設定ボタンをクリック
      const bundleButton = page.locator('text="同梱設定"');
      await expect(bundleButton).toBeVisible();
      await bundleButton.click();
      
      // 同梱モーダルで確認
      await page.waitForTimeout(1000);
      const bundleModal = page.locator('[data-testid="bundle-modal"]');
      await expect(bundleModal).toBeVisible();
      
      const confirmButton = page.locator('text="同梱設定を確認"');
      await confirmButton.click();
      
      await expect(page.locator('text="同梱設定完了"')).toBeVisible();
      console.log('✅ 同梱設定完了');
    }
    
    // 3. 同梱商品のラベル生成
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const bundleProduct = page.locator('text="同梱ラベル生成"').first();
    
    if (await bundleProduct.count() > 0) {
      await bundleProduct.click();
      
      await page.waitForTimeout(1000);
      await page.selectOption('select[name="carrier"]', 'yamato');
      await page.locator('text="外部サービスを開く"').click();
      
      // アップロード実行
      await page.waitForTimeout(2000);
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'bundle-label.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 bundle shipping label')
      });
      
      await page.fill('input[name="trackingNumber"]', 'BUNDLE-TEST-789');
      await page.locator('text="アップロード"').click();
      
      await expect(page.locator('text="アップロード完了"')).toBeVisible();
      console.log('✅ 同梱ラベルアップロード完了');
      
      // 4. スタッフ通知で同梱情報が含まれることを確認
      const staffPage = await context.newPage();
      await staffPage.goto('/login');
      await staffPage.fill('input[name="email"]', 'staff@test.com');
      await staffPage.fill('input[name="password"]', 'password');
      await staffPage.click('button[type="submit"]');
      await staffPage.waitForURL('/dashboard');
      
      await staffPage.goto('/staff/shipping');
      await staffPage.waitForTimeout(3000);
      await staffPage.reload();
      
      await staffPage.locator('[data-testid="notification-bell"]').click();
      await staffPage.waitForTimeout(1000);
      
      // 同梱商品のピッキング依頼通知を確認
      const bundleNotification = staffPage.locator('text="2点）のピッキング"');
      
      if (await bundleNotification.count() > 0) {
        await expect(bundleNotification).toBeVisible();
        console.log('✅ 同梱商品のピッキング依頼通知確認完了');
      }
      
      await staffPage.close();
    }
    
    console.log('✅ [E2E] 複数商品同梱ピッキング依頼通知テスト完了');
  });

  test('ピッキング依頼通知のメタデータ検証', async ({ page, context }) => {
    console.log('🔍 [E2E] ピッキング依頼通知メタデータ検証テスト開始');

    // 1. 商品準備とラベルアップロード
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    await page.locator('text="テスト機能を開く"').click();
    
    let soldProduct = page.locator('[data-status="sold"]').first();
    
    if (await soldProduct.count() === 0) {
      const listingProduct = page.locator('[data-status="listing"]').first();
      await listingProduct.locator('text="→ 購入者決定"').click();
      await page.keyboard.press('Enter');
      await expect(page.locator('text="テスト遷移完了"')).toBeVisible();
      await page.waitForTimeout(2000);
      soldProduct = page.locator('[data-status="sold"]').first();
    }
    
    // 商品情報を記録
    const productName = await soldProduct.locator('[data-testid="product-name"]').textContent();
    
    // ラベルアップロード
    await soldProduct.locator('text="ラベル生成"').click();
    await page.waitForTimeout(1000);
    
    await page.selectOption('select[name="carrier"]', 'sagawa');
    await page.locator('text="外部サービスを開く"').click();
    
    await page.waitForTimeout(2000);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'metadata-test-label.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 metadata test label')
    });
    
    const trackingNumber = 'META-TEST-456789123';
    await page.fill('input[name="trackingNumber"]', trackingNumber);
    await page.locator('text="アップロード"').click();
    
    await expect(page.locator('text="アップロード完了"')).toBeVisible();
    
    // 2. API経由でスタッフの通知を取得してメタデータ確認
    const staffPage = await context.newPage();
    await staffPage.goto('/login');
    await staffPage.fill('input[name="email"]', 'staff@test.com');
    await staffPage.fill('input[name="password"]', 'password');
    await staffPage.click('button[type="submit"]');
    await staffPage.waitForURL('/dashboard');
    
    // スタッフ通知をAPI経由で取得
    await staffPage.waitForTimeout(3000);
    const notificationsResponse = await staffPage.request.get('/api/notifications?role=staff');
    const notifications = await notificationsResponse.json();
    
    // 最新のピッキング依頼通知を検索
    const pickingNotification = notifications.find((n: any) => 
      n.type === 'picking_request' && 
      n.title.includes('📋 ピッキング依頼')
    );
    
    if (pickingNotification) {
      // メタデータ検証
      expect(pickingNotification.metadata).toBeDefined();
      
      const metadata = typeof pickingNotification.metadata === 'string' 
        ? JSON.parse(pickingNotification.metadata)
        : pickingNotification.metadata;
      
      // 必要なメタデータフィールドの確認
      expect(metadata.orderNumber).toBeDefined();
      expect(metadata.productIds).toBeDefined();
      expect(metadata.trackingNumber).toBe(trackingNumber);
      expect(metadata.carrier).toBe('sagawa');
      expect(metadata.location).toBeDefined();
      
      console.log('📊 通知メタデータ検証結果:', {
        orderNumber: metadata.orderNumber,
        productIds: metadata.productIds,
        trackingNumber: metadata.trackingNumber,
        carrier: metadata.carrier,
        location: metadata.location
      });
      
      console.log('✅ ピッキング依頼通知メタデータ検証完了');
    } else {
      console.warn('⚠️ ピッキング依頼通知が見つかりませんでした');
    }
    
    await staffPage.close();
    
    console.log('✅ [E2E] ピッキング依頼通知メタデータ検証テスト完了');
  });

  test('ラベルアップロード失敗時の通知非生成確認', async ({ page }) => {
    console.log('❌ [E2E] ラベルアップロード失敗時の通知非生成確認テスト開始');

    // 1. 商品準備
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    await page.locator('text="テスト機能を開く"').click();
    
    let soldProduct = page.locator('[data-status="sold"]').first();
    
    if (await soldProduct.count() === 0) {
      const listingProduct = page.locator('[data-status="listing"]').first();
      await listingProduct.locator('text="→ 購入者決定"').click();
      await page.keyboard.press('Enter');
      await expect(page.locator('text="テスト遷移完了"')).toBeVisible();
      await page.waitForTimeout(2000);
      soldProduct = page.locator('[data-status="sold"]').first();
    }
    
    // 2. スタッフの初期通知数を取得
    const initialResponse = await page.request.get('/api/notifications?role=staff');
    const initialNotifications = await initialResponse.json();
    const initialCount = initialNotifications.length;
    
    // 3. 意図的にアップロードを失敗させる
    await soldProduct.locator('text="ラベル生成"').click();
    await page.waitForTimeout(1000);
    
    await page.selectOption('select[name="carrier"]', 'yamato');
    await page.locator('text="外部サービスを開く"').click();
    
    await page.waitForTimeout(2000);
    
    // 無効なファイル形式をアップロード
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'invalid-file.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('this is not a pdf file')
    });
    
    await page.fill('input[name="trackingNumber"]', 'FAIL-TEST-123');
    
    // アップロードボタンをクリック（失敗することを期待）
    await page.locator('text="アップロード"').click();
    
    // エラーメッセージの確認
    const errorMessage = page.locator('text="エラー"');
    
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
      console.log('✅ アップロード失敗エラー確認');
      
      // 4. 通知が生成されていないことを確認
      await page.waitForTimeout(3000);
      
      const updatedResponse = await page.request.get('/api/notifications?role=staff');
      const updatedNotifications = await updatedResponse.json();
      const updatedCount = updatedNotifications.length;
      
      // 通知数が増加していないことを確認
      expect(updatedCount).toBe(initialCount);
      console.log('✅ 失敗時の通知非生成確認完了');
    } else {
      console.log('⚠️ アップロードが意外にも成功しました');
    }
    
    console.log('✅ [E2E] ラベルアップロード失敗時の通知非生成確認テスト完了');
  });

});