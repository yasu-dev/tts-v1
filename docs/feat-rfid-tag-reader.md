# RFID タグ読み取り機能の追加

**種別**: feat / **対象機種**: FUJITSU TFU-RW811A（920MHz UHF RFID リーダライタ）
**起票日**: 2026-05-13 / **対象ブランチ**: `feat/rfid-tag-reader`
**ロールバック anchor 候補**: `release/2026-05-13-pre-feat-rfid-reader`

---

## 前提・確定事項（インタビュー結果）

| 項目                     | 確定内容                                                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ブラウザ ⇔ RFID 接続方式 | **ローカルブリッジ常駐サービス**（Node.js + Fujitsu DLL）                                                                                               |
| タグ運用                 | **UID をそのまま `tag_number` に保存**。リスト・カード・モーダル等の表示は識別性とレイアウト整合性を両立させるため短縮表示する（短縮ルール定義は §2.6） |
| 対応端末                 | Windows PC（このデモ機限定ではないが Windows PC のみ）。タブレットは Phase 2                                                                            |
| リスト読み込みの動作     | **1 枚ずつ**読み取り、QR と運用を揃える                                                                                                                 |
| ロールバック方針         | 既存 `scripts/rollback.sh`（squash-merge + revert + Netlify 自動再ビルド）に乗せる。DB 変更は forward-only。機能フラグで即時 OFF 可能                   |

---

## 1. 修正内容の詳細化

### 1.1 何を / なぜ / どう変えるか

- **何を**: トリアージタグの読み取り手段に **RFID（FUJITSU TFU-RW811A、USB 接続、920MHz UHF 帯）** を追加する。既存の QR スキャン・手入力と並ぶ第 3 の入力手段。
- **なぜ**:
  - 災害現場ではカメラ動作が困難なケース（汚損、暗所、保護具着用）が想定される。RFID は近接かざしで読み取れるため代替手段になる。
  - 既存のトリアージタグ印刷物（縦長シール）に RFID チップが内蔵されており、ハードウェア資産を活かせる。
  - 東京消防庁向けの紹介資料（`docs/RFIDご紹介資料（東京消防庁様）.pptx`）に既に提案されている。
- **どう**:
  1. **PC 上にローカルブリッジ常駐サービス**（Node.js）を新設。Fujitsu 提供 DLL（`FjRfrwCommVO.dll` / `RFRWUMPHID_Drv.dll`）を呼び出して RFID を制御し、WebSocket 経由でブラウザに UID を中継する。
  2. **Web フロントエンド**に RFID 用 React コンポーネント `RFIDReader` を新規追加。既存 `QRScanner` と完全同一の I/F（`onScanSuccess(decodedText)` / `onScanError(error)`）で実装し、既存フローへの統合を最小工数で行う。
  3. **`triage_tags.tag_source` カラム**を追加（forward-only / NULL 許容 / `'qr' | 'rfid' | 'manual'`）。既存データは NULL のまま無影響。新規登録時のみ値をセット。
  4. **表示短縮ユーティリティ** `formatTagNumberForDisplay()` を新設し、`tag_number` 表示箇所 5 ファイルに適用。短縮ルール（閾値・切り出し文字数・前置記号）は §2.6 で定義する。
  5. **UI 用語の汎用化**: 既存の「QR スキャン / QR スキャナー / QR コードスキャン」表記を、QR と RFID の両方を内包する汎用語「スキャン」「コードスキャン」「タグスキャン」に置き換える。詳細は §1.3 に画面別の Before / After を列挙。
  6. **機能フラグ** `NEXT_PUBLIC_RFID_ENABLED` で UI 上の表示を制御。本番一般環境は未設定（=非表示）、デモ PC のみ `true`。

### 1.2 振る舞いの Before / After

#### Before（現状）

```
[トリアージ入力画面 /triage/scan]
  ┌─────────────────────────────────┐
  │ [QR スキャナー]                  │  セクション見出し
  │   [ スキャン開始 ]               │
  │   または                         │
  │ [ 手動入力欄: T-2025-XXX ]      │
  │     [ 次へ ]                    │
  └─────────────────────────────────┘
   ↓ tagNumber: "T-2025-001"
[START 法 → バイタル → 患者情報 → 確認]
```

```
[搬送チームダッシュボード /transport-team]
  ヘッダー [QR スキャン] ボタン → 「QR コードスキャン」モーダル
   ↓ tag_number で患者検索 → 患者詳細モーダル
```

#### After（追加後）

```
[トリアージ入力画面 /triage/scan]
  ┌──────────────────────────────────────────────┐
  │ [コードスキャン]                              │  ← セクション見出しを汎用化
  │   [ スキャン開始 ]                            │
  │   （内部: html5-qrcode によるカメラ撮影）     │
  │                                              │
  │ [タグスキャン]  状態: ●接続中 / ○未接続     │  ← NEW セクション
  │   [ かざして読み取り ]                        │
  │   （内部: ローカルブリッジ経由 RFID 読み取り）│
  │                                              │
  │ [ 手動入力欄: T-2025-XXX ]                   │
  │     [ 次へ ]                                  │
  └──────────────────────────────────────────────┘
   ↓ tagNumber:
   │  - コードスキャンの場合: "T-2025-001"（既存正規化）
   │  - タグスキャンの場合: "E2806894000050250A9F0080"（UID 24 文字をそのまま格納）
   │  - 手入力の場合: 入力値そのまま
[START 法 → ...]
```

```
[搬送チームダッシュボード /transport-team]
  ヘッダー [スキャン] ボタン  ← 既存「QR スキャン」を「スキャン」に汎用化
            ↓ モーダル「タグを読み取る」
            ├─ タブ「コード（カメラ）」 ─ 既存 QRScanner
            └─ タブ「タグ（RFID）」     ─ 新規 RFIDReader
            ↓ UID または T-2025-XXX で tag_number 検索 → 患者詳細モーダル

[患者リスト表示]（後述の §1.3.3 ダッシュボード群と共通）
  ┌──────────────────────────────────────┐
  │ 🟥 T-2025-001    田中太郎             │  既存タグ（短縮不要）
  │ 🟥 …(末尾抜粋)   患者B                │  RFID UID（短縮表示、ルールは §2.6）
  └──────────────────────────────────────┘
```

機能フラグ `NEXT_PUBLIC_RFID_ENABLED` 未設定の場合は **既存挙動と完全一致**（RFID セクション・タブ非表示、UI ラベルも既存の「QR スキャン」表記を維持、表示短縮も無効化）。

### 1.3 UI 観点での変更点（画面別）

機能追加によって UI に変更が及ぶ画面と、画面ごとの変更内容を網羅する。`NEXT_PUBLIC_RFID_ENABLED=true` 時の挙動を記載。

#### 1.3.1 トリアージ入力画面（`/triage/scan`、ロール: TRI）

