// 完全な全画面リスト（返品検品・再出品業務フロー・返品理由分析タブ含む）
const completeScreensList = [
  // セラー画面（12画面）
  { name: 'billing', url: '/billing', role: 'seller', title: '請求・精算', category: 'seller' },
  { name: 'dashboard', url: '/dashboard', role: 'seller', title: 'ダッシュボード', category: 'seller' },
  { name: 'delivery', url: '/delivery', role: 'seller', title: '納品管理', category: 'seller' },
  { name: 'delivery-plan', url: '/delivery-plan', role: 'seller', title: '納品計画', category: 'seller' },
  { name: 'inventory', url: '/inventory', role: 'seller', title: '在庫管理', category: 'seller' },
  { name: 'returns', url: '/returns', role: 'seller', title: '返品管理', category: 'seller' },
  { name: 'sales', url: '/sales', role: 'seller', title: '販売管理', category: 'seller' },
  { name: 'profile', url: '/profile', role: 'seller', title: 'プロフィール設定', category: 'seller' },
  { name: 'settings', url: '/settings', role: 'seller', title: 'アカウント設定', category: 'seller' },
  { name: 'timeline', url: '/timeline', role: 'seller', title: '商品履歴', category: 'seller' },
  { name: 'reports', url: '/reports', role: 'seller', title: 'レポート', category: 'seller' },
  { name: 'reports-monthly', url: '/reports/monthly', role: 'seller', title: '月次レポート', category: 'seller' },
  
  // スタッフ画面（10画面）
  { name: 'staff-dashboard', url: '/staff/dashboard', role: 'staff', title: 'スタッフダッシュボード', category: 'staff' },
  { name: 'staff-inspection', url: '/staff/inspection', role: 'staff', title: '検品・撮影', category: 'staff' },
  { name: 'staff-inventory', url: '/staff/inventory', role: 'staff', title: 'スタッフ在庫管理', category: 'staff' },
  { name: 'staff-listing', url: '/staff/listing', role: 'staff', title: '出品管理', category: 'staff' },
  { name: 'staff-location', url: '/staff/location', role: 'staff', title: 'ロケーション管理', category: 'staff' },
  { name: 'staff-picking', url: '/staff/picking', role: 'staff', title: 'ピッキング', category: 'staff' },
  { name: 'staff-shipping', url: '/staff/shipping', role: 'staff', title: '出荷管理', category: 'staff' },
  { name: 'staff-returns', url: '/staff/returns', role: 'staff', title: 'スタッフ返品処理', category: 'staff' },
  { name: 'staff-reports', url: '/staff/reports', role: 'staff', title: 'スタッフ業務レポート', category: 'staff' },
  { name: 'staff-tasks', url: '/staff/tasks', role: 'staff', title: 'タスク管理', category: 'staff' },

  // 返品処理の詳細タブ（3タブ）
  { name: 'staff-returns-inspection', url: '/staff/returns', role: 'staff', title: 'スタッフ返品処理 - 返品検品', category: 'staff-returns-tab', tab: 'inspection' },
  { name: 'staff-returns-relisting', url: '/staff/returns', role: 'staff', title: 'スタッフ返品処理 - 再出品業務フロー', category: 'staff-returns-tab', tab: 'relisting' },
  { name: 'staff-returns-analysis', url: '/staff/returns', role: 'staff', title: 'スタッフ返品処理 - 返品理由分析', category: 'staff-returns-tab', tab: 'analysis' },
];

console.log('🎯 === 完全な全画面リスト ===\n');
console.log(`📊 総画面数: ${completeScreensList.length}画面\n`);

console.log('📱 === カテゴリ別画面数 ===');
const categories = {};
completeScreensList.forEach(screen => {
  if (!categories[screen.category]) {
    categories[screen.category] = [];
  }
  categories[screen.category].push(screen);
});

Object.entries(categories).forEach(([category, screens]) => {
  console.log(`${category}: ${screens.length}画面`);
});

console.log('\n📋 === 詳細リスト ===');
completeScreensList.forEach((screen, index) => {
  const tabInfo = screen.tab ? ` [${screen.tab}タブ]` : '';
  console.log(`${(index + 1).toString().padStart(2)}. ${screen.title}${tabInfo}`);
  console.log(`    URL: ${screen.url}`);
  console.log(`    Role: ${screen.role}`);
  console.log(`    Category: ${screen.category}`);
  console.log('');
});

console.log('🎉 === 特別なタブ画面 ===');
console.log('返品処理画面には以下の3つのタブが含まれます：');
console.log('1. 返品検品タブ - 返品商品の状態確認と品質評価');
console.log('2. 再出品業務フロータブ - 返品商品の再出品プロセス管理');
console.log('3. 返品理由分析タブ - 返品理由の統計分析と改善提案');

console.log('\n✅ 全画面リスト作成完了！');

module.exports = completeScreensList; 