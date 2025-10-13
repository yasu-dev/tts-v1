import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function OrdersPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      sellers!orders_seller_id_fkey(farm_name),
      order_items(
        *,
        product_skus(
          *,
          products(name, category)
        )
      )
    `
    )
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  // エラーハンドリングは適切なロギングサービスで行うべき
  if (error) {
    // TODO: 本番環境では適切なロギングサービスを使用
  }

  const statusLabels: Record<string, string> = {
    pending: '処理中',
    paid: '支払い済み',
    shipped: '発送済み',
    delivered: '配達完了',
    canceled: 'キャンセル',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-purple-100 text-purple-800',
    canceled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">注文履歴</h1>

        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      注文番号: {order.order_number}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleString('ja-JP')}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      statusColors[order.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    出品者: {order.sellers?.farm_name}
                  </div>
                  <div className="space-y-2">
                    {order.order_items.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <div>
                          <span className="font-medium">
                            {item.product_skus?.products?.name}
                          </span>
                          <span className="text-gray-600 ml-2">
                            {item.product_skus?.weight_grams >= 1000
                              ? `${item.product_skus.weight_grams / 1000}kg`
                              : `${item.product_skus.weight_grams}g`}{' '}
                            × {item.quantity}
                          </span>
                        </div>
                        <span className="font-semibold">
                          ¥{item.subtotal_yen.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-gray-600">合計金額</span>
                  <span className="text-xl font-bold text-green-600">
                    ¥{order.total_amount_yen.toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-gray-600 mb-6">まだ注文がありません</p>
            <Link
              href="/"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              商品を探す
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
