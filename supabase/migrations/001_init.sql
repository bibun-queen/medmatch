-- MedMatch production MVP schema
-- Run in a new Supabase project with the SQL editor or Supabase CLI.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create type public.app_role as enum ('student', 'hospital', 'admin');
create type public.account_status as enum ('pending', 'active', 'suspended');
create type public.hospital_status as enum ('pending', 'verified', 'rejected', 'suspended');
create type public.job_kind as enum ('residency', 'visit', 'briefing');
create type public.job_status as enum ('draft', 'published', 'closed');
create type public.scout_status as enum ('unread', 'read', 'interested', 'declined');
create type public.application_kind as enum ('visit', 'application');
create type public.application_status as enum ('applied', 'accepted', 'rejected', 'withdrawn', 'visited', 'interview', 'offered', 'closed');
create type public.report_status as enum ('open', 'investigating', 'resolved', 'dismissed');
create type public.document_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  display_name text not null default '',
  status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  public_code text not null unique default ('S-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  university text not null default '',
  school_year smallint check (school_year between 1 and 6),
  graduation_year smallint check (graduation_year between 2020 and 2100),
  specialty_preferences text[] not null default '{}',
  preferred_areas text[] not null default '{}',
  bio text not null default '',
  scout_enabled boolean not null default true,
  university_visible boolean not null default true,
  name_visible boolean not null default false,
  verified boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  prefecture text not null default '',
  city text not null default '',
  address text not null default '',
  hospital_type text not null default '',
  website text not null default '',
  description text not null default '',
  salary_text text not null default '',
  oncall_text text not null default '',
  emergency_text text not null default '',
  status public.hospital_status not null default 'pending',
  verified_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hospital_members (
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null default 'recruiter' check (member_role in ('owner', 'recruiter', 'viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (hospital_id, user_id)
);

create table public.job_postings (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  title text not null,
  kind public.job_kind not null default 'residency',
  graduation_year smallint check (graduation_year between 2020 and 2100),
  description text not null default '',
  status public.job_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scouts (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  sender_user_id uuid references public.profiles(id) on delete set null,
  message text not null check (char_length(message) between 1 and 5000),
  status public.scout_status not null default 'unread',
  read_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.job_postings(id) on delete set null,
  kind public.application_kind not null default 'visit',
  message text not null default '' check (char_length(message) <= 5000),
  preferred_date date,
  status public.application_status not null default 'applied',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.favorites (
  student_id uuid not null references public.profiles(id) on delete cascade,
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, hospital_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid references public.profiles(id) on delete set null,
  target_hospital_id uuid references public.hospitals(id) on delete set null,
  category text not null default 'other',
  body text not null check (char_length(body) between 1 and 5000),
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.verification_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('student_id', 'university_email', 'hospital_employment', 'other')),
  storage_path text not null unique,
  status public.document_status not null default 'pending',
  review_note text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_profiles_role_status on public.profiles(role, status);
create index idx_student_profiles_graduation on public.student_profiles(graduation_year);
create index idx_hospitals_status on public.hospitals(status);
create index idx_hospital_members_user on public.hospital_members(user_id) where active = true;
create index idx_job_postings_hospital_status on public.job_postings(hospital_id, status);
create index idx_scouts_student_created on public.scouts(student_id, created_at desc);
create index idx_scouts_hospital_created on public.scouts(hospital_id, created_at desc);
create index idx_applications_student_created on public.applications(student_id, created_at desc);
create index idx_applications_hospital_created on public.applications(hospital_id, created_at desc);
create index idx_reports_status_created on public.reports(status, created_at desc);
create index idx_verification_docs_status_created on public.verification_documents(status, created_at desc);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and status = 'active'
  );
$$;

create or replace function private.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and status = 'active'
  );
$$;

create or replace function private.is_hospital_member(target_hospital uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.hospital_members hm
    join public.profiles p on p.id = hm.user_id
    where hm.hospital_id = target_hospital
      and hm.user_id = (select auth.uid())
      and hm.active = true
      and p.role = 'hospital'
      and p.status in ('pending', 'active')
  );
$$;

create or replace function private.can_recruit(target_hospital uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.hospital_members hm
    join public.hospitals h on h.id = hm.hospital_id
    join public.profiles p on p.id = hm.user_id
    where hm.hospital_id = target_hospital
      and hm.user_id = (select auth.uid())
      and hm.active = true
      and h.status = 'verified'
      and p.role = 'hospital'
      and p.status = 'active'
  );
$$;

grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_active_user() to authenticated;
grant execute on function private.is_hospital_member(uuid) to authenticated;
grant execute on function private.can_recruit(uuid) to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger student_profiles_updated_at before update on public.student_profiles
for each row execute function public.set_updated_at();
create trigger hospitals_updated_at before update on public.hospitals
for each row execute function public.set_updated_at();
create trigger job_postings_updated_at before update on public.job_postings
for each row execute function public.set_updated_at();
create trigger applications_updated_at before update on public.applications
for each row execute function public.set_updated_at();
create trigger reports_updated_at before update on public.reports
for each row execute function public.set_updated_at();

-- New users may request student or hospital at signup. Admin is never accepted from user metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  requested text := coalesce(new.raw_user_meta_data->>'requested_role', 'student');
  assigned public.app_role;
  profile_status public.account_status;
  new_hospital_id uuid;
begin
  assigned := case when requested = 'hospital' then 'hospital'::public.app_role else 'student'::public.app_role end;
  profile_status := case when assigned = 'hospital' then 'pending'::public.account_status else 'active'::public.account_status end;

  insert into public.profiles(id, role, display_name, status)
  values (
    new.id,
    assigned,
    left(coalesce(new.raw_user_meta_data->>'display_name', ''), 120),
    profile_status
  );

  if assigned = 'student' then
    insert into public.student_profiles(user_id, university)
    values (new.id, left(coalesce(new.raw_user_meta_data->>'university', ''), 200));
  else
    insert into public.hospitals(name, created_by)
    values (left(coalesce(nullif(new.raw_user_meta_data->>'hospital_name', ''), '病院名未設定'), 200), new.id)
    returning id into new_hospital_id;

    insert into public.hospital_members(hospital_id, user_id, member_role)
    values (new_hospital_id, new.id, 'owner');
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Minimal audit trail. User content is not copied into the audit log.
create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  record_id text;
begin
  record_id := coalesce((case when tg_op = 'DELETE' then old.id else new.id end)::text, '');
  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, detail)
  values ((select auth.uid()), lower(tg_op), tg_table_name, record_id, jsonb_build_object('operation', tg_op));
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger audit_hospitals after insert or update or delete on public.hospitals for each row execute function public.audit_row_change();
create trigger audit_jobs after insert or update or delete on public.job_postings for each row execute function public.audit_row_change();
create trigger audit_scouts after insert or update or delete on public.scouts for each row execute function public.audit_row_change();
create trigger audit_applications after insert or update or delete on public.applications for each row execute function public.audit_row_change();
create trigger audit_reports after insert or update or delete on public.reports for each row execute function public.audit_row_change();
create trigger audit_documents after insert or update or delete on public.verification_documents for each row execute function public.audit_row_change();

-- Hospital search function returns only fields that students have opted to expose.
create or replace function public.search_students(
  p_hospital_id uuid,
  p_graduation_year smallint default null,
  p_area text default null,
  p_specialty text default null,
  p_university text default null
)
returns table (
  user_id uuid,
  public_code text,
  display_name text,
  university text,
  school_year smallint,
  graduation_year smallint,
  specialty_preferences text[],
  preferred_areas text[],
  bio text,
  verified boolean
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not private.can_recruit(p_hospital_id) and not private.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    sp.user_id,
    sp.public_code,
    case when sp.name_visible then p.display_name else sp.public_code end,
    case when sp.university_visible then sp.university else '非公開' end,
    sp.school_year,
    sp.graduation_year,
    sp.specialty_preferences,
    sp.preferred_areas,
    sp.bio,
    sp.verified
  from public.student_profiles sp
  join public.profiles p on p.id = sp.user_id
  where p.role = 'student'
    and p.status = 'active'
    and sp.scout_enabled = true
    and (p_graduation_year is null or sp.graduation_year = p_graduation_year)
    and (p_area is null or p_area = '' or p_area = any(sp.preferred_areas))
    and (p_specialty is null or p_specialty = '' or p_specialty = any(sp.specialty_preferences))
    and (p_university is null or p_university = '' or sp.university = p_university)
  order by sp.verified desc, sp.graduation_year nulls last, sp.public_code;
end;
$$;

grant execute on function public.search_students(uuid, smallint, text, text, text) to authenticated;

create or replace function public.respond_to_scout(p_scout_id uuid, p_status public.scout_status)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_status not in ('read', 'interested', 'declined') then
    raise exception 'invalid scout status';
  end if;
  if not private.is_active_user() then raise exception 'account inactive'; end if;

  update public.scouts
  set status = p_status,
      read_at = case when read_at is null then now() else read_at end,
      responded_at = case when p_status in ('interested', 'declined') then now() else responded_at end
  where id = p_scout_id
    and student_id = (select auth.uid());

  if not found then raise exception 'not authorized'; end if;
end;
$$;

grant execute on function public.respond_to_scout(uuid, public.scout_status) to authenticated;

create or replace function public.withdraw_application(p_application_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.applications
  set status = 'withdrawn'
  where id = p_application_id
    and student_id = (select auth.uid())
    and status in ('applied', 'accepted', 'interview');
  if not found then raise exception 'cannot withdraw'; end if;
end;
$$;

grant execute on function public.withdraw_application(uuid) to authenticated;

create or replace function public.hospital_update_application_status(
  p_application_id uuid,
  p_status public.application_status
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_hospital uuid;
begin
  select hospital_id into target_hospital from public.applications where id = p_application_id;
  if target_hospital is null or not private.can_recruit(target_hospital) then
    raise exception 'not authorized';
  end if;
  if p_status not in ('accepted', 'rejected', 'visited', 'interview', 'offered', 'closed') then
    raise exception 'invalid status';
  end if;
  update public.applications set status = p_status where id = p_application_id;
end;
$$;

grant execute on function public.hospital_update_application_status(uuid, public.application_status) to authenticated;

create or replace function public.admin_verify_hospital(p_hospital_id uuid, p_approved boolean)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not private.is_admin() then raise exception 'not authorized'; end if;

  update public.hospitals
  set status = case when p_approved then 'verified' else 'rejected' end,
      verified_at = case when p_approved then now() else null end
  where id = p_hospital_id;

  update public.profiles p
  set status = case when p_approved then 'active' else 'suspended' end
  where p.id in (select hm.user_id from public.hospital_members hm where hm.hospital_id = p_hospital_id);
end;
$$;

grant execute on function public.admin_verify_hospital(uuid, boolean) to authenticated;

create or replace function public.admin_set_profile_status(p_user_id uuid, p_status public.account_status)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not private.is_admin() then raise exception 'not authorized'; end if;
  update public.profiles set status = p_status where id = p_user_id;
end;
$$;

grant execute on function public.admin_set_profile_status(uuid, public.account_status) to authenticated;

create or replace function public.admin_review_document(p_document_id uuid, p_approved boolean, p_note text default '')
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  doc_user uuid;
  doc_kind text;
begin
  if not private.is_admin() then raise exception 'not authorized'; end if;

  update public.verification_documents
  set status = case when p_approved then 'approved' else 'rejected' end,
      review_note = left(coalesce(p_note, ''), 1000),
      reviewed_at = now()
  where id = p_document_id
  returning user_id, kind into doc_user, doc_kind;

  if p_approved and doc_kind in ('student_id', 'university_email') then
    update public.student_profiles set verified = true where user_id = doc_user;
  end if;
end;
$$;

grant execute on function public.admin_review_document(uuid, boolean, text) to authenticated;

create or replace function public.admin_set_report_status(p_report_id uuid, p_status public.report_status)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not private.is_admin() then raise exception 'not authorized'; end if;
  update public.reports set status = p_status where id = p_report_id;
end;
$$;

grant execute on function public.admin_set_report_status(uuid, public.report_status) to authenticated;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.hospitals enable row level security;
alter table public.hospital_members enable row level security;
alter table public.job_postings enable row level security;
alter table public.scouts enable row level security;
alter table public.applications enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;
alter table public.verification_documents enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_self_or_admin_select on public.profiles for select to authenticated
using ((select auth.uid()) = id or (select private.is_admin()));
create policy profiles_self_update on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy student_profiles_self_or_admin_select on public.student_profiles for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_admin()));
create policy student_profiles_self_update on public.student_profiles for update to authenticated
using ((select auth.uid()) = user_id and (select private.is_active_user()))
with check ((select auth.uid()) = user_id and (select private.is_active_user()));

create policy hospitals_visible_select on public.hospitals for select to authenticated
using (status = 'verified' or (select private.is_hospital_member(id)) or (select private.is_admin()));
create policy hospitals_member_update on public.hospitals for update to authenticated
using ((select private.is_hospital_member(id)))
with check ((select private.is_hospital_member(id)));

create policy hospital_members_self_or_admin_select on public.hospital_members for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_admin()));

create policy jobs_published_or_owner_select on public.job_postings for select to authenticated
using (
  (status = 'published' and exists (select 1 from public.hospitals h where h.id = hospital_id and h.status = 'verified'))
  or (select private.is_hospital_member(hospital_id))
  or (select private.is_admin())
);
create policy jobs_owner_insert on public.job_postings for insert to authenticated
with check ((select private.can_recruit(hospital_id)) and created_by = (select auth.uid()));
create policy jobs_owner_update on public.job_postings for update to authenticated
using ((select private.can_recruit(hospital_id)))
with check ((select private.can_recruit(hospital_id)));
create policy jobs_owner_delete on public.job_postings for delete to authenticated
using ((select private.can_recruit(hospital_id)) or (select private.is_admin()));

create policy scouts_participants_select on public.scouts for select to authenticated
using (student_id = (select auth.uid()) or (select private.is_hospital_member(hospital_id)) or (select private.is_admin()));
create policy scouts_hospital_insert on public.scouts for insert to authenticated
with check (
  sender_user_id = (select auth.uid())
  and (select private.can_recruit(hospital_id))
  and exists (
    select 1 from public.student_profiles sp
    join public.profiles p on p.id = sp.user_id
    where sp.user_id = student_id and sp.scout_enabled = true and p.status = 'active'
  )
);

create policy applications_participants_select on public.applications for select to authenticated
using (student_id = (select auth.uid()) or (select private.is_hospital_member(hospital_id)) or (select private.is_admin()));
create policy applications_student_insert on public.applications for insert to authenticated
with check (
  student_id = (select auth.uid())
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'student' and p.status = 'active')
  and exists (select 1 from public.hospitals h where h.id = hospital_id and h.status = 'verified')
  and (
    job_id is null
    or exists (select 1 from public.job_postings j where j.id = job_id and j.hospital_id = hospital_id and j.status = 'published')
  )
);

