'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import LocationList from '@/app/components/features/location/LocationList';
import LocationRegistration from '@/app/components/features/location/LocationRegistration';
import LocationScanner from '@/app/components/features/LocationScanner';
import LocationOptimizationModal from '@/app/components/LocationOptimizationModal';
import InventoryCountModal from '@/app/components/InventoryCountModal';
import {
  SparklesIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

export default function LocationPage() {
  const [activeView, setActiveView] = useState<'list' | 'registration'>('list');
  const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState(false);
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOptimizeLocations = () => {
    setIsOptimizationModalOpen(true);
  };
  
  const handleStartInventoryCount = () => {
    setIsCountModalOpen(true);
  };

  if (!mounted) {
    return null;
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  ロケーション管理
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  倉庫内の商品ロケーションを管理
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
                <button
                  onClick={handleOptimizeLocations}
                  className="nexus-button"
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  ロケーション最適化
                </button>
                <button
                  onClick={handleStartInventoryCount}
                  className="nexus-button primary"
                >
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                  棚卸し開始
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

        <LocationScanner 
          onProductScanned={(barcode) => console.log('Product scanned:', barcode)}
          onLocationScanned={(location) => console.log('Location scanned:', location)}
        />

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