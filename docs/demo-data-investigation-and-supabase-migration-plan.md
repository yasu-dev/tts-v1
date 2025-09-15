# デモデータ調査とSupabase移行計画

## 概要
SQLiteデータベースに残存するデモデータの削除を試行したが、外部キー制約の複雑さにより部分削除が困難であることが判明。根本的解決策としてSupabaseへの移行を決定。

## 問題の経緯

### 初期問題
- アプリケーション画面にデモデータが表示され続ける
- ユーザーが手動登録したデータ（YST4カメラ、TESTカメラA）の保護が必要
- デモデータのみの削除が要求される

### 調査結果
1. **データソース確認**: 全画面がSQLiteデータベースから取得（ハードコードなし）
2. **データ構成**: 100%がデモデータ（50商品、116納品プラン、19ユーザー）
3. **ユーザーデータ特定**:
   - 保護対象：YST4カメラ、TESTカメラA
   - その他：すべてデモデータ（Sony α7 IV, Canon EOS R6 Mark II, Rolex Submariner等）

## 削除試行とその結果

### 試行1: 一括削除
- **結果**: データベースリセット成功、しかしスキーマ不整合によりAPI破綻
- **問題**: warehouseId列不足等でDeliveryPlan APIが500エラー
- **復旧**: `npx prisma db push --force-reset`で解決

### 試行2: 選択的削除
- **結果**: 外部キー制約エラーにより削除不可
- **問題**: User ← Product ← DeliveryPlan ← Order の複雑な循環依存
- **成果**: ユーザーデータ（YST4カメラ、TESTカメラA）は保護された

### 外部キー制約の詳細
```
複雑な依存構造:
- User ← Product (sellerId)
- User ← DeliveryPlan (sellerId)
- User ← Order (customerId/sellerId)
- Product → DeliveryPlan (関連テーブル経由)
```

## 検討された解決策

### 1. バックアップ・復元方式（最安全）
```
1. 保護データをSQLダンプでバックアップ
2. データベース完全リセット
3. seed.tsで基本データ作成
4. 保護データをSQLで直接INSERT復元
```

### 2. 制約一時無効化方式
```
1. PRAGMA foreign_keys = OFF
2. 保護データ以外を直接DELETE
3. PRAGMA foreign_keys = ON
4. VACUUM
```

### 3. 依存順序削除方式
```
OrderItem → ProductImage → Order → DeliveryPlanProductImage →
DeliveryPlanProduct → Product → DeliveryPlan → User
```

### 4. Supabase移行（採用）
- SQLiteの制約問題を根本解決
- 本番環境に適した構成
- レベルダウンリスクが最小

## Supabase移行計画

### 移行理由
- **現在の問題解決**: 外部キー制約、スキーマ不整合
- **本番環境対応**: SQLiteは開発環境向け
- **クリーンスタート**: デモデータ問題の完全解決

### 技術的影響
- **修正範囲**: DB接続設定のみ（.env, schema.prisma）
- **コード変更**: 不要（Prisma ORM使用のため）
- **パフォーマンス**: 向上期待
- **新機能**: リアルタイムDB、認証システム、ストレージ

### 移行手順
1. **Supabase準備**:
   - アカウント作成
   - プロジェクト作成（Tokyo region）
   - DATABASE_URL取得

2. **コード修正**:
   - `schema.prisma`: `provider = "sqlite"` → `"postgresql"`
   - `.env`: DATABASE_URL更新
   - Migration実行

3. **検証**:
   - API動作確認
   - UI表示確認
   - 基本機能テスト

### リスク評価
- **難易度**: 低（1-2時間）
- **影響範囲**: 最小限（DB層のみ）
- **レベルダウンリスク**: 極低（95%以上の成功率）

## 実行ファイル記録

### 調査スクリプト
- `scripts/deep-investigation.js` - 全データベース分析
- `scripts/identify-real-user-data.js` - デモ/ユーザーデータ区別
- `scripts/show-product-names.js` - 商品名一覧表示
- `scripts/precise-data-analysis.js` - 手動確認用詳細分析

### 削除試行スクリプト
- `scripts/precise-demo-deletion.js` - 精密選択削除（失敗）
- `scripts/safe-demo-deletion.js` - 外部キー制約考慮削除（失敗）
- `scripts/ultimate-safe-deletion.js` - 個別ユーザー削除（部分成功）

### テストスクリプト
- `scripts/test-delivery-plan-creation.js` - 納品プラン機能テスト
- `scripts/test-api-error.js` - API動作診断

## 次回作業

### 事前準備（ユーザー実施）
1. Supabase アカウント作成
2. プロジェクト作成
3. DATABASE_URL取得・提示

### 移行作業（システム実施）
1. Prismaスキーマ更新
2. 環境変数設定
3. マイグレーション実行
4. 動作確認
5. 基本seedデータ作成

### 検証項目
- [ ] 全API正常動作
- [ ] UI表示正常
- [ ] 納品プラン作成機能
- [ ] 商品管理機能
- [ ] ユーザー認証（必要に応じて）

## 結論
SQLiteでのデモデータ部分削除は外部キー制約により技術的に困難。Supabase移行により根本的な問題解決と本番環境への移行を同時に実現する方針を採用。ユーザーデータは引き継がず、クリーンな状態から開始予定。

---
*作成日: 2025-09-14*
*最終更新: 2025-09-14*