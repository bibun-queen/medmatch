# RLS / 権限テスト

公開前に最低限、別ブラウザ・別アカウントで次を確認する。

## 医学生A
- 医学生Bの `student_profiles` を直接取得できない
- 医学生B宛のscoutを取得できない
- 医学生Bのapplicationを取得できない
- application作成時に `status=offered` を指定できない
- verification document作成時に `status=approved` を指定できない

## 病院A
- 審査前に `search_students` が失敗する
- 審査後に検索可能になる
- 病院Bのscout/applicationを取得できない
- 自院の `status=verified` を直接更新できない
- scout作成時に `status=interested` を指定できない

## 運営
- 全病院・全学生の管理対象データを取得できる
- 病院を承認 / 却下できる
- 学生を停止 / 有効化できる
- 確認書類を承認 / 却下できる
- audit_logsを閲覧できる

## 退会
- 学生本人だけが `delete-account` を利用できる
- 病院アカウントは自己削除できない
- Secret keyがブラウザのNetwork / Sourceに存在しない
