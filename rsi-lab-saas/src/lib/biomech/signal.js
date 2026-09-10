/**
 * Contact signal — Schmitt trigger with sub-frame crossing interpolation.
 * Ported from the prototype. Pure and stateful-by-closure, no React, no DOM.
 *
 * Turns a stream of pose frames into the discrete `contact` / `takeoff` events
 * the FSM consumes. Everything here operates in MediaPipe's normalised image
 * space where y = 0 is the top of the frame and y = 1 the bottom, so LOWER on
 * screen means a LARGER y.
 */

import { LM, FOOT_IDS, FOOT_VIS_GATE } from './constants.js';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const std = (a) => {
  const m = mean(a);
  return Math.sqrt(mean(a.map((v) => (v - m) ** 2)));
};

export const isVisible = (p, gate) =>
  !!p && (p.visibility === undefined || p.visibility >= gate);

/**
 * Floor plane from a few seconds of still stance.
 * Trims the extremes so one blurred frame cannot move the floor.
 */
export function createFloorCalibrator({ durationMs = 3000, minSamples = 15 } = {}) {
  let samples = [];
  let startedAt = null;

  return {
    start(now) {
      samples = [];
      startedAt = now;
    },

    /** @returns {null | {floorY, floorNoise} | {error}} null while sampling */
    sample(lm, now) {
      let lowest = -Infinity;
      for (const i of FOOT_IDS) {
        const p = lm[i];
        if (isVisible(p, 0.3) && p.y > lowest) lowest = p.y;
      }
      if (lowest > -Infinity) samples.push(lowest);

      if (now - startedAt < durationMs) return null;

      if (samples.length < minSamples) {
        return { error: 'Calibration failed — feet were not tracked. Get the whole body in frame and try again.' };
      }

      const sorted = samples.slice().sort((a, b) => a - b);
      const cut = Math.floor(sorted.length * 0.1);
      const core = sorted.slice(cut, sorted.length - cut);

      return { floorY: mean(core), floorNoise: std(core) };
    },

    progress: (now) => (startedAt === null ? 0 : clamp((now - startedAt) / durationMs, 0, 1)),
  };
}

/**
 * Hysteresis band, scaled by measured calibration noise AND by the athlete's
 * size in frame, so it survives a change of camera distance or resolution.
 */
export function computeThresholds(lm, floorNoise, sensitivity) {
  let scale = 0.55;
  if (lm) {
    const sh = lm[LM.L_SHOULDER];
    const hp = lm[LM.L_HIP];
    const an = lm[LM.L_ANKLE];
    if (isVisible(sh, 0.2) && isVisible(an, 0.2)) scale = Math.abs(an.y - sh.y);
    else if (isVisible(hp, 0.2) && isVisible(an, 0.2)) scale = Math.abs(an.y - hp.y) * 1.9;
    scale = clamp(scale, 0.25, 1.0);
  }
  const base = Math.max(3.0 * floorNoise, 0.012 * scale);
  return {
    contactOff: base * sensitivity,        // within this of the floor = down
    flightOff: base * 2.6 * sensitivity,   // must clear this to be airborne
  };
}

/**
 * Lowest visible point of the tested foot.
 * The visibility gate is deliberately loose — see FOOT_VIS_GATE.
 */
export function activeFootY(lm, limb) {
  const ids = limb === 'left'
    ? [LM.L_HEEL, LM.L_TOE, LM.L_ANKLE]
    : [LM.R_HEEL, LM.R_TOE, LM.R_ANKLE];

  let y = -Infinity;
  let conf = 0;
  for (const i of ids) {
    const p = lm[i];
    if (isVisible(p, FOOT_VIS_GATE)) {
      if (p.y > y) y = p.y;
      conf = Math.max(conf, p.visibility ?? 1);
    }
  }
  return y > -Infinity ? { y, conf } : null;
}

const interpCross = (prevY, curY, thr, prevT, curT) => {
  if (prevY === null || prevT === null) return curT;
  const dy = curY - prevY;
  if (Math.abs(dy) < 1e-9) return curT;
  return prevT + clamp((thr - prevY) / dy, 0, 1) * (curT - prevT);
};

/**
 * Stateful event detector. One instance per capture session.
 */
export function createSignalTracker() {
  let inContact = true;
  let prevY = null;
  let prevT = null;
  let hist = [];
  let contraFrames = 0;

  /**
   * Walk the recent history backwards for the instant the signal last crossed
   * `thr`. Takeoff is CONFIRMED at the flight threshold, which sits 3-4 cm off
   * the floor — dating the event there would add that rise time to GCT and
   * subtract it from flight. Both phases must be measured against one plane.
   */
  const crossBackTime = (thr, fallbackT) => {
    for (let i = hist.length - 1; i > 0; i--) {
      const cur = hist[i];
      const prev = hist[i - 1];
      if (cur.y <= thr && prev.y > thr) {
        const dy = cur.y - prev.y;
        if (Math.abs(dy) < 1e-9) return cur.t;
        return prev.t + clamp((thr - prev.y) / dy, 0, 1) * (cur.t - prev.t);
      }
    }
    return fallbackT;
  };

  return {
    get inContact() { return inContact; },

    reset(startInContact = true) {
      inContact = startInContact;
      prevY = null;
      prevT = null;
      hist = [];
      contraFrames = 0;
    },

    /**
     * @returns {null | {kind: 'contact'|'takeoff', t: number}}
     */
    step(lm, tMs, { limb, floorY, contactOff, flightOff }) {
      const foot = activeFootY(lm, limb);
      if (!foot) {
        prevY = null;
        prevT = null;
        return null;
      }

      const y = foot.y;
      hist.push({ y, t: tMs });
      if (hist.length > 24) hist.shift();

      const thrContact = floorY - contactOff;
      let event = null;

      if (!inContact) {
        if (y >= thrContact) {
          inContact = true;
          event = { kind: 'contact', t: interpCross(prevY, y, thrContact, prevT, tMs) };
        }
      } else if (y <= floorY - flightOff) {
        inContact = false;
        event = {
          kind: 'takeoff',
          t: crossBackTime(thrContact, interpCross(prevY, y, thrContact, prevT, tMs)),
        };
      }

      prevY = y;
      prevT = tMs;
      return event;
    },

    /**
     * Balance fault guard. Two consecutive frames are required: a single
     * low-confidence estimate on the occluded free foot is the most common
     * source of a false abort.
     */
    contralateralTouchdown(lm, { limb, floorY, contactOff }) {
      if (floorY === null) return false;
      const ids = limb === 'left' ? [LM.R_HEEL, LM.R_TOE] : [LM.L_HEEL, LM.L_TOE];
      const thr = floorY - contactOff;

      let down = false;
      for (const i of ids) {
        const p = lm[i];
        if (p && (p.visibility ?? 1) > 0.2 && p.y >= thr) { down = true; break; }
      }

      contraFrames = down ? contraFrames + 1 : 0;
      return contraFrames >= 2;
    },

    clearContraFrames() { contraFrames = 0; },
  };
}
