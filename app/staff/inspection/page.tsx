'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import StatusIndicator from '@/app/components/ui/StatusIndicator';
import { NexusLoadingSpinner } from '@/app/components/ui';
import {
  BookOpenIcon,
  CameraIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import BaseModal from '@/app/components/ui/BaseModal';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import NexusSelect from '@/app/components/ui/NexusSelect';

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
  const { showToast } = useToast();
  const [inspectionData, setInspectionData] = useState<InspectionData | null>(null);
  const [activeTask, setActiveTask] = useState<InspectionTask | null>(null);
  const [currentChecklist, setCurrentChecklist] = useState<ChecklistTemplate | null>(null);
  const [completedItems, setCompletedItems] = useState<{[key: string]: any}>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStandardsModalOpen, setIsStandardsModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // マウント状態の管理
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchInspectionData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/staff/dashboard');
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setInspectionData(data.inspectionData);
      } catch (err) {
        console.error('Inspection data fetch error:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
        
        // フォールバック用のモックデータ
        const mockInspectionData = {
          pendingTasks: [
            {
              id: 'task-001',
              title: 'Canon EOS R5 検品',
              productId: 'TWD-CAM-001',
              productName: 'Canon EOS R5 ボディ',
              type: 'camera',
              priority: 'high',
              assignee: 'スタッフ',
              status: 'pending',
              dueDate: '2024-06-27',
              location: 'A-01',
              value: '¥2,800,000',
              category: 'camera_body'
            }
          ],
          checklistTemplates: {
            camera: {
              id: 'camera_checklist',
              name: 'カメラ検品チェックリスト',
              categories: [
                {
                  name: '外観チェック',
                  items: [
                    { id: 'exterior_1', label: '本体に傷や汚れがないか', type: 'boolean', required: true },
                    { id: 'exterior_2', label: 'レンズマウントの状態', type: 'boolean', required: true }
                  ]
                }
              ]
            }
          }
        };
        setInspectionData(mockInspectionData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInspectionData();
  }, [mounted]);

  const statusConfig = {
    pending_inspection: { label: '検品待ち', status: 'warning' as const, color: 'bg-yellow-100 text-yellow-800' },
    inspecting: { label: '検品中', status: 'warning' as const, color: 'bg-blue-100 text-blue-800' },
    completed: { label: '完了', status: 'optimal' as const, color: 'bg-green-100 text-green-800' },
    failed: { label: '不合格', status: 'critical' as const, color: 'bg-red-100 text-red-800' },
  };

  const priorityConfig = {
    high: { label: '高', color: 'bg-red-100 text-red-800' },
    normal: { label: '中', color: 'bg-yellow-100 text-yellow-800' },
    low: { label: '低', color: 'bg-nexus-bg-secondary text-nexus-text-secondary' },
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

  const handleStartInspection = (product: Product) => {
    setSelectedProduct(product);
    setIsInspectionModalOpen(true);
    
    // Create task from product
    const task: InspectionTask = {
      id: product.id,
      title: `${product.name}の検品`,
      productId: product.id,
      productName: product.name,
      type: product.category === 'camera_body' ? 'camera' : 
            product.category === 'lens' ? 'lens' : 
            product.category === 'watch' ? 'watch' : 'accessory',
      priority: product.priority === 'high' ? 'high' : 
                product.priority === 'normal' ? 'medium' : 'low',
      assignee: '現在のユーザー',
      status: 'in_progress',
      dueDate: new Date().toISOString().split('T')[0],
      location: 'A-01',
      value: '¥100,000',
      category: product.category
    };
    
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
    
    // Check if all required items are completed
    const allCompleted = currentChecklist.categories.every((category, catIndex) =>
      category.items.every((item, itemIndex) => {
        const key = `${catIndex}-${itemIndex}`;
        return !item.required || completedItems[key] !== undefined;
      })
    );
    
    if (!allCompleted) {
      showToast({
        title: '検品未完了',
        message: '必須項目がすべて完了していません',
        type: 'warning'
      });
      return;
    }
    
    showToast({
      title: '検品完了',
      message: '検品が完了しました！',
      type: 'success'
    });
    setActiveTask(null);
    setCurrentChecklist(null);
  };

  const handleSaveCameraSettings = () => {
    showToast({
      title: '設定保存',
      message: 'カメラ設定を保存しました',
      type: 'success'
    });
    setIsCameraModalOpen(false);
  };

  if (!mounted) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <div className="intelligence-card global">
            <div className="p-8">
              <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                検品管理
              </h1>
              <p className="mt-1 text-sm text-nexus-text-secondary">
                検品データの管理とチェックリスト
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <NexusLoadingSpinner size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <div className="intelligence-card global">
            <div className="p-8">
              <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                検品・撮影
              </h1>
              <p className="mt-1 text-sm text-nexus-text-secondary">
                商品の検品と撮影作業を実施
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <NexusLoadingSpinner size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="staff">
        <div className="space-y-6">
          <div className="intelligence-card global">
            <div className="p-8">
              <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                検品・撮影
              </h1>
              <p className="mt-1 text-sm text-nexus-text-secondary">
                商品の検品と撮影作業を実施
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-nexus-red mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-nexus-text-primary mb-2">
                データの取得に失敗しました
              </h3>
              <p className="text-nexus-text-secondary mb-4">{error}</p>
              <NexusButton
                onClick={() => window.location.reload()}
                variant="primary"
              >
                再試行
              </NexusButton>
            </div>
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-8 h-8 text-nexus-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                    検品・撮影
                  </h1>
                </div>
                <p className="text-nexus-text-secondary">
                  商品の検品と撮影作業を実施
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                <NexusButton
                  onClick={() => setIsStandardsModalOpen(true)}
                  icon={<BookOpenIcon className="w-5 h-5" />}
                >
                  <span className="hidden sm:inline">検品基準を確認</span>
                  <span className="sm:hidden">検品基準</span>
                </NexusButton>
                <NexusButton
                  onClick={() => setIsCameraModalOpen(true)}
                  variant="primary"
                  icon={<CameraIcon className="w-5 h-5" />}
                >
                  <span className="hidden sm:inline">カメラ設定</span>
                  <span className="sm:hidden">カメラ</span>
                </NexusButton>
              </div>
            </div>
          </div>
        </div>

        {/* Standards Modal */}
        <BaseModal
          isOpen={isStandardsModalOpen}
          onClose={() => setIsStandardsModalOpen(false)}
          title="検品基準"
          size="lg"
        >
          <div>
            <p className="text-sm text-nexus-text-secondary mb-4">
              ここに検品マニュアルや注意事項が表示されます。
            </p>
            <div className="text-right mt-6">
              <NexusButton 
                onClick={() => setIsStandardsModalOpen(false)} 
                variant="primary"
                icon={<CheckIcon className="w-5 h-5" />}
              >
                閉じる
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* Camera Settings Modal */}
        <BaseModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          title="カメラ設定"
          size="md"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                解像度設定
              </label>
              <NexusSelect
                value="1080p"
                onChange={() => {}}
                size="sm"
                options={[
                  { value: "1080p", label: "1080p (フルHD)" },
                  { value: "720p", label: "720p (HD)" },
                  { value: "480p", label: "480p (SD)" }
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                フレームレート
              </label>
              <NexusSelect
                value="30fps"
                onChange={() => {}}
                size="sm"
                options={[
                  { value: "30fps", label: "30fps (標準)" },
                  { value: "60fps", label: "60fps (高品質)" }
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                画質設定
              </label>
              <NexusSelect
                value="high"
                onChange={() => {}}
                size="sm"
                options={[
                  { value: "high", label: "高画質" },
                  { value: "medium", label: "標準画質" },
                  { value: "low", label: "低画質" }
                ]}
              />
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm text-nexus-text-primary">自動フォーカス</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm text-nexus-text-primary">自動露出</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-nexus-text-primary">手ブレ補正</span>
              </label>
            </div>
            
            <div className="flex gap-4 justify-end mt-6">
              <NexusButton 
                onClick={() => setIsCameraModalOpen(false)}
                icon={<XMarkIcon className="w-5 h-5" />}
              >
                キャンセル
              </NexusButton>
              <NexusButton 
                onClick={handleSaveCameraSettings} 
                variant="primary"
                icon={<CheckIcon className="w-5 h-5" />}
              >
                保存
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* Stats Cards */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="intelligence-card americas">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb yellow w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge warning text-[10px] sm:text-xs">待機中</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {groupedProducts.pending_inspection?.length || 0}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  検品待ち
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb blue w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="status-badge info text-[10px] sm:text-xs">進行中</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {groupedProducts.inspecting?.length || 0}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  検品中
                </div>
              </div>
            </div>

            <div className="intelligence-card asia">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb green w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge success text-[10px] sm:text-xs">完了</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {groupedProducts.completed?.length || 0}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  完了
                </div>
              </div>
            </div>

            <div className="intelligence-card africa">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb red w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge danger text-[10px] sm:text-xs">要対応</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {groupedProducts.failed?.length || 0}
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
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
                          <NexusButton 
                            onClick={() => handleStartInspection(product)}
                            variant="primary"
                          >
                            検品開始
                          </NexusButton>
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
                              <NexusButton>
                                続ける
                              </NexusButton>
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

        {/* Inspection Modal */}
        <BaseModal
          isOpen={isInspectionModalOpen && !!selectedProduct}
          onClose={() => {
            setIsInspectionModalOpen(false);
            setSelectedProduct(null);
            setActiveTask(null);
          }}
          title="商品検品"
          subtitle={selectedProduct ? `${selectedProduct.name} - ${selectedProduct.sku}` : ''}
          size="lg"
          className="max-w-[1600px]"
        >
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {currentChecklist ? (
              <div className="space-y-6">
                {currentChecklist.categories.map((category, catIndex) => (
                  <div key={catIndex} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {category.name}
                    </h3>
                    <div className="space-y-3">
                      {category.items.map((item, itemIndex) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id={`${catIndex}-${itemIndex}`}
                              checked={completedItems[`${catIndex}-${itemIndex}`] || false}
                              onChange={(e) => handleItemComplete(catIndex, itemIndex, e.target.checked)}
                              className="h-5 w-5 text-blue-600 rounded"
                            />
                            <label htmlFor={`${catIndex}-${itemIndex}`} className="text-sm text-gray-700">
                              {item.label}
                              {item.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                          </div>
                          {item.type === 'rating' && (
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  onClick={() => handleItemComplete(catIndex, itemIndex, rating)}
                                  className={`w-8 h-8 rounded ${
                                    completedItems[`${catIndex}-${itemIndex}`] >= rating
                                      ? 'bg-yellow-400'
                                      : 'bg-gray-200'
                                  }`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* 写真アップロード */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    商品写真
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Photo ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e.target.files)}
                      className="hidden"
                    />
                    <NexusButton
                      onClick={() => fileInputRef.current?.click()}
                      icon={<CameraIcon className="w-5 h-5" />}
                    >
                      写真を追加
                    </NexusButton>
                  </div>
                </div>

                {/* 備考 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    備考
                  </h3>
                  <NexusTextarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="検品時の気づきや特記事項を入力してください..."
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <NexusLoadingSpinner size="md" />
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <NexusButton
              onClick={() => {
                setIsInspectionModalOpen(false);
                setSelectedProduct(null);
                setActiveTask(null);
              }}
              icon={<XMarkIcon className="w-5 h-5" />}
            >
              キャンセル
            </NexusButton>
            <div className="flex space-x-3">
              <NexusButton
                onClick={async () => {
                  try {
                    // 検品データの収集
                    const inspectionData = {
                      id: `temp_inspection_${Date.now()}`,
                      itemId: selectedProduct?.id || 'unknown',
                      status: 'draft',
                      savedAt: new Date().toISOString(),
                      inspector: 'current_user', // 実際は現在のユーザーID
                      notes: '一時保存されたデータ',
                      // 実際の検品データをここに追加
                      condition: 'pending_review',
                      images: [], // 撮影された画像のリスト
                      defects: [] // 発見された不具合のリスト
                    };
                    
                    // APIシミュレーション
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    // ローカルストレージに一時保存
                    const draftData = JSON.parse(localStorage.getItem('inspectionDrafts') || '[]');
                    draftData.push(inspectionData);
                    localStorage.setItem('inspectionDrafts', JSON.stringify(draftData));
                    
                    showToast({
                      title: '一時保存完了',
                      message: '検品データを正常に一時保存しました。後で作業を再開できます。',
                      type: 'success'
                    });
                    
                  } catch (error) {
                    showToast({
                      title: '一時保存エラー',
                      message: 'データの保存に失敗しました。もう一度お試しください。',
                      type: 'error'
                    });
                  }
                }}
              >
                一時保存
              </NexusButton>
              <NexusButton
                onClick={() => {
                  handleCompleteInspection();
                  setIsInspectionModalOpen(false);
                  setSelectedProduct(null);
                }}
                variant="primary"
                icon={<CheckIcon className="w-5 h-5" />}
              >
                検品完了
              </NexusButton>
            </div>
          </div>
        </BaseModal>
      </div>
    </DashboardLayout>
  );
}