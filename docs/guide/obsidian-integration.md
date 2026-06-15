# Obsidian 連携

Obsidian Vault の Markdown ファイルを監視し、変更を自動的に Notion に同期します。

## アーキテクチャ

```
[Obsidian Vault] ──chokidar監視──→ [obsidian-agent] ──HTTP──→ [Server API] ──→ [Notion API]
                                        │
                                   3秒デバウンス
                                   .md ファイルのみ
```

## セットアップ

### 1. 環境変数の設定

```bash
export VAULT_PATH=/path/to/your/obsidian/vault
export USER_ID=<Settings画面で確認したUser ID>
export ACCESS_TOKEN=<ブラウザの開発者ツールなどで確認したAccess Token>
```

### 2. エージェントの起動

```bash
npm run start -w obsidian-agent
```

または環境変数を直接指定:

```bash
VAULT_PATH=/path/to/vault USER_ID=xxx ACCESS_TOKEN=yyy npm run start -w obsidian-agent
```

### 3. 動作確認

エージェントが起動すると、Vault 内の `.md` ファイルの変更を検出して自動送信します。

```
Obsidian Agent starting...
  Vault: /path/to/obsidian/vault
  Server: http://localhost:4000/api/push
  User: xxx
  Found 42 markdown files in vault
Obsidian Agent is watching for changes...
```

## 同期の仕組み

| 項目 | 仕様 |
|------|------|
| 監視対象 | `*.md` ファイルのみ |
| 無視パターン | ドットファイル、`_` で始まるファイル |
| デバウンス | 3秒（連続変更をまとめる） |
| 初期ファイル | `ignoreInitial: true`（起動時は送信しない） |
| ファイル名 | `.md` を除いた部分がタイトルになる |

## Sync Dashboard での確認

Web UI の Sync 画面で同期状況を確認できます:

- 同期ログ一覧（最新50件）
- 各操作のステータス（success / failed / pending）
- ログの手動クリア
- 「Refresh」ボタンで最新状態に更新

## 注意事項

- 双方向同期（Notion→Obsidian）は非対応
- 初回同期時は既存ファイルは送信されません（変更検出のみ）
- ファイル削除は同期しません
- Vault のパスは絶対パスで指定してください
