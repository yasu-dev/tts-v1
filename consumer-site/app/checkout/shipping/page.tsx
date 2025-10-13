export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">配送先情報</h1>

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            お名前
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="山田 太郎"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            郵便番号
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            都道府県
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="東京都"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            市区町村
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="渋谷区"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            番地・建物名
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="渋谷1-2-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            電話番号
          </label>
          <input
            type="tel"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="090-1234-5678"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          支払い方法へ進む
        </button>
      </form>
    </div>
  );
}