create policy favorites_self_select on public.favorites for select to authenticated
using (student_id = (select auth.uid()));
create policy favorites_self_insert on public.favorites for insert to authenticated
with check (
  student_id = (select auth.uid())
  and (select private.is_active_user())
  and exists (select 1 from public.hospitals h where h.id = hospital_id and h.status = 'verified')
);
create policy favorites_self_delete on public.favorites for delete to authenticated
using (student_id = (select auth.uid()) and (select private.is_active_user()));

create policy reports_own_or_admin_select on public.reports for select to authenticated
using (reporter_user_id = (select auth.uid()) or (select private.is_admin()));
create policy reports_authenticated_insert on public.reports for insert to authenticated
with check (reporter_user_id = (select auth.uid()));

create policy verification_own_or_admin_select on public.verification_documents for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy verification_own_insert on public.verification_documents for insert to authenticated
with check (user_id = (select auth.uid()));

create policy audit_admin_select on public.audit_logs for select to authenticated
using ((select private.is_admin()));

-- Explicit table privileges. RLS still applies in addition to these grants.
revoke all on public.profiles, public.student_profiles, public.hospitals, public.hospital_members,
  public.job_postings, public.scouts, public.applications, public.favorites, public.reports,
  public.verification_documents, public.audit_logs from anon, authenticated;

