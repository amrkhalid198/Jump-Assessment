# RSI Lab

Markerless single-leg drop jump and hop assessment, built on MediaPipe pose
estimation. Measures ground contact time, flight time, RSI, jump height and
frontal-plane knee valgus (FPPA) from a single camera.

## Two things live here

### `index.html` + `design-system/` — the capture prototype
A self-contained, bilingual (EN/AR) page. Open it in a browser, or serve the
folder:

    python -m http.server 8000

### `rsi-lab-saas/` — the multi-tenant web app
Next.js 14 App Router + Supabase. Clinics, patients, longitudinal trial data,
row-level security, and an access-code system. See
[`rsi-lab-saas/ARCHITECTURE.md`](rsi-lab-saas/ARCHITECTURE.md) for the full
design, including the biomechanics FSM and every security decision.

    cd rsi-lab-saas
    npm install
    cp .env.example .env.local     # then fill it in
    npm run dev

    npm test                       # FSM suite — no camera needed

## Deploying

Vercel, with **Root Directory set to `rsi-lab-saas`** (the repo root is the
prototype, not the app). Set the environment variables from `.env.example`.

Database migrations live in `rsi-lab-saas/supabase/migrations/` and apply in
numeric order.

## Measurement caveats

Timing resolution is bounded by capture frame rate: at 30 fps a contact event
carries roughly ±16 ms of uncertainty before sub-frame interpolation. FPPA is a
2D projection, valid only when the camera is level with the knee, square to the
frontal plane, and 2.5–3.5 m away. Jump height is derived from flight time,
which assumes the centre of mass is at the same height at takeoff and landing —
tucking the legs inflates it.

Use for tracking change within an athlete, not against force-plate norms.
Not medical advice.
