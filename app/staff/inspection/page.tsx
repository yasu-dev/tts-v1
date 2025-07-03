'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';
import StatusIndicator from '@/app/components/ui/StatusIndicator';
import {
  BookOpenIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';

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
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  検品・撮影
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  商品の検品と撮影作業を実施
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsStandardsModalOpen(true)}
                  className="nexus-button"
                >
                  <BookOpenIcon className="w-5 h-5 mr-2" />
                  検品基準を確認
                </button>
                <button
                  onClick={() => setIsCameraModalOpen(true)}
                  className="nexus-button primary"
                >
                  <CameraIcon className="w-5 h-5 mr-2" />
                  カメラ設定
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Standards Modal */}
        {isStandardsModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
              <h2 className="text-lg font-bold mb-4">検品基準</h2>
              <p className="text-sm text-gray-600 mb-4">
                ここに検品マニュアルや注意事項が表示されます。
              </p>
              <div className="text-right mt-6">
                <button onClick={() => setIsStandardsModalOpen(false)} className="nexus-button primary">閉じる</button>
              </div>
            </div>
          </div>
        )}

        {/* Camera Settings Modal */}
        {isCameraModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
              <h2 className="text-lg font-bold mb-4">カメラ設定</h2>
              {/* TODO: カメラ設定フォームを実装 */}
              <div className="text-right mt-6">
                <button onClick={() => setIsCameraModalOpen(false)} className="nexus-button mr-2">キャンセル</button>
                <button onClick={handleSaveCameraSettings} className="nexus-button primary">保存</button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="intelligence-card americas">
              <div className="p-3 sm:p-4 md:p-6">
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
              <div className="p-3 sm:p-4 md:p-6">
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
              <div className="p-3 sm:p-4 md:p-6">
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
              <div className="p-3 sm:p-4 md:p-6">
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
                          <button 
                            onClick={() => handleStartInspection(product)}
                            className="nexus-button primary"
                          >
                            検品開始
                          </button>
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

        {/* Inspection Modal */}
        {isInspectionModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    商品検品
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedProduct.name} - {selectedProduct.sku}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsInspectionModalOpen(false);
                    setSelectedProduct(null);
                    setActiveTask(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
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
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="nexus-button"
                        >
                          <CameraIcon className="w-5 h-5 mr-2" />
                          写真を追加
                        </button>
                      </div>
                    </div>

                    {/* 備考 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        備考
                      </h3>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg"
                        rows={4}
                        placeholder="検品時の気づきや特記事項を入力してください..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">チェックリストを読み込み中...</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsInspectionModalOpen(false);
                    setSelectedProduct(null);
                    setActiveTask(null);
                  }}
                  className="nexus-button"
                >
                  キャンセル
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      showToast({
                        title: '一時保存',
                        message: '検品データを一時保存しました',
                        type: 'info'
                      });
                    }}
                    className="nexus-button"
                  >
                    一時保存
                  </button>
                  <button
                    onClick={() => {
                      handleCompleteInspection();
                      setIsInspectionModalOpen(false);
                      setSelectedProduct(null);
                    }}
                    className="nexus-button primary"
                  >
                    検品完了
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}