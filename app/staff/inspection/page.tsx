'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';

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

export default function InspectionPage() {
  const [inspectionData, setInspectionData] = useState<InspectionData | null>(null);
  const [activeTask, setActiveTask] = useState<InspectionTask | null>(null);
  const [currentChecklist, setCurrentChecklist] = useState<ChecklistTemplate | null>(null);
  const [completedItems, setCompletedItems] = useState<{[key: string]: any}>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock inspection tasks
  const inspectionTasks: InspectionTask[] = [
    {
      id: 'inspection-001',
      title: 'Canon EOS R5 緊急検品',
      productId: 'TWD-CAM-015',
      productName: 'Canon EOS R5',
      type: 'camera',
      priority: 'high',
      assignee: '田中次郎',
      status: 'pending',
      dueDate: '2024-06-28',
      location: '検品室B',
      value: '¥450,000',
      category: '緊急検品'
    },
    {
      id: 'inspection-002',
      title: 'Rolex GMT Master 検品',
      productId: 'TWD-WAT-007',
      productName: 'Rolex GMT Master',
      type: 'watch',
      priority: 'high',
      assignee: '田中次郎',
      status: 'pending',
      dueDate: '2024-06-28',
      location: '金庫室V-03',
      value: '¥2,100,000',
      category: '高額商品'
    },
    {
      id: 'inspection-003',
      title: 'Sony α7R V バッチ検品',
      productId: 'BATCH-INS-001',
      productName: 'Sony α7R V 他7件',
      type: 'camera',
      priority: 'medium',
      assignee: '佐藤花子',
      status: 'in_progress',
      dueDate: '2024-06-29',
      location: '検品室A',
      value: 'バッチ処理',
      category: '入庫検品'
    }
  ];

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
        <div className="intelligence-card global">
          <div className="p-8 text-center">
            <div className="text-lg text-nexus-text-secondary">データを読み込み中...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const priorityLabels: Record<string, string> = {
    high: '緊急',
    medium: '中',
    low: '低'
  };

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card asia">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  検品管理
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  商品検品とチェックリスト管理
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowScanner(!showScanner)}
                  className="nexus-button primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                  バーコードスキャン
                </button>
                <button className="nexus-button">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  検品履歴
                </button>
              </div>
            </div>
          </div>
        </div>

        {!activeTask ? (
          // Task Selection View
          <div className="intelligence-card global">
            <div className="p-8">
              <h2 className="text-xl font-semibold mb-6 text-nexus-text-primary">検品待ちタスク</h2>
              <div className="space-y-4">
                {inspectionTasks.map((task) => (
                  <div
                    key={task.id}
                    className="intelligence-card global"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="action-orb">
                            {task.type === 'camera' ? 
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg> :
                             task.type === 'watch' ? 
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg> :
                             task.type === 'lens' ? 
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg> : 
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>}
                          </div>
                          <div>
                            <h3 className="font-semibold text-nexus-text-primary">
                              {task.title}
                            </h3>
                            <p className="text-sm text-nexus-text-secondary">
                              {task.productId} | {task.productName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="cert-nano cert-mint">
                            {task.value}
                          </span>
                          <span className="cert-nano cert-premium">
                            {priorityLabels[task.priority]}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-nexus-text-secondary">
                        <div className="flex items-center space-x-4">
                          <span>
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {task.assignee}
                          </span>
                          <span>
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {task.dueDate}
                          </span>
                          <span>
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {task.location}
                          </span>
                          <span>
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {task.category}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleStartInspection(task)}
                          className="nexus-button primary"
                        >
                          検品開始
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Active Inspection View
          <div className="space-y-6">
            {/* Inspection Header */}
            <div className="intelligence-card global">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-nexus-text-primary">
                      {activeTask.title}
                    </h2>
                    <p className="text-sm text-nexus-text-secondary">
                      {activeTask.productId} | {activeTask.productName}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTask(null)}
                    className="nexus-button"
                  >
                    戻る
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-nexus-text-secondary">場所:</span>
                    <span className="ml-2 font-medium text-nexus-text-primary">{activeTask.location}</span>
                  </div>
                  <div>
                    <span className="text-nexus-text-secondary">期限:</span>
                    <span className="ml-2 font-medium text-nexus-text-primary">{activeTask.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-nexus-text-secondary">評価額:</span>
                    <span className="ml-2 font-medium text-nexus-text-primary">{activeTask.value}</span>
                  </div>
                  <div>
                    <span className="text-nexus-text-secondary">担当:</span>
                    <span className="ml-2 font-medium text-nexus-text-primary">{activeTask.assignee}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            {currentChecklist && (
              <div className="intelligence-card asia">
                <div className="p-8">
                  <h3 className="text-lg font-semibold mb-6 text-nexus-text-primary">{currentChecklist.name}</h3>
                  
                  <div className="space-y-6">
                    {currentChecklist.categories.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="border-b border-nexus-border pb-6 last:border-b-0">
                        <h4 className="text-md font-semibold mb-4 text-nexus-yellow">
                          {category.name}
                        </h4>
                        
                        <div className="space-y-3">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center justify-between p-4 bg-nexus-bg-secondary rounded-lg">
                              <div className="flex items-center space-x-3">
                                <span className={`text-xs px-2 py-1 rounded ${item.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {item.required ? '必須' : '任意'}
                                </span>
                                <span className="font-medium text-nexus-text-primary">{item.label}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {item.type === 'boolean' && (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleItemComplete(categoryIndex, itemIndex, true)}
                                      className={`px-3 py-1 rounded text-sm ${
                                        completedItems[`${categoryIndex}-${itemIndex}`] === true
                                          ? 'bg-nexus-green text-white'
                                          : 'nexus-button'
                                      }`}
                                    >
                                      OK
                                    </button>
                                    <button
                                      onClick={() => handleItemComplete(categoryIndex, itemIndex, false)}
                                      className={`px-3 py-1 rounded text-sm ${
                                        completedItems[`${categoryIndex}-${itemIndex}`] === false
                                          ? 'bg-red-600 text-white'
                                          : 'nexus-button'
                                      }`}
                                    >
                                      NG
                                    </button>
                                  </div>
                                )}
                                
                                {item.type === 'rating' && (
                                  <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map(rating => (
                                      <button
                                        key={rating}
                                        onClick={() => handleItemComplete(categoryIndex, itemIndex, rating)}
                                        className={`w-8 h-8 rounded-full text-sm ${
                                          completedItems[`${categoryIndex}-${itemIndex}`] === rating
                                            ? 'bg-nexus-yellow text-white'
                                            : 'nexus-button'
                                        }`}
                                      >
                                        {rating}
                                      </button>
                                    ))}
                                  </div>
                                )}
                                
                                {item.type === 'measurement' && (
                                  <input
                                    type="text"
                                    placeholder="測定値を入力"
                                    className="px-3 py-1 bg-nexus-bg-primary border border-nexus-border rounded text-sm text-nexus-text-primary"
                                    onChange={(e) => handleItemComplete(categoryIndex, itemIndex, e.target.value)}
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Photo Upload */}
            <div className="intelligence-card europe">
              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-display font-bold text-nexus-text-primary">検品写真</h3>
                  <p className="text-nexus-text-secondary mt-1">商品の状態を詳細に撮影してください</p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
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
                        className="nexus-button primary"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        写真を追加
                      </button>
                      <div className="action-orb">
                        <span className="text-sm font-bold">{photos.length}</span>
                      </div>
                      <span className="text-sm text-nexus-text-secondary">
                        枚アップロード済み
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="nexus-button">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {photos.length > 0 ? (
                    <div className="bg-nexus-bg-primary rounded-lg border border-nexus-border p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-nexus-bg-secondary border border-nexus-border hover:border-primary-blue transition-all duration-200">
                              <img
                                src={URL.createObjectURL(photo)}
                                alt={`検品写真 ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              <button
                                onClick={() => removePhoto(index)}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-lg"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <span className="cert-nano cert-premium">#{index + 1}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-nexus-bg-primary rounded-lg border border-nexus-border">
                      <svg className="w-12 h-12 mx-auto text-nexus-text-tertiary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-nexus-text-secondary">検品写真を追加してください</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="intelligence-card global">
              <div className="p-8">
                <h3 className="text-lg font-semibold mb-6 text-nexus-text-primary">検品メモ</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="特記事項、問題点、修理が必要な箇所などを記入してください..."
                  className="w-full h-32 p-3 bg-nexus-bg-secondary border border-nexus-border rounded-lg resize-none focus:ring-2 focus:ring-nexus-yellow focus:border-transparent text-nexus-text-primary"
                />
              </div>
            </div>

            {/* Complete Button */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setActiveTask(null)}
                className="nexus-button"
              >
                キャンセル
              </button>
              <button
                onClick={handleCompleteInspection}
                className="nexus-button primary"
              >
                検品完了
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}