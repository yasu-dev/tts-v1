'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import LocationList from '@/app/components/features/location/LocationList';
import LocationRegistration from '@/app/components/features/location/LocationRegistration';


import InventoryCountModal from '@/app/components/InventoryCountModal';
import NexusButton from '@/app/components/ui/NexusButton';

import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  PlusIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

interface LocationStats {
  totalLocations: number;
  occupiedLocations: number;
  totalCapacity: number;
  usedCapacity: number;
  criticalLocations: number;
}

export default function LocationPage() {

  const [activeTab, setActiveTab] = useState<'overview' | 'register' | 'analytics'>('overview');
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  const [stats, setStats] = useState<LocationStats>({
    totalLocations: 0,
    occupiedLocations: 0,
    totalCapacity: 0,
    usedCapacity: 0,
    criticalLocations: 0
  });


  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchLocationStats();
  }, []);

  const fetchLocationStats = async () => {
    try {
      const response = await fetch('/api/locations');
      if (response.ok) {
        const locations = await response.json();
        
        const totalLocations = locations.length;
        const occupiedLocations = locations.filter((loc: any) => loc._count?.products > 0).length;
        const totalCapacity = locations.reduce((sum: number, loc: any) => sum + (loc.capacity || 0), 0);
        const usedCapacity = locations.reduce((sum: number, loc: any) => sum + (loc._count?.products || 0), 0);
        const criticalLocations = locations.filter((loc: any) => {
          const usage = loc._count?.products || 0;
          const capacity = loc.capacity || 1;
          return (usage / capacity) >= 0.9;
        }).length;

        setStats({
          totalLocations,
          occupiedLocations,
          totalCapacity,
          usedCapacity,
          criticalLocations
        });
      }
    } catch (error) {
      console.error('Failed to fetch location stats:', error);
    }
  };



  const handleStartInventoryCount = () => {
    setIsCountModalOpen(true);
  };

  if (!mounted) {
    return null;
  }

  const headerActions = (
    <>
      <NexusButton
        onClick={handleStartInventoryCount}
        variant="primary"
        size="md"
        data-testid="inventory-count-button"
        icon={<ClipboardDocumentListIcon className="w-5 h-5" />}
      >
        <span className="hidden sm:inline">棚卸し</span>
        <span className="sm:hidden">棚卸し</span>
      </NexusButton>
    </>
  );

  const occupancyRate = Math.round((stats.usedCapacity / stats.totalCapacity) * 100);
  const utilizationRate = Math.round((stats.occupiedLocations / stats.totalLocations) * 100);

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="ロケーション管理"
          subtitle="倉庫内の商品配置を効率的に管理・最適化"
          userType="staff"
          iconType="location"
          actions={headerActions}
        />

        {/* Quick Search Bar */}
        <div className="intelligence-card global">
          <div className="p-5">
            <div className="flex-1 max-w-[1600px]">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-nexus-text-secondary" />
                <input
                  type="text"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="ロケーション、商品、SKUで検索..."
                  className="w-full pl-10 pr-4 py-2.5 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 text-nexus-text-primary transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>



{/* Tab Navigation - 一時的に非表示 */}
        {/*
        <div className="intelligence-card oceania">
          <div className="px-6 pt-6">
            <div className="flex space-x-1 bg-nexus-bg-secondary p-1 rounded-lg w-fit">
              <NexusButton
                onClick={() => setActiveTab('overview')}
                variant={activeTab === 'overview' ? 'primary' : 'default'}
                size="sm"
                icon={<ListBulletIcon className="w-4 h-4" />}
              >
                一覧・管理
              </NexusButton>
              <NexusButton
                onClick={() => setActiveTab('register')}
                variant={activeTab === 'register' ? 'primary' : 'default'}
                size="sm"
                icon={<PlusIcon className="w-4 h-4" />}
              >
                クイック登録
              </NexusButton>
              <NexusButton
                onClick={() => setActiveTab('analytics')}
                variant={activeTab === 'analytics' ? 'primary' : 'default'}
                size="sm"
                icon={<ChartBarIcon className="w-4 h-4" />}
              >
                分析・レポート
              </NexusButton>
            </div>
          </div>
        </div>
        */}

        {/* Main Content Area */}
        <div className="min-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <LocationList searchQuery={quickSearch} />
            </div>
          )}

          {activeTab === 'register' && (
            <div className="max-w-[1600px] mx-auto">
              <LocationRegistration />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="intelligence-card asia">
              <div className="p-5 text-center">
                <ChartBarIcon className="w-16 h-16 text-nexus-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-nexus-text-primary mb-2">
                  分析・レポート機能
                </h3>
                <p className="text-nexus-text-secondary mb-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="holo-card p-4">
                        <h4 className="font-medium text-nexus-text-primary mb-2">使用率</h4>
                        <p className="text-2xl font-bold text-nexus-primary">78.5%</p>
                        <p className="text-sm text-nexus-text-secondary">平均使用率</p>
                      </div>
                      <div className="holo-card p-4">
                        <h4 className="font-medium text-nexus-text-primary mb-2">効率性</h4>
                        <p className="text-2xl font-bold text-green-600">92.3%</p>
                        <p className="text-sm text-nexus-text-secondary">アクセス効率</p>
                      </div>
                      <div className="holo-card p-4">
                        <h4 className="font-medium text-nexus-text-primary mb-2">改善提案</h4>
                        <p className="text-2xl font-bold text-nexus-yellow">3</p>
                        <p className="text-sm text-nexus-text-secondary">件の提案</p>
                      </div>
                    </div>
                    <div className="holo-card p-4">
                      <h4 className="font-medium text-nexus-text-primary mb-2">レポート生成</h4>
                      <div className="flex gap-2">
                        <NexusButton variant="primary" size="sm">
                          週次レポート
                        </NexusButton>
                        <NexusButton variant="primary" size="sm">
                          月次レポート
                        </NexusButton>
                      </div>
                    </div>
                  </div>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="holo-card p-6">
                    <h4 className="font-semibold text-nexus-text-primary mb-2">使用率分析</h4>
                    <p className="text-sm text-nexus-text-secondary">ロケーション別の使用率推移と最適化提案</p>
                  </div>
                  <div className="holo-card p-6">
                    <h4 className="font-semibold text-nexus-text-primary mb-2">移動履歴</h4>
                    <p className="text-sm text-nexus-text-secondary">商品移動パターンと効率性分析</p>
                  </div>
                  <div className="holo-card p-6">
                    <h4 className="font-semibold text-nexus-text-primary mb-2">予測レポート</h4>
                    <p className="text-sm text-nexus-text-secondary">需要予測に基づく配置最適化</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>





        {/* Inventory Count Modal */}
        <InventoryCountModal
          isOpen={isCountModalOpen}
          onClose={() => setIsCountModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}
