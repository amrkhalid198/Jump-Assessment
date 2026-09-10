import { notFound } from 'next/navigation';
import { createSupabaseServerClient, isPlatformAdmin } from '@/lib/supabase/server';
import MintForm from './MintForm';
import ClinicRow from './ClinicRow';
import CodeRow from './CodeRow';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // 404 rather than 403: a non-admin learns nothing about whether this route
  // exists at all. The RPCs below re-check server-side regardless.
  if (!(await isPlatformAdmin())) notFound();

  const supabase = await createSupabaseServerClient();

  const { data: clinics } = await supabase.rpc('admin_list_clinics');

  const { data: codes } = await supabase
    .from('access_codes')
    .select('id, code, expiration_days, note, is_used, used_at, revoked_at, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  const unused = (codes ?? []).filter((c) => !c.is_used && !c.revoked_at);
  const active = (clinics ?? []).filter((c) => c.is_active).length;

  return (
    <>
      <div className="eyebrow">Platform admin</div>
      <h1 style={{ marginTop: 6, marginBottom: 6 }}>Access console</h1>
      <p className="muted" style={{ fontSize: 'var(--t-sm)', marginTop: 0, marginBottom: 28, maxWidth: '72ch' }}>
        {active} of {clinics?.length ?? 0} clinics active · {unused.length} unused codes.
        Patient records are not visible here by design — this console manages access, not clinical data.
      </p>

      <section style={{ marginBottom: 36 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Generate codes</div>
        <MintForm />
      </section>

      <section style={{ marginBottom: 36 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Clinics</div>
        {(clinics?.length ?? 0) === 0 ? (
          <div className="card" style={{ padding: 24 }}>
            <p className="muted" style={{ margin: 0, fontSize: 'var(--t-sm)' }}>
              No clinics yet. Give someone a code and they will appear here.
            </p>
          </div>
        ) : (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Clinic</th>
                  <th>Status</th>
                  <th className="n">Days left</th>
                  <th className="n">Staff</th>
                  <th className="n">Patients</th>
                  <th className="n">Trials</th>
                  <th style={{ textAlign: 'end' }}>Access</th>
                </tr>
              </thead>
              <tbody>
                {clinics.map((c) => <ClinicRow key={c.id} clinic={c} />)}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Codes</div>
        {(codes?.length ?? 0) === 0 ? (
          <div className="card" style={{ padding: 24 }}>
            <p className="muted" style={{ margin: 0, fontSize: 'var(--t-sm)' }}>No codes yet.</p>
          </div>
        ) : (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th className="n">Days</th>
                  <th>State</th>
                  <th>Note</th>
                  <th style={{ textAlign: 'end' }}></th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => <CodeRow key={c.id} code={c} />)}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
