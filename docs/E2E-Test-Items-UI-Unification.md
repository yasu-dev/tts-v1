# UI統一化修正項目 E2Eテスト項目リスト

## 概要
このドキュメントは、UI/UXの統一化作業で実施した修正項目に基づくE2Eテスト項目のリストです。
各修正箇所の動作確認とNexusデザインシステムへの統一が正しく動作することを検証します。

---

## 🔴 高優先度修正項目のE2Eテスト

### 1. Dashboard (seller) - 日付選択モーダル修正

**修正内容**: ハードコードされたモーダルを BaseModal に置き換え

**テスト項目**:
```
- Dashboard画面にアクセスできること
- 期間選択ボタンをクリックできること
- BaseModalが正しく表示されること
- モーダルのタイトルが「期間選択」であること
- モーダルサイズが「lg」であること
- キャンセルボタンで正しく閉じること
- 既存の機能（期間選択）が正常に動作すること
```

### 2. Inventory (seller) - CSV インポートモーダル・ボタン修正

**修正内容**: BaseModal + NexusInput + NexusButton に統一

**テスト項目**:
```
- Inventory画面にアクセスできること
- 「新規商品登録」「CSVインポート」「CSVエクスポート」ボタンがNexusButtonであること
- NexusButtonにアイコンが表示されること
- CSVインポートボタンクリックでBaseModalが開くこと
- モーダル内でNexusInputが使用されていること
- ファイル選択機能が正常に動作すること
- キャンセルボタンで正しく閉じること
```

### 3. Sales (seller) - モーダル・ボタン修正

**修正内容**: BaseModal + NexusButton に統一

**テスト項目**:
```
- Sales画面にアクセスできること
- 「出品設定」「プロモーション作成」ボタンがNexusButtonであること
- 出品設定ボタンクリックでBaseModalが開くこと
- モーダルのタイトルが「出品設定」であること
- モーダル内のボタンがNexusButtonであること
- HoloTableが正しく表示されること
```

### 4. Billing (seller) - ボタン・テーブル修正

**修正内容**: NexusButton + HoloTable に統一

**テスト項目**:
```
- Billing画面にアクセスできること
- 「支払履歴をエクスポート」「支払い方法を登録」ボタンがNexusButtonであること
- ボタンにアイコンが表示されること
- HoloTableが正しく表示されること
- テーブルデータが正常に表示されること
- CSVエクスポート機能が動作すること
```

### 5. Delivery (seller) - モーダル・入力修正

**修正内容**: BaseModal + NexusInput + NexusButton に統一

**テスト項目**:
```
- Delivery画面にアクセスできること
- 「新規納品プラン作成」「バーコード発行」ボタンがNexusButtonであること
- バーコード発行ボタンクリックでBaseModalが開くこと
- モーダル内の入力フィールドがNexusInputであること
- 「納品プラン確定」「下書き保存」ボタンがNexusButtonであること
- HoloTableが正しく表示されること
```

### 6. Returns (seller) - 大型モーダル修正

**修正内容**: BaseModal + NexusInput + NexusTextarea + NexusButton に統一

**テスト項目**:
```
- Returns画面にアクセスできること
- 「返品申請」「レポート出力」ボタンがNexusButtonであること
- 返品申請ボタンクリックでBaseModalが開くこと
- モーダルサイズが「lg」であること
- モーダル内の入力フィールドがNexusInputであること
- モーダル内のテキストエリアがNexusTextareaであること
- 「下書き保存」「返品申請提出」ボタンがNexusButtonであること
- ファイルアップロード機能が動作すること
```

### 7. Profile (seller/staff) - 入力・モーダル修正

**修正内容**: NexusInput + BaseModal + NexusButton に統一

**テスト項目**:
```
- Profile画面にアクセスできること
- 「編集」ボタンがNexusButtonであること
- 編集モード時の入力フィールドがNexusInputであること
- 「キャンセル」「保存」ボタンがNexusButtonであること
- パスワード変更ボタンクリックでBaseModalが開くこと
- セキュリティ設定のボタンがNexusButtonであること
```

### 8. Timeline (seller) - ボタン・モーダル修正

**修正内容**: NexusButton + BaseModal に統一

