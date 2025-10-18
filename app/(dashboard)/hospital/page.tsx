'use client'

const mockIncomingPatients = [
  { id: '1', tag_number: 'T-001', category: 'red', eta: '10分', vehicle: '救急1号' },
  { id: '2', tag_number: 'T-004', category: 'red', eta: '15分', vehicle: '救急3号' },
]

export default function HospitalPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">医療機関ダッシュボード</h1>
          <p className="text-sm opacity-90">東京総合病院</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-blue-600">12</p>
            <p className="text-sm text-gray-600">総病床数</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">8</p>
            <p className="text-sm text-gray-600">空床数</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-red-600">2</p>
            <p className="text-sm text-gray-600">搬送予定</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">搬送予定患者</h2>
          <div className="space-y-3">
            {mockIncomingPatients.map(patient => (
              <div key={patient.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-2 rounded-lg font-bold bg-red-500 text-white">
                      {patient.tag_number}
                    </span>
                    <div>
                      <p className="font-semibold">{patient.vehicle}</p>
                      <p className="text-sm text-gray-600">到着予定: {patient.eta}</p>
                    </div>
                  </div>
                  <button className="btn-primary">詳細確認</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">受入状況更新</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">受入可否</label>
              <select className="input">
                <option>受入可能</option>
                <option>制限あり</option>
                <option>受入不可</option>
              </select>
            </div>
            <button className="w-full btn-primary py-3">状況を更新</button>
          </div>
        </div>
      </main>
    </div>
  )
}
