import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch order with items
  const { data: order, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      sellers!orders_seller_id_fkey(farm_name),
      order_items(
        *,
        product_skus(
          *,
          products(name, category, origin)
        )
      )
    `
    )
    .eq('id', params.id)
    .eq('buyer_id', user.id)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">
            ご注文ありがとうございます！
          </h1>
          <p className="text-green-700">
            注文が完了しました。確認メールをお送りしました。
            <br />
            <span className="text-sm">（デモのため実際のメールは送信されません）</span>
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">注文詳細</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">注文番号</span>
              <span className="font-mono">{order.order_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">注文日時</span>
              <span>{new Date(order.created_at).toLocaleString('ja-JP')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ステータス</span>
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                {order.status === 'paid' ? '支払い済み' : order.status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">出品者</span>
              <span>{order.sellers?.farm_name}</span>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t pt-4 mb-4">
            <h3 className="font-semibold mb-3">商品</h3>
            {order.order_items.map((item: any) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-3 border-b last:border-b-0"
              >
                <div>
                  <div className="font-medium">
                    {item.product_skus?.products?.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.product_skus?.weight_grams >= 1000
                      ? `${item.product_skus.weight_grams / 1000}kg`
                      : `${item.product_skus.weight_grams}g`}{' '}
                    × {item.quantity}個
                  </div>
                </div>
                <div className="font-semibold">
                  ¥{item.subtotal_yen.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">小計</span>
              <span>¥{order.subtotal_yen.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">送料</span>
              <span>¥{order.shipping_fee_yen.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>合計</span>
              <span className="text-green-600">
                ¥{order.total_amount_yen.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Shipping Info */}
          {order.shipping_info && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3">配送先</h3>
              <div className="text-sm space-y-1 text-gray-700">
                <div>{order.shipping_info.name}</div>
                <div>
                  〒{order.shipping_info.postal_code} {order.shipping_info.prefecture}{' '}
                  {order.shipping_info.city}
                </div>
                <div>{order.shipping_info.address1}</div>
                <div>電話: {order.shipping_info.phone}</div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/orders"
            className="flex-1 text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            注文履歴を見る
          </Link>
          <Link
            href="/"
            className="flex-1 text-center bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
