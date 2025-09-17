import { test } from '@playwright/test';

test('手動で同梱作成と青背景確認', async ({ page }) => {
  test.setTimeout(600000); // 10分
  
  console.log('ブラウザを起動して手動操作を開始します...');
  
  // サーバーが起動していることを確認してからブラウザを開く
  await page.goto('http://localhost:3002');
  
  console.log('\n=== 手動操作の指示 ===');
  console.log('1. admin/admin123 でログイン');
  console.log('2. 配送管理画面で複数商品を選択して同梱ラベルを作成');
  console.log('3. 同梱作成後、10秒間待ってから自動でスクリーンショットを撮影します');
  console.log('4. 各画面で青背景を目視確認してください');
  console.log('========================\n');
  
  // 手動操作のための十分な待機時間（8分）
  await page.waitForTimeout(480000);
  
  console.log('スクリーンショット撮影を開始します...');
  
  // ロケーション管理画面
  console.log('ロケーション管理画面に移動中...');
  await page.goto('http://localhost:3002/staff/location');
  await page.waitForTimeout(5000);
  await page.screenshot({ 
    path: 'manual-location-bundle-blue.png', 
    fullPage: true 
  });
  console.log('✓ ロケーション管理画面のスクリーンショット完了');
  
  // 梱包管理画面（梱包待ち）
  console.log('梱包管理画面（梱包待ち）に移動中...');
  await page.goto('http://localhost:3002/staff/packaging');
  await page.waitForTimeout(3000);
  await page.screenshot({ 
    path: 'manual-packaging-pending-blue.png', 
    fullPage: true 
  });
  console.log('✓ 梱包待ち画面のスクリーンショット完了');
  
  // 梱包済みタブ
  console.log('梱包済みタブに切り替え中...');
  try {
    await page.locator('button:has-text("梱包済み")').first().click();
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log('梱包済みタブの切り替えに失敗、現在の状態でスクリーンショット');
  }
  
  await page.screenshot({ 
    path: 'manual-packaging-completed-blue.png', 
    fullPage: true 
  });
  console.log('✓ 梱包済み画面のスクリーンショット完了');
  
  console.log('\n=== 完了 ===');
  console.log('全てのスクリーンショットを保存しました。');
  console.log('ファイル: manual-location-bundle-blue.png');
  console.log('ファイル: manual-packaging-pending-blue.png'); 
  console.log('ファイル: manual-packaging-completed-blue.png');
  console.log('各画像で青背景を確認してください。');
});
