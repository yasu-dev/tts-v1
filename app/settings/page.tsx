'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';

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
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [userType, setUserType] = useState<'staff' | 'seller'>('staff');

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

  const handleSave = () => {
    alert('設定を保存しました');
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
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  アプリケーションの動作と表示設定を管理
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  className="nexus-button primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  設定を保存
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <div className="intelligence-card global">
            <div className="p-6">
              <h3 className="text-lg font-bold text-nexus-text-primary mb-6">表示設定</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    言語
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', 'language', e.target.value)}
                    className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-nexus-text-primary"
                  >
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    テーマ
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', 'theme', e.target.value)}
                    className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-nexus-text-primary"
                  >
                    <option value="light">ライト</option>
                    <option value="dark">ダーク</option>
                    <option value="auto">自動</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    タイムゾーン
                  </label>
                  <select
                    value={settings.preferences.timezone}
                    onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-nexus-text-primary"
                  >
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    日付形式
                  </label>
                  <select
                    value={settings.preferences.dateFormat}
                    onChange={(e) => handleSettingChange('preferences', 'dateFormat', e.target.value)}
                    className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-nexus-text-primary"
                  >
                    <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="intelligence-card global">
            <div className="p-6">
              <h3 className="text-lg font-bold text-nexus-text-primary mb-6">通知設定</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-nexus-text-primary">メール通知</h4>
                    <p className="text-sm text-nexus-text-secondary">重要な更新をメールで受け取る</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-nexus-text-primary">プッシュ通知</h4>
                    <p className="text-sm text-nexus-text-secondary">モバイルデバイスに通知を送信</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-nexus-text-primary">デスクトップ通知</h4>
                    <p className="text-sm text-nexus-text-secondary">ブラウザ通知を表示</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.desktop}
                      onChange={(e) => handleSettingChange('notifications', 'desktop', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="intelligence-card global">
            <div className="p-6">
              <h3 className="text-lg font-bold text-nexus-text-primary mb-6">プライバシー設定</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    プロフィール表示
                  </label>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                    className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-nexus-text-primary"
                  >
                    <option value="public">公開</option>
                    <option value="private">非公開</option>
                    <option value="team">チームのみ</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-nexus-text-primary">活動追跡</h4>
                    <p className="text-sm text-nexus-text-secondary">パフォーマンス向上のため活動データを収集</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.activityTracking}
                      onChange={(e) => handleSettingChange('privacy', 'activityTracking', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div className="intelligence-card global">
            <div className="p-6">
              <h3 className="text-lg font-bold text-nexus-text-primary mb-6">アカウント管理</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-nexus-bg-secondary rounded-lg">
                  <div>
                    <h4 className="font-medium text-nexus-text-primary">データエクスポート</h4>
                    <p className="text-sm text-nexus-text-secondary">個人データをダウンロード</p>
                  </div>
                  <button className="nexus-button">
                    エクスポート
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-800">アカウント削除</h4>
                    <p className="text-sm text-red-600">この操作は元に戻せません</p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    削除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 
