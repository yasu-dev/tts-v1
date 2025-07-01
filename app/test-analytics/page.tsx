'use client';

import { useState } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import InventoryAnalytics from '@/app/components/features/analytics/InventoryAnalytics';

export default function TestAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const periods = [
    { id: 'week', label: '週間', days: 7 },
    { id: 'month', label: '月間', days: 30 },
    { id: 'quarter', label: '四半期', days: 90 },
    { id: 'year', label: '年間', days: 365 }
  ];

  const getDateRange = (periodId: string) => {
    const end = new Date();
    const start = new Date();
    const period = periods.find(p => p.id === periodId);
    if (period) {
      start.setDate(start.getDate() - period.days);
    }
    return { start, end };
  };

  return (
    <DashboardLayout userType="staff">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">在庫分析・レポート</h1>
          <p className="text-gray-600">
            Chart.jsを使用した在庫回転率、滞留分析、収益性分析の可視化
          </p>
        </div>

        {/* 期間選択 */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">分析期間:</span>
            <div className="flex gap-2">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* メイン分析エリア */}
        <InventoryAnalytics dateRange={getDateRange(selectedPeriod)} />

        {/* 高度な分析オプション */}
        <div className="mt-6">
          <NexusButton
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="default"
          >
            {showAdvanced ? '詳細分析を隠す' : '詳細分析を表示'}
          </NexusButton>
        </div>

        {showAdvanced && (
          <div className="mt-6 space-y-6">
            {/* ABC分析 */}
            <NexusCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">ABC分析</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Aランク商品</h4>
                  <p className="text-2xl font-bold text-green-900">28商品</p>
                  <p className="text-sm text-green-700 mt-1">売上の70%を占める</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-green-600">• Canon EOS R5</p>
                    <p className="text-xs text-green-600">• Rolex Submariner</p>
                    <p className="text-xs text-green-600">• Sony α7R V</p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Bランク商品</h4>
                  <p className="text-2xl font-bold text-yellow-900">54商品</p>
                  <p className="text-sm text-yellow-700 mt-1">売上の20%を占める</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-yellow-600">• 中級一眼レフ</p>
                    <p className="text-xs text-yellow-600">• 標準ズームレンズ</p>
                    <p className="text-xs text-yellow-600">• ミドルクラス時計</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Cランク商品</h4>
                  <p className="text-2xl font-bold text-gray-900">53商品</p>
                  <p className="text-sm text-gray-700 mt-1">売上の10%を占める</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-gray-600">• アクセサリー類</p>
                    <p className="text-xs text-gray-600">• 旧型モデル</p>
                    <p className="text-xs text-gray-600">• 低価格帯商品</p>
                  </div>
                </div>
              </div>
            </NexusCard>

            {/* 季節性分析 */}
            <NexusCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">季節性分析</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800 mb-3">
                  📊 過去データから、以下の季節トレンドが確認されています：
                </p>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• <strong>3-4月:</strong> 卒業・入学シーズンでカメラ需要が増加（+25%）</li>
                  <li>• <strong>6-7月:</strong> ボーナス時期で高級時計の売上が上昇（+30%）</li>
                  <li>• <strong>11-12月:</strong> 年末商戦で全カテゴリが好調（+40%）</li>
                  <li>• <strong>1-2月:</strong> 閑散期で在庫調整の好機（-15%）</li>
                </ul>
              </div>
            </NexusCard>

            {/* 推奨アクション */}
            <NexusCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">AIによる推奨アクション</h3>
              <div className="space-y-3">
                {[
                  {
                    priority: 'high',
                    icon: '🔴',
                    title: '滞留在庫の早期処分',
                    description: '180日以上の滞留商品15点を20%割引で販売促進',
                    impact: '在庫回転率 +0.3ポイント改善見込み'
                  },
                  {
                    priority: 'medium',
                    icon: '🟡',
                    title: 'セット販売の推進',
                    description: 'カメラボディとレンズのセット販売で在庫効率化',
                    impact: '平均単価15%向上、在庫削減5%'
                  },
                  {
                    priority: 'low',
                    icon: '🟢',
                    title: '高回転商品の在庫補充',
                    description: 'Aランク商品の適正在庫レベル維持',
                    impact: '機会損失の防止、売上安定化'
                  }
                ].map((action, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{action.icon}</div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900">{action.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      <p className="text-xs text-blue-600 mt-2">期待効果: {action.impact}</p>
                    </div>
                    <NexusButton size="sm" variant="default">
                      実行
                    </NexusButton>
                  </div>
                ))}
              </div>
            </NexusCard>
          </div>
        )}

        {/* 機能説明 */}
        <NexusCard className="mt-6 p-6">
          <h3 className="text-lg font-semibold mb-4">実装技術</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">📊 グラフ表示</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Chart.js による高度なデータ可視化</li>
                <li>• 折れ線グラフ（在庫回転率推移）</li>
                <li>• ドーナツグラフ（カテゴリ別構成）</li>
                <li>• 棒グラフ（滞留期間分析）</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📈 分析機能</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 在庫回転率の計算と業界比較</li>
                <li>• 滞留在庫の自動検出</li>
                <li>• 収益性に基づく商品分類</li>
                <li>• AIによる改善提案</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 KPI指標</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 在庫回転率（目標: 4.0以上）</li>
                <li>• 滞留在庫率（目標: 10%以下）</li>
                <li>• 高収益商品比率（目標: 20%以上）</li>
                <li>• 在庫効率スコア</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔧 技術スタック</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Chart.js 4.x</li>
                <li>• react-chartjs-2</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              💡 <strong>活用メリット:</strong> リアルタイムな在庫状況の把握により、
              適切な在庫レベルの維持、滞留在庫の削減、収益性の向上が実現できます。
              データドリブンな意思決定により、在庫効率を最大化できます。
            </p>
          </div>
        </NexusCard>
      </div>
    </DashboardLayout>
  );
} 