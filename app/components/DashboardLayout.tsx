'use client';

import Sidebar from './Sidebar';
import SearchModal from './SearchModal';
import NotificationPanel from './NotificationPanel';
import { ReactNode, useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  userType: 'seller' | 'staff';
}

export default function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(true);
    }
  };

  const handleLogout = () => {
    // ログアウト処理
    window.location.href = '/login';
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // ダークモード切り替えの実装
    document.documentElement.classList.toggle('dark');
  };

  const handleSettingsClick = () => {
    // 設定パネルの表示（デモ用アラート）
    alert('設定パネルはデモ版では利用できません');
  };

  return (
    <div className="app-container">
      <Sidebar userType={userType} />
      
      {/* Global Command Center Header */}
      <header className="nexus-header flex items-center justify-between px-10 relative overflow-hidden">
        {/* Background Shine Effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        
        <div className="flex items-center gap-8 z-10">
          {/* Brand Identity */}
          <div className="text-white">
            <div className="font-display text-3xl font-black text-white tracking-wider">
              THE WORLD DOOR
            </div>
            <div className="text-base font-medium text-white/95 mt-1 tracking-wide">
              フルフィルメントサービス
            </div>
          </div>
          
          {/* Navigation Pills */}
          <nav className="flex gap-3 z-10">
            <a href="/dashboard" className="nav-pill bg-white/12 text-white/85 hover:text-white hover:bg-white/20 rounded-xl px-7 py-3 font-semibold text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(255,206,0,0.4)]">
              ダッシュボード
            </a>
            <a href="/inventory" className="nav-pill text-white/85 hover:text-white hover:bg-white/12 rounded-xl px-7 py-3 font-semibold text-base transition-all duration-300">
              在庫管理
            </a>
            <a href="/reports" className="nav-pill text-white/85 hover:text-white hover:bg-white/12 rounded-xl px-7 py-3 font-semibold text-base transition-all duration-300">
              市場分析
            </a>
          </nav>
        </div>
        
        <div className="flex items-center gap-5 z-10">
          {/* Timezone Widgets */}
          <div className="timezone-widget bg-white/15 backdrop-blur-xl border border-white/25 rounded-xl px-4 py-2 text-white font-semibold">
            <div className="font-mono text-sm mb-1">14:23</div>
            <div className="text-xs opacity-80">UTC</div>
          </div>
          <div className="timezone-widget bg-white/15 backdrop-blur-xl border border-white/25 rounded-xl px-4 py-2 text-white font-semibold">
            <div className="font-mono text-sm mb-1">23:23</div>
            <div className="text-xs opacity-80">JST</div>
          </div>
          
          {/* User Profile */}
          <div className="user-nexus flex items-center gap-4 bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl px-5 py-3 cursor-pointer transition-all duration-300 hover:bg-white/25 hover:translate-y-[-2px]">
            <div className="user-orb w-10 h-10 bg-gradient-to-br from-nexus-red to-nexus-yellow to-nexus-green rounded-xl flex items-center justify-center font-black text-base text-white shadow-[0_0_20px_rgba(229,50,56,0.5)]">
              {userType === 'staff' ? 'S' : 'U'}
            </div>
            <div>
              <div className="user-data text-white font-bold text-base">
                {userType === 'staff' ? 'スタッフ' : 'セラー'}
              </div>
              <div className="user-role text-xs text-white/80 mt-0.5">
                グローバル貿易ディレクター
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
        {/* Command Bar */}
        <div className="command-bar bg-white/95 backdrop-blur-[25px] border-b-[3px] border-nexus-border px-8 py-6 flex items-center gap-6 shadow-[0_4px_25px_rgba(0,100,210,0.15)]">
          {/* Search Nexus */}
          <div className="search-nexus flex-1 max-w-[580px] relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <svg className="search-orb absolute left-5 top-1/2 transform -translate-y-1/2 text-primary-blue text-lg h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="製品、市場、規制、またはグローバルインテリジェンスを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nexus-input"
              />
            </form>
          </div>
          
          {/* Command Actions */}
          <div className="command-actions flex gap-4">

            <button className="nexus-button flex items-center gap-3">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              スマートフィルター
            </button>
            
            <button className="nexus-button flex items-center gap-3">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4m-4 8h4M4 16h4m0 0h6m-6 0v4" />
              </svg>
              グローバルスキャン
            </button>
            
            <button className="nexus-button primary flex items-center gap-3">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              アセット追加
            </button>
            
            {/* Notifications */}
            <div className="relative ml-4">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-3 text-primary-blue hover:text-white hover:bg-primary-blue rounded-xl transition-all duration-300 border-2 border-nexus-border hover:border-primary-blue"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 h-3 w-3 bg-nexus-red rounded-full shadow-[0_0_10px_rgba(229,50,56,0.7)]"></span>
              </button>
              <NotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
            </div>
            
            {/* Settings */}
            <button 
              onClick={handleSettingsClick}
              className="p-3 text-primary-blue hover:text-white hover:bg-primary-blue rounded-xl transition-all duration-300 border-2 border-nexus-border hover:border-primary-blue"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="ml-2 px-6 py-3 bg-nexus-red hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-[0_4px_15px_rgba(229,50,56,0.3)] hover:shadow-[0_6px_20px_rgba(229,50,56,0.4)] hover:translate-y-[-2px]"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="nexus-display grid-area-[main-display] bg-nexus-background/85 backdrop-blur-[15px] flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        query={searchQuery}
      />
    </div>
  );
}