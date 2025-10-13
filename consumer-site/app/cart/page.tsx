'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartItem {
  productId: string;
  productName: string;
  skuId: string;
  skuWeight: number;
  quantity: number;
  priceYen: number;
  sellerId: string;
  sellerName: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shippingFee, setShippingFee] = useState(800); // デフォルト値

  useEffect(() => {
    // LocalStorageからカートデータを取得
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        // パースエラー時は空配列
        setCartItems([]);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // DBから送料を取得
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.defaultShippingFee) {
          setShippingFee(data.defaultShippingFee);
        }
      })
      .catch(() => {
        // エラー時はデフォルト値を使用
      });
  }, []);

  const updateQuantity = (skuId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map(item =>
      item.skuId === skuId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (skuId: string) => {
    const updatedCart = cartItems.filter(item => item.skuId !== skuId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.priceYen * item.quantity,
    0
  );
  const total = subtotal + shippingFee;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    router.push('/checkout/shipping');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">読み込み中...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">カート</h1>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-4xl mb-4">🛒</div>
          <p className="text-gray-600 mb-6">カートは空です</p>
          <Link
            href="/"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            商品を探す
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">カート</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* カート商品一覧 */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.skuId}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{item.productName}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    出品者: {item.sellerName}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.skuWeight >= 1000
                      ? `${item.skuWeight / 1000}kg`
                      : `${item.skuWeight}g`}
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    ¥{item.priceYen.toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item.skuId)}
                  className="text-red-600 hover:text-red-700 p-2"
                  title="削除"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-gray-600">数量:</span>
                <button
                  onClick={() => updateQuantity(item.skuId, item.quantity - 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-1 border rounded">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.skuId, item.quantity + 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  +
                </button>
                <span className="text-sm text-gray-600 ml-4">
                  小計: ¥{(item.priceYen * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 注文サマリ */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">注文サマリ</h2>
            <div className="space-y-2 text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>小計</span>
                <span>¥{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>送料</span>
                <span>¥{shippingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t text-black">
                <span>合計</span>
                <span className="text-green-600">¥{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              購入手続きへ進む
            </button>

            <Link
              href="/"
              className="block text-center mt-4 text-green-600 hover:text-green-700"
            >
              ← 買い物を続ける
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
