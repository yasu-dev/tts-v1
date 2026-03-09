# fix: DMATダッシュボードのトリアージフィルター不具合修正

## 1. 修正内容の詳細化

### 問題の概要

DMATダッシュボード（`/transport`）の上部トリアージ数字パネル（総数/黒/赤/黄/緑）をクリックしても、傷病者リストがフィルタリングされない。他の3ダッシュボード（指揮本部・医療機関・搬送部隊）ではフィルターが正常に機能する。

### 根本原因

`TransportDashboard.tsx` のトリアージパネルが `<div>` で実装されており、以下の3点が完全に欠落している：

1. **`filter` ステート変数**が未定義
2. **`onClick` ハンドラ**が未設定（`<div>` に `onClick` なし）
3. **フィルタリングロジック**（`filteredTags` 変数）が未実装

加えて、傷病者リストが `initialTags`（サーバーコンポーネントから渡されたprop）を直接参照しており、`tags`（Realtimeで更新されるステート）を使用していない副次的バグもある。

### 修正前後の振る舞いの差分

| 項目                     | Before（現状）            | After（修正後）                              |
| ------------------------ | ------------------------- | -------------------------------------------- |
| パネル要素               | `<div>`                   | `<button>`                                   |
| パネルクリック           | 何も起きない              | フィルターが適用される                       |
| ホバー時の視覚           | 変化なし                  | `scale-105` + `shadow-xl`                    |
| 選択中の視覚             | 表示なし                  | `ring-4 ring-blue-500`（テーマカラー）       |
| カーソル                 | デフォルト                | `cursor-pointer`                             |
| 傷病者一覧のデータソース | `initialTags`（prop固定） | `filteredTags`（ステートからフィルター済み） |
| 一覧件数表示             | 常に全件数                | フィルター後の件数                           |
| ページネーション         | 全件に対して計算          | フィルター後の件数に対して計算               |
| フィルター変更時         | —                         | ページを1に戻す                              |

### UI Before/After

**Before:**

```
[総数: 5] [黒: 0] [赤: 3] [黄: 2] [緑: 0]  ← すべて <div>、クリック不可
                                                 選択表示なし

傷病者一覧（5件）  ← 常に全件
  患者A (赤)
  患者B (赤)
  ...
```

**After:**

```
[総数: 5] [黒: 0] [赤: 3] [黄: 2] [緑: 0]  ← すべて <button>、クリック可能
 ^^^^^^^^                                      「総数」が選択中 → ring-4 表示
 選択中

傷病者一覧（5件）  ← フィルター後の件数

--- 「赤」パネルをクリック後 ---

[総数: 5] [黒: 0] [赤: 3] [黄: 2] [緑: 0]
                    ^^^^^^
                    選択中（ring-4 ring-red-700）

傷病者一覧（3件）  ← 赤タグのみ表示
  患者A (赤)
  患者B (赤)
  患者C (赤)
```

## 2. 実現手段

### 修正対象ファイル

**1ファイルのみ:** `app/(dashboard)/transport/TransportDashboard.tsx`

### 変更方針

#### A. `filter` ステート変数の追加（行22付近）

```typescript
const [filter, setFilter] = useState<'all' | 'black' | 'red' | 'yellow' | 'green'>('all');
```

他の3ダッシュボードと同一の型・初期値。

#### B. 統計計算の追加（行194付近、ページネーション計算の前）

```typescript
const stats = {
  total: tags.length,
  black: tags.filter((t) => t.triage_category?.final === 'black').length,
  red: tags.filter((t) => t.triage_category?.final === 'red').length,
  yellow: tags.filter((t) => t.triage_category?.final === 'yellow').length,
  green: tags.filter((t) => t.triage_category?.final === 'green').length,
};
```

#### C. `filteredTags` の導入（stats の直後）

```typescript
const filteredTags =
  filter === 'all' ? tags : tags.filter((t) => t.triage_category?.final === filter);
```

HospitalDashboard と同等のシンプルなカテゴリフィルターのみ（DMATダッシュボードにはステータスフィルターや搬送部隊フィルターは不要）。

#### D. ページネーション計算を `filteredTags` ベースに変更（行195-197）

```typescript
// Before
const totalPages = Math.ceil(initialTags.length / ITEMS_PER_PAGE);
const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
const currentPageTags = initialTags.slice(startIndex, startIndex + ITEMS_PER_PAGE);

// After
const totalPages = Math.ceil(filteredTags.length / ITEMS_PER_PAGE);
const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
const currentPageTags = filteredTags.slice(startIndex, startIndex + ITEMS_PER_PAGE);
```

#### E. フィルター変更時にページを1に戻す処理

`setFilter` を直接呼ぶ代わりに、ページリセットを含むハンドラを使用：

```typescript
const handleFilterChange = (newFilter: typeof filter) => {
  setFilter(newFilter);
  setCurrentPage(1);
};
```

#### F. 統計パネルを `<button>` に変更（行452-472）

`<div>` → `<button>` に変更し、以下を追加：

