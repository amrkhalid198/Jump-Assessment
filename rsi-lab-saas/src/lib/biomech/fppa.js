/**
 * Frontal-plane projection angle. Ported from the prototype.
 *
 * FPPA is a 2D projection and is only valid when the camera is level with the
 * athlete's knee, square to the frontal plane, and 2.5-3.5 m away. It is a
 * within-athlete tracking measure, not a substitute for 3D motion capture.
 */

import { LM } from './constants.js';
import { isVisible } from './signal.js';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * @param {Array}  lm     pose landmarks
 * @param {string} limb   'left' | 'right'
 * @param {{videoWidth:number, videoHeight:number}} frame  for aspect correction
 * @param {'anterior'|'posterior'} view
 */
export function fppaFor(lm, limb, frame, view = 'anterior') {
  const L = limb === 'left';
  const hip = lm[L ? LM.L_HIP : LM.R_HIP];
  const knee = lm[L ? LM.L_KNEE : LM.R_KNEE];
  const ankle = lm[L ? LM.L_ANKLE : LM.R_ANKLE];

  if (!isVisible(hip, 0.3) || !isVisible(knee, 0.3) || !isVisible(ankle, 0.3)) {
    return null;
  }

  // Landmarks are normalised per-axis, so x and y are on different scales
  // unless the frame is square. Skipping this correction reports a valgus
  // angle that changes with camera resolution.
  const ar = frame?.videoWidth && frame?.videoHeight
    ? frame.videoWidth / frame.videoHeight
    : 1;

  const H = { x: hip.x * ar, y: hip.y };
  const K = { x: knee.x * ar, y: knee.y };
  const A = { x: ankle.x * ar, y: ankle.y };

  const v1 = { x: H.x - K.x, y: H.y - K.y };
  const v2 = { x: A.x - K.x, y: A.y - K.y };
  const m1 = Math.hypot(v1.x, v1.y);
  const m2 = Math.hypot(v2.x, v2.y);
  if (m1 < 1e-6 || m2 < 1e-6) return null;

  const cos = clamp((v1.x * v2.x + v1.y * v2.y) / (m1 * m2), -1, 1);
  const included = (Math.acos(cos) * 180) / Math.PI; // 180 = perfectly aligned
  const dev = 180 - included;

  // Signed medial/lateral offset of the knee from the hip-ankle line.
  const dy = A.y - H.y;
  let offset = 0;
  if (Math.abs(dy) > 1e-6) {
    const t = (K.y - H.y) / dy;
    offset = K.x - (H.x + t * (A.x - H.x));
  }

  // In the raw (unmirrored) image an anterior-view athlete's RIGHT limb sits at
  // lower x, so medial is +x for the right limb and -x for the left. A
  // posterior view flips it again.
  const legSign = limb === 'right' ? 1 : -1;
  const viewSign = view === 'anterior' ? 1 : -1;
  const medial = offset * legSign * viewSign;

  return {
    magnitude: dev,
    signed: medial >= 0 ? dev : -dev, // + valgus (knee medial), - varus
    valgus: medial >= 0,
    pts: { hip, knee, ankle },
  };
}

/**
 * Pelvic height, used to locate peak braking.
 *
 * Peak deceleration in a frontal view is maximum vertical descent of the
 * pelvis. FPPA itself cannot be used to find that instant: sagittal knee
 * flexion is projected out of it, so it carries no information about flexion
 * depth. Pelvic descent does.
 */
export function hipY(lm, limb) {
  const hip = lm[limb === 'left' ? LM.L_HIP : LM.R_HIP];
  const other = lm[limb === 'left' ? LM.R_HIP : LM.L_HIP];

  if (isVisible(hip, 0.3) && isVisible(other, 0.3)) return (hip.y + other.y) / 2;
  if (isVisible(hip, 0.3)) return hip.y;
  return -Infinity;
}
