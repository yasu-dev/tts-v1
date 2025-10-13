export default function OrderCompletePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4">ご注文ありがとうございます</h1>
        <p className="text-gray-600 mb-8">
          ご注文が確定しました。確認メールをお送りしております。
        </p>

        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">注文番号</h2>
          <p className="text-2xl font-mono text-green-600">
            #ORDER-XXXXXX
          </p>
        </div>

        <div className="space-y-4">
          <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
            注文履歴を見る
          </button>
          <button className="w-full border border-green-600 text-green-600 py-3 rounded-lg hover:bg-green-50 transition">
            トップページへ戻る
          </button>
        </div>
      </div>
    </div>
  );
}
