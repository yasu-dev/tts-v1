'use client'

import { useState } from 'react'
import { TriageCategories, TriageTag } from '@/lib/types'

interface CommandDashboardProps {
  initialTags: TriageTag[]
}

export default function CommandDashboard({ initialTags }: CommandDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'black' | 'red' | 'yellow' | 'green'>('all')

  const filteredTags = filter === 'all'
    ? initialTags
    : initialTags.filter(tag => tag.triage_category.final === filter)

  const stats = {
    total: initialTags.length,
    black: initialTags.filter(t => t.triage_category.final === 'black').length,
    red: initialTags.filter(t => t.triage_category.final === 'red').length,
    yellow: initialTags.filter(t => t.triage_category.final === 'yellow').length,
    green: initialTags.filter(t => t.triage_category.final === 'green').length,
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">指揮本部ダッシュボード</h1>
          <p className="text-sm opacity-90">リアルタイムトリアージ状況</p>
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
                  <div key={tag.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
