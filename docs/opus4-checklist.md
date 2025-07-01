# Opus4実装チェックリスト

## 実装前確認
- [ ] `npm run dev`でエラーなし
- [ ] 開発サーバーが http://localhost:3001 で起動
- [ ] ログイン可能（セラー・スタッフ両方）

## 実装順序

### 1. 納品プラン作成機能
- [ ] ディレクトリ作成
  - [ ] `app/delivery-plan/`
  - [ ] `app/components/features/delivery-plan/`
  - [ ] `lib/pdf/`
- [ ] ファイル作成
  - [ ] `page.tsx`
  - [ ] `DeliveryPlanWizard.tsx`
  - [ ] `BasicInfoStep.tsx`
  - [ ] `ProductRegistrationStep.tsx`
  - [ ] `ConfirmationStep.tsx`
  - [ ] `BarcodeGenerator.tsx`
- [ ] API作成
  - [ ] `/api/delivery-plan/route.ts`
- [ ] ライブラリ追加
  - [ ] `npm install jspdf @types/jspdf`
- [ ] 動作確認
  - [ ] ページアクセス可能
  - [ ] ウィザード動作
  - [ ] API通信成功

### 2. 検品チェックリスト機能
- [ ] ディレクトリ作成
  - [ ] `app/staff/inspection/[productId]/`
  - [ ] `app/components/features/inspection/`
- [ ] ファイル作成
  - [ ] `page.tsx`
  - [ ] `InspectionChecklist.tsx`
  - [ ] `PhotoUploader.tsx`
  - [ ] `InspectionForm.tsx`
  - [ ] `InspectionResult.tsx`
- [ ] 動作確認
  - [ ] 動的ルート動作
  - [ ] 写真アップロード
  - [ ] タブレット表示

### 3. ロケーション登録・管理
- [ ] 既存ファイル拡張
  - [ ] `app/staff/location/page.tsx`
- [ ] コンポーネント作成
  - [ ] `LocationRegistration.tsx`
  - [ ] `LocationList.tsx`
  - [ ] `ProductLocationAssign.tsx`
- [ ] 動作確認
  - [ ] バーコードスキャン
  - [ ] ロケーション割り当て

### 4. 出品設定・管理
- [ ] ディレクトリ作成
  - [ ] `app/listing/`
  - [ ] `app/components/features/listing/`
- [ ] ファイル作成
  - [ ] `page.tsx`
  - [ ] `ListingForm.tsx`
  - [ ] `TemplateSelector.tsx`
  - [ ] `PriceCalculator.tsx`
  - [ ] `ListingPreview.tsx`
- [ ] 動作確認
  - [ ] テンプレート選択
  - [ ] 価格計算
  - [ ] プレビュー表示

### 5. ピッキングリスト
- [ ] ディレクトリ作成
  - [ ] `app/staff/picking/`
  - [ ] `app/components/features/picking/`
- [ ] ファイル作成
  - [ ] `page.tsx`
  - [ ] `PickingList.tsx`
  - [ ] `PickingItem.tsx`
  - [ ] `MobilePickingView.tsx`
- [ ] 動作確認
  - [ ] モバイル表示
  - [ ] 優先度ソート
  - [ ] スキャン完了

## 実装後確認

### ビルド確認
```bash
npm run build
```
- [ ] ビルドエラーなし
- [ ] TypeScriptエラーなし

### 動作確認
- [ ] 各ページアクセス可能
- [ ] 基本操作完了
- [ ] エラー表示正常
- [ ] レスポンシブ対応

### コード品質
- [ ] 既存パターン踏襲
- [ ] 日本語UI統一
- [ ] エラーハンドリング実装
- [ ] console.log削除

## トラブルシューティング

### エラー発生時
1. エラーメッセージを記録
2. `git status`で変更確認
3. 問題のあるファイルを特定
4. 段階的に修正

### よくある問題
- インポートパスの誤り → `@/`を使用
- コンポーネント名の不一致 → 大文字開始
- 型定義の不足 → interfaceを追加
- スタイルの崩れ → Tailwindクラス確認 