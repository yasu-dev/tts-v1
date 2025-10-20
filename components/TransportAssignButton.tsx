'use client'

import { useState } from 'react'
import { TriageTag } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface TransportAssignButtonProps {
  tag: TriageTag
}

const TRANSPORT_TEAMS = [
  '新宿ポンプ1',
  '新宿ポンプ2', 
  '新宿救助1',
  '三本部機動'
]

export default function TransportAssignButton({ tag }: TransportAssignButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleAssign = async () => {
    if (!selectedTeam) {
      alert('搬送部隊を選択してください')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('triage_tags')
        .update({
          transport_assignment: {
            team: selectedTeam,
            status: 'assigned',
            assigned_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', tag.id)

      if (error) throw error

      alert(`${selectedTeam}に搬送指示を出しました`)
      setShowModal(false)
      setSelectedTeam('')
      // ページをリロードして最新状態を反映
      window.location.reload()
    } catch (error) {
      console.error('Error assigning transport team:', error)
      alert('搬送部隊の割り当てに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-primary text-sm px-3 py-1"
      >
        搬送部隊割当
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">搬送部隊割当</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  患者: {tag.tag_number} ({tag.anonymous_id})
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  現在地: {tag.location.coordinates}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  搬送部隊選択
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full input"
                >
                  <option value="">選択してください</option>
                  {TRANSPORT_TEAMS.map(team => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAssign}
                  disabled={loading || !selectedTeam}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? '割当中...' : '割当実行'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}