| 要素                 | Before                                                   | After                                                                                                                                                      |
| -------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 上位セクション見出し | （なし、QRScanner が直下に配置）                         | 「**コードスキャン**」見出しを QR セクションに付与                                                                                                         |
| 既存 QR セクション   | 「QR スキャナー」（暗黙ラベル）                          | 「**コードスキャン**」セクションとして明示。内部は既存 QRScanner（無変更）                                                                                 |
| 新規 RFID セクション | 存在せず                                                 | 「**タグスキャン**」セクションを新設（コードスキャンと手入力の間）。接続状態インジケーター（●接続中 / ○未接続 / ⚠ エラー）と「**かざして読み取り**」ボタン |
| 手動入力欄           | 「または手動入力:」                                      | 同一（変更なし）。`placeholder` も `T-2025-XXX` のまま                                                                                                     |
| カメラ起動メッセージ | 「トリアージタッグの QR コードをカメラに写してください」 | 同一（QR セクション内なので「QR コード」記載は維持）                                                                                                       |

#### 1.3.2 搬送チームダッシュボード（`/transport-team`、ロール: 搬送チーム）

| 要素                           | Before                                                                          | After                                                                                                                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ヘッダーのスキャンボタン       | 「QR スキャン」（aria-label: 「患者 QR コードをスキャン」）                     | 「**スキャン**」（aria-label: 「**患者タグをスキャン**」）                                                                                                                                                                            |
| スキャンモーダルのタイトル     | 「QR コードスキャン」                                                           | 「**タグを読み取る**」                                                                                                                                                                                                                |
| モーダル内構造                 | QRScanner と「手動入力で検索」切替（2 モードトグル: `showManualInput` boolean） | **3 モードトグル**に拡張（既存 2 モードトグルの素直な拡張、`scanMode: 'code' \| 'rfid' \| 'manual'` の単一 state に整理）。① 「**コード（カメラ）**」=既存 QRScanner、② 「**タグ（RFID）**」=新規 RFIDReader、③ 「**手動入力**」=既存 |
| モーダル下部のキャプション     | 「QR コードをスキャンするか手動入力してください」                               | 「**タグをスキャンするか、手動で入力してください**」                                                                                                                                                                                  |
| 患者リストの `tag_number` 表示 | フル文字列                                                                      | 短縮表示（§2.6 ルール）                                                                                                                                                                                                               |

#### 1.3.3 指揮本部ダッシュボード（`/command`、ロール: IC）

| 要素                                 | Before     | After            |
| ------------------------------------ | ---------- | ---------------- |
| 患者リストの `tag_number` バッジ表示 | フル文字列 | 短縮表示（§2.6） |
| 統計カード                           | 変更なし   | 変更なし         |
| フィルタボタン群                     | 変更なし   | 変更なし         |
| マップ上のピンに付くタグ番号         | フル文字列 | 短縮表示         |

スキャン機能はこの画面に存在しないため、ラベル汎用化の対象なし。

#### 1.3.4 搬送部隊ダッシュボード（`/transport`、ロール: TRN）

| 要素                                                       | Before     | After            |
| ---------------------------------------------------------- | ---------- | ---------------- |
| 搬送対象患者リストの `tag_number` 表示                     | フル文字列 | 短縮表示（§2.6） |
| 搬送割当ボタン押下時の確認ダイアログ「患者: {tag_number}」 | フル文字列 | 短縮表示         |
| その他                                                     | 変更なし   | 変更なし         |

スキャン機能はこの画面に存在しないため、ラベル汎用化の対象なし。

#### 1.3.5 病院ダッシュボード（`/hospital`、ロール: HSP）

| 要素                                 | Before     | After            |
| ------------------------------------ | ---------- | ---------------- |
| 搬送中患者リストの `tag_number` 表示 | フル文字列 | 短縮表示（§2.6） |
| その他                               | 変更なし   | 変更なし         |

#### 1.3.6 患者詳細モーダル（全画面共通）

| 要素                           | Before                     | After                                                        |
| ------------------------------ | -------------------------- | ------------------------------------------------------------ |
| ヘッダー部の `tag_number` 表示 | フル文字列                 | 短縮表示（§2.6）+ tooltip でフル文字列をホバー時に閲覧可能   |
| 編集モードの input             | フル文字列の編集可能 input | **同一（短縮しない）** — 編集を阻害しないためフル UID を表示 |

#### 1.3.7 マップモーダル（`MapModal.tsx`、全画面共通）

| 要素                         | Before     | After            |
| ---------------------------- | ---------- | ---------------- |
| ピン上に表示される tagNumber | フル文字列 | 短縮表示（§2.6） |

#### 1.3.8 ラベル汎用化の方針一覧（全画面横断）

| 既存表記                                                    | 新表記                                               | 適用箇所                                 |
| ----------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------- |
| 「QR スキャン」（ボタン文言）                               | 「**スキャン**」                                     | 搬送チームダッシュボードのヘッダー       |
| 「QR スキャナー」（セクション名）                           | 「**コードスキャン**」                               | トリアージ入力画面                       |
| 「QR コードスキャン」（モーダルタイトル）                   | 「**タグを読み取る**」                               | 搬送チームダッシュボードのモーダル       |
| 「患者 QR コードをスキャン」（aria-label）                  | 「**患者タグをスキャン**」                           | 搬送チームダッシュボードのヘッダーボタン |
| 「QR コードをスキャンするか手動入力してください」（説明文） | 「**タグをスキャンするか、手動で入力してください**」 | モーダル下部キャプション                 |
| 「QR スキャンでエラーが発生しました」（alert 文言）         | 「**スキャンでエラーが発生しました**」               | 搬送チームダッシュボードのエラーアラート |

QR セクション**内部**の「QR コードをカメラに写してください」「写真から読み取る」等、QR 固有機能の説明文は維持する（その機能が QR 限定であるため）。

---

## 2. 実現手段

### 2.1 システム構成

```
┌────────────────────────────────────────────────────┐
│            ブラウザ (Edge / Chrome)                  │
│  ┌────────────────────────────────────────────┐    │
│  │  Next.js アプリ                              │    │
│  │  ├─ components/QRScanner.tsx (変更なし)      │    │
│  │  ├─ components/RFIDReader.tsx (新規)         │    │
│  │  ├─ lib/hooks/useRFIDBridge.ts (新規)        │    │
│  │  ├─ lib/utils/tag-display.ts (新規)          │    │
│  │  └─ app/triage/scan/page.tsx (改修)          │    │
│  └────────────────┬───────────────────────────┘    │
└───────────────────┼─────────────────────────────────┘
                    │ WebSocket (ws://127.0.0.1:17324)
                    │ JSON メッセージ: {type, payload}
                    ↓
┌────────────────────────────────────────────────────┐
│   ローカルブリッジ常駐サービス (新規)                  │
│   services/rfid-bridge/                             │
│   ├─ Node.js 20.x + ws (WebSocket Server)          │
│   ├─ DLL 呼出（着手時に DLL の API 形式を確認し、    │
│   │   C ABI なら koffi、COM Automation なら         │
│   │   winax / edge-js 等を選定）                    │
│   ├─ Origin チェック (localhost + 本番ドメイン)     │
│   └─ ヘルスチェック HTTP /health (port 17325)       │
└─────────────────────┬──────────────────────────────┘
                      │ FFI 呼出
                      ↓
┌────────────────────────────────────────────────────┐
│  Fujitsu 提供 DLL                                   │
│  ├─ C:\Fujitsu Frontech\RFID\CounterSensorSlim64\  │
│  │   ├─ FjRfrwCommVO.dll (通信 API)                 │
│  │   ├─ RFRWUMPHID_Drv.dll (HID ドライバ)           │
│  │   ├─ RFRWUMPHID_Drv.ini (設定)                   │
│  │   └─ RfReaderTest.exe (動作確認ツール)           │
└─────────────────────┬──────────────────────────────┘
                      │ USB HID
                      ↓
┌────────────────────────────────────────────────────┐
│  FUJITSU TFU-RW811A                                 │
│  (920MHz UHF, 特定小電力, カウンターセンサースリム)  │
└────────────────────────────────────────────────────┘
```

