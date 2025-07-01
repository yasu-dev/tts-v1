'use client';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ページが見つかりません
        </h2>
        <p className="text-gray-600 mb-8">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <a 
          href="/login"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ログインページへ
        </a>
      </div>
    </div>
  );
} 