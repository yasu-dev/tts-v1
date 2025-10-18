'use client'

// モックデータ
const mockAssignedTags = [
  { id: '1', tag_number: 'T-004', category: 'red', location: 'エリアC', patient_name: '患者A' },
  { id: '2', tag_number: 'T-001', category: 'red', location: 'エリアA', patient_name: '患者B' },
]

export default function TransportPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-orange-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">搬送管理</h1>
          <p className="text-sm opacity-90">搬送部隊</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">割り当てられた傷病者</h2>
          <div className="space-y-3">
            {mockAssignedTags.map(tag => (
              <div key={tag.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-4 py-2 rounded-lg font-bold bg-red-500 text-white">
                    {tag.tag_number}
                  </span>
                  <span className="text-sm text-gray-600">{tag.location}</span>
                </div>
                <p className="font-semibold mb-3">{tag.patient_name}</p>
                <div className="flex gap-2">
                  <button className="flex-1 btn-primary">QRスキャン</button>
                  <button className="flex-1 btn-secondary">ナビ開始</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">搬送先選択</h2>
          <select className="input mb-3">
            <option>東京総合病院（受入可）</option>
            <option>都立中央病院（受入可）</option>
            <option>市民病院（制限あり）</option>
          </select>
          <button className="w-full btn-primary py-4">搬送開始</button>
        </div>
      </main>
    </div>
  )
}
