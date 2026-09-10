'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Server Actions.
 *
 * Auth is email + password with NO outbound mail: no magic links, no
 * confirmation mail, no reset mail. Access to the product is granted by a
 * single-use code worth a fixed number of days — signing up gets you an
 * account, the code gets you access.
 *
 * Every action uses the RLS-scoped client, so a forged form payload still
 * cannot reach another clinic's rows. The policy is the boundary, not this code.
 */

const PASSWORD_MIN = 8;

function validCredentials(email, password) {
  if (!email || !email.includes('@')) return 'Enter a valid email address.';
  if (!password || password.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters.`;
  }
  return null;
}

/**
 * Sign up, create the clinic, and redeem the access code — in that order.
 *
 * provision_clinic() does the last two atomically: a bad code raises, which
 * rolls back the clinic too, so a failed signup never strands an access-less
 * clinic that the owner then cannot get past.
 */
export async function signUp(_prev, formData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const clinicName = String(formData.get('clinic_name') ?? '').trim();
  const code = String(formData.get('access_code') ?? '').trim().toUpperCase();

  const bad = validCredentials(email, password);
  if (bad) return { error: bad };
  if (clinicName.length < 2) return { error: 'Enter your clinic name.' };
  if (!code) return { error: 'An access code is required to sign up.' };

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return {
      error: /already registered/i.test(error.message)
        ? 'That email already has an account. Sign in instead.'
        : error.message,
    };
  }

  // With "Confirm email" disabled in Supabase Auth, signUp returns a live
  // session. If it does not, confirmation mail is still switched on — which
  // this product is explicitly built to avoid.
  if (!data.session) {
    return {
      error:
        'Account created but no session was returned. Email confirmation is still enabled in Supabase Auth — turn it off (Authentication → Providers → Email → Confirm email).',
    };
  }

  const { error: rpcError } = await supabase.rpc('provision_clinic', {
    p_clinic_name: clinicName,
    p_code: code,
  });

  if (rpcError) {
    // The account exists but has no clinic. Sign back out so the next attempt
    // starts clean rather than landing on a half-provisioned dashboard.
    await supabase.auth.signOut();
    return { error: rpcError.message };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function signIn(_prev, formData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/dashboard');

  if (!email || !password) return { error: 'Enter your email and password.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Deliberately not distinguishing "no such account" from "wrong password":
  // that difference lets anyone enumerate which clinics have accounts.
  if (error) return { error: 'Email or password is incorrect.' };

  // Only same-origin paths — never a caller-supplied absolute URL.
  const dest = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
  revalidatePath('/dashboard');
  redirect(dest);
}

/**
 * Provision a clinic for someone who is already signed in but has none.
 * Same RPC as signup; only the credential step is skipped.
 */
export async function provisionClinicForCurrentUser(_prev, formData) {
  const clinicName = String(formData.get('clinic_name') ?? '').trim();
  const code = String(formData.get('access_code') ?? '').trim().toUpperCase();

  if (clinicName.length < 2) return { error: 'Enter your clinic name.' };
  if (!code) return { error: 'An access code is required.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('provision_clinic', {
    p_clinic_name: clinicName,
    p_code: code,
  });

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

/** Extend an existing clinic's access with another code. */
export async function redeemCode(_prev, formData) {
  const code = String(formData.get('access_code') ?? '').trim().toUpperCase();
  if (!code) return { error: 'Enter an access code.' };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('redeem_access_code', { p_code: code });

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/billing');
  return { ok: true, expiresAt: data?.access_expires_at, days: data?.granted_days };
}

export async function addPatient(_prev, formData) {
  const full_name = String(formData.get('full_name') ?? '').trim();
  const involved_limb = formData.get('involved_limb') || null;
  const external_ref = String(formData.get('external_ref') ?? '').trim() || null;

  if (full_name.length < 2) return { error: 'Patient name is required.' };

  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in.' };

  const { data: membership } = await supabase
    .from('clinic_members')
    .select('clinic_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) return { error: 'No clinic for this account.' };

  const { error } = await supabase.from('patients').insert({
    clinic_id: membership.clinic_id,
    full_name,
    involved_limb,
    external_ref,
  });

  if (error) {
    // 42501 is RLS refusing the write, which here means access has lapsed:
    // current_clinic_ids_writable() requires an unexpired access_expires_at.
    return {
      error: error.code === '42501'
        ? 'This clinic’s access has expired, so it is read-only. Enter a new access code to continue.'
        : error.message,
    };
  }

  revalidatePath('/dashboard');
  return { ok: true };
}

export async function archivePatient(patientId) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('patients')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', patientId);

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}

// ---------------------------------------------------------------------------
// Platform admin
//
// Each of these calls an RPC that re-checks is_platform_admin() in SQL. This
// layer is convenience; the database is the boundary.
// ---------------------------------------------------------------------------

export async function mintCodes(_prev, formData) {
  const count = Number(formData.get('count') ?? 1);
  const days = Number(formData.get('days') ?? 30);
  const note = String(formData.get('note') ?? '').trim() || null;

  if (!Number.isInteger(count) || count < 1 || count > 200) {
    return { error: 'Count must be a whole number between 1 and 200.' };
  }
  if (!Number.isInteger(days) || days < 1 || days > 3650) {
    return { error: 'Days must be a whole number between 1 and 3650.' };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('mint_access_codes', {
    p_count: count,
    p_days: days,
    p_note: note,
  });

  if (error) return { error: error.message };
  revalidatePath('/dashboard/admin');
  return { ok: true, codes: data ?? [] };
}

export async function grantDays(_prev, formData) {
  const clinicId = String(formData.get('clinic_id') ?? '');
  const days = Number(formData.get('days') ?? 30);
  const note = String(formData.get('note') ?? '').trim() || null;

  if (!clinicId) return { error: 'Missing clinic.' };
  if (!Number.isInteger(days) || days < 1 || days > 3650) {
    return { error: 'Days must be between 1 and 3650.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_grant_days', {
    p_clinic_id: clinicId,
    p_days: days,
    p_note: note,
  });

  if (error) return { error: error.message };
  revalidatePath('/dashboard/admin');
  return { ok: true };
}

export async function revokeAccess(_prev, formData) {
  const clinicId = String(formData.get('clinic_id') ?? '');
  if (!clinicId) return { error: 'Missing clinic.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_revoke_access', {
    p_clinic_id: clinicId,
    p_note: 'revoked from admin console',
  });

  if (error) return { error: error.message };
  revalidatePath('/dashboard/admin');
  return { ok: true };
}

export async function revokeCode(_prev, formData) {
  const code = String(formData.get('code') ?? '').trim().toUpperCase();
  if (!code) return { error: 'Missing code.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('admin_revoke_code', { p_code: code });

  if (error) return { error: error.message };
  revalidatePath('/dashboard/admin');
  return { ok: true };
}
