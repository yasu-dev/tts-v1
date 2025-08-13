'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { NexusSelect, NexusButton, NexusCard, NexusLoadingSpinner } from '@/app/components/ui';

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
  const [userType, setUserType] = useState<'staff' | 'seller'>('seller');
  const [activeTab, setActiveTab] = useState<'settings' | 'notifications' | 'warehouse' | 'account'>('notifications');
  
  // 通知設定の状態管理
  const [notificationSettings, setNotificationSettings] = useState<any>({
    product_sold: true,
    inventory_alert: true,
    return_request: true,
    payment_issue: true,
    product_issue: true,
    shipping_issue: true,
    inspection_complete: false,
    payment_received: false,
    report_ready: false,
    system_update: false,
    promotion_available: false,
    monthly_summary: false
  });
  const [loadingNotifications, setLoadingNotifications] = useState(false);

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

    // 通知設定を取得
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      console.log('🔍 通知設定取得開始');
      setLoadingNotifications(true);
      
      const response = await fetch('/api/user/notification-settings', {
        headers: {
          'Authorization': 'Bearer fixed-auth-token-seller-1',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 通知設定API応答:', response.status, response.statusText);
      const data = await response.json();
      console.log('🔍 通知設定データ:', data);
      
      if (response.ok) {
        setNotificationSettings(data.settings);
        setUserType(data.userRole === 'seller' ? 'seller' : 'staff');
        console.log('✅ 通知設定取得成功:', data.settings);
      } else {
        console.error('❌ 通知設定取得エラー:', data.error);
      }
    } catch (error) {
      console.error('❌ 通知設定取得エラー:', error);
    } finally {
      setLoadingNotifications(false);
      console.log('🔍 通知設定取得処理完了');
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const saveNotificationSettings = async () => {
    try {
      const response = await fetch('/api/user/notification-settings', {
        method: 'PUT',
        headers: { 
          'Authorization': 'Bearer fixed-auth-token-seller-1',
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ settings: notificationSettings }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          title: '設定保存完了',
          message: '通知設定を保存しました',
          type: 'success'
        });
      } else {
        throw new Error(data.error || '保存に失敗しました');
      }
    } catch (error) {
      console.error('通知設定保存エラー:', error);
      showToast({
        title: '保存失敗',
        message: '通知設定の保存に失敗しました',
        type: 'error'
      });
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
        {/* 統一ヘッダー */}
        <UnifiedPageHeader
          title="設定"
          subtitle="システム設定とアカウント管理"
          userType={userType}
          iconType="settings"
        />

        {/* タブナビゲーション */}
        <div className="border-b border-nexus-border">
          <nav className="flex space-x-8" aria-label="設定タブ">
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-nexus-border'
              }`}
            >
              一般設定
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-nexus-border'
              }`}
            >
              通知設定
            </button>
            {userType === 'staff' && (
              <button
                onClick={() => setActiveTab('warehouse')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'warehouse'
                    ? 'border-primary-blue text-primary-blue'
                    : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-nexus-border'
                }`}
              >
                倉庫管理
              </button>
            )}
            <button
              onClick={() => setActiveTab('account')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'account'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-nexus-text-secondary hover:text-nexus-text-primary hover:border-nexus-border'
              }`}
            >
              アカウント管理
            </button>
          </nav>
        </div>

        {/* 通知設定タブ */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    通知設定
                  </h2>
                  <p className="text-gray-600 mt-1">
                    受信したい通知のタイプを選択してください
                  </p>
                </div>
                <button
                  onClick={saveNotificationSettings}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  設定保存
                </button>
              </div>

              {loadingNotifications ? (
                <div className="flex justify-center py-8">
                  <div className="text-gray-500">読み込み中...</div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* 緊急度の高い通知 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 text-red-500">⚠️</span>
                      緊急通知（推奨：ON）
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      セラーが早急にアクションを起こす必要がある重要な通知です
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">商品購入通知</h4>
                          <p className="text-sm text-gray-600">商品が売れた時の通知</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.product_sold || false}
                          onChange={(e) => handleNotificationChange('product_sold', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">在庫アラート</h4>
                          <p className="text-sm text-gray-600">在庫滞留や在庫切れアラート</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.inventory_alert || false}
                          onChange={(e) => handleNotificationChange('inventory_alert', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">返品処理</h4>
                          <p className="text-sm text-gray-600">返品要求やクレーム</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.return_request || false}
                          onChange={(e) => handleNotificationChange('return_request', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">支払い問題</h4>
                          <p className="text-sm text-gray-600">支払いエラーや未払い</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.payment_issue || false}
                          onChange={(e) => handleNotificationChange('payment_issue', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">商品問題</h4>
                          <p className="text-sm text-gray-600">商品に関する問題やクレーム</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.product_issue || false}
                          onChange={(e) => handleNotificationChange('product_issue', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">配送問題</h4>
                          <p className="text-sm text-gray-600">配送遅延やトラブル</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.shipping_issue || false}
                          onChange={(e) => handleNotificationChange('shipping_issue', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 情報通知 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 text-blue-500">ℹ️</span>
                      情報通知（推奨：お好みで）
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      定期的な確認で十分な情報のみの通知です
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">検品完了</h4>
                          <p className="text-sm text-gray-600">検品完了通知</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.inspection_complete || false}
                          onChange={(e) => handleNotificationChange('inspection_complete', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">入金確認</h4>
                          <p className="text-sm text-gray-600">売上金入金通知</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.payment_received || false}
                          onChange={(e) => handleNotificationChange('payment_received', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">レポート準備</h4>
                          <p className="text-sm text-gray-600">月次レポート等の準備完了</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.report_ready || false}
                          onChange={(e) => handleNotificationChange('report_ready', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">システム更新</h4>
                          <p className="text-sm text-gray-600">システムアップデートやメンテナンス</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.system_update || false}
                          onChange={(e) => handleNotificationChange('system_update', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">プロモーション情報</h4>
                          <p className="text-sm text-gray-600">キャンペーンやプロモーション</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.promotion_available || false}
                          onChange={(e) => handleNotificationChange('promotion_available', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900">月次サマリー</h4>
                          <p className="text-sm text-gray-600">月次売上サマリー</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings?.monthly_summary || false}
                          onChange={(e) => handleNotificationChange('monthly_summary', e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 一般設定タブ */}
        {activeTab === 'settings' && (
          <div style={{backgroundColor: 'blue', padding: '20px', color: 'white', fontSize: '18px'}}>
            <h2>一般設定タブ</h2>
            <p>基本設定がここに表示されます</p>
          </div>
        )}

        {/* アカウント管理タブ */}
        {activeTab === 'account' && (
          <div style={{backgroundColor: 'green', padding: '20px', color: 'white', fontSize: '18px'}}>
            <h2>アカウント管理タブ</h2>
            <p>アカウント管理がここに表示されます</p>
          </div>
        )}

        {/* 倉庫管理タブ */}
        {activeTab === 'warehouse' && userType === 'staff' && (
          <div style={{backgroundColor: 'purple', padding: '20px', color: 'white', fontSize: '18px'}}>
            <h2>倉庫管理タブ</h2>
            <p>倉庫管理がここに表示されます</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}