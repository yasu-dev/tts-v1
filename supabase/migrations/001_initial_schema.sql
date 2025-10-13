-- 献立ガチャ - 初期スキーマ
-- Based on kondate-gacha-spec-final.md

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

-- インデックス作成
create index idx_products_seller on public.products(seller_id);
create index idx_products_category on public.products(category);
create index idx_products_active on public.products(is_active);
create index idx_product_skus_product on public.product_skus(product_id);
create index idx_orders_buyer on public.orders(buyer_id);
create index idx_orders_seller on public.orders(seller_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_created on public.orders(created_at desc);
create index idx_order_items_order on public.order_items(order_id);
create index idx_reviews_product on public.reviews(product_id);
create index idx_reviews_buyer on public.reviews(buyer_id);
create index idx_reviews_visible on public.reviews(is_visible);
create index idx_chats_buyer on public.chats(buyer_id);
create index idx_chats_seller on public.chats(seller_id);
create index idx_chat_messages_chat on public.chat_messages(chat_id);
create index idx_chat_messages_created on public.chat_messages(created_at desc);

-- Updated_at トリガー関数
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Updated_at トリガー適用
create trigger set_updated_at
  before update on public.payouts
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.announcements
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.system_settings
  for each row
  execute function public.handle_updated_at();
