'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import {
  KeyIcon,
  ShieldCheckIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusInput from '@/app/components/ui/NexusInput';
import NexusRadioGroup from '@/app/components/ui/NexusRadioGroup';
import NexusCheckbox from '@/app/components/ui/NexusCheckbox';
import BaseModal from '@/app/components/ui/BaseModal';
import { NexusLoadingSpinner } from '@/app/components/ui';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  lastLogin: string;
  phone?: string;
  department?: string;
  employeeId?: string;
  profileImage?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<'staff' | 'seller'>('staff');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [authMethod, setAuthMethod] = useState('sms');
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    orderUpdates: true,
    systemAlerts: true,
    marketing: false
  });

  useEffect(() => {
    // 実際の実装はAPIから取得
    const mockProfile: UserProfile = {
      id: 'user-001',
      name: '鈴木 花子',
      email: 'suzuki@theworlddoor.com',
      role: 'シニアスタッフ',
      joinDate: '2022年10月',
      lastLogin: '2025年1月6日 08:00',
      phone: '090-1234-5678',
      department: '検品・撮影部',
      employeeId: 'STF-2022-001',
    };
    setProfile(mockProfile);
    setEditForm(mockProfile);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editForm) {
      try {
        // バリデーション
        if (!editForm.name || !editForm.email) {
          showToast({
            title: '入力エラー',
            message: '名前とメールアドレスは必須です',
            type: 'warning'
          });
          return;
        }
        
        // APIシミュレーション（実際のプロフィール更新処理）
        const payload = {
          ...editForm,
          updatedAt: new Date().toISOString()
        };
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // データベース更新をシミュレート
        localStorage.setItem('userProfile', JSON.stringify(payload));
        
        // 状態を更新
        setProfile(editForm);
        setIsEditing(false);
        
        showToast({
          title: 'プロフィール更新完了',
          message: 'プロフィール情報を正常に更新しました',
          type: 'success'
        });
        
        // プロフィール更新ログを記録
      const profileLog = {
        action: 'profile_update',
        timestamp: new Date().toISOString(),
        user: 'current_user',
        changes: Object.keys(payload)
      };
      const logs = JSON.parse(localStorage.getItem('profileLogs') || '[]');
      logs.push(profileLog);
      localStorage.setItem('profileLogs', JSON.stringify(logs));
        
      } catch (error) {
        showToast({
          title: '更新エラー',
          message: 'プロフィールの更新に失敗しました。もう一度お試しください。',
          type: 'error'
        });
      }
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  const handleChangePassword = async () => {
    try {
      // フォームデータの取得をシミュレート
      const currentPassword = 'dummy_current'; // 実際はフォームから取得
      const newPassword = 'dummy_new'; // 実際はフォームから取得
      const confirmPassword = 'dummy_new'; // 実際はフォームから取得
      
      // バリデーション
      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast({
          title: '入力エラー',
          message: 'すべてのフィールドを入力してください',
          type: 'warning'
        });
        return;
      }
      
      if (newPassword !== confirmPassword) {
        showToast({
          title: 'パスワード不一致',
          message: '新しいパスワードと確認用パスワードが一致しません',
          type: 'warning'
        });
        return;
      }
      
      if (newPassword.length < 8) {
        showToast({
          title: 'パスワード強度不足',
          message: 'パスワードは8文字以上で設定してください',
          type: 'warning'
        });
        return;
      }
      
      // APIシミュレーション（実際のパスワード変更処理）
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // セキュリティ関連の処理をシミュレート
      const passwordChangeLog = {
        userId: profile?.id,
        timestamp: new Date().toISOString(),
        action: 'password_change',
        ipAddress: '192.168.1.1' // 実際はクライアントIPを取得
      };
      
      localStorage.setItem('lastPasswordChange', JSON.stringify(passwordChangeLog));
      
      showToast({
        title: 'パスワード変更完了',
        message: 'パスワードを正常に変更しました。次回ログイン時から新しいパスワードが必要です。',
        type: 'success'
      });
      
      setIsPasswordModalOpen(false);
      // パスワード変更ログを記録
      const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
      logs.push(passwordChangeLog);
      localStorage.setItem('securityLogs', JSON.stringify(logs));
      
    } catch (error) {
      showToast({
        title: 'パスワード変更エラー',
        message: 'パスワードの変更に失敗しました。もう一度お試しください。',
        type: 'error'
      });
    }
  };

  const handleSecurityEnable = async () => {
    try {
      // 認証方法を状態から取得
      
      // バリデーション
      if (!authMethod) {
        showToast({
          title: '認証方法未選択',
          message: '認証方法を選択してください',
          type: 'warning'
        });
        return;
      }
      
      // 二段階認証設定処理をシミュレート
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // シークレットキーの生成をシミュレート
      const secretKey = `TWO_FA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 二段階認証設定を保存
      const twoFactorConfig = {
        userId: profile?.id,
        enabled: true,
        method: authMethod,
        secretKey: secretKey,
        enabledAt: new Date().toISOString(),
        backupCodes: Array(8).fill(0).map(() => Math.random().toString(36).substr(2, 8))
      };
      
      localStorage.setItem('twoFactorAuth', JSON.stringify(twoFactorConfig));
      
      showToast({
        title: '二段階認証有効化完了',
        message: '二段階認証を正常に有効にしました。バックアップコードを安全な場所に保管してください。',
        type: 'success'
      });
      
      setIsSecurityModalOpen(false);
      // 二段階認証設定ログを記録
      const twoFactorLog = {
        action: 'two_factor_setup',
        timestamp: new Date().toISOString(),
        user: 'current_user',
        enabled: twoFactorConfig.enabled
      };
      const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
      logs.push(twoFactorLog);
      localStorage.setItem('securityLogs', JSON.stringify(logs));
      
    } catch (error) {
      showToast({
        title: '設定エラー',
        message: '二段階認証の設定に失敗しました。もう一度お試しください。',
        type: 'error'
      });
    }
  };

  const handleNotificationSave = async () => {
    try {
      // 通知設定保存処理をシミュレート
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 通知設定を保存
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      
      showToast({
        title: '通知設定更新完了',
        message: '通知設定を正常に更新しました',
        type: 'success'
      });
      
      setIsNotificationModalOpen(false);
      
      // 通知設定ログを記録
      const notificationLog = {
        action: 'notification_settings_update',
        timestamp: new Date().toISOString(),
        user: 'current_user',
        settings: notificationSettings
      };
      const logs = JSON.parse(localStorage.getItem('notificationLogs') || '[]');
      logs.push(notificationLog);
      localStorage.setItem('notificationLogs', JSON.stringify(logs));
      
    } catch (error) {
      showToast({
        title: '設定エラー',
        message: '通知設定の更新に失敗しました。もう一度お試しください。',
        type: 'error'
      });
    }
  };

  const handleNotificationChange = (key: keyof typeof notificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoadingSpinner size="lg" />
      </div>
    );
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
                  プロフィール設定
                </h1>
                <p className="text-nexus-text-secondary">
                  個人情報とアカウント設定を管理
                </p>
              </div>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <NexusButton
                    onClick={handleEdit}
                    variant="primary"
                    icon={<PencilIcon className="w-5 h-5" />}
                  >
                    編集
                  </NexusButton>
                ) : (
                  <>
                    <NexusButton
                      onClick={handleCancel}
                      icon={<XMarkIcon className="w-5 h-5" />}
                    >
                      キャンセル
                    </NexusButton>
                    <NexusButton
                      onClick={handleSave}
                      variant="primary"
                      icon={<CheckIcon className="w-5 h-5" />}
                    >
                      保存
                    </NexusButton>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Image & Basic Info */}
          <div className="intelligence-card global">
            <div className="p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 mx-auto mb-4">
                  {profile.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-nexus-text-primary">{profile.name}</h2>
                <p className="text-nexus-text-secondary">{profile.role}</p>
                <p className="text-sm text-nexus-text-secondary mt-2">
                  入社: {profile.joinDate}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 intelligence-card global">
            <div className="p-6">
              <h3 className="text-lg font-bold text-nexus-text-primary mb-6">基本情報</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {isEditing ? (
                    <NexusInput
                      type="text"
                      label="氏名"
                      value={editForm?.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                        氏名
                      </label>
                      <p className="text-nexus-text-primary">{profile.name}</p>
                    </div>
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <NexusInput
                      type="email"
                      label="メールアドレス"
                      value={editForm?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                        メールアドレス
                      </label>
                      <p className="text-nexus-text-primary">{profile.email}</p>
                    </div>
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <NexusInput
                      type="tel"
                      label="電話番号"
                      value={editForm?.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                        電話番号
                      </label>
                      <p className="text-nexus-text-primary">{profile.phone || '未設定'}</p>
                    </div>
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <NexusInput
                      type="text"
                      label="部署"
                      value={editForm?.department || ''}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                        部署
                      </label>
                      <p className="text-nexus-text-primary">{profile.department || '未設定'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    社員ID
                  </label>
                  <p className="text-nexus-text-primary">{profile.employeeId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    最終ログイン
                  </label>
                  <p className="text-nexus-text-primary">{profile.lastLogin}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="intelligence-card global">
          <div className="p-6">
            <h3 className="text-lg font-bold text-nexus-text-primary mb-6">セキュリティ設定</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-nexus-bg-secondary rounded-lg">
                <div>
                  <h4 className="font-medium text-nexus-text-primary">パスワード変更</h4>
                  <p className="text-sm text-nexus-text-secondary">アカウントのセキュリティを保護するために定期的にパスワードを変更してください</p>
                </div>
                <NexusButton
                  onClick={() => setIsPasswordModalOpen(true)}
                  icon={<KeyIcon className="w-5 h-5" />}
                >
                  変更
                </NexusButton>
              </div>

              <div className="flex items-center justify-between p-4 bg-nexus-bg-secondary rounded-lg">
                <div>
                  <h4 className="font-medium text-nexus-text-primary">二段階認証</h4>
                  <p className="text-sm text-nexus-text-secondary">追加のセキュリティレイヤーでアカウントを保護</p>
                </div>
                <NexusButton
                  onClick={() => setIsSecurityModalOpen(true)}
                  variant="primary"
                  icon={<ShieldCheckIcon className="w-5 h-5" />}
                >
                  有効
                </NexusButton>
              </div>

              <div className="flex items-center justify-between p-4 bg-nexus-bg-secondary rounded-lg">
                <div>
                  <h4 className="font-medium text-nexus-text-primary">通知設定</h4>
                  <p className="text-sm text-nexus-text-secondary">メール、プッシュ通知、SMSの設定を管理</p>
                </div>
                <NexusButton
                  onClick={() => setIsNotificationModalOpen(true)}
                  variant="default"
                  icon={<BellIcon className="w-5 h-5" />}
                >
                  設定
                </NexusButton>
              </div>
            </div>
          </div>
        </div>
        
        {/* Password Change Modal */}
        <BaseModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          title="パスワード変更"
          size="md"
        >
          <div className="space-y-6">
            <NexusInput
              type="password"
              label="現在のパスワード"
              placeholder="現在のパスワードを入力"
              variant="nexus"
            />
            
            <NexusInput
              type="password"
              label="新しいパスワード"
              placeholder="新しいパスワードを入力"
              variant="nexus"
            />
            
            <NexusInput
              type="password"
              label="新しいパスワード（確認）"
              placeholder="新しいパスワードを再入力"
              variant="nexus"
            />
            
            <div className="flex gap-4 justify-end mt-6">
              <NexusButton 
                onClick={() => setIsPasswordModalOpen(false)}
                icon={<XMarkIcon className="w-5 h-5" />}
              >
                キャンセル
              </NexusButton>
              <NexusButton 
                onClick={handleChangePassword} 
                variant="primary"
                icon={<CheckIcon className="w-5 h-5" />}
              >
                変更
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* Security Modal */}
        <BaseModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
          title="二段階認証設定"
          size="md"
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-nexus-text-primary mb-2">
                二段階認証を有効にする
              </h3>
              <p className="text-sm text-nexus-text-secondary mb-6">
                アカウントの安全性を向上させるため、ログイン時に追加の認証コードが必要になります。
              </p>
            </div>
            
            <div className="bg-nexus-bg-secondary p-4 rounded-lg">
              <NexusRadioGroup
                name="authMethod"
                value={authMethod}
                onChange={setAuthMethod}
                label="認証方法"
                options={[
                  { value: 'sms', label: 'SMS認証' },
                  { value: 'email', label: 'メール認証' },
                  { value: 'app', label: '認証アプリ' }
                ]}
                variant="nexus"
                size="md"
                direction="vertical"
              />
            </div>
            
            <div className="flex gap-4 justify-end">
              <NexusButton 
                onClick={() => setIsSecurityModalOpen(false)}
                icon={<XMarkIcon className="w-5 h-5" />}
              >
                キャンセル
              </NexusButton>
              <NexusButton 
                onClick={handleSecurityEnable} 
                variant="primary"
                icon={<ShieldCheckIcon className="w-5 h-5" />}
              >
                有効にする
              </NexusButton>
            </div>
          </div>
        </BaseModal>

        {/* Notification Settings Modal */}
        <BaseModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          title="通知設定"
          size="md"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-nexus-text-primary">通知方法</h4>
              
              <NexusCheckbox
                checked={notificationSettings.email}
                onChange={(e) => handleNotificationChange('email', e.target.checked)}
                label="メール通知"
                description="重要な情報をメールで受け取る"
                variant="nexus"
              />
              
              <NexusCheckbox
                checked={notificationSettings.push}
                onChange={(e) => handleNotificationChange('push', e.target.checked)}
                label="プッシュ通知"
                description="リアルタイムでブラウザ通知を受け取る"
                variant="nexus"
              />
              
              <NexusCheckbox
                checked={notificationSettings.sms}
                onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                label="SMS通知"
                description="緊急時にSMSで通知を受け取る"
                variant="nexus"
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-nexus-text-primary">通知内容</h4>
              
              <NexusCheckbox
                checked={notificationSettings.orderUpdates}
                onChange={(e) => handleNotificationChange('orderUpdates', e.target.checked)}
                label="注文更新"
                description="注文状態の変更や更新通知"
                variant="nexus"
              />
              
              <NexusCheckbox
                checked={notificationSettings.systemAlerts}
                onChange={(e) => handleNotificationChange('systemAlerts', e.target.checked)}
                label="システムアラート"
                description="システムメンテナンスや障害情報"
                variant="nexus"
              />
              
              <NexusCheckbox
                checked={notificationSettings.marketing}
                onChange={(e) => handleNotificationChange('marketing', e.target.checked)}
                label="マーケティング情報"
                description="プロモーションや新機能のお知らせ"
                variant="nexus"
              />
            </div>
            
            <div className="flex gap-4 justify-end">
              <NexusButton 
                onClick={() => setIsNotificationModalOpen(false)}
                icon={<XMarkIcon className="w-5 h-5" />}
              >
                キャンセル
              </NexusButton>
              <NexusButton 
                onClick={handleNotificationSave} 
                variant="primary"
                icon={<CheckIcon className="w-5 h-5" />}
              >
                保存
              </NexusButton>
            </div>
          </div>
        </BaseModal>
      </div>
    </DashboardLayout>
  );
} 
