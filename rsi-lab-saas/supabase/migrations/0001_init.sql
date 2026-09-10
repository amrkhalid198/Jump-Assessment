-- ============================================================================
--  RSI Lab — initial schema
--  Clinics, patients, longitudinal trial data, and the RLS that isolates them.
--
--  Run with:  supabase db push      (or paste into the SQL editor)
--
--  Design notes that matter:
--
--  1. `clinic_members` is not in the original spec, but RLS cannot work
--     without it. Supabase authenticates a *user* (auth.users); every policy
--     here needs to answer "which clinic does this user belong to?". That
--     mapping has to live somewhere, so it lives here. The table allows a user
--     to belong to more than one clinic (locum clinicians are common), which
--     costs nothing today and avoids a painful migration later.
--
--  2. `trials.clinic_id` is denormalised from the patient on purpose. Without
--     it, every RLS check on trials joins to patients, on a table that grows
--     without bound. A BEFORE INSERT trigger derives it server-side, so the
--     client cannot spoof it — the column is not writable in practice.
--
--  3. The standing-hop invariant from the capture FSM is enforced here too.
--     A standing hop has no ground-contact phase, so gct_ms and rsi MUST be
--     null; a drop jump MUST have both. Application bugs then fail loudly at
--     the boundary instead of quietly poisoning longitudinal comparisons.
--
--  PHI: patients.full_name and date_of_birth are protected health information.
--  Supabase encrypts at rest, but if you are handling US patients under HIPAA
--  you need a BAA (Supabase offers one on Team/Enterprise) before go-live.
--  Consider storing only a clinic-side chart reference in `external_ref` and
--  keeping names out of the cloud entirely.
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- Mirrors Stripe's subscription.status vocabulary exactly, so the webhook can
-- write the provider's value straight through with no lossy mapping.
create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid',
  'paused'
);

create type public.test_type   as enum ('drop', 'standing');
create type public.limb        as enum ('left', 'right');
create type public.clinic_role as enum ('owner', 'clinician');

-- ---------------------------------------------------------------------------
-- updated_at housekeeping
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- clinics
-- ---------------------------------------------------------------------------

