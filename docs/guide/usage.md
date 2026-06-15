# 基本操作ガイド

## Quick Push モーダル

最もシンプルな操作方法です。選択テキストを即座に Notion ページとして作成します。

### 使い方

1. **Home** 画面で「Quick Push」をクリック
2. **Title**: 自動抽出されます（最初の見出しまたは先頭行）
3. **Mode**:
   - `Create new page`: 新規ページ作成（デフォルト）
   - `Update existing page`: 既存ページの内容更新
4. **Database**: 保存先のデータベースを選択（オプション）
5. **Markdown**: 内容を入力/ペースト
6. `Cmd+Enter` または「Create Page」ボタンで送信

::: tip
- タイトルは手動で編集できます
- ブロック数が自動表示されます
- Update mode では PagePicker で対象ページを検索できます
:::

## Composer

よりリッチな編集が可能なコンポーザーです。

### 特徴

- **Markdown エディタ**: 左側で自由に記述
- **リアルタイムプレビュー**: 右側にレンダリング結果を表示
- **プロパティ編集**: ページプロパティ（タグ、日付、セレクト等）を設定可能
- **ページ検索**: Update mode で既存ページを検索して上書き

### サポートする Markdown 記法

| 要素 | 記法 | Notion ブロック |
|------|------|----------------|
| 見出し | `# h1` / `## h2` / `### h3` | `heading_1/2/3` |
| 段落 | 通常テキスト | `paragraph` |
| 太字 | `**bold**` | `annotations.bold` |
| イタリック | `*italic*` | `annotations.italic` |
| 取り消し線 | `~~text~~` | `annotations.strikethrough` |
| インラインコード | `` `code` `` | `annotations.code` |
| リンク | `[text](url)` | `text.link` |
| 順序なしリスト | `- item` | `bulleted_list_item` |
| 順序付きリスト | `1. item` | `numbered_list_item` |
| TODOリスト | `- [x] task` | `to_do` |
| コードブロック | ` ```lang` | `code` (言語指定可) |
| 引用 | `> quote` | `quote` |
| 区切り線 | `---` | `divider` |
| 画像 | `![alt](url)` | `image` (外部URL) |
| テーブル | `\| col1 \| col2 \|` | `table` |

## アクティビティログ

Sync 画面で操作履歴を確認できます。

- 作成/更新の日時
- 成功/失敗ステータス
- 対象ページ ID
- エラーメッセージ（失敗時）

ログは手動でクリア可能です。
