/**
 * Trial finite state machine — pure.
 *
 * No DOM, no timers, no MediaPipe, no React. Time enters only through
 * `event.t`. That makes the whole thing unit-testable by replaying a recorded
 * event trace, which is the single most valuable change from the prototype:
 * in the single-file build, verifying a threshold change meant finding an
 * athlete and a plyo box.
 *
 * ---------------------------------------------------------------------------
 * The two test modes, and why READY needs a mode-dependent trigger
 * ---------------------------------------------------------------------------
 *
 * DROP JUMP     the athlete stands on a box, steps off, lands (CONTACT_1),
 *               drives up (FLIGHT), lands again (CONTACT_2).
 *
 *                 READY --takeoff--> (armed) --contact--> CONTACT_1
 *                       --takeoff--> FLIGHT --contact--> CONTACT_2 --dwell--> done
 *
 *               The first `takeoff` is the athlete leaving the BOX. It is the
 *               arming gesture, not a measured event; the trial starts on the
 *               contact that follows it.
 *
 * STANDING HOP  the athlete stands on the floor and hops.
 *
 *                 READY --takeoff--> FLIGHT --contact--> CONTACT_2 --dwell--> done
 *
 *               Here the first `takeoff` IS the jump.
 *
 * So the same event means opposite things in the same state, and the FSM
 * cannot be made mode-agnostic by deleting CONTACT_1 alone. The resolution is
 * that ARMING POLARITY IS INVERTED between the modes:
 *
 *   drop      armed once the athlete is OFF the floor  (standing on the box)
 *   standing  armed once the athlete is ON the floor, and has held still for
 *             STANDING_SETTLE_MS so we catch the hop and not their last
 *             setup shuffle
 *
 * With that in place `takeoff` in READY is unambiguous in both modes, and the
 * standing branch never enters CONTACT_1 at all — gct and rsi stay null
 * through to the database, where a CHECK constraint enforces the same rule.
 */

import { PHASE, TEST_TYPE, LIMITS, GRAVITY, ENGINE_VERSION } from './constants.js';

/**
 * @typedef {Object} TrialState
 * @property {string}  phase
 * @property {string}  testType      'drop' | 'standing'
 * @property {string}  limb          'left' | 'right'
 * @property {boolean} armed
 * @property {number}  armedAt
 * @property {number|null} settledSince  standing mode: in-contact since (ms)
 * @property {number}  t1Start       contact-1 touchdown
 * @property {number}  tTakeoff
 * @property {number}  tLand
 * @property {number|null} gct       null for standing hops, always
 * @property {number|null} ft
 * @property {number|null} fppa1     valgus at peak braking of contact 1
 * @property {number|null} fppa2     valgus at peak braking of the landing
 * @property {number}  maxHipY1
 * @property {number}  maxHipY2
 * @property {string|null} abortReason
 */

/**
 * @param {{testType: string, limb: string, inContact: boolean, now: number}} init
 * @returns {TrialState}
 */
export function createTrialState({ testType, limb, inContact, now }) {
  const standing = testType === TEST_TYPE.STANDING;

  return {
    phase: PHASE.READY,
    testType,
    limb,

    // The inversion described above.
    armed: standing ? inContact : !inContact,
    armedAt: now,
    settledSince: standing && inContact ? now : null,

    t1Start: 0,
    tTakeoff: 0,
    tLand: 0,
    t2Start: 0,

    gct: null,
    ft: null,

    fppa1: null,
    fppa2: null,
    maxHipY1: -Infinity,
    maxHipY2: -Infinity,

    abortReason: null,
  };
}

const abort = (s, reason) => ({
  ...s,
  phase: PHASE.ABORTED,
  armed: false,
  abortReason: reason,
});

/** Standing hops tolerate a slower effort than a reactive drop jump. */
const minFlight = (s) =>
  s.testType === TEST_TYPE.STANDING ? LIMITS.MIN_FT_STANDING : LIMITS.MIN_FT;

