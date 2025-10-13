import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Netlify対応: 画像最適化
  images: {
    domains: ['your-project-id.supabase.co'], // Supabase Storageドメインを追加
    unoptimized: false, // Netlifyの画像最適化を使用
  },
};

export default nextConfig;
