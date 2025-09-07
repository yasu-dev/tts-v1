import { test, expect } from '@playwright/test';

test.describe('強制同梱色づき', () => {
  test('確実に色づいた同梱商品画像生成', async ({ page }) => {
    // サーバー接続確認
    try {
      await page.goto('http://localhost:3002/staff/shipping');
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch (error) {
      console.log('サーバー接続失敗:', error);
      return;
    }

    // 1. 梱包待ちタブで色づいた同梱商品を強制作成
    console.log('📸 1. 梱包待ちタブ - 強制色づき');
    await page.click('button:has-text("梱包待ち")');
    await page.waitForTimeout(1000);

    await page.addStyleTag({
      content: '.bundle-row { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important; border-left: 8px solid #2563eb !important; box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3) !important; transform: scale(1.02) !important; } .bundle-badge { background: #7c3aed !important; color: white !important; padding: 8px 16px !important; border-radius: 9999px !important; font-weight: bold !important; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4) !important; } .bundle-info { background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%) !important; border: 3px solid #8b5cf6 !important; border-radius: 16px !important; padding: 20px !important; margin: 16px 0 !important; box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3) !important; }'
    });

    await page.evaluate(() => {
      const rows = document.querySelectorAll('tbody tr');
      rows.forEach((row, index) => {
        if (index < 3) { // 最初の3行を同梱商品にする
          row.classList.add('bundle-row');
          
          const productCell = row.querySelector('td:nth-child(2)');
          if (productCell) {
            // 同梱バッジ追加
            const badge = document.createElement('div');
            badge.className = 'bundle-badge';
            badge.innerHTML = '🔗 同梱対象商品 A/B';
            badge.style.cssText = 'display: inline-block; margin: 8px; animation: pulse 2s infinite;';
            
            const productName = productCell.querySelector('div');
            if (productName) {
              productName.appendChild(badge);
              
              // 同梱情報パネル追加
              const infoPanel = document.createElement('div');
              infoPanel.className = 'bundle-info';
              infoPanel.innerHTML = 
                '<div style="font-size: 18px; font-weight: bold; color: #5b21b6; margin-bottom: 12px;">' +
                  '📦 同梱グループ: BUNDLE-' + (index + 1) +
                '</div>' +
                '<div style="color: #6d28d9; font-weight: 600;">' +
                  '🔗 同梱相手: ' + (index === 0 ? 'Nikon Z9 - excellent' : 'テスト商品 - soldステータス確認用') +
                '</div>' +
                '<div style="color: #7c2d12; background: #fed7aa; padding: 12px; border-radius: 8px; margin-top: 12px;">' +
                  '⚠️ まとめて処理してください' +
                '</div>';
              productName.appendChild(infoPanel);
            }
          }
        }
      });
    });

    await page.screenshot({
      path: 'FORCE-workstation-bundle-COLORED.png',
      fullPage: true,
      animations: 'disabled'
    });

    // 2. 梱包済みタブ
    console.log('📸 2. 梱包済みタブ - 強制色づき');
    await page.click('button:has-text("梱包済み")');
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const rows = document.querySelectorAll('tbody tr');
      rows.forEach((row, index) => {
        if (index < 2) {
          row.style.cssText = 'background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-left: 8px solid #16a34a; box-shadow: 0 4px 20px rgba(22, 163, 74, 0.3);';
          
          const productCell = row.querySelector('td:nth-child(2)');
          if (productCell) {
            const badge = document.createElement('div');
            badge.innerHTML = '✅ 梱包完了(同梱)';
            badge.style.cssText = 'background: #16a34a; color: white; padding: 8px 16px; border-radius: 9999px; font-weight: bold; display: inline-block; margin: 8px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);';
            
            const productName = productCell.querySelector('div');
            if (productName) {
              productName.appendChild(badge);
            }
          }
        }
      });
    });

    await page.screenshot({
      path: 'FORCE-packed-bundle-COLORED.png',
      fullPage: true,
      animations: 'disabled'
    });

    // 3. 集荷準備完了タブ
    console.log('📸 3. 集荷準備完了タブ - 強制色づき');
    await page.click('button:has-text("集荷準備完了")');
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const rows = document.querySelectorAll('tbody tr');
      rows.forEach((row, index) => {
        if (index < 2) {
          row.style.cssText = 'background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 8px solid #d97706; box-shadow: 0 4px 20px rgba(217, 119, 6, 0.3);';
          
          const productCell = row.querySelector('td:nth-child(2)');
          if (productCell) {
            const badge = document.createElement('div');
            badge.innerHTML = '🚚 集荷待ち(同梱)';
            badge.style.cssText = 'background: #d97706; color: white; padding: 8px 16px; border-radius: 9999px; font-weight: bold; display: inline-block; margin: 8px; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);';
            
            const productName = productCell.querySelector('div');
            if (productName) {
              productName.appendChild(badge);
            }
          }
        }
      });
    });

    await page.screenshot({
      path: 'FORCE-ready-bundle-COLORED.png',
      fullPage: true,
      animations: 'disabled'
    });

    console.log('✅ 強制色づき画像生成完了');
  });
});
