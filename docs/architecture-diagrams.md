# 献立ガチャサービス - アーキテクチャ図

本ドキュメントには、MGC-V1プロジェクトの各種アーキテクチャ図が含まれています。

## 目次

1. [システム全体アーキテクチャ](#システム全体アーキテクチャ)
2. [3アプリケーション構成](#3アプリケーション構成)
3. [購入者向けECサイト（consumer-site）構成](#購入者向けecサイトconsumer-site構成)
4. [管理者向け管理サイト構成](#管理者向け管理サイト構成)
5. [データフロー図](#データフロー図)
6. [認証・認可フロー](#認証認可フロー)
7. [決済フロー（Stripe）](#決済フローstripe)

---

## システム全体アーキテクチャ

```mermaid
graph TB
    subgraph "クライアント層"
        WEB[Webブラウザ<br/>PC・タブレット]
        MOBILE[モバイルブラウザ<br/>スマートフォン]
    end

    subgraph "アプリケーション層（Vercel）"
        CONSUMER[購入者向けECサイト<br/>consumer-site<br/>スマホファースト]
        ADMIN[管理者向け管理サイト<br/>メインプロジェクト<br/>PCファースト]
        SELLER[販売者向け管理サイト<br/>未実装<br/>スマホファースト]
    end

    subgraph "バックエンド層（Supabase）"
        DB[(PostgreSQL<br/>データベース)]
        AUTH[Supabase Auth<br/>認証サービス]
        STORAGE[Supabase Storage<br/>画像保存]
        REALTIME[Supabase Realtime<br/>チャット機能]
    end

    subgraph "外部サービス層"
        STRIPE[Stripe<br/>決済サービス]
        EMAIL[SendGrid/Resend<br/>メール送信]
    end

    WEB --> CONSUMER
    WEB --> ADMIN
    MOBILE --> CONSUMER
    MOBILE --> SELLER

    CONSUMER --> DB
    CONSUMER --> AUTH
    CONSUMER --> STORAGE
    CONSUMER --> REALTIME
    CONSUMER --> STRIPE
    CONSUMER --> EMAIL

    ADMIN --> DB
    ADMIN --> AUTH
    ADMIN --> STORAGE

    SELLER -.-> DB
    SELLER -.-> AUTH
    SELLER -.-> STORAGE

    style CONSUMER fill:#d5e8d4
    style ADMIN fill:#dae8fc
    style SELLER fill:#f5f5f5
    style DB fill:#f8cecc
    style AUTH fill:#ffe6cc
    style STORAGE fill:#ffe6cc
    style REALTIME fill:#ffe6cc
    style STRIPE fill:#fff2cc
    style EMAIL fill:#fff2cc
```

---

## 3アプリケーション構成

```mermaid
graph LR
    subgraph "共有リソース"
        DB[(Supabase<br/>PostgreSQL<br/>共通DB)]
        AUTH[Supabase Auth<br/>共通認証]
    end

    subgraph "購入者向けECサイト"
        C1[Next.js 14<br/>App Router]
        C2[スマホファースト<br/>下部ナビ]
        C3[Stripe決済<br/>チャット機能]
    end

    subgraph "管理者向け管理サイト"
        A1[Next.js 14<br/>App Router]
        A2[PCファースト<br/>サイドバー]
        A3[販売者管理<br/>月次振込<br/>レビュー管理]
    end

    subgraph "販売者向け管理サイト（未実装）"
        S1[Next.js 14<br/>App Router]
        S2[スマホファースト<br/>下部ナビ]
        S3[商品登録<br/>在庫管理<br/>売上確認]
    end

    C1 --> DB
    C1 --> AUTH
    A1 --> DB
    A1 --> AUTH
    S1 -.-> DB
    S1 -.-> AUTH

    style C1 fill:#d5e8d4
    style C2 fill:#d5e8d4
    style C3 fill:#d5e8d4
    style A1 fill:#dae8fc
    style A2 fill:#dae8fc
    style A3 fill:#dae8fc
    style S1 fill:#f5f5f5
    style S2 fill:#f5f5f5
    style S3 fill:#f5f5f5
    style DB fill:#f8cecc
    style AUTH fill:#ffe6cc
```

**重要ポイント**:
- すべてのアプリケーションが**同一のSupabaseプロジェクト**を共有
- RLS（Row Level Security）でデータアクセスを制御
- 各アプリは独立してデプロイ可能

---

## 購入者向けECサイト（consumer-site）構成

### ディレクトリ構造

```mermaid
graph TB
    ROOT[consumer-site/]

    subgraph "アプリケーション層"
        APP[app/]
        AUTH[app/auth/<br/>認証ページ]
        API[app/api/<br/>APIルート]
        PAGES[ページコンポーネント]
    end

    subgraph "API Routes"
        API_PROD[api/products/]
        API_ORDER[api/orders/]
        API_REVIEW[api/reviews/]
        API_CHAT[api/chat/]
        API_STRIPE[api/stripe/<br/>checkout/<br/>webhook/]
    end

    subgraph "主要ページ"
        HOME[/ トップページ<br/>商品一覧]
        PRODUCT[/product/[id]/<br/>商品詳細]
        CART[/cart/<br/>カート]
        CHECKOUT[/checkout/<br/>決済]
        ORDERS[/orders/<br/>注文履歴]
        CHAT[/chat/<br/>チャット]
        PROFILE[/profile/<br/>プロフィール]
        SEARCH[/search/<br/>検索]
        VEGGIES[/vegetables/[name]/farmers/<br/>野菜別農家一覧]
    end

    subgraph "コンポーネント層"
        COMP[components/]
        NAV[navigation/<br/>bottom-nav<br/>header]
    end

    subgraph "ライブラリ層"
        LIB[lib/]
        AUTH_HELPER[auth-helpers.ts<br/>認証ヘルパー]
        STRIPE_LIB[stripe.ts<br/>Stripe連携]
        SUPABASE[supabase/<br/>client.ts<br/>server.ts<br/>middleware.ts]
    end

    subgraph "型定義"
        TYPES[types/<br/>database.ts<br/>仕様書ベースの型定義]
    end

    ROOT --> APP
    ROOT --> COMP
    ROOT --> LIB
    ROOT --> TYPES

    APP --> AUTH
    APP --> API
    APP --> PAGES

    API --> API_PROD
    API --> API_ORDER
    API --> API_REVIEW
    API --> API_CHAT
    API --> API_STRIPE

    PAGES --> HOME
    PAGES --> PRODUCT
    PAGES --> CART
    PAGES --> CHECKOUT
    PAGES --> ORDERS
    PAGES --> CHAT
    PAGES --> PROFILE
    PAGES --> SEARCH
    PAGES --> VEGGIES

    COMP --> NAV

    LIB --> AUTH_HELPER
    LIB --> STRIPE_LIB
    LIB --> SUPABASE

    style ROOT fill:#d5e8d4
    style APP fill:#dae8fc
    style API fill:#fff2cc
    style PAGES fill:#e1d5e7
    style COMP fill:#ffe6cc
    style LIB fill:#f8cecc
    style TYPES fill:#f5f5f5
```

### 主要機能フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant APP as Next.js App
    participant API as API Routes
    participant SB as Supabase
    participant ST as Stripe

    Note over U,ST: 商品検索〜購入フロー

    U->>APP: トップページアクセス
    APP->>SB: 商品一覧取得
    SB-->>APP: 商品データ
    APP-->>U: 商品カード表示

    U->>APP: 商品詳細クリック
    APP->>SB: 商品詳細・SKU・レビュー取得
    SB-->>APP: 詳細データ
    APP-->>U: 商品詳細表示

    U->>APP: カートに追加
    APP->>APP: ローカルステート更新
    APP-->>U: カート更新通知

    U->>APP: チェックアウト
    APP->>API: 注文作成API
    API->>SB: 仮注文作成（status=pending）
    SB-->>API: 注文ID
    API->>ST: Checkout Session作成
    ST-->>API: Session URL
    API-->>APP: Redirect URL
    APP-->>U: Stripeページへリダイレクト

    U->>ST: カード情報入力・決済
    ST->>API: Webhook（checkout.session.completed）
    API->>SB: 注文確定（status=paid）
    API->>SB: 在庫減算
    API->>API: メール送信
    ST-->>U: 成功ページへリダイレクト

    U->>APP: 注文完了ページ
    APP->>SB: 注文情報取得
    SB-->>APP: 注文データ
    APP-->>U: 注文詳細表示
```

### 下部ナビゲーション（スマホファースト）

```mermaid
graph LR
    HOME[ホーム<br/>商品一覧]
    SEARCH[検索<br/>商品検索]
    ORDERS[履歴<br/>注文履歴]
    CHAT[チャット<br/>販売者との<br/>メッセージ]
    PROFILE[マイ<br/>プロフィール<br/>設定]

    HOME --> SEARCH
    SEARCH --> ORDERS
    ORDERS --> CHAT
    CHAT --> PROFILE

    style HOME fill:#d5e8d4
    style SEARCH fill:#dae8fc
    style ORDERS fill:#fff2cc
    style CHAT fill:#ffe6cc
    style PROFILE fill:#e1d5e7
```

---

## 管理者向け管理サイト構成

### ディレクトリ構造

```mermaid
graph TB
    ROOT[mgc-v1/<br/>メインプロジェクト]

    subgraph "アプリケーション層"
        APP[app/]
        COMP[app/components/ui/<br/>共通UIコンポーネント]
        PAGES[ページ]
    end

    subgraph "主要UIコンポーネント"
        ALERT[AlertProvider<br/>NexusAlert<br/>NexusAlertBox]
        BUTTON[NexusButton]
        INPUT[NexusInput<br/>NexusTextarea<br/>NexusSelect<br/>NexusCheckbox<br/>NexusRadio]
        CARD[NexusCard<br/>ContentCard]
        TABLE[HoloTable<br/>Pagination]
        MODAL[BaseModal<br/>ConfirmationModal<br/>ModalContext]
        OTHER[StatusIndicator<br/>WorkflowProgress<br/>CertBadge<br/>TrackingNumberDisplay]
    end

    subgraph "ページ"
        HOME_PAGE[/ ダッシュボード]
        PRIVACY[/privacy-policy/]
        TERMS[/terms/]
    end

    subgraph "ライブラリ層"
        LIB[lib/]
        HOOKS[hooks/useApi.ts]
        UTILS[utils.ts<br/>image-processor.ts]
    end

    ROOT --> APP
    ROOT --> LIB

    APP --> COMP
    APP --> PAGES

    COMP --> ALERT
    COMP --> BUTTON
    COMP --> INPUT
    COMP --> CARD
    COMP --> TABLE
    COMP --> MODAL
    COMP --> OTHER

    PAGES --> HOME_PAGE
    PAGES --> PRIVACY
    PAGES --> TERMS

    LIB --> HOOKS
    LIB --> UTILS

    style ROOT fill:#dae8fc
    style APP fill:#e1d5e7
    style COMP fill:#fff2cc
    style PAGES fill:#d5e8d4
    style LIB fill:#f8cecc
```

### 想定される管理機能（未実装）

```mermaid
graph TB
    DASHBOARD[ダッシュボード<br/>KPI表示]

    subgraph "販売者管理"
        FARMERS_LIST[販売者一覧]
        FARMERS_NEW[新規販売者登録]
        FARMERS_DETAIL[販売者詳細]
        FARMERS_TOGGLE[有効化・無効化]
    end

    subgraph "注文管理"
        ORDERS_LIST[注文一覧]
        ORDERS_SEARCH[期間・販売者検索]
        ORDERS_STATS[集計]
    end

    subgraph "振込管理"
        PAYOUTS_DASH[振込ダッシュボード]
        PAYOUTS_LIST[振込一覧]
        PAYOUTS_PROCESS[月次集計・振込処理]
        PAYOUTS_DETAIL[振込詳細]
    end

    subgraph "レビュー管理"
        REVIEWS_LIST[レビュー一覧]
        REVIEWS_DETAIL[レビュー詳細]
        REVIEWS_HIDE[非表示化]
    end

    subgraph "お知らせ管理"
        ANNOUNCEMENTS_LIST[お知らせ一覧]
        ANNOUNCEMENTS_NEW[新規作成]
        ANNOUNCEMENTS_EDIT[編集]
    end

    subgraph "システム設定"
        SETTINGS_SYSTEM[システム設定<br/>手数料率・送料]
        SETTINGS_ADMIN[管理者一覧]
    end

    DASHBOARD --> FARMERS_LIST
    DASHBOARD --> ORDERS_LIST
    DASHBOARD --> PAYOUTS_DASH
    DASHBOARD --> REVIEWS_LIST
    DASHBOARD --> ANNOUNCEMENTS_LIST
    DASHBOARD --> SETTINGS_SYSTEM

    style DASHBOARD fill:#d5e8d4
    style FARMERS_LIST fill:#dae8fc
    style ORDERS_LIST fill:#fff2cc
    style PAYOUTS_DASH fill:#ffe6cc
    style REVIEWS_LIST fill:#e1d5e7
    style ANNOUNCEMENTS_LIST fill:#f8cecc
    style SETTINGS_SYSTEM fill:#f5f5f5
```

### PCファーストレイアウト

```mermaid
graph LR
    subgraph "画面レイアウト"
        SIDEBAR[左サイドバー<br/>主要メニュー<br/>・ダッシュボード<br/>・販売者<br/>・注文<br/>・振込<br/>・レビュー<br/>・お知らせ<br/>・設定]

        subgraph "メインコンテンツエリア"
            HEADER[上部ヘッダー<br/>検索・通知・プロフィール]
            CONTENT[コンテンツ<br/>各機能画面]
        end
    end

    SIDEBAR --> HEADER
    HEADER --> CONTENT

    style SIDEBAR fill:#dae8fc
    style HEADER fill:#e1d5e7
    style CONTENT fill:#f5f5f5
```

---

## データフロー図

```mermaid
graph TB
    subgraph "フロントエンド"
        UI[UIコンポーネント]
        STATE[React State<br/>Context API]
    end

    subgraph "Next.js API Routes"
        ROUTE[Route Handlers]
        VALIDATION[Zod Validation]
        AUTH_CHECK[認証チェック]
        BUSINESS[ビジネスロジック]
    end

    subgraph "Supabase"
        RLS[RLS<br/>Row Level Security]
        DB[(PostgreSQL)]
        AUTH_SB[Supabase Auth]
        STORAGE_SB[Supabase Storage]
    end

    UI -->|API Request| ROUTE
    ROUTE --> VALIDATION
    VALIDATION --> AUTH_CHECK
    AUTH_CHECK -->|検証| AUTH_SB
    AUTH_CHECK --> BUSINESS
    BUSINESS -->|SQL Query| RLS
    RLS --> DB
    BUSINESS -->|Upload| STORAGE_SB
    DB -->|Response| BUSINESS
    BUSINESS -->|JSON| ROUTE
    ROUTE -->|Response| UI
    UI --> STATE
    STATE --> UI

    style UI fill:#d5e8d4
    style STATE fill:#dae8fc
    style ROUTE fill:#fff2cc
    style VALIDATION fill:#ffe6cc
    style AUTH_CHECK fill:#ffe6cc
    style BUSINESS fill:#e1d5e7
    style RLS fill:#f8cecc
    style DB fill:#f8cecc
    style AUTH_SB fill:#ffe6cc
    style STORAGE_SB fill:#ffe6cc
```

---

## 認証・認可フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant APP as Next.js App
    participant MW as Middleware
    participant API as API Routes
    participant AUTH as Supabase Auth
    participant DB as Database (RLS)

    Note over U,DB: ユーザー登録フロー

    U->>APP: サインアップページアクセス
    APP-->>U: サインアップフォーム表示
    U->>APP: メール・パスワード入力
    APP->>AUTH: signUp()
    AUTH->>AUTH: ユーザー作成
    AUTH->>DB: profiles INSERT (role='buyer')
    AUTH->>U: 確認メール送信
    AUTH-->>APP: ユーザー作成成功
    APP-->>U: 確認メール送信メッセージ

    Note over U,DB: ログインフロー

    U->>APP: ログインページアクセス
    APP-->>U: ログインフォーム表示
    U->>APP: メール・パスワード入力
    APP->>AUTH: signInWithPassword()
    AUTH->>AUTH: 認証情報確認
    AUTH-->>APP: セッショントークン
    APP->>APP: Cookie保存
    APP-->>U: リダイレクト（トップページ）

    Note over U,DB: 保護されたページアクセス

    U->>APP: 保護されたページアクセス
    APP->>MW: Middleware実行
    MW->>AUTH: セッション検証
    AUTH-->>MW: ユーザー情報
    MW-->>APP: 認証OK
    APP->>API: データ取得API
    API->>AUTH: getUser()
    AUTH-->>API: ユーザー情報
    API->>DB: SELECT (RLS適用)
    DB->>DB: auth.uid()でフィルタ
    DB-->>API: データ
    API-->>APP: JSON Response
    APP-->>U: ページ表示

    Note over U,DB: 未認証時

    U->>APP: 保護されたページアクセス
    APP->>MW: Middleware実行
    MW->>AUTH: セッション検証
    AUTH-->>MW: 未認証
    MW-->>U: リダイレクト（/auth/login）
```

### RLSポリシー例

```mermaid
graph TB
    subgraph "profiles テーブル"
        RLS_PROFILE[RLS Policy:<br/>auth.uid = user_id<br/>自分のプロフィールのみアクセス可]
    end

    subgraph "orders テーブル"
        RLS_ORDER[RLS Policy:<br/>buyer: buyer_id = auth.uid<br/>seller: seller_id = auth.uid<br/>admin: すべてアクセス可]
    end

    subgraph "products テーブル"
        RLS_PRODUCT[RLS Policy:<br/>読み取り: 誰でも可 is_active=true<br/>書き込み: seller_id = auth.uid OR admin]
    end

    subgraph "reviews テーブル"
        RLS_REVIEW[RLS Policy:<br/>作成: buyer_id = auth.uid<br/>読み取り: 誰でも可 is_visible=true<br/>非表示化: admin only]
    end

    style RLS_PROFILE fill:#d5e8d4
    style RLS_ORDER fill:#dae8fc
    style RLS_PRODUCT fill:#fff2cc
    style RLS_REVIEW fill:#ffe6cc
```

---

## 決済フロー（Stripe）

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant APP as Next.js App
    participant API as API Routes
    participant DB as Supabase DB
    participant STRIPE as Stripe

    Note over U,STRIPE: チェックアウトフロー

    U->>APP: チェックアウトページ
    APP-->>U: 注文内容確認
    U->>APP: 「支払いへ進む」クリック

    APP->>API: POST /api/stripe/checkout
    API->>DB: 仮注文作成 (status='pending')
    DB-->>API: order_id

    API->>STRIPE: Checkout Session作成
    Note right of STRIPE: line_items:<br/>- 商品<br/>- 送料<br/>success_url<br/>cancel_url<br/>metadata: order_id
    STRIPE-->>API: session.url

    API-->>APP: { url: session.url }
    APP-->>U: Stripeページへリダイレクト

    Note over U,STRIPE: Stripe Checkoutページ

    U->>STRIPE: カード情報入力
    U->>STRIPE: 「支払う」クリック
    STRIPE->>STRIPE: 決済処理

    alt 決済成功
        STRIPE->>API: Webhook: checkout.session.completed
        API->>API: Webhook署名検証
        API->>DB: 注文確定 (status='paid')
        API->>DB: 在庫減算
        API->>API: メール送信（購入完了）
        API-->>STRIPE: 200 OK

        STRIPE-->>U: success_url へリダイレクト
        U->>APP: /order/complete?order=xxx
        APP->>DB: 注文情報取得
        DB-->>APP: 注文データ
        APP-->>U: 注文完了ページ表示
    else 決済失敗
        STRIPE-->>U: cancel_url へリダイレクト
        U->>APP: /cart
        APP-->>U: カートページ（エラー表示）
    end

    Note over U,STRIPE: Webhook リトライ機能

    alt Webhook失敗時
        STRIPE->>API: Webhook リトライ (最大3回)
        API-->>STRIPE: エラー応答
        STRIPE->>STRIPE: 指数バックオフで再送
    end
```

### Stripe Webhook処理詳細

```mermaid
graph TB
    WEBHOOK[Webhook受信<br/>checkout.session.completed]

    VERIFY[署名検証<br/>stripe.webhooks.constructEvent]

    EXTRACT[メタデータ抽出<br/>order_id取得]

    CHECK[注文確認<br/>status = pending?]

    UPDATE[注文更新<br/>status = paid<br/>payment_intent_id保存]

    STOCK[在庫減算<br/>product_skus.stock -= quantity]

    EMAIL[メール送信<br/>購入完了通知]

    RESPOND[200 OK応答]

    ERROR[エラーハンドリング<br/>ログ記録<br/>500応答]

    WEBHOOK --> VERIFY
    VERIFY -->|検証成功| EXTRACT
    VERIFY -->|検証失敗| ERROR

    EXTRACT --> CHECK
    CHECK -->|OK| UPDATE
    CHECK -->|NG| ERROR

    UPDATE --> STOCK
    STOCK --> EMAIL
    EMAIL --> RESPOND

    UPDATE -->|DB Error| ERROR
    STOCK -->|DB Error| ERROR
    EMAIL -->|Error| RESPOND

    style WEBHOOK fill:#d5e8d4
    style VERIFY fill:#dae8fc
    style EXTRACT fill:#fff2cc
    style CHECK fill:#ffe6cc
    style UPDATE fill:#e1d5e7
    style STOCK fill:#f8cecc
    style EMAIL fill:#d5e8d4
    style RESPOND fill:#dae8fc
    style ERROR fill:#f8cecc
```

---

## チャット機能（Supabase Realtime）

```mermaid
sequenceDiagram
    participant B as 購入者
    participant APP_B as 購入者アプリ
    participant REALTIME as Supabase Realtime
    participant DB as Database
    participant APP_S as 販売者アプリ
    participant S as 販売者

    Note over B,S: チャット開始

    B->>APP_B: 販売者にメッセージをクリック
    APP_B->>DB: chats テーブル検索/作成
    DB-->>APP_B: chat_id
    APP_B->>REALTIME: チャンネル購読<br/>channel('chat:{chat_id}')
    REALTIME-->>APP_B: 購読成功

    S->>APP_S: チャット一覧表示
    APP_S->>REALTIME: チャンネル購読<br/>channel('chat:{chat_id}')
    REALTIME-->>APP_S: 購読成功

    Note over B,S: メッセージ送信

    B->>APP_B: メッセージ入力・送信
    APP_B->>DB: chat_messages INSERT
    DB->>DB: トリガー実行
    DB->>REALTIME: 変更通知
    REALTIME->>APP_S: リアルタイム配信
    APP_S-->>S: メッセージ表示（リアルタイム）
    DB-->>APP_B: INSERT成功
    APP_B-->>B: メッセージ表示

    Note over B,S: 既読更新

    S->>APP_S: メッセージを読む
    APP_S->>DB: chat_messages UPDATE is_read=true
    DB->>REALTIME: 変更通知
    REALTIME->>APP_B: リアルタイム配信
    APP_B-->>B: 既読表示更新

    Note over B,S: 返信

    S->>APP_S: 返信を入力・送信
    APP_S->>DB: chat_messages INSERT
    DB->>REALTIME: 変更通知
    REALTIME->>APP_B: リアルタイム配信
    APP_B-->>B: 返信表示（リアルタイム）
```

---

## まとめ

### 技術スタック概要

| レイヤー | 技術 | 用途 |
|---------|------|------|
| **フロントエンド** | Next.js 14 (App Router) | サーバーサイドレンダリング・ルーティング |
| | React 18 | UIコンポーネント |
| | TypeScript | 型安全性 |
| | Tailwind CSS | スタイリング |
| **バックエンド** | Next.js API Routes | RESTful API |
| | Zod | バリデーション |
| **データベース** | Supabase (PostgreSQL) | データ永続化 |
| | Supabase Auth | 認証・認可 |
| | Supabase Storage | 画像保存 |
| | Supabase Realtime | チャット機能 |
| **決済** | Stripe Checkout | 決済処理 |
| | Stripe Webhooks | 決済確認 |
| **メール** | SendGrid / Resend | メール送信 |
| **デプロイ** | Vercel | ホスティング |
| **テスト** | Playwright | E2Eテスト |
| | Jest | ユニットテスト |

### 開発ステータス

| アプリケーション | ステータス | 説明 |
|----------------|-----------|------|
| 購入者向けECサイト | ✅ 実装済み | consumer-site/ |
| 管理者向け管理サイト | 🔄 一部実装 | UIコンポーネントのみ |
| 販売者向け管理サイト | ❌ 未実装 | 今後の開発予定 |

### 次のステップ

1. **管理者向け管理サイトの完成**
   - 販売者管理機能
   - 注文管理機能
   - 振込管理機能
   - レビュー管理機能
   - お知らせ管理機能

2. **販売者向け管理サイトの実装**
   - 商品登録・編集
   - 在庫管理
   - 注文確認
   - 売上確認
   - チャット対応

3. **機能拡張**
   - ガチャUI（Framer Motion）
   - お気に入り機能
   - クーポン・ポイントシステム
   - 定期購入
   - プッシュ通知

---

**作成日**: 2025-10-13
**バージョン**: 1.0
**更新履歴**: 初版作成
