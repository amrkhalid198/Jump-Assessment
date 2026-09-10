'use client';

import { useFormState } from 'react-dom';
import { revokeCode } from '@/app/actions';

export default function CodeRow({ code }) {
  const [state, action] = useFormState(revokeCode, {});
  const spent = code.is_used || !!code.revoked_at;

  return (
    <tr style={spent ? { opacity: 0.55 } : undefined}>
      <td className="num" style={{ letterSpacing: '.06em' }}>{code.code}</td>
      <td className="n num">{code.expiration_days}</td>
      <td className={code.revoked_at ? 'bad' : code.is_used ? 'muted' : 'ok'}>
        {code.revoked_at ? 'Revoked' : code.is_used ? 'Used' : 'Unused'}
      </td>
      <td className="faint">{code.note ?? '—'}</td>
      <td style={{ textAlign: 'end' }}>
        {!spent && (
          <form action={action}>
            <input type="hidden" name="code" value={code.code} />
            <button type="submit" className="btn" style={{ padding: '6px 12px', fontSize: 'var(--t-meta)' }}>
              Revoke
            </button>
          </form>
        )}
        {state?.error && <div className="bad" style={{ fontSize: 'var(--t-micro)' }}>{state.error}</div>}
      </td>
    </tr>
  );
}
