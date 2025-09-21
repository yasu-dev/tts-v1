import { test, expect } from '@playwright/test';

test.describe('納品プラン作成 → スタッフ通知バッジ E2E テスト', () => {
  test('セラーが納品プラン作成後、スタッフの通知ベルにバッジが表示される', async ({ page, context }) => {
    console.log('E2E テスト開始: 納品プラン作成 → スタッフ通知バッジ確認');

    // 1. セラーとしてログイン
    await page.goto('http://localhost:3002/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/delivery', { timeout: 10000 });
    console.log('✓ セラーログイン完了');

    // 2. 納品プラン作成画面へ
    await page.goto('http://localhost:3002/delivery-plan');
    await page.waitForLoadState('networkidle');
    console.log('✓ 納品プラン画面表示');

    // 3. 基本情報ステップ - ページを進める
    await page.click('button:has-text("次へ")');
    await page.waitForLoadState('networkidle');
    console.log('✓ 基本情報ステップ完了');

    // 4. 商品登録ステップ - 商品追加
    await page.click('button:has-text("商品を追加")');
    await page.fill('input[placeholder*="商品名"]', 'E2Eテストカメラ');
    
    // 撮影要望選択 - 通常撮影を選択
    await page.click('input[type="radio"][value="standard"]:visible');
    
    // 商品登録ステップ完了
    await page.click('button:has-text("次へ進む")');
    await page.waitForLoadState('networkidle');
    console.log('✓ 商品登録ステップ完了');
    
    // 5. 確認・出力ステップに進む
    await page.click('button:has-text("次へ進む")');
    await page.waitForLoadState('networkidle');
    console.log('✓ 確認ステップ表示');
    
    // 6. 納品プラン作成実行
    await page.click('button:has-text("納品プランを作成")');
    await page.waitForLoadState('networkidle');
    console.log('✓ 納品プラン作成完了');

    // 6. 新しいタブでスタッフとしてログイン
    const staffPage = await context.newPage();
    await staffPage.goto('http://localhost:3002/login');
    await staffPage.fill('input[name="email"]', 'staff@example.com');
    await staffPage.fill('input[name="password"]', 'password123');
    await staffPage.click('button[type="submit"]');
    await staffPage.waitForURL('**/staff/inventory', { timeout: 10000 });
    console.log('✓ スタッフログイン完了');

    // 7. 通知ベルのバッジを確認
    await staffPage.waitForLoadState('networkidle');
    await staffPage.waitForTimeout(2000); // 通知生成の時間を待つ
    
    // 通知ベルアイコンの存在確認
    const notificationBell = staffPage.locator('[data-testid="notification-bell"], .notification-bell, svg[data-testid*="bell"]').first();
    await expect(notificationBell).toBeVisible();
    console.log('✓ 通知ベル表示確認');

    // バッジ（数字）の存在確認
    const badge = staffPage.locator('[data-testid="notification-count"], .notification-count, .badge').first();
    
    // バッジが表示されるまで最大10秒待機
    await expect(badge).toBeVisible({ timeout: 10000 });
    
    // バッジの数字が0より大きいことを確認
    const badgeText = await badge.textContent();
    const badgeNumber = parseInt(badgeText || '0');
    expect(badgeNumber).toBeGreaterThan(0);
    
    console.log(`✓ 通知バッジ確認完了: ${badgeNumber}件`);

    // 8. 通知内容の確認
    await notificationBell.click();
    await staffPage.waitForTimeout(1000);
    
    // 納品プラン作成通知の存在確認
    const deliveryPlanNotification = staffPage.locator('text*="納品プラン"').first();
    await expect(deliveryPlanNotification).toBeVisible();
    console.log('✓ 納品プラン通知内容確認完了');

    await staffPage.close();
    console.log('E2E テスト完了: スタッフベル通知バッジ表示を確認');
  });
});