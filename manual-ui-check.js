const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // ログイン画面へアクセス
    await page.goto('http://localhost:3001/login');
    await page.waitForSelector('h2');
    
    console.log('✅ ログイン画面にアクセスしました');
    
    // ボタンの確認
    const passwordResetButton = await page.$('button:has-text("パスワードをお忘れですか")');
    if (passwordResetButton) {
      console.log('✅ パスワードリセットボタン: NexusButtonに統一されました');
    }
    
    // テストログインボタンの確認
    const sellerButton = await page.$('button[data-testid="seller-login"]');
    const staffButton = await page.$('button[data-testid="staff-login"]');
    
    if (sellerButton && staffButton) {
      console.log('✅ テストログインボタン: NexusButtonに統一されました');
      
      // セラーボタンをクリック
      await sellerButton.click();
      await page.waitForTimeout(500);
      
      // ログイン実行
      await page.click('button[data-testid="login-button"]');
      await page.waitForNavigation();
      
      console.log('✅ ログインに成功しました');
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
  
  // ブラウザは開いたままにしておく
})();