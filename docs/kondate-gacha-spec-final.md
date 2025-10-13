# 献立ガチャ – 仕様ドキュメント

## 共通方針（全プロジェクト）

* フレームワーク：**Next.js 14（App Router）**、TypeScript、Tailwind、shadcn/ui（管理系）
* 認証・DB・ストレージ・Realtime：**Supabase**
* 決済：**Stripe Checkout**（入金は運営口座、**月次で手動振込**。将来は Stripe Connect に拡張可能）
* デプロイ：Vercel（推奨）
* 3アプリは**別レポ / 別デプロイ**。**Supabase プロジェクトと DB は共通**
* UI指針：

  * 購入者EC / 販売者管理：**スマホファースト**（下部ナビ＋上部ハンバーガー）
  * 管理者管理：**PCファースト**（左サイドバー）
* チャット：Supabase Realtime Channels（最初はCRUD + ポーリングでも可）
* メール：SendGrid / Resend（Edge Function から送信）

---

## 共通データモデル（DDL 抜粋 / 一貫命名）

> すべて `auth.users` を起点にし、アプリ側はロールを profiles に集約します。**管理者を別テーブルに分離する設計は不採用**（RLSとロールで十分制御可能）。
> 金額は「円」を **INT（最小単位：円）** で扱い、外税/内税は `orders.total_amount` に税込を格納。

```sql
-- 事前: 拡張
create extension if not exists "uuid-ossp";

-- 1) 共通プロフィール（ロール統合）
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('buyer','seller','admin')) not null,
  nickname text,                       -- buyer用（チャット/レビュー表示名）
  full_name text,                      -- buyer/seller共通
  phone text,
  created_at timestamptz default now()
);

-- 2) 購入者プロフィール（配送先など）
create table public.buyer_profiles (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  default_shipping jsonb,              -- {postal_code,prefecture,city,address1,address2,name,phone}
  addresses jsonb                      -- 配列で複数管理（任意）
);

-- 3) 販売者（農家）プロフィール
create table public.sellers (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  farm_name text not null,
  introduction text,
  prefecture text,
  city text,
  address_line1 text,
  address_line2 text,
  postal_code text,
  phone text,
  profile_image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 4) 商品とSKU
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.sellers(user_id) on delete cascade,
  name text not null,                  -- 例: トマト
  description text,
  origin text,                         -- 産地
  irregular_reason text,               -- 規格外理由
  category text,                       -- 果菜/葉物/根菜など
  image_urls text[],                   -- Supabase Storage のURL
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.product_skus (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  weight_grams int check (weight_grams > 0),
  unit_count int default 0,            -- 数で売る場合に使用（0なら重量ベース）
  price_yen int not null check (price_yen >= 0),
  stock int not null default 0,
  shipping_method text,                -- 常温/冷蔵など
  is_active boolean default true
);

-- 5) 注文
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  buyer_id uuid not null references public.profiles(user_id),
  seller_id uuid not null references public.sellers(user_id),
  status text check (status in ('pending','paid','shipped','delivered','canceled')) default 'pending',
  subtotal_yen int not null,
  shipping_fee_yen int not null default 0,
  platform_fee_yen int not null default 0,       -- 管理者手数料（計上のみ）
  total_amount_yen int not null,                 -- 税込合計（= subtotal + shipping）
  shipping_info jsonb,                           -- {name, postal_code, prefecture, city, address1, address2, phone, eta}
  stripe_payment_intent_id text,
  created_at timestamptz default now()
);

create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sku_id uuid not null references public.product_skus(id),
  quantity int not null check (quantity > 0),
  unit_price_yen int not null,
  subtotal_yen int not null
);

-- 6) レビュー（購入者の声）
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references public.profiles(user_id),
  product_id uuid not null references public.products(id),
  order_id uuid references public.orders(id),
  nickname text,                      -- 表示名（profiles.nicknameをコピーして保持）
  rating int check (rating between 1 and 5) not null,
  comment text,
  image_urls text[],
  is_visible boolean default true,
  deleted_by uuid references public.profiles(user_id), -- adminのuser_id
  deleted_at timestamptz,
  created_at timestamptz default now()
);

-- 7) チャット（1:1）
create table public.chats (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references public.profiles(user_id),
  seller_id uuid not null references public.sellers(user_id),
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (buyer_id, seller_id)
);

create table public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(user_id),
  body text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 8) 振込・収支（管理者用）
create table public.payouts (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.sellers(user_id),
  period_start date not null,
  period_end date not null,
  total_sales_yen int not null,
  platform_fee_yen int not null,
  payout_amount_yen int not null,
  status text check (status in ('pending','processing','completed','failed')) default 'pending',
  transfer_method text,               -- 'bank_transfer' など
  transfer_date date,
  notes text,
  processed_by uuid references public.profiles(user_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.payout_orders (
  id uuid primary key default uuid_generate_v4(),
  payout_id uuid not null references public.payouts(id) on delete cascade,
  order_id uuid not null references public.orders(id),
  order_amount_yen int not null,
  platform_fee_yen int not null,
  seller_amount_yen int not null
);

-- 9) お知らせ
create table public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  target text check (target in ('buyers','sellers','all')) not null,
  is_active boolean default true,
  published_at timestamptz,
  created_by uuid references public.profiles(user_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10) システム設定（手数料率など）
create table public.system_settings (
  key text primary key,
  value text not null,
  description text,
  updated_by uuid references public.profiles(user_id),
  updated_at timestamptz default now()
);

-- 初期設定例
insert into public.system_settings(key,value,description)
values
('platform_fee_rate','10','プラットフォーム手数料率（%）'),
('default_shipping_fee','800','デフォルト送料（円）'),
('payout_schedule','monthly','振込スケジュール（monthly/weekly）'),
('payout_day','25','月次の振込日（1-28の範囲推奨）')
on conflict (key) do nothing;
```

