export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">カート</h1>

      <div className="space-y-4">
        <div className="bg-gray-100 rounded-lg p-6">
          <p className="text-gray-500">カート内の商品一覧（実装予定）</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">注文サマリ</h2>
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>小計</span>
              <span>¥0</span>
            </div>
            <div className="flex justify-between">
              <span>送料</span>
              <span>¥0</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>合計</span>
              <span>¥0</span>
            </div>
          </div>

          <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
            購入手続きへ進む
          </button>
        </div>
      </div>
    </div>
  );
}