/**
 * The reducer.
 *
 * @param {TrialState} s
 * @param {{kind: 'contact'|'takeoff'|'tick'|'depth'|'fault', t: number,
 *          hipY?: number, fppa?: number|null, reason?: string}} e
 * @returns {TrialState} the next state (same object if nothing changed)
 */
export function reduceTrial(s, e) {
  if (s.phase === PHASE.COMPLETED || s.phase === PHASE.ABORTED) return s;

  // A contralateral touchdown voids the trial in any measured phase: in
  // single-leg testing, contact from the free limb redistributes force and the
  // numbers no longer describe one leg.
  if (e.kind === 'fault') return abort(s, e.reason);

  switch (s.phase) {
    // -----------------------------------------------------------------------
    case PHASE.READY: {
      if (s.testType === TEST_TYPE.STANDING) return readyStanding(s, e);
      return readyDrop(s, e);
    }

    // -----------------------------------------------------------------------
    // Reactive ground contact. Unreachable in standing mode.
    case PHASE.CONTACT_1: {
      if (e.kind === 'depth') return trackDepth(s, e, 1);

      if (e.kind === 'takeoff') {
        const gct = e.t - s.t1Start;
        if (gct < LIMITS.MIN_GCT || gct > LIMITS.MAX_GCT) {
          return abort(s, `contact time of ${Math.round(gct)} ms is outside the valid window.`);
        }
        return { ...s, phase: PHASE.FLIGHT, gct, tTakeoff: e.t };
      }

      if (e.kind === 'tick' && e.t - s.t1Start > LIMITS.MAX_GCT) {
        return abort(s, 'the athlete stayed on the ground too long.');
      }
      return s;
    }

    // -----------------------------------------------------------------------
    case PHASE.FLIGHT: {
      if (e.kind === 'contact') {
        const ft = e.t - s.tTakeoff;
        if (ft < minFlight(s) || ft > LIMITS.MAX_FT) {
          return abort(s, `flight time of ${Math.round(ft)} ms is outside the valid window.`);
        }
        return {
          ...s,
          phase: PHASE.CONTACT_2,
          ft,
          tLand: e.t,
          t2Start: e.t,
          maxHipY2: -Infinity,
        };
      }

      if (e.kind === 'tick' && e.t - s.tTakeoff > LIMITS.MAX_FT) {
        return abort(s, 'no landing was detected.');
      }
      return s;
    }

    // -----------------------------------------------------------------------
    case PHASE.CONTACT_2: {
      if (e.kind === 'depth') return trackDepth(s, e, 2);

      // Taking off again before the dwell window closes is a stumble or a
      // hop-out, not a stabilised landing. Storing it would reward a failure.
      if (e.kind === 'takeoff') {
        return abort(s, 'unstable landing (athlete took off again before stabilizing).');
      }

      if (e.kind === 'tick' && e.t - s.t2Start >= LIMITS.DWELL_COMPLETE) {
        return { ...s, phase: PHASE.COMPLETED, armed: false };
      }
      return s;
    }

    default:
      return s;
  }
}

// ---------------------------------------------------------------------------
// READY, per mode
// ---------------------------------------------------------------------------

/**
 * Drop jump. `takeoff` = the athlete left the floor to mount the box, which
 * arms the trigger. The measured trial begins on the contact after that.
 */
function readyDrop(s, e) {
  if (e.kind === 'takeoff') {
    return s.armed ? s : { ...s, armed: true };
  }

  if (e.kind === 'contact' && s.armed) {
    return { ...s, phase: PHASE.CONTACT_1, t1Start: e.t, maxHipY1: -Infinity };
  }

  if (e.kind === 'tick' && s.armed && e.t - s.armedAt > LIMITS.MAX_ARM_WAIT) {
    return abort(s, 'no drop detected within 30 s.');
  }
  return s;
}

/**
 * Standing hop. The athlete is already on the floor, so `takeoff` is the jump
 * itself and CONTACT_1 is skipped entirely — gct and rsi are never assigned
 * and remain null all the way to the database.
 */
