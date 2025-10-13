export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">商品検索</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="商品名、販売者名で検索..."
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">カテゴリー</h2>
        <div className="flex flex-wrap gap-2">
          {['果菜', '葉物', '根菜', 'その他'].map((category) => (
            <button
              key={category}
              className="px-4 py-2 border rounded-full hover:bg-green-50 hover:border-green-600 transition"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="text-center py-12 text-gray-500 col-span-full">
          <p>検索結果を表示（実装予定）</p>
        </div>
      </div>
    </div>
  );
}
