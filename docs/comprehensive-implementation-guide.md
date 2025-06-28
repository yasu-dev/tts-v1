# 📋 FBT-v1 包括的実装ガイド - 機能ギャップ是正 & UI/UX改善

_目的：要件定義書との整合性確保と世界最高水準UI/UXの実現_

---

## 🎯 実装概要

| 項目 | 内容 |
|------|------|
| **フロントエンド** | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| **状態管理** | TanStack Query v5 + Zustand |
| **HTTP通信** | Axios (fetch から移行) |
| **UI ライブラリ** | Radix UI + Tailwind (Material-UI は非採用) |
| **可視化** | Chart.js + react-chartjs-2 |
| **スキャン** | QuaggaJS (バーコード読取) |
| **ファイル** | react-dropzone + @react-pdf/renderer |
| **テスト** | Jest + React Testing Library |

---

## 🔴 Phase 1: 最優先機能実装（P0 - 機能ギャップ是正）

### タスク 1: 認証・アカウント管理システム

#### 実装ファイル
```
app/(auth)/login/page.tsx
app/(auth)/register/page.tsx  
app/(auth)/two-factor/page.tsx
app/admin/users/page.tsx
app/admin/users/[id]/page.tsx
components/features/auth/login-form.tsx
components/features/auth/totp-setup.tsx
components/features/users/user-table.tsx
components/features/users/role-selector.tsx
store/auth.ts
lib/auth.ts
```

#### 実装内容
```typescript
// store/auth.ts - Zustand認証ストア
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setupTOTP: (secret: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const response = await authApi.login({ email, password });
        set({ 
          user: response.user, 
          token: response.token, 
          isAuthenticated: true 
        });
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setupTOTP: async (secret) => {
        await authApi.setupTOTP(secret);
        // TOTP設定完了処理
      },
    }),
    { name: 'auth-storage' }
  )
);

// app/(auth)/login/page.tsx
export default function LoginPage() {
  const { login } = useAuthStore();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onSubmit={login} />
    </div>
  );
}

// components/features/auth/login-form.tsx  
export function LoginForm({ onSubmit }: { onSubmit: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(email, password); }}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="メールアドレス"
        className="w-full p-3 border rounded-lg"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="パスワード"
        className="w-full p-3 border rounded-lg mt-4"
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg mt-4">
        ログイン
      </button>
    </form>
  );
}
```

### タスク 2: 納品プラン作成ウィザード

#### 実装ファイル
```
app/delivery-plans/new/page.tsx
app/delivery-plans/page.tsx
components/features/delivery-plan/wizard.tsx
components/features/delivery-plan/csv-uploader.tsx
components/features/delivery-plan/barcode-generator.tsx
lib/barcode.ts
lib/pdf-generator.ts
```

#### 実装内容
```typescript
// components/features/delivery-plan/wizard.tsx
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface WizardStep {
  id: number;
  title: string;
  component: React.ComponentType<any>;
}

export function DeliveryPlanWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [planData, setPlanData] = useState({
    basicInfo: {},
    products: [],
    confirmation: {}
  });

  const steps: WizardStep[] = [
    { id: 1, title: '基本情報', component: BasicInfoStep },
    { id: 2, title: '商品登録', component: ProductRegistrationStep },
    { id: 3, title: '確認・出力', component: ConfirmationStep },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`flex items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              {step.id}
            </div>
            <span className="ml-2">{step.title}</span>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        {React.createElement(steps[currentStep].component, {
          data: planData,
          onUpdate: setPlanData,
          onNext: () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1)),
          onPrev: () => setCurrentStep(prev => Math.max(prev - 1, 0)),
        })}
      </div>
    </div>
  );
}

// components/features/delivery-plan/csv-uploader.tsx
export function CSVUploader({ onUpload }: { onUpload: (data: any[]) => void }) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls', '.xlsx']
    },
    onDrop: async (files) => {
      const file = files[0];
      const text = await file.text();
      const data = parseCSV(text);
      onUpload(data);
    }
  });

  return (
    <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer">
      <input {...getInputProps()} />
      <div className="text-gray-600">
        <p>CSVファイルをドラッグ&ドロップ</p>
        <p className="text-sm mt-2">または クリックしてファイルを選択</p>
      </div>
    </div>
  );
}
```

### タスク 3: 入庫検品モジュール

#### 実装ファイル
```
app/inspection/page.tsx
app/inspection/[id]/page.tsx
components/features/inspection/scanner.tsx
components/features/inspection/checklist.tsx
components/features/inspection/photo-uploader.tsx
lib/scanner.ts
```

#### 実装内容
```typescript
// components/features/inspection/scanner.tsx
import Quagga from 'quagga';
import { useEffect, useRef } from 'react';

export function BarcodeScanner({ onScan }: { onScan: (code: string) => void }) {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scannerRef.current) {
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current
        },
        decoder: {
          readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader"]
        }
      }, (err) => {
        if (err) {
          console.error('Scanner init error:', err);
          return;
        }
        Quagga.start();
      });

      Quagga.onDetected((data) => {
        onScan(data.codeResult.code);
      });
    }

    return () => {
      Quagga.stop();
    };
  }, [onScan]);

  return (
    <div className="relative">
      <div ref={scannerRef} className="w-full h-64 bg-black rounded-lg"></div>
      <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-sm">
        バーコードをカメラに向けてください
      </div>
    </div>
  );
}

