'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { provisionClinicForCurrentUser, signOut } from '@/app/actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: 10 }} disabled={pending}>
      {pending ? 'Activating…' : 'Activate clinic'}
    </button>
  );
}

/**
 * Reached when someone is signed in but has no clinic — an account created by
 * hand, or a signup whose code failed after the account was made. Same
 * provisioning call as signup, minus the credentials they already have.
 */
export default function OnboardingPage() {
  const [state, action] = useFormState(provisionClinicForCurrentUser, {});

  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="card" style={{ padding: 32, width: '100%', maxWidth: 460 }}>
        <div className="eyebrow">Activation</div>
        <h2 style={{ marginTop: 8 }}>Activate your clinic</h2>
        <p className="muted" style={{ fontSize: 'var(--t-sm)', marginTop: 8, marginBottom: 24 }}>
          Your account exists but is not attached to a clinic yet. Enter the
          access code from your administrator.
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

          {state?.error && (
            <p className="bad" style={{ fontSize: 'var(--t-sm)', marginTop: 14 }} role="alert">
              {state.error}
            </p>
          )}

          <Submit />
        </form>

        <form action={signOut} style={{ marginTop: 16 }}>
          <button type="submit" className="btn" style={{ width: '100%' }}>Sign out</button>
        </form>
      </div>
    </main>
  );
}
