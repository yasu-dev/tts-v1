'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';

export default function TestScrollPage() {
  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">スクロールテストページ</h1>
        
        {/* 大量のコンテンツを生成 */}
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">セクション {i + 1}</h2>
            <p className="text-gray-600 mb-4">
              これはスクロールテスト用のコンテンツです。このページは確実にスクロールが必要になるように
              十分な量のコンテンツを含んでいます。セクション {i + 1} の内容です。
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-medium">項目 A</h3>
                <p className="text-sm text-gray-600">詳細情報 {i * 3 + 1}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <h3 className="font-medium">項目 B</h3>
                <p className="text-sm text-gray-600">詳細情報 {i * 3 + 2}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <h3 className="font-medium">項目 C</h3>
                <p className="text-sm text-gray-600">詳細情報 {i * 3 + 3}</p>
              </div>
            </div>
            {i === 49 && (
              <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded">
                <p className="text-green-800 font-medium">✅ 最下部に到達しました！</p>
                <p className="text-green-700 text-sm">
                  スクロールバーが表示され、ここまでスクロールできていれば修正成功です。
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
} 