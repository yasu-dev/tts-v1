'use client';

import { useState, useEffect } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';

interface PickingHistoryRecord {
  id: string;
  orderId: string;
  customerName: string;
  completedBy: string;
  completedAt: string;
  startedAt: string;
  totalItems: number;
  totalTime: number; // 分
  efficiency: number; // パーセンテージ
  shippingMethod: string;
}

export default function PickingHistory() {
  const [historyRecords, setHistoryRecords] = useState<PickingHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('today');
  const [sortBy, setSortBy] = useState<'completedAt' | 'efficiency' | 'totalTime'>('completedAt');

  useEffect(() => {
    fetchHistory();
  }, [filterPeriod, sortBy]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // モックデータ
      const mockHistory: PickingHistoryRecord[] = [
        {
          id: '1',
          orderId: 'ORD-2024-001',
          customerName: '田中太郎',
          completedBy: 'スタッフA',
          startedAt: '2024-06-28T09:00:00',
          completedAt: '2024-06-28T09:15:00',
          totalItems: 3,
          totalTime: 15,
          efficiency: 95,
          shippingMethod: 'ヤマト運輸',
        },
        {
          id: '2',
          orderId: 'ORD-2024-003',
          customerName: '鈴木花子',
          completedBy: 'スタッフB',
          startedAt: '2024-06-28T10:30:00',
          completedAt: '2024-06-28T10:50:00',
          totalItems: 5,
          totalTime: 20,
          efficiency: 88,
          shippingMethod: '佐川急便',
        },
        {
          id: '3',
          orderId: 'ORD-2024-004',
          customerName: '佐藤次郎',
          completedBy: 'スタッフC',
          startedAt: '2024-06-28T11:00:00',
          completedAt: '2024-06-28T11:12:00',
          totalItems: 2,
          totalTime: 12,
          efficiency: 92,
          shippingMethod: '日本郵便',
        },
        {
          id: '4',
          orderId: 'ORD-2024-006',
          customerName: '山田花子',
          completedBy: 'スタッフA',
          startedAt: '2024-06-28T13:00:00',
          completedAt: '2024-06-28T13:25:00',
          totalItems: 6,
          totalTime: 25,
          efficiency: 85,
          shippingMethod: 'ヤマト運輸',
        },
        {
          id: '5',
          orderId: 'ORD-2024-007',
          customerName: '高橋太郎',
          completedBy: 'スタッフD',
          startedAt: '2024-06-28T14:00:00',
          completedAt: '2024-06-28T14:18:00',
          totalItems: 4,
          totalTime: 18,
          efficiency: 90,
          shippingMethod: 'FedEx',
        },
      ];

      // ソート
      const sorted = [...mockHistory].sort((a, b) => {
        switch (sortBy) {
          case 'completedAt':
            return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
          case 'efficiency':
            return b.efficiency - a.efficiency;
          case 'totalTime':
            return a.totalTime - b.totalTime;
          default:
            return 0;
        }
      });

      setHistoryRecords(sorted);
    } catch (error) {
      console.error('[ERROR] Fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 80) return 'text-blue-600';
    if (efficiency >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 90) return <span className="cert-nano cert-mint">優秀</span>;
    if (efficiency >= 80) return <span className="cert-nano cert-premium">良好</span>;
    if (efficiency >= 70) return <span className="cert-nano cert-gold">標準</span>;
    return <span className="cert-nano cert-ruby">要改善</span>;
  };

  const calculateStats = () => {
    if (historyRecords.length === 0) return { avgTime: 0, avgEfficiency: 0, totalOrders: 0 };

    const totalTime = historyRecords.reduce((sum, r) => sum + r.totalTime, 0);
    const totalEfficiency = historyRecords.reduce((sum, r) => sum + r.efficiency, 0);

    return {
      avgTime: Math.round(totalTime / historyRecords.length),
      avgEfficiency: Math.round(totalEfficiency / historyRecords.length),
      totalOrders: historyRecords.length,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-nexus-blue rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NexusCard className="p-4">
          <div className="text-sm text-nexus-text-secondary">本日の完了数</div>
          <div className="text-2xl font-display font-bold text-nexus-text-primary">
            {stats.totalOrders}件
          </div>
        </NexusCard>
        <NexusCard className="p-4">
          <div className="text-sm text-nexus-text-secondary">平均作業時間</div>
          <div className="text-2xl font-display font-bold text-nexus-text-primary">
            {stats.avgTime}分
          </div>
        </NexusCard>
        <NexusCard className="p-4">
          <div className="text-sm text-nexus-text-secondary">平均効率</div>
          <div className={`text-2xl font-display font-bold ${getEfficiencyColor(stats.avgEfficiency)}`}>
            {stats.avgEfficiency}%
          </div>
        </NexusCard>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary"
        >
          <option value="today">今日</option>
          <option value="week">今週</option>
          <option value="month">今月</option>
          <option value="all">すべて</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary"
        >
          <option value="completedAt">完了時刻順</option>
          <option value="efficiency">効率順</option>
          <option value="totalTime">作業時間順</option>
        </select>
      </div>

      {/* History Table */}
      <div className="holo-table">
        <table className="w-full">
          <thead className="holo-header">
            <tr>
              <th className="text-left">注文情報</th>
              <th className="text-left">担当者</th>
              <th className="text-left">作業時間</th>
              <th className="text-left">アイテム数</th>
              <th className="text-left">効率</th>
              <th className="text-left">配送方法</th>
              <th className="text-right">完了時刻</th>
            </tr>
          </thead>
          <tbody className="holo-body">
            {historyRecords.map((record) => (
              <tr key={record.id} className="holo-row">
                <td>
                  <div>
                    <p className="font-semibold text-nexus-text-primary">
                      {record.orderId}
                    </p>
                    <p className="text-sm text-nexus-text-secondary">
                      {record.customerName}
                    </p>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-nexus-blue rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {record.completedBy.charAt(record.completedBy.length - 1)}
                    </div>
                    <span className="text-sm text-nexus-text-primary">
                      {record.completedBy}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="font-display font-bold text-nexus-text-primary">
                    {record.totalTime}分
                  </span>
                </td>
                <td>
                  <span className="text-nexus-text-primary">
                    {record.totalItems}個
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getEfficiencyColor(record.efficiency)}`}>
                      {record.efficiency}%
                    </span>
                    {getEfficiencyBadge(record.efficiency)}
                  </div>
                </td>
                <td>
                  <span className="text-sm text-nexus-text-primary">
                    {record.shippingMethod}
                  </span>
                </td>
                <td className="text-right">
                  <p className="text-sm text-nexus-text-primary">
                    {new Date(record.completedAt).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {historyRecords.length === 0 && (
        <div className="text-center py-12">
          <p className="text-nexus-text-secondary">該当する履歴が見つかりません</p>
        </div>
      )}
    </div>
  );
} 