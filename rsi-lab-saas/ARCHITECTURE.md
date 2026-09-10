# RSI Lab — SaaS architecture

Migration of the single-file MediaPipe prototype into a multi-tenant PWA.

```
rsi-lab-saas/
├── supabase/migrations/
│   ├── 0001_init.sql              Task 2 — schema + RLS
│   └── 0002_billing_events.sql    Task 4 — webhook idempotency + ordering
├── src/
│   ├── lib/biomech/
│   │   ├── constants.js           thresholds, ported verbatim
│   │   ├── signal.js              Schmitt trigger + sub-frame interpolation
│   │   ├── fppa.js                frontal-plane projection angle
│   │   ├── fsm.js                 Task 1 — the pure reducer
│   │   └── fsm.test.js            10 tests, no camera required
│   ├── lib/supabase/
│   │   ├── middleware.js          session refresh
│   │   └── server.js              RLS client + service-role client
│   ├── hooks/usePoseEngine.js     Task 1 — MediaPipe lifecycle
│   ├── middleware.js              Task 3 — route protection
│   └── app/api/
│       ├── checkout/route.js      Task 4
│       └── webhook/route.js       Task 4
```

---

## Read this before building Task 4

**Stripe does not list Egypt among its supported merchant countries.** If the
clinics buying this are Egyptian and you are collecting EGP, you cannot receive
payouts through Stripe regardless of how good the integration is. Verify your
target market against Stripe's current country list before writing another line
of billing code — this is the one decision here that is expensive to reverse.

The code ships Stripe because you named it first and it is the better-documented
path, but the schema does not assume it:

- `clinics.billing_provider` is `'stripe' | 'paymob'`.
- `subscription_status` is a provider-neutral enum that happens to match
  Stripe's vocabulary exactly.
- Every write to those columns funnels through one function,
  `applySubscription()` in the webhook route.

Porting to Paymob means rewriting that one function plus the signature check.
Concretely, what differs:

| | Stripe | Paymob |
|---|---|---|
| Webhook auth | `stripe-signature` header, HMAC-SHA256 over the raw body | HMAC computed over a **specific ordered concatenation of payload fields**, not the raw body |
| Subscriptions | first-class object with a lifecycle | weaker; many integrations run recurring billing themselves against saved tokens |
| Event vocabulary | `customer.subscription.*`, `invoice.*` | `TRANSACTION`, with `success` / `pending` / `is_refund` flags to interpret |
| Idempotency key | `event.id` | transaction `id` — the `billing_events` table works unchanged |

The ordering guard and the idempotency ledger are provider-agnostic and carry
over as-is.

---

## Task 1 — the FSM

Full reasoning is in the header comment of `src/lib/biomech/fsm.js`. The short
version of the problem it solves:

Your prototype's `READY` state treats a **takeoff as the arming gesture** — the
athlete stepping off the box — and starts measuring on the *contact* that
follows. Task 1 asks standing hops to go `READY → FLIGHT` on takeoff. That is
the same event carrying the opposite meaning in the same state, so deleting
`CONTACT_1` is not sufficient on its own.

The resolution is **inverted arming polarity**:

| | armed when | first `takeoff` in READY means |
|---|---|---|
| `drop` | athlete is **off** the floor (on the box) | stepping off — arms, does not measure |
| `standing` | athlete is **on** the floor, held for 300 ms | the hop itself — enters FLIGHT |

The settle window matters in practice: without it, the last shuffle of a
clinician positioning an athlete on one leg registers as the jump.

```
drop      READY ─takeoff→ (armed) ─contact→ CONTACT_1 ─takeoff→ FLIGHT ─contact→ CONTACT_2 ─dwell→ COMPLETED
standing  READY ─────────────────settle+takeoff───────────────→ FLIGHT ─contact→ CONTACT_2 ─dwell→ COMPLETED
```

`gct` and `rsi` are never assigned on the standing path. They stay `null`
through `toTrialRecord()` and into Postgres, where a CHECK constraint enforces
the same invariant — so a future refactor that breaks this fails loudly at the
database instead of quietly writing `rsi: 0` into longitudinal data.

**The reducer is pure.** No DOM, no timers, no MediaPipe, no React; time enters
only via `event.t`. A whole trial is a list of events, which is why
`fsm.test.js` covers both modes, the abort paths and the balance-fault guard
without a camera or an athlete. In the single-file build, checking a threshold
change meant finding a plyo box.

### Hook structure

