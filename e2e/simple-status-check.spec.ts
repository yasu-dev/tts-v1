import { test, expect } from '@playwright/test';

test.describe('シンプルステータス確認', () => {
  test('梱包開始後のステータス更新確認', async ({ page }) => {
    console.log('🔄 シンプルステータス確認開始');

    // コンソールログキャッチ
    page.on('console', msg => {
      if (msg.text().includes('📦 同梱梱包開始処理') || msg.text().includes('🔄 ステータス更新')) {
        console.log(`📋 処理ログ: ${msg.text()}`);
      }
    });

    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // モーダル強制閉じる
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    console.log('\n=== 梱包待ちタブでステータス確認 ===');
    // 梱包待ちタブクリック（強制）
    try {
      await page.locator('button:has-text("梱包待ち")').click({ timeout: 5000 });
    } catch {
      console.log('梱包待ちタブクリック失敗、現在のタブで続行');
    }
    await page.waitForTimeout(2000);

    // DEBUGステータスを確認
    const debugs = await page.locator('span:has-text("DEBUG:")').allTextContents();
    console.log(`🏷️ 現在のDEBUGステータス: ${debugs.length}件`);
    
    debugs.forEach((debug, index) => {
      console.log(`   ${index}: ${debug}`);
    });

    await page.screenshot({
      path: 'SIMPLE-STATUS-CHECK.png',
      fullPage: true
    });

    console.log('🔄 シンプルステータス確認完了');
  });
});





























