# MVP版の制限事項と今後の実装予定

このドキュメントでは、現在のMVP（Minimum Viable Product）版における制限事項と、本番環境で実装が必要な機能について説明します。

## 目次
- [1. 決済機能](#1-決済機能)
- [2. カート機能](#2-カート機能)
- [3. 画像管理](#3-画像管理)
- [4. 送料計算](#4-送料計算)
- [5. メール通知](#5-メール通知)
- [6. 在庫管理](#6-在庫管理)
- [7. 管理サイト連携](#7-管理サイト連携)

---

## 1. 決済機能

### 現状（MVP版）

#### 購入フローは2種類存在

**1. カート経由の購入フロー（推奨）**
- カートに追加 → チェックアウト → 配送先入力 → 決済確認 → 注文完了
- `/checkout/pay/page.tsx` でデモ決済を実施
- 実際の決済処理は行われない
- LocalStorageからカート情報を読み取り
- 注文データはDBに保存されない（デモのみ）
- 在庫チェック・在庫減算なし

**2. 商品詳細ページからの直接購入フロー**
- 商品ページの「購入する」ボタンをクリック
- `/api/orders/create` APIを直接呼び出し
- 配送先情報は `buyer_profiles.default_shipping` から取得（DB CRUD操作）
- 注文ステータスが即座に `'paid'` に設定される（デモ決済のため）
- 在庫チェック実装済み（`api/orders/create/route.ts:40-45`）
- 在庫減算処理実装済み（`api/orders/create/route.ts:119-123`）
- 注文データは `orders` テーブルに保存される

### 本番環境での実装予定
- **Stripe決済の統合**
  - Payment Intents APIを使用した安全な決済処理
  - クレジットカード、デビットカード対応
  - 3Dセキュア対応
- **Webhookの実装**
  - `payment_intent.succeeded`イベントで注文ステータス更新
  - 既存のWebhookエンドポイント（`/api/stripe/webhook/route.ts`）の有効化
- **エラーハンドリング**
  - 決済失敗時のリトライ処理
  - ユーザーへの適切なエラーメッセージ表示
- **セキュリティ**
  - カード情報の非保持（PCI DSS準拠）
  - Stripe Elements使用

**実装ファイル**:
- `consumer-site/app/checkout/pay/page.tsx` - カート経由のデモ決済実装済み
- `consumer-site/app/product/[id]/ProductPurchaseForm.tsx` - 直接購入フォーム
- `consumer-site/app/api/orders/create/route.ts` - 直接購入API（デモ配送先使用）
- `consumer-site/app/api/stripe/webhook/route.ts` - Webhook受信準備済み

**必要な作業**:
1. Stripeアカウントの取得と契約
2. API キーの設定（環境変数）
3. Payment Intentの作成処理実装
4. Stripe Checkout または Elements UIの統合
5. Webhook署名検証の有効化
6. 本番環境でのテスト

---

## 2. カート機能

### 現状（MVP版）
- **LocalStorage ベースの実装**
- ブラウザのローカルストレージにカートデータを保存
- デバイス間の同期なし
- ブラウザキャッシュをクリアすると消失

### 本番環境での実装予定
- **データベース連携**
  - `carts` テーブルの作成（buyer_id, product_id, sku_id, quantity）
  - ログインユーザーのカートをDBに永続化
  - デバイス間でのカート同期
- **ゲストカート対応**
  - 未ログインユーザー: LocalStorage使用（現在と同じ）
  - ログイン時: LocalStorageのカートをDBにマージ
- **在庫チェック**
  - カート追加時の在庫確認
  - チェックアウト時の最終在庫確認

**実装ファイル**:
- `consumer-site/app/cart/page.tsx` - LocalStorage実装済み
- `consumer-site/app/product/[id]/ProductPurchaseForm.tsx` - カート追加処理

**必要な作業**:
1. `carts` テーブルのマイグレーション作成
2. カートCRUD APIの実装
3. LocalStorageとDBの同期ロジック
4. 在庫チェックの統合

---

## 3. 画像管理

### 現状（MVP版）
- **Supabase Storage 対応済み**
- `products.image_urls` フィールド（text[]型）にURL配列を保存
- 画像がない場合は絵文字プレースホルダー（🥬）を表示
- 画像表示ロジック実装済み

### 本番環境での実装予定
- **画像アップロード機能**（管理サイトまたは販売者サイト）
  - Supabase Storageへの画像アップロード
  - 画像リサイズ・最適化（Edge Functions使用）
  - サムネイル生成
- **複数画像対応**
  - 商品詳細ページでの画像ギャラリー
  - スライダー/カルーセル実装
- **画像バリデーション**
  - ファイルサイズ制限（例: 5MB以下）
  - 画像形式制限（JPEG, PNG, WebP）

**実装ファイル**:
- `consumer-site/app/page.tsx` - 画像表示実装済み
- `consumer-site/app/product/[id]/page.tsx` - 画像表示実装済み
- `consumer-site/app/search/page.tsx` - 画像表示実装済み

**必要な作業**:
1. 管理サイトまたは販売者サイトでの画像アップロードUI実装
2. Supabase Storage バケットの設定とポリシー
3. 画像最適化のEdge Function実装
4. 商品詳細ページの画像ギャラリー実装

---

## 4. 送料計算

### 現状（MVP版）
- **固定送料: デフォルト800円**
- すべての注文に一律で適用
- `system_settings` テーブルから `default_shipping_fee` を取得（DB CRUD操作）
- 管理画面がないため、送料変更は直接DB操作が必要

**実装済みファイル**:
- `consumer-site/lib/settings.ts` - システム設定取得（ビジネスロジック層）
- `consumer-site/app/api/settings/route.ts` - クライアント用API
- `consumer-site/app/api/orders/create/route.ts` - 注文作成時に送料取得
- `consumer-site/app/cart/page.tsx` - `/api/settings` から送料取得
- `consumer-site/app/checkout/pay/page.tsx` - `/api/settings` から送料取得
- `consumer-site/app/product/[id]/ProductPurchaseForm.tsx` - `/api/settings` から送料取得

### 本番環境での実装予定
- **動的送料計算**
  - 配送先都道府県に基づく送料設定
  - 商品重量に基づく送料計算
  - 販売者ごとの送料設定
  - 複数商品購入時の送料まとめ計算
- **管理サイトでの送料設定**
  - `system_settings` テーブルの `default_shipping_fee` をGUIで変更可能
- **送料無料キャンペーン**
  - 一定金額以上購入で送料無料
  - 期間限定キャンペーン対応

**必要な作業**:
1. 送料計算ロジックの実装（都道府県別・重量別）
2. 送料マスタテーブルの作成
3. 管理サイトでの送料設定UI実装
4. チェックアウトフローでの動的送料計算統合

---

## 5. メール通知

### 現状（MVP版）
- **カスタムメール通知は未実装**
- Supabase Authの認証メール（確認メール、パスワードリセット）は標準機能として動作
- 注文確認メール、発送通知メールなどのカスタム通知は未実装
- 注文完了ページには注文確認の表示のみ（メール送信なし）

### 本番環境での実装予定
- **メール配信サービスの統合**
  - 推奨: SendGrid, Resend, Amazon SES
  - SMTP設定またはAPI統合
- **通知メールの種類**
  - 注文確認メール（購入者・販売者）
  - 発送通知メール
  - 注文キャンセル通知
  - パスワードリセット（Supabase Auth標準機能）
  - 新着チャットメッセージ通知
- **メールテンプレート**
  - HTML/テキスト両対応
  - 日本語対応
  - ブランドロゴとデザイン統一

**実装ファイル**:
- `consumer-site/app/order/complete/page.tsx` - メール通知の記載あり（未実装）

**必要な作業**:
1. メール配信サービスのアカウント取得と契約
2. API キーの設定
3. メールテンプレートの作成
4. 注文完了時のメール送信処理実装
5. Edge Function または API Route での非同期メール送信

---

## 6. 在庫管理

### 現状（MVP版）

#### 購入フローごとの在庫管理実装状況

**1. カート経由の購入フロー**
- ❌ **在庫チェックなし** - カート追加時、チェックアウト時ともに在庫確認を行わない
- ❌ **在庫減算なし** - デモ決済のため注文データがDBに保存されず、在庫も減らない
- ⚠️ **問題点**: 在庫切れ商品でもカートに追加して決済完了画面まで進める

**2. 商品詳細ページからの直接購入フロー**
- ✅ **在庫チェック実装済み** - 購入時に在庫数を確認（`api/orders/create/route.ts:40-45`）
```typescript
// Check stock
if (sku.stock < quantity) {
  return NextResponse.json(
    { error: 'Insufficient stock' },
    { status: 400 }
  );
}
```
- ✅ **在庫減算実装済み** - 注文確定時に在庫を減らす（`api/orders/create/route.ts:119-123`）
```typescript
// Update SKU stock
const { error: stockError } = await supabase
  .from('product_skus')
  .update({ stock: sku.stock - quantity })
  .eq('id', sku_id);
```
- ✅ 在庫不足時は適切なエラーメッセージを返す
- ⚠️ **制限事項**: トランザクション処理ではないため、同時購入時の競合リスクあり

**共通実装**
- ✅ `product_skus.stock` フィールドに在庫数を保持
- ✅ 商品一覧・詳細ページで在庫数を表示
- ✅ 在庫0の商品は「在庫なし」表示

### 本番環境での実装予定
- **カート購入フローの在庫管理実装**
  - カート追加時の在庫チェック
  - チェックアウト時の最終在庫確認
  - 注文確定時の在庫減算（トランザクション処理）
- **在庫予約機能**
  - カート追加時に一定時間在庫を予約
  - タイムアウト時の自動解放
  - 予約テーブル（`cart_reservations`）の作成
- **トランザクション処理の強化**
  - Database Functionを使用した原子性保証
  - 同時購入時の競合制御（楽観的ロックまたは悲観的ロック）
- **在庫復元機能**
  - 注文キャンセル時の在庫復元
  - 返品時の在庫復元
- **在庫アラート**
  - 販売者への在庫少量アラート
  - 管理者ダッシュボードでの在庫監視
- **リアルタイム在庫表示**
  - Supabase Realtimeで在庫数をリアルタイム更新
  - 在庫切れ商品の即座非表示化

**実装ファイル**:
- `consumer-site/app/api/orders/create/route.ts` - 直接購入の在庫管理実装済み
- `consumer-site/app/product/[id]/ProductPurchaseForm.tsx` - 在庫数表示とクライアント側チェック
- `consumer-site/app/cart/page.tsx` - 在庫管理未実装（カート購入フロー）
- `consumer-site/app/checkout/pay/page.tsx` - 在庫管理未実装（カート購入フロー）

**必要な作業**:
1. カート購入フローの在庫チェック・減算実装
2. 在庫減算のDatabase Function化（トランザクション処理）
3. 在庫予約テーブルの作成と予約ロジック実装
4. 在庫復元機能の実装
5. 在庫アラートの通知機能
6. Supabase Realtimeでの在庫数リアルタイム更新

---

## 7. 管理サイト連携

### 現状（MVP版）
- **管理サイト未実装**
- ECサイト単体で動作
- マスターデータは直接DB操作で管理

### 本番環境での実装予定
- **管理者機能**
  - ユーザー管理（購入者・販売者の閲覧・編集）
  - 注文管理（ステータス変更、キャンセル処理）
  - 商品管理（商品の承認・非承認）
  - レビュー管理（不適切レビューの削除）
  - システム設定（送料、手数料率など）
- **販売者機能**（sellers-site）
  - 商品の登録・編集・削除
  - 注文管理（発送処理）
  - 売上レポート
  - チャット対応
- **振込管理**
  - `payouts` テーブルを使用した売上集計
  - 振込処理のワークフロー
- **お知らせ機能**
  - `announcements` テーブルを使用した通知配信
  - ECサイトでのお知らせ表示

**実装ファイル**:
- `admin-site/` ディレクトリ - 管理サイトのスケルトン
- `sellers-site/` ディレクトリ - 販売者サイトのスケルトン

**必要な作業**:
1. 管理サイトの完全実装
2. 販売者サイトの完全実装
3. 権限管理の強化（RLS ポリシー）
4. API/Server Actions の実装
5. ダッシュボードの実装

---

## まとめ

### MVP版で実装済み
✅ 商品一覧・詳細表示
✅ 商品検索・カテゴリフィルタ
✅ カート機能（LocalStorage）
✅ チェックアウトフロー（配送先入力）
✅ デモ決済（2種類の購入フロー）
✅ 注文完了ページ
✅ プロフィール管理（配送先情報のDB保存）
✅ チャット機能
✅ レビュー機能
✅ 画像表示（DBから取得、プレースホルダー対応）
✅ 認証機能（Supabase Auth）
✅ システム設定のDB管理（送料・手数料率）
✅ 直接購入フローの在庫管理（チェック・減算）

### MVP版で部分実装（制限あり）
⚠️ 在庫管理 - 直接購入のみ実装、カート購入は未実装
⚠️ 送料計算 - DB取得実装済みだが固定値（動的計算は未実装）

### 本番環境で実装が必要
❌ Stripe決済統合
❌ カートのDB永続化
❌ カート購入フローの在庫管理
❌ 画像アップロード機能
❌ 動的送料計算（都道府県別・重量別）
❌ メール通知
❌ 在庫予約機能・トランザクション強化
❌ 管理サイト
❌ 販売者サイト

### 契約・外部サービス連携が必要
- Stripe（決済処理）
- メール配信サービス（SendGrid / Resend / SES）
- 画像最適化サービス（任意）
- ドメイン・SSL証明書（本番公開時）

---

## 参考ドキュメント
- [アーキテクチャ図](./architecture-diagrams.md)
- [ECサイトデモ操作ガイド](./ec-site-demo-guide.md)
- [README](../README.md)
