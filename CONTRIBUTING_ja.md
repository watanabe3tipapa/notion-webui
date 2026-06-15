# Notion WebUI へのコントリビューション

このプロジェクトへのコントリビューションを検討いただきありがとうございます！

## コントリビューションの方法

### バグの報告

1. [Issues](https://github.com/watanabe3tipapa/notion-webui/issues) で既報告か確認
2. 明確なタイトルと説明で issue を作成
3. バグを再現する手順を含める
4. 関連するラベルを追加（bug など）

### 機能提案

1. 既提案かどうか確認
2. 明確なタイトルと説明で issue を作成
3. この機能がなぜ有用かを説明
4. 関連するラベルを追加（enhancement など）

### Pull Request

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/your-feature`)
3. 変更を加える
4. `npm run build -w server && npm run build -w webui` でビルドが通ることを確認
5. 明確なメッセージでコミット
6. フォークにプッシュ
7. Pull Request を作成

## 開発環境のセットアップ

```bash
git clone https://github.com/watanabe3tipapa/notion-webui.git
cd notion-webui
npm install
cp .env.example .env
npm run dev -w server
npm run dev -w webui
```

## コードスタイル

- プロジェクトは TypeScript strict mode を使用
- 一貫したフォーマットを使用（Prettier 推奨）
- 意味のあるコミットメッセージを書く
- 必要に応じてドキュメントを更新

## ライセンス

コントリビューションすることで、MIT ライセンスの下でコントリビューションがライセンスされることに同意します。
