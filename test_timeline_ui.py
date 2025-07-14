import asyncio
from playwright.async_api import async_playwright
import os

async def test_timeline_ui():
    """商品履歴画面のUI確認テスト"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            print("🔍 商品履歴画面のUI確認開始")
            
            # ログインページにアクセス
            await page.goto('http://localhost:3000/login')
            await page.wait_for_timeout(2000)
            
            # セラーログイン
            seller_login = page.locator('[data-testid="seller-login"]')
            if await seller_login.is_visible():
                await seller_login.click()
                await page.wait_for_timeout(1000)
                
                login_btn = page.locator('button:has-text("ログイン")')
                if await login_btn.is_visible():
                    await login_btn.click()
                    await page.wait_for_timeout(3000)
            
            # 商品履歴ページに直接アクセス
            print("📋 商品履歴ページにアクセス中...")
            await page.goto('http://localhost:3000/timeline')
            await page.wait_for_timeout(3000)
            
            # 現在のURL確認
            current_url = page.url
            print(f"現在のURL: {current_url}")
            
            # ページタイトル確認
            title_element = page.locator('h1')
            if await title_element.is_visible():
                title_text = await title_element.text_content()
                print(f"ページタイトル: {title_text}")
            else:
                print("❌ h1タイトルが見つかりません")
            
            # UnifiedPageHeaderの使用確認
            unified_header = page.locator('[class*="UnifiedPageHeader"], .unified-page-header')
            if await unified_header.count() > 0:
                print("✅ UnifiedPageHeaderが使用されています")
            else:
                print("❌ UnifiedPageHeaderが見つかりません")
            
            # 古いintelligence-cardスタイルの確認
            old_cards = page.locator('.intelligence-card')
            old_card_count = await old_cards.count()
            if old_card_count > 0:
                print(f"❌ 古いintelligence-cardスタイルが{old_card_count}個残っています")
                # 古いカードの詳細を取得
                for i in range(min(3, old_card_count)):
                    card_text = await old_cards.nth(i).text_content()
                    print(f"  古いカード{i+1}: {card_text[:100]}...")
            else:
                print("✅ 古いintelligence-cardスタイルは削除されています")
            
            # 新しいスタイルの確認
            new_cards = page.locator('.bg-white.rounded-xl.border.border-nexus-border')
            new_card_count = await new_cards.count()
            print(f"✅ 新しいスタイルのカードが{new_card_count}個あります")
            
            # パディング構造の確認
            main_container = page.locator('div.space-y-6')
            if await main_container.count() > 0:
                print("✅ space-y-6パディング構造が使用されています")
            else:
                print("❌ 統一されたパディング構造が見つかりません")
            
            # グリッドレイアウトの確認
            grid_layout = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.gap-6')
            if await grid_layout.count() > 0:
                print("✅ 統一されたグリッドレイアウトが使用されています")
            else:
                old_grid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-3.gap-4')
                if await old_grid.count() > 0:
                    print("❌ 古い3列グリッドレイアウトが残っています")
                else:
                    print("⚠️ グリッドレイアウトが見つかりません")
            
            # 統計セクションのスタイル確認
            stats_section = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6')
            if await stats_section.count() > 0:
                print("✅ ダッシュボードと統一された統計セクションがあります")
            else:
                print("❌ 統一された統計セクションが見つかりません")
            
            # ボタンの確認
            buttons = page.locator('button')
            button_count = await buttons.count()
            print(f"📊 ボタン数: {button_count}個")
            
            # エクスポートボタンの確認
            export_btn = page.locator('button:has-text("履歴をエクスポート"), button:has-text("エクスポート")')
            if await export_btn.is_visible():
                print("✅ エクスポートボタンが表示されています")
            else:
                print("❌ エクスポートボタンが見つかりません")
            
            # フィルターボタンの確認
            filter_btn = page.locator('button:has-text("期間でフィルター"), button:has-text("フィルター")')
            if await filter_btn.is_visible():
                print("✅ フィルターボタンが表示されています")
            else:
                print("❌ フィルターボタンが見つかりません")
            
            # スクリーンショット取得
            print("📸 スクリーンショットを取得中...")
            await page.screenshot(path='timeline-ui-current.png', full_page=True)
            print("✅ timeline-ui-current.png として保存しました")
            
            # レスポンシブデザインの確認（モバイル）
            await page.set_viewport_size({"width": 375, "height": 667})
            await page.wait_for_timeout(1000)
            await page.screenshot(path='timeline-ui-mobile.png', full_page=True)
            print("✅ timeline-ui-mobile.png として保存しました")
            
            print("\n🎯 UI確認結果:")
            print("================================")
            if old_card_count == 0 and new_card_count > 0:
                print("✅ UIの作り直しが成功しています")
            else:
                print("❌ UIの作り直しが不完全です")
                
        except Exception as e:
            print(f"❌ エラーが発生しました: {e}")
            
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_timeline_ui()) 