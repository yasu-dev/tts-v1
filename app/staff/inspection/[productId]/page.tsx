'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import InspectionChecklist from '@/app/components/features/inspection/InspectionChecklist';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model: string;
  status: string;
}

export default function InspectionPage() {
  const params = useParams();
  const productId = params.productId as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 商品情報を取得（デモ用のモックデータ）
    setLoading(true);
    setTimeout(() => {
      setProduct({
        id: productId,
        name: 'Canon EOS R5',
        sku: `TWD-${productId}`,
        category: 'camera_body',
        brand: 'Canon',
        model: 'EOS R5',
        status: 'pending_inspection',
      });
      setLoading(false);
    }, 500);
  }, [productId]);

  return (
    <DashboardLayout userType="staff">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* タブレット最適化：ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            商品検品
          </h1>
          <p className="text-gray-600 mt-2">
            商品の状態を詳しく検査し、写真を撮影してください
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
          </div>
        ) : product ? (
          <InspectionChecklist product={product} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">商品が見つかりません</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 