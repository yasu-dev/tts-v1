'use client';

import { useState } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import HierarchicalInspectionChecklistInput, { 
  HierarchicalInspectionData 
} from '@/app/components/features/inspection/HierarchicalInspectionChecklistInput';

/**
 * 新しい階層型検品チェックリストの安全テストページ
 * データベースに影響を与えずにUI動作を確認
 */
export default function HierarchicalChecklistTestPage() {
  const [testData, setTestData] = useState<HierarchicalInspectionData>({
    responses: {},
    notes: '',
  });

  const [isReadOnly, setIsReadOnly] = useState(false);

  const handleDataChange = (newData: HierarchicalInspectionData) => {
    console.log('[TEST] データ変更:', newData);
    setTestData(newData);
  };

  const handleSaveTest = async () => {
    console.log('[TEST] 実際のAPIに保存テスト開始:', JSON.stringify(testData, null, 2));
    
    try {
      const response = await fetch('/api/hierarchical-inspection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: null, // テスト用
          deliveryPlanProductId: null, // テスト用  
          createdBy: 'test-user', // テスト用
          responses: testData.responses,
          notes: testData.notes
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ 新システムAPIで保存成功！\nID: ${result.data?.id}\n詳細はコンソールで確認`);
        console.log('[TEST] API保存成功:', result);
      } else {
        alert(`❌ API保存エラー: ${result.error}`);
        console.error('[TEST] API保存エラー:', result);
      }
    } catch (error) {
      alert(`❌ API接続エラー: ${error}`);
      console.error('[TEST] API接続エラー:', error);
    }
  };

  const handleLoadSampleData = () => {
    const sampleData: HierarchicalInspectionData = {
      responses: {
        camera_body_exterior: {
          body_scratches: { booleanValue: true },
          body_dirt: { booleanValue: true },
          body_other: { textValue: 'カメラボディの角に小さな打痕あり' },
        },
        viewfinder: {
          vf_dust: { booleanValue: true },
        },
        optical: {
          opt_dust_particles: { booleanValue: true },
          opt_other: { textValue: 'レンズ内側に小さなホコリが数点あり' },
        },
        accessories: {
          acc_battery: { booleanValue: true },
          acc_case: { booleanValue: true },
        },
        other: {
          other_general: { textValue: '全体的に使用感はあるが動作は良好' },
        },
      },
      notes: 'テスト用のサンプルデータです。各カテゴリの動作を確認できます。',
    };
    setTestData(sampleData);
  };

  const handleResetData = () => {
    setTestData({
      responses: {},
      notes: '',
    });
  };

  const handleCreateTestData = async () => {
    console.log('[TEST] APIテストデータ作成開始');
    
    try {
      const response = await fetch('/api/hierarchical-inspection/test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ 新システムAPIテストデータ作成成功！\n${result.message}\n詳細はコンソールで確認`);
        console.log('[TEST] APIテストデータ作成成功:', result);
      } else {
        alert(`❌ APIテストデータ作成エラー: ${result.error}`);
        console.error('[TEST] APIテストデータ作成エラー:', result);
      }
    } catch (error) {
      alert(`❌ API接続エラー: ${error}`);
      console.error('[TEST] API接続エラー:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-nexus-text-primary">
              階層型検品チェックリスト - 安全テスト
            </h1>
            <p className="text-nexus-text-secondary mt-2">
              新しい階層型システムのUI動作テスト（データベース影響なし）
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <NexusButton
              onClick={handleCreateTestData}
              variant="primary"
              size="sm"
            >
              APIテストデータ作成
            </NexusButton>
            <NexusButton
              onClick={handleLoadSampleData}
              variant="outline"
              size="sm"
            >
              サンプルデータ
            </NexusButton>
            <NexusButton
              onClick={handleResetData}
              variant="outline"
              size="sm"
            >
              リセット
            </NexusButton>
            <NexusButton
              onClick={() => setIsReadOnly(!isReadOnly)}
              variant="outline"
              size="sm"
            >
              {isReadOnly ? '編集モード' : '読み取り専用'}
            </NexusButton>
          </div>
        </div>

        {/* 統計表示 */}
        <NexusCard className="p-4">
          <h3 className="text-lg font-semibold mb-3">テスト状況</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">入力済みカテゴリ:</span>
              <span className="ml-2">
                {Object.keys(testData.responses).length} カテゴリ
              </span>
            </div>
            <div>
              <span className="font-medium">入力済み項目:</span>
              <span className="ml-2">
                {Object.values(testData.responses).reduce(
                  (total, category) => total + Object.keys(category).length,
                  0
                )} 項目
              </span>
            </div>
            <div>
              <span className="font-medium">モード:</span>
              <span className="ml-2">
                {isReadOnly ? '読み取り専用' : '編集可能'}
              </span>
            </div>
          </div>
        </NexusCard>

        {/* 新システムテスト */}
        <NexusCard className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-nexus-text-primary">
              新階層型検品チェックリスト
            </h3>
            <p className="text-sm text-nexus-text-secondary">
              8大項目37+小項目の新システム（「その他」入力フォーム対応）
            </p>
          </div>

          <HierarchicalInspectionChecklistInput
            data={testData}
            onChange={handleDataChange}
            readOnly={isReadOnly}
          />
        </NexusCard>

        {/* データ表示 */}
        <NexusCard className="p-4">
          <h3 className="text-lg font-semibold mb-3">現在のデータ構造</h3>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </NexusCard>

        {/* 保存テスト */}
        <div className="flex gap-3">
          <NexusButton
            onClick={handleSaveTest}
            variant="primary"
            disabled={isReadOnly}
          >
            実際のAPIに保存テスト
          </NexusButton>
          <NexusButton
            onClick={() => window.history.back()}
            variant="outline"
          >
            戻る
          </NexusButton>
        </div>
      </div>
    </DashboardLayout>
  );
}