**テスト項目**:
```
- Timeline画面にアクセスできること
- 「期間でフィルター」「履歴をエクスポート」ボタンがNexusButtonであること
- フィルターボタンクリックでBaseModalが開くこと
- モーダル内のボタンがNexusButtonであること
- CSVエクスポート機能が動作すること
```

---

## 🟡 中優先度修正項目のE2Eテスト

### 9. Staff Dashboard - フィルター修正

**修正内容**: NexusSelect + NexusInput に統一

**テスト項目**:
```
- Staff Dashboard画面にアクセスできること
- 優先度フィルターがNexusSelectであること
- 作業種別フィルターがNexusSelectであること
- 検索入力がNexusInputであること
- フィルター機能が正常に動作すること
- 「新規タスク作成」ボタンがNexusButtonであること
```

### 10. Staff Inventory - フィルター・モーダル修正

**修正内容**: NexusSelect + NexusInput + BaseModal + NexusButton に統一

**テスト項目**:
```
- Staff Inventory画面にアクセスできること
- すべてのフィルター（ステータス、カテゴリー、保管場所、担当者）がNexusSelectであること
- 検索入力がNexusInputであること
- 「商品詳細を編集」「ロケーション移動」「CSVエクスポート」ボタンがNexusButtonであること
- 編集モーダルがBaseModalであること
- 移動モーダルがBaseModalであること
- カード表示・テーブル表示のボタンがNexusButtonであること
```

### 11. Staff Inspection - モーダル修正

**修正内容**: BaseModal + NexusButton + NexusTextarea に統一

**テスト項目**:
```
- Staff Inspection画面にアクセスできること
- 「検品基準を確認」「カメラ設定」ボタンがNexusButtonであること
- 検品基準モーダルがBaseModalであること
- カメラ設定モーダルがBaseModalであること
- 「検品開始」ボタンがNexusButtonであること
- 備考テキストエリアがNexusTextareaであること
- インスペクション関連のボタンがNexusButtonであること
```

### 12. Login - 入力フィールド修正

**修正内容**: NexusInput に統一

**テスト項目**:
```
- Login画面にアクセスできること
- メールアドレス入力がNexusInputであること
- パスワード入力がNexusInputであること
- enterpriseバリアントが適用されていること
- ラベルにアイコンが表示されること
- 「ログイン」ボタンがNexusButtonであること
- ログイン機能が正常に動作すること
- seller@example.com / password123でsellerページにリダイレクトすること
- staff@example.com / password123でstaffページにリダイレクトすること
```

### 13. LocationOptimizationModal - ボタン修正

**修正内容**: NexusButton に統一

**テスト項目**:
```
- ロケーション最適化機能にアクセスできること
- 「最適化を実行」ボタンがNexusButtonであること
- 「閉じる」ボタンがNexusButtonであること
- 「選択した提案を適用」ボタンがNexusButtonであること
- ボタンにアイコンが表示されること
- 最適化機能が正常に動作すること
```

---

## 🟢 低優先度修正項目のE2Eテスト

### 14. NexusTextarea - ラベル色修正

**修正内容**: nexus-text-secondary に統一

**テスト項目**:
```
- NexusTextareaが使用されている全画面で確認
- ラベルの色がnexus-text-secondaryであること
- 一貫した表示となっていること
```

---

## 📋 全体的なE2Eテスト項目

### デザインシステム統一性確認

**テスト項目**:
```
- 全画面でNexusButtonが使用されていること
- 全モーダルでBaseModalが使用されていること
- 全入力フィールドでNexusInput/NexusSelect/NexusTextareaが使用されていること
- 全テーブルでHoloTableが使用されていること
- 色彩システムが統一されていること
- フォントシステムが統一されていること
- スペーシングシステムが統一されていること
```

### 機能保持確認

**テスト項目**:
```
- 修正前の全機能が正常に動作すること
- データの入力・保存・取得が正常であること
- ナビゲーションが正常に動作すること
- エラーハンドリングが正常であること
- レスポンシブデザインが機能すること
```

### アクセシビリティ確認

**テスト項目**:
```
- キーボードナビゲーションが機能すること
- フォーカス状態が視覚的に確認できること
- ARIAラベルが適切に設定されていること
- コントラスト比が適切であること
```

---

## 🧪 E2E自動テスト実行方法

### Playwright設定
```bash
npm run test:e2e
```

