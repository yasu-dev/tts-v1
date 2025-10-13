'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    nickname: '',
    full_name: '',
    phone: '',
  });
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
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    setUser(user);

    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileData) {
      setProfile({
        nickname: profileData.nickname || '',
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
      });
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

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    const supabase = createClient();

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        nickname: profile.nickname,
        full_name: profile.full_name,
        phone: profile.phone,
      })
      .eq('user_id', user.id);

    if (profileError) {
      alert('プロフィールの保存に失敗しました');
      setSaving(false);
      return;
    }

    // Update buyer profile (shipping address)
    const { error: buyerError } = await supabase
      .from('buyer_profiles')
      .upsert({
        user_id: user.id,
        default_shipping: shippingAddress,
      });

    if (buyerError) {
      alert('配送先の保存に失敗しました');
      setSaving(false);
      return;
    }

    alert('保存しました');
    setSaving(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
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
                value={profile.nickname}
                onChange={(e) =>
                  setProfile({ ...profile, nickname: e.target.value })
                }
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
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
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
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </div>
          </div>
        </section>

        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">デフォルト配送先住所</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                お名前
              </label>
              <input
                type="text"
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
                郵便番号
              </label>
              <input
                type="text"
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
                都道府県
              </label>
              <input
                type="text"
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
                市区町村
              </label>
              <input
                type="text"
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
                町名・番地
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="渋谷1-2-3"
                value={shippingAddress.address1}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    address1: e.target.value,
                  })
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
                  setShippingAddress({
                    ...shippingAddress,
                    address2: e.target.value,
                  })
                }
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
                value={shippingAddress.phone}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, phone: e.target.value })
                }
              />
            </div>
          </div>
        </section>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存する'}
        </button>

        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">アカウント設定</h2>
          <div className="space-y-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition text-red-600 font-semibold"
            >
              ログアウト
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
