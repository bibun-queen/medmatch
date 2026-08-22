-- 1) 先に通常の医学生アカウントとして管理者用メールアドレスを登録してください。
-- 2) Supabase Dashboard > Authentication > Users で対象ユーザーUUIDを確認。
-- 3) 下の UUID を差し替えて実行。

update public.profiles
set role = 'admin', status = 'active'
where id = 'REPLACE_WITH_ADMIN_USER_UUID';
