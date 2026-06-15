# API リファレンス

## 認証

### OAuth 開始

```http
GET /api/auth/start
```

**レスポンス**
```json
{
  "url": "https://api.notion.com/v1/oauth/authorize?owner=user&response_type=code&client_id=...",
  "csrfToken": "..."
}
```

### OAuth コールバック

```http
GET /api/auth/callback?code=xxx
```

**処理**: Notion からアクセストークンを取得 → 暗号化保存 → JWT 発行

**レスポンス**: `{ accessToken, userId }`
**Set-Cookie**: `refreshToken` (HttpOnly, SameSite=Strict)

### トークンリフレッシュ

```http
POST /api/auth/refresh
Cookie: refreshToken=xxx
```

**レスポンス**
```json
{
  "accessToken": "new_access_token",
  "userId": "user_id"
}
```

### ログアウト

```http
POST /api/auth/logout
Cookie: refreshToken=xxx
```

**レスポンス**: `{ "success": true }`

## ユーザー

### ユーザー情報

```http
GET /api/me
Authorization: Bearer <access_token>
```

**レスポンス**
```json
{
  "authenticated": true,
  "id": "user_id",
  "notion_user_id": "notion_user_id",
  "workspace_id": "workspace_id",
  "scopes": "read,write",
  "created_at": "2026-06-15T00:00:00.000Z"
}
```

## ページ操作

### ページ作成 / 更新

```http
POST /api/push
Authorization: Bearer <access_token>
Content-Type: application/json
```

**リクエスト**
```json
{
  "mode": "create",
  "title": "ページタイトル",
  "markdown": "# 見出し\n\n本文",
  "databaseId": "database_id_optional"
}
```

**mode = "create" のレスポンス**
```json
{
  "success": true,
  "pageId": "notion_page_id",
  "url": "https://www.notion.so/..."
}
```

**mode = "update" のリクエスト**
```json
{
  "mode": "update",
  "pageId": "notion_page_id",
  "title": "更新タイトル",
  "markdown": "# 更新後の内容"
}
```

**レート制限**: 30 req / 分

### ページ検索

```http
GET /api/pages/search?q=検索クエリ
Authorization: Bearer <access_token>
```

**レスポンス**
```json
{
  "results": [
    {
      "id": "page_id",
      "properties": {
        "title": { "title": [{ "plain_text": "ページ名" }] }
      }
    }
  ]
}
```

### データベース一覧

```http
GET /api/pages/databases
Authorization: Bearer <access_token>
```

**レスポンス**
```json
{
  "results": [
    {
      "id": "database_id",
      "title": [{ "plain_text": "データベース名" }]
    }
  ]
}
```

## 同期ログ

### ログ取得

```http
GET /api/sync/logs?limit=50&offset=0
Authorization: Bearer <access_token>
```

**レスポンス**
```json
{
  "logs": [
    {
      "id": 1,
      "action": "create",
      "status": "success",
      "page_id": "page_id",
      "message": null,
      "created_at": "2026-06-15T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

### ログ削除

```http
DELETE /api/sync/logs
Authorization: Bearer <access_token>
```

**レスポンス**: `{ "success": true }`

## エラーレスポンス

```json
{
  "error": "エラーメッセージ"
}
```

**HTTP ステータスコード**

| コード | 説明 |
|--------|------|
| 400 | パラメータ不足・不正 |
| 401 | 認証エラー（トークン無効・期限切れ） |
| 403 | CSRF トークン不一致 |
| 429 | レート制限超過 |
| 500 | サーバー内部エラー |

## CSRF 保護

- GET/HEAD/OPTIONS リクエストで `csrf-token` Cookie が設定されます
- 変更操作（POST/PUT/DELETE）では `X-CSRF-Token` ヘッダーに同じ値を設定してください
- Cookie は `SameSite=Strict`
