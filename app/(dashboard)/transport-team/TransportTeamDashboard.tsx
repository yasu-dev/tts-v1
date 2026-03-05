'use client';

import { useState, useEffect } from 'react';
import { TriageTag, TriageCategories } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/LogoutButton';
import HeaderToolButtons from '@/components/HeaderToolButtons';
import PatientDetailModal from '@/components/PatientDetailModal';
import QRScanner from '@/components/QRScanner';
import { getPhaseInfo } from '@/lib/utils/getPhaseInfo';
import ViewToggle from '@/components/ViewToggle';
import PatientListItem from '@/components/PatientListItem';
import PatientPanelCard from '@/components/PatientPanelCard';
import CasualtyFlowChart from '@/components/CasualtyFlowChart';

interface TransportTeamDashboardProps {
  assignedPatients: TriageTag[];
}

const TRANSPORT_TEAMS = ['新宿ポンプ1', '新宿ポンプ2', '新宿救助1', '三本部機動'];

export default function TransportTeamDashboard({ assignedPatients }: TransportTeamDashboardProps) {
  const [patients, setPatients] = useState<TriageTag[]>(assignedPatients);
  const [selectedTeam, setSelectedTeam] = useState<string>('全搬送部隊');
  const [selectedPatient, setSelectedPatient] = useState<TriageTag | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRealtime, setIsRealtime] = useState(false);
  const [filter, setFilter] = useState<'all' | 'black' | 'red' | 'yellow' | 'green'>('all');
  const [confirmingPatientId, setConfirmingPatientId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'panel'>(() => {
    if (typeof window !== 'undefined') {
      return (
        (localStorage.getItem('transportTeamDashboard_viewMode') as 'list' | 'panel') || 'list'
      );
    }
    return 'list';
  });

  const supabase = createClient();

  const handleViewModeToggle = (mode: 'list' | 'panel') => {
    setViewMode(mode);
    localStorage.setItem('transportTeamDashboard_viewMode', mode);
  };

  // Supabase Realtimeでデータベース変更を購読
  useEffect(() => {
    const channel = supabase
      .channel('transport_team_triage_tags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'triage_tags',
        },
        async (payload) => {
          // 搬送部隊に割り当てられた患者を再取得（作業中のもののみ）
          const { data, error } = await supabase
            .from('triage_tags')
            .select('*')
            .not('transport_assignment', 'is', null)
            .neq('transport_assignment->>status', 'completed')
            .order('triage_category->final', { ascending: true })
            .order('created_at', { ascending: true });

          if (!error && data) {
            setPatients(data as TriageTag[]);
            setIsRealtime(true);
            setTimeout(() => setIsRealtime(false), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // トリアージカテゴリ別の統計
  const stats = {
    total: patients.length,
    black: patients.filter((p) => p.triage_category.final === 'black').length,
    red: patients.filter((p) => p.triage_category.final === 'red').length,
    yellow: patients.filter((p) => p.triage_category.final === 'yellow').length,
    green: patients.filter((p) => p.triage_category.final === 'green').length,
  };

  // カテゴリと搬送部隊両方でフィルタリング
  const filteredPatients = patients
    .filter((patient) => filter === 'all' || patient.triage_category.final === filter)
    .filter((patient) =>
      selectedTeam === '全搬送部隊'
        ? patient.transport_assignment?.team || !patient.transport_assignment
        : patient.transport_assignment?.team === selectedTeam
    );

  // 搬送ステータス更新
  const handleUpdateTransportStatus = async (tagId: string, status: string) => {
    setLoading(true);
    try {
      // 現在のタグデータを取得
      const { data: currentTag } = await supabase
        .from('triage_tags')
        .select('transport_assignment, transport')
        .eq('id', tagId)
        .single();

      let updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // 応急救護所到着時はtransport_assignmentとtransportの両方を更新
      if (status === 'completed') {
        updateData.transport_assignment = {
          ...currentTag?.transport_assignment,
          status: 'completed',
          updated_at: new Date().toISOString(),
        };
        updateData.transport = {
          ...currentTag?.transport,
          status: 'arrived',
          arrival_time: new Date().toISOString(),
        };
      } else {
        // その他のステータス（assigned, in_progress）はtransport_assignmentで管理
        updateData.transport_assignment = {
          ...currentTag?.transport_assignment,
          status: status,
          updated_at: new Date().toISOString(),
        };
      }

      const { error } = await supabase.from('triage_tags').update(updateData).eq('id', tagId);

      if (error) throw error;

      // ローカル状態を即座に更新
      setPatients((prevPatients) => {
        // 応急救護所到着の場合は一覧から削除
        if (status === 'completed') {
          return prevPatients.filter((patient) => patient.id !== tagId);
        }

        // その他のステータスは更新
        return prevPatients.map((patient) => {
          if (patient.id === tagId && patient.transport_assignment) {
            return {
              ...patient,
              transport_assignment: {
                ...patient.transport_assignment,
                status: status as 'assigned' | 'in_progress' | 'completed',
                updated_at: new Date().toISOString(),
              },
              updated_at: new Date().toISOString(),
            };
          }
          return patient;
        });
      });

      if (status === 'in_progress') {
        setConfirmingPatientId(null);
        // 成功メッセージは表示しない（UIで即座に反映されるため）
      } else {
        alert(`搬送ステータスを${status === 'completed' ? '応急' : status}に更新しました`);
      }
    } catch (error) {
      alert('ステータス更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // QRコードスキャン処理
  const handleQRScan = async (result: string) => {
    try {
      let patientId = '';

      // 様々なQRコード形式に対応
      try {
        // JSON形式を試行
        const patientData = JSON.parse(result);
        patientId = patientData.id || patientData.patient_id || patientData.tag_id;
      } catch {
        // 単純な文字列の場合
        patientId = result.trim();
      }

      if (!patientId) {
        alert('QRコードから患者IDを取得できませんでした');
        return;
      }

      // 患者情報を取得
      const { data: patient, error } = await supabase
        .from('triage_tags')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error || !patient) {
        // IDで見つからない場合、tag_numberやanonymous_idで検索
        const { data: patientByTag, error: tagError } = await supabase
          .from('triage_tags')
          .select('*')
          .or(`tag_number.eq.${patientId},anonymous_id.eq.${patientId}`)
          .single();

        if (tagError || !patientByTag) {
          alert(`患者が見つかりません: ${patientId}`);
          return;
        }

        // 患者詳細モーダルを表示
        setSelectedPatient(patientByTag as TriageTag);
        setShowQRScanner(false);
        return;
      }

      // 患者詳細モーダルを表示
      setSelectedPatient(patient as TriageTag);
      setShowQRScanner(false);
    } catch (error) {
      alert('QRコードの読み取りに失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-orange-600 p-4 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">搬送部隊ダッシュボード</h1>
          </div>
          <div className="flex items-center gap-2">
            {isRealtime && (
              <div className="flex animate-pulse items-center gap-2 rounded-lg bg-green-500 px-4 py-2">
                <span className="h-3 w-3 rounded-full bg-white"></span>
                <span className="text-sm font-bold">データ更新</span>
              </div>
            )}
            <button
              onClick={() => setShowQRScanner(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-white transition-colors hover:bg-white/10"
              style={{ minHeight: 44 }}
              aria-label="患者QRコードをスキャン"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4m8-18h4a2 2 0 012 2v4m0 6v4a2 2 0 01-2 2h-4"
                />
              </svg>
              <span className="hidden text-sm font-medium sm:inline">QRスキャン</span>
            </button>
            <HeaderToolButtons />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        {/* 統計カード（フィルター機能統合） */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <button
            onClick={() => setFilter('all')}
            className={`card cursor-pointer text-center transition-all duration-200 hover:scale-105 hover:shadow-xl ${
              filter === 'all' ? 'shadow-xl ring-4 ring-orange-500' : ''
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

        {/* 搬送進捗ドーナツフローチャート */}
        <CasualtyFlowChart tags={patients} storageKey="transportTeamDashboard_flowCollapsed" />

        {/* 搬送部隊絞り込み */}
        <div className="card">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">搬送部隊絞り込み:</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="input max-w-xs"
            >
              <option value="全搬送部隊">全搬送部隊</option>
              {TRANSPORT_TEAMS.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
            <span className="ml-auto text-sm text-gray-600">
              表示中: {filteredPatients.length}件 / 全{patients.length}件
            </span>
          </div>
        </div>

        {/* 搬送指示一覧 */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">患者一覧（{filteredPatients.length}件）</h2>
            <ViewToggle viewMode={viewMode} onToggle={handleViewModeToggle} />
          </div>
          {filteredPatients.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              {selectedTeam === '全搬送部隊'
                ? '搬送指示はありません'
                : `${selectedTeam}への搬送指示はありません`}
            </p>
          ) : (
            <div
              className={
                viewMode === 'list'
                  ? 'space-y-3'
                  : 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
              }
            >
              {filteredPatients.map((tag) => {
                const transportStatus = tag.transport_assignment?.status || 'assigned';

                const transportActions = (
                  <>
                    {transportStatus === 'assigned' && confirmingPatientId !== tag.id && (
                      <button
                        onClick={() => setConfirmingPatientId(tag.id)}
                        disabled={loading}
                        className="btn-primary disabled:opacity-50"
                      >
                        搬送開始
                      </button>
                    )}

                    {transportStatus === 'assigned' && confirmingPatientId === tag.id && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">本当に開始？</span>
                        <button
                          onClick={() => handleUpdateTransportStatus(tag.id, 'in_progress')}
                          disabled={loading}
                          className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setConfirmingPatientId(null)}
                          className="rounded bg-gray-400 px-3 py-1 text-sm font-medium text-white hover:bg-gray-500"
                        >
                          キャンセル
                        </button>
                      </div>
                    )}

                    {transportStatus === 'in_progress' && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 animate-pulse rounded-full bg-orange-500"></div>
                          <span className="font-medium text-orange-600">応急へ</span>
                        </div>
                        <button
                          onClick={() => handleUpdateTransportStatus(tag.id, 'completed')}
                          disabled={loading}
                          className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                        >
                          応急到着
                        </button>
                      </div>
                    )}
                  </>
                );

                return viewMode === 'list' ? (
                  <PatientListItem
                    key={tag.id}
                    tag={tag}
                    onDetailClick={setSelectedPatient}
                    actions={transportActions}
                  />
                ) : (
                  <PatientPanelCard
                    key={tag.id}
                    tag={tag}
                    variant="transport-team"
                    onDetailClick={setSelectedPatient}
                    actions={transportActions}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 患者詳細モーダル */}
      {selectedPatient && (
        <PatientDetailModal
          tag={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          actions={(() => {
            const transportStatus = selectedPatient.transport_assignment?.status || 'assigned';
            return (
              <>
                {transportStatus === 'assigned' && confirmingPatientId !== selectedPatient.id && (
                  <button
                    onClick={() => setConfirmingPatientId(selectedPatient.id)}
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    搬送開始
                  </button>
                )}

                {transportStatus === 'assigned' && confirmingPatientId === selectedPatient.id && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">本当に開始？</span>
                    <button
                      onClick={() => {
                        handleUpdateTransportStatus(selectedPatient.id, 'in_progress');
                        setSelectedPatient(null);
                      }}
                      disabled={loading}
                      className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setConfirmingPatientId(null)}
                      className="rounded bg-gray-400 px-3 py-1 text-sm font-medium text-white hover:bg-gray-500"
                    >
                      キャンセル
                    </button>
                  </div>
                )}

                {transportStatus === 'in_progress' && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 animate-pulse rounded-full bg-orange-500"></div>
                      <span className="font-medium text-orange-600">応急へ</span>
                    </div>
                    <button
                      onClick={() => {
                        handleUpdateTransportStatus(selectedPatient.id, 'completed');
                        setSelectedPatient(null);
                      }}
                      disabled={loading}
                      className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                    >
                      応急到着
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        />
      )}

      {/* QRスキャナーモーダル */}
      {showQRScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">QRコードスキャン</h3>
              <button
                onClick={() => {
                  setShowQRScanner(false);
                  setShowManualInput(false);
                  setManualInput('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {!showManualInput ? (
              <>
                <QRScanner
                  onScanSuccess={handleQRScan}
                  onScanError={(error) => {
                    alert('QRスキャンでエラーが発生しました');
                  }}
                />
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowManualInput(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    手動入力に切り替え
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    患者IDまたはタグ番号を入力
                  </label>
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    placeholder="T-2025-001 または ANON-123456"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (manualInput.trim()) {
                        handleQRScan(manualInput.trim());
                        setManualInput('');
                      }
                    }}
                    disabled={!manualInput.trim()}
                    className="flex-1 rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                  >
                    検索
                  </button>
                  <button
                    onClick={() => {
                      setShowManualInput(false);
                      setManualInput('');
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                  >
                    QRスキャンに戻る
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
