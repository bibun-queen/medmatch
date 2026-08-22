-- 既存MedMatchテーブルを完全に作り直す場合のみ実行してください。
-- public 内の下記MedMatchテーブルのデータは全削除され、元に戻せません。
-- Authユーザー(auth.users)は削除しません。

begin;
drop table if exists public.audit_logs cascade;
drop table if exists public.scouts cascade;
drop table if exists public.applications cascade;
drop table if exists public.jobs cascade;
drop table if exists public.hospital_members cascade;
drop table if exists public.hospitals cascade;
drop table if exists public.student_profiles cascade;
drop table if exists public.profiles cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.is_hospital_member(uuid) cascade;
drop function if exists public.is_verified_hospital_member() cascade;
drop function if exists public.guard_profile_update() cascade;
drop function if exists public.guard_hospital_verification() cascade;
drop function if exists public.guard_application_update() cascade;
drop function if exists public.guard_scout_update() cascade;
commit;

-- この後に migrations/001_init.sql を実行してください。
