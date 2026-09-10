-- ============================================================================
--  Billing webhook support
--  Idempotency ledger + the out-of-order guard the handler depends on.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Idempotency
--
-- Stripe redelivers on any non-2xx, and occasionally on a 2xx it did not hear.
-- Without this, a redelivered `invoice.payment_succeeded` re-runs the handler;
-- today that is merely wasteful, but the moment anyone adds "email the owner"
-- or "credit a usage allowance" to the handler it becomes a real defect.
--
-- The primary key does the work: two concurrent redeliveries race on INSERT
-- and exactly one wins with 23505.
-- ---------------------------------------------------------------------------

create table public.billing_events (
  event_id      text primary key,          -- provider's event id (evt_...)
  type          text not null,
  received_at   timestamptz not null default now()
);

-- No policies are created, so with RLS enabled this table is invisible and
-- immutable to every authenticated user. Only the service role — which
-- bypasses RLS — can touch it, and only the webhook holds that key.
alter table public.billing_events enable row level security;

-- Stripe replays at most 3 days back, so anything older cannot be redelivered
-- and is dead weight. Schedule with pg_cron if available:
--   select cron.schedule('prune-billing-events','0 4 * * *',
--                        $$ select public.prune_billing_events() $$);
create or replace function public.prune_billing_events()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.billing_events where received_at < now() - interval '30 days';
$$;

-- ---------------------------------------------------------------------------
-- Out-of-order guard
--
-- Webhook delivery is not ordered. A `customer.subscription.updated` created
-- at 09:00:01 can arrive after the one created at 09:00:05 — routine when
-- Stripe retries the first. Applying them in arrival order would leave a
-- cancelled clinic marked active, which is the expensive direction to get
-- wrong. The handler compares against this column and drops stale events.
-- ---------------------------------------------------------------------------

alter table public.clinics
  add column last_billing_event_at timestamptz;

comment on column public.clinics.last_billing_event_at is
  'Timestamp of the newest billing event applied to this row. Webhook-owned; '
  'used to discard out-of-order provider deliveries.';

-- Keep it under the same guard as the other billing columns.
create or replace function public.clinics_guard_billing_columns()
returns trigger
language plpgsql
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
