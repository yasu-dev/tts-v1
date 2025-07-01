'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import PickingListManager from '@/app/components/features/picking/PickingListManager';
import PickingProgress from '@/app/components/features/picking/PickingProgress';
import PickingHistory from '@/app/components/features/picking/PickingHistory';

interface PickingStats {
  pendingOrders: number;
  inProgress: number;
  completedToday: number;
  averageTime: number; // 分
}

export default function PickingPage() {
  const [viewMode, setViewMode] = useState<'active' | 'progress' | 'history'>('active');
  const [stats, setStats] = useState<PickingStats>({
    pendingOrders: 12,
    inProgress: 3,
    completedToday: 28,
    averageTime: 15,
  });

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card africa">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  ピッキングリスト
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  出荷準備の効率的な商品ピッキング管理
                </p>
              </div>
              <div className="flex gap-2">
                <button className="nexus-button primary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                  バーコードスキャン
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="intelligence-card global">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-text-secondary">待機中</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    {stats.pendingOrders}
                  </p>
                </div>
                <div className="action-orb yellow">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="intelligence-card global">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-text-secondary">作業中</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="action-orb blue">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="intelligence-card global">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-text-secondary">本日完了</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    {stats.completedToday}
                  </p>
                </div>
                <div className="action-orb green">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="intelligence-card global">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-text-secondary">平均作業時間</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    {stats.averageTime}分
                  </p>
                </div>
                <div className="action-orb">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex space-x-1 bg-nexus-bg-secondary p-1 rounded-lg mb-6">
              {[
                { key: 'active', label: 'アクティブリスト', icon: '📋' },
                { key: 'progress', label: '進行状況', icon: '⏱️' },
                { key: 'history', label: '完了履歴', icon: '✅' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setViewMode(tab.key as any)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    viewMode === tab.key
                      ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                      : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content based on view mode */}
            {viewMode === 'active' && <PickingListManager />}
            {viewMode === 'progress' && <PickingProgress />}
            {viewMode === 'history' && <PickingHistory />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 