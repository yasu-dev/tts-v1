'use client';

import { useState, useEffect, useMemo } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import Pagination from '@/app/components/ui/Pagination';
import BaseModal from '@/app/components/ui/BaseModal';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

// eBay注文に基づく商品データ構造
interface EbayProduct {
  id: string;
  productName: string;
  sku: string;
  location: string;
  quantity: number;
  pickedQuantity: number;
  status: 'pending' | 'ready_for_packing' | 'completed';
  // eBay購入に関する情報
  ebayOrderId: string;
  ebayItemId: string;
  buyerName: string;
  buyerUserId: string;
  purchaseDate: string;
  // 梱包判断用情報
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  // 同梱情報
  canCombineWith?: string[]; // 同梱可能な他の商品ID
  combineGroup?: string; // 同梱グループID
}

// 同梱グループ
interface CombineGroup {
  id: string;
  buyerName: string;
  buyerUserId: string;
  purchaseDate: string;
  productIds: string[];
  combinedPackage?: boolean;
}

export default function PickingListManager() {
  const [products, setProducts] = useState<EbayProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [combineGroups, setCombineGroups] = useState<CombineGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isPickingModalOpen, setIsPickingModalOpen] = useState(false);
  const [isCombineModalOpen, setIsCombineModalOpen] = useState(false);
  const [productsToProcess, setProductsToProcess] = useState<EbayProduct[]>([]);

  // ページング状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { showToast } = useToast();

  useEffect(() => {
    fetchEbayProducts();
  }, []);

  const fetchEbayProducts = async () => {
    setLoading(true);
    try {
      // 実際のAPIからデータを取得
      const response = await fetch('/api/picking');
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data || []);
        
        // APIから同梱グループを取得
        const groups = result.combineGroups || [];
        setCombineGroups(groups);
      } else {
        console.error('Failed to fetch eBay products:', result.error);
        // フォールバック用のデータ
        setProducts([]);
        setCombineGroups([]);
      }
    } catch (error) {
      console.error('[ERROR] Fetching eBay products:', error);
      // エラー時はモックデータを使用
      const mockProducts: EbayProduct[] = [
        {
          id: 'P001',
          productName: 'Canon EOS R5 ボディ',
          sku: 'CAM-R5-001',
          location: 'A-01',
          quantity: 1,
          pickedQuantity: 0,
          status: 'pending',
          ebayOrderId: 'ORD-EB-2024-001',
          ebayItemId: '394756234567',
          buyerName: '田中太郎',
          buyerUserId: 'tanaka_photo_2024',
          purchaseDate: '2024-01-20',
          shippingAddress: {
            name: '田中太郎',
            address: '東京都渋谷区恵比寿1-1-1',
            city: '東京都',
            postalCode: '150-0013',
            country: '日本'
          },
          canCombineWith: ['P002']
        },
        {
          id: 'P002',
          productName: 'Canon RF 24-70mm F2.8L USM',
          sku: 'LENS-RF2470-001',
          location: 'B-15',
          quantity: 1,
          pickedQuantity: 0,
          status: 'pending',
          ebayOrderId: 'ORD-EB-2024-002',
          ebayItemId: '394756234568',
          buyerName: '田中太郎',
          buyerUserId: 'tanaka_photo_2024',
          purchaseDate: '2024-01-20',
          shippingAddress: {
            name: '田中太郎',
            address: '東京都渋谷区恵比寿1-1-1',
            city: '東京都',
            postalCode: '150-0013',
            country: '日本'
          },
          canCombineWith: ['P001']
        }
      ];
      setProducts(mockProducts);
      const groups = detectCombineGroups(mockProducts);
      setCombineGroups(groups);
    } finally {
      setLoading(false);
    }
  };

  // 同梱可能グループの自動検出
  const detectCombineGroups = (products: EbayProduct[]): CombineGroup[] => {
    const groupMap = new Map<string, EbayProduct[]>();

    products.forEach(product => {
      const key = `${product.buyerUserId}_${product.purchaseDate}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(product);
    });

    return Array.from(groupMap.entries())
      .filter(([, products]) => products.length > 1) // 2個以上の商品がある場合のみ
      .map(([key, products], index) => ({
        id: `COMBINE-${index + 1}`,
        buyerName: products[0].buyerName,
        buyerUserId: products[0].buyerUserId,
        purchaseDate: products[0].purchaseDate,
        productIds: products.map(p => p.id),
        combinedPackage: false
      }));
  };

  // フィルタリング
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.ebayOrderId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, filterStatus]);

  // ページネーション
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // フィルター変更時はページを1に戻す
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleStartPicking = () => {
    if (selectedProducts.length === 0) {
      showToast({
        type: 'warning',
        title: '商品未選択',
        message: 'ピッキングする商品を選択してください',
        duration: 3000
      });
      return;
    }

    const selectedProductData = products.filter(p => selectedProducts.includes(p.id));
    setProductsToProcess(selectedProductData);
    setIsPickingModalOpen(true);
  };

  const handleCombineProducts = (groupId: string) => {
    const group = combineGroups.find(g => g.id === groupId);
    if (!group) return;

    const groupProducts = products.filter(p => group.productIds.includes(p.id));
    setProductsToProcess(groupProducts);
    setIsCombineModalOpen(true);
  };

  const confirmPicking = async () => {
    try {
      // APIでピッキング開始を通知
      const response = await fetch('/api/picking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: selectedProducts,
          action: 'start_picking'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // ローカル状態を更新（ピッキング中ではなく、梱包待ちステータスに）
        setProducts(prev => prev.map(p => 
          selectedProducts.includes(p.id)
            ? { ...p, status: 'ready_for_packing' as const }
            : p
        ));

        showToast({
          type: 'success',
          title: 'ピッキング開始',
          message: '選択した商品をピッキングして、そのまま梱包作業にお進みください',
          duration: 4000
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to start picking:', error);
      showToast({
        type: 'error',
        title: 'エラー',
        message: 'ピッキング開始に失敗しました',
        duration: 4000
      });
    }

    setSelectedProducts([]);
    setIsPickingModalOpen(false);
    setProductsToProcess([]);
  };

  const confirmCombine = async () => {
    try {
      const combineGroupId = productsToProcess[0]?.buyerUserId + '_' + productsToProcess[0]?.purchaseDate;
      
      // APIで同梱設定を通知
      const response = await fetch('/api/picking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: productsToProcess.map(p => p.id),
          action: 'combine_products',
          combineGroupId: combineGroupId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // 同梱グループの状態を更新
        setCombineGroups(prev => prev.map(g => 
          g.productIds.some(id => productsToProcess.some(p => p.id === id))
            ? { ...g, combinedPackage: true }
            : g
        ));

        showToast({
          type: 'success',
          title: '同梱設定完了',
          message: result.message,
          duration: 3000
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to combine products:', error);
      showToast({
        type: 'error',
        title: 'エラー',
        message: '同梱設定に失敗しました',
        duration: 4000
      });
    }

    setIsCombineModalOpen(false);
    setProductsToProcess([]);
  };

  // ピック完了機能は削除（不要な手続きのため）

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="cert-nano">ピッキング待ち</span>;
      case 'ready_for_packing':
        return <span className="cert-nano cert-premium">梱包待ち</span>;
      case 'completed':
        return <span className="cert-nano cert-mint">出荷完了</span>;
      default:
        return <span className="cert-nano">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-nexus-blue rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="商品名、購入者名、注文番号で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary"
        >
          <option value="all">すべてのステータス</option>
          <option value="pending">ピッキング待ち</option>
          <option value="ready_for_packing">梱包待ち</option>
          <option value="completed">出荷完了</option>
        </select>
        <NexusButton
          onClick={handleStartPicking}
          variant="primary"
          disabled={selectedProducts.length === 0}
        >
          選択商品をピッキング開始 ({selectedProducts.length})
        </NexusButton>
      </div>

      {/* Combine Groups */}
      {combineGroups.length > 0 && (
        <NexusCard className="p-4">
          <h4 className="font-semibold text-nexus-text-primary mb-3">同梱可能商品</h4>
          <div className="space-y-2">
            {combineGroups.map((group) => (
              <div key={group.id} className="flex justify-between items-center bg-nexus-bg-secondary rounded-lg p-3">
                <div>
                  <p className="font-medium text-nexus-text-primary">
                    {group.buyerName} ({group.purchaseDate})
                  </p>
                  <p className="text-sm text-nexus-text-secondary">
                    {group.productIds.length}個の商品 | @{group.buyerUserId}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  {group.combinedPackage && (
                    <span className="cert-nano cert-mint">同梱済み</span>
                  )}
                  <NexusButton
                    onClick={() => handleCombineProducts(group.id)}
                    variant="secondary"
                    size="sm"
                    disabled={group.combinedPackage}
                  >
                    {group.combinedPackage ? '同梱済み' : '同梱設定'}
                  </NexusButton>
                </div>
              </div>
            ))}
          </div>
        </NexusCard>
      )}

      {/* Products Table */}
      <NexusCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-nexus-bg-secondary">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-nexus-text-primary">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(paginatedProducts.filter(p => p.status === 'pending').map(p => p.id));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                    checked={selectedProducts.length > 0 && paginatedProducts.filter(p => p.status === 'pending').every(p => selectedProducts.includes(p.id))}
                  />
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-nexus-text-primary">商品名</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-nexus-text-primary">購入者</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-nexus-text-primary">購入日時</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-nexus-text-primary">保管場所</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-nexus-text-primary">数量</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-nexus-text-primary">ステータス</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-nexus-text-primary">次の工程</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="border-t border-nexus-border hover:bg-nexus-bg-secondary/50">
                  <td className="py-3 px-4">
                    {product.status === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductSelect(product.id)}
                      />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-nexus-text-primary">{product.productName}</p>
                      <p className="text-sm text-nexus-text-secondary">SKU: {product.sku}</p>
                      <p className="text-xs text-nexus-text-secondary">注文: {product.ebayOrderId}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-nexus-text-primary">{product.buyerName}</p>
                      <p className="text-sm text-nexus-text-secondary">@{product.buyerUserId}</p>
                      <p className="text-xs text-nexus-text-secondary">{product.shippingAddress.city}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-nexus-text-primary">{product.purchaseDate}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm bg-nexus-bg-secondary px-2 py-1 rounded">
                      {product.location}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold">{product.quantity}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(product.status)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {product.status === 'ready_for_packing' && (
                      <span className="text-sm text-nexus-text-secondary">
                        → 梱包・出荷作業へ
                      </span>
                    )}
                    {product.status === 'pending' && (
                      <span className="text-sm text-nexus-text-secondary">
                        ピッキング待ち
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedProducts.length === 0 && (
          <div className="text-center py-12 text-nexus-text-secondary">
            {filteredProducts.length === 0 ? 
              (searchQuery || filterStatus !== 'all'
                ? '検索条件に一致する商品がありません' 
                : 'ピッキング対象の商品がありません'
              ) : '表示するデータがありません'
            }
          </div>
        )}

        {/* ページネーション */}
        {filteredProducts.length > 0 && (
          <div className="p-4 border-t border-nexus-border">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredProducts.length / itemsPerPage)}
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </NexusCard>

      {/* Picking Confirmation Modal */}
      <BaseModal
        isOpen={isPickingModalOpen}
        onClose={() => {
          setIsPickingModalOpen(false);
          setProductsToProcess([]);
        }}
        title="ピッキング作業開始"
        size="lg"
      >
        <div>
          <p className="text-nexus-text-primary mb-4">
            以下の商品をピッキングしてきて、そのまま梱包作業に進んでください。
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>ピッキング後は、システム操作不要でそのまま梱包・出荷作業にお進みください</span>
              </div>
            </p>
          </div>
          <div className="bg-nexus-bg-secondary rounded-lg p-4 mb-6 max-h-60 overflow-y-auto">
            {productsToProcess.map((product) => (
              <div key={product.id} className="flex justify-between items-center py-2 border-b border-nexus-border last:border-b-0">
                <div>
                  <p className="font-medium text-nexus-text-primary">{product.productName}</p>
                  <p className="text-sm text-nexus-text-secondary">
                    📍 {product.location} | {product.buyerName} | {product.purchaseDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <NexusButton
              onClick={() => {
                setIsPickingModalOpen(false);
                setProductsToProcess([]);
              }}
              variant="default"
            >
              キャンセル
            </NexusButton>
            <NexusButton
              onClick={confirmPicking}
              variant="primary"
            >
              ピッキング開始
            </NexusButton>
          </div>
        </div>
      </BaseModal>

      {/* Combine Confirmation Modal */}
      <BaseModal
        isOpen={isCombineModalOpen}
        onClose={() => {
          setIsCombineModalOpen(false);
          setProductsToProcess([]);
        }}
        title="同梱パッケージ設定"
        size="lg"
      >
        <div>
          <p className="text-nexus-text-primary mb-4">
            以下の商品を同梱パッケージに設定しますか？
          </p>
          <div className="bg-nexus-bg-secondary rounded-lg p-4 mb-6">
            <p className="font-medium text-nexus-text-primary mb-2">
              購入者: {productsToProcess[0]?.buyerName}
            </p>
            <p className="text-sm text-nexus-text-secondary mb-3">
              購入日: {productsToProcess[0]?.purchaseDate} | 配送先: {productsToProcess[0]?.shippingAddress.city}
            </p>
            <div className="space-y-2">
              {productsToProcess.map((product) => (
                <div key={product.id} className="flex justify-between items-center py-2 bg-nexus-bg-primary rounded px-3">
                  <span className="text-nexus-text-primary">{product.productName}</span>
                  <span className="text-sm text-nexus-text-secondary">{product.location}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <NexusButton
              onClick={() => {
                setIsCombineModalOpen(false);
                setProductsToProcess([]);
              }}
              variant="default"
            >
              キャンセル
            </NexusButton>
            <NexusButton
              onClick={confirmCombine}
              variant="primary"
            >
              同梱設定
            </NexusButton>
          </div>
        </div>
      </BaseModal>
    </div>
  );
} 