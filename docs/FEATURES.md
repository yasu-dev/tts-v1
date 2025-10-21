# 機能一覧（実装状況）

> 凡例: ✅ 実装 / ⚠ 一部 / ⏳ 本フェーズ予定 / 🔜 次フェーズ / ❌ 未実装

| 領域 | 機能 | 画面/モジュール | 状態 | 備考 |
|---|---|---|---|---|
| 認証 | ログイン | `/(auth)/login/page.tsx` | ✅ | Supabase Auth、ロールは簡易判別 |
| トリアージ | QRスキャン | `components/QRScanner.tsx` | ✅ | `html5-qrcode` 使用 |
| トリアージ | START法ウィザード | `components/StartWizard.tsx` | ✅ | 5ステップ・結果集計 |
| トリアージ | 音声メモ | `components/VoiceInput.tsx` | ✅ | Web Speech API 前提 |
| トリアージ | 画像アップロード | `components/ImageUploader.tsx` | ✅ | Supabase ストレージ前提 |
| トリアージ | 位置情報取得 | `/triage/scan` | ✅ | 失敗時はデフォルト座標 |
| ダッシュボード | 指揮本部 | `/(dashboard)/command` | ⚠ | 地図/モーダル有、E2E要安定化 |
| ダッシュボード | 搬送 | `/(dashboard)/transport` | ⚠ | 病院状況/搬送状態 |
| ダッシュボード | 搬送チーム | `/(dashboard)/transport-team` | ⚠ | QR連携/手動検索 |
| ダッシュボード | 医療機関 | `/(dashboard)/hospital` | ⚠ | 受入/更新 |
| 地図 | 地図描画 | `components/TriageMap.tsx` | ✅ | Leaflet、SSR回避 |
| ログ/エラー | 共通ロガー | `lib/utils/logger.ts` | ✅ | `NEXT_PUBLIC_LOG_LEVEL` で制御 |
| ログ/エラー | ErrorBoundary | `components/ErrorBoundary.tsx` | ✅ | `app/layout.tsx` で全体適用 |
| 認可 | 役割ベース権限 | middleware + ルート | 🔜 | 次フェーズ: role claims 連携 |
| オフライン | PWA・再送キュー | - | 🔜 | 次フェーズ: IndexedDB + 再送 |
| 監査 | 操作監査ログ | - | 🔜 | 次フェーズ: Supabase table |
| 出力 | CSV/帳票エクスポート | - | ❌ | 要件定義後 |


