'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import {
  Cog6ToothIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import HoloTable from '@/app/components/ui/HoloTable';
import NexusButton from '@/app/components/ui/NexusButton';
import BaseModal from '@/app/components/ui/BaseModal';
import { NexusLoadingSpinner, NexusSelect, NexusInput, NexusCheckbox, NexusTextarea } from '@/app/components/ui';

export default function SalesPage() {
  const { showToast } = useToast();
  const [salesData, setSalesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/sales')
      .then((res) => res.json())
      .then((data) => {
        setSalesData(data);
        setLoading(false);
      });
  }, []);
  
  const handleSaveSettings = () => {
    showToast({
      title: '設定保存',
      message: '出品設定を保存しました',
      type: 'success'
    });
    setIsSettingsModalOpen(false);
  };

  const handleCreatePromotion = () => {
    // 実際のプロモーション作成処理をここに実装
    showToast({
      title: 'プロモーション作成',
      message: 'プロモーションを作成しました。設定内容が反映されます。',
      type: 'success'
    });
    setIsPromotionModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  販売管理
                </h1>
                <p className="text-nexus-text-secondary">
                  出品状況と販売パフォーマンスを管理
                </p>
              </div>
              <div className="flex space-x-3">
                <NexusButton
                  onClick={() => setIsSettingsModalOpen(true)}
                  icon={<Cog6ToothIcon className="w-5 h-5" />}
                >
                  出品設定
                </NexusButton>
                <NexusButton
                  onClick={() => setIsPromotionModalOpen(true)}
                  variant="primary"
                  icon={<TicketIcon className="w-5 h-5" />}
                >
                  プロモーション作成
                </NexusButton>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        <BaseModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          title="出品設定"
          size="md"
        >
          <div className="space-y-6">
            <NexusSelect
              label="自動出品設定"
              defaultValue="manual"
              options={[
                { value: "manual", label: "手動出品" },
                { value: "auto", label: "自動出品" }
              ]}
            />
            
            <NexusSelect
              label="価格設定方法"
              defaultValue="manual"
              options={[
                { value: "manual", label: "手動設定" },
                { value: "auto", label: "市場価格連動" }
              ]}
            />
            
            <NexusInput
              label="利益率設定 (%)"
              type="number"
              min="0"
              max="100"
              defaultValue="20"
              required
            />
            
            <NexusCheckbox
              label="写真撮影完了後に自動出品"
              defaultChecked
            />
            
            <div className="text-right mt-6 space-x-2">
              <NexusButton onClick={() => setIsSettingsModalOpen(false)}>
                キャンセル
              </NexusButton>
              <NexusButton onClick={handleSaveSettings} variant="primary">
                保存
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* Promotion Creation Modal */}
        <BaseModal
          isOpen={isPromotionModalOpen}
          onClose={() => setIsPromotionModalOpen(false)}
          title="プロモーション作成"
          size="lg"
        >
          <div className="space-y-6">
            <NexusInput
              label="プロモーション名"
              type="text"
              placeholder="例: 夏の大セール"
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NexusInput
                label="割引率 (%)"
                type="number"
                min="0"
                max="100"
                placeholder="10"
                required
              />
              <NexusInput
                label="最低購入金額"
                type="number"
                min="0"
                placeholder="10000"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NexusInput
                label="開始日"
                type="date"
                required
              />
              <NexusInput
                label="終了日"
                type="date"
                required
              />
            </div>
            
            <NexusTextarea
              label="プロモーション詳細"
              rows={3}
              placeholder="プロモーションの詳細説明を入力してください"
            />
            
            <div className="text-right mt-6 space-x-2">
              <NexusButton onClick={() => setIsPromotionModalOpen(false)}>
                キャンセル
              </NexusButton>
              <NexusButton onClick={handleCreatePromotion} variant="primary">
                プロモーション作成
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* Stats Overview - Intelligence Metrics Style */}
        <div className="intelligence-metrics">
          <div className="unified-grid-4">
            <div className="intelligence-card asia">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb blue">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <span className="status-badge success">+23%</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  ¥{salesData?.totalSales?.toLocaleString() || '0'}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  本日の売上
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb green">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <span className="status-badge info">好調</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  ¥{((salesData?.totalSales || 0) / 10000).toLocaleString()}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">万</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  月間売上
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5m-6 0l4-4m0 0l-4-4m4 4H9"></path>
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-nexus-yellow">注文</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {salesData?.totalOrders || 0}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">件</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  総注文数
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb red">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <span className="status-badge success">高単価</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  ¥{salesData?.averageOrderValue?.toLocaleString() || '0'}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  平均注文額
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table - Holo Table Style */}
        <div className="intelligence-card asia">
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-display font-bold text-nexus-text-primary">受注一覧</h3>
              <p className="text-nexus-text-secondary mt-1">最新の注文状況</p>
            </div>
            
            <HoloTable
              columns={[
                { key: 'orderId', label: '注文ID', width: '15%' },
                { key: 'product', label: '商品名', width: '25%' },
                { key: 'customer', label: '購入者', width: '15%' },
                { key: 'amount', label: '価格', width: '15%', align: 'right' },
                { key: 'status', label: 'ステータス', width: '15%', align: 'center' },
                { key: 'date', label: '注文日', width: '15%' }
              ]}
              data={(salesData?.recentOrders || []).map((order: any) => ({
                ...order,
                orderId: `ORD-${String(order.id).padStart(6, '0')}`
              }))}
              renderCell={(value, column, row) => {
                if (column.key === 'orderId') {
                  return <span className="font-mono text-nexus-text-primary">{value}</span>;
                }
                if (column.key === 'product') {
                  return <span className="font-medium text-nexus-text-primary">{value}</span>;
                }
                if (column.key === 'customer') {
                  return <span className="text-nexus-text-secondary">{value}</span>;
                }
                if (column.key === 'amount') {
                  return <span className="font-display font-bold">¥{value?.toLocaleString() || '0'}</span>;
                }
                if (column.key === 'status') {
                  return (
                    <div className="flex items-center justify-center gap-2">
                      <div className={`status-orb status-${
                        value === '出荷済' ? 'optimal' : 
                        value === '配送中' ? 'optimal' : 
                        'monitoring'
                      }`} />
                      <span className={`status-badge ${
                        value === '出荷済' ? 'success' : 
                        value === '配送中' ? 'info' :
                        'warning'
                      }`}>
                        {value}
                      </span>
                    </div>
                  );
                }
                if (column.key === 'date') {
                  return <span className="font-mono text-sm">{value}</span>;
                }
                return value;
              }}
              emptyMessage="注文データがありません"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 