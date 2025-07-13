/**
 * 開発環境設定
 */
export const developmentConfig = {
  // データソース設定
  dataSource: 'mock' as const,
  
  // データベース設定
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
    provider: 'sqlite',
  },
  
  // 外部サービス設定
  services: {
    useMock: true,
    
    // eBay設定
    ebay: {
      apiUrl: '/api/mock/ebay',
      sandbox: true,
    },
    
    // 配送設定
    shipping: {
      yamato: { apiUrl: '/api/mock/yamato' },
      sagawa: { apiUrl: '/api/mock/sagawa' },
    },
    
    // AI設定
    ai: {
      openai: { apiUrl: '/api/mock/ai' },
    },
    
    // 通知設定
    notification: {
      email: { provider: 'console' },
      push: { provider: 'mock' },
    },
  },
  
  // ログ設定
  logging: {
    level: 'debug',
    console: true,
    file: false,
  },
  
  // セキュリティ設定
  security: {
    jwtSecret: 'dev-secret-key',
    sessionDuration: 24 * 60 * 60 * 1000, // 24時間
    twoFactorAuth: false,
  },
}; 