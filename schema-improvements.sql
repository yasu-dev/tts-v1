-- データベーススキーマ改善案
-- 実行前に必ずバックアップを取得してください

-- 1. 外部キー制約の有効化
PRAGMA foreign_keys = ON;

-- 2. パフォーマンス改善のためのインデックス追加

-- Activities テーブルの重要インデックス
CREATE INDEX IF NOT EXISTS idx_activities_type_created_at 
ON activities(type, createdAt DESC);

CREATE INDEX IF NOT EXISTS idx_activities_product_id 
ON activities(productId) WHERE productId IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activities_order_id 
ON activities(orderId) WHERE orderId IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activities_user_id 
ON activities(userId) WHERE userId IS NOT NULL;

-- Products テーブルのステータスインデックス
CREATE INDEX IF NOT EXISTS idx_products_status 
ON products(status);

CREATE INDEX IF NOT EXISTS idx_products_seller_id 
ON products(sellerId);

CREATE INDEX IF NOT EXISTS idx_products_created_at 
ON products(createdAt DESC);

-- InventoryMovement テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id 
ON inventory_movements(productId);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at 
ON inventory_movements(createdAt DESC);

-- KPIMetrics テーブルのインデックス（レポート用）
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_date_category 
ON kpi_metrics(date, category);

CREATE INDEX IF NOT EXISTS idx_kpi_metrics_name_date 
ON kpi_metrics(name, date DESC);

-- Sessions テーブルの有効期限インデックス
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at 
ON sessions(expiresAt);

-- Orders テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_orders_customer_id 
ON orders(customerId);

CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_order_date 
ON orders(orderDate DESC);

-- DeliveryPlan テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_delivery_plans_seller_id 
ON delivery_plans(sellerId);

CREATE INDEX IF NOT EXISTS idx_delivery_plans_status 
ON delivery_plans(status);

-- VideoRecords テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_video_records_product_id 
ON video_records(productId) WHERE productId IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_video_records_order_id 
ON video_records(orderId) WHERE orderId IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_video_records_staff_id 
ON video_records(staffId);

-- Listings テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_listings_product_id 
ON listings(productId);

CREATE INDEX IF NOT EXISTS idx_listings_status 
ON listings(status);

-- Shipments テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_shipments_order_id 
ON shipments(orderId);

CREATE INDEX IF NOT EXISTS idx_shipments_status 
ON shipments(status);

-- ProductImages テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_product_images_product_id 
ON product_images(productId);

-- Tasks テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_tasks_status 
ON tasks(status);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to 
ON tasks(assignedTo) WHERE assignedTo IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_due_date 
ON tasks(dueDate) WHERE dueDate IS NOT NULL;

-- 3. データクリーンアップ用クエリ

-- 期限切れセッションの削除
-- DELETE FROM sessions WHERE expiresAt < datetime('now');

-- 古いActivityログの削除（6ヶ月以上前）
-- DELETE FROM activities WHERE createdAt < datetime('now', '-6 months');

-- 古いKPIデータのアーカイブ（1年以上前）
-- 実際の削除前にアーカイブテーブルへの移動を推奨
-- DELETE FROM kpi_metrics WHERE date < datetime('now', '-1 year');

-- 4. データ整合性チェック用クエリ

-- 孤立レコードの検出
-- SELECT 'activities' as table_name, COUNT(*) as orphaned_count
-- FROM activities a
-- WHERE a.productId IS NOT NULL 
-- AND NOT EXISTS (SELECT 1 FROM products p WHERE p.id = a.productId)
-- UNION ALL
-- SELECT 'order_items', COUNT(*)
-- FROM order_items oi
-- WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.id = oi.orderId)
-- UNION ALL
-- SELECT 'product_images', COUNT(*)
-- FROM product_images pi
-- WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.id = pi.productId);

-- 5. 統計情報更新（SQLiteは自動で行うが、明示的に実行可能）
ANALYZE;

-- 6. VACUUMでデータベースの最適化
-- 注意: VACUUMは時間がかかる可能性があります
-- VACUUM;