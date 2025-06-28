# 推奨ディレクトリ構成

```
base-project/
├── .cursor/                 # AIエージェント用ルール定義
├── directory-structure.md    # このファイル：構成サンプルと各要素の説明
├── technology-stack.md       # 参考用技術スタック（ルート）
├── README.md                 # プロジェクト概要とセットアップ手順
├── package.json              # ワークスペース定義とスクリプト設定
├── .gitignore                # 除外対象ファイル一覧
├── frontend/                 # フロントエンド用ディレクトリ
│   ├── technology-stack.md   # フロントエンド技術スタック
│   └── instructions.mdc      # フロントエンド骨組み生成指示
└── backend/                  # バックエンド用ディレクトリ
    ├── technology-stack.md   # バックエンド技術スタック
    ├── instructions.mdc      # バックエンド骨組み生成指示
    └── package.json          # バックエンド用 package.json（devスクリプト含む）
```
