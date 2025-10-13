-- Test Data for Kondate Gacha
-- This file contains sample data for demo purposes
-- Real Supabase Auth user IDs from the dashboard

-- Insert test seller profiles
INSERT INTO profiles (user_id, role, full_name, created_at) VALUES
('9791a930-56c0-4817-9ca0-ff4754dfa344', 'seller', '山田太郎', NOW()),
('07579be8-f6d7-4168-a280-e396703ad48c', 'seller', '田中花子', NOW()),
('f085de3f-1f8b-4542-a53d-e81e1e5556ce', 'seller', '鈴木一郎', NOW());

-- Insert seller details
INSERT INTO sellers (user_id, farm_name, introduction, prefecture, city, address_line1, postal_code, phone, is_active, created_at) VALUES
('9791a930-56c0-4817-9ca0-ff4754dfa344', '山田農園', '茨城県つくば市で30年以上野菜を栽培しています。規格外でも美味しい野菜をお届けします。', '茨城県', 'つくば市', '学園の森1-2-3', '3001234', '0298001234', true, NOW()),
('07579be8-f6d7-4168-a280-e396703ad48c', '田中野菜店', '千葉の新鮮野菜を産地直送でお届けします。', '千葉県', '千葉市', '中央区本町2-3-4', '2601234', '0432001234', true, NOW()),
('f085de3f-1f8b-4542-a53d-e81e1e5556ce', '鈴木ファーム', '有機栽培にこだわった野菜作りをしています。', '埼玉県', '川越市', '新富町1-1-1', '3501234', '0492001234', true, NOW());

-- Insert products
INSERT INTO products (seller_id, name, description, origin, irregular_reason, category, is_active, created_at) VALUES
-- 山田農園の商品
('9791a930-56c0-4817-9ca0-ff4754dfa344', '規格外人参', '形はふぞろいですが、甘みたっぷりの人参です。サラダやジュースに最適。', '茨城県つくば市', '形がふぞろい', '根菜', true, NOW()),
('9791a930-56c0-4817-9ca0-ff4754dfa344', 'キズありじゃがいも', '表面にキズがありますが、中身は問題ありません。煮物やカレーに。', '茨城県つくば市', '表面にキズ', '根菜', true, NOW()),
('9791a930-56c0-4817-9ca0-ff4754dfa344', '小ぶりな玉ねぎ', 'サイズは小さめですが、甘みと旨味が凝縮されています。', '茨城県つくば市', 'サイズが規格外', '根菜', true, NOW()),
('9791a930-56c0-4817-9ca0-ff4754dfa344', '曲がりきゅうり', '曲がっていますが味は変わりません。スライスすれば気になりません。', '茨城県つくば市', '形が曲がっている', '果菜', true, NOW()),

-- 田中野菜店の商品
('07579be8-f6d7-4168-a280-e396703ad48c', '不揃いトマト', 'サイズや形が不揃いなトマト。完熟で甘みたっぷり。', '千葉県千葉市', 'サイズと形が不揃い', '果菜', true, NOW()),
('07579be8-f6d7-4168-a280-e396703ad48c', '傷ありピーマン', '表面に傷がありますが、新鮮で苦味が少ないピーマンです。', '千葉県千葉市', '表面に傷', '果菜', true, NOW()),
('07579be8-f6d7-4168-a280-e396703ad48c', '外葉付きキャベツ', '外葉が付いたままですが、中は新鮮。お得な1玉。', '千葉県千葉市', '外葉付き', '葉物', true, NOW()),
('07579be8-f6d7-4168-a280-e396703ad48c', '小さめレタス', 'サイズは小さいですが、シャキシャキ感抜群です。', '千葉県千葉市', 'サイズが小さい', '葉物', true, NOW()),

