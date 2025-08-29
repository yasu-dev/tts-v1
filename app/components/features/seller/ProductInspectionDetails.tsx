'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon } from '@heroicons/react/24/solid';
import { useIsHierarchicalChecklistEnabled } from '@/lib/hooks/useHierarchicalChecklistFeature';

interface ProductInspectionDetailsProps {
  productId: string;
  status: string;
}

interface InspectionItem {
  key: string;
  label: string;
  value: boolean | string | null;
  category: string;
}

interface InspectionData {
  items: InspectionItem[];
  notes: string;
  inspectedBy?: string;
  inspectedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  isHierarchical?: boolean;
}

// 既存システムの検品項目定義
const STANDARD_INSPECTION_ITEMS = [
  { key: 'scratches', label: '傷', category: '外観' },
  { key: 'dents', label: '凹み', category: '外観' },
  { key: 'discoloration', label: 'スレ', category: '外観' },
  { key: 'dust', label: '汚れ', category: '外観' },
  { key: 'powerOn', label: '作動', category: '機能' },
  { key: 'allButtonsWork', label: '不動', category: '機能' },
  { key: 'screenDisplay', label: 'クモリ', category: '機能' },
  { key: 'connectivity', label: 'カビ', category: '機能' },
  { key: 'lensClarity', label: 'チリホコリ', category: '光学系' },
  { key: 'aperture', label: 'キズ', category: '光学系' },
  { key: 'focusAccuracy', label: 'バッテリー', category: '付属品' },
  { key: 'stabilization', label: 'ケース', category: '付属品' },
];

// 階層型検品項目定義（主要項目のみ）
const HIERARCHICAL_INSPECTION_CATEGORIES = [
  {
    id: 'camera_body_exterior',
    name: 'カメラボディ外観',
    items: [
      { id: 'body_scratches', name: '傷' },
      { id: 'body_scuffs', name: 'スレ' },
      { id: 'body_dents', name: '凹み' },
      { id: 'body_cracks', name: 'ひび' },
      { id: 'body_breaks', name: '割れ' },
      { id: 'body_paint_peeling', name: '塗装剥がれ' },
      { id: 'body_dirt', name: '汚れ' },
      { id: 'body_stickiness', name: 'ベタつき' },
      { id: 'body_other', name: 'その他' },
    ],
  },
  {
    id: 'viewfinder',
    name: 'ファインダー',
    items: [
      { id: 'vf_mold', name: 'カビ' },
      { id: 'vf_dust', name: 'ホコリ' },
      { id: 'vf_scratches', name: '傷' },
      { id: 'vf_dirt', name: '汚れ' },
      { id: 'vf_fog', name: 'クモリ' },
      { id: 'vf_corrosion', name: '腐食' },
      { id: 'vf_balsam_separation', name: 'バルサム切れ' },
    ],
  },
  {
    id: 'film_chamber',
    name: 'フィルム室',
    items: [
      { id: 'fc_interior_condition', name: 'フィルム室内部の状況' },
      { id: 'fc_light_seal_deterioration', name: 'モルトの劣化' },
      { id: 'fc_shutter_curtain_operation', name: 'シャッター幕動作' },
    ],
  },
  {
    id: 'lens',
    name: 'レンズ',
    items: [
      { id: 'lens_mold', name: 'カビ' },
      { id: 'lens_dust', name: 'ホコリ' },
      { id: 'lens_scratches', name: '傷' },
      { id: 'lens_dirt', name: '汚れ' },
      { id: 'lens_fog', name: 'クモリ' },
    ],
  },
];

