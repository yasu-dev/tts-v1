// API エンドポイント設定
export const API_CONFIG = {
  // ベースURL（Netlify本番環境では相対パスを使用）
  baseURL: process.env.NODE_ENV === 'production' ? '' : '',
  
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
  
  // タイムアウト設定（ミリ秒）
  timeout: 30000,
  
  // リトライ設定
  retry: {
    attempts: 3,
    delay: 1000,
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
      // タイムアウト設定
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    };
    
    // リトライ機能付きのフェッチ
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= API_CONFIG.retry.attempts; attempt++) {
      try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        // レスポンスが成功した場合はそのまま返す
        if (response.ok) {
          return response;
        }
        
        // 4xx エラーの場合はリトライしない
        if (response.status >= 400 && response.status < 500) {
          return response;
        }
        
        // 5xx エラーの場合はリトライする
        lastError = new Error(`API Error: ${response.status} ${response.statusText}`);
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Network error');
        
        // AbortError（タイムアウト）の場合はリトライしない
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }
      }
      
      // 最後の試行でない場合は待機してからリトライ
      if (attempt < API_CONFIG.retry.attempts) {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.retry.delay * attempt));
      }
    }
    
    throw lastError || new Error('Request failed after retries');
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