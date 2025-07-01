'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import StatusIndicator from '@/app/components/ui/StatusIndicator';

interface ChecklistItem {
  id: string;
  label: string;
  type: 'boolean' | 'rating' | 'measurement';
  required: boolean;
  value?: any;
  notes?: string;
}

interface ChecklistCategory {
  name: string;
  items: ChecklistItem[];
}

interface ChecklistTemplate {
  id: string;
  name: string;
  categories: ChecklistCategory[];
}

interface InspectionTask {
  id: string;
  title: string;
  productId: string;
  productName: string;
  type: 'camera' | 'watch' | 'lens' | 'accessory';
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  location: string;
  value: string;
  category: string;
}

interface InspectionData {
  checklistTemplates: {
    [key: string]: ChecklistTemplate;
  };
  inspectionHistory: any[];
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model: string;
  status: 'pending_inspection' | 'inspecting' | 'completed' | 'failed';
  receivedDate: string;
  priority: 'high' | 'normal' | 'low';
  imageUrl?: string;
}

// モックデータ（実際はAPIから取得）
const mockProducts: Product[] = [
  {
    id: '001',
    name: 'Canon EOS R5 ボディ',
    sku: 'TWD-2024-001',
    category: 'camera_body',
    brand: 'Canon',
    model: 'EOS R5',
    status: 'pending_inspection',
    receivedDate: '2024-01-20',
    priority: 'high',
    imageUrl: '/api/placeholder/150/150',
  },
  {
    id: '002',
    name: 'Sony FE 24-70mm F2.8 GM',
    sku: 'TWD-2024-002',
    category: 'lens',
    brand: 'Sony',
    model: 'SEL2470GM',
    status: 'inspecting',
    receivedDate: '2024-01-19',
    priority: 'normal',
    imageUrl: '/api/placeholder/150/150',
  },
  {
    id: '003',
    name: 'Nikon Z9 ボディ',
    sku: 'TWD-2024-003',
    category: 'camera_body',
    brand: 'Nikon',
    model: 'Z9',
    status: 'completed',
    receivedDate: '2024-01-18',
    priority: 'normal',
    imageUrl: '/api/placeholder/150/150',
  },
  {
    id: '004',
    name: 'Canon RF 50mm F1.2L USM',
    sku: 'TWD-2024-004',
    category: 'lens',
    brand: 'Canon',
    model: 'RF50mm F1.2',
    status: 'pending_inspection',
    receivedDate: '2024-01-20',
    priority: 'low',
    imageUrl: '/api/placeholder/150/150',
  },
];

