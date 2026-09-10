import { NextResponse } from 'next/server';
import { updateSession, copyCookies } from '@/lib/supabase/middleware';

// Email + password only. There is no /auth/callback because there are no
// magic links, and no /reset because this system sends no mail at all.
const PUBLIC_ROUTES = ['/login', '/signup'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // The billing webhook authenticates with a provider signature, not a cookie.
  // Running it through session refresh would be pointless at best; at worst a
  // redirect here turns a delivered webhook into a 307 that Stripe records as
  // a failure and retries for three days.
  if (pathname.startsWith('/api/webhook')) return NextResponse.next();

  const { response, user } = await updateSession(request);

  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );

  // --- unauthenticated, protected route -> /login --------------------------
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Send them back where they were headed after they sign in. Only ever a
    // path from this request — never a caller-supplied absolute URL, which is
    // an open-redirect handed to a phishing page.
    url.searchParams.set('next', pathname);
    return copyCookies(response, NextResponse.redirect(url));
  }

  // --- authenticated, on an auth page -> /dashboard ------------------------
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return copyCookies(response, NextResponse.redirect(url));
  }

  return response;
}

export const config = {
  /**
   * Everything except static assets and the PWA shell.
   *
   * The PWA exclusions are not optional. If middleware intercepts sw.js or the
   * manifest, an expired session turns the service worker request into a 307
   * to /login; the browser refuses to register a service worker from a
   * redirect, and the app silently stops working offline — with no error that
   * points anywhere near auth.
   *
   * Subscription state is deliberately NOT checked here. Middleware runs on
   * every request and a DB round-trip per navigation is a tax on all of them;
   * worse, entitlement in middleware is easy to get subtly wrong. Gate it in
   * the /dashboard layout, where you are already loading the clinic, and rely
   * on the RLS write policies as the real enforcement boundary.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|workbox-.*\\.js|icons/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|task|wasm)$).*)',
  ],
};
