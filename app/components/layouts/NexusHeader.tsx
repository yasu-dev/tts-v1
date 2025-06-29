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
        <div className="text-white">
          <div className="font-display text-3xl font-black text-white tracking-wider">
            THE WORLD DOOR
          </div>
          <div className="text-base font-medium text-white/95 mt-1 tracking-wide">
            フルフィルメントサービス
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