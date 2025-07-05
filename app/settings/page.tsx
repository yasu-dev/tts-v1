'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { NexusSelect, NexusButton } from '@/app/components/ui';
import ContentCard from '../components/ui/ContentCard';

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

  const handleSave = (settingName: string) => {
    showToast({
      title: '設定保存',
      message: `${settingName}の設定を保存しました`,
      type: 'success'
    });
  };

  const handleDataExport = async () => {
    setIsDataExporting(true);
    
    // 確認ダイアログ
    const confirmed = window.confirm('個人データをエクスポートしますか？\n\nこの操作により、アカウントに関連するすべてのデータがJSONファイルとしてダウンロードされます。');
    
    if (!confirmed) {
      setIsDataExporting(false);
      return;
    }

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

  const handleAccountDelete = async () => {
    setIsAccountDeleting(true);
    
    // 二重確認ダイアログ
    const firstConfirm = window.confirm('⚠️ アカウント削除の確認\n\nこの操作は完全に元に戻すことができません。\nすべてのデータが永久に削除されます。\n\n本当に続行しますか？');
    
    if (!firstConfirm) {
      setIsAccountDeleting(false);
      return;
    }

    const secondConfirm = window.confirm('⚠️ 最終確認\n\n「削除」と入力してください。\n\nこの操作により以下が完全に削除されます：\n• アカウント情報\n• 在庫データ\n• 取引履歴\n• 設定情報\n\n本当に削除しますか？');
    
    if (!secondConfirm) {
      setIsAccountDeleting(false);
      return;
    }

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
    return <div>読み込み中...</div>;
  }

  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-6">
        {/* Header */}
        <div className="intelligence-card global">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary">
                  アカウント設定
                </h1>
                <p className="text-nexus-text-secondary">
                  アカウント情報とデータ管理
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Management */}
        <div className="intelligence-card global">
          <div className="p-6">
            <h3 className="text-lg font-bold text-nexus-text-primary mb-6">アカウント管理</h3>
            
            <div className="space-y-4">
              {/* データエクスポート */}
              <div className="flex items-center justify-between p-4 bg-nexus-bg-secondary rounded-lg">
                <div>
                  <h4 className="font-medium text-nexus-text-primary">データエクスポート</h4>
                  <p className="text-sm text-nexus-text-secondary">
                    個人データを安全にダウンロードし、バックアップを作成します
                  </p>
                </div>
                <button
                  onClick={handleDataExport}
                  className="nexus-button"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                  </svg>
                  エクスポート
                </button>
              </div>

              {/* アカウント削除 */}
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-red-800">アカウント削除</h4>
                  <p className="text-sm text-red-600">
                    この操作は完全に元に戻せません。すべてのデータが永久に削除されます。
                  </p>
                </div>
                <button
                  onClick={handleAccountDelete}
                  className="nexus-button danger"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  削除
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 重要な注意事項 */}
        <div className="intelligence-card global">
          <div className="p-6">
            <h3 className="text-lg font-bold text-nexus-text-primary mb-6">重要な注意事項</h3>
            
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
      </div>
    </DashboardLayout>
  );
} 
