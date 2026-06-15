# DEV-MEMO

## プロジェクト概要
Zed Editor → Notion へのコンテンツ送信 + Obsidian連携 Webツール

## アーキテクチャ

```
[Zed Editor]──HTTP──→[Express Server:4000]──→[Notion API]
                              │
                    serve static: React SPA
                              │
                    [Browser: localhost:4000]
```

## ディレクトリ構成

```
notion-webui/
├── server/
│   ├── src/
│   │   ├── index.ts              # Express エントリ
│   │   ├── config.ts             # env 管理
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT 検証
│   │   │   ├── csrf.ts           # Double Submit Cookie
│   │   │   ├── rateLimiter.ts    # express-rate-limit
│   │   │   └── errorHandler.ts   # エラーハンドラ
│   │   ├── routes/
│   │   │   ├── auth.ts           # Notion OAuth + JWT発行
│   │   │   ├── push.ts           # /api/push (作成/更新)
│   │   │   ├── pages.ts          # /api/pages (検索・一覧)
│   │   │   ├── me.ts             # /api/me
│   │   │   └── sync.ts           # Obsidian同期
│   │   ├── services/
│   │   │   ├── notion.ts         # Notion SDK ラッパー
│   │   │   ├── jwt.ts            # JWT 発行・検証・ローテーション
│   │   │   └── crypto.ts         # AES-256-GCM 暗号化
│   │   └── lib/
│   │       ├── store.ts          # SQLite (better-sqlite3)
│   │       ├── migrate.ts        # マイグレーション
│   │       └── markdown-to-notion.ts  # remark 変換
│   ├── static/                   # ビルド済みReact SPA
│   ├── package.json
│   └── tsconfig.json
├── webui/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── QuickPushModal.tsx
│   │   │   ├── Composer.tsx
│   │   │   ├── SyncDashboard.tsx
│   │   │   ├── PagePicker.tsx
│   │   │   ├── PropertyEditor.tsx
│   │   │   └── Toast.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── usePush.ts
│   │   ├── api/
│   │   │   └── client.ts
│   │   └── stores/
│   │       └── auth.ts
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── index.html
├── zed-extension/
│   └── src/
│       ├── main.ts
│       └── ui.html
├── obsidian-agent/
│   └── src/
│       ├── index.ts
│       └── watcher.ts
├── docs/
│   ├── .vitepress/
│   ├── index.md
│   └── guide/                    # 7ページ (quickstart, usage, config, zed, obsidian, api, deploy)
├── package.json                  # npm workspaces ルート
├── .env.example
├── docker-compose.yml
├── .github/workflows/
│   └── deploy-docs.yml           # GitHub Actions Pages デプロイ
├── DEV-MEMO.md
├── PLAN.md
└── README.md
```

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| サーバ | Express + TypeScript |
| DB | better-sqlite3 + Knex.js |
| JWT | jsonwebtoken + bcrypt |
| Notion SDK | @notionhq/client |
| Markdown解析 | remark + mdast-util-from-markdown |
| 暗号化 | Node.js crypto (AES-256-GCM) |
| フロントエンド | React 18 + Vite + Tailwind CSS |
| UIコンポーネント | Headless UI + Heroicons |
| 状態管理 | Zustand |
| HTTPクライアント | ky (フロント) |

## 作業フェーズ

### Phase 1: サーバ基盤 + OAuth + JWT + CRUD
- [x] DEV-MEMO.md 作成
- [x] ルート monorepo 構成
- [x] server/ 雛形 (Express + TypeScript + better-sqlite3)
- [x] テーブルスキーマ (users, refresh_tokens, sync_logs)
- [x] config.ts 環境変数管理
- [x] ミドルウェア (auth, csrf, rateLimiter, errorHandler)
- [x] crypto.ts AES-256-GCM 暗号化
- [x] jwt.ts JWT 発行・検証・リフレッシュ
- [x] auth.ts OAuth フロー
- [x] notion.ts Notion SDK ラッパー (create/update)
- [x] push.ts ページ作成・更新エンドポイント
- [x] me.ts ユーザー情報
- [x] pages.ts ページ検索
- [x] sync.ts Obsidian同期エンドポイント
- [x] store.ts SQLite 操作
- [x] migrate.ts マイグレーション

### Phase 2: Markdown変換 + Quick Push UI (React SPA)
- [x] markdown-to-notion.ts（全ブロック・インライン装飾）
- [x] webui/ セットアップ (Vite + React + Tailwind + Router)
- [x] APIクライアント (JWT自動付与 + CSRF)
- [x] Quick Push モーダル
- [x] トースト通知
- [x] Composer 画面 (エディタ + プレビュー)
- [x] PagePicker / PropertyEditor コンポーネント
- [x] SyncDashboard (Activity Log)
- [x] ビルド→ server/static/ 出力

### Phase 3: Zed拡張 + Obsidian連携
- [x] Zed拡張 (選択テキスト取得→HTTP送信)
- [x] Obsidian Agent (chokidar監視)
- [x] Sync Dashboard 画面
- [x] Exponential Backoff / デバウンス (3s)

### Phase 4: セキュリティ監査 + デプロイ
- [x] CSRF (Double Submit Cookie + SameSite=Strict)
- [x] JWT (Access Token 15m + Refresh Token 7d HttpOnly)
- [x] AES-256-GCM 暗号化
- [x] Helmet, Rate Limiting
- [x] README / .env.example
- [x] Dockerfile / docker-compose.yml
- [x] ビルド成功確認

