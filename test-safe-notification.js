// 安全通知システムのテスト
const SafeNotificationSystem = require('./lib/safe-notification.js');

async function testSafeNotification() {
  const safeNotif = new SafeNotificationSystem();
  
  try {
    console.log('=== 安全通知システムテスト ===');
    
    // 1. テスト通知作成
    const testResult = await safeNotif.notifyAllStaffForDeliveryPlan({
      sellerName: 'テストセラー',
      productCount: 2,
      planId: 'TEST-PLAN-123'
    });
    
    console.log('📦 納品プラン通知結果:', testResult);
    
    // 2. スタッフ通知取得
    const staffNotifications = await safeNotif.getStaffNotifications(10);
    console.log('🔔 スタッフ通知一覧:', staffNotifications.length, '件');
    
    if (staffNotifications.length > 0) {
      console.log('最新通知:', staffNotifications[0].title);
    }
    
    // 3. API経由確認
    console.log('\n🌐 API経由確認...');
    const response = await fetch('http://localhost:3002/api/notifications?role=staff');
    const apiNotifications = await response.json();
    console.log('API通知件数:', apiNotifications.length);
    
    if (apiNotifications.length > 0) {
      console.log('✅ 通知システム動作確認完了');
    } else {
      console.log('❌ まだAPI経由で取得できず');
    }
    
    console.log('\n📝 後戻り方法:');
    console.log('   const safeNotif = new SafeNotificationSystem();');
    console.log('   await safeNotif.cleanup(); // 全ての安全通知を削除');
    
  } catch (error) {
    console.error('テストエラー:', error.message);
  } finally {
    safeNotif.disconnect();
  }
}

testSafeNotification();