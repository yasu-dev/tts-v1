'use client';

import { useState } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import LocationList from '@/app/components/features/location/LocationList';
import LocationRegistration from '@/app/components/features/location/LocationRegistration';

export default function LocationPage() {
  const [activeView, setActiveView] = useState<'list' | 'registration'>('list');

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  ロケーション管理
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  倉庫内のロケーション情報を管理します
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setActiveView(activeView === 'list' ? 'registration' : 'list')}
                  className="nexus-button"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={activeView === 'list' 
                        ? "M12 4v16m8-8H4" 
                        : "M4 6h16M4 12h16M4 18h16"} 
                    />
                  </svg>
                  {activeView === 'list' ? '新規登録' : '一覧表示'}
                </button>
                <button className="nexus-button primary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  在庫配置レポート
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ロケーション登録フォーム（左側） */}
          <div className="lg:col-span-1">
            <LocationRegistration />
          </div>

          {/* ロケーション一覧（右側） */}
          <div className="lg:col-span-2">
            <LocationList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}