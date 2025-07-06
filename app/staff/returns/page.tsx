'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import { ContentCard, NexusLoadingSpinner } from '@/app/components/ui';
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator';
import { ReturnInspection } from '@/app/components/features/returns/ReturnInspection';
import { ReturnRelistingFlow } from '@/app/components/features/returns/ReturnRelistingFlow';
import { ReturnReasonAnalysis } from '@/app/components/features/returns/ReturnReasonAnalysis';
import { Package, Clock, TrendingUp, AlertCircle, ChevronLeft } from 'lucide-react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import BaseModal from '@/app/components/ui/BaseModal';
import NexusButton from '@/app/components/ui/NexusButton';

interface ReturnItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  customer: string;
  returnReason: string;
  returnDate: string;
  originalCondition: string;
  returnedCondition: string;
  status: 'pending' | 'inspecting' | 'approved' | 'rejected' | 'refunded';
  inspector: string;
  customerNote: string;
  refundAmount: string;
  photos?: File[];
  inspectionNote?: string;
  finalDecision?: 'resell' | 'repair' | 'dispose';
}

interface ReturnCategory {
  id: string;
  label: string;
  action: string;
}

interface ReturnsData {
  pendingReturns: ReturnItem[];
  returnCategories: ReturnCategory[];
}

