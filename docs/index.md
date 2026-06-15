---
layout: home

hero:
  name: Notion WebUI
  text: Zed Editor から Notion へ<br>シームレスなコンテンツ送信
  tagline: ローカル運用・高セキュリティ・Obsidian連携対応
  actions:
    - theme: brand
      text: クイックスタート
      link: /guide/quickstart
    - theme: alt
      text: GitHub で見る
      link: https://github.com/watanabe3tipapa/notion-webui

features:
  - title: 🚀 Quick Push
    details: 選択テキストを最短2クリックでNotionページに。タイトル自動抽出、Markdown→Notionブロック変換。
  - title: 🔒 セキュリティ
    details: JWT二層構成 + HttpOnly Cookie + CSRF対策。NotionトークンはAES-256-GCMで暗号化保存。
  - title: ⌨️ Zed 拡張
    details: Zed Editor のコマンドパレットから直接送信。WebViewパネルでプレビューも可能。
  - title: 📓 Obsidian 連携
    details: Vault を監視して自動送信。chokidar による 3秒デバウンス検出。
  - title: 🎨 Composer
    details: Markdown エディタ + リアルタイムプレビュー。プロパティ編集・ページ検索も内蔵。
  - title: 🐳 簡単デプロイ
    details: Docker Compose 一発起動。SQLite ベースで追加インフラ不要。
---
