'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../components/features/notifications/ToastProvider';
import {
  PlusIcon,
  DocumentChartBarIcon,
  DocumentArrowDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import NexusTextarea from '@/app/components/ui/NexusTextarea';
import BaseModal from '@/app/components/ui/BaseModal';
import { NexusCard } from '@/app/components/ui';
import ReturnDetailModal from '@/app/components/modals/ReturnDetailModal';

export default function ReturnsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isReturnFormModalOpen, setIsReturnFormModalOpen] = useState(false);
  const [isReturnDetailModalOpen, setIsReturnDetailModalOpen] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState<any>(null);
  const [returnForm, setReturnForm] = useState({
    orderId: '',
    productName: '',
    reason: '',
    description: '',
    photos: [] as File[]
  });

  const [returns] = useState([
    { 
      id: 1, 
      orderId: 'ORD-000123', 
      product: 'Canon EOS R5', 
      reason: '商品不良', 
      status: 'pending', 
      date: '2024-01-15',
      customerName: '山田太郎',
      amount: '¥450,000',
      description: '商品到着時に外装に傷があり、動作にも不具合が見られます。'
    },
    { 
      id: 2, 
      orderId: 'ORD-000124', 
      product: 'Sony FE 24-70mm', 
      reason: 'イメージ違い', 
      status: 'approved', 
      date: '2024-01-14',
      customerName: '佐藤花子',
      amount: '¥280,000',
      description: '商品説明と実際の商品が異なっていました。'
    },
    { 
      id: 3, 
      orderId: 'ORD-000125', 
      product: 'Rolex Submariner', 
      reason: '破損', 
      status: 'processing', 
      date: '2024-01-13',
      customerName: '田中一郎',
      amount: '¥1,200,000',
      description: '配送中に破損したと思われます。'
    },
  ]);

  const [returnStats] = useState({
    totalReturns: 15,
    pending: 5,
    completed: 10,
    returnRate: 3.2,
  });

  // 返品申請ボタンの機能実装
  const handleReturnRequest = () => {
    setIsReturnFormModalOpen(true);
  };

  // レポート出力ボタンの機能実装
  const handleExportReport = () => {
    try {
      // 返品データをCSV形式で生成
      const csvData = [
        ['返品ID', '注文番号', '商品名', '返品理由', 'ステータス', '申請日'],
        ...returns.map(item => [
          `RET-${String(item.id).padStart(6, '0')}`,
          item.orderId,
          item.product,
          item.reason,
          item.status,
          item.date
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `returns_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        title: 'エクスポート完了',
        message: '返品レポートをダウンロードしました',
        type: 'success'
      });
    } catch (error) {
      showToast({
        title: 'エクスポートエラー',
        message: 'レポートの生成に失敗しました',
        type: 'error'
      });
    }
  };

  // 返品申請フォームの送信処理
  const handleSubmitReturnRequest = async () => {
    if (!returnForm.orderId || !returnForm.productName || !returnForm.reason) {
      showToast({
        title: '入力エラー',
        message: '必須項目をすべて入力してください',
        type: 'warning'
      });
      return;
    }

    try {
      // 実際のAPI呼び出しをここに実装
      showToast({
        title: '返品申請完了',
        message: `注文 ${returnForm.orderId} の返品申請を受け付けました`,
        type: 'success'
      });
      
      setIsReturnFormModalOpen(false);
      setReturnForm({
        orderId: '',
        productName: '',
        reason: '',
        description: '',
        photos: []
      });
    } catch (error) {
      showToast({
        title: '申請エラー',
        message: '返品申請の送信に失敗しました',
        type: 'error'
      });
    }
  };

  // 返品詳細表示機能
  const handleReturnDetail = (returnItem: any) => {
    console.log('返品詳細ボタンがクリックされました:', returnItem);
    
    // テーブルのデータをReturnDetailModalの形式に変換
    const detailData = {
      id: `RET-${String(returnItem.id).padStart(6, '0')}`,
      customerName: returnItem.customerName,
      productName: returnItem.product,
      reason: returnItem.reason,
      status: returnItem.status,
      date: returnItem.date,
      amount: returnItem.amount,
      orderId: returnItem.orderId,
      description: returnItem.description
    };
    
    console.log('変換後のdetailData:', detailData);
    
    setSelectedReturnItem(detailData);
    setIsReturnDetailModalOpen(true);
    
    console.log('モーダル状態を開く:', true);
  };

  // 返品ステータス更新機能
  const handleReturnStatusUpdate = (itemId: string, newStatus: string) => {
    // 実際のアプリケーションではここでAPIを呼び出してステータスを更新
    // 返品ステータス更新ログを記録
    const statusLog = {
      action: 'return_status_updated',
      timestamp: new Date().toISOString(),
      returnId: itemId,
      newStatus,
      user: 'current_user'
    };
    const logs = JSON.parse(localStorage.getItem('returnStatusLogs') || '[]');
    logs.push(statusLog);
    localStorage.setItem('returnStatusLogs', JSON.stringify(logs));
    
    showToast({
      title: 'ステータス更新',
      message: `返品 ${itemId} のステータスを更新しました`,
      type: 'success'
    });
  };

  // 下書き保存機能
  const handleSaveDraft = () => {
    localStorage.setItem('returnFormDraft', JSON.stringify(returnForm));
    showToast({
      title: '下書き保存完了',
      message: '返品申請の下書きを保存しました',
      type: 'info'
    });
  };

  // ファイルアップロード処理
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setReturnForm(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-8">
        {/* PageHeaderコンポーネントを使用してUI統一 */}
        <PageHeader
          title="返品管理"
          subtitle="返品リクエストの処理と履歴を管理します"
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
            </svg>
          }
          actions={
            <div className="flex gap-4">
              <NexusButton 
                onClick={handleReturnRequest}
                variant="primary"
                icon={<PlusIcon className="w-5 h-5" />}
              >
                返品申請
              </NexusButton>
              <NexusButton 
                onClick={handleExportReport}
                icon={<DocumentChartBarIcon className="w-5 h-5" />}
              >
                レポート出力
              </NexusButton>
            </div>
          }
          region="africa"
        />

        {/* 返品申請モーダル */}
        <BaseModal
          isOpen={isReturnFormModalOpen}
          onClose={() => setIsReturnFormModalOpen(false)}
          title="返品申請"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <NexusInput
                  type="text"
                  label="注文番号 *"
                  value={returnForm.orderId}
                  onChange={(e) => setReturnForm(prev => ({ ...prev, orderId: e.target.value }))}
                  placeholder="ORD-000123"
                />
              </div>
              
              <div>
                <NexusInput
                  type="text"
                  label="商品名 *"
                  value={returnForm.productName}
                  onChange={(e) => setReturnForm(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="商品名を入力"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-3">返品理由 *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['商品不良', 'イメージ違い', '破損', 'サイズ違い', '遅延配送', '重複注文', '間違い注文', 'その他'].map((reason) => (
                  <label key={reason} className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="reason" 
                      value={reason} 
                      checked={returnForm.reason === reason}
                      onChange={(e) => setReturnForm(prev => ({ ...prev, reason: e.target.value }))}
                      className="mr-2 w-4 h-4 text-primary-blue" 
                    />
                    <span className="text-sm text-nexus-text-primary">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <NexusTextarea
                label="詳細説明"
                rows={4}
                value={returnForm.description}
                onChange={(e) => setReturnForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="返品理由の詳細を記載してください"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-2">写真アップロード</label>
              <div className="border-3 border-dashed border-nexus-border rounded-xl p-8 text-center hover:border-primary-blue transition-all duration-300 hover:bg-primary-blue/5">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <svg className="mx-auto h-12 w-12 text-nexus-text-muted" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-3 text-sm text-nexus-text-secondary font-medium">写真をドラッグ&ドロップまたはクリックして選択</p>
                  <p className="text-xs text-nexus-text-muted mt-1">PNG, JPG, GIF (最大10MB)</p>
                </label>
              </div>
              {returnForm.photos.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-nexus-text-secondary">{returnForm.photos.length}件のファイルが選択されています</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-end mt-6">
              <NexusButton 
                onClick={handleSaveDraft}
                icon={<DocumentArrowDownIcon className="w-5 h-5" />}
              >
                下書き保存
              </NexusButton>
              <NexusButton 
                onClick={handleSubmitReturnRequest}
                variant="primary"
                icon={<CheckIcon className="w-5 h-5" />}
              >
                返品申請提出
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* Return Statistics - Intelligence Metrics Style */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="intelligence-card africa">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb red">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                    </svg>
                  </div>
                  <span className="status-badge error">{returnStats.totalReturns}</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {returnStats.totalReturns}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">件</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  総返品数
                </div>
              </div>
            </div>

            <div className="intelligence-card africa">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="status-badge warning">処理中</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {returnStats.pending}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">件</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  処理待ち
                </div>
              </div>
            </div>

            <div className="intelligence-card africa">
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
                  {returnStats.completed}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">件</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  完了済み
                </div>
              </div>
            </div>

            <div className="intelligence-card africa">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb blue">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-nexus-blue">割合</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {returnStats.returnRate}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">%</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  返品率
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Return Request Form - Intelligence Card Style */}
        <div className="intelligence-card africa">
          <div className="p-8">
            <h3 className="text-2xl font-display font-bold text-nexus-text-primary mb-6">返品履歴</h3>
            
            <div className="holo-table">
              <table className="w-full">
                <thead className="holo-header">
                  <tr>
                    <th className="text-left">返品ID</th>
                    <th className="text-left">注文番号</th>
                    <th className="text-left">商品名</th>
                    <th className="text-left">返品理由</th>
                    <th className="text-center">ステータス</th>
                    <th className="text-left">申請日</th>
                    <th className="text-center">アクション</th>
                  </tr>
                </thead>
                <tbody className="holo-body">
                  {returns.map((returnItem) => (
                    <tr key={returnItem.id} className="holo-row">
                      <td className="font-mono text-nexus-text-primary">RET-{String(returnItem.id).padStart(6, '0')}</td>
                      <td className="font-mono">{returnItem.orderId}</td>
                      <td className="font-medium text-nexus-text-primary">{returnItem.product}</td>
                      <td>{returnItem.reason}</td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`status-orb status-${
                            returnItem.status === '申請' ? 'monitoring' :
                            returnItem.status === '受領' ? 'optimal' :
                            returnItem.status === '再検品' ? 'monitoring' :
                            'optimal'
                          }`} />
                          <span className={`status-badge ${
                            returnItem.status === '申請' ? 'warning' :
                            returnItem.status === '受領' ? 'info' :
                            returnItem.status === '再検品' ? 'warning' :
                            'success'
                          }`}>
                            {returnItem.status}
                          </span>
                        </div>
                      </td>
                      <td className="font-mono text-sm">{returnItem.date}</td>
                      <td className="text-center">
                        <div className="flex gap-3 justify-center">
                          <NexusButton
                            onClick={() => handleReturnDetail(returnItem)}
                            size="sm"
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            }
                          >
                            詳細
                          </NexusButton>
                          <NexusButton
                            onClick={() => {
                              showToast({
                                title: '追跡開始',
                                message: `返品 RET-${String(returnItem.id).padStart(6, '0')} の配送状況を確認します`,
                                type: 'info'
                              });
                            }}
                            size="sm"
                            variant="primary"
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                            }
                          >
                            追跡
                          </NexusButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Return Process Flow - Intelligence Card Style */}
        <div className="intelligence-card africa">
          <div className="p-8">
            <h3 className="text-2xl font-display font-bold text-nexus-text-primary mb-8">返品業務フロー</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="intelligence-card asia">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="action-orb">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="status-badge warning">申請</span>
                  </div>
                  <div className="metric-value font-display text-2xl font-bold text-nexus-text-primary">
                    1
                  </div>
                  <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                    申請
                  </div>
                  <p className="text-sm text-nexus-text-secondary mt-2">返品リクエスト提出</p>
                </div>
              </div>

              <div className="intelligence-card americas">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="action-orb blue">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                      </svg>
                    </div>
                    <span className="status-badge info">受領</span>
                  </div>
                  <div className="metric-value font-display text-2xl font-bold text-nexus-text-primary">
                    2
                  </div>
                  <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                    受領
                  </div>
                  <p className="text-sm text-nexus-text-secondary mt-2">商品の受け取り確認</p>
                </div>
              </div>

              <div className="intelligence-card europe">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="action-orb">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <span className="status-badge">検品中</span>
                  </div>
                  <div className="metric-value font-display text-2xl font-bold text-nexus-text-primary">
                    3
                  </div>
                  <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                    再検品
                  </div>
                  <p className="text-sm text-nexus-text-secondary mt-2">状態確認・評価</p>
                </div>
              </div>

              <div className="intelligence-card africa">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="action-orb green">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="status-badge success">完了</span>
                  </div>
                  <div className="metric-value font-display text-2xl font-bold text-nexus-text-primary">
                    4
                  </div>
                  <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                    完了
                  </div>
                  <p className="text-sm text-nexus-text-secondary mt-2">返金・交換処理</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Return Detail Modal */}
        <ReturnDetailModal
          isOpen={isReturnDetailModalOpen}
          onClose={() => {
            setIsReturnDetailModalOpen(false);
            setSelectedReturnItem(null);
          }}
          returnItem={selectedReturnItem}
          onStatusUpdate={handleReturnStatusUpdate}
        />

      </div>
    </DashboardLayout>
  );
} 