### 個別テスト実行
```bash
npx playwright test --grep "Dashboard"
npx playwright test --grep "BaseModal"
npx playwright test --grep "NexusButton"
```

### ビジュアル回帰テスト
```bash
npx playwright test --update-snapshots
```

### 15. TaskDetailModal - ボタン統一修正

**修正内容**: 全ボタンをNexusButtonに統一

**テスト項目**:
```
- タスク詳細モーダルにアクセスできること
- ヘッダーの閉じるボタンがNexusButtonであること
- タブボタンがNexusButtonであること
- フッターの「印刷」「複製」「閉じる」「編集」ボタンがNexusButtonであること
- 添付ファイルタブの「ファイル追加」「ダウンロード」ボタンがNexusButtonであること
- コメント追加ボタンがNexusButtonであること
- 全ボタンが正常に動作すること
```

### 16. CarrierSettingsModal - 入力フィールド修正

**修正内容**: HTML入力をNexusInput/NexusTextareaに置換

**テスト項目**:
```
- 配送業者設定モーダルにアクセスできること
- 基本配送料入力がNexusInputであること
- APIキー入力がNexusInputであること
- 追跡URL入力がNexusInputであること
- 備考入力がNexusTextareaであること
- 全入力フィールドが正常に動作すること
- 保存・キャンセルボタンがNexusButtonであること
```

### 17. PackingMaterialsModal - 数量入力修正

**修正内容**: 数量フィールドをNexusInputに変更

**テスト項目**:
```
- 梱包資材確認・発注モーダルにアクセスできること
- 発注数量入力フィールドがNexusInputであること
- 数量変更が正常に動作すること
- 小計計算が正常に動作すること
- 発注・閉じるボタンがNexusButtonであること
- 在庫不足警告が正常に表示されること
```

### 18. ProductRegistrationModal - 入力統一修正

**修正内容**: 混在していた入力フィールドを全てNexusコンポーネントに統一

**テスト項目**:
```
- 新規商品登録モーダルにアクセスできること
- 商品名入力がNexusInputであること
- SKU入力がNexusInputであること
- カテゴリー選択がNexusSelectであること
- ブランド入力がNexusInputであること
- 状態選択がNexusSelectであること
- 価格入力（仕入・販売）がNexusInputであること
- 保管場所入力がNexusInputであること
- 商品説明入力がNexusTextareaであること
- 備考入力がNexusTextareaであること
- 登録・キャンセルボタンがNexusButtonであること
- バリデーション機能が正常に動作すること
```

---

## 🟢 低優先度修正項目のE2Eテスト（追加分）

### 19. QRCodeModal - 色彩統一修正

**修正内容**: 色彩をNexusデザイントークンに統一

**テスト項目**:
```
- QRコード生成モーダルにアクセスできること
- テキスト色がnexus-text系に統一されていること
- 背景色がnexus-bg系に統一されていること
- ボーダー色がnexus-border系に統一されていること
- 使用方法セクションがnexus-blue系に統一されていること
- データコピーボタンがnexus-blue系であること
- 全体的にNexusデザインシステムに統一されていること
```

### 20. SearchModal - タイポグラフィ修正

**修正内容**: タイポグラフィをnexus-text-primaryに統一

**テスト項目**:
```
- 検索モーダルにアクセスできること
- 検索結果のタイトルがnexus-text-primaryであること
- 説明文がnexus-text-secondaryであること
- アイコンがnexus-text-secondaryであること
- ローディング表示がnexus-blue系であること
- 検索結果なしメッセージがnexus-text系に統一されていること
- ホバー効果がnexus-bg-secondaryであること
- タイプラベルがnexus-blue系であること
```

---

## 📈 テスト成功基準

1. **機能性**: 修正前の全機能が正常に動作する
2. **一貫性**: Nexusデザインシステムが統一されている
3. **品質**: レスポンシブ・アクセシビリティが保持されている
4. **パフォーマンス**: ページ読み込み時間が劣化していない

---

## 注意事項

- 各テストは本番環境に近い状態で実行すること
- API の mock データが正しく設定されていることを確認すること
- ブラウザ間での互換性も確認すること
- モバイル表示も含めたレスポンシブテストを実施すること

---

*最終更新: 2025年7月5日（最後の6タスク追加完了）*
*作成者: Claude Code AI Assistant*