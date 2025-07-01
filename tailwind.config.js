/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // THE WORLD DOOR Nexus Color System (完全なuiux指示.md準拠)
        'primary-blue': '#0064D2',
        'primary-blue-light': '#0078FF', 
        'primary-blue-lighter': '#40C4FF',
        'nexus-yellow': '#FFCE00',
        'nexus-red': '#E53238',
        'nexus-green': '#86B817',
        'nexus-purple': '#7B1FA2',
        'nexus-cyan': '#00BCD4',
        'nexus-background': '#F8FAFE',
        'nexus-surface': 'rgba(255, 255, 255, 0.97)',
        'nexus-text-primary': '#1A1A1A',
        'nexus-text-secondary': '#666666',
        'nexus-text-muted': '#999999',
        'nexus-border': 'rgba(0, 100, 210, 0.25)',
        
        // 地域別カラーリング (6地域システム)
        'region-americas': 'rgba(0, 100, 210, 0.35)',
        'region-europe': 'rgba(229, 50, 56, 0.35)', 
        'region-asia': 'rgba(255, 206, 0, 0.35)',
        'region-africa': 'rgba(134, 184, 23, 0.35)',
        'region-oceania': 'rgba(0, 188, 212, 0.35)',
        'region-global': 'rgba(123, 31, 162, 0.35)',
        
        // レガシー互換性
        primary: {
          500: '#0064D2',
          600: '#0052AA',
          700: '#004288',
        },
        purple: {
          500: '#7B1FA2',
          600: '#6a1b92',
        },
        red: {
          500: '#E53238',
          600: '#D12B31',
        },
        green: {
          500: '#86B817',
          600: '#74A015',
        },
        yellow: {
          500: '#FFCE00',
          600: '#E6B900',
        },
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'Inter', '-apple-system', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
        mono: ['Orbitron', 'monospace'],
        primary: ['Noto Sans JP', 'Inter', '-apple-system', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.6875rem',  // 11px - ラベル、バッジ
        'sm': '0.75rem',    // 12px - 補助テキスト
        'base': '0.8125rem', // 13px - 標準テキスト
        'lg': '0.875rem',   // 14px - メニュー、ボタン
        'xl': '0.9375rem',  // 15px - 見出し
        '2xl': '1rem',      // 16px - 大見出し
        '3xl': '1.125rem',  // 18px - タイトル
        '4xl': '1.25rem',   // 20px - 大タイトル
      },
      // ホバーエフェクトのみ許可（@keyframes禁止準拠）
      transitionProperty: {
        'nexus': 'all',
        'nexus-hover': 'transform, background-color, border-color, opacity, box-shadow',
      },
      transitionDuration: {
        'nexus': '300ms',
      },
      transitionTimingFunction: {
        'nexus': 'ease',
      },
      screens: {
        'xs': '475px',
        'sm': '640px', 
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px', // 指示書のブレークポイント
        '3xl': '1600px', // 指示書のブレークポイント
        '4xl': '1920px',
      },
      spacing: {
        '18': '4.5rem', // ブランドロゴサイズ用
        '21': '5.25rem', // 各種コンポーネント用
        '85': '21.25rem', // ヘッダー高さ (85px)
        '340': '85rem', // サイドバー幅 (340px)
      },
      borderRadius: {
        'nexus': '14px', // ボタン用
        'nexus-lg': '18px', // ロゴ用  
        'nexus-xl': '24px', // カード/テーブル用
      },
      boxShadow: {
        'nexus-header': '0 8px 32px rgba(0, 100, 210, 0.4)',
        'nexus-logo': '0 0 30px rgba(255, 206, 0, 0.8)',
        'nexus-card': '0 4px 25px rgba(0, 100, 210, 0.15)',
        'nexus-button': '0 4px 15px rgba(0, 100, 210, 0.3)',
        'nexus-button-hover': '0 6px 20px rgba(0, 100, 210, 0.4)',
      },
      backdropBlur: {
        'nexus': '25px',
      },
      backdropSaturate: {
        'nexus': '180%',
      },
    },
  },
  plugins: [],
}