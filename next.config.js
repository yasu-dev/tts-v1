/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // CSS設定を追加
  compiler: {
    // styled-componentsやemotionの設定は不要なので削除
  },
  webpack: (config, { isServer }) => {
    // CSSの処理を改善
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
  // エラーオーバーレイの設定
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  // ファビコンエラーを防ぐ
  async headers() {
    return [
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
  // 不要なリダイレクトを削除
}

module.exports = nextConfig