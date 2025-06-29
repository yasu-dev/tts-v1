'use client';

import Sidebar from './Sidebar';
import SearchModal from './SearchModal';
import NotificationPanel from './NotificationPanel';
import NexusHeader from './layouts/NexusHeader';
import { ReactNode, useState, useEffect } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  userType: 'seller' | 'staff';
}

export default function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState({ utc: '', jst: '' });

  // 現在時刻の更新
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcHours = now.getUTCHours().toString().padStart(2, '0');
      const utcMinutes = now.getUTCMinutes().toString().padStart(2, '0');
      const jstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      const jstHours = jstTime.getUTCHours().toString().padStart(2, '0');
      const jstMinutes = jstTime.getUTCMinutes().toString().padStart(2, '0');
      
      setCurrentTime({
        utc: `${utcHours}:${utcMinutes}`,
        jst: `${jstHours}:${jstMinutes}`
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // 1分ごとに更新
    return () => clearInterval(interval);
  }, []);

  // モバイルメニューが開いているときスクロールを無効化
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(true);
  };

  const handleLogout = () => {
    // ログアウト処理
    window.location.href = '/login';
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSettingsClick = () => {
    alert('設定パネルはデモ版では利用できません');
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="app-container">
      {/* モバイルサイドバーオーバーレイ */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* サイドバー - モバイルでトランジション */}
      <div className={`nexus-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <Sidebar userType={userType} />
      </div>
      
      {/* NexusHeader コンポーネントを使用 */}
      <NexusHeader
        userType={userType}
        onSearchSubmit={handleSearchSubmit}
        onNotificationClick={handleNotificationClick}
        onSettingsClick={handleSettingsClick}
        onLogout={handleLogout}
        currentTime={currentTime}
        onMobileMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      <div className="nexus-display flex-1 flex flex-col overflow-hidden bg-transparent">
        {/* Command Bar */}
        <div className="command-bar bg-white/95 backdrop-blur-[25px] border-b-[3px] border-nexus-border px-4 md:px-6 lg:px-8 py-4 lg:py-6 flex flex-col md:flex-row items-stretch md:items-center gap-4 lg:gap-6 shadow-[0_4px_25px_rgba(0,100,210,0.15)]">
          {/* Search Nexus */}
          <div className="search-nexus flex-1 max-w-full md:max-w-[580px] relative">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                handleSearchSubmit(searchQuery);
              }
            }} className="relative">
              <svg className="search-orb absolute left-4 lg:left-5 top-1/2 transform -translate-y-1/2 text-primary-blue text-lg h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="製品、市場、規制を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nexus-input text-sm md:text-base"
              />
            </form>
          </div>
          
          {/* Command Actions - モバイルでは横スクロール可能 */}
          <div className="command-actions flex gap-2 md:gap-3 lg:gap-4 overflow-x-auto">
            <button className="nexus-button flex items-center gap-2 lg:gap-3 whitespace-nowrap text-sm lg:text-base">
              <svg className="h-4 w-4 lg:h-5 lg:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">スマートフィルター</span>
              <span className="sm:hidden">フィルター</span>
            </button>
            
            <button className="nexus-button flex items-center gap-2 lg:gap-3 whitespace-nowrap text-sm lg:text-base">
              <svg className="h-4 w-4 lg:h-5 lg:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4m-4 8h4M4 16h4m0 0h6m-6 0v4" />
              </svg>
              <span className="hidden sm:inline">グローバルスキャン</span>
              <span className="sm:hidden">スキャン</span>
            </button>
            
            <button className="nexus-button primary flex items-center gap-2 lg:gap-3 whitespace-nowrap text-sm lg:text-base">
              <svg className="h-4 w-4 lg:h-5 lg:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">アセット追加</span>
              <span className="sm:hidden">追加</span>
            </button>
            
            {/* Notifications */}
            <div className="relative ml-auto md:ml-4">
              <button 
                onClick={handleNotificationClick}
                className="relative p-2.5 lg:p-3 text-primary-blue hover:text-white hover:bg-primary-blue rounded-xl transition-all duration-300 border-2 border-nexus-border hover:border-primary-blue"
              >
                <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 h-2.5 w-2.5 lg:h-3 lg:w-3 bg-nexus-red rounded-full shadow-[0_0_10px_rgba(229,50,56,0.7)]"></span>
              </button>
              <NotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
            </div>
            
            {/* Settings */}
            <button 
              onClick={handleSettingsClick}
              className="p-2.5 lg:p-3 text-primary-blue hover:text-white hover:bg-primary-blue rounded-xl transition-all duration-300 border-2 border-nexus-border hover:border-primary-blue"
            >
              <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            {/* Logout - デスクトップのみ */}
            <button 
              onClick={handleLogout}
              className="hidden md:block ml-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-nexus-red hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-[0_4px_15px_rgba(229,50,56,0.3)] hover:shadow-[0_6px_20px_rgba(229,50,56,0.4)] hover:translate-y-[-2px]"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="nexus-display grid-area-[main-display] bg-nexus-background/85 backdrop-blur-[15px] flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
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