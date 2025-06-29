要件定義書と技術スタック一覧を確認して、実装状況を整理します。
Read file: docs/要件定義書.md

Read file: docs/技術スタック一覧.md

Read file: docs/技術スタック一覧.md

Ran tool

Ran tool

Ran tool

Ran tool

Read file: API_IMPLEMENTATION.md

Read file: app/api/auth/login/route.ts

Read file: app/dashboard/page.tsx

Read file: prisma/schema.prisma

要件定義書と技術スタック一覧を基に、現在の実装状況を分析しました。以下、実装済みと未実装の機能をリストアップし、実装しやすい単位で提示します。

## 📊 実装状況分析

### ✅ 実装済み機能

#### 1. **基盤システム**
- ✓ Next.js 14 App Router構成
- ✓ TypeScript設定
- ✓ Tailwind CSS統合
- ✓ Prismaデータベーススキーマ（PostgreSQL）
- ✓ 認証システム（JWT + HTTP-only Cookie）

#### 2. **APIエンドポイント**
- ✓ 認証API（/api/auth/login, logout, session）
- ✓ 在庫管理API（/api/inventory）
- ✓ 商品検品API（/api/products/inspection）
- ✓ ロケーション管理API（/api/locations）
- ✓ 在庫移動API（/api/inventory/movement）
- ✓ 注文管理API（/api/orders）
- ✓ 出荷API（/api/orders/shipping）
- ✓ 返品API（/api/orders/returns）

#### 3. **UIコンポーネント**
- ✓ ダッシュボードレイアウト
- ✓ サイドバーナビゲーション  
- ✓ 各種モーダル（商品詳細、タスク詳細、編集、QRコード）
- ✓ バーコードスキャナー基本実装
- ✓ 通知パネル
- ✓ 検索モーダル

#### 4. **ページ実装**
- ✓ ログインページ
- ✓ セラーダッシュボード
- ✓ スタッフダッシュボード各種ページ

### ❌ 未実装機能

## 🔧 実装優先順位（実装しやすい順）

### 📌 フェーズ1: データ連携とリアルタイム機能（1-2日）

#### 1. **API実装の完全化**
```typescript
// 実装内容: 各APIのGETメソッドで実際のデータベースから取得
// 場所: app/api/inventory/route.ts など

- 静的データ返却を実際のPrismaクエリに変更
- ページネーション実装
- フィルタリング実装
- エラーハンドリング強化
```

#### 2. **リアルタイム在庫状況表示**
```typescript
// 実装内容: 商品ステータスごとの在庫数をリアルタイム表示
// 場所: app/dashboard/page.tsx, app/components/features/InventorySummary.tsx

- ステータス別在庫数の集計API作成
- ダッシュボードへの統合
- 自動更新機能（SWR or React Query）
```

### 📌 フェーズ2: 商品フロー可視化機能（2-3日）

#### 3. **商品履歴タイムライン表示**
```typescript
// 実装内容: 商品の全履歴を時系列で表示
// 場所: app/components/features/ProductTimeline.tsx

- vis.jsを使用したタイムライン実装
- 商品履歴API作成（/api/products/[id]/history）
- ステータス変更時の自動記録
```

#### 4. **フローナビゲーションバー**
```typescript
// 実装内容: 全画面共通のフロー進捗表示
// 場所: app/components/features/flow-nav/FlowNavigationBar.tsx を拡張

- 現在のステータスハイライト
- クリックで該当ステータスの商品一覧表示
- アニメーション追加
```

### 📌 フェーズ3: バーコード・画像管理（2日）

#### 5. **バーコードPDF生成機能**
```typescript
// 実装内容: 納品プラン確定後のバーコードPDF生成
// 場所: app/api/products/barcode/route.ts

- pdfmakeを使用したPDF生成
- A4サイズに6枚配置レイアウト
- 切り取り線付きデザイン
```

#### 6. **商品画像アップロード機能**
```typescript
// 実装内容: 検品時の画像アップロード（最低6枚）
// 場所: app/components/features/ImageUploader.tsx

- react-dropzoneを使用
- AWS S3へのアップロード
- サムネイル自動生成
- 画像プレビュー機能
```

### 📌 フェーズ4: 高度な管理機能（3-4日）

#### 7. **ロケーション管理強化**
```typescript
// 実装内容: バーコードスキャンによる棚番登録
// 場所: app/staff/location/page.tsx を拡張

- 商品バーコードスキャン → 棚番バーコードスキャン
- 自動登録処理
- 棚別在庫一覧表示
```

#### 8. **eBay出品機能**
```typescript
// 実装内容: eBayへの自動出品
// 場所: app/api/ebay/listing/route.ts

- ebay-node-api統合
- テンプレート選択機能
- 商品説明自動生成
- プレビュー機能
```

### 📌 フェーズ5: レポート・分析機能（2-3日）

#### 9. **KPIダッシュボード実装**
```typescript
// 実装内容: Chart.jsを使用したグラフ表示
// 場所: app/components/features/kpi/KPIDashboard.tsx

- 在庫回転率グラフ
- カテゴリー別売上分析
- 滞留在庫アラート
- CSVエクスポート機能
```

#### 10. **月次レポート生成**
```typescript
// 実装内容: 月次パフォーマンスレポート
// 場所: app/reports/monthly/page.tsx

- 売上・在庫・返品率の統計
- PDF形式でのレポート生成
- メール送信機能
```

### 📌 フェーズ6: 通知・アラート機能（1-2日）

#### 11. **リアルタイム通知システム**
```typescript
// 実装内容: 重要イベントの即時通知
// 場所: app/components/features/notifications/

- WebSocket統合（Socket.io）
- トースト通知（react-hot-toast）
- 通知履歴保存
```

### 📌 フェーズ7: セキュリティ強化（1日）

#### 12. **2段階認証実装**
```typescript
// 実装内容: Google Authenticator連携
// 場所: app/api/auth/2fa/

- QRコード生成
- TOTP検証
- バックアップコード発行
```

## 💡 実装時の注意事項

1. **データベースマイグレーション**: 新機能追加時は必ず`npx prisma migrate dev`を実行
2. **型定義**: `types/api.ts`に新しい型を追加
3. **エラーハンドリング**: 日本語エラーメッセージで統一
4. **テスト**: 各機能実装後にE2Eテストを追加

これらの機能を段階的に実装することで、要件定義書に記載されたすべての機能を網羅できます。各フェーズは独立して実装可能なので、優先度に応じて順番を変更することも可能です。