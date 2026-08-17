# MedMatch — クローズドβ向けMVP

医学生・病院・運営の3ロールを持つ、Supabase接続型の静的Webアプリです。

## 最初にやること
1. GitHubへこのフォルダ一式をアップロード
2. GitHub PagesをGitHub Actionsで有効化
3. Supabaseプロジェクトを作成
4. `supabase/migrations/001_init.sql` をSQL Editorで実行
5. `config.js` にProject URLとPublishable keyを設定してGitHubへ反映
6. Supabase AuthのSite URL / Redirect URLをGitHub Pages URLに設定
7. 医学生・病院を新規登録
8. 管理者ユーザーを作り `supabase/ADMIN_SETUP.sql` を実行

## 注意
- `sb_secret_...` や service-role key はGitHubへ絶対に置かないでください。
- ブラウザに置いてよいのはPublishable keyです。
- `privacy.html` と `terms.html` はドラフトです。一般公開前に法務確認が必要です。
- 本番前に独自SMTP、MFA、バックアップ、監視、問い合わせ窓口を整備してください。
