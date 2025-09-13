import { test, expect } from '@playwright/test';

test.describe('タブバッジの細部デザイン統一性テスト', () => {

  test('数字の枠の形状とスタイリング詳細比較', async ({ page }) => {
    // 検品管理画面
    await page.goto('http://localhost:3002/staff/inspection');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    console.log('🔍 検品管理のタブバッジ詳細チェック');
    
    const inspectionTabs = await page.locator('nav[aria-label="Tabs"] button').all();
    const inspectionBadgeDetails = [];
    
    for (let i = 0; i < inspectionTabs.length; i++) {
      const tab = inspectionTabs[i];
      const badge = tab.locator('span').last();
      const badgeClass = await badge.getAttribute('class');
      const computedStyle = await badge.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          borderRadius: styles.borderRadius,
          paddingX: styles.paddingLeft,
          paddingY: styles.paddingTop,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          textTransform: styles.textTransform,
          letterSpacing: styles.letterSpacing,
          boxShadow: styles.boxShadow,
          transition: styles.transition
        };
      });
      
      inspectionBadgeDetails.push({
        index: i,
        classes: badgeClass,
        computed: computedStyle
      });
      
      console.log(`検品タブ${i}: ${badgeClass}`);
      console.log(`  border-radius: ${computedStyle.borderRadius}`);
      console.log(`  padding: ${computedStyle.paddingX} ${computedStyle.paddingY}`);
      console.log(`  font-weight: ${computedStyle.fontWeight}`);
      console.log(`  box-shadow: ${computedStyle.boxShadow}`);
      
      // 期待されるクラスの確認
      expect(badgeClass).toContain('rounded-lg'); // 四角っぽい形状
      expect(badgeClass).toContain('py-1'); // 統一されたパディング
      expect(badgeClass).toContain('font-black'); // 太字
      expect(badgeClass).toContain('font-display'); // ディスプレイフォント
      expect(badgeClass).toContain('uppercase'); // 大文字
      expect(badgeClass).toContain('tracking-wider'); // 文字間隔
      expect(badgeClass).toContain('shadow-md'); // シャドウ
      expect(badgeClass).toContain('hover:shadow-lg'); // ホバーシャドウ
      expect(badgeClass).toContain('hover:scale-105'); // ホバースケール
      expect(badgeClass).toContain('transition-all'); // トランジション
      expect(badgeClass).toContain('duration-300'); // アニメーション時間
    }
    
    // 出荷管理画面
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    console.log('🔍 出荷管理のタブバッジ詳細チェック');
    
    const shippingTabs = await page.locator('nav[aria-label="Tabs"] button').all();
    const shippingBadgeDetails = [];
    
    for (let i = 0; i < shippingTabs.length; i++) {
      const tab = shippingTabs[i];
      const badge = tab.locator('span').last();
      const badgeClass = await badge.getAttribute('class');
      const computedStyle = await badge.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          borderRadius: styles.borderRadius,
          paddingX: styles.paddingLeft,
          paddingY: styles.paddingTop,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          textTransform: styles.textTransform,
          letterSpacing: styles.letterSpacing,
          boxShadow: styles.boxShadow,
          transition: styles.transition
        };
      });
      
      shippingBadgeDetails.push({
        index: i,
        classes: badgeClass,
        computed: computedStyle
      });
      
      console.log(`出荷タブ${i}: ${badgeClass}`);
      console.log(`  border-radius: ${computedStyle.borderRadius}`);
      console.log(`  padding: ${computedStyle.paddingX} ${computedStyle.paddingY}`);
      console.log(`  font-weight: ${computedStyle.fontWeight}`);
      console.log(`  box-shadow: ${computedStyle.boxShadow}`);
    }
    
    // 両画面のバッジが同じスタイル要素を持つことを確認
    const commonStyleElements = [
      'rounded-lg',
      'py-1',
      'font-black',
      'font-display', 
      'uppercase',
      'tracking-wider',
      'shadow-md',
      'hover:shadow-lg',
      'hover:scale-105',
      'transition-all',
      'duration-300'
    ];
    
    // 検品管理の全タブが期待されるスタイルを持つ
    for (const detail of inspectionBadgeDetails) {
      for (const styleElement of commonStyleElements) {
        expect(detail.classes).toContain(styleElement);
      }
    }
    
    // 出荷管理の全タブが期待されるスタイルを持つ
    for (const detail of shippingBadgeDetails) {
      for (const styleElement of commonStyleElements) {
        expect(detail.classes).toContain(styleElement);
      }
    }
  });

  test('ホバー効果とアニメーション詳細確認', async ({ page }) => {
    // 検品管理画面でホバー効果テスト
    await page.goto('http://localhost:3002/staff/inspection');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    const inspectionFirstTab = page.locator('nav[aria-label="Tabs"] button').first();
    const inspectionBadge = inspectionFirstTab.locator('span').last();
    
    // ホバー前のスタイル確認
    const beforeHover = await inspectionBadge.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        transform: styles.transform,
        boxShadow: styles.boxShadow
      };
    });
    
    // ホバー実行
    await inspectionBadge.hover();
    await page.waitForTimeout(500); // アニメーション完了待機
    
    const afterHover = await inspectionBadge.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        transform: styles.transform,
        boxShadow: styles.boxShadow
      };
    });
    
    console.log('検品管理ホバー前:', beforeHover);
    console.log('検品管理ホバー後:', afterHover);
    
    // スケール効果の確認（hover:scale-105）
    expect(afterHover.transform).not.toBe(beforeHover.transform);
    
    // 出荷管理でも同様のホバー効果確認
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    const shippingFirstTab = page.locator('nav[aria-label="Tabs"] button').first();
    const shippingBadge = shippingFirstTab.locator('span').last();
    
    await shippingBadge.hover();
    await page.waitForTimeout(500);
    
    const shippingAfterHover = await shippingBadge.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        transform: styles.transform,
        boxShadow: styles.boxShadow
      };
    });
    
    console.log('出荷管理ホバー後:', shippingAfterHover);
    
    // 同様のホバー効果があることを確認
    expect(shippingAfterHover.transform).toContain('scale');
  });

  test('フォントとタイポグラフィの統一性', async ({ page }) => {
    // 検品管理のフォント確認
    await page.goto('http://localhost:3002/staff/inspection');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    const inspectionBadge = page.locator('nav[aria-label="Tabs"] button').first().locator('span').last();
    const inspectionTypo = await inspectionBadge.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        fontFamily: styles.fontFamily,
        fontWeight: styles.fontWeight,
        fontSize: styles.fontSize,
        textTransform: styles.textTransform,
        letterSpacing: styles.letterSpacing,
        lineHeight: styles.lineHeight
      };
    });
    
    // 出荷管理のフォント確認
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    const shippingBadge = page.locator('nav[aria-label="Tabs"] button').first().locator('span').last();
    const shippingTypo = await shippingBadge.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        fontFamily: styles.fontFamily,
        fontWeight: styles.fontWeight,
        fontSize: styles.fontSize,
        textTransform: styles.textTransform,
        letterSpacing: styles.letterSpacing,
        lineHeight: styles.lineHeight
      };
    });
    
    console.log('検品管理フォント:', inspectionTypo);
    console.log('出荷管理フォント:', shippingTypo);
    
    // フォント設定の統一性確認
    expect(inspectionTypo.fontWeight).toBe(shippingTypo.fontWeight); // font-black
    expect(inspectionTypo.fontSize).toBe(shippingTypo.fontSize); // text-xs
    expect(inspectionTypo.textTransform).toBe(shippingTypo.textTransform); // uppercase
    expect(inspectionTypo.letterSpacing).toBe(shippingTypo.letterSpacing); // tracking-wider
  });

  test('色とシャドウの詳細比較', async ({ page }) => {
    // 検品管理の色確認
    await page.goto('http://localhost:3002/staff/inspection');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    const inspectionTabs = await page.locator('nav[aria-label="Tabs"] button').all();
    
    for (let i = 0; i < Math.min(inspectionTabs.length, 3); i++) {
      const badge = inspectionTabs[i].locator('span').last();
      const styles = await badge.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          borderColor: computed.borderColor,
          boxShadow: computed.boxShadow
        };
      });
      
      console.log(`検品タブ${i}の色:`, styles);
      
      // シャドウが適用されていることを確認
      expect(styles.boxShadow).not.toBe('none');
    }
    
    // 出荷管理でも同様の確認
    await page.goto('http://localhost:3002/staff/shipping');
    await page.waitForSelector('nav[aria-label="Tabs"] button');
    
    const shippingTabs = await page.locator('nav[aria-label="Tabs"] button').all();
    
    for (let i = 0; i < Math.min(shippingTabs.length, 3); i++) {
      const badge = shippingTabs[i].locator('span').last();
      const styles = await badge.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          borderColor: computed.borderColor,
          boxShadow: computed.boxShadow
        };
      });
      
      console.log(`出荷タブ${i}の色:`, styles);
      
      // シャドウが適用されていることを確認
      expect(styles.boxShadow).not.toBe('none');
    }
  });

});
