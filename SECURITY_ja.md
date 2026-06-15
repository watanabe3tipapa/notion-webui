# セキュリティポリシー

## サポートバージョン

| バージョン | サポート状況 |
|------------|--------------|
| 0.1.x      | :white_check_mark: |

このプロジェクトは [Semantic Versioning](https://semver.org/) に準拠します。

## 脆弱性の報告

セキュリティ脆弱性を発見した場合、プロジェクトメンテナーにメールで報告してください。

**公開 GitHub Issue でセキュリティ脆弱性を報告しないでください。**

報告に含める情報：

- 問題の種類（XSS、CSRF、認証バイパスなど）
- 関連するソースファイルの完全パス
- 再現手順
- 概念実証コード（可能な場合）
- 問題の影響範囲

48時間以内に返信がない場合は、メッセージが届いているか確認のためにフォローアップしてください。

## このプロジェクトのセキュリティ対策

- JWT: Access Token (15分) + Refresh Token (7日、HttpOnly Cookie、ローテーション)
- CSRF: Double Submit Cookie + SameSite=Strict + timingSafeEqual
- トークン保存: Notion OAuth トークンを AES-256-GCM 暗号化
- OAuth: State パラメータ検証 (10分 TTL)
- レート制限: エンドポイント別制限 (express-rate-limit)
- HTTP ヘッダー: Helmet ミドルウェア
- 起動時検証: 必須環境変数を fail-fast チェック

## 推奨言語

英語または日本語での報告を推奨します。
