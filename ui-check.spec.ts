import { test, expect } from '@playwright/test';

test.describe('UI/UX統一性チェック', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('全画面・全モーダルのUI要素を確認', async ({ page }) => {
    const uiIssues = [];

    // ログイン画面の確認
    console.log('=== ログイン画面 ===');
    const loginTitle = await page.locator('h1, h2').first();
    if (await loginTitle.isVisible()) {
      console.log('タイトル:', await loginTitle.textContent());
    }
    
    // ログイン処理
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // ダッシュボード確認
    console.log('\n=== ダッシュボード ===');
    await checkPageElements(page, 'ダッシュボード', uiIssues);

    // サイドメニューの各項目を確認
    const menuItems = [
      { text: 'タスク管理', selector: 'text=タスク管理' },
      { text: 'ドキュメント', selector: 'text=ドキュメント' },
      { text: 'カレンダー', selector: 'text=カレンダー' },
      { text: 'メッセージ', selector: 'text=メッセージ' },
      { text: 'レポート', selector: 'text=レポート' },
      { text: '設定', selector: 'text=設定' },
      { text: 'ユーザー管理', selector: 'text=ユーザー管理' },
      { text: 'プロジェクト', selector: 'text=プロジェクト' }
    ];

    for (const item of menuItems) {
      try {
        console.log(`\n=== ${item.text} ===`);
        await page.click(item.selector);
        await page.waitForLoadState('networkidle');
        await checkPageElements(page, item.text, uiIssues);
        
        // 各画面の追加ボタンやアクションボタンを探してモーダルを開く
        await checkModals(page, item.text, uiIssues);
      } catch (e) {
        console.log(`${item.text}の確認中にエラー:`, e.message);
      }
    }

    // 結果出力
    console.log('\n\n=== UI/UX不統一箇所一覧 ===');
    uiIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  });
});

async function checkPageElements(page, pageName, issues) {
  // ボタンの確認
  const buttons = await page.locator('button').all();
  for (const button of buttons) {
    const text = await button.textContent();
    const classes = await button.getAttribute('class');
    console.log(`ボタン: "${text}" - クラス: ${classes}`);
    
    // 統一性チェック
    if (classes && !classes.includes('btn-primary') && !classes.includes('btn-secondary') && !classes.includes('btn-danger')) {
      issues.push(`${pageName}: ボタン"${text}"が標準的なクラスを使用していない`);
    }
  }

  // フォーム要素の確認
  const inputs = await page.locator('input, select, textarea').all();
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    const classes = await input.getAttribute('class');
    const placeholder = await input.getAttribute('placeholder');
    console.log(`入力要素: type="${type}" - クラス: ${classes}`);
    
    if (!classes || !classes.includes('form-control')) {
      issues.push(`${pageName}: 入力要素が標準的なform-controlクラスを使用していない`);
    }
  }

  // リンクの確認
  const links = await page.locator('a').all();
  for (const link of links) {
    const text = await link.textContent();
    const classes = await link.getAttribute('class');
    console.log(`リンク: "${text}" - クラス: ${classes}`);
  }

  // カードやパネルの確認
  const cards = await page.locator('.card, .panel').all();
  console.log(`カード/パネル数: ${cards.length}`);

  // テーブルの確認
  const tables = await page.locator('table').all();
  for (const table of tables) {
    const classes = await table.getAttribute('class');
    console.log(`テーブル - クラス: ${classes}`);
    if (!classes || !classes.includes('table')) {
      issues.push(`${pageName}: テーブルが標準的なtableクラスを使用していない`);
    }
  }
}

async function checkModals(page, pageName, issues) {
  // 追加・新規作成ボタンを探す
  const actionButtons = ['追加', '新規', '作成', '編集', '削除', '詳細', '設定'];
  
  for (const action of actionButtons) {
    try {
      const button = page.locator(`button:has-text("${action}")`).first();
      if (await button.isVisible()) {
        console.log(`\n"${action}"ボタンをクリック`);
        await button.click();
        await page.waitForTimeout(1000);
        
        // モーダルが開いたか確認
        const modal = page.locator('.modal, [role="dialog"], .dialog').first();
        if (await modal.isVisible()) {
          console.log(`${action}モーダルが開きました`);
          
          // モーダル内の要素を確認
          await checkModalElements(page, `${pageName} - ${action}モーダル`, issues);
          
          // モーダルを閉じる
          const closeButton = modal.locator('button:has-text("閉じる"), button:has-text("キャンセル"), button.close').first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
          } else {
            await page.keyboard.press('Escape');
          }
          await page.waitForTimeout(500);
        }
      }
    } catch (e) {
      console.log(`${action}ボタンの処理中にエラー:`, e.message);
    }
  }
}

async function checkModalElements(page, modalName, issues) {
  const modal = page.locator('.modal, [role="dialog"], .dialog').first();
  
  // モーダルヘッダーの確認
  const header = modal.locator('.modal-header, .dialog-header').first();
  if (await header.isVisible()) {
    const headerClasses = await header.getAttribute('class');
    console.log(`モーダルヘッダー - クラス: ${headerClasses}`);
  } else {
    issues.push(`${modalName}: モーダルヘッダーが見つからない`);
  }
  
  // モーダル内のボタン確認
  const modalButtons = await modal.locator('button').all();
  for (const button of modalButtons) {
    const text = await button.textContent();
    const classes = await button.getAttribute('class');
    console.log(`モーダル内ボタン: "${text}" - クラス: ${classes}`);
    
    if (text && (text.includes('保存') || text.includes('送信'))) {
      if (!classes || !classes.includes('btn-primary')) {
        issues.push(`${modalName}: 保存/送信ボタンがbtn-primaryクラスを使用していない`);
      }
    }
  }
  
  // モーダル内のフォーム要素確認
  const modalInputs = await modal.locator('input, select, textarea').all();
  for (const input of modalInputs) {
    const classes = await input.getAttribute('class');
    if (!classes || !classes.includes('form-control')) {
      issues.push(`${modalName}: フォーム要素が標準的なform-controlクラスを使用していない`);
    }
  }
}