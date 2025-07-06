'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import PageHeader from '@/app/components/ui/PageHeader';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { NexusSelect, NexusButton, NexusCard, NexusLoadingSpinner } from '@/app/components/ui';
import ContentCard from '../components/ui/ContentCard';
import BaseModal from '@/app/components/ui/BaseModal';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AppSettings {
  language: string;
  theme: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  privacy: {
    profileVisibility: string;
    activityTracking: boolean;
  };
  preferences: {
    timezone: string;
    dateFormat: string;
    currency: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [userType, setUserType] = useState<'staff' | 'seller'>('staff');
  const [isDataExporting, setIsDataExporting] = useState(false);
  const [isAccountDeleting, setIsAccountDeleting] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [isSecondConfirmModalOpen, setIsSecondConfirmModalOpen] = useState(false);
  const [isExportConfirmModalOpen, setIsExportConfirmModalOpen] = useState(false);

  useEffect(() => {
    // 実際の実装はAPIから取得
    const mockSettings: AppSettings = {
      language: 'ja',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        desktop: false,
      },
      privacy: {
        profileVisibility: 'private',
        activityTracking: true,
      },
      preferences: {
        timezone: 'Asia/Tokyo',
        dateFormat: 'YYYY/MM/DD',
        currency: 'JPY',
      },
    };
    setSettings(mockSettings);
  }, []);

  const handleSettingChange = (category: keyof AppSettings, field: string, value: any) => {
    if (settings) {
      const currentCategory = settings[category];
      if (typeof currentCategory === 'object' && currentCategory !== null) {
        setSettings({
          ...settings,
          [category]: {
            ...currentCategory,
            [field]: value,
          },
        });
      } else {
        setSettings({
          ...settings,
          [category]: value,
        });
      }
    }
  };

  const handleSave = async (settingName: string) => {
    try {
      // 実際の設定保存処理を実装
      const payload = {
        settings: settings,
        timestamp: new Date().toISOString(),
        userType: userType
      };
      
      // APIシミュレーション（実際のAPI呼び出しと同等の処理）
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ローカルストレージにも保存（永続化）
      localStorage.setItem('userSettings', JSON.stringify(payload));
      
      showToast({
        title: '設定保存完了',
        message: `${settingName}の設定を正常に保存しました`,
        type: 'success'
      });
      
      // 設定が反映されたことを示す
      // 設定保存ログを記録
      const settingsLog = {
        ...payload,
        savedAt: new Date().toISOString(),
        user: 'current_user'
      };
      const logs = JSON.parse(localStorage.getItem('settingsLogs') || '[]');
      logs.push(settingsLog);
      localStorage.setItem('settingsLogs', JSON.stringify(logs));
      
    } catch (error) {
      showToast({
        title: '保存エラー',
        message: '設定の保存に失敗しました。もう一度お試しください。',
        type: 'error'
      });
    }
  };

  const handleDataExport = async () => {
    setIsExportConfirmModalOpen(true);
  };

  const confirmDataExport = async () => {
    setIsDataExporting(true);
    setIsExportConfirmModalOpen(false);

    try {
      // データエクスポート処理のシミュレーション
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // ダミーデータの生成
      const userData = {
        account: {
          id: 'USER-001',
          email: 'user@example.com',
          name: 'ユーザー名',
          created_at: '2024-01-01T00:00:00Z',
          last_login: new Date().toISOString()
        },
        settings: {
          notifications: true,
          language: 'ja',
          timezone: 'Asia/Tokyo'
        },
        export_date: new Date().toISOString(),
        export_type: 'full_account_data'
      };

      // JSONファイルとしてダウンロード
      const dataStr = JSON.stringify(userData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `account_data_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      showToast({
        type: 'success',
        title: 'データエクスポート完了',
        message: 'アカウントデータのエクスポートが完了しました。',
        duration: 5000
      });

    } catch (error) {
      console.error('データエクスポート中にエラーが発生しました:', error);
      showToast({
        type: 'error',
        title: 'エクスポートエラー',
        message: 'データのエクスポートに失敗しました。もう一度お試しください。',
        duration: 5000
      });
    } finally {
      setIsDataExporting(false);
    }
  };

  const handleAccountDelete = () => {
    setIsDeleteConfirmModalOpen(true);
  };

  const handleFirstConfirm = () => {
    setIsDeleteConfirmModalOpen(false);
    setIsSecondConfirmModalOpen(true);
  };

  const handleFinalDelete = async () => {
    setIsAccountDeleting(true);
    setIsSecondConfirmModalOpen(false);

    try {
      // アカウント削除処理のシミュレーション
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      showToast({
        type: 'success',
        title: 'アカウント削除完了',
        message: 'アカウントが正常に削除されました。ご利用ありがとうございました。',
        duration: 5000
      });

      // 削除後、ログインページにリダイレクト
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (error) {
      console.error('アカウント削除中にエラーが発生しました:', error);
      showToast({
        type: 'error',
        title: '削除エラー',
        message: 'アカウントの削除に失敗しました。サポートにお問い合わせください。',
        duration: 5000
      });
    } finally {
      setIsAccountDeleting(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="intelligence-card global">
          <div className="p-8">
            <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
              設定
            </h1>
            <p className="mt-2 text-nexus-text-secondary">
              システム設定とアカウント管理
            </p>
          </div>
        </div>

        {/* Delivery & Shipping Settings */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-nexus-text-primary">
                配送・発送設定
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <NexusButton
                  onClick={() => {
                    showToast({
                      type: 'success',
                      title: '配送業者設定',
                      message: '配送業者設定画面を開きました',
                      duration: 3000
                    });
                  }}
                  variant="default"
                  className="w-full justify-start h-auto p-4"
                >
                  <div className="text-left">
                    <div className="font-semibold">配送業者設定</div>
                    <div className="text-sm text-nexus-text-secondary">
                      配送業者の管理と設定
                    </div>
                  </div>
                </NexusButton>
              </div>
              
              <div>
                <NexusButton
                  onClick={() => {
                    showToast({
                      type: 'success',
                      title: '梱包材設定',
                      message: '梱包材設定画面を開きました',
                      duration: 3000
                    });
                  }}
                  variant="default"
                  className="w-full justify-start h-auto p-4"
                >
                  <div className="text-left">
                    <div className="font-semibold">梱包材設定</div>
                    <div className="text-sm text-nexus-text-secondary">
                      梱包材料の管理と設定
                    </div>
                  </div>
                </NexusButton>
              </div>
            </div>
          </div>
        </div>

        {/* Account Management */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-nexus-text-primary">
                アカウント管理
              </h2>
            </div>
            
            <div className="space-y-4">
              {/* データエクスポート */}
              <div className="p-4 border border-nexus-border rounded-lg">
                <h3 className="font-semibold text-nexus-text-primary mb-2">
                  データエクスポート
                </h3>
                <p className="text-sm text-nexus-text-secondary mb-4">
                  アカウントデータをJSONファイルとしてエクスポートできます。
                </p>
                <NexusButton
                  onClick={handleDataExport}
                  variant="default"
                >
                  エクスポート
                </NexusButton>
              </div>

              {/* 設定保存 */}
              <div className="p-4 border border-nexus-border rounded-lg">
                <h3 className="font-semibold text-nexus-text-primary mb-2">
                  設定保存
                </h3>
                <p className="text-sm text-nexus-text-secondary mb-4">
                  現在の設定を保存します
                </p>
                <NexusButton
                  onClick={() => handleSave('全体設定')}
                  variant="primary"
                >
                  保存
                </NexusButton>
              </div>

              {/* 設定更新 */}
              <div className="p-4 border border-nexus-border rounded-lg">
                <h3 className="font-semibold text-nexus-text-primary mb-2">
                  設定更新
                </h3>
                <p className="text-sm text-nexus-text-secondary mb-4">
                  最新の設定に更新します
                </p>
                <NexusButton
                  onClick={() => {
                    showToast({
                      type: 'success',
                      title: '設定更新',
                      message: '設定を最新の状態に更新しました',
                      duration: 3000
                    });
                  }}
                  variant="primary"
                >
                  更新
                </NexusButton>
              </div>

              {/* アカウント削除 */}
              <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  アカウント削除
                </h3>
                <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                  この操作は取り消すことができません。すべてのデータが永続的に削除されます。
                </p>
                <NexusButton
                  onClick={handleAccountDelete}
                  variant="danger"
                >
                  アカウントを削除
                </NexusButton>
              </div>
            </div>
          </div>
        </div>

        {/* 重要な注意事項 */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-nexus-text-primary">
                重要な注意事項
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-nexus-text-primary">データの保護について</h4>
                  <p className="text-sm text-nexus-text-secondary">
                    エクスポートされたデータは適切な場所に保存し、第三者に共有しないでください。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-nexus-text-primary">アカウント削除の影響</h4>
                  <p className="text-sm text-nexus-text-secondary">
                    アカウントを削除すると、すべてのデータ、設定、履歴が完全に削除されます。この操作は取り消すことができません。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* First Confirmation Modal */}
        <BaseModal
          isOpen={isDeleteConfirmModalOpen}
          onClose={() => setIsDeleteConfirmModalOpen(false)}
          title="アカウント削除の確認"
          size="md"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
            
            <div className="text-center space-y-3">
              <h3 className="text-lg font-medium text-nexus-text-primary">
                この操作は完全に元に戻すことができません
              </h3>
              <p className="text-nexus-text-secondary">
                すべてのデータが永久に削除されます。
              </p>
              <p className="text-nexus-text-secondary font-medium">
                本当に続行しますか？
              </p>
            </div>
            
            <div className="flex gap-4 justify-end">
              <NexusButton
                onClick={() => setIsDeleteConfirmModalOpen(false)}
                variant="default"
              >
                キャンセル
              </NexusButton>
              <NexusButton
                onClick={handleFirstConfirm}
                variant="danger"
                icon={<ExclamationTriangleIcon className="w-5 h-5" />}
              >
                続行
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* Second Confirmation Modal */}
        <BaseModal
          isOpen={isSecondConfirmModalOpen}
          onClose={() => setIsSecondConfirmModalOpen(false)}
          title="最終確認"
          size="md"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-nexus-text-primary text-center">
                最終確認
              </h3>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium mb-2">
                  この操作により以下が完全に削除されます：
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• アカウント情報</li>
                  <li>• 在庫データ</li>
                  <li>• 取引履歴</li>
                  <li>• 設定情報</li>
                </ul>
              </div>
              
              <p className="text-center text-nexus-text-secondary font-medium">
                本当に削除しますか？
              </p>
            </div>
            
            <div className="flex gap-4 justify-end">
              <NexusButton
                onClick={() => setIsSecondConfirmModalOpen(false)}
                variant="default"
              >
                キャンセル
              </NexusButton>
              <NexusButton
                onClick={handleFinalDelete}
                variant="danger"
                disabled={isAccountDeleting}
                icon={
                  isAccountDeleting ? (
                    <div className="animate-spin h-5 w-5 border-b-2 border-current rounded-full"></div>
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5" />
                  )
                }
              >
                {isAccountDeleting ? '削除中...' : '完全に削除'}
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* Export Confirmation Modal */}
        <BaseModal
          isOpen={isExportConfirmModalOpen}
          onClose={() => setIsExportConfirmModalOpen(false)}
          title="データエクスポートの確認"
          size="md"
        >
          <div className="space-y-6">
                         <div className="flex items-center justify-center mb-4">
               <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                 <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               </div>
             </div>
            
            <div className="text-center space-y-3">
              <h3 className="text-lg font-medium text-nexus-text-primary">
                データエクスポートを実行しますか？
              </h3>
              <p className="text-nexus-text-secondary">
                この操作により、アカウントデータがJSONファイルとしてダウンロードされます。
              </p>
            </div>
            
            <div className="flex gap-4 justify-end">
              <NexusButton
                onClick={() => setIsExportConfirmModalOpen(false)}
                variant="default"
              >
                キャンセル
              </NexusButton>
              <NexusButton
                onClick={confirmDataExport}
                variant="primary"
              >
                実行
              </NexusButton>
            </div>
          </div>
        </BaseModal>
      </div>
    </DashboardLayout>
  );
} 
