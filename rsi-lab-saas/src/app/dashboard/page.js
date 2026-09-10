import Link from 'next/link';
import { createSupabaseServerClient, getCurrentClinic, canCapture } from '@/lib/supabase/server';
import AddPatientForm from './AddPatientForm';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const clinic = await getCurrentClinic();

  // No clinic_id filter needed — RLS already scopes this to the caller's
  // clinic. Adding one would be belt-and-braces, not security.
  const { data: patients, error } = await supabase
    .from('patients')
    .select('id, full_name, involved_limb, external_ref, created_at')
    .is('archived_at', null)
    .order('created_at', { ascending: false });

  const { data: counts } = await supabase
    .from('patient_limb_summary')
    .select('patient_id, trial_count, last_tested_at');

  const byPatient = new Map();
  for (const row of counts ?? []) {
    const prev = byPatient.get(row.patient_id) ?? { trials: 0, last: null };
    byPatient.set(row.patient_id, {
      trials: prev.trials + Number(row.trial_count ?? 0),
      last: !prev.last || row.last_tested_at > prev.last ? row.last_tested_at : prev.last,
    });
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <div className="eyebrow">Patients</div>
          <h1 style={{ marginTop: 6 }}>{patients?.length ?? 0} active</h1>
        </div>
        {canCapture(clinic) && <AddPatientForm />}
      </div>

      {error && (
        <div className="card" style={{ padding: 20, borderColor: 'rgba(229,72,77,.4)' }}>
          <span className="bad">Could not load patients:</span>{' '}
          <span className="muted">{error.message}</span>
        </div>
      )}

      {!error && (patients?.length ?? 0) === 0 && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <h3>No patients yet</h3>
          <p className="muted" style={{ fontSize: 'var(--t-sm)', maxWidth: '52ch', margin: '8px auto 0' }}>
            Add a patient, then run a drop jump or standing hop from the capture screen.
            Every trial is filed against the patient so you can track change across sessions.
          </p>
        </div>
      )}

      {!error && (patients?.length ?? 0) > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Chart</th>
                <th>Involved limb</th>
                <th className="n">Trials</th>
                <th className="n">Last tested</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => {
                const agg = byPatient.get(p.id) ?? { trials: 0, last: null };
                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/dashboard/patients/${p.id}`} style={{ fontWeight: 600 }}>
                        {p.full_name}
                      </Link>
                    </td>
                    <td className="faint num">{p.external_ref ?? '—'}</td>
                    <td className="muted">
                      {p.involved_limb
                        ? p.involved_limb[0].toUpperCase() + p.involved_limb.slice(1)
                        : <span className="faint">not set</span>}
                    </td>
                    <td className="n num">{agg.trials || <span className="faint">0</span>}</td>
                    <td className="n muted num">
                      {agg.last ? new Date(agg.last).toLocaleDateString() : <span className="faint">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
