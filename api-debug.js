// API呼び出しのデバッグ
console.log('🔍 API呼び出し確認開始...');

// 実際にブラウザで呼び出される API の確認
Promise.all([
  // 1. フロントエンドが呼び出すAPI
  fetch('http://localhost:3002/api/orders/shipping?page=1&limit=20')
    .then(res => res.json())
    .then(data => {
      console.log('📦 /api/orders/shipping レスポンス:');
      console.log('- Items:', data.items?.length || 0);
      console.log('- Pagination:', data.pagination);
      return data;
    })
    .catch(err => {
      console.log('❌ /api/orders/shipping エラー:', err.message);
      return null;
    }),
  
  // 2. 別のshipping API
  fetch('http://localhost:3002/api/shipping')
    .then(res => res.json())
    .then(data => {
      console.log('📦 /api/shipping レスポンス:');
      console.log('- TodayShipments:', data.todayShipments?.length || 0);
      console.log('- Stats:', data.stats);
      return data;
    })
    .catch(err => {
      console.log('❌ /api/shipping エラー:', err.message);
      return null;
    })
]).then(results => {
  console.log('🔍 比較結果:');
  console.log('/api/orders/shipping データ数:', results[0]?.items?.length || 0);
  console.log('/api/shipping データ数:', results[1]?.todayShipments?.length || 0);
  
  if (results[0]?.items?.length === 0 && results[1]?.todayShipments?.length === 0) {
    console.log('⚠️ 両方のAPIでデータが0件です');
  } else if (results[1]?.todayShipments?.length > 0) {
    console.log('💡 /api/shipping にはデータが存在する可能性があります');
  }
});
