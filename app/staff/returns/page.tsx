'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';

interface ReturnItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  customer: string;
  returnReason: string;
  returnDate: string;
  originalCondition: string;
  returnedCondition: string;
  status: 'pending' | 'inspecting' | 'approved' | 'rejected' | 'refunded';
  inspector: string;
  customerNote: string;
  refundAmount: string;
  photos?: File[];
  inspectionNote?: string;
  finalDecision?: 'resell' | 'repair' | 'dispose';
}

interface ReturnCategory {
  id: string;
  label: string;
  action: string;
}

interface ReturnsData {
  pendingReturns: ReturnItem[];
  returnCategories: ReturnCategory[];
}

export default function ReturnsPage() {
  const [returnsData, setReturnsData] = useState<ReturnsData | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
  const [inspectionPhotos, setInspectionPhotos] = useState<File[]>([]);
  const [inspectionNote, setInspectionNote] = useState('');
  const [finalDecision, setFinalDecision] = useState<'resell' | 'repair' | 'dispose' | ''>('');
  const [viewMode, setViewMode] = useState<'list' | 'inspection' | 'history'>('list');
  const [filter, setFilter] = useState<'all' | 'pending' | 'inspecting' | 'completed'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/data/staff-mock.json')
      .then(res => res.json())
      .then(data => {
        setReturnsData(data.returnsData);
      })
      .catch(console.error);
  }, []);

  const handleStartInspection = (returnItem: ReturnItem) => {
    setSelectedReturn(returnItem);
    setViewMode('inspection');
    setInspectionPhotos([]);
    setInspectionNote('');
    setFinalDecision('');
  };

  const handlePhotoUpload = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files);
      setInspectionPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setInspectionPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteInspection = () => {
    if (!selectedReturn || !finalDecision) {
      alert('最終判定を選択してください。');
      return;
    }

    // In real app, would call API
    alert(`返品検品が完了しました。\n商品: ${selectedReturn.productName}\n判定: ${getDecisionLabel(finalDecision)}`);
    setSelectedReturn(null);
    setViewMode('list');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'inspecting': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '検品待ち';
      case 'inspecting': return '検品中';
      case 'approved': return '承認済み';
      case 'rejected': return '拒否';
      case 'refunded': return '返金完了';
      default: return status;
    }
  };

  const getDecisionLabel = (decision: string) => {
    switch (decision) {
      case 'resell': return '再販可能';
      case 'repair': return '修理必要';
      case 'dispose': return '廃棄';
      default: return decision;
    }
  };

  const getReasonIcon = (reason: string) => {
    if (reason.includes('動作不良')) return '⚠️';
    if (reason.includes('破損')) return '💥';
    if (reason.includes('説明相違')) return '📝';
    if (reason.includes('顧客都合')) return '👤';
    return '📋';
  };

  if (!returnsData) {
    return (
      <DashboardLayout userType="staff">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600 dark:text-gray-400">データを読み込み中...</div>
        </div>
      </DashboardLayout>
    );
  }

  // Mock additional returns for demonstration
  const allReturns: ReturnItem[] = [
    ...returnsData.pendingReturns.map(item => ({
      ...item,
      status: 'pending' as const,
      inspector: '',
      photos: []
    })),
    {
      id: 'return-002',
      orderId: 'ORD-2024-0626-001',
      productId: 'TWD-WAT-007',
      productName: 'Rolex GMT Master',
      customer: '佐藤花子',
      returnReason: '商品説明相違',
      returnDate: '2024-06-26',
      originalCondition: 'A',
      returnedCondition: 'A',
      status: 'approved',
      inspector: '田中次郎',
      customerNote: '思っていた色と違いました',
      refundAmount: '¥2,100,000',
      inspectionNote: '商品に問題なし。顧客都合による返品。',
      finalDecision: 'resell'
    },
    {
      id: 'return-003',
      orderId: 'ORD-2024-0625-002',
      productId: 'TWD-LEN-005',
      productName: 'Canon RF 24-70mm F2.8',
      customer: '山田太郎',
      returnReason: '配送時破損',
      returnDate: '2024-06-25',
      originalCondition: 'A',
      returnedCondition: 'C',
      status: 'refunded',
      inspector: '佐藤花子',
      customerNote: '箱が潰れていて、レンズに傷がありました',
      refundAmount: '¥198,000',
      inspectionNote: '配送中の破損確認。保険申請済み。',
      finalDecision: 'repair'
    }
  ];

  const filteredReturns = filter === 'all' ? allReturns : 
    filter === 'completed' ? allReturns.filter(r => ['approved', 'rejected', 'refunded'].includes(r.status)) :
    allReturns.filter(r => r.status === filter);

  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              返品処理管理
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              返品商品の再検品と判定処理
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              📱 バーコードスキャン
            </button>
            <button className="button-primary">
              返品履歴
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-6">
            {[
              { key: 'list', label: '返品一覧', icon: '📋' },
              { key: 'inspection', label: '検品作業', icon: '🔍' },
              { key: 'history', label: '処理履歴', icon: '📊' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key as any)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 ${
                  viewMode === tab.key
                    ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-6">
              {/* Filter */}
              <div className="flex space-x-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ステータス</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">すべて</option>
                    <option value="pending">検品待ち</option>
                    <option value="inspecting">検品中</option>
                    <option value="completed">処理完了</option>
                  </select>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-4 text-white">
                  <h3 className="text-lg font-semibold">検品待ち</h3>
                  <p className="text-2xl font-bold">{allReturns.filter(r => r.status === 'pending').length}件</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
                  <h3 className="text-lg font-semibold">検品中</h3>
                  <p className="text-2xl font-bold">{allReturns.filter(r => r.status === 'inspecting').length}件</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                  <h3 className="text-lg font-semibold">承認済み</h3>
                  <p className="text-2xl font-bold">{allReturns.filter(r => r.status === 'approved').length}件</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                  <h3 className="text-lg font-semibold">返金完了</h3>
                  <p className="text-2xl font-bold">{allReturns.filter(r => r.status === 'refunded').length}件</p>
                </div>
              </div>

              {/* Returns List */}
              <div className="space-y-4">
                {filteredReturns.map((returnItem) => (
                  <div
                    key={returnItem.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{getReasonIcon(returnItem.returnReason)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {returnItem.productName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {returnItem.productId} | 注文: {returnItem.orderId}
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            顧客: {returnItem.customer}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {returnItem.refundAmount}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(returnItem.status)}`}>
                          {getStatusLabel(returnItem.status)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">返品理由</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {returnItem.returnReason}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">状態変化</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {returnItem.originalCondition} → {returnItem.returnedCondition}
                        </p>
                      </div>
                    </div>

                    {returnItem.customerNote && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <span className="font-medium">顧客コメント:</span> {returnItem.customerNote}
                        </p>
                      </div>
                    )}

                    {returnItem.inspectionNote && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">検品結果:</span> {returnItem.inspectionNote}
                        </p>
                        {returnItem.finalDecision && (
                          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                            <span className="font-medium">最終判定:</span> {getDecisionLabel(returnItem.finalDecision)}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span>返品日: {returnItem.returnDate}</span>
                        {returnItem.inspector && (
                          <span className="ml-4">検品者: {returnItem.inspector}</span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {returnItem.status === 'pending' && (
                          <button
                            onClick={() => handleStartInspection(returnItem)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            検品開始
                          </button>
                        )}
                        <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors">
                          詳細
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inspection View */}
          {viewMode === 'inspection' && selectedReturn && (
            <div className="space-y-6">
              {/* Inspection Header */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                      返品検品: {selectedReturn.productName}
                    </h2>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {selectedReturn.productId} | 顧客: {selectedReturn.customer}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewMode('list')}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    一覧に戻る
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 dark:text-blue-400">返品理由:</span>
                    <span className="ml-2 font-medium">{selectedReturn.returnReason}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400">元の状態:</span>
                    <span className="ml-2 font-medium">{selectedReturn.originalCondition}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400">返品時状態:</span>
                    <span className="ml-2 font-medium">{selectedReturn.returnedCondition}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400">返金額:</span>
                    <span className="ml-2 font-medium">{selectedReturn.refundAmount}</span>
                  </div>
                </div>

                {selectedReturn.customerNote && (
                  <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded border">
                    <p className="text-sm">
                      <span className="font-medium">顧客コメント:</span> {selectedReturn.customerNote}
                    </p>
                  </div>
                )}
              </div>

              {/* Comparison Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">状態比較</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">出荷時の状態 (元の状態)</h4>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        コンディション: <span className="font-bold">{selectedReturn.originalCondition}</span>
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        出荷時の検品で確認された状態
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-red-600">返品時の状態</h4>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        コンディション: <span className="font-bold">{selectedReturn.returnedCondition}</span>
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        顧客から返品された際の状態
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
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
                      {inspectionPhotos.length}枚アップロード済み
                    </span>
                  </div>
                  
                  {inspectionPhotos.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {inspectionPhotos.map((photo, index) => (
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

              {/* Inspection Notes */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">検品結果</h3>
                <textarea
                  value={inspectionNote}
                  onChange={(e) => setInspectionNote(e.target.value)}
                  placeholder="検品結果を詳細に記録してください（損傷箇所、動作確認結果、修理可否など）..."
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Final Decision */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">最終判定</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'resell', label: '再販可能', desc: '状態良好、そのまま再販', color: 'green' },
                    { key: 'repair', label: '修理必要', desc: '修理後再販可能', color: 'yellow' },
                    { key: 'dispose', label: '廃棄', desc: '修理不可、廃棄処分', color: 'red' }
                  ].map((option) => (
                    <div
                      key={option.key}
                      onClick={() => setFinalDecision(option.key as any)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        finalDecision === option.key
                          ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <h4 className={`font-semibold ${
                        finalDecision === option.key 
                          ? `text-${option.color}-600 dark:text-${option.color}-400`
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {option.label}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {option.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete Button */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setViewMode('list')}
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

          {/* History View */}
          {viewMode === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">返品処理履歴</h3>
              
              <div className="space-y-4">
                {allReturns
                  .filter(r => ['approved', 'rejected', 'refunded'].includes(r.status))
                  .map((returnItem) => (
                    <div
                      key={returnItem.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getReasonIcon(returnItem.returnReason)}</span>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {returnItem.productName}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {returnItem.productId} | {returnItem.customer}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(returnItem.status)}`}>
                            {getStatusLabel(returnItem.status)}
                          </span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {returnItem.inspector}
                          </p>
                        </div>
                      </div>
                      
                      {returnItem.finalDecision && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm">
                          <span className="font-medium">判定:</span> {getDecisionLabel(returnItem.finalDecision)}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}