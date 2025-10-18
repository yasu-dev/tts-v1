'use client'

import { useState, useEffect } from 'react'
import { TriageCategories, TriageTag } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import LogoutButton from '@/components/LogoutButton'

// 地図コンポーネントを動的インポート（SSR無効化）
const TriageMap = dynamic(() => import('@/components/TriageMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center rounded-lg">
      <p className="text-gray-600">地図を読み込み中...</p>
    </div>
  ),
})

interface CommandDashboardProps {
  initialTags: TriageTag[]
}

export default function CommandDashboard({ initialTags }: CommandDashboardProps) {
  const [tags, setTags] = useState<TriageTag[]>(initialTags)
  const [filter, setFilter] = useState<'all' | 'black' | 'red' | 'yellow' | 'green'>('all')
  const [isRealtime, setIsRealtime] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const supabase = createClient()

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
        async (payload) => {
          console.log('Realtime update:', payload)

          // データを再取得
          const { data, error } = await supabase
            .from('triage_tags')
            .select('*')
            .order('created_at', { ascending: false })

          if (!error && data) {
            setTags(data as TriageTag[])
            setIsRealtime(true)
            setTimeout(() => setIsRealtime(false), 2000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const filteredTags = filter === 'all'
    ? tags
    : tags.filter(tag => tag.triage_category.final === filter)

  const stats = {
    total: tags.length,
    black: tags.filter(t => t.triage_category.final === 'black').length,
    red: tags.filter(t => t.triage_category.final === 'red').length,
    yellow: tags.filter(t => t.triage_category.final === 'yellow').length,
    green: tags.filter(t => t.triage_category.final === 'green').length,
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">指揮本部ダッシュボード</h1>
            <p className="text-sm opacity-90">リアルタイムトリアージ状況</p>
          </div>
          <div className="flex items-center gap-4">
            {isRealtime && (
              <div className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-lg animate-pulse">
                <span className="w-3 h-3 bg-white rounded-full"></span>
                <span className="text-sm font-bold">データ更新</span>
              </div>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-sm text-gray-600">総数</p>
          </div>
          <div className="card text-center bg-black text-white">
            <p className="text-3xl font-bold">{stats.black}</p>
            <p className="text-sm opacity-90">黒（死亡）</p>
          </div>
          <div className="card text-center bg-red-500 text-white">
            <p className="text-3xl font-bold">{stats.red}</p>
            <p className="text-sm opacity-90">赤（重症）</p>
          </div>
          <div className="card text-center bg-yellow-400">
            <p className="text-3xl font-bold">{stats.yellow}</p>
            <p className="text-sm">黄（中等症）</p>
          </div>
          <div className="card text-center bg-green-500 text-white">
            <p className="text-3xl font-bold">{stats.green}</p>
            <p className="text-sm opacity-90">緑（軽症）</p>
          </div>
        </div>

        {/* フィルター */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              全て
            </button>
            <button onClick={() => setFilter('red')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'red' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>
              赤
            </button>
            <button onClick={() => setFilter('yellow')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'yellow' ? 'bg-yellow-400' : 'bg-gray-200'}`}>
              黄
            </button>
            <button onClick={() => setFilter('green')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'green' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
              緑
            </button>
            <button onClick={() => setFilter('black')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'black' ? 'bg-black text-white' : 'bg-gray-200'}`}>
              黒
            </button>
          </div>
        </div>

        {/* 地図表示 */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">患者位置マップ</h2>
          <TriageMap
            patients={tags
              .filter(tag => tag.location && tag.location.latitude && tag.location.longitude)
              .map(tag => ({
                id: tag.id,
                position: [tag.location.latitude, tag.location.longitude] as [number, number],
                category: tag.triage_category.final,
                tagNumber: tag.tag_number,
                anonymousId: tag.anonymous_id,
              }))}
            center={
              tags.length > 0 && tags[0].location
                ? [tags[0].location.latitude, tags[0].location.longitude] as [number, number]
                : undefined
            }
            onMarkerClick={(patientId) => {
              setSelectedPatientId(patientId)
              // スクロールして該当患者の詳細を表示
              const element = document.getElementById(`patient-${patientId}`)
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                element.classList.add('ring-4', 'ring-blue-500')
                setTimeout(() => {
                  element.classList.remove('ring-4', 'ring-blue-500')
                }, 3000)
              }
            }}
          />
          <p className="text-sm text-gray-600 mt-2">
            地図上のマーカーをクリックすると、患者詳細が表示されます。
          </p>
        </div>

        {/* トリアージタグリスト */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">トリアージタグ一覧（{filteredTags.length}件）</h2>
          {filteredTags.length === 0 ? (
            <p className="text-center text-gray-500 py-8">データがありません</p>
          ) : (
            <div className="space-y-3">
              {filteredTags.map(tag => {
                const category = tag.triage_category.final
                const categoryInfo = TriageCategories[category]

                return (
                  <div
                    key={tag.id}
                    id={`patient-${tag.id}`}
                    className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all ${selectedPatientId === tag.id ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-2 rounded-lg font-bold ${categoryInfo.color} ${categoryInfo.textColor}`}>
                        {tag.tag_number}
                      </span>
                      <div>
                        <p className="font-semibold">{categoryInfo.label}</p>
                        <p className="text-sm text-gray-600">
                          患者ID: {tag.anonymous_id} |
                          {tag.patient_info?.age && ` ${tag.patient_info.age}歳`}
                          {tag.patient_info?.sex && ` ${tag.patient_info.sex === 'male' ? '男性' : tag.patient_info.sex === 'female' ? '女性' : ''}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          登録: {new Date(tag.audit.created_at).toLocaleString('ja-JP')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        搬送状態: {tag.transport.status === 'not_transported' ? '未搬送' :
                                  tag.transport.status === 'preparing' ? '搬送準備中' :
                                  tag.transport.status === 'in_transit' ? '搬送中' :
                                  tag.transport.status === 'completed' ? '搬送完了' : '不明'}
                      </p>
                      <button className="btn-primary mt-2">詳細</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
