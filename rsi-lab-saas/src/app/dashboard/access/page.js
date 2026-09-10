import { createSupabaseServerClient, getCurrentClinic, canCapture, accessDaysLeft } from '@/lib/supabase/server';
import RedeemForm from './RedeemForm';

export const dynamic = 'force-dynamic';

export default async function AccessPage() {
  const clinic = await getCurrentClinic();
  const supabase = await createSupabaseServerClient();

  // RLS scopes this to the caller's own clinic.
  const { data: grants } = await supabase
    .from('access_grants')
    .select('id, granted_days, granted_at, expires_at, note')
    .order('granted_at', { ascending: false })
    .limit(50);

  const live = canCapture(clinic);
  const daysLeft = accessDaysLeft(clinic);

  return (
    <>
      <div className="eyebrow">Access</div>
      <h1 style={{ marginTop: 6, marginBottom: 24 }}>Clinic access</h1>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow">Status</div>
          <div className={live ? 'ok' : 'bad'} style={{ fontSize: 'var(--t-h2)', fontWeight: 600, marginTop: 6 }}>
            {live ? 'Active' : clinic.access_expires_at ? 'Expired' : 'Not activated'}
          </div>

          {clinic.access_expires_at && (
            <p className="muted" style={{ fontSize: 'var(--t-sm)', marginTop: 12, marginBottom: 0 }}>
              {live ? 'Ends' : 'Ended'}{' '}
              <span className="num">
                {new Date(clinic.access_expires_at).toLocaleDateString()}
              </span>
              {live && daysLeft !== null && (
                <> · <span className="num">{Math.max(0, daysLeft)}</span> {daysLeft === 1 ? 'day' : 'days'} left</>
              )}
            </p>
          )}

          <p className="faint" style={{ fontSize: 'var(--t-sm)', marginTop: 16, marginBottom: 0 }}>
            When access lapses the clinic becomes read-only. Patients and trials
            already recorded stay readable and exportable — nothing is deleted.
          </p>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Add time</div>
          <RedeemForm />
          <p className="faint" style={{ fontSize: 'var(--t-sm)', marginTop: 14, marginBottom: 0 }}>
            Codes are single use. Redeeming while time remains adds to it rather
            than replacing it, so renewing early costs you nothing.
          </p>
        </div>
      </div>

      <section style={{ marginTop: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>History</div>

        {(grants?.length ?? 0) === 0 ? (
          <div className="card" style={{ padding: 24 }}>
            <p className="muted" style={{ margin: 0, fontSize: 'var(--t-sm)' }}>No access grants yet.</p>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Granted</th>
                  <th className="n">Days</th>
                  <th className="n">Ran until</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {grants.map((g) => (
                  <tr key={g.id}>
                    <td className="muted num">{new Date(g.granted_at).toLocaleDateString()}</td>
                    <td className="n num">{g.granted_days}</td>
                    <td className="n num">{new Date(g.expires_at).toLocaleDateString()}</td>
                    <td className="faint">{g.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
