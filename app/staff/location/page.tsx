'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import LocationList from '@/app/components/features/location/LocationList';
import LocationRegistration from '@/app/components/features/location/LocationRegistration';
import LocationScanner from '@/app/components/features/LocationScanner';
import LocationOptimizationModal from '@/app/components/LocationOptimizationModal';
import InventoryCountModal from '@/app/components/InventoryCountModal';
import NexusButton from '@/app/components/ui/NexusButton';
import { useModal } from '@/app/components/ui/ModalContext';
import {
  SparklesIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  QrCodeIcon,
  PlusIcon,
  ListBulletIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

interface LocationStats {
  totalLocations: number;
  occupiedLocations: number;
  totalCapacity: number;
  usedCapacity: number;
  criticalLocations: number;
}

export default function LocationPage() {
  const scannerModalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'register' | 'analytics'>('overview');
  const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState(false);
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const { setIsAnyModalOpen } = useModal();
  const [stats, setStats] = useState<LocationStats>({
    totalLocations: 24,
    occupiedLocations: 18,
    totalCapacity: 580,
    usedCapacity: 342,
    criticalLocations: 3
  });

  // 独自実装モーダルの業務フロー制御
  useEffect(() => {
    if (isScannerOpen) {
      setIsAnyModalOpen(true);
    } else {
      setIsAnyModalOpen(false);
    }
  }, [isScannerOpen, setIsAnyModalOpen]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // スキャナーモーダルのスクロール位置リセット
  useEffect(() => {
    if (isScannerOpen) {
      // ページ全体を最上部にスクロール - 正しいスクロールコンテナを対象
      const scrollContainer = document.querySelector('.page-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      } else {
        window.scrollTo(0, 0);
      }
      
      if (scannerModalRef.current) {
        scannerModalRef.current.scrollTop = 0;
      }
    }
  }, [isScannerOpen]);

  const handleOptimizeLocations = () => {
    setIsOptimizationModalOpen(true);
  };
  
  const handleStartInventoryCount = () => {
    setIsCountModalOpen(true);
  };

  const handleQuickScan = () => {
    setIsScannerOpen(!isScannerOpen);
  };

  if (!mounted) {
    return null;
  }

  const headerActions = (
    <>
      <NexusButton
        onClick={handleQuickScan}
        variant="default"
        size="md"
        data-testid="location-scan-button"
        icon={<QrCodeIcon className="w-5 h-5" />}
      >
        <span className="hidden sm:inline">スキャン</span>
        <span className="sm:hidden">スキャン</span>
      </NexusButton>
      <NexusButton
        onClick={handleOptimizeLocations}
        variant="default"
        size="md"
        data-testid="location-optimize-button"
        icon={<SparklesIcon className="w-5 h-5" />}
      >
        <span className="hidden sm:inline">最適化</span>
        <span className="sm:hidden">最適化</span>
      </NexusButton>
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

        {/* Stats Cards */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="intelligence-card global">
              <div className="p-5">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="status-badge info text-[10px] sm:text-xs">総計</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.totalLocations}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  総ロケーション
                </div>
              </div>
            </div>

            <div className="intelligence-card americas">
              <div className="p-5">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb green w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="status-badge success text-[10px] sm:text-xs">使用率</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {utilizationRate}%
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  ロケーション使用率
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-5">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb blue w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="status-badge info text-[10px] sm:text-xs">容量</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {occupancyRate}%
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  容量使用率
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-5">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb red w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <span className="status-badge danger text-[10px] sm:text-xs">要注意</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {stats.criticalLocations}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  要注意ロケーション
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
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
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">使用率</h4>
                        <p className="text-2xl font-bold text-blue-700">78.5%</p>
                        <p className="text-sm text-blue-600">平均使用率</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">効率性</h4>
                        <p className="text-2xl font-bold text-green-700">92.3%</p>
                        <p className="text-sm text-green-600">アクセス効率</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2">改善提案</h4>
                        <p className="text-2xl font-bold text-orange-700">3</p>
                        <p className="text-sm text-orange-600">件の提案</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">レポート生成</h4>
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

        {/* Scanner Modal */}
        {isScannerOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[10001] p-4 pt-8">
            <div className="intelligence-card global max-w-[1600px] w-full max-h-[90vh] overflow-hidden">
              <div className="p-5 overflow-y-auto max-h-full" ref={scannerModalRef}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-nexus-text-primary">バーコードスキャン</h3>
                  <button
                    onClick={() => setIsScannerOpen(false)}
                    className="action-orb"
                  >
                    ✕
                  </button>
                </div>
                <LocationScanner 
                  onProductScanned={(barcode) => {
                    setQuickSearch(barcode);
                    setIsScannerOpen(false);
                    setActiveTab('overview');
                  }}
                  onLocationScanned={(location) => {
                    setQuickSearch(location);
                    setIsScannerOpen(false);
                    setActiveTab('overview');
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Location Optimization Modal */}
        <LocationOptimizationModal
          isOpen={isOptimizationModalOpen}
          onClose={() => setIsOptimizationModalOpen(false)}
        />

        {/* Inventory Count Modal */}
        <InventoryCountModal
          isOpen={isCountModalOpen}
          onClose={() => setIsCountModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}
