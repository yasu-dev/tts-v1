-- 献立ガチャ - RLS ポリシー
-- Based on kondate-gacha-spec-final.md

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.buyer_profiles enable row level security;
alter table public.sellers enable row level security;
alter table public.products enable row level security;
alter table public.product_skus enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.chats enable row level security;
alter table public.chat_messages enable row level security;
alter table public.payouts enable row level security;
alter table public.payout_orders enable row level security;
alter table public.announcements enable row level security;
alter table public.system_settings enable row level security;

-- Helper function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Profiles: ユーザーは自分のプロフィールのみ操作可能、adminは全て
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id or is_admin());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id or is_admin());

-- Buyer Profiles: 購入者本人のみ
create policy "Buyers can manage own profile"
  on public.buyer_profiles for all
  using (auth.uid() = user_id or is_admin());

-- Sellers: 販売者本人とadminのみ編集可能、全員閲覧可能
create policy "Anyone can view active sellers"
  on public.sellers for select
  using (is_active = true or auth.uid() = user_id or is_admin());

create policy "Sellers can manage own profile"
  on public.sellers for all
  using (auth.uid() = user_id or is_admin());

-- Products: 販売者本人とadminが編集、アクティブな商品は全員閲覧可能
create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true or seller_id = auth.uid() or is_admin());

create policy "Sellers can manage own products"
  on public.products for insert
  with check (seller_id = auth.uid() or is_admin());

create policy "Sellers can update own products"
  on public.products for update
  using (seller_id = auth.uid() or is_admin());

create policy "Sellers can delete own products"
  on public.products for delete
  using (seller_id = auth.uid() or is_admin());

-- Product SKUs: 商品に紐づいて管理
create policy "Anyone can view active SKUs"
  on public.product_skus for select
  using (
    is_active = true or
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.seller_id = auth.uid() or is_admin())
    )
  );

create policy "Sellers can manage own SKUs"
  on public.product_skus for all
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.seller_id = auth.uid() or is_admin())
    )
  );

-- Orders: 購入者、販売者、adminのみ閲覧
create policy "Users can view own orders"
  on public.orders for select
  using (
    auth.uid() = buyer_id or
    auth.uid() = seller_id or
    is_admin()
  );

create policy "Buyers can create orders"
  on public.orders for insert
  with check (auth.uid() = buyer_id);

create policy "Sellers and admins can update orders"
  on public.orders for update
  using (auth.uid() = seller_id or is_admin());

-- Order Items: 注文と同じ権限
create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (
        o.buyer_id = auth.uid() or
        o.seller_id = auth.uid() or
        is_admin()
      )
    )
  );

create policy "Buyers can create order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.buyer_id = auth.uid()
    )
  );

-- Reviews: 購入者は自分のレビューCRUD、販売者は自商品レビュー閲覧、adminは全件操作
create policy "Anyone can view visible reviews"
  on public.reviews for select
  using (
    is_visible = true or
    auth.uid() = buyer_id or
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.seller_id = auth.uid() or is_admin())
    )
  );

create policy "Buyers can create reviews"
  on public.reviews for insert
  with check (auth.uid() = buyer_id);

create policy "Buyers can update own reviews"
  on public.reviews for update
  using (auth.uid() = buyer_id or is_admin());

create policy "Buyers and admins can delete reviews"
  on public.reviews for delete
  using (auth.uid() = buyer_id or is_admin());

-- Chats: 当事者（buyer, seller）とadminのみ
create policy "Chat participants can view chats"
  on public.chats for select
  using (
    auth.uid() = buyer_id or
    auth.uid() = seller_id or
    is_admin()
  );

create policy "Buyers can create chats"
  on public.chats for insert
  with check (auth.uid() = buyer_id);

create policy "Participants can update chats"
  on public.chats for update
  using (
    auth.uid() = buyer_id or
    auth.uid() = seller_id or
    is_admin()
  );

-- Chat Messages: チャット参加者のみ
create policy "Chat participants can view messages"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.chats c
      where c.id = chat_id and (
        c.buyer_id = auth.uid() or
        c.seller_id = auth.uid() or
        is_admin()
      )
    )
  );

create policy "Chat participants can create messages"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.chats c
      where c.id = chat_id and (
        c.buyer_id = auth.uid() or
        c.seller_id = auth.uid()
      )
    ) and sender_id = auth.uid()
  );

create policy "Chat participants can update messages"
  on public.chat_messages for update
  using (
    exists (
      select 1 from public.chats c
      where c.id = chat_id and (
        c.buyer_id = auth.uid() or
        c.seller_id = auth.uid() or
        is_admin()
      )
    )
  );

-- Payouts: adminのみ、販売者は自分のもののみ閲覧
create policy "Sellers can view own payouts"
  on public.payouts for select
  using (auth.uid() = seller_id or is_admin());

create policy "Admins can manage payouts"
  on public.payouts for all
  using (is_admin());

-- Payout Orders: payoutと同じ
create policy "Users can view payout orders"
  on public.payout_orders for select
  using (
    exists (
      select 1 from public.payouts p
      where p.id = payout_id and (p.seller_id = auth.uid() or is_admin())
    )
  );

create policy "Admins can manage payout orders"
  on public.payout_orders for all
  using (is_admin());

-- Announcements: 全員閲覧、adminのみ編集
create policy "Anyone can view active announcements"
  on public.announcements for select
  using (is_active = true or is_admin());

create policy "Admins can manage announcements"
  on public.announcements for all
  using (is_admin());

-- System Settings: adminのみ
create policy "Admins can view settings"
  on public.system_settings for select
  using (is_admin());

create policy "Admins can manage settings"
  on public.system_settings for all
  using (is_admin());