`usePoseEngine` obeys one rule: **refs are the engine, state is the report.**

The detector runs at 30–120 fps. Calling `setState` per frame re-renders the
tree 120 times a second, and React's own render cost then lands *inside* the
measurement window — the app corrupts the timings it exists to measure.

- **refs** — landmarks, thresholds, FSM state, floor plane, fps counter.
  Mutated every frame, never re-render.
- **state** — phase name, status line, completed trial, and a live readout
  throttled to 10 Hz. Only this is bound to UI.
- Canvas overlay drawing reads refs inside the same rAF tick, bypassing React
  entirely.

`testType` lives in a ref so flipping the toggle does not tear down the capture
loop, and `createTrialState` copies it into FSM state at arm time — so changing
the toggle mid-air cannot retag a trial already in flight.

---

## Task 2 — database

Two additions the brief did not specify but the requirements force:

**`clinic_members`.** Supabase authenticates a *user*; every policy needs to
answer "which clinic is this user in?". That mapping has to exist somewhere.
It allows multiple clinics per user, which costs nothing now and avoids a
migration when a locum clinician appears.

**`trials.clinic_id`,** denormalised from the patient. Without it, RLS on the
fastest-growing table joins to `patients` on every row. A `BEFORE INSERT`
trigger derives it server-side, so a compromised client cannot file a trial
into another clinic.

Three details worth knowing:

- `current_clinic_ids()` is `SECURITY DEFINER` because a policy on `patients`
  that reads `clinic_members` directly triggers *that* table's policy, which
  reads `clinic_members` — Postgres reports "infinite recursion detected in
  policy". Running as the function owner breaks the cycle.
- `patient_limb_summary` sets `security_invoker = true`. A normal view executes
  as its **owner** and would hand every caller a clean bypass around all RLS.
- Billing columns are guarded by a trigger, not by RLS. RLS grants row access,
  not column access, so without it any clinic member could `UPDATE` their own
  clinic row and set `subscription_status = 'active'`.

**Lapsed clinics go read-only, not dark.** `current_clinic_ids_writable()`
gates INSERT/UPDATE/DELETE on an active subscription; SELECT stays open at
every status. Locking a clinic out of its own historical patient records over a
declined card is hostile, and in a clinical setting arguably unsafe.

---

## Task 3 — auth

**Email + password, and the app sends no mail at all.** No magic links, no
confirmation mail, no reset mail — the same posture as the Bulletproof Ankle
program. Access to the product is separate from having an account: signing up
creates the account, a single-use code grants N days of access. See
"Access model" below.

Three things in `lib/supabase/middleware.js` are load-bearing:

1. **`getUser()`, never `getSession()`.** `getSession()` trusts the cookie,
   which is attacker-controllable — a forged one authenticates. `getUser()`
   revalidates against the Auth server.
2. **Nothing runs between `createServerClient` and `getUser()`.** Server
   Components cannot write cookies, so middleware is where a rotated refresh
   token is persisted. An early return in that gap logs users out at random.
3. **Cookies must be copied onto a redirect response.** Building a fresh
   `NextResponse` discards the refreshed session — this is the classic
   infinite `/login ↔ /dashboard` loop.

The matcher excludes `sw.js`, `manifest.webmanifest` and `workbox-*.js`. If
middleware intercepts the service worker, an expired session turns its request
into a 307 to `/login`; browsers refuse to register a service worker from a
redirect, and the PWA silently stops working offline with no error pointing
anywhere near auth.

Subscription state is deliberately **not** checked in middleware — a DB
round-trip on every navigation, and entitlement logic that is easy to get
subtly wrong. Gate it in the `/dashboard` layout where the clinic is already
loaded, and let RLS be the real boundary.

---

## Task 4 — billing

**The webhook is the only writer of `subscription_status`.** Never provision on
the success redirect: users close the tab, and 3-D Secure can complete minutes
later. Provisioning there leaves paying clinics locked out.

Four properties, ordered by how badly it hurts to miss one:

1. **Signature-verified.** The URL is public. Without `constructEvent`, anyone
   who guesses it can POST `{status:'active'}` and take the product for free.
   Verify against the **raw** body — `await request.text()`; parsing to JSON
   first changes the bytes and verification fails.
2. **Idempotent.** Stripe redelivers on any non-2xx. `billing_events` has the
   event id as primary key, so concurrent redeliveries collide on `23505` and
   exactly one applies.
