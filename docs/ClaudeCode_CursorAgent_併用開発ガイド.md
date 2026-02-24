# Claude Code + Cursor Agent 併用開発ガイド

## 1. 概要

本ドキュメントは、Cursor エディタ上で **Claude Code（左パネル）** と **Cursor Agent（右パネル）** を併用して開発する際の最適化指針をまとめたものである。CLAUDE.md、Cursor ルール、Claude Code Skills、MCP の設定を統一し、コンテキスト消費を最小化しながら両ツールの能力を最大限活用する。

---

## 2. 原理原則

### 原則1: LLM はステートレス

起動のたびに記憶がリセットされる。CLAUDE.md は「毎回渡すオンボーディング資料」として機能する。

### 原則2: コンテキストウィンドウは有限リソース

指示が多すぎると AI が「考える」領域が圧迫される。コンパクション（圧縮）が発生すると過去の指示を忘れ、精度が低下する。

### 原則3: 汎用知識は書かない

LLM の訓練データに含まれる知識（フレームワークの基本、言語仕様、一般的なベストプラクティス）を CLAUDE.md や Cursor ルールに書くのはコンテキストの浪費。**プロジェクト固有の制約・方針のみ**を書く。

---

## 3. ファイル構成と役割分担

```
CLAUDE.md                    ← Single Source of Truth（両ツール共通）
.cursor/rules/
├── base.mdc                 ← CLAUDE.md の権威宣言 + ルール育成（alwaysApply: true）
└── dev-rules/
    └── *.mdc                ← プロジェクト固有の補足ルール（alwaysApply: false）
.mcp.json                    ← Claude Code 用 MCP 設定（gitignore 対象）
~/.cursor/mcp.json           ← Cursor Agent 用 MCP 設定（グローバル）
~/.claude/skills/            ← Claude Code Skills（Cursor Agent からは使用不可）
~/.claude/projects/*/memory/ ← Claude Code の永続メモリ（MEMORY.md）
```

### 読み込み関係

| ファイル             | Claude Code                        | Cursor Agent                       |
| -------------------- | ---------------------------------- | ---------------------------------- |
| CLAUDE.md            | **常時読込**（システムプロンプト） | プロジェクトファイルとして参照可能 |
| .cursor/rules/\*.mdc | 参照可能                           | **優先的に読込**                   |
| .mcp.json            | MCP サーバー起動                   | 使用しない（別設定）               |
| ~/.cursor/mcp.json   | 使用しない                         | MCP サーバー起動                   |
| ~/.claude/skills/    | 自動トリガー                       | **使用不可**                       |
| MEMORY.md            | 常時読込                           | **使用不可**                       |

---

## 4. CLAUDE.md の最適化

### 4.1 守るべき 5 つのコツ

| コツ               | 内容                                                            |
| ------------------ | --------------------------------------------------------------- |
| **Less is More**   | 目安 300 語以下。プロジェクト固有の情報のみ                     |
| **段階的開示**     | 詳細は docs/ や .cursor/rules/ に分離。CLAUDE.md はポインタだけ |
| **How を重視**     | 「AI にどう振る舞ってほしいか」を具体的に書く                   |
| **検証手段を明示** | `npm run build`, `npx tsc --noEmit` 等のコマンドを記載          |
| **痛みから育てる** | 一度書いて終わりではなく、失敗から反復改善                      |

### 4.2 推奨構成

```markdown
# プロジェクト名

## What / Why

1-2 行でプロジェクトの目的を記述。

## 技術スタック

1 行で列挙。「バージョンの権威は package.json」と付記。

## 仕様書

参照すべきドキュメントへのパス。

## アーキテクチャ方針

プロジェクト固有の設計判断を箇条書き（5 項目以内）。

## 開発ルール

行動指針を箇条書き（5-6 項目以内）。

## 検証コマンド

コード変更後に実行すべきコマンド。

## ドメイン固有の仕様

業務特有の色・サイズ・用語等（あれば）。

## ルールの育成

ルール追加時の承認フローを記述。
```

### 4.3 書いてはいけないもの

| NG                           | 理由                                   | 代替手段                   |
| ---------------------------- | -------------------------------------- | -------------------------- |
| ディレクトリ構造の全体ツリー | 陳腐化する。AI は Glob/Read で探索可能 | 必要なし                   |
| フレームワークの基本知識     | LLM が既知。Skills も提供              | Skills に委譲              |
| 汎用コーディング規約         | LLM が既知                             | 逸脱した場合のみルール追加 |
| 技術スタックの詳細表         | package.json が権威                    | 1 行の要約                 |
| 結果報告フォーマット         | 毎回使うわけではない                   | 必要時に口頭指示           |

---

## 5. Cursor ルールの最適化

### 5.1 原則

- **alwaysApply: true は最小限**（base.mdc のみ推奨、10 行以下）
- **汎用知識は書かない**（Skills や LLM 訓練データと重複）
- **プロジェクト固有の制約のみ**記述
- **globs で条件読込**にして、関連ファイル編集時のみ注入

