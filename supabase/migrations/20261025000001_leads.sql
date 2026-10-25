-- Step 3: leads, patients (minimal, extended later), and the lead activity timeline.

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  full_name text not null check (length(trim(full_name)) > 0),
  phone text not null,                         -- stored as +92XXXXXXXXXX
  source text not null default 'other'
    check (source in ('facebook', 'instagram', 'whatsapp', 'walk_in', 'referral', 'website', 'other')),
  service text not null default 'other'
    check (service in ('prp_face', 'prp_hair', 'vampire_facial', 'hair_transplant', 'other')),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'booked', 'converted', 'lost')),
  next_followup_at timestamptz,
  assigned_to uuid references public.profiles (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  full_name text not null check (length(trim(full_name)) > 0),
  phone text not null,
  lead_id uuid unique references public.leads (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  type text not null check (type in ('created', 'status_change', 'note', 'followup', 'assigned', 'edited')),
  body text,
  meta jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index leads_clinic_created_idx on public.leads (clinic_id, created_at desc);
create index leads_clinic_status_idx on public.leads (clinic_id, status);
create index leads_clinic_phone_idx on public.leads (clinic_id, phone);
create index leads_followup_idx on public.leads (clinic_id, next_followup_at) where next_followup_at is not null;
create index leads_assigned_to_idx on public.leads (assigned_to);
create index patients_clinic_phone_idx on public.patients (clinic_id, phone);
create index lead_activities_lead_idx on public.lead_activities (lead_id, created_at desc);

-- Row Level Security: everyone in a clinic works with that clinic's data only.
alter table public.leads enable row level security;
alter table public.patients enable row level security;
alter table public.lead_activities enable row level security;

create policy "leads: read own clinic" on public.leads for select to authenticated
  using (clinic_id = public.current_clinic_id());

create policy "leads: add to own clinic" on public.leads for insert to authenticated
  with check (
    clinic_id = public.current_clinic_id()
    and (assigned_to is null or exists (
      select 1 from public.profiles p
      where p.id = assigned_to and p.clinic_id = public.current_clinic_id()))
  );

create policy "leads: update own clinic" on public.leads for update to authenticated
  using (clinic_id = public.current_clinic_id())
  with check (
    clinic_id = public.current_clinic_id()
    and (assigned_to is null or exists (
      select 1 from public.profiles p
      where p.id = assigned_to and p.clinic_id = public.current_clinic_id()))
  );

create policy "patients: read own clinic" on public.patients for select to authenticated
  using (clinic_id = public.current_clinic_id());

create policy "patients: add to own clinic" on public.patients for insert to authenticated
  with check (
    clinic_id = public.current_clinic_id()
    and (lead_id is null or exists (
      select 1 from public.leads l
      where l.id = lead_id and l.clinic_id = public.current_clinic_id()))
  );

create policy "activities: read own clinic" on public.lead_activities for select to authenticated
  using (clinic_id = public.current_clinic_id());

create policy "activities: add to own clinic" on public.lead_activities for insert to authenticated
  with check (
    clinic_id = public.current_clinic_id()
    and exists (
      select 1 from public.leads l
      where l.id = lead_id and l.clinic_id = public.current_clinic_id())
  );
-- No update/delete policies: the timeline is a permanent record.

-- Keep updated_at fresh.
create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_set_updated_at before update on public.leads
  for each row execute function public.set_updated_at();

-- Write timeline entries automatically, whichever screen changed the lead.
create function public.log_lead_changes() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.lead_activities (clinic_id, lead_id, type, created_by)
    values (new.clinic_id, new.id, 'created', auth.uid());
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.lead_activities (clinic_id, lead_id, type, meta, created_by)
    values (new.clinic_id, new.id, 'status_change',
      jsonb_build_object('from', old.status, 'to', new.status), auth.uid());
  end if;

  if new.assigned_to is distinct from old.assigned_to then
    insert into public.lead_activities (clinic_id, lead_id, type, meta, created_by)
    values (new.clinic_id, new.id, 'assigned',
      jsonb_build_object('from', old.assigned_to, 'to', new.assigned_to), auth.uid());
  end if;

  if new.next_followup_at is distinct from old.next_followup_at then
    insert into public.lead_activities (clinic_id, lead_id, type, meta, created_by)
    values (new.clinic_id, new.id, 'followup',
      jsonb_build_object('from', old.next_followup_at, 'to', new.next_followup_at), auth.uid());
  end if;

  if new.full_name is distinct from old.full_name
     or new.phone is distinct from old.phone
     or new.source is distinct from old.source
     or new.service is distinct from old.service then
    insert into public.lead_activities (clinic_id, lead_id, type, created_by)
    values (new.clinic_id, new.id, 'edited', auth.uid());
  end if;

  return new;
end;
$$;

create trigger leads_log_changes after insert or update on public.leads
  for each row execute function public.log_lead_changes();

-- Convert a lead into a patient in one safe step (all or nothing).
-- SECURITY INVOKER: RLS still applies, so only your own clinic's leads work.
create function public.convert_lead_to_patient(p_lead_id uuid) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  v_lead public.leads;
  v_patient_id uuid;
begin
  select * into v_lead from public.leads where id = p_lead_id for update;
  if not found then
    raise exception 'Lead not found';
  end if;
  if v_lead.status = 'converted' then
    raise exception 'Lead is already converted';
  end if;

  insert into public.patients (clinic_id, full_name, phone, lead_id, created_by)
  values (v_lead.clinic_id, v_lead.full_name, v_lead.phone, v_lead.id, auth.uid())
  returning id into v_patient_id;

  update public.leads
  set status = 'converted', next_followup_at = null
  where id = p_lead_id;

  return v_patient_id;
end;
$$;

revoke all on function public.convert_lead_to_patient(uuid) from public, anon;
grant execute on function public.convert_lead_to_patient(uuid) to authenticated;
