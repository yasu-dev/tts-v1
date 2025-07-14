// 手動確認用スクリプト
// ブラウザのコンソールで実行してモーダル状態を確認

console.log('=== モーダル開時業務フロー制御確認 ===');

// 1. 現在の業務フロー表示状態を確認
const businessFlowContainer = document.querySelector('[data-testid="unified-product-flow"]');
const isFlowVisible = businessFlowContainer && businessFlowContainer.offsetParent !== null;
console.log(`📊 現在の業務フロー表示状態: ${isFlowVisible}`);

// 2. モーダルの状態を確認
const modals = document.querySelectorAll('[role="dialog"]');
const isModalOpen = modals.length > 0 && Array.from(modals).some(modal => modal.offsetParent !== null);
console.log(`📱 現在のモーダル表示状態: ${isModalOpen}`);

// 3. 詳細ボタンを探す
const detailButtons = document.querySelectorAll('button:has-text("詳細"), button');
const detailButtonsArray = Array.from(detailButtons).filter(btn => btn.textContent.includes('詳細'));
console.log(`🔍 詳細ボタン数: ${detailButtonsArray.length}`);

// 4. 業務フローヘッダーを確認
const businessFlowHeader = document.querySelector('h3');
const businessFlowHeaders = Array.from(document.querySelectorAll('h3')).filter(h => h.textContent.includes('業務フロー'));
console.log(`📋 業務フローヘッダー数: ${businessFlowHeaders.length}`);

// 5. コンソールログを監視する関数
function watchConsole() {
  const originalLog = console.log;
  console.log = function(...args) {
    if (args.some(arg => String(arg).includes('モーダル'))) {
      originalLog('🎯 モーダル関連ログ検出:', ...args);
    }
    originalLog.apply(console, args);
  };
  console.log('✅ コンソールログ監視開始');
}

// 実行
watchConsole();

console.log('=== 確認完了 ===');
console.log('次のステップ: 詳細ボタンをクリックしてモーダル開時の動作を確認してください'); 