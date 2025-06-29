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
    fetch('/data/staff-mock.json')
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
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600 dark:text-gray-400">データを読み込み中...</div>
        </div>
      </DashboardLayout>
    );
  }

  const priorityColors = {
    high: 'border-red-300 bg-red-50 dark:bg-red-900/20',
    medium: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20',
    low: 'border-green-300 bg-green-50 dark:bg-green-900/20'
  };

  const priorityLabels = {
    high: '🔴 緊急',
    medium: '🟡 中',
    low: '🟢 低'
  };

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              検品管理
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              商品検品とチェックリスト管理
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              📱 バーコードスキャン
            </button>
            <button className="button-primary">
              検品履歴
            </button>
          </div>
        </div>

        {!activeTask ? (
          // Task Selection View
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">検品待ちタスク</h2>
            <div className="space-y-4">
              {inspectionTasks.map((task) => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 transition-colors ${priorityColors[task.priority]}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {task.type === 'camera' ? '📷' : 
                         task.type === 'watch' ? '⌚' : 
                         task.type === 'lens' ? '🔍' : '📦'}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {task.productId} | {task.productName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {task.value}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {priorityLabels[task.priority]}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span>👤 {task.assignee}</span>
                      <span>📅 {task.dueDate}</span>
                      <span>📍 {task.location}</span>
                      <span>🏷️ {task.category}</span>
                    </div>
                    
                    <button
                      onClick={() => handleStartInspection(task)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      検品開始
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Active Inspection View
          <div className="space-y-6">
            {/* Inspection Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {activeTask.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeTask.productId} | {activeTask.productName}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTask(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  戻る
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">場所:</span>
                  <span className="ml-2 font-medium">{activeTask.location}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">期限:</span>
                  <span className="ml-2 font-medium">{activeTask.dueDate}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">評価額:</span>
                  <span className="ml-2 font-medium">{activeTask.value}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">担当:</span>
                  <span className="ml-2 font-medium">{activeTask.assignee}</span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            {currentChecklist && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">{currentChecklist.name}</h3>
                
                <div className="space-y-6">
                  {currentChecklist.categories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                      <h4 className="text-md font-semibold mb-3 text-purple-600 dark:text-purple-400">
                        {category.name}
                      </h4>
                      
                      <div className="space-y-3">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className={`text-xs px-2 py-1 rounded ${item.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                {item.required ? '必須' : '任意'}
                              </span>
                              <span className="font-medium">{item.label}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {item.type === 'boolean' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleItemComplete(categoryIndex, itemIndex, true)}
                                    className={`px-3 py-1 rounded text-sm ${
                                      completedItems[`${categoryIndex}-${itemIndex}`] === true
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    ✓ OK
                                  </button>
                                  <button
                                    onClick={() => handleItemComplete(categoryIndex, itemIndex, false)}
                                    className={`px-3 py-1 rounded text-sm ${
                                      completedItems[`${categoryIndex}-${itemIndex}`] === false
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    ✗ NG
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
                                          ? 'bg-yellow-500 text-white'
                                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                                  className="px-3 py-1 border border-gray-300 rounded text-sm"
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
            )}

            {/* Photo Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">検品写真</h3>
              
              <div className="space-y-4">
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
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    📸 写真を追加
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {photos.length}枚アップロード済み
                  </span>
                </div>
                
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`検品写真 ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">検品メモ</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="特記事項、問題点、修理が必要な箇所などを記入してください..."
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Complete Button */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setActiveTask(null)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleCompleteInspection}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
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