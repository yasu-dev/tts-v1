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
}

export default function NexusHeader({
  userType,
  onSearchSubmit,
  onNotificationClick,
  onSettingsClick,
  onLogout,
  currentTime = { utc: '14:23', jst: '23:23' }
}: NexusHeaderProps) {

  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <header className="nexus-header flex items-center justify-between px-10 relative overflow-hidden">
      {/* 背景シャインエフェクト */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="flex items-center gap-8 z-10">
        {/* ブランドアイデンティティ */}
        <div className="flex items-center gap-6">
          <div className="nexus-logo relative">
            <div className="absolute inset-[-3px] bg-gradient-to-r from-primary-blue via-nexus-yellow via-nexus-red via-nexus-green via-nexus-purple to-nexus-cyan rounded-[21px] opacity-60 -z-10" />
            <svg className="h-7 w-7 text-white filter drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <div className="text-white">
            <div className="font-display text-3xl font-black text-white text-shadow-[0_0_20px_rgba(255,206,0,0.6),0_3px_6px_rgba(0,0,0,0.4)] tracking-wider">
              THE WORLD DOOR
            </div>
            <div className="text-base font-medium text-white/95 mt-1 tracking-wide">
              グローバル輸出インテリジェンスプラットフォーム
            </div>
          </div>
        </div>
        
        {/* ナビゲーションピル */}
        <nav className="nexus-nav flex gap-3 z-10">
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
        {/* タイムゾーンウィジェット */}
        <div className="timezone-widget bg-white/15 backdrop-blur-xl border border-white/25 rounded-xl px-4 py-2 text-white font-semibold">
          <div className="font-mono text-sm mb-1">{currentTime.utc}</div>
          <div className="text-xs opacity-80">UTC</div>
        </div>
        <div className="timezone-widget bg-white/15 backdrop-blur-xl border border-white/25 rounded-xl px-4 py-2 text-white font-semibold">
          <div className="font-mono text-sm mb-1">{currentTime.jst}</div>
          <div className="text-xs opacity-80">JST</div>
        </div>
        
        {/* ユーザープロファイル */}
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
  );
}