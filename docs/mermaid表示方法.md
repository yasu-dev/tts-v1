# 🖼️ Mermaid図の表示方法

## 📋 表示方法一覧

### 1. **オンラインMermaidエディター（最も簡単）**
```
https://mermaid.live/
```

**使い方：**
1. 上記URLにアクセス
2. `docs/技術構成図解.md`から図のコードをコピー
3. エディターに貼り付け
4. 自動的に図が表示される
5. PNG/SVGでダウンロード可能

### 2. **VS Code拡張機能**
```bash
# Mermaid Preview拡張機能をインストール
code --install-extension bierner.markdown-mermaid
```

**使い方：**
1. VS Codeで`docs/技術構成図解.md`を開く
2. `Ctrl+Shift+V`でプレビュー表示
3. Mermaid図が自動レンダリング

### 3. **GitHub表示**
GitHubは自動的にMermaid図をレンダリングします：
- リポジトリにプッシュ後、GitHubでファイルを表示
- 図が自動的に表示される

### 4. **Mermaid CLI（上級者向け）**
```bash
# Mermaid CLIをインストール
npm install -g @mermaid-js/mermaid-cli

# 図をPNGに変換
mmdc -i docs/技術構成図解.md -o output.png
```

## 🎯 推奨方法

**初心者向け：** オンラインエディター（https://mermaid.live/）
**開発者向け：** VS Code拡張機能
**チーム共有：** GitHub表示

## 📊 図の種類と用途

| 図の種類 | 用途 | ファイル内の場所 |
|---------|------|----------------|
| アーキテクチャ図 | システム全体構成 | システムアーキテクチャ章 |
| シーケンス図 | 認証フロー | 認証システムの仕組み章 |
| フローチャート | データフロー | データ管理構成章 |
| マインドマップ | 技術スタック | 技術マインドマップ章 |

## 💡 ヒント

- **図が表示されない場合：** Mermaidのバージョンや構文をチェック
- **カスタマイズ：** オンラインエディターでテーマや色を変更可能
- **エクスポート：** PNG、SVG、PDFで保存可能 