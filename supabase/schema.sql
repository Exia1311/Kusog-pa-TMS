create extension if not exists moddatetime schema extensions;
create extension if not exists pg_trgm schema extensions;

-- PROFILES -------------------------------------------------------------
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null default 'dispatcher' check (role in ('admin','dispatcher')),
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- Role is NEVER read from client metadata
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name','Unknown User'), 'dispatcher');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper functions (avoid RLS recursion)
create or replace function public.is_active_user() returns boolean
language sql security definer stable set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and is_active) $$;

-- Admin AND active AND MFA (aal2)
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and is_active and role = 'admin')
          and coalesce(auth.jwt()->>'aal','') = 'aal2' $$;

-- Block role/is_active changes by non-admins.
-- auth.uid() is null for the service role and the SQL editor (bootstrap), which are allowed.
create or replace function public.protect_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then
    if (new.role <> old.role or new.is_active <> old.is_active) and not public.is_admin() then
      raise exception 'Not allowed';
    end if;
    if auth.uid() = old.id and (new.role <> old.role or new.is_active <> old.is_active) then
      raise exception 'You cannot change your own role or active status';
    end if;
  end if;
  return new;
end $$;
create trigger protect_profile before update on profiles
  for each row execute procedure public.protect_profile();

-- PLANTERS -------------------------------------------------------------
create table planters (
  id uuid default gen_random_uuid() primary key,
  planter_code varchar(50) unique not null,
  planter_name text not null,
  hda_code varchar(50) not null default '',
  hda_name text not null,
  association text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger planters_upd before update on planters
  for each row execute procedure moddatetime(updated_at);
create index planters_name_trgm on planters using gin (planter_name extensions.gin_trgm_ops);

-- TICKETS (no status) --------------------------------------------------
create table tickets (
  id uuid default gen_random_uuid() primary key,

  -- Typed in by the user (scanner or keyboard). NO default, NO generator.
  -- Uppercase letters, digits and hyphen, 4-50 chars. ADJUST to the mill's real format.
  barcode_number varchar(50) unique not null
    check (barcode_number ~ '^[A-Z0-9-]{4,50}$'),

  form_title text default 'HACIENDA TICKET',
  form_no text default 'FM-SON-CS-01',
  effectivity_date date default '2020-09-28',
  revision_no int default 1,

  -- Planter snapshot at issue time
  is_manual_planter boolean not null default false,
  planter_code varchar(50) not null, planter_name text not null,
  hda_code varchar(50) not null default '', hda_name text not null,
  association text not null, cane_variety text,

  driver_name text, truck_plate_no varchar(20), fc_bc varchar(50), bucket_board_no varchar(50),

  -- Optional; recorded after weighing, not at release
  net_weight_tons numeric(10,2) check (net_weight_tons > 0),

  issued_by uuid not null references profiles(id) default auth.uid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Soft delete (void). Admin only. A voided barcode stays reserved and cannot be reused.
  deleted_at timestamptz,
  deleted_by uuid references profiles(id),
  deleted_reason text
);
create trigger tickets_upd before update on tickets
  for each row execute procedure moddatetime(updated_at);
create index tickets_created_idx on tickets (created_at desc) where deleted_at is null;
create index tickets_planter_code_idx on tickets (planter_code);
create index tickets_planter_name_trgm on tickets using gin (planter_name extensions.gin_trgm_ops);
create index tickets_driver_trgm on tickets using gin (driver_name extensions.gin_trgm_ops);
create index tickets_plate_trgm on tickets using gin (truck_plate_no extensions.gin_trgm_ops);

-- After issue, everything on the form is locked. Mistakes are corrected by void + reissue.
create or replace function public.enforce_ticket_rules() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.deleted_at is not null then
    raise exception 'Voided tickets are read-only';
  end if;

  if (new.barcode_number, new.issued_by, new.created_at, new.form_title, new.form_no,
      new.effectivity_date, new.revision_no, new.is_manual_planter, new.planter_code,
      new.planter_name, new.hda_code, new.hda_name, new.association, new.cane_variety,
      new.driver_name, new.truck_plate_no, new.fc_bc, new.bucket_board_no)
     is distinct from
     (old.barcode_number, old.issued_by, old.created_at, old.form_title, old.form_no,
      old.effectivity_date, old.revision_no, old.is_manual_planter, old.planter_code,
      old.planter_name, old.hda_code, old.hda_name, old.association, old.cane_variety,
      old.driver_name, old.truck_plate_no, old.fc_bc, old.bucket_board_no) then
    raise exception 'Ticket details are locked after issue. Void and reissue instead.';
  end if;

  -- Net weight: anyone active may set it once; only an admin may change an existing value
  if new.net_weight_tons is distinct from old.net_weight_tons
     and old.net_weight_tons is not null and not public.is_admin() then
    raise exception 'Only an admin can change a recorded net weight';
  end if;

  -- Void: admin only, reason required
  if new.deleted_at is not null then
    if not public.is_admin() then raise exception 'Only an admin can void a ticket'; end if;
    if coalesce(trim(new.deleted_reason),'') = '' then raise exception 'Void reason required'; end if;
    new.deleted_at := now();
    new.deleted_by := auth.uid();
  elsif new.deleted_by is not null or new.deleted_reason is not null then
    raise exception 'Invalid void fields';
  end if;
  return new;
end $$;
create trigger ticket_rules before update on tickets
  for each row execute procedure public.enforce_ticket_rules();

-- PRINT TRACKING (insert-only) -----------------------------------------
create table ticket_prints (
  id bigint generated always as identity primary key,
  ticket_id uuid not null references tickets(id),
  printed_by uuid not null references profiles(id) default auth.uid(),
  printed_at timestamptz default now()
);
create index on ticket_prints (ticket_id);

-- AUDIT ----------------------------------------------------------------
create table audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid, action text not null, entity text, entity_id text,
  detail jsonb, created_at timestamptz default now()
);
-- No direct insert policy. Writes go through this function (user_id is forced to auth.uid()).
-- Server code using the service role (e.g. failed logins) may also insert directly.
create or replace function public.log_audit(p_action text, p_entity text, p_entity_id text, p_detail jsonb default null)
returns void language sql security definer set search_path = public as
$$ insert into audit_logs (user_id, action, entity, entity_id, detail)
   values (auth.uid(), p_action, p_entity, p_entity_id, p_detail) $$;