function readyStanding(s, e) {
  // Feet planted: start (or continue) the settle timer.
  if (e.kind === 'contact') {
    return s.settledSince === null ? { ...s, settledSince: e.t } : s;
  }

  if (e.kind === 'takeoff') {
    // Not yet stable — this is a setup adjustment, not the hop. Reset and wait.
    if (!s.armed) return { ...s, settledSince: null };
    return {
      ...s,
      phase: PHASE.FLIGHT,
      tTakeoff: e.t,
      gct: null, // explicit: a standing hop has no measured contact phase
    };
  }

  if (e.kind === 'tick') {
    // Arm once the stance has been held long enough.
    if (!s.armed && s.settledSince !== null &&
        e.t - s.settledSince >= LIMITS.STANDING_SETTLE_MS) {
      return { ...s, armed: true };
    }
    if (s.armed && e.t - s.armedAt > LIMITS.MAX_ARM_WAIT) {
      return abort(s, 'no hop detected within 30 s.');
    }
  }
  return s;
}

// ---------------------------------------------------------------------------
// FPPA capture
// ---------------------------------------------------------------------------

/**
 * Frontal-plane projection angle is only meaningful at one instant: peak
 * braking, which we locate as maximum pelvic descent (largest normalised hip
 * y). Sampling at a fixed time offset instead would compare different points
 * of the movement between athletes.
 */
function trackDepth(s, e, phaseNum) {
  const key = phaseNum === 1 ? 'maxHipY1' : 'maxHipY2';
  if (!(e.hipY > s[key])) return s;

  return {
    ...s,
    [key]: e.hipY,
    [phaseNum === 1 ? 'fppa1' : 'fppa2']: e.fppa ?? null,
  };
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

/**
 * Flight-time estimate of jump height: h = g * t^2 / 8.
 *
 * This assumes the centre of mass is at the SAME height at takeoff and at
 * touchdown. Athletes who tuck their legs in the air, or who land in deeper
 * knee flexion than they took off from, extend flight time without jumping
 * higher, and this over-reads — commonly by 10-20%. It is a within-athlete
 * tracking measure, not a force-plate substitute. Cue "land the way you took
 * off" and the bias stays at least consistent across sessions.
 *
 * @param {number} flightMs
 * @returns {number} centimetres
 */
export function jumpHeightCm(flightMs) {
  const t = flightMs / 1000;
  return (GRAVITY * t * t) / 8 * 100;
}

/**
 * Builds the row that goes to Supabase. Returns null unless the trial actually
 * completed, so a caller cannot accidentally persist an aborted attempt.
 *
 * @param {TrialState} s
 * @param {{fps?: number, floorNoise?: number, sensitivity?: number}} capture
 */
export function toTrialRecord(s, capture = {}) {
  if (s.phase !== PHASE.COMPLETED) return null;

  const standing = s.testType === TEST_TYPE.STANDING;

  return {
    test_type: s.testType,
    tested_limb: s.limb,

    // Null for standing hops in both fields, matching the DB CHECK constraint.
    gct_ms: standing ? null : round(s.gct, 1),
    rsi: standing ? null : round(s.ft / s.gct, 3),

    flight_ms: round(s.ft, 1),
    jump_height_cm: round(jumpHeightCm(s.ft), 2),

    // Drop jumps report valgus at the reactive contact, which is the loading
    // event of interest. Standing hops have no such phase, so the landing is
    // the only place FPPA exists — and fppa1 is null there by construction.
    fppa_deg: round(s.fppa1 ?? s.fppa2, 2),

    capture_fps: round(capture.fps, 2),
    floor_noise: round(capture.floorNoise, 6),
    sensitivity: round(capture.sensitivity, 2),
    engine_version: ENGINE_VERSION,
    recorded_at: new Date().toISOString(),
  };
}

const round = (v, dp) =>
  v === null || v === undefined || !Number.isFinite(v)
    ? null
    : Number(v.toFixed(dp));
