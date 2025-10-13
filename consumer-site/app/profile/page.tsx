export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">マイページ</h1>

      <div className="space-y-6">
        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">プロフィール情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                ニックネーム
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="ニックネーム"
              />
            </div>
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
                電話番号
              </label>
              <input
                type="tel"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="090-1234-5678"
              />
            </div>
          </div>
        </section>

        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">配送先住所</h2>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-gray-500">デフォルト配送先の表示・編集（実装予定）</p>
          </div>
        </section>

        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">アカウント設定</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition">
              パスワード変更
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition text-red-600">
              ログアウト
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
