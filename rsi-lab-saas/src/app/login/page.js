'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { signIn } from '@/app/actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: 8 }} disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}

function LoginForm() {
  const [state, action] = useFormState(signIn, {});
  const next = useSearchParams().get('next') ?? '/dashboard';

  return (
    <form action={action}>
      <input type="hidden" name="next" value={next} />

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required autoComplete="email" autoFocus placeholder="you@clinic.com" />

      <div style={{ marginTop: 14 }}>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>

      {state?.error && (
        <p className="bad" style={{ fontSize: 'var(--t-sm)' }} role="alert">{state.error}</p>
      )}

      <Submit />
    </form>
  );
}

export default function LoginPage() {
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="card" style={{ padding: 32, width: '100%', maxWidth: 420 }}>
        <div style={{ fontWeight: 800, letterSpacing: '-.02em', fontSize: 19, marginBottom: 10 }}>
          RSI<span style={{ color: 'var(--accent)' }}>·</span>LAB
        </div>
        <h2>Sign in</h2>
        <p className="muted" style={{ fontSize: 'var(--t-sm)', marginTop: 8, marginBottom: 24 }}>
          Use the email and password you set when your clinic was activated.
        </p>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <p className="faint" style={{ fontSize: 'var(--t-sm)', marginTop: 22, marginBottom: 0 }}>
          Have an access code? <Link href="/signup">Set up your clinic</Link>.
        </p>
        <p className="faint" style={{ fontSize: 'var(--t-sm)', marginTop: 10, marginBottom: 0 }}>
          Forgotten your password? Contact your RSI Lab administrator — for
          patient-data safety this system sends no email, so passwords are reset
          by hand.
        </p>
      </div>
    </main>
  );
}
