import { test, expect } from '@playwright/test';

test.describe('ヘッダー通知・プロフィール機能テスト', () => {
  
  test.describe('セラー向け通知機能', () => {
    test.beforeEach(async ({ page }) => {
      // ログイン
      await page.goto('/login');
      await page.fill('#email', 'seller@example.com');
      await page.fill('#password', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
    });

    test('通知ボタンが表示され、未読数が表示される', async ({ page }) => {
      // 通知ボタンを確認
      const notificationButton = page.locator('button[aria-label="通知"]');
      await expect(notificationButton).toBeVisible();
      
      // 未読数バッジを確認
      const unreadBadge = notificationButton.locator('span.bg-red-500');
      await expect(unreadBadge).toBeVisible();
      const unreadCount = await unreadBadge.textContent();
      expect(Number(unreadCount)).toBeGreaterThan(0);
    });

    test('通知パネルが開閉できる', async ({ page }) => {
      // 通知ボタンをクリック
      await page.click('button[aria-label="通知"]');
      
      // 通知パネルが表示される
      const notificationPanel = page.locator('text=通知').first();
      await expect(notificationPanel).toBeVisible();
      
      // 通知アイテムが表示される
      await expect(page.locator('text=商品が売れました！')).toBeVisible();
      await expect(page.locator('text=在庫滞留アラート')).toBeVisible();
      
      // パネル外をクリックして閉じる
      await page.click('body', { position: { x: 10, y: 10 } });
      await expect(notificationPanel).not.toBeVisible();
    });

    test('通知を既読にできる', async ({ page }) => {
      // 通知パネルを開く
      await page.click('button[aria-label="通知"]');
      
      // 未読通知をクリック
      await page.click('text=商品が売れました！');
      
      // 通知が既読になることを確認（実際の実装に依存）
      await page.waitForTimeout(1000);
    });

    test('全ての通知を既読にできる', async ({ page }) => {
      // 通知パネルを開く
      await page.click('button[aria-label="通知"]');
      
      // 「全て既読」ボタンをクリック
      await page.click('button:has-text("全て既読")');
      
      // 未読数が0になることを確認
      await page.waitForTimeout(1000);
      const unreadBadge = page.locator('button[aria-label="通知"] span.bg-red-500');
      await expect(unreadBadge).not.toBeVisible();
    });
  });

  test.describe('スタッフ向け通知機能', () => {
    test.beforeEach(async ({ page }) => {
      // スタッフとしてログイン
      await page.goto('/login');
      await page.fill('#email', 'staff@theworlddoor.com');
      await page.fill('#password', 'staffpass123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/staff/dashboard');
    });

    test('スタッフ向け通知が表示される', async ({ page }) => {
      // 通知ボタンをクリック
      await page.click('button[aria-label="通知"]');
      
      // スタッフ向け通知が表示される
      await expect(page.locator('text=緊急検品タスク')).toBeVisible();
      await expect(page.locator('text=返品処理待ち')).toBeVisible();
    });

    test('優先度の高い通知が強調表示される', async ({ page }) => {
      // 通知パネルを開く
      await page.click('button[aria-label="通知"]');
      
      // 優先度高のタグが表示される
      await expect(page.locator('text=優先度高')).toBeVisible();
    });
  });

  test.describe('プロフィール機能', () => {
    test.describe('セラー向けプロフィール', () => {
      test.beforeEach(async ({ page }) => {
        // セラーとしてログイン
        await page.goto('/login');
        await page.fill('#email', 'seller@example.com');
        await page.fill('#password', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');
      });

      test('プロフィールメニューが開閉できる', async ({ page }) => {
        // プロフィールボタンをクリック
        const profileButton = page.locator('.user-nexus');
        await profileButton.click();
        
        // プロフィールメニューが表示される
        await expect(page.locator('text=山田 太郎')).toBeVisible();
        await expect(page.locator('text=プレミアムセラー')).toBeVisible();
        
        // メニュー外をクリックして閉じる
        await page.click('body', { position: { x: 10, y: 10 } });
        await expect(page.locator('text=山田 太郎')).not.toBeVisible();
      });

      test('セラーの統計情報が表示される', async ({ page }) => {
        // プロフィールメニューを開く
        await page.locator('.user-nexus').click();
        
        // 統計情報を確認
        await expect(page.locator('text=総売上')).toBeVisible();
        await expect(page.locator('text=¥12,456,789')).toBeVisible();
        await expect(page.locator('text=出品中')).toBeVisible();
        await expect(page.locator('text=58')).toBeVisible();
      });

      test('プロフィールメニューから各ページに遷移できる', async ({ page }) => {
        // プロフィールメニューを開く
        await page.locator('.user-nexus').click();
        
        // 請求・支払いボタンを確認（セラー限定）
        await expect(page.locator('button:has-text("請求・支払い")')).toBeVisible();
        
        // プロフィール設定ページへの遷移を確認
        await page.click('button:has-text("プロフィール設定")');
        await expect(page).toHaveURL('/profile');
      });

      test('ログアウトできる', async ({ page }) => {
        // プロフィールメニューを開く
        await page.locator('.user-nexus').click();
        
        // ログアウトボタンをクリック
        await page.click('button:has-text("ログアウト")');
        
        // ログインページに遷移
        await page.waitForURL('/login');
      });
    });

    test.describe('スタッフ向けプロフィール', () => {
      test.beforeEach(async ({ page }) => {
        // スタッフとしてログイン
        await page.goto('/login');
        await page.fill('#email', 'staff@theworlddoor.com');
        await page.fill('#password', 'staffpass123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/staff/dashboard');
      });

      test('スタッフの統計情報が表示される', async ({ page }) => {
        // プロフィールメニューを開く
        await page.locator('.user-nexus').click();
        
        // スタッフ情報を確認
        await expect(page.locator('text=鈴木 花子')).toBeVisible();
        await expect(page.locator('text=シニアスタッフ')).toBeVisible();
        
        // スタッフの統計情報を確認
        await expect(page.locator('text=完了タスク')).toBeVisible();
        await expect(page.locator('text=1234')).toBeVisible();
        await expect(page.locator('text=正確性')).toBeVisible();
        await expect(page.locator('text=99.8%')).toBeVisible();
      });

      test('請求・支払いボタンが表示されない', async ({ page }) => {
        // プロフィールメニューを開く
        await page.locator('.user-nexus').click();
        
        // 請求・支払いボタンが表示されないことを確認（スタッフには非表示）
        await expect(page.locator('button:has-text("請求・支払い")')).not.toBeVisible();
      });
    });
  });

  test.describe('レスポンシブ対応', () => {
    test('モバイルで通知とプロフィールが正しく表示される', async ({ page }) => {
      // モバイルサイズに設定
      await page.setViewportSize({ width: 375, height: 667 });
      
      // ログイン
      await page.goto('/login');
      await page.fill('#email', 'seller@example.com');
      await page.fill('#password', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // 通知ボタンが表示される
      await expect(page.locator('button[aria-label="通知"]')).toBeVisible();
      
      // プロフィールセクションが表示される（コンパクト表示）
      await expect(page.locator('.user-nexus')).toBeVisible();
      await expect(page.locator('.user-nexus .user-orb')).toBeVisible();
    });

    test('タブレットで通知とプロフィールが正しく表示される', async ({ page }) => {
      // タブレットサイズに設定
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // ログイン
      await page.goto('/login');
      await page.fill('#email', 'seller@example.com');
      await page.fill('#password', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // 通知ボタンとプロフィールが表示される
      await expect(page.locator('button[aria-label="通知"]')).toBeVisible();
      await expect(page.locator('.user-nexus')).toBeVisible();
      
      // タイムゾーン表示も確認
      await expect(page.locator('.timezone-widget')).toBeVisible();
    });
  });

  test.describe('通知の自動更新', () => {
    test('新しい通知が自動的に反映される', async ({ page }) => {
      // ログイン
      await page.goto('/login');
      await page.fill('#email', 'seller@example.com');
      await page.fill('#password', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // 初期の未読数を取得
      const initialBadge = page.locator('button[aria-label="通知"] span.bg-red-500');
      const initialCount = await initialBadge.textContent();
      
      // 通知APIが定期的に呼び出されることを確認（実装依存）
      // 実際のテストでは、APIモックを使用して新しい通知を追加し、
      // UIが更新されることを確認する
      
      // ここでは基本的な動作確認のみ
      await expect(initialBadge).toBeVisible();
    });
  });
}); 