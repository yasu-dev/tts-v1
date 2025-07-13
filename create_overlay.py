from PIL import Image
import numpy as np

# 画像パス
img1_path = r'test-results\staff-returns-padding-veri-c7c72----パディング統一テスト-返品管理画面の基本表示確認-chromium\test-failed-1.png'
img2_path = r'test-results\staff-returns-padding-veri-e3d3c-ィング統一テスト-再出品業務フロータブのパディング検証-chromium\test-failed-1.png'
img3_path = r'test-results\staff-returns-padding-veri-a22c0-パディング統一テスト-返品理由分析タブのパディング検証-chromium\test-failed-1.png'

# 画像を読み込み
img1 = Image.open(img1_path)
img2 = Image.open(img2_path)
img3 = Image.open(img3_path)

# 配列に変換
arr1 = np.array(img1)
arr2 = np.array(img2)
arr3 = np.array(img3)

# 重ね合わせ（透明度33%ずつ）
overlay = (arr1.astype(float) * 0.33 + arr2.astype(float) * 0.33 + arr3.astype(float) * 0.33).astype(np.uint8)

# 結果を保存
result = Image.fromarray(overlay)
result.save('overlay-result.png')
print("重ね合わせ画像を overlay-result.png として保存しました") 