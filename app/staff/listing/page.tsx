'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import ListingManager from '@/app/components/features/listing/ListingManager';
import ListingTemplateEditor from '@/app/components/features/listing/ListingTemplateEditor';
import ListingHistory from '@/app/components/features/listing/ListingHistory';

interface ListingStats {
  totalActive: number;
  pendingListing: number;
  soldThisMonth: number;
  averagePrice: number;
}

export default function ListingPage() {
  const [viewMode, setViewMode] = useState<'manage' | 'templates' | 'history'>('manage');
  const [stats, setStats] = useState<ListingStats>({
    totalActive: 156,
    pendingListing: 24,
    soldThisMonth: 89,
    averagePrice: 215000,
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
                  出品管理
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  eBay出品の一括管理と設定
                </p>
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
                  <p className="text-sm text-nexus-text-secondary">出品中</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    {stats.totalActive}
                  </p>
                </div>
                <div className="action-orb green">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="intelligence-card global">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-text-secondary">出品待ち</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    {stats.pendingListing}
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
                  <p className="text-sm text-nexus-text-secondary">今月販売</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    {stats.soldThisMonth}
                  </p>
                </div>
                <div className="action-orb blue">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="intelligence-card global">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-text-secondary">平均価格</p>
                  <p className="text-2xl font-display font-bold text-nexus-text-primary">
                    ¥{stats.averagePrice.toLocaleString()}
                  </p>
                </div>
                <div className="action-orb">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                { key: 'manage', label: '出品管理', icon: '📦' },
                { key: 'templates', label: 'テンプレート設定', icon: '📝' },
                { key: 'history', label: '出品履歴', icon: '📊' },
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
            {viewMode === 'manage' && <ListingManager />}
            {viewMode === 'templates' && <ListingTemplateEditor />}
            {viewMode === 'history' && <ListingHistory />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 