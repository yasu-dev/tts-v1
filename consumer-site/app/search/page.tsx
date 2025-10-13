'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
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

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('products')
      .select(`
        *,
        sellers!products_seller_id_fkey(farm_name),
        product_skus(id, weight_grams, price_yen, stock)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Filter by category if selected
    if (selectedCategory) {
      query = query.eq('category', selectedCategory);
    }

    // Filter by search query (product name only)
    if (searchQuery.trim()) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      // TODO: 本番環境では適切なロギングサービスを使用
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const supabase = createClient();

    // Get unique categories from products
    const { data } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true);

    if (data) {
      const uniqueCategories = [...new Set(data.map(p => p.category))].filter(Boolean);
      setCategories(uniqueCategories);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">商品検索</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="商品名で検索..."
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">カテゴリー</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 border rounded-full transition ${
              selectedCategory === ''
                ? 'bg-green-600 text-white border-green-600'
                : 'hover:bg-green-50 hover:border-green-600'
            }`}
          >
            すべて
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 border rounded-full transition ${
                selectedCategory === category
                  ? 'bg-green-600 text-white border-green-600'
                  : 'hover:bg-green-50 hover:border-green-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          読み込み中...
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            {products.length}件の商品が見つかりました
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const minPrice = Math.min(...product.product_skus.map((sku) => sku.price_yen));
              const maxPrice = Math.max(...product.product_skus.map((sku) => sku.price_yen));
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

          {products.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              検索条件に一致する商品が見つかりませんでした
            </div>
          )}
        </>
      )}
    </div>
  );
}
