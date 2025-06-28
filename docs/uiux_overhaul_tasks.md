<!-- ⚠️ AUTO-FIX FILE : ClaudeCode will parse and execute every task table below -->

# UI/UX Overhaul Tasks - Phase-1 (MVP)  
_目的：要件定義書で求められる世界最高水準 UI/UX を達成するため、**まず 2 週間で実装可能な最小機能セット**を Next.js14 プロジェクトに組み込む。_

---

## 🚦 前提
| 項目 | 内容 |
|------|------|
| FE Stack | Next.js 14 (App Router) / React 18 / TypeScript / Tailwind |
| 状態管理 | TanStack Query v5, Zustand |
| 通信 | REST + WebSocket (socket.io-client) |
| 役割判定 | `session.user.role` (`"seller"` \| `"staff"`) |
| 新規ライブラリ | `@react-google-maps/api`, `socket.io-client`, `zustand`, `immer` |
| 既存ファイル | `app/page.tsx`, `components/layouts/dashboard-layout.tsx`, `components/features/status-flow.tsx`, `components/layouts/sidebar.tsx` |
| モックAPI | `GET /api/products/:id/status` (リアルタイム進捗), `WS /ws/status` (push) — **stub で可** |

---

## 📝 タスク一覧

| ID | 対象ファイル / 生成ファイル | 要求仕様 (世界最高水準 MVP) | 具体的実装手順 |
|----|---------------------------|---------------------------|---------------|
| **UX-1** | `components/features/LiveStatusFlow.tsx` **[新規]**<br>既存 `status-flow.tsx` はリネームして差し替え | - 商品単位の **ライブステータスフロー**<br>- WebSocket 受信でアイコンがリアルタイム遷移<br>- 現在ステップはハイライト & アニメーション | 1. `mv components/features/status-flow.tsx components/features/LiveStatusFlow.backup.tsx`<br>2. 新規 `LiveStatusFlow.tsx` を作成し、`socket.io-client` で `/ws/status` を購読。<br>3. `StatusBadge` コンポーネントを内部で map 生成、現在ステータスで Tailwind `animate-pulse`。<br>4. `app/products/[id]/page.tsx` から `<LiveStatusFlow productId={id} />` を呼び出す。 |
| **UX-2** | `components/features/ProductMap.tsx` **[新規]** | - Google Maps 上に商品の現在地マーカー<br>- `GET /api/products/:id/status` の `lat/lng` を描画<br>- マーカークリックで到着予定 ETA (AI 推論仮置き) を tooltip | 1. `@react-google-maps/api` を導入。<br>2. Next.js Dynamic Import (`ssr:false`) で地図を読み込み。<br>3. `predictEta()` ダミー util を作成（`const eta = dayjs().add(2,'h')`）。 |
| **UX-3** | `components/layouts/dashboard-layout.tsx` / `sidebar.tsx` | **役割別 UI 切替**<br>- `seller`：販売状況ダッシュボード<br>- `staff`：入庫タスク優先度順リスト | 1. `useSession()` から role を取得し、`<Sidebar>` と `<DashboardLayout>` 内部で条件分岐。<br>2. `sidebarItems.ts` を分割 (`sellerItems`, `staffItems`)。 |
| **UX-4** | `components/features/RoleWidgets.tsx` **[新規]** | - **カスタマイズ可能ウィジェット** (在庫数・売上・タスクリスト)<br>- `zustand` + `localStorage` でウィジェット配置を保存 | 1. `createStore` in `src/store/dashboard.ts`。<br>2. ドラッグ&ドロップは `@dnd-kit/core` を採用（追加インストール）。 |
| **UX-5** | `components/features/ProductTimeline.tsx` **[新規]** | - GitHub 風タイムライン：検品→撮影→出品→販売<br>- TanStack Query で `GET /api/products/:id/history` 取得<br>- ステップ毎にアイコン + 日時 + 備考 | 1. `vertical-timeline-component-for-react` を導入。<br>2. `status-history` モック JSON を `/mock-backend/db.json` に追加し、API ルートで返却。 |
| **UX-6** | `utils/notifications.ts` **[新規]** | - WebSocket で受信したイベントを **重要度別** に分類<br>- `push.js` を用いてブラウザプッシュ | 1. `const LEVEL = {INFO:'info',WARN:'warn',CRIT:'crit'}`。<br>2. AI 判定は `dummyImportance(event)` で 3 段階スコア返却。 |
| **UX-7** | `pages/api/metrics/export.ts` **[新規 API Route]** | - CSV / JSON エクスポート (KPI ダッシュボードから DL) | 1. `res.setHeader('Content-Disposition', 'attachment; filename=kpi.csv')`。<br>2. `json2csv` ライブラリで変換。 |
| **UX-8** | `README_UIUX_MVP.md` **[新規]** | - 上記 UX-1〜7 実装手順 & 動作確認方法を記載 | 自動生成で可。テンプレ下部「✅ 完了判定」を貼り付けること。 |

---

## ✅ 完了判定 (CI で自動チェック推奨)

| テスト項目 | 合格基準 (`npm run dev` 起動後) |
|------------|-------------------------------|
| **LiveStatusFlow** | 商品ステータスを受信するとアイコンが即時遷移 |
| **ProductMap** | 地図にマーカーが表示され、クリックで ETA Tooltip |
| **Role Switch** | `?role=seller` / `?role=staff` クエリで UI が変化 |
| **Widget Layout** | ウィジェットをドラッグ後、F5 再読込でも配置保持 |
| **Timeline** | `/products/:id` で時系列イベントが昇順表示 |
| **Notifications** | モック WS `CRIT` イベントでブラウザ通知 |
| **Metrics Export** | `/api/metrics/export?fmt=csv` が 200 & DL |

---

## 📌 注意
- **ブランチ名**：`feat/uiux-mvp`  
- **自動コミットメッセージ**：`feat: implement UI/UX MVP (UX-1~8)`  
- **実装時間目安**：40 h  
- **スコープ外**：3D 倉庫マップ、AR 検品、自然言語レポート生成（Phase-2 で実装予定）  
- **レビュー必須**：アクセシビリティ (WCAG2.1 AA) / Lighthouse Perf>90  

---

_End of file_