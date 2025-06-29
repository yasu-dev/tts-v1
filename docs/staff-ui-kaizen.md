アプリケーションの現在の状況を確認し、スタッフUIをセラーUIに合わせて修正する項目をリストアップします。まず、現在のスタッフページとセラーページの構造を調査します。
Search files...
Search files...
Ran tool
Read file: app/staff/dashboard/page.tsx
続いて、セラーページの実装を詳しく確認します。
Read file: app/dashboard/page.tsx
Read file: app/sales/page.tsx
Read file: app/inventory/page.tsx
Read file: app/components/layouts/DashboardLayout.tsx
続いて、CSSファイルを確認して、Phase 3のスタイルシステムを理解します。
Ran tool
Ran tool
Ran tool
Read file: app/globals.css
現在の状況を分析した結果、スタッフUIをセラーUIに合わせて修正すべき項目を以下にリストアップします：

## スタッフUIをセラーUIに統一するための修正項目リスト

### 1. レイアウトコンポーネントの統一
**対象ファイル**: `app/staff/*/page.tsx` (全スタッフページ)
- **修正内容**: `DashboardLayout` コンポーネントの import を `'../../components/DashboardLayout'` から `'../components/layouts/DashboardLayout'` に変更
- **理由**: セラーページは新しい `layouts/DashboardLayout` を使用しているが、スタッフページは古い `DashboardLayout` を使用している

### 2. Phase 3 デザインシステムの適用
**対象ファイル**: 
- `app/staff/dashboard/page.tsx`
- `app/staff/tasks/page.tsx`
- `app/staff/inventory/page.tsx`
- `app/staff/inspection/page.tsx`
- `app/staff/location/page.tsx`
- `app/staff/shipping/page.tsx`
- `app/staff/returns/page.tsx`
- `app/staff/reports/page.tsx`

**修正内容**:
- ページヘッダーを `intelligence-card` スタイルに変更
- 統計カードを `intelligence-metrics` + `intelligence-card` スタイルに変更
- テーブルを `holo-table` スタイルに変更
- ボタンを `nexus-button` スタイルに変更
- 地域テーマクラス（`americas`, `europe`, `asia`, `africa`, `global`）の適用

### 3. 統計表示の統一
**対象ファイル**: `app/staff/dashboard/page.tsx`
**修正内容**:
- 現在の基本的な統計カード表示を、セラーページと同様の `intelligence-card` + `action-orb` + `status-badge` スタイルに変更
- メトリクス表示に `metric-value`, `metric-label` クラスを適用

### 4. テーブルスタイルの統一
**対象ファイル**: 全スタッフページのテーブル表示部分
**修正内容**:
- 現在の基本的なテーブルスタイルを `holo-table`, `holo-header`, `holo-body`, `holo-row` クラスを使用したスタイルに変更
- 認証バッジを `cert-nano` クラスで表示
- ステータス表示を `status-orb` + `status-badge` の組み合わせに変更

### 5. ボタンスタイルの統一
**対象ファイル**: 全スタッフページ
**修正内容**:
- 現在の `button-primary` や基本的なボタンスタイルを `nexus-button` および `nexus-button primary` に変更
- アイコン付きボタンの統一

### 6. 色彩・地域テーマの適用
**対象ファイル**: 全スタッフページ
**修正内容**:
- 各ページに適切な地域テーマクラスを適用：
  - スタッフダッシュボード: `global`
  - 緊急タスク: `americas` 
  - 在庫管理: `europe`
  - 検品・撮影: `asia`
  - ロケーション管理: `africa`
  - 出荷管理: `oceania`
  - 返品処理: `africa`
  - 業務レポート: `global`

### 7. アイコンとビジュアル要素の統一
**対象ファイル**: 全スタッフページ
**修正内容**:
- `action-orb` コンポーネントの追加
- SVGアイコンのスタイル統一
- `font-display` フォントクラスの適用

### 8. レスポンシブ対応の統一
**対象ファイル**: 全スタッフページ
**修正内容**:
- `intelligence-metrics` グリッドレイアウトの適用
- モバイル対応の統一

### 9. データ表示形式の統一
**対象ファイル**: 全スタッフページ
**修正内容**:
- 数値表示に `font-display` クラスの適用
- 通貨表示形式の統一（`¥{value.toLocaleString()}` 形式）
- 日付表示形式の統一

### 10. インタラクション要素の統一
**対象ファイル**: 全スタッフページ
**修正内容**:
- ホバー効果の統一
- トランジション効果の統一
- フォーカス状態の統一

これらの修正により、スタッフUIがセラーUIと同じPhase 3デザインシステムに統一され、一貫したユーザーエクスペリエンスを提供できるようになります。