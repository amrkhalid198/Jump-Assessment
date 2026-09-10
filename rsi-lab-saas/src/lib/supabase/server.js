import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Request-scoped client for Server Components, Server Actions and Route
 * Handlers. Runs as the signed-in user, so every query is filtered by RLS.
 *
 * Must be created per request — never hoisted to a module-level singleton, or
 * one clinic's cookies leak into another's request on a warm Lambda.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components cannot set cookies. Safe to swallow: the
            // middleware already refreshed the session for this request.
          }
        },
      },
    }
  );
}

/**
 * Service-role client. Bypasses RLS completely.
 *
 * Only for the billing webhook, which has no user session and must write
 * billing columns no user is permitted to touch. Three hard rules:
 *
 *   - Never import this into a Client Component. The key is full database
 *     access; shipping it to a browser is game over for every clinic's data.
 *   - Never pass user input straight into a query built with it.
 *   - Keep SUPABASE_SERVICE_ROLE_KEY out of any NEXT_PUBLIC_ variable.
 */
export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** The signed-in user's clinic, or null. Used by the dashboard layout. */
export async function getCurrentClinic() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('clinic_members')
    .select('role, clinics(*)')
    .eq('user_id', user.id)
    .maybeSingle();

  return data ? { ...data.clinics, role: data.role, userEmail: user.email } : null;
}

/**
 * Mirrors public.current_clinic_ids_writable() exactly. If you change one,
 * change the other — but note this is only for showing the right UI. The RLS
 * policy is the enforcement boundary; a forged request never reaches this code.
 */
export const WRITABLE_STATUSES = ['trialing', 'active', 'past_due'];

export const accessDaysLeft = (clinic) => {
  if (!clinic?.access_expires_at) return null;
  return Math.ceil((new Date(clinic.access_expires_at) - Date.now()) / 86_400_000);
};

export const canCapture = (clinic) => {
  if (!clinic) return false;
  const codeAccess =
    !!clinic.access_expires_at && new Date(clinic.access_expires_at) > new Date();
  return codeAccess || WRITABLE_STATUSES.includes(clinic.subscription_status);
};

/**
 * Platform-admin check for rendering decisions only. The RPCs each re-check
 * is_platform_admin() server-side, so hiding the nav link is cosmetic, not a
 * control — a forged request still hits the database check.
 */
export async function isPlatformAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('is_platform_admin');
  return !error && data === true;
}
