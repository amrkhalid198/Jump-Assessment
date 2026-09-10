/**
 * Shared constants for the capture engine.
 * Ported verbatim from the single-file prototype so measurements stay
 * comparable across the migration — a threshold change here silently breaks
 * longitudinal comparison against every trial recorded before it.
 */

export const TEST_TYPE = /** @type {const} */ ({
  DROP: 'drop',
  STANDING: 'standing',
});

export const PHASE = /** @type {const} */ ({
  IDLE: 'IDLE',
  CALIBRATING: 'CALIBRATING',
  CALIBRATED: 'CALIBRATED',
  READY: 'READY',
  CONTACT_1: 'CONTACT_1', // reactive ground contact — drop jumps only
  FLIGHT: 'FLIGHT',
  CONTACT_2: 'CONTACT_2', // landing, held for the dwell window
  COMPLETED: 'COMPLETED',
  ABORTED: 'ABORTED',
});

/** BlazePose landmark indices. */
export const LM = {
  L_SHOULDER: 11, R_SHOULDER: 12,
  L_HIP: 23, R_HIP: 24,
  L_KNEE: 25, R_KNEE: 26,
  L_ANKLE: 27, R_ANKLE: 28,
  L_HEEL: 29, R_HEEL: 30,
  L_TOE: 31, R_TOE: 32,
};

export const FOOT_IDS = [29, 30, 31, 32];

/**
 * Visibility gate for the active foot during contact detection. Deliberately
 * low: motion blur at ground impact collapses MediaPipe's confidence on the
 * heel and toe, and a 0.3 gate drops the landmark on exactly the frame that
 * defines the contact event.
 */
export const FOOT_VIS_GATE = 0.15;

export const LIMITS = {
  MIN_GCT: 60,
  MAX_GCT: 2000,
  MIN_FT: 80,
  MAX_FT: 1800,

  /**
   * A standing hop has no stretch-shortening constraint, so a slow, shallow
   * effort is legitimate where it would be a failed drop jump. But a shuffle
   * or a weight-shift can also clear the flight threshold, and at 30 fps a
   * 100 ms flight is only three frames. Below this the measurement is noise.
   */
  MIN_FT_STANDING: 100,

  DWELL_COMPLETE: 600,   // ms of stable second contact before the trial closes
  MAX_ARM_WAIT: 30000,   // ms armed with no jump before auto-disarm

  /**
   * Standing hops only. The athlete must hold a stable single-leg stance for
   * this long before the trigger arms, so the takeoff we catch is the hop and
   * not the last of their setup adjustments.
   */
  STANDING_SETTLE_MS: 300,
};

export const GRAVITY = 9.81;

/**
 * Stamped onto every trial row. Bump it whenever a threshold, the smoothing,
 * or the event-dating logic changes, so a future analyst can tell which trials
 * are mutually comparable.
 */
export const ENGINE_VERSION = '2.0.0';
