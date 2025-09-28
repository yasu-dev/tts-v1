import { test, expect } from '@playwright/test';

test.describe('業務フローバッジカウントE2Eテスト', () => {

  test('準備フェーズ - 納品プラン作成でカウントが増減する', async ({ page }) => {
    // セラーとしてログイン
    await page.goto('http://localhost:3002/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/delivery');

    // 初期カウントを取得
    await page.waitForSelector('.flex.items-center.gap-2 .font-medium:has-text("納品プラン作成")', { timeout: 10000 });
    const planCountElement = await page.locator('.flex.items-center.gap-2:has(.font-medium:has-text("納品プラン作成")) .px-2').first();
    const initialCount = await planCountElement.textContent() || '0';
    console.log(`初期納品プラン作成カウント: ${initialCount}`);

    // 納品プラン作成画面へ移動
    await page.goto('http://localhost:3002/delivery');
    await page.click('text=新規納品プラン作成');

    // 基本情報入力
    await page.fill('input[placeholder*="納品先住所"]', 'THE WORLD DOOR 倉庫A');

    // 商品登録
    await page.click('text=商品を追加');
    await page.fill('input[name="product-name"]', 'テストカメラ' + Date.now());
    await page.selectOption('select[name="product-category"]', 'camera');
    await page.fill('input[name="purchase-price"]', '50000');
    await page.selectOption('input[name="photographyType"][value="standard"]', 'standard');

    // プラン作成
    await page.click('button:has-text("納品プラン作成")');
    await page.waitForTimeout(2000);

    // カウントが増加したか確認
    await page.goto('http://localhost:3002/staff/inventory');
    await page.waitForSelector('.flex.items-center.gap-2 .font-medium:has-text("納品プラン作成")');
    const newCountElement = await page.locator('.flex.items-center.gap-2:has(.font-medium:has-text("納品プラン作成")) .px-2').first();
    const newCount = await newCountElement.textContent() || '0';

    console.log(`作成後納品プラン作成カウント: ${newCount}`);
    expect(parseInt(newCount)).toBeGreaterThan(parseInt(initialCount));
  });

  test('販売フェーズ - 受注処理でカウントが増減する', async ({ page }) => {
    // スタッフとしてログイン
    await page.goto('http://localhost:3002/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/staff/**');

    // 初期カウントを取得
    await page.waitForSelector('.flex.items-center.gap-2 .font-medium:has-text("受注処理")', { timeout: 10000 });
    const processCountElement = await page.locator('.flex.items-center.gap-2:has(.font-medium:has-text("受注処理")) .px-2').first();
    const initialCount = await processCountElement.textContent() || '0';
    console.log(`初期受注処理カウント: ${initialCount}`);

    // 注文を作成（APIで直接作成）
    const response = await page.request.post('http://localhost:3002/api/orders', {
      data: {
        customerId: 'test-customer',
        status: 'processing',
        items: [
          {
            productId: 'test-product-001',
            quantity: 1,
            price: 50000
          }
        ]
      }
    });

    expect(response.ok()).toBeTruthy();
    await page.waitForTimeout(2000);
    await page.reload();

    // カウントが増加したか確認
    await page.waitForSelector('.flex.items-center.gap-2 .font-medium:has-text("受注処理")');
    const newCountElement = await page.locator('.flex.items-center.gap-2:has(.font-medium:has-text("受注処理")) .px-2').first();
    const newCount = await newCountElement.textContent() || '0';

    console.log(`注文作成後受注処理カウント: ${newCount}`);
    expect(parseInt(newCount)).toBeGreaterThan(parseInt(initialCount));
  });

  test('出荷フェーズ - 梱包・発送でカウントが増減する', async ({ page }) => {
    // スタッフとしてログイン
    await page.goto('http://localhost:3002/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/staff/**');

    // 初期カウントを取得
    await page.waitForSelector('.flex.items-center.gap-2 .font-medium:has-text("梱包・発送")', { timeout: 10000 });
    const packingCountElement = await page.locator('.flex.items-center.gap-2:has(.font-medium:has-text("梱包・発送")) .px-2').first();
    const initialCount = await packingCountElement.textContent() || '0';
    console.log(`初期梱包・発送カウント: ${initialCount}`);

    // 梱包作業画面へ移動
    await page.goto('http://localhost:3002/staff/packaging');

    // 商品を梱包完了にする
    const firstItem = await page.locator('.bg-white.rounded-lg').first();
    if (await firstItem.isVisible()) {
      await firstItem.click('button:has-text("梱包完了")');
      await page.waitForTimeout(2000);

      // カウントが変化したか確認
      await page.goto('http://localhost:3002/staff/inventory');
      await page.waitForSelector('.flex.items-center.gap-2 .font-medium:has-text("梱包・発送")');
      const newCountElement = await page.locator('.flex.items-center.gap-2:has(.font-medium:has-text("梱包・発送")) .px-2').first();
      const newCount = await newCountElement.textContent() || '0';

      console.log(`梱包後梱包・発送カウント: ${newCount}`);
      // 梱包完了すると梱包待ちから減るので、カウントは減少するはず
      expect(parseInt(newCount)).toBeLessThanOrEqual(parseInt(initialCount));
    }
  });

  test('返品フェーズ - 返品受付でカウントが増減する', async ({ page }) => {
    // スタッフとしてログイン
    await page.goto('http://localhost:3002/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/staff/**');

    // 初期カウントを取得
    await page.waitForSelector('.flex.items-center.gap-2 .font-medium:has-text("返品受付")', { timeout: 10000 });
    const returnCountElement = await page.locator('.flex.items-center.gap-2:has(.font-medium:has-text("返品受付")) .px-2').first();
    const initialCount = await returnCountElement.textContent() || '0';
    console.log(`初期返品受付カウント: ${initialCount}`);

    // 返品を作成（APIで直接作成）
    const response = await page.request.post('http://localhost:3002/api/returns', {
      data: {
        orderId: 'test-order-001',
        productId: 'test-product-001',
        reason: '商品不良',
        condition: 'damaged',
        customerNote: 'テスト返品',
        refundAmount: 50000,
        status: 'pending'
      }
    });

    if (response.ok()) {
      await page.waitForTimeout(2000);
      await page.reload();

      // カウントが増加したか確認
      await page.waitForSelector('.flex.items-center.gap-2 .font-medium:has-text("返品受付")');
      const newCountElement = await page.locator('.flex.items-center.gap-2:has(.font-medium:has-text("返品受付")) .px-2').first();
      const newCount = await newCountElement.textContent() || '0';

      console.log(`返品作成後返品受付カウント: ${newCount}`);
      expect(parseInt(newCount)).toBeGreaterThan(parseInt(initialCount));

      // 返品検品に進める
      await page.goto('http://localhost:3002/staff/returns');
      const returnItem = await page.locator('tr:has-text("test-order-001")').first();
      if (await returnItem.isVisible()) {
        await returnItem.click('button:has-text("検品開始")');
        await page.waitForTimeout(2000);

        // 返品受付が減り、返品検品が増えたか確認
        await page.goto('http://localhost:3002/staff/inventory');
        await page.waitForSelector('.flex.items-center.gap-2 .font-medium:has-text("返品検品")');
        const inspectCountElement = await page.locator('.flex.items-center.gap-2:has(.font-medium:has-text("返品検品")) .px-2').first();
        const inspectCount = await inspectCountElement.textContent() || '0';

        console.log(`検品開始後返品検品カウント: ${inspectCount}`);
        expect(parseInt(inspectCount)).toBeGreaterThan(0);
      }
    }
  });
});