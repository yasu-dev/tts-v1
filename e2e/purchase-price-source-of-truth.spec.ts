import { test, expect } from '@playwright/test';

test.describe('購入価格の単一ソース検証（セラー入力値の厳密表示）', () => {
  const price = 234567; // テスト用購入価格（±1検知用に覚えやすい値）
  const productName = `単一ソース検証用カメラ-${Date.now()}`;

  test('作成→確認→一覧→詳細まで同一の購入価格が表示される', async ({ page }) => {
    // 納品プラン作成ウィザードへ
    await page.goto('http://localhost:3002/delivery-plan');
    await page.waitForTimeout(2000);

    // Step1: 倉庫選択（存在するオプションを選択）
    const warehouseSelect = page.locator('select').first();
    const firstValidOption = warehouseSelect.locator('option').nth(1);
    if (await firstValidOption.count() > 0) {
      const value = await firstValidOption.getAttribute('value');
      if (value) await warehouseSelect.selectOption(value);
    }

    // 次へ
    await page.getByRole('button', { name: '次へ' }).first().click();
    await page.waitForTimeout(1000);

    // Step2: 商品登録
    const addButton = page.getByRole('button', { name: /商品を追加/ });
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(300);
    }

    // 商品名
    await page.locator('input[placeholder*="商品名"]').first().fill(productName);
    // カテゴリー
    await page.locator('select').first().selectOption('camera');
    // コンディション（次のselectを想定）
    await page.locator('select').nth(1).selectOption('excellent');
    // 購入価格
    await page.locator('input[type="number"]').first().fill(String(price));

    // 撮影要望（必須）: 通常撮影を選択
    const standardRadio = page.locator('input[type="radio"][value="standard"]');
    if (await standardRadio.count() > 0) {
      await standardRadio.check();
    }

    // 次へ → 確認画面
    await page.getByRole('button', { name: '次へ' }).first().click();
    await page.waitForTimeout(1000);

    // 確認画面で購入価格を厳密確認
    const yen = `¥${price.toLocaleString()}`;
    await expect(page.locator(`text=${yen}`).first()).toBeVisible();

    // 作成
    const createButton = page.getByRole('button', { name: /納品プランを作成/ });
    await expect(createButton).toBeEnabled();
    await createButton.click();
    await page.waitForTimeout(4000);

    // 一覧ページへ遷移（作成後に /delivery へ）
    await page.goto('http://localhost:3002/delivery');
    await page.waitForTimeout(2000);

    // 最新行の合計金額に同値が表示される（単一商品前提）
    await expect(page.locator(`text=${yen}`).first()).toBeVisible();

    // 詳細モーダルを開いて商品タブで購入価格確認
    const detailButton = page.getByRole('button', { name: '詳細' }).first();
    if (await detailButton.count() > 0) {
      await detailButton.click();
      await page.waitForTimeout(1000);
      const productsTab = page.getByRole('button', { name: '商品詳細' });
      if (await productsTab.count() > 0) {
        await productsTab.click();
        await page.waitForTimeout(500);
      }
      await expect(page.locator(`text=${yen}`)).toBeVisible();
    }
  });
});


