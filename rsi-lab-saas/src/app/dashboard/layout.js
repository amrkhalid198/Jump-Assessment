import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentClinic, canCapture, accessDaysLeft, isPlatformAdmin } from '@/lib/supabase/server';
import { signOut } from '@/app/actions';

/**
 * The access gate.
 *
 * Here rather than in middleware: middleware runs on every request including
 * assets, and a DB round-trip per navigation taxes all of them. This layout
 * already loads the clinic, so the check is free.
 *
 * It surfaces access state; it does NOT enforce it. Enforcement is the RLS
 * write policies, which gate on current_clinic_ids_writable() and cannot be
 * routed around by a forged request. A UI gate alone is a suggestion.
 */
export default async function DashboardLayout({ children }) {
  const [clinic, admin] = await Promise.all([getCurrentClinic(), isPlatformAdmin()]);

  // Signed in, but no clinic attached yet.
  if (!clinic) redirect('/onboarding');

  const writable = canCapture(clinic);
  const daysLeft = accessDaysLeft(clinic);

  return (
    <>
      <header style={{ borderBottom: '1px solid var(--hair)', position: 'sticky', top: 0, background: 'rgba(11,11,11,.85)', backdropFilter: 'blur(18px)', zIndex: 40 }}>
        <div className="wrap" style={{ height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, minWidth: 0 }}>
            <Link href="/dashboard" style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-.02em', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              RSI<span style={{ color: 'var(--accent)' }}>·</span>LAB
            </Link>
            <span className="muted" style={{ fontSize: 'var(--t-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {clinic.name}
            </span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/dashboard" style={{ fontSize: 'var(--t-sm)', textDecoration: 'none' }}>Patients</Link>
            <Link href="/dashboard/access" style={{ fontSize: 'var(--t-sm)', textDecoration: 'none' }} className="muted">Access</Link>
            {admin && (
              <Link href="/dashboard/admin" style={{ fontSize: 'var(--t-sm)', textDecoration: 'none', color: 'var(--accent-hi)' }}>
                Admin
              </Link>
            )}
            <form action={signOut}>
              <button type="submit" className="btn" style={{ padding: '8px 16px', fontSize: 'var(--t-sm)' }}>Sign out</button>
            </form>
          </nav>
        </div>
      </header>

      {!writable && (
        <div style={{ background: 'rgba(229,72,77,.12)', borderBottom: '1px solid rgba(229,72,77,.35)' }}>
          <div className="wrap" style={{ padding: '12px 24px', fontSize: 'var(--t-sm)' }}>
            <strong className="bad">Read-only.</strong>{' '}
            <span className="muted">
              {clinic.access_expires_at
                ? 'This clinic’s access has expired, so new patients and trials cannot be saved.'
                : 'This clinic has no active access, so new patients and trials cannot be saved.'}{' '}
              Existing records stay readable.
            </span>{' '}
            <Link href="/dashboard/access">Enter an access code</Link>
          </div>
        </div>
      )}

      {writable && daysLeft !== null && daysLeft <= 14 && (
        <div style={{ background: 'rgba(242,176,35,.10)', borderBottom: '1px solid rgba(242,176,35,.3)' }}>
          <div className="wrap" style={{ padding: '10px 24px', fontSize: 'var(--t-sm)' }}>
            <span className="muted">
              Access ends in <span className="num warn">{Math.max(0, daysLeft)}</span>{' '}
              {daysLeft === 1 ? 'day' : 'days'}.
            </span>{' '}
            <Link href="/dashboard/access">Extend with a code</Link>
          </div>
        </div>
      )}

      <main className="wrap" style={{ paddingTop: 28, paddingBottom: 64 }}>{children}</main>
    </>
  );
}