### 2.2 修正対象ファイル・関数の特定

#### 新規ファイル

| パス                                       | 役割                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/RFIDReader.tsx`                | RFID 読み取り UI。`onScanSuccess(uid)` / `onScanError(msg)` の I/F を `QRScanner` と完全一致させる。接続状態（disconnected / connecting / connected / scanning / error）を内部で持ち、ボタン押下で 1 回スキャン → UID 受信 → callback 発火                                                                                                                                                                                          |
| `lib/hooks/useRFIDBridge.ts`               | WebSocket 接続管理 Hook。`ws://127.0.0.1:17324` への接続、自動再接続（指数バックオフ）、メッセージ送受信、状態返却。`{ status, scan, lastError }` を返す                                                                                                                                                                                                                                                                            |
| `lib/utils/tag-display.ts`                 | `formatTagNumberForDisplay(tag: string): string`。詳細ルールは §2.6（v1: 閾値 14 文字超で末尾 8 文字 + 三点リーダ `…`）。既存の `T-2025-001`（10 文字）はそのまま、UID（24 文字）は短縮される                                                                                                                                                                                                                                       |
| `lib/types/rfid.ts`                        | ブリッジ通信メッセージ型（`BridgeRequest` / `BridgeResponse` / `BridgeStatus`）と RFID 関連型を定義                                                                                                                                                                                                                                                                                                                                 |
| `lib/env.ts`（追記）                       | 既存 zod スキーマに `NEXT_PUBLIC_RFID_ENABLED`（optional, `'true' \| 'false'`）と `NEXT_PUBLIC_RFID_BRIDGE_URL`（optional, default `ws://127.0.0.1:17324`）を追加                                                                                                                                                                                                                                                                   |
| `supabase/add-tag-source-field.sql`        | 既存マイグレーション（例: `supabase/add-triage-tag-fields.sql`）と同じく `supabase/` 直下配置、タイムスタンプ無しの命名規則。内容は `ALTER TABLE triage_tags ADD COLUMN IF NOT EXISTS tag_source TEXT`、CHECK 制約は `DO $$ ... END $$` で冪等付与（`tag_source IS NULL OR tag_source IN ('qr','rfid','manual')`）。`CREATE INDEX IF NOT EXISTS idx_triage_tags_tag_source ON triage_tags(tag_source) WHERE tag_source IS NOT NULL` |
| `services/rfid-bridge/package.json`        | Node 20+, deps: `ws ^8`, `pino ^9`、および DLL 呼出ライブラリ（着手時に DLL API 形式確認後、`koffi` / `winax` / `edge-js` 等から選定。§8 ステップ 0 参照）                                                                                                                                                                                                                                                                          |
| `services/rfid-bridge/index.js`            | エントリーポイント。WebSocket Server 起動、DLL ロード、コマンド受信 → DLL 呼び出し → UID 返却                                                                                                                                                                                                                                                                                                                                       |
| `services/rfid-bridge/rfid-driver.js`      | Fujitsu DLL ラッパー。`open()` / `close()` / `inventory()` / `readUID()` を提供                                                                                                                                                                                                                                                                                                                                                     |
| `services/rfid-bridge/health-server.js`    | HTTP `/health` を 17325 で公開。`{status:'ok', driver:'loaded', port:17324}` を返す                                                                                                                                                                                                                                                                                                                                                 |
| `services/rfid-bridge/README.md`           | インストール・起動・トラブルシューティング手順                                                                                                                                                                                                                                                                                                                                                                                      |
| `services/rfid-bridge/install-service.ps1` | `node-windows` で Windows サービス登録（任意）                                                                                                                                                                                                                                                                                                                                                                                      |
| `docs/runbooks/rfid-bridge.md`             | 運用ランブック（起動失敗・再接続不能・DLL 認識失敗時の対処）                                                                                                                                                                                                                                                                                                                                                                        |
| `tests/unit/tag-display.test.ts`           | `formatTagNumberForDisplay` の Jest 仕様テスト                                                                                                                                                                                                                                                                                                                                                                                      |
| `tests/unit/useRFIDBridge.test.ts`         | WebSocket Hook のモックテスト                                                                                                                                                                                                                                                                                                                                                                                                       |
| `.env.example`（追記）                     | `NEXT_PUBLIC_RFID_ENABLED=false` / `NEXT_PUBLIC_RFID_BRIDGE_URL=ws://127.0.0.1:17324`                                                                                                                                                                                                                                                                                                                                               |

#### 変更対象ファイル