export default function ReturnsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [returnsData, setReturnsData] = useState<ReturnsData | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
  const [inspectionPhotos, setInspectionPhotos] = useState<File[]>([]);
  const [inspectionNote, setInspectionNote] = useState('');
  const [finalDecision, setFinalDecision] = useState<'resell' | 'repair' | 'dispose' | ''>('');
  const [viewMode, setViewMode] = useState<'list' | 'inspection' | 'history'>('list');
  const [filter, setFilter] = useState<'all' | 'pending' | 'inspecting' | 'completed'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'inspection' | 'relisting' | 'analysis'>('inspection');
  const [isUnsellableModalOpen, setIsUnsellableModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/staff/dashboard')
      .then(res => res.json())
      .then(data => {
        setReturnsData(data.returnsData);
      })
      .catch(console.error);
  }, []);

  const handleStartInspection = (returnItem: ReturnItem) => {
    setSelectedReturn(returnItem);
    setViewMode('inspection');
    setInspectionPhotos([]);
    setInspectionNote('');
    setFinalDecision('');
  };

  const handlePhotoUpload = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files);
      setInspectionPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setInspectionPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteInspection = () => {
    if (!selectedReturn) return;
    
    if (!finalDecision) {
      showToast({
        title: '判定未選択',
        message: '最終判定を選択してください',
        type: 'warning'
      });
      return;
    }
    
    showToast({
      title: '検品完了',
      message: `${selectedReturn.productName}の返品検品が完了しました (判定: ${getDecisionLabel(finalDecision)})`,
      type: 'success'
    });
    
    setSelectedReturn(null);
    setInspectionNote('');
    setFinalDecision('');
  };

  const handleUnsellableList = () => {
    showToast({
      title: '再販不可リスト',
      message: '再販不可商品リストを表示します。',
      type: 'info'
    });
    setIsUnsellableModalOpen(false);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '検品待ち';
      case 'inspecting': return '検品中';
      case 'approved': return '承認済み';
      case 'rejected': return '拒否';
      case 'refunded': return '返金完了';
      default: return status;
    }
  };

  const getDecisionLabel = (decision: string) => {
    switch (decision) {
      case 'resell': return '再販可能';
      case 'repair': return '修理必要';
      case 'dispose': return '廃棄';
      default: return decision;
    }
  };

  const handleViewDetails = (returnItem: ReturnItem) => {
    showToast({
      title: '返品詳細',
      message: `注文: ${returnItem.orderId}\n商品: ${returnItem.productName}\n顧客: ${returnItem.customer}\n理由: ${returnItem.returnReason}\nメモ: ${returnItem.customerNote}`,
      type: 'info'
    });
  };

  const handleApproveReturn = (returnItem: ReturnItem) => {
    showToast({
      title: '返品承認',
      message: `${returnItem.productName}の返品を承認しました`,
      type: 'success'
    });
  };

  const handleRejectReturn = (returnItem: ReturnItem) => {
    showToast({
      title: '返品拒否',
      message: `${returnItem.productName}の返品を拒否しました`,
      type: 'warning'
    });
  };

  const handleProcessRefund = (returnItem: ReturnItem) => {
    showToast({
      title: '返金処理',
      message: `${returnItem.refundAmount}の返金処理を開始しました`,
      type: 'success'
    });
  };

  if (!returnsData) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <div className="intelligence-card global">
            <div className="p-8">
              <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                返品処理
              </h1>
              <p className="mt-1 text-sm text-nexus-text-secondary">
                返品商品の検品と再出品を管理します
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <NexusLoadingSpinner size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Mock additional returns for demonstration
  const allReturns: ReturnItem[] = [
    ...returnsData.pendingReturns.map(item => ({
      ...item,
      status: 'pending' as const,
      inspector: '',
      photos: []
    })),
    {
      id: 'return-002',
      orderId: 'ORD-2024-0626-001',
      productId: 'TWD-WAT-007',
      productName: 'Rolex GMT Master',
      customer: '佐藤花子',
      returnReason: '商品説明相違',
      returnDate: '2024-06-26',
      originalCondition: 'A',
      returnedCondition: 'A',
      status: 'approved',
      inspector: '田中次郎',
      customerNote: '思っていた色と違いました',
      refundAmount: '¥2,100,000',
      inspectionNote: '商品に問題なし。顧客都合による返品。',
      finalDecision: 'resell'
    },
    {
      id: 'return-003',
      orderId: 'ORD-2024-0625-002',
      productId: 'TWD-LEN-005',
      productName: 'Canon RF 24-70mm F2.8',
      customer: '山田太郎',
      returnReason: '配送時破損',
      returnDate: '2024-06-25',
      originalCondition: 'A',
      returnedCondition: 'C',
      status: 'refunded',
      inspector: '佐藤花子',
      customerNote: '箱が潰れていて、レンズに傷がありました',
      refundAmount: '¥198,000',
      inspectionNote: '配送中の破損確認。保険申請済み。',
      finalDecision: 'repair'
    }
  ];

  const filteredReturns = filter === 'all' ? allReturns : 
    filter === 'completed' ? allReturns.filter(r => ['approved', 'rejected', 'refunded'].includes(r.status)) :
    allReturns.filter(r => r.status === filter);

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  返品処理
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  顧客からの返品リクエストを処理
                </p>
              </div>
              <div className="flex">
                <NexusButton
                  onClick={() => setIsUnsellableModalOpen(true)}
                  variant="primary"
                  icon={<ExclamationCircleIcon className="w-5 h-5" />}
                >
                  再販不可リスト
                </NexusButton>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <ContentCard className="mb-6">
          <div className="border-b border-nexus-border">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('inspection')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'inspection'
                    ? 'border-nexus-blue text-nexus-blue'
                    : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-nexus-border'
                }`}
              >
                返品検品
              </button>
              <button
                onClick={() => setActiveTab('relisting')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'relisting'
                    ? 'border-nexus-blue text-nexus-blue'
                    : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-nexus-border'
                }`}
              >
                再出品業務フロー
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'analysis'
                    ? 'border-nexus-blue text-nexus-blue'
                    : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-nexus-border'
                }`}
              >
                返品理由分析
              </button>
            </nav>
          </div>
        </ContentCard>

        {/* タブコンテンツ */}
        {activeTab === 'inspection' && (
          <div className="space-y-6">
            {selectedReturn ? (
              <>
                <button
                  onClick={() => setSelectedReturn(null)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  返品リストに戻る
                </button>
                <ReturnInspection />
              </>
            ) : (
              <>
                {/* サマリー統計 */}
                <div className="intelligence-metrics">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="intelligence-card americas">
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-nexus-text-secondary">本日の返品</p>
                            <p className="metric-value font-display text-3xl font-bold text-nexus-text-primary mt-2">{filteredReturns.length}件</p>
                            <p className="text-sm text-nexus-text-secondary mt-1">前日比 +{filteredReturns.length - returnsData.pendingReturns.length}件</p>
                          </div>
                          <div className="action-orb blue">
                            <Package className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="intelligence-card europe">
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-nexus-text-secondary">検品待ち</p>
                            <p className="metric-value font-display text-3xl font-bold text-nexus-text-primary mt-2">{returnsData.pendingReturns.length}件</p>
                            <p className="text-sm text-yellow-600 mt-1">要対応</p>
                          </div>
                          <div className="action-orb yellow">
                            <Clock className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="intelligence-card asia">
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-nexus-text-secondary">返品率</p>
                            <p className="metric-value font-display text-3xl font-bold text-nexus-text-primary mt-2">3.8%</p>
                            <p className="text-sm text-green-600 mt-1">業界平均以下</p>
                          </div>
                          <div className="action-orb green">
                            <TrendingUp className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="intelligence-card africa">
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-nexus-text-secondary">平均処理時間</p>
                            <p className="metric-value font-display text-3xl font-bold text-nexus-text-primary mt-2">2.1日</p>
                            <p className="text-sm text-nexus-text-secondary mt-1">目標: 2日以内</p>
                          </div>
                          <div className="action-orb orange">
                            <AlertCircle className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 返品リスト */}
                <div className="intelligence-card global">
                  <div className="p-8">
                    <h2 className="text-xl font-display font-bold text-nexus-text-primary mb-6">返品商品リスト</h2>
                    
                    {/* フィルター */}
                    <div className="flex gap-2 mb-6">
                      <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          filter === 'all' 
                            ? 'bg-nexus-primary text-white' 
                            : 'bg-nexus-bg-secondary text-nexus-text-secondary hover:bg-nexus-bg-tertiary'
                        }`}
                      >
                        すべて
                      </button>
                      <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          filter === 'pending' 
                            ? 'bg-nexus-primary text-white' 
                            : 'bg-nexus-bg-secondary text-nexus-text-secondary hover:bg-nexus-bg-tertiary'
                        }`}
                      >
                        検品待ち
                      </button>
                      <button
                        onClick={() => setFilter('inspecting')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          filter === 'inspecting' 
                            ? 'bg-nexus-primary text-white' 
                            : 'bg-nexus-bg-secondary text-nexus-text-secondary hover:bg-nexus-bg-tertiary'
                        }`}
                      >
                        検品中
                      </button>
                      <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          filter === 'completed' 
                            ? 'bg-nexus-primary text-white' 
                            : 'bg-nexus-bg-secondary text-nexus-text-secondary hover:bg-nexus-bg-tertiary'
                        }`}
                      >
                        完了
                      </button>
                    </div>
                    
                    <div className="holo-table">
                      <table className="w-full">
                        <thead className="holo-header">
                          <tr>
                            <th className="text-left py-3 px-4">注文ID</th>
                            <th className="text-left py-3 px-4">商品名</th>
                            <th className="text-left py-3 px-4">返品日</th>
                            <th className="text-left py-3 px-4">理由</th>
                            <th className="text-left py-3 px-4">顧客</th>
                            <th className="text-center py-3 px-4">ステータス</th>
                            <th className="text-center py-3 px-4">アクション</th>
                          </tr>
                        </thead>
                        <tbody className="holo-body">
                          {filteredReturns.map((item) => (
                            <tr key={item.id} className="holo-row">
                              <td className="py-4 px-4 font-mono text-sm">{item.orderId}</td>
                              <td className="py-4 px-4 font-medium">{item.productName}</td>
                              <td className="py-4 px-4">{item.returnDate}</td>
                              <td className="py-4 px-4">{item.returnReason}</td>
                              <td className="py-4 px-4">{item.customer}</td>
                              <td className="text-center py-4 px-4">
                                <BusinessStatusIndicator 
                                  status={
                                    item.status === 'inspecting' ? 'inspection' :
                                    item.status === 'approved' ? 'completed' :
                                    item.status === 'rejected' ? 'cancelled' :
                                    item.status === 'refunded' ? 'completed' :
                                    item.status
                                  } 
                                />
                              </td>
                              <td className="text-center py-4 px-4">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleViewDetails(item)}
                                    className="nexus-button text-sm"
                                  >
                                    詳細
                                  </button>
                                  {item.status === 'pending' && (
                                    <button
                                      onClick={() => handleStartInspection(item)}
                                      className="nexus-button primary text-sm"
                                    >
                                      検品開始
                                    </button>
                                  )}
                                  {item.status === 'inspecting' && (
                                    <>
                                      <button
                                        onClick={() => handleApproveReturn(item)}
                                        className="nexus-button primary text-sm"
                                      >
                                        承認
                                      </button>
                                      <button
                                        onClick={() => handleRejectReturn(item)}
                                        className="nexus-button text-sm"
                                      >
                                        拒否
                                      </button>
                                    </>
                                  )}
                                  {item.status === 'approved' && (
                                    <button
                                      onClick={() => handleProcessRefund(item)}
                                      className="nexus-button primary text-sm"
                                    >
                                      返金処理
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'relisting' && <ReturnRelistingFlow />}
        {activeTab === 'analysis' && <ReturnReasonAnalysis />}

        {/* Unsellable Items Modal */}
        <BaseModal
          isOpen={isUnsellableModalOpen}
          onClose={() => setIsUnsellableModalOpen(false)}
          title="再販不可商品リスト"
          size="lg"
        >
          <div className="space-y-6">
            <div className="text-sm text-nexus-text-secondary">
              販売できない商品の一覧です。破損、欠陥、法的問題等で再販不可となった商品を表示しています。
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-nexus-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-nexus-text-secondary">商品名</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-nexus-text-secondary">理由</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-nexus-text-secondary">日付</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-nexus-text-secondary">処理</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-nexus-border">
                    <td className="py-3 px-4 text-sm text-nexus-text-primary">Canon EOS R5（破損品）</td>
                    <td className="py-3 px-4 text-sm text-nexus-text-secondary">配送中破損・修理不能</td>
                    <td className="py-3 px-4 text-sm text-nexus-text-secondary">2024-06-25</td>
                    <td className="py-3 px-4 text-sm">
                      <BusinessStatusIndicator status="maintenance" />
                    </td>
                  </tr>
                  <tr className="border-b border-nexus-border">
                    <td className="py-3 px-4 text-sm text-nexus-text-primary">Rolex Submariner（偽物）</td>
                    <td className="py-3 px-4 text-sm text-nexus-text-secondary">真贋鑑定で偽物判定</td>
                    <td className="py-3 px-4 text-sm text-nexus-text-secondary">2024-06-24</td>
                    <td className="py-3 px-4 text-sm">
                      <BusinessStatusIndicator status="inspection" />
                    </td>
                  </tr>
                  <tr className="border-b border-nexus-border">
                    <td className="py-3 px-4 text-sm text-nexus-text-primary">iPhone 15 Pro（水没）</td>
                    <td className="py-3 px-4 text-sm text-nexus-text-secondary">水没による基板損傷</td>
                    <td className="py-3 px-4 text-sm text-nexus-text-secondary">2024-06-23</td>
                    <td className="py-3 px-4 text-sm">
                      <BusinessStatusIndicator status="storage" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="text-right">
              <NexusButton onClick={handleUnsellableList} variant="primary">
                詳細管理画面へ
              </NexusButton>
            </div>
          </div>
        </BaseModal>
      </div>
    </DashboardLayout>
  );
}