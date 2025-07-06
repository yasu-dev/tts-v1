import { Metadata } from 'next';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import InspectionForm from '@/app/components/features/inspection/InspectionForm';

export const metadata: Metadata = {
  title: '商品検品 - THE WORLD DOOR',
  description: '商品の検品チェックリスト',
};

interface PageProps {
  params: {
    productId: string;
  };
}

export default function InspectionPage({ params }: PageProps) {
  return (
    <DashboardLayout userType="staff">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1600px] mx-auto p-4 md:p-6">
          {/* タブレット最適化：大きめのタイトル */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              商品検品チェックリスト
            </h1>
            <p className="text-gray-600 mt-2">
              商品ID: {params.productId}
            </p>
          </div>

          {/* 検品フォーム */}
          <InspectionForm productId={params.productId} />
        </div>
      </div>
    </DashboardLayout>
  );
} 