grant select on public.profiles to authenticated;
grant update(display_name) on public.profiles to authenticated;

grant select on public.student_profiles to authenticated;
grant update(university, school_year, graduation_year, specialty_preferences, preferred_areas, bio, scout_enabled, university_visible, name_visible) on public.student_profiles to authenticated;

grant select on public.hospitals to authenticated;
grant update(name, prefecture, city, address, hospital_type, website, description, salary_text, oncall_text, emergency_text) on public.hospitals to authenticated;

grant select on public.hospital_members to authenticated;

grant select on public.job_postings to authenticated;
grant insert(hospital_id, title, kind, graduation_year, description, status, published_at, created_by) on public.job_postings to authenticated;
grant update(title, kind, graduation_year, description, status, published_at) on public.job_postings to authenticated;
grant delete on public.job_postings to authenticated;

grant select on public.scouts to authenticated;
grant insert(hospital_id, student_id, sender_user_id, message) on public.scouts to authenticated;

grant select on public.applications to authenticated;
grant insert(hospital_id, student_id, job_id, kind, message, preferred_date) on public.applications to authenticated;

grant select, delete on public.favorites to authenticated;
grant insert(student_id, hospital_id) on public.favorites to authenticated;

grant select on public.reports to authenticated;
grant insert(reporter_user_id, target_user_id, target_hospital_id, category, body) on public.reports to authenticated;