### 5.2 base.mdc テンプレート

```markdown
---

description: Project governance and rule authority
globs:
alwaysApply: true

# プロジェクト規約

## 権威

- プロジェクト規約の Single Source of Truth は `CLAUDE.md`。実装前に必ず参照。
- `.cursor/rules/` は補足ルール。`CLAUDE.md` と矛盾する場合は `CLAUDE.md` が優先。

## ルールの育成

- ルール追加・変更・削除はユーザー承認を経て実施。
- 承認後に `CLAUDE.md` または `.cursor/rules/` に追記。

## 開発ルール

- 指示されていない変更は提案し承認後に実施。
- UI 変更は承認後に実施。例外: 誤字修正、aria 属性追加、明確なバグ修正。
```

### 5.3 削除すべきルール

| よくあるルール                           | 削除理由                                             |
| ---------------------------------------- | ---------------------------------------------------- |
| 汎用 AI 指示（タスク分析 → 実行 → 報告） | LLM の標準動作。書かなくても行う                     |
| todo.md によるタスク管理                 | Claude Code は TodoWrite 内蔵。Cursor も内蔵機能あり |
| 技術スタック詳細                         | CLAUDE.md に 1 行要約 + package.json が権威          |
| フレームワークのベストプラクティス       | Skills（Claude Code）/ LLM 訓練データで提供済み      |
| `{{instructions}}` テンプレート          | Cursor 固有構文。Claude Code では動作しない          |

### 5.4 dev-rules/ の書き方

```markdown
---

description: 何のルールか 1 行で
globs: 対象ファイルパターン（例: "_.tsx", "app/api/\*\*/_.ts"）
alwaysApply: false ← 必ず false

# ルール名（プロジェクト固有）

プロジェクト固有の制約のみ箇条書き。15-25 行以内。
LLM が既知の汎用知識は書かない。
```

---

## 6. MCP 設定の統一

### 6.1 構成

| 設定ファイル         | 対象ツール   | 配置               | Git 管理                      |
| -------------------- | ------------ | ------------------ | ----------------------------- |
| `.mcp.json`          | Claude Code  | プロジェクトルート | **gitignore**（トークン含む） |
| `~/.cursor/mcp.json` | Cursor Agent | グローバル         | Git 管理外                    |

### 6.2 原則

- トークンを含む MCP 設定は **絶対に Git にコミットしない**
- 両ツールで同じ MCP を使う場合、両方の設定ファイルに追加
- Cursor Agent の MCP はデフォルト disabled にし、必要時に個別有効化
- プロジェクトで使う MCP は Claude Code 側で常時有効にする

### 6.3 よくある MCP 構成例

```json
// .mcp.json (Claude Code)
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase", "--access-token", "..."]
    },
    "drawio": { "command": "npx", "args": ["-y", "@drawio/mcp"] }
  }
}
```

---

## 7. Claude Code Skills の運用

### 7.1 特性

- `~/.claude/skills/` に配置。Claude Code **専用**（Cursor Agent は使用不可）
- 関連タスク時に自動トリガー（ユーザーが明示的に呼び出す必要なし）
- MCP と補完関係（MCP = API 操作、Skills = 知識）

### 7.2 Skills と Cursor ルールの重複排除

**最重要ポイント**: Skills がカバーする汎用知識を Cursor ルールにも書くと**二重のコンテキスト消費**になる。

| 知識の種類             | Claude Code の提供元   | Cursor Agent の提供元      |
| ---------------------- | ---------------------- | -------------------------- |
| フレームワーク BP      | Skills（自動トリガー） | LLM 訓練データ             |
| DB 設計 BP             | Skills + Supabase MCP  | LLM 訓練データ             |
| プロジェクト固有ルール | CLAUDE.md              | CLAUDE.md + .cursor/rules/ |

→ Cursor ルールには**プロジェクト固有の制約のみ**を書き、汎用ベストプラクティスは Skills と LLM に任せる。

### 7.3 インストール前チェック

新しい Skills をインストールする前に確認：

1. **プロジェクトで実際に使う技術か？**（使わない技術の Skills は不要）
2. **既存 MCP と競合しないか？**（例: MCP がある場合は Skills 不要な場合あり）
3. **既存 Skills と重複しないか？**

---

## 8. MEMORY.md の運用

### 8.1 書くべきもの

- 開発環境構成（ツール併用体制、MCP 状態）
- ユーザーの作業スタイル・好み
- セッション跨ぎで保持すべき判断・教訓

### 8.2 書いてはいけないもの

- Skills リスト（システムプロンプトと重複）
- 進行中タスクの詳細（セッション固有）
- CLAUDE.md と同じ内容

### 8.3 200 行制限

MEMORY.md は 200 行までがシステムプロンプトに注入される。超過分は切り捨て。詳細トピックは別ファイル（例: `debugging.md`, `patterns.md`）に分離し MEMORY.md からリンク。

---

## 9. settings.local.json のセキュリティ

### 9.1 定期チェック

`.claude/settings.local.json` には過去に承認したコマンドの許可ルールが蓄積される。以下が混入しやすい：

