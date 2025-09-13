import { test, expect } from '@playwright/test';

/**
 * 同梱機能の現状確認テスト（認証なし）
 * 直接画面を確認してUI状態を検証
 */
test.describe('同梱機能現状確認', () => {

  test('販売管理画面の同梱機能状態確認', async ({ page }) => {
    console.log('🔍 販売管理画面の同梱機能状態を確認中...');

    // 販売管理画面に直接アクセス（認証スキップ）
    await page.goto('http://localhost:3002/sales');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    console.log('📸 販売管理画面の初期状態キャプチャ');
    await page.screenshot({
      path: 'bundle-status-sales-page.png',
      fullPage: true
    });

    // 同梱関連のボタンやUI要素を探す
    const bundleButtons = page.locator('button:has-text("同梱"), button:has-text("まとめて"), *:has-text("Bundle")');
    const bundleCount = await bundleButtons.count();
    console.log(`🔗 同梱関連ボタン数: ${bundleCount}`);

    // 購入者決定ステータスの商品を探す
    const soldItems = page.locator('*:has-text("購入者決定"), .bg-red-600, [data-status="sold"]');
    const soldCount = await soldItems.count();
    console.log(`💰 購入者決定商品数: ${soldCount}`);

    // ページ内容の詳細分析
    const pageText = await page.textContent('body');
    const hasBundleFeatures = pageText?.includes('同梱') || pageText?.includes('まとめて') || pageText?.includes('Bundle');
    console.log(`📋 同梱機能の存在: ${hasBundleFeatures ? 'Yes' : 'No'}`);

    if (hasBundleFeatures) {
      console.log('✅ 販売管理画面に同梱機能が実装されています');
    } else {
      console.log('⚠️ 販売管理画面で同梱機能が見つかりません');
    }
  });

  test('ロケーション管理画面の同梱表示確認', async ({ page }) => {
    console.log('🔍 ロケーション管理画面の同梱表示を確認中...');

    // ロケーション管理画面に直接アクセス
    await page.goto('http://localhost:3002/staff/location');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    console.log('📸 ロケーション管理画面の初期状態キャプチャ');
    await page.screenshot({
      path: 'bundle-status-location-page.png',
      fullPage: true
    });

    // 青い背景の同梱商品を探す
    const blueBackgrounds = page.locator('.bg-blue-50, .bg-blue-100, .border-l-blue-500, [style*="blue"]');
    const blueCount = await blueBackgrounds.count();
    console.log(`🔵 青い背景要素数: ${blueCount}`);

    // 同梱情報の表示を確認
    const bundleInfo = page.locator('*:has-text("同梱"), *:has-text("Bundle"), *:has-text("まとめて")');
    const bundleInfoCount = await bundleInfo.count();
    console.log(`📦 同梱情報表示数: ${bundleInfoCount}`);

    if (blueCount > 0) {
      console.log('✅ ロケーション管理画面で青い背景の同梱表示が実装されています');

      // 各青い背景要素の詳細確認
      for (let i = 0; i < Math.min(blueCount, 3); i++) {
        const element = blueBackgrounds.nth(i);
        const text = await element.textContent();
        console.log(`🔵 青い背景要素 ${i + 1}: ${text?.slice(0, 100)}`);
      }
    } else {
      console.log('⚠️ ロケーション管理画面で青い背景の同梱表示が見つかりません');
    }
  });

  test('出荷管理画面の同梱表示確認', async ({ page }) => {
    console.log('🔍 出荷管理画面の同梱表示を確認中...');

    // 出荷管理画面に直接アクセス
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    console.log('📸 出荷管理画面の初期状態キャプチャ');
    await page.screenshot({
      path: 'bundle-status-shipping-page.png',
      fullPage: true
    });

    // タブがあるかチェック
    const tabs = page.locator('button:has-text("梱包待ち"), button:has-text("梱包済み")');
    const tabCount = await tabs.count();
    console.log(`📋 出荷管理タブ数: ${tabCount}`);

    if (tabCount > 0) {
      // 梱包待ちタブをクリック
      const workstationTab = page.locator('button:has-text("梱包待ち")').first();
      if (await workstationTab.count() > 0) {
        await workstationTab.click();
        await page.waitForTimeout(2000);

        console.log('📸 梱包待ちタブ表示状態');
        await page.screenshot({
          path: 'bundle-status-shipping-workstation.png',
          fullPage: true
        });
      }

      // 青い背景の同梱商品を探す
      const bundleItems = page.locator('.bg-blue-50, .border-l-blue-500, [style*="blue"]');
      const bundleCount = await bundleItems.count();
      console.log(`🔵 出荷管理の同梱商品数: ${bundleCount}`);

      // 梱包済みタブをクリック
      const packedTab = page.locator('button:has-text("梱包済み")').first();
      if (await packedTab.count() > 0) {
        await packedTab.click();
        await page.waitForTimeout(2000);

        console.log('📸 梱包済みタブ表示状態');
        await page.screenshot({
          path: 'bundle-status-shipping-packed.png',
          fullPage: true
        });

        // ラベルダウンロード機能を確認
        const labelButtons = page.locator('button:has-text("ラベル"), a[href*=".pdf"]');
        const labelCount = await labelButtons.count();
        console.log(`📄 ラベルボタン数: ${labelCount}`);

        if (labelCount > 0) {
          console.log('✅ 出荷管理画面でラベルダウンロード機能が実装されています');
        }
      }
    }
  });

  test('同梱機能の総合状態レポート', async ({ page }) => {
    console.log('📊 同梱機能の総合状態レポートを生成中...');

    // レポート用のHTMLページを作成
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>同梱機能現状レポート</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; }
          .section { background: #f8fafc; margin: 20px 0; padding: 20px; border-radius: 8px; }
          .status-ok { color: #16a34a; font-weight: bold; }
          .status-warning { color: #f59e0b; font-weight: bold; }
          .status-error { color: #dc2626; font-weight: bold; }
          .feature-box { border: 2px solid #e5e7eb; margin: 10px 0; padding: 15px; border-radius: 6px; }
          .blue-demo { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 8px solid #2563eb; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎯 同梱機能現状レポート</h1>
          <p>生成日時: ${new Date().toLocaleString()}</p>
        </div>

        <div class="section">
          <h2>📋 検証項目と現状</h2>

          <div class="feature-box">
            <h3>(1) 販売管理：購入者決定で同梱設定できる</h3>
            <div class="status-warning">⚠️ 要確認</div>
            <p>同梱設定ボタンやモーダルの存在を確認する必要があります。</p>
          </div>

          <div class="feature-box">
            <h3>(2) 販売管理：同梱ラベル生成できる</h3>
            <div class="status-warning">⚠️ 要確認</div>
            <p>ラベル生成機能とPDFダウンロードを確認する必要があります。</p>
          </div>

          <div class="feature-box blue-demo">
            <h3>(3) ロケーション管理：同梱用の青い背景で商品がリストされる</h3>
            <div class="status-ok">✅ この背景色で表示される予定</div>
            <p>青い背景 (bg-blue-50, border-l-blue-500) での同梱商品表示機能</p>
          </div>

          <div class="feature-box">
            <h3>(4) ロケーション管理：同梱商品をピッキングできる</h3>
            <div class="status-warning">⚠️ 要確認</div>
            <p>青い背景の商品をピッキング処理できるかを確認する必要があります。</p>
          </div>

          <div class="feature-box blue-demo">
            <h3>(5) 出荷管理（梱包待ち）：同梱商品が青い背景でリストされる</h3>
            <div class="status-ok">✅ この背景色で表示される予定</div>
            <p>出荷管理画面でも同様の青い背景での表示機能</p>
          </div>

          <div class="feature-box">
            <h3>(6) 出荷管理（梱包済み）：ラベルがダウンロードできる</h3>
            <div class="status-warning">⚠️ 要確認</div>
            <p>梱包済み商品のラベルPDFダウンロード機能を確認する必要があります。</p>
          </div>
        </div>

        <div class="section">
          <h2>🎨 UI/UX重要ポイント</h2>
          <ul>
            <li><strong>青い背景表示:</strong> 同梱商品は視覚的に区別できる青い背景で表示</li>
            <li><strong>操作の一貫性:</strong> 全画面で統一された同梱商品の操作方法</li>
            <li><strong>ラベル管理:</strong> 同梱商品のラベル生成・ダウンロード機能</li>
            <li><strong>フロー連携:</strong> 販売→ロケーション→出荷の各段階での同梱情報引き継ぎ</li>
          </ul>
        </div>

        <div class="section">
          <h2>⚠️ 検証で注意すべき点</h2>
          <div class="status-error">
            <p><strong>現在の実装は完璧であるため、修正は極めて慎重に行う必要があります。</strong></p>
          </div>
          <ul>
            <li>単品の動作は完璧に動作している</li>
            <li>他の実装も完璧に動作している</li>
            <li>修正前に必ず修正箇所・方法・他への影響を調査</li>
            <li>承認を得てから修正実施</li>
          </ul>
        </div>
      </body>
      </html>
    `);

    await page.waitForTimeout(2000);

    console.log('📸 同梱機能現状レポート生成');
    await page.screenshot({
      path: 'bundle-comprehensive-status-report.png',
      fullPage: true
    });

    console.log('📊 同梱機能の総合状態レポート生成完了');
  });
});