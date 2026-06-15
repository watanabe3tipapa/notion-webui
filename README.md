[![Notion WebUI](https://via.placeholder.com/150x50?text=Notion+WebUI)](https://github.com/watanabe3tipapa/notion-webui)

<!-- badges -->
[![License](https://img.shields.io/github/license/watanabe3tipapa/notion-webui.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-20%2B-339933.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6.svg)](https://www.typescriptlang.org)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[English](README_EN.md) | [日本語](README.md)

# Notion WebUI

ローカルで動作する、Zed Editor から Notion へのシームレスなコンテンツ送信ツール。
Obsidian Vault の自動同期にも対応。

- **Simple Push** — 選択テキストを最短2クリックで Notion ページに。タイトル自動抽出、Markdown→Notion ブロック変換
- **🔒 Security First** — JWT 二層構成 + HttpOnly Cookie + CSRF 対策。Notion トークンは AES-256-GCM で暗号化保存
- **⌨️ Zed 拡張** — コマンドパレットから直接送信。WebView パネルでプレビューも可能
- **📓 Obsidian 連携** — Vault を chokidar で監視し3秒デバウンスで自動送信
- **🎨 Composer** — Markdown エディタ + リアルタイムプレビュー + プロパティ編集 + ページ検索
- **🐳 簡単デプロイ** — Docker Compose 一発起動。SQLite ベースで追加インフラ不要

## スクリーンショット

<!-- スクリーンショットをここに追加 -->
*(準備中)*

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/watanabe3tipapa/notion-webui.git
cd notion-webui

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .env を編集: NOTION_CLIENT_ID, NOTION_CLIENT_SECRET, JWT_SECRET, ENCRYPTION_KEY
```

## 使い方

```bash
# 開発サーバー起動（ホットリロード）
npm run dev -w server

# ブラウザで開く → Connect Notion で OAuth 認証
# http://localhost:4000
```

詳細な使い方は[チュートリアルサイト](https://watanabe3tipapa.github.io/notion-webui/)を参照してください。

## プロジェクト構成

| ディレクトリ | 説明 |
|------------|------|
| `server/` | Express + TypeScript バックエンド (API + static配信) |
| `webui/` | React + Vite + Tailwind CSS フロントエンド |
| `zed-extension/` | Zed Editor 拡張 |
| `obsidian-agent/` | Obsidian Vault 監視エージェント |
| `docs/` | VitePress チュートリアルサイト |

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| サーバ | Express + TypeScript |
| DB | better-sqlite3 |
| 認証 | JWT (HS256) + Notion OAuth 2.0 |
| 暗号化 | AES-256-GCM |
| フロントエンド | React 18 + Vite + Tailwind CSS |
| 状態管理 | Zustand |
| UI | Headless UI + Heroicons |
| Markdown解析 | remark + remark-gfm |

## コントリビューション

コントリビューションは大歓迎です！まず [CONTRIBUTING.md](CONTRIBUTING.md) をご確認ください。

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を作成

## セキュリティ

- JWT (Access Token 15分 + Refresh Token 7日 HttpOnly Cookie)
- CSRF: Double Submit Cookie + SameSite=Strict + timingSafeEqual
- Notion Token: AES-256-GCM 暗号化保存
- OAuth state パラメータ検証（10分有効期限）
- Helmet + Rate Limiting エンドポイント別
- 必須環境変数は起動時に fail-fast 検証

## ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

