import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Limb symmetry index.
 *
 * LSI = involved / uninvolved * 100, flagged outside 90-110%.
 *
 * Contact time and FPPA are INVERSE metrics: lower is better. For those an LSI
 * above 110% is the deficit, not below 90% — getting this backwards tells a
 * clinician the injured leg is outperforming when it is failing.
 */
function lsi(involvedVal, uninvolvedVal, inverse) {
  if (involvedVal == null || uninvolvedVal == null || Number(uninvolvedVal) === 0) return null;
  const ratio = (Number(involvedVal) / Number(uninvolvedVal)) * 100;
  const deficit = inverse ? ratio > 110 : ratio < 90;
  return { value: ratio, flagged: deficit || (inverse ? ratio < 90 : ratio > 110), deficit };
}

const METRICS = [
  { key: 'mean_rsi', label: 'RSI', inverse: false, dp: 2 },
  { key: 'mean_jump_height_cm', label: 'Jump height cm', inverse: false, dp: 1 },
  { key: 'mean_gct_ms', label: 'Contact time ms', inverse: true, dp: 0 },
  { key: 'mean_fppa_deg', label: 'Peak valgus °', inverse: true, dp: 1 },
];

export default async function PatientPage({ params }) {
  const { id } = params;
  const supabase = await createSupabaseServerClient();

  // RLS makes this return nothing for another clinic's patient, which becomes
  // a 404 rather than a 403 — we do not confirm the id exists elsewhere.
  const { data: patient } = await supabase
    .from('patients')
    .select('id, full_name, involved_limb, external_ref, date_of_birth, created_at')
    .eq('id', id)
    .maybeSingle();

  if (!patient) notFound();

  const { data: trials } = await supabase
    .from('trials')
    .select('id, test_type, tested_limb, gct_ms, flight_ms, rsi, jump_height_cm, fppa_deg, capture_fps, recorded_at')
    .eq('patient_id', id)
    .order('recorded_at', { ascending: false })
    .limit(200);

  const { data: summary } = await supabase
    .from('patient_limb_summary')
    .select('*')
    .eq('patient_id', id);

  const involved = patient.involved_limb;
  const uninvolved = involved === 'left' ? 'right' : involved === 'right' ? 'left' : null;

  // LSI is only meaningful within one test type — a drop jump RSI cannot be
  // compared against a standing hop.
  const dropRows = (summary ?? []).filter((r) => r.test_type === 'drop');
  const inv = dropRows.find((r) => r.tested_limb === involved);
  const uninv = dropRows.find((r) => r.tested_limb === uninvolved);

  return (
    <>
      <Link href="/dashboard" className="muted" style={{ fontSize: 'var(--t-sm)' }}>
        ← All patients
      </Link>

      <div style={{ marginTop: 12, marginBottom: 28 }}>
        <div className="eyebrow">Patient</div>
        <h1 style={{ marginTop: 6 }}>{patient.full_name}</h1>
        <p className="muted" style={{ fontSize: 'var(--t-sm)', marginTop: 6 }}>
          {patient.external_ref ? <>Chart <span className="num">{patient.external_ref}</span> · </> : null}
          Involved limb:{' '}
          {involved ? <strong>{involved}</strong> : <span className="faint">not set</span>}
          {' · '}{trials?.length ?? 0} trial{(trials?.length ?? 0) === 1 ? '' : 's'}
        </p>
      </div>

      {/* ---- limb symmetry ---- */}
      <section style={{ marginBottom: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Limb symmetry · drop jump</div>

        {!involved ? (
          <div className="card" style={{ padding: 24 }}>
            <p className="muted" style={{ margin: 0, fontSize: 'var(--t-sm)' }}>
              Set the involved limb on this patient to calculate LSI.
            </p>
          </div>
        ) : !inv || !uninv ? (
          <div className="card" style={{ padding: 24 }}>
            <p className="muted" style={{ margin: 0, fontSize: 'var(--t-sm)' }}>
              Needs drop jump trials on both limbs. Recorded so far:{' '}
              {dropRows.length ? dropRows.map((r) => r.tested_limb).join(', ') : 'none'}.
            </p>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th className="n">Involved ({involved})</th>
                  <th className="n">Uninvolved ({uninvolved})</th>
                  <th className="n">LSI %</th>
                </tr>
              </thead>
              <tbody>
                {METRICS.map((m) => {
                  const a = inv[m.key];
                  const b = uninv[m.key];
                  const r = lsi(a, b, m.inverse);
                  return (
                    <tr key={m.key}>
                      <td>
                        {m.label}
                        {m.inverse && <span className="faint" style={{ fontSize: 'var(--t-micro)' }}> · lower is better</span>}
                      </td>
                      <td className="n num">{a == null ? '—' : Number(a).toFixed(m.dp)}</td>
                      <td className="n num">{b == null ? '—' : Number(b).toFixed(m.dp)}</td>
                      <td className={`n num ${r?.flagged ? (r.deficit ? 'bad' : 'warn') : 'ok'}`}>
                        {r ? `${r.value.toFixed(0)}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---- trial log ---- */}
      <section>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Trial log</div>

        {(trials?.length ?? 0) === 0 ? (
          <div className="card" style={{ padding: 24 }}>
            <p className="muted" style={{ margin: 0, fontSize: 'var(--t-sm)' }}>No trials recorded.</p>
          </div>
        ) : (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Test</th>
                  <th>Limb</th>
                  <th className="n">GCT ms</th>
                  <th className="n">Flight ms</th>
                  <th className="n">RSI</th>
                  <th className="n">Jump cm</th>
                  <th className="n">FPPA °</th>
                  <th className="n">fps</th>
                </tr>
              </thead>
              <tbody>
                {trials.map((t) => (
                  <tr key={t.id}>
                    <td className="muted num">{new Date(t.recorded_at).toLocaleDateString()}</td>
                    <td>
                      <span style={{
                        fontSize: 'var(--t-micro)', textTransform: 'uppercase', letterSpacing: '.06em',
                        fontWeight: 600, padding: '3px 9px', borderRadius: 999,
                        background: t.test_type === 'drop' ? 'rgba(242,86,35,.16)' : 'rgba(79,195,247,.14)',
                        color: t.test_type === 'drop' ? 'var(--accent-hi)' : '#4FC3F7',
                      }}>
                        {t.test_type}
                      </span>
                    </td>
                    <td className="muted">{t.tested_limb}</td>
                    {/* Standing hops legitimately have no contact phase — an em
                        dash, never a zero, so it cannot read as a measurement. */}
                    <td className="n num">{t.gct_ms ?? <span className="faint">—</span>}</td>
                    <td className="n num">{t.flight_ms}</td>
                    <td className="n num">{t.rsi ?? <span className="faint">—</span>}</td>
                    <td className="n num">{t.jump_height_cm ?? '—'}</td>
                    <td className="n num">{t.fppa_deg ?? '—'}</td>
                    <td className="n faint num">{t.capture_fps ? Number(t.capture_fps).toFixed(0) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="faint" style={{ fontSize: 'var(--t-sm)', marginTop: 14, maxWidth: '72ch' }}>
          Timing resolution is bounded by capture frame rate: at 30 fps a contact event carries
          roughly ±16 ms before sub-frame interpolation. Compare trials recorded at similar fps.
        </p>
      </section>
    </>
  );
}
