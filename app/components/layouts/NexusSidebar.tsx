'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  region?: 'americas' | 'europe' | 'asia' | 'africa' | 'oceania' | 'global';
}

interface NexusSidebarProps {
  userType: 'seller' | 'staff';
}

export default function NexusSidebar({ userType }: NexusSidebarProps) {
  const pathname = usePathname();

  const sellerMenuItems: MenuItem[] = [
    {
      label: 'ダッシュボード',
      href: '/dashboard',
      region: 'global',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0" />
        </svg>
      )
    },
    {
      label: '📦 納品管理',
      href: '/delivery',
      region: 'americas',
      badge: 3,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      label: '📷 在庫管理',
      href: '/inventory',
      region: 'europe',
      badge: 234,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      )
    },
    {
      label: '📈 販売管理',
      href: '/sales',
      region: 'asia',
      badge: 12,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      label: '↩️ 返品管理',
      href: '/returns',
      region: 'africa',
      badge: 5,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      )
    },
    {
      label: '💳 請求・精算',
      href: '/billing',
      region: 'oceania',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      label: '商品履歴',
      href: '/timeline',
      region: 'global',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const staffMenuItems: MenuItem[] = [
    {
      label: 'スタッフダッシュボード',
      href: '/staff/dashboard',
      region: 'global',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      label: '🔴 緊急タスク',
      href: '/staff/tasks',
      region: 'americas',
      badge: 2,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      label: '🔍 検品・撮影',
      href: '/staff/inspection',
      region: 'europe',
      badge: 8,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: '📍 ロケーション管理',
      href: '/staff/location',
      region: 'asia',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      label: '🚚 出荷管理',
      href: '/staff/shipping',
      region: 'africa',
      badge: 6,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )
    },
    {
      label: '↩️ 返品処理',
      href: '/staff/returns',
      region: 'oceania',
      badge: 5,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      )
    },
    {
      label: '📊 業務レポート',
      href: '/staff/reports',
      region: 'global',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  const menuItems = userType === 'staff' ? staffMenuItems : sellerMenuItems;

  const getRegionBorderColor = (region?: string) => {
    switch (region) {
      case 'americas': return 'border-l-region-americas';
      case 'europe': return 'border-l-region-europe';
      case 'asia': return 'border-l-region-asia';
      case 'africa': return 'border-l-region-africa';
      case 'oceania': return 'border-l-region-oceania';
      case 'global': return 'border-l-region-global';
      default: return 'border-l-nexus-border';
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="nexus-sidebar w-340 bg-nexus-surface/95 backdrop-blur-nexus border-r-4 border-r-gradient-to-b from-region-americas via-region-europe via-region-asia via-region-africa via-region-oceania to-region-global">
      {/* サイドバーヘッダー */}
      <div className="p-8 border-b border-nexus-border">
        <div>
          <h2 className="font-display font-bold text-xl text-nexus-text-primary">
            THE WORLD DOOR
          </h2>
          <p className="text-sm text-nexus-text-secondary font-medium mt-1">
            フルフィルメントサービス
          </p>
          <p className="text-xs text-nexus-text-muted mt-2">
            {userType === 'staff' ? 'スタッフモード' : 'セラーモード'}
          </p>
        </div>
      </div>

      {/* ナビゲーションメニュー */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={`
                  nav-node
                  relative flex items-center gap-4
                  px-6 py-4
                  rounded-xl
                  font-medium text-base
                  transition-all duration-300 ease-out
                  border-l-[5px]
                  ${isActive(item.href) 
                    ? `bg-primary-blue/10 text-primary-blue border-l-primary-blue ${getRegionBorderColor(item.region)}` 
                    : `text-nexus-text-secondary hover:text-primary-blue hover:bg-primary-blue/5 border-l-transparent hover:translate-x-2 ${getRegionBorderColor(item.region)}`
                  }
                  group
                `}
              >
                {/* アイコン */}
                <div className={`
                  flex-shrink-0 transition-all duration-300
                  ${isActive(item.href) ? 'text-primary-blue' : 'text-nexus-text-muted group-hover:text-primary-blue'}
                `}>
                  {item.icon}
                </div>

                {/* ラベル */}
                <span className="flex-1 font-primary tracking-wide">
                  {item.label}
                </span>

                {/* バッジ */}
                {item.badge && (
                  <span className="
                    px-2 py-1 
                    bg-nexus-red text-white 
                    text-xs font-bold 
                    rounded-full
                    shadow-[0_0_10px_rgba(229,50,56,0.5)]
                    min-w-[24px] text-center
                  ">
                    {item.badge}
                  </span>
                )}

                {/* ホバー時のアクセント */}
                <div className={`
                  absolute right-0 top-1/2 -translate-y-1/2
                  w-1 h-0 rounded-l-full
                  bg-gradient-to-b from-primary-blue to-nexus-cyan
                  transition-all duration-300
                  group-hover:h-8
                  ${isActive(item.href) ? 'h-8' : 'h-0'}
                `} />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* フッター統計情報 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-nexus-background/50 to-transparent">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-nexus-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-nexus-text-secondary font-medium">システム状態</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-nexus-green rounded-full shadow-[0_0_6px_rgba(134,184,23,0.7)]" />
              <span className="text-nexus-green font-bold text-xs">オンライン</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}