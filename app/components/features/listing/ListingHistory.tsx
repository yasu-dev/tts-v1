'use client';

import { useState, useEffect } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';

interface ListingRecord {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  listingDate: string;
  soldDate?: string;
  listingPrice: number;
  soldPrice?: number;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  platform: 'ebay' | 'yahoo' | 'mercari';
  viewCount: number;
  watchCount: number;
}

export default function ListingHistory() {
  const [records, setRecords] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('30days');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, [filterPeriod, filterStatus, filterPlatform]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // モックデータ
      const mockRecords: ListingRecord[] = [
        {
          id: '1',
          productId: 'TWD-CAM-001',
          productName: 'Canon EOS R5',
          sku: 'TWD-CAM-001',
          listingDate: '2024-06-15T10:00:00',
          soldDate: '2024-06-20T14:30:00',
          listingPrice: 405000,
          soldPrice: 420000,
          status: 'sold',
          platform: 'ebay',
          viewCount: 1250,
          watchCount: 45,
        },
        {
          id: '2',
          productId: 'TWD-LEN-005',
          productName: 'Canon RF 24-70mm F2.8',
          sku: 'TWD-LEN-005',
          listingDate: '2024-06-18T09:00:00',
          listingPrice: 168300,
          status: 'active',
          platform: 'ebay',
          viewCount: 890,
          watchCount: 23,
        },
        {
          id: '3',
          productId: 'TWD-WAT-007',
          productName: 'Rolex GMT Master',
          sku: 'TWD-WAT-007',
          listingDate: '2024-06-10T11:00:00',
          soldDate: '2024-06-25T16:00:00',
          listingPrice: 2100000,
          soldPrice: 2150000,
          status: 'sold',
          platform: 'yahoo',
          viewCount: 3500,
          watchCount: 120,
        },
        {
          id: '4',
          productId: 'TWD-CAM-012',
          productName: 'Sony α7R V',
          sku: 'TWD-CAM-012',
          listingDate: '2024-06-22T14:00:00',
          listingPrice: 272000,
          status: 'active',
          platform: 'mercari',
          viewCount: 450,
          watchCount: 15,
        },
        {
          id: '5',
          productId: 'TWD-ACC-003',
          productName: 'Peak Design Everyday Backpack',
          sku: 'TWD-ACC-003',
          listingDate: '2024-06-05T10:00:00',
          listingPrice: 32000,
          status: 'expired',
          platform: 'ebay',
          viewCount: 200,
          watchCount: 5,
        },
      ];
      setRecords(mockRecords);
    } catch (error) {
      console.error('[ERROR] Fetching listing history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="cert-nano cert-mint">出品中</span>;
      case 'sold':
        return <span className="cert-nano cert-premium">売却済</span>;
      case 'cancelled':
        return <span className="cert-nano cert-ruby">キャンセル</span>;
      case 'expired':
        return <span className="cert-nano">終了</span>;
      default:
        return <span className="cert-nano">{status}</span>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ebay':
        return '🌐';
      case 'yahoo':
        return '🇯🇵';
      case 'mercari':
        return '📱';
      default:
        return '📦';
    }
  };

  const calculateStats = () => {
    const soldRecords = records.filter(r => r.status === 'sold');
    const totalSold = soldRecords.length;
    const totalRevenue = soldRecords.reduce((sum, r) => sum + (r.soldPrice || 0), 0);
    const avgSoldPrice = totalRevenue / (totalSold || 1);
    const totalViews = records.reduce((sum, r) => sum + r.viewCount, 0);

    return {
      totalSold,
      totalRevenue,
      avgSoldPrice,
      totalViews,
    };
  };

  const stats = calculateStats();

  const filteredRecords = records.filter(record => {
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesPlatform = filterPlatform === 'all' || record.platform === filterPlatform;
    return matchesStatus && matchesPlatform;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-nexus-blue rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <NexusCard className="p-4">
          <div className="text-sm text-nexus-text-secondary">販売数</div>
          <div className="text-2xl font-display font-bold text-nexus-text-primary">
            {stats.totalSold}
          </div>
        </NexusCard>
        <NexusCard className="p-4">
          <div className="text-sm text-nexus-text-secondary">総売上</div>
          <div className="text-2xl font-display font-bold text-nexus-text-primary">
            ¥{stats.totalRevenue.toLocaleString()}
          </div>
        </NexusCard>
        <NexusCard className="p-4">
          <div className="text-sm text-nexus-text-secondary">平均販売価格</div>
          <div className="text-2xl font-display font-bold text-nexus-text-primary">
            ¥{Math.floor(stats.avgSoldPrice).toLocaleString()}
          </div>
        </NexusCard>
        <NexusCard className="p-4">
          <div className="text-sm text-nexus-text-secondary">総閲覧数</div>
          <div className="text-2xl font-display font-bold text-nexus-text-primary">
            {stats.totalViews.toLocaleString()}
          </div>
        </NexusCard>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary"
        >
          <option value="7days">過去7日間</option>
          <option value="30days">過去30日間</option>
          <option value="90days">過去90日間</option>
          <option value="all">すべて</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary"
        >
          <option value="all">すべてのステータス</option>
          <option value="active">出品中</option>
          <option value="sold">売却済</option>
          <option value="cancelled">キャンセル</option>
          <option value="expired">終了</option>
        </select>

        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary"
        >
          <option value="all">すべてのプラットフォーム</option>
          <option value="ebay">eBay</option>
          <option value="yahoo">ヤフオク</option>
          <option value="mercari">メルカリ</option>
        </select>
      </div>

      {/* History Table */}
      <div className="holo-table">
        <table className="w-full">
          <thead className="holo-header">
            <tr>
              <th className="text-left">商品情報</th>
              <th className="text-left">プラットフォーム</th>
              <th className="text-left">出品日</th>
              <th className="text-left">販売価格</th>
              <th className="text-left">閲覧/ウォッチ</th>
              <th className="text-left">ステータス</th>
              <th className="text-right">アクション</th>
            </tr>
          </thead>
          <tbody className="holo-body">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="holo-row">
                <td>
                  <div>
                    <p className="font-semibold text-nexus-text-primary">
                      {record.productName}
                    </p>
                    <p className="text-sm text-nexus-text-secondary">
                      {record.sku}
                    </p>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getPlatformIcon(record.platform)}</span>
                    <span className="text-sm text-nexus-text-primary">
                      {record.platform.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td>
                  <div>
                    <p className="text-sm text-nexus-text-primary">
                      {new Date(record.listingDate).toLocaleDateString('ja-JP')}
                    </p>
                    {record.soldDate && (
                      <p className="text-xs text-nexus-text-secondary">
                        売却: {new Date(record.soldDate).toLocaleDateString('ja-JP')}
                      </p>
                    )}
                  </div>
                </td>
                <td>
                  <div>
                    <p className="font-display font-bold text-nexus-text-primary">
                      ¥{record.listingPrice.toLocaleString()}
                    </p>
                    {record.soldPrice && (
                      <p className="text-sm text-green-600">
                        売却: ¥{record.soldPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </td>
                <td>
                  <div className="text-sm">
                    <p className="text-nexus-text-primary">
                      👁 {record.viewCount.toLocaleString()}
                    </p>
                    <p className="text-nexus-text-secondary">
                      ⭐ {record.watchCount}
                    </p>
                  </div>
                </td>
                <td>{getStatusBadge(record.status)}</td>
                <td className="text-right">
                  <button className="nexus-button">
                    詳細
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <p className="text-nexus-text-secondary">該当する履歴が見つかりません</p>
        </div>
      )}
    </div>
  );
} 