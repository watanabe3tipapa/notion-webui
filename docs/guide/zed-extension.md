# Zed Editor 拡張

Zed Editor から直接 Notion にコンテンツを送信できる拡張機能です。

## 機能

- **選択テキスト送信**: エディタで選択した範囲を Notion ページとして作成
- **ファイル全体送信**: 選択がない場合はファイル全体を送信
- **WebView パネル**: プレビュー・タイトル編集・モード選択が可能なパネルを表示
- **自動タイトル抽出**: 最初の `# 見出し` または先頭行をタイトルとして自動設定

## インストール

1. Zed の拡張ディレクトリに `zed-extension/` を配置:

```bash
# 拡張ディレクトリのパス（環境によって異なります）
# macOS: ~/.config/zed/extensions/
# Linux: ~/.config/zed/extensions/
# または Zed 内の設定から拡張ディレクトリを確認

cp -r zed-extension ~/.config/zed/extensions/notion-webui
```

2. Zed を再起動

## コマンド

拡張は以下のコマンドを提供します:

| コマンド | 説明 | デフォルトショートカット |
|---------|------|------------------------|
| `Push to Notion (Selection)` | 選択テキストを即座に Notion へ送信 | なし（設定可能） |
| `Push to Notion (Panel)` | WebView パネルを開いて詳細設定後に送信 | なし（設定可能） |

## 使い方

### クイック送信

1. エディタでテキストを選択（またはファイル全体）
2. コマンドパレット（`Cmd+Shift+P`）を開く
3. `Push to Notion (Selection)` を実行
4. 成功すると Notion ページの URL が自動的に開く

### パネル送信

1. コマンドパレットから `Push to Notion (Panel)` を実行
2. WebView パネルが開き、選択テキストが表示される
3. タイトル・モードを編集
4. 「Push to Notion」ボタンをクリック
5. 結果がパネル内に表示される

## 認証

拡張を使用する前に、ブラウザで `http://localhost:4000` にアクセスし、Notion 認証を完了してください。

拡張はサーバーの `/api/auth/refresh` エンドポイントを使って自動的にトークンを取得します。

## 注意事項

- Zed Extension API は開発中のため、実際の API に合わせて `src/main.ts` の `zed.*` 呼び出しを調整してください
- サーバーが起動していないとエラーになります
- 初回認証はブラウザが必要です
