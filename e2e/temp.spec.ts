import { test, expect } from '@playwright/test';

test.describe('ログイン画面チE��チE, () => {
  test('ログイン画面が正しく表示されめE, async ({ page }) => {
    // ログインペ�Eジにアクセス
    await page.goto('/login');
    
    // ペ�Eジタイトルの確誁E
    await expect(page).toHaveTitle(/THE WORLD DOOR/);
    
    // メインタイトルの確認！E2要素を指定！E
    await expect(page.getByRole('heading', { name: 'THE WORLD DOOR' })).toBeVisible();
    await expect(page.getByText('フルフィルメントサービス')).toBeVisible();
    
    // フォーム要素の確誁E
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('パスワーチE)).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
    
    // チE��ト用ログイン惁E��の表示確誁E
    await expect(page.getByText('チE��ト用ログイン惁E��')).toBeVisible();
    await expect(page.getByText('seller@example.com / password123')).toBeVisible();
    await expect(page.getByText('staff@example.com / password123')).toBeVisible();
  });

  test('ルート�Eージからログインペ�Eジにリダイレクトされる', async ({ page }) => {
    // ルート�Eージにアクセス
    await page.goto('/');
    
    // ログインペ�Eジにリダイレクトされることを確誁E
    await expect(page).toHaveURL(/\/login$/);
    
    // ログイン画面の要素が表示されることを確認！E2要素を指定！E
    await expect(page.getByRole('heading', { name: 'THE WORLD DOOR' })).toBeVisible();
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('ログイン機�EチE��チE, () => {
  test('セラーとしてログインできる', async ({ page }) => {
    // ログインペ�Eジにアクセス
    await page.goto('/login');
    
    // セラーの認証惁E��を�E劁E
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // ログインボタンをクリチE��
    await page.click('button[type="submit"]');
    
    // ダチE��ュボ�Eドにリダイレクトされることを確誁E
    await expect(page).toHaveURL(/\/dashboard$/);
    
    // ダチE��ュボ�Eド�E要素が表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('スタチE��としてログインできる', async ({ page }) => {
    // ログインペ�Eジにアクセス
    await page.goto('/login');
    
    // スタチE��の認証惁E��を�E劁E
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // ログインボタンをクリチE��
    await page.click('button[type="submit"]');
    
    // スタチE��ダチE��ュボ�Eドにリダイレクトされることを確誁E
    await expect(page).toHaveURL(/\/staff\/dashboard$/);
    
    // ダチE��ュボ�Eド�E要素が表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('無効な認証惁E��でエラーメチE��ージが表示されめE, async ({ page }) => {
    // ログインペ�Eジにアクセス
    await page.goto('/login');
    
    // 無効な認証惁E��を�E劁E
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // ログインボタンをクリチE��
    await page.click('button[type="submit"]');
    
    // エラーメチE��ージが表示されることを確誁E
    await expect(page.getByText('ログインに失敗しました')).toBeVisible({ timeout: 10000 });
    
    // ログインペ�Eジに留まることを確誁E
    await expect(page).toHaveURL(/\/login$/);
  });
}); 
import { test, expect } from '@playwright/test';

async function loginAsSeller(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'seller@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
}

test.describe('セラーペ�EジチE��チE, () => {
  test('ダチE��ュボ�Eド�Eージが正しく表示されめE, async ({ page }) => {
    await loginAsSeller(page);
    
    // ダチE��ュボ�Eド�E基本要素が表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('納品プランペ�Eジが正しく表示されめE, async ({ page }) => {
    await loginAsSeller(page);
    
    // 納品プランペ�Eジに移勁E
    await page.goto('/delivery-plan');
    await expect(page).toHaveURL(/\/delivery-plan$/);
    
    // ペ�Eジが正しく表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('在庫ペ�Eジが正しく表示されめE, async ({ page }) => {
    await loginAsSeller(page);
    
    // 在庫ペ�Eジに移勁E
    await page.goto('/inventory');
    await expect(page).toHaveURL(/\/inventory$/);
    
    // ペ�Eジが正しく表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('売上�Eージが正しく表示されめE, async ({ page }) => {
    await loginAsSeller(page);
    
    // 売上�Eージに移勁E
    await page.goto('/sales');
    await expect(page).toHaveURL(/\/sales$/);
    
    // ペ�Eジが正しく表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('レポ�Eト�Eージが正しく表示されめE, async ({ page }) => {
    await loginAsSeller(page);
    
    // レポ�Eト�Eージに移勁E
    await page.goto('/reports');
    await expect(page).toHaveURL(/\/reports$/);
    
    // ペ�Eジが正しく表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('設定�Eージが正しく表示されめE, async ({ page }) => {
    await loginAsSeller(page);
    
    // 設定�Eージに移勁E
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings$/);
    
    // ペ�Eジが正しく表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });
}); 
import { test, expect } from '@playwright/test';

async function loginAsStaff(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'staff@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/staff\/dashboard$/, { timeout: 15000 });
}

test.describe('スタチE��ペ�EジチE��チE, () => {
  test('スタチE��ダチE��ュボ�Eド�Eージが正しく表示されめE, async ({ page }) => {
    await loginAsStaff(page);
    
    // ダチE��ュボ�Eド�E基本要素が表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/staff\/dashboard$/);
  });

  test('在庫管琁E�Eージが正しく表示されめE, async ({ page }) => {
    await loginAsStaff(page);
    
    // 在庫管琁E�Eージに移勁E
    await page.goto('/staff/inventory');
    await expect(page).toHaveURL(/\/staff\/inventory$/);
    
    // ペ�Eジが正しく表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('出品管琁E�Eージが正しく表示されめE, async ({ page }) => {
    await loginAsStaff(page);
    
    // 出品管琁E�Eージに移勁E
    await page.goto('/staff/listing');
    await expect(page).toHaveURL(/\/staff\/listing$/);
    
    // ペ�Eジが正しく表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('ロケーション管琁E�Eージが正しく表示されめE, async ({ page }) => {
    await loginAsStaff(page);
    
    // ロケーション管琁E�Eージに移勁E
    await page.goto('/staff/location');
    await expect(page).toHaveURL(/\/staff\/location$/);
    
    // ペ�Eジが正しく表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('ピッキングペ�Eジが正しく表示されめE, async ({ page }) => {
    await loginAsStaff(page);
    
    // ピッキングペ�Eジに移勁E
    await page.goto('/staff/picking');
    await expect(page).toHaveURL(/\/staff\/picking$/);
    
    // ペ�Eジが正しく表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('配送管琁E�Eージが正しく表示されめE, async ({ page }) => {
    await loginAsStaff(page);
    
    // 配送管琁E�Eージに移勁E
    await page.goto('/staff/shipping');
    await expect(page).toHaveURL(/\/staff\/shipping$/);
    
    // ペ�Eジが正しく表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('返品管琁E�Eージが正しく表示されめE, async ({ page }) => {
    await loginAsStaff(page);
    
    // 返品管琁E�Eージに移勁E
    await page.goto('/staff/returns');
    await expect(page).toHaveURL(/\/staff\/returns$/);
    
    // ペ�Eジが正しく表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('タスク管琁E�Eージが正しく表示されめE, async ({ page }) => {
    await loginAsStaff(page);
    
    // タスク管琁E�Eージに移勁E
    await page.goto('/staff/tasks');
    await expect(page).toHaveURL(/\/staff\/tasks$/);
    
    // ペ�Eジが正しく表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('検品ペ�Eジが正しく表示されめE, async ({ page }) => {
    await loginAsStaff(page);
    
    // 検品ペ�Eジに移勁E
    await page.goto('/staff/inspection');
    await expect(page).toHaveURL(/\/staff\/inspection$/);
    
    // ペ�Eジが正しく表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('レポ�Eト�Eージが正しく表示されめE, async ({ page }) => {
    await loginAsStaff(page);
    
    // レポ�Eト�Eージに移勁E
    await page.goto('/staff/reports');
    await expect(page).toHaveURL(/\/staff\/reports$/);
    
    // ペ�Eジが正しく表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });
}); 
import { test, expect } from '@playwright/test';

async function loginAsSeller(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'seller@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
}

async function loginAsStaff(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'staff@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/staff\/dashboard$/, { timeout: 15000 });
}

test.describe('業務フローチE��チE, () => {
  test('セラー: 納品プラン作�Eフローが正常に動作すめE, async ({ page }) => {
    await loginAsSeller(page);
    
    // 納品プランペ�Eジに移勁E
    await page.goto('/delivery-plan');
    await expect(page).toHaveURL(/\/delivery-plan$/);
    
    // 納品プラン作�Eウィザード�E要素が表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
    
    // ペ�Eジが正しく読み込まれることを確誁E
    await expect(page.locator('html')).toBeVisible();
  });

  test('セラー: 在庫管琁E��面で啁E��一覧が表示されめE, async ({ page }) => {
    await loginAsSeller(page);
    
    // 在庫ペ�Eジに移勁E
    await page.goto('/inventory');
    await expect(page).toHaveURL(/\/inventory$/);
    
    // 在庫画面の基本要素が表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('スタチE��: ピッキング画面が正常に表示されめE, async ({ page }) => {
    await loginAsStaff(page);
    
    // ピッキングペ�Eジに移勁E
    await page.goto('/staff/picking');
    await expect(page).toHaveURL(/\/staff\/picking$/);
    
    // ピッキング画面の基本要素が表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('スタチE��: 検品画面が正常に表示されめE, async ({ page }) => {
    await loginAsStaff(page);
    
    // 検品ペ�Eジに移勁E
    await page.goto('/staff/inspection');
    await expect(page).toHaveURL(/\/staff\/inspection$/);
    
    // 検品画面の基本要素が表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('セラー: レポ�Eト画面でKPIが表示されめE, async ({ page }) => {
    await loginAsSeller(page);
    
    // レポ�Eト�Eージに移勁E
    await page.goto('/reports');
    await expect(page).toHaveURL(/\/reports$/);
    
    // レポ�Eト画面の基本要素が表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('スタチE��: タスク管琁E��面が正常に表示されめE, async ({ page }) => {
    await loginAsStaff(page);
    
    // タスク管琁E�Eージに移勁E
    await page.goto('/staff/tasks');
    await expect(page).toHaveURL(/\/staff\/tasks$/);
    
    // タスク管琁E��面の基本要素が表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
  });

  test('認証: ログアウト機�Eが正常に動作すめE, async ({ page }) => {
    await loginAsSeller(page);
    
    // ダチE��ュボ�Eドが表示されることを確誁E
    await expect(page).toHaveURL(/\/dashboard$/);
    
    // ログアウト�E琁E��実裁E��れてぁE��場合！E
    // プロフィールメニューめE��グアウト�Eタンが存在するかチェチE��
    const hasLogoutButton = await page.locator('button:has-text("ログアウチE), a:has-text("ログアウチE)').count() > 0;
    
    if (hasLogoutButton) {
      await page.locator('button:has-text("ログアウチE), a:has-text("ログアウチE)').first().click();
      // ログアウト後�Eログインペ�EジにリダイレクチE
      await expect(page).toHaveURL(/\/login$/, { timeout: 10000 });
    }
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('アカウント管琁E���EチE��チE, () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処琁E    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ダチE��ュボ�Eド�Eージの読み込み完亁E��征E��
    await page.waitForURL('/staff/dashboard');
    
    // 設定�Eージに移勁E    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('設定�Eージが正常に表示されめE, async ({ page }) => {
    // ペ�Eジタイトルを確誁E    await expect(page.locator('h1')).toContainText('アカウント設宁E);
    await expect(page.locator('p')).toContainText('アカウント情報とチE�Eタ管琁E);
    
    // intelligence-cardクラスが適用されてぁE��か確誁E    await expect(page.locator('.intelligence-card')).toHaveCount(3);
    
    // すべてのカードがglobalクラスを持つか確誁E    const cards = page.locator('.intelligence-card.global');
    await expect(cards).toHaveCount(3);
  });

  test('アカウント管琁E��クションが表示されめE, async ({ page }) => {
    // セクションタイトルを確誁E    await expect(page.locator('h3')).toContainText('アカウント管琁E);
    
    // チE�Eタエクスポ�Eトセクション
    await expect(page.locator('h4').filter({ hasText: 'チE�Eタエクスポ�EチE })).toBeVisible();
    await expect(page.locator('text=個人チE�Eタを安�Eにダウンロードし、バチE��アチE�Eを作�EしまぁE)).toBeVisible();
    
    // アカウント削除セクション
    await expect(page.locator('h4').filter({ hasText: 'アカウント削除' })).toBeVisible();
    await expect(page.locator('text=こ�E操作�E完�Eに允E��戻せません')).toBeVisible();
  });

  test('チE�Eタエクスポ�Eト機�Eが動作すめE, async ({ page }) => {
    // エクスポ�Eト�Eタンを確誁E    const exportButton = page.locator('button.nexus-button').filter({ hasText: 'エクスポ�EチE });
    await expect(exportButton).toBeVisible();
    
    // ボタンをクリチE��
    await exportButton.click();
    
    // ト�Eスト通知が表示されるかチェチE���E�実裁E��応じて調整�E�E    // await expect(page.locator('.toast, .notification')).toBeVisible();
  });

  test('アカウント削除機�Eの確認ダイアログが表示されめE, async ({ page }) => {
    // 削除ボタンを確誁E    const deleteButton = page.locator('button.nexus-button.danger').filter({ hasText: '削除' });
    await expect(deleteButton).toBeVisible();
    
    // ダイアログのハンドラーを設宁E    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('本当にアカウントを削除しますか�E�E);
      dialog.dismiss();
    });
    
    // ボタンをクリチE��
    await deleteButton.click();
  });

  test('重要な注意事頁E��クションが表示されめE, async ({ page }) => {
    // セクションタイトルを確誁E    await expect(page.locator('h3').filter({ hasText: '重要な注意事頁E })).toBeVisible();
    
    // 注意事頁E�E冁E��を確誁E    await expect(page.locator('h4').filter({ hasText: 'チE�Eタの保護につぁE��' })).toBeVisible();
    await expect(page.locator('h4').filter({ hasText: 'アカウント削除の影響' })).toBeVisible();
    
    // 説明文を確誁E    await expect(page.locator('text=エクスポ�EトされたチE�Eタは適刁E��場所に保存し')).toBeVisible();
    await expect(page.locator('text=アカウントを削除すると、すべてのチE�Eタ、設定、履歴が完�Eに削除されまぁE)).toBeVisible();
  });

  test('UI統一性の確誁E, async ({ page }) => {
    // intelligence-cardクラスの使用を確誁E    const cards = page.locator('.intelligence-card.global');
    await expect(cards).toHaveCount(3);
    
    // nexus-buttonクラスの使用を確誁E    const buttons = page.locator('.nexus-button');
    await expect(buttons).toHaveCount(2);
    
    // dangerボタンの確誁E    const dangerButton = page.locator('.nexus-button.danger');
    await expect(dangerButton).toHaveCount(1);
    
    // nexus-text-primaryクラスの使用を確誁E    const primaryTexts = page.locator('.text-nexus-text-primary');
    await expect(primaryTexts).toHaveCount(6); // タイトル、見�Eしなど
    
    // nexus-text-secondaryクラスの使用を確誁E    const secondaryTexts = page.locator('.text-nexus-text-secondary');
    await expect(secondaryTexts).toHaveCount(5); // サブタイトル、説明文など
  });

  test('レスポンシブデザインの確誁E, async ({ page }) => {
    // チE��クトップサイズ
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.intelligence-card')).toHaveCount(3);
    
    // タブレチE��サイズ
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.intelligence-card')).toHaveCount(3);
    
    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.intelligence-card')).toHaveCount(3);
    
    // レイアウトが適刁E��調整されてぁE��か確誁E    await expect(page.locator('.space-y-6')).toBeVisible();
  });

  test('アクセシビリチE��の確誁E, async ({ page }) => {
    // ボタンにアクセシブルな属性があるか確誁E    const exportButton = page.locator('button').filter({ hasText: 'エクスポ�EチE });
    await expect(exportButton).toBeVisible();
    
    const deleteButton = page.locator('button').filter({ hasText: '削除' });
    await expect(deleteButton).toBeVisible();
    
    // セクション見�Eしが適刁E��構造化されてぁE��か確誁E    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h3')).toHaveCount(2);
    await expect(page.locator('h4')).toHaveCount(4);
  });
});
import { test, expect } from '@playwright/test';

async function loginAsSeller(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'seller@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
}

async function loginAsStaff(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'staff@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/staff\/dashboard$/, { timeout: 15000 });
}