| パス・関数・行                                                         | 変更方針                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/triage/scan/page.tsx:187-225` (`handleQRScanSuccess`)             | 関数名は維持。同じ関数を `RFIDReader` の `onScanSuccess` にも渡す。**UID は既存正規化のいずれにもマッチしないため最後の `setTagNumber(decodedText)` でフル UID がそのまま入る**（既存ロジック維持で動作）。読み取り元を識別するため `tagSource` state（`'qr' \| 'rfid' \| 'manual'`）を新設し、ハンドラ呼び出し時にセット                                                                                                                         |
| `app/triage/scan/page.tsx:557-577` (QR ステップ UI)                    | `<QRScanner>` の **下**、手入力欄の **上** に `{rfidEnabled && <RFIDReader ... />}` を追加。QR セクションに見出し「**コードスキャン**」、RFID セクションに見出し「**タグスキャン**」を付与。手入力 `onChange` で `setTagSource('manual')`、`<QRScanner>` の `onScanSuccess` ラッパで `setTagSource('qr')`、`<RFIDReader>` の `onScanSuccess` ラッパで `setTagSource('rfid')`                                                                      |
| `app/triage/scan/page.tsx` (`handleFinalSubmit` 周辺、行 330-410 付近) | Supabase `insert` 時に `tag_source: tagSource` を含める                                                                                                                                                                                                                                                                                                                                                                                           |
| `app/(dashboard)/transport-team/TransportTeamDashboard.tsx:9-528`      | スキャンモーダルを **3 モードトグル**（コード / タグ / 手動入力）に再構成。既存 2 モードトグル（`showManualInput` boolean）を `scanMode: 'code' \| 'rfid' \| 'manual'` の単一 state に整理。`handleQRScan` を `handleScan` に汎用化（既に UID で `tag_number` 検索しているので変更不要）。ヘッダーボタン文言を「QR スキャン」→「**スキャン**」、aria-label を「**患者タグをスキャン**」に変更。モーダルタイトル・キャプションを §1.3.2 に従い更新 |
| `components/PatientPanelCard.tsx:142`                                  | `{tag.tag_number}` → `{formatTagNumberForDisplay(tag.tag_number)}`                                                                                                                                                                                                                                                                                                                                                                                |
| `components/PatientListItem.tsx:32`                                    | 同上                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `components/PatientDetailModal.tsx:152`                                | 同上。**編集モードの input 表示は元の値を保持**                                                                                                                                                                                                                                                                                                                                                                                                   |
| `components/TransportAssignButton.tsx:75`                              | 同上                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `components/MapModal.tsx:74`                                           | `tagNumber: tag.tag_number` → `tagNumber: formatTagNumberForDisplay(tag.tag_number)`（マップピン上の表示用）                                                                                                                                                                                                                                                                                                                                      |
| `lib/types/index.ts:23-260` (`TriageTag`)                              | `tag_source?: 'qr' \| 'rfid' \| 'manual'` を optional 追加                                                                                                                                                                                                                                                                                                                                                                                        |
| `package.json`                                                         | dependencies に追加なし（フロント側は WebSocket 標準 API を使用）。ブリッジは `services/rfid-bridge/` 配下で独立した `package.json` を持つ                                                                                                                                                                                                                                                                                                        |
| `.gitignore`（追記）                                                   | `services/rfid-bridge/node_modules/`, `services/rfid-bridge/logs/`                                                                                                                                                                                                                                                                                                                                                                                |
| `next.config.mjs` または `middleware.ts`                               | 変更なし（ローカルブリッジは localhost 通信のため CSP 影響なし。ただし `connect-src` に `ws://127.0.0.1:17324` を許可する必要がある場合は `next.config.mjs` のヘッダー設定を確認）                                                                                                                                                                                                                                                                |

### 2.3 ブリッジサービスの API 設計

WebSocket メッセージ（JSON）:

```typescript
// クライアント → ブリッジ
type BridgeRequest =
  | { type: 'PING' }
  | { type: 'SCAN_START'; mode: 'single' } // 単発スキャン開始
  | { type: 'SCAN_CANCEL' };

// ブリッジ → クライアント
type BridgeResponse =
  | { type: 'PONG' }
  | { type: 'STATUS'; status: 'ready' | 'busy' | 'error'; detail?: string }
  | { type: 'SCAN_RESULT'; uid: string; rssi?: number; scannedAt: string }
  | {
      type: 'ERROR';
      code: 'DEVICE_NOT_FOUND' | 'DRIVER_LOAD_FAILED' | 'SCAN_TIMEOUT' | 'INTERNAL';
      message: string;
    };
```

ヘルスチェック HTTP（`/health` on port 17325）:

```
GET /health
→ 200 OK
{ "status": "ok", "driver": "loaded", "wsPort": 17324, "version": "0.1.0" }
```

セキュリティ:

- WebSocket Server は `127.0.0.1` のみにバインド（`0.0.0.0` で公開しない）
- 接続時に `Origin` ヘッダを検証。許可: `http://localhost:3000`, `http://localhost:3443`, `https://triage-tag-system.netlify.app`
- HTTPS ⇄ ws://localhost のミックスコンテンツ対策: ブラウザ仕様で **`ws://127.0.0.1:*` は HTTPS 配下でも例外的に許可される**（Chrome / Edge）。Firefox/Safari は要動作確認だが Phase 1 では Chrome/Edge のみサポート（既存仕様も Chrome 推奨）

### 2.4 テスト戦略

| 領域                                | 戦略                             | 理由                                                                 |
| ----------------------------------- | -------------------------------- | -------------------------------------------------------------------- |
| `formatTagNumberForDisplay`         | **仕様テスト先行（TDD）**        | 純粋関数・境界値（10 文字・14 文字・15 文字・24 文字・空文字）が明確 |
| WebSocket メッセージスキーマ        | **コントラクトテスト先行**       | クライアント↔ブリッジ間契約                                          |
| `useRFIDBridge` Hook                | 実装後テスト（Jest + WS モック） | 状態遷移ロジック中心                                                 |
| `RFIDReader` コンポーネント         | 実装後テスト（Testing Library）  | UI 振る舞い                                                          |
| ブリッジサービス（DLL 統合）        | **実装後 + 実機手動テスト**      | Fujitsu DLL は実機必須・モック不可                                   |
| エンド to エンド（実機 RFID + Web） | **実機手動テスト**               | RFID ハードウェア依存。Playwright 自動化は ROI 低い                  |

### 2.5 検証手段（設計の正しさを判定する材料）

| #   | 検証対象                       | 形式                                                                                            | 期待値                                                                                                                 |
| --- | ------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| V1  | 表示短縮: 既存タグ番号形式     | Jest: `formatTagNumberForDisplay("T-2025-001")`                                                 | 短縮閾値以下のため無変更で返る（具体値は §2.6）                                                                        |
| V2  | 表示短縮: 96bit UID            | Jest: `formatTagNumberForDisplay("E2806894000050250A9F0080")`                                   | §2.6 の短縮ルール通り、前置記号 + 末尾抜粋で返る                                                                       |
| V3  | 表示短縮: 境界値               | Jest: 短縮閾値ちょうどの長さ・閾値+1 の長さ両方を投入                                           | 閾値以下は無変更、閾値超過は短縮形式                                                                                   |
| V4  | 表示短縮: 異常入力             | Jest: `formatTagNumberForDisplay("")` および `null`/`undefined`（型は string 強制だが防御目的） | 空文字を返す。クラッシュなし                                                                                           |
| V4b | 表示短縮: 128bit UID           | Jest: `formatTagNumberForDisplay("...32文字...")`                                               | §2.6 の短縮ルール通りに動作。96bit と同じ抜粋桁数                                                                      |
| V5  | Hook 状態遷移                  | Jest: `useRFIDBridge` → mock WS で connect→close→reconnect                                      | 状態が `connecting`→`connected`→`disconnected`→`connecting` の順に遷移                                                 |
| V6  | Hook 再接続上限                | Jest: 5 回連続失敗 → `error` 状態へ固定                                                         | reconnect 試行が指数バックオフ（1s→2s→4s→8s→16s）で停止                                                                |
| V7  | ブリッジ起動                   | Bash: `curl -s http://localhost:17325/health`                                                   | `{"status":"ok","driver":"loaded",...}`                                                                                |
| V8  | ブリッジ DLL ロード失敗時      | Bash: DLL を一時退避して起動 → `curl /health`                                                   | `{"status":"error","driver":"failed",...}` (200 で返す)                                                                |
| V9  | 実機 UID 読み取り              | 手動: ブリッジ起動 + `/triage/scan` → RFID ボタン → タグかざす                                  | `tagNumber` state に UID 文字列が入り、ステップが `start` に遷移。コンソールに `INFO RFID scan success { uid: "..." }` |
| V10 | UID で DB 登録                 | 手動: 登録完了 → Supabase Dashboard で `triage_tags` を select                                  | フル UID が `tag_number` に、`tag_source = 'rfid'` が保存されている                                                    |
| V11 | 表示短縮の実画面               | 手動: `/command` の患者リストで UID 行を確認                                                    | `...0A9F0080` のように短縮表示される                                                                                   |
| V12 | 機能フラグ OFF 時              | 手動: `NEXT_PUBLIC_RFID_ENABLED=false` でビルド → `/triage/scan`                                | RFID ボタンが非表示、既存挙動と完全一致                                                                                |
| V13 | 同一タグ二重スキャン           | 手動: 同一 event_id 内で同じタグを 2 回登録                                                     | 2 回目で `UNIQUE(event_id, tag_number)` 複合制約エラー → 既存エラーハンドリングで UI に通知                            |
| V14 | `/transport-team` で RFID 検索 | 手動: 既登録タグをかざす                                                                        | 該当患者詳細モーダルが開く                                                                                             |
| V15 | ロールバック                   | Bash: `bash scripts/rollback.sh <merge-sha>`                                                    | `git revert` 成功、Netlify 自動再ビルド開始、3 分以内に RFID 機能が消失、既存 QR/手入力が動作                          |
| V16 | 編集モード表示                 | 手動: 患者詳細モーダル → 編集ボタン                                                             | input には**フル UID** が表示される（編集を阻害しない）                                                                |

