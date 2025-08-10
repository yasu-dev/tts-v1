'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import UnifiedPageHeader from '../components/ui/UnifiedPageHeader';
import { useState, useEffect, useMemo } from 'react';
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
  XCircleIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import NexusSelect from '@/app/components/ui/NexusSelect';
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator';
import Pagination from '@/app/components/ui/Pagination';
import BaseModal from '@/app/components/ui/BaseModal';

type SortField = 'date' | 'status' | 'items' | 'value';
type SortDirection = 'asc' | 'desc';

export default function DeliveryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [allDeliveryPlans, setAllDeliveryPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // フィルター・ソート・ページング状態
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [shippingTrackingNumber, setShippingTrackingNumber] = useState('');

  // 納品プランデータを取得
  const fetchDeliveryPlans = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: offset.toString()
      });
      
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/delivery-plan?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        // 認証エラーの場合、ログイン画面にリダイレクト
        window.location.href = '/login';
        return;
      }
      
      const result = await response.json();
      
      if (result.success) {
        setAllDeliveryPlans(result.deliveryPlans || []);
        setTotalCount(result.pagination?.total || 0);
        setHasMoreData(result.pagination?.hasMore || false);
        setError(null);
      } else {
        console.error('API取得失敗:', result.error);
        setError(result.error || 'データの取得に失敗しました');
        setAllDeliveryPlans([]);
        setTotalCount(0);
        setHasMoreData(false);
      }
    } catch (error) {
      console.error('[ERROR] 納品プランの取得に失敗しました:', error);
      setError('サーバーとの通信に失敗しました。しばらく時間をおいてから再度お試しください。');
      setAllDeliveryPlans([]);
      setTotalCount(0);
      setHasMoreData(false);
    } finally {
      setLoading(false);
    }
  };

  // ユーザー情報を取得
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const result = await response.json();
        if (result.success && result.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error('[ERROR] ユーザー情報の取得に失敗しました:', error);
        // エラー時もユーザー取得処理は継続（ゲストモードでの表示など）
      }
    };

    fetchUserInfo().catch(error => {
      console.error('[ERROR] fetchUserInfo Promise rejection:', error);
    });
  }, []);

  // 納品プランデータを取得
  useEffect(() => {
    if (user) {
      fetchDeliveryPlans().catch(error => {
        console.error('[ERROR] fetchDeliveryPlans Promise rejection:', error);
      });
    }
  }, [user, currentPage, itemsPerPage, selectedStatus, searchQuery]);

  // APIからデータを取得するため、allDeliveryPlansをそのまま使用
  const deliveryPlans = allDeliveryPlans;

  // APIでフィルタリングされているため、日付範囲フィルターのみ適用
  const filteredPlans = useMemo(() => {
    let filtered = deliveryPlans;

    // 日付範囲フィルター（APIで対応していないため、フロントエンドで処理）
    if (dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter((plan: any) => {
        const planDate = new Date(plan.date);
        const planDateOnly = new Date(planDate.getFullYear(), planDate.getMonth(), planDate.getDate());
        
        switch (dateRange) {
          case 'today':
            return planDateOnly.getTime() === today.getTime();
          case 'week':
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return planDateOnly >= oneWeekAgo;
          case 'month':
            const oneMonthAgo = new Date(today);
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return planDateOnly >= oneMonthAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [deliveryPlans, dateRange]);

  // 検索とステータスフィルタリングの変更時にデータを再取得
  useEffect(() => {
    if (user) {
      fetchDeliveryPlans();
    }
  }, [selectedStatus, searchQuery]);



  // ソート
  const sortedPlans = useMemo(() => {
    return [...filteredPlans].sort((a: any, b: any) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'items':
          aValue = a.items;
          bValue = b.items;
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredPlans, sortField, sortDirection]);

  // ページング（APIでページネーションされているため、そのまま使用）
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginatedPlans = sortedPlans;

  // 統計データ
  const stats = useMemo(() => {
    const totalPlans = filteredPlans.length;
    const totalValue = filteredPlans.reduce((sum: number, plan: any) => sum + plan.value, 0);
    const totalItems = filteredPlans.reduce((sum: number, plan: any) => sum + plan.items, 0);
    
    const statusCounts = filteredPlans.reduce((acc: any, plan: any) => {
      acc[plan.status] = (acc[plan.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalPlans,
      totalValue,
      totalItems,
      statusCounts
    };
  }, [filteredPlans]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreatePlan = () => {
    router.push('/delivery-plan');
  };

  const handleViewDetails = (plan: any) => {
    setSelectedPlan(plan);
    setIsDetailModalOpen(true);
  };

  const handlePlanAction = (planId: number, action: string) => {
    setAllDeliveryPlans(prev => 
      prev.map((plan: any) => 
        plan.id === planId 
          ? { ...plan, status: action === 'confirm' ? '発送済' : '発送待ち' }
          : plan
      )
    );
  };

  const handleShippingUpdate = async (planId: number) => {
    try {
      const response = await fetch(`/api/delivery-plan/${planId}/shipping`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: '発送済',
          trackingNumber: shippingTrackingNumber.trim() || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '発送更新に失敗しました');
      }

      // ローカルデータを更新
      setAllDeliveryPlans(prev => 
        prev.map((plan: any) => 
          plan.id === planId 
            ? { 
                ...plan, 
                status: '発送済',
                shippingTrackingNumber: shippingTrackingNumber.trim() || null,
                shippedAt: new Date().toISOString()
              }
            : plan
        )
      );

      showToast({
        type: 'success',
        title: '発送完了',
        message: '納品プランを発送済みに更新しました',
        duration: 3000
      });

      setIsShippingModalOpen(false);
      setShippingTrackingNumber('');
      
    } catch (error) {
      console.error('Shipping update error:', error);
      showToast({
        type: 'error',
        title: '発送更新エラー',
        message: error instanceof Error ? error.message : '発送更新に失敗しました',
        duration: 5000
      });
    }
  };

  const openShippingModal = (plan: any) => {
    setSelectedPlan(plan);
    setShippingTrackingNumber('');
    setIsShippingModalOpen(true);
  };

  const generateBarcodePDF = async (planId: number) => {
    try {
      showToast({
        type: 'info',
        title: 'バーコードPDF生成中',
        message: 'バーコードPDFを生成しています...',
        duration: 2000
      });

      const response = await fetch(`/api/delivery-plan/${planId}/barcode-pdf`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'バーコードPDFの生成に失敗しました');
      }

      const result = await response.json();
      
      if (!result.success || !result.base64Data) {
        throw new Error(result.message || 'PDFデータの取得に失敗しました');
      }

      // PDFをダウンロード
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${result.base64Data}`;
      link.download = result.fileName || `delivery-plan-${planId}-barcodes.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        type: 'success',
        title: 'バーコードPDF生成完了',
        message: 'バーコードPDFをダウンロードしました。',
        duration: 3000
      });
    } catch (error) {
      console.error('PDF生成エラー:', error);
      showToast({
        type: 'error',
        title: 'バーコードPDF生成エラー',
        message: error instanceof Error ? error.message : 'バーコードPDFの生成に失敗しました。',
        duration: 5000
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {

      case '発送待ち':
        return <CheckCircleIcon className="h-5 w-5 text-blue-600" />;
      case '発送済':
        return <TruckIcon className="h-5 w-5 text-green-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'status-badge info';
      case 'submitted':
        return 'status-badge warning';
      case 'delivered':
        return 'status-badge success';
      case '発送待ち':
        return 'status-badge warning';
      case '発送済':
        return 'status-badge success';
      default:
        return 'status-badge info';
    }
  };

  const statusOptions = [
    { value: 'all', label: '全てのステータス' },

    { value: '発送待ち', label: '発送待ち' },
    { value: '発送済', label: '発送済' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: '全期間' },
    { value: 'today', label: '今日' },
    { value: 'week', label: '過去1週間' },
    { value: 'month', label: '過去1ヶ月' }
  ];

  const itemsPerPageOptions = [
    { value: 10, label: '10件' },
    { value: 20, label: '20件' },
    { value: 50, label: '50件' },
    { value: 100, label: '100件' }
  ];

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* ページヘッダー */}
        <UnifiedPageHeader 
          title="納品プラン管理" 
          subtitle="納品プランの作成・管理・追跡"
          userType="seller"
          iconType="delivery"
          actions={
            <NexusButton 
              variant="primary" 
              onClick={handleCreatePlan}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              新規作成
            </NexusButton>
          }
        />



        {/* フィルター・検索バー */}
        {!isDetailModalOpen && (
          <div className="intelligence-card global">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FunnelIcon className="h-5 w-5 text-nexus-text-secondary" />
                <h3 className="text-lg font-medium text-nexus-text-primary">フィルター・検索</h3>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NexusSelect
                label="ステータス"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={statusOptions}
                variant="nexus"
              />
              <NexusSelect
                label="期間"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                options={dateRangeOptions}
                variant="nexus"
              />
              <NexusInput
                label="検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="住所、メール、備考で検索..."
                variant="nexus"
              />
            </div>
            </div>
          </div>
        )}

        {/* 納品プラン一覧テーブル */}
        <div className="intelligence-card oceania">
          <div className="p-6 border-b border-nexus-border">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-nexus-text-primary">納品プラン一覧</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-nexus-text-secondary">表示件数:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border border-nexus-border rounded px-2 py-1 text-sm"
                >
                  {itemsPerPageOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="holo-table">
              <thead className="holo-header">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      作成日
                      {sortField === 'date' && (
                        sortDirection === 'asc' 
                          ? <ChevronUpIcon className="h-4 w-4" />
                          : <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      ステータス
                      {sortField === 'status' && (
                        sortDirection === 'asc' 
                          ? <ChevronUpIcon className="h-4 w-4" />
                          : <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  {user?.role === 'staff' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">
                      セラー名
                    </th>
                  )}
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('items')}
                  >
                    <div className="flex items-center gap-1">
                      商品数
                      {sortField === 'items' && (
                        sortDirection === 'asc' 
                          ? <ChevronUpIcon className="h-4 w-4" />
                          : <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider cursor-pointer hover:bg-nexus-bg-tertiary"
                    onClick={() => handleSort('value')}
                  >
                    <div className="flex items-center gap-1">
                      予想価格
                      {sortField === 'value' && (
                        sortDirection === 'asc' 
                          ? <ChevronUpIcon className="h-4 w-4" />
                          : <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">
                    納品先
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-nexus-text-secondary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="holo-body">
                {loading ? (
                  <tr>
                    <td colSpan={user?.role === 'staff' ? 7 : 6} className="px-6 py-12 text-center text-nexus-text-secondary">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nexus-primary mb-4"></div>
                        <p className="text-lg font-medium mb-2">データを読み込み中...</p>
                        <p className="text-sm">しばらくお待ちください</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={user?.role === 'staff' ? 7 : 6} className="px-6 py-12 text-center text-nexus-text-secondary">
                      <div className="flex flex-col items-center">
                        <XCircleIcon className="h-12 w-12 text-red-500 mb-4" />
                        <p className="text-lg font-medium mb-2 text-red-600">データ取得エラー</p>
                        <p className="text-sm mb-4">{error}</p>
                        <button
                          onClick={() => {
                            setError(null);
                            fetchDeliveryPlans();
                          }}
                          className="px-4 py-2 bg-nexus-primary text-white rounded-md hover:bg-nexus-primary-dark transition-colors"
                        >
                          再試行
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : paginatedPlans.length === 0 ? (
                  <tr>
                    <td colSpan={user?.role === 'staff' ? 7 : 6} className="px-6 py-12 text-center text-nexus-text-secondary">
                      <div className="flex flex-col items-center">
                        <DocumentTextIcon className="h-12 w-12 text-nexus-text-tertiary mb-4" />
                        <p className="text-lg font-medium mb-2">納品プランが見つかりません</p>
                        <p className="text-sm mb-4">検索条件を変更するか、新しい納品プランを作成してください</p>
                        <NexusButton
                          variant="primary"
                          onClick={handleCreatePlan}
                          className="flex items-center gap-2"
                        >
                          <PlusIcon className="h-4 w-4" />
                          新規作成
                        </NexusButton>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPlans.map((plan: any) => (
                    <tr key={plan.id} className="holo-row">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-nexus-text-primary">
                        {plan.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <BusinessStatusIndicator 
                          status={(() => {
                            // ステータスマッピング
                            const mappedStatus = plan.status === '下書き' ? 'pending' : 
                                                plan.status === '発送待ち' ? 'processing' :
                                                plan.status === '発送済' ? 'shipped' :
                                                plan.status === '配達完了' ? 'delivered' :
                                                plan.status === '承認済み' ? 'confirmed' :
                                                plan.status === '完了' ? 'completed' :
                                                plan.status === 'draft' ? 'pending' : 
                                                plan.status === 'submitted' ? 'processing' :
                                                plan.status === 'in_transit' ? 'shipping' :
                                                plan.status === 'delivered' ? 'delivered' :
                                                plan.status === 'approved' ? 'confirmed' :
                                                plan.status === 'completed' ? 'completed' :
                                                'pending';
                            return mappedStatus;
                          })()} 
                          size="sm" 
                        />
                      </td>
                      {user?.role === 'staff' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-nexus-text-primary">
                          {plan.sellerName}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-nexus-text-primary">
                        {plan.items}点
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-nexus-text-primary">
                        ¥{plan.value.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-nexus-text-primary max-w-xs truncate">
                        {plan.deliveryAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <NexusButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewDetails(plan)}
                            title="詳細表示"
                          >
                            <EyeIcon className="h-4 w-4" />
                            <span className="ml-1">詳細</span>
                          </NexusButton>

                          {plan.status === '発送待ち' && (
                            <NexusButton
                              variant="primary"
                              size="sm"
                              onClick={() => openShippingModal(plan)}
                              className="flex items-center gap-1"
                            >
                              <TruckIcon className="h-4 w-4" />
                              発送
                            </NexusButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ページング */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-nexus-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={sortedPlans.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* 詳細モーダル */}
      <BaseModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="納品プラン詳細"
      >
        {selectedPlan && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-nexus-text-secondary mb-2">基本情報</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">プランID:</span> {selectedPlan.id}</div>
                  <div><span className="font-medium">作成日:</span> {selectedPlan.date}</div>
                  <div><span className="font-medium">ステータス:</span> {selectedPlan.status}</div>
                  {user?.role === 'staff' && (
                    <div><span className="font-medium">セラー名:</span> {selectedPlan.sellerName}</div>
                  )}
                  <div><span className="font-medium">商品数:</span> {selectedPlan.items}点</div>
                  <div><span className="font-medium">予想価格:</span> ¥{selectedPlan.value.toLocaleString()}</div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-nexus-text-secondary mb-2">配送情報</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">納品先:</span> {selectedPlan.deliveryAddress}</div>
                  <div><span className="font-medium">連絡先:</span> {selectedPlan.contactEmail}</div>
                  <div><span className="font-medium">電話番号:</span> {selectedPlan.phoneNumber}</div>
                </div>
              </div>
            </div>
            
            {selectedPlan.notes && (
              <div>
                <h4 className="text-sm font-medium text-nexus-text-secondary mb-2">備考</h4>
                <p className="text-sm text-nexus-text-primary bg-nexus-bg-secondary p-3 rounded">
                  {selectedPlan.notes}
                </p>
              </div>
            )}

            {selectedPlan.products && selectedPlan.products.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-nexus-text-secondary mb-2">商品詳細</h4>
                <div className="space-y-2">
                  {selectedPlan.products.map((product: any, index: number) => (
                    <div key={index} className="bg-nexus-bg-secondary p-3 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-nexus-text-primary">{product.name}</h5>
                          <p className="text-sm text-nexus-text-secondary">
                            {product.brand} - {product.model}
                          </p>
                          {product.serialNumber && (
                            <p className="text-xs text-nexus-text-secondary">
                              S/N: {product.serialNumber}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-nexus-text-primary">
                            ¥{product.estimatedValue.toLocaleString()}
                          </p>
                          <p className="text-xs text-nexus-text-secondary">
                            {product.category}
                          </p>
                        </div>
                      </div>
                      {product.description && (
                        <p className="text-sm text-nexus-text-secondary mt-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <NexusButton
                variant="secondary"
                onClick={() => setIsDetailModalOpen(false)}
              >
                閉じる
              </NexusButton>

              <NexusButton
                variant="primary"
                onClick={() => generateBarcodePDF(selectedPlan.id)}
              >
                <QrCodeIcon className="h-4 w-4 mr-2" />
                バーコードPDF
              </NexusButton>
            </div>
          </div>
        )}
      </BaseModal>

      {/* 発送モーダル */}
      <BaseModal
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        title="発送処理"
      >
        {selectedPlan && (
          <div className="space-y-4">
            <div className="p-4 bg-nexus-bg-secondary rounded-lg">
              <h4 className="font-medium text-nexus-text-primary mb-2">納品プラン情報</h4>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">プランID:</span> {selectedPlan.id}</div>
                <div><span className="font-medium">セラー:</span> {selectedPlan.sellerName}</div>
                <div><span className="font-medium">商品数:</span> {selectedPlan.items}点</div>
                <div><span className="font-medium">納品先:</span> {selectedPlan.deliveryAddress}</div>
              </div>
            </div>

            <div>
              <NexusInput
                label="発送伝票番号（任意）"
                value={shippingTrackingNumber}
                onChange={(e) => setShippingTrackingNumber(e.target.value)}
                placeholder="例：123-4567-8901（入力しない場合は空欄のまま）"
                variant="nexus"
              />
              <p className="text-xs text-nexus-text-secondary mt-1">
                発送伝票番号は任意です。後から追記することも可能です。
              </p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-end gap-2">
                <NexusButton
                  variant="secondary"
                  onClick={() => setIsShippingModalOpen(false)}
                >
                  キャンセル
                </NexusButton>
                <NexusButton
                  variant="primary"
                  onClick={() => handleShippingUpdate(selectedPlan.id)}
                  className="flex items-center gap-2"
                >
                  <TruckIcon className="h-4 w-4" />
                  発送済みにする
                </NexusButton>
              </div>
            </div>
          </div>
        )}
      </BaseModal>
    </DashboardLayout>
  );
} 