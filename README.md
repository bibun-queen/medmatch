# MedMatch — 0から再構築版

医学生・病院・運営の3ロールを持つ、GitHub Pages + Supabase 向けの静的Webアプリです。

## 今回の構成
- `index.html` — 入口。`src/main.js` を必ず読み込む
- `src/main.js` — 画面、ルーティング、Supabase認証・CRUD
- `styles.css` — 公的求人サイト寄りの情報密度を意識したUI
- `config.js` — Supabase URL / Publishable key
- `supabase/migrations/001_init.sql` — 新規DBスキーマ・RLS
- `supabase/ADMIN_SETUP.sql` — 管理者昇格
- `.github/workflows/pages.yml` — GitHub Pagesデプロイ

## 重要: 既存環境に上書きする場合
今回のSQLは「新しいSupabaseプロジェクト」または「空の public schema」を前提にしています。古いテーブルが残った環境に無理に重ねるより、新規Supabaseプロジェクトで開始する方が安全です。

## 初期セットアップ
1. このフォルダ一式をGitHubリポジトリのルートへ置く。
2. GitHub > Settings > Pages > Source を `GitHub Actions` にする。
3. Supabaseで新しいプロジェクトを作る。
4. SQL Editorで `supabase/migrations/001_init.sql` を実行する。
5. `config.js` の `supabaseUrl` と `supabasePublishableKey` を新しい値に置き換える。
6. Supabase > Authentication > URL Configuration で Site URL をGitHub Pages URLにする。
7. Redirect URLs に `https://<user>.github.io/<repo>/**` を追加する。
8. 医学生・病院を画面から登録する。
9. 管理者用アカウントを1つ登録し、`supabase/ADMIN_SETUP.sql` のUUIDを差し替えて実行する。

## 画面
- トップ / 募集検索
- 募集詳細
- 病院詳細
- ログイン / 新規登録
- 医学生マイページ: プロフィール、応募、スカウト
- 病院マイページ: 病院登録、募集、応募者、学生検索、スカウト
- 管理者: 病院承認・却下、ユーザー停止・有効化

## セキュリティ
- ブラウザに置くのは Publishable key のみ。
- `service_role`、Secret key、DBパスワードはGitHubへ置かない。
- RLSは `001_init.sql` に含まれる。
- 本番公開前にメール確認、MFA、独自SMTP、バックアップ、監査、利用規約・プライバシーポリシーの法務確認を行う。
