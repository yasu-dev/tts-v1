'use client';

import { useState, useEffect } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';

interface PickingProgress {
  id: string;
  orderId: string;
  customerName: string;
  assignedTo: string;
  startedAt: string;
  estimatedCompletionTime: number; // 分
  progress: number; // パーセンテージ
  totalItems: number;
  pickedItems: number;
  currentLocation: string;
}

export default function PickingProgress() {
  const [progressList, setProgressList] = useState<PickingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchProgress();
    
    if (autoRefresh) {
      const interval = setInterval(fetchProgress, 10000); // 10秒ごとに更新
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchProgress = async () => {
    try {
      // モックデータ
      const mockProgress: PickingProgress[] = [
        {
          id: '1',
          orderId: 'ORD-2024-002',
          customerName: '佐藤花子',
          assignedTo: 'スタッフA',
          startedAt: '2024-06-28T14:00:00',
          estimatedCompletionTime: 20,
          progress: 75,
          totalItems: 4,
          pickedItems: 3,
          currentLocation: 'A-15',
        },
        {
          id: '2',
          orderId: 'ORD-2024-005',
          customerName: '山田太郎',
          assignedTo: 'スタッフB',
          startedAt: '2024-06-28T14:30:00',
          estimatedCompletionTime: 15,
          progress: 50,
          totalItems: 2,
          pickedItems: 1,
          currentLocation: 'B-08',
        },
        {
          id: '3',
          orderId: 'ORD-2024-008',
          customerName: '高橋次郎',
          assignedTo: 'スタッフC',
          startedAt: '2024-06-28T14:45:00',
          estimatedCompletionTime: 30,
          progress: 20,
          totalItems: 5,
          pickedItems: 1,
          currentLocation: 'H2-03',
        },
      ];
      setProgressList(mockProgress);
    } catch (error) {
      console.error('[ERROR] Fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateElapsedTime = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getLocationColor = (location: string) => {
    if (location.startsWith('A')) return 'cert-mint';
    if (location.startsWith('B')) return 'cert-premium';
    if (location.startsWith('H')) return 'cert-gold';
    if (location.startsWith('V')) return 'cert-ruby';
    return '';
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
      {/* Auto Refresh Toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-nexus-text-primary">
          リアルタイム進行状況
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-nexus-text-secondary">自動更新</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <NexusButton onClick={fetchProgress} variant="secondary" size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </NexusButton>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {progressList.map((progress) => (
          <NexusCard key={progress.id} className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-nexus-text-primary">
                    {progress.orderId}
                  </h4>
                  <p className="text-sm text-nexus-text-secondary">
                    {progress.customerName}
                  </p>
                </div>
                <span className={`cert-nano ${getLocationColor(progress.currentLocation)}`}>
                  📍 {progress.currentLocation}
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-nexus-text-secondary">進捗</span>
                  <span className="font-medium text-nexus-text-primary">
                    {progress.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(progress.progress)}`}
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-nexus-text-secondary">アイテム</p>
                  <p className="font-display font-bold text-nexus-text-primary">
                    {progress.pickedItems}/{progress.totalItems}
                  </p>
                </div>
                <div>
                  <p className="text-nexus-text-secondary">経過時間</p>
                  <p className="font-display font-bold text-nexus-text-primary">
                    {calculateElapsedTime(progress.startedAt)}分
                  </p>
                </div>
              </div>

              {/* Staff Info */}
              <div className="pt-3 border-t border-nexus-border">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-nexus-blue rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {progress.assignedTo.charAt(progress.assignedTo.length - 1)}
                    </div>
                    <span className="text-sm text-nexus-text-primary">
                      {progress.assignedTo}
                    </span>
                  </div>
                  <span className="text-xs text-nexus-text-secondary">
                    予想完了: {progress.estimatedCompletionTime - calculateElapsedTime(progress.startedAt)}分後
                  </span>
                </div>
              </div>
            </div>
          </NexusCard>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <NexusCard className="p-4">
          <div className="text-sm text-nexus-text-secondary">作業中スタッフ</div>
          <div className="text-2xl font-display font-bold text-nexus-text-primary">
            {progressList.length}名
          </div>
        </NexusCard>
        <NexusCard className="p-4">
          <div className="text-sm text-nexus-text-secondary">処理中アイテム</div>
          <div className="text-2xl font-display font-bold text-nexus-text-primary">
            {progressList.reduce((sum, p) => sum + p.totalItems, 0)}個
          </div>
        </NexusCard>
        <NexusCard className="p-4">
          <div className="text-sm text-nexus-text-secondary">平均進捗率</div>
          <div className="text-2xl font-display font-bold text-nexus-text-primary">
            {Math.round(progressList.reduce((sum, p) => sum + p.progress, 0) / progressList.length)}%
          </div>
        </NexusCard>
        <NexusCard className="p-4">
          <div className="text-sm text-nexus-text-secondary">予想完了時間</div>
          <div className="text-2xl font-display font-bold text-nexus-text-primary">
            {Math.round(progressList.reduce((sum, p) => 
              sum + (p.estimatedCompletionTime - calculateElapsedTime(p.startedAt)), 0
            ) / progressList.length)}分
          </div>
        </NexusCard>
      </div>

      {progressList.length === 0 && (
        <div className="text-center py-12">
          <p className="text-nexus-text-secondary">現在進行中のピッキング作業はありません</p>
        </div>
      )}
    </div>
  );
} 