# Web アプリ開発フロー

本プロジェクトは以下の手順で設計・実装・デプロイを行います。

1. 外部仕様・技術スタック定義（LLM活用）
   - GPT/Gemini等で要件定義書と技術スタック一覧を生成
   - `frontend/technology-stack.md`／`backend/technology-stack.md` に反映

2. プロジェクト指示書への反映
   - LLMのアウトプットを `frontend/instructions.mdc` と `backend/instructions.mdc` に落とし込む

3. Cursorエディターでプロジェクトをオープン
   ```bash
   cursor open .
   ```

4. フロントエンド実装
   1. 骨組み生成: `npm run scaffold:fe`
   2. 開発サーバ起動: `npm run dev:fe`
   3. UI/機能の実装

5. モックバックエンド準備
   1. JSON-Server等でモックAPIを生成
   2. フロントは `src/lib/api.ts` でモックを呼び出し

6. フロント完成後の引き渡し準備
   - Gitリポジトリごとバックエンドチームへ共有

7. バックエンド実装
   1. `backend/instructions.mdc` に従いAPIサーバ骨子を作成
   2. Prisma認証ミドルウェア、IaC適用

8. APIエンドポイント切替
   - フロントのAPI設定をモックから本番へ

9. E2Eテスト・品質保証
   - Playwright/Mabl等でフルスタックテスト

10. 本番運用デプロイ
    - IaCとGitHub ActionsでAWSリソース構築・リリース