-- 鈴木ファームの商品
('f085de3f-1f8b-4542-a53d-e81e1e5556ce', '有機なす', '有機栽培のなす。形は不揃いですが味は絶品。', '埼玉県川越市', '形が不揃い', '果菜', true, NOW()),
('f085de3f-1f8b-4542-a53d-e81e1e5556ce', '有機大根', '曲がった有機大根。煮物や味噌汁に最適です。', '埼玉県川越市', '形が曲がっている', '根菜', true, NOW()),
('f085de3f-1f8b-4542-a53d-e81e1e5556ce', '有機ほうれん草', '虫食いありますが、無農薬の証。栄養価も高いです。', '埼玉県川越市', '虫食い跡', '葉物', true, NOW()),
('f085de3f-1f8b-4542-a53d-e81e1e5556ce', '有機かぼちゃ', '形が不揃いな有機かぼちゃ。甘くてホクホクです。', '埼玉県川越市', '形が不揃い', '果菜', true, NOW());

-- Insert product SKUs
-- Note: products tableからidを取得してから挿入する必要があるため、
-- サブクエリを使用してproduct_idを取得します

INSERT INTO product_skus (product_id, weight_grams, price_yen, stock, shipping_method, is_active)
SELECT id, 1000, 300, 50, '常温', true FROM products WHERE name = '規格外人参' AND seller_id = '9791a930-56c0-4817-9ca0-ff4754dfa344'
UNION ALL
SELECT id, 3000, 800, 30, '常温', true FROM products WHERE name = '規格外人参' AND seller_id = '9791a930-56c0-4817-9ca0-ff4754dfa344'
UNION ALL
SELECT id, 2000, 250, 40, '常温', true FROM products WHERE name = 'キズありじゃがいも' AND seller_id = '9791a930-56c0-4817-9ca0-ff4754dfa344'
UNION ALL
SELECT id, 5000, 600, 40, '常温', true FROM products WHERE name = 'キズありじゃがいも' AND seller_id = '9791a930-56c0-4817-9ca0-ff4754dfa344'
UNION ALL
SELECT id, 1000, 200, 50, '常温', true FROM products WHERE name = '小ぶりな玉ねぎ' AND seller_id = '9791a930-56c0-4817-9ca0-ff4754dfa344'
UNION ALL
SELECT id, 3000, 550, 50, '常温', true FROM products WHERE name = '小ぶりな玉ねぎ' AND seller_id = '9791a930-56c0-4817-9ca0-ff4754dfa344'
UNION ALL
SELECT id, 500, 180, 60, '冷蔵', true FROM products WHERE name = '曲がりきゅうり' AND seller_id = '9791a930-56c0-4817-9ca0-ff4754dfa344'
UNION ALL
SELECT id, 1000, 350, 40, '冷蔵', true FROM products WHERE name = '不揃いトマト' AND seller_id = '07579be8-f6d7-4168-a280-e396703ad48c'
UNION ALL
SELECT id, 500, 150, 70, '冷蔵', true FROM products WHERE name = '傷ありピーマン' AND seller_id = '07579be8-f6d7-4168-a280-e396703ad48c'
UNION ALL
SELECT id, 1000, 280, 50, '冷蔵', true FROM products WHERE name = '外葉付きキャベツ' AND seller_id = '07579be8-f6d7-4168-a280-e396703ad48c'
UNION ALL
SELECT id, 500, 220, 45, '冷蔵', true FROM products WHERE name = '小さめレタス' AND seller_id = '07579be8-f6d7-4168-a280-e396703ad48c'
UNION ALL
SELECT id, 500, 320, 55, '冷蔵', true FROM products WHERE name = '有機なす' AND seller_id = 'f085de3f-1f8b-4542-a53d-e81e1e5556ce'
UNION ALL
SELECT id, 1000, 280, 65, '冷蔵', true FROM products WHERE name = '有機大根' AND seller_id = 'f085de3f-1f8b-4542-a53d-e81e1e5556ce'
UNION ALL
SELECT id, 200, 250, 70, '冷蔵', true FROM products WHERE name = '有機ほうれん草' AND seller_id = 'f085de3f-1f8b-4542-a53d-e81e1e5556ce'
UNION ALL
SELECT id, 1500, 400, 30, '常温', true FROM products WHERE name = '有機かぼちゃ' AND seller_id = 'f085de3f-1f8b-4542-a53d-e81e1e5556ce';
