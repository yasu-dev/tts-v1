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

export default function PayPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shipping, setShipping] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [shippingFee, setShippingFee] = useState(800); // デフォルト値

  useEffect(() => {
    // Load cart and shipping from localStorage
    const savedCart = localStorage.getItem('cart');
    const savedShipping = localStorage.getItem('checkout_shipping');

    if (!savedCart || !savedShipping) {
      router.push('/cart');
      return;
    }

    setCart(JSON.parse(savedCart));
    setShipping(JSON.parse(savedShipping));
  }, [router]);

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

  const subtotal = cart.reduce(
    (sum, item) => sum + item.priceYen * item.quantity,
    0
  );
  const total = subtotal + shippingFee;

  const handleDemoCheckout = () => {
    setProcessing(true);

    // MVP: デモ決済（Stripe未契約のため）
    setTimeout(() => {
      // Create mock order
      const mockOrderId = `ORDER-${Date.now()}`;

      // Clear cart
      localStorage.removeItem('cart');
      localStorage.removeItem('checkout_shipping');

      // Redirect to success page
      router.push(`/order/complete?order=${mockOrderId}`);
    }, 2000);
  };

  if (!cart.length || !shipping) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-12">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">注文確認</h1>

      {/* MVP Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-blue-900 mb-2">【MVP版】デモ決済について</h3>
        <p className="text-sm text-blue-800">
          現在はデモ環境のため、実際の決済は行われません。
          「注文を確定する」ボタンで注文が完了します。
          本番環境ではStripe決済が統合される予定です。
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">注文内容</h2>
        <div className="space-y-3 mb-4">
          {cart.map((item) => (
            <div key={item.skuId} className="flex justify-between text-sm">
              <div>
                <span className="font-medium">{item.productName}</span>
                <span className="text-gray-600 ml-2">
                  {item.skuWeight >= 1000
                    ? `${item.skuWeight / 1000}kg`
                    : `${item.skuWeight}g`}{' '}
                  × {item.quantity}
                </span>
              </div>
              <span>¥{(item.priceYen * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">小計</span>
            <span>¥{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">送料</span>
            <span>¥{shippingFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>合計</span>
            <span className="text-green-600">¥{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">配送先</h2>
        <div className="text-sm space-y-1">
          <p>{shipping.name}</p>
          <p>〒{shipping.postal_code}</p>
          <p>
            {shipping.prefecture} {shipping.city}
          </p>
          <p>{shipping.address1}</p>
          {shipping.address2 && <p>{shipping.address2}</p>}
          <p>Tel: {shipping.phone}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/checkout/shipping"
          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold text-center"
        >
          ← 配送先を変更
        </Link>
        <button
          onClick={handleDemoCheckout}
          disabled={processing}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
        >
          {processing ? '処理中...' : '注文を確定する'}
        </button>
      </div>
    </div>
  );
}
