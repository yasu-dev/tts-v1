// 超安全通知システムのテスト
const UltraSafeNotificationSystem = require('./lib/ultra-safe-notification.js');

async function testUltraSafeNotification() {
  const ultraSafe = new UltraSafeNotificationSystem();
  
  try {
    console.log('=== 超安全通知システムテスト ===');
    
    // 1. 現在の通知数確認
    const beforeCount = await ultraSafe.getStaffNotificationCount();
    console.log('テスト前の通知数:', beforeCount, '件');
    
    // 2. テスト通知作成
    const testResult = await ultraSafe.notifyAllStaffForDeliveryPlan({
      sellerName: 'テストセラー（超安全版）',
      productCount: 3,
      planId: 'ULTRA-SAFE-TEST-123'
    });
    
    console.log('📦 納品プラン通知結果:', testResult);
    
    // 3. 通知数再確認
    const afterCount = await ultraSafe.getStaffNotificationCount();
    console.log('テスト後の通知数:', afterCount, '件');
    console.log('新規作成数:', afterCount - beforeCount, '件');
    
    // 4. API経由確認
    console.log('\n🌐 API経由確認...');
    const response = await fetch('http://localhost:3002/api/notifications?role=staff');
    const apiNotifications = await response.json();
    console.log('API通知件数:', apiNotifications.length);
    
    if (apiNotifications.length > 0) {
      console.log('✅ 通知システム動作確認完了');
      console.log('最新通知:', apiNotifications[0].title);
    } else {
      console.log('❌ まだAPI経由で取得できず');
    }
    
    console.log('\n📝 後戻り方法:');
    console.log('   const ultraSafe = new UltraSafeNotificationSystem();');
    console.log('   await ultraSafe.cleanup(); // 全ての超安全通知を削除');
    
  } catch (error) {
    console.error('テストエラー:', error.message);
  }
}

testUltraSafeNotification();