export default function InspectionPage() {
  const [inspectionData, setInspectionData] = useState<InspectionData | null>(null);
  const [activeTask, setActiveTask] = useState<InspectionTask | null>(null);
  const [currentChecklist, setCurrentChecklist] = useState<ChecklistTemplate | null>(null);
  const [completedItems, setCompletedItems] = useState<{[key: string]: any}>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusConfig = {
    pending_inspection: { label: '検品待ち', status: 'warning' as const, color: 'bg-yellow-100 text-yellow-800' },
    inspecting: { label: '検品中', status: 'warning' as const, color: 'bg-blue-100 text-blue-800' },
    completed: { label: '完了', status: 'optimal' as const, color: 'bg-green-100 text-green-800' },
    failed: { label: '不合格', status: 'critical' as const, color: 'bg-red-100 text-red-800' },
  };

  const priorityConfig = {
    high: { label: '高', color: 'bg-red-100 text-red-800' },
    normal: { label: '中', color: 'bg-yellow-100 text-yellow-800' },
    low: { label: '低', color: 'bg-gray-100 text-gray-800' },
  };

  const categoryLabels = {
    camera_body: 'カメラボディ',
    lens: 'レンズ',
    accessory: 'アクセサリー',
    watch: '時計',
  };

  // ステータス別にグループ化
  const groupedProducts = mockProducts.reduce((acc, product) => {
    if (!acc[product.status]) {
      acc[product.status] = [];
    }
    acc[product.status].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  useEffect(() => {
    fetch('/api/staff/dashboard')
      .then(res => res.json())
      .then(data => {
        setInspectionData(data.inspectionData);
      })
      .catch(console.error);
  }, []);

  const handleStartInspection = (task: InspectionTask) => {
    setActiveTask(task);
    
    // Select appropriate checklist template
    const templateKey = task.type === 'camera' || task.type === 'lens' ? 'camera' : 
                       task.type === 'watch' ? 'watch' : 'camera';
    
    if (inspectionData?.checklistTemplates[templateKey]) {
      setCurrentChecklist(inspectionData.checklistTemplates[templateKey]);
    }
    
    setCompletedItems({});
    setPhotos([]);
    setNotes('');
  };

  const handleItemComplete = (categoryIndex: number, itemIndex: number, value: any) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setCompletedItems(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePhotoUpload = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files);
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteInspection = () => {
    if (!activeTask || !currentChecklist) return;
    
    // Calculate completion percentage
    const totalRequired = currentChecklist.categories
      .flatMap(cat => cat.items.filter(item => item.required)).length;
    const completedRequired = Object.keys(completedItems).filter(key => {
      const [catIndex, itemIndex] = key.split('-').map(Number);
      const item = currentChecklist.categories[catIndex]?.items[itemIndex];
      return item?.required && completedItems[key] !== undefined;
    }).length;

    if (completedRequired < totalRequired) {
      alert('必須項目がすべて完了していません。');
      return;
    }

    // Save inspection result (in real app, would call API)
    alert('検品が完了しました！');
    setActiveTask(null);
    setCurrentChecklist(null);
  };

  if (!inspectionData) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <div className="intelligence-card global">
            <div className="p-8">
              <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                検品管理
              </h1>
              <p className="mt-1 text-sm text-nexus-text-secondary">
                データを読み込み中...
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-nexus-text-secondary">データを読み込み中...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  検品管理
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  商品の検品状況を確認し、検品作業を実施します
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="nexus-button">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  レポート出力
                </button>
                <button className="nexus-button primary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  バッチ検品開始
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="intelligence-card americas">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb yellow">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge warning">待機中</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {groupedProducts.pending_inspection?.length || 0}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  検品待ち
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb blue">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="status-badge info">進行中</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {groupedProducts.inspecting?.length || 0}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  検品中
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb green">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge success">完了</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {groupedProducts.completed?.length || 0}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  完了
                </div>
              </div>
            </div>

            <div className="intelligence-card africa">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb red">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge danger">要対応</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {groupedProducts.failed?.length || 0}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  不合格
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 検品待ちリスト（優先） */}
        {groupedProducts.pending_inspection && groupedProducts.pending_inspection.length > 0 && (
          <div className="intelligence-card global">
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-display font-bold text-nexus-text-primary flex items-center">
                  <span className="w-3 h-3 bg-nexus-yellow rounded-full mr-2 animate-pulse"></span>
                  優先検品商品
                </h2>
                <p className="text-sm text-nexus-text-secondary mt-1">
                  緊急度の高い商品から検品を開始してください
                </p>
              </div>
              <div className="holo-table">
                <table className="w-full">
                  <thead className="holo-header">
                    <tr>
                      <th className="text-left py-3 px-4">商品情報</th>
                      <th className="text-left py-3 px-4">SKU</th>
                      <th className="text-left py-3 px-4">カテゴリー</th>
                      <th className="text-left py-3 px-4">受領日</th>
                      <th className="text-center py-3 px-4">優先度</th>
                      <th className="text-center py-3 px-4">アクション</th>
                    </tr>
                  </thead>
                  <tbody className="holo-body">
                    {groupedProducts.pending_inspection.map((product) => (
                      <tr key={product.id} className="holo-row">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.imageUrl || '/api/placeholder/60/60'}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                              <p className="font-medium text-nexus-text-primary">{product.name}</p>
                              <p className="text-sm text-nexus-text-secondary">{product.brand} | {product.model}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono text-sm">{product.sku}</td>
                        <td className="py-4 px-4 text-sm">{categoryLabels[product.category as keyof typeof categoryLabels]}</td>
                        <td className="py-4 px-4 text-sm">{product.receivedDate}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`status-badge ${
                            product.priority === 'high' ? 'danger' :
                            product.priority === 'normal' ? 'warning' :
                            'info'
                          }`}>
                            {priorityConfig[product.priority].label}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Link href={`/staff/inspection/${product.id}`}>
                            <button className="nexus-button primary">
                              検品開始
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* その他のステータス */}
        {Object.entries(groupedProducts).map(([status, products]) => {
          if (status === 'pending_inspection' || products.length === 0) return null;
          
          const cardVariant = status === 'inspecting' ? 'europe' :
                             status === 'completed' ? 'asia' :
                             'africa';
          
          return (
            <div key={status} className={`intelligence-card ${cardVariant}`}>
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-display font-bold text-nexus-text-primary flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${
                      status === 'inspecting' ? 'bg-nexus-blue' :
                      status === 'completed' ? 'bg-nexus-green' :
                      'bg-nexus-red'
                    }`}></span>
                    {statusConfig[status as keyof typeof statusConfig].label}
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="holo-card p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.imageUrl || '/api/placeholder/60/60'}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-medium text-nexus-text-primary">{product.name}</h3>
                            <p className="text-sm text-nexus-text-secondary mt-1">
                              SKU: {product.sku} | {categoryLabels[product.category as keyof typeof categoryLabels]} | 受領: {product.receivedDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className={`status-orb status-${
                              status === 'inspecting' ? 'monitoring' :
                              status === 'completed' ? 'optimal' :
                              'critical'
                            }`} />
                            <span className={`status-badge ${
                              status === 'inspecting' ? 'info' :
                              status === 'completed' ? 'success' :
                              'danger'
                            }`}>
                              {statusConfig[product.status].label}
                            </span>
                          </div>
                          {status === 'inspecting' && (
                            <Link href={`/staff/inspection/${product.id}`}>
                              <button className="nexus-button">
                                続ける
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}