revoke all on function public.log_audit(text,text,text,jsonb) from public;
grant execute on function public.log_audit(text,text,text,jsonb) to authenticated, service_role;

-- RLS ------------------------------------------------------------------
alter table profiles enable row level security;
alter table planters enable row level security;
alter table tickets enable row level security;
alter table ticket_prints enable row level security;
alter table audit_logs enable row level security;

create policy profiles_read on profiles for select using (public.is_active_user());
create policy profiles_update on profiles for update
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

create policy planters_read on planters for select using (public.is_active_user());
create policy planters_admin on planters for all using (public.is_admin()) with check (public.is_admin());

create policy tickets_read on tickets for select
  using (public.is_active_user() and (deleted_at is null or public.is_admin()));
create policy tickets_insert on tickets for insert
  with check (public.is_active_user() and issued_by = auth.uid()
              and net_weight_tons is null and deleted_at is null);
create policy tickets_update on tickets for update using (public.is_active_user());
-- No delete policy: tickets are never hard-deleted.

create policy prints_read on ticket_prints for select using (public.is_active_user());
create policy prints_insert on ticket_prints for insert
  with check (public.is_active_user() and printed_by = auth.uid());

create policy audit_admin_read on audit_logs for select using (public.is_admin());

create or replace function public.dashboard_stats()
returns table(today bigint, month bigint, total bigint)
language sql stable as $$
  select count(*) filter (where (created_at at time zone 'Asia/Manila')::date = (now() at time zone 'Asia/Manila')::date),
         count(*) filter (where date_trunc('month', created_at at time zone 'Asia/Manila') = date_trunc('month', now() at time zone 'Asia/Manila')),
         count(*)
  from tickets where deleted_at is null $$;

create or replace function public.report_summary(p text)
returns table(period text, tickets bigint)
language sql stable as $$
  select case p when 'monthly' then to_char(created_at at time zone 'Asia/Manila','YYYY-MM')
                when 'weekly'  then to_char(date_trunc('week', created_at at time zone 'Asia/Manila'),'YYYY-MM-DD')
                else to_char(created_at at time zone 'Asia/Manila','YYYY-MM-DD') end,
         count(*)
  from tickets where deleted_at is null group by 1 order by 1 desc limit 60 $$;
