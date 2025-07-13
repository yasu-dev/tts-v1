/**
 * 本番環境設定
 */
export const productionConfig = {
  // データソース設定
  dataSource: 'prisma' as const,
  
  // データベース設定
  database: {
    url: process.env.DATABASE_URL!,
    provider: 'postgresql',
    pool: {
      min: 2,
      max: 10,
    },
  },
  
  // 外部サービス設定
  services: {
    useMock: false,
    
    // eBay設定
    ebay: {
      apiUrl: 'https://api.ebay.com',
      appId: process.env.EBAY_APP_ID!,
      devId: process.env.EBAY_DEV_ID!,
      certId: process.env.EBAY_CERT_ID!,
      sandbox: false,
    },
    
    // 配送設定
    shipping: {
      yamato: {
        apiUrl: 'https://api.yamato.co.jp',
        apiKey: process.env.YAMATO_API_KEY!,
      },
      sagawa: {
        apiUrl: 'https://api.sagawa.co.jp',
        apiKey: process.env.SAGAWA_API_KEY!,
      },
    },
    
    // AI設定
    ai: {
      openai: {
        apiUrl: 'https://api.openai.com',
        apiKey: process.env.OPENAI_API_KEY!,
      },
    },
    
    // 通知設定
    notification: {
      email: {
        provider: 'sendgrid',
        apiKey: process.env.SENDGRID_API_KEY!,
        fromEmail: process.env.SENDGRID_FROM_EMAIL!,
      },
      push: {
        provider: 'firebase',
        serverKey: process.env.FIREBASE_SERVER_KEY!,
      },
    },
    
    // ストレージ設定
    storage: {
      s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: process.env.AWS_REGION!,
        bucketName: process.env.S3_BUCKET_NAME!,
      },
    },
    
    // キャッシュ設定
    cache: {
      redis: {
        url: process.env.REDIS_URL!,
        ttl: 3600, // 1時間
      },
    },
  },
  
  // ログ設定
  logging: {
    level: 'info',
    console: false,
    file: true,
    external: {
      sentry: {
        dsn: process.env.SENTRY_DSN!,
      },
      datadog: {
        apiKey: process.env.DATADOG_API_KEY!,
      },
    },
  },
  
  // セキュリティ設定
  security: {
    jwtSecret: process.env.JWT_SECRET!,
    sessionDuration: 8 * 60 * 60 * 1000, // 8時間
    twoFactorAuth: true,
    rateLimiting: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15分
      maxRequests: 100,
    },
  },
  
  // 監視設定
  monitoring: {
    healthCheck: {
      enabled: true,
      interval: 30000, // 30秒
    },
    metrics: {
      enabled: true,
      prometheus: {
        endpoint: '/metrics',
      },
    },
  },
}; 