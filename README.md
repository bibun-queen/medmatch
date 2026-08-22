# MedMatch JREC-IN型UI — 白画面修正版

この版は GitHub Pages / GitHub Actions で確実に `app.js` を公開対象へ含める修正版です。

## 原因

以前の実運用版は `scripts/build.sh` で `dist/` を作成していました。
新UIの `index.html` は `app.js` を参照しますが、既存の build script が `app.js` を `dist/` にコピーしない場合、
GitHub Pages上ではJavaScriptが404となり、JS描画部分が真っ白になります。

## 上書きするファイル

- `index.html`
- `styles.css`
- `app.js`
- `scripts/build.sh`
- `.github/workflows/deploy.yml`

## 確認

GitHub → Actions → Deploy MedMatch to GitHub Pages が成功した後、
公開URLで以下を確認してください。

- トップに求人・研修情報検索が表示される
- 医学生 / 病院 / 運営の表示切替ができる
- 公募検索が動く
- プロフィールで大学候補・学年・卒業年度を選べる

この版はまず「白画面をなくしてUIを確認する」ためのフロント版です。
Supabase本番処理を維持した完全統合版にする場合は、既存 `src/main.js` / `src/api.js` とこのUIをマージします。
