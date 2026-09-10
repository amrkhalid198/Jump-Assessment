-- ============================================================================
--  Performance pass — from Supabase's performance advisor.
--
--  1. auth.uid() was called bare inside the policy, so Postgres re-evaluated it
--     once PER ROW. (select auth.uid()) makes it an InitPlan, evaluated once
--     per query.
--  2. clinic_members_write_by_owner was FOR ALL, which includes SELECT. With
--     clinic_members_select_own also covering SELECT, every read evaluated BOTH
--     permissive policies. Split so exactly one policy sits on the read path.
-- ============================================================================

drop policy clinic_members_write_by_owner on public.clinic_members;

create policy clinic_members_insert_by_owner
  on public.clinic_members for insert to authenticated
  with check (exists (select 1 from public.clinic_members m
    where m.user_id = (select auth.uid()) and m.clinic_id = clinic_members.clinic_id and m.role = 'owner'));

create policy clinic_members_update_by_owner
  on public.clinic_members for update to authenticated
  using (exists (select 1 from public.clinic_members m
    where m.user_id = (select auth.uid()) and m.clinic_id = clinic_members.clinic_id and m.role = 'owner'))
  with check (exists (select 1 from public.clinic_members m
    where m.user_id = (select auth.uid()) and m.clinic_id = clinic_members.clinic_id and m.role = 'owner'));

create policy clinic_members_delete_by_owner
  on public.clinic_members for delete to authenticated
  using (exists (select 1 from public.clinic_members m
    where m.user_id = (select auth.uid()) and m.clinic_id = clinic_members.clinic_id and m.role = 'owner'));

create or replace function public.current_clinic_ids()
returns setof uuid language sql stable security definer set search_path = public
as $$ select clinic_id from public.clinic_members where user_id = (select auth.uid()) $$;

create or replace function public.current_clinic_ids_writable()
returns setof uuid language sql stable security definer set search_path = public
as $$
  select m.clinic_id from public.clinic_members m
  join public.clinics c on c.id = m.clinic_id
  where m.user_id = (select auth.uid())
    and c.subscription_status in ('trialing','active','past_due')
$$;