V9〜V14, V16 は実機 RFID 必須のため **実装後に人間が UI 確認** とする（探索的タスク扱い、Playwright 自動化は対象外）。V1〜V8, V15 は AI が自動実行・確認可能。

### 2.6 表示短縮ルールの定義

`formatTagNumberForDisplay(tag: string): string` の仕様を確定する。

#### 設計指針

- **既存タグ番号（`T-YYYY-NNN` 形式、10 文字）は無変更で返す**。デザインを壊さない。
- **RFID UID（EPC 96bit = 16 進数 24 文字、または 128bit = 32 文字）は短縮表示する**。UI バッジのレイアウト崩れを避ける。
- 末尾抜粋を採用する理由: UHF RFID の EPC は仕様上、先頭にメーカー固有ヘッダー（PC + ヘッダーバイト）が並ぶため、現場運用上の識別性は末尾の方が高い。
- **災害現場で同時に扱うタグ枚数規模**（経験則として最大 10³ オーダー）に対し、短縮抜粋桁数は識別性とレイアウトのバランスから決める。
- 抜粋桁数を 8 文字（16 進数換算で 16⁸ ≈ 約 4.3 × 10⁹ 通り、桁衝突確率は誕生日のパラドックスで 10³ 枚同居でも 10⁻³ 未満）とすれば、識別性に十分。実際の UI バッジ幅と可読性に応じて実装フェーズ B で微調整可。

#### 確定ルール（v1）

| 入力長           | 出力                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| 0 文字（空文字） | `""`                                                                   |
| 1〜14 文字       | 入力そのまま（既存タグ番号 `T-YYYY-NNN` を含む）                       |
| 15 文字以上      | `"…" + 入力の末尾 8 文字`（前置に三点リーダ `…` U+2026 を 1 文字使用） |

例:

- `formatTagNumberForDisplay("T-2025-001")` → `"T-2025-001"`
- `formatTagNumberForDisplay("E2806894000050250A9F0080")`（24 文字） → `"…0A9F0080"` ※末尾 8 文字 `0A9F0080` の前に `…` を 1 文字。**注: 末尾 8 文字を `…` 1 文字と合わせて 9 文字に表示する**
- `formatTagNumberForDisplay("AAAAAAAAAAAAAA")`（14 文字） → 無変更で 14 文字を返す
- `formatTagNumberForDisplay("AAAAAAAAAAAAAAA")`（15 文字） → `"…AAAAAAAA"`（先頭 7 文字を捨て、末尾 8 文字 + `…`）

注: 上記「末尾 8 文字」「閾値 14 文字」は v1 確定値だが、実装フェーズ B のローカル検証時に画面幅・既存バッジサイズと突き合わせ、人間が UI 確認した結果として微調整する余地がある（最終確定は実装後 UX レビューで）。仕様変更時はユニットテスト V1〜V4b の期待値を更新する。

#### tooltip / 完全値の閲覧

短縮表示された UI 要素には `title` 属性または shadcn/ui の Tooltip 相当でフル `tag_number` をホバー時に表示する。患者詳細モーダルの編集モードでは短縮を適用せずフル文字列を表示・編集可能とする（§1.3.6）。

---

## 3. 影響範囲の分析

### 3.1 既存機能への影響

| 既存機能                                                 | 影響                                                                                                                                                                          | 対策                                                         |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `/triage/scan` QR スキャン                               | UI に RFID リーダーセクションが追加されるが、QR 自体のロジックは無変更                                                                                                        | 機能フラグで RFID UI 表示制御。OFF 時は既存と完全一致        |
| `/triage/scan` 手入力                                    | 入力欄位置は不変（RFID は QR と手入力の間に挿入）                                                                                                                             | 視認性・UX を人間が確認                                      |
| `/triage/scan` STARTウィザード以降                       | `tagNumber` の文字列長が伸びる可能性（UID 24 文字）。state 型は `string` のままで型影響なし                                                                                   | 後続フォームで `tagNumber` を表示する箇所は短縮表示を経由    |
| `/transport-team` スキャン機能                           | 既存の `handleQRScan` は `tag_number.eq.${patientId}` で検索しているため、UID でもそのまま動作。**ヘッダーボタン・モーダルタイトル・aria-label のラベル汎用化（§1.3.2）あり** | 検証 V14 で動作確認。UI ラベル変更は実機 UI 確認で人間が承認 |
| `/command`, `/transport`, `/hospital` のリスト・モーダル | `tag_number` 表示が短縮される                                                                                                                                                 | 短縮閾値（§2.6: 14 文字）以下の既存タグは無変更。UI 確認必須 |
| 患者詳細モーダル編集モード                               | 編集 input には**フル UID** が必要（編集時の短縮は誤入力の元）                                                                                                                | 編集 input は短縮を適用しない（V16 で確認）                  |
| Realtime 同期                                            | `tag_source` カラム追加に伴う Replication 設定は既存通り（`triage_tags` テーブル全体が対象）                                                                                  | 追加設定不要                                                 |
| RLS ポリシー                                             | 変更なし。`tag_source` カラムは既存ポリシーで自動的に保護される                                                                                                               | 確認のみ                                                     |

### 3.2 API・DB・外部連携への影響

