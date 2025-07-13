import os
import subprocess

# 既存の画像ファイルパス
img1 = r'test-results\staff-returns-padding-veri-c7c72----パディング統一テスト-返品管理画面の基本表示確認-chromium\test-failed-1.png'
img2 = r'test-results\staff-returns-padding-veri-e3d3c-ィング統一テスト-再出品業務フロータブのパディング検証-chromium\test-failed-1.png'
img3 = r'test-results\staff-returns-padding-veri-a22c0-パディング統一テスト-返品理由分析タブのパディング検証-chromium\test-failed-1.png'

# PowerShellコマンドで画像エディタを開く
commands = [
    f'start mspaint "{img1}"',
    f'start mspaint "{img2}"',
    f'start mspaint "{img3}"'
]

print("3画面をペイントで開いています...")
for cmd in commands:
    os.system(cmd)

print("✅ 返品検品、再出品業務フロー、返品理由分析の3画面をペイントで開きました")
print("各ウィンドウでボディ部分の左右パディングを比較してください") 