-- Step 2: clinics, staff profiles, and Row Level Security.
-- Every clinic's data is isolated: users only see rows for their own clinic.

create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  city text not null check (length(trim(city)) > 0),
  phone text not null,                       -- stored as +92XXXXXXXXXX
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  full_name text not null check (length(trim(full_name)) > 0),
  email text not null,
  role text not null check (role in ('owner', 'admin', 'doctor', 'receptionist')),
  created_at timestamptz not null default now()
);

create index profiles_clinic_id_idx on public.profiles (clinic_id);

-- Only one owner per clinic (for now).
create unique index profiles_one_owner_per_clinic
  on public.profiles (clinic_id) where role = 'owner';

-- Helpers used by RLS policies. SECURITY DEFINER lets them read profiles
-- without triggering the profiles policy again (avoids infinite recursion).
create function public.current_clinic_id()
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select clinic_id from public.profiles where id = auth.uid()
$$;

create function public.current_user_role()
returns text
language sql stable security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid()
$$;

revoke all on function public.current_clinic_id() from public, anon;
revoke all on function public.current_user_role() from public, anon;
grant execute on function public.current_clinic_id() to authenticated;
grant execute on function public.current_user_role() to authenticated;

-- Row Level Security
alter table public.clinics enable row level security;
alter table public.profiles enable row level security;

create policy "clinic: members can read their clinic"
  on public.clinics for select to authenticated
  using (id = public.current_clinic_id());

create policy "clinic: owner can update their clinic"
  on public.clinics for update to authenticated
  using (id = public.current_clinic_id() and public.current_user_role() = 'owner')
  with check (id = public.current_clinic_id());

create policy "profiles: members can read their clinic's staff"
  on public.profiles for select to authenticated
  using (clinic_id = public.current_clinic_id());

-- No insert/delete policies for clients: profiles are created only by
-- create_clinic_with_owner() (first signup) or by the server (adding staff).

-- First-time onboarding: creates the clinic and the owner profile in one step.
create function public.create_clinic_with_owner(
  p_full_name text,
  p_clinic_name text,
  p_city text,
  p_phone text
)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_clinic_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not signed in';
  end if;

  if exists (select 1 from public.profiles where id = v_user_id) then
    raise exception 'Clinic already set up for this user';
  end if;

  select email into v_email from auth.users where id = v_user_id;

  insert into public.clinics (name, city, phone)
  values (trim(p_clinic_name), trim(p_city), trim(p_phone))
  returning id into v_clinic_id;

  insert into public.profiles (id, clinic_id, full_name, email, role)
  values (v_user_id, v_clinic_id, trim(p_full_name), v_email, 'owner');

  return v_clinic_id;
end;
$$;

revoke all on function public.create_clinic_with_owner(text, text, text, text) from public, anon;
grant execute on function public.create_clinic_with_owner(text, text, text, text) to authenticated;
