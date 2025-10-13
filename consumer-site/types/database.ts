// Database type definitions based on kondate-gacha-spec-final.md

export type UserRole = 'buyer' | 'seller' | 'admin';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type AnnouncementTarget = 'buyers' | 'sellers' | 'all';

export interface Profile {
  user_id: string;
  role: UserRole;
  nickname: string | null;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface BuyerProfile {
  user_id: string;
  default_shipping: ShippingAddress | null;
  addresses: ShippingAddress[] | null;
}

export interface ShippingAddress {
  postal_code: string;
  prefecture: string;
  city: string;
  address1: string;
  address2?: string;
  name: string;
  phone: string;
}

export interface Seller {
  user_id: string;
  farm_name: string;
  introduction: string | null;
  prefecture: string | null;
  city: string | null;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  phone: string | null;
  profile_image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  name: string;
  description: string | null;
  origin: string | null;
  irregular_reason: string | null;
  category: string | null;
  image_urls: string[] | null;
  is_active: boolean;
  created_at: string;
}

export interface ProductSKU {
  id: string;
  product_id: string;
  weight_grams: number | null;
  unit_count: number;
  price_yen: number;
  stock: number;
  shipping_method: string | null;
  is_active: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  status: OrderStatus;
  subtotal_yen: number;
  shipping_fee_yen: number;
  platform_fee_yen: number;
  total_amount_yen: number;
  shipping_info: ShippingInfo | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
}

export interface ShippingInfo {
  name: string;
  postal_code: string;
  prefecture: string;
  city: string;
  address1: string;
  address2?: string;
  phone: string;
  eta?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  sku_id: string;
  quantity: number;
  unit_price_yen: number;
  subtotal_yen: number;
}

export interface Review {
  id: string;
  buyer_id: string;
  product_id: string;
  order_id: string | null;
  nickname: string | null;
  rating: number;
  comment: string | null;
  image_urls: string[] | null;
  is_visible: boolean;
  deleted_by: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface Chat {
  id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface Payout {
  id: string;
  seller_id: string;
  period_start: string;
  period_end: string;
  total_sales_yen: number;
  platform_fee_yen: number;
  payout_amount_yen: number;
  status: PayoutStatus;
  transfer_method: string | null;
  transfer_date: string | null;
  notes: string | null;
  processed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target: AnnouncementTarget;
  is_active: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

// Extended types with relations
export interface ProductWithSeller extends Product {
  seller: Seller;
  skus: ProductSKU[];
  reviews?: Review[];
}

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    sku: ProductSKU & {
      product: Product;
    };
  })[];
  buyer: Profile;
  seller: Seller;
}
