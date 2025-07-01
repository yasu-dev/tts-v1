'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import DeliveryPlanWizard from '@/app/components/features/delivery-plan/DeliveryPlanWizard';

export default function DeliveryPlanPageClient() {
  return (
    <DashboardLayout userType="seller">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">納品プラン作成</h1>
          <p className="text-gray-600">商品の納品プランを作成し、バーコードラベルを発行します</p>
        </div>
        <DeliveryPlanWizard />
      </div>
    </DashboardLayout>
  );
} 