| 対象                     | 影響                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Supabase API             | 変更なし（PostgREST 経由で自動的に新カラムに対応）                                                                      |
| Supabase DB スキーマ     | `triage_tags.tag_source` カラム追加（forward-only、NULL 許容、CHECK 制約）。`sql-guard` CI を通過する                   |
| 既存レコード             | `tag_source = NULL` のまま無影響。`SELECT *` で NULL が返るのみ                                                         |
| Supabase Storage         | 影響なし                                                                                                                |
| Netlify デプロイ         | 環境変数 `NEXT_PUBLIC_RFID_ENABLED=false` を追加（既存変数は不変）。ビルドは通常通り                                    |
| Sentry                   | RFID 接続失敗イベントを `sentry-info` レベルで送信。本番のみ。`NEXT_PUBLIC_RFID_ENABLED=false` 環境では全く送信されない |
| 外部 API                 | なし                                                                                                                    |
| ローカルブリッジサービス | 新規。デモ PC でのみ起動する。Netlify 本番環境からは独立                                                                |

### 3.3 非機能への影響

| 観点             | 影響・対策                                                                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 性能（フロント） | ローカル WebSocket は数 ms オーダー。QR カメラ起動より高速                                                                                                                                                      |
| 性能（ブリッジ） | Node プロセス常駐 ~50MB。RFID 読み取り処理は DLL に委譲、応答時間は <500ms 想定                                                                                                                                 |
| メモリ           | 上記の通り。ブラウザ側は WebSocket 1 接続分の増加のみ                                                                                                                                                           |
| セキュリティ     | ① WebSocket は 127.0.0.1 バインド、外部公開禁止。② Origin チェックで正規ドメインのみ許可。③ ブリッジは UID 取得のみで個人情報を扱わない。④ HTTPS ⇄ ws://localhost のミックスコンテンツは Chrome/Edge で許可済み |
| ログ             | ブリッジは `services/rfid-bridge/logs/rfid-bridge.log` に pino でローテーション記録。Web 側は既存 `lib/utils/logger.ts` で `components/RFIDReader` スコープのログを出力                                         |
| 可用性           | ブリッジ未起動・DLL 認識失敗時は UI が「RFID 未接続」を表示し、QR/手入力にフォールバック可能。アプリ全体は機能継続                                                                                              |
| アクセシビリティ | RFID ボタンに `aria-label="RFID タグをスキャン"` を付与。ステータスインジケーターはテキストと色の両方で状態を伝える                                                                                             |
| デバイス依存     | TFU-RW811A 専用。他機種が接続された場合はブリッジが `DEVICE_NOT_FOUND` を返す                                                                                                                                   |

### 3.4 テスト観点・確認事項

- [ ] 機能フラグ ON / OFF それぞれで UI が期待通り（OFF 時は既存「QR スキャン」ラベルが維持される）
- [ ] UID 長 24 文字（96bit EPC）と 32 文字（128bit）両方で表示短縮が動く
- [ ] 短縮ルール（§2.6）の閾値・抜粋桁数で UI レイアウト崩れがない（各バッジ・カード・モーダル）
- [ ] tooltip / `title` 属性でフル UID を閲覧できる
- [ ] 同一 event_id 内での同一タグ二重登録時の `UNIQUE(event_id, tag_number)` 複合制約エラーがユーザーに正しく通知される
- [ ] WebSocket 切断中に「かざして読み取り」ボタンを押した時の UI 振る舞い（ボタン無効化 or 適切なエラー表示）
- [ ] ブリッジが起動していない状態でも `/triage/scan` ページ自体は表示可能
- [ ] ブラウザがバックグラウンドになっても再接続する
- [ ] 患者詳細モーダルの編集モードで `tag_number` のフル値が見える / 編集できる
- [ ] 各画面のラベル汎用化（§1.3.8）が反映されている: 搬送チームダッシュボードのヘッダーボタン「スキャン」、モーダルタイトル「タグを読み取る」、3 モードトグル構成、aria-label「患者タグをスキャン」
- [ ] トリアージ入力画面のセクション見出し「コードスキャン」「タグスキャン」が表示される
- [ ] `tag_source = NULL` の既存レコードがリスト表示で表示崩れしない
- [ ] `scripts/rollback.sh` で revert 後、Web から RFID UI が消え、ラベルが既存表記に戻り、既存 QR/手入力が継続動作
- [ ] revert 後も `triage_tags.tag_source` カラムは DB に残存し、過去登録分の値も維持される（forward-only 確認）
- [ ] PR で `sql-guard.yml` が通過する（マイグレーション内容が forward-only）

---

### 3.5 異常系シナリオ一覧

§3.1〜§3.4 で扱われていない異常系・エッジケースを網羅する。**設計欠陥**（実装着手前に解決必要） / **改善余地**（実装と並行で対応） / **参考**（運用情報）の 3 段階に区分する。

#### 3.5.1 設計欠陥（必須対応）

| #      | シナリオ                         | 想定挙動・対策                                                                                                                                                                                                                                                                                                                                                                                   | 適用箇所                                                                         |
| ------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | --------------------------- |
| **E1** | 複数タグの同時検知               | TFU-RW811A は UHF Inventory モードで複数 EPC を同時返却する仕様。ブリッジ側で `getInventory()` 戻り配列のうち**最初の 1 件のみ採用**し、2 件目以降は破棄。破棄時は `pino` で `{ level: 'warn', event: 'multi_tag_discarded', count, kept_uid, discarded_uids: [] }` を記録。§0「リスト読込は 1 枚ずつ」と整合させるための明示的な抑止策。                                                        | ブリッジ                                                                         |
| **E2** | WebSocket ポート占有での起動失敗 | ブリッジ起動時に `EADDRINUSE` を検知したら、`/health` が `{ status: 'error', driver: 'port_in_use', port: <N> }` を返す状態で待機。Windows イベントログ（ソース: `tts-rfid-bridge`）に Warning レベルで記録。`services/rfid-bridge/README.md` のトラブルシューティング節に「`netstat -ano                                                                                                        | findstr :<port>` で占有プロセスを特定 → タスクマネージャで終了」手順を必須記載。 | ブリッジ + 運用ドキュメント |
| **E3** | DLL 呼出の権限要件が未確定       | FUJITSU DLL（`FjRfrwCommVO.dll` / `RFRWUMPHID_Drv.dll`）が標準ユーザー権限で動作するか管理者権限を要するかが未確定。フェーズ B 着手前の §8 ステップ 0 で `RfReaderTest.exe` を**標準ユーザー / 管理者の両方**で起動して挙動比較し、Windows サービス（`node-windows`）の実行アカウントを確定する。Admin 必須なら `LocalSystem` または特定管理者アカウント、不要なら現ログインユーザーで稼働可能。 | §8 ステップ 0                                                                    |

#### 3.5.2 改善余地（実装と並行で対応）

