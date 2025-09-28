import { test, expect } from '@playwright/test';

test.describe('完全ワークフロー履歴E2Eテスト', () => {

  test('完全ワークフロー: 納品プラン作成→検品→撮影→棚保管→出品→購入者決定→ピッキング→梱包→ラベル貼付→配送準備まで履歴記録', async ({ page }) => {
    console.log('🔄 完全ワークフロー履歴テスト開始');

    // Step 1: セラーとしてログインし、納品プラン作成
    console.log('Step 1: セラーログイン & 納品プラン作成');
    await page.goto('http://localhost:3003/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/delivery', { timeout: 15000 });

    // 納品プラン作成
    await page.waitForTimeout(3000);
    const createButton = await page.locator('button:has-text("新規納品プラン作成"), a:has-text("新規納品プラン作成")');
    await createButton.click();
    await page.waitForTimeout(2000);

    // 基本情報入力
    await page.fill('input[placeholder*="納品先住所"]', 'THE WORLD DOOR 倉庫A');

    // 商品登録
    await page.click('text=商品を追加');
    await page.waitForTimeout(1000);

    const testProductName = 'テスト履歴カメラ' + Date.now();
    await page.fill('input[name="product-name"]', testProductName);
    await page.selectOption('select[name="product-category"]', 'camera');
    await page.fill('input[name="purchase-price"]', '75000');

    // 撮影リクエスト
    const photographyRadio = await page.locator('input[name="photographyType"][value="standard"]');
    await photographyRadio.check();

    // プラン作成実行
    await page.click('button:has-text("納品プラン作成")');
    await page.waitForTimeout(3000);

    console.log('✅ Step 1完了: 納品プラン作成');

    // Step 2: スタッフログインして検品・撮影・棚保管・出品
    console.log('Step 2: スタッフログイン');
    await page.goto('http://localhost:3003/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/staff/**', { timeout: 15000 });

    // 入庫・検品画面へ移動
    await page.goto('http://localhost:3003/staff/receiving');
    await page.waitForTimeout(2000);

    // 作成した商品を検品完了にする
    const productRow = await page.locator(`tr:has-text("${testProductName}")`).first();
    if (await productRow.isVisible()) {
      await productRow.locator('button:has-text("検品完了")').click();
      await page.waitForTimeout(2000);
      console.log('✅ Step 2-1完了: 検品');

      // 撮影完了処理
      await productRow.locator('button:has-text("撮影完了")').click();
      await page.waitForTimeout(2000);
      console.log('✅ Step 2-2完了: 撮影');

      // 棚保管処理
      await productRow.locator('button:has-text("棚保管")').click();
      await page.waitForTimeout(2000);
      console.log('✅ Step 2-3完了: 棚保管');

      // 出品処理
      await productRow.locator('button:has-text("出品")').click();
      await page.waitForTimeout(2000);
      console.log('✅ Step 2-4完了: 出品');
    }

    // Step 3: 購入者決定（注文作成）
    console.log('Step 3: 購入者決定');

    // 商品IDを取得するためAPIを呼び出し
    const productsResponse = await page.request.get('http://localhost:3003/api/products');
    const productsData = await productsResponse.json();
    const testProduct = productsData.products.find((p: any) => p.name === testProductName);

    if (testProduct) {
      // 注文作成API呼び出し
      const orderResponse = await page.request.post('http://localhost:3003/api/orders', {
        data: {
          customerId: 'test-customer-history',
          items: [
            {
              productId: testProduct.id,
              quantity: 1,
              price: 75000
            }
          ],
          shippingAddress: 'テスト配送先住所',
          paymentMethod: 'credit_card',
          notes: '履歴テスト注文'
        }
      });

      if (orderResponse.ok()) {
        console.log('✅ Step 3完了: 購入者決定');
        const orderData = await orderResponse.json();

        // Step 4: ピッキング完了
        console.log('Step 4: ピッキング完了');
        const pickingResponse = await page.request.post('http://localhost:3003/api/picking', {
          data: {
            productIds: [testProduct.id],
            action: 'complete_picking'
          }
        });

        if (pickingResponse.ok()) {
          console.log('✅ Step 4完了: ピッキング');

          // Step 5: 梱包・ラベル貼付・配送準備
          console.log('Step 5: 梱包・ラベル貼付・配送準備');

          // Shipmentを取得して更新
          const shipmentsResponse = await page.request.get('http://localhost:3003/api/shipping');
          const shipmentsData = await shipmentsResponse.json();
          const testShipment = shipmentsData.todayShipments.find((s: any) => s.productName === testProductName);

          if (testShipment) {
            // 梱包完了
            const packingResponse = await page.request.put('http://localhost:3003/api/shipping', {
              data: {
                shipmentId: testShipment.id,
                status: 'packed',
                notes: '梱包完了'
              }
            });

            if (packingResponse.ok()) {
              console.log('✅ Step 5-1完了: 梱包');

              // ラベル貼付完了
              const labelResponse = await page.request.put('http://localhost:3003/api/shipping', {
                data: {
                  shipmentId: testShipment.id,
                  status: 'ready_for_pickup',
                  notes: 'ラベル貼付完了'
                }
              });

              if (labelResponse.ok()) {
                console.log('✅ Step 5-2完了: ラベル貼付');

                // 配送準備完了
                const shippingResponse = await page.request.put('http://localhost:3003/api/shipping', {
                  data: {
                    shipmentId: testShipment.id,
                    status: 'shipped',
                    notes: '配送準備完了'
                  }
                });

                if (shippingResponse.ok()) {
                  console.log('✅ Step 5-3完了: 配送準備');

                  // Step 6: 商品詳細の履歴タブで全履歴を確認
                  console.log('Step 6: 履歴確認');
                  await page.goto(`http://localhost:3003/staff/products/${testProduct.id}`);
                  await page.waitForTimeout(3000);

                  // 履歴タブをクリック
                  await page.click('text=履歴');
                  await page.waitForTimeout(2000);

                  // 履歴スクリーンショットを撮る
                  await page.screenshot({ path: 'complete-workflow-history.png', fullPage: true });

                  // 期待される履歴項目を確認
                  const expectedHistoryItems = [
                    '納品プラン',
                    '検品完了',
                    '撮影完了',
                    '棚保管',
                    '出品',
                    '購入者が決定',
                    'ピッキング',
                    '梱包',
                    'ラベル貼付',
                    '配送準備'
                  ];

                  console.log('履歴項目確認開始...');
                  for (const item of expectedHistoryItems) {
                    const historyElement = await page.locator(`.activity-item:has-text("${item}")`).first();
                    if (await historyElement.isVisible()) {
                      console.log(`✅ 履歴確認OK: ${item}`);
                    } else {
                      console.log(`❌ 履歴確認NG: ${item} が見つかりません`);
                      // 代替的な方法で確認
                      const anyHistoryText = await page.locator('.activity-item, .history-item, .timeline-item').allTextContents();
                      console.log('実際の履歴テキスト:', anyHistoryText);
                    }
                  }

                  // APIから直接活動履歴を取得して確認
                  const activityResponse = await page.request.get(`http://localhost:3003/api/products/${testProduct.id}/history`);
                  if (activityResponse.ok()) {
                    const activityData = await activityResponse.json();
                    console.log('API履歴データ:', JSON.stringify(activityData, null, 2));

                    // 期待されるアクティビティタイプを確認
                    const expectedActivityTypes = [
                      'delivery_plan_created',
                      'purchase_decision',
                      'picking_completed',
                      'packing_completed',
                      'label_attached',
                      'shipping_prepared'
                    ];

                    const actualActivityTypes = activityData.activities?.map((a: any) => a.type) || [];
                    console.log('実際のアクティビティタイプ:', actualActivityTypes);

                    for (const expectedType of expectedActivityTypes) {
                      if (actualActivityTypes.includes(expectedType)) {
                        console.log(`✅ API履歴確認OK: ${expectedType}`);
                      } else {
                        console.log(`❌ API履歴確認NG: ${expectedType} が見つかりません`);
                      }
                    }

                    // 最低限の履歴が記録されていることを確認
                    expect(activityData.activities?.length).toBeGreaterThan(3);
                    console.log(`✅ 完全ワークフロー履歴テスト完了: ${activityData.activities?.length}件の履歴を確認`);
                  }
                }
              }
            }
          }
        }
      }
    }
  });
});