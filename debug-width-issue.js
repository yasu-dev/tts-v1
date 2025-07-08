
// 横幅問題デバッグツール
// ブラウザのコンソールで実行してください

function debugWidthIssue() {
  console.log('🔍 横幅問題デバッグ開始');
  
  // 1. DashboardLayoutのメインコンテナを特定
  const mainContent = document.querySelector('#main-content');
  const pageScrollContainer = document.querySelector('.page-scroll-container');
  const dashboardLayout = document.querySelector('[data-testid="dashboard-layout"]');
  
  console.log('📋 基本構造:');
  console.log('- DashboardLayout:', dashboardLayout);
  console.log('- Main Content:', mainContent);
  console.log('- Page Scroll Container:', pageScrollContainer);
  
  // 2. max-w-[1600px]が適用されている要素を探す
  const elements = document.querySelectorAll('*');
  const maxWidthElements = [];
  
  elements.forEach(el => {
    const computedStyle = window.getComputedStyle(el);
    const maxWidth = computedStyle.maxWidth;
    
    if (maxWidth && maxWidth !== 'none') {
      maxWidthElements.push({
        element: el,
        maxWidth: maxWidth,
        className: el.className,
        tagName: el.tagName
      });
    }
  });
  
  console.log('📏 max-width が設定されている要素:', maxWidthElements);
  
  // 3. 返品処理ページの特定要素を調査
  const returnElements = {
    tabContent: document.querySelector('[data-tab-content]'),
    contentCards: document.querySelectorAll('.nexus-content-card'),
    relistingFlow: document.querySelector('[data-component="ReturnRelistingFlow"]'),
    inspectionTab: document.querySelector('[data-tab="inspection"]'),
    relistingTab: document.querySelector('[data-tab="relisting"]')
  };
  
  console.log('🔄 返品処理ページ要素:', returnElements);
  
  // 4. 各要素の実際の幅を測定
  const measureElement = (element, name) => {
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    return {
      name: name,
      width: rect.width,
      maxWidth: computedStyle.maxWidth,
      marginLeft: computedStyle.marginLeft,
      marginRight: computedStyle.marginRight,
      paddingLeft: computedStyle.paddingLeft,
      paddingRight: computedStyle.paddingRight,
      boxSizing: computedStyle.boxSizing,
      className: element.className
    };
  };
  
  const measurements = [
    measureElement(document.querySelector('.page-scroll-container > div'), 'DashboardLayout Container'),
    measureElement(document.querySelector('.space-y-6'), 'Main Space Container'),
    measureElement(document.querySelector('.nexus-content-card'), 'First Content Card'),
    measureElement(document.querySelector('h2:contains("返品商品再出品業務フロー")'), 'Relisting Flow Title'),
  ];
  
  console.log('📐 要素の実際の幅:', measurements.filter(m => m !== null));
  
  // 5. CSS Grid/Flexboxの制約を調査
  const containerElements = document.querySelectorAll('.space-y-6, .grid, .flex');
  console.log('🔲 コンテナ要素のレイアウト情報:');
  
  containerElements.forEach((el, index) => {
    const computedStyle = window.getComputedStyle(el);
    console.log(`Container ${index}:`, {
      display: computedStyle.display,
      gridTemplateColumns: computedStyle.gridTemplateColumns,
      flexDirection: computedStyle.flexDirection,
      justifyContent: computedStyle.justifyContent,
      alignItems: computedStyle.alignItems,
      width: el.getBoundingClientRect().width,
      className: el.className
    });
  });
  
  // 6. 問題の可能性を特定
  console.log('🎯 問題の可能性:');
  console.log('1. ContentCard内部の制約');
  console.log('2. CSS Grid/Flexboxの制約');
  console.log('3. 親要素の制約');
  console.log('4. Tailwind CSSの詳細度競合');
  
  return {
    maxWidthElements,
    returnElements,
    measurements: measurements.filter(m => m !== null)
  };
}

// 実行
debugWidthIssue(); 