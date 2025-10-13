export default function PaymentPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">お支払い</h1>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">注文内容の確認</h2>
        <div className="space-y-2 text-gray-600">
          <p>配送先情報の確認</p>
          <p>注文商品の確認</p>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-6 mb-6">
        <p className="text-gray-500 text-center">
          Stripe Checkoutへリダイレクト（実装予定）
        </p>
      </div>

      <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
        お支払いへ進む
      </button>
    </div>
  );
}
