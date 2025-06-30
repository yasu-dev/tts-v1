'use client';

import React, { useState, useRef, useEffect } from 'react';
import EnhancedNotificationPanel from '../EnhancedNotificationPanel';
import ProfileMenu from '../ProfileMenu';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const notificationRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // 通知数を取得
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch(`/api/notifications?role=${userType}`);
        const data = await response.json();
        const unreadCount = data.filter((n: any) => !n.read).length;
        setNotificationCount(unreadCount);
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
      }
    };

    fetchNotificationCount();
    // 定期的に通知数を更新
    const interval = setInterval(fetchNotificationCount, 60000); // 1分ごと
    return () => clearInterval(interval);
  }, [userType]);

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
        
        {/* 通知ボタン */}
        <button
          ref={notificationRef}
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="relative p-2 lg:p-2.5 bg-white/15 backdrop-blur-xl border border-white/25 rounded-lg lg:rounded-xl text-white hover:bg-white/25 transition-all duration-300 hover:translate-y-[-2px]"
          aria-label="通知"
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
        
        {/* ユーザープロファイル */}
        <div 
          ref={profileRef}
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="user-nexus flex items-center gap-2 md:gap-2.5 lg:gap-3 bg-white/15 backdrop-blur-xl border border-white/25 rounded-lg lg:rounded-xl px-2.5 md:px-3 lg:px-4 py-1.5 lg:py-2 cursor-pointer transition-all duration-300 hover:bg-white/25 hover:translate-y-[-2px]"
        >
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
          <svg className="w-4 h-4 text-white/60 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* 通知パネル */}
      <EnhancedNotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        userType={userType}
        anchorRef={notificationRef}
      />
      
      {/* プロフィールメニュー */}
      <ProfileMenu
        userType={userType}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        anchorRef={profileRef}
      />
    </header>
  );
}