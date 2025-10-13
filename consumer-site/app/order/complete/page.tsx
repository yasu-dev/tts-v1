import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  searchParams: {
    order?: string;
  };
}

export default async function OrderCompletePage({ searchParams }: PageProps) {
  const orderId = searchParams.order;

  if (!orderId) {
    notFound();
  }

  const supabase = await createClient();

  // Get order details
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      sellers!orders_seller_id_fkey(farm_name),
      order_items(
        *,
        product_skus(
          *,
          products(name)
        )
      )
    `)
    .eq('id', orderId)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4">ご注文ありがとうございます</h1>
        <p className="text-gray-600 mb-8">
          ご注文が確定しました。確認メールをお送りしております。
        </p>

        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">注文番号</h2>
          <p className="text-2xl font-mono text-green-600">
            {order.order_number}
          </p>
        </div>

        {/* 注文詳細 */}
        <div className="bg-white border rounded-lg p-6 mb-6 text-left">
          <h3 className="text-lg font-bold mb-4">注文内容</h3>

          <div className="space-y-3 mb-4">
            {order.order_items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
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
                <span>¥{item.subtotal_yen.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">小計</span>
              <span>¥{order.subtotal_yen.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">送料</span>
              <span>¥{order.shipping_fee_yen.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>合計</span>
              <span className="text-green-600">
                ¥{order.total_amount_yen.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 配送先情報 */}
        {order.shipping_info && (
          <div className="bg-white border rounded-lg p-6 mb-6 text-left">
            <h3 className="text-lg font-bold mb-4">配送先</h3>
            <div className="text-sm space-y-1">
              <p>{order.shipping_info.name}</p>
              <p>〒{order.shipping_info.postal_code}</p>
              <p>
                {order.shipping_info.prefecture} {order.shipping_info.city}
              </p>
              <p>{order.shipping_info.address1}</p>
              {order.shipping_info.address2 && <p>{order.shipping_info.address2}</p>}
              <p>Tel: {order.shipping_info.phone}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Link
            href="/orders"
            className="block w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            注文履歴を見る
          </Link>
          <Link
            href="/"
            className="block w-full border border-green-600 text-green-600 py-3 rounded-lg hover:bg-green-50 transition font-semibold"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
