'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';

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

  useEffect(() => {
    // 実際の実裁E��はAPIから取征E
    const mockProfile: UserProfile = {
      name: '鈴木 花孁E,
      email: 'suzuki@theworlddoor.com',
      role: 'シニアスタチE��',
      joinDate: '2022年10朁E,
      lastLogin: '2025年1朁E6日 08:00',
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
                  プロフィール設宁E
                </h1>
                <p className="mt-1 text-sm text-nexus-text-secondary">
                  個人惁E��とアカウント設定を管琁E
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
                    編雁E
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
                      保孁E
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
              <h3 className="text-lg font-bold text-nexus-text-primary mb-6">基本惁E��</h3>
              
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
                    <p className="text-nexus-text-primary">{profile.phone || '未設宁E}</p>
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
                    <p className="text-nexus-text-primary">{profile.department || '未設宁E}</p>
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
            <h3 className="text-lg font-bold text-nexus-text-primary mb-6">セキュリチE��設宁E/h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-nexus-bg-secondary rounded-lg">
                <div>
                  <h4 className="font-medium text-nexus-text-primary">パスワード変更</h4>
                  <p className="text-sm text-nexus-text-secondary">アカウント�EセキュリチE��を保護するため定期皁E��パスワードを変更してください</p>
                </div>
                <button className="nexus-button">
                  変更
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-nexus-bg-secondary rounded-lg">
                <div>
                  <h4 className="font-medium text-nexus-text-primary">二段階認証</h4>
                  <p className="text-sm text-nexus-text-secondary">追加のセキュリチE��レイヤーでアカウントを保護</p>
                </div>
                <button className="nexus-button primary">
                  有効匁E
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 
