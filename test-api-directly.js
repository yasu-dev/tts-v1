const fetch = require('node-fetch');

async function testDeliveryPlanAPI() {
  console.log('🚀 納品プランAPI直接テスト開始');

  try {
    // 1. ログインして認証トークンを取得
    console.log('🔄 ログインテスト...');
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'seller@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`ログイン失敗: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ ログイン成功:', loginData.success);

    // Cookieから認証情報を取得
    const cookies = loginResponse.headers.raw()['set-cookie'];
    const cookieHeader = cookies ? cookies.join('; ') : '';
    console.log('🍪 Cookie取得:', cookieHeader.substring(0, 50) + '...');

    // 2. 納品プラン作成テスト
    console.log('🔄 納品プラン作成テスト...');
    
    const planData = {
      basicInfo: {
        deliveryAddress: '東京都江戸川区臨海町3-6-4 ヒューリック葛西臨海ビル5階',
        phoneNumber: '03-1234-5678',
        warehouseId: 'warehouse-1',
        warehouseName: 'メイン倉庫'
      },
      products: [{
        name: 'テストカメラ',
        category: 'camera',
        condition: 'excellent',
        purchasePrice: 50000,
        estimatedValue: 50000,
        supplierDetails: 'テスト仕入れ先',
        images: []
      }],
      confirmation: {
        notes: 'テスト納品プラン',
        agreed: true
      }
    };

    const createResponse = await fetch('http://localhost:3002/api/delivery-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      body: JSON.stringify(planData)
    });

    console.log('📊 API応答ステータス:', createResponse.status);
    
    if (!createResponse.ok) {
      const errorData = await createResponse.text();
      console.error('❌ API応答エラー:', errorData);
      throw new Error(`納品プラン作成失敗: ${createResponse.status}`);
    }

    const result = await createResponse.json();
    console.log('🎉 納品プラン作成成功!');
    console.log('📋 作成結果:', JSON.stringify(result, null, 2));

    return true;

  } catch (error) {
    console.error('💥 テスト失敗:', error.message);
    console.error('📍 エラー詳細:', error);
    return false;
  }
}

testDeliveryPlanAPI();
