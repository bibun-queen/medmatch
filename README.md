# Supabase再接続修正

GitHubリポジトリ直下の `config.js` だけを、このフォルダの `config.js` で上書きしてください。

変更しないもの:
- index.html
- styles.css
- src/main.js
- ui-enhancements.js
- Supabase SQL / migrations

今回の原因は `config.js` が `YOUR_PROJECT` / `REPLACE_ME` のテンプレート値に戻っていたことです。
