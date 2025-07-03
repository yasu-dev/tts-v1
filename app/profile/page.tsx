'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import {
  KeyIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface UserProfile {
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<'staff' | 'seller'>('staff');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    // 実際の実装はAPIから取得
    const mockProfile: UserProfile = {
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

  const handleSave = () => {
    if (editForm) {
      setProfile(editForm);
      setIsEditing(false);
      alert('プロフィールを更新しました');
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

  const handleChangePassword = () => {
    // TODO: パスワード変更APIを呼び出す
    alert('パスワードを変更しました。');
    setIsPasswordModalOpen(false);
  };

  if (!profile) {
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
                  プロフィール設定
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  個人情報とアカウント設定を管理
                </p>
              </div>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="nexus-button primary"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    編集
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="nexus-button"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleSave}
                      className="nexus-button primary"
                    >
                      保存
                    </button>
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
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    氏名
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm?.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-nexus-text-primary"
                    />
                  ) : (
                    <p className="text-nexus-text-primary">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    メールアドレス
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-nexus-text-primary"
                    />
                  ) : (
                    <p className="text-nexus-text-primary">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    電話番号
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm?.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-nexus-text-primary"
                    />
                  ) : (
                    <p className="text-nexus-text-primary">{profile.phone || '未設定'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    部署
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm?.department || ''}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg text-nexus-text-primary"
                    />
                  ) : (
                    <p className="text-nexus-text-primary">{profile.department || '未設定'}</p>
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
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="nexus-button"
                >
                  <KeyIcon className="w-5 h-5 mr-2" />
                  変更
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-nexus-bg-secondary rounded-lg">
                <div>
                  <h4 className="font-medium text-nexus-text-primary">二段階認証</h4>
                  <p className="text-sm text-nexus-text-secondary">追加のセキュリティレイヤーでアカウントを保護</p>
                </div>
                <button
                  onClick={() => router.push('/settings/security')}
                  className="nexus-button primary"
                >
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  有効
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Password Change Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">パスワード変更</h2>
              {/* TODO: パスワード変更フォームを実装 */}
              <div className="text-right mt-6">
                <button onClick={() => setIsPasswordModalOpen(false)} className="nexus-button mr-2">キャンセル</button>
                <button onClick={handleChangePassword} className="nexus-button primary">変更</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 
