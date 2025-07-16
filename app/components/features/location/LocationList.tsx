'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import BaseModal from '@/app/components/ui/BaseModal';
import NexusButton from '@/app/components/ui/NexusButton';

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

interface LocationMovement {
  id: string;
  productId: string;
  productName: string;
  fromLocation: string;
  toLocation: string;
  movedBy: string;
  movedAt: string;
  reason: string;
}

interface LocationListProps {
  searchQuery?: string;
}

export default function LocationList({ searchQuery = '' }: LocationListProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [movements, setMovements] = useState<LocationMovement[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'movement'>('grid');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
    fetchLocations();
    fetchMovements();
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
          products: location.products || []
        }));
        setLocations(fetchedLocations);
        setFilteredLocations(fetchedLocations);
        return;
      }
      
      // フォールバック: モックデータ
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
              registeredBy: '田中太郎',
            },
            {
              id: 'TWD-2024-003',
              name: 'Nikon Z9 ボディ',
              sku: 'CAM-003',
              category: 'camera_body',
              registeredAt: '2024-01-19T15:00:00',
              registeredBy: '佐藤花子',
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
              registeredBy: '鈴木一郎',
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

  const fetchMovements = async () => {
    try {
      // モックデータ（実際はAPIから取得）
      const mockMovements: LocationMovement[] = [
        {
          id: 'MOV-001',
          productId: 'TWD-2024-001',
          productName: 'Canon EOS R5 ボディ',
          fromLocation: 'INSP-A',
          toLocation: 'STD-A-01',
          movedBy: '田中太郎',
          movedAt: '2024-01-20T10:00:00',
          reason: '検品完了',
        },
        {
          id: 'MOV-002',
          productId: 'TWD-2024-002',
          productName: 'Sony FE 24-70mm F2.8 GM',
          fromLocation: 'INSP-B',
          toLocation: 'HUM-01',
          movedBy: '鈴木一郎',
          movedAt: '2024-01-18T14:00:00',
          reason: '検品完了',
        },
      ];

      setMovements(mockMovements);
    } catch (error) {
      console.error('[ERROR] Fetch movements:', error);
    }
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
      case 'v': return 'secure'; // 金庫室
      case 'p': return 'processing'; // 作業エリア
      default: return 'standard'; // 標準棚
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
                onClick={() => setViewMode('movement')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'movement'
                    ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                    : 'text-nexus-text-secondary hover:text-nexus-text-primary'
                }`}
              >
                移動履歴
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
                  {filteredLocations.map((location) => {
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
            </div>
          )}

          {/* 移動履歴ビュー */}
          {viewMode === 'movement' && (
            <div className="space-y-4">
              {movements.filter(movement => 
                !searchQuery || 
                movement.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                movement.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                movement.toLocation.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((movement) => (
                <div
                  key={movement.id}
                  className="holo-card p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-nexus-text-primary">{movement.productName}</h4>
                      <p className="text-sm text-nexus-text-secondary font-mono">ID: {movement.productId}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-sm font-medium">
                          {movement.fromLocation} → {movement.toLocation}
                        </span>
                        <span className="status-badge info">
                          {movement.reason}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-nexus-text-primary">{movement.movedBy}</p>
                      <p className="text-sm text-nexus-text-secondary">
                        {new Date(movement.movedAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
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
    </div>
  );
} 