create table public.clinics (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null check (length(btrim(name)) between 1 and 200),

  -- billing. `billing_provider` exists because Stripe does not onboard
  -- merchants in every market this product targets (Egypt among them).
  -- See ARCHITECTURE.md — the provider is swappable behind one interface.
  billing_provider      text not null default 'stripe'
                          check (billing_provider in ('stripe', 'paymob')),
  stripe_customer_id    text unique,
  subscription_id       text unique,
  subscription_status   public.subscription_status not null default 'incomplete',
  current_period_end    timestamptz,
  trial_ends_at         timestamptz,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger clinics_touch
  before update on public.clinics
  for each row execute function public.touch_updated_at();

-- Webhooks look clinics up by customer id on every event.
create index clinics_stripe_customer_idx on public.clinics (stripe_customer_id)
  where stripe_customer_id is not null;

-- ---------------------------------------------------------------------------
-- clinic_members — the auth.users -> clinics bridge every policy depends on
-- ---------------------------------------------------------------------------

create table public.clinic_members (
  user_id     uuid not null references auth.users (id) on delete cascade,
  clinic_id   uuid not null references public.clinics (id) on delete cascade,
  role        public.clinic_role not null default 'clinician',
  created_at  timestamptz not null default now(),
  primary key (user_id, clinic_id)
);

create index clinic_members_clinic_idx on public.clinic_members (clinic_id);

-- ---------------------------------------------------------------------------
-- Identity helpers
--
-- SECURITY DEFINER is load-bearing, not laziness. If a policy on `patients`
-- selected from `clinic_members` directly, Postgres would evaluate
-- clinic_members' own RLS to satisfy it, and that policy in turn reads
-- clinic_members — infinite recursion, which Postgres reports as a confusing
-- "infinite recursion detected in policy". Running the lookup as the function
-- owner breaks the cycle. `set search_path` prevents a hijacked search_path
-- from resolving these names to something attacker-controlled.
-- ---------------------------------------------------------------------------

create or replace function public.current_clinic_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select clinic_id
  from public.clinic_members
  where user_id = auth.uid()
$$;

-- Write access additionally requires a subscription that is actually paying.
-- Reads stay open at every status on purpose: locking a clinic out of its own
-- historical patient records over a failed card is hostile, and in a clinical
-- setting it is arguably unsafe. Lapsed clinics go read-only, not dark.
create or replace function public.current_clinic_ids_writable()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.clinic_id
  from public.clinic_members m
  join public.clinics c on c.id = m.clinic_id
  where m.user_id = auth.uid()
    and c.subscription_status in ('trialing', 'active', 'past_due')
$$;

-- ---------------------------------------------------------------------------
-- patients
-- ---------------------------------------------------------------------------

create table public.patients (
  id             uuid primary key default gen_random_uuid(),
  clinic_id      uuid not null references public.clinics (id) on delete cascade,
  full_name      text not null check (length(btrim(full_name)) between 1 and 200),
  involved_limb  public.limb,          -- null until an injured side is recorded
  date_of_birth  date,
  external_ref   text,                 -- the clinic's own chart number
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  archived_at    timestamptz           -- soft delete; trials outlive the chart
);

create trigger patients_touch
  before update on public.patients
  for each row execute function public.touch_updated_at();

create index patients_clinic_idx on public.patients (clinic_id)
  where archived_at is null;

-- Case-insensitive name search within a clinic.
create index patients_name_trgm_idx on public.patients
  using gin (lower(full_name) gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- trials
-- ---------------------------------------------------------------------------

create table public.trials (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid not null references public.patients (id) on delete cascade,

  -- Derived by trigger from patient_id. Present so RLS on this table is an
  -- index lookup rather than a join.
  clinic_id        uuid not null references public.clinics (id) on delete cascade,

  test_type        public.test_type not null,
  tested_limb      public.limb not null,

  -- Ground contact phase. Null for standing hops, which have no contact phase.
  gct_ms           numeric(7,1) check (gct_ms > 0 and gct_ms < 5000),
  rsi              numeric(6,3) check (rsi > 0 and rsi < 20),

  -- Present for both modes.
  flight_ms        numeric(7,1) not null check (flight_ms > 0 and flight_ms < 3000),
  jump_height_cm   numeric(6,2) check (jump_height_cm >= 0 and jump_height_cm < 200),
  fppa_deg         numeric(6,2) check (fppa_deg between -90 and 90),

  -- Capture provenance. Without these a number cannot be defended later: at
  -- 30 fps a contact event carries roughly +/-16 ms before interpolation, so a
  -- 2024 trial at 30 fps is not comparable to a 2025 trial at 120 fps.
  capture_fps      numeric(5,2),
  floor_noise      numeric(8,6),
  sensitivity      numeric(4,2),
  engine_version   text,

  recorded_at      timestamptz not null default now(),
  created_at       timestamptz not null default now(),

  -- The FSM contract, enforced at the boundary.
  constraint trials_standing_has_no_contact_metrics
    check (test_type <> 'standing' or (gct_ms is null and rsi is null)),
  constraint trials_drop_has_contact_metrics
    check (test_type <> 'drop' or (gct_ms is not null and rsi is not null))
);

-- The dashboard's dominant read: this patient's trials, newest first.
create index trials_patient_recorded_idx
  on public.trials (patient_id, recorded_at desc);

create index trials_clinic_idx on public.trials (clinic_id);

-- Derive clinic_id server-side so a compromised client cannot file a trial
-- into another clinic by lying about it.
create or replace function public.trials_set_clinic_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select p.clinic_id into new.clinic_id
  from public.patients p
  where p.id = new.patient_id;

  if new.clinic_id is null then
    raise exception 'patient % does not exist', new.patient_id
      using errcode = 'foreign_key_violation';
  end if;

  return new;
end;
$$;

create trigger trials_derive_clinic
  before insert or update of patient_id on public.trials
  for each row execute function public.trials_set_clinic_id();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Every table is deny-by-default once RLS is enabled; each policy below is an
-- explicit grant. Note the split between USING (which rows you may see) and
-- WITH CHECK (which rows you may create or leave behind) — a policy with only
-- USING on an UPDATE lets a clinic move a row *out* of its own clinic.
-- ---------------------------------------------------------------------------

alter table public.clinics        enable row level security;
alter table public.clinic_members enable row level security;
alter table public.patients       enable row level security;
alter table public.trials         enable row level security;

-- --- clinics ---------------------------------------------------------------

create policy clinics_select_own
  on public.clinics for select
  to authenticated
  using (id in (select public.current_clinic_ids()));

-- Members may rename their clinic. They may not touch billing columns; that is
-- the webhook's job with the service role, and is guarded by the trigger below.
create policy clinics_update_own
  on public.clinics for update
  to authenticated
  using      (id in (select public.current_clinic_ids()))
  with check (id in (select public.current_clinic_ids()));

-- Billing columns are webhook-owned. RLS grants row access, not column access,
-- so this trigger supplies the missing half. The service role bypasses RLS but
-- NOT triggers, hence the explicit role check.
create or replace function public.clinics_guard_billing_columns()
returns trigger
language plpgsql
as $$
begin
  if current_setting('request.jwt.claims', true)::jsonb ->> 'role'
     is distinct from 'service_role'
  then
    if new.subscription_status is distinct from old.subscription_status
       or new.stripe_customer_id  is distinct from old.stripe_customer_id
       or new.subscription_id     is distinct from old.subscription_id
       or new.current_period_end  is distinct from old.current_period_end
       or new.billing_provider    is distinct from old.billing_provider
    then
      raise exception 'billing columns are managed by the billing webhook'
        using errcode = 'insufficient_privilege';
    end if;
  end if;
  return new;
end;
$$;

create trigger clinics_billing_guard
  before update on public.clinics
  for each row execute function public.clinics_guard_billing_columns();

-- --- clinic_members --------------------------------------------------------

create policy clinic_members_select_own
  on public.clinic_members for select
  to authenticated
  using (clinic_id in (select public.current_clinic_ids()));

-- Only an owner may add or remove colleagues.
create policy clinic_members_write_by_owner
  on public.clinic_members for all
  to authenticated
  using (
    exists (
      select 1 from public.clinic_members m
      where m.user_id = auth.uid()
        and m.clinic_id = clinic_members.clinic_id
        and m.role = 'owner'
    )
  )
  with check (
    exists (
      select 1 from public.clinic_members m
      where m.user_id = auth.uid()
        and m.clinic_id = clinic_members.clinic_id
        and m.role = 'owner'
    )
  );

-- --- patients --------------------------------------------------------------

create policy patients_select_own_clinic
  on public.patients for select
  to authenticated
  using (clinic_id in (select public.current_clinic_ids()));

create policy patients_insert_own_clinic
  on public.patients for insert
  to authenticated
  with check (clinic_id in (select public.current_clinic_ids_writable()));

create policy patients_update_own_clinic
  on public.patients for update
  to authenticated
  using      (clinic_id in (select public.current_clinic_ids()))
  with check (clinic_id in (select public.current_clinic_ids_writable()));

create policy patients_delete_own_clinic
  on public.patients for delete
  to authenticated
  using (clinic_id in (select public.current_clinic_ids_writable()));

-- --- trials ----------------------------------------------------------------

create policy trials_select_own_clinic
  on public.trials for select
  to authenticated
  using (clinic_id in (select public.current_clinic_ids()));

-- WITH CHECK tests patient_id rather than clinic_id, because the BEFORE INSERT
-- trigger has not fired yet when this is evaluated on some paths. Checking the
-- parent is the honest test anyway: may this user file against this patient?
create policy trials_insert_own_clinic
  on public.trials for insert
  to authenticated
  with check (
    exists (
      select 1 from public.patients p
      where p.id = trials.patient_id
        and p.clinic_id in (select public.current_clinic_ids_writable())
    )
  );

-- Trials are an immutable measurement record: no UPDATE policy is granted, so
-- updates are refused for every authenticated user. Correct a bad trial by
-- deleting it and recapturing.
create policy trials_delete_own_clinic
  on public.trials for delete
  to authenticated
  using (clinic_id in (select public.current_clinic_ids_writable()));

-- ---------------------------------------------------------------------------
-- Limb symmetry view
--
-- security_invoker is essential. A normal Postgres view executes as its owner,
-- which would hand every caller a clean bypass around all of the above. On
-- Supabase (PG15+) this makes the view honour the caller's policies instead.
-- ---------------------------------------------------------------------------

create view public.patient_limb_summary
with (security_invoker = true)
as
select
  t.patient_id,
  t.clinic_id,
  t.test_type,
  t.tested_limb,
  count(*)                                as trial_count,
  round(avg(t.rsi), 3)                    as mean_rsi,
  round(avg(t.jump_height_cm), 2)         as mean_jump_height_cm,
  round(avg(t.gct_ms), 1)                 as mean_gct_ms,
  round(avg(t.fppa_deg), 2)               as mean_fppa_deg,
  max(t.recorded_at)                      as last_tested_at
from public.trials t
group by t.patient_id, t.clinic_id, t.test_type, t.tested_limb;

-- ---------------------------------------------------------------------------
-- Clinic provisioning
--
-- Creates the clinic and makes the signing-up user its owner, atomically.
-- Doing this client-side would need an INSERT policy on clinics, and any such
-- policy lets a user mint unlimited clinics.
-- ---------------------------------------------------------------------------

create or replace function public.create_clinic(clinic_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = 'insufficient_privilege';
  end if;

  if exists (select 1 from public.clinic_members where user_id = auth.uid()) then
    raise exception 'user already belongs to a clinic'
      using errcode = 'unique_violation';
  end if;

  insert into public.clinics (name, subscription_status, trial_ends_at)
  values (clinic_name, 'trialing', now() + interval '14 days')
  returning id into new_id;

  insert into public.clinic_members (user_id, clinic_id, role)
  values (auth.uid(), new_id, 'owner');

  return new_id;
end;
$$;

revoke all on function public.create_clinic(text) from public;
grant execute on function public.create_clinic(text) to authenticated;
