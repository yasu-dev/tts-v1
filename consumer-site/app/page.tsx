import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  origin: string;
  irregular_reason: string;
  category: string;
  seller_id: string;
  sellers: {
    farm_name: string;
  };
  product_skus: {
    id: string;
    weight_grams: number;
    price_yen: number;
    stock: number;
  }[];
}

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch products with seller info and SKUs
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      sellers!products_seller_id_fkey(farm_name),
      product_skus(id, weight_grams, price_yen, stock)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // エラーハンドリングは適切なロギングサービスで行うべき
  if (error) {
    // TODO: 本番環境では適切なロギングサービスを使用
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          献立ガチャ
        </h1>
        <p className="text-gray-600">
          規格外野菜をお得に購入。農家さんから直送で新鮮です。
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product: any) => {
          const minPrice = Math.min(...product.product_skus.map((sku: any) => sku.price_yen));
          const maxPrice = Math.max(...product.product_skus.map((sku: any) => sku.price_yen));
          const priceDisplay = minPrice === maxPrice ? `¥${minPrice}` : `¥${minPrice} - ¥${maxPrice}`;

          return (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {/* Product Image */}
              <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center overflow-hidden">
                {product.image_urls && product.image_urls.length > 0 ? (
                  <img
                    src={product.image_urls[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">🥬</span>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold">{product.name}</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span>🏪 {product.sellers?.farm_name}</span>
                  <span>📍 {product.origin}</span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div>
                    <div className="text-sm text-gray-500">価格</div>
                    <div className="text-xl font-bold text-green-600">
                      {priceDisplay}
                    </div>
                  </div>
                  <Link
                    href={`/product/${product.id}`}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    詳細
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {products && products.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          現在、商品はありません
        </div>
      )}
    </div>
  );
}
