-- ============================================================================
--  Access-code RPCs: redeem, provision, mint.
-- ============================================================================

-- Redeem a code against the caller's clinic.
-- Extension, not replacement: redeeming with 10 days left adds to those 10, so
-- renewing early is never punished.
create or replace function public.redeem_access_code(p_code text)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_uid    uuid := (select auth.uid());
  v_clinic uuid;
  v_code   public.access_codes%rowtype;
  v_new    timestamptz;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = 'insufficient_privilege';
  end if;

  select clinic_id into v_clinic
  from public.clinic_members where user_id = v_uid limit 1;

  if v_clinic is null then
    raise exception 'this account does not belong to a clinic yet' using errcode = 'no_data_found';
  end if;

  -- FOR UPDATE serialises two people racing the same code: the second waits,
  -- then fails the is_used check rather than both being granted.
  select * into v_code from public.access_codes
  where code = upper(btrim(p_code)) for update;

  if v_code.id is null then
    raise exception 'that access code is not valid' using errcode = '22023';
  end if;
  if v_code.revoked_at is not null then
    raise exception 'that access code has been revoked' using errcode = '22023';
  end if;
  if v_code.is_used then
    raise exception 'that access code has already been used' using errcode = '22023';
  end if;

  select greatest(now(), coalesce(c.access_expires_at, now()))
         + make_interval(days => v_code.expiration_days)
    into v_new
  from public.clinics c where c.id = v_clinic;

  update public.clinics set access_expires_at = v_new where id = v_clinic;

  update public.access_codes
     set is_used = true, used_by = v_uid, used_by_clinic = v_clinic, used_at = now()
   where id = v_code.id;

  insert into public.access_grants
    (clinic_id, granted_days, expires_at, source_code_id, granted_by, note)
  values (v_clinic, v_code.expiration_days, v_new, v_code.id, v_uid, v_code.note);

  return jsonb_build_object(
    'clinic_id', v_clinic,
    'granted_days', v_code.expiration_days,
    'access_expires_at', v_new
  );
end;
$$;

-- Sign-up path: create the clinic and redeem the code in one transaction. An
-- invalid code raises, rolling back the clinic too, so a failed signup never
-- strands an access-less clinic its owner cannot get past.
create or replace function public.provision_clinic(p_clinic_name text, p_code text)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = 'insufficient_privilege';
  end if;
  if length(btrim(coalesce(p_clinic_name, ''))) < 2 then
    raise exception 'clinic name is too short' using errcode = '22023';
  end if;
  if exists (select 1 from public.clinic_members where user_id = v_uid) then
    raise exception 'this account already belongs to a clinic' using errcode = 'unique_violation';
  end if;

  insert into public.clinics (name, subscription_status)
  values (btrim(p_clinic_name), 'incomplete') returning id into v_id;

  insert into public.clinic_members (user_id, clinic_id, role)
  values (v_uid, v_id, 'owner');

  return public.redeem_access_code(p_code)
         || jsonb_build_object('clinic_name', btrim(p_clinic_name));
end;
$$;

-- Mint codes. Platform admins only.
-- Alphabet excludes I, O, 0, 1 — codes get read aloud and typed by hand.
create or replace function public.mint_access_codes(
  p_count integer default 1,
  p_days  integer default 30,
  p_note  text    default null
)
returns table (code text, expiration_days integer)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code text;
  i int; j int;
begin
  if not public.is_platform_admin() then
    raise exception 'platform admin only' using errcode = 'insufficient_privilege';
  end if;
  if p_count < 1 or p_count > 200 then
    raise exception 'count must be between 1 and 200' using errcode = '22023';
  end if;
  if p_days < 1 or p_days > 3650 then
    raise exception 'days must be between 1 and 3650' using errcode = '22023';
  end if;

  for i in 1..p_count loop
    loop
      v_code := 'RSI-';
      for j in 1..4 loop
        v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
      end loop;
      v_code := v_code || '-';
      for j in 1..4 loop
        v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
      end loop;
      exit when not exists (select 1 from public.access_codes ac where ac.code = v_code);
    end loop;

    insert into public.access_codes (code, expiration_days, note, created_by)
    values (v_code, p_days, p_note, (select auth.uid()));

    code := v_code;
    expiration_days := p_days;
    return next;
  end loop;
end;
$$;

-- create_clinic() is superseded by provision_clinic(): a clinic created without
-- a code would sit permanently read-only, a confusing dead end at signup.
drop function if exists public.create_clinic(text);

revoke all on function public.redeem_access_code(text)                  from public, anon;
revoke all on function public.provision_clinic(text, text)              from public, anon;
revoke all on function public.mint_access_codes(integer, integer, text) from public, anon;
revoke all on function public.is_platform_admin()                       from public, anon;

grant execute on function public.redeem_access_code(text)                  to authenticated;
grant execute on function public.provision_clinic(text, text)              to authenticated;
grant execute on function public.mint_access_codes(integer, integer, text) to authenticated;
grant execute on function public.is_platform_admin()                       to authenticated;
