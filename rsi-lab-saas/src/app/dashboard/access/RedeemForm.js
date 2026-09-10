'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { redeemCode } from '@/app/actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-accent" style={{ marginTop: 12 }} disabled={pending}>
      {pending ? 'Redeeming…' : 'Redeem code'}
    </button>
  );
}

export default function RedeemForm() {
  const [state, action] = useFormState(redeemCode, {});
  const ref = useRef(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action}>
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

      {state?.error && (
        <p className="bad" style={{ fontSize: 'var(--t-sm)', marginBottom: 0 }} role="alert">
          {state.error}
        </p>
      )}

      {state?.ok && (
        <p className="ok" style={{ fontSize: 'var(--t-sm)', marginBottom: 0 }} role="status">
          Added {state.days} days. Access now runs to{' '}
          <span className="num">{new Date(state.expiresAt).toLocaleDateString()}</span>.
        </p>
      )}

      <Submit />
    </form>
  );
}
