'use client';

import { useFormState } from 'react-dom';
import { grantDays, revokeAccess } from '@/app/actions';

export default function ClinicRow({ clinic }) {
  const [grantState, grant] = useFormState(grantDays, {});
  const [revokeState, revoke] = useFormState(revokeAccess, {});
  const err = grantState?.error || revokeState?.error;

  return (
    <tr>
      <td style={{ fontWeight: 600 }}>
        {clinic.name}
        {err && <div className="bad" style={{ fontSize: 'var(--t-micro)', fontWeight: 400 }}>{err}</div>}
      </td>
      <td className={clinic.is_active ? 'ok' : 'bad'}>{clinic.is_active ? 'Active' : 'Expired'}</td>
      <td className="n num">
        {clinic.days_left === null ? <span className="faint">—</span>
          : <span className={clinic.days_left <= 14 ? 'warn' : ''}>{Math.max(0, clinic.days_left)}</span>}
      </td>
      <td className="n num">{clinic.member_count}</td>
      <td className="n num">{clinic.patient_count}</td>
      <td className="n num">{clinic.trial_count}</td>
      <td>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {[30, 90, 365].map((d) => (
            <form action={grant} key={d}>
              <input type="hidden" name="clinic_id" value={clinic.id} />
              <input type="hidden" name="days" value={d} />
              <button type="submit" className="btn" style={{ padding: '6px 12px', fontSize: 'var(--t-meta)' }}>
                +{d}d
              </button>
            </form>
          ))}
          {clinic.is_active && (
            <form action={revoke}>
              <input type="hidden" name="clinic_id" value={clinic.id} />
              <button type="submit" className="btn" style={{ padding: '6px 12px', fontSize: 'var(--t-meta)', color: 'var(--bad)' }}>
                Revoke
              </button>
            </form>
          )}
        </div>
      </td>
    </tr>
  );
}