// components/features/inspection/checklist.tsx
export function InspectionChecklist({ items, onUpdate }: { 
  items: ChecklistItem[], 
  onUpdate: (items: ChecklistItem[]) => void 
}) {
  const handleCheck = (index: number, checked: boolean) => {
    const updated = [...items];
    updated[index].checked = checked;
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={(e) => handleCheck(index, e.target.checked)}
            className="w-5 h-5"
          />
          <span className={item.checked ? 'line-through text-gray-500' : ''}>
            {item.label}
          </span>
          {item.required && <span className="text-red-500">*</span>}
        </div>
      ))}
    </div>
  );
}
```

### タスク 4: 在庫管理詳細画面

#### 実装ファイル
```
app/inventory/page.tsx
app/inventory/[id]/page.tsx
app/inventory/locations/page.tsx
components/features/inventory/inventory-table.tsx
components/features/inventory/location-manager.tsx
components/features/inventory/movement-history.tsx
components/features/inventory/advanced-filters.tsx
```

### タスク 5: 撮影依頼・メディア管理

#### 実装ファイル
```
app/photography/page.tsx
app/photography/calendar/page.tsx
app/photography/[id]/page.tsx
components/features/photography/booking-calendar.tsx
components/features/photography/media-uploader.tsx
components/features/photography/ai-background-remover.tsx
lib/calendar.ts
```

### タスク 6-12: 残りの機能群
```
- 出品管理（テンプレート・一括出品）
- 受注→ピッキング→梱包フロー
- 発送連携・追跡
- 返品処理ワークフロー
- 課題管理（カンバンボード）
- 請求・決済システム
- 詳細レポート・分析
```

---

## 🟠 Phase 2: 技術スタック整合（P1）

### 依存関係インストール
```bash
# 状態管理
npm install zustand immer

# HTTP通信
npm install axios

# UI・可視化
npm install chart.js react-chartjs-2 vis-network

# ファイル・スキャン
npm install react-dropzone quagga @react-pdf/renderer

# カレンダー・D&D
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid
npm install @dnd-kit/core @dnd-kit/sortable

# リッチテキスト
npm install @tiptap/react @tiptap/starter-kit

# 開発・テスト
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### API クライアント統一
```typescript
// lib/api-client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 10000,
});

// リクエストインターセプター
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラー処理
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🟡 Phase 3: UI/UX適正化（P2）

### パフォーマンス最適化
```css
/* app/globals.css の修正 */

/* Glass-morphism 軽量化 */
.glass-card {
  backdrop-filter: blur(10px); /* 25px → 10px */
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* アニメーション時間短縮 */
.animate-float {
  animation: float 2s ease-in-out infinite; /* 6s → 2s */
}

/* Reduced motion 対応 */
@media (prefers-reduced-motion: reduce) {
  .animate-float,
  .animate-pulse,
  .animate-spin {
    animation: none;
  }
}
```

### アクセシビリティ改善
```typescript
// components/ui/button.tsx の改善
export function Button({ children, onClick, disabled, ...props }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.(e as any);
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## 🚀 実装順序・スケジュール

### Week 1: 基盤整備
- Day 1-2: 認証システム実装
- Day 3-4: 状態管理・API統合
- Day 5: UI コンポーネント整理

### Week 2: 業務機能実装
- Day 1-2: 納品プラン・入庫検品
- Day 3-4: 在庫管理・撮影依頼
- Day 5: 出品管理

### Week 3: 受注フロー実装
- Day 1-2: 受注→ピッキング→梱包
- Day 3-4: 発送・返品管理
- Day 5: 課題管理カンバン

### Week 4: 分析・最適化
- Day 1-2: 請求・レポート機能
- Day 3-4: UI/UX最適化・テスト
- Day 5: 統合テスト・デプロイ

---

## ✅ 完了判定基準

| 機能カテゴリ | 合格基準 |
|-------------|----------|
| **認証** | ログイン・2FA・ロール切替が正常動作 |
| **納品プラン** | CSV取込→バーコードPDF出力が完了 |
| **検品** | バーコードスキャン→ステータス更新 |
| **在庫** | フィルタ・ソート・移動履歴表示 |
| **撮影** | カレンダー予約・画像アップロード |
| **出品** | テンプレート・一括出品機能 |
| **受注フロー** | ピッキング→梱包→発送の一連動作 |
| **返品** | 申請フォーム→再検品ワークフロー |
| **課題管理** | カンバンD&D・詳細モーダル |
| **請求** | PDF生成・支払ステータス管理 |
| **レポート** | Chart.js表示・CSVエクスポート |
| **パフォーマンス** | Lighthouse Score > 90 |

---

## 📌 注意事項

- **ブランチ戦略**: `main` ← `develop` ← `feature/[task-name]`
- **コミット規約**: `feat:`, `fix:`, `refactor:`, `test:` プレフィックス
- **レビュー必須**: セキュリティ・アクセシビリティ・パフォーマンス
- **テストカバレッジ**: 80% 以上維持
- **ドキュメント**: 各機能の README.md 作成

---

_このガイドに従って段階的実装を行い、要件定義書との完全整合を目指す_ 