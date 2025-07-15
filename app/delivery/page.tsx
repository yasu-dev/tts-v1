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
  DocumentArrowDownIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import NexusButton from '@/app/components/ui/NexusButton';
import BaseModal from '@/app/components/ui/BaseModal';
import DeliveryPlanDetailModal from '@/app/components/modals/DeliveryPlanDetailModal';

export default function DeliveryPage() {
  const router = useRouter();
  const [deliveryPlans, setDeliveryPlans] = useState([
    { 
      id: 1, 
      date: '2024-01-15', 
      status: '作成完了', 
      items: 5, 
      value: 450000,
      sellerName: '田中太郎',
      deliveryAddress: '東京都渋谷区神宮前1-1-1',
      contactEmail: 'tanaka@example.com',
      phoneNumber: '03-1234-5678',
      notes: 'カメラ機材の納品です。取り扱いにご注意ください。',
      products: [
        {
          name: 'Canon EOS R5',
          category: 'カメラ本体',
          brand: 'Canon',
          model: 'EOS R5',
          serialNumber: 'CR5001234567',
          estimatedValue: 350000,
          description: '新品同様、フルサイズミラーレス一眼カメラ'
        },
        {
          name: 'RF 24-70mm F2.8L IS USM',
          category: 'レンズ',
          brand: 'Canon',
          model: 'RF 24-70mm F2.8L IS USM',
          serialNumber: 'RF24701234567',
          estimatedValue: 100000,
          description: '標準ズームレンズ、美品'
        }
      ]
    },
    { 
      id: 2, 
      date: '2024-01-12', 
      status: '発送済', 
      items: 3, 
      value: 280000,
      sellerName: '佐藤花子',
      deliveryAddress: '大阪府大阪市北区梅田2-2-2',
      contactEmail: 'sato@example.com',
      phoneNumber: '06-5678-9012',
      products: [
        {
          name: 'Sony α7R V',
          category: 'カメラ本体',
          brand: 'Sony',
          model: 'α7R V',
          serialNumber: 'SA7R5987654321',
          estimatedValue: 200000,
          description: '高解像度ミラーレス一眼カメラ'
        }
      ]
    },
    { 
      id: 3, 
      date: '2024-01-10', 
      status: '到着済', 
      items: 8, 
      value: 620000,
      sellerName: '鈴木一郎',
      deliveryAddress: '愛知県名古屋市中区栄3-3-3',
      contactEmail: 'suzuki@example.com',
      phoneNumber: '052-9876-5432',
      notes: '時計コレクションの一部です。',
      products: [
        {
          name: 'Rolex Submariner',
          category: '時計',
          brand: 'Rolex',
          model: 'Submariner Date',
          serialNumber: 'R126610LN2023',
          estimatedValue: 620000,
          description: 'ステンレススチール、セラミックベゼル'
        }
      ]
    },
    { 
      id: 4, 
      date: '2024-01-08', 
      status: '作成中', 
      items: 2, 
      value: 180000,
      sellerName: '高橋次郎',
      deliveryAddress: '神奈川県横浜市西区みなとみらい4-4-4',
      contactEmail: 'takahashi@example.com',
      phoneNumber: '045-1111-2222',
      products: []
    },
    { 
      id: 5, 
      date: '2024-01-05', 
      status: '下書き', 
      items: 1, 
      value: 50000,
      sellerName: '山田三郎',
      deliveryAddress: '福岡県福岡市博多区博多駅前5-5-5',
      contactEmail: 'yamada@example.com',
      phoneNumber: '092-3333-4444',
      products: []
    }
  ]);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const handlePlanDetail = (plan: any) => {
    setSelectedPlan(plan);
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = (planId: number, newStatus: string) => {
    setDeliveryPlans(prev => 
      prev.map(plan => 
        plan.id === planId ? { ...plan, status: newStatus } : plan
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '下書き': return 'bg-gray-100 text-gray-800';
      case '作成中': return 'bg-yellow-100 text-yellow-800';
      case '作成完了': return 'bg-blue-100 text-blue-800';
      case '準備中': return 'bg-orange-100 text-orange-800';
      case '発送済': return 'bg-green-100 text-green-800';
      case '到着済': return 'bg-emerald-100 text-emerald-800';
      case 'キャンセル': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '下書き': return DocumentTextIcon;
      case '作成中': return ClockIcon;
      case '作成完了': return CheckCircleIcon;
      case '準備中': return ClockIcon;
      case '発送済': return TruckIcon;
      case '到着済': return CheckCircleIcon;
      case 'キャンセル': return XCircleIcon;
      default: return DocumentTextIcon;
    }
  };

  const headerActions = (
    <Link href="/delivery-plan">
      <NexusButton 
        variant="primary"
        icon={<PlusIcon className="w-5 h-5" />}
      >
        新規納品プラン作成
      </NexusButton>
    </Link>
  );

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-8">
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="納品プラン管理"
          subtitle="納品プランの作成・管理を行います"
          userType="seller"
          iconType="delivery"
          actions={headerActions}
        />

        {/* Delivery Plan Detail Modal */}
        {selectedPlan && (
          <DeliveryPlanDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            plan={{
              ...selectedPlan,
              deliveryId: `TWD-${selectedPlan.date.replace(/-/g, '')}-${String(selectedPlan.id).padStart(3, '0')}`
            }}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                総計
              </span>
            </div>
            <div className="text-3xl font-bold text-nexus-text-primary mb-2">
              {deliveryPlans.length}
            </div>
            <div className="text-nexus-text-secondary font-medium">
              総プラン数
            </div>
          </div>

          <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                進行中
              </span>
            </div>
            <div className="text-3xl font-bold text-nexus-text-primary mb-2">
              {deliveryPlans.filter(p => p.status === '作成中').length}
            </div>
            <div className="text-nexus-text-secondary font-medium">
              作成中
            </div>
          </div>

          <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                完了
              </span>
            </div>
            <div className="text-3xl font-bold text-nexus-text-primary mb-2">
              {deliveryPlans.filter(p => p.status === '作成完了').length}
            </div>
            <div className="text-nexus-text-secondary font-medium">
              作成完了
            </div>
          </div>

          <div className="bg-white rounded-xl border border-nexus-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                総価値
              </span>
            </div>
            <div className="text-3xl font-bold text-nexus-text-primary mb-2">
              ¥{(deliveryPlans.reduce((sum, p) => sum + p.value, 0) / 10000).toLocaleString()}万
            </div>
            <div className="text-nexus-text-secondary font-medium">
              総評価額
            </div>
          </div>
        </div>

        {/* Delivery Plans Management */}
        <div className="bg-white rounded-xl border border-nexus-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-nexus-text-primary">納品プラン一覧</h3>
              <p className="text-nexus-text-secondary mt-1 text-sm">
                全{deliveryPlans.length}件 • 作成中: {deliveryPlans.filter(p => p.status === '作成中').length}件 • 完了: {deliveryPlans.filter(p => p.status === '作成完了').length}件
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nexus-border">
                  <th className="text-left p-4 font-medium text-nexus-text-secondary">納品プランID</th>
                  <th className="text-left p-4 font-medium text-nexus-text-secondary">セラー名</th>
                  <th className="text-left p-4 font-medium text-nexus-text-secondary">作成日</th>
                  <th className="text-center p-4 font-medium text-nexus-text-secondary">ステータス</th>
                  <th className="text-right p-4 font-medium text-nexus-text-secondary">商品数</th>
                  <th className="text-right p-4 font-medium text-nexus-text-secondary">総価値</th>
                  <th className="text-center p-4 font-medium text-nexus-text-secondary">操作</th>
                </tr>
              </thead>
              <tbody>
                {deliveryPlans.map((plan) => {
                  const StatusIcon = getStatusIcon(plan.status);
                  return (
                    <tr key={plan.id} className="border-b border-nexus-border hover:bg-nexus-bg-tertiary">
                      <td className="p-4">
                        <span className="font-mono text-nexus-text-primary">
                          TWD-{plan.date.replace(/-/g, '')}-{String(plan.id).padStart(3, '0')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-nexus-text-primary">{plan.sellerName}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm">{plan.date}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="w-4 h-4" />
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                              {plan.status}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-display">{plan.items}点</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-bold text-nexus-text-primary">¥{plan.value.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <NexusButton
                            onClick={() => handlePlanDetail(plan)}
                            size="sm"
                            variant="default"
                            icon={<EyeIcon className="w-4 h-4" />}
                          >
                            詳細
                          </NexusButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {deliveryPlans.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-nexus-text-secondary">
                      納品プランがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 