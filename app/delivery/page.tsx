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
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import NexusSelect from '@/app/components/ui/NexusSelect';
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
  const [staticData] = useState([
    { 
      id: 1, 
      date: '2024-01-15', 
      status: '作成完了', 
      items: 5, 
      value: 450000,
      sellerName: '田中太郎',
      sellerId: 'user1',
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
      sellerId: 'user2',
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
      sellerId: 'user3',
      deliveryAddress: '愛知県名古屋市中区栄3-3-3',
      contactEmail: 'suzuki@example.com',
      phoneNumber: '052-9876-5432',
      products: [
        {
          name: 'Nikon D850',
          category: 'カメラ本体',
          brand: 'Nikon',
          model: 'D850',
          serialNumber: 'ND850123456789',
          estimatedValue: 250000,
          description: '高画質一眼レフカメラ'
        },
        {
          name: 'NIKKOR 70-200mm f/2.8E FL ED VR',
          category: 'レンズ',
          brand: 'Nikon',
          model: 'NIKKOR 70-200mm f/2.8E FL ED VR',
          serialNumber: 'NL70200123456',
          estimatedValue: 220000,
          description: '高性能望遠ズームレンズ'
        }
      ]
    },
    { 
      id: 4, 
      date: '2024-01-08', 
      status: '検品中', 
      items: 2, 
      value: 180000,
      sellerName: '高橋次郎',
      sellerId: 'user4',
      deliveryAddress: '神奈川県横浜市中区山手町4-4-4',
      contactEmail: 'takahashi@example.com',
      phoneNumber: '045-1111-2222',
      products: [
        {
          name: 'ROLEX Submariner',
          category: '腕時計',
          brand: 'ROLEX',
          model: 'Submariner Date',
          serialNumber: 'RX116610LN123',
          estimatedValue: 180000,
          description: '高級機械式腕時計'
        }
      ]
    },
    { 
      id: 5, 
      date: '2024-01-05', 
      status: '配送完了', 
      items: 6, 
      value: 720000,
      sellerName: '山田三郎',
      sellerId: 'user5',
      deliveryAddress: '福岡県福岡市博多区博多駅前5-5-5',
      contactEmail: 'yamada@example.com',
      phoneNumber: '092-3333-4444',
      products: []
    },
    { 
      id: 6, 
      date: '2024-01-03', 
      status: '返送済', 
      items: 1, 
      value: 85000,
      sellerName: '伊藤四郎',
      sellerId: 'user6',
      deliveryAddress: '北海道札幌市中央区大通西6-6-6',
      contactEmail: 'ito@example.com',
      phoneNumber: '011-5555-6666',
      products: []
    }
  ]);

  // フィルター・ソート・ページング状態
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

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

      const response = await fetch(`/api/delivery-plan?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setAllDeliveryPlans(result.deliveryPlans || []);
        setTotalCount(result.pagination?.total || 0);
        setHasMoreData(result.pagination?.hasMore || false);
      } else {
        // エラーの場合は静的データを使用
        console.log('API取得失敗、静的データを使用');
        setAllDeliveryPlans(staticData);
        setTotalCount(staticData.length);
        setHasMoreData(false);
      }
    } catch (error) {
      console.error('納品プランの取得に失敗しました:', error);
      // エラーの場合は静的データを使用
      setAllDeliveryPlans(staticData);
      setTotalCount(staticData.length);
      setHasMoreData(false);
    } finally {
      setLoading(false);
    }
  };

  // ユーザー情報を取得
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const result = await response.json();
        if (result.success && result.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error('ユーザー情報の取得に失敗しました:', error);
      }
    };

    fetchUserInfo();
  }, []);

  // 納品プランデータを取得
  useEffect(() => {
    if (user) {
      fetchDeliveryPlans();
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
          ? { ...plan, status: action === 'confirm' ? '発送済' : '返送済' }
          : plan
      )
    );
  };

  const generateBarcodePDF = async (planId: number) => {
    try {
      showToast({
        type: 'info',
        title: 'バーコードPDF生成中',
        message: 'バーコードPDFを生成しています...',
        duration: 2000
      });

      const response = await fetch(`/api/delivery-plan/${planId}/barcode-pdf`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'バーコードPDFの生成に失敗しました');
      }

      // HTMLレスポンスを受け取って新しいタブで開く
      const htmlContent = await response.text();
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        
        // 印刷ダイアログを表示
        setTimeout(() => {
          newWindow.print();
        }, 500);
        
        showToast({
          type: 'success',
          title: 'バーコードPDF生成完了',
          message: 'バーコードPDFが新しいタブで開きました。',
          duration: 3000
        });
      } else {
        throw new Error('新しいタブを開けませんでした');
      }
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
      case '作成完了':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case '発送済':
        return <TruckIcon className="h-5 w-5 text-blue-600" />;
      case '到着済':
        return <CheckIcon className="h-5 w-5 text-green-700" />;
      case '検品中':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case '配送完了':
        return <CheckCircleIcon className="h-5 w-5 text-green-800" />;
      case '返送済':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case '作成完了':
        return 'bg-green-100 text-green-800';
      case '発送済':
        return 'bg-blue-100 text-blue-800';
      case '到着済':
        return 'bg-green-200 text-green-900';
      case '検品中':
        return 'bg-orange-600 text-white';
      case '配送完了':
        return 'bg-green-300 text-green-900';
      case '返送済':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = [
    { value: 'all', label: '全てのステータス' },
    { value: '作成完了', label: '作成完了' },
    { value: '発送済', label: '発送済' },
    { value: '到着済', label: '到着済' },
    { value: '検品中', label: '検品中' },
    { value: '配送完了', label: '配送完了' },
    { value: '返送済', label: '返送済' }
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

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-nexus-border">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-primary-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-nexus-text-secondary">総プラン数</p>
                <p className="text-2xl font-bold text-nexus-text-primary">{stats.totalPlans}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-nexus-border">
            <div className="flex items-center">
              <TruckIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-nexus-text-secondary">総商品数</p>
                <p className="text-2xl font-bold text-nexus-text-primary">{stats.totalItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-nexus-border">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-nexus-text-secondary">総予想価格</p>
                <p className="text-2xl font-bold text-nexus-text-primary">¥{stats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-nexus-border">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-nexus-text-secondary">処理中</p>
                <p className="text-2xl font-bold text-nexus-text-primary">
                  {(stats.statusCounts['検品中'] || 0) + (stats.statusCounts['発送済'] || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* フィルター・検索バー */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-nexus-border">
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

        {/* 納品プラン一覧テーブル */}
        <div className="bg-white rounded-lg shadow-sm border border-nexus-border">
          <div className="px-6 py-4 border-b border-nexus-border">
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
            <table className="min-w-full divide-y divide-nexus-border">
              <thead className="bg-nexus-bg-secondary">
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
              <tbody className="bg-white divide-y divide-nexus-border">
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
                ) : paginatedPlans.length === 0 ? (
                  <tr>
                    <td colSpan={user?.role === 'staff' ? 7 : 6} className="px-6 py-12 text-center text-nexus-text-secondary">
                      <div className="flex flex-col items-center">
                        <DocumentTextIcon className="h-12 w-12 text-nexus-text-tertiary mb-4" />
                        <p className="text-lg font-medium mb-2">納品プランが見つかりません</p>
                        <p className="text-sm">検索条件を変更するか、新しい納品プランを作成してください</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPlans.map((plan: any) => (
                    <tr key={plan.id} className="hover:bg-nexus-bg-tertiary">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-nexus-text-primary">
                        {plan.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(plan.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(plan.status)}`}>
                            {plan.status}
                          </span>
                        </div>
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
                          >
                            <EyeIcon className="h-4 w-4" />
                          </NexusButton>
                          <NexusButton
                            variant="secondary"
                            size="sm"
                            onClick={() => generateBarcodePDF(plan.id)}
                          >
                            <QrCodeIcon className="h-4 w-4" />
                          </NexusButton>
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
            <div className="px-6 py-4 border-t border-nexus-border">
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
    </DashboardLayout>
  );
} 