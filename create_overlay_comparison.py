import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np

def analyze_padding_differences():
    """
    3つの返品処理画面のスクリーンショットを重ね合わせて
    パディングの違いを視覚化
    """
    print("🔍 パディング分析開始...")
    
    # 基準となる画像サイズ
    base_width = 1400
    base_height = 900
    
    # 1. 返品検品画面（基準）のモックアップ
    print("📸 返品検品画面（基準）を生成...")
    inspection_img = Image.new('RGB', (base_width, base_height), (248, 250, 254))
    draw_inspection = ImageDraw.Draw(inspection_img)
    
    # ヘッダー
    draw_inspection.rectangle([0, 0, base_width, 70], fill=(59, 130, 246))
    draw_inspection.text((50, 25), "THE WORLD DOOR - スタッフ管理", fill=(255, 255, 255))
    
    # サイドバー
    draw_inspection.rectangle([0, 70, 250, base_height], fill=(255, 255, 255))
    draw_inspection.text((20, 120), "返品処理", fill=(0, 0, 0))
    
    # メインコンテンツ - 標準パディング32px
    main_left = 250 + 32  # 282
    main_right = base_width - 32  # 1368
    
    # タブエリア
    draw_inspection.rectangle([main_left, 120, main_right, 180], fill=(255, 255, 255))
    draw_inspection.text((main_left + 20, 140), "返品検品    再出品業務フロー    返品理由分析", fill=(0, 0, 0))
    
    # コンテンツエリア
    draw_inspection.rectangle([main_left, 200, main_right, base_height-50], fill=(255, 255, 255))
    draw_inspection.text((main_left + 20, 220), "返品商品リスト", fill=(0, 0, 0))
    
    inspection_img.save('inspection_standard.png')
    
    # 2. 再出品フロー画面（違いを示すため異なるパディング）
    print("📸 再出品フロー画面を生成...")
    relisting_img = Image.new('RGB', (base_width, base_height), (248, 250, 254))
    draw_relisting = ImageDraw.Draw(relisting_img)
    
    # ヘッダー
    draw_relisting.rectangle([0, 0, base_width, 70], fill=(59, 130, 246))
    draw_relisting.text((50, 25), "THE WORLD DOOR - スタッフ管理", fill=(255, 255, 255))
    
    # サイドバー
    draw_relisting.rectangle([0, 70, 250, base_height], fill=(255, 255, 255))
    draw_relisting.text((20, 120), "返品処理", fill=(0, 0, 0))
    
    # メインコンテンツ - 異なるパディング24px（問題箇所）
    main_left_wrong = 250 + 24  # 274
    main_right_wrong = base_width - 24  # 1376
    
    # タブエリア
    draw_relisting.rectangle([main_left_wrong, 120, main_right_wrong, 180], fill=(255, 255, 255))
    draw_relisting.text((main_left_wrong + 20, 140), "返品検品    再出品業務フロー    返品理由分析", fill=(0, 0, 0))
    
    # コンテンツエリア - 業務フロー
    draw_relisting.rectangle([main_left_wrong, 200, main_right_wrong, 500], fill=(255, 255, 255))
    draw_relisting.text((main_left_wrong + 20, 220), "返品商品再出品業務フロー", fill=(0, 0, 0))
    
    # ステップ
    for i, step in enumerate(['検品結果確認', '写真撮影', '商品情報更新', '価格設定', '再出品']):
        x = main_left_wrong + 50 + i * 180
        draw_relisting.ellipse([x-15, 265, x+15, 295], fill=(59, 130, 246))
        draw_relisting.text((x-30, 310), step, fill=(0, 0, 0))
    
    # 商品情報
    draw_relisting.rectangle([main_left_wrong, 520, main_right_wrong, base_height-50], fill=(255, 255, 255))
    draw_relisting.text((main_left_wrong + 20, 540), "商品情報", fill=(0, 0, 0))
    
    relisting_img.save('relisting_wrong.png')
    
    # 3. 返品理由分析画面（また別の異なるパディング）
    print("📸 返品理由分析画面を生成...")
    analysis_img = Image.new('RGB', (base_width, base_height), (248, 250, 254))
    draw_analysis = ImageDraw.Draw(analysis_img)
    
    # ヘッダー
    draw_analysis.rectangle([0, 0, base_width, 70], fill=(59, 130, 246))
    draw_analysis.text((50, 25), "THE WORLD DOOR - スタッフ管理", fill=(255, 255, 255))
    
    # サイドバー
    draw_analysis.rectangle([0, 70, 250, base_height], fill=(255, 255, 255))
    draw_analysis.text((20, 120), "返品処理", fill=(0, 0, 0))
    
    # メインコンテンツ - さらに異なるパディング40px
    main_left_wrong2 = 250 + 40  # 290
    main_right_wrong2 = base_width - 40  # 1360
    
    # タブエリア
    draw_analysis.rectangle([main_left_wrong2, 120, main_right_wrong2, 180], fill=(255, 255, 255))
    draw_analysis.text((main_left_wrong2 + 20, 140), "返品検品    再出品業務フロー    返品理由分析", fill=(0, 0, 0))
    
    # 分析タイトル
    draw_analysis.rectangle([main_left_wrong2, 200, main_right_wrong2, 300], fill=(255, 255, 255))
    draw_analysis.text((main_left_wrong2 + 20, 220), "返品理由分析", fill=(0, 0, 0))
    
    # 統計カード
    for i, (title, value) in enumerate([('総返品数', '150'), ('返品率', '3.8%'), ('改善項目', '3')]):
        x = main_left_wrong2 + i * 300
        draw_analysis.rectangle([x, 320, x+280, 420], fill=(255, 255, 255))
        draw_analysis.text((x+20, 340), title, fill=(100, 100, 100))
        draw_analysis.text((x+20, 370), value, fill=(0, 0, 0))
    
    analysis_img.save('analysis_wrong.png')
    
    # 4. オーバーレイ比較画像作成
    print("🎯 オーバーレイ比較画像を作成...")
    
    # 比較用キャンバス
    comparison_width = base_width * 2 + 50
    comparison_height = base_height * 2 + 100
    comparison_img = Image.new('RGB', (comparison_width, comparison_height), (240, 240, 240))
    draw_comparison = ImageDraw.Draw(comparison_img)
    
    # タイトル
    draw_comparison.text((50, 20), "🔍 パディング比較分析", fill=(0, 0, 0))
    draw_comparison.text((50, 50), "左上: 返品検品（基準32px） | 右上: 再出品フロー（問題24px）", fill=(100, 100, 100))
    draw_comparison.text((50, 70), "左下: 返品理由分析（問題40px） | 右下: 統一後（全て32px）", fill=(100, 100, 100))
    
    # 4つの画像を配置
    comparison_img.paste(inspection_img, (25, 100))  # 左上
    comparison_img.paste(relisting_img, (base_width + 50, 100))  # 右上
    comparison_img.paste(analysis_img, (25, base_height + 150))  # 左下
    
    # 統一後画像（右下）
    unified_img = inspection_img.copy()  # 基準と同じ
    comparison_img.paste(unified_img, (base_width + 50, base_height + 150))
    
    # パディング線を描画
    # 左上（基準）
    draw_comparison.line([282, 100, 282, 100 + base_height], fill=(0, 255, 0), width=3)  # 左32px
    draw_comparison.line([1368 + 25, 100, 1368 + 25, 100 + base_height], fill=(0, 255, 0), width=3)  # 右32px
    
    # 右上（問題）
    draw_comparison.line([274 + base_width + 50, 100, 274 + base_width + 50, 100 + base_height], fill=(255, 0, 0), width=3)  # 左24px
    draw_comparison.line([1376 + base_width + 50, 100, 1376 + base_width + 50, 100 + base_height], fill=(255, 0, 0), width=3)  # 右24px
    
    # 左下（問題）
    draw_comparison.line([290, base_height + 150, 290, base_height + 150 + base_height], fill=(255, 0, 0), width=3)  # 左40px
    draw_comparison.line([1360 + 25, base_height + 150, 1360 + 25, base_height + 150 + base_height], fill=(255, 0, 0), width=3)  # 右40px
    
    # 右下（統一後）
    draw_comparison.line([282 + base_width + 50, base_height + 150, 282 + base_width + 50, base_height + 150 + base_height], fill=(0, 255, 0), width=3)  # 左32px
    draw_comparison.line([1368 + base_width + 50, base_height + 150, 1368 + base_width + 50, base_height + 150 + base_height], fill=(0, 255, 0), width=3)  # 右32px
    
    # 凡例
    draw_comparison.rectangle([50, comparison_height - 80, 300, comparison_height - 20], fill=(255, 255, 255))
    draw_comparison.line([60, comparison_height - 60, 80, comparison_height - 60], fill=(0, 255, 0), width=3)
    draw_comparison.text((90, comparison_height - 65), "緑: 標準32px（正しい）", fill=(0, 0, 0))
    draw_comparison.line([60, comparison_height - 40, 80, comparison_height - 40], fill=(255, 0, 0), width=3)
    draw_comparison.text((90, comparison_height - 45), "赤: 非統一パディング（修正要）", fill=(0, 0, 0))
    
    comparison_img.save('padding_comparison_overlay.png')
    print("✅ 比較画像保存完了: padding_comparison_overlay.png")
    
    print("\n📊 パディング分析結果:")
    print("🟢 返品検品: 32px（基準）")
    print("🔴 再出品フロー: 24px（-8px）")
    print("🔴 返品理由分析: 40px（+8px）")
    print("\n🎯 修正対象: 全画面を32pxに統一")

if __name__ == "__main__":
    analyze_padding_differences() 