| #      | シナリオ                               | 想定挙動・対策                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 適用箇所      |
| ------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| **E4** | 電波干渉でのリトライ・タイムアウト     | DLL 読み取り API のタイムアウトを **2000ms** に設定。失敗時は線形バックオフ 500ms で**最大 2 回**リトライ。それでも失敗なら §2.3 既定の `{ type: 'ERROR', code: 'SCAN_TIMEOUT', message }` を WebSocket 送信し、UI は「電波が届きません。タグをリーダー近くで再度かざしてください」を表示。タイムアウト・リトライ値は `services/rfid-bridge/.env` で上書き可能（`RFID_READ_TIMEOUT_MS`, `RFID_READ_RETRY`）。                                                                        | ブリッジ + UI |
| **E5** | Origin チェック拒否時の挙動            | WebSocket ハンドシェイクで `Origin` ヘッダが §2.3 既定の許可リスト（`http://localhost:3000`, `http://localhost:3443`, `https://triage-tag-system.netlify.app`、および環境変数 `RFID_BRIDGE_ALLOWED_ORIGINS` による追加分）に該当しない場合、**close code 1008**（Policy Violation）で即時切断。`pino` ログに `{ level: 'warn', event: 'origin_rejected', origin, ip }` を記録。攻撃検知の観点でログは pino のローテーションとは別ファイル `rfid-bridge-security.log` にも追記する。  | ブリッジ      |
| **E6** | ブリッジサービスのクラッシュ自動再起動 | `node-windows` の自動再起動ポリシー（公式デフォルト準拠）: `wait: 1` 秒（初回再起動までの待機）、`grow: 0.25`（再起動ごとに待機時間を 25% 増加）、`maxRestarts: 3`（**60 秒ウィンドウ内に 3 回**失敗で再起動を停止する公式仕様）。停止時は Windows イベントログに Error レベルで記録。`services/rfid-bridge/install-service.js` でこのポリシーをコード化する。                                                                                                                       | ブリッジ運用  |
| **E7** | USB ケーブル抜去・再接続検知           | DLL 操作が §2.3 既定の `{ type: 'ERROR', code: 'DEVICE_NOT_FOUND', message }` を返した時点で**5 秒間隔で最大 12 回**（合計 1 分）再オープンを試行。成功時は §2.3 既定の `{ type: 'STATUS', status: 'ready', detail: 'reconnected' }` を、最終失敗時は `{ type: 'STATUS', status: 'error', detail: 'device_lost' }` をブロードキャスト。UI は接続状態インジケーター（● 接続中 / ○ 未接続 / ⚠ エラー）に即時反映。1 分超で復旧しない場合は UI に「USB 接続を確認してください」を表示。 | ブリッジ + UI |

#### 3.5.3 参考（運用情報）

| #      | シナリオ                       | 想定挙動・対策                                                                                                                                                                                                                                                                                                                         |
| ------ | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **E8** | Windows ファイアウォールの影響 | WebSocket サーバーは `127.0.0.1` バインドのため、Windows ファイアウォール（受信規則）が外部アクセスを遮断していても **localhost 通信には影響なし**。受信規則の例外追加は不要。社内 Endpoint Protection 製品（Symantec / Windows Defender / ESET 等）が `ws://localhost` を遮断するケースは現時点で想定なし、観測されたら都度対応する。 |

#### 3.5.4 §8 ステップ 0 への反映

E3 に伴い、§8「ステップ 0」（DLL API 形式の事前確認）に**権限要件確認**を追加する。詳細は §8 を参照。

---

## 4. 類似箇所の横展開

### 4.1 既存コードベース全体スキャン結果

QR スキャン（`QRScanner` コンポーネント使用）の使用箇所:

| ファイル                                                    | 役割                                | RFID 対応                                    | ラベル汎用化                                                                                  |
| ----------------------------------------------------------- | ----------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `app/triage/scan/page.tsx`                                  | 新規タグ登録時のコード/タグスキャン | **対応する**（`handleQRScanSuccess` を統合） | セクション見出し「コードスキャン」「タグスキャン」を新設（§1.3.1）                            |
| `app/(dashboard)/transport-team/TransportTeamDashboard.tsx` | 搬送中タグのスキャン → 患者詳細表示 | **対応する**（`handleQRScan` を統合）        | ヘッダーボタン・モーダルタイトル・タブ構成・aria-label・キャプションを更新（§1.3.2 / §1.3.8） |

`tag_number` 表示箇所（短縮対象）:

| ファイル:行                               | 表示形態                                                    | 適用                             |
| ----------------------------------------- | ----------------------------------------------------------- | -------------------------------- |
| `components/PatientPanelCard.tsx:142`     | カード上部のタグ番号バッジ                                  | `formatTagNumberForDisplay` 適用 |
| `components/PatientListItem.tsx:32`       | リスト行のタグ番号                                          | 適用                             |
| `components/PatientDetailModal.tsx:152`   | モーダルヘッダー（**表示時のみ**短縮、編集 input は無変更） | 適用                             |
| `components/TransportAssignButton.tsx:75` | 確認ダイアログ「患者: {tag_number}」                        | 適用                             |
| `components/MapModal.tsx:74`              | マップピンの tagNumber プロパティ                           | 適用                             |

その他、`tag_number` を扱うが表示しないコード（フィルタ・検索・URL）:

- `app/(dashboard)/transport-team/TransportTeamDashboard.tsx:214` の `or('tag_number.eq...')` クエリ → 影響なし（フル値で検索）

### 4.2 同種の問題・重複実装の調査結果

調査範囲: `app/`, `components/`, `lib/` の TS/TSX 全体

| 観点                            | 結果                                                                                                                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 他のスキャナーコンポーネント    | `QRScanner.tsx` 以外なし。`RFIDReader.tsx` を**新規**として同列に追加                                                                                                                              |
| 手入力フォームの重複            | `/triage/scan` のみ。`/transport-team` には手入力 state はあるがフォームは QR モーダル内のみ                                                                                                       |
| タグ番号の正規化ロジック        | `handleQRScanSuccess`（`app/triage/scan/page.tsx:187-225`）が唯一。RFID UID は既存正規化のいずれにもマッチせず、最後の「そのまま使用」ロジックで処理される。**コード変更不要**                     |
| `tag_number` の文字数想定箇所   | UI バッジ（`PatientPanelCard.tsx`, `PatientListItem.tsx`）は `rounded-lg px-3 py-1` 等で表示。UID 24 文字をそのまま入れるとレイアウト崩れの可能性 → `formatTagNumberForDisplay` で短縮するため解消 |
| ローカルサーバー / ブリッジ実装 | TTS 内に既存なし。**新規**                                                                                                                                                                         |
| Windows ネイティブ統合          | TTS 内に既存なし。**新規**                                                                                                                                                                         |
| 機能フラグ運用                  | 既存に `NEXT_PUBLIC_ENVIRONMENT` あり。同じパターンで `NEXT_PUBLIC_RFID_ENABLED` を `lib/env.ts` に追加                                                                                            |

該当なし: バッチ処理・Edge Function・API Route での `tag_number` 操作。

### 4.3 横展開の結論

- `QRScanner` の使用箇所 **2 ファイル**に `RFIDReader` を並置（`/triage/scan`, `/transport-team`）
- `tag_number` 表示箇所 **5 ファイル**に `formatTagNumberForDisplay` を適用（短縮ルールは §2.6）
- UI ラベル汎用化（§1.3.8）の適用ファイル **2 ファイル**（`/triage/scan`, `/transport-team`）。`/command`, `/transport`, `/hospital` はスキャン UI を持たないためラベル変更対象外（リスト表示の短縮のみ）
- それ以外の領域（フィルタ・検索・DB・API）は変更不要

