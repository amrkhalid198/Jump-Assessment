'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { signUp } from '@/app/actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: 10 }} disabled={pending}>
      {pending ? 'Setting up…' : 'Activate clinic'}
    </button>
  );
}

export default function SignupPage() {
  const [state, action] = useFormState(signUp, {});

  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="card" style={{ padding: 32, width: '100%', maxWidth: 460 }}>
        <div style={{ fontWeight: 800, letterSpacing: '-.02em', fontSize: 19, marginBottom: 10 }}>
          RSI<span style={{ color: 'var(--accent)' }}>·</span>LAB
        </div>
        <h2>Set up your clinic</h2>
        <p className="muted" style={{ fontSize: 'var(--t-sm)', marginTop: 8, marginBottom: 24 }}>
          You need an access code from your RSI Lab administrator. It activates
          the clinic for a set number of days.
        </p>

        <form action={action}>
          <label htmlFor="clinic_name">Clinic name</label>
          <input id="clinic_name" name="clinic_name" required autoFocus placeholder="e.g. Cairo Sports Physio" />

          <div style={{ marginTop: 14 }}>
            <label htmlFor="access_code">Access code</label>
            <input
              id="access_code"
              name="access_code"
              required
              placeholder="RSI-XXXX-XXXX"
              autoCapitalize="characters"
              spellCheck="false"
              className="num"
              style={{ letterSpacing: '.08em' }}
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@clinic.com" />
          </div>

          <div style={{ marginTop: 14 }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="faint" style={{ fontSize: 'var(--t-sm)', marginTop: 8, marginBottom: 0 }}>
              At least 8 characters. Write it down — this system sends no email,
              so there is no self-service reset link.
            </p>
          </div>

          {state?.error && (
            <p className="bad" style={{ fontSize: 'var(--t-sm)', marginTop: 14 }} role="alert">
              {state.error}
            </p>
          )}

          <Submit />
        </form>

        <p className="faint" style={{ fontSize: 'var(--t-sm)', marginTop: 22, marginBottom: 0 }}>
          Already set up? <Link href="/login">Sign in</Link>.
        </p>
      </div>
    </main>
  );
}
