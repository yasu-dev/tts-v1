'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SKU {
  id: string;
  weight_grams: number;
  price_yen: number;
  stock: number;
  shipping_method: string;
}

interface ProductPurchaseFormProps {
  productId: string;
  productName: string;
  sellerId: string;
  skus: SKU[];
}

export default function ProductPurchaseForm({
  productId,
  productName,
  sellerId,
  skus,
}: ProductPurchaseFormProps) {
  const [selectedSkuId, setSelectedSkuId] = useState(skus[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [shippingFee, setShippingFee] = useState(800); // デフォルト値
  const router = useRouter();

  const selectedSku = skus.find((sku) => sku.id === selectedSkuId);

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

  const handleShowConfirmation = () => {
    if (!selectedSku) {
      setError('商品を選択してください');
      return;
    }

    if (quantity > selectedSku.stock) {
      setError('在庫が足りません');
      return;
    }

    setError('');
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sku_id: selectedSkuId,
          quantity,
          seller_id: sellerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '購入に失敗しました');
      }

      // Redirect to order confirmation page
      router.push(`/orders/${data.order.id}`);
    } catch (err: any) {
      // TODO: 本番環境では適切なロギングサービスを使用
      setError(err.message || '購入に失敗しました');
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = selectedSku ? selectedSku.price_yen * quantity : 0;

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* SKU Selection */}
      <div>
        <label className="block text-sm font-semibold mb-2">サイズ・重量</label>
        <select
          value={selectedSkuId}
          onChange={(e) => setSelectedSkuId(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          disabled={loading}
        >
          {skus.map((sku) => (
            <option key={sku.id} value={sku.id}>
              {sku.weight_grams >= 1000
                ? `${sku.weight_grams / 1000}kg`
                : `${sku.weight_grams}g`}{' '}
              - ¥{sku.price_yen.toLocaleString()} ({sku.shipping_method})
              {sku.stock === 0 && ' - 在庫なし'}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity Selection */}
      <div>
        <label className="block text-sm font-semibold mb-2">数量</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 border rounded hover:bg-gray-100"
            disabled={loading || quantity <= 1}
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 px-3 py-1 border rounded text-center"
            min="1"
            max={selectedSku?.stock || 1}
            disabled={loading}
          />
          <button
            onClick={() =>
              setQuantity(Math.min(selectedSku?.stock || 1, quantity + 1))
            }
            className="px-3 py-1 border rounded hover:bg-gray-100"
            disabled={loading || quantity >= (selectedSku?.stock || 1)}
          >
            +
          </button>
          <span className="text-sm text-gray-500 ml-2">
            在庫: {selectedSku?.stock || 0}個
          </span>
        </div>
      </div>

      {/* Price Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">商品価格</span>
          <span className="font-semibold">
            ¥{(selectedSku?.price_yen || 0).toLocaleString()} × {quantity}
          </span>
        </div>
        <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
          <span>合計</span>
          <span className="text-green-600">¥{totalPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Purchase Button */}
      <button
        onClick={handleShowConfirmation}
        disabled={loading || !selectedSku || selectedSku.stock === 0}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        購入する
      </button>

      <p className="text-xs text-gray-500 text-center">
        ※ これはデモです。実際の決済は行われません。
      </p>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">購入内容の確認</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">商品名</span>
                <span className="font-medium">{productName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">サイズ</span>
                <span className="font-medium">
                  {selectedSku && selectedSku.weight_grams >= 1000
                    ? `${selectedSku.weight_grams / 1000}kg`
                    : `${selectedSku?.weight_grams}g`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">数量</span>
                <span className="font-medium">{quantity}個</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">配送方法</span>
                <span className="font-medium">{selectedSku?.shipping_method}</span>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">商品価格</span>
                  <span>¥{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">送料</span>
                  <span>¥{shippingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>合計金額</span>
                  <span className="text-green-600">
                    ¥{(totalPrice + shippingFee).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p className="text-sm text-gray-700">
                この内容で購入します。よろしいですか？
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? '処理中...' : '購入を確定する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
