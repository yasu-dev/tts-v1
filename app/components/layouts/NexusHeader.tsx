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
    <header className="nexus-header flex items-center justify-between px-4 md:px-6 lg:px-8 relative overflow-hidden h-16">
      {/* 背景シャインエフェクト */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="flex items-center gap-3 md:gap-4 lg:gap-6 z-10">
        {/* モバイルハンバーガーメニューボタン */}
        <button
          id="mobile-menu-button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-200"
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
        
        {/* 検索バー */}
        <div className="flex-1 max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="商品を検索..."
              className="w-full px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-200"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4 z-10">
        {/* 日本時間のみ表示 */}
        <div className="hidden md:block bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-1.5 text-white">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-mono text-sm font-semibold">{currentTime.jst}</div>
              <div className="text-[10px] opacity-80">日本時間</div>
            </div>
          </div>
        </div>
        
        {/* 通知ボタン */}
        <button
          ref={notificationRef}
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="relative p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
          aria-label="通知"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
        
        {/* ユーザープロファイル */}
        <button 
          ref={profileRef as any}
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-2 hover:bg-white/20 transition-all duration-200"
        >
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm text-white border border-white/30">
            {userType === 'staff' ? 'S' : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-white font-semibold text-sm">
              {userType === 'staff' ? 'スタッフ' : 'セラー'}
            </div>
            <div className="text-[11px] text-white/70">
              管理者
            </div>
          </div>
          <svg className="w-4 h-4 text-white/60 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
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