### RLS 方針（骨子）

* `profiles`: `auth.uid() = user_id`
* `buyer_profiles`: `auth.uid() = user_id`
* `sellers`: 自分（seller）または admin が読み書き。`exists (select 1 from profiles p where p.user_id = auth.uid() and p.role='admin')`
* `products/product_skus`: 該当 `seller_id` = ログインユーザー or admin
* `orders/order_items`: buyer は自分の注文のみ閲覧、seller は自分に紐づく注文のみ閲覧、admin は全件
* `reviews`: buyer は自分の投稿 CRUD、seller は自商品に紐づくレビュー閲覧、admin は全件 + 非表示化
* `chats/chat_messages`: 関係当事者（buyer/seller）と admin のみ
* `payouts/payout_orders/announcements/system_settings`: admin のみ

---

## ① 購入者向け 販売用ECサイト（consumer-site）

### 目的

規格外野菜を**ガチャ風UI**で楽しく選択し、販売者を横断して購入できる。

### 主要ページ / ルーティング

* `/auth/(login|signup|reset)`
* `/` … **献立ガチャ**（Framer Motionで回転/ポップ演出）
* `/vegetables/[name]/farmers` … 該当野菜の出品一覧（販売者カード）
* `/products/[productId]` … 商品詳細＋SKU選択＋レビュー
* `/cart` … 確定前サマリ
* `/checkout/shipping` … 配送先・お届け予定日
* `/checkout/pay` … Stripe セッション作成→Checkout へ遷移
* `/order/complete` … 完了・メール通知済み
* `/orders` … 購入履歴
* `/chat/[sellerId]` … 1:1チャット
* `/profile` … プロフィール/配送先管理

### 機能要件（抜粋）

* Email/Password 認証、プロフィール登録（氏名/電話/配送先/ニックネーム）
* ガチャUI：選択した野菜名で `products` を検索表示
* 商品詳細：画像・説明・産地・**規格外理由**・販売者プロフィール・SKU
* 決済：**Stripe Checkout** → Webhook で `orders.status='paid'` 更新
* 購入履歴、レビュー投稿（星・本文・画像最大3枚）
* チャット（buyer↔seller）