- `onClick={() => handleFilterChange('all')}` 等
- `cursor-pointer`
- `transition-all duration-200`
- `hover:scale-105 hover:shadow-xl`
- 選択時: `ring-4 ring-blue-500`（総数パネル）、各カテゴリパネルは対応するリングカラー

他の3ダッシュボードと同一のスタイルパターンを適用。DMATのテーマカラー（`bg-blue-600`）に合わせて総数パネルのリングは `ring-blue-500` とする。

#### G. 傷病者一覧の件数表示を `filteredTags` ベースに変更（行516）

```typescript
// Before
<h2>傷病者一覧（{initialTags.length}件）</h2>

// After
<h2>傷病者一覧（{filteredTags.length}件）</h2>
```

#### H. 空リスト表示を `filteredTags` ベースに変更（行520）

```typescript
// Before
{initialTags.length === 0 ? (

// After
{filteredTags.length === 0 ? (
```

空メッセージも、フィルター適用中はフィルター固有のメッセージを表示する（HospitalDashboard 行523-525 のパターンを踏襲）。

### 新規ファイル

なし。

## 3. 影響範囲の分析

### 既存機能への影響

| 機能                                                | 影響     | 詳細                                                                                                                                               |
| --------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| DMATダッシュボードの搬送ワークフロー（ステップ1-4） | 軽微     | ステップ1（患者選択）の表示がフィルター後リストに基づくようになる。ステップ2-4は `selectedTag` ベースなので影響なし                                |
| Realtime更新                                        | 改善     | `tags` ステートから `filteredTags` を導出するため、Realtime更新が正しくリストに反映される（現状は `initialTags` 固定で反映されない副次的バグあり） |
| ページネーション                                    | 改善     | フィルター後のデータに対してページ計算されるようになる。フィルター変更時にページ1に戻るため不整合が起きない                                        |
| QRスキャン→患者選択フロー                           | 影響なし | QRスキャン結果は `setSelectedTagDetail` でモーダル表示するため、リストフィルターとは独立                                                           |
| 指揮本部ダッシュボード                              | 影響なし | 別ファイル                                                                                                                                         |
| 医療機関ダッシュボード                              | 影響なし | 別ファイル                                                                                                                                         |
| 搬送部隊ダッシュボード                              | 影響なし | 別ファイル                                                                                                                                         |

### API・DB・外部連携への影響

- **DB**: 変更なし。クライアントサイドのフィルタリングのみ
- **API**: 変更なし。サーバーコンポーネントのクエリ（赤・黄のみ取得）は変更しない
- **Supabase Realtime**: 変更なし。既存の購読ロジックはそのまま

### 非機能への影響

- **性能**: `tags.filter()` の追加コスト。DMAT対象データは赤・黄のみのため件数は限定的。問題なし
- **メモリ**: 無視できるレベル
- **セキュリティ**: 影響なし
- **ログ**: 影響なし

### テスト観点

| #   | テスト観点                | 確認内容                                                           |
| --- | ------------------------- | ------------------------------------------------------------------ |
| 1   | 初期表示                  | 「総数」パネルが選択状態（ring表示）で全件表示される               |
| 2   | 赤パネルクリック          | 赤タグのみ表示、件数が正しい、パネルにring表示                     |
| 3   | 黄パネルクリック          | 黄タグのみ表示、件数が正しい                                       |
| 4   | 黒/緑パネルクリック       | 0件メッセージが表示される（サーバー側で赤・黄のみ取得のため）      |
| 5   | 総数パネルで復帰          | 全件表示に戻る                                                     |
| 6   | フィルター→ページリセット | フィルター変更時にページ1に戻る                                    |
| 7   | ページネーション          | フィルター後の件数に基づくページ計算が正しい                       |
| 8   | Realtime更新              | フィルター中に新規患者が追加された場合、対象カテゴリなら表示される |
| 9   | 搬送ワークフロー          | フィルター適用中に患者を選択→ステップ2以降が正常に進む             |
| 10  | ビルド                    | `npm run build` が成功する                                         |
| 11  | 型チェック                | `npx tsc --noEmit` が成功する                                      |
| 12  | Lint                      | `npm run lint` が成功する                                          |

## 4. 類似箇所の横展開

### コードベース全体の確認結果

他の3ダッシュボードのフィルター実装を確認済み：

| ダッシュボード             | フィルター実装状態                               | 問題             |
| -------------------------- | ------------------------------------------------ | ---------------- |
| CommandDashboard.tsx       | `<button>` + `filter` state + `filteredTags`     | **問題なし**     |
| HospitalDashboard.tsx      | `<button>` + `filter` state + `filteredPatients` | **問題なし**     |
| TransportTeamDashboard.tsx | `<button>` + `filter` state + `filteredPatients` | **問題なし**     |
| **TransportDashboard.tsx** | **`<div>` のみ、filter未実装**                   | **今回修正対象** |

DMATダッシュボードのみが実装漏れであり、他に同種の問題は存在しない。

### 副次的バグ（併せて修正）

`TransportDashboard.tsx` の傷病者リスト表示が `initialTags`（props）を直接参照しているため、Realtime更新（`setTags`）がリストに反映されない問題がある。今回 `filteredTags`（`tags` ステートから導出）に変更することで、この副次的バグも同時に解消される。
