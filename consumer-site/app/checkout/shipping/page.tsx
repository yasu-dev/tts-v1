'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ShippingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    postal_code: '',
    prefecture: '',
    city: '',
    address1: '',
    address2: '',
    phone: '',
  });

  useEffect(() => {
    loadShippingAddress();
  }, []);

  const loadShippingAddress = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Load buyer profile (shipping address)
    const { data: buyerData } = await supabase
      .from('buyer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (buyerData?.default_shipping) {
      setShippingAddress(buyerData.default_shipping);
    }

    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (
      !shippingAddress.name ||
      !shippingAddress.postal_code ||
      !shippingAddress.prefecture ||
      !shippingAddress.city ||
      !shippingAddress.address1 ||
      !shippingAddress.phone
    ) {
      alert('必須項目を入力してください');
      return;
    }

    // Save to localStorage for checkout
    localStorage.setItem('checkout_shipping', JSON.stringify(shippingAddress));

    // Proceed to payment
    router.push('/checkout/pay');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-12">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">配送先情報</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            プロフィールに登録された配送先が自動入力されます。
            <Link href="/profile" className="text-green-600 hover:underline ml-2">
              プロフィールを編集 →
            </Link>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            お名前 <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="山田 太郎"
            value={shippingAddress.name}
            onChange={(e) =>
              setShippingAddress({ ...shippingAddress, name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            郵便番号 <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="123-4567"
            value={shippingAddress.postal_code}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                postal_code: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            都道府県 <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="東京都"
            value={shippingAddress.prefecture}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                prefecture: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            市区町村 <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="渋谷区"
            value={shippingAddress.city}
            onChange={(e) =>
              setShippingAddress({ ...shippingAddress, city: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            町名・番地 <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="渋谷1-2-3"
            value={shippingAddress.address1}
            onChange={(e) =>
              setShippingAddress({ ...shippingAddress, address1: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            建物名・部屋番号（任意）
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="ABCマンション101号室"
            value={shippingAddress.address2}
            onChange={(e) =>
              setShippingAddress({ ...shippingAddress, address2: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            電話番号 <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            required
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="090-1234-5678"
            value={shippingAddress.phone}
            onChange={(e) =>
              setShippingAddress({ ...shippingAddress, phone: e.target.value })
            }
          />
        </div>

        <div className="flex gap-4">
          <Link
            href="/cart"
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold text-center"
          >
            ← カートに戻る
          </Link>
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            支払い方法へ進む
          </button>
        </div>
      </form>
    </div>
  );
}