| 危険なエントリ     | 例                                    |
| ------------------ | ------------------------------------- |
| 平文トークン       | `Bash(TOKEN="ghp_xxx...")`            |
| API キー           | `Bash(SUPABASE_ACCESS_TOKEN=xxx ...)` |
| 壊れたエントリ     | `Bash(__NEW_LINE_xxx)`, `Bash(done)`  |
| 一回限りのコマンド | `Bash(del "C:\specific\file.js")`     |

### 9.2 整理方法

定期的に以下を実行：

1. トークン・API キーを含むエントリを全て削除
2. `__NEW_LINE_*`, `done`, `for file in` 等の壊れたエントリを削除
3. 一回限りの具体的パスを含むエントリを削除
4. 汎用的なパターン（`Bash(git add:*)` 等）のみ残す

---

## 10. Claude Code / Cursor Agent 使い分け

### 10.1 基本原則

```
「外の世界」と繋がる作業  → Claude Code
「コードを書く」作業      → Cursor Agent
```

### 10.2 排他的能力（どちらかしかできない）

| Claude Code 専用              | Cursor Agent 専用               |
| ----------------------------- | ------------------------------- |
| MCP（DB 操作、drawio 等）     | 差分プレビュー（Accept/Reject） |
| Skills（知識 DB 自動参照）    | Tab 補完（インライン提案）      |
| MEMORY.md（永続メモリ）       | 選択範囲コンテキスト            |
| TodoWrite（構造化タスク管理） | Composer マルチファイル一括編集 |
| Web 検索 / WebFetch           | 開いているファイルの自動認識    |

※ MCP は Cursor Agent でもトグル ON で使用可能。ただし Skills は Claude Code 専用。

### 10.3 開発ワークフロー

```
① 仕様検討・設計         → Claude Code
   MCP で現状把握、Skills で知識補完、docs/ に保存

② 実装                  → 判断基準で選択（下表）

③ ローカルテスト         → 判断基準で選択（下表）

④ マージ・デプロイ       → Claude Code
   Git 操作 + CLI デプロイ + MCP でマイグレーション

⑤ 本番テスト            → Claude Code 主体
   MCP でログ確認 + Bash でテスト実行
```

### 10.4 ②③⑤ の判断基準

| 条件                 | 推奨ツール         | 理由                                 |
| -------------------- | ------------------ | ------------------------------------ |
| 1-3 ファイルの修正   | Cursor Agent       | 差分プレビューで目視確認             |
| DB 変更を伴う        | Claude Code        | MCP でマイグレーション実行           |
| 新規ファイル大量作成 | Cursor Agent       | Composer モード                      |
| 大規模リファクタ     | Cursor Agent       | IDE 内リネーム・差分確認             |
| 外部 API 連携        | Claude Code        | Web 検索 + Skills 知識               |
| UI 微調整            | Cursor Agent       | 選択範囲指示 + プレビュー            |
| テストコード作成     | Cursor Agent       | ファイル編集は IDE が効率的          |
| テスト実行           | Claude Code        | Bash で `npx playwright test`        |
| ログ・エラー調査     | Claude Code        | MCP + Web 検索                       |
| 判断に迷った場合     | Claude Code に聞く | 自身の MCP/Skills 能力を認識している |

### 10.5 コンテキスト管理

| 操作            | タイミング                     | 効果                                           |
| --------------- | ------------------------------ | ---------------------------------------------- |
| `+`（New Chat） | タスク切り替え時               | 新しいコンテキスト開始。旧チャットは履歴に保存 |
| `/clear`        | 同一タスク内でリセットしたい時 | コンテキスト解放。履歴は消える                 |
| `/compact`      | コンテキスト肥大化時           | 手動圧縮。「覚えておくべきこと」を制御可能     |

---

## 11. 新規プロジェクトへの適用手順

1. **CLAUDE.md 作成**: 4.2 の推奨構成に従い 50 行以内で記述
2. **base.mdc 作成**: 5.2 のテンプレートをコピー
3. **dev-rules/ 作成**: プロジェクト固有の制約のみ、各 15-25 行、`alwaysApply: false`
4. **.mcp.json 作成**: 必要な MCP を設定し `.gitignore` に追加
5. **MEMORY.md 初期化**: 開発環境構成とユーザー好みを記述
6. **settings.local.json 確認**: トークン・壊れたエントリがないことを確認
7. **Skills 確認**: プロジェクトの技術スタックに合った Skills がインストール済みか確認

---

## 12. 最適化の効果指標

| 指標                           | 最適化前（典型） | 最適化後（目標） |
| ------------------------------ | ---------------- | ---------------- |
| alwaysApply 総行数             | 500-700 行       | **50-70 行**     |
| Cursor ルール総ファイル数      | 5-8              | 3-4              |
| CLAUDE.md                      | 100+ 行          | **50-60 行**     |
| settings.local.json 内トークン | 数件             | **0 件**         |
| Skills と Cursor ルールの重複  | 多数             | **0**            |
