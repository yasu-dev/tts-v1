'use client';

import { useState, useEffect } from 'react';
import { Hospital, TriageTag, TriageCategories } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/LogoutButton';
import PatientDetailModal from '@/components/PatientDetailModal';
import QRScanner from '@/components/QRScanner';
import { getPhaseInfo } from '@/lib/utils/getPhaseInfo';
import CasualtyFlowChart from '@/components/CasualtyFlowChart';

interface HospitalDashboardProps {
  hospital: Hospital;
  incomingPatients: TriageTag[];
}

export default function HospitalDashboard({ hospital, incomingPatients }: HospitalDashboardProps) {
  const [acceptingStatus, setAcceptingStatus] = useState(hospital.current_load.accepting_status);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<TriageTag[]>(incomingPatients);
  const [isRealtime, setIsRealtime] = useState(false);
  const [filter, setFilter] = useState<'all' | 'black' | 'red' | 'yellow' | 'green'>('all');
  const [selectedPatient, setSelectedPatient] = useState<TriageTag | null>(null);
  const [isStatusUpdateCollapsed, setIsStatusUpdateCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const supabase = createClient();

  // クライアントサイドでのみlocalStorageを読み込み
  useEffect(() => {
    setIsClient(true);
    const savedState = localStorage.getItem('hospitalDashboard_statusUpdateCollapsed');
    if (savedState !== null) {
      setIsStatusUpdateCollapsed(savedState === 'true');
    }
  }, []);

  // Supabase Realtimeでデータベース変更を購読
  useEffect(() => {
    // 患者データの変更を監視
    const triageChannel = supabase
      .channel('hospital_triage_tags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'triage_tags',
        },
        async (payload) => {
          // この病院向けの搬送中患者を再取得
          const { data, error } = await supabase
            .from('triage_tags')
            .select('*')
            .eq('transport->destination->>hospital_id', hospital.id)
            .eq('transport->>status', 'in_transit')
            .order('created_at', { ascending: false });

          if (!error && data) {
            setPatients(data as TriageTag[]);
            setIsRealtime(true);
            setTimeout(() => setIsRealtime(false), 2000);
          }
        }
      )
      .subscribe();

    // 病院データの変更を監視
    const hospitalChannel = supabase
      .channel('hospital_data_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'hospitals',
          filter: `id=eq.${hospital.id}`,
        },
        async (payload) => {
          // ページを再読み込みして最新情報を取得
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(triageChannel);
      supabase.removeChannel(hospitalChannel);
    };
  }, [supabase, hospital.id]);

  const availableBeds =
    hospital.current_load.total_capacity - hospital.current_load.current_patients;

  // フィルタリングされた患者
  const filteredPatients =
    filter === 'all'
      ? patients
      : patients.filter((patient) => patient.triage_category.final === filter);

  // トリアージカテゴリ別の統計
  const stats = {
    total: patients.length,
    black: patients.filter((p) => p.triage_category.final === 'black').length,
    red: patients.filter((p) => p.triage_category.final === 'red').length,
    yellow: patients.filter((p) => p.triage_category.final === 'yellow').length,
    green: patients.filter((p) => p.triage_category.final === 'green').length,
  };

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('hospitals')
        .update({
          current_load: {
            ...hospital.current_load,
            accepting_status: acceptingStatus,
            last_updated: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', hospital.id);

      if (error) throw error;

      alert('受入状況を更新しました');
      window.location.reload();
    } catch (error) {
      alert('更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleReceivePatient = async (tagId: string) => {
    setLoading(true);
    try {
      // Get the current tag data to preserve existing transport info
      const { data: currentTag } = await supabase
        .from('triage_tags')
        .select('transport, transport_assignment')
        .eq('id', tagId)
        .single();

      const { error } = await supabase
        .from('triage_tags')
        .update({
          transport: {
            ...currentTag?.transport,
            status: 'completed',
            arrival_time: new Date().toISOString(),
          },
          transport_assignment: currentTag?.transport_assignment
            ? {
                ...currentTag.transport_assignment,
                status: 'completed',
                updated_at: new Date().toISOString(),
              }
            : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tagId);

      if (error) throw error;

      // 病院の受入患者数を更新
      await supabase
        .from('hospitals')
        .update({
          current_load: {
            ...hospital.current_load,
            current_patients: hospital.current_load.current_patients + 1,
            last_updated: new Date().toISOString(),
          },
          transport_count: hospital.transport_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', hospital.id);

      // 搬送完了した患者を一覧から削除（受入完了のため表示不要）
      setPatients((prevPatients) => prevPatients.filter((patient) => patient.id !== tagId));

      alert('患者を受け入れました');
    } catch (error) {
      alert('受入処理に失敗しました');
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
      <header className="bg-purple-600 p-4 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">医療機関ダッシュボード</h1>
            <p className="text-sm opacity-90">{hospital.name}</p>
          </div>
          <div className="flex items-center gap-4">
            {isRealtime && (
              <div className="flex animate-pulse items-center gap-2 rounded-lg bg-green-500 px-4 py-2">
                <span className="h-3 w-3 rounded-full bg-white"></span>
                <span className="text-sm font-bold">データ更新</span>
              </div>
            )}
            <button
              onClick={() => setShowQRScanner(true)}
              className="rounded-lg bg-white px-4 py-2 font-medium text-purple-600 transition-colors hover:bg-purple-50"
            >
              QRスキャン
            </button>
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
              filter === 'all' ? 'shadow-xl ring-4 ring-purple-500' : ''
            }`}
          >
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-sm text-gray-600">搬送中</p>
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
        <CasualtyFlowChart tags={patients} storageKey="hospitalDashboard_flowCollapsed" />

        {/* 病院情報 */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card">
            <h2 className="mb-4 text-xl font-bold">病院情報</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">所在地:</span> {hospital.location.address}
              </p>
              <p>
                <span className="font-semibold">緊急電話:</span>{' '}
                {hospital.contact.emergency_phone || hospital.contact.phone}
              </p>
              <p>
                <span className="font-semibold">一般電話:</span> {hospital.contact.phone}
              </p>
              {hospital.contact.email && (
                <p>
                  <span className="font-semibold">メール:</span> {hospital.contact.email}
                </p>
              )}
              {hospital.name === '東京医科大学病院' && (
                <p>
                  <span className="font-semibold">公式サイト:</span>{' '}
                  <a
                    href="https://tokyo-med-er.jp/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://tokyo-med-er.jp/
                  </a>
                </p>
              )}
              {hospital.capabilities.has_er && (
                <p className="font-semibold text-green-600">✓ 救命救急センター</p>
              )}
              {hospital.capabilities.has_heliport && (
                <p className="font-semibold text-blue-600">✓ ヘリポート有</p>
              )}
              {hospital.capabilities.has_icu && (
                <p className="font-semibold text-purple-600">✓ ICU有</p>
              )}
              <p className="mt-2 text-sm text-gray-600">
                診療科:{' '}
                {hospital.capabilities.departments?.map((d) => d.name).join(', ') || '情報なし'}
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="mb-4 text-xl font-bold">病床状況</h2>
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {hospital.current_load.total_capacity}
                </p>
                <p className="text-xs text-gray-600">総病床数</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{availableBeds}</p>
                <p className="text-xs text-gray-600">空床数</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {hospital.current_load.current_patients}
                </p>
                <p className="text-xs text-gray-600">現在患者数</p>
              </div>
            </div>

            {/* 診療科別病床状況 */}
            <div className="border-t pt-4">
              <h3 className="mb-3 font-semibold text-gray-700">診療科別病床状況</h3>
              <div className="space-y-2">
                {hospital.capabilities.departments?.map((dept, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded bg-gray-50 p-2"
                  >
                    <span className="text-sm font-medium">{dept.name}</span>
                    <div className="space-x-4 text-xs">
                      <span className="text-green-600">空床: {dept.available_beds}</span>
                      <span className="text-gray-600">使用中: {dept.occupied_beds}</span>
                    </div>
                  </div>
                )) || <p className="text-sm text-gray-500">診療科情報なし</p>}
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p>
                病床情報更新: {new Date(hospital.current_load.last_updated).toLocaleString('ja-JP')}
              </p>
              <p>総搬送受入実績: {hospital.transport_count}件</p>
            </div>
          </div>
        </div>

        {/* 受入状況更新 */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">受入状況更新</h2>
            <button
              onClick={() => {
                const newState = !isStatusUpdateCollapsed;
                setIsStatusUpdateCollapsed(newState);
                if (isClient) {
                  localStorage.setItem('hospitalDashboard_statusUpdateCollapsed', String(newState));
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-bold text-gray-700 transition hover:bg-gray-200"
            >
              {isStatusUpdateCollapsed ? (
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
              isStatusUpdateCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
            }`}
          >
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-medium">受入可否</label>
                <select
                  className="input"
                  value={acceptingStatus}
                  onChange={(e) => setAcceptingStatus(e.target.value as any)}
                >
                  <option value="accepting">受入可能</option>
                  <option value="limited">制限あり</option>
                  <option value="full">満床</option>
                  <option value="not_accepting">受入不可</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  現在の状態:{' '}
                  <span className="font-semibold">
                    {hospital.current_load.accepting_status === 'accepting'
                      ? '受入可能'
                      : hospital.current_load.accepting_status === 'limited'
                        ? '制限あり'
                        : hospital.current_load.accepting_status === 'full'
                          ? '満床'
                          : '受入不可'}
                  </span>
                </p>
                <p>
                  最終更新: {new Date(hospital.current_load.last_updated).toLocaleString('ja-JP')}
                </p>
              </div>
              <button
                onClick={handleUpdateStatus}
                disabled={loading || acceptingStatus === hospital.current_load.accepting_status}
                className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? '更新中...' : '状況を更新'}
              </button>
            </div>
          </div>
        </div>

        {/* 搬送中患者一覧 */}
        <div className="card">
          <h2 className="mb-4 text-xl font-bold">患者一覧（{filteredPatients.length}件）</h2>
          {filteredPatients.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              {filter === 'all'
                ? '搬送中の患者はいません'
                : `${filter === 'black' ? '黒' : filter === 'red' ? '赤' : filter === 'yellow' ? '黄' : '緑'}タグの患者はいません`}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((tag) => {
                const category = tag.triage_category.final;
                const categoryInfo = TriageCategories[category];
                const phaseInfo = getPhaseInfo(tag);

                return (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-all hover:bg-gray-100"
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <span
                        className={`rounded-lg px-4 py-2 font-bold ${categoryInfo.color} ${categoryInfo.textColor}`}
                      >
                        {tag.tag_number}
                      </span>
                      <div className="flex-1">
                        {/* Line 1: Icon + Phase + Patient attributes */}
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-base">{phaseInfo.icon}</span>
                          <span className="font-semibold text-gray-900">{phaseInfo.phase}</span>
                          <span className="text-gray-400">|</span>
                          <p className="text-sm text-gray-700">
                            {tag.patient_info?.age && `${tag.patient_info.age}歳`}
                            {tag.patient_info?.sex && tag.patient_info?.age && ' | '}
                            {tag.patient_info?.sex &&
                              `${tag.patient_info.sex === 'male' ? '男性' : tag.patient_info.sex === 'female' ? '女性' : tag.patient_info.sex}`}
                            {!tag.patient_info?.age && !tag.patient_info?.sex && '詳細情報なし'}
                          </p>
                        </div>
                        {/* Line 2: Responsible party + Departure time */}
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500">{phaseInfo.responsible}</p>
                          {tag.transport.departure_time && (
                            <>
                              <span className="text-gray-300">•</span>
                              <p className="text-xs text-gray-500">
                                出発:{' '}
                                {new Date(tag.transport.departure_time).toLocaleString('ja-JP')}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Right side: Action buttons only */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPatient(tag)}
                        className="rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
                      >
                        詳細
                      </button>
                      {tag.transport.status !== 'completed' && (
                        <button
                          onClick={() => handleReceivePatient(tag.id)}
                          disabled={loading}
                          className="btn-primary disabled:opacity-50"
                        >
                          受入完了
                        </button>
                      )}
                    </div>
                  </div>
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
          actions={
            selectedPatient.transport.status !== 'completed' && (
              <button
                onClick={() => {
                  handleReceivePatient(selectedPatient.id);
                  setSelectedPatient(null);
                }}
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                受入完了
              </button>
            )
          }
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
                    className="text-sm text-purple-600 hover:underline"
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
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
                    className="flex-1 rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
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
