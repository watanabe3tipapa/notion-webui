# デプロイ

## 簡単デプロイ (Docker Compose)

Docker Compose を使うとサーバー環境に Node.js をインストールせずに起動できます。

::: tip 前提条件
- Docker および Docker Compose がインストールされていること
- [Notion Integration](/guide/quickstart#3-notion-integration-の作成) を作成済みであること
:::

### 1. 環境変数ファイルの準備

```bash
cp .env.example .env
```

`.env` ファイルを開いて以下の値を設定します:

```text
PORT=4000
BASE_URL=http://localhost:4000
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret
NOTION_REDIRECT_URI=http://localhost:4000/api/auth/callback
JWT_SECRET=64文字以上のランダムな16進文字列
ENCRYPTION_KEY=32文字のランダムな16進文字列
```

各項目の説明:

| 変数 | 説明 | 必須 |
|------|------|------|
| `NOTION_CLIENT_ID` | Notion Integration の Client ID | ✅ |
| `NOTION_CLIENT_SECRET` | Notion Integration の Client Secret | ✅ |
| `NOTION_REDIRECT_URI` | OAuth コールバック URL（変更時は要修正） | ✅ |
| `JWT_SECRET` | JWT 署名用の秘密鍵 | ✅ |
| `ENCRYPTION_KEY` | Notion トークン暗号化用の鍵 | ✅ |
| `PORT` | サーバーのポート番号（デフォルト 4000） | |
| `BASE_URL` | 外部からアクセスする URL | |

### 2. 暗号鍵の生成

以下のコマンドで `JWT_SECRET` と `ENCRYPTION_KEY` を生成できます:

```bash
# JWT_SECRET（64文字の16進文字列）
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ENCRYPTION_KEY（32文字の16進文字列）
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

::: warning
- 生成した鍵は安全な場所に保管してください
- 鍵を紛失すると既存の Notion トークンが復号できなくなります
- プロダクションでは必ず強力なランダム文字列を使用してください
:::

### 3. docker-compose.yml の確認

[`docker-compose.yml`](https://github.com/watanabe3tipapa/notion-webui/blob/main/docker-compose.yml) の内容:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - BASE_URL=http://localhost:4000
      - NOTION_CLIENT_ID=${NOTION_CLIENT_ID}
      - NOTION_CLIENT_SECRET=${NOTION_CLIENT_SECRET}
      - NOTION_REDIRECT_URI=http://localhost:4000/api/auth/callback
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

ポイント:

- 環境変数は `.env` ファイルから `${変数名}` の形式で自動読込されます
- `./data` ディレクトリに SQLite データベースが永続化されます
- `restart: unless-stopped` により、コンテナは明示的に停止されるまで自動再起動します

### 4. コンテナのビルドと起動

```bash
docker compose up -d
```

初回起動時はイメージのビルドが実行されます。2回目以降はキャッシュが使用されます。

起動確認:

```bash
# コンテナの状態確認
docker compose ps

# ログの確認（初回はビルドログを含む）
docker compose logs -f
```

### 5. ブラウザでアクセス

サーバーが `http://localhost:4000` で起動します。

1. ブラウザで `http://localhost:4000` を開く
2. 「Connect Notion」ボタンをクリック
3. Notion の OAuth 認証画面で許可
4. 自動的にリダイレクトされ認証完了

### 6. コンテナの管理

```bash
# 停止
docker compose stop

# 停止 + コンテナ削除
docker compose down

# 再起動
docker compose restart

# ログをリアルタイム表示
docker compose logs -f app
```

### 7. アプリケーションの更新

新しいバージョンがリリースされたら:

```bash
git pull
docker compose up -d --build
```

`--build` オプションでイメージを再ビルドし、コンテナを再作成します。

### 8. データの永続化・バックアップ

データは `./data` ディレクトリに保存されます:

```
data/
└── notion-webui.db   # SQLite データベース
```

バックアップ:

```bash
# コンテナ稼働中でも SQLite のコピーは安全に取得可能
cp data/notion-webui.db backup/notion-webui-$(date +%Y%m%d).db
```

定期バックアップを推奨します。

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
