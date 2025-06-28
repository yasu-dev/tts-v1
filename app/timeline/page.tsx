'use client';

import PageWrapper from '@/app/components/ui/PageWrapper';
import DashboardLayout from '../components/layouts/DashboardLayout';

export default function TimelinePage() {
  return (
    <DashboardLayout userType="seller">
      <PageWrapper
        title="商品履歴"
        description="商品のライフサイクルとすべてのイベントを追跡します。"
        icon="📜"
      >
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-500">商品履歴データは現在空です。</h2>
          <p className="text-gray-400 mt-2">新しいデータが追加されると、ここに表示されます。</p>
        </div>
      </PageWrapper>
    </DashboardLayout>
  );
} 