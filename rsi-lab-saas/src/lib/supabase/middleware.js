import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

/**
 * Refreshes the Supabase session on every matched request and reports who the
 * caller is.
 *
 * Three things here are load-bearing and every one of them is a real bug if
 * you get it wrong:
 *
 * 1. `getUser()`, never `getSession()`.
 *    getSession() reads the JWT out of the cookie and trusts it. The cookie is
 *    attacker-controllable, so a forged one authenticates. getUser() revalidates
 *    against the Auth server. In middleware — the one place whose whole job is
 *    to decide access — only getUser() is safe.
 *
 * 2. Nothing may run between createServerClient and getUser().
 *    Server Components cannot write cookies, so middleware is where a rotated
 *    refresh token gets persisted. Any early return in that gap logs the user
 *    out at random when the token happens to rotate on that request.
 *
 * 3. Cookies must survive the response you actually return.
 *    setAll writes onto `response`. Constructing a fresh NextResponse later
 *    (to redirect) discards those writes and the refreshed session is lost,
 *    which shows up as an infinite redirect loop between /dashboard and
 *    /login. Hence copyCookies below.
 */
export async function updateSession(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user, supabase };
}

/**
 * Carries refreshed auth cookies onto a different response (a redirect).
 * Skipping this is the classic /login <-> /dashboard redirect loop.
 */
export function copyCookies(from, to) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));
  return to;
}
