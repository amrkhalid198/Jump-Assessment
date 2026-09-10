-- ============================================================================
--  Platform admin: allowlist by email, auto-promotion on signup, and the
--  controls for granting access to other clinics.
--
--  PRIVACY BOUNDARY, deliberate: a platform admin can see clinics, access
--  state and codes. A platform admin CANNOT read patients or trials. No admin
--  policy is added to those tables, so RLS keeps them clinic-only. Operating
--  the business does not require reading someone's rehab record, and the
--  cheapest way to never leak PHI is to never grant access to it.
--
--  The allowlist exists so an operator account is never created on someone's
--  behalf with a password chosen for them: seed the email, they sign up
--  normally with their own password, the trigger promotes them.
-- ============================================================================

create table public.pending_admins (
  email      text primary key,
  note       text,
  created_at timestamptz not null default now()
);
alter table public.pending_admins enable row level security;

comment on table public.pending_admins is
  'Emails that become platform admins on signup. RLS enabled with NO policies: service role only.';

create or replace function public.promote_pending_admin()
returns trigger
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if exists (select 1 from public.pending_admins p where lower(p.email) = lower(new.email)) then
    insert into public.app_admins (user_id, note)
    values (new.id, 'auto-promoted from pending_admins')
    on conflict (user_id) do nothing;

    delete from public.pending_admins p where lower(p.email) = lower(new.email);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_promote_admin
  after insert on auth.users
  for each row execute function public.promote_pending_admin();

-- Admins may read every clinic (name + access state). Nothing clinical.
create policy clinics_select_admin
  on public.clinics for select to authenticated
  using (public.is_platform_admin());

-- ---------------------------------------------------------------------------
-- Grant days directly, no code needed.
-- ---------------------------------------------------------------------------
create or replace function public.admin_grant_days(
  p_clinic_id uuid, p_days integer, p_note text default null
)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_new timestamptz;
begin
  if not public.is_platform_admin() then
    raise exception 'platform admin only' using errcode = 'insufficient_privilege';
  end if;
  if p_days is null or p_days < 1 or p_days > 3650 then
    raise exception 'days must be between 1 and 3650' using errcode = '22023';
  end if;
  if not exists (select 1 from public.clinics where id = p_clinic_id) then
    raise exception 'no such clinic' using errcode = 'no_data_found';
  end if;

  select greatest(now(), coalesce(access_expires_at, now())) + make_interval(days => p_days)
    into v_new from public.clinics where id = p_clinic_id;

  update public.clinics set access_expires_at = v_new where id = p_clinic_id;

  insert into public.access_grants (clinic_id, granted_days, expires_at, granted_by, note)
  values (p_clinic_id, p_days, v_new, (select auth.uid()), coalesce(p_note, 'granted by admin'));

  return jsonb_build_object('clinic_id', p_clinic_id, 'access_expires_at', v_new);
end;
$$;

-- Revoke = expire now. Records are NOT deleted: the clinic goes read-only and
-- keeps its patient history, which is both kinder and safer clinically.
create or replace function public.admin_revoke_access(p_clinic_id uuid, p_note text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'platform admin only' using errcode = 'insufficient_privilege';
  end if;

  update public.clinics set access_expires_at = now() where id = p_clinic_id;

  insert into public.access_grants (clinic_id, granted_days, expires_at, granted_by, note)
  values (p_clinic_id, 0, now(), (select auth.uid()), coalesce(p_note, 'access revoked by admin'));

  return jsonb_build_object('clinic_id', p_clinic_id, 'revoked', true);
end;
$$;

-- Roster. Counts only — never names, never trial values.
create or replace function public.admin_list_clinics()
returns table (
  id uuid, name text, access_expires_at timestamptz, days_left integer,
  is_active boolean, member_count bigint, patient_count bigint,
  trial_count bigint, created_at timestamptz
)
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'platform admin only' using errcode = 'insufficient_privilege';
  end if;

  return query
  select c.id, c.name, c.access_expires_at,
         case when c.access_expires_at is null then null
              else ceil(extract(epoch from (c.access_expires_at - now())) / 86400)::int end,
         (c.access_expires_at is not null and c.access_expires_at > now())
           or c.subscription_status in ('trialing','active','past_due'),
         (select count(*) from public.clinic_members m where m.clinic_id = c.id),
         (select count(*) from public.patients p where p.clinic_id = c.id and p.archived_at is null),
         (select count(*) from public.trials t where t.clinic_id = c.id),
         c.created_at
  from public.clinics c
  order by c.created_at desc;
end;
$$;

create or replace function public.admin_revoke_code(p_code text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_n int;
begin
  if not public.is_platform_admin() then
    raise exception 'platform admin only' using errcode = 'insufficient_privilege';
  end if;

  update public.access_codes set revoked_at = now()
   where code = upper(btrim(p_code)) and is_used = false and revoked_at is null;

  get diagnostics v_n = row_count;
  if v_n = 0 then
    raise exception 'no unused, unrevoked code matches' using errcode = 'no_data_found';
  end if;
  return jsonb_build_object('code', upper(btrim(p_code)), 'revoked', true);
end;
$$;

revoke all on function public.admin_grant_days(uuid, integer, text)  from public, anon;
revoke all on function public.admin_revoke_access(uuid, text)        from public, anon;
revoke all on function public.admin_list_clinics()                   from public, anon;
revoke all on function public.admin_revoke_code(text)                from public, anon;

grant execute on function public.admin_grant_days(uuid, integer, text) to authenticated;
grant execute on function public.admin_revoke_access(uuid, text)       to authenticated;
grant execute on function public.admin_list_clinics()                  to authenticated;
grant execute on function public.admin_revoke_code(text)               to authenticated;

-- Seed the operator.
insert into public.pending_admins (email, note)
values ('amrkh41462@gmail.com', 'owner / operator')
on conflict (email) do nothing;
