'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import UnifiedPageHeader from '../components/ui/UnifiedPageHeader';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  TruckIcon, 
  CalendarIcon, 
  QrCodeIcon,
  DocumentTextIcon,
  PlusIcon,
  CheckIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import HoloTable from '../components/ui/HoloTable';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import BaseModal from '@/app/components/ui/BaseModal';

export default function DeliveryPage() {
  const router = useRouter();
  const [deliveryPlans] = useState([
    { id: 1, date: '2024-01-15', status: '準備中', items: 5, value: 450000 },
    { id: 2, date: '2024-01-12', status: '発送済', items: 3, value: 280000 },
    { id: 3, date: '2024-01-10', status: '到着済', items: 8, value: 620000 },
  ]);

  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);

  const handleGenerateBarcode = () => {
    setIsBarcodeModalOpen(true);
  };

  const headerActions = (
    <>
      <Link href="/delivery-plan">
        <NexusButton 
          variant="primary"
          icon={<PlusIcon className="w-5 h-5" />}
        >
          新規納品プラン作成
        </NexusButton>
      </Link>
      <NexusButton 
        onClick={handleGenerateBarcode}
        icon={<QrCodeIcon className="w-5 h-5" />}
      >
        バーコード発行
      </NexusButton>
    </>
  );

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-8">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="納品管理"
          subtitle="商品の納品プランを作成・管理します"
          userType="seller"
          iconType="delivery"
          actions={headerActions}
        />

        {/* Barcode Generation Modal */}
        <BaseModal
          isOpen={isBarcodeModalOpen}
          onClose={() => setIsBarcodeModalOpen(false)}
          title="バーコード生成"
          size="md"
        >
          <div className="space-y-4">
            <div className="text-center p-8 border-2 border-dashed border-nexus-border rounded-lg">
              <QrCodeIcon className="w-16 h-16 mx-auto text-nexus-text-secondary mb-4" />
              <p className="text-nexus-text-secondary">
                選択した配送のバーコードを生成します
              </p>
            </div>

            <div className="bg-nexus-bg-secondary p-4 rounded-lg">
              <p className="text-sm text-nexus-text-secondary">
                生成されたバーコードは、配送ラベルに印刷して使用できます。
              </p>
            </div>

            <div className="flex gap-4 mt-6">
              <NexusButton
                onClick={() => {
                  // バーコード生成処理
                  const barcodeData = {
                    type: 'delivery',
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString()
                  };
                  
                  // ダウンロード処理
                  const dataStr = JSON.stringify(barcodeData);
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                  
                  const exportFileDefaultName = `barcode_${barcodeData.id}.json`;
                  
                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute('download', exportFileDefaultName);
                  linkElement.click();
                  
                  setIsBarcodeModalOpen(false);
                }}
                variant="primary"
                className="flex-1"
              >
                バーコードを生成
              </NexusButton>
              <NexusButton
                onClick={() => setIsBarcodeModalOpen(false)}
                className="flex-1"
              >
                キャンセル
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* Draft Save Notification Modal */}
        <BaseModal
          isOpen={isDraftModalOpen}
          onClose={() => setIsDraftModalOpen(false)}
          title="下書き保存機能について"
          size="md"
        >
          <div className="space-y-4">
            <div className="text-center p-6">
              <DocumentArrowDownIcon className="w-16 h-16 mx-auto text-nexus-text-secondary mb-4" />
              <h3 className="text-lg font-bold text-nexus-text-primary mb-3">
                下書き保存機能は開発中です
              </h3>
              <p className="text-nexus-text-secondary leading-relaxed">
                完全な納品プラン作成は<br />
                「納品プラン確定」ボタンをクリックしてください。
              </p>
            </div>

            <div className="bg-nexus-bg-secondary p-4 rounded-lg">
              <p className="text-sm text-nexus-text-secondary">
                💡 現在利用可能な機能：納品プラン作成、バーコード生成、履歴確認
              </p>
            </div>

            <div className="flex justify-center mt-6">
              <NexusButton
                onClick={() => setIsDraftModalOpen(false)}
                variant="primary"
                className="min-w-[120px]"
              >
                理解しました
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* New Delivery Plan Form - Unified Card Style */}
        <div className="bg-white rounded-xl border border-nexus-border shadow-sm">
          <div className="p-8">
            <h3 className="text-2xl font-display font-bold text-nexus-text-primary mb-6">新規納品プラン</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <NexusInput
                  type="text"
                  label="SKU（自動採番/手動入力）"
                  placeholder="TWD-20240115-00001"
                />
              </div>
              
              <div>
                <NexusInput
                  type="text"
                  label="ブランド"
                  placeholder="Canon, Sony, Rolex..."
                />
              </div>

              <div>
                <NexusInput
                  type="text"
                  label="モデル/型番"
                  placeholder="EOS R5, FE 24-70mm..."
                />
              </div>

              <div>
                <NexusInput
                  type="text"
                  label="シリアル番号"
                  placeholder="シリアル番号を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text-secondary mb-3">
                  カテゴリー
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" value="camera" className="w-4 h-4 text-primary-blue" />
                    <span className="text-nexus-text-primary">カメラ本体</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" value="lens" className="w-4 h-4 text-primary-blue" />
                    <span className="text-nexus-text-primary">レンズ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" value="watch" className="w-4 h-4 text-primary-blue" />
                    <span className="text-nexus-text-primary">時計</span>
                  </label>
                </div>
              </div>

              <div>
                <NexusInput
                  type="number"
                  label="保険申告価値"
                  placeholder="450000"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-nexus-text-secondary mb-3">
                付属品
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['元箱', '保証書', '説明書', '充電器', 'レンズキャップ', 'ストラップ'].map((item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-primary-blue rounded border-nexus-border" />
                    <span className="text-nexus-text-primary">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <NexusButton 
                variant="primary"
                icon={<CheckIcon className="w-5 h-5" />}
                onClick={() => router.push('/delivery-plan')}
              >
                納品プラン確定
              </NexusButton>
              <NexusButton 
                icon={<DocumentArrowDownIcon className="w-5 h-5" />}
                onClick={() => setIsDraftModalOpen(true)}
              >
                下書き保存
              </NexusButton>
            </div>
          </div>
        </div>

        {/* Delivery History - Unified Table Style */}
        <div className="bg-white rounded-xl border border-nexus-border shadow-sm">
          <div className="p-8">
            <h3 className="text-2xl font-display font-bold text-nexus-text-primary mb-6">納品履歴</h3>
            
            <HoloTable
              columns={[
                { key: 'deliveryId', label: '納品ID', width: '20%' },
                { key: 'date', label: '作成日', width: '15%' },
                { key: 'status', label: 'ステータス', width: '15%', align: 'center' },
                { key: 'items', label: '商品数', width: '12%', align: 'right' },
                { key: 'value', label: '総価値', width: '18%', align: 'right' },
                { key: 'actions', label: 'アクション', width: '20%', align: 'center' }
              ]}
              data={deliveryPlans.map((plan) => ({
                ...plan,
                deliveryId: `TWD-${plan.date.replace(/-/g, '')}-${String(plan.id).padStart(3, '0')}`
              }))}
              renderCell={(value, column, row) => {
                if (column.key === 'deliveryId') {
                  return <span className="font-mono text-nexus-text-primary">{value}</span>;
                }
                if (column.key === 'status') {
                  return (
                    <div className="flex items-center justify-center gap-2">
                      <div className={`status-orb status-${
                        value === '準備中' ? 'monitoring' :
                        value === '発送済' ? 'optimal' :
                        'optimal'
                      }`} />
                      <span className={`status-badge ${
                        value === '準備中' ? 'warning' :
                        value === '発送済' ? 'info' :
                        'success'
                      }`}>
                        {value}
                      </span>
                    </div>
                  );
                }
                if (column.key === 'items') {
                  return <span className="font-display">{value}点</span>;
                }
                if (column.key === 'value') {
                  return <span className="font-display font-bold">¥{value.toLocaleString()}</span>;
                }
                if (column.key === 'actions') {
                  return (
                    <div className="flex gap-3 justify-center">
                      <button className="action-orb blue">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </button>
                      <button className="action-orb green">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-2 0h-2v4m0-11v3m0 0h-2m2 0h2m-8 3H3M8 8H3m4-3h2M3 4h2m0 2H3"></path>
                        </svg>
                      </button>
                    </div>
                  );
                }
                return value;
              }}
              emptyMessage="納品履歴がありません"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 