### 代表API（App Router / Route Handler）

* `POST /api/stripe/checkout`：`order` 仮作成 → Stripe セッションURL返却
* `POST /api/stripe/webhook`：支払い成功で `orders` を確定
* `GET /api/products` / `GET /api/products/[id]`
* `POST /api/reviews`（自分の購入商品のみ）
* `GET /api/orders`（自分のみ）
* `GET|POST /api/chat/[sellerId]`

### ディレクトリひな形

```
/app
  /(auth)/login ...
  /api/stripe/checkout/route.ts
  /api/stripe/webhook/route.ts
  /products/[id]/page.tsx
  /orders/page.tsx
  /chat/[sellerId]/page.tsx
/components
/lib (supabase, stripe, rls helpers)
/styles
```

---

## ② 販売者（農家）管理サイト（seller-site）

### 目的

出品登録・在庫・売上・注文・チャットを**スマホ優先**で効率管理。

### 主要ページ / ルーティング

* `/auth/(login|reset)`
* `/` … ダッシュボード（今日/今月の売上、未読スレ、在庫警告）
* `/products` … 出品一覧（公開/非公開/在庫）
* `/products/new` / `/products/[id]/edit` … **商品＋SKU編集**
* `/orders` … 販売履歴（期間/ステータス/検索）
* `/finance` … 月次サマリ（売上・手数料・振込予定）
* `/chat/[buyerId]`
* `/settings/profile` … 農家プロフィール

### 機能要件（抜粋）

* 自分の `products/product_skus` の CRUD（画像は Supabase Storage）
* 注文一覧：自分の商品に紐づく `orders` のみ
* 月次収支：`payouts` 確定結果の閲覧
* チャット（buyer↔seller）

### 代表API

* `GET|POST /api/products` / `PUT|DELETE /api/products/[id]`
* `GET|POST /api/products/[id]/skus`
* `GET /api/orders?sellerId=me&status=...`
* `GET /api/finance/summary?month=YYYY-MM`

---

## ③ 管理者 管理サイト（admin-site）

### 目的

販売者アカウント発行/停止、レビュー可視性、**月次振込**、集計・お知らせ配信をPCで一元管理。

### 主要ページ / ルーティング

* `/auth/login`
* `/dashboard` … KPI（総売上・注文件数・手数料・未処理振込・アラート）
* `/farmers`（一覧 / 追加 / 詳細 / 有効化・無効化）
* `/orders`（全体検索・期間集計）
* `/payouts`（ダッシュボード / 一覧 / 詳細 / **処理実行**）
* `/reviews`（一覧 / 詳細 / **非表示**）
* `/announcements`（一覧 / 作成 / 編集）
* `/settings`（システム設定・管理者一覧は**role='admin'**の `profiles` 参照）
* `/logs`（後述の操作ログは将来拡張：必要時に `admin_logs` 追加）

### コア業務フロー：振込（手動）

1. 期間（例：前月）を指定し `/payouts/process` を実行
2. 販売者ごとに **総売上/手数料/振込額** を算出 → `payouts` & `payout_orders` へ INSERT（pending）
3. 内容確認後に「確定」→ `status='processing'`、売上通知メール送信
4. 実際の銀行送金または Stripe Transfer（将来）完了後に `status='completed'` 設定

### 代表API

* `POST /api/farmers` … 販売者アカウント発行（Supabase Authでユーザー作成→profiles/sellers挿入→招待メール送信）
* `PUT /api/farmers/[id]` … 有効/無効・編集
* `GET /api/orders` … 期間/販売者/状態で集計
* `POST /api/payouts/process` … 期間集計して pending 生成
* `PUT /api/payouts/[id]/complete` … 完了処理
* `PUT /api/reviews/[id]/hide` … 表示フラグ切替（削除ではなく**非表示**）
* `POST /api/announcements` … 配信（buyers/sellers/all）

---

## Stripe 連携（共通）

* **Checkout 作成**：`/api/stripe/checkout`

  * `order_items` から line_items を構築
  * `success_url`：`/order/complete?order={id}`
  * `cancel_url`：`/cart`
