# クイックスタート

## 前提条件

- Node.js 20+
- Notion アカウント
- Notion Integration（内部統合）

## 1. リポジトリのクローン

```bash
git clone https://github.com/watanabe3tipapa/notion-webui.git
cd notion-webui
```

## 2. 依存関係のインストール

```bash
npm install
```

## 3. Notion Integration の作成

1. [Notion Integrations](https://www.notion.so/my-integrations) にアクセス
2. 「+ 新しい統合」をクリック
3. 名前を入力（例: `Zed Notion WebUI`）
4. 関連付けられたシークレット（Client Secret）をコピー
5. 「ユーザー情報」タブで Client ID をコピー
6. リダイレクトURI に `http://localhost:4000/api/auth/callback` を設定

::: warning
統合の Capabilities で 「コンテンツを読み取る」「コメントを読み取る」「ユーザー情報を読み取る」を有効にしてください。
:::

## 4. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集:

```text
PORT=4000
BASE_URL=http://localhost:4000
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret
NOTION_REDIRECT_URI=http://localhost:4000/api/auth/callback
JWT_SECRET=64文字以上のランダムな16進文字列
ENCRYPTION_KEY=32文字のランダムな16進文字列
```

::: tip
JWT_SECRET と ENCRYPTION_KEY は以下のコマンドで生成できます:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

## 5. データベースとの共有

作成した Integration を Notion のデータベースと共有します:

1. Notion でデータベースを開く
2. 右上の「…」→「接続」→統合名を追加
3. データベースの ID をメモ（URL の `workspace/` と `?v=` の間の部分）

## 6. サーバーの起動

```bash
# 開発モード
npm run dev -w server
```

サーバーが `http://localhost:4000` で起動します。

## 7. Notion に接続

1. ブラウザで `http://localhost:4000` を開く
2. 「Connect Notion」ボタンをクリック
3. Notion の認証画面で許可
4. 自動的にリダイレクトされ、認証完了

## 8. 動作確認

1. Settings 画面で User ID を確認
2. Quick Push モーダルを開く
3. マークダウンを入力して「Create Page」をクリック
4. Notion でページが作成されたことを確認

## 次のステップ

- [基本操作ガイド](./usage) — 各種機能の詳細
- [Zed 拡張](./zed-extension) — Zed Editor からの直接送信
- [Obsidian 連携](./obsidian-integration) — Vault の自動同期