## 決定事項
- ローカル運用（1プロセス完結）
- Markdown変換: remark ベース自前実装
- 認証: JWT (Access 15分 + Refresh 7日 HttpOnly Cookie)
- CSRF: Double Submit Cookie + SameSite=Strict
- DB: better-sqlite3 + Knex.js
- 暗号化: AES-256-GCM
- フロントエンド: React + Vite + Tailwind + Zustand + React Router

## ログ

### 2026-06-15 Phase 1-5 一括完了
- **server/**: Express + TypeScript 全実装
  - ルート: auth (OAuth/JWT), push (create/update), me, pages (search/databases), sync (logs)
  - ミドルウェア: auth (JWT認証), csrf (Double Submit Cookie), rateLimiter, errorHandler
  - サービス: crypto (AES-256-GCM), jwt (Access 15m + Refresh 7d), notion (SDKラッパー)
  - DB: better-sqlite3 + Knex スキーマ (users, refresh_tokens, sync_logs)
- **webui/**: React + Vite + Tailwind 全実装
  - コンポーネント: Layout, QuickPushModal, Composer, Toast, PagePicker, PropertyEditor, SyncDashboard
  - ページ: Home, Settings, Sync
  - API Client: JWT自動付与, CSRF, トークンリフレッシュ
- **zed-extension/**: TypeScript (pushSelection, openPushPanel)
- **obsidian-agent/**: chokidar監視, サーバー送信 (debounce 3s)
- **docs/**: VitePress チュートリアルサイト（`npm run docs:dev`）
- **GitHub Actions**: 自動docsデプロイ (.github/workflows/deploy-docs.yml)
- **Dockerfile + docker-compose.yml** 完備

### 2026-06-15 GitHub Push前 総点検 + セキュリティ監査
**監査結果**: 3パッケージ全ビルド成功 ✅

実施項目:
- [x] 初回 git init / gitignore 完全性確認
- [x] 全パッケージ tsc + vite + vitepress ビルド
- [x] 秘密情報混入チェック（.env 非追跡確認）
- [x] ビルドアーティファクト除外確認（dist, *.db, data/, *.tsbuildinfo, .DS_Store）

**セキュリティ監査（HIGHLIGHT）**:
- **HIGH**: OAuth state パラメータ未実装 → 修正済み（state生成 + 検証 + 10分有効期限）
- **HIGH**: JWT verify() に algorithm 指定なし → 修正済み（`algorithms: ['HS256']`）
- **HIGH**: 必須環境変数に空文字デフォルト → 修正済み（`requireEnv()` で startup fail-fast）
- **HIGH**: Cookie secure=false 固定 → 修正済み（`config.isProduction` で条件分岐）
- **MEDIUM**: CSRF トークン比較に timingSafeEqual 未使用 → 修正済み
- **MEDIUM**: アンマウント後の setState（6コンポーネント） → 修正済み（mountedRef パターン）
- **MEDIUM**: リストネスト消失バグ・テーブル行ドロップ → 修正済み（processListItems + children プロパティ）

**軽微修正**:
- PropertyEditor: キーを index → id ベースに変更
- QuickPushModal: タイトル自動抽出がユーザー入力消去しないよう titleTouchedRef
- api/client: ky の retry 重複制御を整理

### 2026-06-15 README.md テンプレート準拠に書き換え
- README.md をテンプレート形式に準拠（日本語メイン）
- README_EN.md 新規作成（英語版、言語切り替え連動）
- バッジ行追加、特徴箇条書き、コントリビューション・セキュリティ・連絡先セクション追加

### 2026-06-15 テンプレートファイル追加生成
- LICENSE (MIT) 新規作成
- CONTRIBUTING.md / CONTRIBUTING_ja.md
- SECURITY.md / SECURITY_ja.md
- CODE_OF_CONDUCT.md / CODE_OF_CONDUCT_ja.md
- CHANGELOG.md（Keep a Changelog 形式、プロジェクト実績を記述）

### 2026-06-15 Push前 最終総点検
**全チェック PASS ✅**

| 項目 | 結果 |
|------|------|
| Git status | 不審ファイル・.env混入なし |
| .gitignore | node_modules, dist, *.db, data, .env, *.tsbuildinfo, .DS_Store, docs/.vitepress/dist 除外確認 |
| server tsc | ✅ 0 error |
| webui tsc + vite build | ✅ 0 error (server/static/ 出力) |
| docs vitepress build | ✅ 0 error, 0 warning |
| ハードコード秘密情報 | ✅ 該当なし |
| .env 混入 | ✅ なし |
| ファイル数 | 83 ファイル（ソースのみ） |
| プロジェクトサイズ | ~2.2MB (node_modules 275MB は gitignore) |
| テンプレートファイル | ✅ LICENSE, CONTRIBUTING(ja), SECURITY(ja), CODE_OF_CONDUCT(ja), CHANGELOG, README(EN) |

### 未完了（今後の拡張候補）
- Notion API の `pages.create` は database_id 必須。ユーザーにDB選択を促すフローに変更済み
- workspace 直下への作成は非対応（Notion API 仕様）
- Obsidian 双方向同期（vault→server→notion）は片方向のみ
- 単体テスト未実装
- エラーハンドリングの強化（429リトライ、チャンク分割等）
- スクリーンショット未収録（docs/ 内の画像参照はプレースホルダ）
