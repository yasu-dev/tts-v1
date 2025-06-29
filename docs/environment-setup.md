# 環境変数設定ガイド

## 必要な環境変数

### 1. データベース設定

```bash
# PostgreSQL接続文字列
DATABASE_URL="postgresql://user:password@localhost:5432/worlddoor"
```

### 2. 認証設定

```bash
# JWT署名用のシークレットキー（必須）
JWT_SECRET="your-secure-random-string-here"

# セッション有効期限（時間単位、デフォルト: 24）
SESSION_EXPIRY_HOURS=24
```

### 3. API設定

```bash
# 外部APIのベースURL（オプション、本番環境用）
NEXT_PUBLIC_API_URL=""
```

### 4. ファイルアップロード設定

```bash
# アップロードディレクトリ（デフォルト: ./uploads）
UPLOAD_DIR="./uploads"

# 最大ファイルサイズ（バイト単位、デフォルト: 10MB）
MAX_FILE_SIZE=10485760
```

### 5. eBay連携設定（将来の実装用）

```bash
EBAY_APP_ID=""
EBAY_CERT_ID=""
EBAY_DEV_ID=""
EBAY_SANDBOX=true
```

### 6. メール設定（将来の実装用）

```bash
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
```

## 設定方法

1. プロジェクトルートに `.env.local` ファイルを作成
2. 上記の環境変数を適切な値で設定
3. 開発環境では最低限 `DATABASE_URL` と `JWT_SECRET` を設定

## 注意事項

- `.env.local` ファイルは Git に含めないでください
- `JWT_SECRET` は十分に長く、ランダムな文字列を使用してください
- 本番環境では、環境変数はホスティングサービスで設定してください 