grant select on public.verification_documents to authenticated;
grant insert(user_id, kind, storage_path) on public.verification_documents to authenticated;

grant select on public.audit_logs to authenticated;

-- Private verification-document bucket.
insert into storage.buckets(id, name, public)
values ('verification-documents', 'verification-documents', false)
on conflict (id) do update set public = false;

create policy verification_storage_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'verification-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy verification_storage_select on storage.objects for select to authenticated
using (
  bucket_id = 'verification-documents'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin()))
);

create policy verification_storage_delete on storage.objects for delete to authenticated
using (
  bucket_id = 'verification-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Students already connected to a hospital remain identifiable to that hospital even if they later disable new scouts.
create or replace function public.hospital_known_students(p_hospital_id uuid)
returns table (
  user_id uuid,
  public_code text,
  display_name text,
  university text,
  graduation_year smallint,
  specialty_preferences text[],
  preferred_areas text[],
  verified boolean
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not private.can_recruit(p_hospital_id) and not private.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select distinct
    sp.user_id,
    sp.public_code,
    case
      when exists (select 1 from public.applications a where a.hospital_id = p_hospital_id and a.student_id = sp.user_id) then p.display_name
      when sp.name_visible then p.display_name
      else sp.public_code
    end,
    case
      when exists (select 1 from public.applications a where a.hospital_id = p_hospital_id and a.student_id = sp.user_id) then sp.university
      when sp.university_visible then sp.university
      else '非公開'
    end,
    sp.graduation_year,
    sp.specialty_preferences,
    sp.preferred_areas,
    sp.verified
  from public.student_profiles sp
  join public.profiles p on p.id = sp.user_id
  where p.status = 'active'
    and (
      exists (select 1 from public.scouts s where s.hospital_id = p_hospital_id and s.student_id = sp.user_id)
      or exists (select 1 from public.applications a where a.hospital_id = p_hospital_id and a.student_id = sp.user_id)
    );
end;
$$;

grant execute on function public.hospital_known_students(uuid) to authenticated;
