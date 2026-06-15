# デプロイ

## Docker Compose

最も簡単なデプロイ方法です。

```bash
# 1. 環境変数の設定
cp .env.example .env
# .env を編集（JWT_SECRET, ENCRYPTION_KEY, NOTION_CLIENT_ID, NOTION_CLIENT_SECRET）

# 2. Docker Compose で起動
docker compose up -d

# 3. ログ確認
docker compose logs -f
```

サーバーが `http://localhost:4000` で起動します。

## Docker 単体

```bash
# ビルド
docker build -t notion-webui .

# 実行
docker run -d \
  -p 4000:4000 \
  --env-file .env \
  -v ./data:/app/data \
  notion-webui
```

## 手動デプロイ

### 1. ビルド

```bash
# フロントエンドのビルド（server/static/ に出力）
npm run build -w webui

# サーバーのビルド
npm run build -w server
```

### 2. 本番起動

```bash
NODE_ENV=production npm start -w server
```

## セキュリティチェックリスト

- [ ] `JWT_SECRET` に強力なランダム文字列を使用している
- [ ] `ENCRYPTION_KEY` に強力なランダム文字列を使用している
- [ ] HTTPS を設定している（リバースプロキシ推奨）
- [ ] Notion Integration のスコープを最小限にしている
- [ ] データベース（`data/`）のバックアップを取得している

## リバースプロキシ構成例（Nginx）

```nginx
server {
    listen 443 ssl;
    server_name notion-webui.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## データ永続化

Docker Compose では `./data` ディレクトリをコンテナにマウントしています:

```
data/
├── notion-webui.db   # SQLite データベース
└── store.json        # （旧形式、現在未使用）
```

このディレクトリの定期バックアップを推奨します。

##  トラブルシューティング

### サーバーが起動しない

```bash
# ポート競合の確認
lsof -i :4000

# ログの確認
docker compose logs app
```

### Notion API エラー

- Integration が対象データベースと共有されているか確認
- Notion API のレート制限（429）: 時間をおいて再試行
- トークンが期限切れ: 設定画面から再認証

### OAuth エラー

- Redirect URI が Notion Integration の設定と一致しているか確認
- `NOTION_CLIENT_ID` / `NOTION_CLIENT_SECRET` が正しいか確認
- ブラウザの Cookie をクリアして再試行
