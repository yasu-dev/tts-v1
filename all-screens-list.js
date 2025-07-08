const fs = require('fs');
const path = require('path');

function listAllScreenshots() {
  const screenshotDir = 'test-results/fullscreen-width-verification';
  
  if (!fs.existsSync(screenshotDir)) {
    console.log(`❌ ディレクトリが見つかりません: ${screenshotDir}`);
    return;
  }
  
  const files = fs.readdirSync(screenshotDir).filter(f => f.endsWith('-fullscreen.png'));
  
  console.log(`\n📊 === 現在の全画面スクリーンショット一覧 ===`);
  console.log(`📁 ディレクトリ: ${screenshotDir}`);
  console.log(`📈 取得済み画面数: ${files.length}枚\n`);
  
  const expectedScreens = [
    'billing', 'dashboard', 'delivery', 'delivery-plan', 'inventory', 'returns', 'sales',
    'settings', 'timeline', 'reports', 'reports-monthly', 'profile',
    'staff-dashboard', 'staff-inspection', 'staff-inventory', 'staff-listing', 
    'staff-location', 'staff-picking', 'staff-shipping', 'staff-returns', 'staff-reports', 'staff-tasks'
  ];
  
  console.log(`🎯 期待される全画面数: ${expectedScreens.length}画面\n`);
  
  const currentScreens = files.map(f => f.replace('-fullscreen.png', '')).sort();
  const missingScreens = expectedScreens.filter(screen => !currentScreens.includes(screen));
  const extraScreens = currentScreens.filter(screen => !expectedScreens.includes(screen));
  
  console.log(`✅ === 取得済み画面 (${currentScreens.length}画面) ===`);
  currentScreens.forEach((screen, index) => {
    const filePath = path.join(screenshotDir, `${screen}-fullscreen.png`);
    const fileSize = Math.round(fs.statSync(filePath).size / 1024);
    const num = (index + 1).toString().padStart(2);
    console.log(`  ${num}. ${screen.padEnd(25)} (${fileSize}KB)`);
  });
  
  if (missingScreens.length > 0) {
    console.log(`\n❌ === 未取得画面 (${missingScreens.length}画面) ===`);
    missingScreens.forEach((screen, index) => {
      const num = (index + 1).toString().padStart(2);
      console.log(`  ${num}. ${screen}`);
    });
  } else {
    console.log(`\n🎉 === 全画面取得完了！ ===`);
  }
  
  if (extraScreens.length > 0) {
    console.log(`\n⚠️ === 予期しない画面 (${extraScreens.length}画面) ===`);
    extraScreens.forEach((screen, index) => {
      const num = (index + 1).toString().padStart(2);
      console.log(`  ${num}. ${screen}`);
    });
  }
  
  console.log(`\n📊 === 進捗状況 ===`);
  console.log(`📈 取得済み: ${currentScreens.length}/${expectedScreens.length}画面`);
  console.log(`📊 進捗率: ${Math.round((currentScreens.length / expectedScreens.length) * 100)}%`);
  
  if (currentScreens.length >= expectedScreens.length) {
    console.log(`\n🎉 全画面のスクリーンショット取得が完了しています！`);
    console.log(`🔍 横幅統一分析を実行可能です。`);
  } else {
    console.log(`\n⏳ まだ ${missingScreens.length}画面のスクリーンショットが必要です。`);
  }
}

listAllScreenshots(); 