'use client';

import React, { ReactNode, useState, useEffect, useRef } from 'react';
import NexusHeader from './NexusHeader';
import SearchModal from '../SearchModal';
import UnifiedProductFlow from '../features/flow-nav/UnifiedProductFlow';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface DashboardLayoutProps {
  children: ReactNode;
  userType: 'seller' | 'staff';
  showAnalytics?: boolean;
  analyticsContent?: ReactNode;
}

export default function DashboardLayout({ 
  children, 
  userType, 
  showAnalytics = false,
  analyticsContent 
}: DashboardLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFlowCollapsed, setIsFlowCollapsed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { showToast } = useToast();

  const getCurrentTime = () => {
    const now = new Date();
    const utc = now.toUTCString().split(' ')[4].slice(0, 5);
    const jst = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);
    
    return { utc, jst };
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  // 時刻を1分ごとに更新
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    
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

  // 自動スクロール検知によるフロー開閉
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    console.log('スクロール検知初期化:', scrollContainer);
    if (!scrollContainer) {
      console.log('scrollContainer が null です');
      return;
    }

    let ticking = false;
    let scrollTimeout: NodeJS.Timeout;
    let currentLastScrollY = 0;
    
    const handleScroll = () => {
      console.log('🚀 handleScroll が呼ばれました - scrollTop:', scrollContainer.scrollTop);
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = scrollContainer.scrollTop;
          const scrollDelta = currentScrollY - currentLastScrollY;
          const isScrollingDown = scrollDelta > 0;
          const isScrollingUp = scrollDelta < 0;
          const scrollThreshold = 25;
          const topThreshold = 15;
          
          console.log('スクロール検知:', {
            currentScrollY,
            scrollDelta,
            isScrollingDown,
            isScrollingUp,
            isFlowCollapsed
          });
          
          // 最上部付近では常に展開
          if (currentScrollY < topThreshold) {
            console.log('最上部: フロー展開');
            setIsFlowCollapsed(false);
          }
          // 十分な下スクロールで折りたたみ
          else if (isScrollingDown && Math.abs(scrollDelta) > scrollThreshold && currentScrollY > 60) {
            console.log('下スクロール: フロー折りたたみ');
            setIsFlowCollapsed(true);
          }
          // 十分な上スクロールで展開
          else if (isScrollingUp && Math.abs(scrollDelta) > scrollThreshold && currentScrollY > topThreshold) {
            console.log('上スクロール: フロー展開');
            setIsFlowCollapsed(false);
          }
          
          currentLastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
      
      // スクロール終了検知
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // スクロール停止時の最上部チェック
        if (scrollContainer.scrollTop < 15) {
          console.log('スクロール停止: 最上部でフロー展開');
          setIsFlowCollapsed(false);
        }
      }, 200);
    };

    console.log('スクロールイベントリスナー追加');
    const scrollDetails = {
      scrollHeight: scrollContainer.scrollHeight,
      clientHeight: scrollContainer.clientHeight,
      scrollTop: scrollContainer.scrollTop,
      hasScrollbar: scrollContainer.scrollHeight > scrollContainer.clientHeight,
      offsetHeight: scrollContainer.offsetHeight,
      className: scrollContainer.className,
      tagName: scrollContainer.tagName,
      style: {
        overflow: scrollContainer.style.overflow,
        overflowY: scrollContainer.style.overflowY,
        height: scrollContainer.style.height,
        maxHeight: scrollContainer.style.maxHeight
      }
    };
    console.log('scrollContainer の詳細:', scrollDetails);
    
    // スクロール可能性をテスト
    if (scrollContainer.scrollHeight <= scrollContainer.clientHeight) {
      console.warn('⚠️ スクロール不可: scrollHeight <= clientHeight');
    } else {
      console.log('✅ スクロール可能');
    }
    
    // 手動でスクロールイベントをテスト
    const testScroll = () => {
      console.log('🧪 手動スクロールテスト実行');
      scrollContainer.scrollTop = 50;
    };
    setTimeout(testScroll, 1000);
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      console.log('スクロールイベントリスナー削除');
      scrollContainer.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(true);
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const handleSettingsClick = () => {
    showToast({
      type: 'info',
      title: '設定パネル',
      message: 'デモ版では設定パネルは利用できません。本番環境では各種設定が可能です。',
      duration: 4000
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const sellerMenuItems = [
    { 
      label: 'ダッシュボード', 
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      label: '納品管理', 
      href: '/delivery',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      badge: 3 
    },
    { 
      label: '在庫管理', 
      href: '/inventory',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      badge: 234 
    },
    { 
      label: '販売管理', 
      href: '/sales',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      badge: 12 
    },
    { 
      label: '返品管理', 
      href: '/returns',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
        </svg>
      ),
      badge: 5 
    },
    { 
      label: '請求・精算', 
      href: '/billing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    { 
      label: '商品履歴', 
      href: '/timeline',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  const staffMenuItems = [
    { 
      label: 'スタッフダッシュボード', 
      href: '/staff/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      label: 'タスク管理', 
      href: '/staff/tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      label: '在庫管理', 
      href: '/staff/inventory',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )
    },
    { 
      label: '検品・撮影', 
      href: '/staff/inspection',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      label: 'ロケーション管理', 
      href: '/staff/location',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      label: '出荷管理', 
      href: '/staff/shipping',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      )
    },
    { 
      label: '返品処理', 
      href: '/staff/returns',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
        </svg>
      )
    },
    { 
      label: '業務レポート', 
      href: '/staff/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
  ];

  const menuItems = userType === 'staff' ? staffMenuItems : sellerMenuItems;

  const getCurrentStage = () => {
    // Map current path to flow stage
    if (pathname.includes('/inventory')) {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const filter = params.get('filter');
        return filter || 'storage';
      }
      return 'storage';
    }
    if (pathname.includes('/tasks')) return 'inspection';
    if (pathname.includes('/shipping')) return 'shipping';
    return undefined;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nexus-background via-gray-50 to-blue-50/20">
      {/* モバイルサイドバーオーバーレイ */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* モダンレイアウト */}
      <div className="flex h-screen">
        {/* 改善されたサイドバー */}
        <aside className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 fixed lg:relative z-50 lg:z-0 
          ${isSidebarCollapsed ? 'w-16' : 'w-64'} 
          h-full bg-white shadow-xl transition-all duration-300 ease-in-out flex flex-col
        `}>
          <div className="h-full flex flex-col">
            {/* サイドバーヘッダー */}
            <div className="p-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    W
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="transition-opacity duration-200">
                      <h2 className="text-base font-bold text-gray-900">THE WORLD DOOR</h2>
                      <p className="text-xs text-gray-600">
                        フルフィルメントサービス
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {userType === 'seller' ? 'セラー管理' : 'スタッフ管理'}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="hidden lg:flex p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    title={isSidebarCollapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
                  >
                    <svg 
                      className={`w-4 h-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={toggleMobileMenu}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* ナビゲーションメニュー - レスポンシブ対応 */}
            <nav className="flex-1 p-3 overflow-y-auto">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 
                      ${isSidebarCollapsed ? 'justify-center' : ''} 
                      ${pathname === item.href
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex-shrink-0 w-5 h-5">
                      {item.icon}
                    </div>
                    {!isSidebarCollapsed && (
                      <>
                        <span className="font-medium text-sm flex-1 overflow-hidden text-ellipsis">
                          {item.label}
                        </span>
                        {(item as any).badge && (
                          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                            {(item as any).badge}
                          </span>
                        )}
                      </>
                    )}
                    {isSidebarCollapsed && (item as any).badge && (
                      <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                        {(item as any).badge > 9 ? '9+' : (item as any).badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* NexusHeader */}
          <NexusHeader
            userType={userType}
            onSearchSubmit={handleSearchSubmit}
            onSettingsClick={handleSettingsClick}
            onLogout={handleLogout}
            currentTime={currentTime}
            onMobileMenuToggle={toggleMobileMenu}
            isMobileMenuOpen={isMobileMenuOpen}
          />

          {/* Unified Product Flow */}
          <div className="bg-white border-b">
            <div className="flex items-center justify-between px-4 py-2">
              <h3 className="text-sm font-medium text-gray-700">業務フロー</h3>
              <button
                onClick={() => setIsFlowCollapsed(!isFlowCollapsed)}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title={isFlowCollapsed ? 'フローを展開' : 'フローを折りたたむ'}
              >
                <svg 
                  className={`w-4 h-4 transition-transform ${isFlowCollapsed ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {!isFlowCollapsed && (
              <UnifiedProductFlow 
                currentStage={getCurrentStage()} 
                userType={userType}
                compact={true} 
              />
            )}
          </div>

          {/* ページコンテンツ - レスポンシブ対応 */}
          <main className="flex-1 bg-gray-50 main-content" role="main" id="main-content">
            <div ref={scrollContainerRef} className="h-full overflow-y-auto page-scroll-container">
              <div className="p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 max-w-[1600px] mx-auto">
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  {children}
                </div>
                {/* Bottom padding for scrollability - 確実にスクロール可能にする */}
                <div className="h-[200vh] flex-shrink-0" aria-hidden="true"></div>
              </div>
            </div>
          </main>
        </div>
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