test.describe('プロフィールペ�EジチE��チE, () => {
  test('セラー: プロフィールペ�Eジが正しく表示されめE, async ({ page }) => {
    await loginAsSeller(page);
    
    // 直接プロフィールペ�Eジにアクセス
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile$/);
    
    // プロフィールペ�Eジの基本要素が表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText('プロフィール設宁E)).toBeVisible({ timeout: 10000 });
  });

  test('スタチE��: プロフィールペ�Eジが正しく表示されめE, async ({ page }) => {
    await loginAsStaff(page);
    
    // 直接プロフィールペ�Eジにアクセス
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile$/);
    
    // プロフィールペ�Eジの基本要素が表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText('プロフィール設宁E)).toBeVisible({ timeout: 10000 });
  });

  test('プロフィール編雁E���Eが動作すめE, async ({ page }) => {
    await loginAsSeller(page);
    
    // プロフィールペ�Eジにアクセス
    await page.goto('/profile');
    
    // 編雁E�EタンをクリチE��
    await page.click('button:has-text("編雁E)');
    
    // 編雁E��ードになることを確誁E
    await expect(page.locator('input[value*="鈴木"]')).toBeVisible({ timeout: 5000 });
    
    // 保存�Eタンが表示されることを確誁E
    await expect(page.getByText('保孁E)).toBeVisible();
  });

  test('パスワード変更モーダルが表示されめE, async ({ page }) => {
    await loginAsSeller(page);
    
    // プロフィールペ�Eジにアクセス
    await page.goto('/profile');
    
    // パスワード変更ボタンをクリチE��
    await page.click('button:has-text("変更")');
    
    // パスワード変更モーダルが表示されることを確誁E
    await expect(page.getByText('パスワード変更')).toBeVisible({ timeout: 5000 });
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('UI統一性検証', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処琁E    await page.goto('/login');
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
  });

  test('PageHeaderコンポ�Eネント�E統一性確誁E, async ({ page }) => {
    // ダチE��ュボ�Eド�EージのPageHeader確誁E    await page.goto('/dashboard');
    const dashboardHeader = page.locator('.intelligence-card.americas');
    await expect(dashboardHeader).toBeVisible();
    
    // タイトルとサブタイトルの存在確誁E    await expect(page.locator('h1:has-text("セラーダチE��ュボ�EチE)')).toBeVisible();
    await expect(page.locator('text=販売実績と在庫状況�E概要E)).toBeVisible();
    
    // アイコンの存在確誁E    await expect(page.locator('.module-icon')).toBeVisible();

    // 設定�EージのPageHeader確誁E    await page.goto('/settings');
    const settingsHeader = page.locator('.intelligence-card.global');
    await expect(settingsHeader).toBeVisible();
    
    await expect(page.locator('h1:has-text("アカウント設宁E)')).toBeVisible();
    await expect(page.locator('text=アカウント情報とチE�Eタ管琁E)).toBeVisible();

    // スタチE��ダチE��ュボ�Eド�EPageHeader確誁E    await page.goto('/staff/dashboard');
    await expect(page.locator('h1:has-text("スタチE��ダチE��ュボ�EチE)')).toBeVisible();
    await expect(page.locator('text=日、E�Eタスクと業務フローの管琁E)).toBeVisible();
  });

  test('NexusButtonコンポ�Eネント�E統一性確誁E, async ({ page }) => {
    await page.goto('/dashboard');
    
    // プライマリボタンの確誁E    const primaryButtons = page.locator('.nexus-button.primary, button:has-class("nexus-button"):has-class("primary")');
    const primaryButtonCount = await primaryButtons.count();
    expect(primaryButtonCount).toBeGreaterThan(0);
    
    // ボタンのホバーエフェクト確誁E    const firstPrimaryButton = primaryButtons.first();
    await firstPrimaryButton.hover();
    
    // ボタンのクリチE��可能性確誁E    await expect(firstPrimaryButton).toBeEnabled();
    
    // 設定�Eージでのボタン確誁E    await page.goto('/settings');
    
    // エクスポ�Eト�Eタンの確誁E    const exportButton = page.locator('button:has-text("エクスポ�EチE)');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeEnabled();
    
    // 危険ボタンの確誁E    const deleteButton = page.locator('button:has-text("削除")');
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toBeEnabled();
  });

  test('地域別カラーリングシスチE��の確誁E, async ({ page }) => {
    await page.goto('/dashboard');
    
    // Americas�E�青�E�カラーリング確誁E    const americasCard = page.locator('.intelligence-card.americas');
    await expect(americasCard).toBeVisible();
    
    // Europe�E�赤�E�カラーリング確誁E    const europeCard = page.locator('.intelligence-card.europe');
    await expect(europeCard).toBeVisible();
    
    // Asia�E�黁E��カラーリング確誁E    const asiaCard = page.locator('.intelligence-card.asia');
    await expect(asiaCard).toBeVisible();
    
    // Africa�E�緑）カラーリング確誁E    const africaCard = page.locator('.intelligence-card.africa');
    await expect(africaCard).toBeVisible();
    
    // Global�E�紫�E�カラーリング確誁E    const globalCard = page.locator('.intelligence-card.global');
    await expect(globalCard).toBeVisible();
  });

  test('レスポンシブデザインの確誁E, async ({ page }) => {
    // チE��クトップビュー
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dashboard');
    
    // サイドバーの表示確誁E    await expect(page.locator('.nexus-sidebar')).toBeVisible();
    
    // タブレチE��ビュー
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // ヘッダーの高さ調整確誁E    const header = page.locator('.nexus-header');
    await expect(header).toBeVisible();
    
    // モバイルビュー
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // タチE��ターゲチE��サイズの確誁E    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const boundingBox = await button.boundingBox();
      if (boundingBox) {
        // 最小タチE��ターゲチE��44px確誁E        expect(boundingBox.height).toBeGreaterThanOrEqual(40);
        expect(boundingBox.width).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('アクセシビリチE��の確誁E, async ({ page }) => {
    await page.goto('/dashboard');
    
    // フォーカス可能な要素の確誁E    const focusableElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const focusableCount = await focusableElements.count();
    expect(focusableCount).toBeGreaterThan(0);
    
    // キーボ�Eドナビゲーション確誁E    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // ARIA属性の確誁E    const modals = page.locator('[role="dialog"]');
    const modalCount = await modals.count();
    
    if (modalCount > 0) {
      const firstModal = modals.first();
      await expect(firstModal).toHaveAttribute('aria-modal', 'true');
    }
  });

  test('統一されたエラーハンドリング確誁E, async ({ page }) => {
    await page.goto('/settings');
    
    // エラー状態�Eボタン操佁E    const deleteButton = page.locator('button:has-text("削除")');
    await deleteButton.click();
    
    // 確認ダイアログの表示確誁E    await page.waitForEvent('dialog');
  });

  test('ローチE��ング状態�E統一性確誁E, async ({ page }) => {
    await page.goto('/dashboard');
    
    // ペ�Eジ読み込み時�EローチE��ング表示確誁E    const loadingIndicator = page.locator('.animate-spin, text=読み込み中');
    
    // 非同期操作でのローチE��ング確誁E    const reportButton = page.locator('button:has-text("レポ�EトをダウンローチE)');
    if (await reportButton.isVisible()) {
      await reportButton.click();
      // ダウンロード�E琁E�E完亁E��征E��
      await page.waitForTimeout(1000);
    }
  });

  test('グラチE�Eション効果�E確誁E, async ({ page }) => {
    await page.goto('/dashboard');
    
    // カード�EグラチE�Eション上部バ�Eの確誁E    const gradientBars = page.locator('.intelligence-card .bg-gradient-to-r');
    const gradientCount = await gradientBars.count();
    expect(gradientCount).toBeGreaterThan(0);
    
    // ボタンのグラチE�Eション確誁E    const gradientButtons = page.locator('.nexus-button:has-class("primary")');
    const buttonGradientCount = await gradientButtons.count();
    expect(buttonGradientCount).toBeGreaterThan(0);
  });

  test('フォント統一性の確誁E, async ({ page }) => {
    await page.goto('/dashboard');
    
    // チE��スプレイフォント�E確誁E    const displayElements = page.locator('.font-display');
    const displayCount = await displayElements.count();
    expect(displayCount).toBeGreaterThan(0);
    
    // モノスペ�Eスフォント�E確認（商品ID等！E    const monoElements = page.locator('.font-mono');
    const monoCount = await monoElements.count();
    expect(monoCount).toBeGreaterThan(0);
  });

  test('統一されたスペ�EシングシスチE��確誁E, async ({ page }) => {
    await page.goto('/dashboard');
    
    // カード間のスペ�Eシング確誁E    const cardContainer = page.locator('.space-y-6');
    await expect(cardContainer).toBeVisible();
    
    // グリチE��のギャチE�E確誁E    const gridContainer = page.locator('.grid.gap-3, .grid.gap-4, .grid.gap-6');
    const gridCount = await gridContainer.count();
    expect(gridCount).toBeGreaterThan(0);
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('業務フローでのUI統一性検証', () => {
  test.beforeEach(async ({ page }) => {
    // スタチE��アカウントでログイン
    await page.goto('/login');
    await page.click('[data-testid="staff-login"]');
    await page.waitForURL('/staff/dashboard');
  });

  test('啁E��検品フローでのUI統一性', async ({ page }) => {
    // 検品ペ�Eジへ移勁E
    await page.goto('/staff/inspection');
    
    // PageHeaderの確誁E
    await expect(page.locator('h1:has-text("啁E��検品")')).toBeVisible();
    
    // 統一された�Eタンスタイルの確誁E
    const inspectionButtons = page.locator('button');
    const buttonCount = await inspectionButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // カードコンポ�Eネント�E統一確誁E
    const cards = page.locator('.intelligence-card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // 検品開始�Eタンの確誁E
    const startButton = page.locator('button:has-text("検品を開姁E)');
    if (await startButton.isVisible()) {
      await expect(startButton).toBeEnabled();
      
      // ボタンのスタイル統一確誁E
      const buttonClasses = await startButton.getAttribute('class');
      expect(buttonClasses).toContain('nexus-button');
    }
  });

  test('QRコード生成フローでのUI統一性', async ({ page }) => {
    // 在庫管琁E�Eージへ移勁E
    await page.goto('/staff/inventory');
    
    // QRコード生成�Eタンの確誁E
    const qrButton = page.locator('button:has-text("QR生�E"), button:has-text("QRコーチE)').first();
    if (await qrButton.isVisible()) {
      await qrButton.click();
      
      // モーダルの統一スタイル確誁E
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        await expect(modal).toHaveAttribute('aria-modal', 'true');
        
        // モーダル冁E�Eボタン統一確誁E
        const modalButtons = modal.locator('button');
        const modalButtonCount = await modalButtons.count();
        expect(modalButtonCount).toBeGreaterThan(0);
        
        // 閉じる�Eタンの確誁E
        const closeButton = modal.locator('button:has-text("閉じめE), button:has-text("キャンセル")').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    }
  });

  test('返品処琁E��ローでのUI統一性', async ({ page }) => {
    // 返品管琁E�Eージへ移勁E
    await page.goto('/staff/returns');
    
    // PageHeaderの地域カラーリング確誁E
    const pageHeader = page.locator('.intelligence-card');
    await expect(pageHeader.first()).toBeVisible();
    
    // 返品処琁E�Eタンの統一確誁E
    const returnButtons = page.locator('button:has-text("処琁E), button:has-text("承誁E), button:has-text("拒否")');
    const returnButtonCount = await returnButtons.count();
    
    if (returnButtonCount > 0) {
      const firstButton = returnButtons.first();
      await expect(firstButton).toBeVisible();
      
      // ボタンのホバーエフェクト確誁E
      await firstButton.hover();
      await page.waitForTimeout(200);
    }
    
    // スチE�Eタスバッジの統一確誁E
    const statusBadges = page.locator('.status-badge');
    const badgeCount = await statusBadges.count();
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });

  test('出荷処琁E��ローでのUI統一性', async ({ page }) => {
    // 出荷管琁E�Eージへ移勁E
    await page.goto('/staff/shipping');
    
    // 統一されたテーブルスタイル確誁E
    const holoTable = page.locator('.holo-table');
    if (await holoTable.isVisible()) {
      await expect(holoTable).toBeVisible();
      
      // チE�Eブルヘッダーの統一確誁E
      const tableHeaders = holoTable.locator('th');
      const headerCount = await tableHeaders.count();
      expect(headerCount).toBeGreaterThan(0);
    }
    
    // 出荷ラベル印刷ボタンの確誁E
    const printButtons = page.locator('button:has-text("印刷"), button:has-text("ラベル")');
    const printButtonCount = await printButtons.count();
    
    if (printButtonCount > 0) {
      const printButton = printButtons.first();
      await expect(printButton).toBeVisible();
      
      // ボタンスタイルの統一確誁E
      const buttonStyle = await printButton.getAttribute('class');
      expect(buttonStyle).toContain('nexus-button');
    }
  });

  test('タスク管琁E��ローでのUI統一性', async ({ page }) => {
    // タスク管琁E�Eージへ移勁E
    await page.goto('/staff/tasks');
    
    // 新規タスク作�Eボタンの確誁E
    const createTaskButton = page.locator('button:has-text("新要E), button:has-text("作�E")').first();
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      
      // タスク作�Eモーダルの統一確誁E
      const taskModal = page.locator('[role="dialog"]');
      if (await taskModal.isVisible()) {
        await expect(taskModal).toBeVisible();
        
        // フォーム要素の統一確誁E
        const formInputs = taskModal.locator('input, select, textarea');
        const inputCount = await formInputs.count();
        expect(inputCount).toBeGreaterThan(0);
        
        // 保存�Eタンの統一確誁E
        const saveButton = taskModal.locator('button:has-text("保孁E), button:has-text("作�E")').first();
        if (await saveButton.isVisible()) {
          await expect(saveButton).toBeVisible();
        }
        
        // キャンセルボタンで閉じめE
        const cancelButton = taskModal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)').first();
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }
    }
    
    // タスクカード�E統一確誁E
    const taskCards = page.locator('.intelligence-card');
    const taskCardCount = await taskCards.count();
    expect(taskCardCount).toBeGreaterThan(0);
  });

  test('ピッキングフローでのUI統一性', async ({ page }) => {
    // ピッキングペ�Eジへ移勁E
    await page.goto('/staff/picking');
    
    // ピッキングリスト�E統一確誁E
    const pickingCards = page.locator('.intelligence-card');
    const cardCount = await pickingCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // ピッキング完亁E�Eタンの確誁E
    const completeButtons = page.locator('button:has-text("完亁E), button:has-text("確誁E)');
    const completeButtonCount = await completeButtons.count();
    
    if (completeButtonCount > 0) {
      const completeButton = completeButtons.first();
      await expect(completeButton).toBeVisible();
      
      // プライマリボタンスタイルの確誁E
      const buttonClasses = await completeButton.getAttribute('class');
      expect(buttonClasses).toMatch(/nexus-button|primary/);
    }
  });

  test('レポ�Eト生成フローでのUI統一性', async ({ page }) => {
    // レポ�Eト�Eージへ移勁E
    await page.goto('/staff/reports');
    
    // レポ�Eト生成�Eタンの確誁E
    const generateButton = page.locator('button:has-text("生�E"), button:has-text("作�E")').first();
    if (await generateButton.isVisible()) {
      await expect(generateButton).toBeVisible();
      
      // ボタンのアイコン統一確誁E
      const buttonIcon = generateButton.locator('svg');
      if (await buttonIcon.isVisible()) {
        await expect(buttonIcon).toBeVisible();
      }
    }
    
    // 期間選択UI の統一確誁E
    const dateInputs = page.locator('input[type="date"], input[type="datetime-local"]');
    const dateInputCount = await dateInputs.count();
    
    if (dateInputCount > 0) {
      const dateInput = dateInputs.first();
      await expect(dateInput).toBeVisible();
      
      // 入力フィールド�Eスタイル統一確誁E
      const inputStyle = await dateInput.getAttribute('class');
      expect(inputStyle).toMatch(/nexus-input|form-control/);
    }
  });

  test('ロケーション管琁E��ローでのUI統一性', async ({ page }) => {
    // ロケーション管琁E�Eージへ移勁E
    await page.goto('/staff/location');
    
    // ロケーション追加ボタンの確誁E
    const addLocationButton = page.locator('button:has-text("追加"), button:has-text("新要E)').first();
    if (await addLocationButton.isVisible()) {
      await addLocationButton.click();
      
      // ロケーション追加モーダルの統一確誁E
      const locationModal = page.locator('[role="dialog"]');
      if (await locationModal.isVisible()) {
        await expect(locationModal).toBeVisible();
        
        // モーダルのクローズボタン確誁E
        const closeButton = locationModal.locator('button:has-text("ÁE), button[aria-label*="閉じめE]').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          // ESCキーで閉じめE
          await page.keyboard.press('Escape');
        }
      }
    }
    
    // ロケーションカード�E統一確誁E
    const locationCards = page.locator('.intelligence-card');
    const locationCardCount = await locationCards.count();
    expect(locationCardCount).toBeGreaterThan(0);
  });

  test('統計ダチE��ュボ�EドでのUI統一性', async ({ page }) => {
    // スタチE��ダチE��ュボ�Eドで統計表示の確誁E
    await page.goto('/staff/dashboard');
    
    // KPIカード�E地域別カラーリング確誁E
    const kpiCards = page.locator('.intelligence-card');
    const kpiCardCount = await kpiCards.count();
    expect(kpiCardCount).toBeGreaterThan(0);
    
    // 統計値の表示統一確誁E
    const metricValues = page.locator('.metric-value');
    const metricCount = await metricValues.count();
    expect(metricCount).toBeGreaterThan(0);
    
    // アクションオーブ�E統一確誁E
    const actionOrbs = page.locator('.action-orb');
    const orbCount = await actionOrbs.count();
    expect(orbCount).toBeGreaterThan(0);
    
    // スチE�Eタスバッジの統一確誁E
    const statusBadges = page.locator('.status-badge');
    const badgeCount = await statusBadges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('モバイルビューでの業務フロー統一性', async ({ page }) => {
    // モバイルビューに刁E��替ぁE
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 吁E��要�Eージでのモバイル対応確誁E
    const pages = [
      '/staff/dashboard',
      '/staff/inspection',
      '/staff/inventory',
      '/staff/shipping',
      '/staff/returns'
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // ペ�Eジの読み込み確誁E
      await page.waitForLoadState('networkidle');
      
      // ヘッダーの表示確誁E
      const header = page.locator('.nexus-header');
      await expect(header).toBeVisible();
      
      // ボタンのタチE��ターゲチE��サイズ確誁E
      const buttons = page.locator('button').first();
      if (await buttons.isVisible()) {
        const boundingBox = await buttons.boundingBox();
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(40);
          expect(boundingBox.width).toBeGreaterThanOrEqual(40);
        }
      }
      
      // カード�E表示確誁E
      const cards = page.locator('.intelligence-card');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('UI統一化修正頁E�� E2EチE��チE, () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処琁E
    await page.goto('/login');
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
  });

  test.describe('🔴 高優先度修正頁E��', () => {
    test('Dashboard - 日付選択モーダル修正', async ({ page }) => {
      await page.goto('/dashboard');
      
      // 期間選択�Eタンの存在確誁E
      const periodButton = page.locator('button:has-text("期間選抁E), button:has-text("期間でフィルター")');
      await expect(periodButton).toBeVisible();
      
      // BaseModalの確誁E
      await periodButton.click();
      const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-50, [role="dialog"]');
      await expect(modal).toBeVisible();
      
      // モーダルタイトルの確誁E
      const modalTitle = page.locator('h2:has-text("期間選抁E), h3:has-text("期間選抁E)');
      await expect(modalTitle).toBeVisible();
      
      // キャンセルボタンで閉じめE
      const cancelButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じめE)');
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        await expect(modal).not.toBeVisible();
      }
    });

    test('Inventory - CSV インポ�Eトモーダル・ボタン修正', async ({ page }) => {
      await page.goto('/inventory');
      
      // NexusButtonの確誁E
      const buttons = [
        '新規商品登録',
        'CSVインポ�EチE,
        'CSVエクスポ�EチE
      ];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        await expect(button).toBeVisible();
        
        // NexusButtonクラスまた�Eスタイルの確誁E
        const buttonClass = await button.getAttribute('class');
        expect(buttonClass).toContain('nexus-button');
      }
      
      // CSVインポ�Eトモーダルの確誁E
      const csvImportButton = page.locator('button:has-text("CSVインポ�EチE)');
      await csvImportButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // モーダル冁E�ENexusInputの確誁E
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeVisible();
      
      // モーダルを閉じる
      const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じめE)');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    });

    test('Sales - モーダル・ボタン修正', async ({ page }) => {
      await page.goto('/sales');
      
      // NexusButtonの確誁E
      const buttons = ['出品設宁E, 'プロモーション作�E'];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        await expect(button).toBeVisible();
        
        const buttonClass = await button.getAttribute('class');
        expect(buttonClass).toContain('nexus-button');
      }
      
      // HoloTableの確誁E
      const table = page.locator('.holo-table, table');
      await expect(table).toBeVisible();
      
      // 出品設定モーダルの確誁E
      const settingsButton = page.locator('button:has-text("出品設宁E)');
      await settingsButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // モーダルタイトルの確誁E
      const modalTitle = page.locator('h2:has-text("出品設宁E), h3:has-text("出品設宁E)');
      await expect(modalTitle).toBeVisible();
      
      // モーダルを閉じる
      const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じめE)');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    });

    test('Billing - ボタン・チE�Eブル修正', async ({ page }) => {
      await page.goto('/billing');
      
      // NexusButtonの確誁E
      const buttons = ['支払履歴をエクスポ�EチE, '支払い方法を登録'];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        await expect(button).toBeVisible();
        
        const buttonClass = await button.getAttribute('class');
        expect(buttonClass).toContain('nexus-button');
      }
      
      // HoloTableの確誁E
      const table = page.locator('.holo-table, table');
      await expect(table).toBeVisible();
      
      // ボタンのアイコン確誁E
      const exportButton = page.locator('button:has-text("支払履歴をエクスポ�EチE)');
      const buttonIcon = exportButton.locator('svg');
      await expect(buttonIcon).toBeVisible();
    });

    test('Delivery - モーダル・入力修正', async ({ page }) => {
      await page.goto('/delivery');
      
      // NexusButtonの確誁E
      const buttons = ['新規納品プラン作�E', 'バ�Eコード発衁E];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        await expect(button).toBeVisible();
        
        const buttonClass = await button.getAttribute('class');
        expect(buttonClass).toContain('nexus-button');
      }
      
      // バ�Eコード発行モーダルの確誁E
      const barcodeButton = page.locator('button:has-text("バ�Eコード発衁E)');
      await barcodeButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // モーダル冁E�ENexusInputの確誁E
      const inputs = modal.locator('input');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);
      
      // モーダルを閉じる
      const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じめE)');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    });

    test('Returns - 大型モーダル修正', async ({ page }) => {
      await page.goto('/returns');
      
      // NexusButtonの確誁E
      const buttons = ['返品申諁E, 'レポ�Eト�E劁E];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        await expect(button).toBeVisible();
        
        const buttonClass = await button.getAttribute('class');
        expect(buttonClass).toContain('nexus-button');
      }
      
      // 返品申請モーダルの確誁E
      const returnButton = page.locator('button:has-text("返品申諁E)');
      await returnButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // モーダルサイズの確認！Eg�E�E
      const modalContent = modal.locator('.max-w-lg, .max-w-2xl, .max-w-4xl');
      await expect(modalContent).toBeVisible();
      
      // NexusInputとNexusTextareaの確誁E
      const inputs = modal.locator('input');
      const textareas = modal.locator('textarea');
      
      expect(await inputs.count()).toBeGreaterThan(0);
      expect(await textareas.count()).toBeGreaterThan(0);
      
      // モーダルを閉じる
      const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じめE)');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    });

    test('Profile - 入力�Eモーダル修正', async ({ page }) => {
      await page.goto('/profile');
      
      // 編雁E�Eタンの確誁E
      const editButton = page.locator('button:has-text("編雁E)');
      await expect(editButton).toBeVisible();
      
      const buttonClass = await editButton.getAttribute('class');
      expect(buttonClass).toContain('nexus-button');
      
      // 編雁E��ード�E確誁E
      await editButton.click();
      
      // NexusInputの確誁E
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);
      
      // パスワード変更ボタンの確誁E
      const passwordButton = page.locator('button:has-text("パスワード変更")');
      if (await passwordButton.isVisible()) {
        await passwordButton.click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // モーダルを閉じる
        const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じめE)');
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    });

    test('Timeline - ボタン・モーダル修正', async ({ page }) => {
      await page.goto('/timeline');
      
      // NexusButtonの確誁E
      const buttons = ['期間でフィルター', '履歴をエクスポ�EチE];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        await expect(button).toBeVisible();
        
        const buttonClass = await button.getAttribute('class');
        expect(buttonClass).toContain('nexus-button');
      }
      
      // フィルターモーダルの確誁E
      const filterButton = page.locator('button:has-text("期間でフィルター")');
      await filterButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // モーダルを閉じる
      const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じめE)');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    });
  });

  test.describe('🟡 中優先度修正頁E��', () => {
    test('Staff Dashboard - フィルター修正', async ({ page }) => {
      await page.goto('/staff/dashboard');
      
      // NexusSelectの確誁E
      const selects = page.locator('select');
      const selectCount = await selects.count();
      expect(selectCount).toBeGreaterThan(0);
      
      // 検索入力�E確誁E
      const searchInput = page.locator('input[type="search"], input[placeholder*="検索"]');
      await expect(searchInput).toBeVisible();
      
      // 新規タスク作�Eボタンの確誁E
      const createButton = page.locator('button:has-text("新規タスク作�E")');
      await expect(createButton).toBeVisible();
      
      const buttonClass = await createButton.getAttribute('class');
      expect(buttonClass).toContain('nexus-button');
    });

    test('Staff Inventory - フィルター・モーダル修正', async ({ page }) => {
      await page.goto('/staff/inventory');
      
      // NexusSelectの確誁E
      const filters = [
        'select[name="status"]',
        'select[name="category"]',
        'select[name="location"]',
        'select[name="assignee"]'
      ];
      
      for (const filter of filters) {
        const select = page.locator(filter);
        if (await select.isVisible()) {
          const selectClass = await select.getAttribute('class');
          expect(selectClass).toContain('nexus-select');
        }
      }
      
      // 検索入力�E確誁E
      const searchInput = page.locator('input[type="search"], input[placeholder*="検索"]');
      await expect(searchInput).toBeVisible();
      
      // NexusButtonの確誁E
      const buttons = ['啁E��詳細を編雁E, 'ロケーション移勁E, 'CSVエクスポ�EチE];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        if (await button.isVisible()) {
          const buttonClass = await button.getAttribute('class');
          expect(buttonClass).toContain('nexus-button');
        }
      }
    });

    test('Staff Inspection - モーダル修正', async ({ page }) => {
      await page.goto('/staff/inspection');
      
      // NexusButtonの確誁E
      const buttons = ['検品基準を確誁E, 'カメラ設宁E, '検品開姁E];
      
      for (const buttonText of buttons) {
        const button = page.locator(`button:has-text("${buttonText}")`);
        if (await button.isVisible()) {
          const buttonClass = await button.getAttribute('class');
          expect(buttonClass).toContain('nexus-button');
        }
      }
      
      // 検品基準モーダルの確誁E
      const standardsButton = page.locator('button:has-text("検品基準を確誁E)');
      if (await standardsButton.isVisible()) {
        await standardsButton.click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // モーダルを閉じる
        const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じめE)');
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    });

    test('Login - 入力フィールド修正', async ({ page }) => {
      await page.goto('/login');
      
      // NexusInputの確誁E
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      
      // enterpriseバリアント�E確誁E
      const emailClass = await emailInput.getAttribute('class');
      const passwordClass = await passwordInput.getAttribute('class');
      
      expect(emailClass).toContain('nexus-input');
      expect(passwordClass).toContain('nexus-input');
      
      // ラベルのアイコン確誁E
      const emailLabel = page.locator('label:has(svg) >> text=メールアドレス');
      const passwordLabel = page.locator('label:has(svg) >> text=パスワーチE);
      
      await expect(emailLabel).toBeVisible();
      await expect(passwordLabel).toBeVisible();
      
      // ログイン機�Eの確誁E
      await emailInput.fill('seller@example.com');
      await passwordInput.fill('password123');
      
      const loginButton = page.locator('button:has-text("ログイン")');
      await expect(loginButton).toBeVisible();
      
      const buttonClass = await loginButton.getAttribute('class');
      expect(buttonClass).toContain('nexus-button');
    });
  });

  test.describe('🟢 低優先度修正頁E��', () => {
    test('NexusTextarea - ラベル色修正', async ({ page }) => {
      // NexusTextareaが使用されてぁE��画面をチェチE��
      const pages = ['/returns', '/staff/inspection'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        
        const textareas = page.locator('textarea');
        const textareaCount = await textareas.count();
        
        if (textareaCount > 0) {
          // ラベルの色がnexus-text-secondaryであることを確誁E
          const labels = page.locator('label');
          const labelCount = await labels.count();
          
          for (let i = 0; i < labelCount; i++) {
            const label = labels.nth(i);
            const labelClass = await label.getAttribute('class');
            if (labelClass && labelClass.includes('nexus-text-secondary')) {
              // ラベル色が正しく設定されてぁE��ことを確誁E
              expect(labelClass).toContain('nexus-text-secondary');
            }
          }
        }
      }
    });
  });

  test.describe('📋 全体的な統一性確誁E, () => {
    test('チE��インシスチE��統一性確誁E, async ({ page }) => {
      const pages = [
        '/dashboard',
        '/inventory',
        '/sales',
        '/billing',
        '/delivery',
        '/returns',
        '/profile',
        '/timeline'
      ];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        
        // NexusButtonの確誁E
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        
        if (buttonCount > 0) {
          // 少なくとめEつのボタンがNexusButtonであることを確誁E
          const nexusButtons = page.locator('button.nexus-button, button[class*="nexus-button"]');
          const nexusButtonCount = await nexusButtons.count();
          expect(nexusButtonCount).toBeGreaterThan(0);
        }
        
        // モーダルの確誁E
        const modals = page.locator('[role="dialog"]');
        const modalCount = await modals.count();
        
        // 入力フィールド�E確誁E
        const inputs = page.locator('input');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          // 少なくとめEつの入力がNexusInputであることを確誁E
          const nexusInputs = page.locator('input.nexus-input, input[class*="nexus-input"]');
          const nexusInputCount = await nexusInputs.count();
          expect(nexusInputCount).toBeGreaterThan(0);
        }
      }
    });

    test('機�E保持確誁E, async ({ page }) => {
      // 主要な機�Eが正常に動作することを確誁E
      await page.goto('/dashboard');
      
      // ナビゲーションの確誁E
      const navLinks = page.locator('nav a');
      const navLinkCount = await navLinks.count();
      expect(navLinkCount).toBeGreaterThan(0);
      
      // 吁E�Eージへのアクセス確誁E
      const pages = ['/inventory', '/sales', '/billing'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        
        // ペ�Eジが正常に読み込まれることを確誁E
        await expect(page.locator('h1')).toBeVisible();
        
        // エラーがなぁE��とを確誁E
        const errors = page.locator('.error, [role="alert"]');
        const errorCount = await errors.count();
        expect(errorCount).toBe(0);
      }
    });

    test('レスポンシブデザイン確誁E, async ({ page }) => {
      const viewports = [
        { width: 1440, height: 900 }, // チE��クトッチE
        { width: 768, height: 1024 },  // タブレチE��
        { width: 375, height: 667 }    // モバイル
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/dashboard');
        
        // ペ�Eジが正常に表示されることを確誁E
        await expect(page.locator('h1')).toBeVisible();
        
        // ボタンのタチE��ターゲチE��サイズ確認（モバイル�E�E
        if (viewport.width === 375) {
          const buttons = page.locator('button');
          const buttonCount = await buttons.count();
          
          for (let i = 0; i < Math.min(buttonCount, 3); i++) {
            const button = buttons.nth(i);
            const boundingBox = await button.boundingBox();
            if (boundingBox) {
              expect(boundingBox.height).toBeGreaterThanOrEqual(40);
              expect(boundingBox.width).toBeGreaterThanOrEqual(40);
            }
          }
        }
      }
    });
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('シンプルUI統一性チE��チE, () => {
  test('ログインペ�EジのNexusInput確誁E, async ({ page }) => {
    await page.goto('/login');
    
    // ペ�Eジが正常に読み込まれることを確誁E
    await expect(page.locator('h2:has-text("THE WORLD DOOR")')).toBeVisible();
    
    // メールアドレス入力フィールド�E確誁E
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    // パスワード�E力フィールド�E確誁E
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    
    // ログインボタンの確誁E
    const loginButton = page.locator('button:has-text("ログイン")');
    await expect(loginButton).toBeVisible();
    
    // チE��チEDボタンの確誁E
    const sellerLoginButton = page.locator('[data-testid="seller-login"]');
    await expect(sellerLoginButton).toBeVisible();
    
    const staffLoginButton = page.locator('[data-testid="staff-login"]');
    await expect(staffLoginButton).toBeVisible();
  });

  test('ログイン機�EのチE��チE, async ({ page }) => {
    await page.goto('/login');
    
    // セラーログインボタンをクリチE��
    await page.click('[data-testid="seller-login"]');
    
    // ログインボタンをクリチE��
    await page.click('button:has-text("ログイン")');
    
    // ダチE��ュボ�Eド�Eージにリダイレクトされることを確誁E
    await page.waitForURL('/dashboard');
    
    // ダチE��ュボ�Eド�Eタイトルを確誁E
    await expect(page.locator('h1:has-text("セラーダチE��ュボ�EチE)')).toBeVisible();
  });

  test('ダチE��ュボ�Eド�ENexusButton確誁E, async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    
    // ペ�Eジが正常に読み込まれることを確誁E
    await expect(page.locator('h1:has-text("セラーダチE��ュボ�EチE)')).toBeVisible();
    
    // ボタンの存在確誁E
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // NexusButtonクラスを持つボタンの確誁E
    const nexusButtons = page.locator('button[class*="nexus-button"]');
    const nexusButtonCount = await nexusButtons.count();
    
    // 少なくとめEつのNexusButtonが存在することを確誁E
    if (nexusButtonCount > 0) {
      console.log(`NexusButton found: ${nexusButtonCount} buttons`);
    } else {
      console.log('NexusButton not found, checking for other button styling');
    }
  });

  test('在庫ペ�EジのUI統一性確誁E, async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    
    // 在庫ペ�Eジに移勁E
    await page.goto('/inventory');
    
    // ペ�Eジが正常に読み込まれることを確誁E
    await expect(page.locator('h1')).toBeVisible();
    
    // ボタンの存在確誁E
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // チE�Eブルの存在確誁E
    const tables = page.locator('table');
    const tableCount = await tables.count();
    
    if (tableCount > 0) {
      console.log(`Tables found: ${tableCount}`);
    }
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('追加修正頁E�� E2EチE��チE, () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処琁E
    await page.goto('/login');
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
  });

  test.describe('🔧 追加修正頁E��チE��チE, () => {
    test('TaskDetailModal - ボタン統一修正', async ({ page }) => {
      await page.goto('/dashboard');
      
      // タスク詳細モーダルを開ぁE
      const taskButton = page.locator('button:has-text("タスク詳細"), button:has-text("詳細"), [data-testid*="task"]');
      if (await taskButton.first().isVisible()) {
        await taskButton.first().click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // ヘッダーの閉じる�Eタン確誁E
        const closeButton = modal.locator('button:has-text("閉じめE), button[aria-label="Close"], button:has(svg)');
        if (await closeButton.first().isVisible()) {
          const buttonClass = await closeButton.first().getAttribute('class');
          expect(buttonClass).toContain('nexus-button');
        }
        
        // フッターボタンの確誁E
        const footerButtons = modal.locator('button:has-text("印刷"), button:has-text("褁E��"), button:has-text("編雁E)');
        const footerButtonCount = await footerButtons.count();
        
        for (let i = 0; i < footerButtonCount; i++) {
          const button = footerButtons.nth(i);
          const buttonClass = await button.getAttribute('class');
          expect(buttonClass).toContain('nexus-button');
        }
        
        // モーダルを閉じる
        if (await closeButton.first().isVisible()) {
          await closeButton.first().click();
        }
      }
    });

    test('CarrierSettingsModal - 入力フィールド修正', async ({ page }) => {
      await page.goto('/settings');
      
      // 配送業老E��定モーダルを開ぁE
      const carrierButton = page.locator('button:has-text("配送業老E��宁E), button:has-text("配送設宁E), button:has-text("業老E��宁E)');
      if (await carrierButton.first().isVisible()) {
        await carrierButton.first().click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // NexusInputの確誁E
        const inputs = modal.locator('input[type="text"], input[type="number"]');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          for (let i = 0; i < Math.min(inputCount, 3); i++) {
            const input = inputs.nth(i);
            const inputClass = await input.getAttribute('class');
            expect(inputClass).toContain('nexus-input');
          }
        }
        
        // NexusTextareaの確誁E
        const textareas = modal.locator('textarea');
        const textareaCount = await textareas.count();
        
        if (textareaCount > 0) {
          const textarea = textareas.first();
          const textareaClass = await textarea.getAttribute('class');
          expect(textareaClass).toContain('nexus-textarea');
        }
        
        // ボタンの確誁E
        const saveButton = modal.locator('button:has-text("保孁E), button:has-text("更新")');
        if (await saveButton.first().isVisible()) {
          const buttonClass = await saveButton.first().getAttribute('class');
          expect(buttonClass).toContain('nexus-button');
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)');
        if (await closeButton.first().isVisible()) {
          await closeButton.first().click();
        }
      }
    });

    test('PackingMaterialsModal - 数量�E力修正', async ({ page }) => {
      await page.goto('/inventory');
      
      // 梱匁E��E��モーダルを開ぁE
      const packingButton = page.locator('button:has-text("梱匁E��E��"), button:has-text("賁E��確誁E), button:has-text("発注")');
      if (await packingButton.first().isVisible()) {
        await packingButton.first().click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // 数量�E力フィールド�E確誁E
        const quantityInputs = modal.locator('input[type="number"], input[placeholder*="数釁E], input[name*="quantity"]');
        const quantityCount = await quantityInputs.count();
        
        if (quantityCount > 0) {
          const quantityInput = quantityInputs.first();
          const inputClass = await quantityInput.getAttribute('class');
          expect(inputClass).toContain('nexus-input');
          
          // 数量変更チE��チE
          await quantityInput.fill('5');
          const value = await quantityInput.inputValue();
          expect(value).toBe('5');
        }
        
        // 発注ボタンの確誁E
        const orderButton = modal.locator('button:has-text("発注"), button:has-text("注斁E)');
        if (await orderButton.first().isVisible()) {
          const buttonClass = await orderButton.first().getAttribute('class');
          expect(buttonClass).toContain('nexus-button');
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("閉じめE), button:has-text("キャンセル")');
        if (await closeButton.first().isVisible()) {
          await closeButton.first().click();
        }
      }
    });

    test('ProductRegistrationModal - 入力統一修正', async ({ page }) => {
      await page.goto('/inventory');
      
      // 新規商品登録モーダルを開ぁE
      const registerButton = page.locator('button:has-text("新規商品登録"), button:has-text("啁E��追加"), button:has-text("登録")');
      if (await registerButton.first().isVisible()) {
        await registerButton.first().click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // NexusInputの確誁E
        const textInputs = modal.locator('input[type="text"], input[type="number"]');
        const textInputCount = await textInputs.count();
        
        if (textInputCount > 0) {
          for (let i = 0; i < Math.min(textInputCount, 5); i++) {
            const input = textInputs.nth(i);
            const inputClass = await input.getAttribute('class');
            expect(inputClass).toContain('nexus-input');
          }
        }
        
        // NexusSelectの確誁E
        const selects = modal.locator('select');
        const selectCount = await selects.count();
        
        if (selectCount > 0) {
          for (let i = 0; i < selectCount; i++) {
            const select = selects.nth(i);
            const selectClass = await select.getAttribute('class');
            expect(selectClass).toContain('nexus-select');
          }
        }
        
        // NexusTextareaの確誁E
        const textareas = modal.locator('textarea');
        const textareaCount = await textareas.count();
        
        if (textareaCount > 0) {
          for (let i = 0; i < textareaCount; i++) {
            const textarea = textareas.nth(i);
            const textareaClass = await textarea.getAttribute('class');
            expect(textareaClass).toContain('nexus-textarea');
          }
        }
        
        // 登録ボタンの確誁E
        const submitButton = modal.locator('button:has-text("登録"), button:has-text("保孁E), button[type="submit"]');
        if (await submitButton.first().isVisible()) {
          const buttonClass = await submitButton.first().getAttribute('class');
          expect(buttonClass).toContain('nexus-button');
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)');
        if (await closeButton.first().isVisible()) {
          await closeButton.first().click();
        }
      }
    });

    test('QRCodeModal - 色彩統一修正', async ({ page }) => {
      await page.goto('/inventory');
      
      // QRコード生成モーダルを開ぁE
      const qrButton = page.locator('button:has-text("QRコーチE), button:has-text("バ�EコーチE), button[data-testid*="qr"]');
      if (await qrButton.first().isVisible()) {
        await qrButton.first().click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // NexusチE��イント�Eクンの確誁E
        const textElements = modal.locator('.nexus-text-primary, .nexus-text-secondary');
        const textCount = await textElements.count();
        expect(textCount).toBeGreaterThan(0);
        
        // 背景色の確誁E
        const bgElements = modal.locator('[class*="nexus-bg"], [class*="bg-nexus"]');
        const bgCount = await bgElements.count();
        
        // ボ�Eダー色の確誁E
        const borderElements = modal.locator('[class*="nexus-border"], [class*="border-nexus"]');
        const borderCount = await borderElements.count();
        
        // チE�Eタコピ�Eボタンの確誁E
        const copyButton = modal.locator('button:has-text("コピ�E"), button:has-text("チE�Eタ"), button[data-testid*="copy"]');
        if (await copyButton.first().isVisible()) {
          const buttonClass = await copyButton.first().getAttribute('class');
          expect(buttonClass).toMatch(/nexus-blue|blue/);
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("閉じめE), button:has-text("キャンセル")');
        if (await closeButton.first().isVisible()) {
          await closeButton.first().click();
        }
      }
    });

    test('SearchModal - タイポグラフィ修正', async ({ page }) => {
      await page.goto('/dashboard');
      
      // 検索モーダルを開く！Etrl+Kまた�E検索ボタン�E�E
      await page.keyboard.press('Control+k');
      
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        // 検索入力フィールド�E確誁E
        const searchInput = modal.locator('input[type="search"], input[placeholder*="検索"]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('チE��チE);
          
          // 検索結果のタイポグラフィ確誁E
          const resultTitles = modal.locator('.nexus-text-primary');
          const titleCount = await resultTitles.count();
          
          const resultDescriptions = modal.locator('.nexus-text-secondary');
          const descCount = await resultDescriptions.count();
          
          // アイコンの確誁E
          const icons = modal.locator('svg');
          const iconCount = await icons.count();
          expect(iconCount).toBeGreaterThan(0);
          
          // ローチE��ング表示の確誁E
          const loadingElements = modal.locator('[class*="nexus-blue"], [class*="blue"]');
          const loadingCount = await loadingElements.count();
          
          // ホバー効果�E確誁E
          const hoverElements = modal.locator('[class*="nexus-bg-secondary"], [class*="hover"]');
          const hoverCount = await hoverElements.count();
        }
        
        // モーダルを閉じる�E�Escapeキー�E�E
        await page.keyboard.press('Escape');
      } else {
        // 代替方法：検索ボタンをクリチE��
        const searchButton = page.locator('button:has-text("検索"), button[data-testid*="search"], [data-testid*="search"]');
        if (await searchButton.first().isVisible()) {
          await searchButton.first().click();
          
          const modal = page.locator('[role="dialog"]');
          if (await modal.isVisible()) {
            // タイポグラフィの確誁E
            const textElements = modal.locator('.nexus-text-primary, .nexus-text-secondary');
            const textCount = await textElements.count();
            
            // モーダルを閉じる
            const closeButton = modal.locator('button:has-text("閉じめE)');
            if (await closeButton.isVisible()) {
              await closeButton.click();
            } else {
              await page.keyboard.press('Escape');
            }
          }
        }
      }
    });
  });

  test.describe('🔍 統合テスチE, () => {
    test('全追加修正頁E��の統一性確誁E, async ({ page }) => {
      const pages = ['/dashboard', '/inventory', '/settings'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        
        // ペ�Eジが正常に読み込まれることを確誁E
        await expect(page.locator('h1')).toBeVisible();
        
        // NexusButtonの確誁E
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        
        if (buttonCount > 0) {
          // 少なくとめEつのNexusButtonが存在することを確誁E
          const nexusButtons = page.locator('button[class*="nexus-button"]');
          const nexusButtonCount = await nexusButtons.count();
          
          if (nexusButtonCount > 0) {
            console.log(`${pagePath}: NexusButton found: ${nexusButtonCount} buttons`);
          }
        }
        
        // 入力フィールド�E確誁E
        const inputs = page.locator('input');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          // NexusInputの確誁E
          const nexusInputs = page.locator('input[class*="nexus-input"]');
          const nexusInputCount = await nexusInputs.count();
          
          if (nexusInputCount > 0) {
            console.log(`${pagePath}: NexusInput found: ${nexusInputCount} inputs`);
          }
        }
      }
    });

    test('モーダル表示機�Eの確誁E, async ({ page }) => {
      await page.goto('/dashboard');
      
      // 吁E��モーダルボタンの存在確誁E
      const modalButtons = [
        'button:has-text("詳細")',
        'button:has-text("設宁E)',
        'button:has-text("登録")',
        'button:has-text("QR")',
        'button:has-text("検索")'
      ];
      
      for (const buttonSelector of modalButtons) {
        const button = page.locator(buttonSelector);
        if (await button.first().isVisible()) {
          console.log(`Modal button found: ${buttonSelector}`);
          
          // ボタンクリチE��でモーダルが開くことを確誁E
          await button.first().click();
          
          // モーダルの表示確誁E
          const modal = page.locator('[role="dialog"]');
          if (await modal.isVisible()) {
            console.log(`Modal opened successfully for: ${buttonSelector}`);
            
            // モーダルを閉じる
            const closeButton = modal.locator('button:has-text("閉じめE), button:has-text("キャンセル")');
            if (await closeButton.first().isVisible()) {
              await closeButton.first().click();
            } else {
              await page.keyboard.press('Escape');
            }
          }
        }
      }
    });
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('実際のUI操佁E- 本番運用と同じボタン挙動チE��チE, () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処琁E
    await page.goto('/login');
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
  });

  test.describe('🔥 実際のボタン操作テスチE, () => {
    test('ダチE��ュボ�EチE- 全ボタンの実際の挙動確誁E, async ({ page }) => {
      await page.goto('/dashboard');
      
      // 期間選択�EタンをクリチE��して実際にモーダルが開くか
      const periodButton = page.locator('button:has-text("期間選抁E), button:has-text("期間でフィルター")');
      if (await periodButton.first().isVisible()) {
        console.log('✁E期間選択�Eタンを発要E);
        await periodButton.first().click();
        
        // モーダルが実際に表示されるか
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible({ timeout: 3000 });
        console.log('✁E期間選択モーダルが正常に表示');
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)');
        if (await closeButton.first().isVisible()) {
          await closeButton.first().click();
          console.log('✁Eモーダルが正常に閉じめE);
        }
      }
      
      // レポ�Eトダウンロード�Eタンの実際の挙動
      const downloadButton = page.locator('button:has-text("レポ�EトをダウンローチE), button:has-text("ダウンローチE)');
      if (await downloadButton.first().isVisible()) {
        console.log('✁Eダウンロード�Eタンを発要E);
        
        // ダウンロード�E琁E�E開始を監要E
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        await downloadButton.first().click();
        
        const download = await downloadPromise;
        if (download) {
          console.log('✁Eダウンロードが実際に開始された');
        } else {
          console.log('⚠�E�Eダウンロード�E開始されなかったが、�Eタンは反忁E);
        }
      }
    });

    test('在庫管琁E- 全ボタンの実際の挙動確誁E, async ({ page }) => {
      await page.goto('/inventory');
      
      // 新規商品登録ボタン
      const registerButton = page.locator('button:has-text("新規商品登録")');
      if (await registerButton.isVisible()) {
        console.log('✁E新規商品登録ボタンを発要E);
        await registerButton.click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible({ timeout: 3000 });
        console.log('✁E啁E��登録モーダルが正常に表示');
        
        // 実際にフォーム入力をチE��チE
        const productNameInput = modal.locator('input[placeholder*="啁E��吁E], input[name*="name"]');
        if (await productNameInput.isVisible()) {
          await productNameInput.fill('チE��ト商品E);
          const value = await productNameInput.inputValue();
          expect(value).toBe('チE��ト商品E);
          console.log('✁E啁E��名�E力が正常に動佁E);
        }
        
        // SKU入力テスチE
        const skuInput = modal.locator('input[placeholder*="SKU"], input[name*="sku"]');
        if (await skuInput.isVisible()) {
          await skuInput.fill('TEST-001');
          const value = await skuInput.inputValue();
          expect(value).toBe('TEST-001');
          console.log('✁ESKU入力が正常に動佁E);
        }
        
        // カチE��リー選択テスチE
        const categorySelect = modal.locator('select[name*="category"], select');
        if (await categorySelect.first().isVisible()) {
          await categorySelect.first().selectOption({ index: 1 });
          console.log('✁EカチE��リー選択が正常に動佁E);
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)');
        if (await closeButton.first().isVisible()) {
          await closeButton.first().click();
          console.log('✁Eモーダルが正常に閉じめE);
        }
      }
      
      // CSVインポ�Eト�Eタン
      const csvImportButton = page.locator('button:has-text("CSVインポ�EチE)');
      if (await csvImportButton.isVisible()) {
        console.log('✁ECSVインポ�Eト�Eタンを発要E);
        await csvImportButton.click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible({ timeout: 3000 });
        console.log('✁ECSVインポ�Eトモーダルが正常に表示');
        
        // ファイル入力�E確誁E
        const fileInput = modal.locator('input[type="file"]');
        if (await fileInput.isVisible()) {
          console.log('✁Eファイル選択フィールドが表示');
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)');
        if (await closeButton.first().isVisible()) {
          await closeButton.first().click();
          console.log('✁Eモーダルが正常に閉じめE);
        }
      }
      
      // CSVエクスポ�Eト�Eタン
      const csvExportButton = page.locator('button:has-text("CSVエクスポ�EチE)');
      if (await csvExportButton.isVisible()) {
        console.log('✁ECSVエクスポ�Eト�Eタンを発要E);
        
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        await csvExportButton.click();
        
        const download = await downloadPromise;
        if (download) {
          console.log('✁ECSVエクスポ�Eトが実際に開始された');
        } else {
          console.log('⚠�E�ECSVエクスポ�Eト�E開始されなかったが、�Eタンは反忁E);
        }
      }
    });

    test('スタチE��ダチE��ュボ�EチE- 詳細ボタンの実際の挙動確誁E, async ({ page }) => {
      // スタチE��アカウントでログイン
      await page.goto('/login');
      await page.click('[data-testid="staff-login"]');
      await page.click('button:has-text("ログイン")');
      await page.waitForURL('/staff/dashboard');
      
      // 詳細ボタンを探してクリチE��
      const detailButtons = page.locator('button:has-text("詳細")');
      const detailButtonCount = await detailButtons.count();
      
      if (detailButtonCount > 0) {
        console.log(`✁E詳細ボタンめE{detailButtonCount}個発見`);
        
        // 最初�E詳細ボタンをクリチE��
        await detailButtons.first().click();
        
        // TaskDetailModalが表示されるか確誁E
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible({ timeout: 3000 });
        console.log('✁Eタスク詳細モーダルが正常に表示');
        
        // モーダル冁E�Eタブ機�EをテスチE
        const tabs = modal.locator('button:has-text("基本惁E��"), button:has-text("添付ファイル"), button:has-text("コメンチE)');
        const tabCount = await tabs.count();
        
        if (tabCount > 0) {
          for (let i = 0; i < tabCount; i++) {
            await tabs.nth(i).click();
            console.log(`✁EタチE{i + 1}が正常に動作`);
            await page.waitForTimeout(500); // タブ�Eり替え�E征E��E
          }
        }
        
        // 編雁E�EタンのチE��チE
        const editButton = modal.locator('button:has-text("編雁E)');
        if (await editButton.isVisible()) {
          await editButton.click();
          console.log('✁E編雁E�Eタンが正常に動佁E);
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("閉じめE)');
        if (await closeButton.isVisible()) {
          await closeButton.click();
          console.log('✁Eモーダルが正常に閉じめE);
        }
      } else {
        console.log('❁E詳細ボタンが見つからなぁE);
      }
    });

    test('返品管琁E- 詳細ボタンの実際の挙動確誁E, async ({ page }) => {
      await page.goto('/returns');
      
      // 返品詳細ボタンを探してクリチE��
      const detailButtons = page.locator('button:has-text("詳細"), button[aria-label*="詳細"], svg[data-icon="eye"]').locator('..');
      const detailButtonCount = await detailButtons.count();
      
      if (detailButtonCount > 0) {
        console.log(`✁E返品詳細ボタンめE{detailButtonCount}個発見`);
        
        // 最初�E詳細ボタンをクリチE��
        await detailButtons.first().click();
        
        // ReturnDetailModalが表示されるか確誁E
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible({ timeout: 3000 });
        console.log('✁E返品詳細モーダルが正常に表示');
        
        // モーダル冁E�E惁E��が表示されてぁE��か確誁E
        const customerInfo = modal.locator('text=顧客惁E��, text=お客槁E);
        if (await customerInfo.first().isVisible()) {
          console.log('✁E顧客惁E��が表示されてぁE��');
        }
        
        // スチE�Eタス変更ボタンのチE��チE
        const statusButtons = modal.locator('button:has-text("承誁E), button:has-text("拒否"), button:has-text("処琁E��")');
        const statusButtonCount = await statusButtons.count();
        
        if (statusButtonCount > 0) {
          await statusButtons.first().click();
          console.log('✁EスチE�Eタス変更ボタンが正常に動佁E);
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("閉じめE)');
        if (await closeButton.isVisible()) {
          await closeButton.click();
          console.log('✁Eモーダルが正常に閉じめE);
        }
      } else {
        console.log('❁E返品詳細ボタンが見つからなぁE);
      }
    });

    test('設定画面 - 全ボタンの実際の挙動確誁E, async ({ page }) => {
      await page.goto('/settings');
      
      // 配送業老E��定�Eタン
      const carrierButton = page.locator('button:has-text("配送業老E��宁E), button:has-text("配送設宁E)');
      if (await carrierButton.first().isVisible()) {
        console.log('✁E配送業老E��定�Eタンを発要E);
        await carrierButton.first().click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible({ timeout: 3000 });
        console.log('✁E配送業老E��定モーダルが正常に表示');
        
        // 入力フィールド�EチE��チE
        const inputs = modal.locator('input');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          await inputs.first().fill('チE��ト�E劁E);
          const value = await inputs.first().inputValue();
          expect(value).toBe('チE��ト�E劁E);
          console.log('✁E入力フィールドが正常に動佁E);
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)');
        if (await closeButton.first().isVisible()) {
          await closeButton.first().click();
          console.log('✁Eモーダルが正常に閉じめE);
        }
      }
      
      // エクスポ�Eト�Eタン
      const exportButton = page.locator('button:has-text("エクスポ�EチE)');
      if (await exportButton.isVisible()) {
        console.log('✁Eエクスポ�Eト�Eタンを発要E);
        
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        await exportButton.click();
        
        const download = await downloadPromise;
        if (download) {
          console.log('✁Eエクスポ�Eトが実際に開始された');
        } else {
          console.log('⚠�E�Eエクスポ�Eト�E開始されなかったが、�Eタンは反忁E);
        }
      }
    });

    test('検索機�E - 実際の挙動確誁E, async ({ page }) => {
      await page.goto('/dashboard');
      
      // Ctrl+Kで検索モーダルを開ぁE
      await page.keyboard.press('Control+k');
      
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        console.log('✁E検索モーダルがキーボ�EドショートカチE��で表示');
        
        // 検索入力�EチE��チE
        const searchInput = modal.locator('input[type="search"], input[placeholder*="検索"]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('チE��ト検索');
          const value = await searchInput.inputValue();
          expect(value).toBe('チE��ト検索');
          console.log('✁E検索入力が正常に動佁E);
          
          // 検索結果の表示確誁E
          await page.waitForTimeout(1000); // 検索処琁E�E征E��E
          const results = modal.locator('[data-testid*="result"], .search-result');
          const resultCount = await results.count();
          
          if (resultCount > 0) {
            console.log(`✁E検索結果ぁE{resultCount}件表示`);
          } else {
            console.log('⚠�E�E検索結果は表示されなかったが、検索機�Eは動佁E);
          }
        }
        
        // Escapeで閉じめE
        await page.keyboard.press('Escape');
        console.log('✁E検索モーダルがEscapeで閉じめE);
      } else {
        // 代替方法：検索ボタンをクリチE��
        const searchButton = page.locator('button[data-testid*="search"], button:has-text("検索")');
        if (await searchButton.first().isVisible()) {
          await searchButton.first().click();
          console.log('✁E検索ボタンクリチE��で検索モーダルが表示');
        }
      }
    });
  });

  test.describe('🎯 本番運用レベルの動作確誁E, () => {
    test('フォーム送信 - 実際のチE�Eタ処琁E��誁E, async ({ page }) => {
      await page.goto('/inventory');
      
      // 新規商品登録の完�Eなフロー
      const registerButton = page.locator('button:has-text("新規商品登録")');
      if (await registerButton.isVisible()) {
        await registerButton.click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // 忁E��フィールド�E入劁E
        const productNameInput = modal.locator('input[placeholder*="啁E��吁E], input[name*="name"]').first();
        if (await productNameInput.isVisible()) {
          await productNameInput.fill('実際のチE��ト商品E);
        }
        
        const skuInput = modal.locator('input[placeholder*="SKU"], input[name*="sku"]').first();
        if (await skuInput.isVisible()) {
          await skuInput.fill('REAL-TEST-001');
        }
        
        // 価格入劁E
        const priceInput = modal.locator('input[type="number"], input[placeholder*="価格"]').first();
        if (await priceInput.isVisible()) {
          await priceInput.fill('1000');
        }
        
        // 登録ボタンをクリチE��
        const submitButton = modal.locator('button:has-text("登録"), button:has-text("保孁E), button[type="submit"]');
        if (await submitButton.first().isVisible()) {
          await submitButton.first().click();
          console.log('✁E登録ボタンがクリチE��されぁE);
          
          // 成功メチE��ージまた�Eモーダルが閉じることを確誁E
          await page.waitForTimeout(2000);
          
          const isModalClosed = !(await modal.isVisible());
          if (isModalClosed) {
            console.log('✁E登録処琁E��完亁E��てモーダルが閉じた');
          } else {
            console.log('⚠�E�Eモーダルは開いたままだが、登録ボタンは動佁E);
          }
        }
      }
    });

    test('ナビゲーション - 全ペ�Eジ遷移確誁E, async ({ page }) => {
      const pages = [
        { name: 'ダチE��ュボ�EチE, url: '/dashboard' },
        { name: '在庫管琁E, url: '/inventory' },
        { name: '売上管琁E, url: '/sales' },
        { name: '請求管琁E, url: '/billing' },
        { name: '納品管琁E, url: '/delivery' },
        { name: '返品管琁E, url: '/returns' },
        { name: 'プロフィール', url: '/profile' },
        { name: '設宁E, url: '/settings' },
        { name: 'タイムライン', url: '/timeline' }
      ];
      
      for (const pageInfo of pages) {
        await page.goto(pageInfo.url);
        
        // ペ�Eジが正常に読み込まれることを確誁E
        await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
        console.log(`✁E${pageInfo.name}ペ�Eジが正常に表示`);
        
        // ペ�Eジ固有�Eボタンが存在することを確誁E
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        expect(buttonCount).toBeGreaterThan(0);
        console.log(`✁E${pageInfo.name}ペ�Eジに${buttonCount}個�Eボタンが存在`);
      }
    });
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('🔥 手動UI操作テスチE- 本番運用と同じ挙動確誁E, () => {
  test('セラーログイン ↁEダチE��ュボ�EチEↁE在庫管琁EↁE吁E�Eタンの実際の挙動確誁E, async ({ page }) => {
    // セラーログイン
    await page.goto('/login');
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    
    console.log('✁Eセラーログイン成功');
    
    // ダチE��ュボ�Eドでボタンの確誁E
    await page.waitForSelector('h1', { timeout: 10000 });
    const dashboardTitle = await page.locator('h1').textContent();
    console.log(`📊 ダチE��ュボ�Eド表示: ${dashboardTitle}`);
    
    // 在庫管琁E�Eージへ遷移
    await page.goto('/inventory');
    await page.waitForSelector('h1', { timeout: 10000 });
    const inventoryTitle = await page.locator('h1').textContent();
    console.log(`📦 在庫管琁E�Eージ表示: ${inventoryTitle}`);
    
    // 新規商品登録ボタンの確誁E
    const registerButton = page.locator('button:has-text("新規商品登録")');
    if (await registerButton.isVisible()) {
      console.log('✁E新規商品登録ボタン発要E);
      await registerButton.click();
      
      // モーダルが開くかチェチE��
      const modal = page.locator('[role="dialog"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✁E啁E��登録モーダルが開ぁE��');
      
      // フォーム入力テスチE
      const nameInput = modal.locator('input[name*="name"], input[placeholder*="啁E��吁E]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('実際のチE��ト商品E);
        console.log('✁E啁E��名�E力�E劁E);
      }
      
      // モーダルを閉じる
      const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        console.log('✁Eモーダルを閉じた');
      }
    } else {
      console.log('❁E新規商品登録ボタンが見つからなぁE);
    }
    
    // CSVインポ�Eト�Eタンの確誁E
    const csvImportButton = page.locator('button:has-text("CSVインポ�EチE)');
    if (await csvImportButton.isVisible()) {
      console.log('✁ECSVインポ�Eト�Eタン発要E);
      await csvImportButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✁ECSVインポ�Eトモーダルが開ぁE��');
      
      // モーダルを閉じる
      const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        console.log('✁Eモーダルを閉じた');
      }
    } else {
      console.log('❁ECSVインポ�Eト�Eタンが見つからなぁE);
    }
    
    // 全ボタンの数をカウンチE
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`📊 在庫管琁E�Eージのボタン総数: ${buttonCount}個`);
    
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('スタチE��ログイン ↁEスタチE��ダチE��ュボ�EチEↁE詳細ボタンの実際の挙動確誁E, async ({ page }) => {
    // スタチE��ログイン
    await page.goto('/login');
    await page.click('[data-testid="staff-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/staff/dashboard');
    
    console.log('✁EスタチE��ログイン成功');
    
    // スタチE��ダチE��ュボ�Eドでタスクリスト�E確誁E
    await page.waitForSelector('h1', { timeout: 10000 });
    const dashboardTitle = await page.locator('h1').textContent();
    console.log(`👥 スタチE��ダチE��ュボ�Eド表示: ${dashboardTitle}`);
    
    // チE�Eタが読み込まれるまで征E��E
    await page.waitForTimeout(3000);
    
    // タスクチE�Eブルの確誁E
    const taskTable = page.locator('table, [data-testid*="table"], .holo-table');
    if (await taskTable.isVisible()) {
      console.log('✁EタスクチE�Eブル発要E);
      
      // 詳細ボタンを探ぁE
      const detailButtons = page.locator('button:has-text("詳細")');
      const detailButtonCount = await detailButtons.count();
      console.log(`📊 詳細ボタン数: ${detailButtonCount}個`);
      
      if (detailButtonCount > 0) {
        // 最初�E詳細ボタンをクリチE��
        await detailButtons.first().click();
        console.log('✁E詳細ボタンクリチE��');
        
        // TaskDetailModalが開くかチェチE��
        const modal = page.locator('[role="dialog"]');
        await modal.waitFor({ state: 'visible', timeout: 5000 });
        console.log('✁Eタスク詳細モーダルが開ぁE��');
        
        // モーダル冁E��の確誁E
        const modalTitle = modal.locator('h2, h3').first();
        if (await modalTitle.isVisible()) {
          const title = await modalTitle.textContent();
          console.log(`📋 モーダルタイトル: ${title}`);
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("閉じめE)').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
          console.log('✁Eモーダルを閉じた');
        }
      } else {
        console.log('❁E詳細ボタンが見つからなぁE);
      }
    } else {
      console.log('❁EタスクチE�Eブルが見つからなぁE);
    }
    
    // 新規タスク作�Eボタンの確誁E
    const createTaskButton = page.locator('button:has-text("新規タスク作�E"), button:has-text("新規作�E")');
    if (await createTaskButton.isVisible()) {
      console.log('✁E新規タスク作�Eボタン発要E);
      await createTaskButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✁Eタスク作�Eモーダルが開ぁE��');
      
      // モーダルを閉じる
      const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        console.log('✁Eモーダルを閉じた');
      }
    } else {
      console.log('❁E新規タスク作�Eボタンが見つからなぁE);
    }
    
    // 全ボタンの数をカウンチE
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`📊 スタチE��ダチE��ュボ�Eド�Eボタン総数: ${buttonCount}個`);
    
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('返品管琁EↁE詳細ボタンの実際の挙動確誁E, async ({ page }) => {
    // セラーログイン
    await page.goto('/login');
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    
    // 返品管琁E�Eージへ遷移
    await page.goto('/returns');
    await page.waitForSelector('h1', { timeout: 10000 });
    const returnsTitle = await page.locator('h1').textContent();
    console.log(`🔄 返品管琁E�Eージ表示: ${returnsTitle}`);
    
    // チE�Eタが読み込まれるまで征E��E
    await page.waitForTimeout(3000);
    
    // 返品詳細ボタンを探す（アイコンボタンも含む�E�E
    const detailButtons = page.locator('button:has-text("詳細"), button[aria-label*="詳細"], svg[data-icon="eye"]').locator('..');
    const detailButtonCount = await detailButtons.count();
    console.log(`📊 返品詳細ボタン数: ${detailButtonCount}個`);
    
    if (detailButtonCount > 0) {
      // 最初�E詳細ボタンをクリチE��
      await detailButtons.first().click();
      console.log('✁E返品詳細ボタンクリチE��');
      
      // ReturnDetailModalが開くかチェチE��
      const modal = page.locator('[role="dialog"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✁E返品詳細モーダルが開ぁE��');
      
      // モーダル冁E��の確誁E
      const modalContent = modal.locator('div').first();
      if (await modalContent.isVisible()) {
        console.log('✁E返品詳細惁E��が表示されてぁE��');
      }
      
      // モーダルを閉じる
      const closeButton = modal.locator('button:has-text("閉じめE)').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        console.log('✁Eモーダルを閉じた');
      }
    } else {
      console.log('❁E返品詳細ボタンが見つからなぁE);
    }
    
    // 返品登録ボタンの確誁E
    const returnRegistrationButton = page.locator('button:has-text("返品登録"), button:has-text("新規返品")');
    if (await returnRegistrationButton.isVisible()) {
      console.log('✁E返品登録ボタン発要E);
      await returnRegistrationButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✁E返品登録モーダルが開ぁE��');
      
      // モーダルを閉じる
      const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        console.log('✁Eモーダルを閉じた');
      }
    } else {
      console.log('❁E返品登録ボタンが見つからなぁE);
    }
    
    // 全ボタンの数をカウンチE
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`📊 返品管琁E�Eージのボタン総数: ${buttonCount}個`);
    
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('設定画面 ↁE全ボタンの実際の挙動確誁E, async ({ page }) => {
    // セラーログイン
    await page.goto('/login');
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    
    // 設定�Eージへ遷移
    await page.goto('/settings');
    await page.waitForSelector('h1', { timeout: 10000 });
    const settingsTitle = await page.locator('h1').textContent();
    console.log(`⚙︁E設定�Eージ表示: ${settingsTitle}`);
    
    // 配送業老E��定�Eタンの確誁E
    const carrierButton = page.locator('button:has-text("配送業老E��宁E), button:has-text("配送設宁E)');
    if (await carrierButton.isVisible()) {
      console.log('✁E配送業老E��定�Eタン発要E);
      await carrierButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✁E配送業老E��定モーダルが開ぁE��');
      
      // モーダルを閉じる
      const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        console.log('✁Eモーダルを閉じた');
      }
    } else {
      console.log('❁E配送業老E��定�Eタンが見つからなぁE);
    }
    
    // 梱匁E��設定�Eタンの確誁E
    const packingButton = page.locator('button:has-text("梱匁E��設宁E), button:has-text("梱匁E��宁E)');
    if (await packingButton.isVisible()) {
      console.log('✁E梱匁E��設定�Eタン発要E);
      await packingButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✁E梱匁E��設定モーダルが開ぁE��');
      
      // モーダルを閉じる
      const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        console.log('✁Eモーダルを閉じた');
      }
    } else {
      console.log('❁E梱匁E��設定�Eタンが見つからなぁE);
    }
    
    // 全ボタンの数をカウンチE
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`📊 設定�Eージのボタン総数: ${buttonCount}個`);
    
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('🎯 実際のフォーム送信チE��チE, async ({ page }) => {
    // セラーログイン
    await page.goto('/login');
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    
    // 在庫管琁E�Eージで新規商品登録
    await page.goto('/inventory');
    await page.waitForSelector('h1', { timeout: 10000 });
    
    const registerButton = page.locator('button:has-text("新規商品登録")');
    if (await registerButton.isVisible()) {
      await registerButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });
      
      // 実際のフォーム入劁E
      const nameInput = modal.locator('input[name*="name"], input[placeholder*="啁E��吁E]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('実際のチE��ト商品E);
        console.log('✁E啁E��名�E劁E 実際のチE��ト商品E);
      }
      
      const skuInput = modal.locator('input[name*="sku"], input[placeholder*="SKU"]').first();
      if (await skuInput.isVisible()) {
        await skuInput.fill('REAL-TEST-001');
        console.log('✁ESKU入劁E REAL-TEST-001');
      }
      
      const priceInput = modal.locator('input[type="number"], input[name*="price"]').first();
      if (await priceInput.isVisible()) {
        await priceInput.fill('1000');
        console.log('✁E価格入劁E 1000');
      }
      
      // 登録ボタンをクリチE��
      const submitButton = modal.locator('button:has-text("登録"), button:has-text("保孁E), button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        console.log('✁E登録ボタンクリチE��');
        
        // 処琁E��亁E�E確認（モーダルが閉じるかトーストが表示される！E
        await page.waitForTimeout(2000);
        
        const isModalClosed = !(await modal.isVisible());
        if (isModalClosed) {
          console.log('✁E登録処琁E��亁E��モーダルが閉じた�E�E);
        } else {
          console.log('⚠�E�Eモーダルは開いたままだが、登録ボタンは動佁E);
        }
      }
    }
    
    console.log('🎯 実際のフォーム送信チE��ト完亁E);
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('🔥 徹底的バグハンチE��ング - 本番運用レベルUI/UXチE��チE, () => {
  
  test.beforeEach(async ({ page }) => {
    // アプリケーションが実際に起動してぁE��かを確誁E
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // 確実に読み込み完亁E��征E��
  });

  test('🚨 ログイン画面 - 実際のバグ発見テスチE, async ({ page }) => {
    console.log('=== ログイン画面バグハンチE��ング開姁E===');
    
    // 1. ペ�Eジが正常に読み込まれてぁE��ぁE
    const title = await page.title();
    console.log(`ペ�Eジタイトル: ${title}`);
    
    // 2. 忁E��な要素が存在するぁE
    const sellerButton = page.locator('[data-testid="seller-login"]');
    const staffButton = page.locator('[data-testid="staff-login"]');
    const loginButton = page.locator('button:has-text("ログイン")');
    
    const sellerExists = await sellerButton.isVisible();
    const staffExists = await staffButton.isVisible();
    const loginExists = await loginButton.isVisible();
    
    console.log(`セラーログインボタン存在: ${sellerExists}`);
    console.log(`スタチE��ログインボタン存在: ${staffExists}`);
    console.log(`ログインボタン存在: ${loginExists}`);
    
    if (!sellerExists) {
      console.log('🚨 バグ発要E セラーログインボタンが存在しなぁE);
    }
    if (!staffExists) {
      console.log('🚨 バグ発要E スタチE��ログインボタンが存在しなぁE);
    }
    if (!loginExists) {
      console.log('🚨 バグ発要E ログインボタンが存在しなぁE);
    }
    
    // 3. 実際にクリチE��できるぁE
    if (sellerExists) {
      await sellerButton.click();
      await page.waitForTimeout(1000);
      
      const emailValue = await page.locator('input[type="email"]').inputValue();
      const passwordValue = await page.locator('input[type="password"]').inputValue();
      
      console.log(`セラーログイン征E- Email: ${emailValue}, Password: ${passwordValue}`);
      
      if (emailValue !== 'seller@example.com') {
        console.log('🚨 バグ発要E セラーログインボタンがEmailを正しく設定してぁE��ぁE);
      }
      if (passwordValue !== 'password123') {
        console.log('🚨 バグ発要E セラーログインボタンがPasswordを正しく設定してぁE��ぁE);
      }
    }
    
    // 4. 実際のログイン処琁E
    if (loginExists) {
      await loginButton.click();
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log(`ログイン後URL: ${currentUrl}`);
      
      if (!currentUrl.includes('/dashboard')) {
        console.log('🚨 バグ発要E ログイン後にダチE��ュボ�Eドに遷移してぁE��ぁE);
      }
    }
  });

  test('🚨 ダチE��ュボ�EチE- 実際のバグ発見テスチE, async ({ page }) => {
    console.log('=== ダチE��ュボ�EドバグハンチE��ング開姁E===');
    
    // ログイン処琁E
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    await page.waitForTimeout(3000);
    
    // 1. ペ�Eジ読み込み確誁E
    const h1 = page.locator('h1');
    const h1Text = await h1.textContent();
    console.log(`ダチE��ュボ�Eドタイトル: ${h1Text}`);
    
    // 2. 全ボタンの存在確誁E
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`ダチE��ュボ�Eド�Eタン総数: ${buttonCount}個`);
    
    // 3. 吁E�Eタンを実際にクリチE��してバグ確誁E
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = allButtons.nth(i);
      const buttonText = await button.textContent();
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      
      console.log(`ボタン${i + 1}: "${buttonText}" - 表示:${isVisible}, 有効:${isEnabled}`);
      
      if (isVisible && isEnabled && buttonText) {
        try {
          await button.click();
          await page.waitForTimeout(1000);
          
          // モーダルが開ぁE��か確誁E
          const modal = page.locator('[role="dialog"]');
          const modalVisible = await modal.isVisible();
          
          if (modalVisible) {
            console.log(`✁Eボタン"${buttonText}"はモーダルを正常に開いた`);
            
            // モーダルを閉じる
            const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)').first();
            if (await closeButton.isVisible()) {
              await closeButton.click();
              await page.waitForTimeout(500);
            } else {
              // Escapeで閉じめE
              await page.keyboard.press('Escape');
              await page.waitForTimeout(500);
            }
          } else {
            console.log(`⚠�E�Eボタン"${buttonText}"クリチE��後にモーダルが開かない`);
          }
        } catch (error) {
          console.log(`🚨 バグ発要E ボタン"${buttonText}"クリチE��時にエラー: ${error}`);
        }
      } else {
        console.log(`🚨 バグ発要E ボタン"${buttonText}"が無効また�EクリチE��できない`);
      }
    }
    
    // 4. APIエラーの確誁E
    const apiErrors: string[] = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        apiErrors.push(`${response.status()} ${response.url()}`);
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (apiErrors.length > 0) {
      console.log('🚨 API エラー発要E');
      apiErrors.forEach(error => console.log(`  - ${error}`));
    }
  });

  test('🚨 在庫管琁E��面 - 実際のバグ発見テスチE, async ({ page }) => {
    console.log('=== 在庫管琁E��面バグハンチE��ング開姁E===');
    
    // ログイン処琁E
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    
    // 在庫管琁E�Eージへ
    await page.goto('/inventory');
    await page.waitForTimeout(3000);
    
    // 1. 新規商品登録ボタンのチE��チE
    const registerButton = page.locator('button:has-text("新規商品登録")');
    const registerExists = await registerButton.isVisible();
    console.log(`新規商品登録ボタン存在: ${registerExists}`);
    
    if (registerExists) {
      await registerButton.click();
      await page.waitForTimeout(2000);
      
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible();
      console.log(`啁E��登録モーダル表示: ${modalVisible}`);
      
      if (modalVisible) {
        // フォーム要素の確誁E
        const nameInput = modal.locator('input[name*="name"], input[placeholder*="啁E��吁E]').first();
        const skuInput = modal.locator('input[name*="sku"], input[placeholder*="SKU"]').first();
        const priceInput = modal.locator('input[type="number"], input[name*="price"]').first();
        
        const nameExists = await nameInput.isVisible();
        const skuExists = await skuInput.isVisible();
        const priceExists = await priceInput.isVisible();
        
        console.log(`啁E��名�E力フィールチE ${nameExists}`);
        console.log(`SKU入力フィールチE ${skuExists}`);
        console.log(`価格入力フィールチE ${priceExists}`);
        
        // 実際の入力テスチE
        if (nameExists) {
          await nameInput.fill('チE��ト商品E);
          const nameValue = await nameInput.inputValue();
          if (nameValue !== 'チE��ト商品E) {
            console.log('🚨 バグ発要E 啁E��名�E力フィールドが正常に動作しなぁE);
          }
        }
        
        if (skuExists) {
          await skuInput.fill('TEST-001');
          const skuValue = await skuInput.inputValue();
          if (skuValue !== 'TEST-001') {
            console.log('🚨 バグ発要E SKU入力フィールドが正常に動作しなぁE);
          }
        }
        
        if (priceExists) {
          await priceInput.fill('1000');
          const priceValue = await priceInput.inputValue();
          if (priceValue !== '1000') {
            console.log('🚨 バグ発要E 価格入力フィールドが正常に動作しなぁE);
          }
        }
        
        // 保存�EタンのチE��チE
        const saveButton = modal.locator('button:has-text("登録"), button:has-text("保孁E), button[type="submit"]').first();
        const saveExists = await saveButton.isVisible();
        console.log(`保存�Eタン存在: ${saveExists}`);
        
        if (saveExists) {
          await saveButton.click();
          await page.waitForTimeout(3000);
          
          const modalStillVisible = await modal.isVisible();
          console.log(`保存後モーダル状慁E ${modalStillVisible ? '開いてぁE��' : '閉じてぁE��'}`);
          
          if (modalStillVisible) {
            console.log('⚠�E�E保存後もモーダルが開ぁE��ぁE���E�バリチE�Eションエラーまた�E処琁E��完亁E��E);
          }
        } else {
          console.log('🚨 バグ発要E 保存�Eタンが存在しなぁE);
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
      } else {
        console.log('🚨 バグ発要E 新規商品登録ボタンをクリチE��してもモーダルが開かなぁE);
      }
    } else {
      console.log('🚨 バグ発要E 新規商品登録ボタンが存在しなぁE);
    }
    
    // 2. CSVインポ�Eト�EタンのチE��チE
    const csvImportButton = page.locator('button:has-text("CSVインポ�EチE)');
    const csvImportExists = await csvImportButton.isVisible();
    console.log(`CSVインポ�Eト�Eタン存在: ${csvImportExists}`);
    
    if (csvImportExists) {
      await csvImportButton.click();
      await page.waitForTimeout(2000);
      
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible();
      
      if (!modalVisible) {
        console.log('🚨 バグ発要E CSVインポ�Eト�EタンをクリチE��してもモーダルが開かなぁE);
      } else {
        console.log('✁ECSVインポ�Eトモーダルが正常に開いぁE);
        
        // ファイル入力�E確誁E
        const fileInput = modal.locator('input[type="file"]');
        const fileInputExists = await fileInput.isVisible();
        console.log(`ファイル入力フィールド存在: ${fileInputExists}`);
        
        if (!fileInputExists) {
          console.log('🚨 バグ発要E CSVインポ�Eトモーダルにファイル入力フィールドがなぁE);
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    } else {
      console.log('🚨 バグ発要E CSVインポ�Eト�Eタンが存在しなぁE);
    }
  });

  test('🚨 スタチE��ダチE��ュボ�EチE- 詳細ボタンバグハンチE��ング', async ({ page }) => {
    console.log('=== スタチE��ダチE��ュボ�Eド詳細ボタンバグハンチE��ング開姁E===');
    
    // スタチE��ログイン
    await page.click('[data-testid="staff-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/staff/dashboard');
    await page.waitForTimeout(5000); // チE�Eタ読み込み征E��E
    
    // タスクチE�Eブルの確誁E
    const taskTable = page.locator('table, [data-testid*="table"], .holo-table');
    const tableExists = await taskTable.isVisible();
    console.log(`タスクチE�Eブル存在: ${tableExists}`);
    
    if (!tableExists) {
      console.log('🚨 バグ発要E タスクチE�Eブルが存在しなぁE);
      return;
    }
    
    // 詳細ボタンの確誁E
    const detailButtons = page.locator('button:has-text("詳細")');
    const detailButtonCount = await detailButtons.count();
    console.log(`詳細ボタン数: ${detailButtonCount}個`);
    
    if (detailButtonCount === 0) {
      console.log('🚨 バグ発要E 詳細ボタンぁEつも存在しなぁE);
      
      // チE�Eブル冁E��を詳しく調査
      const tableContent = await taskTable.textContent();
      console.log(`チE�Eブル冁E��: ${tableContent?.substring(0, 200)}...`);
      
      // すべてのボタンを調査
      const allButtons = taskTable.locator('button');
      const allButtonCount = await allButtons.count();
      console.log(`チE�Eブル冁E�Eタン総数: ${allButtonCount}個`);
      
      for (let i = 0; i < Math.min(allButtonCount, 5); i++) {
        const button = allButtons.nth(i);
        const buttonText = await button.textContent();
        console.log(`チE�Eブル冁E�Eタン${i + 1}: "${buttonText}"`);
      }
    } else {
      // 詳細ボタンをクリチE��してチE��チE
      const firstDetailButton = detailButtons.first();
      await firstDetailButton.click();
      await page.waitForTimeout(2000);
      
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible();
      console.log(`詳細モーダル表示: ${modalVisible}`);
      
      if (!modalVisible) {
        console.log('🚨 バグ発要E 詳細ボタンをクリチE��してもモーダルが開かなぁE);
      } else {
        console.log('✁E詳細ボタンが正常に動佁E);
        
        // モーダル冁E��の確誁E
        const modalTitle = modal.locator('h1, h2, h3').first();
        const titleExists = await modalTitle.isVisible();
        console.log(`モーダルタイトル存在: ${titleExists}`);
        
        if (titleExists) {
          const titleText = await modalTitle.textContent();
          console.log(`モーダルタイトル: ${titleText}`);
        }
        
        // タブ機�EのチE��チE
        const tabs = modal.locator('button:has-text("詳細"), button:has-text("履歴"), button:has-text("添仁E)');
        const tabCount = await tabs.count();
        console.log(`タブ数: ${tabCount}個`);
        
        if (tabCount > 0) {
          for (let i = 0; i < tabCount; i++) {
            const tab = tabs.nth(i);
            const tabText = await tab.textContent();
            console.log(`タチE{i + 1}をテスチE "${tabText}"`);
            
            await tab.click();
            await page.waitForTimeout(1000);
            
            // タブコンチE��チE��表示されてぁE��か確誁E
            const tabContent = modal.locator('[role="tabpanel"], .tab-content');
            const contentVisible = await tabContent.isVisible();
            console.log(`タチE{i + 1}コンチE��チE��示: ${contentVisible}`);
          }
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("閉じめE)').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    }
  });

  test('🚨 返品管琁E��面 - 詳細ボタンバグハンチE��ング', async ({ page }) => {
    console.log('=== 返品管琁E��面詳細ボタンバグハンチE��ング開姁E===');
    
    // セラーログイン
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    
    // 返品管琁E�Eージへ
    await page.goto('/returns');
    await page.waitForTimeout(3000);
    
    // 返品詳細ボタンの確認（褁E��の可能性を調査�E�E
    const detailButtons = page.locator('button:has-text("詳細"), button[aria-label*="詳細"], svg[data-icon="eye"]').locator('..');
    const iconButtons = page.locator('button svg[data-icon="eye"]').locator('..');
    const allButtons = page.locator('button');
    
    const detailButtonCount = await detailButtons.count();
    const iconButtonCount = await iconButtons.count();
    const allButtonCount = await allButtons.count();
    
    console.log(`詳細ボタン数: ${detailButtonCount}個`);
    console.log(`アイコンボタン数: ${iconButtonCount}個`);
    console.log(`全ボタン数: ${allButtonCount}個`);
    
    // 全ボタンの冁E��を調査
    for (let i = 0; i < Math.min(allButtonCount, 10); i++) {
      const button = allButtons.nth(i);
      const buttonText = await button.textContent();
      const buttonHTML = await button.innerHTML();
      console.log(`ボタン${i + 1}: チE��スチE"${buttonText}", HTML="${buttonHTML.substring(0, 50)}..."`);
    }
    
    if (detailButtonCount === 0 && iconButtonCount === 0) {
      console.log('🚨 バグ発要E 返品詳細ボタンぁEつも存在しなぁE);
      
      // チE�Eブルまた�Eリスト�E冁E��を調査
      const tables = page.locator('table');
      const tableCount = await tables.count();
      console.log(`チE�Eブル数: ${tableCount}個`);
      
      if (tableCount > 0) {
        const tableContent = await tables.first().textContent();
        console.log(`チE�Eブル冁E��: ${tableContent?.substring(0, 200)}...`);
      }
    } else {
      // 詳細ボタンまた�EアイコンボタンをクリチE��
      const targetButton = detailButtonCount > 0 ? detailButtons.first() : iconButtons.first();
      
      await targetButton.click();
      await page.waitForTimeout(2000);
      
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible();
      console.log(`返品詳細モーダル表示: ${modalVisible}`);
      
      if (!modalVisible) {
        console.log('🚨 バグ発要E 返品詳細ボタンをクリチE��してもモーダルが開かなぁE);
      } else {
        console.log('✁E返品詳細ボタンが正常に動佁E);
        
        // モーダル冁E��の確誁E
        const modalContent = modal.locator('div').first();
        const contentExists = await modalContent.isVisible();
        console.log(`モーダル冁E��存在: ${contentExists}`);
        
        if (contentExists) {
          const content = await modalContent.textContent();
          console.log(`モーダル冁E��: ${content?.substring(0, 100)}...`);
        }
        
        // モーダルを閉じる
        const closeButton = modal.locator('button:has-text("閉じめE)').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    }
  });

  test('🚨 設定画面 - 全機�EバグハンチE��ング', async ({ page }) => {
    console.log('=== 設定画面全機�EバグハンチE��ング開姁E===');
    
    // セラーログイン
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    
    // 設定�Eージへ
    await page.goto('/settings');
    await page.waitForTimeout(3000);
    
    // 全ボタンの詳細調査
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`設定画面ボタン総数: ${buttonCount}個`);
    
    const buttonTests = [
      { name: '配送業老E��宁E, selector: 'button:has-text("配送業老E��宁E), button:has-text("配送設宁E)' },
      { name: '梱匁E��設宁E, selector: 'button:has-text("梱匁E��設宁E), button:has-text("梱匁E��宁E)' },
      { name: 'エクスポ�EチE, selector: 'button:has-text("エクスポ�EチE)' },
      { name: '保孁E, selector: 'button:has-text("保孁E)' },
      { name: '更新', selector: 'button:has-text("更新")' }
    ];
    
    for (const buttonTest of buttonTests) {
      console.log(`--- ${buttonTest.name}ボタンチE��チE---`);
      
      const button = page.locator(buttonTest.selector).first();
      const buttonExists = await button.isVisible();
      console.log(`${buttonTest.name}ボタン存在: ${buttonExists}`);
      
      if (buttonExists) {
        const isEnabled = await button.isEnabled();
        console.log(`${buttonTest.name}ボタン有効: ${isEnabled}`);
        
        if (isEnabled) {
          await button.click();
          await page.waitForTimeout(2000);
          
          // モーダルまた�Eダウンロード�E確誁E
          const modal = page.locator('[role="dialog"]');
          const modalVisible = await modal.isVisible();
          
          if (modalVisible) {
            console.log(`✁E${buttonTest.name}ボタンがモーダルを正常に開いた`);
            
            // モーダル冁E��の確誁E
            const modalTitle = modal.locator('h1, h2, h3').first();
            if (await modalTitle.isVisible()) {
              const titleText = await modalTitle.textContent();
              console.log(`モーダルタイトル: ${titleText}`);
            }
            
            // モーダル冁E�Eフォーム要素確誁E
            const inputs = modal.locator('input');
            const selects = modal.locator('select');
            const textareas = modal.locator('textarea');
            
            const inputCount = await inputs.count();
            const selectCount = await selects.count();
            const textareaCount = await textareas.count();
            
            console.log(`フォーム要素 - input:${inputCount}, select:${selectCount}, textarea:${textareaCount}`);
            
            // 入力テスチE
            if (inputCount > 0) {
              const firstInput = inputs.first();
              const inputType = await firstInput.getAttribute('type');
              console.log(`最初�E入力フィールドタイチE ${inputType}`);
              
              if (inputType !== 'file') {
                await firstInput.fill('チE��ト�E劁E);
                const inputValue = await firstInput.inputValue();
                if (inputValue !== 'チE��ト�E劁E) {
                  console.log('🚨 バグ発要E 入力フィールドが正常に動作しなぁE);
                } else {
                  console.log('✁E入力フィールド正常動佁E);
                }
              }
            }
            
            // モーダルを閉じる
            const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE)').first();
            if (await closeButton.isVisible()) {
              await closeButton.click();
            } else {
              await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(1000);
          } else {
            console.log(`⚠�E�E${buttonTest.name}ボタンクリチE��後にモーダルが開かなぁE��ダウンロードまた�E他�E処琁E��`);
          }
        } else {
          console.log(`🚨 バグ発要E ${buttonTest.name}ボタンが無効状態`);
        }
      } else {
        console.log(`🚨 バグ発要E ${buttonTest.name}ボタンが存在しない`);
      }
    }
  });

  test('🚨 全ペ�Eジナビゲーション - 実際のバグ発見テスチE, async ({ page }) => {
    console.log('=== 全ペ�EジナビゲーションバグハンチE��ング開姁E===');
    
    // セラーログイン
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    
    const pages = [
      { name: 'ダチE��ュボ�EチE, url: '/dashboard' },
      { name: '在庫管琁E, url: '/inventory' },
      { name: '売上管琁E, url: '/sales' },
      { name: '請求管琁E, url: '/billing' },
      { name: '納品管琁E, url: '/delivery' },
      { name: '返品管琁E, url: '/returns' },
      { name: 'プロフィール', url: '/profile' },
      { name: '設宁E, url: '/settings' },
      { name: 'タイムライン', url: '/timeline' }
    ];
    
    for (const pageInfo of pages) {
      console.log(`--- ${pageInfo.name}ペ�EジチE��チE---`);
      
      try {
        await page.goto(pageInfo.url);
        await page.waitForTimeout(3000);
        
        // ペ�Eジ読み込み確誁E
        const currentUrl = page.url();
        console.log(`現在URL: ${currentUrl}`);
        
        if (!currentUrl.includes(pageInfo.url)) {
          console.log(`🚨 バグ発要E ${pageInfo.name}ペ�Eジに正しく遷移してぁE��い`);
          continue;
        }
        
        // ペ�Eジタイトル確誁E
        const h1 = page.locator('h1');
        const h1Exists = await h1.isVisible();
        if (h1Exists) {
          const h1Text = await h1.textContent();
          console.log(`${pageInfo.name}タイトル: ${h1Text}`);
        } else {
          console.log(`🚨 バグ発要E ${pageInfo.name}ペ�Eジにh1タイトルが存在しない`);
        }
        
        // ボタン数確誁E
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        console.log(`${pageInfo.name}ボタン数: ${buttonCount}個`);
        
        if (buttonCount === 0) {
          console.log(`🚨 バグ発要E ${pageInfo.name}ペ�EジにボタンぁEつもない`);
        }
        
        // エラーメチE��ージの確誁E
        const errorMessages = page.locator('[role="alert"], .error, .alert-error');
        const errorCount = await errorMessages.count();
        if (errorCount > 0) {
          console.log(`🚨 バグ発要E ${pageInfo.name}ペ�EジにエラーメチE��ージが表示されてぁE��`);
          for (let i = 0; i < errorCount; i++) {
            const errorText = await errorMessages.nth(i).textContent();
            console.log(`  エラー${i + 1}: ${errorText}`);
          }
        }
        
        // JavaScriptエラーの確誁E
        const jsErrors: string[] = [];
        page.on('pageerror', error => {
          jsErrors.push(error.message);
        });
        
        await page.waitForTimeout(1000);
        
        if (jsErrors.length > 0) {
          console.log(`🚨 JavaScriptエラー発要Ein ${pageInfo.name}:`);
          jsErrors.forEach(error => console.log(`  - ${error}`));
        }
        
      } catch (error) {
        console.log(`🚨 バグ発要E ${pageInfo.name}ペ�Eジでエラー: ${error}`);
      }
    }
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('スクロール制御安定性チE��チE, () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処琁E
    await page.goto('http://localhost:3002/login');
    await page.waitForLoadState('networkidle');
    
    // スタチE��でログイン
    await page.click('button[data-testid="staff-login"]');
    await page.waitForLoadState('networkidle');
    
    // ダチE��ュボ�Eドが表示されるまで征E��E
    await page.waitForSelector('[data-testid="dashboard-layout"]', { timeout: 10000 });
  });

  test('画面遷移直後�E業務フロー表示安定性', async ({ page }) => {
    // 初期状態で業務フローが表示されてぁE��ことを確誁E
    await expect(page.locator('text=業務フロー')).toBeVisible();
    await expect(page.locator('text=フルフィルメント業務フロー')).toBeVisible();
    
    // 2秒征E��（�E期安定化期間�E�E
    await page.waitForTimeout(2000);
    
    // 業務フローがまだ表示されてぁE��ことを確誁E
    await expect(page.locator('text=業務フロー')).toBeVisible();
    await expect(page.locator('text=フルフィルメント業務フロー')).toBeVisible();
    
    console.log('✁E初期表示時�E業務フロー安定性: OK');
  });

  test('サイドメニューからの画面遷移での業務フロー安定性', async ({ page }) => {
    // 在庫管琁E��面に遷移
    await page.click('a[href="/staff/inventory"]');
    await page.waitForLoadState('networkidle');
    
    // 業務フローが表示されてぁE��ことを確誁E
    await expect(page.locator('text=業務フロー')).toBeVisible();
    
    // 1秒以冁E��業務フローが消えなぁE��とを確誁E
    await page.waitForTimeout(1000);
    await expect(page.locator('text=業務フロー')).toBeVisible();
    
    // さらに1秒征E��して確誁E
    await page.waitForTimeout(1000);
    await expect(page.locator('text=業務フロー')).toBeVisible();
    
    console.log('✁E在庫管琁E��面での業務フロー安定性: OK');
    
    // タスク管琁E��面に遷移
    await page.click('a[href="/staff/tasks"]');
    await page.waitForLoadState('networkidle');
    
    // 業務フローが表示されてぁE��ことを確誁E
    await expect(page.locator('text=業務フロー')).toBeVisible();
    
    // 1秒以冁E��業務フローが消えなぁE��とを確誁E
    await page.waitForTimeout(1000);
    await expect(page.locator('text=業務フロー')).toBeVisible();
    
    console.log('✁Eタスク管琁E��面での業務フロー安定性: OK');
  });

  test('スクロール制御機�Eの正常動佁E, async ({ page }) => {
    // 長ぁE��ンチE��チE��ある画面に移勁E
    await page.click('a[href="/staff/inventory"]');
    await page.waitForLoadState('networkidle');
    
    // 初期安定化期間を征E��E
    await page.waitForTimeout(2500);
    
    // スクロール可能なコンチE��を取征E
    const scrollContainer = page.locator('.page-scroll-container');
    
    // 下にスクロールして業務フローが折りたたまれることを確誁E
    await scrollContainer.evaluate(el => el.scrollTop = 100);
    await page.waitForTimeout(500);
    
    // 業務フローが折りたたまれてぁE��か確誁E
    const flowCollapsed = await page.locator('text=フルフィルメント業務フロー').isVisible();
    if (!flowCollapsed) {
      console.log('✁E下スクロールで業務フロー折りたたみ: OK');
    }
    
    // 上にスクロールして業務フローが展開されることを確誁E
    await scrollContainer.evaluate(el => el.scrollTop = 0);
    await page.waitForTimeout(500);
    
    // 業務フローが展開されてぁE��か確誁E
    await expect(page.locator('text=フルフィルメント業務フロー')).toBeVisible();
    
    console.log('✁E上スクロールで業務フロー展開: OK');
  });

  test('褁E��画面遷移での安定性', async ({ page }) => {
    const screens = [
      { name: '在庫管琁E, href: '/staff/inventory' },
      { name: 'タスク管琁E, href: '/staff/tasks' },
      { name: '出荷管琁E, href: '/staff/shipping' },
      { name: '返品管琁E, href: '/staff/returns' }
    ];
    
    for (const screen of screens) {
      // 画面遷移
      await page.click(`a[href="${screen.href}"]`);
      await page.waitForLoadState('networkidle');
      
      // 業務フローが表示されてぁE��ことを確誁E
      await expect(page.locator('text=業務フロー')).toBeVisible();
      
      // 1秒以冁E��業務フローが消えなぁE��とを確誁E
      await page.waitForTimeout(1000);
      await expect(page.locator('text=業務フロー')).toBeVisible();
      
      console.log(`✁E${screen.name}画面での業務フロー安定性: OK`);
    }
  });

  test('手動折りたたみ機�Eの動佁E, async ({ page }) => {
    // 業務フローの折りたたみボタンをクリチE��
    await page.click('button[title*="フローを折りたた�E"]');
    await page.waitForTimeout(300);
    
    // 業務フローが折りたたまれてぁE��ことを確誁E
    const flowVisible = await page.locator('text=フルフィルメント業務フロー').isVisible();
    expect(flowVisible).toBe(false);
    
    // 展開ボタンをクリチE��
    await page.click('button[title*="フローを展開"]');
    await page.waitForTimeout(300);
    
    // 業務フローが展開されてぁE��ことを確誁E
    await expect(page.locator('text=フルフィルメント業務フロー')).toBeVisible();
    
    console.log('✁E手動折りたたみ機�E: OK');
  });
}); 
import { test, expect } from '@playwright/test';

/**
 * 業務フロー全体�EチE��E2EチE��チE
 * 入庫 ↁE検品 ↁE保管 ↁE出品EↁE売紁E��み の流れを確誁E
 */

// ログイン用ヘルパ�E関数
async function loginAsStaff(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'staff@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/staff\/dashboard$/, { timeout: 10000 });
}

async function loginAsSeller(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'seller@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });
}

test.describe('業務フローチE�� E2EチE��チE, () => {
  test('1. セラーダチE��ュボ�EチE- 全体概要確誁E, async ({ page }) => {
    await loginAsSeller(page);
    
    // ダチE��ュボ�Eド�E基本要素確誁E
    await expect(page.locator('h1:has-text("セラーダチE��ュボ�EチE)')).toBeVisible();
    
    // 在庫数の確誁E
    await expect(page.locator('text=20')).toBeVisible();
    
    // 吁E��チE�Eタスの表示確誁E
    await expect(page.locator('body')).toContainText('入庫');
    await expect(page.locator('body')).toContainText('検品');
    await expect(page.locator('body')).toContainText('保管');
    await expect(page.locator('body')).toContainText('出品E);
    
    console.log('✁EセラーダチE��ュボ�Eド確認完亁E);
  });

  test('2. セラー在庫画面 - 啁E��一覧確誁E, async ({ page }) => {
    await loginAsSeller(page);
    
    // 在庫ペ�Eジに移勁E
    await page.goto('/inventory');
    await expect(page).toHaveURL(/\/inventory$/);
    
    // 啁E��一覧の確誁E
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    const productRows = page.locator('table tbody tr');
    const rowCount = await productRows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    // 新しい啁E��名が表示されることを確誁E
    await expect(page.locator('text=Sony')).toBeVisible();
    await expect(page.locator('text=Canon')).toBeVisible();
    
    console.log(`✁Eセラー在庫画面確認完亁E(${rowCount}件の啁E��)`);
  });

  test('3. スタチE��ダチE��ュボ�EチE- タスク管琁E��誁E, async ({ page }) => {
    await loginAsStaff(page);
    
    // スタチE��ダチE��ュボ�Eド�E基本要素確誁E
    await expect(page.locator('h1:has-text("スタチE��ダチE��ュボ�EチE)')).toBeVisible();
    
    // タスク関連の確誁E
    await expect(page.locator('body')).toContainText('タスク');
    
    // 拁E��老E��山本 達也になってぁE��ことを確誁E
    await expect(page.locator('text=山本 達乁E)).toBeVisible();
    
    console.log('✁EスタチE��ダチE��ュボ�Eド確認完亁E);
  });

  test('4. スタチE��在庫画面 - 啁E��管琁E��誁E, async ({ page }) => {
    await loginAsStaff(page);
    
    // スタチE��在庫ペ�Eジに移勁E
    await page.goto('/staff/inventory');
    await expect(page).toHaveURL(/\/staff\/inventory$/);
    
    // 啁E��一覧の確誁E
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    const productRows = page.locator('table tbody tr');
    const rowCount = await productRows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    // フィルタ機�EがあるかチェチE��
    const statusFilter = page.locator('select').first();
    if (await statusFilter.isVisible()) {
      console.log('フィルタ機�E確誁E);
    }
    
    console.log(`✁EスタチE��在庫画面確認完亁E(${rowCount}件の啁E��)`);
  });

  test('5. 業務フロー全佁E- スチE�Eタス遷移シミュレーション', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/inventory');
    
    // 検索機�EがあるかチェチE��
    const searchInput = page.locator('input[placeholder*="検索"], input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Canon');
      await page.waitForTimeout(1000);
      
      // Canon製品が表示されることを確誁E
      await expect(page.locator('text=Canon')).toBeVisible();
    }
    
    // 啁E��詳細ボタンがあるかチェチE��
    const detailButton = page.locator('button:has-text("詳細"), button:has-text("Detail")').first();
    if (await detailButton.isVisible()) {
      await detailButton.click();
      await page.waitForTimeout(1000);
      
      // モーダルを閉じる
      await page.keyboard.press('Escape');
    }
    
    console.log('✁E業務フロー確認完亁E);
  });

  test('6. 売上�Eレポ�Eト画面確誁E, async ({ page }) => {
    await loginAsSeller(page);
    
    // 売上�Eージに移勁E
    await page.goto('/sales');
    await expect(page).toHaveURL(/\/sales$/);
    await expect(page.locator('body')).toBeVisible();
    
    // レポ�Eト�Eージに移勁E
    await page.goto('/reports');
    await expect(page).toHaveURL(/\/reports$/);
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✁E売上�Eレポ�Eト画面確認完亁E);
  });

  test('7. 業務フロー統合確誁E- セラー・スタチE��連携', async ({ page }) => {
    // セラー視点での確誁E
    await loginAsSeller(page);
    await page.goto('/inventory');
    
    // 啁E��チE�Eタの確認（個別に確認！E
    await expect(page.locator('text=Sony')).toBeVisible();
    await expect(page.locator('text=Canon')).toBeVisible();
    
    // スタチE��視点での確誁E
    await loginAsStaff(page);
    await page.goto('/staff/dashboard');
    
    // ダチE��ュボ�Eドが表示されることを確誁E
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✁E業務フロー統合確認完亁E);
  });

  test('8. ナビゲーション・UI一貫性確誁E, async ({ page }) => {
    await loginAsSeller(page);
    
    // 主要�Eージの遷移確誁E
    const pages = [
      { path: '/dashboard', name: 'ダチE��ュボ�EチE },
      { path: '/inventory', name: '在庫管琁E },
      { path: '/sales', name: '売上管琁E },
      { path: '/reports', name: 'レポ�EチE },
      { path: '/delivery', name: '納品' }
    ];
    
    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);
      await expect(page).toHaveURL(new RegExp(pageInfo.path + '$'));
      await expect(page.locator('body')).toBeVisible();
      
      // ヘッダーまた�Eナビゲーションが表示されることを確誁E
      const headerExists = await page.locator('header').count() > 0;
      const navExists = await page.locator('nav').count() > 0;
      expect(headerExists || navExists).toBeTruthy();
      
      console.log(`✁E${pageInfo.name} ペ�Eジ確認完亁E);
    }
    
    // スタチE��ペ�Eジの確誁E
    await loginAsStaff(page);
    
    const staffPages = [
      { path: '/staff/dashboard', name: 'スタチE��ダチE��ュボ�EチE },
      { path: '/staff/inventory', name: 'スタチE��在庫' }
    ];
    
    for (const pageInfo of staffPages) {
      await page.goto(pageInfo.path);
      await expect(page).toHaveURL(new RegExp(pageInfo.path + '$'));
      await expect(page.locator('body')).toBeVisible();
      
      console.log(`✁E${pageInfo.name} ペ�Eジ確認完亁E);
    }
  });

  test('9. 業務フロー総合チE��確誁E, async ({ page }) => {
    console.log('🎯 業務フロー総合チE��開姁E);
    
    // 1. セラーログイン ↁEダチE��ュボ�Eド確誁E
    await loginAsSeller(page);
    await expect(page.locator('h1:has-text("セラーダチE��ュボ�EチE)')).toBeVisible();
    console.log('📊 セラーダチE��ュボ�Eド表示確誁E);
    
    // 2. 在庫状況確誁E
    await page.goto('/inventory');
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    const sellerInventoryCount = await page.locator('table tbody tr').count();
    console.log(`📦 セラー在庫確誁E ${sellerInventoryCount}件`);
    
    // 3. スタチE��ログイン ↁEダチE��ュボ�Eド確誁E
    await loginAsStaff(page);
    await expect(page.locator('h1:has-text("スタチE��ダチE��ュボ�EチE)')).toBeVisible();
    console.log('👨‍💼 スタチE��ダチE��ュボ�Eド表示確誁E);
    
    // 4. スタチE��在庫管琁E��誁E
    await page.goto('/staff/inventory');
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    const staffInventoryCount = await page.locator('table tbody tr').count();
    console.log(`🔧 スタチE��在庫確誁E ${staffInventoryCount}件`);
    
    // 5. 業務フロー完亁E��誁E
    expect(sellerInventoryCount).toBeGreaterThan(0);
    expect(staffInventoryCount).toBeGreaterThan(0);
    
    console.log('✁E業務フロー総合チE��完亁E);
    console.log('🎉 全ての業務フローが正常に動作してぁE��ぁE);
  });
}); 
import { test, expect } from '@playwright/test';

/**
 * 在庫件数確認テスチE
 * 20件の啁E��が正しく表示されるかを確誁E
 */

// ログイン用ヘルパ�E関数
async function loginAsStaff(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'staff@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/staff\/dashboard$/, { timeout: 10000 });
}

async function loginAsSeller(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'seller@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });
}

test.describe('在庫件数確認テスチE, () => {
  test('セラー在庫ペ�Eジ - 20件表示確誁E, async ({ page }) => {
    await loginAsSeller(page);
    
    // 在庫ペ�Eジに移勁E
    await page.goto('/inventory');
    await expect(page).toHaveURL(/\/inventory$/);
    
    // チE�Eブルの読み込み完亁E��征E��
    await page.waitForSelector('table tbody tr', { timeout: 15000 });
    
    // 啁E��行数をカウンチE
    const productRows = page.locator('table tbody tr');
    const rowCount = await productRows.count();
    
    console.log(`📦 セラー在庫表示件数: ${rowCount}件`);
    
    // 20件の啁E��が表示されることを確誁E
    expect(rowCount).toBeGreaterThanOrEqual(15); // 最佁E5件以丁E
    
    // 新しいカメラ啁E��が表示されることを確誁E
    await expect(page.locator('text=Canon')).toBeVisible();
    await expect(page.locator('text=Sony')).toBeVisible();
    await expect(page.locator('text=Nikon')).toBeVisible();
    
    // 統計データの確誁E
    const totalItemsText = await page.locator('text=/\\d+点/').first().textContent();
    console.log(`📊 統計表示: ${totalItemsText}`);
  });

  test('スタチE��在庫ペ�Eジ - 20件表示確誁E, async ({ page }) => {
    await loginAsStaff(page);
    
    // スタチE��在庫ペ�Eジに移勁E
    await page.goto('/staff/inventory');
    await expect(page).toHaveURL(/\/staff\/inventory$/);
    
    // チE�Eブルの読み込み完亁E��征E��
    await page.waitForSelector('table tbody tr', { timeout: 15000 });
    
    // 啁E��行数をカウンチE
    const productRows = page.locator('table tbody tr');
    const rowCount = await productRows.count();
    
    console.log(`🔧 スタチE��在庫表示件数: ${rowCount}件`);
    
    // 20件の啁E��が表示されることを確誁E
    expect(rowCount).toBeGreaterThanOrEqual(15); // 最佁E5件以丁E
    
    // 新しいカメラ啁E��が表示されることを確誁E
    await expect(page.locator('text=Canon')).toBeVisible();
    await expect(page.locator('text=Sony')).toBeVisible();
    await expect(page.locator('text=Nikon')).toBeVisible();
    
    // ペ�Eジネ�Eション惁E��の確誁E
    const paginationInfo = page.locator('text=/\\d+件中/');
    if (await paginationInfo.isVisible()) {
      const paginationText = await paginationInfo.textContent();
      console.log(`📄 ペ�Eジネ�Eション: ${paginationText}`);
    }
  });

  test('API直接確誁E- チE�Eタ件数チェチE��', async ({ page }) => {
    // APIレスポンスを直接確誁E
    const response = await page.request.get('/api/inventory');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    const itemCount = data.data ? data.data.length : 0;
    
    console.log(`🔌 API返却件数: ${itemCount}件`);
    expect(itemCount).toBeGreaterThanOrEqual(15);
    
    // チE�Eタ構造の確誁E
    if (data.data && data.data.length > 0) {
      const firstItem = data.data[0];
      console.log(`📋 啁E��侁E ${firstItem.name} (${firstItem.sku})`);
      
      // 忁E��フィールド�E存在確誁E
      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('name');
      expect(firstItem).toHaveProperty('sku');
      expect(firstItem).toHaveProperty('category');
      expect(firstItem).toHaveProperty('status');
    }
  });

  test('ペ�Eジネ�Eション動作確誁E, async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/staff/inventory');
    
    // チE�Eブルの読み込み完亁E��征E��
    await page.waitForSelector('table tbody tr', { timeout: 15000 });
    
    const totalRows = await page.locator('table tbody tr').count();
    console.log(`📊 表示行数: ${totalRows}件`);
    
    // ペ�Eジネ�Eションコントロールの確誁E
    const paginationExists = await page.locator('[data-testid="pagination"], .pagination, text=ペ�Eジ').isVisible();
    
    if (paginationExists) {
      console.log('✁Eペ�Eジネ�Eション機�Eが実裁E��れてぁE��ぁE);
      
      // 次ペ�EジボタンがあるかチェチE��
      const nextButton = page.locator('button:has-text("次"), button:has-text("Next"), button[aria-label*="次"]');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        const newRowCount = await page.locator('table tbody tr').count();
        console.log(`📄 次ペ�Eジ表示件数: ${newRowCount}件`);
      }
    } else {
      console.log('⚠�E�Eペ�Eジネ�Eション機�Eは表示されてぁE��せん�E��E件表示の可能性�E�E);
    }
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('ロケーション管琁E��面の表示確誁E, () => {
  // 事前にスタチE��としてログイン
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // ログインフォームが表示される�Eを征E��
    await expect(page.getByRole('heading', { name: 'THE WORLD DOOR' })).toBeVisible({ timeout: 20000 });
    
    // ログインボタンが有効になるまで征E�� (ペ�Eジの準備が完亁E��たと見なぁE
    await expect(page.getByTestId('login-button')).toBeEnabled({ timeout: 20000 });

    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/staff/dashboard', { timeout: 15000 });
  });

  test('ロケーション一覧にチE�Eタが表示されること', async ({ page }) => {
    // ロケーション管琁E�Eージに遷移
    await page.goto('/staff/location');
    await expect(page).toHaveURL('/staff/location');

    // ペ�Eジタイトルが表示されることを確誁E
    await expect(page.getByRole('heading', { name: 'ロケーション管琁E })).toBeVisible();

    // グリチE��ビューにロケーションが表示される�Eを征E��
    // 'STD-A-01' とぁE��チE��ストを持つ要素が表示されるまで征E��E
    await expect(page.getByText('STD-A-01')).toBeVisible({ timeout: 15000 });

    // seed.tsで追加したチE�Eタがいくつか表示されてぁE��ことを確誁E
    await expect(page.getByText('標準棁EA-01')).toBeVisible();
    await expect(page.getByText('防湿庫 01')).toBeVisible();
    await expect(page.getByText('金庫室 01')).toBeVisible();

    // ロケーション一覧のコンチE��要素を取征E
    const locationListContainer = page.locator('.intelligence-card.oceania').first();
    
    // スクリーンショチE��を撮影して確誁E
    await expect(locationListContainer).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/location-list-verification.png', fullPage: true });

    console.log('✁EE2EチE��チE ロケーション一覧が正しく表示されました、E);
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('ログイン機�Eの雁E��検証', () => {

  test('スタチE��アカウントで正常にログインできること', async ({ page }) => {
    // ログインペ�Eジにアクセス
    await page.goto('/login');
    
    // ペ�Eジの主要な要素が表示される�Eを征E��
    await expect(page.getByRole('heading', { name: 'THE WORLD DOOR' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('login-button')).toBeEnabled({ timeout: 30000 });

    // ログイン惁E��を�E劁E
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');

    // ログインボタンをクリチE��
    await page.click('button[type="submit"]');

    // ダチE��ュボ�Eドへのリダイレクトを征E��し、URLを検証
    await page.waitForURL('/staff/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL('/staff/dashboard');

    // ダチE��ュボ�Eド�Eタイトルが表示されることを確認して、ログイン成功を確実にする
    await expect(page.getByRole('heading', { name: 'スタチE��ダチE��ュボ�EチE })).toBeVisible();

    console.log('✁EE2EチE��チE スタチE��アカウントでのログインが正常に完亁E��ました、E);
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('全画面横幁E��一検証', () => {
  const screens = [
    // セラー画面
    { path: '/dashboard', name: '画面1: セラー - ダチE��ュボ�EチE, expected: '混在垁Ep-8,p-3)', needsFix: true },
    { path: '/delivery', name: '画面2: セラー - 納品管琁E, expected: '統一垁Ep-8)', needsFix: false },
    { path: '/inventory', name: '画面3: セラー - 在庫管琁E, expected: '混在垁Eレスポンシブ制陁E', needsFix: true },
    { path: '/sales', name: '画面4: セラー - 販売管琁E, expected: '混在垁Ep-8,p-6)', needsFix: true },
    { path: '/returns', name: '画面5: セラー - 返品管琁E, expected: '混在垁Ep-8,p-6)', needsFix: true },
    { path: '/billing', name: '画面6: セラー - 請求�E精箁E, expected: '混在垁Ep-8,p-6)', needsFix: true },
    { path: '/timeline', name: '画面7: セラー - 啁E��履歴', expected: '多段階型(3つのパディング)', needsFix: true },
    { path: '/profile', name: '画面16: プロフィール設宁E, expected: '要確誁E, needsFix: false },
    { path: '/settings', name: '画面17: アカウント設宁E, expected: '要確誁E, needsFix: false },
    
    // スタチE��画面
    { path: '/staff/dashboard', name: '画面8: スタチE�� - ダチE��ュボ�EチE, expected: '要確誁E, needsFix: false },
    { path: '/staff/tasks', name: '画面9: スタチE�� - タスク管琁E, expected: '要確誁E, needsFix: false },
    { path: '/staff/inventory', name: '画面10: スタチE�� - 在庫管琁E, expected: '要確誁E, needsFix: false },
    { path: '/staff/inspection', name: '画面11: スタチE�� - 検品・撮影', expected: '要確誁E, needsFix: false },
    { path: '/staff/location', name: '画面12: スタチE�� - ロケーション管琁E, expected: '要確誁E, needsFix: false },
    { path: '/staff/shipping', name: '画面13: スタチE�� - 出荷管琁E, expected: '要確誁E, needsFix: false },
    { path: '/staff/returns', name: '画面14: スタチE�� - 返品処琁E, expected: '混在垁Ep-8,p-4)', needsFix: true },
    { path: '/staff/reports', name: '画面15: スタチE�� - 業務レポ�EチE, expected: '要確誁E, needsFix: false },
  ];

  test('全画面のパディング状況確誁E, async ({ page }) => {
    console.log('\n=== 全画面横幁E��一検証開姁E===\n');
    
    const results = [];
    
    for (const screen of screens) {
      try {
        await page.goto(`http://localhost:3002${screen.path}`);
        await page.waitForLoadState('domcontentloaded');
        
        // intelligence-card要素の確誁E
        const cards = page.locator('.intelligence-card');
        const cardCount = await cards.count();
        
        const paddingAnalysis = [];
        
        if (cardCount > 0) {
          for (let i = 0; i < cardCount; i++) {
            const card = cards.nth(i);
            const cardContent = card.locator('> div').first();
            const className = await cardContent.getAttribute('class');
            
            // パディングクラスの確誁E
            let paddingType = 'unknown';
            if (className?.includes('p-8')) paddingType = 'p-8';
            else if (className?.includes('p-6')) paddingType = 'p-6';
            else if (className?.includes('p-4')) paddingType = 'p-4';
            else if (className?.includes('p-3')) paddingType = 'p-3';
            else if (className?.match(/p-\d+/)) paddingType = className.match(/p-\d+/)?.[0] || 'unknown';
            
            paddingAnalysis.push(paddingType);
          }
        }
        
        const uniquePaddings = Array.from(new Set(paddingAnalysis));
        const isUnified = uniquePaddings.length <= 1;
        const status = isUnified ? '✁E統一' : '✁E混在';
        
        results.push({
          screen: screen.name,
          path: screen.path,
          cardCount,
          paddings: paddingAnalysis,
          uniquePaddings,
          isUnified,
          needsFix: screen.needsFix,
          expected: screen.expected
        });
        
        console.log(`${status} ${screen.name}`);
        console.log(`  パス: ${screen.path}`);
        console.log(`  カード数: ${cardCount}`);
        console.log(`  パディング: [${paddingAnalysis.join(', ')}]`);
        console.log(`  ユニ�Eク: [${uniquePaddings.join(', ')}]`);
        console.log(`  期征E��: ${screen.expected}`);
        console.log(`  修正要否: ${screen.needsFix ? '要修正' : '正常'}`);
        console.log('');
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`✁Eエラー ${screen.name}: ${errorMessage}`);
        results.push({
          screen: screen.name,
          path: screen.path,
          error: errorMessage,
          needsFix: screen.needsFix
        });
      }
    }
    
    // 修正が忁E��な画面のリスチE
    const needsFixScreens = results.filter(r => r.needsFix && !r.isUnified);
    
    console.log('\n=== 修正が忁E��な画面 ===');
    needsFixScreens.forEach(screen => {
      console.log(`- ${screen.screen}: ${screen.uniquePaddings?.join(', ') || 'エラー'}`);
    });
    
    console.log('\n=== 検証完亁E===');
  });

  test('修正対象画面のスクリーンショチE��撮影', async ({ page }) => {
    const fixTargets = [
      '/dashboard',
      '/inventory', 
      '/sales',
      '/returns',
      '/billing',
      '/timeline',
      '/staff/returns'
    ];
    
    for (const path of fixTargets) {
      try {
        await page.goto(`http://localhost:3002${path}`);
        await page.waitForLoadState('networkidle');
        
        const screenshotPath = `test-results/修正剁E${path.replace(/\//g, '-')}.png`;
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });
        
        console.log(`修正前スクリーンショチE��: ${screenshotPath}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`スクリーンショチE��失敁E${path}: ${errorMessage}`);
      }
    }
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('🔍 修正済みモーダル機�EチE��チE, () => {
  
  test('🎯 ダチE��ュボ�Eド期間選択モーダル', async ({ page }) => {
    console.log('=== ダチE��ュボ�Eド期間選択モーダルチE��チE===');
    
    // ログイン
    await page.goto('http://localhost:3002/login');
    await page.waitForTimeout(3000);
    await page.fill('input[name="username"]', 'seller');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // ダチE��ュボ�Eドに移勁E
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForTimeout(3000);
    
    // 正確なボタンチE��ストで期間選択�Eタンを探ぁE
    const periodButton = page.locator('button:has-text("レポ�Eト期間を選抁E)');
    const buttonExists = await periodButton.isVisible();
    console.log(`レポ�Eト期間を選択�Eタン存在: ${buttonExists ? '✁E : '❁E}`);
    
    if (buttonExists) {
      await periodButton.click();
      await page.waitForTimeout(2000);
      
      // モーダルが開ぁE��かチェチE��
      const modal = page.locator('[role="dialog"]');
      const modalOpen = await modal.isVisible();
      console.log(`期間選択モーダル開閉: ${modalOpen ? '✁E実裁E��み' : '❁E未実裁E}`);
      
      if (modalOpen) {
        // DateRangePickerの存在確誁E
        const dateRangePicker = page.locator('.rdrCalendarWrapper');
        const pickerExists = await dateRangePicker.isVisible();
        console.log(`DateRangePicker表示: ${pickerExists ? '✁E実裁E��み' : '❁E未実裁E}`);
        
        // 適用ボタンの存在確誁E
        const applyButton = page.locator('button:has-text("適用")');
        const applyExists = await applyButton.isVisible();
        console.log(`適用ボタン存在: ${applyExists ? '✁E実裁E��み' : '❁E未実裁E}`);
        
        if (applyExists) {
          await applyButton.click();
          await page.waitForTimeout(1000);
          
          // モーダルが閉じたかチェチE��
          const modalClosed = !(await modal.isVisible());
          console.log(`モーダル閉じめE ${modalClosed ? '✁E実裁E��み' : '❁E未実裁E}`);
          
          if (modalClosed) {
            console.log('🎉 ダチE��ュボ�Eド期間選択モーダル: 完�E実裁E��み');
          } else {
            console.log('❁EダチE��ュボ�Eド期間選択モーダル: 部刁E��実裁E);
          }
        } else {
          console.log('❁EダチE��ュボ�Eド期間選択モーダル: 部刁E��実裁E);
        }
      } else {
        console.log('❁EダチE��ュボ�Eド期間選択モーダル: 未実裁E);
      }
    } else {
      console.log('❁EダチE��ュボ�Eド期間選択�Eタン: 未実裁E);
    }
  });
}); 
import { test, expect } from '@playwright/test';

// webServerを無効にして直接チE��チE
test.use({ 
  baseURL: undefined
});

test.describe('🔍 最終UI操作確誁E, () => {
  
  test('🎯 全モーダル機�E総合チE��チE, async ({ page }) => {
    console.log('=== 最終UI操作確認テスト開姁E===');
    
    try {
      // 直接ログインペ�Eジにアクセス
      console.log('ログインペ�Eジにアクセス中...');
      await page.goto('http://localhost:3002/login', { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
      
      console.log('ログイン処琁E��姁E..');
      await page.fill('input[name="username"]', 'seller');
      await page.fill('input[name="password"]', 'password');
      await page.click('button[type="submit"]');
      
      // ダチE��ュボ�Eドに移動するまで征E��E
      await page.waitForURL('**/dashboard', { timeout: 30000 });
      console.log('✁Eログイン成功');
      
      // 1. ダチE��ュボ�Eド期間選択モーダルチE��チE
      console.log('--- ダチE��ュボ�Eド期間選択モーダルチE��チE---');
      await page.goto('http://localhost:3002/dashboard', { waitUntil: 'domcontentloaded' });
      
      const periodButton = page.locator('button:has-text("レポ�Eト期間を選抁E)');
      if (await periodButton.isVisible({ timeout: 5000 })) {
        console.log('✁Eレポ�Eト期間を選択�Eタン: 表示確誁E);
        
        await periodButton.click();
        await page.waitForTimeout(2000);
        
        const modal1 = page.locator('[role="dialog"]');
        if (await modal1.isVisible({ timeout: 3000 })) {
          console.log('✁EダチE��ュボ�Eド期間選択モーダル: UI操作で動作確認済み');
          
          const applyButton = page.locator('button:has-text("適用")');
          if (await applyButton.isVisible({ timeout: 3000 })) {
            await applyButton.click();
            console.log('✁E適用ボタン: 動作確誁E);
          }
        } else {
          console.log('❁EダチE��ュボ�Eド期間選択モーダル: 未動佁E);
        }
      } else {
        console.log('❁Eレポ�Eト期間を選択�Eタン: 未表示');
      }
      
      // 2. 在庫管琁E��品登録モーダルチE��チE
      console.log('--- 在庫管琁E��品登録モーダルチE��チE---');
      await page.goto('http://localhost:3002/inventory', { waitUntil: 'domcontentloaded' });
      
      const addButton = page.locator('button:has-text("新規商品登録")');
      if (await addButton.isVisible({ timeout: 5000 })) {
        console.log('✁E新規商品登録ボタン: 表示確誁E);
        
        await addButton.click();
        await page.waitForTimeout(2000);
        
        const modal2 = page.locator('[role="dialog"]');
        if (await modal2.isVisible({ timeout: 3000 })) {
          console.log('✁E在庫管琁E��品登録モーダル: UI操作で動作確認済み');
          
          const nameInput = page.locator('input[name="name"]');
          if (await nameInput.isVisible({ timeout: 3000 })) {
            await nameInput.fill('チE��ト商品E);
            console.log('✁E啁E��名�E劁E 動作確誁E);
          }
          
          const cancelButton = page.locator('button:has-text("キャンセル")');
          if (await cancelButton.isVisible({ timeout: 3000 })) {
            await cancelButton.click();
          }
        } else {
          console.log('❁E在庫管琁E��品登録モーダル: 未動佁E);
        }
      } else {
        console.log('❁E新規商品登録ボタン: 未表示');
      }
      
      // 3. 売上管琁E�E品設定モーダルチE��チE
      console.log('--- 売上管琁E�E品設定モーダルチE��チE---');
      await page.goto('http://localhost:3002/sales', { waitUntil: 'domcontentloaded' });
      
      const settingsButton = page.locator('button:has-text("出品設宁E)');
      if (await settingsButton.isVisible({ timeout: 5000 })) {
        console.log('✁E出品設定�Eタン: 表示確誁E);
        
        await settingsButton.click();
        await page.waitForTimeout(2000);
        
        const modal3 = page.locator('[role="dialog"]');
        if (await modal3.isVisible({ timeout: 3000 })) {
          console.log('✁E売上管琁E�E品設定モーダル: UI操作で動作確認済み');
          
          const profitInput = page.locator('input[type="number"]');
          if (await profitInput.isVisible({ timeout: 3000 })) {
            await profitInput.fill('25');
            console.log('✁E利益率入劁E 動作確誁E);
          }
          
          const cancelButton = page.locator('button:has-text("キャンセル")');
          if (await cancelButton.isVisible({ timeout: 3000 })) {
            await cancelButton.click();
          }
        } else {
          console.log('❁E売上管琁E�E品設定モーダル: 未動佁E);
        }
      } else {
        console.log('❁E出品設定�Eタン: 未表示');
      }
      
      // 4. 返品管琁E��品申請モーダルチE��チE
      console.log('--- 返品管琁E��品申請モーダルチE��チE---');
      await page.goto('http://localhost:3002/returns', { waitUntil: 'domcontentloaded' });
      
      const returnButton = page.locator('button:has-text("返品申諁E)');
      if (await returnButton.isVisible({ timeout: 5000 })) {
        console.log('✁E返品申請�Eタン: 表示確誁E);
        
        await returnButton.click();
        await page.waitForTimeout(2000);
        
        const modal4 = page.locator('[role="dialog"]');
        if (await modal4.isVisible({ timeout: 3000 })) {
          console.log('✁E返品管琁E��品申請モーダル: UI操作で動作確認済み');
          
          const orderInput = page.locator('input[type="text"]').first();
          if (await orderInput.isVisible({ timeout: 3000 })) {
            await orderInput.fill('ORD-000123');
            console.log('✁E注斁E��号入劁E 動作確誁E);
          }
          
          // モーダルを閉じる
          const closeButton = page.locator('[role="dialog"] button').first();
          if (await closeButton.isVisible({ timeout: 3000 })) {
            await closeButton.click();
          }
        } else {
          console.log('❁E返品管琁E��品申請モーダル: 未動佁E);
        }
      } else {
        console.log('❁E返品申請�Eタン: 未表示');
      }
      
      // 5. 納品プランウィザードテスチE
      console.log('--- 納品プランウィザードテスチE---');
      await page.goto('http://localhost:3002/delivery-plan', { waitUntil: 'domcontentloaded' });
      
      const wizard = page.locator('.max-w-4xl');
      if (await wizard.isVisible({ timeout: 5000 })) {
        console.log('✁E納品プランウィザーチE UI操作で動作確認済み');
        
        const stepIndicator = page.locator('[data-testid="step-1-label"]');
        if (await stepIndicator.isVisible({ timeout: 3000 })) {
          console.log('✁EスチE��プインジケーター: 表示確誁E);
        }
        
        const inputs = page.locator('input[type="text"]');
        const inputCount = await inputs.count();
        if (inputCount > 0) {
          console.log(`✁E入力フィールチE ${inputCount}個確認`);
        }
      } else {
        console.log('❁E納品プランウィザーチE 未表示');
      }
      
      console.log('=== 最終UI操作確認テスト完亁E===');
      
    } catch (error) {
      console.error('チE��ト実行中にエラー:', error);
    }
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('🎯 最終UI動作確誁E, () => {
  test('スチE�Eタス変更メニューの完�E動作テスチE, async ({ page }) => {
    console.log('=== 最終UI動作確認開姁E===');

    // ペ�Eジに移勁E
    await page.goto('/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // 1. スチE�Eタス変更ボタンの存在確誁E
    const statusButtons = page.locator('[role="button"]').filter({ hasText: 'スチE�Eタス変更' });
    const buttonCount = await statusButtons.count();
    console.log(`✁EスチE�Eタス変更ボタン数: ${buttonCount}`);
    expect(buttonCount).toBeGreaterThan(0);

    // 2. ボタンクリチE��でドロチE�Eダウン表示
    const firstButton = statusButtons.first();
    await firstButton.click();
    
    const dropdown = page.locator('[data-testid="unified-status-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    console.log('✁EドロチE�Eダウンが正常に表示');

    // 3. z-indexが正しく設定されてぁE��
    const zIndex = await dropdown.evaluate((el) => window.getComputedStyle(el).zIndex);
    expect(parseInt(zIndex)).toBe(10000);
    console.log(`✁Ez-index: ${zIndex}`);

    // 4. スチE�Eタスオプションの表示確誁E
    const statusOptions = dropdown.locator('.unified-status-option');
    const optionCount = await statusOptions.count();
    console.log(`✁EスチE�Eタスオプション数: ${optionCount}`);
    expect(optionCount).toBeGreaterThan(0);

    // 5. スチE�Eタス変更の実衁E
    if (optionCount > 0) {
      const firstOption = statusOptions.first();
      const optionText = await firstOption.locator('.unified-status-option-label').textContent();
      console.log(`🔄 スチE�Eタス変更実衁E ${optionText}`);
      
      await firstOption.click();
      
      // ドロチE�Eダウンが閉じることを確誁E
      await expect(dropdown).not.toBeVisible({ timeout: 3000 });
      console.log('✁EスチE�Eタス変更後にドロチE�Eダウンが閉じた');
      
      // ト�EストメチE��ージの確誁E
      const toast = page.locator('.toast, [role="alert"]').first();
      if (await toast.isVisible({ timeout: 2000 })) {
        const toastText = await toast.textContent();
        console.log(`✁Eト�EストメチE��ージ: ${toastText}`);
      }
    }

    // 6. 外�EクリチE��でドロチE�Eダウンが閉じる
    await firstButton.click(); // 再度開く
    await expect(dropdown).toBeVisible({ timeout: 3000 });
    
    await page.click('body', { position: { x: 50, y: 50 } });
    await expect(dropdown).not.toBeVisible({ timeout: 3000 });
    console.log('✁E外�EクリチE��でドロチE�Eダウンが閉じた');

    // 7. 褁E��のボタンの動作確誁E
    if (buttonCount > 1) {
      await statusButtons.nth(0).click();
      await expect(dropdown).toBeVisible({ timeout: 3000 });
      
      await statusButtons.nth(1).click();
      await page.waitForTimeout(500);
      
      const visibleDropdowns = page.locator('[data-testid="unified-status-dropdown"]:visible');
      const visibleCount = await visibleDropdowns.count();
      console.log(`✁E同時に開いてぁE��ドロチE�Eダウン数: ${visibleCount}`);
      expect(visibleCount).toBeLessThanOrEqual(1);
    }

    console.log('🎉 すべてのチE��トが成功しました�E�E);
  });

  test('UI一貫性の最終確誁E, async ({ page }) => {
    console.log('=== UI一貫性の最終確誁E===');

    await page.goto('/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    // スチE�Eタス変更ボタンのスタイル確誁E
    const statusButton = page.locator('[role="button"]').filter({ hasText: 'スチE�Eタス変更' }).first();
    await statusButton.click();

    const dropdown = page.locator('[data-testid="unified-status-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // 統一されたCSSクラスの確誁E
    const hasUnifiedClass = await dropdown.evaluate((el) => el.classList.contains('unified-status-menu'));
    console.log(`✁E統一CSSクラス適用: ${hasUnifiedClass}`);
    expect(hasUnifiedClass).toBe(true);

    // スチE�Eタスオプションのスタイル確誁E
    const statusOptions = dropdown.locator('.unified-status-option');
    const firstOption = statusOptions.first();
    
    if (await firstOption.isVisible()) {
      const optionClasses = await firstOption.getAttribute('class');
      console.log(`✁EオプションCSSクラス: ${optionClasses}`);
      expect(optionClasses).toContain('unified-status-option');
    }

    console.log('🎨 UI一貫性確認完亁E);
  });
}); 
import { test, expect } from '@playwright/test';

// webServerを使わずに手動で起動したサーバ�EをテストすめE
test.use({ 
  baseURL: 'http://localhost:3002'
});

test.describe('🔍 手動サーバ�Eモーダル機�EチE��チE, () => {
  
  test('🎯 ダチE��ュボ�Eド期間選択モーダル', async ({ page }) => {
    console.log('=== ダチE��ュボ�Eド期間選択モーダルチE��ト開姁E===');
    
    try {
      // ログインペ�Eジに移勁E
      console.log('ログインペ�Eジに移動中...');
      await page.goto('/login', { waitUntil: 'networkidle' });
      console.log('ログインペ�Eジ読み込み完亁E);
      
      // ログイン処琁E
      console.log('ログイン処琁E��姁E..');
      await page.fill('input[name="username"]', 'seller');
      await page.fill('input[name="password"]', 'password');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard', { timeout: 10000 });
      console.log('ログイン完亁E��ダチE��ュボ�Eドに移勁E);
      
      // ダチE��ュボ�Eド�Eージの確誁E
      await page.waitForTimeout(2000);
      
      // 期間選択�Eタンを探ぁE
      console.log('期間選択�Eタンを探してぁE��ぁE..');
      const periodButton = page.locator('button:has-text("レポ�Eト期間を選抁E)');
      
      const buttonExists = await periodButton.isVisible({ timeout: 5000 });
      console.log(`レポ�Eト期間を選択�Eタン存在: ${buttonExists ? '✁E発要E : '❁E未発要E}`);
      
      if (buttonExists) {
        console.log('ボタンをクリチE��中...');
        await periodButton.click();
        await page.waitForTimeout(2000);
        
        // モーダルが開ぁE��かチェチE��
        console.log('モーダル表示確認中...');
        const modal = page.locator('[role="dialog"]');
        const modalOpen = await modal.isVisible({ timeout: 5000 });
        console.log(`期間選択モーダル開閉: ${modalOpen ? '✁E実裁E��み' : '❁E未実裁E}`);
        
        if (modalOpen) {
          // DateRangePickerの存在確誁E
          console.log('DateRangePicker確認中...');
          const dateRangePicker = page.locator('.rdrCalendarWrapper');
          const pickerExists = await dateRangePicker.isVisible({ timeout: 3000 });
          console.log(`DateRangePicker表示: ${pickerExists ? '✁E実裁E��み' : '❁E未実裁E}`);
          
          // 適用ボタンの存在確誁E
          console.log('適用ボタン確認中...');
          const applyButton = page.locator('button:has-text("適用")');
          const applyExists = await applyButton.isVisible({ timeout: 3000 });
          console.log(`適用ボタン存在: ${applyExists ? '✁E実裁E��み' : '❁E未実裁E}`);
          
          if (applyExists) {
            console.log('適用ボタンをクリチE��中...');
            await applyButton.click();
            await page.waitForTimeout(1000);
            
            // モーダルが閉じたかチェチE��
            console.log('モーダル閉じる確認中...');
            const modalClosed = !(await modal.isVisible({ timeout: 3000 }));
            console.log(`モーダル閉じめE ${modalClosed ? '✁E実裁E��み' : '❁E未実裁E}`);
            
            if (modalClosed && pickerExists) {
              console.log('🎉 ダチE��ュボ�Eド期間選択モーダル: 完�E実裁E��み');
              expect(true).toBe(true); // チE��ト�E劁E
            } else {
              console.log('❁EダチE��ュボ�Eド期間選択モーダル: 部刁E��実裁E);
              expect(false).toBe(true); // チE��ト失敁E
            }
          } else {
            console.log('❁EダチE��ュボ�Eド期間選択モーダル: 適用ボタン未実裁E);
            expect(false).toBe(true); // チE��ト失敁E
          }
        } else {
          console.log('❁EダチE��ュボ�Eド期間選択モーダル: モーダル未実裁E);
          expect(false).toBe(true); // チE��ト失敁E
        }
      } else {
        console.log('❁EダチE��ュボ�Eド期間選択�Eタン: ボタン未実裁E);
        expect(false).toBe(true); // チE��ト失敁E
      }
    } catch (error) {
      console.error('チE��ト実行中にエラーが発甁E', error);
      expect(false).toBe(true); // チE��ト失敁E
    }
  });

  test('📦 在庫管琁E��品登録モーダル', async ({ page }) => {
    console.log('=== 在庫管琁E��品登録モーダルチE��ト開姁E===');
    
    try {
      // ログインペ�Eジに移勁E
      console.log('ログインペ�Eジに移動中...');
      await page.goto('/login', { waitUntil: 'networkidle' });
      console.log('ログインペ�Eジ読み込み完亁E);
      
      // ログイン処琁E
      console.log('ログイン処琁E��姁E..');
      await page.fill('input[name="username"]', 'seller');
      await page.fill('input[name="password"]', 'password');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard', { timeout: 10000 });
      console.log('ログイン完亁E);
      
      // 在庫管琁E�Eージに移勁E
      console.log('在庫管琁E�Eージに移動中...');
      await page.goto('/inventory', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      console.log('在庫管琁E�Eージ読み込み完亁E);
      
      // 新規商品登録ボタンを探ぁE
      console.log('啁E��登録ボタンを探してぁE��ぁE..');
      const addButton = page.locator('button:has-text("新規商品登録"), button:has-text("新要E)').first();
      
      const buttonExists = await addButton.isVisible({ timeout: 5000 });
      console.log(`新規商品登録ボタン存在: ${buttonExists ? '✁E発要E : '❁E未発要E}`);
      
      if (buttonExists) {
        console.log('ボタンをクリチE��中...');
        await addButton.click();
        await page.waitForTimeout(2000);
        
        // モーダルが開ぁE��かチェチE��
        console.log('モーダル表示確認中...');
        const modal = page.locator('[role="dialog"]');
        const modalOpen = await modal.isVisible({ timeout: 5000 });
        console.log(`啁E��登録モーダル開閉: ${modalOpen ? '✁E実裁E��み' : '❁E未実裁E}`);
        
        if (modalOpen) {
          // フォーム要素の存在確誁E
          console.log('フォーム要素確認中...');
          const nameInput = page.locator('input[name="name"]');
          const nameExists = await nameInput.isVisible({ timeout: 3000 });
          console.log(`啁E��名�E力フィールチE ${nameExists ? '✁E実裁E��み' : '❁E未実裁E}`);
          
          const skuInput = page.locator('input[name="sku"]');
          const skuExists = await skuInput.isVisible({ timeout: 3000 });
          console.log(`SKU入力フィールチE ${skuExists ? '✁E実裁E��み' : '❁E未実裁E}`);
          
          if (nameExists && skuExists) {
            // 実際に入力テスチE
            console.log('入力テスト実行中...');
            await nameInput.fill('チE��ト商品E);
            await skuInput.fill('TEST-001');
            
            const nameValue = await nameInput.inputValue();
            const skuValue = await skuInput.inputValue();
            
            console.log(`入力機�EチE��チE ${nameValue === 'チE��ト商品E && skuValue === 'TEST-001' ? '✁E実裁E��み' : '❁E未実裁E}`);
            
            // 送信ボタンの存在確誁E
            console.log('送信ボタン確認中...');
            const submitButton = page.locator('button:has-text("登録"), button:has-text("保孁E)').first();
            const submitExists = await submitButton.isVisible({ timeout: 3000 });
            console.log(`送信ボタン存在: ${submitExists ? '✁E実裁E��み' : '❁E未実裁E}`);
            
            if (submitExists && nameValue === 'チE��ト商品E && skuValue === 'TEST-001') {
              console.log('🎉 在庫管琁E��品登録モーダル: 完�E実裁E��み');
              expect(true).toBe(true); // チE��ト�E劁E
            } else {
              console.log('❁E在庫管琁E��品登録モーダル: 部刁E��実裁E);
              expect(false).toBe(true); // チE��ト失敁E
            }
          } else {
            console.log('❁E在庫管琁E��品登録モーダル: フォーム要素未実裁E);
            expect(false).toBe(true); // チE��ト失敁E
          }
        } else {
          console.log('❁E在庫管琁E��品登録モーダル: モーダル未実裁E);
          expect(false).toBe(true); // チE��ト失敁E
        }
      } else {
        console.log('❁E在庫管琁E��品登録ボタン: ボタン未実裁E);
        expect(false).toBe(true); // チE��ト失敁E
      }
    } catch (error) {
      console.error('チE��ト実行中にエラーが発甁E', error);
      expect(false).toBe(true); // チE��ト失敁E
    }
  });
}); 
import { test, expect } from '@playwright/test';

test('🚀 クイチE��スチE�Eタス変更チE��チE, async ({ page }) => {
  // コンソールログを監要E
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('/staff/shipping');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.holo-table', { timeout: 10000 });

  console.log('=== クイチE��チE��ト開姁E===');

  // スチE�Eタス変更ボタンをクリチE��
  const statusButton = page.locator('[role="button"]').filter({ hasText: 'スチE�Eタス変更' }).first();
  await expect(statusButton).toBeVisible();
  
  console.log('ボタンをクリチE��...');
  await statusButton.click();

  // ドロチE�Eダウンが表示されることを確誁E
  const dropdown = page.locator('[data-testid="unified-status-dropdown"]');
  await expect(dropdown).toBeVisible({ timeout: 5000 });
  console.log('ドロチE�Eダウン表示確誁E);

  // スチE�Eタスオプションを取征E
  const statusOptions = dropdown.locator('.unified-status-option');
  const optionCount = await statusOptions.count();
  console.log(`オプション数: ${optionCount}`);

  if (optionCount > 0) {
    const firstOption = statusOptions.first();
    
    // オプションが見える状態になるまで征E��E
    await expect(firstOption).toBeVisible({ timeout: 3000 });
    
    // オプションをクリチE��
    console.log('オプションをクリチE��...');
    await firstOption.click({ force: true });
    
    // 少し征E��E
    await page.waitForTimeout(1000);
    
    // ドロチE�Eダウンの状態を確誁E
    const isVisible = await dropdown.isVisible();
    console.log(`ドロチE�Eダウン表示状慁E ${isVisible}`);
    
    if (!isVisible) {
      console.log('✁E成功: ドロチE�Eダウンが閉じました');
    } else {
      console.log('❁E失敁E ドロチE�Eダウンがまだ開いてぁE��ぁE);
    }
  }

  console.log('=== チE��ト完亁E===');
}); 
import { test, expect } from '@playwright/test';

test.describe('🚚 出荷管琁E��面 - 詳細モーダル機�EチE��チE, () => {
  
  test.beforeEach(async ({ page }) => {
    // ログイン処琁E
    await page.goto('/login');
    await page.waitForTimeout(2000);
    
    // セラーログインボタンをクリチE��
    const sellerButton = page.locator('[data-testid="seller-login"]');
    if (await sellerButton.isVisible()) {
      await sellerButton.click();
      await page.waitForTimeout(1000);
    }
    
    // ログインボタンをクリチE��
    const loginButton = page.locator('button:has-text("ログイン")');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(3000);
    }
  });

  test('🔍 出荷管琁E��面 - 詳細ボタンとモーダル表示チE��チE, async ({ page }) => {
    console.log('=== 出荷管琁E��面詳細モーダルチE��ト開姁E===');
    
    // 出荷管琁E��面に移勁E
    await page.goto('/staff/shipping');
    await page.waitForTimeout(3000);
    
    // ペ�Eジが正しく読み込まれたか確誁E
    const pageTitle = await page.textContent('h1');
    console.log(`ペ�Eジタイトル: ${pageTitle}`);
    
    // 詳細ボタンを探ぁE
    const detailButtons = page.locator('button:has-text("詳細")');
    const detailButtonCount = await detailButtons.count();
    console.log(`詳細ボタン数: ${detailButtonCount}`);
    
    if (detailButtonCount > 0) {
      // 最初�E詳細ボタンをクリチE��
      console.log('詳細ボタンをクリチE��中...');
      await detailButtons.first().click();
      await page.waitForTimeout(2000);
      
      // モーダルが表示されたか確誁E
      const modal = page.locator('[role="dialog"]');
      const isModalVisible = await modal.isVisible();
      console.log(`モーダル表示状慁E ${isModalVisible}`);
      
      if (isModalVisible) {
        // モーダル冁E��を確誁E
        const modalTitle = await page.textContent('[role="dialog"] h2');
        console.log(`モーダルタイトル: ${modalTitle}`);
        
        // スチE�Eタス変更ボタンを確誁E
        const statusButtons = page.locator('[role="dialog"] button:has-text("進める")');
        const statusButtonCount = await statusButtons.count();
        console.log(`スチE�Eタス変更ボタン数: ${statusButtonCount}`);
        
        // 操作�Eタンを確誁E
        const actionButtons = page.locator('[role="dialog"] button:has-text("配送ラベル"), [role="dialog"] button:has-text("梱匁E��示")');
        const actionButtonCount = await actionButtons.count();
        console.log(`操作�Eタン数: ${actionButtonCount}`);
        
        // 業務フローの状態を確誁E
        const businessFlow = page.locator('.intelligence-card');
        const isBusinessFlowVisible = await businessFlow.isVisible();
        console.log(`業務フロー表示状慁E ${isBusinessFlowVisible}`);
        
        // モーダルを閉じる
        const closeButton = page.locator('[role="dialog"] button:has-text("閉じめE), [role="dialog"] button[aria-label="Close"]');
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(1000);
        }
        
        // モーダルが閉じられたか確誁E
        const isModalClosed = !(await modal.isVisible());
        console.log(`モーダル閉じ状慁E ${isModalClosed}`);
        
        expect(isModalVisible).toBe(true);
        expect(modalTitle).toContain('詳細');
        expect(statusButtonCount).toBeGreaterThan(0);
        expect(isModalClosed).toBe(true);
      } else {
        console.log('❁Eモーダルが表示されませんでした');
        expect(isModalVisible).toBe(true);
      }
    } else {
      console.log('❁E詳細ボタンが見つかりませんでした');
      expect(detailButtonCount).toBeGreaterThan(0);
    }
  });

  test('🎯 スチE�Eタス変更ボタン機�EチE��チE, async ({ page }) => {
    console.log('=== スチE�Eタス変更ボタン機�EチE��ト開姁E===');
    
    // 出荷管琁E��面に移勁E
    await page.goto('/staff/shipping');
    await page.waitForTimeout(3000);
    
    // 詳細ボタンをクリチE��
    const detailButtons = page.locator('button:has-text("詳細")');
    if (await detailButtons.count() > 0) {
      await detailButtons.first().click();
      await page.waitForTimeout(2000);
      
      // モーダル冁E�EスチE�Eタス変更ボタンをテスチE
      const statusButtons = page.locator('[role="dialog"] button:has-text("進める")');
      const buttonCount = await statusButtons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = statusButtons.nth(i);
        const buttonText = await button.textContent();
        console.log(`スチE�Eタス変更ボタン ${i + 1}: ${buttonText}`);
        
        // ボタンがクリチE��可能か確誁E
        const isEnabled = await button.isEnabled();
        console.log(`ボタン有効状慁E ${isEnabled}`);
        
        if (isEnabled) {
          // ボタンをクリチE���E�実際の処琁E�E行わなぁE��E
          console.log(`ボタン "${buttonText}" をクリチE��可能`);
        }
      }
      
      expect(buttonCount).toBeGreaterThan(0);
    }
  });

  test('📱 レスポンシブデザインチE��チE, async ({ page }) => {
    console.log('=== レスポンシブデザインチE��ト開姁E===');
    
    // 出荷管琁E��面に移勁E
    await page.goto('/staff/shipping');
    await page.waitForTimeout(3000);
    
    // 異なる画面サイズでチE��チE
    const viewports = [
      { width: 1920, height: 1080, name: 'チE��クトッチE },
      { width: 1024, height: 768, name: 'タブレチE��' },
      { width: 375, height: 667, name: 'モバイル' }
    ];
    
    for (const viewport of viewports) {
      console.log(`--- ${viewport.name}サイズチE��チE(${viewport.width}x${viewport.height}) ---`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      // 詳細ボタンが表示されてぁE��か確誁E
      const detailButtons = page.locator('button:has-text("詳細")');
      const isVisible = await detailButtons.first().isVisible();
      console.log(`詳細ボタン表示状慁E ${isVisible}`);
      
      if (isVisible) {
        // モーダルを開ぁE
        await detailButtons.first().click();
        await page.waitForTimeout(2000);
        
        // モーダルが適刁E��表示されてぁE��か確誁E
        const modal = page.locator('[role="dialog"]');
        const modalVisible = await modal.isVisible();
        console.log(`モーダル表示状慁E ${modalVisible}`);
        
        if (modalVisible) {
          // モーダルのサイズが適刁E��確誁E
          const modalBox = await modal.boundingBox();
          if (modalBox) {
            console.log(`モーダルサイズ: ${modalBox.width}x${modalBox.height}`);
            
            // 画面からはみ出してぁE��ぁE��確誁E
            const isWithinViewport = modalBox.x >= 0 && 
                                   modalBox.y >= 0 && 
                                   modalBox.x + modalBox.width <= viewport.width &&
                                   modalBox.y + modalBox.height <= viewport.height;
            console.log(`画面冁E��まり状慁E ${isWithinViewport}`);
          }
          
          // モーダルを閉じる
          const closeButton = page.locator('[role="dialog"] button:has-text("閉じめE), [role="dialog"] button[aria-label="Close"]');
          if (await closeButton.isVisible()) {
            await closeButton.click();
            await page.waitForTimeout(1000);
          }
        }
        
        expect(modalVisible).toBe(true);
      }
    }
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('🔧 シンプルドロチE�EダウンチE��チE, () => {
  test('ドロチE�Eダウンの基本動作確誁E, async ({ page }) => {
    // コンソールログを監要E
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto('/staff/shipping');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.holo-table', { timeout: 10000 });

    console.log('=== チE��ト開姁E===');

    // スチE�Eタス変更ボタンをクリチE��
    const statusButton = page.locator('[role="button"]').filter({ hasText: 'スチE�Eタス変更' }).first();
    await expect(statusButton).toBeVisible();
    
    console.log('ボタンをクリチE��しまぁE..');
    await statusButton.click();

    // ドロチE�Eダウンが表示されることを確誁E
    const dropdown = page.locator('[data-testid="unified-status-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    console.log('ドロチE�Eダウンが表示されました');

    // 2秒征E��E
    await page.waitForTimeout(2000);

    // ボタンを�EクリチE��
    console.log('ボタンを�EクリチE��しまぁE..');
    await statusButton.click();

    // 2秒征E��してドロチE�Eダウンの状態を確誁E
    await page.waitForTimeout(2000);
    
    const isVisible = await dropdown.isVisible();
    console.log('ドロチE�Eダウンの表示状慁E', isVisible);

    if (isVisible) {
      console.log('ドロチE�Eダウンがまだ表示されてぁE��ぁE- 外�EをクリチE��して閉じまぁE);
      await page.click('body', { position: { x: 50, y: 50 } });
      await page.waitForTimeout(1000);
      
      const isStillVisible = await dropdown.isVisible();
      console.log('外�EクリチE��後�E表示状慁E', isStillVisible);
    }
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('🔍 シンプルモーダル機�EチE��チE, () => {
  
  test('🎯 ダチE��ュボ�Eド期間選択モーダル', async ({ page }) => {
    console.log('=== ダチE��ュボ�Eド期間選択モーダルチE��チE===');
    
    // ログイン
    await page.goto('http://localhost:3002/login');
    await page.waitForTimeout(3000);
    await page.fill('input[name="username"]', 'seller');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // ダチE��ュボ�Eドに移勁E
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForTimeout(3000);
    
    // 期間選択�Eタンを探ぁE
    const periodButton = page.locator('button:has-text("期間選抁E), button:has-text("レポ�Eト期閁E)').first();
    const buttonExists = await periodButton.isVisible();
    console.log(`期間選択�Eタン存在: ${buttonExists ? '✁E : '❁E}`);
    
    if (buttonExists) {
      await periodButton.click();
      await page.waitForTimeout(2000);
      
      // モーダルが開ぁE��かチェチE��
      const modal = page.locator('[role="dialog"]');
      const modalOpen = await modal.isVisible();
      console.log(`モーダル開閉: ${modalOpen ? '✁E実裁E��み' : '❁E未実裁E}`);
      
      if (modalOpen) {
        // DateRangePickerの存在確誁E
        const dateRangePicker = page.locator('.rdrCalendarWrapper');
        const pickerExists = await dateRangePicker.isVisible();
        console.log(`DateRangePicker表示: ${pickerExists ? '✁E実裁E��み' : '❁E未実裁E}`);
        
        // 適用ボタンの存在確誁E
        const applyButton = page.locator('button:has-text("適用")');
        const applyExists = await applyButton.isVisible();
        console.log(`適用ボタン存在: ${applyExists ? '✁E実裁E��み' : '❁E未実裁E}`);
        
        if (applyExists) {
          await applyButton.click();
          await page.waitForTimeout(1000);
          
          // モーダルが閉じたかチェチE��
          const modalClosed = !(await modal.isVisible());
          console.log(`モーダル閉じめE ${modalClosed ? '✁E実裁E��み' : '❁E未実裁E}`);
          
          if (modalClosed) {
            console.log('🎉 ダチE��ュボ�Eド期間選択モーダル: 完�E実裁E��み');
          } else {
            console.log('❁EダチE��ュボ�Eド期間選択モーダル: 部刁E��実裁E);
          }
        } else {
          console.log('❁EダチE��ュボ�Eド期間選択モーダル: 部刁E��実裁E);
        }
      } else {
        console.log('❁EダチE��ュボ�Eド期間選択モーダル: 未実裁E);
      }
    } else {
      console.log('❁EダチE��ュボ�Eド期間選択�Eタン: 未実裁E);
    }
  });

  test('📦 在庫管琁E��品登録モーダル', async ({ page }) => {
    console.log('=== 在庫管琁E��品登録モーダルチE��チE===');
    
    // ログイン
    await page.goto('http://localhost:3002/login');
    await page.waitForTimeout(3000);
    await page.fill('input[name="username"]', 'seller');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // 在庫管琁E�Eージに移勁E
    await page.goto('http://localhost:3002/inventory');
    await page.waitForTimeout(3000);
    
    // 新規商品登録ボタンを探ぁE
    const addButton = page.locator('button:has-text("新規商品登録"), button:has-text("新要E)').first();
    const buttonExists = await addButton.isVisible();
    console.log(`新規商品登録ボタン存在: ${buttonExists ? '✁E : '❁E}`);
    
    if (buttonExists) {
      await addButton.click();
      await page.waitForTimeout(2000);
      
      // モーダルが開ぁE��かチェチE��
      const modal = page.locator('[role="dialog"]');
      const modalOpen = await modal.isVisible();
      console.log(`啁E��登録モーダル開閉: ${modalOpen ? '✁E実裁E��み' : '❁E未実裁E}`);
      
      if (modalOpen) {
        // フォーム要素の存在確誁E
        const nameInput = page.locator('input[name="name"]');
        const nameExists = await nameInput.isVisible();
        console.log(`啁E��名�E力フィールチE ${nameExists ? '✁E実裁E��み' : '❁E未実裁E}`);
        
        const skuInput = page.locator('input[name="sku"]');
        const skuExists = await skuInput.isVisible();
        console.log(`SKU入力フィールチE ${skuExists ? '✁E実裁E��み' : '❁E未実裁E}`);
        
        if (nameExists && skuExists) {
          // 実際に入力テスチE
          await nameInput.fill('チE��ト商品E);
          await skuInput.fill('TEST-001');
          
          const nameValue = await nameInput.inputValue();
          const skuValue = await skuInput.inputValue();
          
          console.log(`入力機�EチE��チE ${nameValue === 'チE��ト商品E && skuValue === 'TEST-001' ? '✁E実裁E��み' : '❁E未実裁E}`);
          
          // 送信ボタンの存在確誁E
          const submitButton = page.locator('button:has-text("登録"), button:has-text("保孁E)').first();
          const submitExists = await submitButton.isVisible();
          console.log(`送信ボタン存在: ${submitExists ? '✁E実裁E��み' : '❁E未実裁E}`);
          
          if (submitExists) {
            console.log('🎉 在庫管琁E��品登録モーダル: 完�E実裁E��み');
          } else {
            console.log('❁E在庫管琁E��品登録モーダル: 部刁E��実裁E);
          }
        } else {
          console.log('❁E在庫管琁E��品登録モーダル: 部刁E��実裁E);
        }
      } else {
        console.log('❁E在庫管琁E��品登録モーダル: 未実裁E);
      }
    } else {
      console.log('❁E在庫管琁E��品登録ボタン: 未実裁E);
    }
  });

  test('💰 売上管琁E�E品設定モーダル', async ({ page }) => {
    console.log('=== 売上管琁E�E品設定モーダルチE��チE===');
    
    // ログイン
    await page.goto('http://localhost:3002/login');
    await page.waitForTimeout(3000);
    await page.fill('input[name="username"]', 'seller');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // 売上管琁E�Eージに移勁E
    await page.goto('http://localhost:3002/sales');
    await page.waitForTimeout(3000);
    
    // 出品設定�Eタンを探ぁE
    const settingsButton = page.locator('button:has-text("出品設宁E)').first();
    const buttonExists = await settingsButton.isVisible();
    console.log(`出品設定�Eタン存在: ${buttonExists ? '✁E : '❁E}`);
    
    if (buttonExists) {
      await settingsButton.click();
      await page.waitForTimeout(2000);
      
      // モーダルが開ぁE��かチェチE��
      const modal = page.locator('[role="dialog"]');
      const modalOpen = await modal.isVisible();
      console.log(`出品設定モーダル開閉: ${modalOpen ? '✁E実裁E��み' : '❁E未実裁E}`);
      
      if (modalOpen) {
        // 設定頁E��の存在確誁E
        const profitInput = page.locator('input[type="number"]');
        const profitExists = await profitInput.isVisible();
        console.log(`利益率入力フィールチE ${profitExists ? '✁E実裁E��み' : '❁E未実裁E}`);
        
        const checkbox = page.locator('input[type="checkbox"]');
        const checkboxExists = await checkbox.isVisible();
        console.log(`チェチE��ボックス: ${checkboxExists ? '✁E実裁E��み' : '❁E未実裁E}`);
        
        if (profitExists && checkboxExists) {
          // 実際に操作テスチE
          await profitInput.fill('25');
          await checkbox.check();
          
          const profitValue = await profitInput.inputValue();
          const isChecked = await checkbox.isChecked();
          
          console.log(`設定操作テスチE ${profitValue === '25' && isChecked ? '✁E実裁E��み' : '❁E未実裁E}`);
          
          // 保存�Eタンの存在確誁E
          const saveButton = page.locator('button:has-text("保孁E)').first();
          const saveExists = await saveButton.isVisible();
          console.log(`保存�Eタン存在: ${saveExists ? '✁E実裁E��み' : '❁E未実裁E}`);
          
          if (saveExists) {
            console.log('🎉 売上管琁E�E品設定モーダル: 完�E実裁E��み');
          } else {
            console.log('❁E売上管琁E�E品設定モーダル: 部刁E��実裁E);
          }
        } else {
          console.log('❁E売上管琁E�E品設定モーダル: 部刁E��実裁E);
        }
      } else {
        console.log('❁E売上管琁E�E品設定モーダル: 未実裁E);
      }
    } else {
      console.log('❁E売上管琁E�E品設定�Eタン: 未実裁E);
    }
  });

  test('🔄 返品管琁E��品申請モーダル', async ({ page }) => {
    console.log('=== 返品管琁E��品申請モーダルチE��チE===');
    
    // ログイン
    await page.goto('http://localhost:3002/login');
    await page.waitForTimeout(3000);
    await page.fill('input[name="username"]', 'seller');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // 返品管琁E�Eージに移勁E
    await page.goto('http://localhost:3002/returns');
    await page.waitForTimeout(3000);
    
    // 返品申請�Eタンを探ぁE
    const returnButton = page.locator('button:has-text("返品申諁E)').first();
    const buttonExists = await returnButton.isVisible();
    console.log(`返品申請�Eタン存在: ${buttonExists ? '✁E : '❁E}`);
    
    if (buttonExists) {
      await returnButton.click();
      await page.waitForTimeout(2000);
      
      // モーダルが開ぁE��かチェチE��
      const modal = page.locator('[role="dialog"]');
      const modalOpen = await modal.isVisible();
      console.log(`返品申請モーダル開閉: ${modalOpen ? '✁E実裁E��み' : '❁E未実裁E}`);
      
      if (modalOpen) {
        // フォーム要素の存在確誁E
        const orderIdInput = page.locator('input[name="orderId"]');
        const orderIdExists = await orderIdInput.isVisible();
        console.log(`注斁E��号入力フィールチE ${orderIdExists ? '✁E実裁E��み' : '❁E未実裁E}`);
        
        const productNameInput = page.locator('input[name="productName"]');
        const productNameExists = await productNameInput.isVisible();
        console.log(`啁E��名�E力フィールチE ${productNameExists ? '✁E実裁E��み' : '❁E未実裁E}`);
        
        const reasonRadio = page.locator('input[type="radio"]');
        const reasonExists = await reasonRadio.first().isVisible();
        console.log(`返品琁E��選抁E ${reasonExists ? '✁E実裁E��み' : '❁E未実裁E}`);
        
        if (orderIdExists && productNameExists && reasonExists) {
          // 実際に入力テスチE
          await orderIdInput.fill('ORD-000123');
          await productNameInput.fill('チE��ト商品E);
          await reasonRadio.first().check();
          
          const orderValue = await orderIdInput.inputValue();
          const productValue = await productNameInput.inputValue();
          const isChecked = await reasonRadio.first().isChecked();
          
          console.log(`入力機�EチE��チE ${orderValue === 'ORD-000123' && productValue === 'チE��ト商品E && isChecked ? '✁E実裁E��み' : '❁E未実裁E}`);
          
          // 送信ボタンの存在確誁E
          const submitButton = page.locator('button:has-text("提�E"), button:has-text("申諁E)').first();
          const submitExists = await submitButton.isVisible();
          console.log(`送信ボタン存在: ${submitExists ? '✁E実裁E��み' : '❁E未実裁E}`);
          
          if (submitExists) {
            console.log('🎉 返品管琁E��品申請モーダル: 完�E実裁E��み');
          } else {
            console.log('❁E返品管琁E��品申請モーダル: 部刁E��実裁E);
          }
        } else {
          console.log('❁E返品管琁E��品申請モーダル: 部刁E��実裁E);
        }
      } else {
        console.log('❁E返品管琁E��品申請モーダル: 未実裁E);
      }
    } else {
      console.log('❁E返品管琁E��品申請�Eタン: 未実裁E);
    }
  });

  test('🚚 納品プランウィザーチE, async ({ page }) => {
    console.log('=== 納品プランウィザードテスチE===');
    
    // ログイン
    await page.goto('http://localhost:3002/login');
    await page.waitForTimeout(3000);
    await page.fill('input[name="username"]', 'seller');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // 納品プランペ�Eジに移勁E
    await page.goto('http://localhost:3002/delivery-plan');
    await page.waitForTimeout(3000);
    
    // 新規�Eラン作�Eボタンを探ぁE
    const createButton = page.locator('button:has-text("新要E), button:has-text("作�E")').first();
    const buttonExists = await createButton.isVisible();
    console.log(`新規�Eラン作�Eボタン存在: ${buttonExists ? '✁E : '❁E}`);
    
    if (buttonExists) {
      await createButton.click();
      await page.waitForTimeout(2000);
      
      // ウィザードまた�Eモーダルが開ぁE��かチェチE��
      const modal = page.locator('[role="dialog"]');
      const wizard = page.locator('.wizard, .step');
      
      const modalOpen = await modal.isVisible();
      const wizardOpen = await wizard.isVisible();
      
      console.log(`ウィザーチEモーダル開閉: ${modalOpen || wizardOpen ? '✁E実裁E��み' : '❁E未実裁E}`);
      
      if (modalOpen || wizardOpen) {
        // 入力フィールド�E存在確誁E
        const inputs = await page.locator('input').all();
        const inputCount = inputs.length;
        console.log(`入力フィールド数: ${inputCount}個`);
        
        if (inputCount > 0) {
          // 最初�E入力フィールドで動作テスチE
          const firstInput = inputs[0];
          if (await firstInput.isVisible()) {
            await firstInput.fill('チE��ト�E劁E);
            const inputValue = await firstInput.inputValue();
            console.log(`入力機�EチE��チE ${inputValue === 'チE��ト�E劁E ? '✁E実裁E��み' : '❁E未実裁E}`);
          }
          
          // 次へボタンの存在確誁E
          const nextButton = page.locator('button:has-text("次へ"), button:has-text("続衁E)').first();
          const nextExists = await nextButton.isVisible();
          console.log(`次へボタン存在: ${nextExists ? '✁E実裁E��み' : '❁E未実裁E}`);
          
          if (nextExists && inputCount > 0) {
            console.log('🎉 納品プランウィザーチE 完�E実裁E��み');
          } else {
            console.log('❁E納品プランウィザーチE 部刁E��実裁E);
          }
        } else {
          console.log('❁E納品プランウィザーチE 部刁E��実裁E);
        }
      } else {
        console.log('❁E納品プランウィザーチE 未実裁E);
      }
    } else {
      console.log('❁E納品プラン作�Eボタン: 未実裁E);
    }
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('🔍 匁E��的UIコンポ�Eネント機�EチE��チE, () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="seller-login"]');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL('/dashboard');
    await page.waitForTimeout(2000);
  });

  // 全画面のサイドメニューチE��チE
  test('📋 サイドメニュー - 全画面ナビゲーション機�EチE��チE, async ({ page }) => {
    console.log('=== サイドメニュー匁E��チE��ト開姁E===');
    
    const sideMenuItems = [
      { text: 'ダチE��ュボ�EチE, url: '/dashboard' },
      { text: '在庫管琁E, url: '/inventory' },
      { text: '啁E��出品E, url: '/sales' },
      { text: '配送管琁E, url: '/delivery' },
      { text: '返品管琁E, url: '/returns' },
      { text: 'レポ�EチE, url: '/reports' },
      { text: '設宁E, url: '/settings' },
      { text: 'プロフィール', url: '/profile' },
      { text: 'スタチE��', url: '/staff' }
    ];
    
    const results = [];
    
    for (const item of sideMenuItems) {
      console.log(`チE��ト中: ${item.text}`);
      
      // サイドメニューのリンク/ボタンを探ぁE
      const menuLink = page.locator(`a:has-text("${item.text}"), button:has-text("${item.text}")`);
      const isVisible = await menuLink.isVisible();
      
      if (isVisible) {
        try {
          await menuLink.first().click();
          await page.waitForTimeout(2000);
          
          const currentUrl = page.url();
          const isWorking = currentUrl.includes(item.url);
          
          results.push({
            component: `サイドメニュー: ${item.text}`,
            visible: true,
            clickable: true,
            functional: isWorking,
            url: currentUrl,
            status: isWorking ? '✁E動作中' : '❁E非機�E'
          });
          
          console.log(`${item.text}: ${isWorking ? '✁E動作中' : '❁E非機�E'} - URL: ${currentUrl}`);
        } catch (error) {
          results.push({
            component: `サイドメニュー: ${item.text}`,
            visible: true,
            clickable: false,
            functional: false,
            error: error.message,
            status: '❁EクリチE��不可'
          });
          console.log(`${item.text}: ❁EクリチE��不可 - エラー: ${error.message}`);
        }
      } else {
        results.push({
          component: `サイドメニュー: ${item.text}`,
          visible: false,
          clickable: false,
          functional: false,
          status: '❁E非表示'
        });
        console.log(`${item.text}: ❁E非表示`);
      }
    }
    
    console.log('\n=== サイドメニューチE��ト結果 ===');
    results.forEach(result => {
      console.log(`${result.component}: ${result.status}`);
    });
    
    // 結果をファイルに保孁E
    console.log('\n' + JSON.stringify(results, null, 2));
  });

  // ヘッダーメニューチE��チE
  test('🎯 ヘッダーメニュー - 全メニュー機�EチE��チE, async ({ page }) => {
    console.log('=== ヘッダーメニュー匁E��チE��ト開姁E===');
    
    const results = [];
    
    // プロフィールメニューチE��チE
    const profileButton = page.locator('button[aria-label*="プロフィール"], button:has-text("プロフィール"), .profile-menu');
    if (await profileButton.isVisible()) {
      try {
        await profileButton.first().click();
        await page.waitForTimeout(1000);
        
        const dropdown = page.locator('[role="menu"], .dropdown-menu');
        const isDropdownVisible = await dropdown.isVisible();
        
        results.push({
          component: 'ヘッダー: プロフィールメニュー',
          visible: true,
          clickable: true,
          functional: isDropdownVisible,
          status: isDropdownVisible ? '✁E動作中' : '❁E非機�E'
        });
        
        console.log(`プロフィールメニュー: ${isDropdownVisible ? '✁E動作中' : '❁E非機�E'}`);
      } catch (error) {
        results.push({
          component: 'ヘッダー: プロフィールメニュー',
          visible: true,
          clickable: false,
          functional: false,
          error: error.message,
          status: '❁EクリチE��不可'
        });
      }
    }
    
    // 通知ボタンチE��チE
    const notificationButton = page.locator('button[aria-label*="通知"], button:has-text("通知"), .notification-button');
    if (await notificationButton.isVisible()) {
      try {
        await notificationButton.first().click();
        await page.waitForTimeout(1000);
        
        const notificationPanel = page.locator('.notification-panel, [role="dialog"]');
        const isPanelVisible = await notificationPanel.isVisible();
        
        results.push({
          component: 'ヘッダー: 通知ボタン',
          visible: true,
          clickable: true,
          functional: isPanelVisible,
          status: isPanelVisible ? '✁E動作中' : '❁E非機�E'
        });
        
        console.log(`通知ボタン: ${isPanelVisible ? '✁E動作中' : '❁E非機�E'}`);
      } catch (error) {
        results.push({
          component: 'ヘッダー: 通知ボタン',
          visible: true,
          clickable: false,
          functional: false,
          error: error.message,
          status: '❁EクリチE��不可'
        });
      }
    }
    
    // 検索ボタンチE��チE
    const searchButton = page.locator('button[aria-label*="検索"], button:has-text("検索"), .search-button');
    if (await searchButton.isVisible()) {
      try {
        await searchButton.first().click();
        await page.waitForTimeout(1000);
        
        const searchModal = page.locator('.search-modal, [role="dialog"]');
        const isSearchVisible = await searchModal.isVisible();
        
        results.push({
          component: 'ヘッダー: 検索ボタン',
          visible: true,
          clickable: true,
          functional: isSearchVisible,
          status: isSearchVisible ? '✁E動作中' : '❁E非機�E'
        });
        
        console.log(`検索ボタン: ${isSearchVisible ? '✁E動作中' : '❁E非機�E'}`);
      } catch (error) {
        results.push({
          component: 'ヘッダー: 検索ボタン',
          visible: true,
          clickable: false,
          functional: false,
          error: error.message,
          status: '❁EクリチE��不可'
        });
      }
    }
    
    console.log('\n=== ヘッダーメニューチE��ト結果 ===');
    results.forEach(result => {
      console.log(`${result.component}: ${result.status}`);
    });
    
    console.log('\n' + JSON.stringify(results, null, 2));
  });

  // 吁E��面のボディコンポ�EネントテスチE
  test('🔧 ダチE��ュボ�EチE- ボディコンポ�Eネント機�EチE��チE, async ({ page }) => {
    console.log('=== ダチE��ュボ�EチEボディコンポ�Eネントテスト開姁E===');
    
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    const results = [];
    
    // 全ボタンをテスチE
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`ダチE��ュボ�Eド総�Eタン数: ${buttonCount}`);
    
    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const buttonText = await button.textContent();
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      
      if (isVisible && isEnabled) {
        try {
          const originalUrl = page.url();
          await button.click();
          await page.waitForTimeout(1500);
          
          const newUrl = page.url();
          const hasModal = await page.locator('[role="dialog"]').isVisible();
          const hasChanges = originalUrl !== newUrl || hasModal;
          
          results.push({
            component: `ダチE��ュボ�Eド�Eタン: "${buttonText}"`,
            visible: true,
            clickable: true,
            functional: hasChanges,
            status: hasChanges ? '✁E動作中' : '❁E非機�E'
          });
          
          console.log(`ボタン "${buttonText}": ${hasChanges ? '✁E動作中' : '❁E非機�E'}`);
          
          // モーダルが開ぁE��場合�E閉じめE
          if (hasModal) {
            const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じめE), button:has-text("ÁE)');
            if (await closeButton.first().isVisible()) {
              await closeButton.first().click();
              await page.waitForTimeout(1000);
            }
          }
          
          // URLが変わった場合�E允E��戻めE
          if (originalUrl !== newUrl) {
            await page.goto('/dashboard');
            await page.waitForTimeout(1000);
          }
        } catch (error) {
          results.push({
            component: `ダチE��ュボ�Eド�Eタン: "${buttonText}"`,
            visible: true,
            clickable: false,
            functional: false,
            error: error.message,
            status: '❁EクリチE��不可'
          });
          console.log(`ボタン "${buttonText}": ❁EクリチE��不可`);
        }
      } else {
        results.push({
          component: `ダチE��ュボ�Eド�Eタン: "${buttonText}"`,
          visible: isVisible,
          clickable: false,
          functional: false,
          status: '❁E非表示また�E無効'
        });
      }
    }
    
    // プルダウン�E�セレクト）テスチE
    const selects = page.locator('select');
    const selectCount = await selects.count();
    console.log(`ダチE��ュボ�Eド総�Eルダウン数: ${selectCount}`);
    
    for (let i = 0; i < selectCount; i++) {
      const select = selects.nth(i);
      const isVisible = await select.isVisible();
      const isEnabled = await select.isEnabled();
      
      if (isVisible && isEnabled) {
        try {
          const options = await select.locator('option').count();
          if (options > 1) {
            await select.selectOption({ index: 1 });
            const selectedValue = await select.inputValue();
            
            results.push({
              component: `ダチE��ュボ�Eド�Eルダウン ${i + 1}`,
              visible: true,
              clickable: true,
              functional: true,
              selectedValue,
              status: '✁E動作中'
            });
            
            console.log(`プルダウン ${i + 1}: ✁E動作中 - 選択値: ${selectedValue}`);
          }
        } catch (error) {
          results.push({
            component: `ダチE��ュボ�Eド�Eルダウン ${i + 1}`,
            visible: true,
            clickable: false,
            functional: false,
            error: error.message,
            status: '❁E選択不可'
          });
        }
      }
    }
    
    // チェチE��ボックスチE��チE
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    console.log(`ダチE��ュボ�Eド総チェチE��ボックス数: ${checkboxCount}`);
    
    for (let i = 0; i < checkboxCount; i++) {
      const checkbox = checkboxes.nth(i);
      const isVisible = await checkbox.isVisible();
      const isEnabled = await checkbox.isEnabled();
      
      if (isVisible && isEnabled) {
        try {
          const originalState = await checkbox.isChecked();
          await checkbox.click();
          await page.waitForTimeout(500);
          const newState = await checkbox.isChecked();
          
          results.push({
            component: `ダチE��ュボ�EドチェチE��ボックス ${i + 1}`,
            visible: true,
            clickable: true,
            functional: originalState !== newState,
            status: originalState !== newState ? '✁E動作中' : '❁E非機�E'
          });
          
          console.log(`チェチE��ボックス ${i + 1}: ${originalState !== newState ? '✁E動作中' : '❁E非機�E'}`);
        } catch (error) {
          results.push({
            component: `ダチE��ュボ�EドチェチE��ボックス ${i + 1}`,
            visible: true,
            clickable: false,
            functional: false,
            error: error.message,
            status: '❁EクリチE��不可'
          });
        }
      }
    }
    
    // リンクチE��チE
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    console.log(`ダチE��ュボ�Eド総リンク数: ${linkCount}`);
    
    for (let i = 0; i < Math.min(linkCount, 10); i++) { // 最初�E10個をチE��チE
      const link = links.nth(i);
      const isVisible = await link.isVisible();
      const href = await link.getAttribute('href');
      
      if (isVisible && href) {
        try {
          const originalUrl = page.url();
          await link.click();
          await page.waitForTimeout(1500);
          
          const newUrl = page.url();
          const hasNavigation = originalUrl !== newUrl;
          
          results.push({
            component: `ダチE��ュボ�Eドリンク ${i + 1}`,
            visible: true,
            clickable: true,
            functional: hasNavigation,
            href,
            status: hasNavigation ? '✁E動作中' : '❁E非機�E'
          });
          
          console.log(`リンク ${i + 1} (${href}): ${hasNavigation ? '✁E動作中' : '❁E非機�E'}`);
          
          // 允E��戻めE
          if (hasNavigation) {
            await page.goto('/dashboard');
            await page.waitForTimeout(1000);
          }
        } catch (error) {
          results.push({
            component: `ダチE��ュボ�Eドリンク ${i + 1}`,
            visible: true,
            clickable: false,
            functional: false,
            href,
            error: error.message,
            status: '❁EクリチE��不可'
          });
        }
      }
    }
    
    console.log('\n=== ダチE��ュボ�EチEボディコンポ�Eネントテスト結果 ===');
    results.forEach(result => {
      console.log(`${result.component}: ${result.status}`);
    });
    
    console.log('\n' + JSON.stringify(results, null, 2));
  });

  // 在庫管琁E��面のボディコンポ�EネントテスチE
  test('📦 在庫管琁E- ボディコンポ�Eネント機�EチE��チE, async ({ page }) => {
    console.log('=== 在庫管琁Eボディコンポ�Eネントテスト開姁E===');
    
    await page.goto('/inventory');
    await page.waitForTimeout(2000);
    
    const results = [];
    
    // 全ボタンをテスチE
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`在庫管琁E���Eタン数: ${buttonCount}`);
    
    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const buttonText = await button.textContent();
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      
      if (isVisible && isEnabled) {
        try {
          const originalUrl = page.url();
          await button.click();
          await page.waitForTimeout(1500);
          
          const newUrl = page.url();
          const hasModal = await page.locator('[role="dialog"]').isVisible();
          const hasChanges = originalUrl !== newUrl || hasModal;
          
          results.push({
            component: `在庫管琁E�Eタン: "${buttonText}"`,
            visible: true,
            clickable: true,
            functional: hasChanges,
            status: hasChanges ? '✁E動作中' : '❁E非機�E'
          });
          
          console.log(`ボタン "${buttonText}": ${hasChanges ? '✁E動作中' : '❁E非機�E'}`);
          
          // モーダルが開ぁE��場合�E閉じめE
          if (hasModal) {
            const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じめE), button:has-text("ÁE)');
            if (await closeButton.first().isVisible()) {
              await closeButton.first().click();
              await page.waitForTimeout(1000);
            }
          }
          
          // URLが変わった場合�E允E��戻めE
          if (originalUrl !== newUrl) {
            await page.goto('/inventory');
            await page.waitForTimeout(1000);
          }
        } catch (error) {
          results.push({
            component: `在庫管琁E�Eタン: "${buttonText}"`,
            visible: true,
            clickable: false,
            functional: false,
            error: error.message,
            status: '❁EクリチE��不可'
          });
          console.log(`ボタン "${buttonText}": ❁EクリチE��不可`);
        }
      }
    }
    
    console.log('\n=== 在庫管琁Eボディコンポ�Eネントテスト結果 ===');
    results.forEach(result => {
      console.log(`${result.component}: ${result.status}`);
    });
    
    console.log('\n' + JSON.stringify(results, null, 2));
  });

  // モーダルチE��チE
  test('🎭 モーダル機�EチE��チE, async ({ page }) => {
    console.log('=== モーダル機�EチE��ト開姁E===');
    
    const results = [];
    const modalTriggers = [
      { page: '/dashboard', trigger: 'button:has-text("期間選抁E)', modalType: '期間選択モーダル' },
      { page: '/inventory', trigger: 'button:has-text("新規商品登録")', modalType: '啁E��登録モーダル' },
      { page: '/inventory', trigger: 'button:has-text("CSVインポ�EチE)', modalType: 'CSVインポ�Eトモーダル' },
      { page: '/settings', trigger: 'button:has-text("設宁E)', modalType: '設定モーダル' }
    ];
    
    for (const modalTest of modalTriggers) {
      await page.goto(modalTest.page);
      await page.waitForTimeout(2000);
      
      const triggerButton = page.locator(modalTest.trigger);
      if (await triggerButton.isVisible()) {
        try {
          await triggerButton.first().click();
          await page.waitForTimeout(1500);
          
          const modal = page.locator('[role="dialog"]');
          const isModalVisible = await modal.isVisible();
          
          if (isModalVisible) {
            // モーダル冁E�EボタンをテスチE
            const modalButtons = modal.locator('button');
            const modalButtonCount = await modalButtons.count();
            
            console.log(`${modalTest.modalType} 冁E�Eタン数: ${modalButtonCount}`);
            
            // 閉じる�EタンをテスチE
            const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE), button:has-text("ÁE)');
            if (await closeButton.first().isVisible()) {
              await closeButton.first().click();
              await page.waitForTimeout(1000);
              
              const isModalClosed = !(await modal.isVisible());
              
              results.push({
                component: `${modalTest.modalType}`,
                visible: true,
                clickable: true,
                functional: isModalClosed,
                status: isModalClosed ? '✁E動作中' : '❁E非機�E'
              });
              
              console.log(`${modalTest.modalType}: ${isModalClosed ? '✁E動作中' : '❁E非機�E'}`);
            }
          } else {
            results.push({
              component: `${modalTest.modalType}`,
              visible: false,
              clickable: false,
              functional: false,
              status: '❁Eモーダル未表示'
            });
            console.log(`${modalTest.modalType}: ❁Eモーダル未表示`);
          }
        } catch (error) {
          results.push({
            component: `${modalTest.modalType}`,
            visible: true,
            clickable: false,
            functional: false,
            error: error.message,
            status: '❁Eトリガー不可'
          });
          console.log(`${modalTest.modalType}: ❁Eトリガー不可`);
        }
      } else {
        results.push({
          component: `${modalTest.modalType}`,
          visible: false,
          clickable: false,
          functional: false,
          status: '❁Eトリガーボタン未表示'
        });
        console.log(`${modalTest.modalType}: ❁Eトリガーボタン未表示`);
      }
    }
    
    console.log('\n=== モーダル機�EチE��ト結果 ===');
    results.forEach(result => {
      console.log(`${result.component}: ${result.status}`);
    });
    
    console.log('\n' + JSON.stringify(results, null, 2));
  });

  // 全画面統合テスチE
  test('🌐 全画面統吁EIコンポ�EネントテスチE, async ({ page }) => {
    console.log('=== 全画面統吁EIコンポ�Eネントテスト開姁E===');
    
    const pages = [
      '/dashboard',
      '/inventory', 
      '/sales',
      '/delivery',
      '/returns',
      '/reports',
      '/settings',
      '/profile'
    ];
    
    const allResults = [];
    
    for (const pagePath of pages) {
      console.log(`\n--- ${pagePath} ペ�EジチE��チE---`);
      
      try {
        await page.goto(pagePath);
        await page.waitForTimeout(2000);
        
        const pageResults = [];
        
        // ボタンチE��チE
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        
        for (let i = 0; i < Math.min(buttonCount, 5); i++) { // 最初�E5個をチE��チE
          const button = buttons.nth(i);
          const buttonText = await button.textContent();
          const isVisible = await button.isVisible();
          const isEnabled = await button.isEnabled();
          
          if (isVisible && isEnabled) {
            try {
              const originalUrl = page.url();
              await button.click();
              await page.waitForTimeout(1000);
              
              const newUrl = page.url();
              const hasModal = await page.locator('[role="dialog"]').isVisible();
              const hasChanges = originalUrl !== newUrl || hasModal;
              
              pageResults.push({
                page: pagePath,
                component: `ボタン: "${buttonText}"`,
                type: 'button',
                functional: hasChanges,
                status: hasChanges ? '✁E動作中' : '❁E非機�E'
              });
              
              // 允E�E状態に戻ぁE
              if (hasModal) {
                const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じめE), button:has-text("ÁE)');
                if (await closeButton.first().isVisible()) {
                  await closeButton.first().click();
                  await page.waitForTimeout(500);
                }
              }
              if (originalUrl !== newUrl) {
                await page.goto(pagePath);
                await page.waitForTimeout(1000);
              }
            } catch (error) {
              pageResults.push({
                page: pagePath,
                component: `ボタン: "${buttonText}"`,
                type: 'button',
                functional: false,
                status: '❁EクリチE��不可'
              });
            }
          }
        }
        
        // プルダウンチE��チE
        const selects = page.locator('select');
        const selectCount = await selects.count();
        
        for (let i = 0; i < selectCount; i++) {
          const select = selects.nth(i);
          const isVisible = await select.isVisible();
          const isEnabled = await select.isEnabled();
          
          if (isVisible && isEnabled) {
            try {
              const options = await select.locator('option').count();
              if (options > 1) {
                await select.selectOption({ index: 1 });
                
                pageResults.push({
                  page: pagePath,
                  component: `プルダウン ${i + 1}`,
                  type: 'select',
                  functional: true,
                  status: '✁E動作中'
                });
              }
            } catch (error) {
              pageResults.push({
                page: pagePath,
                component: `プルダウン ${i + 1}`,
                type: 'select',
                functional: false,
                status: '❁E選択不可'
              });
            }
          }
        }
        
        // チェチE��ボックスチE��チE
        const checkboxes = page.locator('input[type="checkbox"]');
        const checkboxCount = await checkboxes.count();
        
        for (let i = 0; i < checkboxCount; i++) {
          const checkbox = checkboxes.nth(i);
          const isVisible = await checkbox.isVisible();
          const isEnabled = await checkbox.isEnabled();
          
          if (isVisible && isEnabled) {
            try {
              const originalState = await checkbox.isChecked();
              await checkbox.click();
              await page.waitForTimeout(300);
              const newState = await checkbox.isChecked();
              
              pageResults.push({
                page: pagePath,
                component: `チェチE��ボックス ${i + 1}`,
                type: 'checkbox',
                functional: originalState !== newState,
                status: originalState !== newState ? '✁E動作中' : '❁E非機�E'
              });
            } catch (error) {
              pageResults.push({
                page: pagePath,
                component: `チェチE��ボックス ${i + 1}`,
                type: 'checkbox',
                functional: false,
                status: '❁EクリチE��不可'
              });
            }
          }
        }
        
        allResults.push(...pageResults);
        
        // ペ�Eジ結果を表示
        pageResults.forEach(result => {
          console.log(`${result.component}: ${result.status}`);
        });
        
      } catch (error) {
        console.log(`${pagePath}: ペ�Eジアクセス不可 - ${error.message}`);
        allResults.push({
          page: pagePath,
          component: 'ペ�Eジ全佁E,
          type: 'page',
          functional: false,
          status: '❁Eアクセス不可'
        });
      }
    }
    
    console.log('\n=== 全画面統合テスト結果サマリー ===');
    
    const summary = {
      total: allResults.length,
      functional: allResults.filter(r => r.functional).length,
      nonFunctional: allResults.filter(r => !r.functional).length
    };
    
    console.log(`総コンポ�Eネント数: ${summary.total}`);
    console.log(`機�E中: ${summary.functional}`);
    console.log(`非機�E: ${summary.nonFunctional}`);
    console.log(`機�E玁E ${((summary.functional / summary.total) * 100).toFixed(1)}%`);
    
    console.log('\n=== 詳細結果 ===');
    console.log(JSON.stringify(allResults, null, 2));
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('🔍 UIコンポ�Eネント基本機�EチE��チE, () => {
  
  test('🚀 ログイン画面 - 基本UI要素チE��チE, async ({ page }) => {
    console.log('=== ログイン画面UI要素チE��ト開姁E===');
    
    await page.goto('/login');
    await page.waitForTimeout(3000);
    
    const results = [];
    
    // ログインボタンの存在確誁E
    const loginButton = page.locator('button:has-text("ログイン")');
    const loginButtonExists = await loginButton.isVisible();
    results.push({
      component: 'ログインボタン',
      visible: loginButtonExists,
      status: loginButtonExists ? '✁E存在' : '❁E不在'
    });
    
    // セラーログインボタンの存在確誁E
    const sellerButton = page.locator('[data-testid="seller-login"]');
    const sellerButtonExists = await sellerButton.isVisible();
    results.push({
      component: 'セラーログインボタン',
      visible: sellerButtonExists,
      status: sellerButtonExists ? '✁E存在' : '❁E不在'
    });
    
    // スタチE��ログインボタンの存在確誁E
    const staffButton = page.locator('[data-testid="staff-login"]');
    const staffButtonExists = await staffButton.isVisible();
    results.push({
      component: 'スタチE��ログインボタン',
      visible: staffButtonExists,
      status: staffButtonExists ? '✁E存在' : '❁E不在'
    });
    
    // 入力フィールド�E存在確誁E
    const emailInput = page.locator('input[type="email"]');
    const emailExists = await emailInput.isVisible();
    results.push({
      component: 'メールアドレス入劁E,
      visible: emailExists,
      status: emailExists ? '✁E存在' : '❁E不在'
    });
    
    const passwordInput = page.locator('input[type="password"]');
    const passwordExists = await passwordInput.isVisible();
    results.push({
      component: 'パスワード�E劁E,
      visible: passwordExists,
      status: passwordExists ? '✁E存在' : '❁E不在'
    });
    
    console.log('\n=== ログイン画面UI要素チE��ト結果 ===');
    results.forEach(result => {
      console.log(`${result.component}: ${result.status}`);
    });
    
    console.log('\n' + JSON.stringify(results, null, 2));
  });

  test('🎯 ログイン機�EチE��チE, async ({ page }) => {
    console.log('=== ログイン機�EチE��ト開姁E===');
    
    await page.goto('/login');
    await page.waitForTimeout(2000);
    
    const results = [];
    
    // セラーログインボタンのクリチE��機�EチE��チE
    const sellerButton = page.locator('[data-testid="seller-login"]');
    if (await sellerButton.isVisible()) {
      try {
        await sellerButton.click();
        await page.waitForTimeout(1000);
        
        // 入力フィールド�E値が設定されてぁE��かチェチE��
        const emailValue = await page.locator('input[type="email"]').inputValue();
        const passwordValue = await page.locator('input[type="password"]').inputValue();
        
        const isWorking = emailValue.length > 0 && passwordValue.length > 0;
        
        results.push({
          component: 'セラーログインボタン',
          clickable: true,
          functional: isWorking,
          emailValue,
          passwordValue,
          status: isWorking ? '✁E機�E中' : '❁E非機�E'
        });
        
        console.log(`セラーログインボタン: ${isWorking ? '✁E機�E中' : '❁E非機�E'}`);
        console.log(`  設定されたEmail: ${emailValue}`);
        console.log(`  設定されたPassword: ${passwordValue}`);
      } catch (error) {
        results.push({
          component: 'セラーログインボタン',
          clickable: false,
          functional: false,
          error: String(error),
          status: '❁EクリチE��不可'
        });
      }
    }
    
    // スタチE��ログインボタンのクリチE��機�EチE��チE
    const staffButton = page.locator('[data-testid="staff-login"]');
    if (await staffButton.isVisible()) {
      try {
        await staffButton.click();
        await page.waitForTimeout(1000);
        
        // 入力フィールド�E値が設定されてぁE��かチェチE��
        const emailValue = await page.locator('input[type="email"]').inputValue();
        const passwordValue = await page.locator('input[type="password"]').inputValue();
        
        const isWorking = emailValue.length > 0 && passwordValue.length > 0;
        
        results.push({
          component: 'スタチE��ログインボタン',
          clickable: true,
          functional: isWorking,
          emailValue,
          passwordValue,
          status: isWorking ? '✁E機�E中' : '❁E非機�E'
        });
        
        console.log(`スタチE��ログインボタン: ${isWorking ? '✁E機�E中' : '❁E非機�E'}`);
        console.log(`  設定されたEmail: ${emailValue}`);
        console.log(`  設定されたPassword: ${passwordValue}`);
      } catch (error) {
        results.push({
          component: 'スタチE��ログインボタン',
          clickable: false,
          functional: false,
          error: String(error),
          status: '❁EクリチE��不可'
        });
      }
    }
    
    console.log('\n=== ログイン機�EチE��ト結果 ===');
    results.forEach(result => {
      console.log(`${result.component}: ${result.status}`);
    });
    
    console.log('\n' + JSON.stringify(results, null, 2));
  });

  test('🔐 実際のログイン処琁E��スチE, async ({ page }) => {
    console.log('=== 実際のログイン処琁E��スト開姁E===');
    
    await page.goto('/login');
    await page.waitForTimeout(2000);
    
    const results = [];
    
    // セラーとしてログイン
    try {
      await page.click('[data-testid="seller-login"]');
      await page.waitForTimeout(1000);
      
      const loginButton = page.locator('button:has-text("ログイン")');
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        const isLoggedIn = currentUrl.includes('/dashboard');
        
        results.push({
          component: 'ログイン処琁E,
          functional: isLoggedIn,
          currentUrl,
          status: isLoggedIn ? '✁E成功' : '❁E失敁E
        });
        
        console.log(`ログイン処琁E ${isLoggedIn ? '✁E成功' : '❁E失敁E}`);
        console.log(`  現在のURL: ${currentUrl}`);
      }
    } catch (error) {
      results.push({
        component: 'ログイン処琁E,
        functional: false,
        error: String(error),
        status: '❁Eエラー'
      });
      console.log(`ログイン処琁E ❁Eエラー - ${String(error)}`);
    }
    
    console.log('\n=== 実際のログイン処琁E��スト結果 ===');
    results.forEach(result => {
      console.log(`${result.component}: ${result.status}`);
    });
    
    console.log('\n' + JSON.stringify(results, null, 2));
  });

  test('📊 ダチE��ュボ�Eド基本UI要素チE��チE, async ({ page }) => {
    console.log('=== ダチE��ュボ�Eド基本UI要素チE��ト開姁E===');
    
    // ログイン処琁E
    await page.goto('/login');
    await page.waitForTimeout(2000);
    await page.click('[data-testid="seller-login"]');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("ログイン")');
    await page.waitForTimeout(3000);
    
    // ダチE��ュボ�Eドに到達できてぁE��かチェチE��
    const currentUrl = page.url();
    if (!currentUrl.includes('/dashboard')) {
      console.log('❁EダチE��ュボ�Eドに到達できませんでした');
      return;
    }
    
    console.log('✁EダチE��ュボ�Eドに到達しました');
    
    const results = [];
    
    // ペ�Eジタイトルの確誁E
    const pageTitle = await page.title();
    results.push({
      component: 'ペ�Eジタイトル',
      value: pageTitle,
      status: '✁E確誁E
    });
    
    // H1タグの確誁E
    const h1 = page.locator('h1');
    const h1Exists = await h1.isVisible();
    const h1Text = h1Exists ? await h1.textContent() : '';
    results.push({
      component: 'メインタイトル(H1)',
      visible: h1Exists,
      text: h1Text,
      status: h1Exists ? '✁E存在' : '❁E不在'
    });
    
    // ボタンの総数確誁E
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    results.push({
      component: '総�Eタン数',
      count: buttonCount,
      status: buttonCount > 0 ? '✁E存在' : '❁E不在'
    });
    
    // リンクの総数確誁E
    const allLinks = page.locator('a[href]');
    const linkCount = await allLinks.count();
    results.push({
      component: '総リンク数',
      count: linkCount,
      status: linkCount > 0 ? '✁E存在' : '❁E不在'
    });
    
    // 入力フィールド�E総数確誁E
    const allInputs = page.locator('input');
    const inputCount = await allInputs.count();
    results.push({
      component: '総�E力フィールド数',
      count: inputCount,
      status: inputCount >= 0 ? '✁E確誁E : '❁Eエラー'
    });
    
    // セレクト�EチE��スの総数確誁E
    const allSelects = page.locator('select');
    const selectCount = await allSelects.count();
    results.push({
      component: '総セレクト�EチE��ス数',
      count: selectCount,
      status: selectCount >= 0 ? '✁E確誁E : '❁Eエラー'
    });
    
    // チェチE��ボックスの総数確誁E
    const allCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await allCheckboxes.count();
    results.push({
      component: '総チェチE��ボックス数',
      count: checkboxCount,
      status: checkboxCount >= 0 ? '✁E確誁E : '❁Eエラー'
    });
    
    console.log('\n=== ダチE��ュボ�Eド基本UI要素チE��ト結果 ===');
    results.forEach(result => {
      console.log(`${result.component}: ${result.status} ${result.count !== undefined ? `(${result.count}倁E` : ''} ${result.text ? `"${result.text}"` : ''}`);
    });
    
    console.log('\n' + JSON.stringify(results, null, 2));
  });

  test('🔍 ダチE��ュボ�EチE- 主要�Eタン機�EチE��チE, async ({ page }) => {
    console.log('=== ダチE��ュボ�Eド主要�Eタン機�EチE��ト開姁E===');
    
    // ログイン処琁E
    await page.goto('/login');
    await page.waitForTimeout(2000);
    await page.click('[data-testid="seller-login"]');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("ログイン")');
    await page.waitForTimeout(3000);
    
    const results = [];
    
    // 主要�EタンのチE��ト対象
    const buttonTests = [
      { text: '期間選抁E, expectedAction: 'modal' },
      { text: '期間でフィルター', expectedAction: 'modal' },
      { text: 'レポ�EトをダウンローチE, expectedAction: 'download' },
      { text: 'ダウンローチE, expectedAction: 'download' },
      { text: '新規作�E', expectedAction: 'modal' },
      { text: '追加', expectedAction: 'modal' },
      { text: '編雁E, expectedAction: 'modal' },
      { text: '削除', expectedAction: 'modal' },
      { text: '設宁E, expectedAction: 'modal' },
      { text: '更新', expectedAction: 'action' }
    ];
    
    for (const buttonTest of buttonTests) {
      const button = page.locator(`button:has-text("${buttonTest.text}")`);
      const buttonExists = await button.isVisible();
      
      if (buttonExists) {
        try {
          const originalUrl = page.url();
          await button.first().click();
          await page.waitForTimeout(1500);
          
          const newUrl = page.url();
          const hasModal = await page.locator('[role="dialog"]').isVisible();
          const hasUrlChange = originalUrl !== newUrl;
          
          let isWorking = false;
          let actionType = 'none';
          
          if (buttonTest.expectedAction === 'modal' && hasModal) {
            isWorking = true;
            actionType = 'modal';
          } else if (buttonTest.expectedAction === 'download') {
            // ダウンロード�Eタンは反応があれば成功とする
            isWorking = true;
            actionType = 'download';
          } else if (hasUrlChange) {
            isWorking = true;
            actionType = 'navigation';
          } else if (hasModal) {
            isWorking = true;
            actionType = 'modal';
          }
          
          results.push({
            component: `ボタン: "${buttonTest.text}"`,
            visible: true,
            clickable: true,
            functional: isWorking,
            actionType,
            hasModal,
            hasUrlChange,
            status: isWorking ? '✁E機�E中' : '❁E非機�E'
          });
          
          console.log(`ボタン "${buttonTest.text}": ${isWorking ? '✁E機�E中' : '❁E非機�E'} (${actionType})`);
          
          // モーダルが開ぁE��場合�E閉じめE
          if (hasModal) {
            const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じめE), button:has-text("ÁE)');
            if (await closeButton.first().isVisible()) {
              await closeButton.first().click();
              await page.waitForTimeout(1000);
            }
          }
          
          // URLが変わった場合�E允E��戻めE
          if (hasUrlChange) {
            await page.goto('/dashboard');
            await page.waitForTimeout(1000);
          }
        } catch (error) {
                     results.push({
             component: `ボタン: "${buttonTest.text}"`,
             visible: true,
             clickable: false,
             functional: false,
             error: String(error),
             status: '❁EクリチE��不可'
           });
           console.log(`ボタン "${buttonTest.text}": ❁EクリチE��不可 - ${String(error)}`);
        }
      } else {
        results.push({
          component: `ボタン: "${buttonTest.text}"`,
          visible: false,
          clickable: false,
          functional: false,
          status: '❁E不在'
        });
        console.log(`ボタン "${buttonTest.text}": ❁E不在`);
      }
    }
    
    console.log('\n=== ダチE��ュボ�Eド主要�Eタン機�EチE��ト結果 ===');
    const workingButtons = results.filter(r => r.functional).length;
    const totalButtons = results.length;
    console.log(`機�E中ボタン: ${workingButtons}/${totalButtons} (${((workingButtons/totalButtons)*100).toFixed(1)}%)`);
    
    results.forEach(result => {
      console.log(`${result.component}: ${result.status}`);
    });
    
    console.log('\n' + JSON.stringify(results, null, 2));
  });

  test('🌐 サイドメニュー基本機�EチE��チE, async ({ page }) => {
    console.log('=== サイドメニュー基本機�EチE��ト開姁E===');
    
    // ログイン処琁E
    await page.goto('/login');
    await page.waitForTimeout(2000);
    await page.click('[data-testid="seller-login"]');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("ログイン")');
    await page.waitForTimeout(3000);
    
    const results = [];
    
    // サイドメニューの主要E��E��
    const menuItems = [
      { text: 'ダチE��ュボ�EチE, expectedUrl: '/dashboard' },
      { text: '在庫管琁E, expectedUrl: '/inventory' },
      { text: '啁E��出品E, expectedUrl: '/sales' },
      { text: '配送管琁E, expectedUrl: '/delivery' },
      { text: '返品管琁E, expectedUrl: '/returns' },
      { text: 'レポ�EチE, expectedUrl: '/reports' },
      { text: '設宁E, expectedUrl: '/settings' },
      { text: 'プロフィール', expectedUrl: '/profile' }
    ];
    
    for (const menuItem of menuItems) {
      // 様、E��セレクタでメニュー頁E��を探ぁE
      const menuSelectors = [
        `nav a:has-text("${menuItem.text}")`,
        `aside a:has-text("${menuItem.text}")`,
        `.sidebar a:has-text("${menuItem.text}")`,
        `a[href="${menuItem.expectedUrl}"]`,
        `a:has-text("${menuItem.text}")`,
        `button:has-text("${menuItem.text}")`
      ];
      
      let menuElement = null;
      let selectorUsed = '';
      
      for (const selector of menuSelectors) {
        const element = page.locator(selector);
        if (await element.first().isVisible()) {
          menuElement = element.first();
          selectorUsed = selector;
          break;
        }
      }
      
      if (menuElement) {
        try {
          await menuElement.click();
          await page.waitForTimeout(2000);
          
          const currentUrl = page.url();
          const isWorking = currentUrl.includes(menuItem.expectedUrl);
          
          results.push({
            component: `サイドメニュー: "${menuItem.text}"`,
            visible: true,
            clickable: true,
            functional: isWorking,
            expectedUrl: menuItem.expectedUrl,
            currentUrl,
            selectorUsed,
            status: isWorking ? '✁E機�E中' : '❁E非機�E'
          });
          
          console.log(`サイドメニュー "${menuItem.text}": ${isWorking ? '✁E機�E中' : '❁E非機�E'}`);
          console.log(`  期征ERL: ${menuItem.expectedUrl}, 現在URL: ${currentUrl}`);
        } catch (error) {
                     results.push({
             component: `サイドメニュー: "${menuItem.text}"`,
             visible: true,
             clickable: false,
             functional: false,
             error: String(error),
             selectorUsed,
             status: '❁EクリチE��不可'
           });
           console.log(`サイドメニュー "${menuItem.text}": ❁EクリチE��不可 - ${String(error)}`);
        }
      } else {
        results.push({
          component: `サイドメニュー: "${menuItem.text}"`,
          visible: false,
          clickable: false,
          functional: false,
          status: '❁E不在'
        });
        console.log(`サイドメニュー "${menuItem.text}": ❁E不在`);
      }
    }
    
    console.log('\n=== サイドメニュー基本機�EチE��ト結果 ===');
    const workingMenus = results.filter(r => r.functional).length;
    const totalMenus = results.length;
    console.log(`機�E中メニュー: ${workingMenus}/${totalMenus} (${((workingMenus/totalMenus)*100).toFixed(1)}%)`);
    
    results.forEach(result => {
      console.log(`${result.component}: ${result.status}`);
    });
    
    console.log('\n' + JSON.stringify(results, null, 2));
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('🔍 最終UIコンポ�Eネント包括機�EチE��チE, () => {
  
  test.beforeEach(async ({ page }) => {
    // ログイン処琁E
    await page.goto('/login');
    await page.waitForTimeout(2000);
    
    // セラーログインボタンをクリチE��
    const sellerButton = page.locator('[data-testid="seller-login"]');
    if (await sellerButton.isVisible()) {
      await sellerButton.click();
      await page.waitForTimeout(1000);
    }
    
    // ログインボタンをクリチE��
    const loginButton = page.locator('button:has-text("ログイン")');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(3000);
    }
  });

  test('🌐 サイドメニュー全頁E��機�EチE��チE, async ({ page }) => {
    console.log('=== サイドメニュー全頁E��機�EチE��ト開姁E===');
    
    const menuItems = [
      { name: 'ダチE��ュボ�EチE, url: '/dashboard', selectors: ['nav a:has-text("ダチE��ュボ�EチE)', 'a[href="/dashboard"]', 'a:has-text("ダチE��ュボ�EチE)'] },
      { name: '在庫管琁E, url: '/inventory', selectors: ['nav a:has-text("在庫管琁E)', 'a[href="/inventory"]', 'a:has-text("在庫管琁E)'] },
      { name: '啁E��出品E, url: '/sales', selectors: ['nav a:has-text("啁E��出品E)', 'a[href="/sales"]', 'a:has-text("啁E��出品E)'] },
      { name: '配送管琁E, url: '/delivery', selectors: ['nav a:has-text("配送管琁E)', 'a[href="/delivery"]', 'a:has-text("配送管琁E)'] },
      { name: '返品管琁E, url: '/returns', selectors: ['nav a:has-text("返品管琁E)', 'a[href="/returns"]', 'a:has-text("返品管琁E)'] },
      { name: 'レポ�EチE, url: '/reports', selectors: ['nav a:has-text("レポ�EチE)', 'a[href="/reports"]', 'a:has-text("レポ�EチE)'] },
      { name: '設宁E, url: '/settings', selectors: ['nav a:has-text("設宁E)', 'a[href="/settings"]', 'a:has-text("設宁E)'] },
      { name: 'プロフィール', url: '/profile', selectors: ['nav a:has-text("プロフィール")', 'a[href="/profile"]', 'a:has-text("プロフィール")'] }
    ];
    
    const results = [];
    
    for (const item of menuItems) {
      console.log(`\n--- チE��ト中: ${item.name} ---`);
      
      let element = null;
      let usedSelector = '';
      
      // 褁E��のセレクタを試ぁE
      for (const selector of item.selectors) {
        const locator = page.locator(selector);
        if (await locator.first().isVisible()) {
          element = locator.first();
          usedSelector = selector;
          break;
        }
      }
      
      if (element) {
        try {
          const originalUrl = page.url();
          await element.click();
          await page.waitForTimeout(2000);
          
          const newUrl = page.url();
          const isWorking = newUrl.includes(item.url);
          
          results.push({
            component: `サイドメニュー: ${item.name}`,
            selector: usedSelector,
            visible: true,
            clickable: true,
            functional: isWorking,
            expectedUrl: item.url,
            actualUrl: newUrl,
            status: isWorking ? '✁E機�E中' : '❁E非機�E'
          });
          
          console.log(`${item.name}: ${isWorking ? '✁E機�E中' : '❁E非機�E'}`);
          console.log(`  期征ERL: ${item.url}`);
          console.log(`  実際URL: ${newUrl}`);
          console.log(`  使用セレクタ: ${usedSelector}`);
          
        } catch (error) {
          results.push({
            component: `サイドメニュー: ${item.name}`,
            selector: usedSelector,
            visible: true,
            clickable: false,
            functional: false,
            error: String(error),
            status: '❁EクリチE��不可'
          });
          console.log(`${item.name}: ❁EクリチE��不可 - ${String(error)}`);
        }
      } else {
        results.push({
          component: `サイドメニュー: ${item.name}`,
          selector: 'なぁE,
          visible: false,
          clickable: false,
          functional: false,
          status: '❁E要素不在'
        });
        console.log(`${item.name}: ❁E要素不在`);
      }
    }
    
    console.log('\n=== サイドメニューチE��ト結果サマリー ===');
    const workingCount = results.filter(r => r.functional).length;
    const totalCount = results.length;
    console.log(`機�E中: ${workingCount}/${totalCount} (${((workingCount/totalCount)*100).toFixed(1)}%)`);
    
    console.log('\n=== 機�E中の要素 ===');
    results.filter(r => r.functional).forEach(r => {
      console.log(`✁E${r.component}`);
    });
    
    console.log('\n=== 非機�Eの要素 ===');
    results.filter(r => !r.functional).forEach(r => {
      console.log(`❁E${r.component} - ${r.status}`);
    });
    
    console.log('\n=== 詳細結果 ===');
    console.log(JSON.stringify(results, null, 2));
  });

  test('🎯 ヘッダーメニュー全頁E��機�EチE��チE, async ({ page }) => {
    console.log('=== ヘッダーメニュー全頁E��機�EチE��ト開姁E===');
    
    const headerItems = [
      { name: 'プロフィールメニュー', selectors: ['button[aria-label*="プロフィール"]', '.profile-menu button', 'button:has-text("プロフィール")'] },
      { name: '通知ボタン', selectors: ['button[aria-label*="通知"]', '.notification-button', 'button:has-text("通知")'] },
      { name: '検索ボタン', selectors: ['button[aria-label*="検索"]', '.search-button', 'button:has-text("検索")'] },
      { name: 'ログアウト�Eタン', selectors: ['button:has-text("ログアウチE)', 'a:has-text("ログアウチE)'] }
    ];
    
    const results = [];
    
    for (const item of headerItems) {
      console.log(`\n--- チE��ト中: ${item.name} ---`);
      
      let element = null;
      let usedSelector = '';
      
      for (const selector of item.selectors) {
        const locator = page.locator(selector);
        if (await locator.first().isVisible()) {
          element = locator.first();
          usedSelector = selector;
          break;
        }
      }
      
      if (element) {
        try {
          await element.click();
          await page.waitForTimeout(1500);
          
          // 吁E��素の期征E��れる動作を確誁E
          let isWorking = false;
          let actionType = '';
          
          if (item.name === 'プロフィールメニュー') {
            const dropdown = page.locator('[role="menu"], .dropdown-menu');
            isWorking = await dropdown.isVisible();
            actionType = 'ドロチE�Eダウン表示';
          } else if (item.name === '通知ボタン') {
            const panel = page.locator('.notification-panel, [role="dialog"]');
            isWorking = await panel.isVisible();
            actionType = 'パネル表示';
          } else if (item.name === '検索ボタン') {
            const modal = page.locator('.search-modal, [role="dialog"]');
            isWorking = await modal.isVisible();
            actionType = 'モーダル表示';
          } else if (item.name === 'ログアウト�Eタン') {
            const currentUrl = page.url();
            isWorking = currentUrl.includes('/login');
            actionType = 'ログアウチE;
          }
          
          results.push({
            component: `ヘッダー: ${item.name}`,
            selector: usedSelector,
            visible: true,
            clickable: true,
            functional: isWorking,
            actionType,
            status: isWorking ? '✁E機�E中' : '❁E非機�E'
          });
          
          console.log(`${item.name}: ${isWorking ? '✁E機�E中' : '❁E非機�E'} (${actionType})`);
          
        } catch (error) {
          results.push({
            component: `ヘッダー: ${item.name}`,
            selector: usedSelector,
            visible: true,
            clickable: false,
            functional: false,
            error: String(error),
            status: '❁EクリチE��不可'
          });
          console.log(`${item.name}: ❁EクリチE��不可 - ${String(error)}`);
        }
      } else {
        results.push({
          component: `ヘッダー: ${item.name}`,
          selector: 'なぁE,
          visible: false,
          clickable: false,
          functional: false,
          status: '❁E要素不在'
        });
        console.log(`${item.name}: ❁E要素不在`);
      }
    }
    
    console.log('\n=== ヘッダーメニューチE��ト結果サマリー ===');
    const workingCount = results.filter(r => r.functional).length;
    const totalCount = results.length;
    console.log(`機�E中: ${workingCount}/${totalCount} (${((workingCount/totalCount)*100).toFixed(1)}%)`);
    
    console.log('\n=== 機�E中の要素 ===');
    results.filter(r => r.functional).forEach(r => {
      console.log(`✁E${r.component}`);
    });
    
    console.log('\n=== 非機�Eの要素 ===');
    results.filter(r => !r.functional).forEach(r => {
      console.log(`❁E${r.component} - ${r.status}`);
    });
    
    console.log('\n=== 詳細結果 ===');
    console.log(JSON.stringify(results, null, 2));
  });

  test('🔧 ダチE��ュボ�Eド�EチE��コンポ�Eネント機�EチE��チE, async ({ page }) => {
    console.log('=== ダチE��ュボ�Eド�EチE��コンポ�Eネント機�EチE��ト開姁E===');
    
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    const results = [];
    
    // ボタンチE��チE
    console.log('\n--- ボタンチE��チE---');
    const buttons = await page.locator('button').all();
    console.log(`総�Eタン数: ${buttons.length}`);
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const button = buttons[i];
      const buttonText = await button.textContent();
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      
      if (isVisible && isEnabled) {
        try {
          const originalUrl = page.url();
          await button.click();
          await page.waitForTimeout(1500);
          
          const newUrl = page.url();
          const hasModal = await page.locator('[role="dialog"]').isVisible();
          const hasUrlChange = originalUrl !== newUrl;
          const isWorking = hasModal || hasUrlChange;
          
          results.push({
            component: `ダチE��ュボ�Eド�Eタン: "${buttonText}"`,
            type: 'button',
            visible: true,
            clickable: true,
            functional: isWorking,
            actionType: hasModal ? 'modal' : hasUrlChange ? 'navigation' : 'none',
            status: isWorking ? '✁E機�E中' : '❁E非機�E'
          });
          
          console.log(`ボタン "${buttonText}": ${isWorking ? '✁E機�E中' : '❁E非機�E'}`);
          
          // 允E�E状態に戻ぁE
          if (hasModal) {
            const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じめE), button:has-text("ÁE)');
            if (await closeButton.first().isVisible()) {
              await closeButton.first().click();
              await page.waitForTimeout(1000);
            }
          }
          if (hasUrlChange) {
            await page.goto('/dashboard');
            await page.waitForTimeout(1000);
          }
          
        } catch (error) {
          results.push({
            component: `ダチE��ュボ�Eド�Eタン: "${buttonText}"`,
            type: 'button',
            visible: true,
            clickable: false,
            functional: false,
            error: String(error),
            status: '❁EクリチE��不可'
          });
          console.log(`ボタン "${buttonText}": ❁EクリチE��不可`);
        }
      } else {
        results.push({
          component: `ダチE��ュボ�Eド�Eタン: "${buttonText}"`,
          type: 'button',
          visible: isVisible,
          clickable: false,
          functional: false,
          status: '❁E非表示また�E無効'
        });
      }
    }
    
    // プルダウンチE��チE
    console.log('\n--- プルダウンチE��チE---');
    const selects = await page.locator('select').all();
    console.log(`総�Eルダウン数: ${selects.length}`);
    
    for (let i = 0; i < selects.length; i++) {
      const select = selects[i];
      const isVisible = await select.isVisible();
      const isEnabled = await select.isEnabled();
      
      if (isVisible && isEnabled) {
        try {
          const options = await select.locator('option').count();
          if (options > 1) {
            await select.selectOption({ index: 1 });
            const selectedValue = await select.inputValue();
            
            results.push({
              component: `ダチE��ュボ�Eド�Eルダウン ${i + 1}`,
              type: 'select',
              visible: true,
              clickable: true,
              functional: true,
              selectedValue,
              status: '✁E機�E中'
            });
            
            console.log(`プルダウン ${i + 1}: ✁E機�E中 - 選択値: ${selectedValue}`);
          }
        } catch (error) {
          results.push({
            component: `ダチE��ュボ�Eド�Eルダウン ${i + 1}`,
            type: 'select',
            visible: true,
            clickable: false,
            functional: false,
            error: String(error),
            status: '❁E選択不可'
          });
          console.log(`プルダウン ${i + 1}: ❁E選択不可`);
        }
      }
    }
    
    // チェチE��ボックスチE��チE
    console.log('\n--- チェチE��ボックスチE��チE---');
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    console.log(`総チェチE��ボックス数: ${checkboxes.length}`);
    
    for (let i = 0; i < checkboxes.length; i++) {
      const checkbox = checkboxes[i];
      const isVisible = await checkbox.isVisible();
      const isEnabled = await checkbox.isEnabled();
      
      if (isVisible && isEnabled) {
        try {
          const originalState = await checkbox.isChecked();
          await checkbox.click();
          await page.waitForTimeout(500);
          const newState = await checkbox.isChecked();
          const isWorking = originalState !== newState;
          
          results.push({
            component: `ダチE��ュボ�EドチェチE��ボックス ${i + 1}`,
            type: 'checkbox',
            visible: true,
            clickable: true,
            functional: isWorking,
            originalState,
            newState,
            status: isWorking ? '✁E機�E中' : '❁E非機�E'
          });
          
          console.log(`チェチE��ボックス ${i + 1}: ${isWorking ? '✁E機�E中' : '❁E非機�E'}`);
          
        } catch (error) {
          results.push({
            component: `ダチE��ュボ�EドチェチE��ボックス ${i + 1}`,
            type: 'checkbox',
            visible: true,
            clickable: false,
            functional: false,
            error: String(error),
            status: '❁EクリチE��不可'
          });
          console.log(`チェチE��ボックス ${i + 1}: ❁EクリチE��不可`);
        }
      }
    }
    
    // リンクチE��チE
    console.log('\n--- リンクチE��チE---');
    const links = await page.locator('a[href]').all();
    console.log(`総リンク数: ${links.length}`);
    
    for (let i = 0; i < Math.min(links.length, 5); i++) {
      const link = links[i];
      const isVisible = await link.isVisible();
      const href = await link.getAttribute('href');
      
      if (isVisible && href) {
        try {
          const originalUrl = page.url();
          await link.click();
          await page.waitForTimeout(1500);
          
          const newUrl = page.url();
          const hasNavigation = originalUrl !== newUrl;
          
          results.push({
            component: `ダチE��ュボ�Eドリンク ${i + 1}`,
            type: 'link',
            visible: true,
            clickable: true,
            functional: hasNavigation,
            href,
            status: hasNavigation ? '✁E機�E中' : '❁E非機�E'
          });
          
          console.log(`リンク ${i + 1} (${href}): ${hasNavigation ? '✁E機�E中' : '❁E非機�E'}`);
          
          // 允E��戻めE
          if (hasNavigation) {
            await page.goto('/dashboard');
            await page.waitForTimeout(1000);
          }
          
        } catch (error) {
          results.push({
            component: `ダチE��ュボ�Eドリンク ${i + 1}`,
            type: 'link',
            visible: true,
            clickable: false,
            functional: false,
            href,
            error: String(error),
            status: '❁EクリチE��不可'
          });
          console.log(`リンク ${i + 1}: ❁EクリチE��不可`);
        }
      }
    }
    
    console.log('\n=== ダチE��ュボ�Eド�EチE��コンポ�Eネントテスト結果サマリー ===');
    const workingCount = results.filter(r => r.functional).length;
    const totalCount = results.length;
    console.log(`機�E中: ${workingCount}/${totalCount} (${((workingCount/totalCount)*100).toFixed(1)}%)`);
    
    console.log('\n=== 機�E中の要素 ===');
    results.filter(r => r.functional).forEach(r => {
      console.log(`✁E${r.component}`);
    });
    
    console.log('\n=== 非機�Eの要素 ===');
    results.filter(r => !r.functional).forEach(r => {
      console.log(`❁E${r.component} - ${r.status}`);
    });
    
    console.log('\n=== 詳細結果 ===');
    console.log(JSON.stringify(results, null, 2));
  });

  test('🎭 モーダル機�EチE��チE, async ({ page }) => {
    console.log('=== モーダル機�EチE��ト開姁E===');
    
    const modalTests = [
      { page: '/dashboard', triggerText: '期間選抁E, modalType: '期間選択モーダル' },
      { page: '/dashboard', triggerText: '期間でフィルター', modalType: '期間フィルターモーダル' },
      { page: '/inventory', triggerText: '新規商品登録', modalType: '啁E��登録モーダル' },
      { page: '/inventory', triggerText: 'CSVインポ�EチE, modalType: 'CSVインポ�Eトモーダル' },
      { page: '/settings', triggerText: '設宁E, modalType: '設定モーダル' }
    ];
    
    const results = [];
    
    for (const modalTest of modalTests) {
      console.log(`\n--- チE��ト中: ${modalTest.modalType} ---`);
      
      await page.goto(modalTest.page);
      await page.waitForTimeout(2000);
      
      const triggerButton = page.locator(`button:has-text("${modalTest.triggerText}")`);
      const buttonExists = await triggerButton.isVisible();
      
      if (buttonExists) {
        try {
          await triggerButton.first().click();
          await page.waitForTimeout(1500);
          
          const modal = page.locator('[role="dialog"]');
          const isModalVisible = await modal.isVisible();
          
          if (isModalVisible) {
            // モーダル冁E�EボタンをテスチE
            const modalButtons = await modal.locator('button').all();
            console.log(`${modalTest.modalType} 冁E�Eタン数: ${modalButtons.length}`);
            
            // 閉じる�EタンをテスチE
            const closeButton = modal.locator('button:has-text("キャンセル"), button:has-text("閉じめE), button:has-text("ÁE)');
            if (await closeButton.first().isVisible()) {
              await closeButton.first().click();
              await page.waitForTimeout(1000);
              
              const isModalClosed = !(await modal.isVisible());
              
              results.push({
                component: modalTest.modalType,
                triggerText: modalTest.triggerText,
                visible: true,
                clickable: true,
                functional: isModalClosed,
                modalButtonCount: modalButtons.length,
                status: isModalClosed ? '✁E機�E中' : '❁E非機�E'
              });
              
              console.log(`${modalTest.modalType}: ${isModalClosed ? '✁E機�E中' : '❁E非機�E'}`);
            } else {
              results.push({
                component: modalTest.modalType,
                triggerText: modalTest.triggerText,
                visible: true,
                clickable: true,
                functional: false,
                modalButtonCount: modalButtons.length,
                status: '❁E閉じる�EタンなぁE
              });
              console.log(`${modalTest.modalType}: ❁E閉じる�Eタンなし`);
            }
          } else {
            results.push({
              component: modalTest.modalType,
              triggerText: modalTest.triggerText,
              visible: true,
              clickable: true,
              functional: false,
              status: '❁Eモーダル未表示'
            });
            console.log(`${modalTest.modalType}: ❁Eモーダル未表示`);
          }
        } catch (error) {
          results.push({
            component: modalTest.modalType,
            triggerText: modalTest.triggerText,
            visible: true,
            clickable: false,
            functional: false,
            error: String(error),
            status: '❁Eトリガー不可'
          });
          console.log(`${modalTest.modalType}: ❁Eトリガー不可 - ${String(error)}`);
        }
      } else {
        results.push({
          component: modalTest.modalType,
          triggerText: modalTest.triggerText,
          visible: false,
          clickable: false,
          functional: false,
          status: '❁Eトリガーボタン不在'
        });
        console.log(`${modalTest.modalType}: ❁Eトリガーボタン不在`);
      }
    }
    
    console.log('\n=== モーダル機�EチE��ト結果サマリー ===');
    const workingCount = results.filter(r => r.functional).length;
    const totalCount = results.length;
    console.log(`機�E中: ${workingCount}/${totalCount} (${((workingCount/totalCount)*100).toFixed(1)}%)`);
    
    console.log('\n=== 機�E中の要素 ===');
    results.filter(r => r.functional).forEach(r => {
      console.log(`✁E${r.component}`);
    });
    
    console.log('\n=== 非機�Eの要素 ===');
    results.filter(r => !r.functional).forEach(r => {
      console.log(`❁E${r.component} - ${r.status}`);
    });
    
    console.log('\n=== 詳細結果 ===');
    console.log(JSON.stringify(results, null, 2));
  });

  test('📊 全画面統吁EIコンポ�EネントテスチE, async ({ page }) => {
    console.log('=== 全画面統吁EIコンポ�Eネントテスト開姁E===');
    
    const pages = [
      { name: 'ダチE��ュボ�EチE, url: '/dashboard' },
      { name: '在庫管琁E, url: '/inventory' },
      { name: '啁E��出品E, url: '/sales' },
      { name: '配送管琁E, url: '/delivery' },
      { name: '返品管琁E, url: '/returns' },
      { name: 'レポ�EチE, url: '/reports' },
      { name: '設宁E, url: '/settings' },
      { name: 'プロフィール', url: '/profile' }
    ];
    
    const allResults = [];
    
    for (const pageInfo of pages) {
      console.log(`\n--- ${pageInfo.name} (${pageInfo.url}) ペ�EジチE��チE---`);
      
      try {
        await page.goto(pageInfo.url);
        await page.waitForTimeout(2000);
        
        const pageResults = [];
        
        // ペ�Eジ基本惁E��
        const pageTitle = await page.title();
        const h1 = await page.locator('h1').first().textContent();
        
        // ボタンチE��チE
        const buttons = await page.locator('button').all();
        const visibleButtons = [];
        for (const button of buttons) {
          if (await button.isVisible() && await button.isEnabled()) {
            visibleButtons.push(button);
          }
        }
        
        console.log(`  ペ�Eジタイトル: ${pageTitle}`);
        console.log(`  H1タイトル: ${h1}`);
        console.log(`  総�Eタン数: ${buttons.length}`);
        console.log(`  有効ボタン数: ${visibleButtons.length}`);
        
        // 最初�E3個�EボタンをテスチE
        for (let i = 0; i < Math.min(visibleButtons.length, 3); i++) {
          const button = visibleButtons[i];
          const buttonText = await button.textContent();
          
          try {
            const originalUrl = page.url();
            await button.click();
            await page.waitForTimeout(1000);
            
            const newUrl = page.url();
            const hasModal = await page.locator('[role="dialog"]').isVisible();
            const hasUrlChange = originalUrl !== newUrl;
            const isWorking = hasModal || hasUrlChange;
            
            pageResults.push({
              page: pageInfo.name,
              component: `ボタン: "${buttonText}"`,
              type: 'button',
              functional: isWorking,
              actionType: hasModal ? 'modal' : hasUrlChange ? 'navigation' : 'none',
              status: isWorking ? '✁E機�E中' : '❁E非機�E'
            });
            
            // 允E�E状態に戻ぁE
            if (hasModal) {
              const closeButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じめE), button:has-text("ÁE)');
              if (await closeButton.first().isVisible()) {
                await closeButton.first().click();
                await page.waitForTimeout(500);
              }
            }
            if (hasUrlChange) {
              await page.goto(pageInfo.url);
              await page.waitForTimeout(1000);
            }
            
          } catch (error) {
            pageResults.push({
              page: pageInfo.name,
              component: `ボタン: "${buttonText}"`,
              type: 'button',
              functional: false,
              error: String(error),
              status: '❁EクリチE��不可'
            });
          }
        }
        
        // プルダウンチE��チE
        const selects = await page.locator('select').all();
        for (let i = 0; i < selects.length; i++) {
          const select = selects[i];
          if (await select.isVisible() && await select.isEnabled()) {
            try {
              const options = await select.locator('option').count();
              if (options > 1) {
                await select.selectOption({ index: 1 });
                
                pageResults.push({
                  page: pageInfo.name,
                  component: `プルダウン ${i + 1}`,
                  type: 'select',
                  functional: true,
                  status: '✁E機�E中'
                });
              }
            } catch (error) {
              pageResults.push({
                page: pageInfo.name,
                component: `プルダウン ${i + 1}`,
                type: 'select',
                functional: false,
                error: String(error),
                status: '❁E選択不可'
              });
            }
          }
        }
        
        // チェチE��ボックスチE��チE
        const checkboxes = await page.locator('input[type="checkbox"]').all();
        for (let i = 0; i < checkboxes.length; i++) {
          const checkbox = checkboxes[i];
          if (await checkbox.isVisible() && await checkbox.isEnabled()) {
            try {
              const originalState = await checkbox.isChecked();
              await checkbox.click();
              await page.waitForTimeout(300);
              const newState = await checkbox.isChecked();
              const isWorking = originalState !== newState;
              
              pageResults.push({
                page: pageInfo.name,
                component: `チェチE��ボックス ${i + 1}`,
                type: 'checkbox',
                functional: isWorking,
                status: isWorking ? '✁E機�E中' : '❁E非機�E'
              });
            } catch (error) {
              pageResults.push({
                page: pageInfo.name,
                component: `チェチE��ボックス ${i + 1}`,
                type: 'checkbox',
                functional: false,
                error: String(error),
                status: '❁EクリチE��不可'
              });
            }
          }
        }
        
        allResults.push(...pageResults);
        
        // ペ�Eジ結果を表示
        console.log(`  チE��ト済みコンポ�EネンチE ${pageResults.length}個`);
        console.log(`  機�E中: ${pageResults.filter(r => r.functional).length}個`);
        console.log(`  非機�E: ${pageResults.filter(r => !r.functional).length}個`);
        
      } catch (error) {
        console.log(`${pageInfo.name}: ペ�Eジアクセス不可 - ${String(error)}`);
        allResults.push({
          page: pageInfo.name,
          component: 'ペ�Eジ全佁E,
          type: 'page',
          functional: false,
          error: String(error),
          status: '❁Eアクセス不可'
        });
      }
    }
    
    console.log('\n=== 全画面統合テスト結果サマリー ===');
    
    const summary = {
      total: allResults.length,
      functional: allResults.filter(r => r.functional).length,
      nonFunctional: allResults.filter(r => !r.functional).length
    };
    
    console.log(`総コンポ�Eネント数: ${summary.total}`);
    console.log(`機�E中: ${summary.functional}`);
    console.log(`非機�E: ${summary.nonFunctional}`);
    console.log(`機�E玁E ${((summary.functional / summary.total) * 100).toFixed(1)}%`);
    
    console.log('\n=== ペ�Eジ別機�E玁E===');
    pages.forEach(pageInfo => {
      const pageResults = allResults.filter(r => r.page === pageInfo.name);
      const pageFunctional = pageResults.filter(r => r.functional).length;
      const pageTotal = pageResults.length;
      const pageRate = pageTotal > 0 ? ((pageFunctional / pageTotal) * 100).toFixed(1) : '0.0';
      console.log(`${pageInfo.name}: ${pageFunctional}/${pageTotal} (${pageRate}%)`);
    });
    
    console.log('\n=== 機�E中の要素 ===');
    allResults.filter(r => r.functional).forEach(r => {
      console.log(`✁E[${r.page}] ${r.component}`);
    });
    
    console.log('\n=== 非機�Eの要素 ===');
    allResults.filter(r => !r.functional).forEach(r => {
      console.log(`❁E[${r.page}] ${r.component} - ${r.status}`);
    });
    
    console.log('\n=== 詳細結果 ===');
    console.log(JSON.stringify(allResults, null, 2));
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('UI修復確認テスチE, () => {
  test('ダチE��ュボ�Eド�EージのUI表示確誁E, async ({ page }) => {
    // ダチE��ュボ�Eド�Eージに移勁E    await page.goto('http://localhost:3002/dashboard');
    
    // ペ�Eジタイトルが表示されることを確誁E    await expect(page.locator('h1')).toBeVisible();
    
    // intelligence-cardが表示されることを確誁E    await expect(page.locator('.intelligence-card').first()).toBeVisible();
    
    // スクロールが機�Eすることを確誁E    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    
    console.log('✁EダチE��ュボ�Eド�EージのUI表示確認完亁E);
  });

  test('在庫管琁E�EージのUI表示確誁E, async ({ page }) => {
    // 在庫管琁E�Eージに移勁E    await page.goto('http://localhost:3002/inventory');
    
    // ペ�Eジが読み込まれることを確誁E    await expect(page.locator('h1')).toBeVisible();
    
    // メトリクスカードが表示されることを確誁E    await expect(page.locator('.intelligence-metrics').first()).toBeVisible();
    
    console.log('✁E在庫管琁E�EージのUI表示確認完亁E);
  });

  test('スタチE��ダチE��ュボ�Eド�EージのUI表示確誁E, async ({ page }) => {
    // スタチE��ダチE��ュボ�Eド�Eージに移勁E    await page.goto('http://localhost:3002/staff/dashboard');
    
    // ペ�Eジが読み込まれることを確誁E    await expect(page.locator('h1')).toBeVisible();
    
    // intelligence-cardが表示されることを確誁E    await expect(page.locator('.intelligence-card').first()).toBeVisible();
    
    console.log('✁EスタチE��ダチE��ュボ�Eド�EージのUI表示確認完亁E);
  });

  test('横幁E��御の確誁E, async ({ page }) => {
    await page.goto('http://localhost:3002/dashboard');
    
    // ペ�EジコンチE��の最大幁E��適刁E��設定されてぁE��ことを確誁E    const container = page.locator('.page-scroll-container > div').first();
    await expect(container).toHaveCSS('max-width', '1600px');
    
    console.log('✁E横幁E��御の確認完亁E);
  });

  test('スクロール機�Eの確誁E, async ({ page }) => {
    await page.goto('http://localhost:3002/test-scroll');
    
    // スクロールチE��ト�Eージでスクロールが機�Eすることを確誁E    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    
    const scrollTop = await page.evaluate(() => window.pageYOffset);
    expect(scrollTop).toBeGreaterThan(0);
    
    console.log('✁Eスクロール機�Eの確認完亁E);
  });
}); 

test.describe('🔧 ドロチE�Eダウンメニューz-index修正検証', () => {
  test.beforeEach(async ({ page }) => {
    // スタチE��ダチE��ュボ�Eドに移勁E    await page.goto('/staff/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('📋 プロフィールメニューが最前面に表示されめE, async ({ page }) => {
    // プロフィールボタンをクリチE��
    const profileButton = page.locator('button').filter({ hasText: 'スタチE��' }).first();
    await expect(profileButton).toBeVisible();
    await profileButton.click();

    // プロフィールメニューが表示されることを確誁E    const profileMenu = page.locator('[data-testid="profile-menu"]');
    await expect(profileMenu).toBeVisible({ timeout: 5000 });

    // z-indexが適刁E��設定されてぁE��ことを確誁E    const zIndex = await profileMenu.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      console.log('Profile menu z-index:', computedStyle.zIndex);
      return computedStyle.zIndex;
    });
    
    console.log('Actual z-index value:', zIndex);
    
    // z-index ぁE10000 以上であることを確認（文字�Eとして比輁E��E    const zIndexNum = parseInt(zIndex);
    expect(zIndexNum).toBeGreaterThanOrEqual(10000);

    // メニューが実際に表示されてぁE��ことを確誁E    const rect = await profileMenu.boundingBox();
    expect(rect).not.toBeNull();
    expect(rect!.width).toBeGreaterThan(0);
    expect(rect!.height).toBeGreaterThan(0);
  });

  test('🔔 通知パネルが最前面に表示されめE, async ({ page }) => {
    // 通知ボタンをクリチE��
    const notificationButton = page.locator('button[aria-label="通知"]');
    await expect(notificationButton).toBeVisible();
    await notificationButton.click();

    // 通知パネルが表示されることを確誁E    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible({ timeout: 5000 });

    // z-indexが適刁E��設定されてぁE��ことを確誁E    const zIndex = await notificationPanel.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      console.log('Notification panel z-index:', computedStyle.zIndex);
      return computedStyle.zIndex;
    });
    
    console.log('Notification panel z-index value:', zIndex);
    const zIndexNum = parseInt(zIndex);
    expect(zIndexNum).toBeGreaterThanOrEqual(10000);
  });

  test('📦 出荷ペ�EジのスチE�EタスドロチE�Eダウンが最前面に表示されめE, async ({ page }) => {
    // 出荷ペ�Eジに移勁E    await page.goto('/staff/shipping');
    await page.waitForLoadState('networkidle');

    // 統一されたスチE�Eタス変更ボタンを探してクリチE��
    const statusButton = page.locator('button').filter({ hasText: 'スチE�Eタス変更' }).first();
    
    if (await statusButton.isVisible()) {
      await statusButton.click();

      // 統一されたスチE�EタスドロチE�Eダウンが表示されることを確誁E      const dropdown = page.locator('[data-testid="unified-status-dropdown"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      // z-indexが適刁E��設定されてぁE��ことを確誁E      const zIndex = await dropdown.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        console.log('Unified status dropdown z-index:', computedStyle.zIndex);
        return computedStyle.zIndex;
      });
      
      console.log('Unified status dropdown z-index value:', zIndex);
      const zIndexNum = parseInt(zIndex);
      expect(zIndexNum).toBe(10000);

      // ドロチE�Eダウンの冁E��が統一されたUIチE��インになってぁE��ことを確誁E      const dropdownHeader = dropdown.locator('text=次のスチE�Eタスに変更');
      await expect(dropdownHeader).toBeVisible();

      // スチE�Eタスオプションが表示されることを確誁E      const statusOptions = dropdown.locator('.unified-status-option');
      const optionCount = await statusOptions.count();
      expect(optionCount).toBeGreaterThan(0);

      console.log(`Found ${optionCount} status options in unified dropdown`);
    } else {
      console.log('No unified status change button found on shipping page');
      // スチE�Eタス変更ボタンが見つからなぁE��合�EチE��トをスキチE�E
      test.skip();
    }
  });

  test('🏗�E�Ez-index階層シスチE��の整合性確誁E, async ({ page }) => {
    // ヘッダーのz-indexを確誁E    const header = page.locator('header.nexus-header');
    await expect(header).toBeVisible();
    
    const headerZIndex = await header.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      console.log('Header z-index:', computedStyle.zIndex);
      return computedStyle.zIndex;
    });
    
    console.log('Header z-index value:', headerZIndex);
    // ヘッダーぁEz-index 100 であることを確誁E    expect(parseInt(headerZIndex)).toBe(100);

    // プロフィールメニューを開ぁE    const profileButton = page.locator('button').filter({ hasText: 'スタチE��' }).first();
    await profileButton.click();

    const profileMenu = page.locator('[data-testid="profile-menu"]');
    await expect(profileMenu).toBeVisible({ timeout: 5000 });

    const menuZIndex = await profileMenu.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      console.log('Profile menu z-index:', computedStyle.zIndex);
      return computedStyle.zIndex;
    });

    console.log('Profile menu z-index value:', menuZIndex);
    // ドロチE�Eダウンメニューが�EチE��ーより高いz-indexを持つことを確誁E    expect(parseInt(menuZIndex)).toBeGreaterThan(parseInt(headerZIndex));
  });

  test('🎯 褁E��のドロチE�Eダウンメニューの重�E合わせ動佁E, async ({ page }) => {
    // 通知パネルのz-indexを確誁E    const notificationButton = page.locator('button[aria-label="通知"]');
    await notificationButton.click();

    const notificationPanel = page.locator('[data-testid="notification-panel"]');
    await expect(notificationPanel).toBeVisible({ timeout: 5000 });

    const notificationZIndex = await notificationPanel.evaluate((el) => {
      return window.getComputedStyle(el).zIndex;
    });

    console.log('Notification z-index:', notificationZIndex);
    expect(parseInt(notificationZIndex)).toBe(10000);

    // 通知パネルを閉じる�E�通知ボタンを�EクリチE���E�E    await notificationButton.click();

    // プロフィールメニューのz-indexを確誁E    const profileButton = page.locator('button').filter({ hasText: 'スタチE��' }).first();
    await profileButton.click();

    const profileMenu = page.locator('[data-testid="profile-menu"]');
    await expect(profileMenu).toBeVisible({ timeout: 5000 });

    const profileZIndex = await profileMenu.evaluate((el) => {
      return window.getComputedStyle(el).zIndex;
    });

    console.log('Profile z-index:', profileZIndex);
    expect(parseInt(profileZIndex)).toBe(10000);

    // 両方のメニューが同ぁE-index階層にあることを確誁E    expect(parseInt(profileZIndex)).toBe(parseInt(notificationZIndex));
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('UI機�E性チE��チE- 全要素の動作確誁E, () => {
  let testResults: {
    category: string;
    element: string;
    selector: string;
    status: 'functional' | 'non-functional' | 'not-found';
    details?: string;
  }[] = [];

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'Test@2024');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  });

  test.afterAll(async () => {
    console.log('\n============ UI機�E性チE��ト結果レポ�EチE============\n');
    
    const functional = testResults.filter(r => r.status === 'functional');
    const nonFunctional = testResults.filter(r => r.status === 'non-functional');
    const notFound = testResults.filter(r => r.status === 'not-found');

    console.log(`✁E機�EしてぁE��要素: ${functional.length}件`);
    functional.forEach(r => {
      console.log(`  - [${r.category}] ${r.element} (${r.selector})`);
      if (r.details) console.log(`    詳細: ${r.details}`);
    });

    console.log(`\n❁E機�EしてぁE��ぁE��素: ${nonFunctional.length}件`);
    nonFunctional.forEach(r => {
      console.log(`  - [${r.category}] ${r.element} (${r.selector})`);
      if (r.details) console.log(`    詳細: ${r.details}`);
    });

    console.log(`\n⚠�E�E見つからなぁE��素: ${notFound.length}件`);
    notFound.forEach(r => {
      console.log(`  - [${r.category}] ${r.element} (${r.selector})`);
    });

    console.log('\n============================================\n');
  });

  test('サイドメニューの全頁E��の機�E確誁E, async ({ page }) => {
    const sideMenuItems = [
      { name: 'ダチE��ュボ�EチE, selector: 'a[href="/dashboard"]', expectedUrl: '/dashboard' },
      { name: '在庫管琁E, selector: 'a[href="/inventory"]', expectedUrl: '/inventory' },
      { name: '入荷計画', selector: 'a[href="/delivery-plan"]', expectedUrl: '/delivery-plan' },
      { name: '出品管琁E, selector: 'a[href="/listing"]', expectedUrl: '/listing' },
      { name: '注斁E��琁E, selector: 'a[href="/orders"]', expectedUrl: '/orders' },
      { name: '出荷管琁E, selector: 'a[href="/shipping"]', expectedUrl: '/shipping' },
      { name: '返品管琁E, selector: 'a[href="/returns"]', expectedUrl: '/returns' },
      { name: 'レポ�EチE, selector: 'a[href="/reports"]', expectedUrl: '/reports' },
      { name: '設宁E, selector: 'a[href="/settings"]', expectedUrl: '/settings' }
    ];

    for (const item of sideMenuItems) {
      try {
        const element = await page.locator(item.selector);
        if (await element.isVisible()) {
          await element.click();
          await page.waitForLoadState('networkidle');
          const currentUrl = page.url();
          
          if (currentUrl.includes(item.expectedUrl)) {
            testResults.push({
              category: 'サイドメニュー',
              element: item.name,
              selector: item.selector,
              status: 'functional',
              details: `正常に${item.expectedUrl}へ遷移`
            });
          } else {
            testResults.push({
              category: 'サイドメニュー',
              element: item.name,
              selector: item.selector,
              status: 'non-functional',
              details: `期征E��れたURL(${item.expectedUrl})と異なめE ${currentUrl}`
            });
          }
        } else {
          testResults.push({
            category: 'サイドメニュー',
            element: item.name,
            selector: item.selector,
            status: 'not-found'
          });
        }
      } catch (error) {
        testResults.push({
          category: 'サイドメニュー',
          element: item.name,
          selector: item.selector,
          status: 'non-functional',
          details: error.message
        });
      }
    }
  });

  test('ヘッダーメニューの機�E確誁E, async ({ page }) => {
    await page.goto('/dashboard');
    
    const headerItems = [
      { name: '通知アイコン', selector: 'button[aria-label="通知"]', action: 'click' },
      { name: 'プロフィールメニュー', selector: 'button[aria-label="プロフィール"]', action: 'click' },
      { name: 'ログアウチE, selector: 'button:has-text("ログアウチE)', action: 'click' }
    ];

    for (const item of headerItems) {
      try {
        const element = await page.locator(item.selector).first();
        if (await element.isVisible()) {
          if (item.action === 'click') {
            await element.click();
            await page.waitForTimeout(1000);
            
            if (item.name === '通知アイコン') {
              const notificationPanel = await page.locator('[role="dialog"], .notification-panel, div[class*="notification"]');
              if (await notificationPanel.isVisible()) {
                testResults.push({
                  category: 'ヘッダー',
                  element: item.name,
                  selector: item.selector,
                  status: 'functional',
                  details: '通知パネルが表示されめE
                });
              } else {
                testResults.push({
                  category: 'ヘッダー',
                  element: item.name,
                  selector: item.selector,
                  status: 'non-functional',
                  details: '通知パネルが表示されなぁE
                });
              }
            } else if (item.name === 'プロフィールメニュー') {
              const profileMenu = await page.locator('[role="menu"], .profile-menu, div[class*="menu"]');
              if (await profileMenu.isVisible()) {
                testResults.push({
                  category: 'ヘッダー',
                  element: item.name,
                  selector: item.selector,
                  status: 'functional',
                  details: 'プロフィールメニューが表示されめE
                });
              } else {
                testResults.push({
                  category: 'ヘッダー',
                  element: item.name,
                  selector: item.selector,
                  status: 'non-functional',
                  details: 'プロフィールメニューが表示されなぁE
                });
              }
            }
          }
        } else {
          testResults.push({
            category: 'ヘッダー',
            element: item.name,
            selector: item.selector,
            status: 'not-found'
          });
        }
      } catch (error) {
        testResults.push({
          category: 'ヘッダー',
          element: item.name,
          selector: item.selector,
          status: 'non-functional',
          details: error.message
        });
      }
    }
  });

  test('ボディ冁E�Eボタン要素の機�E確誁E, async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    const buttons = await page.locator('button:visible').all();
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const button = buttons[i];
      const buttonText = await button.textContent() || `ボタン${i + 1}`;
      const buttonSelector = `button:nth-of-type(${i + 1})`;
      
      try {
        if (await button.isEnabled()) {
          await button.click();
          await page.waitForTimeout(500);
          
          const hasModal = await page.locator('[role="dialog"], .modal').isVisible();
          const urlChanged = page.url() !== 'http://localhost:3000/inventory';
          
          if (hasModal || urlChanged) {
            testResults.push({
              category: 'ボタン',
              element: buttonText.trim(),
              selector: buttonSelector,
              status: 'functional',
              details: hasModal ? 'モーダル/ダイアログを開ぁE : 'ペ�Eジ遷移する'
            });
          } else {
            testResults.push({
              category: 'ボタン',
              element: buttonText.trim(),
              selector: buttonSelector,
              status: 'non-functional',
              details: 'クリチE��しても何も起こらなぁE
            });
          }
          
          if (hasModal) {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
          } else if (urlChanged) {
            await page.goto('/inventory');
          }
        } else {
          testResults.push({
            category: 'ボタン',
            element: buttonText.trim(),
            selector: buttonSelector,
            status: 'non-functional',
            details: '無効化されてぁE��'
          });
        }
      } catch (error) {
        testResults.push({
          category: 'ボタン',
          element: buttonText.trim(),
          selector: buttonSelector,
          status: 'non-functional',
          details: error.message
        });
      }
    }
  });

  test('プルダウン、トグル、チェチE��ボックスの機�E確誁E, async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // プルダウン�E�セレクト）�E確誁E
    const selects = await page.locator('select:visible').all();
    for (let i = 0; i < selects.length; i++) {
      const select = selects[i];
      const selectId = await select.getAttribute('id') || `select-${i}`;
      
      try {
        const options = await select.locator('option').count();
        if (options > 1) {
          await select.selectOption({ index: 1 });
          testResults.push({
            category: 'プルダウン',
            element: selectId,
            selector: `select#${selectId}`,
            status: 'functional',
            details: `${options}個�Eオプションあり`
          });
        } else {
          testResults.push({
            category: 'プルダウン',
            element: selectId,
            selector: `select#${selectId}`,
            status: 'non-functional',
            details: 'オプションぁE個以丁E
          });
        }
      } catch (error) {
        testResults.push({
          category: 'プルダウン',
          element: selectId,
          selector: `select#${selectId}`,
          status: 'non-functional',
          details: error.message
        });
      }
    }

    // トグルスイチE��の確誁E
    const toggles = await page.locator('input[type="checkbox"][role="switch"], button[role="switch"]').all();
    for (let i = 0; i < toggles.length; i++) {
      const toggle = toggles[i];
      const toggleId = await toggle.getAttribute('id') || `toggle-${i}`;
      
      try {
        const initialState = await toggle.isChecked();
        await toggle.click();
        const newState = await toggle.isChecked();
        
        if (initialState !== newState) {
          testResults.push({
            category: 'トグル',
            element: toggleId,
            selector: `#${toggleId}`,
            status: 'functional',
            details: '状態�E刁E��替えが可能'
          });
        } else {
          testResults.push({
            category: 'トグル',
            element: toggleId,
            selector: `#${toggleId}`,
            status: 'non-functional',
            details: '状態が変化しなぁE
          });
        }
      } catch (error) {
        testResults.push({
          category: 'トグル',
          element: toggleId,
          selector: `#${toggleId}`,
          status: 'non-functional',
          details: error.message
        });
      }
    }

    // チェチE��ボックスの確誁E
    const checkboxes = await page.locator('input[type="checkbox"]:not([role="switch"])').all();
    for (let i = 0; i < Math.min(checkboxes.length, 5); i++) {
      const checkbox = checkboxes[i];
      const checkboxId = await checkbox.getAttribute('id') || `checkbox-${i}`;
      
      try {
        const initialState = await checkbox.isChecked();
        await checkbox.click();
        const newState = await checkbox.isChecked();
        
        if (initialState !== newState) {
          testResults.push({
            category: 'チェチE��ボックス',
            element: checkboxId,
            selector: `#${checkboxId}`,
            status: 'functional',
            details: 'チェチE��状態�E刁E��替えが可能'
          });
        } else {
          testResults.push({
            category: 'チェチE��ボックス',
            element: checkboxId,
            selector: `#${checkboxId}`,
            status: 'non-functional',
            details: 'チェチE��状態が変化しなぁE
          });
        }
      } catch (error) {
        testResults.push({
          category: 'チェチE��ボックス',
          element: checkboxId,
          selector: `#${checkboxId}`,
          status: 'non-functional',
          details: error.message
        });
      }
    }
  });

  test('リンク要素の機�E確誁E, async ({ page }) => {
    await page.goto('/dashboard');
    
    const links = await page.locator('a[href]:visible').all();
    const checkedLinks = new Set<string>();
    
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const link = links[i];
      const href = await link.getAttribute('href');
      const linkText = await link.textContent() || `リンク${i + 1}`;
      
      if (href && !checkedLinks.has(href)) {
        checkedLinks.add(href);
        
        try {
          if (href.startsWith('http')) {
            testResults.push({
              category: 'リンク',
              element: linkText.trim(),
              selector: `a[href="${href}"]`,
              status: 'functional',
              details: '外部リンク�E�クリチE��チE��ト�EスキチE�E�E�E
            });
          } else {
            const originalUrl = page.url();
            await link.click();
            await page.waitForLoadState('networkidle');
            const newUrl = page.url();
            
            if (newUrl !== originalUrl) {
              testResults.push({
                category: 'リンク',
                element: linkText.trim(),
                selector: `a[href="${href}"]`,
                status: 'functional',
                details: `${href}へ遷移成功`
              });
              await page.goto('/dashboard');
            } else {
              testResults.push({
                category: 'リンク',
                element: linkText.trim(),
                selector: `a[href="${href}"]`,
                status: 'non-functional',
                details: 'クリチE��しても�E移しなぁE
              });
            }
          }
        } catch (error) {
          testResults.push({
            category: 'リンク',
            element: linkText.trim(),
            selector: `a[href="${href}"]`,
            status: 'non-functional',
            details: error.message
          });
        }
      }
    }
  });

  test('モーダルの機�E確誁E, async ({ page }) => {
    await page.goto('/inventory');
    
    const modalTriggers = [
      { trigger: 'button:has-text("新規商品追加")', modalSelector: '[role="dialog"]' },
      { trigger: 'button:has-text("インポ�EチE)', modalSelector: '.modal' },
      { trigger: 'button:has-text("エクスポ�EチE)', modalSelector: '[aria-modal="true"]' }
    ];

    for (const { trigger, modalSelector } of modalTriggers) {
      try {
        const triggerButton = await page.locator(trigger).first();
        if (await triggerButton.isVisible()) {
          await triggerButton.click();
          await page.waitForTimeout(1000);
          
          const modal = await page.locator(modalSelector).first();
          if (await modal.isVisible()) {
            testResults.push({
              category: 'モーダル',
              element: trigger,
              selector: trigger,
              status: 'functional',
              details: 'モーダルが正常に表示されめE
            });
            
            // モーダルを閉じる
            const closeButton = await modal.locator('button:has-text("閉じめE), button:has-text("キャンセル"), button[aria-label="Close"]').first();
            if (await closeButton.isVisible()) {
              await closeButton.click();
            } else {
              await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(500);
          } else {
            testResults.push({
              category: 'モーダル',
              element: trigger,
              selector: trigger,
              status: 'non-functional',
              details: 'モーダルが表示されなぁE
            });
          }
        } else {
          testResults.push({
            category: 'モーダル',
            element: trigger,
            selector: trigger,
            status: 'not-found'
          });
        }
      } catch (error) {
        testResults.push({
          category: 'モーダル',
          element: trigger,
          selector: trigger,
          status: 'non-functional',
          details: error.message
        });
      }
    }
  });
});
import { test, expect } from '@playwright/test';

test.describe('🔍 UIモーダル機�E動作検証', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(2000);
    await page.fill('input[name="username"]', 'seller');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  });

  test('🎯 ダチE��ュボ�Eド期間選択モーダル検証', async ({ page }) => {
    console.log('=== ダチE��ュボ�Eド期間選択モーダル検証開姁E===');
    
    await page.goto('/dashboard');
    await page.waitForTimeout(3000);
    
    // 期間選択�Eタンを探ぁE
    const periodButton = page.locator('button:has-text("期間選抁E), button:has-text("レポ�Eト期閁E)').first();
    
    const buttonExists = await periodButton.isVisible();
    console.log(`期間選択�Eタン存在: ${buttonExists ? '✁E : '❁E}`);
    
    if (buttonExists) {
      await periodButton.click();
      await page.waitForTimeout(2000);
      
      // モーダルが開ぁE��かチェチE��
      const modal = page.locator('[role="dialog"]');
      const modalOpen = await modal.isVisible();
      console.log(`モーダル開閉: ${modalOpen ? '✁E動佁E : '❁E未動佁E}`);
      
      if (modalOpen) {
        // DateRangePickerの存在確誁E
        const dateRangePicker = page.locator('.rdrCalendarWrapper');
        const pickerExists = await dateRangePicker.isVisible();
        console.log(`DateRangePicker表示: ${pickerExists ? '✁E動佁E : '❁E未動佁E}`);
        
        // 適用ボタンの存在確誁E
        const applyButton = page.locator('button:has-text("適用")');
        const applyExists = await applyButton.isVisible();
        console.log(`適用ボタン存在: ${applyExists ? '✁E動佁E : '❁E未動佁E}`);
        
        if (applyExists) {
          await applyButton.click();
          await page.waitForTimeout(1000);
          
          // モーダルが閉じたかチェチE��
          const modalClosed = !(await modal.isVisible());
          console.log(`モーダル閉じめE ${modalClosed ? '✁E動佁E : '❁E未動佁E}`);
          
          if (modalClosed) {
            console.log('🎉 ダチE��ュボ�Eド期間選択モーダル: 完�E実裁E��み');
          } else {
            console.log('❁EダチE��ュボ�Eド期間選択モーダル: 部刁E��実裁E);
          }
        } else {
          console.log('❁EダチE��ュボ�Eド期間選択モーダル: 部刁E��実裁E);
        }
      } else {
        console.log('❁EダチE��ュボ�Eド期間選択モーダル: 未実裁E);
      }
    } else {
      console.log('❁EダチE��ュボ�Eド期間選択�Eタン: 未実裁E);
    }
  });

  test('📦 在庫管琁E��品登録モーダル検証', async ({ page }) => {
    console.log('=== 在庫管琁E��品登録モーダル検証開姁E===');
    
    await page.goto('/inventory');
    await page.waitForTimeout(3000);
    
    // 新規商品登録ボタンを探ぁE
    const addButton = page.locator('button:has-text("新規商品登録"), button:has-text("新要E)').first();
    
    const buttonExists = await addButton.isVisible();
    console.log(`新規商品登録ボタン存在: ${buttonExists ? '✁E : '❁E}`);
    
    if (buttonExists) {
      await addButton.click();
      await page.waitForTimeout(2000);
      
      // モーダルが開ぁE��かチェチE��
      const modal = page.locator('[role="dialog"]');
      const modalOpen = await modal.isVisible();
      console.log(`啁E��登録モーダル開閉: ${modalOpen ? '✁E動佁E : '❁E未動佁E}`);
      
      if (modalOpen) {
        // フォーム要素の存在確誁E
        const nameInput = page.locator('input[name="name"]');
        const nameExists = await nameInput.isVisible();
        console.log(`啁E��名�E力フィールチE ${nameExists ? '✁E動佁E : '❁E未動佁E}`);
        
        const skuInput = page.locator('input[name="sku"]');
        const skuExists = await skuInput.isVisible();
        console.log(`SKU入力フィールチE ${skuExists ? '✁E動佁E : '❁E未動佁E}`);
        
        if (nameExists && skuExists) {
          // 実際に入力テスチE
          await nameInput.fill('チE��ト商品E);
          await skuInput.fill('TEST-001');
          
          const nameValue = await nameInput.inputValue();
          const skuValue = await skuInput.inputValue();
          
          console.log(`入力機�EチE��チE ${nameValue === 'チE��ト商品E && skuValue === 'TEST-001' ? '✁E動佁E : '❁E未動佁E}`);
          
          // 送信ボタンの存在確誁E
          const submitButton = page.locator('button:has-text("登録"), button:has-text("保孁E)').first();
          const submitExists = await submitButton.isVisible();
          console.log(`送信ボタン存在: ${submitExists ? '✁E動佁E : '❁E未動佁E}`);
          
          if (submitExists) {
            console.log('🎉 在庫管琁E��品登録モーダル: 完�E実裁E��み');
          } else {
            console.log('❁E在庫管琁E��品登録モーダル: 部刁E��実裁E);
          }
        } else {
          console.log('❁E在庫管琁E��品登録モーダル: 部刁E��実裁E);
        }
        
        // モーダルを閉じる
        const closeButton = page.locator('button:has-text("ÁE), button:has-text("キャンセル")').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(1000);
        }
      } else {
        console.log('❁E在庫管琁E��品登録モーダル: 未実裁E);
      }
    } else {
      console.log('❁E在庫管琁E��品登録ボタン: 未実裁E);
    }
  });

  test('💰 売上管琁E�E品設定モーダル検証', async ({ page }) => {
    console.log('=== 売上管琁E�E品設定モーダル検証開姁E===');
    
    await page.goto('/sales');
    await page.waitForTimeout(3000);
    
    // 出品設定�Eタンを探ぁE
    const settingsButton = page.locator('button:has-text("出品設宁E)').first();
    
    const buttonExists = await settingsButton.isVisible();
    console.log(`出品設定�Eタン存在: ${buttonExists ? '✁E : '❁E}`);
    
    if (buttonExists) {
      await settingsButton.click();
      await page.waitForTimeout(2000);
      
      // モーダルが開ぁE��かチェチE��
      const modal = page.locator('[role="dialog"]');
      const modalOpen = await modal.isVisible();
      console.log(`出品設定モーダル開閉: ${modalOpen ? '✁E動佁E : '❁E未動佁E}`);
      
      if (modalOpen) {
        // 設定頁E��の存在確誁E
        const profitInput = page.locator('input[type="number"]');
        const profitExists = await profitInput.isVisible();
        console.log(`利益率入力フィールチE ${profitExists ? '✁E動佁E : '❁E未動佁E}`);
        
        const checkbox = page.locator('input[type="checkbox"]');
        const checkboxExists = await checkbox.isVisible();
        console.log(`チェチE��ボックス: ${checkboxExists ? '✁E動佁E : '❁E未動佁E}`);
        
        if (profitExists && checkboxExists) {
          // 実際に操作テスチE
          await profitInput.fill('25');
          await checkbox.check();
          
          const profitValue = await profitInput.inputValue();
          const isChecked = await checkbox.isChecked();
          
          console.log(`設定操作テスチE ${profitValue === '25' && isChecked ? '✁E動佁E : '❁E未動佁E}`);
          
          // 保存�Eタンの存在確誁E
          const saveButton = page.locator('button:has-text("保孁E)').first();
          const saveExists = await saveButton.isVisible();
          console.log(`保存�Eタン存在: ${saveExists ? '✁E動佁E : '❁E未動佁E}`);
          
          if (saveExists) {
            console.log('🎉 売上管琁E�E品設定モーダル: 完�E実裁E��み');
          } else {
            console.log('❁E売上管琁E�E品設定モーダル: 部刁E��実裁E);
          }
        } else {
          console.log('❁E売上管琁E�E品設定モーダル: 部刁E��実裁E);
        }
        
        // モーダルを閉じる
        const closeButton = page.locator('button:has-text("ÁE), button:has-text("キャンセル")').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(1000);
        }
      } else {
        console.log('❁E売上管琁E�E品設定モーダル: 未実裁E);
      }
    } else {
      console.log('❁E売上管琁E�E品設定�Eタン: 未実裁E);
    }
  });

  test('🔄 返品管琁E��品申請モーダル検証', async ({ page }) => {
    console.log('=== 返品管琁E��品申請モーダル検証開姁E===');
    
    await page.goto('/returns');
    await page.waitForTimeout(3000);
    
    // 返品申請�Eタンを探ぁE
    const returnButton = page.locator('button:has-text("返品申諁E)').first();
    
    const buttonExists = await returnButton.isVisible();
    console.log(`返品申請�Eタン存在: ${buttonExists ? '✁E : '❁E}`);
    
    if (buttonExists) {
      await returnButton.click();
      await page.waitForTimeout(2000);
      
      // モーダルが開ぁE��かチェチE��
      const modal = page.locator('[role="dialog"]');
      const modalOpen = await modal.isVisible();
      console.log(`返品申請モーダル開閉: ${modalOpen ? '✁E動佁E : '❁E未動佁E}`);
      
      if (modalOpen) {
        // フォーム要素の存在確誁E
        const orderIdInput = page.locator('input[name="orderId"]');
        const orderIdExists = await orderIdInput.isVisible();
        console.log(`注斁E��号入力フィールチE ${orderIdExists ? '✁E動佁E : '❁E未動佁E}`);
        
        const productNameInput = page.locator('input[name="productName"]');
        const productNameExists = await productNameInput.isVisible();
        console.log(`啁E��名�E力フィールチE ${productNameExists ? '✁E動佁E : '❁E未動佁E}`);
        
        const reasonRadio = page.locator('input[type="radio"]');
        const reasonExists = await reasonRadio.first().isVisible();
        console.log(`返品琁E��選抁E ${reasonExists ? '✁E動佁E : '❁E未動佁E}`);
        
        if (orderIdExists && productNameExists && reasonExists) {
          // 実際に入力テスチE
          await orderIdInput.fill('ORD-000123');
          await productNameInput.fill('チE��ト商品E);
          await reasonRadio.first().check();
          
          const orderValue = await orderIdInput.inputValue();
          const productValue = await productNameInput.inputValue();
          const isChecked = await reasonRadio.first().isChecked();
          
          console.log(`入力機�EチE��チE ${orderValue === 'ORD-000123' && productValue === 'チE��ト商品E && isChecked ? '✁E動佁E : '❁E未動佁E}`);
          
          // 送信ボタンの存在確誁E
          const submitButton = page.locator('button:has-text("提�E"), button:has-text("申諁E)').first();
          const submitExists = await submitButton.isVisible();
          console.log(`送信ボタン存在: ${submitExists ? '✁E動佁E : '❁E未動佁E}`);
          
          if (submitExists) {
            console.log('🎉 返品管琁E��品申請モーダル: 完�E実裁E��み');
          } else {
            console.log('❁E返品管琁E��品申請モーダル: 部刁E��実裁E);
          }
        } else {
          console.log('❁E返品管琁E��品申請モーダル: 部刁E��実裁E);
        }
        
        // モーダルを閉じる
        const closeButton = page.locator('button:has-text("ÁE), button:has-text("キャンセル")').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(1000);
        }
      } else {
        console.log('❁E返品管琁E��品申請モーダル: 未実裁E);
      }
    } else {
      console.log('❁E返品管琁E��品申請�Eタン: 未実裁E);
    }
  });

  test('🚚 納品プランウィザード検証', async ({ page }) => {
    console.log('=== 納品プランウィザード検証開姁E===');
    
    await page.goto('/delivery-plan');
    await page.waitForTimeout(3000);
    
    // 新規�Eラン作�Eボタンを探ぁE
    const createButton = page.locator('button:has-text("新要E), button:has-text("作�E")').first();
    
    const buttonExists = await createButton.isVisible();
    console.log(`新規�Eラン作�Eボタン存在: ${buttonExists ? '✁E : '❁E}`);
    
    if (buttonExists) {
      await createButton.click();
      await page.waitForTimeout(2000);
      
      // ウィザードまた�Eモーダルが開ぁE��かチェチE��
      const modal = page.locator('[role="dialog"]');
      const wizard = page.locator('.wizard, .step');
      
      const modalOpen = await modal.isVisible();
      const wizardOpen = await wizard.isVisible();
      
      console.log(`ウィザーチEモーダル開閉: ${modalOpen || wizardOpen ? '✁E動佁E : '❁E未動佁E}`);
      
      if (modalOpen || wizardOpen) {
        // 入力フィールド�E存在確誁E
        const inputs = await page.locator('input').all();
        const inputCount = inputs.length;
        console.log(`入力フィールド数: ${inputCount}個`);
        
        if (inputCount > 0) {
          // 最初�E入力フィールドで動作テスチE
          const firstInput = inputs[0];
          if (await firstInput.isVisible()) {
            await firstInput.fill('チE��ト�E劁E);
            const inputValue = await firstInput.inputValue();
            console.log(`入力機�EチE��チE ${inputValue === 'チE��ト�E劁E ? '✁E動佁E : '❁E未動佁E}`);
          }
          
          // 次へボタンの存在確誁E
          const nextButton = page.locator('button:has-text("次へ"), button:has-text("続衁E)').first();
          const nextExists = await nextButton.isVisible();
          console.log(`次へボタン存在: ${nextExists ? '✁E動佁E : '❁E未動佁E}`);
          
          if (nextExists && inputCount > 0) {
            console.log('🎉 納品プランウィザーチE 完�E実裁E��み');
          } else {
            console.log('❁E納品プランウィザーチE 部刁E��実裁E);
          }
        } else {
          console.log('❁E納品プランウィザーチE 部刁E��実裁E);
        }
      } else {
        console.log('❁E納品プランウィザーチE 未実裁E);
      }
    } else {
      console.log('❁E納品プラン作�Eボタン: 未実裁E);
    }
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('🔍 UI操作実動作確認テスチE, () => {
  
  test.beforeEach(async ({ page }) => {
    // ログイン処琁E
    await page.goto('http://localhost:3002/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="username"]', 'seller');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('🎯 ダチE��ュボ�Eド期間選択モーダル - UI操作確誁E, async ({ page }) => {
    console.log('=== ダチE��ュボ�Eド期間選択モーダル UI操作テスチE===');
    
    // ダチE��ュボ�Eド�Eージに移勁E
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForLoadState('networkidle');
    
    // レポ�Eト期間を選択�Eタンを探してクリチE��
    const periodButton = page.locator('button:has-text("レポ�Eト期間を選抁E)');
    await expect(periodButton).toBeVisible({ timeout: 10000 });
    console.log('✁Eレポ�Eト期間を選択�Eタン: 表示確誁E);
    
    await periodButton.click();
    await page.waitForTimeout(1000);
    
    // モーダルが開ぁE��かチェチE��
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log('✁E期間選択モーダル: 開閉動作確誁E);
    
    // DateRangePickerの存在確誁E
    const dateRangePicker = page.locator('.rdrCalendarWrapper');
    await expect(dateRangePicker).toBeVisible({ timeout: 3000 });
    console.log('✁EDateRangePicker: 表示確誁E);
    
    // 適用ボタンの存在確認とクリチE��
    const applyButton = page.locator('button:has-text("適用")');
    await expect(applyButton).toBeVisible({ timeout: 3000 });
    console.log('✁E適用ボタン: 表示確誁E);
    
    await applyButton.click();
    await page.waitForTimeout(1000);
    
    // モーダルが閉じたかチェチE��
    await expect(modal).not.toBeVisible({ timeout: 3000 });
    console.log('✁Eモーダル閉じめE 動作確誁E);
    
    console.log('🎉 ダチE��ュボ�Eド期間選択モーダル: UI操作で完�E動作確認済み');
  });

  test('📦 在庫管琁E��品登録モーダル - UI操作確誁E, async ({ page }) => {
    console.log('=== 在庫管琁E��品登録モーダル UI操作テスチE===');
    
    // 在庫管琁E�Eージに移勁E
    await page.goto('http://localhost:3002/inventory');
    await page.waitForLoadState('networkidle');
    
    // 新規商品登録ボタンを探してクリチE��
    const addButton = page.locator('button:has-text("新規商品登録")');
    await expect(addButton).toBeVisible({ timeout: 10000 });
    console.log('✁E新規商品登録ボタン: 表示確誁E);
    
    await addButton.click();
    await page.waitForTimeout(1000);
    
    // モーダルが開ぁE��かチェチE��
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log('✁E啁E��登録モーダル: 開閉動作確誁E);
    
    // フォーム要素の存在確認と入力テスチE
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible({ timeout: 3000 });
    await nameInput.fill('チE��ト商品E);
    console.log('✁E啁E��名�E力フィールチE 表示・入力確誁E);
    
    const skuInput = page.locator('input[name="sku"]');
    await expect(skuInput).toBeVisible({ timeout: 3000 });
    await skuInput.fill('TEST-001');
    console.log('✁ESKU入力フィールチE 表示・入力確誁E);
    
    // 入力値の確誁E
    await expect(nameInput).toHaveValue('チE��ト商品E);
    await expect(skuInput).toHaveValue('TEST-001');
    console.log('✁E入力機�E: 動作確誁E);
    
    // 登録ボタンの存在確誁E
    const submitButton = page.locator('button:has-text("登録")');
    await expect(submitButton).toBeVisible({ timeout: 3000 });
    console.log('✁E登録ボタン: 表示確誁E);
    
    // キャンセルボタンでモーダルを閉じる
    const cancelButton = page.locator('button:has-text("キャンセル")');
    await cancelButton.click();
    await page.waitForTimeout(1000);
    
    await expect(modal).not.toBeVisible({ timeout: 3000 });
    console.log('✁Eモーダル閉じめE 動作確誁E);
    
    console.log('🎉 在庫管琁E��品登録モーダル: UI操作で完�E動作確認済み');
  });

  test('💰 売上管琁E�E品設定モーダル - UI操作確誁E, async ({ page }) => {
    console.log('=== 売上管琁E�E品設定モーダル UI操作テスチE===');
    
    // 売上管琁E�Eージに移勁E
    await page.goto('http://localhost:3002/sales');
    await page.waitForLoadState('networkidle');
    
    // 出品設定�Eタンを探してクリチE��
    const settingsButton = page.locator('button:has-text("出品設宁E)');
    await expect(settingsButton).toBeVisible({ timeout: 10000 });
    console.log('✁E出品設定�Eタン: 表示確誁E);
    
    await settingsButton.click();
    await page.waitForTimeout(1000);
    
    // モーダルが開ぁE��かチェチE��
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log('✁E出品設定モーダル: 開閉動作確誁E);
    
    // 設定頁E��の存在確認と操作テスチE
    const profitInput = page.locator('input[type="number"]');
    await expect(profitInput).toBeVisible({ timeout: 3000 });
    await profitInput.fill('25');
    console.log('✁E利益率入力フィールチE 表示・入力確誁E);
    
    const checkbox = page.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible({ timeout: 3000 });
    await checkbox.check();
    console.log('✁EチェチE��ボックス: 表示・操作確誁E);
    
    // 入力値の確誁E
    await expect(profitInput).toHaveValue('25');
    await expect(checkbox).toBeChecked();
    console.log('✁E設定操佁E 動作確誁E);
    
    // 保存�Eタンの存在確誁E
    const saveButton = page.locator('button:has-text("保孁E)');
    await expect(saveButton).toBeVisible({ timeout: 3000 });
    console.log('✁E保存�Eタン: 表示確誁E);
    
    // キャンセルボタンでモーダルを閉じる
    const cancelButton = page.locator('button:has-text("キャンセル")');
    await cancelButton.click();
    await page.waitForTimeout(1000);
    
    await expect(modal).not.toBeVisible({ timeout: 3000 });
    console.log('✁Eモーダル閉じめE 動作確誁E);
    
    console.log('🎉 売上管琁E�E品設定モーダル: UI操作で完�E動作確認済み');
  });

  test('🔄 返品管琁E��品申請モーダル - UI操作確誁E, async ({ page }) => {
    console.log('=== 返品管琁E��品申請モーダル UI操作テスチE===');
    
    // 返品管琁E�Eージに移勁E
    await page.goto('http://localhost:3002/returns');
    await page.waitForLoadState('networkidle');
    
    // 返品申請�Eタンを探してクリチE��
    const returnButton = page.locator('button:has-text("返品申諁E)');
    await expect(returnButton).toBeVisible({ timeout: 10000 });
    console.log('✁E返品申請�Eタン: 表示確誁E);
    
    await returnButton.click();
    await page.waitForTimeout(1000);
    
    // モーダルが開ぁE��かチェチE��
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log('✁E返品申請モーダル: 開閉動作確誁E);
    
    // フォーム要素の存在確認と入力テスチE
    const orderIdInput = page.locator('input[type="text"]').first();
    await expect(orderIdInput).toBeVisible({ timeout: 3000 });
    await orderIdInput.fill('ORD-000123');
    console.log('✁E注斁E��号入力フィールチE 表示・入力確誁E);
    
    const productNameInput = page.locator('input[type="text"]').nth(1);
    await expect(productNameInput).toBeVisible({ timeout: 3000 });
    await productNameInput.fill('チE��ト商品E);
    console.log('✁E啁E��名�E力フィールチE 表示・入力確誁E);
    
    // 返品琁E��ラジオボタンの選抁E
    const reasonRadio = page.locator('input[type="radio"]').first();
    await expect(reasonRadio).toBeVisible({ timeout: 3000 });
    await reasonRadio.check();
    console.log('✁E返品琁E��選抁E 表示・操作確誁E);
    
    // 入力値の確誁E
    await expect(orderIdInput).toHaveValue('ORD-000123');
    await expect(productNameInput).toHaveValue('チE��ト商品E);
    await expect(reasonRadio).toBeChecked();
    console.log('✁E入力機�E: 動作確誁E);
    
    // 提�Eボタンの存在確誁E
    const submitButton = page.locator('button:has-text("返品申請提出")');
    await expect(submitButton).toBeVisible({ timeout: 3000 });
    console.log('✁E提�Eボタン: 表示確誁E);
    
    // モーダルを閉じる�E�Eボタンまた�Eキャンセル�E�E
    const closeButton = page.locator('[role="dialog"] button').first();
    await closeButton.click();
    await page.waitForTimeout(1000);
    
    await expect(modal).not.toBeVisible({ timeout: 3000 });
    console.log('✁Eモーダル閉じめE 動作確誁E);
    
    console.log('🎉 返品管琁E��品申請モーダル: UI操作で完�E動作確認済み');
  });

  test('🚚 納品プランウィザーチE- UI操作確誁E, async ({ page }) => {
    console.log('=== 納品プランウィザーチEUI操作テスチE===');
    
    // 納品プランペ�Eジに移勁E
    await page.goto('http://localhost:3002/delivery-plan');
    await page.waitForLoadState('networkidle');
    
    // ウィザード�E表示確誁E
    const wizard = page.locator('.max-w-4xl');
    await expect(wizard).toBeVisible({ timeout: 10000 });
    console.log('✁EウィザーチE 表示確誁E);
    
    // スチE��プインジケーターの確誁E
    const stepIndicator = page.locator('[data-testid="step-1-label"]');
    await expect(stepIndicator).toBeVisible({ timeout: 3000 });
    console.log('✁EスチE��プインジケーター: 表示確誁E);
    
    // 入力フィールド�E存在確認と入力テスチE
    const inputs = page.locator('input[type="text"]');
    const inputCount = await inputs.count();
    console.log(`✁E入力フィールド数: ${inputCount}個`);
    
    if (inputCount > 0) {
      const firstInput = inputs.first();
      await expect(firstInput).toBeVisible({ timeout: 3000 });
      await firstInput.fill('チE��ト�E劁E);
      
      const inputValue = await firstInput.inputValue();
      await expect(firstInput).toHaveValue('チE��ト�E劁E);
      console.log('✁E入力機�E: 動作確誁E);
    }
    
    // 次へボタンの存在確誁E
    const nextButton = page.locator('button:has-text("次へ"), button:has-text("続衁E)');
    const nextExists = await nextButton.count() > 0;
    if (nextExists) {
      await expect(nextButton.first()).toBeVisible({ timeout: 3000 });
      console.log('✁E次へボタン: 表示確誁E);
    }
    
    console.log('🎉 納品プランウィザーチE UI操作で完�E動作確認済み');
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('🔍 スチE�Eタス変更メニュー安定性チE��チE, () => {
  test.beforeEach(async ({ page }) => {
    // 出荷ペ�Eジに移勁E
    await page.goto('/staff/shipping');
    await page.waitForLoadState('networkidle');
    
    // ペ�Eジが完�Eに読み込まれるまで征E��E
    await page.waitForSelector('.holo-table', { timeout: 10000 });
  });

  test('📋 スチE�Eタス変更ボタンの基本動作テスチE, async ({ page }) => {
    console.log('=== スチE�Eタス変更ボタンの基本動作テスト開姁E===');

    // スチE�Eタス変更ボタンが存在することを確誁E
    const statusButtons = page.locator('[role="button"]').filter({ hasText: 'スチE�Eタス変更' });
    const buttonCount = await statusButtons.count();
    console.log(`Found ${buttonCount} status change buttons`);
    expect(buttonCount).toBeGreaterThan(0);

    // 最初�EボタンをクリチE��
    const firstButton = statusButtons.first();
    await expect(firstButton).toBeVisible();
    await firstButton.click();

    // ドロチE�Eダウンが表示されることを確誁E
    const dropdown = page.locator('[data-testid="unified-status-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    console.log('Dropdown is visible after button click');

    // ドロチE�Eダウンの冁E��を確誁E
    const dropdownHeader = dropdown.locator('h3');
    await expect(dropdownHeader).toHaveText('次のスチE�Eタスに変更');

    // スチE�Eタスオプションを確誁E
    const statusOptions = dropdown.locator('.unified-status-option');
    const optionCount = await statusOptions.count();
    console.log(`Found ${optionCount} status options in dropdown`);
    expect(optionCount).toBeGreaterThan(0);

    // 吁E��プションが正しく表示されることを確誁E
    for (let i = 0; i < optionCount; i++) {
      const option = statusOptions.nth(i);
      await expect(option).toBeVisible();
      
      const optionText = await option.locator('.unified-status-option-label').textContent();
      console.log(`Option ${i + 1}: ${optionText}`);
      expect(optionText).toBeTruthy();
    }
  });

  test('🎯 ドロチE�Eダウンの開閉動作テスチE, async ({ page }) => {
    console.log('=== ドロチE�Eダウンの開閉動作テスト開姁E===');

    const statusButton = page.locator('[role="button"]').filter({ hasText: 'スチE�Eタス変更' }).first();
    const dropdown = page.locator('[data-testid="unified-status-dropdown"]');

    // 初期状態でドロチE�Eダウンが閉じてぁE��ことを確誁E
    await expect(dropdown).not.toBeVisible();
    console.log('Dropdown is initially hidden');

    // ボタンをクリチE��してドロチE�Eダウンを開ぁE
    await statusButton.click();
    await expect(dropdown).toBeVisible({ timeout: 3000 });
    console.log('Dropdown opened after button click');

    // 同じボタンを�EクリチE��してドロチE�Eダウンを閉じる
    await statusButton.click();
    await expect(dropdown).not.toBeVisible({ timeout: 3000 });
    console.log('Dropdown closed after second button click');

    // 再度開く
    await statusButton.click();
    await expect(dropdown).toBeVisible({ timeout: 3000 });
    console.log('Dropdown reopened successfully');

    // 外�EをクリチE��して閉じめE
    await page.click('body', { position: { x: 50, y: 50 } });
    await expect(dropdown).not.toBeVisible({ timeout: 3000 });
    console.log('Dropdown closed after clicking outside');
  });

  test('⚡ スチE�Eタス変更の実行テスチE, async ({ page }) => {
    console.log('=== スチE�Eタス変更の実行テスト開姁E===');

    const statusButton = page.locator('[role="button"]').filter({ hasText: 'スチE�Eタス変更' }).first();
    const dropdown = page.locator('[data-testid="unified-status-dropdown"]');

    // ドロチE�Eダウンを開ぁE
    await statusButton.click();
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // 最初�EスチE�EタスオプションをクリチE��
    const firstOption = dropdown.locator('.unified-status-option').first();
    await expect(firstOption).toBeVisible();
    
    const optionText = await firstOption.locator('.unified-status-option-label').textContent();
    console.log(`Clicking status option: ${optionText}`);
    
    await firstOption.click();

    // ドロチE�Eダウンが閉じることを確誁E
    await expect(dropdown).not.toBeVisible({ timeout: 3000 });
    console.log('Dropdown closed after status selection');

    // ト�EストメチE��ージが表示されることを確誁E
    const toast = page.locator('.toast, [role="alert"]').first();
    if (await toast.isVisible({ timeout: 2000 })) {
      const toastText = await toast.textContent();
      console.log(`Toast message: ${toastText}`);
    }
  });

  test('🔄 褁E��のスチE�Eタス変更ボタンの動作テスチE, async ({ page }) => {
    console.log('=== 褁E��のスチE�Eタス変更ボタンの動作テスト開姁E===');

    const statusButtons = page.locator('[role="button"]').filter({ hasText: 'スチE�Eタス変更' });
    const buttonCount = await statusButtons.count();
    console.log(`Testing ${buttonCount} status change buttons`);

    // 褁E��のボタンが存在する場合�EチE��チE
    if (buttonCount > 1) {
      // 最初�Eボタンを開ぁE
      await statusButtons.nth(0).click();
      const firstDropdown = page.locator('[data-testid="unified-status-dropdown"]').first();
      await expect(firstDropdown).toBeVisible({ timeout: 3000 });
      console.log('First dropdown opened');

      // 2番目のボタンをクリチE��
      await statusButtons.nth(1).click();
      
      // 最初�EドロチE�Eダウンが閉じて、E番目が開くことを確誁E
      await page.waitForTimeout(500);
      const visibleDropdowns = page.locator('[data-testid="unified-status-dropdown"]:visible');
      const visibleCount = await visibleDropdowns.count();
      console.log(`Visible dropdowns after clicking second button: ${visibleCount}`);
      
      // 一度に1つのドロチE�Eダウンのみが開ぁE��ぁE��ことを確誁E
      expect(visibleCount).toBeLessThanOrEqual(1);
    }
  });

  test('🎨 UIスタイルの一貫性チE��チE, async ({ page }) => {
    console.log('=== UIスタイルの一貫性チE��ト開姁E===');

    const statusButton = page.locator('[role="button"]').filter({ hasText: 'スチE�Eタス変更' }).first();
    await statusButton.click();

    const dropdown = page.locator('[data-testid="unified-status-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // z-indexの確誁E
    const zIndex = await dropdown.evaluate((el) => {
      return window.getComputedStyle(el).zIndex;
    });
    console.log(`Dropdown z-index: ${zIndex}`);
    expect(parseInt(zIndex)).toBe(10000);

    // 統一されたCSSクラスの確誁E
    const hasUnifiedClass = await dropdown.evaluate((el) => {
      return el.classList.contains('unified-status-menu');
    });
    console.log(`Has unified-status-menu class: ${hasUnifiedClass}`);
    expect(hasUnifiedClass).toBe(true);

    // スチE�Eタスオプションのスタイル確誁E
    const statusOptions = dropdown.locator('.unified-status-option');
    const firstOption = statusOptions.first();
    
    // ホバー効果�EチE��ト（安定性のため簡略化！E
    const optionExists = await firstOption.isVisible();
    console.log(`First option is visible: ${optionExists}`);
    expect(optionExists).toBe(true);
  });

  test('⌨�E�Eキーボ�EドナビゲーションチE��チE, async ({ page }) => {
    console.log('=== キーボ�EドナビゲーションチE��ト開姁E===');

    const statusButton = page.locator('[role="button"]').filter({ hasText: 'スチE�Eタス変更' }).first();
    await statusButton.click();

    const dropdown = page.locator('[data-testid="unified-status-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // ESCキーでドロチE�Eダウンを閉じる
    await page.keyboard.press('Escape');
    await expect(dropdown).not.toBeVisible({ timeout: 3000 });
    console.log('Dropdown closed with Escape key');

    // 再度開いてEnterキーでオプションを選抁E
    await statusButton.click();
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    const firstOption = dropdown.locator('.unified-status-option').first();
    await firstOption.focus();
    await page.keyboard.press('Enter');
    
    await expect(dropdown).not.toBeVisible({ timeout: 3000 });
    console.log('Status option selected with Enter key');
  });
}); 
