export default function VegetableFarmersPage({
  params,
}: {
  params: { name: string };
}) {
  const vegetableName = decodeURIComponent(params.name);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        {vegetableName}の出品一覧
      </h1>
      <p className="text-gray-600 mb-6">
        販売者一覧を表示します
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center">
            <p className="text-gray-500">商品画像</p>
          </div>
          <h3 className="font-bold text-lg mb-2">商品名</h3>
          <p className="text-sm text-gray-600 mb-2">販売者: 〇〇農園</p>
          <p className="text-sm text-gray-600 mb-2">産地: 〇〇県</p>
          <p className="text-sm text-gray-500 mb-4">規格外理由: ...</p>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-green-600">¥0</span>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
              詳細を見る
            </button>
          </div>
        </div>

        <div className="text-center py-12 text-gray-500 col-span-full">
          <p>データベースから商品を取得（実装予定）</p>
        </div>
      </div>
    </div>
  );
}
