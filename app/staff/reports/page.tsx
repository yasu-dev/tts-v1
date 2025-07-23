'use client';

import React from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowDownTrayIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

interface WorkloadData {
  staff: string;
  tasksCompleted: number;
  tasksInProgress: number;
  avgCompletionTime: number;
  efficiency: number;
}

interface PerformanceData {
  date: string;
  inspections: number;
  listings: number;
  shipments: number;
  issues: number;
}

export default function BusinessReportsPage() {
  const { showToast } = useToast();
  const reportModalRef = useRef<HTMLDivElement>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const performanceRef = useRef<HTMLDivElement>(null);

  const scrollToPerformance = () => {
    performanceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const headerActions = (
    <React.Fragment>
      <button
        onClick={() => setIsReportModalOpen(true)}
        className="nexus-button"
      >
        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
        カスタム業務レポート作成
      </button>
      <button
        onClick={scrollToPerformance}
        className="nexus-button primary"
      >
        <ChartBarIcon className="w-5 h-5 mr-2" />
        パフォーマンス分析
      </button>
    </React.Fragment>
  );

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        <UnifiedPageHeader
          title="業務レポート"
          subtitle="業務フロー全体の可視化と効率性分析"
          userType="staff"
          iconType="reports"
          actions={headerActions}
        />
        <div className="p-8">
          <h1>レポートページ</h1>
          <p>テスト中...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}