* **Webhook**：`/api/stripe/webhook`

  * `checkout.session.completed` → `orders.status='paid'`、在庫減算、購入完了メール
* **手数料**：`system_settings.platform_fee_rate` を参照し計上（徴収は月次振込で反映）

---

## 環境変数（全アプリ共通）

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENDGRID_API_KEY=        # or RESEND_API_KEY
NEXT_PUBLIC_APP_URL=     # e.g. https://consumer.example.com
```

---

## セキュリティ / バリデーション

* **RLS** を前提にサーバー側でも `auth.getUser()` による再検証
* 入力値バリデーション：React Hook Form + Zod
* XSS/CSRF：Next.js Route Handler で CSRFトークン（必要に応じて導入）、リッチテキストはサニタイズ
* Storage：ファイルは**private**、署名付きURLで配信
* ログ/監査：要件上は任意。拡張時に `admin_logs(action, target_type, target_id, details)` を追加

---

## 画面ナビ（要点）

### 購入者EC（スマホ下部タブ）

* **ホーム**(🎰ガチャ) / **検索** / **履歴** / **チャット** / **マイ**

### 販売者管理（スマホ下部タブ）

* **ダッシュボード** / **出品** / **注文** / **収支** / **プロフィール**

### 管理者管理（PCサイドバー）

* **Dashboard / Farmers / Orders / Payouts / Reviews / Announcements / Reports / Settings**

---

## 開発初期タスク（推奨順）

1. Supabase プロジェクト作成 → **上記DDL** 適用 → RLS ポリシー作成
2. 3アプリの雛形（`create-next-app --ts --app --tailwind`）
3. 共通 `lib/supabase.ts`・`lib/stripe.ts`・`auth` ラッパー実装
4. 消費者：ガチャUI（Framer Motion）と**商品一覧→詳細→Checkout** の最短動線
5. Webhook／在庫減算／メール送信
6. 販売者：出品フォーム（画像アップロード＋SKU Repeater）
7. 管理者：販売者発行・payouts 集計（pending 生成）

---

## 簡易メールテンプレ（例）

**販売者アカウント発行**
件名：`【献立ガチャ】販売者アカウント発行のお知らせ`
本文：ログインURL / メール / 仮PW（初回変更の案内）

**購入完了**
件名：`【献立ガチャ】ご購入ありがとうございます（注文番号: {{order_number}}）`
本文：注文内容、配送予定日、連絡先

---

## この版での主な修正点（見解→決定）

* **管理者の扱い**：別テーブル案（見解2/4の一部）とロール統一案（見解1/3/5）を比較し、**profiles.role='admin'** に統合。RLSとUIで十分制御できるためスキーマを簡潔化。
* **金額・単位**：`*_yen INT` に統一（見解間の decimal/cent/円混在を解消）。
* **SKU/在庫モデル**：`product_skus` に**重量/数**の両軸をサポート（`weight_grams` と `unit_count`）して、見解の差異を吸収。
* **レビュー削除**：物理削除/非表示案の混在を**非表示（is_visible）**に統一。運営要件と監査性のバランス優先。
* **振込**：**手動（月次）**を正式要件に据え、Stripe Connect は将来拡張として位置付け（見解2の詳細ロジックを取り込みつつ簡潔化）。
* **ルーティング命名**：見解の微差を統一（例：`/vegetables/[name]/farmers`, `/products/[id]`, `/checkout/...`）。
* **一貫データモデル**：`users/profiles/sellers/buyer_profiles` に正規化して、見解間の `users/farmers/admins` 分割案の重複を排除。

---

以上です。
このドキュメントは**そのままスキーマ適用→ページ雛形生成→API実装**に入れる粒度に整えています。次の一手として、以下のいずれでも即時に用意できます：

* Supabase **RLSポリシーSQL**（テーブルごと）
* 3アプリの **ディレクトリ雛形 & 主要ページの空実装**（App Router）
* **Stripe Webhook** 実装の完全サンプル（在庫減算・メール送信込み）
