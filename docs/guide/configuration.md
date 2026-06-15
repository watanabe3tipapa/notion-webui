# 設定

## 環境変数

| 変数 | 必須 | 説明 | デフォルト |
|------|------|------|-----------|
| `PORT` | - | サーバーポート | `4000` |
| `BASE_URL` | - | サーバーのベースURL | `http://localhost:4000` |
| `NOTION_CLIENT_ID` | ✅ | Notion OAuth Client ID | - |
| `NOTION_CLIENT_SECRET` | ✅ | Notion OAuth Client Secret | - |
| `NOTION_REDIRECT_URI` | - | OAuth リダイレクトURI | `http://localhost:4000/api/auth/callback` |
| `JWT_SECRET` | ✅ | JWT 署名用秘密鍵（64文字以上のランダム16進数） | - |
| `ENCRYPTION_KEY` | ✅ | トークン暗号化キー（32文字の16進数） | - |

## Notion 統合の設定

1. [My Integrations](https://www.notion.so/my-integrations) で統合を作成
2. 以下の Capabilities を有効化:
   - コンテンツを読み取る
   - コメントを読み取る
   - ユーザー情報を読み取る
3. リダイレクトURI を設定
4. 統合を対象データベースと共有

## JWT セキュリティ設定

デフォルトのトークン有効期間:

| トークン | 有効期間 | 保存場所 |
|---------|---------|---------|
| Access Token | 15分 | メモリ (Zustand) |
| Refresh Token | 7日 | HttpOnly Cookie |

Refresh Token は使用ごとにローテーション（古いものは無効化）。

## 暗号化

Notion アクセストークンは AES-256-GCM で暗号化して SQLite に保存:
- 暗号化キーはアプリケーション秘密鍵（`ENCRYPTION_KEY`）から scrypt で派生
- 暗号文形式: `iv:authTag:ciphertext`
- 復号はリクエスト時のみメモリ上で実行

## DB マイグレーション

起動時に自動実行されるテーブル:

- `users` — ユーザー情報と暗号化トークン
- `refresh_tokens` — JWT Refresh Token（ハッシュ保存）
- `sync_logs` — 同期操作の履歴
- `migrations` — マイグレーション管理