---

## 5. ロールバック設計

### 5.1 既存仕組みへの適合

本機能追加は CLAUDE.md の「機能追加時の原状復帰担保」に厳密に従う:

| 不変ルール               | 本機能での適合                                                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub squash-merge only | リポジトリ設定済（`da2777a` PR #30 で永続化。リポジトリ `yasu-dev/tts-v1` で `squash:true / merge:false / rebase:false` を 2026-05-13 に `gh api` で実機検証済） |
| DB 変更は forward-only   | `tag_source` 追加のみ（NULL 許容、CHECK 制約、CREATE INDEX）。`DROP`/`SET NOT NULL`/`TRUNCATE`/`DELETE` は一切なし                                               |
| 既存環境変数は不変       | 追加のみ（`NEXT_PUBLIC_RFID_ENABLED`, `NEXT_PUBLIC_RFID_BRIDGE_URL`）。既存変数は無変更                                                                          |

### 5.2 ロールバック手順

異常検知時:

```bash
bash scripts/rollback.sh <feat-rfid-merge-sha>
```

内部処理:

1. `git checkout main`
2. `git pull --ff-only origin main`
3. `git revert --no-edit <sha>`（squash-merge のため単一親 revert で確実）
4. `git push origin main` → Netlify が main HEAD（revert commit）を自動再ビルド（1〜3 分）

revert 後の状態:

- Web フロントから RFID UI が完全消失
- 既存 QR / 手入力は無影響で動作継続
- DB の `tag_source` カラムは残存（forward-only 原則）。過去に保存された `'rfid'` 値も残るが、SELECT 結果に影響なし
- ブリッジサービスは PC 上で動き続けるが、Web 側に接続先がないため待機状態（手動で `npm stop` で停止可能）

### 5.3 安全策の多層化

| レイヤ                                                 | 即時性                                      | 効果                                                                                               |
| ------------------------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **機能フラグ OFF**（`NEXT_PUBLIC_RFID_ENABLED=false`） | **数分**（Netlify 環境変数変更 + 再ビルド） | UI 上の RFID 機能のみ無効化。コードは残るが完全に非表示。最も低リスクな緊急停止策                  |
| **`git revert` + 再デプロイ**                          | 1〜3 分                                     | コード自体を main から除去。Netlify 自動追従                                                       |
| **anchor タグへの直接 reset**（最終手段、未使用想定）  | 1〜3 分                                     | `release/2026-05-13-pre-feat-rfid-reader` への `git reset --hard` + force push。**通常は使わない** |

### 5.4 anchor タグ運用

実装着手前に main に anchor タグを打つ:

```bash
git tag release/2026-05-13-pre-feat-rfid-reader main
git push origin release/2026-05-13-pre-feat-rfid-reader
```

CLAUDE.md の現アンカー（`release/2026-05-13-pre-feat` → `bc52c22`）と同様の運用。

---

## 6. ブランチ戦略

| 項目          | 内容                                                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| ブランチ名    | `feat/rfid-tag-reader`                                                                                                                              |
| 切り出し元    | `main`（現在 `e1cad69`）                                                                                                                            |
| マージ方式    | squash-merge（リポジトリ設定で強制）                                                                                                                |
| PR タイトル例 | `feat: RFID タグリーダー（FUJITSU TFU-RW811A）統合`                                                                                                 |
| anchor タグ   | `release/2026-05-13-pre-feat-rfid-reader` を実装着手前に main に打つ                                                                                |
| CI 通過要件   | `sql-guard.yml`（forward-only 強制）、CodeQL、`next lint`、`tsc --noEmit`、`prettier --check`、`next build`、`jest`、`playwright`（既存ケースのみ） |

---

## 7. 完了条件チェック

- [x] 変更対象のファイル・関数がすべて特定されている（新規 14 / 変更 9 ファイル）
- [x] 各変更の方針が明記されている（§2.2 表）
- [x] DB 変更がある場合、マイグレーション方針が記載されている（§2.2 / §3.2）
- [x] 影響を受ける既存機能が列挙されている（§3.1）
- [x] テスト観点が記載されている（§3.4）
- [x] 検証手段が、設計の正しさを判定できる粒度で定義されている（§2.5 V1〜V16）
- [x] 未確定事項・判断保留がゼロ（インタビュー §0 で全分岐確定）

---

## 8. 実装フェーズ B に進む条件

本書を人間が確認・承認するまで実装に進まない。承認後の実装順序（フェーズ B 着手時に詳細化）:

**ステップ 0（着手前必須・前提解消）**: 以下 2 点を確定する。本ステップ未了のままステップ 1 以降へ進まない（決め打ちはフェーズ B 大規模手戻りリスク）。

1. **DLL API 形式の確定**: `C:\Fujitsu Frontech\RFID\CounterSensorSlim64\RfReaderTest.exe` の実行と、付属ドライバインストール手順書（写真の 1.2 版、2024/08/21）参照で、`FjRfrwCommVO.dll` / `RFRWUMPHID_Drv.dll` のエクスポート形式（C ABI / COM Automation / .NET）を確定。この結果に応じて FFI ライブラリを `koffi`（C ABI）/ `winax`（COM Automation）/ `edge-js`（.NET ブリッジ）等から選定する。
2. **DLL 呼出の権限要件確定**（§3.5 E3 連動）: `RfReaderTest.exe` を**標準ユーザー権限と管理者権限の両方**で起動し、デバイス認識と読み取りが成功するか比較する。
   - 標準ユーザーで動作 → `node-windows` サービスを現ログインユーザーで稼働可能
   - 管理者必須 → サービス実行アカウントを `LocalSystem` または特定の管理者アカウントに設定する必要あり
   - 判定結果を `services/rfid-bridge/install-service.js` のアカウント指定に反映する

3. anchor タグ作成（`release/2026-05-13-pre-feat-rfid-reader`）
4. ブランチ作成（`feat/rfid-tag-reader`）
5. `lib/utils/tag-display.ts` + 仕様テスト先行（V1〜V4b、§2.6 ルール準拠）
6. `lib/types/rfid.ts` + WebSocket コントラクトテスト先行
7. DB マイグレーション（`tag_source` カラム追加）
8. `lib/hooks/useRFIDBridge.ts` + Hook テスト
9. `components/RFIDReader.tsx` + コンポーネントテスト
10. ブリッジサービス実装（`services/rfid-bridge/`）
11. `/triage/scan` 統合（セクション見出し追加、§1.3.1）
12. `/transport-team` 統合（ラベル汎用化 + 3 モードトグルモーダル、§1.3.2 / §1.3.8）
13. 表示短縮の 5 ファイル適用 + tooltip 付与（§1.3.3〜§1.3.7）
14. 機能フラグ・環境変数追加
15. ローカル実機検証（V7〜V14, V16）
16. ロールバック動作確認（V15）
17. PR 作成 → CI 通過確認 → 承認待ち

---

**設計書バージョン**: 1.0
**作成日**: 2026-05-13
