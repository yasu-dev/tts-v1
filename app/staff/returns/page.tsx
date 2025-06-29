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
        <div className="intelligence-card global">
          <div className="p-8 text-center">
            <div className="text-lg text-nexus-text-secondary">データを読み込み中...</div>
          </div>
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
        <div className="intelligence-card africa">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  返品処理管理
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  返品商品の再検品と判定処理
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="nexus-button primary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                  バーコードスキャン
                </button>
                <button className="nexus-button">
                  返品履歴
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex space-x-1 bg-nexus-bg-secondary p-1 rounded-lg mb-6">
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
                      ? 'bg-nexus-bg-primary text-nexus-yellow shadow-sm'
                      : 'text-nexus-text-secondary hover:text-nexus-text-primary'
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
                    <label className="block text-sm font-medium text-nexus-text-secondary mb-2">ステータス</label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as any)}
                      className="px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-yellow text-nexus-text-primary"
                    >
                      <option value="all">すべて</option>
                      <option value="pending">検品待ち</option>
                      <option value="inspecting">検品中</option>
                      <option value="completed">処理完了</option>
                    </select>
                  </div>
                </div>

                {/* Stats */}
                <div className="intelligence-metrics">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="intelligence-card americas">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="action-orb">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="status-badge">待機</span>
                        </div>
                        <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                          {allReturns.filter(r => r.status === 'pending').length}
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                          </div>
                          <span className="status-badge info">検品中</span>
                        </div>
                        <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                          {allReturns.filter(r => r.status === 'inspecting').length}
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
                          <span className="status-badge success">承認</span>
                        </div>
                        <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                          {allReturns.filter(r => r.status === 'approved').length}
                        </div>
                        <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                          承認済み
                        </div>
                      </div>
                    </div>
                    
                    <div className="intelligence-card oceania">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="action-orb">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <span className="status-badge success">完了</span>
                        </div>
                        <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                          {allReturns.filter(r => r.status === 'refunded').length}
                        </div>
                        <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                          返金完了
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Returns List */}
                <div className="holo-table">
                  <table className="w-full">
                    <thead className="holo-header">
                      <tr>
                        <th className="text-left">返品情報</th>
                        <th className="text-left">顧客・理由</th>
                        <th className="text-left">状態</th>
                        <th className="text-left">ステータス</th>
                        <th className="text-right">アクション</th>
                      </tr>
                    </thead>
                    <tbody className="holo-body">
                      {filteredReturns.map((returnItem) => (
                        <tr key={returnItem.id} className="holo-row">
                          <td>
                            <div className="flex items-start space-x-3">
                              <span className="text-2xl">{getReasonIcon(returnItem.returnReason)}</span>
                              <div>
                                <h3 className="font-semibold text-nexus-text-primary">
                                  {returnItem.productName}
                                </h3>
                                <p className="text-sm text-nexus-text-secondary">
                                  {returnItem.productId} | 注文: {returnItem.orderId}
                                </p>
                                <span className="cert-nano cert-mint">
                                  {returnItem.refundAmount}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <p className="font-medium text-nexus-text-primary">{returnItem.customer}</p>
                              <p className="text-sm text-nexus-text-secondary">{returnItem.returnReason}</p>
                            </div>
                          </td>
                          <td>
                            <div className="text-sm">
                              <span className="font-medium text-nexus-text-primary">{returnItem.originalCondition} → {returnItem.returnedCondition}</span>
                              <p className="text-nexus-text-secondary">{returnItem.returnDate}</p>
                            </div>
                          </td>
                          <td>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(returnItem.status)}`}>
                              {getStatusLabel(returnItem.status)}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex justify-end space-x-2">
                              {returnItem.status === 'pending' && (
                                <button
                                  onClick={() => handleStartInspection(returnItem)}
                                  className="nexus-button primary"
                                >
                                  検品開始
                                </button>
                              )}
                              <button className="nexus-button">
                                詳細
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Customer Notes and Inspection Notes in Intelligence Cards */}
                <div className="space-y-4">
                  {filteredReturns.map((returnItem) => (
                    <div key={`notes-${returnItem.id}`} className="space-y-2">
                      {returnItem.customerNote && (
                        <div className="intelligence-card europe">
                          <div className="p-4">
                            <p className="text-sm">
                              <span className="font-medium text-nexus-yellow">顧客コメント ({returnItem.productName}):</span>
                              <span className="ml-2 text-nexus-text-primary">{returnItem.customerNote}</span>
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {returnItem.inspectionNote && (
                        <div className="intelligence-card asia">
                          <div className="p-4">
                            <p className="text-sm">
                              <span className="font-medium text-nexus-yellow">検品結果:</span>
                              <span className="ml-2 text-nexus-text-primary">{returnItem.inspectionNote}</span>
                            </p>
                            {returnItem.finalDecision && (
                              <p className="text-sm mt-2">
                                <span className="font-medium text-nexus-yellow">最終判定:</span>
                                <span className="ml-2 text-nexus-text-primary">{getDecisionLabel(returnItem.finalDecision)}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inspection View */}
            {viewMode === 'inspection' && selectedReturn && (
              <div className="space-y-6">
                {/* Inspection Header */}
                <div className="intelligence-card americas">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-nexus-text-primary">
                          返品検品: {selectedReturn.productName}
                        </h2>
                        <p className="text-sm text-nexus-text-secondary">
                          {selectedReturn.productId} | 顧客: {selectedReturn.customer}
                        </p>
                      </div>
                      <button
                        onClick={() => setViewMode('list')}
                        className="nexus-button"
                      >
                        一覧に戻る
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-nexus-text-secondary">返品理由:</span>
                        <span className="ml-2 font-medium text-nexus-text-primary">{selectedReturn.returnReason}</span>
                      </div>
                      <div>
                        <span className="text-nexus-text-secondary">元の状態:</span>
                        <span className="ml-2 font-medium text-nexus-text-primary">{selectedReturn.originalCondition}</span>
                      </div>
                      <div>
                        <span className="text-nexus-text-secondary">返品時状態:</span>
                        <span className="ml-2 font-medium text-nexus-text-primary">{selectedReturn.returnedCondition}</span>
                      </div>
                      <div>
                        <span className="text-nexus-text-secondary">返金額:</span>
                        <span className="ml-2 font-medium text-nexus-text-primary">{selectedReturn.refundAmount}</span>
                      </div>
                    </div>

                    {selectedReturn.customerNote && (
                      <div className="mt-4 p-3 bg-nexus-bg-secondary rounded border border-nexus-border">
                        <p className="text-sm text-nexus-text-primary">
                          <span className="font-medium">顧客コメント:</span> {selectedReturn.customerNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comparison Section */}
                <div className="intelligence-card global">
                  <div className="p-8">
                    <h3 className="text-lg font-semibold mb-4 text-nexus-text-primary">状態比較</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2 text-nexus-green">出荷時の状態 (元の状態)</h4>
                        <div className="intelligence-card asia">
                          <div className="p-4">
                            <p className="text-sm">
                              コンディション: <span className="font-bold text-nexus-text-primary">{selectedReturn.originalCondition}</span>
                            </p>
                            <p className="text-sm text-nexus-text-secondary mt-1">
                              出荷時の検品で確認された状態
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 text-nexus-red">返品時の状態</h4>
                        <div className="intelligence-card americas">
                          <div className="p-4">
                            <p className="text-sm">
                              コンディション: <span className="font-bold text-nexus-text-primary">{selectedReturn.returnedCondition}</span>
                            </p>
                            <p className="text-sm text-nexus-text-secondary mt-1">
                              顧客から返品された際の状態
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="intelligence-card europe">
                  <div className="p-8">
                    <h3 className="text-lg font-semibold mb-4 text-nexus-text-primary">検品写真</h3>
                    
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
                          className="nexus-button primary"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          写真を追加
                        </button>
                        <span className="text-sm text-nexus-text-secondary">
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
                                className="w-full h-20 object-cover rounded border border-nexus-border"
                              />
                              <button
                                onClick={() => removePhoto(index)}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-nexus-red text-white rounded-full text-xs hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inspection Notes */}
                <div className="intelligence-card global">
                  <div className="p-8">
                    <h3 className="text-lg font-semibold mb-4 text-nexus-text-primary">検品結果</h3>
                    <textarea
                      value={inspectionNote}
                      onChange={(e) => setInspectionNote(e.target.value)}
                      placeholder="検品結果を詳細に記録してください（損傷箇所、動作確認結果、修理可否など）..."
                      className="w-full h-32 p-3 bg-nexus-bg-secondary border border-nexus-border rounded-lg resize-none focus:ring-2 focus:ring-nexus-yellow focus:border-transparent text-nexus-text-primary"
                    />
                  </div>
                </div>

                {/* Final Decision */}
                <div className="intelligence-card africa">
                  <div className="p-8">
                    <h3 className="text-lg font-semibold mb-4 text-nexus-text-primary">最終判定</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { value: 'resell', label: '再販可能', icon: '✅', color: 'asia' },
                        { value: 'repair', label: '修理必要', icon: '🔧', color: 'americas' },
                        { value: 'dispose', label: '廃棄', icon: '❌', color: 'europe' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setFinalDecision(option.value as any)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            finalDecision === option.value
                              ? `border-nexus-yellow bg-nexus-bg-secondary intelligence-card ${option.color}`
                              : 'border-nexus-border hover:border-nexus-yellow'
                          }`}
                        >
                          <div className="text-3xl mb-2">{option.icon}</div>
                          <div className="font-medium text-nexus-text-primary">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Complete Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setViewMode('list')}
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

            {/* History View */}
            {viewMode === 'history' && (
              <div className="intelligence-card global">
                <div className="p-8">
                  <h2 className="text-xl font-semibold mb-6 text-nexus-text-primary">処理履歴</h2>
                  <div className="holo-table">
                    <table className="w-full">
                      <thead className="holo-header">
                        <tr>
                          <th className="text-left">商品</th>
                          <th className="text-left">顧客</th>
                          <th className="text-left">ステータス</th>
                          <th className="text-left">検品者</th>
                          <th className="text-left">判定</th>
                          <th className="text-left">処理日</th>
                        </tr>
                      </thead>
                      <tbody className="holo-body">
                        {allReturns.filter(r => r.status !== 'pending').map((returnItem) => (
                          <tr key={returnItem.id} className="holo-row">
                            <td>
                              <div>
                                <p className="font-medium text-nexus-text-primary">{returnItem.productName}</p>
                                <p className="text-sm text-nexus-text-secondary">{returnItem.productId}</p>
                              </div>
                            </td>
                            <td className="text-nexus-text-primary">{returnItem.customer}</td>
                            <td>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(returnItem.status)}`}>
                                {getStatusLabel(returnItem.status)}
                              </span>
                            </td>
                            <td className="text-nexus-text-primary">{returnItem.inspector || '-'}</td>
                            <td>
                              {returnItem.finalDecision ? (
                                <span className="cert-nano cert-premium">
                                  {getDecisionLabel(returnItem.finalDecision)}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="text-nexus-text-secondary">{returnItem.returnDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}