# 全画面レスポンシブ対応実装ガイド

## 概要
THE WORLD DOORフルフィルメントサービスは、モバイルから4Kディスプレイまで、あらゆる画面サイズに対応したレスポンシブデザインを実装しています。

## ブレークポイント

### 主要ブレークポイント
- **モバイル**: 320px - 640px
- **タブレット**: 641px - 1024px
- **デスクトップ**: 1025px - 1920px
- **2Kディスプレイ**: 1920px - 2559px
- **4Kディスプレイ**: 2560px+

## 実装詳細

### 1. モバイル対応（320px - 640px）

#### 特徴
- ハンバーガーメニューによるナビゲーション
- 1カラムレイアウト
- タッチ最適化されたUI要素
- 最小タッチターゲット: 44px

#### 実装内容
```css
@media (max-width: 640px) {
  /* グリッドを1カラムに */
  .grid-cols-2, .grid-cols-3, .grid-cols-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  /* サイドバーのサイズ調整 */
  .nexus-sidebar {
    width: 280px;
  }
  
  /* タイムゾーンウィジェット非表示 */
  .timezone-widget {
    display: none;
  }
}
```

### 2. タブレット対応（641px - 1024px）

#### 特徴
- 2カラムグリッドレイアウト
- サイドバーのオーバーレイ表示
- タイムゾーンウィジェット表示
- 中サイズのタッチターゲット

#### 実装内容
```css
@media (max-width: 1024px) {
  .app-container {
    grid-template-areas: 
      "header header"
      "main-display main-display";
    grid-template-columns: 1fr;
  }
  
  .nexus-sidebar {
    position: fixed;
    transform: translateX(-100%);
  }
  
  .nexus-sidebar.open {
    transform: translateX(0);
  }
}
```

### 3. デスクトップ対応（1025px - 1920px）

#### 特徴
- 3カラムレイアウト（サイドバー + メイン + 分析パネル）
- 固定サイドバー
- フルナビゲーション表示
- ホバーエフェクト有効

### 4. 大画面対応（1920px+）

#### 特徴
- 最大幅制限によるコンテンツの中央配置
- 大きなフォントサイズとパディング
- 4Kディスプレイでの可読性確保

#### 実装内容
```css
/* 2K ディスプレイ */
@media (min-width: 1920px) and (max-width: 2559px) {
  .app-container {
    max-width: 2400px;
    margin: 0 auto;
  }
}

/* 4K ディスプレイ */
@media (min-width: 2560px) {
  .app-container {
    max-width: 3200px;
    margin: 0 auto;
  }
}
```

## コンポーネント別対応

### NexusHeader
- モバイル: ハンバーガーメニューボタン表示
- タブレット: コンパクトなレイアウト
- デスクトップ: フルナビゲーション表示

### Sidebar
- モバイル/タブレット: オーバーレイ表示
- デスクトップ: 固定表示

### Command Bar
- モバイル: 垂直スタック
- タブレット以上: 水平配置

## アクセシビリティ考慮事項

### タッチデバイス
```css
@media (hover: none) and (pointer: coarse) {
  .nexus-button, .action-orb, .nav-node {
    min-height: 48px;
  }
}
```

### モーション設定
```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

### ハイコントラストモード
```css
@media (prefers-contrast: high) {
  .nexus-button, .intelligence-card {
    border-width: 4px;
  }
}
```

## テスト方法

### Playwrightテスト
```bash
npm run test tests/responsive-test.spec.ts
```

### 手動テスト
1. Chrome DevToolsのデバイスエミュレーターを使用
2. 実際のデバイスでの確認
3. ブラウザウィンドウのリサイズによる確認

## パフォーマンス最適化

### CSSの最適化
- メディアクエリの統合
- 不要なスタイルの削除
- will-changeプロパティの適切な使用

### JavaScript最適化
- ResizeObserverによる効率的なサイズ検知
- デバウンス処理によるリサイズイベントの最適化
- 条件付きコンポーネントレンダリング

## 今後の改善点

1. コンテナクエリの導入
2. CSS Grid の subgrid 対応
3. aspect-ratio プロパティの活用
4. 可変フォントの導入
5. ダークモード対応の完全実装 