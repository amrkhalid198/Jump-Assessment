-- ============================================================================
--  Hardening pass — driven by Supabase's security advisor after 0001/0002.
--  Applied to project ewlpbjuhkjcfhrujgvok on 2026-09-10.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Pin search_path on the two functions that lacked it.
--
-- Without it, a caller who can influence search_path could resolve now(), a
-- type, or an operator to an object they control, and it would run with the
-- definer's rights.
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.clinics_guard_billing_columns()
returns trigger language plpgsql
set search_path = public, pg_temp
as $$
begin
  if current_setting('request.jwt.claims', true)::jsonb ->> 'role'
     is distinct from 'service_role'
  then
    if new.subscription_status    is distinct from old.subscription_status
       or new.stripe_customer_id    is distinct from old.stripe_customer_id
       or new.subscription_id       is distinct from old.subscription_id
       or new.current_period_end    is distinct from old.current_period_end
       or new.billing_provider      is distinct from old.billing_provider
       or new.last_billing_event_at is distinct from old.last_billing_event_at
    then
      raise exception 'billing columns are managed by the billing webhook'
        using errcode = 'insufficient_privilege';
    end if;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Move pg_trgm out of public.
-- The existing GIN index binds its operator class by OID, so relocating the
-- extension does not invalidate the index.
-- ---------------------------------------------------------------------------

create schema if not exists extensions;
alter extension pg_trgm set schema extensions;

-- ---------------------------------------------------------------------------
-- 3. Close the REST surface on the SECURITY DEFINER functions.
--
-- Supabase publishes every public-schema function at /rest/v1/rpc/<name>, and
-- the anon and authenticated roles inherit EXECUTE by default. `revoke ... from
-- public` alone does NOT cover them: those are real roles with their own grant.
--
-- The serious one was prune_billing_events. An anonymous caller could empty the
-- webhook idempotency ledger and then replay captured billing events at will.
-- trials_set_clinic_id is a trigger function with no business being callable.
-- ---------------------------------------------------------------------------

revoke all on function public.prune_billing_events()        from public, anon, authenticated;
revoke all on function public.trials_set_clinic_id()        from public, anon, authenticated;
revoke all on function public.current_clinic_ids()          from public, anon;
revoke all on function public.current_clinic_ids_writable() from public, anon;
revoke all on function public.create_clinic(text)           from public, anon;

-- `authenticated` keeps EXECUTE on the two helpers: RLS policy expressions are
-- evaluated as the querying role, so revoking it would break every policy that
-- calls them. Verified against the live schema — see the RLS test in the
-- session log: 15/15 behaviours pass with these grants in place.
grant execute on function public.current_clinic_ids()          to authenticated;
grant execute on function public.current_clinic_ids_writable() to authenticated;
grant execute on function public.create_clinic(text)           to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Document the deliberate "RLS enabled, no policy" state on billing_events,
--    so the advisor notice is not mistaken for an oversight.
-- ---------------------------------------------------------------------------

comment on table public.billing_events is
  'Webhook idempotency ledger. RLS enabled with NO policies on purpose: only the service role (which bypasses RLS) may read or write it.';
