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
  XMarkIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import NexusSelect from '@/app/components/ui/NexusSelect';
import { BusinessStatusIndicator } from '@/app/components/ui/StatusIndicator';
import Pagination from '@/app/components/ui/Pagination';
import BaseModal from '@/app/components/ui/BaseModal';
import { useModal } from '@/app/components/ui/ModalContext';
import { useSystemSetting } from '@/lib/hooks/useMasterData';
import { useIsHierarchicalChecklistEnabled } from '@/lib/hooks/useHierarchicalChecklistFeature';
import HierarchicalChecklistDisplay from '@/app/components/features/delivery-plan/HierarchicalChecklistDisplay';

type SortField = 'date' | 'status' | 'items' | 'value';
type SortDirection = 'asc' | 'desc';

export default function DeliveryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  // 🎛️ フィーチャーフラグ：階層型検品チェックリストの有効/無効
  const isHierarchicalEnabled = useIsHierarchicalChecklistEnabled();
  console.log(`[DeliveryPage] 階層型検品チェックリスト: ${isHierarchicalEnabled ? '有効(新システム)' : '無効(既存システム)'}`);
  
  const { setIsAnyModalOpen } = useModal();
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
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [shippingTrackingNumber, setShippingTrackingNumber] = useState('');
  
  // 🚨 安全な取り下げ機能用の状態
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelConfirmStep, setCancelConfirmStep] = useState(0); // 段階的確認: 0=初期, 1=警告確認, 2=最終確認
  const [cancelTypeText, setCancelTypeText] = useState(''); // タイプ確認用
  const [isCancelProcessing, setIsCancelProcessing] = useState(false);
  
  // マスタデータの取得
  const { setting: deliveryStatuses, loading: masterDataLoading } = useSystemSetting('delivery_statuses');

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
    fetchDeliveryPlans().catch(error => {
      console.error('[ERROR] fetchDeliveryPlans Promise rejection:', error);
    });
  }, [currentPage, itemsPerPage, selectedStatus, searchQuery]);

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
          case 'last7days':
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return planDateOnly >= sevenDaysAgo;

          case 'last30days':
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return planDateOnly >= thirtyDaysAgo;

          case 'last90days':
            const ninetyDaysAgo = new Date(today);
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            return planDateOnly >= ninetyDaysAgo;

          case 'thisMonth':
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return planDateOnly >= thisMonthStart && planDateOnly <= thisMonthEnd;

          case 'nextMonth':
            const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
            return planDateOnly >= nextMonthStart && planDateOnly <= nextMonthEnd;

          case 'thisQuarter':
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const quarterStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
            const quarterEnd = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
            return planDateOnly >= quarterStart && planDateOnly <= quarterEnd;

          case 'custom':
            if (customStartDate && customEndDate) {
              const startDate = new Date(customStartDate);
              const endDate = new Date(customEndDate);
              const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
              const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
              return planDateOnly >= startDateOnly && planDateOnly <= endDateOnly;
            }
            return true;

          default:
            return true;
        }
      });
    }

    return filtered;
  }, [deliveryPlans, dateRange, customStartDate, customEndDate]);

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
          // createdAtの完全なタイムスタンプを使用してソート（時刻も含む）
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
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
          // デフォルトもcreatedAtを使用
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
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
    setIsAnyModalOpen(true); // 業務フロー制御
  };

  const handlePlanAction = (planId: number, action: string) => {
    setAllDeliveryPlans(prev => 
      prev.map((plan: any) => 
        plan.id === planId 
          ? { ...plan, status: action === 'confirm' ? 'Shipped' : 'Pending' }
          : plan
      )
    );
  };

  // 🚨 最大限安全な取り下げ処理
  const handleCancelPlan = async (planId: string) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    console.log(`[CANCEL-UI-${requestId}] 取り下げ処理開始:`, { planId, cancelReason, cancelConfirmStep, selectedPlan });

    try {
      setIsCancelProcessing(true);
      
      const response = await fetch(`/api/delivery-plan/${planId}/cancel`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelReason.trim() || null,
          confirmationToken: requestId
        }),
      });

      const result = await response.json();
      console.log(`[CANCEL-UI-${requestId}] APIレスポンス:`, result);

      if (!response.ok) {
        throw new Error(result.error || '取り下げ処理に失敗しました');
      }

      // 成功時の処理
      showToast({
        type: 'success',
        title: '納品プラン取り下げ完了',
        message: `プラン「${result.data.planNumber}」を正常に取り下げました。`,
        duration: 5000
      });

      // データ再読み込み
      fetchDeliveryPlans().catch(error => {
        console.error('[ERROR] データ再読み込み失敗:', error);
      });

      // モーダルクリーンアップ
      handleCloseCancelModal();

    } catch (error) {
      console.error(`[CANCEL-UI-${requestId}] エラー:`, error);
      
      const errorMessage = error instanceof Error ? error.message : '予期しないエラーが発生しました';
      
      showToast({
        type: 'error',
        title: '取り下げ処理エラー',
        message: errorMessage === '納品プランの取り下げに失敗しました。しばらく時間をおいて再度お試しください。' 
          ? 'サーバーエラーが発生しました。管理者に連絡してください。' 
          : errorMessage,
        duration: 8000
      });
    } finally {
      setIsCancelProcessing(false);
    }
  };

  // 🔒 取り下げモーダルの安全なオープン
  const handleOpenCancelModal = (plan: any) => {
    console.log('[CANCEL-UI] モーダルオープン:', { planId: plan.id, status: plan.status });
    
    // 安全チェック: Pendingステータスのみ
    if (plan.status !== 'Pending') {
      showToast({
        type: 'warning',
        title: '取り下げ不可',
        message: '出荷準備中の納品プランのみ取り下げ可能です。',
        duration: 5000
      });
      return;
    }

    setSelectedPlan(plan);
    setIsCancelModalOpen(true);
    setCancelConfirmStep(0);
    setCancelReason('');
    setCancelTypeText('');
    setIsAnyModalOpen(true);
  };

  // 🧹 取り下げモーダルの安全なクローズ
  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedPlan(null);
    setCancelConfirmStep(0);
    setCancelReason('');
    setCancelTypeText('');
    setIsCancelProcessing(false);
    setIsAnyModalOpen(false);
  };

  // ⏭️ 取り下げ確認ステップの進行
  const handleCancelNextStep = () => {
    if (cancelConfirmStep === 0) {
      // Step 1: 理由入力必須チェック
      if (!cancelReason.trim()) {
        showToast({
          type: 'warning',
          title: '取り下げ理由が必要',
          message: '取り下げ理由を入力してください。',
          duration: 3000
        });
        return;
      }
      setCancelConfirmStep(1);
    } else if (cancelConfirmStep === 1) {
      // Step 2: タイプ確認必須チェック
      if (cancelTypeText.toLowerCase() !== 'キャンセル') {
        showToast({
          type: 'warning', 
          title: '確認テキスト不正',
          message: '「キャンセル」と正確に入力してください。',
          duration: 3000
        });
        return;
      }
      setCancelConfirmStep(2);
    }
  };

  // ⏪ 取り下げ確認ステップの戻り
  const handleCancelPrevStep = () => {
    if (cancelConfirmStep > 0) {
      setCancelConfirmStep(cancelConfirmStep - 1);
    }
  };

  const handleShippingUpdate = async (planId: number) => {
    try {
      const response = await fetch(`/api/delivery-plan/${planId}/shipping`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Shipped',
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
                status: 'Shipped',
                shippingTrackingNumber: shippingTrackingNumber.trim() || null,
                shippedAt: new Date().toISOString()
              }
            : plan
        )
      );

      showToast({
        type: 'success',
        title: '出荷完了',
        message: '納品プランを出荷済みに更新しました',
        duration: 3000
      });

      setIsShippingModalOpen(false);
      setIsAnyModalOpen(false); // 業務フロー制御
      setShippingTrackingNumber('');
      
    } catch (error) {
      console.error('Shipping update error:', error);
      showToast({
        type: 'error',
        title: '出荷更新エラー',
        message: error instanceof Error ? error.message : '出荷更新に失敗しました',
        duration: 5000
      });
    }
  };

  const openShippingModal = (plan: any) => {
    setSelectedPlan(plan);
    setShippingTrackingNumber('');
    setIsShippingModalOpen(true);
    setIsAnyModalOpen(true); // 業務フロー制御
  };

  const generateBarcodePDF = async (planId: number) => {
    try {
      showToast({
        type: 'info',
        title: 'バーコードラベル生成中',
        message: 'バーコードラベルを生成しています...',
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
        throw new Error(errorData.error || 'バーコードラベルの生成に失敗しました');
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
        title: 'バーコードラベル生成完了',
        message: 'バーコードラベルをダウンロードしました。',
        duration: 3000
      });
    } catch (error) {
      console.error('PDF生成エラー:', error);
      showToast({
        type: 'error',
        title: 'バーコードラベル生成エラー',
        message: error instanceof Error ? error.message : 'バーコードラベルの生成に失敗しました。',
        duration: 5000
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <CheckCircleIcon className="h-5 w-5 text-blue-600" />;
      case 'Shipped':
        return <TruckIcon className="h-5 w-5 text-green-600" />;
      case 'Cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'status-badge warning';
      case 'Shipped':
        return 'status-badge success';
      case 'Cancelled':
        return 'status-badge error';
      default:
        return 'status-badge info';
    }
  };

  // ステータスオプション（APIから動的取得）
  const statusOptions = useMemo(() => {
    if (masterDataLoading) return [{ value: 'all', label: '読み込み中...' }];
    if (!deliveryStatuses?.parsedValue) {
      return [
        { value: 'all', label: '全てのステータス' },
        { value: 'Pending', label: '出荷準備中' },
        { value: 'Shipped', label: '出荷済み' },
        { value: 'Cancelled', label: 'キャンセル' },
      ];
    }
    return [
      { value: 'all', label: '全てのステータス' },
      ...deliveryStatuses.parsedValue
        .filter((status: any) => status.key !== 'Draft')
        .map((status: any) => ({
          value: status.key,
          label: status.nameJa
        }))
    ];
  }, [deliveryStatuses, masterDataLoading]);

  const dateRangeOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'last7days', label: '直近7日間' },
    { value: 'last30days', label: '直近30日間' },
    { value: 'last90days', label: '直近90日間（四半期）' },
    { value: 'thisMonth', label: '今月' },
    { value: 'nextMonth', label: '来月' },
    { value: 'thisQuarter', label: '今四半期' },
    { value: 'custom', label: '期間指定' }
  ];



  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* ページヘッダー */}
        <UnifiedPageHeader 
          title="納品管理" 
          subtitle="納品プランの作成・管理・追跡"
          userType="seller"
          iconType="delivery"
        />





        {/* 納品プラン一覧テーブル */}
        <div className="intelligence-card oceania">
          
          {/* ヘッダー部分（上に移動） */}
          <div className="p-6 border-b border-gray-300">
            <div className="flex justify-between items-center">
              <NexusButton 
                variant="primary" 
                onClick={handleCreatePlan}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                新規作成
              </NexusButton>
            </div>
          </div>
          
          {/* フィルター・検索部分（タイトル削除版） */}
          {!isDetailModalOpen && (
            <div className="p-6 border-b border-gray-300">
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
                  onChange={(e) => {
                    setDateRange(e.target.value);
                    // 期間指定以外を選んだ時はカスタム日付をクリア
                    if (e.target.value !== 'custom') {
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }
                  }}
                  options={dateRangeOptions}
                  variant="nexus"
                />
                
                {/* 期間指定用の日付入力フィールド */}
                {dateRange === 'custom' && (
                  <>
                    <NexusInput
                      type="date"
                      label="開始日"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      variant="nexus"
                    />
                    <NexusInput
                      type="date"
                      label="終了日"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      variant="nexus"
                    />
                  </>
                )}
                
                <NexusInput
                  label="検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="住所、メール、備考で検索..."
                  variant="nexus"
                />
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="holo-table">
              <thead className="holo-header">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider cursor-pointer"
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
                    className="px-6 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider cursor-pointer"
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
                    className="px-6 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider cursor-pointer"
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
                    className="px-6 py-3 text-left text-xs font-medium text-nexus-text-secondary uppercase tracking-wider cursor-pointer"
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
                    商品概要
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
                    <td colSpan={user?.role === 'staff' ? 8 : 7} className="px-6 py-12 text-center text-nexus-text-secondary">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nexus-primary mb-4"></div>
                        <p className="text-lg font-medium mb-2">データを読み込み中...</p>
                        <p className="text-sm">しばらくお待ちください</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={user?.role === 'staff' ? 8 : 7} className="px-6 py-12 text-center text-nexus-text-secondary">
                      <div className="flex flex-col items-center">
                        <XCircleIcon className="h-12 w-12 text-red-500 mb-4" />
                        <p className="text-lg font-medium mb-2 text-red-600">データ取得エラー</p>
                        <p className="text-sm mb-4">{error}</p>
                        <button
                          onClick={() => {
                            setError(null);
                            fetchDeliveryPlans();
                          }}
                          className="px-4 py-2 bg-nexus-primary text-white rounded-md cursor-pointer"
                        >
                          再試行
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : paginatedPlans.length === 0 ? (
                  <tr>
                    <td colSpan={user?.role === 'staff' ? 8 : 7} className="px-6 py-12 text-center text-nexus-text-secondary">
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
                        {new Date(plan.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <BusinessStatusIndicator 
                          status={(() => {
                            // ステータスマッピング
                            const mappedStatus = plan.status === 'Pending' ? 'processing' :
                                                plan.status === 'Shipped' ? 'shipped' :
                                                plan.status === 'Completed' ? 'completed' :
                                                plan.status === 'Cancelled' ? 'cancelled' :
                                                'processing'; // 安全にPendingにフォールバック
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
                      <td className="px-6 py-4 text-sm text-nexus-text-primary max-w-xs">
                        {plan.products && plan.products.length > 0 ? (
                          <div className="space-y-1">
                            {plan.products.slice(0, 2).map((product: any, index: number) => (
                              <div key={index} className="text-xs text-nexus-text-secondary bg-nexus-bg-secondary px-2 py-1 rounded">
                                {product.name}
                                {product.category && (
                                  <span className="text-nexus-text-tertiary ml-1">({product.category})</span>
                                )}
                              </div>
                            ))}
                            {plan.products.length > 2 && (
                              <div className="text-xs text-nexus-text-tertiary">
                                +{plan.products.length - 2}件
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-nexus-text-tertiary">商品詳細なし</span>
                        )}
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

                          {plan.status === 'Pending' && (
                            <>
                              <NexusButton
                                variant="primary"
                                size="sm"
                                onClick={() => openShippingModal(plan)}
                                className="flex items-center gap-1"
                              >
                                <TruckIcon className="h-4 w-4" />
                                出荷
                              </NexusButton>
                              <NexusButton
                                variant="danger"
                                size="sm"
                                onClick={() => handleOpenCancelModal(plan)}
                                className="flex items-center gap-1"
                                title="納品プラン取り下げ"
                              >
                                <XMarkIcon className="h-4 w-4" />
                                取り下げ
                              </NexusButton>
                            </>
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
          {totalCount > 0 && (
            <div className="mt-6 pt-4 border-t border-nexus-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* 詳細モーダル */}
      <BaseModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setIsAnyModalOpen(false); // 業務フロー制御
        }}
        title="納品プラン詳細"
        size="xl"
      >
        {selectedPlan && (
          <div className="space-y-6">
            {/* 基本・配送情報 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-nexus-text-secondary mb-3">基本情報</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">プランID:</span> <span className="font-mono text-xs">{selectedPlan.id}</span></div>
                  <div><span className="font-medium">作成日:</span> {selectedPlan.date}</div>
                  <div>
                    <span className="font-medium">ステータス:</span> 
                    <span className="ml-2">
                      <BusinessStatusIndicator 
                        status={(() => {
                          const mappedStatus = selectedPlan.status === 'Pending' ? 'processing' :
                                            selectedPlan.status === 'Shipped' ? 'shipped' : 
                                            selectedPlan.status === 'Completed' ? 'completed' :
                                            selectedPlan.status === 'Cancelled' ? 'cancelled' :
                                            'processing'; // 安全にPendingにフォールバック
                          return mappedStatus;
                        })()} 
                        size="sm" 
                      />
                    </span>
                  </div>
                  {user?.role === 'staff' && (
                    <div><span className="font-medium">セラー名:</span> {selectedPlan.sellerName}</div>
                  )}
                  <div><span className="font-medium">商品数:</span> {selectedPlan.items}点</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-nexus-text-secondary mb-3">配送・倉庫情報</h4>
                <div className="space-y-2 text-sm">
                  {selectedPlan.warehouseName && (
                    <div><span className="font-medium">配送先倉庫:</span> {selectedPlan.warehouseName}</div>
                  )}
                  <div><span className="font-medium">納品先住所:</span> 
                    <div className="ml-0 mt-1 text-nexus-text-primary bg-nexus-bg-tertiary p-2 rounded text-xs">
                      {selectedPlan.deliveryAddress}
                    </div>
                  </div>
                  <div><span className="font-medium">連絡先メール:</span> {selectedPlan.contactEmail}</div>
                  {selectedPlan.phoneNumber && (
                    <div><span className="font-medium">電話番号:</span> {selectedPlan.phoneNumber}</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-nexus-text-secondary mb-3">配送状況</h4>
                <div className="space-y-2 text-sm">
                  {selectedPlan.shippedAt && (
                    <div><span className="font-medium">発送日:</span> {new Date(selectedPlan.shippedAt).toLocaleDateString()}</div>
                  )}
                  {selectedPlan.shippingTrackingNumber && (
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">追跡番号:</span> 
                        <span 
                          className="ml-2 font-mono text-xs bg-nexus-bg-tertiary px-2 py-1 rounded border cursor-pointer"
                          onClick={() => navigator.clipboard.writeText(selectedPlan.shippingTrackingNumber!)}
                          title="クリックでコピー"
                        >
                          {selectedPlan.shippingTrackingNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const url = generateTrackingUrl('other', selectedPlan.shippingTrackingNumber!);
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                          className="px-3 py-1 bg-nexus-primary text-white text-sm rounded cursor-pointer"
                        >
                          配送状況を確認
                        </button>
                        <span className="text-xs bg-nexus-success text-white px-2 py-1 rounded">
                          発送済み
                        </span>
                      </div>
                    </div>
                  )}
                  {!selectedPlan.shippedAt && selectedPlan.status === 'Pending' && (
                    <div className="text-nexus-text-tertiary">発送準備中...</div>
                  )}
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
                <h4 className="text-sm font-medium text-nexus-text-secondary mb-4 flex items-center gap-2">
                  <ArchiveBoxIcon className="w-4 h-4 text-gray-600" />
                  商品詳細 ({selectedPlan.products.length}点)
                </h4>
                <div className="space-y-4">
                  {selectedPlan.products.map((product: any, index: number) => (
                    <div key={index} className="bg-nexus-bg-secondary p-4 rounded-lg border border-gray-300">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* 商品基本情報 */}
                        <div>
                          <div className="flex items-start gap-3 mb-3">
                            {product.imageUrl && (
                              <img 
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                              />
                            )}
                            <div className="flex-1">
                              <h5 className="font-medium text-nexus-text-primary text-base">{product.name}</h5>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {product.category === 'camera' || product.category === 'camera_body' ? 'カメラ' :
                                   product.category === 'lens' ? 'レンズ' :
                                   product.category === 'watch' ? '腕時計' :
                                   product.category === 'accessory' ? 'アクセサリ' : product.category}
                                </span>
                                {product.condition && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                    {product.condition === 'excellent' ? '優良' :
                                     product.condition === 'very_good' ? '美品' :
                                     product.condition === 'good' ? '良好' :
                                     product.condition === 'fair' ? '普通' :
                                     product.condition === 'poor' ? '要修理' : product.condition}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">

                            {product.purchasePrice !== undefined && product.purchasePrice > 0 && (
                              <div>
                                <span className="font-medium text-nexus-text-secondary">購入価格:</span>
                                <span className="ml-2 text-nexus-text-primary">¥{product.purchasePrice.toLocaleString()}</span>
                              </div>
                            )}
                            {product.serialNumber && (
                              <div>
                                <span className="font-medium text-nexus-text-secondary">シリアル番号:</span>
                                <span className="ml-2 font-mono text-xs text-nexus-text-primary">{product.serialNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 仕入・詳細情報 */}
                        <div>
                          <h6 className="font-medium text-nexus-text-primary mb-2 text-sm">仕入情報</h6>
                          <div className="space-y-2 text-sm">
                            {product.purchaseDate && (
                              <div>
                                <span className="font-medium text-nexus-text-secondary">仕入日:</span>
                                <span className="ml-2 text-nexus-text-primary">{product.purchaseDate}</span>
                              </div>
                            )}
                            {product.supplier && (
                              <div>
                                <span className="font-medium text-nexus-text-secondary">仕入先:</span>
                                <span className="ml-2 text-nexus-text-primary">{product.supplier}</span>
                              </div>
                            )}
                            {product.supplierDetails && (
                              <div>
                                <span className="font-medium text-nexus-text-secondary">仕入詳細:</span>
                                <div className="ml-0 mt-1 text-nexus-text-primary bg-nexus-bg-tertiary p-2 rounded text-xs">
                                  {product.supplierDetails}
                                </div>
                              </div>
                            )}
                            {product.brand && (
                              <div>
                                <span className="font-medium text-nexus-text-secondary">ブランド:</span>
                                <span className="ml-2 text-nexus-text-primary">{product.brand}</span>
                              </div>
                            )}
                            {product.model && (
                              <div>
                                <span className="font-medium text-nexus-text-secondary">モデル:</span>
                                <span className="ml-2 text-nexus-text-primary">{product.model}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>



                      {/* 撮影要望 */}
                      {(() => {
                        console.log(`[DEBUG] 撮影要望データ確認 (商品: ${product.name}):`, {
                          hasPhotographyRequests: !!product.photographyRequests,
                          photographyRequests: product.photographyRequests
                        });
                        return null;
                      })()}
                      {product.photographyRequests && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <span className="font-medium text-nexus-text-secondary text-sm mb-3 block">
                            撮影要望
                          </span>
                          <div className="bg-nexus-bg-tertiary p-3 rounded">
                            {product.photographyRequests.specialPhotography && (
                              <div className="mb-3">
                                <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  特別撮影要求あり
                                </span>
                              </div>
                            )}
                            
                            {product.photographyRequests.specialPhotographyItems && 
                             product.photographyRequests.specialPhotographyItems.length > 0 && (
                              <div className="mb-3">
                                <span className="font-medium text-nexus-text-secondary text-sm block mb-2">
                                  特別撮影項目:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {product.photographyRequests.specialPhotographyItems.map((item: string, idx: number) => {
                                    const itemLabels: Record<string, string> = {
                                      'diagonal_45': '斜め45度撮影',
                                      'functional_details': '機能詳細撮影',
                                      'accessories_individual': '付属品個別撮影',
                                      'closeup': 'クローズアップ撮影',
                                      'internal_structure': '内部構造撮影',
                                      'multiple_angles': '多角度撮影',
                                      'lighting_variation': 'ライティング変更',
                                      'macro_photography': 'マクロ撮影'
                                    };
                                    return (
                                      <span 
                                        key={idx}
                                        className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded"
                                      >
                                        {itemLabels[item] || item}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {product.photographyRequests.customRequests && (
                              <div>
                                <span className="font-medium text-nexus-text-secondary text-sm block mb-2">
                                  カスタム要望:
                                </span>
                                <p className="text-sm text-nexus-text-primary bg-white p-2 rounded border">
                                  {product.photographyRequests.customRequests}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 商品画像（完全版） */}
                      {product.images && product.images.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <span className="font-medium text-nexus-text-secondary text-sm mb-3 block">
                            商品画像 ({product.images.length}枚)
                          </span>
                          <div className="space-y-3">
                            {/* 画像をカテゴリー別にグループ化 */}
                            {(() => {
                              const groupedImages = product.images.reduce((groups: any, image: any, index: number) => {
                                const category = image.category || 'その他';
                                if (!groups[category]) groups[category] = [];
                                groups[category].push({ ...image, originalIndex: index });
                                return groups;
                              }, {});

                              return Object.entries(groupedImages).map(([category, images]: [string, any]) => (
                                <div key={category} className="space-y-2">
                                  <h6 className="text-xs font-medium text-nexus-text-primary bg-nexus-bg-tertiary px-2 py-1 rounded">
                                    {category} ({images.length}枚)
                                  </h6>
                                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                    {images.map((image: any, imgIndex: number) => (
                                      <div key={imgIndex} className="relative group">
                                        <img
                                          src={image.url || image}
                                          alt={`${product.name} ${category} 画像 ${imgIndex + 1}`}
                                          className="w-full h-16 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => window.open(image.url || image, '_blank')}
                                        />
                                        {image.filename && (
                                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 truncate">
                                            {image.filename}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}

                      {/* 検品チェックリスト詳細 - フィーチャーフラグで新旧システム切り替え */}
                      {(() => {
                        console.log(`[DEBUG] 納品プラン詳細: 商品${product.name}の検品チェックリスト:`, JSON.stringify({
                          hasInspectionChecklist: product.hasInspectionChecklist,
                          inspectionChecklistData: product.inspectionChecklistData,
                          hasHierarchicalInspectionData: product.hasHierarchicalInspectionData,
                          hierarchicalInspectionData: product.hierarchicalInspectionData
                        }, null, 2));
                        
                        // 🆕 新システム優先表示: フィーチャーフラグ有効かつ新システムデータ存在
                        if (isHierarchicalEnabled && product.hasHierarchicalInspectionData && product.hierarchicalInspectionData) {
                          return (
                            <div className="mt-3 pt-3 border-t border-gray-300">
                              <div className="flex items-center mb-3">
                                <span className="font-medium text-nexus-text-secondary text-sm">
                                  検品チェックリスト詳細
                                </span>

                              </div>
                              <div className="bg-nexus-bg-tertiary p-3 rounded border">
                                <HierarchicalChecklistDisplay 
                                  data={product.hierarchicalInspectionData} 
                                />
                              </div>
                            </div>
                          );
                        }
                        
                        // 🔄 既存システム表示: フィーチャーフラグ無効 or 既存データのみ存在
                        return product.hasInspectionChecklist && product.inspectionChecklistData ? (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <div className="flex items-center mb-3">
                            <span className="font-medium text-nexus-text-secondary text-sm">
                              検品チェックリスト詳細
                            </span>
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              既存システム
                            </span>
                          </div>
                          <div className="bg-nexus-bg-tertiary p-3 rounded border">
                            <div className="space-y-3">
                              {/* 外装チェック */}
                              <div>
                                <h6 className="text-xs font-medium text-nexus-text-primary mb-2">外装チェック</h6>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className={`p-2 rounded ${product.inspectionChecklistData.exterior?.scratches ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    外装キズ: {product.inspectionChecklistData.exterior?.scratches ? '有り' : '無し'}
                                  </div>
                                  <div className={`p-2 rounded ${product.inspectionChecklistData.exterior?.dents ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    打痕・へこみ: {product.inspectionChecklistData.exterior?.dents ? '有り' : '無し'}
                                  </div>
                                  <div className={`p-2 rounded ${product.inspectionChecklistData.exterior?.discoloration ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    部品欠損: {product.inspectionChecklistData.exterior?.discoloration ? '有り' : '無し'}
                                  </div>
                                  <div className={`p-2 rounded ${product.inspectionChecklistData.exterior?.dust ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    汚れ・ホコリ: {product.inspectionChecklistData.exterior?.dust ? '有り' : '無し'}
                                  </div>
                                </div>
                              </div>

                              {/* 機能チェック */}
                              <div>
                                <h6 className="text-xs font-medium text-nexus-text-primary mb-2">機能チェック</h6>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className={`p-2 rounded ${product.inspectionChecklistData.functionality?.powerOn ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    電源・動作: {product.inspectionChecklistData.functionality?.powerOn ? '異常' : '正常'}
                                  </div>
                                  <div className={`p-2 rounded ${product.inspectionChecklistData.functionality?.allButtonsWork ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    ボタン操作: {product.inspectionChecklistData.functionality?.allButtonsWork ? '異常' : '正常'}
                                  </div>
                                  <div className={`p-2 rounded ${product.inspectionChecklistData.functionality?.screenDisplay ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    画面表示: {product.inspectionChecklistData.functionality?.screenDisplay ? '異常' : '正常'}
                                  </div>
                                  <div className={`p-2 rounded ${product.inspectionChecklistData.functionality?.connectivity ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    接続機能: {product.inspectionChecklistData.functionality?.connectivity ? '異常' : '正常'}
                                  </div>
                                </div>
                              </div>

                              {/* 光学系チェック（カメラ・レンズの場合） */}
                              {(product.category === 'camera' || product.category === 'camera_body' || product.category === 'lens') && (
                                <div>
                                  <h6 className="text-xs font-medium text-nexus-text-primary mb-2">光学系チェック</h6>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className={`p-2 rounded ${product.inspectionChecklistData.optical?.lensClarity ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                      レンズ清浄度: {product.inspectionChecklistData.optical?.lensClarity ? '問題有' : '良好'}
                                    </div>
                                    <div className={`p-2 rounded ${product.inspectionChecklistData.optical?.aperture ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                      絞り機構: {product.inspectionChecklistData.optical?.aperture ? '異常' : '正常'}
                                    </div>
                                    <div className={`p-2 rounded ${product.inspectionChecklistData.optical?.focusAccuracy ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                      フォーカス精度: {product.inspectionChecklistData.optical?.focusAccuracy ? '異常' : '正常'}
                                    </div>
                                    <div className={`p-2 rounded ${product.inspectionChecklistData.optical?.stabilization ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                      手ブレ補正: {product.inspectionChecklistData.optical?.stabilization ? '異常' : '正常'}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 検品メモ */}
                              {product.inspectionChecklistData.notes && (
                                <div>
                                  <h6 className="text-xs font-medium text-nexus-text-primary mb-2">検品メモ</h6>
                                  <div className="bg-nexus-bg-secondary p-2 rounded text-xs text-nexus-text-primary">
                                    {product.inspectionChecklistData.notes}
                                  </div>
                                </div>
                              )}

                              {/* 検品実施者・日時 */}
                              <div className="pt-2 border-t border-gray-300">
                                <div className="flex items-center justify-between text-xs text-nexus-text-tertiary">
                                  <span>作成者: {product.inspectionChecklistData.createdBy || 'システム'}</span>
                                  <span>作成日: {new Date(product.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        ) : null;
                      })()}

                      {/* 検品チェックリストが設定されている場合の簡易表示 */}
                      {product.hasInspectionChecklist && !product.inspectionChecklistData && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              ✓ 検品チェックリスト設定済み
                            </span>
                            <span className="text-xs text-nexus-text-secondary">
                              詳細な検品項目が設定されています（詳細データは別途確認）
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <NexusButton
                variant="secondary"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setIsAnyModalOpen(false); // 業務フロー制御
                }}
              >
                閉じる
              </NexusButton>

              <NexusButton
                variant="primary"
                onClick={() => generateBarcodePDF(selectedPlan.id)}
              >
                <QrCodeIcon className="h-4 w-4 mr-2" />
                バーコードラベル
              </NexusButton>
            </div>
          </div>
        )}
      </BaseModal>

      {/* 発送モーダル */}
      <BaseModal
        isOpen={isShippingModalOpen}
        onClose={() => {
          setIsShippingModalOpen(false);
          setIsAnyModalOpen(false); // 業務フロー制御
        }}
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
                  onClick={() => {
                    setIsShippingModalOpen(false);
                    setIsAnyModalOpen(false); // 業務フロー制御
                  }}
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

      {/* 🚨 最大限安全な取り下げ確認モーダル */}
      <BaseModal
        isOpen={isCancelModalOpen}
        onClose={handleCloseCancelModal}
        title={`納品プラン取り下げ ${cancelConfirmStep === 0 ? '- 理由入力' : cancelConfirmStep === 1 ? '- 警告確認' : '- 最終確認'}`}
        size="lg"
      >
        {selectedPlan && (
          <div className="space-y-6">
            {/* プラン情報表示 */}
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">取り下げ対象プラン</h4>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p><strong>プランID:</strong> {selectedPlan.deliveryId}</p>
                    <p><strong>商品数:</strong> {selectedPlan.items}点</p>
                    <p><strong>作成日:</strong> {selectedPlan.date}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 0: 理由入力 */}
            {cancelConfirmStep === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    取り下げ理由 <span className="text-red-500">*必須</span>
                  </label>
                  <NexusTextarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="例：商品に不具合が見つかったため、発送先住所の変更が必要なため、など"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {cancelReason.length}/500文字（後から変更できません）
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="text-sm font-medium text-blue-800 mb-2">📋 取り下げの影響</h5>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>プランのステータスが「キャンセル済み」に変更されます</li>
                    <li>関連する在庫アイテムが非アクティブになります</li>
                    <li>この操作は取り消しできません</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 1: 警告確認 */}
            {cancelConfirmStep === 1 && (
              <div className="space-y-4">
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-red-800 mb-3">⚠️ 重要な警告</h4>
                      <ul className="text-sm text-red-700 space-y-2 list-disc list-inside">
                        <li><strong>この操作は完全に取り消し不可能です</strong></li>
                        <li>登録された商品データは削除されます</li>
                        <li>関連する在庫管理データも影響を受けます</li>
                        <li>スタッフによる復旧作業が必要になる可能性があります</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-800 mb-2">入力された理由</h5>
                  <p className="text-sm text-gray-700 italic">「{cancelReason}」</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    確認のため「キャンセル」と入力してください <span className="text-red-500">*必須</span>
                  </label>
                  <NexusInput
                    value={cancelTypeText}
                    onChange={(e) => setCancelTypeText(e.target.value)}
                    placeholder="キャンセル"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500">
                    大文字小文字は区別されません
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: 最終確認 */}
            {cancelConfirmStep === 2 && (
              <div className="space-y-4">
                <div className="p-6 bg-red-100 border-2 border-red-300 rounded-lg">
                  <div className="text-center">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
                    <h4 className="text-xl font-bold text-red-800 mb-3">最終確認</h4>
                    <p className="text-red-700 text-sm mb-4">
                      本当にこの納品プランを取り下げますか？<br />
                      <strong>この操作は絶対に取り消せません。</strong>
                    </p>
                    
                    <div className="bg-white p-4 rounded border border-red-200 mb-4">
                      <div className="text-left text-sm">
                        <p><strong>プラン:</strong> {selectedPlan.deliveryId}</p>
                        <p><strong>理由:</strong> {cancelReason}</p>
                        <p><strong>実行日時:</strong> {new Date().toLocaleString('ja-JP')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ボタンエリア */}
            <div className="flex justify-between pt-4 border-t">
              <div>
                {cancelConfirmStep > 0 && (
                  <NexusButton
                    variant="secondary"
                    onClick={handleCancelPrevStep}
                    disabled={isCancelProcessing}
                  >
                    ← 前に戻る
                  </NexusButton>
                )}
              </div>
              
              <div className="flex gap-2">
                <NexusButton
                  variant="secondary"
                  onClick={handleCloseCancelModal}
                  disabled={isCancelProcessing}
                >
                  キャンセル
                </NexusButton>
                
                {cancelConfirmStep < 2 ? (
                  <NexusButton
                    variant="primary"
                    onClick={handleCancelNextStep}
                    disabled={isCancelProcessing}
                  >
                    次へ進む →
                  </NexusButton>
                ) : (
                  <NexusButton
                    variant="danger"
                    onClick={() => handleCancelPlan(selectedPlan.id)}
                    disabled={isCancelProcessing}
                    className="font-bold"
                  >
                    {isCancelProcessing ? '処理中...' : '🚨 取り下げ実行'}
                  </NexusButton>
                )}
              </div>
            </div>
          </div>
        )}
      </BaseModal>
    </DashboardLayout>
  );
} 