3. **Order-independent.** Delivery is not ordered. An `updated` event from
   09:00:01 can arrive after the one from 09:00:05 — routine during retries —
   and arrival-order application leaves a cancelled clinic active.
   `last_billing_event_at` discards stale events.
4. **Fast.** Stripe times out at 20 s. Write and return; queue email.

On payment **failure**, Stripe moves to `past_due` and retries on its dunning
schedule. `past_due` is intentionally still writable in SQL: the clinic keeps
working through the retry window rather than losing access mid-appointment over
an expired card. Only `unpaid` / `canceled`, at the end of dunning, drop them
to read-only.

---

## Still to build

This covers the four tasks. Not yet addressed, in rough priority order:

1. **Offline capture queue.** Clinic wifi is unreliable and a trial lost to a
   dropped connection is an athlete re-doing a maximal effort. Write completed
   trials to IndexedDB first, sync via a Background Sync worker, and treat the
   network write as eventual. This changes `onTrialComplete` and nothing else —
   the FSM already produces a self-contained record.
2. **`/dashboard` layout gating** on `canCapture(clinic)`.
3. **Overlay drawing**, ported from the prototype's `draw()`.
4. **Capture screen wiring** — `usePoseEngine` exists and is tested, but
   nothing yet calls `onTrialComplete` → `supabase.from('trials').insert()`.

## Audit log — 2026-09-10

Deployed to Supabase project `ewlpbjuhkjcfhrujgvok` ("RSI Lab", eu-central-1),
**deliberately separate** from `izfdbqurbrvmcxnijmbz` ("Bulletproof Ankle"),
which holds live patient data and was verified unchanged before and after
(7 tables, rows 5/4/69/3/33/2/4, 4 migrations, nothing added).

Findings raised and fixed:

1. **`prune_billing_events` was callable by `anon`** over `/rest/v1/rpc/`.
   Anyone could have emptied the webhook idempotency ledger and then replayed
   captured billing events. `revoke ... from public` does not cover `anon` and
   `authenticated` — those are real roles holding their own grant. Fixed in
   `0003`, along with four other over-exposed SECURITY DEFINER functions.
2. **`touch_updated_at` / `clinics_guard_billing_columns` had mutable
   search_path**, so a caller who could influence it might resolve `now()` to
   something they control and run it with definer rights. Pinned.
3. **`pg_trgm` installed in `public`** — relocated to `extensions`.
4. **`auth.uid()` re-evaluated per row** in the clinic_members policy, and two
   permissive policies both firing on every SELECT (a `FOR ALL` write policy
   overlapping the read policy). Hoisted to `(select auth.uid())` and split
   into INSERT/UPDATE/DELETE.
5. **Stripe client constructed at module scope** — threw during `next build`
   page-data collection, so the whole app failed to build without billing
   secrets. Now constructed per request.
6. **No ESLint config**, so `next lint` blocked on an interactive prompt: a
   hang in CI rather than a failure.
7. **`useCallback` stale-closure hazard** in `usePoseEngine`: `tick` closed
   over `applyTrial` without declaring it. Reordered and declared.

Verification, all green:

| check | result |
|---|---|
| FSM suite | 10/10 |
| RLS + invariants, against the live schema | 18/18 |
| `next lint` | no warnings or errors |
| `next build` | 9 routes, middleware compiled |
| Supabase security advisor | 2 notices, both by design |
| Supabase performance advisor | 0 warnings |
| Auth redirect, real browser | `/dashboard/...` → `/login?next=…`, path preserved |

The 5 remaining "unused index" notices are an empty database with no query
history, not a defect. The 2 security notices are `create_clinic` (must be
callable) and the two `current_clinic_ids` helpers (required *inside* RLS
policy expressions, which are evaluated as the querying role).

### Known fragility: fonts are fetched at build time

Switching to `next/font/google` removed the render-blocking third-party
request at runtime, but moved the Google dependency to **build time** — a
build with no egress to `fonts.googleapis.com` fails outright. This bit once
during the audit as a transient DNS failure.

If you deploy from a locked-down CI runner, download the four `.woff2` files
into `src/app/fonts/` and switch to `next/font/local`. That is the only
configuration with no Google dependency at either build or runtime.

## Environment

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only — never NEXT_PUBLIC_
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MONTHLY=
STRIPE_PRICE_ANNUAL=
NEXT_PUBLIC_SITE_URL=
```

```bash
npm install
supabase db push
npm run test          # FSM suite, no camera needed
npm run stripe:listen # forwards webhooks to localhost
npm run dev
```
