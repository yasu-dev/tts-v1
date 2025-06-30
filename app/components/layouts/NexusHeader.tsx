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
    <header className="nexus-header flex items-center justify-between px-3 md:px-4 lg:px-6 relative overflow-hidden">
      {/* 背景シャインエフェクト */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="flex items-center gap-3 md:gap-4 lg:gap-6 z-10">
        {/* モバイルハンバーガーメニューボタン */}
        <button
          id="mobile-menu-button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-1.5 text-white hover:bg-white/20 rounded-lg transition-all duration-300"
          aria-label="メニューを開く"
          aria-expanded={isMobileMenuOpen}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        
        {/* ブランドアイデンティティ */}
        <div className="text-white">
          <div className="font-display text-base md:text-lg lg:text-xl font-black text-white tracking-wider whitespace-nowrap">
            THE WORLD DOOR
          </div>
          <div className="hidden md:block text-[10px] md:text-xs lg:text-sm font-medium text-white/95 mt-0.5 tracking-wide">
            フルフィルメントサービス
          </div>
        </div>
        
        {/* ナビゲーションピル - デスクトップのみ */}
        <nav className="nexus-nav hidden lg:flex gap-2 z-10">
          <a href="/dashboard" className="nav-pill bg-white/12 text-white/85 hover:text-white hover:bg-white/20 rounded-lg px-3 lg:px-4 py-1.5 lg:py-2 font-semibold text-xs lg:text-sm transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_4px_12px_rgba(255,206,0,0.3)]">
            ダッシュボード
          </a>
          <a href="/inventory" className="nav-pill text-white/85 hover:text-white hover:bg-white/12 rounded-lg px-3 lg:px-4 py-1.5 lg:py-2 font-semibold text-xs lg:text-sm transition-all duration-300">
            在庫管理
          </a>
          <a href="/reports" className="nav-pill text-white/85 hover:text-white hover:bg-white/12 rounded-lg px-3 lg:px-4 py-1.5 lg:py-2 font-semibold text-xs lg:text-sm transition-all duration-300">
            市場分析
          </a>
        </nav>
      </div>
      
      <div className="flex items-center gap-2 md:gap-2.5 lg:gap-3 z-10">
        {/* タイムゾーンウィジェット - タブレット以上で表示 */}
        <div className="timezone-widget hidden md:flex gap-1.5 lg:gap-2">
          <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-lg px-2 lg:px-3 py-1 lg:py-1.5 text-white font-semibold">
            <div className="font-mono text-[11px] lg:text-xs mb-0.5">{currentTime.utc}</div>
            <div className="text-[9px] lg:text-[10px] opacity-80">UTC</div>
          </div>
          <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-lg px-2 lg:px-3 py-1 lg:py-1.5 text-white font-semibold">
            <div className="font-mono text-[11px] lg:text-xs mb-0.5">{currentTime.jst}</div>
            <div className="text-[9px] lg:text-[10px] opacity-80">JST</div>
          </div>
        </div>
        
        {/* ユーザープロファイル */}
        <div className="user-nexus flex items-center gap-2 md:gap-2.5 lg:gap-3 bg-white/15 backdrop-blur-xl border border-white/25 rounded-lg lg:rounded-xl px-2.5 md:px-3 lg:px-4 py-1.5 lg:py-2 cursor-pointer transition-all duration-300 hover:bg-white/25 hover:translate-y-[-2px]">
          <div className="user-orb w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-nexus-red to-nexus-yellow to-nexus-green rounded-md lg:rounded-lg flex items-center justify-center font-black text-xs lg:text-sm text-white shadow-[0_0_12px_rgba(229,50,56,0.4)]">
            {userType === 'staff' ? 'S' : 'U'}
          </div>
          <div className="hidden sm:block">
            <div className="user-data text-white font-bold text-xs lg:text-sm">
              {userType === 'staff' ? 'スタッフ' : 'セラー'}
            </div>
            <div className="user-role text-[9px] lg:text-[10px] text-white/80 mt-0.5">
              グローバル貿易ディレクター
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}