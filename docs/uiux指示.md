# THE WORLD DOOR社 在庫管理WebアプリUI/UX適用指示書

## 概要
提供された参考HTMLファイルのUI/UXデザインシステムを、既存のTHE WORLD DOOR社在庫管理Webアプリに完全適用する。参考ファイルの**デザイン要素のみ**を抽出し、既存のアプリケーション機能は保持する。

## 1. デザインシステム基盤

### カラーパレット
```css
/* プライマリカラー */
--primary-blue: #0064D2
--primary-blue-light: #0078FF
--primary-blue-lighter: #40C4FF

/* セカンダリカラー */
--yellow: #FFCE00
--red: #E53238
--green: #86B817
--purple: #7B1FA2
--cyan: #00BCD4

/* ニュートラルカラー */
--background: #F8FAFE
--surface: rgba(255, 255, 255, 0.97)
--text-primary: #1A1A1A
--text-secondary: #666666
--text-muted: #999999
--border: rgba(0, 100, 210, 0.25)
```

### タイポグラフィ
```css
/* フォントファミリー */
--font-primary: 'Noto Sans JP', 'Inter', -apple-system, system-ui, sans-serif
--font-display: 'Orbitron', sans-serif
--font-mono: 'Orbitron', monospace

/* フォントサイズ */
--text-xs: 0.7rem
--text-sm: 0.8rem
--text-base: 0.9rem
--text-lg: 1rem
--text-xl: 1.1rem
--text-2xl: 1.2rem
--text-3xl: 2rem
```

## 2. レイアウトシステム

### グリッドレイアウト
```css
.app-container {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main-display analytics"
    "sidebar main-display analytics";
  grid-template-columns: 340px 1fr 400px;
  grid-template-rows: 85px 1fr;
  height: 100vh;
}
```

### レスポンシブブレークポイント
- 1600px以下: `grid-template-columns: 320px 1fr 360px`
- 1400px以下: `grid-template-columns: 300px 1fr 340px`
- 1200px以下: カードグリッドを2列に変更

## 3. 背景エフェクト

### グローバル背景
```css
body::before {
  /* 6色のradial-gradientを重ねる */
  background: 
    radial-gradient(circle at 15% 85%, rgba(0, 100, 210, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 85% 15%, rgba(229, 50, 56, 0.06) 0%, transparent 40%),
    /* 他4色も同様 */;
}

body::after {
  /* 回路基板風グリッド */
  background: 
    linear-gradient(90deg, rgba(0, 100, 210, 0.04) 1px, transparent 1px),
    linear-gradient(0deg, rgba(0, 100, 210, 0.04) 1px, transparent 1px);
  background-size: 50px 50px;
}
```

## 4. コンポーネント仕様

### ヘッダー（.nexus-header）
- 背景: `linear-gradient(135deg, #0064D2 0%, #0078FF 50%, #00A0FF 100%)`
- 高さ: 85px
- パディング: `0 2.5rem`
- ボックスシャドウ: `0 8px 32px rgba(0, 100, 210, 0.4)`

### ブランドロゴ（.nexus-logo）
- サイズ: 56×56px
- 背景: 5色グラデーション `linear-gradient(135deg, #FFCE00, #E53238, #86B817, #7B1FA2, #00BCD4)`
- ボーダー半径: 18px
- ネオンエフェクト: `box-shadow: 0 0 30px rgba(255, 206, 0, 0.8)`

### サイドバー（.nexus-sidebar）
- 幅: 340px
- 背景: `rgba(255, 255, 255, 0.97)`
- バックドロップフィルター: `blur(25px)`
- 右ボーダー: 4px solid 6色グラデーション

### ナビゲーションアイテム（.nav-node）
- パディング: `1.25rem 2rem`
- 左ボーダー: `5px solid transparent` (アクティブ時: #0064D2)
- ホバー効果: `translateX(10px)` + 背景色変更

### ボタン（.nexus-button）
- パディング: `1rem 1.5rem`
- ボーダー: `3px solid rgba(0, 100, 210, 0.35)`
- ボーダー半径: 14px
- ホバー効果: `translateY(-4px)` + 色反転

### テーブル（.holo-table）
- 背景: `rgba(255, 255, 255, 0.97)`
- バックドロップフィルター: `blur(25px)`
- ボーダー半径: 24px
- ヘッダー背景: `linear-gradient(135deg, rgba(0, 100, 210, 0.12), rgba(255, 206, 0, 0.06))`

### カード（.intelligence-card）
- 背景: `rgba(255, 255, 255, 0.97)`
- ボーダー: `3px solid` (地域別色分け)
- ボーダー半径: 24px
- 上部アクセント: 8px高さのグラデーションバー
- ホバー効果: `translateY(-10px) scale(1.03)`

## 5. 地域別カラーリング

### 6地域の色分けシステム
```css
.americas { border-color: rgba(0, 100, 210, 0.35); }
.europe { border-color: rgba(229, 50, 56, 0.35); }
.asia { border-color: rgba(255, 206, 0, 0.35); }
.africa { border-color: rgba(134, 184, 23, 0.35); }
.oceania { border-color: rgba(0, 188, 212, 0.35); }
.global { border-color: rgba(123, 31, 162, 0.35); }
```

## 6. 特殊エフェクト

### グラスモーフィズム
```css
backdrop-filter: blur(25px) saturate(180%);
background: rgba(255, 255, 255, 0.97);
border: 1px solid rgba(255, 255, 255, 0.2);
```

### ステータスインジケーター
- サイズ: 14×14px
- 最適: `#86B817` + グローエフェクト
- 警告: `#FFCE00` + グローエフェクト  
- 緊急: `#E53238` + グローエフェクト

### 認証バッジ
```css
.cert-nano {
  padding: 0.4rem 0.8rem;
  border-radius: 10px;
  border: 2px solid;
  text-transform: uppercase;
  font-weight: 800;
}
```

## 7. アニメーション規則

### 禁止事項
- @keyframesアニメーションは一切使用しない
- transform animationは使用しない
- 自動的に動くエフェクトは実装しない

### 許可される効果
- :hoverトランジション（0.3s ease）
- :focusエフェクト
- クリック時のスケール変更
- opacity変更

## 8. 実装優先順位

### Phase 1: 基盤
1. カラーパレット適用
2. タイポグラフィ設定
3. グリッドレイアウト構築
4. 背景エフェクト実装

### Phase 2: コンポーネント
1. ヘッダーコンポーネント
2. サイドバーナビゲーション
3. ボタンシステム
4. フォーム要素

### Phase 3: コンテンツエリア
1. テーブルスタイリング
2. カードコンポーネント
3. ステータス表示
4. アクションボタン

### Phase 4: 仕上げ
1. レスポンシブ調整
2. アクセシビリティ確保
3. パフォーマンス最適化

## 9. 技術的注意事項

- CSS Custom Propertiesを活用してテーマシステム構築
- 既存のJavaScript機能は一切変更しない
- SEOに影響するHTMLセマンティクスは保持
- Webアクセシビリティガイドライン準拠
- モバイル対応は既存仕様を踏襲

この指示に従い、参考HTMLファイルのデザインシステムを完全に適用し、THE WORLD DOOR社にふさわしいグローバルで洗練された在庫管理インターフェースを構築してください。