import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductPurchaseForm from './ProductPurchaseForm';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const supabase = await createClient();

  // Fetch product with seller info and SKUs
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      sellers!products_seller_id_fkey(
        user_id,
        farm_name,
        introduction,
        prefecture,
        city,
        phone
      ),
      product_skus(*)
    `)
    .eq('id', params.id)
    .eq('is_active', true)
    .single();

  if (error || !product) {
    notFound();
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
        >
          ← 商品一覧に戻る
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Product Image */}
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center h-96 overflow-hidden">
              {product.image_urls && product.image_urls.length > 0 ? (
                <img
                  src={product.image_urls[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-8xl">🥬</span>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                  <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
                    {product.category}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{product.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">産地：</span>
                  <span>{product.origin}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">規格外理由：</span>
                  <span>{product.irregular_reason}</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="border-t border-b border-gray-200 py-4 mb-6">
                <h3 className="font-semibold mb-2">出品者情報</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">農園名：</span>
                    <span>{product.sellers?.farm_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">所在地：</span>
                    <span>{product.sellers?.prefecture} {product.sellers?.city}</span>
                  </div>
                  {product.sellers?.introduction && (
                    <p className="text-gray-600 mt-2">{product.sellers.introduction}</p>
                  )}
                </div>
              </div>

              {/* Chat Button */}
              {user && (
                <Link
                  href={`/chat/${product.seller_id}`}
                  className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded mb-4 hover:bg-gray-200 transition"
                >
                  💬 出品者にチャットで質問
                </Link>
              )}

              {/* Purchase Form */}
              {user ? (
                <ProductPurchaseForm
                  productId={product.id}
                  productName={product.name}
                  sellerId={product.seller_id}
                  skus={product.product_skus}
                />
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
                  <p className="text-sm text-gray-700 mb-2">
                    購入するにはログインが必要です
                  </p>
                  <Link
                    href="/login"
                    className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                  >
                    ログイン
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
