# フルフィルメントシステム実装指示書

## 🎯 実装概要
Next.js 14 (App Router) + TypeScript + Tailwind CSS + TanStack Query v5 + Zustand で、不足している業務機能画面を実装する。

## 📦 依存関係インストール
```bash
npm install zustand immer axios chart.js react-chartjs-2 vis-network react-dropzone quagga @react-pdf/renderer @dnd-kit/sortable @dnd-kit/core react-hot-toast dayjs @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @tiptap/react @tiptap/starter-kit

npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

## 🚀 実装指示

### 優先順位
1. **基盤セットアップ** (store/auth.ts, lib/api-client.ts, types/*)
2. **認証UI** (login/register ページ)
3. **管理者機能** (users 管理)
4. **納品プラン** (ウィザード)
5. **その他機能** (inspection, inventory, etc.)

### 実装ルール
- 各機能は独立してテスト可能にする
- エラーハンドリングを必ず実装
- ローディング状態を適切に表示
- TypeScript の型安全性を保つ
- アクセシビリティ（aria-label等）を考慮

### 次のステップ
1. 基盤ファイルから順次実装
2. 各機能実装後に動作確認
3. エラーがあれば修正してから次へ進む
4. 全機能完了後に統合テスト

**実装を開始してください。**
