-- ============================================================================
--  Access model: email + password signup, access granted by single-use code
--  for a fixed number of days. Mirrors the Bulletproof Ankle approach.
--  No magic links, no confirmation mail, no password-reset mail.
-- ============================================================================

-- Platform admins. Distinct from clinic_members.role: 'owner' owns ONE clinic,
-- this is the operator across all of them.
-- RLS on with no policies: invisible and immutable to every signed-in user.
create table public.app_admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  note       text,
  created_at timestamptz not null default now()
);
alter table public.app_admins enable row level security;

comment on table public.app_admins is
  'Platform operators. RLS enabled with NO policies on purpose: only the service role may read or write it.';

create or replace function public.is_platform_admin()
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (select 1 from public.app_admins where user_id = (select auth.uid()))
$$;

-- ---------------------------------------------------------------------------
-- Access codes. Single use, each worth a fixed number of days.
-- ---------------------------------------------------------------------------
create table public.access_codes (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique check (length(code) between 6 and 64),
  expiration_days integer not null default 30 check (expiration_days between 1 and 3650),
  note            text,
  is_used         boolean not null default false,
  used_by         uuid references auth.users (id) on delete set null,
  used_by_clinic  uuid references public.clinics (id) on delete set null,
  used_at         timestamptz,
  revoked_at      timestamptz,
  created_by      uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now()
);

alter table public.access_codes enable row level security;

-- Admins only. Redemption deliberately does NOT go through this policy — it
-- runs inside a SECURITY DEFINER function, so a clinic never needs read access
-- to this table. Without that split, being able to redeem a code would mean
-- being able to enumerate every unused code in the system.
create policy access_codes_admin_all
  on public.access_codes for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create index access_codes_unused_idx on public.access_codes (code)
  where is_used = false and revoked_at is null;

-- ---------------------------------------------------------------------------
-- Grant ledger. Append-only, so "why does this clinic have access until March"
-- is always answerable.
-- ---------------------------------------------------------------------------
create table public.access_grants (
  id             uuid primary key default gen_random_uuid(),
  clinic_id      uuid not null references public.clinics (id) on delete cascade,
  granted_days   integer not null,
  granted_at     timestamptz not null default now(),
  expires_at     timestamptz not null,
  source_code_id uuid references public.access_codes (id) on delete set null,
  granted_by     uuid references auth.users (id) on delete set null,
  note           text
);

alter table public.access_grants enable row level security;

create policy access_grants_select
  on public.access_grants for select to authenticated
  using (clinic_id in (select public.current_clinic_ids()) or public.is_platform_admin());

create policy access_grants_admin_write
  on public.access_grants for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create index access_grants_clinic_idx on public.access_grants (clinic_id, granted_at desc);

-- ---------------------------------------------------------------------------
-- The access clock lives on the clinic.
-- ---------------------------------------------------------------------------
alter table public.clinics add column access_expires_at timestamptz;

comment on column public.clinics.access_expires_at is
  'When code-granted access lapses. Writable only by SECURITY DEFINER RPCs and the service role.';

-- ---------------------------------------------------------------------------
-- Column guard, rewritten.
--
-- The previous version keyed off request.jwt.claims->>'role'. Correct for a
-- PostgREST request, WRONG for a SECURITY DEFINER function: the redeem RPC runs
-- as its owner while the JWT still says 'authenticated', so the old check would
-- have blocked the RPC's own legitimate write. current_user is the honest test.
-- ---------------------------------------------------------------------------
create or replace function public.clinics_guard_billing_columns()
returns trigger language plpgsql
set search_path = public, pg_temp
as $$
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role')
     or current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role'
  then
    return new;
  end if;

  if new.subscription_status    is distinct from old.subscription_status
     or new.stripe_customer_id    is distinct from old.stripe_customer_id
     or new.subscription_id       is distinct from old.subscription_id
     or new.current_period_end    is distinct from old.current_period_end
     or new.billing_provider      is distinct from old.billing_provider
     or new.last_billing_event_at is distinct from old.last_billing_event_at
     or new.access_expires_at     is distinct from old.access_expires_at
  then
    raise exception 'billing and access columns are managed by the platform, not by clinics'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

-- Writability: unexpired code access OR a live Stripe subscription. Keeping
-- both means enabling billing later needs no change here.
create or replace function public.current_clinic_ids_writable()
returns setof uuid
language sql stable security definer set search_path = public
as $$
  select m.clinic_id
  from public.clinic_members m
  join public.clinics c on c.id = m.clinic_id
  where m.user_id = (select auth.uid())
    and (
      (c.access_expires_at is not null and c.access_expires_at > now())
      or c.subscription_status in ('trialing', 'active', 'past_due')
    )
$$;
