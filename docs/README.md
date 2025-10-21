---
title: トリアージタッグシステム 概要
lastUpdated: 2025-10-21
version: 0.1.0
phases:
  current: "ドキュメント整備・リファクタ（安全第一）"
  next: "E2E安定化・役割ベース権限・オフライン強化"
---

## 目的
本ドキュメントは、プロジェクト全体を俯瞰可能にし、人間とAIの双方が理解・検索しやすい情報のインデックスを提供します。

## システム概要（要点）
- フロント: Next.js App Router（14.x）/ React 18 / TailwindCSS
- データ: Supabase（認証・DB・ストレージ）
- 地図: Leaflet（`components/TriageMap.tsx`）
- QR: `html5-qrcode` を利用した QR スキャン（`components/QRScanner.tsx`）
- START法ウィザード: `components/StartWizard.tsx`
- 音声メモ: `components/VoiceInput.tsx`
- 主要画面: `/(auth)/login`, `/(dashboard)/{command, transport, transport-team, hospital}`, `/triage/scan`

## ドキュメント索引
- 仕様・設計
  - 機能仕様（MD）: `docs/機能仕様.md`
  - 機能仕様（HTML）: `docs/機能仕様.html`
  - システム構成図（Draw.io）: `docs/system-architecture.drawio`
  - 業務/画面フロー（Draw.io）: `docs/triage-system-flow.drawio`
  - ディレクトリ構成（Draw.io）: `docs/project-structure.drawio`
- 概観・現状
  - フィーチャーマトリクス: `docs/FEATURES.md`
  - ロードマップ: `docs/ROADMAP.md`
- アーカイブ（旧版/一過性）
  - `docs/archive/` を参照

## 実装状況（要約）
- 認証/ログイン: 実装済み（Supabase Auth）。E2E: Login系は Mobile Chrome で合格。
- トリアージ入力（/triage/scan）: START法ウィザード・QR・音声メモ・画像添付・登録フローを実装。
- ダッシュボード（指揮/搬送/医療/搬送チーム）: 画面/データ取得/一部Realtimeを実装。地図は Leaflet で描画。
- ロギング/エラー: 共通ロガー導入、`ErrorBoundary` 全体適用。

詳細は `docs/FEATURES.md` の表を参照。

## 今後の方針（抜粋）
- 現フェーズ: E2Eの安定化（ダッシュボード系）、ログ整備、メタデータ定義の整合。
- 次フェーズ: 役割ベース権限・オフライン強化（PWA/再送）・監査ログ・外部出力。

## テスト
- Unit: Jest / Testing Library（設定済）
- E2E: Playwright（`tests/e2e/*.spec.ts`）

## 付記（AI向け）
本MDは先頭にメタ情報（YAML）を含み、フェーズ・更新日・索引を機械抽出しやすくしています。


