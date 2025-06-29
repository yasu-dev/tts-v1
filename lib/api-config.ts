// API エンドポイント設定
export const API_CONFIG = {
  // ベースURL（環境変数から取得、または相対パス）
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  
  // エンドポイント定義
  endpoints: {
    // 認証関連
    auth: {
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      session: '/api/auth/session',
    },
    
    // 在庫管理
    inventory: {
      base: '/api/inventory',
      stats: '/api/inventory/stats',
    },
    
    // 商品管理
    products: {
      base: '/api/products',
      history: (id: string) => `/api/products/${id}/history`,
      barcode: '/api/products/barcode',
      inspection: '/api/products/inspection',
    },
    
    // スタッフ関連
    staff: {
      dashboard: '/api/staff/dashboard',
    },
    
    // レポート・分析
    reports: {
      analytics: '/api/reports/analytics',
      monthly: '/api/reports/monthly',
    },
    
    // タスク管理
    tasks: '/api/tasks',
    
    // ロケーション管理
    locations: '/api/locations',
    
    // 注文管理
    orders: {
      base: '/api/orders',
      shipping: '/api/orders/shipping',
      returns: '/api/orders/returns',
    },
    
    // eBay連携
    ebay: {
      listing: '/api/ebay/listing',
    },
    
    // ダッシュボード
    dashboard: '/api/dashboard',
  },
  
  // リクエストのデフォルトヘッダー
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
};

// APIクライアントヘルパー
export class ApiClient {
  static async fetch(endpoint: string, options?: RequestInit): Promise<Response> {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        ...API_CONFIG.defaultHeaders,
        ...(options?.headers || {}),
      },
    };
    
    return fetch(url, { ...defaultOptions, ...options });
  }
  
  static async get<T>(endpoint: string): Promise<T> {
    const response = await this.fetch(endpoint);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
  
  static async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
  
  static async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
  
  static async delete<T>(endpoint: string): Promise<T> {
    const response = await this.fetch(endpoint, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
} 