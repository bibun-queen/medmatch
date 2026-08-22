# MedMatch — single-file GitHub Pages build

起動に必要な画面・CSS・JavaScriptは `index.html` に統合されています。
GitHub Pagesで `app.js` 等の個別ファイルが欠落しても「読み込み中」で停止しない構成です。

## 配置
リポジトリのルートにこのフォルダの中身を置き、`main` ブランチへ push してください。
Settings → Pages → Source は GitHub Actions を使用します。

## Supabase
接続先は `index.html` 内の `CONFIG` に設定済みです。DBを新規構築する場合のみ `supabase/migrations/001_init.sql` を実行してください。既存DBを使う場合はSQLの再実行は不要です。

## 重要
公開ページで最初に「MedMatch」「医学生のための病院・研修募集情報」が表示されれば、HTML自体は正しく配信されています。SupabaseやCDNに失敗した場合もトップ画面は消えず、接続エラーを表示します。
