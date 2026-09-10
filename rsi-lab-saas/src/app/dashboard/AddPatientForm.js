'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addPatient } from '@/app/actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-accent" disabled={pending}>
      {pending ? 'Saving…' : 'Add patient'}
    </button>
  );
}

export default function AddPatientForm() {
  const [open, setOpen] = useState(false);
  const [state, action] = useFormState(addPatient, {});
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state]);

  if (!open) {
    return (
      <button className="btn btn-accent" onClick={() => setOpen(true)}>
        Add patient
      </button>
    );
  }

  return (
    <div className="card" style={{ padding: 20, width: '100%', maxWidth: 560 }}>
      <form ref={formRef} action={action}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
          <div>
            <label htmlFor="full_name">Patient name</label>
            <input id="full_name" name="full_name" required autoFocus placeholder="Full name" />
          </div>
          <div>
            <label htmlFor="external_ref">Chart number</label>
            <input id="external_ref" name="external_ref" placeholder="Optional" />
          </div>
          <div>
            <label htmlFor="involved_limb">Involved limb</label>
            <select id="involved_limb" name="involved_limb" defaultValue="">
              <option value="">Not set</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>

        <p className="faint" style={{ fontSize: 'var(--t-sm)', marginTop: 12, marginBottom: 14 }}>
          The involved limb sets which side counts as the deficit in limb symmetry.
          It can be filled in later.
        </p>

        {state?.error && (
          <p className="bad" style={{ fontSize: 'var(--t-sm)', marginTop: 0 }} role="alert">
            {state.error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <Submit />
          <button type="button" className="btn" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
