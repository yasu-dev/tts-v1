/** @type {import('next').NextConfig} */
const nextConfig = {
  // 出力設定
  output: 'standalone',
  
  // 実験的機能
  experimental: {
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
  },
  
  // 画像最適化設定
  images: {
    domains: ['localhost', 'api.placeholder.com'],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // 静的生成設定
  trailingSlash: false,
  
  // TypeScript設定
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint設定
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // 環境変数設定
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  
  // リダイレクト設定
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ];
  },
  
  // ヘッダー設定
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  // Webpack設定
  webpack: (config, { isServer }) => {
    // Prisma Client の設定
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    
    return config;
  },
  
  // 本番環境でのソースマップ無効化
  productionBrowserSourceMaps: false,
  
  // 静的最適化設定
  poweredByHeader: false,
  
  // 圧縮設定
  compress: true,
  
  // React Strict Mode
  reactStrictMode: true,
  
  // SWC設定
  swcMinify: true,
  
  // API設定
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;