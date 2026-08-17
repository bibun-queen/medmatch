-- 1) First create the admin user in Supabase Authentication > Users.
-- 2) Replace the email below and run this in SQL Editor.
-- Admin cannot be self-assigned from the client.

update public.profiles
set role = 'admin', status = 'active', display_name = '運営管理者'
where id = (select id from auth.users where email = 'admin@example.com');

-- Remove the student detail row that was created by the generic auth trigger.
delete from public.student_profiles
where user_id = (select id from auth.users where email = 'admin@example.com');
