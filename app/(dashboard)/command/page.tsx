'use client'

import { useState } from 'react'
import { TriageCategories } from '@/lib/types'

// モックデータ
const mockTriageTags = [
  { id: '1', tag_number: 'T-001', category: 'red', location: 'エリアA', created_at: '2025-10-18T10:00:00Z' },
  { id: '2', tag_number: 'T-002', category: 'yellow', location: 'エリアA', created_at: '2025-10-18T10:05:00Z' },
  { id: '3', tag_number: 'T-003', category: 'green', location: 'エリアB', created_at: '2025-10-18T10:10:00Z' },
  { id: '4', tag_number: 'T-004', category: 'red', location: 'エリアC', created_at: '2025-10-18T10:15:00Z' },
  { id: '5', tag_number: 'T-005', category: 'black', location: 'エリアA', created_at: '2025-10-18T10:20:00Z' },
]

export default function CommandPage() {
  const [filter, setFilter] = useState<'all' | 'black' | 'red' | 'yellow' | 'green'>('all')

  const filteredTags = filter === 'all' ? mockTriageTags : mockTriageTags.filter(tag => tag.category === filter)

  const stats = {
    total: mockTriageTags.length,
    black: mockTriageTags.filter(t => t.category === 'black').length,
    red: mockTriageTags.filter(t => t.category === 'red').length,
    yellow: mockTriageTags.filter(t => t.category === 'yellow').length,
    green: mockTriageTags.filter(t => t.category === 'green').length,
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
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-semibold $${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              全て
            </button>
            <button onClick={() => setFilter('red')} className={`px-4 py-2 rounded-lg font-semibold $${filter === 'red' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>
              赤
            </button>
            <button onClick={() => setFilter('yellow')} className={`px-4 py-2 rounded-lg font-semibold $${filter === 'yellow' ? 'bg-yellow-400' : 'bg-gray-200'}`}>
              黄
            </button>
            <button onClick={() => setFilter('green')} className={`px-4 py-2 rounded-lg font-semibold $${filter === 'green' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
              緑
            </button>
            <button onClick={() => setFilter('black')} className={`px-4 py-2 rounded-lg font-semibold $${filter === 'black' ? 'bg-black text-white' : 'bg-gray-200'}`}>
              黒
            </button>
          </div>
        </div>

        {/* トリアージタグリスト */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">トリアージタグ一覧</h2>
          <div className="space-y-3">
            {filteredTags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-2 rounded-lg font-bold $${TriageCategories[tag.category as keyof typeof TriageCategories].color} $${TriageCategories[tag.category as keyof typeof TriageCategories].textColor}`}>
                    {tag.tag_number}
                  </span>
                  <div>
                    <p className="font-semibold">{TriageCategories[tag.category as keyof typeof TriageCategories].label}</p>
                    <p className="text-sm text-gray-600">場所: {tag.location}</p>
                    <p className="text-xs text-gray-500">{new Date(tag.created_at).toLocaleString('ja-JP')}</p>
                  </div>
                </div>
                <button className="btn-primary">詳細</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
