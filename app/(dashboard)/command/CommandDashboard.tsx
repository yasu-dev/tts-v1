'use client';

import { useState, useEffect } from 'react';
import { TriageCategories, TriageTag } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';
import LogoutButton from '@/components/LogoutButton';
import PatientDetailModal from '@/components/PatientDetailModal';
import TransportAssignButton from '@/components/TransportAssignButton';
import { getPhaseInfo } from '@/lib/utils/getPhaseInfo';
import ViewToggle from '@/components/ViewToggle';
import PatientListItem from '@/components/PatientListItem';
import PatientPanelCard from '@/components/PatientPanelCard';

// 地図コンポーネントを動的インポート（SSR無効化）
const TriageMap = dynamic(() => import('@/components/TriageMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center rounded-lg bg-gray-200">
      <p className="text-gray-600">地図を読み込み中...</p>
    </div>
  ),
});

interface CommandDashboardProps {
  initialTags: TriageTag[];
}

export default function CommandDashboard({ initialTags }: CommandDashboardProps) {
  const [tags, setTags] = useState<TriageTag[]>(initialTags);
  const [filter, setFilter] = useState<'all' | 'black' | 'red' | 'yellow' | 'green'>('all');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [isRealtime, setIsRealtime] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedTagDetail, setSelectedTagDetail] = useState<TriageTag | null>(null);
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'panel'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('commandDashboard_viewMode') as 'list' | 'panel') || 'list';
    }
    return 'list';
  });
  const supabase = createClient();

  // データの再取得（共通処理）
  const refreshTags = async () => {
    try {
      const { data, error } = await supabase
        .from('triage_tags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setTags(data as TriageTag[]);
        setIsRealtime(true);
        setTimeout(() => setIsRealtime(false), 2000);
        setSyncError(null);
      }
    } catch (err) {
      console.error('Failed to refresh triage_tags:', err);
      const message = err instanceof Error ? err.message : String(err);
      setSyncError(message);
    }
  };

  // ローカルストレージから地図の折り畳み状態を復元
  useEffect(() => {
    const savedState = localStorage.getItem('commandDashboard_mapCollapsed');
    if (savedState !== null) {
      setIsMapCollapsed(savedState === 'true');
    }
  }, []);

  // Supabase Realtimeでデータベース変更を購読
  useEffect(() => {
    const channel = supabase
      .channel('triage_tags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'triage_tags',
        },
        async () => {
          // 変更イベント受信時に再取得
          await refreshTags();
        }
      )
      .subscribe((status, err) => {
        setRealtimeStatus(status);
        if (status === 'SUBSCRIBED') {
          setSyncError(null);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          const reason = err?.message || status;
          setSyncError(`Realtime接続エラー: ${reason}`);
          console.error('Realtime channel status:', status, err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  // 全ステータスを取得（業務フロー順に並べ替え）
  const getAllStatuses = () => {
    const statuses = new Set<string>();
    tags.forEach((tag) => {
      // transport.statusが arrived, preparing, in_transit, completed の場合は最終状態なので優先
      if (tag.transport.status === 'arrived') {
        statuses.add(`transport:arrived`);
      } else if (tag.transport.status === 'preparing') {
        statuses.add(`transport:preparing`);
      } else if (tag.transport.status === 'in_transit') {
        statuses.add(`transport:in_transit`);
      } else if (tag.transport.status === 'completed') {
        statuses.add(`transport:completed`);
      } else if (tag.transport_assignment) {
        const status = tag.transport_assignment.status;
        statuses.add(`transport_assignment:${status}`);
      } else {
        const status = tag.transport.status;
        statuses.add(`transport:${status}`);
      }
    });

    // 業務フロー順に並べ替え
    const statusOrder = [
      'transport:not_transported', // 1. 現場
      'transport_assignment:assigned', // 2. 割当済
      'transport_assignment:in_progress', // 3. 応急へ
      'transport_assignment:completed', // 4. 応急
      'transport:preparing', // 5. 病院準備
      'transport:in_transit', // 6. 病院へ
      'transport:completed', // 7. 病院
    ];

    return statusOrder.filter((status) => statuses.has(status));
  };

  // ステータスフィルターの初期化（全てチェック状態）
  useEffect(() => {
    if (statusFilters.length === 0) {
      setStatusFilters(getAllStatuses());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags]);

  // フィルタリング: トリアージカテゴリとステータスのAND条件
  const filteredTags = tags.filter((tag) => {
    // トリアージカテゴリのフィルタリング
    const categoryMatch = filter === 'all' || tag.triage_category.final === filter;

    // ステータスのフィルタリング
    let statusMatch = false;
    // transport.statusが arrived の場合は transport_assignment:completed として扱う
    if (tag.transport.status === 'arrived') {
      statusMatch = statusFilters.includes('transport_assignment:completed');
    } else if (tag.transport.status === 'preparing') {
      statusMatch = statusFilters.includes('transport:preparing');
    } else if (tag.transport.status === 'in_transit') {
      statusMatch = statusFilters.includes('transport:in_transit');
    } else if (tag.transport.status === 'completed') {
      statusMatch = statusFilters.includes('transport:completed');
    } else if (tag.transport_assignment) {
      const status = `transport_assignment:${tag.transport_assignment.status}`;
      statusMatch = statusFilters.includes(status);
    } else {
      const status = `transport:${tag.transport.status}`;
      statusMatch = statusFilters.includes(status);
    }

    return categoryMatch && statusMatch;
  });

  const stats = {
    total: tags.length,
    black: tags.filter((t) => t.triage_category.final === 'black').length,
    red: tags.filter((t) => t.triage_category.final === 'red').length,
    yellow: tags.filter((t) => t.triage_category.final === 'yellow').length,
    green: tags.filter((t) => t.triage_category.final === 'green').length,
  };

  // 地図の折り畳み/展開を切り替え
  const toggleMapCollapse = () => {
    const newState = !isMapCollapsed;
    setIsMapCollapsed(newState);
    localStorage.setItem('commandDashboard_mapCollapsed', String(newState));
  };

  // ステータスフィルターの切り替え
  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // ステータス表示用のヘルパー関数
  const getStatusDisplay = (statusKey: string) => {
    const [type, status] = statusKey.split(':');
    if (type === 'transport_assignment') {
      return {
        label:
          status === 'assigned'
            ? '割当済'
            : status === 'in_progress'
              ? '応急へ'
              : status === 'completed'
                ? '応急'
                : '不明',
        color:
          status === 'assigned'
            ? 'bg-indigo-100 text-indigo-800'
            : status === 'in_progress'
              ? 'bg-orange-100 text-orange-800'
              : status === 'completed'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-800',
      };
    } else {
      return {
        label:
          status === 'not_transported'
            ? '現場'
            : status === 'arrived'
              ? '応急'
              : status === 'preparing'
                ? '病院準備'
                : status === 'in_transit'
                  ? '病院へ'
                  : status === 'completed'
                    ? '病院'
                    : '不明',
        color:
          status === 'not_transported'
            ? 'bg-gray-100 text-gray-800'
            : status === 'arrived'
              ? 'bg-purple-100 text-purple-800'
              : status === 'preparing'
                ? 'bg-amber-100 text-amber-800'
                : status === 'in_transit'
                  ? 'bg-cyan-100 text-cyan-800'
                  : status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-800',
      };
    }
  };

  const handleViewModeToggle = (mode: 'list' | 'panel') => {
    setViewMode(mode);
    localStorage.setItem('commandDashboard_viewMode', mode);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 p-4 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">指揮本部ダッシュボード</h1>
            <p className="text-sm opacity-90">リアルタイムトリアージ状況</p>
          </div>
          <div className="flex items-center gap-4">
            {syncError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2">
                <span className="h-3 w-3 rounded-full bg-white"></span>
                <span className="text-sm font-bold">同期エラー</span>
                <button onClick={refreshTags} className="text-sm text-white underline">
                  再試行
                </button>
              </div>
            )}
            {isRealtime && (
              <div className="flex animate-pulse items-center gap-2 rounded-lg bg-green-500 px-4 py-2">
                <span className="h-3 w-3 rounded-full bg-white"></span>
                <span className="text-sm font-bold">データ更新</span>
              </div>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        {/* 統計カード（フィルター機能統合） */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <button
            onClick={() => setFilter('all')}
            className={`card cursor-pointer text-center transition-all duration-200 hover:scale-105 hover:shadow-xl ${
              filter === 'all' ? 'shadow-xl ring-4 ring-blue-500' : ''
            }`}
          >
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-sm text-gray-600">総数</p>
          </button>
          <button
            onClick={() => setFilter('black')}
            className={`card cursor-pointer bg-black text-center text-white transition-all duration-200 hover:scale-105 hover:shadow-xl ${
              filter === 'black' ? 'shadow-xl ring-4 ring-gray-400' : ''
            }`}
          >
            <p className="text-3xl font-bold">{stats.black}</p>
            <p className="text-sm opacity-90">黒（死亡）</p>
          </button>
          <button
            onClick={() => setFilter('red')}
            className={`card cursor-pointer bg-red-500 text-center text-white transition-all duration-200 hover:scale-105 hover:shadow-xl ${
              filter === 'red' ? 'shadow-xl ring-4 ring-red-700' : ''
            }`}
          >
            <p className="text-3xl font-bold">{stats.red}</p>
            <p className="text-sm opacity-90">赤（重症）</p>
          </button>
          <button
            onClick={() => setFilter('yellow')}
            className={`card cursor-pointer bg-yellow-400 text-center transition-all duration-200 hover:scale-105 hover:shadow-xl ${
              filter === 'yellow' ? 'shadow-xl ring-4 ring-yellow-600' : ''
            }`}
          >
            <p className="text-3xl font-bold">{stats.yellow}</p>
            <p className="text-sm">黄（中等症）</p>
          </button>
          <button
            onClick={() => setFilter('green')}
            className={`card cursor-pointer bg-green-500 text-center text-white transition-all duration-200 hover:scale-105 hover:shadow-xl ${
              filter === 'green' ? 'shadow-xl ring-4 ring-green-700' : ''
            }`}
          >
            <p className="text-3xl font-bold">{stats.green}</p>
            <p className="text-sm opacity-90">緑（軽症）</p>
          </button>
        </div>

        {/* ステータスフィルター */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-3">
            {getAllStatuses().map((statusKey) => {
              const { label, color } = getStatusDisplay(statusKey);
              const isChecked = statusFilters.includes(statusKey);

              const id = `status-${statusKey}`;
              return (
                <div key={statusKey} className="flex items-center gap-2">
                  <input
                    id={id}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleStatusFilter(statusKey)}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={id}
                    className={`rounded-full px-3 py-1 text-sm font-medium ${color} ${
                      isChecked ? 'opacity-100' : 'opacity-50'
                    } cursor-pointer select-none`}
                  >
                    {label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* 地図表示（折り畳み可能） */}
        <div className="card mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">患者位置マップ</h2>
            <button
              onClick={toggleMapCollapse}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-bold text-gray-700 transition hover:bg-gray-200"
            >
              {isMapCollapsed ? (
                <>
                  <span>▼ 展開</span>
                </>
              ) : (
                <>
                  <span>▲ 折りたたむ</span>
                </>
              )}
            </button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isMapCollapsed ? 'max-h-0 opacity-0' : 'max-h-[600px] opacity-100'
            }`}
          >
            <TriageMap
              patients={filteredTags
                .filter((tag) => tag.location && tag.location.latitude && tag.location.longitude)
                .map((tag) => ({
                  id: tag.id,
                  position: [tag.location.latitude, tag.location.longitude] as [number, number],
                  category: tag.triage_category.final,
                  tagNumber: tag.tag_number,
                  anonymousId: tag.anonymous_id,
                }))}
              center={
                tags.length > 0 && tags[0].location
                  ? ([tags[0].location.latitude, tags[0].location.longitude] as [number, number])
                  : undefined
              }
              onMarkerClick={(patientId) => {
                setSelectedPatientId(patientId);
                // スクロールして該当患者の詳細を表示
                const element = document.getElementById(`patient-${patientId}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  element.classList.add('ring-4', 'ring-blue-500');
                  setTimeout(() => {
                    element.classList.remove('ring-4', 'ring-blue-500');
                  }, 3000);
                }
              }}
            />
            <p className="mt-2 text-sm text-gray-600">
              地図上のマーカーをクリックすると、患者詳細が表示されます。
            </p>
          </div>
        </div>

        {/* トリアージタッグリスト */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">患者一覧（{filteredTags.length}件）</h2>
            <ViewToggle viewMode={viewMode} onToggle={handleViewModeToggle} />
          </div>
          {filteredTags.length === 0 ? (
            <p className="py-8 text-center text-gray-500">データがありません</p>
          ) : viewMode === 'list' ? (
            <div className="space-y-3">
              {filteredTags.map((tag) => (
                <PatientListItem
                  key={tag.id}
                  tag={tag}
                  onDetailClick={setSelectedTagDetail}
                  selected={selectedPatientId === tag.id}
                  actions={
                    (tag.transport.status === 'not_transported' ||
                      tag.transport.status === 'preparing') &&
                    !tag.transport_assignment ? (
                      <TransportAssignButton tag={tag} />
                    ) : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTags.map((tag) => (
                <PatientPanelCard
                  key={tag.id}
                  tag={tag}
                  variant="command"
                  onDetailClick={setSelectedTagDetail}
                  selected={selectedPatientId === tag.id}
                  actions={
                    (tag.transport.status === 'not_transported' ||
                      tag.transport.status === 'preparing') &&
                    !tag.transport_assignment ? (
                      <TransportAssignButton tag={tag} />
                    ) : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 患者詳細モーダル */}
      <PatientDetailModal
        tag={selectedTagDetail}
        onClose={() => setSelectedTagDetail(null)}
        actions={
          selectedTagDetail && (
            <>
              {(selectedTagDetail.transport.status === 'not_transported' ||
                selectedTagDetail.transport.status === 'preparing') &&
                !selectedTagDetail.transport_assignment && (
                  <TransportAssignButton tag={selectedTagDetail} />
                )}
            </>
          )
        }
      />
    </div>
  );
}
