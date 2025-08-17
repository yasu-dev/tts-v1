'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import BaseModal from '@/app/components/ui/BaseModal';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusCheckbox from '@/app/components/ui/NexusCheckbox';
import Pagination from '@/app/components/ui/Pagination';
import { useRouter } from 'next/navigation';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

interface Location {
  code: string;
  name: string;
  type: 'standard' | 'controlled' | 'secure' | 'processing';
  capacity: number;
  used: number;
  temperature?: string;
  humidity?: string;
  products: ProductInLocation[];
}

interface ProductInLocation {
  id: string;
  name: string;
  sku: string;
  category: string;
  registeredAt: string;
  registeredBy: string;
}



interface LocationListProps {
  searchQuery?: string;
}

export default function LocationList({ searchQuery = '' }: LocationListProps) {
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<Location[]>([]);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'shipping'>('shipping');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [shippingData, setShippingData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  const [isPickingModalOpen, setIsPickingModalOpen] = useState(false);
  const [selectedPickingItems, setSelectedPickingItems] = useState<any[]>([]);
  const [selectedLocationName, setSelectedLocationName] = useState<string>('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // ページネーション状態（リストビュー用）
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetchLocations();

    fetchShippingData();
  }, []);

  // Filter locations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter(location =>
        location.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.products.some(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.id.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery, locations]);

  // ページネーション計算（リストビュー用）
  const paginatedLocations = useMemo(() => {
    if (viewMode !== 'list') {
      return filteredLocations;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLocations.slice(startIndex, endIndex);
  }, [filteredLocations, currentPage, itemsPerPage, viewMode]);

  const totalItems = viewMode === 'list' ? filteredLocations.length : 0;
  const totalPages = viewMode === 'list' ? Math.ceil(totalItems / itemsPerPage) : 0;

  // モーダルが開いたときにスクロール位置をリセット
  useEffect(() => {
    if (selectedLocation) {
      // ページ全体を最上部にスクロール - 正しいスクロールコンテナを対象
      const scrollContainer = document.querySelector('.page-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      } else {
        window.scrollTo(0, 0);
      }
      
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTop = 0;
      }
    }
  }, [selectedLocation]);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      if (response.ok) {
        const data = await response.json();
        const fetchedLocations = data.map((location: any) => ({
          code: location.code,
          name: location.name,
          type: mapLocationTypeFromApi(location.zone),
          capacity: location.capacity || 50,
          used: location._count?.products || 0,
          products: (location.products || []).map((product: any) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            registeredAt: product.createdAt,
            registeredBy: product.seller?.username || 'システム'
          }))
        }));
        setLocations(fetchedLocations);
        setFilteredLocations(fetchedLocations);
        return;
      }
      
      // APIエラー時のフォールバック
      console.error('Failed to fetch locations from API');
      const mockLocations: Location[] = [
        {
          code: 'STD-A-01',
          name: '標準棚A-01',
          type: 'standard',
          capacity: 50,
          used: 32,
          products: [
            {
              id: 'TWD-2024-001',
              name: 'Canon EOS R5 ボディ',
              sku: 'CAM-001',
              category: 'camera_body',
              registeredAt: '2024-01-20T10:00:00',
              registeredBy: 'セラーA',
            },
            {
              id: 'TWD-2024-003',
              name: 'Nikon Z9 ボディ',
              sku: 'CAM-003',
              category: 'camera_body',
              registeredAt: '2024-01-19T15:00:00',
              registeredBy: 'セラーB',
            },
          ],
        },
        {
          code: 'HUM-01',
          name: '防湿庫01',
          type: 'controlled',
          capacity: 30,
          used: 25,
          temperature: '22°C',
          humidity: '45%',
          products: [
            {
              id: 'TWD-2024-002',
              name: 'Sony FE 24-70mm F2.8 GM',
              sku: 'LENS-001',
              category: 'lens',
              registeredAt: '2024-01-18T14:00:00',
              registeredBy: 'セラーC',
            },
          ],
        },
        {
          code: 'VAULT-01',
          name: '金庫室01',
          type: 'secure',
          capacity: 10,
          used: 5,
          products: [],
        },
        {
          code: 'INSP-A',
          name: '検品室A',
          type: 'processing',
          capacity: 100,
          used: 15,
          products: [],
        },
      ];

      setLocations(mockLocations);
      setFilteredLocations(mockLocations);
    } catch (error) {
      console.error('[ERROR] Fetch locations:', error);
    } finally {
      setLoading(false);
    }
  };



  const fetchShippingData = async () => {
    try {
      // ピッキングタスクデータを取得
      const response = await fetch('/api/picking');
      if (response.ok) {
        const data = await response.json();
        // ピッキングタスクを出荷リスト形式に変換
        const pickingItems = (data.tasks || []).flatMap((task: any) => 
          (task.items || []).map((item: any) => ({
            id: `pick-${item.id}`,
            orderId: task.orderId,
            productId: item.productId,
            productName: item.productName,
            customer: task.customerName,
            locationCode: item.location,
            locationName: `ロケーション ${item.location}`,
            status: item.status === 'picked' ? 'ピッキング済み' : 'ピッキング待ち',
            deadline: new Date(task.dueDate).toLocaleTimeString('ja-JP', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            sku: item.sku
          }))
        );
        
        const groupedByLocation = groupShippingDataByLocation(pickingItems);
        setShippingData(groupedByLocation);
        return;
      }
      
      // フォールバック: モックデータ
      const mockShippingData = [
        {
          id: "ship-001",
          orderId: "ORD-2024-0628-001",
          productId: "TWD-CAM-011",
          productName: "Nikon Z8",
          customer: "山田太郎",
          locationCode: "A-01",
          locationName: "A棚1段目",
          status: "ピッキング待ち",
          deadline: "16:00"
        },
        {
          id: "ship-002",
          orderId: "ORD-2024-0628-002",
          productId: "TWD-LEN-005",
          productName: "Canon RF 24-70mm F2.8",
          customer: "佐藤花子",
          locationCode: "B-01",
          locationName: "B棚1段目",
          status: "ピッキング待ち",
          deadline: "18:00"
        },
        {
          id: "ship-003",
          orderId: "ORD-2024-0628-003",
          productId: "TWD-WATCH-001",
          productName: "Rolex Submariner",
          customer: "田中一郎",
          locationCode: "C-01",
          locationName: "C棚1段目（高価値商品）",
          status: "ピッキング待ち",
          deadline: "17:00"
        }
      ];
      const groupedData = groupShippingDataByLocation(mockShippingData);
      setShippingData(groupedData);
    } catch (error) {
      console.error('[ERROR] Fetch shipping data:', error);
      // エラー時もモックデータを表示
      const mockShippingData = [
        {
          id: "ship-001",
          orderId: "ORD-2024-0628-001",
          productId: "TWD-CAM-011",
          productName: "Nikon Z8",
          customer: "山田太郎",
          locationCode: "A-01",
          locationName: "A棚1段目",
          status: "ピッキング待ち",
          deadline: "16:00"
        },
        {
          id: "ship-002",
          orderId: "ORD-2024-0628-002",
          productId: "TWD-LEN-005",
          productName: "Canon RF 24-70mm F2.8",
          customer: "佐藤花子",
          locationCode: "B-01",
          locationName: "B棚1段目",
          status: "ピッキング待ち",
          deadline: "18:00"
        }
      ];
      const groupedData = groupShippingDataByLocation(mockShippingData);
      setShippingData(groupedData);
    }
  };

  const groupShippingDataByLocation = (shippingItems: any[]) => {
    const grouped = shippingItems.reduce((acc, item) => {
      const locationKey = item.locationCode || 'NO_LOCATION';
      if (!acc[locationKey]) {
        acc[locationKey] = {
          locationCode: item.locationCode || 'NO_LOCATION',
          locationName: item.locationName || '未設定',
          items: []
        };
      }
      acc[locationKey].items.push(item);
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(grouped);
  };

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'standard':
        return { label: '標準保管', badge: 'info' };
      case 'controlled':
        return { label: '環境管理', badge: 'warning' };
      case 'secure':
        return { label: '高セキュリティ', badge: 'danger' };
      case 'processing':
        return { label: '作業エリア', badge: 'success' };
      default:
        return { label: 'その他', badge: 'info' };
    }
  };

  const getOccupancyStatus = (used: number, capacity: number) => {
    const percentage = (used / capacity) * 100;
    if (percentage >= 90) return 'critical';
    if (percentage >= 70) return 'monitoring';
    return 'optimal';
  };

  const mapLocationTypeFromApi = (zone: string) => {
    switch (zone?.toLowerCase()) {
      case 'h': return 'controlled'; // 防湿庫
      case 't': return 'controlled'; // 温度管理庫
      case 'v': return 'secure'; // 金庫室
      case 'p': return 'processing'; // 作業エリア
      case 's': return 'processing'; // 一時保管エリア
      case 'r': return 'processing'; // 返品処理エリア
      case 'a': return 'standard'; // Zone A
      case 'b': return 'standard'; // Zone B
      case 'c': return 'standard'; // Zone C
      default: return 'standard'; // その他標準棚
    }
  };

  const handleCreateLocation = async (locationData: any) => {
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData)
      });
      
      if (response.ok) {
        showToast({
          type: 'success',
          title: 'ロケーション作成完了',
          message: `${locationData.name}を作成しました`,
          duration: 3000
        });
        fetchLocations(); // データを再取得
      } else {
        throw new Error('ロケーション作成に失敗しました');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'エラー',
        message: 'ロケーション作成中にエラーが発生しました',
        duration: 4000
      });
    }
  };

  const handleUpdateLocation = async (locationId: string, updateData: any) => {
    try {
      const response = await fetch('/api/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: locationId, ...updateData })
      });
      
      if (response.ok) {
        showToast({
          type: 'success',
          title: 'ロケーション更新完了',
          message: 'ロケーション情報を更新しました',
          duration: 3000
        });
        fetchLocations(); // データを再取得
      } else {
        throw new Error('ロケーション更新に失敗しました');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'エラー',
        message: 'ロケーション更新中にエラーが発生しました',
        duration: 4000
      });
    }
  };

  const handleDeleteLocation = async (locationCode: string) => {
    setLocationToDelete(locationCode);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteLocation = async () => {
    if (!locationToDelete) return;

    try {
      const response = await fetch(`/api/locations?code=${locationToDelete}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showToast({
          type: 'success',
          title: 'ロケーション削除完了',
          message: 'ロケーションを削除しました',
          duration: 3000
        });
        fetchLocations(); // データを再取得
        setSelectedLocation(null); // 選択状態をクリア
        setIsDeleteModalOpen(false);
        setLocationToDelete(null);
      } else {
        throw new Error('ロケーション削除に失敗しました');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'エラー',
        message: 'ロケーション削除中にエラーが発生しました',
        duration: 4000
      });
    }
  };

  if (!mounted || loading) {
    return (
      <div className="intelligence-card global">
        <div className="p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-12 w-12 border-b-4 border-nexus-yellow rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="intelligence-card oceania">
        <div className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-display font-bold text-nexus-text-primary">ロケーション一覧</h2>
            
            {/* ビューモード切り替え */}
            <div className="flex gap-1 bg-nexus-bg-secondary p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                    : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                }`}
              >
                グリッド
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                    : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                }`}
              >
                リスト
              </button>

              <button
                onClick={() => setViewMode('shipping')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'shipping'
                    ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                    : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                }`}
              >
                出荷リスト
              </button>
            </div>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-4 p-3 bg-nexus-bg-secondary rounded-lg border border-nexus-border">
              <p className="text-sm text-nexus-text-secondary">
                「<span className="font-medium text-nexus-text-primary">{searchQuery}</span>」の検索結果: 
                <span className="font-medium text-nexus-yellow ml-1">{filteredLocations.length}件</span>
              </p>
            </div>
          )}

          {/* グリッドビュー */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLocations.map((location) => {
                const typeInfo = getLocationTypeLabel(location.type);
                const occupancyStatus = getOccupancyStatus(location.used, location.capacity);
                return (
                  <div
                    key={location.code}
                    className="holo-card p-6 cursor-pointer"
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-nexus-text-primary">{location.name}</h3>
                        <p className="text-sm text-nexus-text-secondary font-mono">{location.code}</p>
                      </div>
                      <span className={`status-badge ${typeInfo.badge}`}>
                        {typeInfo.label}
                      </span>
                    </div>

                    {/* 使用状況 */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-nexus-text-secondary">使用状況</span>
                        <div className="flex items-center gap-2">
                          <div className={`status-orb status-${occupancyStatus}`} />
                          <span className="font-medium text-sm">
                            {location.used}/{location.capacity}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-nexus-bg-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            occupancyStatus === 'critical' ? 'bg-nexus-red' :
                            occupancyStatus === 'monitoring' ? 'bg-nexus-yellow' :
                            'bg-nexus-green'
                          }`}
                          style={{
                            width: `${(location.used / location.capacity) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* 環境情報 */}
                    {location.type === 'controlled' && (
                      <div className="flex gap-4 text-sm text-nexus-text-secondary">
                        {location.temperature && (
                          <span className="flex items-center gap-1">
                            <div className="action-orb w-5 h-5">🌡️</div>
                            {location.temperature}
                          </span>
                        )}
                        {location.humidity && (
                          <span className="flex items-center gap-1">
                            <div className="action-orb blue w-5 h-5">💧</div>
                            {location.humidity}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 商品数 */}
                    <div className="mt-3 text-sm text-nexus-text-secondary">
                      保管商品: <span className="font-medium text-nexus-text-primary">{location.products.length}件</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* リストビュー */}
          {viewMode === 'list' && (
            <div className="holo-table">
              <table className="w-full">
                <thead className="holo-header">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">コード</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">名前</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">タイプ</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">使用状況</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">商品数</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">環境</th>
                  </tr>
                </thead>
                <tbody className="holo-body">
                  {paginatedLocations.map((location) => {
                    const typeInfo = getLocationTypeLabel(location.type);
                    const occupancyStatus = getOccupancyStatus(location.used, location.capacity);
                    return (
                      <tr
                        key={location.code}
                        className="holo-row cursor-pointer"
                        onClick={() => setSelectedLocation(location)}
                      >
                        <td className="px-4 py-4 text-sm font-mono">{location.code}</td>
                        <td className="px-4 py-4 text-sm font-medium">{location.name}</td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`status-badge ${typeInfo.badge}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-nexus-bg-secondary rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  occupancyStatus === 'critical' ? 'bg-nexus-red' :
                                  occupancyStatus === 'monitoring' ? 'bg-nexus-yellow' :
                                  'bg-nexus-green'
                                }`}
                                style={{
                                  width: `${(location.used / location.capacity) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {location.used}/{location.capacity}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-center font-display">
                          {location.products.length}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {location.temperature && `🌡️ ${location.temperature} `}
                          {location.humidity && `💧 ${location.humidity}`}
                          {!location.temperature && !location.humidity && '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* ページネーション（リストビュー用） */}
              {totalItems > 0 && (
                <div className="mt-6 pt-4 border-t border-nexus-border">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                </div>
              )}
            </div>
          )}



          {/* 出荷リストビュー */}
          {viewMode === 'shipping' && (
            <div className="space-y-6">
              {shippingData.length === 0 ? (
                <div className="text-center p-8 text-nexus-text-secondary">
                  ピッキング対象の商品はありません
                  <p className="text-sm mt-2">ラベル準備完了後、商品がここに表示されます</p>
                </div>
              ) : (
                shippingData.filter(locationGroup => {
                  // ピッキング待ちの商品があるロケーションのみ表示
                  const activeItems = locationGroup.items.filter((item: any) => 
                    item.status === 'ピッキング待ち'
                  );
                  
                  if (activeItems.length === 0) return false;
                  
                  // 検索条件でフィルタリング
                  if (!searchQuery) return true;
                  
                  return locationGroup.locationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    locationGroup.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    locationGroup.items.some((item: any) => 
                      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                }).map((locationGroup) => {
                  const activeItems = locationGroup.items.filter((item: any) => 
                    item.status === 'ピッキング待ち'
                  );
                  const completedItems = []; // orderedステータスの商品は全てピッキング待ち
                  
                  return (
                  <div key={locationGroup.locationCode} className="holo-card p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-nexus-text-primary flex items-center gap-3">
                        <svg className="w-5 h-5 text-nexus-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {locationGroup.locationName}
                        <span className="text-sm font-mono text-nexus-text-secondary">({locationGroup.locationCode})</span>
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-nexus-text-secondary mt-1">
                        <span>
                          未処理: <span className="font-medium text-nexus-yellow">{activeItems.length}件</span>
                        </span>
                        {completedItems.length > 0 && (
                          <span>
                            処理済み: <span className="font-medium text-green-600">{completedItems.length}件</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {locationGroup.items.map((item: any) => (
                        <div 
                          key={item.id} 
                          className="flex justify-between items-start p-4 rounded-lg border bg-nexus-bg-secondary border-nexus-border"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            {/* 商品選択チェックボックス */}
                            {item.status === 'ピッキング待ち' && (
                              <div className="mt-1">
                                <NexusCheckbox
                                  checked={selectedProductIds.includes(item.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedProductIds(prev => [...prev, item.id]);
                                    } else {
                                      setSelectedProductIds(prev => prev.filter(id => id !== item.id));
                                    }
                                  }}
                                  variant="nexus"
                                  size="md"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-medium text-nexus-text-primary">{item.productName}</h4>
                                {item.sku && (
                                  <span className="text-xs font-mono bg-nexus-bg-primary px-2 py-1 rounded text-nexus-text-secondary">
                                    {item.sku}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-nexus-text-secondary font-mono mt-1">
                                商品ID: {item.productId} | 注文ID: {item.orderId}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="text-nexus-text-secondary">
                                  顧客: <span className="font-medium text-nexus-text-primary">{item.customer}</span>
                                </span>
                                <span className="text-nexus-text-secondary">
                                  締切: <span className="font-medium text-nexus-yellow">{item.deadline}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`status-badge ${
                              item.status === 'ピッキング待ち' ? 'warning' :
                              item.status === 'ピッキング作業中' ? 'processing' :
                              item.status === 'ピッキング済み' ? 'success' :
                              item.status === '準備完了' ? 'success' :
                              item.status === '梱包待ち' ? 'info' :
                              item.status === '出荷完了' ? 'info' : 'info'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-nexus-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {activeItems.length > 0 && (
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={activeItems.every(item => selectedProductIds.includes(item.id))}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const newIds = activeItems.map(item => item.id);
                                    setSelectedProductIds(prev => [...new Set([...prev, ...newIds])]);
                                  } else {
                                    const activeItemIds = activeItems.map(item => item.id);
                                    setSelectedProductIds(prev => prev.filter(id => !activeItemIds.includes(id)));
                                  }
                                }}
                                className="w-4 h-4 text-nexus-yellow bg-nexus-bg-primary border-nexus-border rounded focus:ring-nexus-yellow focus:ring-2"
                              />
                              <span className="text-sm text-nexus-text-secondary">
                                このロケーションの全商品を選択
                              </span>
                            </div>
                          )}
                          {selectedProductIds.filter(id => 
                            activeItems.some(item => item.id === id)
                          ).length > 0 && (
                            <span className="text-sm font-medium text-nexus-text-primary">
                              {selectedProductIds.filter(id => 
                                activeItems.some(item => item.id === id)
                              ).length}件選択済み
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <NexusButton
                            variant="default"
                            size="sm"
                            onClick={() => {
                              const currentLocationSelectedIds = selectedProductIds.filter(id => 
                                activeItems.some(item => item.id === id)
                              );
                              if (currentLocationSelectedIds.length > 0) {
                                setSelectedProductIds(prev => prev.filter(id => !currentLocationSelectedIds.includes(id)));
                              }
                            }}
                            disabled={selectedProductIds.filter(id => 
                              activeItems.some(item => item.id === id)
                            ).length === 0}
                          >
                            選択解除
                          </NexusButton>
                          <NexusButton
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              const selectedItemsFromThisLocation = activeItems.filter(item => 
                                selectedProductIds.includes(item.id)
                              );
                              setSelectedPickingItems(selectedItemsFromThisLocation);
                              setSelectedLocationName(locationGroup.locationName);
                              setIsPickingModalOpen(true);
                            }}
                            disabled={selectedProductIds.filter(id => 
                              activeItems.some(item => item.id === id)
                            ).length === 0}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            選択商品をピッキング指示
                            ({selectedProductIds.filter(id => 
                              activeItems.some(item => item.id === id)
                            ).length})
                          </NexusButton>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ロケーション詳細モーダル */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[10001] p-4 pt-8">
          <div className="intelligence-card global max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-8 border-b border-nexus-border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-display font-bold text-nexus-text-primary">
                    {selectedLocation.name}
                  </h3>
                  <p className="text-nexus-text-secondary font-mono">{selectedLocation.code}</p>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="action-orb"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]" ref={modalScrollRef}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-3 text-nexus-text-primary">基本情報</h4>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-nexus-text-secondary">タイプ:</dt>
                      <dd>
                        <span className={`status-badge ${getLocationTypeLabel(selectedLocation.type).badge}`}>
                          {getLocationTypeLabel(selectedLocation.type).label}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-nexus-text-secondary">容量:</dt>
                      <dd className="font-medium">{selectedLocation.capacity}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-nexus-text-secondary">使用中:</dt>
                      <dd className="font-medium">{selectedLocation.used}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-nexus-text-secondary">空き:</dt>
                      <dd className="font-medium">{selectedLocation.capacity - selectedLocation.used}</dd>
                    </div>
                  </dl>
                </div>

                {selectedLocation.type === 'controlled' && (
                  <div>
                    <h4 className="font-semibold mb-3 text-nexus-text-primary">環境情報</h4>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-nexus-text-secondary">温度:</dt>
                        <dd className="font-medium">{selectedLocation.temperature || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-nexus-text-secondary">湿度:</dt>
                        <dd className="font-medium">{selectedLocation.humidity || '-'}</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-nexus-text-primary">
                  保管商品 ({selectedLocation.products.length}件)
                </h4>
                {selectedLocation.products.length > 0 ? (
                  <div className="holo-table">
                    <div className="holo-body">
                      {selectedLocation.products.map((product) => (
                        <div key={product.id} className="holo-row p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-nexus-text-primary">{product.name}</p>
                              <p className="text-sm text-nexus-text-secondary font-mono">
                                ID: {product.id} | SKU: {product.sku}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{product.registeredBy}</p>
                              <p className="text-sm text-nexus-text-secondary">
                                {new Date(product.registeredAt).toLocaleDateString('ja-JP', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-nexus-text-secondary text-center py-8">
                    このロケーションに商品はありません
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <BaseModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setLocationToDelete(null);
        }}
        title="ロケーション削除の確認"
        size="md"
      >
        <div>
          <p className="text-nexus-text-primary mb-4">
            このロケーションを削除しますか？
          </p>
          <p className="text-nexus-text-secondary text-sm mb-6">
            この操作は元に戻せません。
          </p>
          <div className="flex justify-end gap-3">
            <NexusButton
              onClick={() => {
                setIsDeleteModalOpen(false);
                setLocationToDelete(null);
              }}
              variant="default"
            >
              キャンセル
            </NexusButton>
            <NexusButton
              onClick={confirmDeleteLocation}
              variant="danger"
            >
              削除する
            </NexusButton>
          </div>
        </div>
      </BaseModal>

      {/* ピッキングリスト作成確認モーダル */}
      <BaseModal
        isOpen={isPickingModalOpen}
        onClose={() => {
          setIsPickingModalOpen(false);
          setSelectedPickingItems([]);
          setSelectedLocationName('');
        }}
        title="ピッキング指示作成"
        size="lg"
      >
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-nexus-text-primary mb-2">
              {selectedLocationName}の選択商品
            </h3>
            <p className="text-sm text-nexus-text-secondary">
              以下の{selectedPickingItems.length}件の商品に対してピッキング指示を作成し、出荷管理に追加します
            </p>
          </div>

          {/* 商品リスト */}
          <div className="bg-nexus-bg-secondary rounded-lg p-4 mb-6 max-h-60 overflow-y-auto">
            {selectedPickingItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-3 border-b border-nexus-border last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium text-nexus-text-primary">{item.productName}</p>
                  <p className="text-sm text-nexus-text-secondary">
                    商品ID: {item.productId} | 顧客: {item.customer}
                  </p>
                  {item.sku && (
                    <p className="text-xs font-mono text-nexus-text-secondary mt-1">
                      SKU: {item.sku}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-nexus-text-secondary">
                    締切: {item.deadline}
                  </p>
                  <p className="text-xs text-nexus-text-secondary mt-1">
                    ロケーション: {selectedLocationName}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 次のステップの説明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardDocumentListIcon className="w-4 h-4 text-blue-900" />
              <h4 className="font-semibold text-blue-900">作業フロー</h4>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>商品ステータスを「ピッキング作業中」に更新</li>
              <li>出荷管理画面に作業対象として追加</li>
              <li>スタッフが物理的なピッキング作業を実施</li>
              <li>ピッキング完了後、梱包・出荷作業へ進行</li>
            </ol>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-nexus-text-secondary">
              ※ 出荷管理画面で詳細な作業指示を確認できます
            </p>
            <div className="flex gap-3">
              <NexusButton
                onClick={() => {
                  setIsPickingModalOpen(false);
                  setSelectedPickingItems([]);
                  setSelectedLocationName('');
                }}
                variant="default"
              >
                キャンセル
              </NexusButton>
              <NexusButton
                onClick={async () => {
                  try {
                    // ピッキング指示を作成
                    const productIds = selectedPickingItems.map(item => item.productId || item.id);
                    
                    const response = await fetch('/api/picking', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        productIds,
                        action: 'create_picking_instruction',
                        locationCode: selectedLocationName.split(' ')[0] || 'UNKNOWN',
                        locationName: selectedLocationName
                      })
                    });

                    if (response.ok) {
                      const result = await response.json();
                      
                      // 選択された商品のIDをクリア
                      const processedIds = selectedPickingItems.map(item => item.id);
                      setSelectedProductIds(prev => prev.filter(id => !processedIds.includes(id)));

                      showToast({
                        type: 'success',
                        title: 'ピッキング指示作成完了',
                        message: `${selectedLocationName}の商品${selectedPickingItems.length}件を出荷管理に追加しました`,
                        duration: 4000
                      });

                      // 出荷管理画面へ遷移
                      router.push('/staff/shipping?status=workstation');
                    } else {
                      throw new Error('ピッキング指示作成に失敗しました');
                    }
                  } catch (error) {
                    console.error('Error creating picking instruction:', error);
                    showToast({
                      type: 'error',
                      title: 'エラー',
                      message: 'ピッキング指示作成中にエラーが発生しました',
                      duration: 4000
                    });
                  }
                  
                  setIsPickingModalOpen(false);
                  setSelectedPickingItems([]);
                  setSelectedLocationName('');
                }}
                variant="primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ピッキング指示を作成
              </NexusButton>
            </div>
          </div>
        </div>
      </BaseModal>
    </div>
  );
} 