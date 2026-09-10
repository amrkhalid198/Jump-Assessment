'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { mintCodes } from '@/app/actions';

function Submit() {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn btn-accent" disabled={pending}>{pending ? 'Generating…' : 'Generate'}</button>;
}

export default function MintForm() {
  const [state, action] = useFormState(mintCodes, {});

  return (
    <div className="card" style={{ padding: 20 }}>
      <form action={action} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, alignItems: 'end' }}>
        <div>
          <label htmlFor="count">How many</label>
          <input id="count" name="count" type="number" min={1} max={200} defaultValue={1} />
        </div>
        <div>
          <label htmlFor="days">Days each</label>
          <input id="days" name="days" type="number" min={1} max={3650} defaultValue={30} />
        </div>
        <div style={{ gridColumn: 'span 2', minWidth: 180 }}>
          <label htmlFor="note">Note</label>
          <input id="note" name="note" placeholder="e.g. Cairo clinic, paid Sept" />
        </div>
        <Submit />
      </form>

      {state?.error && <p className="bad" style={{ fontSize: 'var(--t-sm)' }} role="alert">{state.error}</p>}

      {state?.ok && (
        <div style={{ marginTop: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>New codes — copy them now</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {state.codes.map((c) => (
              <span key={c.code} className="num" style={{
                padding: '8px 14px', borderRadius: 999, background: 'var(--sunken)',
                border: '1px solid var(--hair)', letterSpacing: '.08em', fontSize: 'var(--t-sm)',
              }}>
                {c.code} <span className="faint">· {c.expiration_days}d</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
