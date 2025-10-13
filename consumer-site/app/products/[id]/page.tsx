export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">商品詳細</h1>
      <p className="text-gray-600">商品ID: {params.id}</p>

      <div className="mt-8 space-y-6">
        <section className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">商品画像</h2>
          <p className="text-gray-500">画像表示エリア（実装予定）</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">商品情報</h2>
          <p className="text-gray-500">商品名、説明、産地、規格外理由など</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">販売者情報</h2>
          <p className="text-gray-500">農家プロフィール表示</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">SKU選択</h2>
          <p className="text-gray-500">重量/数量と価格の選択</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">レビュー</h2>
          <p className="text-gray-500">購入者のレビュー表示</p>
        </section>
      </div>
    </div>
  );
}
