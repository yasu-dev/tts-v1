'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NexusLoadingSpinner } from '@/app/components/ui';
import NexusButton from '@/app/components/ui/NexusButton';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  description?: string;
  flowStep?: string; // 対応するフローステップID
}

interface MenuGroup {
  id: string;
  name: string;
  icon: React.ReactNode;
  role: 'seller' | 'staff' | 'system';
  color: string;
  bgColor: string;
  flowStep?: string; // 対応するフローステップID
  items: MenuItem[];
}

interface SidebarProps {
  userType?: 'seller' | 'staff';
}

export default function Sidebar({ userType }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['current']);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingPath, setLoadingPath] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // モバイル判定
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // パスが変わったらローディング状態をリセット
  useEffect(() => {
    setLoadingPath(null);
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // ナビゲーション処理
  const handleNavigation = (href: string, label: string) => {
    if (href === pathname) return; // 同じページの場合は何もしない
    
    // Next.jsルーターを使用した適切なナビゲーション
    setLoadingPath(href);
    
    // ローディング表示のために少し遅延してからルーター遷移
    setTimeout(() => {
      router.push(href);
    }, 150);
  };

  // 共通アイコンセット
  const icons = {
    dashboard: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    preparation: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
      </svg>
    ),
    inbound: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
    ),
    sales: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    shipping: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    completion: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    monitoring: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    support: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM12 18a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V18.75A.75.75 0 0112 18z" />
      </svg>
    ),
    tasks: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    inventory: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    inspection: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    location: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    listing: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    picking: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
      </svg>
    ),
    returns: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
      </svg>
    ),
    billing: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    reports: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    timeline: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    delivery: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    )
  };

  const sellerMenuGroups: MenuGroup[] = [
    {
      id: 'preparation',
      name: 'STEP 1: 準備フェーズ',
      icon: icons.preparation,
      role: 'seller',
      color: '#1565c0',
      bgColor: '#e3f2fd',
      flowStep: 'preparation',
      items: [
        {
          label: 'ダッシュボード',
          href: '/dashboard',
          icon: icons.dashboard,
          description: '全体状況確認',
          flowStep: 'preparation'
        },
        {
          label: '納品プラン作成',
          href: '/delivery-plan',
          icon: icons.preparation,
          badge: 2,
          description: '商品納品計画',
          flowStep: 'preparation'
        },
        {
          label: '納品管理',
          href: '/delivery',
          icon: icons.delivery,
          description: 'ATW倉庫発送',
          flowStep: 'preparation'
        }
      ]
    },
    {
      id: 'monitoring',
      name: '進行状況監視',
      icon: icons.monitoring,
      role: 'seller',
      color: '#43a047',
      bgColor: '#e8f5e8',
      items: [
        {
          label: '在庫状況',
          href: '/inventory',
          icon: icons.inventory,
          badge: 234,
          description: '全在庫状態確認',
          flowStep: 'inbound'
        },
        {
          label: '売上管理',
          href: '/sales',
          icon: icons.sales,
          description: '販売実績確認',
          flowStep: 'sales'
        },
        {
          label: '商品履歴',
          href: '/timeline',
          icon: icons.timeline,
          description: '商品追跡'
        }
      ]
    },
    {
      id: 'completion',
      name: 'STEP 5: 完了・精算',
      icon: icons.completion,
      role: 'seller',
      color: '#1565c0',
      bgColor: '#e3f2fd',
      flowStep: 'completion',
      items: [
        {
          label: '返品管理',
          href: '/returns',
          icon: icons.returns,
          badge: 2,
          description: '返品処理確認'
        },
        {
          label: '請求・精算',
          href: '/billing',
          icon: icons.billing,
          description: '売上精算確認',
          flowStep: 'completion'
        },
        {
          label: 'レポート',
          href: '/reports',
          icon: icons.reports,
          description: '分析レポート',
          flowStep: 'completion'
        }
      ]
    }
  ];

  const staffMenuGroups: MenuGroup[] = [
    {
      id: 'dashboard',
      name: 'ダッシュボード',
      icon: icons.dashboard,
      role: 'staff',
      color: '#8e24aa',
      bgColor: '#f3e5f5',
      items: [
        {
          label: 'スタッフダッシュボード',
          href: '/staff/dashboard',
          icon: icons.dashboard,
          description: '作業状況確認'
        },
        {
          label: 'タスク管理',
          href: '/staff/tasks',
          icon: icons.tasks,
          badge: 12,
          description: '緊急タスク'
        }
      ]
    },
    {
      id: 'inbound',
      name: 'STEP 2: 入庫フェーズ',
      icon: icons.inbound,
      role: 'staff',
      color: '#8e24aa',
      bgColor: '#f3e5f5',
      flowStep: 'inbound',
      items: [
        {
          label: '在庫管理',
          href: '/staff/inventory',
          icon: icons.inventory,
          description: '商品受取・登録',
          flowStep: 'inbound'
        },
        {
          label: '検品・撮影',
          href: '/staff/inspection',
          icon: icons.inspection,
          badge: 8,
          description: '品質チェック',
          flowStep: 'inbound'
        },
        {
          label: 'ロケーション管理',
          href: '/staff/location',
          icon: icons.location,
          description: '保管場所管理',
          flowStep: 'inbound'
        }
      ]
    },
    {
      id: 'listing',
      name: 'STEP 3: 出品管理',
      icon: icons.sales,
      role: 'staff',
      color: '#43a047',
      bgColor: '#e8f5e8',
      flowStep: 'sales',
      items: [
        {
          label: '出品管理',
          href: '/staff/listing',
          icon: icons.listing,
          description: 'eBay出品サポート',
          flowStep: 'sales'
        }
      ]
    },
    {
      id: 'shipping',
      name: 'STEP 4: 出荷フェーズ',
      icon: icons.shipping,
      role: 'staff',
      color: '#8e24aa',
      bgColor: '#f3e5f5',
      flowStep: 'shipping',
      items: [
        {
          label: 'ピッキング',
          href: '/staff/picking',
          icon: icons.picking,
          badge: 15,
          description: '商品ピッキング',
          flowStep: 'shipping'
        },
        {
          label: '出荷管理',
          href: '/staff/shipping',
          icon: icons.shipping,
          badge: 6,
          description: '梱包・発送',
          flowStep: 'shipping'
        }
      ]
    },
    {
      id: 'support',
      name: 'サポート業務',
      icon: icons.support,
      role: 'staff',
      color: '#ef4444',
      bgColor: '#ffebee',
      items: [
        {
          label: '返品処理',
          href: '/staff/returns',
          icon: icons.returns,
          badge: 3,
          description: '返品対応'
        },
        {
          label: '業務レポート',
          href: '/staff/reports',
          icon: icons.reports,
          description: '作業実績レポート'
        }
      ]
    }
  ];

  const menuGroups = userType === 'staff' ? staffMenuGroups : sellerMenuGroups;

  const handleLogout = async () => {
    try {
      // ログアウトAPI呼び出し
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      // セッションクリア
      localStorage.removeItem('userSession');
      sessionStorage.clear();
      
      // ログインページにリダイレクト
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // エラーが発生してもログインページにリダイレクト
      router.push('/login');
    }
  };

  const getCurrentGroup = () => {
    for (const group of menuGroups) {
      for (const item of group.items) {
        if (pathname === item.href) {
          return group.id;
        }
      }
    }
    return null;
  };

  const getFlowStepBadge = (flowStep?: string) => {
    if (!flowStep) return null;
    
    const stepNames: { [key: string]: string } = {
      'preparation': 'STEP 1',
      'inbound': 'STEP 2',
      'sales': 'STEP 3',
      'shipping': 'STEP 4',
      'completion': 'STEP 5'
    };
    
    return stepNames[flowStep];
  };

  const currentGroup = getCurrentGroup();

  return (
    <aside 
      className={`nexus-sidebar ${isCollapsed && !isMobile ? 'collapsed' : ''}`}
      role="navigation"
      aria-label="メインナビゲーション"
    >
      {/* Logo Section */}
      <div className="sidebar-logo" role="banner">
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="sidebar-logo-icon">
                W
              </div>
              {!isCollapsed && (
                <div className="sidebar-text">
                  <h2 className="text-sm font-bold text-gray-900">THE WORLD DOOR</h2>
                  <p className="text-[10px] text-gray-600">フルフィルメント</p>
                </div>
              )}
            </div>
            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title={isCollapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
              >
                <svg 
                  className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
          {!isCollapsed && (
            <div className="mt-2 flex items-center justify-between sidebar-text">
              <div className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-medium rounded-full">
                {userType === 'seller' ? 'セラー' : 'スタッフ'}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] text-gray-500">オンライン</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="sidebar-content">
        {/* Flow-based Navigation */}
        <nav className="space-y-2" role="navigation" aria-label="フローナビゲーション">
          {menuGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.id) || group.id === currentGroup;
            const isCurrentGroup = group.id === currentGroup;
            const flowStepBadge = getFlowStepBadge(group.flowStep);
            
            return (
              <div key={group.id} className="nav-cluster">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200
                    hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${isCurrentGroup ? 'ring-2 ring-blue-300 shadow-md' : ''}
                    ${isCollapsed ? 'justify-center p-2' : ''}
                  `}
                  style={{
                    backgroundColor: group.bgColor,
                    borderLeft: `4px solid ${group.color}`
                  }}
                  title={isCollapsed ? group.name : undefined}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <div 
                      className={`${isCollapsed ? 'p-2' : 'p-1.5'} rounded-lg`}
                      style={{ 
                        backgroundColor: `${group.color}20`,
                        color: group.color 
                      }}
                    >
                      {group.icon}
                    </div>
                    {!isCollapsed && (
                      <div className="text-left sidebar-text">
                        <div className="flex items-center gap-2">
                          <div 
                            className="text-xs font-bold"
                            style={{ color: group.color }}
                          >
                            {group.name}
                          </div>
                          {flowStepBadge && (
                            <span className="px-1.5 py-0.5 bg-white/50 text-[8px] font-bold rounded-full">
                              {flowStepBadge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {group.items.length}個のメニュー
                        </div>
                      </div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="flex items-center gap-2 sidebar-text">
                      {group.items.some(item => item.badge) && (
                        <div className="flex -space-x-1">
                          {group.items
                            .filter(item => item.badge)
                            .slice(0, 2)
                            .map((item, index) => (
                              <span
                                key={index}
                                className="w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center"
                              >
                                {item.badge! > 9 ? '9+' : item.badge}
                              </span>
                            ))}
                        </div>
                      )}
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Group Items */}
                {isExpanded && !isCollapsed && (
                  <div className="ml-3 mt-2 space-y-1">
                    {group.items.map((item) => {
                      const itemFlowStepBadge = getFlowStepBadge(item.flowStep);
                      const isLoading = loadingPath === item.href;
                      const isActive = pathname === item.href;
                      
                      return (
                        <button
                          key={item.href}
                          onClick={() => handleNavigation(item.href, item.label)}
                          disabled={isLoading}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
                            ${isActive ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-700'}
                            ${isLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <div className="flex-shrink-0 w-5 h-5">
                            {isLoading ? (
                              <NexusLoadingSpinner size="sm" variant="primary" />
                            ) : (
                              item.icon
                            )}
                          </div>
                          <div className="flex-1 min-w-0 sidebar-text">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">
                                {isLoading ? `${item.label}を読み込み中...` : item.label}
                              </span>
                              {itemFlowStepBadge && !isLoading && (
                                <span className="px-1 py-0.5 bg-blue-100 text-blue-600 text-[8px] font-bold rounded">
                                  {itemFlowStepBadge}
                                </span>
                              )}
                            </div>
                            {item.description && !isLoading && (
                              <div className="text-[10px] text-gray-500 truncate mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </div>
                          {item.badge && !isLoading && (
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                
                {/* Collapsed State - Show Icons Only */}
                {isCollapsed && !isMobile && (
                  <div className="mt-1 space-y-1">
                    {group.items.map((item) => {
                      const isLoading = loadingPath === item.href;
                      const isActive = pathname === item.href;
                      
                      return (
                        <button
                          key={item.href}
                          onClick={() => handleNavigation(item.href, item.label)}
                          disabled={isLoading}
                          title={isLoading ? `${item.label}を読み込み中...` : `${item.label}${item.description ? ` - ${item.description}` : ''}`}
                          className={`
                            flex items-center justify-center p-2 rounded-lg transition-all duration-200
                            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 relative
                            ${isActive ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-700'}
                            ${isLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <div className="w-5 h-5">
                            {isLoading ? (
                              <NexusLoadingSpinner size="sm" variant="primary" />
                            ) : (
                              item.icon
                            )}
                          </div>
                          {item.badge && !isLoading && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        
        {/* Performance Module */}
        <div className="performance-module" role="region" aria-label="パフォーマンス指標">
          <h3 className="module-header">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            システムパフォーマンス
          </h3>
          <div 
            className="quantum-gauge" 
            role="progressbar" 
            aria-valuemin={0} 
            aria-valuemax={100} 
            aria-valuenow={94}
            aria-label="システム稼働率"
          >
            <div className="gauge-energy"></div>
          </div>
          <div className="metrics-grid">
            <div className="metric-pod">
              <div className="metric-value" aria-label="アップタイム">99.9%</div>
              <div className="metric-label">アップタイム</div>
            </div>
            <div className="metric-pod">
              <div className="metric-value" aria-label="処理速度">0.3s</div>
              <div className="metric-label">処理速度</div>
            </div>
            <div className="metric-pod">
              <div className="metric-value" aria-label="同時接続">2,847</div>
              <div className="metric-label">同時接続</div>
            </div>
            <div className="metric-pod">
              <div className="metric-value" aria-label="エラー率">0.02%</div>
              <div className="metric-label">エラー率</div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="sidebar-footer">
        <NexusButton
          onClick={handleLogout}
          className="w-full"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          }
        >
          ログアウト
        </NexusButton>
      </div>
    </aside>
  );
}