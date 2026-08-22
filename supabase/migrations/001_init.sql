-- MedMatch fresh schema
-- 新しいSupabaseプロジェクト、または空の public schema で実行してください。

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student','hospital','admin')),
  display_name text,
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.student_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  university text,
  graduation_year integer,
  desired_specialties text[] not null default '{}',
  desired_prefectures text[] not null default '{}',
  bio text,
  is_searchable boolean not null default false,
  status text not null default 'active' check (status in ('active','suspended')),
  updated_at timestamptz not null default now()
);

create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  prefecture text not null,
  city text,
  website text,
  description text,
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected')),
  created_by uuid not null references public.profiles(id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hospital_members (
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null default 'member' check (member_role in ('owner','member')),
  created_at timestamptz not null default now(),
  primary key (hospital_id,user_id)
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  title text not null,
  job_type text not null check (job_type in ('病院見学','初期研修','イベント・説明会','その他')),
  specialties text[] not null default '{}',
  prefecture text not null,
  city text,
  start_date date,
  application_deadline date,
  summary text not null,
  details text,
  requirements text,
  status text not null default 'draft' check (status in ('draft','published','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  motivation text,
  status text not null default 'submitted' check (status in ('submitted','accepted','rejected','withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(job_id,student_id)
);

create table if not exists public.scouts (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  message text not null,
  status text not null default 'sent' check (status in ('sent','interested','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare r text;
begin
  r := coalesce(new.raw_user_meta_data->>'role','student');
  if r not in ('student','hospital') then r := 'student'; end if;
  insert into public.profiles(id,role,display_name)
  values(new.id,r,coalesce(new.raw_user_meta_data->>'display_name',split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin' and p.status='active');
$$;
create or replace function public.is_hospital_member(hid uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.hospital_members hm where hm.hospital_id=hid and hm.user_id=auth.uid());
$$;
create or replace function public.is_verified_hospital_member()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.hospital_members hm join public.hospitals h on h.id=hm.hospital_id where hm.user_id=auth.uid() and h.verification_status='verified');
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_hospital_member(uuid) to authenticated;
grant execute on function public.is_verified_hospital_member() to authenticated;

alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.hospitals enable row level security;
alter table public.hospital_members enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.scouts enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_self_select on public.profiles for select using (id=auth.uid() or public.is_admin());
create policy profiles_self_update on public.profiles for update using (id=auth.uid() or public.is_admin()) with check (id=auth.uid() or public.is_admin());

create policy student_profiles_owner_all on public.student_profiles for all using (user_id=auth.uid() or public.is_admin()) with check (user_id=auth.uid() or public.is_admin());
create policy student_profiles_verified_hospital_select on public.student_profiles for select using (is_searchable=true and status='active' and public.is_verified_hospital_member());
create policy student_profiles_hospital_applicant_select on public.student_profiles for select using (exists(select 1 from public.applications a join public.jobs j on j.id=a.job_id where a.student_id=user_id and public.is_hospital_member(j.hospital_id)));
create policy student_profiles_hospital_scout_select on public.student_profiles for select using (exists(select 1 from public.scouts s where s.student_id=user_id and public.is_hospital_member(s.hospital_id)));

create policy hospitals_public_verified_select on public.hospitals for select using (verification_status='verified' or created_by=auth.uid() or public.is_hospital_member(id) or public.is_admin());
create policy hospitals_auth_insert on public.hospitals for insert to authenticated with check (created_by=auth.uid() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='hospital' and p.status='active'));
create policy hospitals_member_update on public.hospitals for update using (public.is_hospital_member(id) or public.is_admin()) with check (public.is_hospital_member(id) or public.is_admin());

create policy hospital_members_own_select on public.hospital_members for select using (user_id=auth.uid() or public.is_admin());
create policy hospital_members_creator_insert on public.hospital_members for insert to authenticated with check (user_id=auth.uid() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='hospital' and p.status='active') and exists(select 1 from public.hospitals h where h.id=hospital_id and h.created_by=auth.uid()));
create policy hospital_members_admin_all on public.hospital_members for all using (public.is_admin()) with check (public.is_admin());

create policy jobs_public_select on public.jobs for select using ((status='published' and exists(select 1 from public.hospitals h where h.id=hospital_id and h.verification_status='verified')) or public.is_hospital_member(hospital_id) or public.is_admin());
create policy jobs_member_insert on public.jobs for insert to authenticated with check (public.is_hospital_member(hospital_id) or public.is_admin());
create policy jobs_member_update on public.jobs for update using (public.is_hospital_member(hospital_id) or public.is_admin()) with check (public.is_hospital_member(hospital_id) or public.is_admin());
create policy jobs_member_delete on public.jobs for delete using (public.is_hospital_member(hospital_id) or public.is_admin());

create policy applications_student_select on public.applications for select using (student_id=auth.uid() or exists(select 1 from public.jobs j where j.id=job_id and public.is_hospital_member(j.hospital_id)) or public.is_admin());
create policy applications_student_insert on public.applications for insert to authenticated with check (student_id=auth.uid() and status='submitted');
create policy applications_student_update on public.applications for update using (student_id=auth.uid() or exists(select 1 from public.jobs j where j.id=job_id and public.is_hospital_member(j.hospital_id)) or public.is_admin());

create policy scouts_participants_select on public.scouts for select using (student_id=auth.uid() or public.is_hospital_member(hospital_id) or public.is_admin());
create policy scouts_hospital_insert on public.scouts for insert to authenticated with check (public.is_hospital_member(hospital_id) and status='sent');
create policy scouts_participants_update on public.scouts for update using (student_id=auth.uid() or public.is_hospital_member(hospital_id) or public.is_admin());

create policy audit_admin_select on public.audit_logs for select using (public.is_admin());
create policy audit_admin_insert on public.audit_logs for insert with check (public.is_admin());



-- 権限昇格・病院自己承認・不正な状態遷移をDB側で防止する。
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() and (new.role is distinct from old.role or new.status is distinct from old.status) then
    raise exception 'role/status can only be changed by admin';
  end if;
  return new;
end;$$;
drop trigger if exists trg_guard_profile_update on public.profiles;
create trigger trg_guard_profile_update before update on public.profiles for each row execute procedure public.guard_profile_update();

create or replace function public.guard_hospital_verification()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.verification_status is distinct from old.verification_status and not public.is_admin() then
    raise exception 'verification_status can only be changed by admin';
  end if;
  if new.verified_at is distinct from old.verified_at and not public.is_admin() then
    raise exception 'verified_at can only be changed by admin';
  end if;
  return new;
end;$$;
drop trigger if exists trg_guard_hospital_verification on public.hospitals;
create trigger trg_guard_hospital_verification before update on public.hospitals for each row execute procedure public.guard_hospital_verification();

create or replace function public.guard_application_update()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if public.is_admin() then return new; end if;
  if auth.uid() = old.student_id then
    if new.status not in (old.status, 'withdrawn') then
      raise exception 'student cannot set application status to %', new.status;
    end if;
    if new.student_id is distinct from old.student_id or new.job_id is distinct from old.job_id then
      raise exception 'application ownership cannot be changed';
    end if;
    return new;
  end if;
  if exists(select 1 from public.jobs j where j.id=old.job_id and public.is_hospital_member(j.hospital_id)) then
    if new.status not in (old.status, 'accepted', 'rejected') then
      raise exception 'hospital cannot set application status to %', new.status;
    end if;
    if new.student_id is distinct from old.student_id or new.job_id is distinct from old.job_id then
      raise exception 'application ownership cannot be changed';
    end if;
    return new;
  end if;
  raise exception 'not allowed';
end;$$;
drop trigger if exists trg_guard_application_update on public.applications;
create trigger trg_guard_application_update before update on public.applications for each row execute procedure public.guard_application_update();

create or replace function public.guard_scout_update()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if public.is_admin() then return new; end if;
  if auth.uid() = old.student_id then
    if new.status not in (old.status, 'interested', 'declined') then
      raise exception 'student cannot set scout status to %', new.status;
    end if;
  elsif public.is_hospital_member(old.hospital_id) then
    if new.status is distinct from old.status then
      raise exception 'hospital cannot change student response status';
    end if;
  else
    raise exception 'not allowed';
  end if;
  if new.student_id is distinct from old.student_id or new.hospital_id is distinct from old.hospital_id then
    raise exception 'scout participants cannot be changed';
  end if;
  return new;
end;$$;
drop trigger if exists trg_guard_scout_update on public.scouts;
create trigger trg_guard_scout_update before update on public.scouts for each row execute procedure public.guard_scout_update();

-- 病院から学生名を表示するため、確認済み病院に searchable 学生の profiles 行のみ見せる。
create policy profiles_verified_hospital_student_select on public.profiles for select using (
  public.is_verified_hospital_member() and role='student' and status='active' and exists(select 1 from public.student_profiles sp where sp.user_id=id and sp.is_searchable=true and sp.status='active')
);
create policy profiles_hospital_applicant_select on public.profiles for select using (exists(select 1 from public.applications a join public.jobs j on j.id=a.job_id where a.student_id=id and public.is_hospital_member(j.hospital_id)));
create policy profiles_hospital_scout_select on public.profiles for select using (exists(select 1 from public.scouts s where s.student_id=id and public.is_hospital_member(s.hospital_id)));