export default function ProductInspectionDetails({ productId, status }: ProductInspectionDetailsProps) {
  const [inspectionData, setInspectionData] = useState<InspectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isHierarchicalEnabled = useIsHierarchicalChecklistEnabled();

  useEffect(() => {
    fetchInspectionData();
  }, [productId]);

  const fetchInspectionData = async () => {
    try {
      setLoading(true);
      
      // 既存の検品チェックリストを取得
      const checklistResponse = await fetch(`/api/products/${productId}/inspection-checklist`);
      
      if (checklistResponse.ok) {
        const checklistData = await checklistResponse.json();
        
        if (isHierarchicalEnabled) {
          // 階層型検品データを処理
          processHierarchicalData(checklistData);
        } else {
          // 既存システムデータを処理
          processStandardData(checklistData);
        }
      } else {
        // 検品データが存在しない場合、空の項目リストを作成
        createEmptyInspectionData();
      }
    } catch (error) {
      console.error('検品データ取得エラー:', error);
      setError('検品データの取得に失敗しました');
      createEmptyInspectionData();
    } finally {
      setLoading(false);
    }
  };

  const processHierarchicalData = (data: any) => {
    const items: InspectionItem[] = [];
    
    if (data?.hierarchicalInspectionChecklist?.responses) {
      // 階層型データを展開
      HIERARCHICAL_INSPECTION_CATEGORIES.forEach(category => {
        category.items.forEach(item => {
          const responseData = data.hierarchicalInspectionChecklist.responses[category.id]?.[item.id];
          items.push({
            key: `${category.id}_${item.id}`,
            label: item.name,
            value: responseData ? (responseData.booleanValue ?? responseData.textValue ?? null) : null,
            category: category.name,
          });
        });
      });
    } else {
      // データがない場合は空の項目を作成
      HIERARCHICAL_INSPECTION_CATEGORIES.forEach(category => {
        category.items.forEach(item => {
          items.push({
            key: `${category.id}_${item.id}`,
            label: item.name,
            value: null,
            category: category.name,
          });
        });
      });
    }

    setInspectionData({
      items,
      notes: data?.hierarchicalInspectionChecklist?.notes || '',
      inspectedBy: data?.createdBy,
      inspectedAt: data?.createdAt,
      verifiedBy: data?.hierarchicalInspectionChecklist?.verifiedBy,
      verifiedAt: data?.hierarchicalInspectionChecklist?.verifiedAt,
      isHierarchical: true,
    });
  };

  const processStandardData = (data: any) => {
    const items: InspectionItem[] = [];
    
    // 既存システムデータを処理
    STANDARD_INSPECTION_ITEMS.forEach(item => {
      let value = null;
      
      if (data) {
        // データマッピング（プロパティ名を調整）
        switch (item.key) {
          case 'scratches':
            value = data.hasScratches;
            break;
          case 'dents':
            value = data.hasDents;
            break;
          case 'discoloration':
            value = data.hasDiscoloration;
            break;
          case 'dust':
            value = data.hasDust;
            break;
          case 'powerOn':
            value = data.powerOn;
            break;
          case 'allButtonsWork':
            value = data.allButtonsWork;
            break;
          case 'screenDisplay':
            value = data.screenDisplay;
            break;
          case 'connectivity':
            value = data.connectivity;
            break;
          case 'lensClarity':
            value = data.lensClarity;
            break;
          case 'aperture':
            value = data.aperture;
            break;
          case 'focusAccuracy':
            value = data.focusAccuracy;
            break;
          case 'stabilization':
            value = data.stabilization;
            break;
          default:
            value = null;
        }
      }
      
      items.push({
        key: item.key,
        label: item.label,
        value: value,
        category: item.category,
      });
    });

    setInspectionData({
      items,
      notes: data?.notes || '',
      inspectedBy: data?.createdBy,
      inspectedAt: data?.createdAt,
      verifiedBy: data?.verifiedBy,
      verifiedAt: data?.verifiedAt,
      isHierarchical: false,
    });
  };

  const createEmptyInspectionData = () => {
    const items: InspectionItem[] = [];
    
    if (isHierarchicalEnabled) {
      // 階層型の空データ
      HIERARCHICAL_INSPECTION_CATEGORIES.forEach(category => {
        category.items.forEach(item => {
          items.push({
            key: `${category.id}_${item.id}`,
            label: item.name,
            value: null,
            category: category.name,
          });
        });
      });
    } else {
      // 既存システムの空データ
      STANDARD_INSPECTION_ITEMS.forEach(item => {
        items.push({
          key: item.key,
          label: item.label,
          value: null,
          category: item.category,
        });
      });
    }

    setInspectionData({
      items,
      notes: '',
      isHierarchical: isHierarchicalEnabled,
    });
  };

  const renderInspectionValue = (value: boolean | string | null) => {
    if (value === null || value === undefined) {
      return <MinusCircleIcon className="w-4 h-4 text-gray-400" />;
    }
    
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircleIcon className="w-4 h-4 text-green-500" />
      ) : (
        <XCircleIcon className="w-4 h-4 text-red-500" />
      );
    }
    
    if (typeof value === 'string') {
      return value.trim() ? (
        <span className="text-sm text-gray-700 max-w-xs truncate">{value}</span>
      ) : (
        <MinusCircleIcon className="w-4 h-4 text-gray-400" />
      );
    }
    
    return <MinusCircleIcon className="w-4 h-4 text-gray-400" />;
  };

  const getStatusBasedMessage = () => {
    if (status === 'inbound' || status === 'pending_inspection') {
      return '検品前のため、まだ項目は登録されていません';
    }
    if (status === 'inspecting') {
      return '検品中のため、一部項目が未登録の可能性があります';
    }
    if (status === 'completed' || status === 'storage') {
      return '検品完了済み';
    }
    return '検品状況を確認中';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>検品項目</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>検品項目</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categorizedItems = inspectionData?.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InspectionItem[]>) || {};

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>検品項目</CardTitle>
          <div className="flex items-center gap-2">
            {inspectionData?.isHierarchical && (
              <Badge variant="secondary" className="text-xs">階層型</Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {getStatusBasedMessage()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(categorizedItems).map(([category, items]) => (
          <div key={category}>
            <h4 className="font-semibold text-sm text-gray-700 mb-3 border-b pb-1">
              {category}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  <div className="flex items-center">
                    {renderInspectionValue(item.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {inspectionData?.notes && (
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">メモ</h4>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {inspectionData.notes}
              </p>
            </div>
          </div>
        )}

        {inspectionData?.inspectedBy && (
          <div className="text-xs text-gray-500 border-t pt-3">
            検品者: {inspectionData.inspectedBy}
            {inspectionData.inspectedAt && (
              <span> | {new Date(inspectionData.inspectedAt).toLocaleDateString('ja-JP')}</span>
            )}
            {inspectionData.verifiedBy && (
              <span> | 確認者: {inspectionData.verifiedBy}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
