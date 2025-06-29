'use client';

import React from 'react';

interface NexusHeaderProps {
  userType: 'seller' | 'staff';
  onSearchSubmit?: (query: string) => void;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  currentTime?: {
    utc: string;
    jst: string;
  };
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function NexusHeader({
  userType,
  onSearchSubmit,
  onNotificationClick,
  onSettingsClick,
  onLogout,
  currentTime = { utc: '14:23', jst: '23:23' },
  onMobileMenuToggle,
  isMobileMenuOpen = false
}: NexusHeaderProps) {

  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <header className="nexus-header flex items-center justify-between px-4 md:px-6 lg:px-10 relative overflow-hidden">
      {/* 背景シャインエフェクト */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="flex items-center gap-4 md:gap-6 lg:gap-8 z-10">
        {/* モバイルハンバーガーメニューボタン */}
        <button
          id="mobile-menu-button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-300"
          aria-label="メニューを開く"
          aria-expanded={isMobileMenuOpen}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        
        {/* ブランドアイデンティティ */}
        <div className="text-white">
          <div className="font-display text-xl md:text-2xl lg:text-3xl font-black text-white tracking-wider whitespace-nowrap">
            THE WORLD DOOR
          </div>
          <div className="hidden md:block text-xs md:text-sm lg:text-base font-medium text-white/95 mt-1 tracking-wide">
            フルフィルメントサービス
          </div>
        </div>
        
        {/* ナビゲーションピル - デスクトップのみ */}
        <nav className="nexus-nav hidden lg:flex gap-3 z-10">
          <a href="/dashboard" className="nav-pill bg-white/12 text-white/85 hover:text-white hover:bg-white/20 rounded-xl px-5 lg:px-7 py-2 lg:py-3 font-semibold text-sm lg:text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(255,206,0,0.4)]">
            ダッシュボード
          </a>
          <a href="/inventory" className="nav-pill text-white/85 hover:text-white hover:bg-white/12 rounded-xl px-5 lg:px-7 py-2 lg:py-3 font-semibold text-sm lg:text-base transition-all duration-300">
            在庫管理
          </a>
          <a href="/reports" className="nav-pill text-white/85 hover:text-white hover:bg-white/12 rounded-xl px-5 lg:px-7 py-2 lg:py-3 font-semibold text-sm lg:text-base transition-all duration-300">
            市場分析
          </a>
        </nav>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3 lg:gap-5 z-10">
        {/* タイムゾーンウィジェット - タブレット以上で表示 */}
        <div className="timezone-widget hidden md:flex gap-2 lg:gap-3">
          <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-xl px-3 lg:px-4 py-1.5 lg:py-2 text-white font-semibold">
            <div className="font-mono text-xs lg:text-sm mb-0.5 lg:mb-1">{currentTime.utc}</div>
            <div className="text-[10px] lg:text-xs opacity-80">UTC</div>
          </div>
          <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-xl px-3 lg:px-4 py-1.5 lg:py-2 text-white font-semibold">
            <div className="font-mono text-xs lg:text-sm mb-0.5 lg:mb-1">{currentTime.jst}</div>
            <div className="text-[10px] lg:text-xs opacity-80">JST</div>
          </div>
        </div>
        
        {/* ユーザープロファイル */}
        <div className="user-nexus flex items-center gap-2 md:gap-3 lg:gap-4 bg-white/15 backdrop-blur-xl border border-white/25 rounded-xl lg:rounded-2xl px-3 md:px-4 lg:px-5 py-2 lg:py-3 cursor-pointer transition-all duration-300 hover:bg-white/25 hover:translate-y-[-2px]">
          <div className="user-orb w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-nexus-red to-nexus-yellow to-nexus-green rounded-lg lg:rounded-xl flex items-center justify-center font-black text-sm lg:text-base text-white shadow-[0_0_20px_rgba(229,50,56,0.5)]">
            {userType === 'staff' ? 'S' : 'U'}
          </div>
          <div className="hidden sm:block">
            <div className="user-data text-white font-bold text-sm lg:text-base">
              {userType === 'staff' ? 'スタッフ' : 'セラー'}
            </div>
            <div className="user-role text-[10px] lg:text-xs text-white/80 mt-0.5">
              グローバル貿易ディレクター
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}