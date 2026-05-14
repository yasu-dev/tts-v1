# TTS RFID Bridge

FUJITSU TFU-RW811A (920MHz UHF) RFID リーダーをブラウザから利用するためのローカル WebSocket ブリッジ。

## 前提

- Windows 10 / 11 (x64)
- Node.js 20 以上
- `C:\Fujitsu Frontech\RFID\CounterSensorSlim64\` に DLL (`FjRfrwCommVO.dll`, `RFRWUMPHID_Drv.dll`) が配置済み
- TFU-RW811A 本体が USB 接続済み

DLL は **C ABI ネイティブ** (PE32+, x64)。`koffi` で `RFRW_Open` / `RFRW_CLRW_Transmit` / `RFRW_GetDllVersion` を呼び出す。`RFRWUMPHID_Drv.ini` で `AdminCheckCut=1` が設定されているため、標準ユーザー権限で動作する。

## クイックスタート (推奨: バッチでワンクリック起動)

`services/rfid-bridge/start-bridge.bat` をダブルクリックするだけで、以下が自動実行されます。

1. 初回のみ `npm install` を自動実行 (1〜2 分)
2. FUJITSU ドライバの起動時ダイアログ (`RFRWUMPHID_Drv`) を 30 秒間監視し、検出したら自動で OK 押下 (`auto-ok.ps1`)
3. ブリッジを起動 (WebSocket: 17324 / Health: 17325)

ウィンドウは開いたままにしてください。閉じる = ブリッジ停止。停止したい時は `Ctrl+C` または ウィンドウ閉じる。

デスクトップに `start-bridge.bat` のショートカットを作成しておくと便利です。

## 手動セットアップ (バッチを使わない場合)

```cmd
cd services\rfid-bridge
npm install
npm start
```

## Windows サービスとして常駐させる

```cmd
npm run install-service
```

`node-windows` で `tts-rfid-bridge` という名前で登録。自動再起動ポリシー: `wait=1s, grow=0.25, maxRestarts=3` (60 秒ウィンドウ内に 3 回失敗で停止)。

停止と削除:

```cmd
npm run uninstall-service
```

## API

- WebSocket: `ws://127.0.0.1:17324` (127.0.0.1 バインド固定、外部公開不可)
- Health HTTP: `http://127.0.0.1:17325/health`

メッセージ型は `lib/types/rfid.ts` (Web 側) と同期している:

クライアント → ブリッジ:

- `{ type: 'PING' }`
- `{ type: 'SCAN_START', mode: 'single' }`
- `{ type: 'SCAN_CANCEL' }`

ブリッジ → クライアント:

- `{ type: 'PONG' }`
- `{ type: 'STATUS', status: 'ready' | 'busy' | 'error', detail?: string }`
- `{ type: 'SCAN_RESULT', uid: string, scannedAt: string }`
- `{ type: 'ERROR', code, message }`

## Origin 許可リスト

デフォルト:

- `http://localhost:3000`
- `http://localhost:3443`
- `https://triage-tag-system.netlify.app`

追加は環境変数 `RFID_BRIDGE_ALLOWED_ORIGINS` にカンマ区切りで指定。不一致は WebSocket close code 1008 で即時切断、`pino` ログに `event: origin_rejected` を記録する。

## 環境変数

| 変数                          | デフォルト                                     | 用途                            |
| ----------------------------- | ---------------------------------------------- | ------------------------------- |
| `RFID_DLL_DIR`                | `C:\Fujitsu Frontech\RFID\CounterSensorSlim64` | DLL 配置ディレクトリ            |
| `RFID_WS_PORT`                | `17324`                                        | WebSocket ポート                |
| `RFID_HEALTH_PORT`            | `17325`                                        | HTTP /health ポート             |
| `RFID_READ_TIMEOUT_MS`        | `10000`                                        | スキャン待ち時間 (ms)           |
| `RFID_LOG_LEVEL`              | `info`                                         | pino ログレベル                 |
| `RFID_BRIDGE_ALLOWED_ORIGINS` | (empty)                                        | 許可 Origin 追加 (カンマ区切り) |

## トラブルシューティング

### `/health` が `{ status: 'error', driver: 'port_in_use' }` を返す

WebSocket ポート (デフォルト 17324) が他プロセスに占有されている。

```cmd
netstat -ano | findstr :17324
```

PID を確認し、タスクマネージャまたは `taskkill /F /PID <pid>` で停止する。あるいは `RFID_WS_PORT` を別ポートに変更。

### `/health` が `{ status: 'error', driver: 'failed' }` を返す

DLL ロードに失敗。

- `RFID_DLL_DIR` で指定したディレクトリに DLL が存在するか確認
- USB ケーブルが接続されているか
- デバイスマネージャで FUJITSU リーダーが認識されているか

### Origin 拒否ログが大量に出る

`pino` ログに `event: origin_rejected` が出る場合は許可 Origin リストを確認。開発時は `RFID_BRIDGE_ALLOWED_ORIGINS=http://localhost:XXXX` を `.env` に追加。

## ロールバック時の挙動

Web 側で機能が revert された場合、ブリッジ自体は動作継続するが Web 側からの接続要求がなくなるだけ。Windows サービスとして登録した場合は `npm run uninstall-service` で停止・削除できる。
