# Opus4実装ガイド - THE WORLD DOOR未実装機能

## 実装方針

私（Opus4）が実装する際の基本方針：
- 既存コードのパターンを厳密に踏襲
- 一度に一つの機能のみ実装
- 各実装後に動作確認を必須とする
- 既存機能を破壊しない

## 🔴 Phase 1: 高優先度機能

### 1. 納品プラン作成機能

#### 概要
商品情報登録、バーコード発行、PDF出力機能を持つウィザード形式のUI

#### 実装手順

##### Step 1: ページ作成
```typescript
// app/delivery-plan/page.tsx
import { Metadata } from 'next';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import DeliveryPlanWizard from '@/app/components/features/delivery-plan/DeliveryPlanWizard';

export const metadata: Metadata = {
  title: '納品プラン作成 - THE WORLD DOOR',
  description: '新規納品プランの作成',
};

export default function DeliveryPlanPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">納品プラン作成</h1>
          <p className="text-gray-600">商品の納品プランを作成し、バーコードラベルを発行します</p>
        </div>
        <DeliveryPlanWizard />
      </div>
    </DashboardLayout>
  );
}
```

##### Step 2: ウィザードコンポーネント
```typescript
// app/components/features/delivery-plan/DeliveryPlanWizard.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/app/components/ui/NexusCard';
import BasicInfoStep from './BasicInfoStep';
import ProductRegistrationStep from './ProductRegistrationStep';
import ConfirmationStep from './ConfirmationStep';

// 既存のコンポーネントパターンに従う
```

##### Step 3: APIエンドポイント
```typescript
// app/api/delivery-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // 既存のAPIパターンに従う
}
```

##### Step 4: バーコード・PDF生成
- jsPDFライブラリを使用
- Canvas APIでバーコード生成
- A4サイズ6面ラベル対応

### 2. 検品チェックリスト機能

#### 概要
タブレット最適化、写真アップロード、検品項目チェック機能

#### 実装手順

##### Step 1: 動的ルートページ
```typescript
// app/staff/inspection/[productId]/page.tsx
```

##### Step 2: 検品フォーム
- カメラ検品項目（外観、動作、光学系）
- 最低6枚の写真アップロード必須
- タブレット最適化CSS

### 3. ロケーション登録・管理

#### 概要
バーコードスキャンによる棚番登録機能

#### 実装手順
- 既存の`LocationScanner.tsx`を拡張
- 2段階スキャン（商品→ロケーション）
- 既存の`/api/locations`APIを活用

### 4. 出品設定・管理

#### 概要
eBayテンプレート選択、価格設定、商品説明自動生成

#### 実装手順
- 既存のeBay APIテンプレートを使用
- 手数料自動計算機能
- プレビュー機能

### 5. ピッキングリスト

#### 概要
スマートフォン最適化、優先度順表示

#### 実装手順
- モバイルファーストデザイン
- 高額商品・出荷期限順ソート
- バーコードスキャンで完了

## 🟡 Phase 2: 中優先度機能

### 6. リアルタイム通知システム
- Server-Sent Events (SSE) 使用
- `/api/notifications/stream`エンドポイント

### 7. 画像管理・アップロード
- Canvas APIでリサイズ・最適化
- ドラッグ&ドロップ対応

### 8. PDF帳票生成
- jsPDF導入
- バーコードラベル、納品書、ピッキングリスト

### 9. 在庫分析・レポート
- Chart.js使用（既存ライブラリ）
- 在庫回転率、滞留分析、収益性分析

## 実装時の注意事項

### 必須確認事項
1. `npm run dev`でエラーがないこと
2. 既存ファイルを削除しない
3. TypeScript型定義を必須とする
4. 日本語UIを維持する

### エラーハンドリング
```typescript
try {
  // 処理
} catch (error) {
  console.error('[ERROR] 機能名:', error);
  setError(error instanceof Error ? error.message : '予期しないエラーが発生しました');
}
```

### テスト手順
```bash
npm run build
npm run dev
# ブラウザで該当ページにアクセス
# 基本操作を確認
```

## 実装順序の重要性

必ず以下の順序で実装：
1. 納品プラン作成機能（基盤となる機能）
2. 検品チェックリスト（既存API活用）
3. ロケーション登録（既存コンポーネント拡張）
4. 出品設定（既存テンプレート活用）
5. ピッキングリスト（独立機能）

各機能は独立して動作するよう設計し、依存関係を最小限にする。 