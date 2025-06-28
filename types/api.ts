// Database Enums
export type ProductStatus = 
  | 'inbound'      // 入庫
  | 'inspection'   // 検品
  | 'storage'      // 保管
  | 'listing'      // 出品
  | 'ordered'      // 受注
  | 'shipping'     // 出荷
  | 'delivery'     // 配送
  | 'sold'         // 売約済み
  | 'returned';    // 返品

export type ProductCategory = 
  | 'camera_body'  // カメラ本体
  | 'lens'         // レンズ
  | 'watch'        // 腕時計
  | 'accessory';   // アクセサリ

export type ProductCondition = 
  | 'new'          // 新品
  | 'like_new'     // 新品同様
  | 'excellent'    // 極美品
  | 'very_good'    // 美品
  | 'good'         // 良品
  | 'fair'         // 中古美品
  | 'poor';        // 中古

export type UserRole = 
  | 'seller'       // セラー
  | 'staff'        // スタッフ
  | 'admin';       // 管理者

export type OrderStatus = 
  | 'pending'      // 保留中
  | 'confirmed'    // 確認済み
  | 'processing'   // 処理中
  | 'shipped'      // 出荷済み
  | 'delivered'    // 配送完了
  | 'cancelled'    // キャンセル
  | 'returned';    // 返品

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
  };
  error?: string;
}

export interface SessionResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
  };
  error?: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  status: ProductStatus;
  price: number;
  condition: ProductCondition;
  description?: string;
  imageUrl?: string;
  entryDate: Date;
  sellerId: string;
  inspectedAt?: Date;
  inspectedBy?: string;
  inspectionNotes?: string;
  currentLocationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  category: string; // Japanese display values
  price: number;
  condition: string; // Japanese display values
  description?: string;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  id: string;
  name?: string;
  price?: number;
  condition?: string; // Japanese display values
  description?: string;
  imageUrl?: string;
  status?: string; // Japanese display values
}

export interface InspectionRequest {
  productId: string;
  inspectionNotes?: string;
  condition?: string; // Japanese display values
  status?: string; // Japanese display values
  locationId?: string;
}

// Location Types
export interface Location {
  id: string;
  code: string;
  name: string;
  zone: string;
  capacity?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    products: number;
  };
}

export interface CreateLocationRequest {
  code: string;
  name: string;
  zone: string;
  capacity?: number;
}

export interface UpdateLocationRequest {
  id: string;
  name?: string;
  capacity?: number;
  isActive?: boolean;
}

// Inventory Movement Types
export interface InventoryMovement {
  id: string;
  productId: string;
  fromLocationId?: string;
  toLocationId?: string;
  movedBy: string;
  notes?: string;
  createdAt: Date;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  fromLocation?: {
    id: string;
    code: string;
    name: string;
  };
  toLocation?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface CreateMovementRequest {
  productId: string;
  toLocationId: string;
  notes?: string;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress?: string;
  paymentMethod?: string;
  notes?: string;
  orderDate: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: string;
    username: string;
    email: string;
  };
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    sku: string;
    imageUrl?: string;
  };
}

export interface CreateOrderRequest {
  customerId: string;
  items: {
    productId: string;
    quantity?: number;
    price?: number;
  }[];
  shippingAddress?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface UpdateOrderRequest {
  orderId: string;
  status?: string; // Japanese display values
  shippingAddress?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface ShippingRequest {
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
  shippingMethod?: string;
  notes?: string;
}

export interface ReturnRequest {
  orderId: string;
  productIds: string[];
  reason?: string;
  refundAmount?: number;
  notes?: string;
}

export interface ReturnProcessingRequest {
  productIds: string[];
  status?: string; // Japanese display values
  locationId?: string;
  notes?: string;
}

// Activity Types
export interface Activity {
  id: string;
  type: string;
  description: string;
  userId?: string;
  productId?: string;
  orderId?: string;
  metadata?: any;
  createdAt: Date;
  user?: {
    id: string;
    username: string;
  };
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  order?: {
    id: string;
    orderNumber: string;
  };
}

// Error Types
export interface ApiError {
  error: string;
  status?: number;
  details?: any;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Utility Types
export type CreateRequest<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRequest<T> = Partial<T> & { id: string };

// Status Display Mappings
export const StatusDisplayMap = {
  // Product Status
  inbound: '入庫',
  inspection: '検品',
  storage: '保管',
  listing: '出品',
  ordered: '受注',
  shipping: '出荷',
  delivery: '配送',
  sold: '売約済み',
  returned: '返品',

  // Order Status
  pending: '保留中',
  confirmed: '確認済み',
  processing: '処理中',
  shipped: '出荷済み',
  delivered: '配送完了',
  cancelled: 'キャンセル',

  // Product Category
  camera_body: 'カメラ本体',
  lens: 'レンズ',
  watch: '腕時計',
  accessory: 'アクセサリ',

  // Product Condition
  new: '新品',
  like_new: '新品同様',
  excellent: '極美品',
  very_good: '美品',
  good: '良品',
  fair: '中古美品',
  poor: '中古',
} as const;